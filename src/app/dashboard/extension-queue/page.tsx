"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { requestNavigatePage } from "@/components/dashboard/session";

// The dashboard is a single client-rendered SPA (see src/app/dashboard/page.tsx
// + components/dashboard/App.tsx) — every section is a PageId switched
// internally, not a separate Next.js route. This route exists purely so
// /dashboard/extension-queue is a real, bookmarkable/shareable URL (e.g. from
// the Command Center action item or a direct link): it stashes the requested
// page via the same requestNavigatePage/consumeNavigatePage mechanism the SPA
// already uses for other deep links (prep, outreach), then hands off to the
// dashboard shell, which picks it up on mount.
export default function ExtensionQueueRoute() {
  const router = useRouter();

  useEffect(() => {
    requestNavigatePage("extension-queue");
    router.replace("/dashboard");
  }, [router]);

  return null;
}
