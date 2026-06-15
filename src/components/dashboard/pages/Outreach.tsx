"use client";
import { useState } from "react";
import { OUTREACH } from "@/components/dashboard/data";
import { PageHead } from "@/components/dashboard/shared";
import { Icon } from "@/components/dashboard/icons";

const arrIcon: React.CSSProperties = { width: 14, height: 14, display: "inline-block" };

export default function Outreach() {
  const [openCamp, setOpenCamp] = useState(OUTREACH.campaigns[1].id);
  return (
    <div className="page">
      <PageHead
        eyebrow={<><span style={{ width: 13, height: 13, display: "inline-block" }}><Icon name="outreach" /></span> Outreach</>}
        title="Warm paths, drafted — never sent without you."
        sub="Aviram finds the shortest route into each company and writes the intro. Nothing leaves until you press send."
        right={<button className="btn btn-ghost btn-sm">New campaign</button>}
      />
      <div className="sec-label">Referral drafts — awaiting your send <span className="ln" /> <span style={{ color: "var(--clay)", fontWeight: 600 }}>{OUTREACH.drafts.length}</span></div>
      {OUTREACH.drafts.map((d) => (
        <div className="draft-card" key={d.id}>
          <div className="dc-head">
            <span className="ava" style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--accent)", color: "var(--accent-fg)", display: "grid", placeItems: "center", fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600, flexShrink: 0 }}>{d.initials}</span>
            <div className="who"><div className="nm">{d.contact}</div><div className="rl">{d.rel}</div></div>
            <span className="draft-tag">DRAFT · {d.company}</span>
          </div>
          <div className="body">"{d.body}"</div>
          <div className="dc-act">
            <button className="btn btn-primary btn-sm">Send intro <span className="arr" style={arrIcon}><Icon name="send" /></span></button>
            <button className="btn btn-ghost btn-sm">Edit</button>
            <span style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-4)" }}>{d.role}</span>
          </div>
        </div>
      ))}
      <div className="sec-label" style={{ marginTop: 30 }}>Campaigns <span className="ln" /></div>
      {OUTREACH.campaigns.map((c) => (
        <div key={c.id}>
          <div className="campaign-row" onClick={() => setOpenCamp(openCamp === c.id ? "" : c.id)} style={{ cursor: "pointer" }}>
            <div><div className="cr-co">{c.company}</div><div className="cr-role">{c.role}</div></div>
            <span className="cr-stat">{c.status}</span>
            <span className="cr-stat"><b>{c.sent}</b> sent</span>
            <span className="cr-stat" style={{ color: "var(--ink-4)" }}>{c.last}</span>
          </div>
          {openCamp === c.id && (
            <div className="card card-pad" style={{ margin: "-2px 0 10px", borderRadius: "0 0 11px 11px" }}>
              <div className="dp-kv"><span className="k">Contacts found</span><span className="v">{c.sent + 2} · 2nd-degree</span></div>
              <div className="dp-kv"><span className="k">Messages drafted</span><span className="v">{c.sent + 1}</span></div>
              <div className="dp-kv"><span className="k">Follow-up</span><span className="v" style={{ color: "var(--clay)" }}>{c.status === "Replied — intro made" ? "Complete" : "Scheduled +3 days"}</span></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}