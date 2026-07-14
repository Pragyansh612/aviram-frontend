"use client";
import { useState } from "react";
import Link from "next/link";
import { Icon } from "./icons";
import { showToast } from "./Toast";
import { useDashboard } from "@/contexts/DashboardContext";
import { apiListOutreachMessages, apiUpdateOutreachMessageStatus } from "@/lib/api";
import type { OutreachMessage } from "@/lib/api/types";
import type { OUTREACH } from "./data";

export type Campaign = (typeof OUTREACH.campaigns)[number];

const STUB_MSG = "This will be available when connected to backend.";

export default function CampaignPanel({ campaign, onClose }: { campaign: Campaign; onClose: () => void }) {
  const { apiLive } = useDashboard();
  const [message, setMessage] = useState<OutreachMessage | null | undefined>(undefined);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [copying, setCopying] = useState(false);

  const handleOpenDraft = async () => {
    if (!apiLive) { showToast(STUB_MSG); return; }
    if (message !== undefined) { setMessage(undefined); return; } // toggle closed
    setLoadingMsg(true);
    try {
      const msgs = await apiListOutreachMessages(campaign.id);
      setMessage(msgs[0] ?? null);
    } catch {
      showToast("Couldn't load the draft — try again.", "warn");
      setMessage(null);
    } finally {
      setLoadingMsg(false);
    }
  };

  const handleCopy = async () => {
    if (!message?.id) return;
    setCopying(true);
    try {
      await navigator.clipboard.writeText(`${message.subject}\n\n${message.body}`);
      await apiUpdateOutreachMessageStatus(campaign.id, message.id, "copied");
      showToast("Copied to clipboard.", "success");
    } catch {
      showToast("Couldn't copy — try selecting the text manually.", "warn");
    } finally {
      setCopying(false);
    }
  };

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
            <button className="btn btn-ghost btn-sm" onClick={() => void handleOpenDraft()} disabled={loadingMsg}>
              {loadingMsg ? "Loading…" : message !== undefined ? "Close draft" : "Open draft"}
            </button>
            <button
              className="btn btn-quiet btn-sm"
              disabled
              title="Coming soon — inline message editing isn't built yet."
            >
              Edit message
            </button>
          </div>
          {apiLive && message !== undefined && (
            message ? (
              <div className="card card-pad" style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 500, fontSize: 13.5, marginBottom: 6 }}>{message.subject}</div>
                <div style={{ fontSize: 13, color: "var(--ink-2)", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{message.body}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => void handleCopy()} disabled={copying}>
                    {copying ? "Copying…" : "Copy to clipboard"}
                  </button>
                  <span style={{ fontSize: 11, color: "var(--ink-4)", alignSelf: "center", fontFamily: "var(--mono)" }}>
                    status: {message.status}
                  </span>
                </div>
              </div>
            ) : (
              <p className="camp-notes" style={{ marginTop: 10 }}>No draft generated for this campaign yet.</p>
            )
          )}
          {!apiLive && <div className="dp-stub-note">Backend not yet connected — actions will be live soon.</div>}
        </div>
      </aside>
    </>
  );
}
