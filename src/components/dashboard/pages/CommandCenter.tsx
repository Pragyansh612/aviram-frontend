"use client";
import { BRIEF, OPPS } from "@/components/dashboard/data";
import { IPSChip, Urgent, PageHead } from "@/components/dashboard/shared";
import { Icon } from "@/components/dashboard/icons";
import type { PageId } from "@/components/dashboard/shared";

const arrIcon: React.CSSProperties = { width: 14, height: 14, display: "inline-block" };
const iconSm: React.CSSProperties = { width: 13, height: 13, display: "inline-block" };

export default function CommandCenter({ goTo, openOpp }: {
  goTo: (p: PageId) => void;
  openOpp: (o: typeof OPPS[0]) => void;
}) {
  const feed = OPPS.filter((o) => !o.skipped).slice(0, 15);
  const segs = [
    { n: BRIEF.discovered, k: "found" },
    { n: BRIEF.shortlisted, k: "scored" },
    { n: BRIEF.submitted, k: "applied" },
    { n: BRIEF.referral, k: "referral" },
    { n: BRIEF.interview, k: "interview" },
  ];
  const actions = [
    { tone: "",     kicker: <><span style={iconSm}><Icon name="clock" /></span> Interview in 47 hours</>,    title: "Razorpay · SDE-2",              meta: "Thursday 9:00 AM · prep brief ready",        btn: "Open Brief",    to: "prep"         as PageId, primary: true },
    { tone: "warn", kicker: <><span style={iconSm}><Icon name="referral" /></span> Referral draft ready</>, title: "Stripe · Backend Engineer",      meta: "2nd-degree via Arjun Mehta · awaiting your send", btn: "Review Draft", to: "outreach"     as PageId, primary: false },
    { tone: "warn", kicker: <><span style={iconSm}><Icon name="outreach" /></span> Recruiter replied</>,    title: "Vercel · Platform Engineer",     meta: "Screening call requested · suggest 3 times", btn: "Respond",       to: "applications" as PageId, primary: false },
  ];
  return (
    <div className="page">
      <PageHead
        eyebrow={<><span style={{ width: 6, height: 6, borderRadius: 9, background: "var(--accent)", display: "inline-block" }} /> Command Center</>}
        title="Nothing needs you that Aviram hasn't already started."
        right={<button className="cc-range">24h ▾</button>}
      />
      <div className="cc-statusbar">
        <span className="seg lead">Since last check</span>
        {segs.map((s, i) => (
          <span className="seg" key={i}><span className="n">{s.n}</span> {s.k}</span>
        ))}
        <span className="ago"><span style={{ width: 6, height: 6, borderRadius: 9, background: "var(--green-live)", display: "inline-block" }} /> 4 min ago</span>
      </div>
      <div className="cc-grid">
        <div>
          <div className="sec-label">What needs you <span className="ln" /> <span style={{ color: "var(--accent)", fontWeight: 600 }}>{actions.length}</span></div>
          <div className="aq-list">
            {actions.map((a, i) => (
              <div className={"aq-card " + a.tone} key={i}>
                <div className="aq-top">
                  <div className="aq-l">
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
            ))}
          </div>
          <div className="empty-line" style={{ paddingBottom: 0 }}>Three days ago this queue had 19 items. Aviram cleared the rest.</div>
        </div>
        <div className="feed-panel">
          <div className="feed-head">
            <span className="ft">What Aviram is working on</span>
            <span className="live"><span className="dot" /> live · IPS ↓</span>
          </div>
          <div className="feed-list">
            {feed.map((o) => (
              <div className="feed-row" key={o.id} onClick={() => openOpp(o)}>
                <IPSChip score={o.ips} />
                <div className="fr-m">
                  <div className="fr-role">{o.role} · {o.company}</div>
                  <div className="fr-sub">{o.platform} · {o.age}{o.urgent ? <> · <Urgent /></> : null}</div>
                </div>
                <button className="btn btn-quiet btn-sm fr-view">View</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}