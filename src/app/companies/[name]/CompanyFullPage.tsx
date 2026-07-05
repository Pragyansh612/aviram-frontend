"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/dashboard/icons";
import { apiGetCompanyResearch } from "@/lib/api";
import type { CompanyResearch } from "@/lib/api/types";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "var(--sans, sans-serif)", background: "var(--cream, #F7F4EE)" }}>
      <div style={{ textAlign: "center", color: "var(--ink-3, #6B6B6B)" }}>{children}</div>
    </div>
  );
}

function initials(name: string) {
  return name.split(/\s+/).map((s) => s[0]).slice(0, 2).join("").toUpperCase();
}

export default function CompanyFullPage({ companyName }: { companyName: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [research, setResearch] = useState<CompanyResearch | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGetCompanyResearch(companyName);
        if (!cancelled) setResearch(data);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [companyName]);

  if (loading) {
    return <Shell><p style={{ fontSize: 14 }}>Researching {companyName}…</p></Shell>;
  }

  if (error || !research) {
    return (
      <Shell>
        <p style={{ fontSize: 14 }}>Could not load research for &ldquo;{companyName}&rdquo;.</p>
        <Link href="/dashboard" style={{ color: "var(--accent, #234033)", fontSize: 13, marginTop: 12, display: "inline-block" }}>← Back to dashboard</Link>
      </Shell>
    );
  }

  const hasData = Boolean(research.overview || research.tech_stack.length || research.culture_signals.length || research.recent_news.length);

  const kv: [string, string][] = [
    research.domain ? ["Domain", research.domain] : null,
    research.funding_stage ? ["Funding stage", research.funding_stage] : null,
    research.funding_amount ? ["Funding amount", research.funding_amount] : null,
    research.employee_count ? ["Employees", research.employee_count] : null,
    research.researched_at ? ["Last researched", new Date(research.researched_at).toLocaleDateString()] : null,
  ].filter((x): x is [string, string] => x !== null);

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
        <span style={{ fontSize: 13, color: "var(--ink, #111111)", fontWeight: 500 }}>{research.company_name}</span>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "44px 40px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <span style={{ width: 52, height: 52, borderRadius: 12, background: "var(--accent-tint, #E4EAE3)", color: "var(--accent, #234033)", display: "grid", placeItems: "center", fontFamily: "var(--serif, serif)", fontSize: 24, flexShrink: 0 }}>{initials(research.company_name)}</span>
          <div>
            <h1 style={{ fontFamily: "var(--serif, serif)", fontSize: 34, fontWeight: 400, letterSpacing: "-0.015em", lineHeight: 1.15, marginBottom: 4 }}>{research.company_name}</h1>
            {research.products && <p style={{ fontSize: 13.5, color: "var(--ink-3, #6B6B6B)", fontFamily: "var(--mono, monospace)" }}>{research.products}</p>}
          </div>
        </div>

        {!hasData && (
          <div style={{ marginBottom: 28, fontSize: 13.5, color: "var(--ink-3, #6B6B6B)", background: "var(--paper, #FCFAF5)", border: "1px solid var(--line, #E8E4DC)", borderRadius: 8, padding: "12px 18px" }}>
            No research found for this company yet.
          </div>
        )}

        {research.overview && (
          <section style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontFamily: "var(--mono, monospace)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-4, #9A9488)", marginBottom: 14 }}>Overview</div>
            <p style={{ fontSize: 14, color: "var(--ink-2, #383530)", lineHeight: 1.7 }}>{research.overview}</p>
          </section>
        )}

        {kv.length > 0 && (
          <div style={{ background: "var(--paper, #FCFAF5)", border: "1px solid var(--line, #E8E4DC)", borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
            {kv.map(([k, v], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "14px 22px", borderBottom: i < kv.length - 1 ? "1px solid var(--line-soft, #EDE9E1)" : "none" }}>
                <span style={{ fontSize: 13.5, color: "var(--ink-3, #6B6B6B)" }}>{k}</span>
                <span style={{ fontSize: 13.5, fontFamily: "var(--mono, monospace)", fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        )}

        {research.tech_stack.length > 0 && (
          <section style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontFamily: "var(--mono, monospace)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-4, #9A9488)", marginBottom: 14 }}>Tech stack</div>
            <p style={{ fontSize: 14, color: "var(--ink-2, #383530)" }}>{research.tech_stack.join(", ")}</p>
          </section>
        )}

        {research.culture_signals.length > 0 && (
          <section style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontFamily: "var(--mono, monospace)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-4, #9A9488)", marginBottom: 14 }}>Culture signals</div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {research.culture_signals.map((s, i) => (
                <li key={i} style={{ fontSize: 14, color: "var(--ink-2, #383530)", paddingLeft: 16, position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, top: 6, width: 4, height: 4, borderRadius: "50%", background: "var(--ink-4, #9A9488)", display: "block" }} />
                  {s}
                </li>
              ))}
            </ul>
          </section>
        )}

        {research.recent_news.length > 0 && (
          <section>
            <div style={{ fontSize: 11, fontFamily: "var(--mono, monospace)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-4, #9A9488)", marginBottom: 14 }}>Recent news</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {research.recent_news.map((n, i) => (
                <div key={i} style={{ background: "var(--paper, #FCFAF5)", border: "1px solid var(--line, #E8E4DC)", borderRadius: 12, padding: "14px 18px", fontSize: 13.5, color: "var(--ink-2, #383530)" }}>
                  {String(n.title ?? n.headline ?? JSON.stringify(n))}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
