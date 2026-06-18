"use client";
import { useState, useEffect } from "react";
import { OUTREACH } from "@/components/dashboard/data";
import { PageHead, EmptyState } from "@/components/dashboard/shared";
import { Icon } from "@/components/dashboard/icons";
import { showToast } from "@/components/dashboard/Toast";
import { useDashboard } from "@/contexts/DashboardContext";
import { apiListReferralRequests, apiListOutreachCampaigns } from "@/lib/api";
import type { ReferralRequest } from "@/lib/api";
import type { Campaign } from "@/components/dashboard/CampaignPanel";

const arrIcon: React.CSSProperties = { width: 14, height: 14, display: "inline-block" };
const STUB_MSG = "Connect to backend to send outreach.";

type Draft = (typeof OUTREACH.drafts)[number];
type CampaignRow = (typeof OUTREACH.campaigns)[number];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0]![0]! + parts[1]![0]!).toUpperCase()
    : (name[0] ?? "?").toUpperCase();
}

function mapReferralToDraft(r: ReferralRequest): Draft {
  const contact = r.connection_name ?? "Contact";
  const company = r.company ?? r.company_name ?? "—";
  return {
    id: r.id,
    contact,
    initials: initials(contact),
    rel: r.status ? `${r.status} · referral path` : "Referral path",
    company,
    role: r.job_title ?? "—",
    body: r.draft_message ?? "Draft message pending.",
  };
}

function mapApiCampaign(c: Record<string, unknown>, i: number): CampaignRow {
  return {
    id: String(c.id ?? `c-api-${i}`),
    company: String(c.company_name ?? c.company ?? "—"),
    role: String(c.job_title ?? c.role ?? "—"),
    status: String(c.status ?? "Active"),
    sent: Number(c.sent_count ?? c.messages_sent ?? 0),
    last: c.updated_at ? new Date(String(c.updated_at)).toLocaleDateString() : "—",
    contactsFound: Number(c.contacts_found ?? 0),
    messagesDrafted: Number(c.messages_drafted ?? 0),
    followUp: String(c.follow_up ?? "—"),
    notes: String(c.notes ?? ""),
  };
}

export default function Outreach({ openCampaign, selectedId, highlightDraftId }: {
  openCampaign: (c: Campaign) => void;
  selectedId?: string | null;
  highlightDraftId?: string | null;
}) {
  const { apiLive } = useDashboard();
  const [drafts, setDrafts] = useState<Draft[]>(OUTREACH.drafts);
  const [campaigns, setCampaigns] = useState<CampaignRow[]>(OUTREACH.campaigns);
  const [highlightDraft, setHighlightDraft] = useState<string | null>(highlightDraftId ?? null);

  useEffect(() => {
    if (!apiLive) return;
    Promise.all([
      apiListReferralRequests().catch(() => [] as ReferralRequest[]),
      apiListOutreachCampaigns().catch(() => [] as Array<Record<string, unknown>>),
    ]).then(([refs, camps]) => {
      if (refs.length) setDrafts(refs.map(mapReferralToDraft));
      if (camps.length) setCampaigns(camps.map(mapApiCampaign));
    });
  }, [apiLive]);

  useEffect(() => {
    if (!highlightDraftId) return;
    setHighlightDraft(highlightDraftId);
    const scrollT = setTimeout(() => {
      document.getElementById(`draft-${highlightDraftId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
    const clearT = setTimeout(() => setHighlightDraft(null), 4000);
    return () => { clearTimeout(scrollT); clearTimeout(clearT); };
  }, [highlightDraftId]);

  return (
    <div className="page">
      <PageHead
        eyebrow={<><span style={{ width: 13, height: 13, display: "inline-block" }}><Icon name="outreach" /></span> Outreach</>}
        title="Warm paths, drafted — never sent without you."
        sub="Aviram finds the shortest route into each company and writes the intro. Nothing leaves until you press send."
        right={
          <button type="button" className="btn btn-quiet btn-sm" onClick={() => showToast(apiLive ? "Campaign creation opens from a job with a referral path." : STUB_MSG)}>
            New campaign
          </button>
        }
      />
      {drafts.length === 0 && campaigns.length === 0 ? (
        <EmptyState>No outreach drafts or campaigns yet.</EmptyState>
      ) : (
      <>
      <div className="sec-label">
        Referral drafts — awaiting your send <span className="ln" />
        <span style={{ color: "var(--clay)", fontWeight: 600 }}>{drafts.length}</span>
      </div>
      {drafts.map((d) => (
        <div
          className={"draft-card" + (highlightDraft === d.id ? " sel" : "")}
          key={d.id}
          id={`draft-${d.id}`}
        >
          <div className="dc-head">
            <span className="ava" style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--accent)", color: "var(--accent-fg)", display: "grid", placeItems: "center", fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600, flexShrink: 0 }}>{d.initials}</span>
            <div className="who"><div className="nm">{d.contact}</div><div className="rl">{d.rel}</div></div>
            <span className="draft-tag">DRAFT · {d.company}</span>
          </div>
          <div className="body">&quot;{d.body}&quot;</div>
          <div className="dc-act">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => showToast(apiLive ? "Send is queued for your approval in the next release." : "Copy the draft and send manually in demo mode.", "warn")}
            >
              Send intro <span className="arr" style={arrIcon}><Icon name="send" /></span>
            </button>
            <button
              type="button"
              className="btn btn-quiet btn-sm"
              onClick={() => showToast(STUB_MSG)}
            >
              Edit
            </button>
            <span style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-4)" }}>{d.role}</span>
          </div>
        </div>
      ))}
      <div className="sec-label" style={{ marginTop: 30 }}>Campaigns <span className="ln" /></div>
      {campaigns.map((c) => (
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
