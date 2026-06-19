from fastapi import APIRouter, HTTPException, status, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm

from src_api.schemas.auth import LoginResponse, SignupResponse, AccountBase
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


@authRouter.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def signup(request: Request, creds: AccountBase) -> SignupResponse:
    user = await db.client.account.find_first(
        where={
            "OR" : [
                {"email_address" : creds.email_address},
                {"mobile_number" : creds.mobile_number}
            ]
        }
    )
    if user:
        logger.warning("user already exists")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to sign up, user already exists!"
        )
    
    del user

    hashed_password = auth.get_password_hash(creds.password)
    try:
        new_user = await db.client.account.create(
            data={
                "role" : creds.role,
                "full_name" : creds.full_name,
                "email_address" : creds.email_address,
                "mobile_number" : creds.mobile_number,
                "hashed_password" : hashed_password,
                "linkedin_profile_url" : creds.linkedin_profile_url if creds.linkedin_profile_url else None,
            }
        )
        logger.info(f"User successfully created for {creds.email_address}")
    except Exception as e:
        logger.exception("Failed to create user")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )

    return SignupResponse(
        status=201,
        message="success",
        email=creds.email_address,
        user_id=new_user.id
    )