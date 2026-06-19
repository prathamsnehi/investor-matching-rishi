from fastapi import APIRouter, HTTPException, status, Depends
from prisma_db.prisma_client import db
from src_api.schemas.onboarding import InvestorOnboardingRequest, FounderOnboardingRequest
from src_api.dependencies.auth import get_current_user

import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)
onboardingRouter = APIRouter()

@onboardingRouter.post("/investor")
async def onboard_investor(
    payload: InvestorOnboardingRequest,
    current_user = Depends(get_current_user)
) -> Dict[str, Any]:
    if current_user.role != "INVESTOR":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Account is not registered as an investor"
        )
    
    existing_profile = await db.client.investorprofile.find_unique(
        where = {"account_id" : current_user.id}
    )

    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already onboarded"
        )
    
    try:
        new_profile = await db.client.investorprofile.create(
            data = {
                "account_id" : current_user.id,
                "investor_type" : payload.investor_type,
                "brief_bio" : payload.brief_bio,
                "min_trl_accepted" : payload.min_trl_accepted,
                "min_cheque_inr" : payload.min_cheque_inr,
                "max_cheque_inr" : payload.max_cheque_inr,
                "preferred_stages" : payload.preferred_stages
            }
        )
        logger.info(f"Profile created successfully for {current_user.email_address}")
        return {
            "status" : 201,
            "message" : "profile created, onboarding complete"
        }
    except Exception as e:
        logger.exception("Faied to create investor profile")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="database error while onboarding"
        )

@onboardingRouter.post("/founder")
async def onboard_founder(
    payload: FounderOnboardingRequest,
    current_user = Depends(get_current_user)
) -> Dict[str, Any]:
    if current_user.role != "FOUNDER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Account is not registered as a founder"
        )
    
    existing_profile = await db.client.founderprofile.find_unique(
        where = {"account_id" : current_user.id}
    )

    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already onboarded"
        )
    
    try:
        new_profile = await db.client.founderprofile.create(
            data = {
                "account_id" : current_user.id,
                "startup_name" : payload.startup_name,
                "one_line_desc" : payload.one_line_desc,
                "full_desc" : payload.full_desc,
                "stage" : payload.stage,
                "trl" : payload.trl,
                "target_raise_inr" : payload.target_raise_inr,
                "min_cheque_inr" : payload.min_cheque_inr
            }
        )
        logger.info(f"Profile created successfully for {current_user.email_address}")
        return {
            "status" : 201,
            "message" : "profile created, onboarding complete"
        }
    except Exception as e:
        logger.exception("Faied to create founder profile")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="database error while onboarding"
        )