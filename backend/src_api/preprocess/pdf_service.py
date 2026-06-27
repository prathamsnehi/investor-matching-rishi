from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List, Literal, Optional
import hashlib
import logging
import mimetypes
import re

import fitz  # PyMuPDF

from config.logger_config import FundmatchLogger


logs = FundmatchLogger(logging.DEBUG)
logs.setup_logging()
logger = logging.getLogger(__name__)


MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB
ALLOWED_MIME_TYPES = ["application/pdf", "text/plain"]
MAX_PAGES = 30


class PDFExtractionService:
    """
    Pitch-deck-oriented extraction service.

    Output shape:
    {
        "document": {...},
        "chunks": [
            {
                "chunk_index": 0,
                "chunk_text": "...",
                "source_page": 1,
                "source_slide": 1,
                "chunk_kind": "MARKET",
                "token_count": 240,
                "char_start": 0,
                "char_end": 1024,
                "text_hash": "..."
            }
        ],
        "warnings": [...]
    }
    """

    EXTRACTION_MODEL = "pymupdf-native-layout-ocr"
    EXTRACTION_VERSION = 2

    NOISE_PATTERNS = [
        r"^©\s*\d{4}",
        r"^\d{1,3}$",
        r"^confidential$",
        r"^notebooklm$",
    ]

    CHUNK_KIND_KEYWORDS = {
        "PROBLEM": [
            "problem", "pain", "broken", "bottleneck", "inefficient",
            "challenge", "friction", "gap", "hard walls"
        ],
        "SOLUTION": [
            "solution", "platform", "engine", "product", "architecture",
            "workflow", "automation", "mandate", "delivered", "how it works"
        ],
        "MARKET": [
            "market", "opportunity", "tam", "sam", "som", "cagr",
            "industry", "demand", "trend", "growth", "global market"
        ],
        "TRACTION": [
            "traction", "customers", "paying", "revenue", "arr", "mrr",
            "tapeout", "tape-outs", "growth", "pilots", "contracts",
            "validated", "shipping now"
        ],
        "TEAM": [
            "team", "founder", "founders", "leadership", "advisor",
            "journey", "origins", "experience", "background"
        ],
        "FINANCIALS": [
            "financial", "financials", "pricing", "gm", "gross margin",
            "royalty", "asp", "raise", "use of funds", "runway",
            "revenue stream", "cheque", "cr facility", "₹", "$"
        ],
        "THESIS": [
            "thesis", "investment thesis", "why now", "belief",
            "mandate", "focus areas"
        ],
    }

    def __init__(
        self,
        file_path: str,
        original_filename: Optional[str] = None,
        mime_type: Optional[str] = None,
        ocr_mode: Literal["off", "auto", "always"] = "auto",
        ocr_dpi: int = 250,
        max_chunk_chars: int = 3200,
        chunk_overlap_chars: int = 250,
    ):
        self.filepath = Path(file_path)
        self.original_filename = original_filename or self.filepath.name
        self.mime_type = mime_type
        self.ocr_mode = ocr_mode
        self.ocr_dpi = ocr_dpi
        self.max_chunk_chars = max_chunk_chars
        self.chunk_overlap_chars = chunk_overlap_chars
        self.warnings: List[str] = []

        logger.info("PDFExtractionService initialised for file=%s", self.original_filename)

    async def preprocess_and_chunk_document(self) -> Dict[str, Any]:
        """
        Async wrapper called by the worker.
        """
        logger.info("Starting document processing...")
        return self.ingest_document()

    def ingest_document(self) -> Dict[str, Any]:
        self._validate_file()

        if self._is_text_file():
            return self._ingest_text_document()

        return self._ingest_pdf_document()

    def _ingest_pdf_document(self) -> Dict[str, Any]:
        extracted_chunks: List[Dict[str, Any]] = []
        pdf_document = None
        char_cursor = 0
        chunk_index = 0

        sha256_hash = self._sha256_file()

        result: Dict[str, Any] = {
            "document": {
                "original_filename": self.original_filename,
                "mime_type": self._guess_mime_type(),
                "sha256_hash": sha256_hash,
                "extraction_model": self.EXTRACTION_MODEL,
                "extraction_version": self.EXTRACTION_VERSION,
            },
            "chunks": extracted_chunks,
            "warnings": self.warnings,
        }

        try:
            pdf_document = fitz.open(str(self.filepath))

            if pdf_document.is_encrypted:
                raise ValueError("Encrypted/password-protected PDFs are not supported yet.")

            page_count = pdf_document.page_count
            result["document"]["page_count"] = page_count

            if page_count > MAX_PAGES:
                logger.warning("PDF exceeded max pages: %s", page_count)
                raise ValueError(
                    f"PDF is too long ({page_count} pages). Maximum allowed is {MAX_PAGES}."
                )

            for page_num in range(page_count):
                page = pdf_document.load_page(page_num)
                source_page = page_num + 1

                page_payload = self._extract_page_payload(page=page, source_page=source_page)
                page_text = self._build_slide_text(page_payload)

                if len(page_text) < 30:
                    self.warnings.append(f"Page {source_page}: no meaningful text extracted.")
                    continue

                chunk_kind = self._infer_chunk_kind(page_payload["title"], page_text)
                page_chunks = self._split_long_text(page_text)

                for text_part in page_chunks:
                    clean_text = self._clean_text(text_part)

                    if len(clean_text) < 30:
                        continue

                    text_hash = self._sha256_text(clean_text)
                    token_count = self._estimate_token_count(clean_text)

                    char_start = char_cursor
                    char_end = char_cursor + len(clean_text)

                    extracted_chunks.append(
                        {
                            "chunk_index": chunk_index,
                            "chunk_text": clean_text,
                            "source_page": source_page,
                            "source_slide": source_page,
                            "chunk_kind": chunk_kind,
                            "token_count": token_count,
                            "char_start": char_start,
                            "char_end": char_end,
                            "text_hash": text_hash,
                        }
                    )

                    chunk_index += 1
                    char_cursor = char_end + 1

            logger.info(
                "Successfully extracted %s chunks from file_hash=%s",
                len(extracted_chunks),
                sha256_hash,
            )

            return result

        except Exception:
            logger.exception("Error parsing PDF file=%s", self.original_filename)
            raise

        finally:
            if pdf_document:
                pdf_document.close()

    def _extract_page_payload(self, page: fitz.Page, source_page: int) -> Dict[str, Any]:
        native_blocks = self._extract_native_text_blocks(page)
        native_text = "\n".join(block["text"] for block in native_blocks)

        title = self._detect_slide_title(page, native_blocks)
        tables = self._extract_tables(page)
        table_text = "\n\n".join(table["text"] for table in tables)

        ocr_text = self._maybe_extract_ocr_text(page, native_text, source_page)

        return {
            "source_page": source_page,
            "title": title,
            "native_text": native_text,
            "ocr_text": ocr_text,
            "tables": tables,
            "table_text": table_text,
            "image_count": len(page.get_images(full=True)),
        }

    def _extract_native_text_blocks(self, page: fitz.Page) -> List[Dict[str, Any]]:
        """
        Extract text with layout-ish metadata.
        Uses dict mode instead of simple blocks so we can inspect spans/fonts.
        """
        text_dict = page.get_text("dict", sort=True)
        blocks: List[Dict[str, Any]] = []

        for block in text_dict.get("blocks", []):
            if block.get("type") != 0:
                continue

            lines: List[str] = []
            font_sizes: List[float] = []

            for line in block.get("lines", []):
                spans = line.get("spans", [])
                line_text_parts = []

                for span in spans:
                    text = span.get("text", "").strip()
                    if not text:
                        continue

                    line_text_parts.append(text)
                    font_sizes.append(float(span.get("size", 0)))

                if line_text_parts:
                    lines.append(" ".join(line_text_parts))

            text = self._clean_text("\n".join(lines))

            if not text or self._is_noise(text):
                continue

            blocks.append(
                {
                    "text": text,
                    "bbox": tuple(block.get("bbox", ())),
                    "max_font_size": max(font_sizes) if font_sizes else 0.0,
                }
            )

        return blocks

    def _detect_slide_title(self, page: fitz.Page, blocks: List[Dict[str, Any]]) -> str:
        if not blocks:
            return ""

        page_height = float(page.rect.height)

        candidates = []
        for block in blocks:
            bbox = block.get("bbox") or ()
            if len(bbox) != 4:
                continue

            _, y0, _, _ = bbox

            # Titles are usually in the top 35% and relatively large.
            if y0 <= page_height * 0.35:
                candidates.append(block)

        if not candidates:
            candidates = blocks[:3]

        best = sorted(
            candidates,
            key=lambda b: (b.get("max_font_size", 0), -len(b.get("text", ""))),
            reverse=True,
        )[0]

        return best.get("text", "").strip()

    def _extract_tables(self, page: fitz.Page) -> List[Dict[str, Any]]:
        tables: List[Dict[str, Any]] = []

        try:
            table_finder = page.find_tables()
        except Exception as exc:
            self.warnings.append(f"Table extraction failed: {type(exc).__name__}")
            return tables

        for table_index, table in enumerate(table_finder):
            try:
                rows = table.extract()
            except Exception:
                continue

            row_texts = []
            for row in rows:
                cells = [self._clean_text(str(cell or "")) for cell in row]
                cells = [cell for cell in cells if cell]
                if cells:
                    row_texts.append(" | ".join(cells))

            table_text = "\n".join(row_texts).strip()

            if table_text:
                tables.append(
                    {
                        "table_index": table_index,
                        "bbox": tuple(table.bbox) if table.bbox else None,
                        "text": table_text,
                    }
                )

        return tables

    def _maybe_extract_ocr_text(
        self,
        page: fitz.Page,
        native_text: str,
        source_page: int,
    ) -> str:
        if self.ocr_mode == "off":
            return ""

        native_len = len(native_text.strip())

        if self.ocr_mode == "auto" and native_len >= 150:
            return ""

        try:
            textpage = page.get_textpage_ocr(dpi=self.ocr_dpi, full=True)
            ocr_text = page.get_text("text", textpage=textpage, sort=True).strip()
            ocr_text = self._clean_text(ocr_text)

            if not ocr_text:
                return ""

            if not self._ocr_adds_new_information(native_text, ocr_text):
                return ""

            return ocr_text

        except Exception as exc:
            self.warnings.append(
                f"Page {source_page}: OCR failed or Tesseract unavailable: {type(exc).__name__}"
            )
            return ""

    def _build_slide_text(self, page_payload: Dict[str, Any]) -> str:
        parts = []

        title = page_payload.get("title", "").strip()
        native_text = page_payload.get("native_text", "").strip()
        table_text = page_payload.get("table_text", "").strip()
        ocr_text = page_payload.get("ocr_text", "").strip()

        if title:
            parts.append(f"Slide title: {title}")

        if native_text:
            parts.append(f"Slide text:\n{native_text}")

        if table_text:
            parts.append(f"Extracted tables:\n{table_text}")

        if ocr_text:
            parts.append(f"OCR text from visual layer:\n{ocr_text}")

        return "\n\n".join(parts)

    def _split_long_text(self, text: str) -> List[str]:
        text = text.strip()

        if len(text) <= self.max_chunk_chars:
            return [text]

        paragraphs = [p.strip() for p in re.split(r"\n{2,}", text) if p.strip()]
        chunks: List[str] = []
        current = ""

        for paragraph in paragraphs:
            if len(current) + len(paragraph) + 2 <= self.max_chunk_chars:
                current = f"{current}\n\n{paragraph}".strip()
            else:
                if current:
                    chunks.append(current)

                if len(paragraph) <= self.max_chunk_chars:
                    current = paragraph
                else:
                    chunks.extend(self._hard_split(paragraph))  
                    current = ""

        if current:
            chunks.append(current)

        return chunks

    def _hard_split(self, text: str) -> List[str]:
        chunks = []
        start = 0

        while start < len(text):
            end = start + self.max_chunk_chars
            chunk = text[start:end].strip()

            if chunk:
                chunks.append(chunk)

            start = max(end - self.chunk_overlap_chars, end)

        return chunks

    def _infer_chunk_kind(self, title: str, text: str) -> str:
        title_lower = title.lower()
        text_lower = text.lower()

        # Strong title rules first.
        if any(word in title_lower for word in ["market", "opportunity", "trend", "tam"]):
            return "MARKET"

        if any(word in title_lower for word in ["traction", "customers", "revenue", "shipping"]):
            return "TRACTION"

        if any(word in title_lower for word in ["team", "founder", "journey", "origins"]):
            return "TEAM"

        if any(word in title_lower for word in ["financial", "pricing", "raise", "funds"]):
            return "FINANCIALS"

        if any(word in title_lower for word in ["problem", "pain", "bottleneck"]):
            return "PROBLEM"

        if any(word in title_lower for word in ["solution", "product", "platform", "engine"]):
            return "SOLUTION"

        scores = {}

        for chunk_kind, keywords in self.CHUNK_KIND_KEYWORDS.items():
            score = 0
            for keyword in keywords:
                if keyword in text_lower:
                    score += 1
            scores[chunk_kind] = score

        best_kind = max(scores, key=scores.get)

        if scores[best_kind] == 0:
            return "SLIDE"

        return best_kind

    def _ingest_text_document(self) -> Dict[str, Any]:
        sha256_hash = self._sha256_file()
        text = self.filepath.read_text(encoding="utf-8", errors="ignore")
        clean_text = self._clean_text(text)

        chunks = []
        char_cursor = 0

        for chunk_index, text_part in enumerate(self._split_long_text(clean_text)):
            text_part = self._clean_text(text_part)

            if len(text_part) < 30:
                continue

            char_start = char_cursor
            char_end = char_cursor + len(text_part)

            chunks.append(
                {
                    "chunk_index": chunk_index,
                    "chunk_text": text_part,
                    "source_page": None,
                    "source_slide": None,
                    "chunk_kind": "BODY",
                    "token_count": self._estimate_token_count(text_part),
                    "char_start": char_start,
                    "char_end": char_end,
                    "text_hash": self._sha256_text(text_part),
                }
            )

            char_cursor = char_end + 1

        return {
            "document": {
                "original_filename": self.original_filename,
                "mime_type": "text/plain",
                "sha256_hash": sha256_hash,
                "page_count": None,
                "extraction_model": self.EXTRACTION_MODEL,
                "extraction_version": self.EXTRACTION_VERSION,
            },
            "chunks": chunks,
            "warnings": self.warnings,
        }

    def _validate_file(self) -> None:
        if not self.filepath.exists():
            logger.error("File not found: %s", self.filepath)
            raise FileNotFoundError(f"File not found: {self.filepath}")

        file_size = self.filepath.stat().st_size

        if file_size > MAX_FILE_SIZE_BYTES:
            raise ValueError(
                f"File too large: {file_size} bytes. Maximum allowed is {MAX_FILE_SIZE_BYTES} bytes."
            )

        mime_type = self._guess_mime_type()

        if mime_type not in ALLOWED_MIME_TYPES:
            raise ValueError(f"Unsupported mime type: {mime_type}")

    def _guess_mime_type(self) -> str:
        if self.mime_type:
            return self.mime_type

        guessed, _ = mimetypes.guess_type(str(self.filepath))

        if guessed:
            return guessed

        if self.filepath.suffix.lower() == ".pdf":
            return "application/pdf"

        if self.filepath.suffix.lower() == ".txt":
            return "text/plain"

        return "application/octet-stream"

    def _is_text_file(self) -> bool:
        return self._guess_mime_type() == "text/plain"

    def _sha256_file(self) -> str:
        hasher = hashlib.sha256()

        with self.filepath.open("rb") as f:
            for block in iter(lambda: f.read(1024 * 1024), b""):
                hasher.update(block)

        return hasher.hexdigest()

    def _sha256_text(self, text: str) -> str:
        normalized = self._normalize_for_hash(text)
        return hashlib.sha256(normalized.encode("utf-8")).hexdigest()

    def _normalize_for_hash(self, text: str) -> str:
        return re.sub(r"\s+", " ", text.strip().lower())

    def _clean_text(self, text: str) -> str:
        text = text.replace("\x00", " ")
        text = re.sub(r"[ \t]+", " ", text)
        text = re.sub(r"\n\s*\n\s*\n+", "\n\n", text)
        return text.strip()

    def _is_noise(self, text: str) -> bool:
        normalized = self._normalize_for_hash(text)

        for pattern in self.NOISE_PATTERNS:
            if re.match(pattern, normalized):
                return True

        return False

    def _estimate_token_count(self, text: str) -> int:
        # Cheap approximation. Good enough for storage metadata.
        # Replace later with your tokenizer if needed.
        return int(len(text.split()) * 1.3)

    def _ocr_adds_new_information(self, native_text: str, ocr_text: str) -> bool:
        native_words = set(re.findall(r"[a-zA-Z0-9₹$%]+", native_text.lower()))
        ocr_words = set(re.findall(r"[a-zA-Z0-9₹$%]+", ocr_text.lower()))

        if not ocr_words:
            return False

        new_words = ocr_words - native_words
        new_ratio = len(new_words) / max(len(ocr_words), 1)

        return new_ratio >= 0.25    