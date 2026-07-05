"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import {
  beginLoginSession,
  isAuthed,
  isOnboardingComplete,
  markAuthed,
  syncOnboardingStateFromBackend,
} from "@/components/dashboard/session";
import { apiLogin, ApiError } from "@/lib/api";

export default function LoginPageClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthed()) return;
    let cancelled = false;
    (async () => {
      const backendOnboarded = await syncOnboardingStateFromBackend();
      if (cancelled) return;
      const onboarded = backendOnboarded ?? isOnboardingComplete();
      router.replace(onboarded ? "/dashboard" : "/onboarding");
    })();
    return () => { cancelled = true; };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await apiLogin(email, password);
      markAuthed();
      beginLoginSession();
      // Ask the backend — not just this browser's localStorage — whether
      // onboarding is really done. Fixes the bug where a new browser or
      // cleared storage re-ran onboarding for an already-onboarded user.
      const backendOnboarded = await syncOnboardingStateFromBackend();
      const onboarded = backendOnboarded ?? isOnboardingComplete();
      router.push(onboarded ? "/dashboard" : "/onboarding");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sign in failed. Check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Sign in"
      footer={
        <>
          No account? <Link href="/signup">Create one</Link>
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
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
