from fastapi import APIRouter, HTTPException, status, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm

from src_api.schemas.auth import LoginRequest, LoginResponse
from src_api.core.security import SecurityEngine
from src_api.core.limiter import limiter
from prisma_db.prisma_client import db

import logging

logger = logging.getLogger(__name__)

auth = SecurityEngine()
authRouter = APIRouter()

@authRouter.post('/login', response_model=LoginResponse)
@limiter.limit("5/minute")
async def login(request: Request, creds: OAuth2PasswordRequestForm = Depends()) -> LoginResponse:
    #as per fastapi's login form, email is equivalent to username
    #so, creds.username == creds.email
    user = await db.client.account.find_unique(
        where={"email_address" : creds.username}
    )
    if not user or not auth.verify_password(creds.password, user.hashed_password):
        logger.warning(f"Failed login attempt for: {creds.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate" : "Bearer"},
        )
    
    token_data = {
        "sub" : user.id,
        "tokenVersion" : user.token_version,
        "role" : user.role,
    }

    access_token = auth.create_access_token(data=token_data)

    logger.info(f"Successful login for user: {user.id}")

    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        email=user.email_address,
        role=user.role
    )
