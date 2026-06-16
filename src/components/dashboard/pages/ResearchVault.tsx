"use client";
import { useState } from "react";
import { VAULT } from "@/components/dashboard/data";
import { PageHead, EmptyState } from "@/components/dashboard/shared";
import { Icon } from "@/components/dashboard/icons";

type UrgencyFilter = "all" | "high" | "medium" | "low";
type RateFilter = "all" | "high" | "mid" | "low";
type ReferralFilter = "all" | "yes" | "no";
type FundingFilter = "all" | "recent" | "stable";

export default function ResearchVault() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(VAULT[0].id);
  const [urgency, setUrgency] = useState<UrgencyFilter>("all");
  const [rate, setRate] = useState<RateFilter>("all");
  const [referral, setReferral] = useState<ReferralFilter>("all");
  const [funding, setFunding] = useState<FundingFilter>("all");

  const list = VAULT.filter((v) => {
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
          <button key={u} type="button" className={"fchip" + (urgency === u ? " active" : "")} onClick={() => setUrgency(u)}>{u === "all" ? "All" : u.charAt(0).toUpperCase() + u.slice(1)}</button>
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
        <EmptyState>No dossiers match your search or filters.</EmptyState>
      ) : list.map((v) => {
        const isOpen = open === v.id;
        return (
          <div className="dossier" key={v.id}>
            <div className="ds-head" onClick={() => setOpen(isOpen ? "" : v.id)} role="button" tabIndex={0}>
              <span className="ds-logo">{v.logo}</span>
              <div className="ds-l">
                <div className="ds-name">{v.name}</div>
                <div className="ds-tagline">{v.tagline}</div>
              </div>
              <div className="ds-sig">
                <span className={"signal-pill " + v.signal}>{v.signal === "strong" ? "Strong signal" : v.signal === "medium" ? "Medium" : "Weak"}</span>
                <span style={{ width: 16, height: 16, color: "var(--ink-4)", transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .2s", display: "block" }}><Icon name="chevron" /></span>
              </div>
            </div>
            {isOpen && (
              <div className="ds-body">
                {v.kv.map((row, i) => (
                  <div className="intel-kv" key={i}>
                    <span className="ik">{row[0]}</span>
                    <span className={"iv " + (row[2] || "")}>{row[1]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
