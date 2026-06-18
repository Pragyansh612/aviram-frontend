"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import { markAuthed, saveStoredProfile, getStoredProfile } from "@/components/dashboard/session";
import { apiRegister, apiLogin, ApiError } from "@/lib/api";

const PASSWORD_HINT = "At least 8 characters, one uppercase letter, and one digit.";

export default function SignupPageClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError(PASSWORD_HINT);
      return;
    }
    setSubmitting(true);
    try {
      const nameFromEmail = email.split("@")[0]?.replace(/[._]/g, " ") || "User";
      await apiRegister(email, password, nameFromEmail);
      await apiLogin(email, password);
      markAuthed();
      const existing = getStoredProfile();
      saveStoredProfile({
        name: "",
        phone: "",
        linkedin: "",
        roles: "",
        locations: "",
        salaryFloor: "",
        ...(existing ?? {}),
        email,
      });
      router.push("/onboarding");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      footer={
        <>
          Already have an account? <Link href="/login">Sign in</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && (
          <p className="auth-error" role="alert">{error}</p>
        )}
        <label className="auth-field">
          <span className="auth-label">Email</span>
          <input
            className="auth-input"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="auth-field">
          <span className="auth-label">Password</span>
          <input
            className="auth-input"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            title={PASSWORD_HINT}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span className="auth-hint">{PASSWORD_HINT}</span>
        </label>
        <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
          {submitting ? "Creating account…" : "Continue"}
        </button>
      </form>
    </AuthShell>
  );
}
