from fastapi import APIRouter, HTTPException, status
from prisma_db.prisma_client import db
from schemas.onboarding import InvestorOnboardingRequest, FounderOnboardingRequest

import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post('/onboard_founder')
async def onboard_founder(req: FounderOnboardingRequest) -> Dict[str, Any]:
    try:
        new_founder = await db.client.account.create(
            data={
                "role" : req.role,
                "full_name" : req.full_name,
                "email_address" : req.email_address,
                "mobile_number" : req.mobile_number,
                "linkedin_profile_url" : str(req.linkedin_profile_url) if req.linkedin_profile_url else None,
                "photo_url" : req.photo_url,
                "founderProfile" : {
                    "create" : {
                        "startup_name" : req.startup_name,
                        "one_line_desc" : req.one_line_desc,
                        "full_desc" : req.full_desc,
                        "stage" : req.stage,
                        "trl" : req.trl,
                        "target_raise_inr" : req.target_raise_inr,
                        "min_cheque_inr" : req.min_cheque_inr,
                    }
                }
            }
        )
        logger.info("User sucessfully created!")
        return {
            "status" : 200,
            "message" : "User successfully created!",
            "data" : new_founder,
        }
    except Exception as e:
        logger.exception("Failed to add user")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to add user: {str(e)}"
            )


@router.post('/onboard_investor')
async def onboard_investor(req: InvestorOnboardingRequest) -> Dict[str, Any]:
    try:
        new_investor = await db.client.account.create(
            data={
                "role" : req.role,
                "full_name" : req.full_name,
                "email_address" : req.email_address,
                "mobile_number" : req.mobile_number,
                "linkedin_profile_url" : str(req.linkedin_profile_url) if req.linkedin_profile_url else None,
                "photo_url" : req.photo_url,
                "investorProfile": {
                    "create": {
                        "investor_type": req.investor_type,
                        "brief_bio": req.brief_bio,
                        "min_trl_accepted": req.min_trl_accepted,
                        "min_cheque_inr": req.min_cheque_inr,
                        "max_cheque_inr": req.max_cheque_inr,
                        "preferred_stages": req.preferred_stages 
                    }
                }
            }
        )
        logger.info("User sucessfully created!")
        return {
            "status" : 200,
            "message" : "User successfully created!",
            "data" : new_investor,
        }
    except Exception as e:
        logger.exception("Failed to add user")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to add user: {str(e)}"
            )