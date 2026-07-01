import os
import logging
from redis.asyncio import Redis, ConnectionPool

logger = logging.getLogger(__name__)

REDIS_URL = os.getenv("REDIS_URL")
REDIS_MAX_CONNECTIONS = int(os.getenv("REDIS_MAX_CONNECTIONS", 100))
REDIS_TIMEOUT_SECONDS = int(os.getenv("REDIS_TIMEOUT_SECONDS", 5))

class RedisClient:
    def __init__(self, redis_url: str = REDIS_URL) -> None:
        self.pool = None
        self.client = None
        self.url = redis_url

        if not redis_url:
            raise RuntimeError("Redis URL not set")

    async def connect(self):
        """
        Creates a connection pool to redis
        """

        try:
            self.pool = ConnectionPool.from_url(
                self.url, 
                decode_responses=True,
                max_connections=REDIS_MAX_CONNECTIONS,
                socket_timeout=REDIS_TIMEOUT_SECONDS,
                socket_connect_timeout=REDIS_TIMEOUT_SECONDS,
                health_check_interval=30
            )
            self.client = Redis(connection_pool=self.pool)
            await self.client.ping()
            
            logger.info("Successfully connected to redis")
        except Exception as e:
            logger.exception(f"Failed to connect to redis: {e}")
            raise e
    
    async def disconnect(self):
        """
        Closes the connection pool
        """
        if self.client:
            await self.client.aclose()
            logger.info("Disconnected from redis")

    async def ping(self):
        await self.client.ping()



redis_db = RedisClient(REDIS_URL)