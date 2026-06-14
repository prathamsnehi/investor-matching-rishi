from backend.workers.app import broker
from src_api.preprocess.pdf_service import PDFExtractionService
from src_ml.services.vectoriser import Vectoriser

from typing import Dict, Any

@broker.task
async def extract_text_from_upload(file_path: str) -> Dict[str, Any]:
    extractor = PDFExtractionService(file_path=file_path)
    text = extractor.extract_text()

    #REMAINING TASK: STORE TEXT IN DATABASE
    #THIS IS A STUB

    return {
        "file_path" : file_path,
        "text" : text,
        "status": 200,
        "message": "success"
    }

@broker.task
async def embed_extracted_text(extraction_response: Dict[str, Any]) -> Dict[str, Any]:
    vectoriser = Vectoriser()
    response = vectoriser.embed(extraction_response["text"])

    return response
