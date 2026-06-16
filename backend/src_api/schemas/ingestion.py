from pydantic import BaseModel
from typing import Any, Dict
from uuid import UUID
from datetime import datetime


class FileUploadResponse(BaseModel):
    file_id: UUID
    task_id: str
    stored_filename: str
    size_bytes: int
    uploaded_at: datetime
    task_status: str
    status: int
    
