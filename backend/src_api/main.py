from fastapi import FastAPI
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from src_api.endpoints.main_router import api_router
from config.logger_config import FundmatchLogger
from prisma_db.prisma_client import db
from src_api.core.redis_client import redis_db
from src_api.core.limiter import limiter

import logging
from contextlib import asynccontextmanager

logs = FundmatchLogger(level=logging.DEBUG)
logs.setup_logging()
logger = logging.getLogger(__name__)

@asynccontextmanager
async def app_lifespan(app: FastAPI):
    await redis_db.connect()

    async with db.lifespan():
        logger.info("Server is up and database is ready")
        yield

    await redis_db.disconnect()
    logger.info("Server shutdown complete")
    
app = FastAPI(
    title="Fundmatch main API service",
    description="Production boilerplate using APIRouter",
    version="0.0.1",
    lifespan=app_lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get('/')
def health_check():
    logger.info("Healthcheck endpoint hit")
    return {
        "status" : "healthy"
    }


app.include_router(api_router, prefix="/api/v1")