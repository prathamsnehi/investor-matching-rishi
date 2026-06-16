import asyncio
from prisma import Prisma


class DB:
    async def __init__(self):
        prisma = Prisma()
        await prisma.connect()
        
