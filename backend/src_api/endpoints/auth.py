from fastapi import APIRouter, HTTPException, status, Depends
from typing import Dict, Any
from schemas.auth import LoginRequest, LoginResponse
from core.security import SecurityEngine
from prisma_db.prisma_client import db

import logging

logger = logging.getLogger(__name__)

auth = SecurityEngine()
authRouter = APIRouter()

@authRouter.post('/login', response_model=LoginResponse)
async def login(creds: LoginRequest) -> LoginResponse:
    user = await db.client.account.find_unique(
        where={"email_address" : creds.email}
    )
    if not user or not auth.verify_password(creds.password, user.hashed_password):
        logger.warning(f"Failed login attempt for: {creds.email}")
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
