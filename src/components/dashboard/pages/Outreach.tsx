"use client";
import { OUTREACH } from "@/components/dashboard/data";
import { PageHead, EmptyState } from "@/components/dashboard/shared";
import { Icon } from "@/components/dashboard/icons";
import { showToast } from "@/components/dashboard/Toast";
import type { Campaign } from "@/components/dashboard/CampaignPanel";

const arrIcon: React.CSSProperties = { width: 14, height: 14, display: "inline-block" };
const STUB_MSG = "This will be available when connected to backend.";

export default function Outreach({ openCampaign, selectedId }: {
  openCampaign: (c: Campaign) => void;
  selectedId?: string | null;
}) {
  return (
    <div className="page">
      <PageHead
        eyebrow={<><span style={{ width: 13, height: 13, display: "inline-block" }}><Icon name="outreach" /></span> Outreach</>}
        title="Warm paths, drafted — never sent without you."
        sub="Aviram finds the shortest route into each company and writes the intro. Nothing leaves until you press send."
        right={
          <button type="button" className="btn btn-quiet btn-sm" onClick={() => showToast(STUB_MSG)}>
            New campaign
          </button>
        }
      />
      {OUTREACH.drafts.length === 0 && OUTREACH.campaigns.length === 0 ? (
        <EmptyState>No outreach drafts or campaigns yet.</EmptyState>
      ) : (
      <>
      <div className="sec-label">
        Referral drafts — awaiting your send <span className="ln" />
        <span style={{ color: "var(--clay)", fontWeight: 600 }}>{OUTREACH.drafts.length}</span>
      </div>
      {OUTREACH.drafts.map((d) => (
        <div className="draft-card" key={d.id}>
          <div className="dc-head">
            <span className="ava" style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--accent)", color: "var(--accent-fg)", display: "grid", placeItems: "center", fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600, flexShrink: 0 }}>{d.initials}</span>
            <div className="who"><div className="nm">{d.contact}</div><div className="rl">{d.rel}</div></div>
            <span className="draft-tag">DRAFT · {d.company}</span>
          </div>
          <div className="body">"{d.body}"</div>
          <div className="dc-act">
            {/* "Send intro" is the primary action the user must take — show prominently but fire toast */}
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => showToast("Send will be live once backend is connected — for now, copy the draft and send manually.", "warn")}
            >
              Send intro <span className="arr" style={arrIcon}><Icon name="send" /></span>
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => showToast(STUB_MSG)}
            >
              Edit
            </button>
            <span style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-4)" }}>{d.role}</span>
          </div>
        </div>
      ))}
      <div className="sec-label" style={{ marginTop: 30 }}>Campaigns <span className="ln" /></div>
      {OUTREACH.campaigns.map((c) => (
        <div
          key={c.id}
          className={"campaign-row" + (selectedId === c.id ? " sel" : "")}
          onClick={() => openCampaign(c)}
          style={{ cursor: "pointer" }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openCampaign(c); }}
        >
          <div><div className="cr-co">{c.company}</div><div className="cr-role">{c.role}</div></div>
          <span className="cr-stat">{c.status}</span>
          <span className="cr-stat"><b>{c.sent}</b> sent</span>
          <span className="cr-stat" style={{ color: "var(--ink-4)" }}>{c.last}</span>
          <button type="button" className="btn btn-quiet btn-sm" onClick={(e) => { e.stopPropagation(); openCampaign(c); }}>View</button>
        </div>
      ))}
      </>
      )}
    </div>
  );
}
