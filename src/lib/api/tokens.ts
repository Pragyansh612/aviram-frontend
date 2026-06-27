const ACCESS_KEY = "aviram-access-token";
const REFRESH_KEY = "aviram-refresh-token";
const USER_ID_KEY = "aviram-user-id";
const EMAIL_KEY = "aviram-user-email";
const SESSION_COOKIE = "aviram-session";
const ONBOARDED_COOKIE = "aviram-onboarded";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function setCookie(name: string, value: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function clearCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function setSessionCookie(): void {
  setCookie(SESSION_COOKIE, "1");
}

export function setOnboardedCookie(): void {
  setCookie(ONBOARDED_COOKIE, "1");
}

export function clearOnboardedCookie(): void {
  clearCookie(ONBOARDED_COOKIE);
}

export function clearSessionCookies(): void {
  clearCookie(SESSION_COOKIE);
  clearCookie(ONBOARDED_COOKIE);
}

export type StoredTokens = {
  access_token: string;
  refresh_token: string;
  user_id: string;
  email: string;
};

export function getAccessToken(): string | null {
  try { return localStorage.getItem(ACCESS_KEY); } catch { return null; }
}

export function getRefreshToken(): string | null {
  try { return localStorage.getItem(REFRESH_KEY); } catch { return null; }
}

export function getUserId(): string | null {
  try { return localStorage.getItem(USER_ID_KEY); } catch { return null; }
}

export function getUserEmail(): string | null {
  try { return localStorage.getItem(EMAIL_KEY); } catch { return null; }
}

export function saveTokens(t: StoredTokens): void {
  try {
    localStorage.setItem(ACCESS_KEY, t.access_token);
    localStorage.setItem(REFRESH_KEY, t.refresh_token);
    localStorage.setItem(USER_ID_KEY, t.user_id);
    localStorage.setItem(EMAIL_KEY, t.email);
    localStorage.setItem("aviram-authed", "1");
    setSessionCookie();
  } catch {}
}

export function clearTokens(): void {
  try {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem("aviram-authed");
    clearSessionCookies();
  } catch {}
}

export function hasTokens(): boolean {
  return !!getAccessToken();
}
