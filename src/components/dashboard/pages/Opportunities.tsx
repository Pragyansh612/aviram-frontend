"use client";
import { useState } from "react";
import { OPPS, MISSIONS } from "@/components/dashboard/data";
import { IPSChip, Urgent, ScoreTree, PageHead } from "@/components/dashboard/shared";
import { Icon } from "@/components/dashboard/icons";

const OPP_FILTERS = ["All", "Remote", "Referral available", "⚡ Urgent", "IPS ≥ 80", "Series A–B"];

type Opp = typeof OPPS[0];

function OppDetail({ opp, onClose }: { opp: Opp; onClose: () => void }) {
  return (
    <>
      <div className="detail-scrim" onClick={onClose} />
      <aside className="detail-panel">
        <div className="detail-head">
          <div className="dh-l">
            <div className="dh-role">{opp.role}</div>
            <div className="dh-sub">{opp.company} · {opp.stage} · {opp.location}</div>
          </div>
          <IPSChip score={opp.ips} size="lg" solid />
          <button className="dp-close" onClick={onClose}>
            <span style={{ width: 16, height: 16, display: "block" }}><Icon name="x" /></span>
          </button>
        </div>
        <div className="detail-body">
          {opp.skipped && (
            <div className="card card-pad" style={{ background: "var(--skip-tint)", border: "none", marginBottom: 8 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--skip)", marginBottom: 6 }}>Skipped — and here's why</div>
              <div style={{ fontSize: 13.5, color: "var(--ink-2)" }}>{opp.skipReason}</div>
            </div>
          )}
          <div className="dp-sec">Score breakdown</div>
          <ScoreTree tree={opp.tree} total={opp.ips} />
          {opp.referral && opp.refPath && (
            <>
              <div className="dp-sec">Referral path</div>
              <div className="card card-pad" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className="ava" style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--clay)", color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--mono)", fontWeight: 600, fontSize: 13, flexShrink: 0 }}>
                  {opp.refPath.match(/via (\w)\w* (\w)/) ? (RegExp.$1 + RegExp.$2) : "—"}
                </span>
                <div style={{ flex: 1, fontSize: 13 }}>
                  <div style={{ fontWeight: 500 }}>{opp.refPath}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>warm path · draft available in Outreach</div>
                </div>
              </div>
            </>
          )}
          <div className="dp-sec">Role</div>
          <ul className="dp-jd">{opp.jd.map((l, i) => <li key={i}>{l}</li>)}</ul>
          <div className="dp-sec">Signals</div>
          <div className="dp-kv"><span className="k">Recruiter response rate</span><span className="v" style={{ color: "var(--accent)" }}>{opp.respRate}%</span></div>
          {opp.fundedDays != null && <div className="dp-kv"><span className="k">Funding</span><span className="v" style={{ color: "var(--clay)" }}>{opp.fundedDays} days ago</span></div>}
          <div className="dp-kv"><span className="k">Posting age</span><span className="v">{opp.age}</span></div>
          <div className="dp-kv"><span className="k">ATS</span><span className="v">{opp.platform}</span></div>
          {!opp.skipped && (
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button className="btn btn-primary">Queue application <span className="arr" style={{ width: 14, height: 14, display: "inline-block" }}><Icon name="arrow" /></span></button>
              <button className="btn btn-ghost">Tailor resume</button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default function Opportunities({ openOpp, selectedId }: { openOpp: (o: Opp) => void; selectedId?: string | null }) {
  const [filter, setFilter] = useState("All");
  const [detailOpp, setDetailOpp] = useState<Opp | null>(null);

  const list = OPPS.filter((o) => {
    if (o.skipped) return filter === "All";
    switch (filter) {
      case "Remote": return o.remote;
      case "Referral available": return o.referral;
      case "⚡ Urgent": return o.urgent;
      case "IPS ≥ 80": return o.ips >= 80;
      case "Series A–B": return /Series [AB]|Seed/.test(o.stage);
      default: return true;
    }
  });

  const handleOpen = (o: Opp) => { setDetailOpp(o); openOpp(o); };

  return (
    <div className="page">
      <PageHead
        eyebrow={<><span style={{ width: 13, height: 13, display: "inline-block" }}><Icon name="opportunities" /></span> Opportunities</>}
        title="Not a job board. A queue, pointed at your goals."
        sub="Every opening Aviram has scored, ranked by interview probability and grouped under the missions you set."
      />
      <div className="sec-label">Active missions <span className="ln" /></div>
      <div className="missions">
        {MISSIONS.map((m) => (
          <div className="mission" key={m.id}>
            <div className="mh"><span className="mt">{m.title}</span><span className="mk">Mission</span></div>
            <div className="mfrac"><span className="big">{m.done}<span style={{ color: "var(--ink-4)", fontWeight: 400 }}>/{m.target}</span></span><span className="lbl">applications</span></div>
            <div className="mbar"><i style={{ width: (m.done / m.target * 100) + "%" }} /></div>
            <div className="mpred"><span style={{ width: 13, height: 13, display: "inline-block", color: "var(--clay)" }}><Icon name="trending" /></span> Predicted interviews <b>{m.predicted.toFixed(1)}</b></div>
          </div>
        ))}
      </div>
      <div className="sec-label" style={{ marginTop: 30 }}>Queued toward your missions <span className="ln" /></div>
      <div className="filterbar" style={{ justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {OPP_FILTERS.map((f) => (
            <button key={f} className={"fchip" + (filter === f ? " active" : "")} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
        <button className="btn btn-ghost btn-sm">Apply to top 5 →</button>
      </div>
      <div className="opp-list">
        {list.map((o) => (
          <div className={"opp-row" + (selectedId === o.id ? " sel" : "")} key={o.id} onClick={() => handleOpen(o)}>
            <IPSChip score={o.ips} size="lg" />
            <div className="or-m">
              <div className="or-role">{o.role} <span style={{ color: "var(--ink-3)", fontWeight: 400, fontFamily: "var(--mono)", fontSize: 12 }}>· {o.company}</span> {o.urgent ? <Urgent /> : null}</div>
              <div className="or-sub">{o.stage} · {o.platform} · {o.age} old · {o.location}</div>
              <div className="or-tags">
                {o.stack.map((s) => <span className="tagchip" key={s}>{s}</span>)}
                {o.referral && <span className="ref"><span style={{ width: 12, height: 12, display: "inline-block" }}><Icon name="referral" /></span> Referral available</span>}
              </div>
            </div>
            <div className="or-act">
              <button className="btn btn-quiet btn-sm" onClick={(e) => { e.stopPropagation(); handleOpen(o); }}>View ▾</button>
              {!o.skipped ? <button className="btn btn-quiet btn-sm" onClick={(e) => e.stopPropagation()} style={{ color: "var(--ink-4)" }}>Skip</button> : <span className="pill withdrawn">Skipped</span>}
            </div>
          </div>
        ))}
      </div>
      {detailOpp && <OppDetail opp={detailOpp} onClose={() => setDetailOpp(null)} />}
    </div>
  );
}