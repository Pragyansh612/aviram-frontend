"use client";
import { useState } from "react";
import { OPPS, MISSIONS } from "@/components/dashboard/data";
import { IPSChip, Urgent, PageHead } from "@/components/dashboard/shared";
import { Icon } from "@/components/dashboard/icons";
import type { Opp } from "@/components/dashboard/DetailPanel";

const OPP_FILTERS = ["All", "Remote", "Referral available", "⚡ Urgent", "IPS ≥ 80", "Series A–B"];

export default function Opportunities({ openOpp, selectedId }: { openOpp: (o: Opp) => void; selectedId?: string | null }) {
  const [filter, setFilter] = useState("All");

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
          <div className={"opp-row" + (selectedId === o.id ? " sel" : "")} key={o.id} onClick={() => openOpp(o)}>
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
              <button className="btn btn-quiet btn-sm" type="button" onClick={(e) => { e.stopPropagation(); openOpp(o); }}>View ▾</button>
              {!o.skipped ? <button className="btn btn-quiet btn-sm" type="button" onClick={(e) => e.stopPropagation()} style={{ color: "var(--ink-4)" }}>Skip</button> : <span className="pill withdrawn">Skipped</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
