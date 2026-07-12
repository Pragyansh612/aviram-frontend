"use client";
import { useState, useEffect } from "react";
import { VAULT } from "@/components/dashboard/data";
import { PageHead, EmptyState } from "@/components/dashboard/shared";
import { Icon } from "@/components/dashboard/icons";
import { useDashboard } from "@/contexts/DashboardContext";
import { apiListCompanyResearch } from "@/lib/api";
import type { CompanyResearch } from "@/lib/api/types";
import type { VaultEntry } from "@/components/dashboard/VaultPanel";

type UrgencyFilter = "all" | "high" | "medium" | "low";
type RateFilter = "all" | "high" | "mid" | "low";
type ReferralFilter = "all" | "yes" | "no";
type FundingFilter = "all" | "recent" | "stable";

// CompanyResearch (the shared 24h scrape cache) has no urgency/referral
// signal of its own — those live in separate services (urgency_service,
// referral_service) that aren't wired to this list yet. response_rate IS
// real (joined server-side from company_response_rates). Map only what's
// real; leave the rest at honest neutral defaults rather than fabricating
// numbers.
function mapResearchToVaultEntry(r: CompanyResearch, i: number): VaultEntry {
  const hasData = Boolean(r.overview || r.tech_stack.length || r.culture_signals.length);
  const responseRate = r.response_rate != null ? Math.round(r.response_rate * 100) : 0;
  const kv: [string, string, string][] = [];
  if (r.funding_stage || r.funding_amount) {
    kv.push(["Funding", [r.funding_stage, r.funding_amount].filter(Boolean).join(" — "), ""]);
  }
  if (r.employee_count) kv.push(["Employee count", r.employee_count, ""]);
  if (r.response_rate != null) {
    kv.push(["Response rate", `${responseRate}%${r.application_count ? ` (${r.application_count} tracked)` : ""}`, ""]);
  }
  if (r.tech_stack.length) kv.push(["Tech stack", r.tech_stack.join(", "), ""]);
  if (r.culture_signals.length) kv.push(["Culture signals", r.culture_signals.join(", "), ""]);
  if (r.domain) kv.push(["Domain", r.domain, ""]);
  kv.push(["Researched", r.researched_at ? new Date(r.researched_at).toLocaleDateString() : "—", ""]);

  return {
    id: `research-${r.company_name}-${i}`,
    name: r.company_name,
    tagline: r.overview ? r.overview.slice(0, 90) : (r.products ?? "No overview scraped yet"),
    logo: r.company_name.charAt(0).toUpperCase(),
    signal: hasData ? "medium" : "weak",
    urgency: "medium" as const,
    responseRate,
    hasReferral: false,
    fundingRecent: false,
    kv,
  };
}

export default function ResearchVault({
  openVault,
  selectedId,
}: {
  openVault: (v: VaultEntry) => void;
  selectedId?: string | null;
}) {
  const { apiLive } = useDashboard();
  const [q, setQ] = useState("");
  const [urgency, setUrgency] = useState<UrgencyFilter>("all");
  const [rate, setRate] = useState<RateFilter>("all");
  const [referral, setReferral] = useState<ReferralFilter>("all");
  const [funding, setFunding] = useState<FundingFilter>("all");
  const [vault, setVault] = useState<VaultEntry[] | null>(null);

  useEffect(() => {
    if (!apiLive) return;
    apiListCompanyResearch()
      .then((rows) => setVault(rows.map(mapResearchToVaultEntry)))
      .catch(() => setVault([]));
  }, [apiLive]);

  const source = apiLive ? (vault ?? []) : VAULT;

  const list = source.filter((v) => {
    if (!(v.name + " " + v.tagline).toLowerCase().includes(q.toLowerCase())) return false;
    if (urgency !== "all" && v.urgency !== urgency) return false;
    if (rate === "high" && v.responseRate < 15) return false;
    if (rate === "mid" && (v.responseRate < 10 || v.responseRate >= 15)) return false;
    if (rate === "low" && v.responseRate >= 10) return false;
    if (referral === "yes" && !v.hasReferral) return false;
    if (referral === "no" && v.hasReferral) return false;
    if (funding === "recent" && !v.fundingRecent) return false;
    if (funding === "stable" && v.fundingRecent) return false;
    return true;
  });

  return (
    <div className="page">
      <PageHead
        eyebrow={<><span style={{ width: 13, height: 13, display: "inline-block" }}><Icon name="vault" /></span> Research Vault</>}
        title="An agent with memory — not a job board."
        sub="Every company Aviram has investigated, kept as a living dossier. This is the why behind every score."
      />
      <div className="vault-search">
        <div className="search-input">
          <span style={{ width: 15, height: 15, color: "var(--ink-4)", display: "block", flexShrink: 0 }}><Icon name="search" /></span>
          <input placeholder="Search companies, signals, ATS…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <span style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--ink-4)" }}>{list.length} dossiers</span>
      </div>
      <div className="vault-filters">
        <span className="vf-label">Urgency</span>
        {(["all", "high", "medium", "low"] as UrgencyFilter[]).map((u) => (
          <button key={u} type="button" className={"fchip" + (urgency === u ? " active" : "")} onClick={() => setUrgency(u)}>
            {u === "all" ? "All" : u.charAt(0).toUpperCase() + u.slice(1)}
          </button>
        ))}
        <span className="vf-label">Response rate</span>
        {([["all", "All"], ["high", "≥15%"], ["mid", "10–14%"], ["low", "<10%"]] as [RateFilter, string][]).map(([id, label]) => (
          <button key={id} type="button" className={"fchip" + (rate === id ? " active" : "")} onClick={() => setRate(id)}>{label}</button>
        ))}
        <span className="vf-label">Referral</span>
        {([["all", "All"], ["yes", "Available"], ["no", "None"]] as [ReferralFilter, string][]).map(([id, label]) => (
          <button key={id} type="button" className={"fchip" + (referral === id ? " active" : "")} onClick={() => setReferral(id)}>{label}</button>
        ))}
        <span className="vf-label">Funding</span>
        {([["all", "All"], ["recent", "Recent"], ["stable", "Stable"]] as [FundingFilter, string][]).map(([id, label]) => (
          <button key={id} type="button" className={"fchip" + (funding === id ? " active" : "")} onClick={() => setFunding(id)}>{label}</button>
        ))}
      </div>
      {list.length === 0 ? (
        <EmptyState>
          {apiLive && vault === null
            ? "Loading dossiers…"
            : apiLive && (vault ?? []).length === 0
              ? "No company dossiers yet. Aviram researches a company automatically the first time you view its opportunity or book an interview there."
              : "No dossiers match your search or filters."}
        </EmptyState>
      ) : (
        <div className="vault-list">
          {list.map((v) => (
            <div
              key={v.id}
              className={"dossier dossier-row" + (selectedId === v.id ? " sel" : "")}
              onClick={() => openVault(v)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openVault(v); }}
            >
              <span className="ds-logo">{v.logo}</span>
              <div className="ds-l">
                <div className="ds-name">{v.name}</div>
                <div className="ds-tagline">{v.tagline}</div>
              </div>
              <div className="ds-sig">
                <span className={"signal-pill " + v.signal}>{v.signal === "strong" ? "Strong signal" : v.signal === "medium" ? "Medium" : "Weak"}</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-4)" }}>{v.responseRate}% reply</span>
                {v.hasReferral && <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--accent)", background: "var(--accent-tint)", padding: "2px 7px", borderRadius: 5 }}>Referral</span>}
                <button className="btn btn-quiet btn-sm" type="button" onClick={(e) => { e.stopPropagation(); openVault(v); }}>View →</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
