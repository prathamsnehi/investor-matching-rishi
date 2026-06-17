from fastapi import FastAPI
from src_ml.services.routes import api_router
from config.logger_config import FundmatchLogger

import logging

logs = FundmatchLogger(logging.DEBUG)
logs.setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Fundmatch ML API gateway",
    description="ML related services served through a FastAPI gateway",
    version="0.0.1"
)

@app.get('/')
def health_check():
    logger.info("System healthy")
    return {
        "status" : "healthy",
        "version" : app.version,
    }


app.include_router(api_router, prefix="/ml_api/v1")
