export const BRIEF_SEEN_KEY = "aviram-brief-seen";
export const FIRST_BRIEF_KEY = "aviram-first-brief";
export const AUTH_KEY = "aviram-authed";
export const ONBOARDING_KEY = "aviram-onboarding-complete";
export const ONBOARDING_USER_KEY = "aviram-onboarding-user";
export const PROFILE_KEY = "aviram-profile";

import { clearSessionCookies, setOnboardedCookie, setSessionCookie, clearOnboardedCookie } from "@/lib/api/tokens";

export type StoredProfile = {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  roles: string;
  locations: string;
  salaryFloor: string;
};

export function isBriefSeen(): boolean {
  try { return sessionStorage.getItem(BRIEF_SEEN_KEY) === "1"; } catch { return false; }
}

export function markBriefSeen(): void {
  try { sessionStorage.setItem(BRIEF_SEEN_KEY, "1"); } catch {}
}

export function clearBriefSeen(): void {
  try { sessionStorage.removeItem(BRIEF_SEEN_KEY); } catch {}
}

export function isFirstTimeBrief(): boolean {
  try { return sessionStorage.getItem(FIRST_BRIEF_KEY) === "1"; } catch { return false; }
}

export function setFirstTimeBrief(): void {
  try { sessionStorage.setItem(FIRST_BRIEF_KEY, "1"); } catch {}
}

export function clearFirstTimeBrief(): void {
  try { sessionStorage.removeItem(FIRST_BRIEF_KEY); } catch {}
}

export function isAuthed(): boolean {
  try {
    if (localStorage.getItem("aviram-access-token")) return true;
    return false;
  } catch { return false; }
}

export function clearAuth(): void {
  try {
    localStorage.removeItem("aviram-access-token");
    localStorage.removeItem("aviram-refresh-token");
    localStorage.removeItem("aviram-user-id");
    localStorage.removeItem("aviram-user-email");
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(ONBOARDING_KEY);
    localStorage.removeItem(ONBOARDING_USER_KEY);
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem("aviram-settings-prefs");
    localStorage.removeItem("aviram-settings-rules");
    localStorage.removeItem("aviram-calibration");
    localStorage.removeItem("aviram-login-time");
    localStorage.removeItem("aviram-last-sync");
    localStorage.removeItem("aviram-brief-variant");
    clearSessionCookies();
  } catch {}
}

/** New account signup — reset onboarding so flow always runs for this user. */
export function beginSignupSession(email: string): void {
  try {
    localStorage.removeItem(ONBOARDING_KEY);
    localStorage.removeItem(ONBOARDING_USER_KEY);
    localStorage.setItem("aviram-user-email", email);
    clearOnboardedCookie();
    setSessionCookie();
    clearBriefSeen();
    clearFirstTimeBrief();
  } catch {}
}

export function markAuthed(): void {
  try { localStorage.setItem(AUTH_KEY, "1"); } catch {}
}

export function isOnboardingComplete(): boolean {
  try {
    if (localStorage.getItem(ONBOARDING_KEY) !== "1") return false;
    const email = localStorage.getItem("aviram-user-email");
    const forUser = localStorage.getItem(ONBOARDING_USER_KEY);
    return !!email && forUser === email;
  } catch { return false; }
}

export function markOnboardingComplete(): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, "1");
    const email = localStorage.getItem("aviram-user-email");
    if (email) localStorage.setItem(ONBOARDING_USER_KEY, email);
    setOnboardedCookie();
  } catch {}
}

/**
 * The local flag above is only a same-browser cache. The database's
 * profiles.onboarding_completed column (checked via GET /profile/me) is the
 * real source of truth — a new browser or cleared storage must defer to it
 * rather than re-running onboarding for a user who already finished it.
 */
export async function syncOnboardingStateFromBackend(): Promise<boolean | null> {
  try {
    const { apiGetProfile } = await import("@/lib/api");
    const profile = await apiGetProfile();
    if (profile.onboarding_completed) {
      markOnboardingComplete();
      return true;
    }
    // Backend says not completed — don't trust a stale local flag from a
    // half-finished session; clear it so the guard redirects to /onboarding.
    localStorage.removeItem(ONBOARDING_KEY);
    clearOnboardedCookie();
    return false;
  } catch {
    // Backend unreachable — fall back to whatever this browser already knows.
    return null;
  }
}

export function getStoredProfile(): StoredProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) as StoredProfile : null;
  } catch { return null; }
}

export function saveStoredProfile(profile: StoredProfile): void {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch {}
}

export function getDisplayName(): string {
  const p = getStoredProfile();
  if (p?.name) return p.name.split(/\s+/)[0] || p.name;
  return "there";
}

// ---- runtime-skipped opportunities (persisted in sessionStorage so Timeline sees them) ----
export const SKIPPED_OPPS_KEY = "aviram-skipped-opps";

export type SkippedOpp = { id: string; company: string; role: string; time: string };

export function getSkippedOpps(): SkippedOpp[] {
  try {
    const raw = sessionStorage.getItem(SKIPPED_OPPS_KEY);
    return raw ? JSON.parse(raw) as SkippedOpp[] : [];
  } catch { return []; }
}

export function addSkippedOpp(entry: SkippedOpp): void {
  try {
    const list = getSkippedOpps().filter((s) => s.id !== entry.id);
    sessionStorage.setItem(SKIPPED_OPPS_KEY, JSON.stringify([entry, ...list]));
  } catch {}
}

export function removeSkippedOpp(id: string): void {
  try {
    const list = getSkippedOpps().filter((s) => s.id !== id);
    sessionStorage.setItem(SKIPPED_OPPS_KEY, JSON.stringify(list));
  } catch {}
}

// ---- deep-link flags (action items → open specific views) ----
export const OPEN_PREP_BRIEF_KEY = "aviram-open-prep-brief";
export const OPEN_APPLICATION_KEY = "aviram-open-application";
export const HIGHLIGHT_OUTREACH_DRAFT_KEY = "aviram-highlight-outreach-draft";
export const PENDING_PAGE_KEY = "aviram-pending-page";

export function requestNavigatePage(page: string): void {
  try { sessionStorage.setItem(PENDING_PAGE_KEY, page); } catch {}
}

export function consumeNavigatePage(): string | null {
  try {
    const p = sessionStorage.getItem(PENDING_PAGE_KEY);
    if (p) sessionStorage.removeItem(PENDING_PAGE_KEY);
    return p;
  } catch { return null; }
}

export function requestOpenPrepBrief(): void {
  try { sessionStorage.setItem(OPEN_PREP_BRIEF_KEY, "1"); } catch {}
}

export function consumeOpenPrepBrief(): boolean {
  try {
    const v = sessionStorage.getItem(OPEN_PREP_BRIEF_KEY) === "1";
    if (v) sessionStorage.removeItem(OPEN_PREP_BRIEF_KEY);
    return v;
  } catch { return false; }
}

export function requestOpenApplication(appId: string): void {
  try { sessionStorage.setItem(OPEN_APPLICATION_KEY, appId); } catch {}
}

export function consumeOpenApplication(): string | null {
  try {
    const id = sessionStorage.getItem(OPEN_APPLICATION_KEY);
    if (id) sessionStorage.removeItem(OPEN_APPLICATION_KEY);
    return id;
  } catch { return null; }
}

export function requestHighlightOutreachDraft(draftId: string): void {
  try { sessionStorage.setItem(HIGHLIGHT_OUTREACH_DRAFT_KEY, draftId); } catch {}
}

export function consumeHighlightOutreachDraft(): string | null {
  try {
    const id = sessionStorage.getItem(HIGHLIGHT_OUTREACH_DRAFT_KEY);
    if (id) sessionStorage.removeItem(HIGHLIGHT_OUTREACH_DRAFT_KEY);
    return id;
  } catch { return null; }
}

// ---- session applications + timeline (bulk apply, outcomes) ----
export type SessionApp = {
  id: string;
  company: string;
  role: string;
  platform: string;
  status: string;
  statusLabel: string;
  date: string;
  ips: number;
  variant: string;
  coverLetter: string;
  events: { time: string; text: string }[];
  oppId?: string;
};

export type SessionTimelineEvent = {
  time: string;
  type: string;
  title: string;
  company: string;
  role: string;
  extra: string;
  action: string | null;
  ips: number | null;
  appId?: string;
  draftId?: string;
};

const SESSION_APPS_KEY = "aviram-session-apps";
const SESSION_TIMELINE_KEY = "aviram-session-timeline";
const APP_OUTCOMES_KEY = "aviram-app-outcomes";
const SETTINGS_PREFS_KEY = "aviram-settings-prefs";
const SETTINGS_RULES_KEY = "aviram-settings-rules";
const CALIBRATION_KEY = "aviram-calibration";

export function getSessionApps(): SessionApp[] {
  try {
    const raw = sessionStorage.getItem(SESSION_APPS_KEY);
    return raw ? JSON.parse(raw) as SessionApp[] : [];
  } catch { return []; }
}

export function addSessionApps(apps: SessionApp[]): void {
  try {
    const existing = getSessionApps();
    const ids = new Set(existing.map((a) => a.id));
    const merged = [...apps.filter((a) => !ids.has(a.id)), ...existing];
    sessionStorage.setItem(SESSION_APPS_KEY, JSON.stringify(merged));
  } catch {}
}

export function getSessionTimelineEvents(): SessionTimelineEvent[] {
  try {
    const raw = sessionStorage.getItem(SESSION_TIMELINE_KEY);
    return raw ? JSON.parse(raw) as SessionTimelineEvent[] : [];
  } catch { return []; }
}

export function addSessionTimelineEvents(events: SessionTimelineEvent[]): void {
  try {
    const merged = [...events, ...getSessionTimelineEvents()];
    sessionStorage.setItem(SESSION_TIMELINE_KEY, JSON.stringify(merged));
  } catch {}
}

export type AppOutcomeOverride = { status: string; statusLabel: string; label: string };

export function getAppOutcomeOverrides(): Record<string, AppOutcomeOverride> {
  try {
    const raw = sessionStorage.getItem(APP_OUTCOMES_KEY);
    return raw ? JSON.parse(raw) as Record<string, AppOutcomeOverride> : {};
  } catch { return {}; }
}

export function setAppOutcomeOverride(appId: string, override: AppOutcomeOverride): void {
  try {
    const all = getAppOutcomeOverrides();
    all[appId] = override;
    sessionStorage.setItem(APP_OUTCOMES_KEY, JSON.stringify(all));
  } catch {}
}

export type StoredPrefs = Record<string, string>;
export type StoredRules = Record<string, string>;

export function getStoredPrefs(): StoredPrefs | null {
  try {
    const raw = localStorage.getItem(SETTINGS_PREFS_KEY);
    return raw ? JSON.parse(raw) as StoredPrefs : null;
  } catch { return null; }
}

export function saveStoredPrefs(prefs: StoredPrefs): void {
  try { localStorage.setItem(SETTINGS_PREFS_KEY, JSON.stringify(prefs)); } catch {}
}

export function getStoredRules(): StoredRules | null {
  try {
    const raw = localStorage.getItem(SETTINGS_RULES_KEY);
    return raw ? JSON.parse(raw) as StoredRules : null;
  } catch { return null; }
}

export function saveStoredRules(rules: StoredRules): void {
  try { localStorage.setItem(SETTINGS_RULES_KEY, JSON.stringify(rules)); } catch {}
}

export function getCalibrationCount(): number | null {
  try {
    const raw = localStorage.getItem(CALIBRATION_KEY);
    return raw != null ? parseInt(raw, 10) : null;
  } catch { return null; }
}

export function setCalibrationCount(n: number): void {
  try { localStorage.setItem(CALIBRATION_KEY, String(n)); } catch {}
}

export function incrementCalibration(by: number): void {
  const current = getCalibrationCount() ?? 0;
  setCalibrationCount(current + by);
}

// ---- login timestamp (for "active for X hours" computation) ----
const LOGIN_TIME_KEY = "aviram-login-time";

/** Record the current wall-clock time as the last login moment. */
export function recordLoginTime(): void {
  try { localStorage.setItem(LOGIN_TIME_KEY, String(Date.now())); } catch {}
}

/** Format elapsed milliseconds into a human-friendly "Xh Ym" string. */
function formatDurationMs(elapsedMs: number): string {
  const totalMin = Math.floor(Math.max(0, elapsedMs) / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return m <= 1 ? "a few minutes" : `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/**
 * Format elapsed milliseconds into a human-friendly "Xh Ym" string.
 * Returns null if there is no stored timestamp (first ever login).
 * Client-local fallback only — used in demo mode or when the backend's
 * real previous_login_at isn't available. See getActiveForDurationSince
 * for the real, server-anchored computation.
 */
export function getActiveForDuration(): string | null {
  try {
    const raw = localStorage.getItem(LOGIN_TIME_KEY);
    if (!raw) return null;
    const prev = parseInt(raw, 10);
    if (isNaN(prev)) return null;
    return formatDurationMs(Date.now() - prev);
  } catch { return null; }
}

/**
 * Real "active for" duration computed from the backend's
 * profiles.previous_login_at (returned as `since` by GET /dashboard/brief),
 * not a client-local localStorage timestamp — accurate across devices and
 * browser data clears.
 */
export function getActiveForDurationSince(sinceIso: string): string | null {
  const prev = new Date(sinceIso).getTime();
  if (isNaN(prev)) return null;
  return formatDurationMs(Date.now() - prev);
}

// ---- wake screen (post-login transition before entry sequence) ----
const WAKE_KEY = "aviram-wake";

export function requestWakeScreen(): void {
  try { sessionStorage.setItem(WAKE_KEY, "1"); } catch {}
}

export function consumeWakeScreen(): boolean {
  try {
    const v = sessionStorage.getItem(WAKE_KEY) === "1";
    if (v) sessionStorage.removeItem(WAKE_KEY);
    return v;
  } catch { return false; }
}

// ---- last sync timestamp (Command Center "Updated X min ago") ----
const LAST_SYNC_KEY = "aviram-last-sync";

export function touchLastSync(): void {
  try { localStorage.setItem(LAST_SYNC_KEY, String(Date.now())); } catch {}
}

export function getLastSyncAgo(): string {
  try {
    const raw = localStorage.getItem(LAST_SYNC_KEY);
    if (!raw) return "just now";
    const min = Math.floor((Date.now() - parseInt(raw, 10)) / 60_000);
    if (min < 1) return "just now";
    if (min === 1) return "1 min ago";
    return `${min} min ago`;
  } catch { return "just now"; }
}

// ---- Morning Brief variant preference ----
export const BRIEF_VARIANT_KEY = "aviram-brief-variant";

export function getBriefVariant(): "letter" | "terminal" {
  try {
    const v = localStorage.getItem(BRIEF_VARIANT_KEY);
    return v === "terminal" ? "terminal" : "letter";
  } catch { return "letter"; }
}

export function saveBriefVariant(v: "letter" | "terminal"): void {
  try { localStorage.setItem(BRIEF_VARIANT_KEY, v); } catch {}
}

// ---- Referral network import status (LinkedIn / GitHub) ----
const NETWORK_IMPORTED_KEY = "aviram-network-imported";

export function getNetworkImported(): boolean {
  try { return localStorage.getItem(NETWORK_IMPORTED_KEY) === "1"; } catch { return false; }
}

export function saveNetworkImported(): void {
  try { localStorage.setItem(NETWORK_IMPORTED_KEY, "1"); } catch {}
}

/** Fresh login — show Morning Brief again. */
export function beginLoginSession(): void {
  clearBriefSeen();
  clearFirstTimeBrief();
  recordLoginTime();
  requestWakeScreen();
}

/** Onboarding finished — first-time Morning Brief + entry sequence. */
export function beginFirstDashboardSession(): void {
  clearBriefSeen();
  setFirstTimeBrief();
  markOnboardingComplete();
  recordLoginTime();
  setCalibrationCount(0);
  requestWakeScreen();
}
