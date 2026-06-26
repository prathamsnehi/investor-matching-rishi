from pathlib import Path
from typing import List, Dict, Any
import fitz #pymupdf

from config.logger_config import FundmatchLogger
import logging

logs = FundmatchLogger(logging.DEBUG)
logs.setup_logging()
logger = logging.getLogger(__name__)

MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB
ALLOWED_MIME_TYPES = ["application/pdf", "text/plain"]
MAX_PAGES = 30

class PDFExtractionService:
    def __init__(self, file_path: str):
        self.filepath = file_path
        logger.info("PDF Extraction service initialised")

    def ingest_document(self) -> str:
        if not Path(self.filepath).exists():
            logger.exception("Failed to upload")
            raise FileNotFoundError(f"PDF not found: {self.filepath}")
        
        extracted_chunks = []
        pdf_document = None

        try:
            pdf_document = fitz.open(self.filepath)
            if pdf_document.page_count > MAX_PAGES:
                logger.warning(f"PDF exceeded max pages: {pdf_document.page_count}")
                raise ValueError(f"PDF is too long ({pdf_document.page_count} pages). Maximum allowed is {MAX_PAGES}.")
            
            for page_num in range(len(pdf_document)):
                page = pdf_document.load_page(page_num)
                blocks = page.get_text("blocks")

                for block in blocks:
                    block_type = block[6]
                    if block_type == 0:
                        text = block[4].strip()
                        if len(text) > 20:
                            clean_text = text.replace("\n", " ")

                            extracted_chunks.append({
                                "chunk_text" : clean_text,
                                "source_page" : page_num + 1,
                                "char_length" : len(clean_text),
                            })
            logger.info(f"Successfully extracted {len(extracted_chunks)} chunks from {self.filepath}")
            return extracted_chunks
        except Exception as e:
            logger.exception(f"Error parsing PDF: {self.filepath}")
            raise e
        finally:
            if pdf_document:
                pdf_document.close()

    async def preprocess_and_chunk_document(self) -> List[Dict[str, Any]]:
        """
        Async wrapper called by the worker
        """

        logger.info("Starting document processing...")
        return self.ingest_document()




        









    """
        text_parts: List[str] = []

        with fitz.open(self.filepath) as doc:
            for page in doc:
                text_parts.append(page.get_text())

        logger.info("Text extracted from PDF")
        return "\n".join(text_parts)
    """