from fastapi import APIRouter
from src_api.endpoints import ingestion, onboarding, auth

api_router = APIRouter()

api_router.include_router(ingestion.router, prefix="/ingestion", tags=["ingestion"])
api_router.include_router(onboarding.onboardingRouter, prefix="/onboarding", tags=["onboarding"])
api_router.include_router(auth.authRouter, prefix="/auth", tags=["auth"])