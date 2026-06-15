from pathlib import Path
from typing import List
import fitz #pymupdf

class PDFExtractionService:
    def __init__(self, file_path: str):
        self.filepath = file_path

    def extract_text(self) -> str:
        if not Path(self.filepath).exists():
            raise FileNotFoundError(f"PDF not found: {self.filepath}")
    
        text_parts: List[str] = []

        with fitz.open(self.filepath) as doc:
            for page in doc:
                text_parts.append(page.get_text())

        return "\n".join(text_parts)