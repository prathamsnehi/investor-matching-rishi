from src.preprocess.worker_app import broker
from src.preprocess.pdf_service import PDFExtractionService

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