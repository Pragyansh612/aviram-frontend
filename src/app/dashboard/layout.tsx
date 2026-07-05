"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthed, isOnboardingComplete, syncOnboardingStateFromBackend } from "@/components/dashboard/session";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthed()) {
      router.replace("/login");
      return;
    }
    // Re-verify against the backend's onboarding_completed flag on every
    // dashboard load. The middleware's cookie gate is a fast path only —
    // this call is the real, server-checked source of truth, so a browser
    // that never ran onboarding locally still gets a correct decision.
    let cancelled = false;
    (async () => {
      const backendOnboarded = await syncOnboardingStateFromBackend();
      if (cancelled) return;
      const onboarded = backendOnboarded ?? isOnboardingComplete();
      if (!onboarded) router.replace("/onboarding");
    })();
    return () => { cancelled = true; };
  }, [router]);

  return <>{children}</>;
}