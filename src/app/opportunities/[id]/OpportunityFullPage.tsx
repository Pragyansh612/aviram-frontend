"use client";
import Link from "next/link";
import type { OPPS } from "@/components/dashboard/data";
import { IPSChip, ScoreTree } from "@/components/dashboard/shared";
import { Icon } from "@/components/dashboard/icons";

type Opp = (typeof OPPS)[number];

function refInitials(refPath: string) {
  const m = refPath.match(/via (\w)\w* (\w)/);
  return m ? m[1] + m[2] : "—";
}

export default function OpportunityFullPage({ opp }: { opp: Opp | null }) {
  if (!opp) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "var(--sans, sans-serif)", background: "var(--cream, #F7F4EE)" }}>
        <div style={{ textAlign: "center", color: "var(--ink-3, #6B6B6B)" }}>
          <p style={{ fontSize: 14 }}>Opportunity not found.</p>
          <Link href="/dashboard" style={{ color: "var(--accent, #234033)", fontSize: 13, marginTop: 12, display: "inline-block" }}>← Back to dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream, #F7F4EE)", fontFamily: "var(--sans, sans-serif)" }}>
      {/* Top bar */}
      <div style={{ borderBottom: "1px solid var(--line, #E8E4DC)", padding: "0 40px", height: 52, display: "flex", alignItems: "center", gap: 16, background: "var(--paper, #FCFAF5)", position: "sticky", top: 0, zIndex: 10 }}>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ink-3, #6B6B6B)", textDecoration: "none" }}>
          <span style={{ width: 14, height: 14, display: "block" }}><Icon name="arrow" /></span>
          Dashboard
        </Link>
        <span style={{ color: "var(--line-strong, #D8D3C8)" }}>·</span>
        <span style={{ fontSize: 13, color: "var(--ink-2, #383530)", fontFamily: "var(--mono, monospace)" }}>Opportunities</span>
        <span style={{ color: "var(--line-strong, #D8D3C8)" }}>·</span>
        <span style={{ fontSize: 13, color: "var(--ink, #111111)", fontWeight: 500 }}>{opp.company} — {opp.role}</span>
        <div style={{ marginLeft: "auto" }}>
          <IPSChip score={opp.ips} size="lg" solid />
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "44px 40px 80px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "var(--serif, serif)", fontSize: 36, fontWeight: 400, letterSpacing: "-0.015em", lineHeight: 1.15, marginBottom: 8 }}>{opp.role}</h1>
          <p style={{ fontSize: 14, color: "var(--ink-3, #6B6B6B)", fontFamily: "var(--mono, monospace)" }}>{opp.company} · {opp.stage} · {opp.location} · {opp.platform}</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <section>
            <div style={{ fontSize: 11, fontFamily: "var(--mono, monospace)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-4, #9A9488)", marginBottom: 14 }}>Score breakdown</div>
            <ScoreTree tree={opp.tree} total={opp.ips} />
          </section>

          {opp.referral && opp.refPath && (
            <section>
              <div style={{ fontSize: 11, fontFamily: "var(--mono, monospace)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-4, #9A9488)", marginBottom: 14 }}>Referral path</div>
              <div style={{ background: "var(--paper, #FCFAF5)", border: "1px solid var(--line, #E8E4DC)", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--clay, #A96A2A)", color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--mono, monospace)", fontWeight: 600, fontSize: 13, flexShrink: 0 }}>{refInitials(opp.refPath)}</span>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{opp.refPath}</div>
                  <div style={{ fontFamily: "var(--mono, monospace)", fontSize: 11, color: "var(--ink-3, #6B6B6B)", marginTop: 2 }}>warm path · draft available in Outreach</div>
                </div>
              </div>
            </section>
          )}

          <section>
            <div style={{ fontSize: 11, fontFamily: "var(--mono, monospace)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-4, #9A9488)", marginBottom: 14 }}>Role</div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {opp.jd.map((l, i) => (
                <li key={i} style={{ fontSize: 14, color: "var(--ink-2, #383530)", paddingLeft: 16, position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, top: 6, width: 4, height: 4, borderRadius: "50%", background: "var(--ink-4, #9A9488)", display: "block" }} />
                  {l}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <div style={{ fontSize: 11, fontFamily: "var(--mono, monospace)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-4, #9A9488)", marginBottom: 14 }}>Signals</div>
            <div style={{ background: "var(--paper, #FCFAF5)", border: "1px solid var(--line, #E8E4DC)", borderRadius: 12, overflow: "hidden" }}>
              {([
                ["Recruiter response rate", `${opp.respRate}%`],
                opp.fundedDays != null ? ["Funding", `${opp.fundedDays} days ago`] : null,
                ["Posting age", opp.age],
                ["ATS", opp.platform],
                ["Tech stack", opp.stack.join(", ")],
              ] as ([string, string] | null)[]).filter((x): x is [string, string] => x !== null).map(([k, v], i, arr) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "13px 20px", borderBottom: i < arr.length - 1 ? "1px solid var(--line-soft, #EDE9E1)" : "none" }}>
                  <span style={{ fontSize: 13.5, color: "var(--ink-3, #6B6B6B)" }}>{k}</span>
                  <span style={{ fontSize: 13.5, fontFamily: "var(--mono, monospace)", fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
