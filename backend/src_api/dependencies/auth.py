from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from src_api.core.security import SECRET_KEY, ALGORITHM
from src_api.schemas.auth import AccountRole

from prisma_db.prisma_client import db

import logging

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    The bouncer in front of the queue
    """

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate" : "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        user_id = payload.get("sub")
        token_version = payload.get("tokenVersion")

        if user_id is None or token_version is None:
            logger.error("Invalid input received")
            raise credentials_exception
        
    except JWTError as e:
        logger.exception(f"Auth failed: {e}")
        raise credentials_exception
    
    user = await db.client.account.find_unique(where={"id" : user_id})

    if user is None:
        logger.error("No user found")
        raise credentials_exception
    
    if user.token_version != token_version:
        logger.error("Token expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or revoked. Please log on again",
        )
    
    return user


async def get_fully_onboarded_user(current_user = Depends(get_current_user)):
    user_with_profiles = await db.client.find_unique(
        where={"id" : current_user.id},
        include={
            "investorProfile" : True,
            "founderProfile" : True
        }
    )

    if not user_with_profiles:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    
    if user_with_profiles.role == AccountRole.INVESTOR and not user_with_profiles.investorProfile:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Investor onboarding incomplete"
        )
    if user_with_profiles.role == AccountRole.FOUNDER and not user_with_profiles.founderProfile:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Founder onboarding incomplete."
        )

    return user_with_profiles