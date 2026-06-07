from fastapi import APIRouter, UploadFile, File, HTTPException
from src.schemas.ingestion import FileUploadResponse
from src.preprocess.worker_tasks import extract_text_from_upload

from pathlib import Path
from uuid import uuid4
from datetime import timezone, datetime

router = APIRouter()

UPLOAD_DIR = Path("backend/uploads")
UPLOAD_DIR.mkdir(exist_ok=True, parents=True)

@router.post("/upload", response_model=FileUploadResponse)
async def upload_file(file: UploadFile = File(...)):
    file_id = str(uuid4())

    original_filename = file.filename or "unnamed_file"
    stored_filename = f"{file_id}_{original_filename}"
    storage_path = UPLOAD_DIR / stored_filename

    contents = await file.read()

    with open(storage_path, "wb") as f:
        f.write(contents)

    try:
        task = await extract_text_from_upload.kiq(str(storage_path))

        return FileUploadResponse(
            file_id=file_id,
            task_id=task.task_id,
            stored_filename=stored_filename,
            size_bytes=len(contents),
            uploaded_at=datetime.now(timezone.utc),
            task_status="queued",
            status=200
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=e)