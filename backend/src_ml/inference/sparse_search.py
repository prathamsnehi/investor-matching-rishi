from src_ml.api_gateway import ml_db
import math
from typing import Dict, List

async def execute_sparse_maxsim_helper(
        investor_fts_query: str,
        candidate_account_ids: List[str]
) -> Dict[str, float]:
    """
    Executes the FTS search against the DocumentChunks of specific candidates.
    Returns a dictionary mapping Founder accountId to their Normalized Sparse Score.
    """

    if not candidate_account_ids:
        return {}
    
    query = """
            SELECT 
                ud."accountId", 
                ts_rank_cd(dc.search_vector, to_tsquery('english', $1)) AS raw_sparse_score
            FROM "DocumentChunk" dc
            JOIN "UploadedDocument" ud ON dc."documentId" = ud.id
            WHERE ud."accountId" = ANY($2::text[])
            AND dc.search_vector @@ to_tsquery('english', $1)
            """
    
    results = await ml_db.query_raw(
        query,
        investor_fts_query,
        candidate_account_ids
    )

    founder_max_scores = {}
    for row in results:
        acc_id = row["accountId"]
        score = row["raw_sparse_score"]

        if acc_id not in founder_max_scores or score > founder_max_scores[acc_id]:
            founder_max_scores[acc_id] = score

    if not founder_max_scores:
        return {}
    
    compressed_scores = {
        acc_id : math.log(1 + score)
        for acc_id, score in founder_max_scores.items()
    }

    min_score = min(compressed_scores.values())
    max_score = max(compressed_scores.values())
    epsilon = 1e-9 # Prevent division by zero
    
    normalized_sparse_scores = {}
    for acc_id, comp_score in compressed_scores.items():
        norm_score = (comp_score - min_score) / (max_score - min_score + epsilon)
        normalized_sparse_scores[acc_id] = norm_score
        
    return normalized_sparse_scores