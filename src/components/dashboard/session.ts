export const BRIEF_SEEN_KEY = "aviram-brief-seen";
export const FIRST_BRIEF_KEY = "aviram-first-brief";
export const AUTH_KEY = "aviram-authed";
export const ONBOARDING_KEY = "aviram-onboarding-complete";
export const PROFILE_KEY = "aviram-profile";

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
  try { return localStorage.getItem(AUTH_KEY) === "1"; } catch { return false; }
}

export function markAuthed(): void {
  try { localStorage.setItem(AUTH_KEY, "1"); } catch {}
}

export function isOnboardingComplete(): boolean {
  try { return localStorage.getItem(ONBOARDING_KEY) === "1"; } catch { return false; }
}

export function markOnboardingComplete(): void {
  try { localStorage.setItem(ONBOARDING_KEY, "1"); } catch {}
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

// ---- login timestamp (for "active for X hours" computation) ----
const LOGIN_TIME_KEY = "aviram-login-time";

/** Record the current wall-clock time as the last login moment. */
export function recordLoginTime(): void {
  try { localStorage.setItem(LOGIN_TIME_KEY, String(Date.now())); } catch {}
}

/**
 * Format elapsed milliseconds into a human-friendly "Xh Ym" string.
 * Returns null if there is no stored timestamp (first ever login).
 */
export function getActiveForDuration(): string | null {
  try {
    const raw = localStorage.getItem(LOGIN_TIME_KEY);
    if (!raw) return null;
    const prev = parseInt(raw, 10);
    if (isNaN(prev)) return null;
    const elapsed = Math.max(0, Date.now() - prev);
    const totalMin = Math.floor(elapsed / 60_000);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    if (h === 0) return m <= 1 ? "a few minutes" : `${m}m`;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  } catch { return null; }
}

/** Fresh login — show Morning Brief again. */
export function beginLoginSession(): void {
  clearBriefSeen();
  clearFirstTimeBrief();
  recordLoginTime();
}

/** Onboarding finished — first-time Morning Brief + entry sequence. */
export function beginFirstDashboardSession(): void {
  clearBriefSeen();
  setFirstTimeBrief();
  markOnboardingComplete();
  recordLoginTime();
}
