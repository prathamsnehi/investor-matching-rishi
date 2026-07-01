from workers.app import broker
from src_api.preprocess.pdf_service import PDFExtractionService

from src_api.core.redis_client import redis_db
from prisma_db.prisma_client import db

from uuid import UUID
import json
import httpx

from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

@broker.task
async def extract_text_from_upload(
    file_path: str,
    profile_id: UUID,
    profile_type: str = "Founder"
    ) -> Dict[str, Any]:

    """
    Parses the pdf, uploads it to firebase bucket and inserts chunk embeddings into postgres
    """

    extractor = PDFExtractionService(file_path=file_path)
    text = extractor.extract_text()
    
    async with httpx.AsyncClient() as client:
        dense_response = await client.post(
            "http://ml:8000/ml_api/v1/vectoriser/embed",
            json={
                "text" : text,
            },
            timeout=30.0,
        )
        dense_response.raise_for_status()
        embedding_data = dense_response.json()
        embedding_vector = embedding_data.get("embeddings")

    async with httpx.AsyncClient() as client:
        fts_query_response = await client.post(
            "http://ml:8000/ml_api/v1/vectoriser/extract_fts_keywords",
            json={
                "text" : text
            },
            timeout=30.0
        )
        fts_query_response.raise_for_status()
        fts_keywords_data = fts_query_response.json()
        fts_keywords = fts_keywords_data.get("fts_query")
    
    try:
        vector_str = json.dumps(embedding_vector)

        if profile_type.upper() == "FOUNDER":
            await db.client.execute_raw(
                '''
                UPDATE "FounderProfile"
                SET full_desc = $1,
                    embedding = $2::vector
                WHERE id = $3
                ''',
                text,
                vector_str,
                profile_id,
            )
        elif profile_type.upper() == "INVESTOR":
            await db.client.execute_raw(
                '''
                UPDATE "InvestorProfile"
                SET brief_bio = $1,
                    embedding = $2::vector
                WHERE id = $3
                ''',
                text,
                vector_str,
                profile_id,
            )
        else:
            logger.warning("Unknown profile type")
            raise ValueError(f"Unknown profile type: {profile_type}")
    except Exception as e:
        logger.exception("Database update failed")
        raise RuntimeError(f"Database update failed: {str(e)}")

    #REMAINING TASK(S): MAP PROFILES AND THEIR UUIDs TO ACTUAL DB ROWS, SAVE VECTORS TO SEPARATE TABLES
    #THIS IS A STUB, ONLY VECTOR INSERTION LOGIC PRESENT ATM

    return {
        "file_path" : file_path,
        "text" : text,
        "embedding": embedding_data,
        "status": 200,
        "message": "success"
    }


@broker.task(schedule=[{"cron" : "* * * * *"}])
async def flush_chat_messages_to_db() -> str:
    """
    Runs every 1 minute  to flush all chat messages into postgres securely
    """
    redis = redis_db.client

    dirty_convos = await redis.smembers("chat:dirty_conversations")

    if not dirty_convos:
        logger.info("No new chat messages to flush")
        return  "No action needed"
    
    logger.info(f"Flushing {len(dirty_convos)} conversations to postgres")
    total_inserted: int = 0

    for convo_id in dirty_convos:
        buffer_key = f"chat:buffer:{convo_id}"
        processing_key = f"chat:processing:{convo_id}"

        if not await redis.exists(processing_key):
            try:
                await redis.rename(buffer_key, processing_key)
            except Exception:
                await redis.srem("chat:dirty_conversations", convo_id)
                continue

        raw_messages: List[str] = await redis.lrange(processing_key, 0, -1)

        if not raw_messages:
            continue

        parsed_messages: List[Dict[str, Any]] = []

        for msg_str in raw_messages:
            try:
                msg_data = json.loads(msg_str)
                parsed_messages.append({
                    "id": msg_data["id"],
                    "conversationId": msg_data["conversationId"],
                    "senderId": msg_data["senderId"],
                    "content": msg_data["content"],
                    "createdAt": msg_data["createdAt"] 
                })
            except Exception as e:
                logger.exception(f"JSON Parse Error for message: {e}")

        if parsed_messages:
            try:
                await db.client.message.create_many(
                    data=parsed_messages,
                    skip_duplicates=True
                )
                total_inserted += len(parsed_messages)

                if total_inserted > 0:
                    await redis.delete(processing_key)

                if not await redis.exists(buffer_key):
                    await redis.srem("chat:dirty_conversations", convo_id)
            except Exception as e:
                logger.error(f"Postgres Insert Failed for convo {convo_id}: {e}")


    logger.info(f"Successfully flushed {total_inserted} messages to Postgres.")
    return f"Flushed {total_inserted} messages."