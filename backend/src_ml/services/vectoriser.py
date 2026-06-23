from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from keybert import KeyBERT
from typing import Dict, List, Any

import logging

logger = logging.getLogger(__name__)

LOCAL_MODEL = "all-MiniLM-L6-v2"

class Vectoriser:
    def __init__(self, model_name: str = LOCAL_MODEL):
        logger.info(f"Loading {model_name} into memory...")
        self.dense_model = SentenceTransformer(model_name)
        self.kw_model = KeyBERT(model=self.dense_model)
        logger.info("Models loaded successfully")

    def embed_dense(self, text: str | List[str]) -> List[float] | List[List[float]]:
        if isinstance(text, str):
            text = [text]
        embeddings = self.dense_model.encode(text).tolist()
        return embeddings
    
    def extract_fts_keywords(self, text: str) -> str:
        keywords_with_scores = self.kw_model.extract_keywords(
            text,
            keyphrase_ngram_range=(1, 2),
            stop_words='english',
            top_n=5
        )
        formatted_keywords = []

        for kw, score in keywords_with_scores:
            formatted_keywords.append(kw.replace(" ", " & "))
        
        return " | ".join(formatted_keywords)
    
class EmbeddingRequest(BaseModel):
    text: str | List[str]

router = APIRouter(tags=["Embedding service"])
vectoriser = Vectoriser()

@router.get('/healthcheck')
def health_check() -> Dict[str, str]:
    return {
        "status" : "Healthy",
        "model" : LOCAL_MODEL
    }

@router.post("/embed")
def embed_text(req: EmbeddingRequest) -> Dict[str, Any]:
    try:
        logger.info("Embedding text...")
        embeddings: List[float] | List[List[float]] = vectoriser.embed_dense(req.text)
        logger.info("Text successfully embedded!")
        return {
            "embeddings" : embeddings,
            "dimensions" : len(embeddings[0]) if isinstance(req.text, list) else len(embeddings),
            "status": 200,
            "message": "success",
        }
    except Exception as e:
        logger.exception("An error occured while embedding")
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/extract_fts_keywords")
def extract_keywords(req: EmbeddingRequest) -> Dict[str, Any]:
    try:
        fts_string = vectoriser.extract_fts_keywords(req.text)
        return {
            "fts_query" : fts_string,
            "status" : "success"
        }    
    except Exception as e:
        logger.exception("Error extracting keywords")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

