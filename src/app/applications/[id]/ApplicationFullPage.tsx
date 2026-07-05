"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { IPSChip, StatusPill } from "@/components/dashboard/shared";
import { Icon } from "@/components/dashboard/icons";
import { apiGetApplication, apiGetJobDetail, apiUpdateApplicationOutcome } from "@/lib/api";
import { ipsDisplay, mapApplicationStatus, mapApplicationLabel } from "@/lib/api/types";
import type { ApplicationDetail, JobDetail } from "@/lib/api/types";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "var(--sans, sans-serif)", background: "var(--cream, #F7F4EE)" }}>
      <div style={{ textAlign: "center", color: "var(--ink-3, #6B6B6B)" }}>{children}</div>
    </div>
  );
}

type TimelineEvent = { time: string; text: string };

function buildEvents(app: ApplicationDetail): TimelineEvent[] {
  const events: Array<{ at: string; text: string }> = [];
  events.push({ at: app.created_at, text: "Opportunity scored and queued" });
  if (app.applied_at) events.push({ at: app.applied_at, text: "Application submitted" });
  if (app.interview_at) events.push({ at: app.interview_at, text: "Interview scheduled" });
  if (app.outcome_at && app.outcome) {
    const label = app.outcome === "offer" ? "Offer received"
      : app.outcome === "rejected" ? "Rejected"
      : app.outcome === "withdrawn" ? "Withdrawn"
      : app.outcome === "interview" ? "Interview confirmed"
      : `Outcome: ${app.outcome}`;
    events.push({ at: app.outcome_at, text: label });
  }
  if (app.failure_reason) events.push({ at: app.updated_at, text: `Failed: ${app.failure_reason}` });
  return events
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
    .map((e) => ({
      time: new Date(e.at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      text: e.text,
    }));
}

const OUTCOMES = ["interview", "offer", "rejected", "withdrawn"];

export default function ApplicationFullPage({ appId }: { appId: string }) {
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [app, setApp] = useState<ApplicationDetail | null>(null);
  const [job, setJob] = useState<JobDetail | null>(null);
  const [updating, setUpdating] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const detail = await apiGetApplication(appId);
        if (cancelled) return;
        setApp(detail);
        try {
          const jobDetail = await apiGetJobDetail(detail.job_id);
          if (!cancelled) setJob(jobDetail);
        } catch {
          // job record may have been removed — application detail still stands on its own
        }
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [appId]);

  const handleOutcome = useCallback(async (outcome: string) => {
    if (!app) return;
    setUpdating(true);
    setMsg(null);
    try {
      await apiUpdateApplicationOutcome(app.id, outcome);
      setApp({ ...app, outcome, outcome_at: new Date().toISOString() });
      setMsg(`Marked as ${outcome}.`);
    } catch {
      setMsg("Could not update outcome — try again.");
    } finally {
      setUpdating(false);
    }
  }, [app]);

  if (loading) {
    return <Shell><p style={{ fontSize: 14 }}>Loading application…</p></Shell>;
  }

  if (notFound || !app) {
    return (
      <Shell>
        <p style={{ fontSize: 14 }}>Application not found.</p>
        <Link href="/dashboard" style={{ color: "var(--accent, #234033)", fontSize: 13, marginTop: 12, display: "inline-block" }}>← Back to dashboard</Link>
      </Shell>
    );
  }

  const events = buildEvents(app);
  const ips = app.match_score != null ? ipsDisplay(app.match_score) : null;
  const title = job?.title ?? "Untitled role";
  const company = job?.company ?? "—";
  const pillStatus = app.outcome ?? mapApplicationStatus(app.status);
  const pillLabel = app.outcome
    ? app.outcome[0].toUpperCase() + app.outcome.slice(1)
    : mapApplicationLabel(app.status);
  const cover = (app.form_snapshot?.cover_letter as string | undefined)
    ?? (app.form_snapshot?.improved_cover_letter as string | undefined)
    ?? null;

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
        <span style={{ fontSize: 13, color: "var(--ink, #111111)", fontWeight: 500 }}>{company} — {title}</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <StatusPill status={pillStatus} label={pillLabel} />
          {ips != null && <IPSChip score={ips} />}
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "44px 40px 80px" }}>
        <h1 style={{ fontFamily: "var(--serif, serif)", fontSize: 36, fontWeight: 400, letterSpacing: "-0.015em", lineHeight: 1.15, marginBottom: 8 }}>{title}</h1>
        <p style={{ fontSize: 14, color: "var(--ink-3, #6B6B6B)", fontFamily: "var(--mono, monospace)", marginBottom: 24 }}>
          {company} · {app.platform}
          {app.resume_version ? ` · Resume v${app.resume_version}` : ""}
          {app.applied_at ? ` · ${new Date(app.applied_at).toLocaleDateString()}` : ""}
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
          {OUTCOMES.map((o) => (
            <button
              key={o}
              onClick={() => handleOutcome(o)}
              disabled={updating || app.outcome === o}
              style={{
                background: app.outcome === o ? "var(--accent, #234033)" : "transparent",
                color: app.outcome === o ? "#fff" : "var(--ink-3, #6B6B6B)",
                border: "1px solid var(--line, #E8E4DC)",
                borderRadius: 8,
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 500,
                cursor: updating ? "default" : "pointer",
                opacity: updating ? 0.6 : 1,
                textTransform: "capitalize",
              }}
            >
              {o}
            </button>
          ))}
        </div>

        {msg && (
          <div style={{ marginBottom: 28, fontSize: 13.5, color: "var(--accent, #234033)", background: "var(--accent-tint, #E4EAE3)", borderRadius: 8, padding: "10px 16px" }}>
            {msg}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {cover && (
            <section>
              <div style={{ fontSize: 11, fontFamily: "var(--mono, monospace)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-4, #9A9488)", marginBottom: 14 }}>Cover letter</div>
              <div style={{ background: "var(--paper, #FCFAF5)", border: "1px solid var(--line, #E8E4DC)", borderRadius: 12, padding: "20px 24px", fontSize: 14, lineHeight: 1.7, color: "var(--ink-2, #383530)", whiteSpace: "pre-wrap" }}>
                {cover}
              </div>
            </section>
          )}

          {app.result_message && (
            <section>
              <div style={{ fontSize: 11, fontFamily: "var(--mono, monospace)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-4, #9A9488)", marginBottom: 14 }}>Result</div>
              <div style={{ fontSize: 14, color: "var(--ink-2, #383530)", lineHeight: 1.6 }}>{app.result_message}</div>
            </section>
          )}

          <section>
            <div style={{ fontSize: 11, fontFamily: "var(--mono, monospace)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-4, #9A9488)", marginBottom: 14 }}>Application timeline</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {events.map((ev, i) => (
                <div key={i} style={{ display: "flex", gap: 16, padding: "12px 0", borderBottom: i < events.length - 1 ? "1px solid var(--line-soft, #EDE9E1)" : "none" }}>
                  <span style={{ fontFamily: "var(--mono, monospace)", fontSize: 11.5, color: "var(--ink-4, #9A9488)", minWidth: 120, paddingTop: 1 }}>{ev.time}</span>
                  <span style={{ fontSize: 14, color: "var(--ink-2, #383530)" }}>{ev.text}</span>
                </div>
              ))}
            </div>
          </section>

          {job?.apply_url && (
            <a href={job.apply_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "var(--ink-3, #6B6B6B)" }}>
              View original posting →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
