export const BRIEF_SEEN_KEY = "aviram-brief-seen";

export function isBriefSeen(): boolean {
  try { return sessionStorage.getItem(BRIEF_SEEN_KEY) === "1"; } catch { return false; }
}

/** Call when the user dismisses the Morning Brief or enters the dashboard from it. */
export function markBriefSeen(): void {
  try { sessionStorage.setItem(BRIEF_SEEN_KEY, "1"); } catch {}
}

/** Call on successful login so the next visit shows the Morning Brief. */
export function clearBriefSeen(): void {
  try { sessionStorage.removeItem(BRIEF_SEEN_KEY); } catch {}
}
