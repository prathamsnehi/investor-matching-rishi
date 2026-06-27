# Pitch Deck Ingestion — Route + Worker Spec

How the backend issues a **signed upload URL**, accepts the resulting **Firebase
Storage identifier** from the app, and turns it into a downloaded, parsed, embedded
pitch deck that feeds the ML pipeline.

The app holds **no Firebase credentials** and never talks to the Firebase SDK. It
asks the backend for a short-lived signed `PUT` URL, uploads the file straight to it,
then notifies the backend. Client side lives in
[`frontend/utils/api/ingestion.ts`](../frontend/utils/api/ingestion.ts) (`getDeckUploadUrl`
→ `putFileToSignedUrl` → `ingestPitchDeck`). The **storage_path** the backend hands
back is the identifier everything keys off — the object's path inside the Storage bucket.

---

## 1. End-to-end flow

```text
┌──────────┐  1. POST /ingestion/deck-upload-url (JWT)    ┌────────────────────┐
│  App     │ ────────────────────────────────────────────▶│  src_api (FastAPI) │
│ (RN)     │ ◀──── { upload_url, storage_path } ───────────│  mint signed PUT   │
│          │                                               └────────────────────┘
│          │  2. PUT file bytes ──▶ upload_url             ┌────────────────────┐
│          │ ─────────────────────────────────────────────▶│  Firebase Storage  │
│          │                                               │  pitch_decks/<uid>/ │
│          │  3. POST /ingestion/pitch-deck                └─────────┬──────────┘
│          │     { storage_path } + JWT                              │
└────┬─────┘                                                         │
     ▼                                                               │
┌──────────────────────┐                                            │
│  src_api: authz +     │                                           │
│  upsert UploadedDoc + │                                           │
│  enqueue task         │                                           │
└────┬─────────────────┘                                            │
     │ task.kiq(document_id, storage_path)                          │
     ▼                                          4. download by path │
┌──────────────────────┐ ◀──────────────────────────────────────────┘
│  worker (Taskiq)      │
│  - Firebase Admin SDK │
│  - extract + chunk    │
│  - call ML /embed     │
│  - persist chunks     │
│  - status -> READY    │
└──────────────────────┘
```

Steps 1 and 3 are quick JSON calls; step 2 streams bytes **client → Firebase** (no
proxy through your server). The ingest route (step 3) returns **202 Accepted** after
enqueueing; download/parse/embed all happen in the worker.

**Why signed URLs (vs. direct Firebase-SDK upload):** the app authenticates against
_our_ JWT backend, not Firebase Auth — so it has no Firebase identity and Storage
Security Rules can't authorize it. Signing the URL server-side keeps the bucket fully
private (deny all direct client access), needs no Firebase config in the app, and lets
the backend control exactly which path/size/content-type a client may write.

---

## 2. Upload-URL endpoint (mint a signed PUT URL)

**POST /api/v1/ingestion/deck-upload-url** — add to
[`backend/src_api/endpoints/ingestion.py`](../backend/src_api/endpoints/ingestion.py).

- **Auth:** required (`get_current_user`). **Role:** founder only → `403` otherwise.
- **Rate limit:** `5/minute` per IP (existing `slowapi` limiter) recommended.

### 2.1 Request / response

```javascript
// Request
{
  "filename": "seed-deck-v3.pdf",
  "content_type": "application/pdf",   // pdf | ms-powerpoint | presentationml.presentation
  "size_bytes": 4823104
}
// Response 200
{
  "upload_url": "https://storage.googleapis.com/<bucket>/pitch_decks/<uid>/<uuid>.pdf?X-Goog-Signature=…",
  "storage_path": "pitch_decks/<uid>/<uuid>.pdf",
  "method": "PUT",
  "headers": { "Content-Type": "application/pdf" },
  "expires_in": 900
}
```

```python
# schemas/ingestion.py
from pydantic import BaseModel, Field
from typing import Dict

class DeckUploadUrlRequest(BaseModel):
    filename: str = Field(..., min_length=1, max_length=255)
    content_type: str
    size_bytes: int = Field(..., gt=0, le=15 * 1024 * 1024)  # 15 MB cap

class DeckUploadUrlResponse(BaseModel):
    upload_url: str
    storage_path: str
    method: str = "PUT"
    headers: Dict[str, str]
    expires_in: int
```

### 2.2 What the handler does

1. **Validate** content type (`application/pdf`, `…ms-powerpoint`,
   `…presentationml.presentation` → else `415`) and size (`≤ 15 MB` → else `413`).
2. **Choose a server-controlled path** — never trust a client path. Namespace by the
   authenticated account id so a client can only ever write under its own prefix.
3. **Mint a V4 signed PUT URL** bound to that path + content type, with a short expiry.
4. **Return** `upload_url`, `storage_path=object_path`, and the `headers` the client must
   echo on the PUT.

```python
import os, uuid
from datetime import timedelta
from workers.firebase_admin_client import get_bucket  # same helper used by the worker

# step 2 — server-chosen, per-user path (client can't smuggle another user's prefix)
ext = os.path.splitext(payload.filename)[1].lower() or ".pdf"
object_path = f"pitch_decks/{current_user.id}/{uuid.uuid4().hex}{ext}"

# step 3 — V4 signed PUT URL, 15-minute expiry, bound to the content type
blob = get_bucket().blob(object_path)
upload_url = blob.generate_signed_url(
    version="v4",
    expiration=timedelta(minutes=15),
    method="PUT",
    content_type=payload.content_type,
)
```

**Notes**

- The client's PUT **must** send exactly the signed `Content-Type` (a mismatch →
  `403` from Google Cloud Storage).
- Signing works **offline** using the service-account private key in the JSON
  credential — no extra IAM/network call needed. (On ADC without a private key, the SA
  additionally needs the *Service Account Token Creator* role.)
- The bucket stays private: the signature authorizes this one PUT; Storage Security
  Rules are irrelevant to it.

---

## 3. Ingest endpoint (kick off processing)

**POST /api/v1/ingestion/pitch-deck** — called by the app after the PUT succeeds.

- **Auth:** required. **Role:** founder only → `403`.

### 3.1 Request body

```javascript
{
  "storage_path": "pitch_decks/<uid>/<uuid>.pdf",  // REQUIRED — from step 1's response
  "original_filename": "seed-deck-v3.pdf",          // optional, for display
  "mime_type": "application/pdf",                    // optional, see §3.3
  "sha256_hash": "<64-hex>"                          // optional, enables dedup
}
```

```python
class PitchDeckIngestRequest(BaseModel):
    storage_path: str = Field(..., min_length=1, max_length=1024)
    original_filename: Optional[str] = None
    mime_type: Optional[str] = None
    sha256_hash: Optional[str] = Field(default=None, min_length=64, max_length=64)

class PitchDeckIngestResponse(BaseModel):
    status: int
    message: str
    document_id: str
    task_id: str
    document_status: str  # UploadedDocument.status
```

### 3.2 What the handler must do (in order)

1. **Re-authorize the path** (defense-in-depth, prevents IDOR). Even though the path was
   server-issued in step 1, verify it belongs to the caller and isn't a traversal.
2. **Upsert `UploadedDocument`** (`storage_url = storage_path`, `document_kind =
   FOUNDER_PITCH_DECK`, dedup on `(accountId, sha256_hash)` when a hash is given). If a
   `READY` doc with the same hash exists, short-circuit (idempotent).
3. **Flip status → `PROCESSING`** and **enqueue** the worker task.
4. **Return `202`** with `document_id`, `task_id`, and current status. The app can poll
   the document later for `READY` / `FAILED`.

```python
# step 1 — ownership + traversal guard
if not payload.storage_path.startswith(f"pitch_decks/{current_user.id}/"):
    raise HTTPException(403, "Storage path does not belong to this user")
if ".." in payload.storage_path or payload.storage_path.startswith("/"):
    raise HTTPException(400, "Invalid storage path")

# step 3 — enqueue (after the UploadedDocument upsert + status = PROCESSING)
task = await process_pitch_deck_from_storage.kiq(
    document_id=doc.id,
    storage_path=payload.storage_path,
    mime_type=payload.mime_type,
)
```

### 3.3 MIME / file-type handling

Resolve type in priority: (1) `mime_type` from request, (2) the object's content-type
from Firebase metadata (read in the worker), (3) the path extension.

- `application/pdf` → existing `PDFExtractionService` (PyMuPDF).
- `…presentationml.presentation` / `…ms-powerpoint` → PPTX path (needs `python-pptx`;
  currently a **stub**, see §7).
- Anything else → `415 Unsupported Media Type`.

### 3.4 Status codes

| Code                         | When                                                |
| ---------------------------- | --------------------------------------------------- |
| `202 Accepted`               | Queued successfully (happy path)                    |
| `400 Bad Request`            | Malformed/traversal path                            |
| `401 Unauthorized`           | Missing/invalid JWT                                 |
| `403 Forbidden`              | Not a founder, or path not owned by caller          |
| `409 Conflict`               | (optional) a job for this doc is already PROCESSING |
| `413 Payload Too Large`      | (upload-url route) file exceeds the cap             |
| `415 Unsupported Media Type` | Non-PDF/PPTX                                        |
| `500`                        | Unexpected server/DB error                          |

---

## 4. Worker: download the asset by identifier

New Taskiq task in [`backend/workers/tasks.py`](../backend/workers/tasks.py), using the
**Firebase Admin SDK** (service-account auth — works on private objects, no token expiry).

### 4.1 Firebase Admin initialization

```python
# workers/firebase_admin_client.py
import os
import firebase_admin
from firebase_admin import credentials, storage

_app = None

def get_bucket():
    global _app
    if _app is None:
        cred = credentials.Certificate(os.environ["FIREBASE_SERVICE_ACCOUNT_FILE"])
        _app = firebase_admin.initialize_app(
            cred, {"storageBucket": os.environ["FIREBASE_STORAGE_BUCKET"]}
        )
    return storage.bucket()  # default bucket from config
```

> The same `get_bucket()` is reused by the upload-URL route in §2 to mint signed URLs.

### 4.2 The task

```python
import tempfile, os, json
import httpx
from workers.app import broker
from workers.firebase_admin_client import get_bucket
from src_api.preprocess.pdf_service import PDFExtractionService
from prisma_db.prisma_client import db

@broker.task
async def process_pitch_deck_from_storage(
    document_id: str,
    storage_path: str,
    mime_type: str | None = None,
) -> dict:
    bucket = get_bucket()
    blob = bucket.blob(storage_path)          # <-- the identifier resolves the object

    # 0. Guard: object actually exists
    if not blob.exists():
        await _fail(document_id, f"Object not found: {storage_path}")
        raise FileNotFoundError(storage_path)

    blob.reload()                              # populate metadata
    resolved_mime = mime_type or blob.content_type or _mime_from_path(storage_path)

    # 1. Download to a temp file (blob is auth'd via the service account)
    suffix = os.path.splitext(storage_path)[1] or ".bin"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        local_path = tmp.name
    try:
        blob.download_to_filename(local_path)  # or blob.download_as_bytes()

        # 2. Extract + chunk (branch on type)
        if resolved_mime == "application/pdf":
            chunks = await PDFExtractionService(local_path).preprocess_and_chunk_document()
        elif "presentation" in (resolved_mime or "") or storage_path.endswith((".pptx", ".ppt")):
            chunks = await extract_pptx(local_path)      # TODO §7
        else:
            await _fail(document_id, f"Unsupported type: {resolved_mime}")
            raise ValueError(resolved_mime)

        # 3. Persist chunks + embeddings, then mark READY
        await _persist_chunks_and_embeddings(document_id, chunks)
        await db.client.uploadeddocument.update(
            where={"id": document_id},
            data={"status": "READY", "mime_type": resolved_mime},
        )
        return {"document_id": document_id, "chunks": len(chunks), "status": "READY"}

    except Exception as e:
        await _fail(document_id, str(e))
        raise
    finally:
        if os.path.exists(local_path):
            os.remove(local_path)              # never leak temp files


async def _fail(document_id: str, message: str):
    await db.client.uploadeddocument.update(
        where={"id": document_id},
        data={"status": "FAILED", "error_message": message[:500]},
    )
```

> **Why download to a temp file?** `PDFExtractionService` opens a filesystem path
> (`fitz.open(self.filepath)`). For zero-disk, switch to `blob.download_as_bytes()` +
> `fitz.open(stream=..., filetype="pdf")`. Either way, **always clean up** in `finally`.

### 4.3 Persisting chunks + embeddings

For each chunk: create a `DocumentChunk`, embed via the ML service, write a
`ChunkEmbedding` (closes the "worker does not save embeddings" stub in
`docs/known_stubs.md`):

```python
async def _persist_chunks_and_embeddings(document_id: str, chunks: list[dict]):
    texts = [c["chunk_text"] for c in chunks]
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "http://ml:8000/ml_api/v1/vectoriser/embed",
            json={"text": texts}, timeout=60.0,
        )
        resp.raise_for_status()
        vectors = resp.json()["embeddings"]   # List[List[float]] when input is a list

    for i, (chunk, vector) in enumerate(zip(chunks, vectors)):
        created = await db.client.documentchunk.create(data={
            "documentId": document_id,
            "chunk_index": i,
            "chunk_text": chunk["chunk_text"],
            "source_page": chunk.get("source_page"),
            "chunk_kind": "SLIDE",
        })
        # embedding column is Unsupported("vector(384)") -> write via raw SQL
        await db.client.execute_raw(
            'INSERT INTO "ChunkEmbedding" (id, "chunkId", embedding_model, embedding) '
            "VALUES (gen_random_uuid(), $1, $2, $3::vector)",
            created.id, "all-MiniLM-L6-v2", json.dumps(vector),
        )
```

### 4.4 Status state machine

```text
UPLOADED ──(enqueue)──▶ PROCESSING ──(success)──▶ READY
                              │
                              └────(any error)───▶ FAILED  (error_message set)
```

Expose status (e.g. a small `GET /ingestion/documents/{id}`) so the app knows when the
deck is searchable.

---

## 5. Configuration / secrets

Add to the **worker** and **api** services (both mint/use the bucket) in
`backend/docker-compose.yml` and `.env`:

| Var                             | Purpose                                                                       |
| ------------------------------- | ----------------------------------------------------------------------------- |
| `FIREBASE_STORAGE_BUCKET`       | e.g. `your-project.appspot.com` — the default bucket                          |
| `FIREBASE_SERVICE_ACCOUNT_FILE` | path to the mounted service-account JSON (used for both signing and download) |

- Add `firebase-admin` to `workers/pyproject.toml` **and** `backend/pyproject.toml`
  (the api process signs URLs), plus `python-pptx` for §7.
- Mount the JSON read-only into both containers; keep it out of git (`.gitignore`).

> The `api` service signs upload URLs and the `worker` downloads — both load the same
> service-account credential. There is **no** client-side Firebase config anymore
> (`GoogleService-Info.plist` / `google-services.json` are not used).

---

## 6. Owner: granting the backend developer Firebase access

You own the Firebase project; the backend needs to **sign upload URLs** and **download
objects** via the Admin SDK. The developer does **not** need to be a project owner —
hand off one least-privilege service-account key.

### Recommended — dedicated service account (no console access needed for the dev)

In the **Google Cloud Console** for the same project:

1. **IAM & Admin → Service Accounts → Create service account** (e.g. `pitch-deck-worker`).
2. **Grant a role:** `Storage Object Admin` (`roles/storage.objectAdmin`) — needed because
   the backend both **creates** objects (the signed PUT acts as this SA) and **reads** them
   (download). Tighter alternative: grant `Storage Object Creator` + `Storage Object Viewer`.
   Tighter still: grant it **on the bucket** (Cloud Storage → bucket → Permissions) rather
   than project-wide.
3. **Create a JSON key:** the service account → **Keys → Add key → Create new key → JSON**.
   (The private key in this file is what signs the upload URLs offline — so no extra
   _Token Creator_ role is required.)
4. **Get the bucket name:** Firebase Console → **Storage** → the `gs://…` at the top
   (usually `<project-id>.appspot.com` or `<project-id>.firebasestorage.app`).
5. **Send the developer, securely:** the JSON key + bucket name + project id, via a secret
   channel (1Password / Bitwarden Send) — **not** plain email/Slack. He wires these into
   `FIREBASE_SERVICE_ACCOUNT_FILE` and `FIREBASE_STORAGE_BUCKET` (§5).

### Alternative — invite him to the project (only if he needs console/logs access)

- Firebase Console → **Project settings → Users and permissions → Add member** → his Google
  account (typically **Editor**; least-privilege would be a custom IAM role with Storage +
  service-account key creation). He can then self-serve a key.

### Security notes

- The JSON key is a long-lived credential — treat it like a password. If it leaks, **delete
  that key** and generate a new one (rotation); nothing else is affected.
- Keep it server-only; it must never ship in the app.
- **No client Storage Rules to manage.** Because the app only ever does a signed PUT (and
  never reads from Storage directly), you can keep the bucket's rules denying all public/
  client access. The signature — not Storage Rules — authorizes the upload.

---

## 7. Known gaps / follow-ups

- **PPTX extraction is a stub.** `PDFExtractionService` is PDF-only. Add `extract_pptx`
  (python-pptx: iterate slides → shapes → `text_frame.text`) returning the same
  `[{chunk_text, source_slide, ...}]` shape.
- **Preprocessing/chunking** (cap chunks/doc, dedup near-identical chunks, drop
  low-value chunks) is still TODO per `docs/todo.md` — apply before embedding.
- **Linking the deck to matching:** decks live under `UploadedDocument`/`DocumentChunk`,
  which the sparse search already joins on `accountId`
  (`src_ml/inference/sparse_search.py`). No `FounderProfile` change needed.
- **Polling/UX:** the app currently fires the ingest call and moves on. A
  `GET /ingestion/documents/{id}` (status) would let the profile show "processing →
  ready" for the deck.
