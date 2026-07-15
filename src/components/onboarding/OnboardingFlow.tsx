"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  beginFirstDashboardSession,
  getStoredProfile,
  getStoredRules,
  isAuthed,
  isOnboardingComplete,
  saveStoredProfile,
  saveStoredRules,
  syncOnboardingStateFromBackend,
  type StoredProfile,
} from "@/components/dashboard/session";
import TagAutocomplete from "@/components/ui/TagAutocomplete";
import LocationPreferenceSelector from "@/components/ui/LocationPreferenceSelector";
import {
  JOB_ROLE_GROUPS,
  JOB_ROLES,
  parseTags,
  POPULAR_JOB_ROLES,
  TECH_COMPANIES,
} from "@/lib/job-catalog";
import {
  apiUpdateProfile,
  apiUpsertPreferences,
  apiUpdateAgentSettings,
  apiUploadResume,
  apiCompleteOnboarding,
  apiImportLinkedInConnections,
  apiSyncGithubNetwork,
  ApiError,
} from "@/lib/api";
import type { LinkedInConnectionItem } from "@/lib/api";
import { getUserEmail } from "@/lib/api/tokens";

const STEPS = ["profile", "resume", "preferences", "rules", "connections", "archetype", "calibration"] as const;
type Step = (typeof STEPS)[number];

const STEP_LABEL: Record<Step, string> = {
  profile: "Profile",
  resume: "Resume",
  preferences: "Preferences",
  rules: "Auto-apply",
  connections: "Connections",
  archetype: "Archetype",
  calibration: "Calibration",
};

// ── LinkedIn CSV helpers ──────────────────────────────────────────────────────

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (ch === '"') { inQuotes = !inQuotes; continue; }
    if (ch === "," && !inQuotes) { out.push(cur); cur = ""; continue; }
    cur += ch;
  }
  out.push(cur);
  return out;
}

function parseLinkedInConnectionsCsv(text: string): LinkedInConnectionItem[] {
  const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
  const headerIdx = lines.findIndex((l) => l.trim().startsWith("First Name,"));
  if (headerIdx === -1) return [];
  const header = splitCsvLine(lines[headerIdx]).map((h) => h.trim().toLowerCase());
  const col = (name: string) => header.indexOf(name);
  const out: LinkedInConnectionItem[] = [];
  for (const line of lines.slice(headerIdx + 1)) {
    const cols = splitCsvLine(line);
    const first_name = (cols[col("first name")] || "").trim();
    if (!first_name) continue;
    out.push({
      first_name,
      last_name: (cols[col("last name")] || "").trim(),
      linkedin_url: col("url") >= 0 ? (cols[col("url")] || "").trim() || null : null,
      email: col("email address") >= 0 ? (cols[col("email address")] || "").trim() || null : null,
      company: col("company") >= 0 ? (cols[col("company")] || "").trim() || null : null,
      position: col("position") >= 0 ? (cols[col("position")] || "").trim() || null : null,
      connected_on: col("connected on") >= 0 ? (cols[col("connected on")] || "").trim() || null : null,
    });
  }
  return out;
}

const emptyProfile: StoredProfile = {
  name: "",
  email: "",
  phone: "",
  linkedin: "",
  roles: "Backend Engineer, Distributed Systems",
  locations: "Remote · Bengaluru",
  salaryFloor: "₹38 LPA",
};

export default function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("profile");
  const [profile, setProfile] = useState<StoredProfile>(emptyProfile);
  const [resumeName, setResumeName] = useState<string | null>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const [hydrated, setHydrated] = useState(false);
  const [rules, setRules] = useState({
    ipsThreshold: "70",
    dailyLimit: "20",
    blockedCompanies: "",
    qualityMinimum: "High",
  });

  // ── Connections step state ────────────────────────────────────────────────
  const linkedinFileRef = useRef<HTMLInputElement>(null);
  const [linkedinImported, setLinkedinImported] = useState(false);
  const [linkedinBusy, setLinkedinBusy] = useState(false);
  const [githubUsername, setGithubUsername] = useState("");
  const [githubDone, setGithubDone] = useState(false);
  const [githubBusy, setGithubBusy] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredProfile();
    const email = getUserEmail() ?? "";
    if (stored) {
      setProfile({ ...emptyProfile, ...stored, email: stored.email || email });
    } else if (email) {
      setProfile((p) => ({ ...p, email }));
    }
    const storedRules = getStoredRules();
    if (storedRules) {
      setRules({
        ipsThreshold: storedRules["IPS threshold"] ?? "70",
        dailyLimit: storedRules["Daily application limit"] ?? "20",
        blockedCompanies: storedRules["Blocked companies"] ?? "",
        qualityMinimum: storedRules["Quality score minimum"] ?? "High",
      });
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthed()) {
      router.replace("/login");
      return;
    }
    // Defer to the backend's onboarding_completed flag — this browser's
    // localStorage may simply never have run onboarding for a user who
    // already completed it elsewhere.
    let cancelled = false;
    (async () => {
      const backendOnboarded = await syncOnboardingStateFromBackend();
      if (cancelled) return;
      const onboarded = backendOnboarded ?? isOnboardingComplete();
      if (onboarded) router.replace("/dashboard");
    })();
    return () => { cancelled = true; };
  }, [router, hydrated]);

  const stepIdx = STEPS.indexOf(step);
  const progress = ((stepIdx + 1) / STEPS.length) * 100;

  const next = async () => {
    if (step === "calibration") {
      saveStoredProfile(profile);
      saveStoredRules({
        "IPS threshold": rules.ipsThreshold,
        "Daily application limit": rules.dailyLimit,
        "Blocked companies": rules.blockedCompanies || "None",
        "Timing window": "Thu 8–11 AM",
        "Quality score minimum": rules.qualityMinimum,
        "Auto-send referrals": "false",
      });
      setFinishing(true);
      setFinishError(null);
      try {
        await apiUpdateProfile({
          full_name: profile.name,
          phone: profile.phone || null,
          linkedin_url: profile.linkedin.startsWith("http")
            ? profile.linkedin
            : profile.linkedin ? `https://linkedin.com/in/${profile.linkedin.replace(/^in\//, "")}` : null,
        });
        const salaryRaw = parseInt(profile.salaryFloor.replace(/\D/g, ""), 10) || 0;
        // salaryFloor is entered in LPA (e.g. "38" for ₹38 LPA); backend stores
        // absolute annual figure so multiply by 100,000.
        await apiUpsertPreferences({
          desired_roles: profile.roles.split(/[,·]/).map((s) => s.trim()).filter(Boolean),
          preferred_locations: profile.locations.split(/[,·]/).map((s) => s.trim()).filter(Boolean),
          min_salary: salaryRaw > 0 ? salaryRaw * 100_000 : undefined,
          remote_preference: profile.locations.toLowerCase().includes("remote") ? "remote" : "any",
        });
        await apiUpdateAgentSettings({
          ips_threshold: parseFloat(rules.ipsThreshold),
          daily_cap: parseInt(rules.dailyLimit, 10),
          quality_min: rules.qualityMinimum.toLowerCase() === "high" ? 80 : 60,
          company_blocklist: parseTags(rules.blockedCompanies),
          is_enabled: true,
        });
        // Server-side completion flag — the real source of truth checked on every
        // future login, from any browser. Unlike the calls above (which the user
        // can always correct later in Settings), a failure here must NOT be
        // swallowed: syncOnboardingStateFromBackend() trusts this flag, so a
        // silent failure would bounce the user right back into onboarding the
        // next time they log in, with no explanation.
        await apiCompleteOnboarding();
      } catch (err) {
        setFinishing(false);
        setFinishError(
          err instanceof ApiError
            ? err.message
            : "Couldn't finish setup — check your connection and try again.",
        );
        return;
      }
      beginFirstDashboardSession();
      router.push("/dashboard");
      return;
    }
    setStep(STEPS[stepIdx + 1]);
  };

  const handleResumePick = () => {
    resumeInputRef.current?.click();
  };

  const handleLinkedInFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setLinkedinBusy(true);
    try {
      const text = await file.text();
      const connections = parseLinkedInConnectionsCsv(text);
      if (connections.length === 0) return;
      await apiImportLinkedInConnections(connections);
      setLinkedinImported(true);
    } catch {
      // non-fatal — user can retry in Settings
    } finally {
      setLinkedinBusy(false);
    }
  };

  const handleGithubSync = async () => {
    const username = githubUsername.trim();
    if (!username) return;
    setGithubBusy(true);
    try {
      await apiSyncGithubNetwork(username);
      setGithubDone(true);
    } catch {
      // non-fatal — user can retry in Settings
    } finally {
      setGithubBusy(false);
    }
  };

  const handleResumeFile = async (file: File) => {
    setResumeName(file.name);
    try {
      await apiUploadResume(file);
    } catch {
      // local filename still shown; upload retries after onboarding
    }
  };

  return (
    <div className="onboard-page">
      <div className="onboard-card">
        <div className="onboard-head">
          <Link href="/" className="auth-brand">
            <span className="glyph">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 2 L21 20 H14.5 L12 13.5 L9.5 20 H3 Z" style={{ fill: "var(--accent)" }} />
              </svg>
            </span>
            <span className="name">Aviram</span>
          </Link>
          <div className="onboard-progress">
            <div className="onboard-progress-bar"><i style={{ width: progress + "%" }} /></div>
            <span className="onboard-step-label">{STEP_LABEL[step]} · {stepIdx + 1} of {STEPS.length}</span>
          </div>
        </div>

        {step === "profile" && (
          <div className="onboard-body">
            <h1 className="onboard-title serif">Your profile</h1>
            <div className="auth-form">
              <label className="auth-field">
                <span className="auth-label">Full name</span>
                <input className="auth-input" required value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              </label>
              <label className="auth-field">
                <span className="auth-label">Phone</span>
                <input className="auth-input" type="tel" required value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              </label>
              <label className="auth-field">
                <span className="auth-label">LinkedIn</span>
                <input className="auth-input" placeholder="linkedin.com/in/you" required value={profile.linkedin} onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })} />
              </label>
            </div>
          </div>
        )}

        {step === "resume" && (
          <div className="onboard-body">
            <h1 className="onboard-title serif">Upload your resume</h1>
            <p className="onboard-lede">Aviram uses this to score opportunities and tailor applications.</p>
            <button type="button" className={"resume-drop" + (resumeName ? " has-file" : "")} onClick={handleResumePick}>
              {resumeName ? (
                <>
                  <span className="resume-drop-name">{resumeName}</span>
                  <span className="resume-drop-meta">Uploaded · ready for parsing</span>
                </>
              ) : (
                <>
                  <span className="resume-drop-cta">Drop PDF or click to upload</span>
                  <span className="resume-drop-meta">PDF, DOCX · max 5 MB</span>
                </>
              )}
            </button>
            <input
              ref={resumeInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleResumeFile(f);
                e.target.value = "";
              }}
            />
          </div>
        )}

        {step === "preferences" && (
          <div className="onboard-body">
            <h1 className="onboard-title serif">Job preferences</h1>
            <div className="auth-form">
              <label className="auth-field">
                <span className="auth-label">Target roles</span>
                <TagAutocomplete
                  value={profile.roles}
                  onChange={(roles) => setProfile({ ...profile, roles })}
                  options={JOB_ROLES}
                  browse={{ groups: JOB_ROLE_GROUPS, popular: POPULAR_JOB_ROLES }}
                  separator=", "
                  placeholder="e.g. Backend Engineer, Platform Engineer"
                  required
                  hint={`${JOB_ROLES.length}+ roles — type to search or pick from the list`}
                />
              </label>
              <label className="auth-field">
                <span className="auth-label">Locations</span>
                <LocationPreferenceSelector
                  id="onboarding-locations"
                  value={profile.locations}
                  onChange={(locations) => setProfile({ ...profile, locations })}
                />
              </label>
              <label className="auth-field">
                <span className="auth-label">Exclude companies</span>
                <TagAutocomplete
                  value={rules.blockedCompanies}
                  onChange={(blockedCompanies) => setRules({ ...rules, blockedCompanies })}
                  options={TECH_COMPANIES}
                  separator=", "
                  placeholder="Optional — companies Aviram should never surface or apply to"
                  allowCustom
                  hint="You can add more later in Settings"
                />
              </label>
              <label className="auth-field">
                <span className="auth-label">Salary floor</span>
                <input className="auth-input" required value={profile.salaryFloor} onChange={(e) => setProfile({ ...profile, salaryFloor: e.target.value })} />
              </label>
            </div>
          </div>
        )}

        {step === "rules" && (
          <div className="onboard-body">
            <h1 className="onboard-title serif">Auto-apply rules</h1>
            <p className="onboard-lede">Aviram only applies inside limits you set. Nothing leaves without matching these.</p>
            <div className="auth-form">
              <label className="auth-field">
                <span className="auth-label">Minimum IPS to apply</span>
                <input className="auth-input" type="number" min={50} max={99} required value={rules.ipsThreshold} onChange={(e) => setRules({ ...rules, ipsThreshold: e.target.value })} />
              </label>
              <label className="auth-field">
                <span className="auth-label">Daily application limit</span>
                <input className="auth-input" type="number" min={1} max={50} required value={rules.dailyLimit} onChange={(e) => setRules({ ...rules, dailyLimit: e.target.value })} />
              </label>
              <p className="onboard-lede" style={{ marginTop: -8, marginBottom: 0 }}>
                {rules.blockedCompanies
                  ? <>Excluding: <b>{rules.blockedCompanies}</b> — set in the previous step, editable anytime in Settings.</>
                  : "No excluded companies set — you can add some in the previous step or later in Settings."}
              </p>
              <label className="auth-field">
                <span className="auth-label">Quality score minimum</span>
                <input className="auth-input" required value={rules.qualityMinimum} onChange={(e) => setRules({ ...rules, qualityMinimum: e.target.value })} />
              </label>
            </div>
          </div>
        )}

        {step === "connections" && (
          <div className="onboard-body">
            <h1 className="onboard-title serif">Unlock referral intelligence</h1>
            <p className="onboard-lede">
              Aviram finds referral paths — LinkedIn connections, alumni, GitHub collaborators — at every company it applies to. Import your network now to activate this immediately. You can always do this later in Settings.
            </p>
            <div className="auth-form" style={{ gap: 24 }}>
              {/* ── LinkedIn connections ── */}
              <div className="conn-block">
                <div className="conn-head">
                  <span className="conn-label">LinkedIn connections</span>
                  {linkedinImported && <span className="conn-badge">✓ Imported</span>}
                </div>
                <p className="conn-desc">
                  Export your connections from LinkedIn: <b>Settings → Data privacy → Get a copy of your data → Connections</b>. Upload the CSV below.
                </p>
                <button
                  type="button"
                  className={"btn btn-quiet btn-sm" + (linkedinImported ? " btn-done" : "")}
                  onClick={() => linkedinFileRef.current?.click()}
                  disabled={linkedinBusy}
                  style={{ marginTop: 8 }}
                >
                  {linkedinBusy ? "Importing…" : linkedinImported ? "Re-import CSV" : "Upload LinkedIn CSV"}
                </button>
                <input
                  ref={linkedinFileRef}
                  type="file"
                  accept=".csv"
                  hidden
                  onChange={(e) => { void handleLinkedInFile(e); }}
                />
              </div>

              {/* ── GitHub ── */}
              <div className="conn-block">
                <div className="conn-head">
                  <span className="conn-label">GitHub network</span>
                  {githubDone && <span className="conn-badge">✓ Synced</span>}
                </div>
                <p className="conn-desc">
                  Aviram finds GitHub collaborators and contributors who work at target companies — a strong second-degree referral signal.
                </p>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <input
                    className="auth-input"
                    placeholder="your-github-username"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="btn btn-quiet btn-sm"
                    onClick={() => { void handleGithubSync(); }}
                    disabled={!githubUsername.trim() || githubBusy}
                  >
                    {githubBusy ? "Syncing…" : githubDone ? "Re-sync" : "Sync"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === "archetype" && (
          <div className="onboard-body onboard-reveal">
            <h1 className="onboard-title serif">Based on your resume</h1>
            <div className="archetype-card">
              <div className="arch-tag mono">mid_backend</div>
              <p className="arch-name serif">Mid-level Backend Engineer</p>
              <p className="arch-desc">
                Aviram will weight opportunities toward backend roles at Series A–C companies, remote-first teams, and stacks matching Python, distributed systems, and PostgreSQL. FAANG and enterprise roles will rank lower unless IPS is exceptional.
              </p>
            </div>
          </div>
        )}

        {step === "calibration" && (
          <div className="onboard-body onboard-reveal">
            <h1 className="onboard-title serif">Calibration period</h1>
            <p className="onboard-lede">
              Your first <b>25 applications</b> calibrate Aviram to your profile specifically — your response rates, resume variants, and timing patterns. Until then, IPS scores use the mid_backend baseline.
            </p>
            <div className="calib-preview">
              <div className="arch"><span className="tag">[mid_backend]</span><span className="frac">0 / 25</span></div>
              <div className="bar"><i style={{ width: "0%" }} /></div>
            </div>
            {finishError && (
              <p className="onboard-error" role="alert" style={{ color: "var(--rejected, #9A4A33)", marginTop: 14 }}>
                {finishError}
              </p>
            )}
          </div>
        )}

        <div className="onboard-foot">
          {stepIdx > 0 && (
            <button type="button" className="btn btn-quiet" onClick={() => setStep(STEPS[stepIdx - 1])}>Back</button>
          )}
          <span className="spacer" />
          <button
            type="button"
            className="btn btn-primary"
            onClick={next}
            disabled={
              !hydrated
              || finishing
              || (step === "profile" && (!profile.name.trim() || !profile.phone.trim() || !profile.linkedin.trim()))
              || (step === "resume" && !resumeName)
              || (step === "preferences" && (
                !parseTags(profile.roles).length
                || !parseTags(profile.locations).length
                || !profile.salaryFloor.trim()
              ))
            }
          >
            {step === "calibration" ? (finishing ? "Entering…" : finishError ? "Retry" : "Enter Aviram") : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
