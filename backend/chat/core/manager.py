from fastapi import WebSocket
from typing import Dict

import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, user_id: str, ws: WebSocket) -> None:
        """Accepts the connection and stores it in memory"""
        await ws.accept()
        self.active_connections[user_id] = ws
        logger.info(f"User {user_id} connected. Total active users: {len(self.active_connections)}")

    def disconnect(self, user_id: str) -> None:
        """Removes a connection from memory when a user drops off"""
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            logger.info(f"User {user_id} disconnected")

    async def send_personal_message(self, message: Dict, user_id: str) -> None:
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            await websocket.send_json(message)


redis_manager = ConnectionManager()