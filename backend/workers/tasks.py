from workers.app import broker
from src_api.preprocess.pdf_service import PDFExtractionService

import httpx

from typing import Dict, Any

@broker.task
async def extract_text_from_upload(file_path: str) -> Dict[str, Any]:
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

    #REMAINING TASK: STORE TEXT IN DATABASE
    #THIS IS A STUB

    return {
        "file_path" : file_path,
        "text" : text,
        "embedding": embedding_data,
        "status": 200,
        "message": "success"
    }