from fastapi import FastAPI
from src_api.endpoints.main_router import api_router
from config.logger_config import FundmatchLogger
from prisma_db.prisma_client import db

import logging
from contextlib import asynccontextmanager

logs = FundmatchLogger(level=logging.DEBUG)
logs.setup_logging()
logger = logging.getLogger(__name__)

@asynccontextmanager
async def app_lifespan(app: FastAPI):
    async with db.lifespan():
        logger.info("Server is up and database is ready")
        yield

    
app = FastAPI(
    title="Fundmatch main API service",
    description="Production boilerplate using APIRouter",
    version="0.0.1",
    lifespan=app_lifespan,
)

@app.get('/')
def health_check():
    logger.info("Healthcheck endpoint hit")
    return {
        "status" : "healthy"
    }


app.include_router(api_router, prefix="/api/v1")