from fastapi import APIRouter, HTTPException, status
import httpx

from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/filtered_ids/{user_id}")
async def get_matches(user_id: str) -> Dict[str, Any]:
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "http://ml:8000/ml_api/v1/sql/hard_filter",
                json={
                    "investor_id" : user_id
                }
            )
            response.raise_for_status()
            return response.json()
        except Exception:
            logger.warning("Error fetching IDs")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error while fetching matches"
            )