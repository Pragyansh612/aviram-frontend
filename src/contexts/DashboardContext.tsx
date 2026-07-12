"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Opp } from "@/components/dashboard/DetailPanel";
import {
  OPPS,
  TIMELINE,
  APPS,
  BRIEF,
  USER,
} from "@/components/dashboard/data";
import {
  checkBackendHealth,
  getAccessToken,
  apiGetApplyQueue,
  apiGetAgentStatus,
  apiGetTimeline,
  apiListApplications,
  apiGetAnalyticsSummary,
  apiGetProfile,
  apiGetCalibration,
  apiPauseAgent,
  apiResumeAgent,
  apiApplyToJob,
  apiGetPersonalInsights,
  apiGetCareerRoi,
  apiGetPersonalModelSegments,
  apiRecordOpportunityInteraction,
  apiGetDashboardBrief,
  mapIpsJobToOpp,
  mapTimelineEntry,
  mapApplicationStatus,
  mapApplicationLabel,
  mapCalibration,
} from "@/lib/api";
import { touchLastSync } from "@/components/dashboard/session";
import type { TimelineEntry, ApplyQueueFilters } from "@/lib/api";

type TimelineEvent = Omit<ReturnType<typeof mapTimelineEntry>, "appId"> & {
  appId?: string;
  draftId?: string;
};
type TimelineGroup = { day: string; events: TimelineEvent[] };
// Extend the demo shape with live API fields that aren't in the demo data
type AppRow = (typeof APPS)[number] & { job_id?: string };

type DashboardState = {
  apiLive: boolean;
  loading: boolean;
  opportunities: Opp[];
  timeline: TimelineGroup[];
  applications: AppRow[];
  briefStats: typeof BRIEF;
  userMeta: typeof USER;
  running: boolean;
  refresh: () => Promise<void>;
  applyToJob: (jobId: string) => Promise<{ ok: boolean; message: string }>;
  setRunning: (running: boolean) => Promise<void>;
  fetchFilteredOpportunities: (filters: ApplyQueueFilters) => Promise<Opp[] | null>;
};

const DashboardContext = createContext<DashboardState | null>(null);

function groupTimelineByDay(
  events: TimelineEvent[],
): TimelineGroup[] {
  if (events.length === 0) return [];
  return [{ day: "Today", events }];
}

function mapApiApplication(
  row: Awaited<ReturnType<typeof apiListApplications>>[number],
  jobs: Opp[],
  timeline: TimelineEntry[],
): AppRow {
  const job = jobs.find((o) => o.id === row.job_id);
  const tl = timeline.find((t) => t.application_id === row.id);
  const status = mapApplicationStatus(row.status);
  return {
    id: row.id,
    job_id: row.job_id,   // preserve for accurate opp↔app linking in buildAppliedMap
    company: job?.company ?? tl?.company ?? "—",
    role: job?.role ?? tl?.job_title ?? "—",
    platform: row.platform,
    status,
    statusLabel: mapApplicationLabel(row.status),
    date: row.applied_at ? new Date(row.applied_at).toLocaleDateString() : "—",
    ips: row.match_score != null ? Math.round(row.match_score * 100) : (job?.ips ?? 0),
    variant: row.resume_version != null ? String.fromCharCode(64 + row.resume_version) : "A",
    coverLetter: "",
    events: [],
  };
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [apiLive, setApiLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState<Opp[]>(OPPS);
  const [timeline, setTimeline] = useState<TimelineGroup[]>(TIMELINE as TimelineGroup[]);
  const [applications, setApplications] = useState<AppRow[]>(APPS);
  const [briefStats, setBriefStats] = useState(BRIEF);
  const [userMeta, setUserMeta] = useState(USER);
  const [running, setRunningState] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const healthy = await checkBackendHealth();
    const authed = !!getAccessToken();
    const live = healthy && authed;
    setApiLive(live);

    if (!live) {
      setOpportunities(OPPS);
      setTimeline(TIMELINE as TimelineGroup[]);
      setApplications(APPS);
      setBriefStats(BRIEF);
      setUserMeta(USER);
      setRunningState(true);
      setLoading(false);
      return;
    }

    try {
      const [
        queue,
        agent,
        tl,
        apps,
        summary,
        profile,
        calibration,
        brief,
      ] = await Promise.all([
        apiGetApplyQueue(50).catch(() => null),
        apiGetAgentStatus().catch(() => null),
        apiGetTimeline(50).catch(() => []),
        apiListApplications(50).catch(() => []),
        apiGetAnalyticsSummary().catch(() => null),
        apiGetProfile().catch(() => null),
        apiGetCalibration().catch(() => null),
        apiGetDashboardBrief().catch(() => null),
      ]);

      const opps = queue?.jobs ? queue.jobs.map(mapIpsJobToOpp) : [];
      setOpportunities(opps);

      if (tl.length > 0) {
        setTimeline(groupTimelineByDay(tl.map(mapTimelineEntry)));
      } else {
        setTimeline([]);
      }

      setApplications(apps.map((a) => mapApiApplication(a, opps, tl)));

      // /dashboard/brief gives real since-last-login deltas; fall back to
      // lifetime totals from /analytics/summary + the apply queue only if
      // /brief is unavailable (e.g. migration 041 not yet applied).
      if (brief) {
        setBriefStats((prev) => ({
          ...prev,
          discovered: brief.opportunities_discovered,
          shortlisted: brief.shortlisted,
          submitted: brief.applications_submitted,
          referral: brief.referrals_surfaced,
          interview: brief.interviews_scheduled,
        }));
      } else if (summary || queue) {
        setBriefStats((prev) => ({
          ...prev,
          submitted: summary?.total_applications ?? summary?.submitted ?? prev.submitted,
          discovered: queue?.total_candidates ?? prev.discovered,
          shortlisted: queue?.returned ?? prev.shortlisted,
          interview: summary?.interviews ?? prev.interview,
          referral: prev.referral,
        }));
      }

      const calMapped = mapCalibration(calibration);
      if (profile || calibration) {
        setUserMeta((prev) => ({
          ...prev,
          name: profile?.full_name?.split(" ")[0] ?? prev.name,
          first: profile?.full_name?.split(" ")[0] ?? prev.first,
          email: profile?.email ?? prev.email,
          phone: profile?.phone ?? prev.phone,
          linkedin: profile?.linkedin_url ?? prev.linkedin,
          calibration: calMapped.count,
          calibrationMax: calMapped.target,
          archetype: calMapped.archetype,
          archetypeName: calMapped.archetypeLabel ?? prev.archetypeName,
        }));
      }

      if (agent) {
        setRunningState(agent.is_enabled && !agent.is_paused);
      }
      touchLastSync();
    } catch {
      setApiLive(false);
      setOpportunities(OPPS);
      setTimeline(TIMELINE as TimelineGroup[]);
      setApplications(APPS);
      setBriefStats(BRIEF);
      setUserMeta(USER);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    // Poll every 30 seconds so Command Center and Timeline stay live
    const poll = setInterval(() => {
      refresh();
    }, 30_000);
    return () => clearInterval(poll);
  }, [refresh]);

  const applyToJob = useCallback(async (jobId: string) => {
    if (!apiLive) {
      return { ok: false, message: "Backend not connected — using demo mode." };
    }
    try {
      const res = await apiApplyToJob(jobId);
      // Backend returns HTTP 200 with success:false on non-fatal failures
      // (unsupported platform, rate limit, quality review, etc.).
      // We must surface these as failures, not silently show "queued".
      const ok = res.success ?? true; // fall back to true only if field absent
      if (ok) {
        // Record in opportunity memory so the user's history stays accurate
        try { await apiRecordOpportunityInteraction(jobId, "queued"); } catch { /* non-blocking */ }
      }
      await refresh();
      return {
        ok,
        message: res.message || (ok ? "Application queued." : "Could not queue application."),
        status: (res as Record<string, unknown>).status as string | undefined,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Apply failed";
      return { ok: false, message: msg };
    }
  }, [apiLive, refresh]);

  const fetchFilteredOpportunities = useCallback(async (filters: ApplyQueueFilters) => {
    if (!apiLive) return null;
    try {
      const queue = await apiGetApplyQueue(50, filters);
      return queue.jobs.map(mapIpsJobToOpp);
    } catch {
      return null;
    }
  }, [apiLive]);

  const setRunning = useCallback(async (next: boolean) => {
    if (!apiLive) {
      setRunningState(next);
      return;
    }
    try {
      if (next) await apiResumeAgent();
      else await apiPauseAgent();
      setRunningState(next);
    } catch {
      setRunningState(next);
    }
  }, [apiLive]);

  const value = useMemo(() => ({
    apiLive,
    loading,
    opportunities,
    timeline,
    applications,
    briefStats,
    userMeta,
    running,
    refresh,
    applyToJob,
    setRunning,
    fetchFilteredOpportunities,
  }), [
    apiLive, loading, opportunities, timeline, applications,
    briefStats, userMeta, running, refresh, applyToJob, setRunning,
    fetchFilteredOpportunities,
  ]);

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardState {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    return {
      apiLive: false,
      loading: false,
      opportunities: OPPS,
      timeline: TIMELINE as TimelineGroup[],
      applications: APPS,
      briefStats: BRIEF,
      userMeta: USER,
      running: true,
      refresh: async () => {},
      applyToJob: async () => ({ ok: false, message: "Not connected" }),
      setRunning: async (r) => { void r; },
      fetchFilteredOpportunities: async () => null,
    };
  }
  return ctx;
}

export async function fetchCareerIntel() {
  const healthy = await checkBackendHealth();
  if (!healthy) return null;
  try {
    const [insights, roi, segments] = await Promise.all([
      apiGetPersonalInsights(),
      apiGetCareerRoi(8),
      apiGetPersonalModelSegments().catch(() => null),
    ]);
    return { insights, roi, segments };
  } catch {
    return null;
  }
}
