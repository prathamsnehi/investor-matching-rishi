from fastapi import APIRouter
from src_api.endpoints import ingestion, onboarding

api_router = APIRouter()

api_router.include_router(ingestion.router, prefix="/ingestion", tags=["ingestion"])
api_router.include_router(onboarding.router, prefix="/onboarding", tags=["onboarding"])