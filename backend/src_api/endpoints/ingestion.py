from fastapi import APIRouter, UploadFile, File, HTTPException
from src_api.schemas.ingestion import FileUploadResponse
from workers.tasks import extract_text_from_upload

from pathlib import Path
from uuid import uuid4
from datetime import timezone, datetime
import aiofiles
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
logger.info("Core API gateway initialised")

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True, parents=True)

#Endpoints

@router.post("/upload", response_model=FileUploadResponse)
async def upload_file(file: UploadFile = File(...)):
    file_id = str(uuid4())

    original_filename = file.filename or "unnamed_file"
    stored_filename = f"{file_id}_{original_filename}"
    storage_path = UPLOAD_DIR / stored_filename

    contents = await file.read()
    logger.debug("File read successfully")

    async with aiofiles.open(storage_path, "wb") as f:
        await f.write(contents)
    logger.debug("Contents written to memory successfully")

    try:
        extraction_task = await extract_text_from_upload.kiq(
            str(storage_path),
            profile_id=uuid4(),
            profile_type="FOUNDER"
            )
        logger.info("Task queued successfully")

        return FileUploadResponse(
            file_id=file_id,
            task_id=extraction_task.task_id,
            stored_filename=stored_filename,
            size_bytes=len(contents),
            uploaded_at=datetime.now(timezone.utc),
            task_status="queued",
            status=200,
        )
    except Exception as e:
        logger.exception("File upload failed")
        raise HTTPException(status_code=500, detail=str(e))