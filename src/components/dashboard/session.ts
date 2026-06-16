export const BRIEF_SEEN_KEY = "aviram-brief-seen";
export const FIRST_BRIEF_KEY = "aviram-first-brief";
export const AUTH_KEY = "aviram-authed";
export const ONBOARDING_KEY = "aviram-onboarding-complete";
export const PROFILE_KEY = "aviram-profile";

export type StoredProfile = {
  name: string;
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

/** Fresh login — show Morning Brief again. */
export function beginLoginSession(): void {
  clearBriefSeen();
  clearFirstTimeBrief();
}

/** Onboarding finished — first-time Morning Brief + entry sequence. */
export function beginFirstDashboardSession(): void {
  clearBriefSeen();
  setFirstTimeBrief();
  markOnboardingComplete();
}
