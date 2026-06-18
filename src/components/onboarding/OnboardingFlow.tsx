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
  type StoredProfile,
} from "@/components/dashboard/session";
import {
  apiUpdateProfile,
  apiUpsertPreferences,
  apiUpdateAgentSettings,
  apiUploadResume,
} from "@/lib/api";

const STEPS = ["profile", "resume", "preferences", "rules", "archetype", "calibration"] as const;
type Step = (typeof STEPS)[number];

const STEP_LABEL: Record<Step, string> = {
  profile: "Profile",
  resume: "Resume",
  preferences: "Preferences",
  rules: "Auto-apply",
  archetype: "Archetype",
  calibration: "Calibration",
};

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

  useEffect(() => {
    const stored = getStoredProfile();
    if (stored) setProfile({ ...emptyProfile, ...stored });
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
    if (!isAuthed()) router.replace("/login");
    else if (isOnboardingComplete()) router.replace("/dashboard");
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
      try {
        await apiUpdateProfile({
          full_name: profile.name,
          phone: profile.phone || null,
          linkedin_url: profile.linkedin.startsWith("http")
            ? profile.linkedin
            : profile.linkedin ? `https://linkedin.com/in/${profile.linkedin.replace(/^in\//, "")}` : null,
        });
        await apiUpsertPreferences({
          desired_roles: profile.roles.split(/[,·]/).map((s) => s.trim()).filter(Boolean),
          preferred_locations: profile.locations.split(/[,·]/).map((s) => s.trim()).filter(Boolean),
          min_salary: parseInt(profile.salaryFloor.replace(/\D/g, ""), 10) || undefined,
          remote_preference: profile.locations.toLowerCase().includes("remote") ? "remote" : "any",
        });
        await apiUpdateAgentSettings({
          ips_threshold: parseFloat(rules.ipsThreshold) / 100,
          daily_cap: parseInt(rules.dailyLimit, 10),
          quality_min: rules.qualityMinimum.toLowerCase() === "high" ? 0.8 : 0.6,
          is_enabled: true,
        });
      } catch {
        // local onboarding still completes if API unavailable
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
                <input className="auth-input" required value={profile.roles} onChange={(e) => setProfile({ ...profile, roles: e.target.value })} />
              </label>
              <label className="auth-field">
                <span className="auth-label">Locations</span>
                <input className="auth-input" required value={profile.locations} onChange={(e) => setProfile({ ...profile, locations: e.target.value })} />
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
              <label className="auth-field">
                <span className="auth-label">Blocked companies</span>
                <input className="auth-input" placeholder="Comma-separated — optional" value={rules.blockedCompanies} onChange={(e) => setRules({ ...rules, blockedCompanies: e.target.value })} />
              </label>
              <label className="auth-field">
                <span className="auth-label">Quality score minimum</span>
                <input className="auth-input" required value={rules.qualityMinimum} onChange={(e) => setRules({ ...rules, qualityMinimum: e.target.value })} />
              </label>
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
              || (step === "profile" && (!profile.name.trim() || !profile.phone.trim() || !profile.linkedin.trim()))
              || (step === "resume" && !resumeName)
            }
          >
            {step === "calibration" ? "Enter Aviram" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
