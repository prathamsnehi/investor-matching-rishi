import asyncio
from typing_extensions import Self
from prisma import Prisma
from contextlib import asynccontextmanager

import logging
from config.logger_config import FundmatchLogger

logs = FundmatchLogger(level=logging.DEBUG)
logs.setup_logging()
logger = logging.getLogger(__name__)


class PrismaDBClient:
    _instance = None
    client: Prisma

    def __new__(cls) -> Self:
        if cls._instance is None:
            cls._instance = super(PrismaDBClient, cls).__new__(cls)
            cls._instance.client = Prisma()
        return cls._instance
    
    @asynccontextmanager
    async def lifespan(self):
        try:
            logger.info("Connecting to prisma and establishing connection pool...")
            await self.client.connect()
            yield self.client
        except Exception as e:
            logger.exception(f"Database error occured: {e}")
            raise
        finally:
            logger.info("Disconnecting prisma and clearing connection pool...")
            if self.client.is_connected():
                await self.client.disconnect()
        

db = PrismaDBClient()
