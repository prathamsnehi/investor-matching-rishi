import * as FileSystem from "expo-file-system/legacy";
import { apiClient, ApiError } from "./client";

/**
 * Pitch-deck upload via backend-minted signed URLs.
 *
 * The app never holds Firebase credentials. Flow:
 *   1. ask the backend for a short-lived signed PUT url + object path
 *   2. PUT the file bytes straight to that url (client -> Firebase, no proxy)
 *   3. notify the backend so it can download + kick off the ML pipeline
 *
 * See docs/pitch_deck_ingestion.md for the backend contract.
 */

export interface DeckUploadUrlRequest {
  filename: string;
  content_type: string;
  size_bytes: number;
}

export interface DeckUploadUrlResponse {
  upload_url: string;
  storage_path: string;
  method: string; // "PUT"
  headers: Record<string, string>; // headers the PUT must echo (e.g. Content-Type)
  expires_in: number; // seconds
}

export interface PitchDeckIngestRequest {
  storage_path: string;
  original_filename?: string;
  mime_type?: string;
}

interface IngestResponse {
  status: number;
  message: string;
  document_id: string;
  task_id: string;
  document_status: string;
}

/** Step 1: get a signed PUT url scoped to this user's pitch_decks/ prefix. */
export const getDeckUploadUrl = (payload: DeckUploadUrlRequest) =>
  apiClient.postJson<DeckUploadUrlResponse>("/ingestion/deck-upload-url", payload);

/** Step 2: stream the local file to the signed url (no JS-memory blob). */
export async function putFileToSignedUrl(
  localUri: string,
  uploadUrl: string,
  headers: Record<string, string>,
): Promise<void> {
  const res = await FileSystem.uploadAsync(uploadUrl, localUri, {
    httpMethod: "PUT",
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers,
  });
  if (res.status < 200 || res.status >= 300) {
    throw new ApiError(res.status, `Pitch deck upload failed (HTTP ${res.status}).`);
  }
}

/** Step 3: tell the backend to ingest the uploaded object (starts ML pipeline). */
export const ingestPitchDeck = (payload: PitchDeckIngestRequest) =>
  apiClient.postJson<IngestResponse>("/ingestion/pitch-deck", payload);

/**
 * Convenience wrapper: runs all three steps and returns the stored object path
 * (the stable identifier persisted client-side).
 */
export async function uploadAndIngestPitchDeck(args: {
  localUri: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
}): Promise<string> {
  const { localUri, filename, contentType, sizeBytes } = args;

  const signed = await getDeckUploadUrl({
    filename,
    content_type: contentType,
    size_bytes: sizeBytes,
  });

  await putFileToSignedUrl(localUri, signed.upload_url, signed.headers);

  await ingestPitchDeck({
    storage_path: signed.storage_path,
    original_filename: filename,
    mime_type: contentType,
  });

  return signed.storage_path;
}
