from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum

class AccountRole(str, Enum):
    FOUNDER = "FOUNDER"
    INVESTOR = "INVESTOR"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    email: EmailStr
    role: AccountRole

class UpdateDetailsRequest(BaseModel):
    username: str | None = None
    email: EmailStr | None = None
    password: str | None = None