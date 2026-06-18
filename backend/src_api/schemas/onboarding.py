from pydantic import BaseModel, EmailStr, HttpUrl
from enum import Enum
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime


#database enums

class AccountRoleEnum(str, Enum):
    FOUNDER = "FOUNDER"
    INVESTOR = "INVESTOR"

class FundingStageEnum(str, Enum):
    PRE_SEED = "PRE_SEED"
    SEED = "SEED"
    PRE_SERIES_A = "PRE_SERIES_A"

class TRLEnum(str, Enum):
    IDEA = "IDEA"
    PROTOTYPE = "PROTOTYPE"
    PILOT = "PILOT"
    LIVE_PRODUCT = "LIVE_PRODUCT"
    SCALING = "SCALING"

class InvestorTypeEnum(str, Enum):
    ANGEL = "ANGEL"
    VC_FUND = "VC_FUND"
    FAMILY_OFFICE = "FAMILY_OFFICE"

#actual request/response schemas

class AccountBase(BaseModel):
    role: AccountRoleEnum

    full_name: str
    email_address: EmailStr
    mobile_number: str
    password: str
    linkedin_profile_url: Optional[HttpUrl] = None
    photo_url: Optional[str] = None

class FounderOnboardingRequest(AccountBase):
    role: AccountRoleEnum = AccountRoleEnum.FOUNDER

    startup_name: str
    one_line_desc: str
    full_desc: str
    stage: FundingStageEnum
    trl: TRLEnum
    target_raise_inr: float
    min_cheque_inr: float

class InvestorOnboardingRequest(AccountBase):
    role: AccountRoleEnum = AccountRoleEnum.INVESTOR

    investor_type: InvestorTypeEnum
    brief_bio: str
    preferred_stages: List[FundingStageEnum]
    min_trl_accepted: TRLEnum

    min_cheque_inr: float
    max_cheque_inr: float


