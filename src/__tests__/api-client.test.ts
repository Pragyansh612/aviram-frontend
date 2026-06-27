/**
 * API client tests.
 * Verifies JWT attachment and 401 refresh behavior.
 */

// ── Mock fetch globally ───────────────────────────────────────────────────────

const mockFetch = jest.fn();
global.fetch = mockFetch as typeof fetch;

// ── Mock token storage ────────────────────────────────────────────────────────

jest.mock("@/lib/api/tokens", () => ({
  getAccessToken: jest.fn(),
  getRefreshToken: jest.fn(),
  saveTokens: jest.fn(),
  clearTokens: jest.fn(),
}));

import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
} from "@/lib/api/tokens";

import { apiFetch } from "@/lib/api/client";

const mockGetAccess = getAccessToken as jest.MockedFunction<typeof getAccessToken>;
const mockGetRefresh = getRefreshToken as jest.MockedFunction<typeof getRefreshToken>;
const mockSaveTokens = saveTokens as jest.MockedFunction<typeof saveTokens>;
const mockClearTokens = clearTokens as jest.MockedFunction<typeof clearTokens>;

beforeEach(() => {
  jest.clearAllMocks();
  mockFetch.mockReset();
});

// ── Helper ────────────────────────────────────────────────────────────────────

function jsonResponse(data: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(data),
    json: async () => data,
  } as Response);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("apiFetch", () => {
  it("attaches Authorization header when access token is present", async () => {
    mockGetAccess.mockReturnValue("my-access-token");
    mockFetch.mockResolvedValue(jsonResponse({ ok: true }));

    await apiFetch("/test-endpoint");

    const [, options] = mockFetch.mock.calls[0];
    const headers = new Headers(options?.headers as HeadersInit);
    expect(headers.get("Authorization")).toBe("Bearer my-access-token");
  });

  it("does not attach Authorization when skipAuth is true", async () => {
    mockGetAccess.mockReturnValue("my-access-token");
    mockFetch.mockResolvedValue(jsonResponse({ ok: true }));

    await apiFetch("/public-endpoint", { skipAuth: true });

    const [, options] = mockFetch.mock.calls[0];
    const headers = new Headers(options?.headers as HeadersInit);
    expect(headers.get("Authorization")).toBeNull();
  });

  it("attempts token refresh on 401 response", async () => {
    mockGetAccess
      .mockReturnValueOnce("old-token")
      .mockReturnValueOnce("new-token");
    mockGetRefresh.mockReturnValue("my-refresh-token");
    mockSaveTokens.mockResolvedValue(undefined as never);

    // First call returns 401, refresh succeeds, retry returns 200
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({ detail: "expired" }),
      } as Response)
      .mockResolvedValueOnce(jsonResponse({  // refresh call
        access_token: "new-token",
        refresh_token: "new-refresh",
        user_id: "user-1",
        email: "test@example.com",
      }))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));  // retry

    await apiFetch("/protected-endpoint");

    // fetch called 3 times: original + refresh + retry
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("clears tokens and throws on 401 with no refresh token", async () => {
    mockGetAccess.mockReturnValue("expired-token");
    mockGetRefresh.mockReturnValue(null);

    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ detail: "expired" }),
    } as Response);

    await expect(apiFetch("/protected")).rejects.toThrow();
    expect(mockClearTokens).toHaveBeenCalled();
  });

  it("returns undefined for 204 No Content", async () => {
    mockGetAccess.mockReturnValue("token");
    mockFetch.mockResolvedValue({
      ok: true,
      status: 204,
      text: async () => "",
    } as Response);

    const result = await apiFetch("/some-delete");
    expect(result).toBeUndefined();
  });

  it("sets Content-Type application/json for JSON body", async () => {
    mockGetAccess.mockReturnValue("token");
    mockFetch.mockResolvedValue(jsonResponse({ ok: true }));

    await apiFetch("/json-endpoint", {
      method: "POST",
      body: JSON.stringify({ key: "value" }),
    });

    const [, options] = mockFetch.mock.calls[0];
    const headers = new Headers(options?.headers as HeadersInit);
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("does not set Content-Type for FormData body", async () => {
    mockGetAccess.mockReturnValue("token");
    mockFetch.mockResolvedValue(jsonResponse({ ok: true }));

    const form = new FormData();
    form.append("file", new Blob(["content"], { type: "application/pdf" }));

    await apiFetch("/upload", { method: "POST", body: form });

    const [, options] = mockFetch.mock.calls[0];
    const headers = new Headers(options?.headers as HeadersInit);
    expect(headers.get("Content-Type")).toBeNull();
  });
});
