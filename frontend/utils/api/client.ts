import { router } from "expo-router";
import { API_BASE_URL } from "@/constants/api";
import { getAccessToken, clearAuthSession } from "@/utils/storage/auth";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Pulls a human-readable message out of a FastAPI error body. */
const parseErrorMessage = async (res: Response): Promise<string> => {
  try {
    const data = await res.json();
    if (typeof data?.detail === "string") return data.detail;
    if (Array.isArray(data?.detail) && data.detail[0]?.msg) return data.detail[0].msg;
    if (typeof data?.message === "string") return data.message;
  } catch {
    // body was not JSON
  }
  return `Request failed (${res.status})`;
};

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** JSON-serializable body. Mutually exclusive with `form`. */
  body?: unknown;
  /** Form-urlencoded body (used by the OAuth2 login endpoint). */
  form?: Record<string, string>;
  /** Attach the stored Bearer token. Defaults to true. */
  auth?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, form, auth = true } = options;

  const headers: Record<string, string> = {};
  let payload: string | undefined;

  if (form) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    payload = new URLSearchParams(form).toString();
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const token = auth ? getAccessToken() : undefined;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { method, headers, body: payload });
  } catch (e) {
    throw new ApiError(0, "Network error — is the backend running and reachable?");
  }

  if (res.status === 401 && token) {
    // An authenticated request was rejected (expired/revoked). Force re-login.
    clearAuthSession();
    router.replace("/(auth)/welcome");
    throw new ApiError(401, "Session expired. Please sign in again.");
  }

  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorMessage(res));
  }

  if (res.status === 204) return undefined as T;
  try {
    return (await res.json()) as T;
  } catch {
    return undefined as T;
  }
}

export const apiClient = {
  get: <T>(path: string, auth = true) => request<T>(path, { method: "GET", auth }),
  postJson: <T>(path: string, body: unknown, auth = true) =>
    request<T>(path, { method: "POST", body, auth }),
  postForm: <T>(path: string, form: Record<string, string>, auth = false) =>
    request<T>(path, { method: "POST", form, auth }),
};
