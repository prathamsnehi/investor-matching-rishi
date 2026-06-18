from workers.app import broker
from src_api.preprocess.pdf_service import PDFExtractionService
from prisma_db.prisma_client import db

from uuid import UUID
import json
import httpx

from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

@broker.task
async def extract_text_from_upload(
    file_path: str,
    profile_id: UUID,
    profile_type: str = "Founder"
    ) -> Dict[str, Any]:

    extractor = PDFExtractionService(file_path=file_path)
    text = extractor.extract_text()
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://ml:8000/ml_api/v1/vectoriser/embed",
            json={
                "text" : text,
            },
            timeout=30.0,
        )
        response.raise_for_status()
        embedding_data = response.json()
        embedding_vector = embedding_data.get("embeddings")
    
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

    #REMAINING TASK: MAP PROFILES AND THEIR UUIDs TO ACTUAL DB ROWS
    #THIS IS A STUB, ONLY VECTOR INSERTION LOGIC PRESENT ATM

    return {
        "file_path" : file_path,
        "text" : text,
        "embedding": embedding_data,
        "status": 200,
        "message": "success"
    }