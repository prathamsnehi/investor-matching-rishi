from taskiq_redis import RedisAsyncResultBackend, ListQueueBroker
from config.logger_config import FundmatchLogger

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