"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { APPS, OPPS } from "@/components/dashboard/data";
import { IPSChip, StatusPill, PageHead, EmptyState } from "@/components/dashboard/shared";
import { Icon } from "@/components/dashboard/icons";
import {
  consumeOpenApplication,
  getSessionApps,
  getAppOutcomeOverrides,
  setAppOutcomeOverride,
} from "@/components/dashboard/session";
import type { Opp } from "@/components/dashboard/DetailPanel";

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

function findOppForApp(app: AppRow): Opp | undefined {
  return OPPS.find((o) => o.company === app.company && o.role === app.role)
    ?? OPPS.find((o) => o.company === app.company);
}

function mergeApps(): AppRow[] {
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
  const base = APPS.map((a) => {
    const o = overrides[a.id];
    return o ? { ...a, status: o.status, statusLabel: o.statusLabel } : a;
  });
  const sessionWithOverrides = session.map((a) => {
    const o = overrides[a.id];
    return o ? { ...a, status: o.status, statusLabel: o.statusLabel } : a;
  });
  return [...sessionWithOverrides, ...base];
}

export default function Applications({ openOpp }: { openOpp?: (o: Opp) => void }) {
  const [tab, setTab] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [outcomeFor, setOutcomeFor] = useState<string | null>(null);
  const [outcomeSaved, setOutcomeSaved] = useState<Record<string, string>>({});
  const [apps, setApps] = useState<AppRow[]>(() => mergeApps());

  useEffect(() => {
    const target = consumeOpenApplication();
    if (target) {
      setExpanded(target);
      setTab("all");
    }
    setApps(mergeApps());
  }, []);

  const match = (a: AppRow) => {
    switch (tab) {
      case "applied": return a.status === "applied";
      case "response": return a.status === "response";
      case "interview": return a.status === "interview";
      case "closed": return ["rejected", "offer", "withdrawn"].includes(a.status);
      default: return true;
    }
  };

  const list = useMemo(() => apps.filter(match), [apps, tab]);
  const counts = useMemo(() => ({
    all: apps.length,
    applied: apps.filter((a) => a.status === "applied").length,
    response: apps.filter((a) => a.status === "response").length,
    interview: apps.filter((a) => a.status === "interview").length,
    closed: apps.filter((a) => ["rejected", "offer", "withdrawn"].includes(a.status)).length,
  }), [apps]);

  const toggle = (id: string) => {
    setExpanded(expanded === id ? null : id);
    setOutcomeFor(null);
  };

  const handleOutcome = (appId: string, label: typeof OUTCOME_OPTIONS[number]) => {
    const mapped = OUTCOME_MAP[label];
    setAppOutcomeOverride(appId, { ...mapped, label });
    setApps(mergeApps());
    setOutcomeSaved((s) => ({ ...s, [appId]: label }));
    setOutcomeFor(null);
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
          const linkedOpp = findOppForApp(a);
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
              {isOpen && (
                <div className="apps-expand">
                  <div className="ae-col">
                    <div className="ae-label">Cover letter generated</div>
                    <p className="ae-cover">{a.coverLetter}</p>
                  </div>
                  <div className="ae-col">
                    <div className="ae-label">Resume version</div>
                    <p className="ae-meta">Variant {a.variant} · IPS {a.ips} at submission · {a.platform}</p>
                  </div>
                  <div className="ae-col">
                    <div className="ae-label">Application timeline</div>
                    <ul className="ae-events">
                      {a.events.map((ev, i) => (
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
              )}
            </div>
          );
        })}
        </>
        )}
      </div>
    </div>
  );
}
