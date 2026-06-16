"use client";
import { BRIEF, OPPS } from "@/components/dashboard/data";
import { IPSChip, Urgent, EmptyState } from "@/components/dashboard/shared";
import { Icon } from "@/components/dashboard/icons";
import type { PageId } from "@/components/dashboard/shared";

const arrIcon: React.CSSProperties = { width: 14, height: 14, display: "inline-block" };

type ActionType = "interview" | "referral" | "manual" | "insight";

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

export default function CommandCenter({ goTo, openOpp }: {
  goTo: (p: PageId) => void;
  openOpp: (o: typeof OPPS[0]) => void;
}) {
  const feed = OPPS.filter((o) => !o.skipped).slice(0, 15);
  const actions = ACTION_ITEMS.slice(0, 7);
  const segs = [
    { n: BRIEF.discovered, k: "found" },
    { n: BRIEF.shortlisted, k: "scored" },
    { n: BRIEF.submitted, k: "applied" },
    { n: BRIEF.referral, k: "referral" },
    { n: BRIEF.interview, k: "interview" },
  ];

  return (
    <div className="page page-ops">
      <div className="cc-statusbar">
        <span className="seg lead">Since last check</span>
        {segs.map((s, i) => (
          <span className="seg" key={i}><span className="n">{s.n}</span> {s.k}</span>
        ))}
        <span className="ago">
          Updated 4 min ago
          <button className="cc-range" type="button">24h ▾</button>
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
                    <button className={"btn btn-sm " + (a.primary ? "btn-primary" : "btn-ghost")} onClick={() => goTo(a.to)}>
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
