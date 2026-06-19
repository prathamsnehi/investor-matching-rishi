from pydantic import BaseModel, EmailStr, HttpUrl, Field
from src_api.schemas.auth import AccountBase, AccountRole
from enum import Enum
from typing import List, Optional



#database enums

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

class FounderOnboardingRequest(BaseModel):
    role: AccountRole = AccountRole.FOUNDER

    startup_name: str
    one_line_desc: str
    full_desc: str
    stage: FundingStageEnum
    trl: TRLEnum
    target_raise_inr: float
    min_cheque_inr: float

class InvestorOnboardingRequest(BaseModel):
    role: AccountRole = AccountRole.INVESTOR

    investor_type: InvestorTypeEnum
    brief_bio: str
    preferred_stages: List[FundingStageEnum]
    min_trl_accepted: TRLEnum

    min_cheque_inr: float
    max_cheque_inr: float


