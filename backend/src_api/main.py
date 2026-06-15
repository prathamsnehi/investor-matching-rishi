from fastapi import FastAPI
from src_api.endpoints.main_router import api_router

app = FastAPI(
    title="Fundmatch main API service",
    description="Production boilerplate using APIRouter",
    version="0.0.1"
)

@app.get('/')
def health_check():
    return {
        "status" : "healthy"
    }


app.include_router(api_router, prefix="/api/v1")