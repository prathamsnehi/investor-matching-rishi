import asyncio
from prisma import prisma_client


class DB:
    async def __init__(self):
        prisma = prisma_client()
        await prisma.connect()
        
