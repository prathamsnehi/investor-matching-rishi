from pydantic import BaseModel, EmailStr, HttpUrl, Field
from typing import Optional, Any
from enum import Enum

class AccountRole(str, Enum):
    FOUNDER = "FOUNDER"
    INVESTOR = "INVESTOR"

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    email: EmailStr
    role: AccountRole

class UpdateDetailsRequest(BaseModel):
    username: str | None = None
    email: EmailStr | None = None
    password: str | None = None

class SignupResponse(BaseModel):
    status: int
    message: str
    email: EmailStr
    user_id: Any

class AccountBase(BaseModel):
    role: AccountRole

    full_name: str
    email_address: EmailStr
    mobile_number: str
    password: str = Field(min_length=8, max_length=32)
    linkedin_profile_url: Optional[HttpUrl] = None
    photo_url: Optional[str] = None