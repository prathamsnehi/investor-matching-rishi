import os
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import jwt
from typing import Dict

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRY_MINUTES = 60 * 24

class SecurityEngine:

    def __init__(self) -> None:
        self.pwd_context = CryptContext(schemes=["bcrypt_sha256"], deprecated="auto")

    def get_password_hash(self, password: str) -> str:
        """Takes a plaintext password and returns a secure salted bcrypt hash"""
        return self.pwd_context.hash(password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """checks a plaintext password against a hash"""
        return self.pwd_context.verify(plain_password, hashed_password)

    def create_access_token(self, data: Dict) -> str:
        """
        Creates a JWT token string.
        Expects `data` to look like: {"sub": "user_id_123", "tokenVersion": 1, "role": "FOUNDER"}
        """
        to_encode = data.copy()

        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRY_MINUTES)
        to_encode.update({"exp" : expire})

        encoded_jwt: str = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

        return encoded_jwt
