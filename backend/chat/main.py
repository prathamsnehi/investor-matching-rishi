from fastapi import FastAPI
from contextlib import asynccontextmanager
from prisma_db.prisma_client import db
from src_api.core.redis_client import redis_db

from typing import Dict, Any
import logging

# -- ROUTERS --
from chat.core.router import router as chatRouter

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await redis_db.connect()

    async with db.lifespan():
        logger.info("Chat session initialised")
        yield

    logger.info("Shutting down chat service")
    await redis_db.disconnect()

    logger.info("Chat service shutdown complete")


app = FastAPI(
    title="Fundmatch chat service",
    version="0.0.1",
    lifespan=lifespan
)

app.include_router(chatRouter, tags=["chat"])

@app.get("/ping")
async def ping() -> Dict[str, Any]:
    return {
        "status" : "ok" if redis_db.ping() else "not ok",
        "redis_ping" : await redis_db.ping()
    }