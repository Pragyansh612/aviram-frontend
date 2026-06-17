"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import { markAuthed, saveStoredProfile, getStoredProfile } from "@/components/dashboard/session";

export default function SignupPageClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    markAuthed();
    // Persist email so Settings Profile can show the real address after onboarding.
    const existing = getStoredProfile();
    saveStoredProfile({ name: "", email, phone: "", linkedin: "", roles: "", locations: "", salaryFloor: "", ...existing });
    router.push("/onboarding");
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button type="submit" className="btn btn-primary auth-submit">Continue</button>
      </form>
    </AuthShell>
  );
}
