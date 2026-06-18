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
export const OPEN_APPLICATION_KEY = "aviram-open-application";
export const HIGHLIGHT_OUTREACH_DRAFT_KEY = "aviram-highlight-outreach-draft";

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
  setCalibrationCount(0);
}
