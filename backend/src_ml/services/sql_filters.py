from src_ml.api_gateway import ml_db
from typing import List, Dict, Any

from fastapi import APIRouter
from pydantic import BaseModel

import logging

logger = logging.getLogger(__name__)

class SQLFilters:
    def __init__(self):
        pass

    async def get_hard_filtered_candidates(self, investor_id: str) -> List[str]:
        """
        Takes an InvestorProfile ID and returns a list of Founder accountIds 
        that strictly match the hard relational constraints (Stage, TRL, Cheques).
        """

        query = """
                SELECT fp."accountId"
                FROM "FounderProfile" fp
                CROSS JOIN (
                    SELECT 
                        preferred_stages, 
                        min_trl_accepted, 
                        min_cheque_inr, 
                        max_cheque_inr
                    FROM "InvestorProfile"
                    WHERE id = $1
                ) i
                WHERE fp.stage = ANY(i.preferred_stages)
                AND fp.trl >= i.min_trl_accepted
                AND i.max_cheque_inr >= fp.min_cheque_inr
                AND i.min_cheque_inr <= fp.target_raise_inr;
            """
        try:
            results = await ml_db.client.query_raw(query, investor_id)
            candidate_account_ids = [row["accountId"] for row in results]
        except Exception as e:
            logger.exception("Failed to generate candidates")
            raise Exception

        return candidate_account_ids
    

router = APIRouter(prefix="sql")
filter = SQLFilters()

class FilterRequest(BaseModel):
    investor_id: str

@router.post("/hard_filter")
async def hard_filter(req: FilterRequest) -> Dict[str, Any]:
    candidate_ids = filter.get_hard_filtered_candidates(req.investor_id)
    return {
        "status" : "ok",
        "candidates" : candidate_ids
    }

