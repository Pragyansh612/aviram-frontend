"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/dashboard/icons";
import { apiGetOutreachCampaign } from "@/lib/api";
import { mapApiCampaign, type CampaignRow } from "@/components/dashboard/pages/Outreach";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "var(--sans, sans-serif)", background: "var(--cream, #F7F4EE)" }}>
      <div style={{ textAlign: "center", color: "var(--ink-3, #6B6B6B)" }}>{children}</div>
    </div>
  );
}

export default function OutreachFullPage({ campaignId }: { campaignId: string }) {
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [campaign, setCampaign] = useState<CampaignRow | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await apiGetOutreachCampaign(campaignId);
        if (cancelled) return;
        setCampaign(mapApiCampaign(raw, 0));
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [campaignId]);

  if (loading) {
    return <Shell><p style={{ fontSize: 14 }}>Loading campaign…</p></Shell>;
  }

  if (notFound || !campaign) {
    return (
      <Shell>
        <p style={{ fontSize: 14 }}>Campaign not found.</p>
        <Link href="/dashboard" style={{ color: "var(--accent, #234033)", fontSize: 13, marginTop: 12, display: "inline-block" }}>← Back to dashboard</Link>
      </Shell>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream, #F7F4EE)", fontFamily: "var(--sans, sans-serif)" }}>
      <div style={{ borderBottom: "1px solid var(--line, #E8E4DC)", padding: "0 40px", height: 52, display: "flex", alignItems: "center", gap: 16, background: "var(--paper, #FCFAF5)", position: "sticky", top: 0, zIndex: 10 }}>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ink-3, #6B6B6B)", textDecoration: "none" }}>
          <span style={{ width: 14, height: 14, display: "block" }}><Icon name="arrow" /></span>
          Dashboard
        </Link>
        <span style={{ color: "var(--line-strong, #D8D3C8)" }}>·</span>
        <span style={{ fontSize: 13, color: "var(--ink-2, #383530)", fontFamily: "var(--mono, monospace)" }}>Outreach</span>
        <span style={{ color: "var(--line-strong, #D8D3C8)" }}>·</span>
        <span style={{ fontSize: 13, color: "var(--ink, #111111)", fontWeight: 500 }}>{campaign.company} — {campaign.role}</span>
        <div style={{ marginLeft: "auto" }}>
          <span style={{ fontFamily: "var(--mono, monospace)", fontSize: 11.5, color: campaign.followUp === "Complete" ? "var(--accent, #234033)" : "var(--clay, #A96A2A)" }}>{campaign.status}</span>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "44px 40px 80px" }}>
        <h1 style={{ fontFamily: "var(--serif, serif)", fontSize: 34, fontWeight: 400, letterSpacing: "-0.015em", lineHeight: 1.15, marginBottom: 8 }}>{campaign.company}</h1>
        <p style={{ fontSize: 14, color: "var(--ink-3, #6B6B6B)", fontFamily: "var(--mono, monospace)", marginBottom: 36 }}>{campaign.role}</p>

        <div style={{ background: "var(--paper, #FCFAF5)", border: "1px solid var(--line, #E8E4DC)", borderRadius: 12, overflow: "hidden" }}>
          {[
            ["Status", campaign.status],
            ["Messages sent", String(campaign.sent)],
            ["Last activity", campaign.last],
            ["Contacts found", `${campaign.contactsFound} · 2nd-degree`],
            ["Messages drafted", String(campaign.messagesDrafted)],
            ["Follow-up", campaign.followUp],
          ].map(([k, v], i, arr) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "14px 22px", borderBottom: i < arr.length - 1 ? "1px solid var(--line-soft, #EDE9E1)" : "none" }}>
              <span style={{ fontSize: 13.5, color: "var(--ink-3, #6B6B6B)" }}>{k}</span>
              <span style={{ fontSize: 13.5, fontFamily: "var(--mono, monospace)", fontWeight: 500, color: k === "Follow-up" && v === "Complete" ? "var(--accent, #234033)" : k === "Follow-up" ? "var(--clay, #A96A2A)" : "inherit" }}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32 }}>
          <div style={{ fontSize: 11, fontFamily: "var(--mono, monospace)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-4, #9A9488)", marginBottom: 14 }}>Notes</div>
          <div style={{ background: "var(--paper, #FCFAF5)", border: "1px solid var(--line, #E8E4DC)", borderRadius: 12, padding: "20px 24px", fontSize: 14, color: "var(--ink-2, #383530)", lineHeight: 1.7 }}>
            {campaign.notes || "No notes recorded for this campaign."}
          </div>
        </div>
      </div>
    </div>
  );
}
