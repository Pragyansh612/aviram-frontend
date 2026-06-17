"use client";
import Link from "next/link";
import type { VAULT } from "@/components/dashboard/data";
import { Icon } from "@/components/dashboard/icons";

type VaultEntry = (typeof VAULT)[number];

export default function CompanyFullPage({ company }: { company: VaultEntry | null }) {
  if (!company) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "var(--sans, sans-serif)", background: "var(--cream, #F7F4EE)" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "var(--ink-3, #6B6B6B)" }}>Company not found.</p>
          <Link href="/dashboard" style={{ color: "var(--accent, #234033)", fontSize: 13, marginTop: 12, display: "inline-block" }}>← Back to dashboard</Link>
        </div>
      </div>
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
        <span style={{ fontSize: 13, color: "var(--ink-2, #383530)", fontFamily: "var(--mono, monospace)" }}>Research Vault</span>
        <span style={{ color: "var(--line-strong, #D8D3C8)" }}>·</span>
        <span style={{ fontSize: 13, color: "var(--ink, #111111)", fontWeight: 500 }}>{company.name}</span>
        <div style={{ marginLeft: "auto" }}>
          <span style={{ fontFamily: "var(--mono, monospace)", fontSize: 11.5, color: company.signal === "strong" ? "var(--accent, #234033)" : company.signal === "medium" ? "var(--clay, #A96A2A)" : "var(--ink-4, #9A9488)" }}>
            {company.signal === "strong" ? "Strong signal" : company.signal === "medium" ? "Medium signal" : "Weak signal"}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "44px 40px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <span style={{ width: 52, height: 52, borderRadius: 12, background: "var(--accent-tint, #E4EAE3)", color: "var(--accent, #234033)", display: "grid", placeItems: "center", fontFamily: "var(--serif, serif)", fontSize: 24, flexShrink: 0 }}>{company.logo}</span>
          <div>
            <h1 style={{ fontFamily: "var(--serif, serif)", fontSize: 34, fontWeight: 400, letterSpacing: "-0.015em", lineHeight: 1.15, marginBottom: 4 }}>{company.name}</h1>
            <p style={{ fontSize: 13.5, color: "var(--ink-3, #6B6B6B)", fontFamily: "var(--mono, monospace)" }}>{company.tagline}</p>
          </div>
        </div>

        <div style={{ background: "var(--paper, #FCFAF5)", border: "1px solid var(--line, #E8E4DC)", borderRadius: 12, overflow: "hidden" }}>
          {company.kv.map(([k, v, cls], i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "14px 22px", borderBottom: i < company.kv.length - 1 ? "1px solid var(--line-soft, #EDE9E1)" : "none" }}>
              <span style={{ fontSize: 13.5, color: "var(--ink-3, #6B6B6B)" }}>{k}</span>
              <span style={{ fontSize: 13.5, fontFamily: "var(--mono, monospace)", fontWeight: 500, color: cls === "good" ? "var(--accent, #234033)" : cls === "amber" ? "var(--clay, #A96A2A)" : "inherit" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
