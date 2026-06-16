from fastapi import FastAPI
from src_api.endpoints.main_router import api_router
from config.logger_config import FundmatchLogger

import logging

logs = FundmatchLogger(level=logging.DEBUG)
logs.setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Fundmatch main API service",
    description="Production boilerplate using APIRouter",
    version="0.0.1"
)

@app.get('/')
def health_check():
    logger.info("Healthcheck endpoint hit")
    return {
        "status" : "healthy"
    }


app.include_router(api_router, prefix="/api/v1")