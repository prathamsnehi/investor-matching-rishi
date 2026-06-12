from fastapi import APIRouter
from services import vectoriser

api_router = APIRouter()

api_router.include_router(vectoriser.router, prefix="/vectoriser", tags=["vectoriser"])