import { API_V1 } from "./config";
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from "./tokens";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public detail?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = RequestInit & { skipAuth?: boolean };

let refreshPromise: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  try {
    const res = await fetch(`${API_V1}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!res.ok) {
      clearTokens();
      return false;
    }
    const data = await res.json();
    saveTokens({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      user_id: data.user_id,
      email: data.email,
    });
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

async function ensureRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = refreshSession().finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { skipAuth, headers: extraHeaders, ...rest } = options;
  const headers = new Headers(extraHeaders);
  if (!headers.has("Content-Type") && rest.body && !(rest.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAccessToken();
  if (!skipAuth && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const url = path.startsWith("http") ? path : `${API_V1}${path.startsWith("/") ? path : `/${path}`}`;

  let res = await fetch(url, { ...rest, headers });

  if (res.status === 401 && !skipAuth && getRefreshToken()) {
    const ok = await ensureRefresh();
    if (ok) {
      const retryHeaders = new Headers(extraHeaders);
      if (!retryHeaders.has("Content-Type") && rest.body && !(rest.body instanceof FormData)) {
        retryHeaders.set("Content-Type", "application/json");
      }
      retryHeaders.set("Authorization", `Bearer ${getAccessToken()}`);
      res = await fetch(url, { ...rest, headers: retryHeaders });
    }
  }

  if (res.status === 204) return undefined as T;

  let payload: unknown;
  const text = await res.text();
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (res.status === 401 && !skipAuth) {
    clearTokens();
    if (typeof window !== "undefined") {
      const p = window.location.pathname;
      if (!p.startsWith("/login") && !p.startsWith("/signup") && !p.startsWith("/onboarding")) {
        window.location.href = "/login";
      }
    }
    throw new ApiError("Session expired — please sign in again.", 401);
  }

  if (!res.ok) {
    const detail = typeof payload === "object" && payload && "detail" in payload
      ? (payload as { detail: unknown }).detail
      : payload;
    const msg = typeof detail === "string"
      ? detail
      : Array.isArray(detail)
        ? detail.map((d) => (typeof d === "object" && d && "msg" in d ? String((d as { msg: string }).msg) : String(d))).join("; ")
        : `Request failed (${res.status})`;
    throw new ApiError(msg, res.status, detail);
  }

  return payload as T;
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const base = API_V1.replace("/api/v1", "");
    const res = await fetch(`${base}/health`, { cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}
