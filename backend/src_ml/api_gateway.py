from fastapi import FastAPI
from src_ml.services.routes import api_router
from config.logger_config import FundmatchLogger

from contextlib import asynccontextmanager
from primsa import Prisma

import logging

logs = FundmatchLogger(logging.DEBUG)
logs.setup_logging()
logger = logging.getLogger(__name__)

ml_db = Prisma()

@asynccontextmanager
async def ml_lifespan(app: FastAPI):
    await ml_db.connect()
    logger.info("ML service started")
    
    yield

    await ml_db.disconnect()
    logger.info("ML service shutting down")

app = FastAPI(
    title="Fundmatch ML API gateway",
    description="ML related services served through a FastAPI gateway",
    version="0.0.1",
    lifespan=ml_lifespan
)

@app.get('/')
def health_check():
    logger.info("System healthy")
    return {
        "status" : "healthy",
        "version" : app.version,
    }


app.include_router(api_router, prefix="/ml_api/v1")