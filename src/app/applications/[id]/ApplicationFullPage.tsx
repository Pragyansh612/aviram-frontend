"use client";
import Link from "next/link";
import { APPS } from "@/components/dashboard/data";
import { IPSChip, StatusPill } from "@/components/dashboard/shared";
import { Icon } from "@/components/dashboard/icons";
import { getSessionApps, getAppOutcomeOverrides } from "@/components/dashboard/session";

type App = (typeof APPS)[number];

function resolveApp(appId: string): App | null {
  const base = APPS.find((a) => a.id === appId);
  const session = getSessionApps().find((a) => a.id === appId);
  const raw = base ?? (session ? {
    id: session.id,
    company: session.company,
    role: session.role,
    platform: session.platform,
    status: session.status,
    statusLabel: session.statusLabel,
    date: session.date,
    ips: session.ips,
    variant: session.variant,
    coverLetter: session.coverLetter,
    events: session.events,
  } : null);
  if (!raw) return null;
  const override = getAppOutcomeOverrides()[appId];
  return override ? { ...raw, status: override.status, statusLabel: override.statusLabel } : raw;
}

export default function ApplicationFullPage({ appId }: { appId: string }) {
  const app = resolveApp(appId);
  if (!app) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "var(--sans, sans-serif)", background: "var(--cream, #F7F4EE)" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "var(--ink-3, #6B6B6B)" }}>Application not found.</p>
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
        <span style={{ fontSize: 13, color: "var(--ink-2, #383530)", fontFamily: "var(--mono, monospace)" }}>Applications</span>
        <span style={{ color: "var(--line-strong, #D8D3C8)" }}>·</span>
        <span style={{ fontSize: 13, color: "var(--ink, #111111)", fontWeight: 500 }}>{app.company} — {app.role}</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <StatusPill status={app.status} label={app.statusLabel} />
          <IPSChip score={app.ips} />
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "44px 40px 80px" }}>
        <h1 style={{ fontFamily: "var(--serif, serif)", fontSize: 36, fontWeight: 400, letterSpacing: "-0.015em", lineHeight: 1.15, marginBottom: 8 }}>{app.role}</h1>
        <p style={{ fontSize: 14, color: "var(--ink-3, #6B6B6B)", fontFamily: "var(--mono, monospace)", marginBottom: 36 }}>{app.company} · {app.platform} · Variant {app.variant} · {app.date}</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <section>
            <div style={{ fontSize: 11, fontFamily: "var(--mono, monospace)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-4, #9A9488)", marginBottom: 14 }}>Cover letter generated</div>
            <div style={{ background: "var(--paper, #FCFAF5)", border: "1px solid var(--line, #E8E4DC)", borderRadius: 12, padding: "20px 24px", fontSize: 14, lineHeight: 1.7, color: "var(--ink-2, #383530)" }}>
              {app.coverLetter}
            </div>
          </section>

          <section>
            <div style={{ fontSize: 11, fontFamily: "var(--mono, monospace)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-4, #9A9488)", marginBottom: 14 }}>Application timeline</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {app.events.map((ev, i) => (
                <div key={i} style={{ display: "flex", gap: 16, padding: "12px 0", borderBottom: i < app.events.length - 1 ? "1px solid var(--line-soft, #EDE9E1)" : "none" }}>
                  <span style={{ fontFamily: "var(--mono, monospace)", fontSize: 11.5, color: "var(--ink-4, #9A9488)", minWidth: 120, paddingTop: 1 }}>{ev.time}</span>
                  <span style={{ fontSize: 14, color: "var(--ink-2, #383530)" }}>{ev.text}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
