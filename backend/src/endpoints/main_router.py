from fastapi import APIRouter
from src.endpoints import ingestion

api_router = APIRouter()

api_router.include_router(ingestion.router, prefix="/ingestion", tags=["ingestion"])