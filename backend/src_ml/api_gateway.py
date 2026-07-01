from fastapi import FastAPI
from src_ml.services.routes import api_router
from config.logger_config import FundmatchLogger

from contextlib import asynccontextmanager
from prisma_db.prisma_client import db

import logging

logs = FundmatchLogger(logging.DEBUG)
logs.setup_logging()
logger = logging.getLogger(__name__)

@asynccontextmanager
async def ml_lifespan(app: FastAPI):
    async with db.lifespan():
        yield
        logger.info("ML service started")

    await db.disconnect()
    logger.info("ML service shutting down")

app = FastAPI(
    title="Fundmatch ML API gateway",
    description="ML related services served through a FastAPI gateway",
    version="0.0.1",
    lifespan=ml_lifespan
)

@app.get('/ping')
def health_check():
    logger.info("System healthy")
    return {
        "status" : "healthy",
        "version" : app.version,
    }


app.include_router(api_router, prefix="/ml_api/v1")