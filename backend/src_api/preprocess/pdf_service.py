from pathlib import Path
from typing import List
import fitz #pymupdf

from config.logger_config import FundmatchLogger
import logging

logs = FundmatchLogger(logging.DEBUG)
logs.setup_logging()
logger = logging.getLogger(__name__)

class PDFExtractionService:
    def __init__(self, file_path: str):
        self.filepath = file_path
        logger.info("PDF Extraction service initialised")

    def extract_text(self) -> str:
        if not Path(self.filepath).exists():
            logger.exception("Failed to upload")
            raise FileNotFoundError(f"PDF not found: {self.filepath}")
    
        text_parts: List[str] = []

        with fitz.open(self.filepath) as doc:
            for page in doc:
                text_parts.append(page.get_text())

        logger.info("Text extracted from PDF")
        return "\n".join(text_parts)