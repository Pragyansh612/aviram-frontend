"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  beginFirstDashboardSession,
  getStoredProfile,
  isAuthed,
  isOnboardingComplete,
  saveStoredProfile,
  type StoredProfile,
} from "@/components/dashboard/session";

const STEPS = ["profile", "resume", "preferences", "archetype", "calibration"] as const;
type Step = (typeof STEPS)[number];

const STEP_LABEL: Record<Step, string> = {
  profile: "Profile",
  resume: "Resume",
  preferences: "Preferences",
  archetype: "Archetype",
  calibration: "Calibration",
};

const emptyProfile: StoredProfile = {
  name: "",
  phone: "",
  linkedin: "",
  roles: "Backend Engineer, Distributed Systems",
  locations: "Remote · Bengaluru",
  salaryFloor: "₹38 LPA",
};

export default function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("profile");
  const [profile, setProfile] = useState<StoredProfile>(() => getStoredProfile() ?? emptyProfile);
  const [resumeName, setResumeName] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthed()) router.replace("/signup");
    else if (isOnboardingComplete()) router.replace("/dashboard");
  }, [router]);

  const stepIdx = STEPS.indexOf(step);
  const progress = ((stepIdx + 1) / STEPS.length) * 100;

  const next = () => {
    if (step === "calibration") {
      saveStoredProfile(profile);
      beginFirstDashboardSession();
      router.push("/dashboard");
      return;
    }
    setStep(STEPS[stepIdx + 1]);
  };

  const handleResumePick = () => {
    setResumeName("pragyansh_resume.pdf");
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
                  <span className="resume-drop-meta">Parsed · 5 yrs experience · backend</span>
                </>
              ) : (
                <>
                  <span className="resume-drop-cta">Drop PDF or click to upload</span>
                  <span className="resume-drop-meta">PDF, DOCX · max 5 MB</span>
                </>
              )}
            </button>
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
              (step === "profile" && (!profile.name.trim() || !profile.phone.trim() || !profile.linkedin.trim()))
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
