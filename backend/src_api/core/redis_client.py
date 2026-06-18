import os
import logging
from redis.asyncio import Redis, ConnectionPool

logger = logging.getLogger(__name__)

REDIS_URL = os.getenv("REDIS_URL")

class RedisClient:
    def __init__(self) -> None:
        self.pool = None
        self.client = None

    async def connect(self):
        """
        Creates a connection pool to redis
        """

        try:
            self.pool = ConnectionPool.from_url(REDIS_URL, decode_responses=True)
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



redis_db = RedisClient()