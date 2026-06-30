from taskiq_redis import RedisAsyncResultBackend, ListQueueBroker
from taskiq import TaskiqEvents
from config.logger_config import FundmatchLogger

from src_api.core.redis_client import redis_db
from prisma_db.prisma_client import db

import logging

logs = FundmatchLogger(logging.DEBUG)
logs.setup_logging()
logger = logging.getLogger(__name__)

logger.debug("Worker app started")

result_backend = RedisAsyncResultBackend(
    redis_url="redis://redis:6379/2",
)

broker = ListQueueBroker(
    url="redis://redis:6379/3",
).with_result_backend(result_backend)

@broker.on_event(TaskiqEvents.WORKER_STARTUP)
async def startup_event(state) -> None:
    await redis_db.connect()
    await db.client.connect()
    logger.info("Worker connected")

@broker.on_event(TaskiqEvents.WORKER_SHUTDOWN)
async def shutdown_event(state) -> None:
    await redis_db.disconnect()
    await db.client.close()
    logger.info("Worker disconnected")