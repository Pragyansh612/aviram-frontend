"use client";
import { useState, useEffect, useCallback } from "react";
import { OPPS, ACTIVITY_RANGES } from "@/components/dashboard/data";
import { IPSChip, Urgent, EmptyState } from "@/components/dashboard/shared";
import { getLastSyncAgo, getNetworkImported } from "@/components/dashboard/session";
import { useDashboard } from "@/contexts/DashboardContext";
import { Icon } from "@/components/dashboard/icons";
import { requestOpenPrepBrief, requestOpenApplication, requestHighlightOutreachDraft } from "@/components/dashboard/session";
import { apiGetDashboardActions } from "@/lib/api";
import type { PageId } from "@/components/dashboard/shared";

type RangeKey = "24h" | "7d" | "30d";

const arrIcon: React.CSSProperties = { width: 14, height: 14, display: "inline-block" };

type ActionType = "interview" | "referral" | "manual" | "insight";

const CONNECT_NETWORK_ACTION: {
  type: ActionType;
  kicker: string;
  title: string;
  meta: string;
  btn: string;
  to: PageId;
  primary: boolean;
} = {
  type: "referral",
  kicker: "Unlock referral paths",
  title: "Import LinkedIn connections",
  meta: "Aviram will match your network against companies you're targeting",
  btn: "Connect",
  to: "settings",
  primary: false,
};

const ACTION_ITEMS: {
  type: ActionType;
  kicker: string;
  title: string;
  meta: string;
  btn: string;
  to: PageId;
  primary: boolean;
}[] = [
  {
    type: "interview",
    kicker: "Interview in 47 hours",
    title: "Razorpay · SDE-2",
    meta: "Thursday 9:00 AM · prep brief ready",
    btn: "Open Brief",
    to: "prep",
    primary: true,
  },
  {
    type: "referral",
    kicker: "Referral draft ready",
    title: "Stripe · Backend Engineer",
    meta: "2nd-degree via Arjun Mehta · awaiting your send",
    btn: "Review Draft",
    to: "outreach",
    primary: false,
  },
  {
    type: "manual",
    kicker: "Recruiter replied",
    title: "Vercel · Platform Engineer",
    meta: "Screening call requested · suggest 3 times",
    btn: "Respond",
    to: "applications",
    primary: false,
  },
  {
    type: "insight",
    kicker: "Pattern detected",
    title: "Series A fintech · 22% interview rate",
    meta: "Aviram is weighting your queue toward this segment",
    btn: "View intel",
    to: "intelligence",
    primary: false,
  },
];

function deriveLiveActions(
  apps: { status: string; statusLabel: string; company: string; role: string; id: string }[],
): typeof ACTION_ITEMS {
  const out: typeof ACTION_ITEMS = [];
  for (const app of apps) {
    if (app.status === "interview") {
      out.push({
        type: "interview",
        kicker: "Interview upcoming",
        title: `${app.company} · ${app.role}`,
        meta: "Prep brief ready",
        btn: "Open Brief",
        to: "prep",
        primary: true,
      });
    } else if (app.status === "response") {
      out.push({
        type: "manual",
        kicker: "Recruiter replied",
        title: `${app.company} · ${app.role}`,
        meta: "Response received — your move",
        btn: "Respond",
        to: "applications",
        primary: false,
      });
    } else if (app.status === "offer") {
      out.push({
        type: "insight",
        kicker: "Offer received",
        title: `${app.company} · ${app.role}`,
        meta: "Review terms and next steps",
        btn: "View",
        to: "applications",
        primary: true,
      });
    } else if (app.status === "failed") {
      out.push({
        type: "manual",
        kicker: "Automation failed",
        title: `${app.company} · ${app.role}`,
        meta: "Agent couldn't submit — manual apply or retry needed",
        btn: "Review",
        to: "applications",
        primary: false,
      });
    } else if (app.status === "manual_required") {
      out.push({
        type: "manual",
        kicker: "Manual step required",
        title: `${app.company} · ${app.role}`,
        meta: "This application needs your input to proceed",
        btn: "Complete",
        to: "applications",
        primary: true,
      });
    } else if (app.status === "quality_review") {
      out.push({
        type: "manual",
        kicker: "Quality gate held",
        title: `${app.company} · ${app.role}`,
        meta: "Resume quality below threshold — review before sending",
        btn: "Review",
        to: "applications",
        primary: false,
      });
    } else if (app.status === "referral_pending") {
      out.push({
        type: "referral",
        kicker: "Referral path found",
        title: `${app.company} · ${app.role}`,
        meta: "Activate referral before cold applying for best results",
        btn: "See Referral",
        to: "outreach",
        primary: false,
      });
    }
    if (out.length >= 7) break;
  }
  return out;
}

export default function CommandCenter({ goTo, openOpp }: {
  goTo: (p: PageId) => void;
  openOpp: (o: typeof OPPS[0]) => void;
}) {
  const { opportunities, briefStats, apiLive, applications } = useDashboard();
  const [range, setRange] = useState<RangeKey>("24h");
  const [dropOpen, setDropOpen] = useState(false);
  const [updatedAgo, setUpdatedAgo] = useState("just now");
  const [networkImported, setNetworkImported] = useState(true);
  const [backendActions, setBackendActions] = useState<typeof ACTION_ITEMS>([]);

  useEffect(() => {
    setUpdatedAgo(getLastSyncAgo());
    const t = setInterval(() => setUpdatedAgo(getLastSyncAgo()), 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setNetworkImported(getNetworkImported());
  }, []);

  // Fetch real backend-driven action items (referral drafts, pending approvals, etc.)
  const fetchBackendActions = useCallback(async () => {
    if (!apiLive) return;
    try {
      const data = await apiGetDashboardActions(20);
      // apiGetDashboardActions returns { actions: [...], total: number }
      const rawActions = data?.actions ?? [];
      const items: typeof ACTION_ITEMS = rawActions.map((a) => {
        // Backend already sends fully-shaped action items; cast to our ActionType
        const type: ActionType =
          a.type === "referral" ? "referral" :
          a.type === "interview" ? "interview" :
          a.type === "insight" ? "insight" : "manual";
        return {
          type,
          kicker: a.kicker,
          title: a.title,
          meta: a.meta,
          btn: a.btn,
          to: (a.to as PageId) || "applications",
          primary: a.primary,
        };
      });
      setBackendActions(items);
    } catch {
      // non-blocking — fall back to local derivation
    }
  }, [apiLive]);

  useEffect(() => { fetchBackendActions(); }, [fetchBackendActions]);

  const feed = [...opportunities].filter((o) => !o.skipped).sort((a, b) => b.ips - a.ips).slice(0, 15);
  // Merge: backend actions first (most authoritative), then locally derived from app statuses,
  // deduped by title so the same application doesn't appear twice.
  const derivedActions = apiLive ? deriveLiveActions(applications) : ACTION_ITEMS.slice(0, 7);
  const seenTitles = new Set<string>();
  const merged: typeof ACTION_ITEMS = [];
  for (const a of [...backendActions, ...derivedActions]) {
    if (!seenTitles.has(a.title)) { seenTitles.add(a.title); merged.push(a); }
    if (merged.length >= 7) break;
  }
  const baseActions = merged.length > 0 ? merged : (apiLive ? derivedActions : ACTION_ITEMS.slice(0, 7));
  const actions = networkImported ? baseActions : [...baseActions, CONNECT_NETWORK_ACTION].slice(0, 7);
  const activity = apiLive
    ? {
        discovered: briefStats.discovered,
        shortlisted: briefStats.shortlisted,
        submitted: briefStats.submitted,
        referral: briefStats.referral,
        interview: briefStats.interview,
      }
    : ACTIVITY_RANGES[range];
  const segs = [
    { n: activity.discovered, k: "found" },
    { n: activity.shortlisted, k: "scored" },
    { n: activity.submitted, k: "applied" },
    { n: activity.referral, k: "referral" },
    { n: activity.interview, k: "interview" },
  ];

  const RANGES: RangeKey[] = ["24h", "7d", "30d"];

  const handleRangeSelect = (r: RangeKey) => { setRange(r); setDropOpen(false); };

  const handleAction = (a: typeof ACTION_ITEMS[0]) => {
    if (a.to === "prep" && a.btn === "Open Brief") requestOpenPrepBrief();
    if (a.to === "outreach" && a.btn === "Review Draft") requestHighlightOutreachDraft("d1");
    if (a.to === "applications" && (a.btn === "Respond" || a.btn === "View")) {
      const match = applications.find((app) => `${app.company} · ${app.role}` === a.title);
      if (match) requestOpenApplication(match.id);
    }
    goTo(a.to);
  };

  return (
    <div className="page page-ops">
      <div className="cc-statusbar">
        <span className="seg lead">Since last check</span>
        {segs.map((s, i) => (
          <span className="seg" key={i}><span className="n">{s.n}</span> {s.k}</span>
        ))}
        <span className="ago" style={{ position: "relative" }}>
          Updated {updatedAgo}
          <button
            className="cc-range"
            type="button"
            onClick={() => setDropOpen((d) => !d)}
            aria-haspopup="listbox"
            aria-expanded={dropOpen}
          >
            {range} ▾
          </button>
          {dropOpen && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 50 }} onClick={() => setDropOpen(false)} />
              <div className="cc-range-drop" role="listbox">
                {RANGES.map((r) => (
                  <button
                    key={r}
                    className={"cc-range-item" + (r === range ? " active" : "")}
                    role="option"
                    aria-selected={r === range}
                    type="button"
                    onClick={() => handleRangeSelect(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </>
          )}
        </span>
      </div>
      <div className="cc-grid">
        <div>
          {actions.length > 0 && (
            <div className="sec-label">
              What needs you <span className="ln" /> <span style={{ color: "var(--accent)", fontWeight: 600 }}>{actions.length}</span>
            </div>
          )}
          <div className="aq-list">
            {actions.length === 0 ? (
              <EmptyState>Nothing needs you right now. Aviram is handling it.</EmptyState>
            ) : (
              actions.map((a, i) => (
                <div className={"aq-card type-" + a.type} key={i}>
                  <div className="aq-top">
                    <div className="aq-l">
                      <div className="aq-type">{a.type}</div>
                      <div className="aq-kicker">{a.kicker}</div>
                      <div className="aq-title">{a.title}</div>
                      <div className="aq-meta">{a.meta}</div>
                    </div>
                  </div>
                  <div className="aq-act">
                    <button className={"btn btn-sm " + (a.primary ? "btn-primary" : "btn-ghost")} onClick={() => handleAction(a)}>
                      {a.btn} <span className="arr" style={arrIcon}><Icon name="arrow" /></span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="feed-panel">
          <div className="feed-head">
            <span className="ft">Live opportunity feed</span>
            <span className="live"><span className="dot" /> IPS ↓</span>
          </div>
          <div className="feed-list">
            {feed.length === 0 ? (
              <EmptyState>No opportunities in the queue right now.</EmptyState>
            ) : feed.map((o) => (
              <div className="feed-row" key={o.id} onClick={() => openOpp(o)}>
                <IPSChip score={o.ips} />
                <div className="fr-m">
                  <div className="fr-role">{o.role} · {o.company}</div>
                  <div className="fr-sub">{o.platform} · {o.age}{o.urgent ? <> · <Urgent /></> : null}</div>
                </div>
                <button
                  className="btn btn-quiet btn-sm fr-view"
                  type="button"
                  onClick={(e) => { e.stopPropagation(); openOpp(o); }}
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
