from fastapi import APIRouter
from src_ml.services import vectoriser

api_router = APIRouter()

api_router.include_router(vectoriser.router, prefix="/vectoriser", tags=["vectoriser"])