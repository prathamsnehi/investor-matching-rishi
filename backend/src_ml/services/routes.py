from fastapi import APIRouter
from src_ml.services import vectoriser, sql_filters

api_router = APIRouter()

api_router.include_router(vectoriser.router, prefix="/vectoriser", tags=["vectoriser"])
api_router.include_router(sql_filters.router, prefix="/hard_filters", tags=["Hard SQL filtering"])