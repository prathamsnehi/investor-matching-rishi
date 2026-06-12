from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

from typing import Dict, List, Any

class Vectoriser:
    def __init__(self):
        self.model = SentenceTransformer("all-MiniLM-L6-v2")

    def embed(self, text: str | List[str]) -> List[float]:
        embeddings = self.model.encode(text).tolist()
        return embeddings
    
class EmbeddingRequest(BaseModel):
    text: str | List[str]

router = APIRouter(tags=["Embedding service"])
vectoriser = Vectoriser()

@router.get('healthcheck')
def health_check() -> Dict[str, str]:
    return{
        "status" : "Healthy",
        "model" : "all-MiniLM-L6-v2"
    }

@router.post("/embed")
def embed_text(req: EmbeddingRequest) -> Dict[str, Any]:
    try:
        embeddings = vectoriser.embed(req.text)
        print(embeddings)
        return {
            "embeddings" : embeddings,
            "dimensions" : len(embeddings[0]) if isinstance(req.text, list) else len(embeddings),
            "status": 200,
            "message": "success",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=e)
    
    


