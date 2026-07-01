from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from typing import Dict, Any, List
import json
import logging
import os

from src_api.core.redis_client import redis_db
from src_api.dependencies.auth import get_fully_onboarded_user as get_http_onboarded_user
from prisma_db.prisma_client import db
from chat.auth import get_fully_onboarded_user_ws
from chat.core.manager import redis_manager
from chat.core.broker_client import trigger_flush_task

logger = logging.getLogger(__name__)
router = APIRouter()

flush_threshold = os.getenv("CHAT_FLUSH_THRESHOLD")

@router.websocket("/chat/{conversation_id}")
async def chat_endpoint(
    websocket: WebSocket,
    conversation_id: str,
    user_id: str = Depends(get_fully_onboarded_user_ws)
):
    conversation = await db.client.conversation.find_unique(
        where={"id" : conversation_id}
    )

    if not conversation or user_id not in [conversation.founderId, conversation.investorId]:
        await websocket.close(
            code=status.WS_1008_POLICY_VIOLATION,
        )
        return
    
    recipient_id = conversation.founderId if user_id == conversation.investorId else conversation.investorId

    await redis_manager.connect(user_id, websocket)

    try:
        while True:
            data: Dict[str, Any] = await websocket.receive_json()

            message_payload = {
                "id" : data.get("id"),
                "conversationId" : conversation_id,
                "senderId" : user_id,
                "content" : data.get("content"),
                "createdAt" : data.get("createdAt")
            }

            message_str = json.dumps(message_payload)

            #Redis write behind

            redis = redis_db.client

            await redis.rpush(f"chat:buffer:{conversation_id}", message_str)
            await redis.sadd("chat:dirty_conversations", conversation_id)

            #webhook style threshold trigger

            buffer_length = await redis.llen(f"chat:buffer:{conversation_id}")
            if buffer_length >= flush_threshold:
                logger.info(f"Threshold reached ({buffer_length} msgs). Inserting into postgres...")
                await trigger_flush_task.kiq()

            await redis_manager.send_personal_message(message_payload, recipient_id)

    except WebSocketDisconnect:
        redis_manager.disconnect(user_id)
    except Exception as e:
        logger.exception(f"Websocket error for user: {user_id}: {str(e)}")
        redis_manager.disconnect(user_id)


@router.get("/chat/{conversation_id}/history")
async def get_chat_history(
    conversation_id: str,
    limit: int = 70,
    current_user: str = Depends(get_http_onboarded_user)
):
    """
    Fetches chat history by merging the hot Redis buffer with cold Postgres storage.
    """

    conversation = await db.client.conversation.find_unique(
        where={"id" : conversation_id}
    )

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    if current_user.id not in [conversation.founderId, conversation.investorId]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorised to view this chat"
        )

    redis = redis_db.client
    buffer_key = f"chat:buffer:{conversation_id}"

    raw_redis_messages = await redis.lrange(buffer_key, 0, -1)
    redis_messages: List[Dict[str, Any]] = []

    for msg_str in raw_redis_messages:
        try:
            msg_data = json.loads(msg_str)
            redis_messages.append(msg_data)
        except json.JSONDecodeError:
            continue

    pg_limit = max(0, limit - len(redis_messages))

    pg_messages: List[Dict[str, Any]] = []
    if pg_limit > 0:
        db_messages = await db.client.message.find_many(
            where={"conversationId" : conversation_id},
            order={"createdAt" : "desc"},
            take=pg_limit
        )

        for msg in db_messages:
            pg_messages.append(
                {
                "id": msg.id,
                "conversationId": msg.conversationId,
                "senderId": msg.senderId,
                "content": msg.content,
                "createdAt": msg.createdAt.isoformat()
                }
            )

    combined_msgs = redis_messages + pg_messages
    combined_msgs.sort(key=lambda x: x["createdAt"])

    return {
        "conversation_id" : conversation_id,
        "messages" : combined_msgs
    }