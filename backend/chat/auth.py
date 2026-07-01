import os
import jwt
from fastapi import WebSocketException, Query, status
from jose import JWTError

from prisma_db.prisma_client import db
from src_api.schemas.auth import AccountRole

import logging

logger = logging.getLogger(__name__)

JWT_SECRET = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
    

async def get_fully_onboarded_user_ws(token: str = Query(...)) -> str:
    """
    Websocket dependency
    checks postgres for a user, if the user is onboarded and if the token is valid
    returns user_id if valid
    """

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        token_version: int = payload.get("tokenVersion")

        if user_id is None or token_version is None:
            raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid token payload")
    except (jwt.ExpiredSignatureError, jwt.PyJWTError, JWTError) as e:
        logger.exception("Websocket JWT auth error")
        raise WebSocketException(
            code=status.WS_1008_POLICY_VIOLATION,
            reason="Invalid or expired token"
        )

    user_with_profiles = await db.client.account.find_unique(
        where={"id" : user_id},
        include={
            "investorProfile": True,
            "founderProfile" : True
        }
    )    
    
    if not user_with_profiles:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION, reason="User not found")
    
    if user_with_profiles.token_version != token_version:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION, reason="Session expired or revoked")

    if user_with_profiles.role == AccountRole.INVESTOR and not user_with_profiles.investorProfile:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION, reason="Investor onboarding incomplete")
        
    if user_with_profiles.role == AccountRole.FOUNDER and not user_with_profiles.founderProfile:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION, reason="Founder onboarding incomplete")

    return user_id