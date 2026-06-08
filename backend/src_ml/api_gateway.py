from fastapi import FastAPI
from src_ml.services.routes import api_router

app = FastAPI(
    title="Fundmatch ML API gateway",
    description="ML related services served through a FastAPI gateway",
    version="0.0.1"
)

@app.get('/')
def health_check():
    return {
        "status" : "healthy",
        "version" : app.version,
    }


app.include_router(api_router, prefix="/ml_api/v1")
