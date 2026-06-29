from fastapi import FastAPI
from contextlib import asynccontextmanager
from prisma_db.prisma_client import db

from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.client.connect()
    logger.info("Chat session initialised")

    yield

    logger.info("Shutting down chat service")
    await db.client.close()


app = FastAPI(
    title="Fundmatch chat service",
    version="0.0.1",
    lifespan=lifespan
)


@app.get("/ping")
async def ping() -> Dict[str, Any]:
    return {
        "status" : "ok"
    }

