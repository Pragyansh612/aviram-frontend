"use client";
import Link from "next/link";
import { Icon } from "./icons";
import { showToast } from "./Toast";
import type { OUTREACH } from "./data";

export type Campaign = (typeof OUTREACH.campaigns)[number];

const STUB_MSG = "This will be available when connected to backend.";

export default function CampaignPanel({ campaign, onClose }: { campaign: Campaign; onClose: () => void }) {
  return (
    <>
      <div className="detail-scrim" onClick={onClose} />
      <aside className="detail-panel">
        <div className="detail-head">
          <div className="dh-l">
            <div className="dh-role">{campaign.company}</div>
            <div className="dh-sub">{campaign.role} · {campaign.status}</div>
          </div>
          <button className="dp-close" onClick={onClose} aria-label="Close panel">
            <span style={{ width: 16, height: 16, display: "block" }}><Icon name="x" /></span>
          </button>
        </div>
        <div className="dp-fullpage-bar">
          <Link className="dp-fullpage-link" href={`/outreach/${campaign.id}`} target="_blank" rel="noopener noreferrer">
            Open full page →
          </Link>
        </div>
        <div className="detail-body">
          <div className="dp-sec">Campaign status</div>
          <div className="dp-kv"><span className="k">Status</span><span className="v">{campaign.status}</span></div>
          <div className="dp-kv"><span className="k">Messages sent</span><span className="v">{campaign.sent}</span></div>
          <div className="dp-kv"><span className="k">Last activity</span><span className="v">{campaign.last}</span></div>
          <div className="dp-sec">Outreach detail</div>
          <div className="dp-kv"><span className="k">Contacts found</span><span className="v">{campaign.contactsFound} · 2nd-degree</span></div>
          <div className="dp-kv"><span className="k">Messages drafted</span><span className="v">{campaign.messagesDrafted}</span></div>
          <div className="dp-kv"><span className="k">Follow-up</span><span className="v" style={{ color: campaign.followUp === "Complete" ? "var(--accent)" : "var(--clay)" }}>{campaign.followUp}</span></div>
          <div className="dp-sec">Notes</div>
          <p className="camp-notes">{campaign.notes}</p>
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            {/* Both stubs — ghost weight, not primary */}
            <button className="btn btn-ghost btn-sm" onClick={() => showToast(STUB_MSG)}>Open draft</button>
            <button className="btn btn-quiet btn-sm" onClick={() => showToast(STUB_MSG)}>Edit message</button>
          </div>
          <div className="dp-stub-note">Backend not yet connected — actions will be live soon.</div>
        </div>
      </aside>
    </>
  );
}
