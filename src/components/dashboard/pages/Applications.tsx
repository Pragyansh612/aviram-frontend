"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { APPS, OPPS } from "@/components/dashboard/data";
import { IPSChip, StatusPill, PageHead, EmptyState } from "@/components/dashboard/shared";
import { Icon } from "@/components/dashboard/icons";
import { useDashboard } from "@/contexts/DashboardContext";
import { apiGetApplication, apiUpdateApplicationOutcome } from "@/lib/api";
import type { ApplicationDetail } from "@/lib/api/types";
import {
  getSessionApps,
  getAppOutcomeOverrides,
  setAppOutcomeOverride,
} from "@/components/dashboard/session";
import type { Opp } from "@/components/dashboard/DetailPanel";

function detailToEvents(d: ApplicationDetail): { time: string; text: string }[] {
  const events: { time: string; text: string }[] = [];
  const fmt = (iso: string) => new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  if (d.applied_at) events.push({ time: fmt(d.applied_at), text: `Application submitted · ${d.platform}` });
  if (d.interview_at) events.push({ time: fmt(d.interview_at), text: "Interview scheduled" });
  if (d.outcome_at && d.outcome) events.push({ time: fmt(d.outcome_at), text: `Outcome recorded · ${d.outcome}` });
  if (!d.applied_at && d.created_at) events.push({ time: fmt(d.created_at), text: `Application ${d.status}` });
  return events;
}

function detailCoverLetter(d: ApplicationDetail): string | null {
  const snap = d.form_snapshot as Record<string, unknown> | null;
  if (!snap) return null;
  const key = Object.keys(snap).find((k) => k.toLowerCase().replace(/[^a-z]/g, "").includes("coverletter"));
  const value = key ? snap[key] : undefined;
  return typeof value === "string" && value.trim() ? value : null;
}

const APP_TABS = [
  { id: "all", label: "All" }, { id: "applied", label: "In Progress" },
  { id: "response", label: "Responses" }, { id: "interview", label: "Interviews" },
  { id: "closed", label: "Closed" },
];

const OUTCOME_OPTIONS = ["Interview scheduled", "Offer received", "Rejected", "Withdrawn"] as const;

const OUTCOME_MAP: Record<typeof OUTCOME_OPTIONS[number], { status: string; statusLabel: string }> = {
  "Interview scheduled": { status: "interview", statusLabel: "Interview Scheduled" },
  "Offer received": { status: "offer", statusLabel: "Offer Received" },
  "Rejected": { status: "rejected", statusLabel: "Rejected" },
  "Withdrawn": { status: "withdrawn", statusLabel: "Withdrawn" },
};

type AppRow = (typeof APPS)[number];

const OUTCOME_API: Record<typeof OUTCOME_OPTIONS[number], string> = {
  "Interview scheduled": "interview",
  "Offer received": "offer",
  "Rejected": "rejected",
  "Withdrawn": "withdrawn",
};

function findOppForApp(app: AppRow & { job_id?: string }, opps: Opp[]): Opp | undefined {
  return (app.job_id ? opps.find((o) => o.id === app.job_id) : undefined)
    ?? opps.find((o) => o.company === app.company && o.role === app.role)
    ?? opps.find((o) => o.company === app.company);
}

function mergeApps(baseApps: AppRow[]): AppRow[] {
  const overrides = getAppOutcomeOverrides();
  const session = getSessionApps().map((s) => ({
    id: s.id,
    company: s.company,
    role: s.role,
    platform: s.platform,
    status: s.status,
    statusLabel: s.statusLabel,
    date: s.date,
    ips: s.ips,
    variant: s.variant,
    coverLetter: s.coverLetter,
    events: s.events,
  }));
  const base = baseApps.map((a) => {
    const o = overrides[a.id];
    return o ? { ...a, status: o.status, statusLabel: o.statusLabel } : a;
  });
  const sessionWithOverrides = session.map((a) => {
    const o = overrides[a.id];
    return o ? { ...a, status: o.status, statusLabel: o.statusLabel } : a;
  });
  return [...sessionWithOverrides, ...base];
}

export default function Applications({ openOpp, expandAppId }: { openOpp?: (o: Opp) => void; expandAppId?: string | null }) {
  const { applications: apiApps, opportunities, apiLive, refresh } = useDashboard();
  const sourceApps = apiLive ? apiApps : (apiApps.length ? apiApps : APPS);
  const sourceOpps = apiLive ? opportunities : (opportunities.length ? opportunities : OPPS);
  const [tab, setTab] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(expandAppId ?? null);
  const [outcomeFor, setOutcomeFor] = useState<string | null>(null);
  const [outcomeSaved, setOutcomeSaved] = useState<Record<string, string>>({});
  const [apps, setApps] = useState<AppRow[]>(() => (apiLive ? sourceApps : mergeApps(sourceApps)));
  const [details, setDetails] = useState<Record<string, ApplicationDetail>>({});
  const [detailLoading, setDetailLoading] = useState<string | null>(null);

  useEffect(() => {
    if (expandAppId) {
      setExpanded(expandAppId);
      setTab("all");
    }
    setApps(apiLive ? sourceApps : mergeApps(sourceApps));
  }, [expandAppId, sourceApps, apiLive]);

  const IN_PROGRESS_STATUSES = new Set(["applied", "pending", "failed", "manual_required", "quality_review", "referral_pending"]);

  const match = (a: AppRow) => {
    switch (tab) {
      case "applied": return IN_PROGRESS_STATUSES.has(a.status);
      case "response": return a.status === "response";
      case "interview": return a.status === "interview";
      case "closed": return ["rejected", "offer", "withdrawn"].includes(a.status);
      default: return true;
    }
  };

  const list = useMemo(() => apps.filter(match), [apps, tab, IN_PROGRESS_STATUSES]);
  const counts = useMemo(() => ({
    all: apps.length,
    applied: apps.filter((a) => IN_PROGRESS_STATUSES.has(a.status)).length,
    response: apps.filter((a) => a.status === "response").length,
    interview: apps.filter((a) => a.status === "interview").length,
    closed: apps.filter((a) => ["rejected", "offer", "withdrawn"].includes(a.status)).length,
  }), [apps]);

  const toggle = (id: string) => {
    const opening = expanded !== id;
    setExpanded(opening ? id : null);
    setOutcomeFor(null);
    if (opening && apiLive && !details[id]) {
      setDetailLoading(id);
      apiGetApplication(id)
        .then((d) => setDetails((prev) => ({ ...prev, [id]: d })))
        .catch(() => {})
        .finally(() => setDetailLoading((cur) => (cur === id ? null : cur)));
    }
  };

  const handleOutcome = async (appId: string, label: typeof OUTCOME_OPTIONS[number]) => {
    const mapped = OUTCOME_MAP[label];
    setAppOutcomeOverride(appId, { ...mapped, label });
    setApps(mergeApps(sourceApps));
    setOutcomeSaved((s) => ({ ...s, [appId]: label }));
    setOutcomeFor(null);
    if (apiLive) {
      try {
        await apiUpdateApplicationOutcome(appId, OUTCOME_API[label]);
        await refresh();
      } catch { /* local override kept */ }
    }
  };

  const emptyMessage = apps.length === 0
    ? "No applications yet."
    : "No applications match this filter.";

  return (
    <div className="page">
      <PageHead
        eyebrow={<><span style={{ width: 13, height: 13, display: "inline-block" }}><Icon name="applications" /></span> Applications</>}
        title="The table view, for when you want the receipts."
        sub="Every application Aviram has submitted on your behalf, with the resume variant and score at the moment it went out."
      />
      <div className="filterbar">
        {APP_TABS.map((t) => (
          <button key={t.id} type="button" className={"fchip" + (tab === t.id ? " active" : "")} onClick={() => setTab(t.id)}>
            {t.label}<span className="cnt">{counts[t.id as keyof typeof counts]}</span>
          </button>
        ))}
      </div>
      <div className="apps-table">
        {list.length === 0 ? (
          <EmptyState>{emptyMessage}</EmptyState>
        ) : (
        <>
        <div className="apps-colhead">
          <span>Company / Role</span><span>Status</span>
          <span className="h-variant">Resume</span><span className="h-ips">IPS</span><span>Applied</span>
        </div>
        {list.map((a) => {
          const isOpen = expanded === a.id;
          const withdrawn = a.status === "withdrawn";
          const linkedOpp = findOppForApp(a, sourceOpps);
          return (
            <div key={a.id} className={"apps-block" + (isOpen ? " open" : "")}>
              <div
                className={"apps-row" + (withdrawn ? " withdrawn" : "") + (isOpen ? " sel" : "")}
                onClick={() => toggle(a.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(a.id); } }}
              >
                <div>
                  <div className="ar-co">{a.company}</div>
                  <div className="ar-role">{a.role} · {a.platform}</div>
                </div>
                <StatusPill status={a.status} label={a.statusLabel} />
                <span className="ar-variant">Variant {a.variant}</span>
                <span className="ar-ips"><IPSChip score={a.ips} /></span>
                <span className="ar-date">{a.date}</span>
              </div>
              {isOpen && (() => {
                const detail = details[a.id];
                const loadingDetail = apiLive && detailLoading === a.id;
                const cover = apiLive
                  ? (detail ? detailCoverLetter(detail) : null)
                  : a.coverLetter;
                const events = apiLive
                  ? (detail ? detailToEvents(detail) : [])
                  : a.events;
                return (
                <div className="apps-expand">
                  <div className="ae-col">
                    <div className="ae-label">Cover letter generated</div>
                    {loadingDetail ? (
                      <p className="ae-cover">Loading…</p>
                    ) : cover ? (
                      <p className="ae-cover">{cover}</p>
                    ) : (
                      <p className="ae-cover" style={{ color: "var(--ink-4)" }}>
                        {apiLive ? "No cover letter recorded for this application." : ""}
                      </p>
                    )}
                    {apiLive && detail?.failure_reason && (
                      <p className="ae-cover" style={{ color: "var(--clay)", marginTop: 8 }}>
                        {detail.failure_reason}
                      </p>
                    )}
                  </div>
                  <div className="ae-col">
                    <div className="ae-label">Resume version</div>
                    <p className="ae-meta">Variant {a.variant} · IPS {a.ips} at submission · {a.platform}</p>
                    {apiLive && detail?.quality_gate_score != null && (
                      <p className="ae-meta">Quality gate: {Math.round(detail.quality_gate_score * 100)}% · {detail.quality_gate_status}</p>
                    )}
                  </div>
                  <div className="ae-col">
                    <div className="ae-label">Application timeline</div>
                    <ul className="ae-events">
                      {loadingDetail ? (
                        <li>Loading…</li>
                      ) : events.length === 0 ? (
                        <li>No events recorded.</li>
                      ) : events.map((ev, i) => (
                        <li key={i}><span className="ae-time">{ev.time}</span>{ev.text}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="ae-act">
                    {outcomeSaved[a.id] ? (
                      <span className="ae-saved">Outcome recorded · {outcomeSaved[a.id]}</span>
                    ) : outcomeFor === a.id ? (
                      <div className="ae-outcome-pick">
                        {OUTCOME_OPTIONS.map((o) => (
                          <button
                            key={o}
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleOutcome(a.id, o)}
                          >
                            {o}
                          </button>
                        ))}
                        <button type="button" className="btn btn-quiet btn-sm" onClick={() => setOutcomeFor(null)}>Cancel</button>
                      </div>
                    ) : (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOutcomeFor(a.id)}>Update outcome</button>
                    )}
                    <Link className="btn btn-quiet btn-sm" href={`/applications/${a.id}`} target="_blank" rel="noopener noreferrer">
                      Open full page →
                    </Link>
                    {linkedOpp && openOpp && (
                      <button
                        type="button"
                        className="btn btn-quiet btn-sm"
                        onClick={() => openOpp(linkedOpp)}
                      >
                        View opportunity →
                      </button>
                    )}
                  </div>
                </div>
                );
              })()}
            </div>
          );
        })}
        </>
        )}
      </div>
    </div>
  );
}
