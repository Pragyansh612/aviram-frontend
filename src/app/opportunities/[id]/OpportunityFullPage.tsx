"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { IPSChip, ScoreTree } from "@/components/dashboard/shared";
import { Icon } from "@/components/dashboard/icons";
import {
  apiGetJobDetail,
  apiComputeIPS,
  apiGetReferralPaths,
  apiGetActiveResume,
  apiGetResumeMatch,
  apiApplyToJob,
  apiRecordOpportunityInteraction,
} from "@/lib/api";
import { ipsDisplay, ageFromPosted } from "@/lib/api/types";
import type {
  JobDetail,
  ComputeIPSResponse,
  ReferralPath,
  ResumeMatchResponse,
} from "@/lib/api/types";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "var(--sans, sans-serif)", background: "var(--cream, #F7F4EE)" }}>
      <div style={{ textAlign: "center", color: "var(--ink-3, #6B6B6B)" }}>{children}</div>
    </div>
  );
}

export default function OpportunityFullPage({ jobId }: { jobId: string }) {
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [job, setJob] = useState<JobDetail | null>(null);
  const [ips, setIps] = useState<ComputeIPSResponse | null>(null);
  const [paths, setPaths] = useState<ReferralPath[]>([]);
  const [match, setMatch] = useState<ResumeMatchResponse | null>(null);
  const [busy, setBusy] = useState<"apply" | "skip" | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const jobDetail = await apiGetJobDetail(jobId);
        if (cancelled) return;
        setJob(jobDetail);
      } catch {
        if (!cancelled) setNotFound(true);
        return;
      } finally {
        if (!cancelled) setLoading(false);
      }

      apiRecordOpportunityInteraction(jobId, "viewed").catch(() => {});

      const [ipsRes, pathsRes, resumeRes] = await Promise.allSettled([
        apiComputeIPS(jobId),
        apiGetReferralPaths(jobId),
        apiGetActiveResume(),
      ]);

      if (cancelled) return;
      if (ipsRes.status === "fulfilled") setIps(ipsRes.value);
      if (pathsRes.status === "fulfilled") setPaths(pathsRes.value.paths);

      if (resumeRes.status === "fulfilled") {
        try {
          const m = await apiGetResumeMatch(resumeRes.value.id, jobId);
          if (!cancelled) setMatch(m);
        } catch {
          // no match available — resume intelligence may not have scored this pair yet
        }
      }
    })();

    return () => { cancelled = true; };
  }, [jobId]);

  const handleApply = useCallback(async () => {
    setBusy("apply");
    setActionMsg(null);
    try {
      const res = await apiApplyToJob(jobId);
      setActionMsg(res.message ?? (res.success ? "Application queued." : "Could not queue application."));
    } catch {
      setActionMsg("Could not queue application — try again.");
    } finally {
      setBusy(null);
    }
  }, [jobId]);

  const handleSkip = useCallback(async () => {
    setBusy("skip");
    setActionMsg(null);
    try {
      await apiRecordOpportunityInteraction(jobId, "skipped", "Skipped from full page");
      setActionMsg("Skipped — this opportunity won't be surfaced again.");
    } catch {
      setActionMsg("Could not record skip — try again.");
    } finally {
      setBusy(null);
    }
  }, [jobId]);

  if (loading) {
    return <Shell><p style={{ fontSize: 14 }}>Loading opportunity…</p></Shell>;
  }

  if (notFound || !job) {
    return (
      <Shell>
        <p style={{ fontSize: 14 }}>Opportunity not found.</p>
        <Link href="/dashboard" style={{ color: "var(--accent, #234033)", fontSize: 13, marginTop: 12, display: "inline-block" }}>← Back to dashboard</Link>
      </Shell>
    );
  }

  const displayIps = ips ? ipsDisplay(ips.ips_score) : null;
  const tree = ips
    ? {
        match: Math.round((ips.components.semantic_score ?? 0) * 100),
        urgency: Math.round((ips.components.urgency_score ?? 0) * 100),
        referral: (ips.components.referral_bonus ?? 0) > 0 ? "Found" : "Not found",
        response: ips.components.company_rate != null ? Math.round(ips.components.company_rate * 100) : 15,
      }
    : null;

  const salary = job.salary_min || job.salary_max
    ? `${job.salary_currency} ${job.salary_min ?? "?"}${job.salary_max ? ` – ${job.salary_max}` : "+"}`
    : null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream, #F7F4EE)", fontFamily: "var(--sans, sans-serif)" }}>
      <div style={{ borderBottom: "1px solid var(--line, #E8E4DC)", padding: "0 40px", height: 52, display: "flex", alignItems: "center", gap: 16, background: "var(--paper, #FCFAF5)", position: "sticky", top: 0, zIndex: 10 }}>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ink-3, #6B6B6B)", textDecoration: "none" }}>
          <span style={{ width: 14, height: 14, display: "block" }}><Icon name="arrow" /></span>
          Dashboard
        </Link>
        <span style={{ color: "var(--line-strong, #D8D3C8)" }}>·</span>
        <span style={{ fontSize: 13, color: "var(--ink-2, #383530)", fontFamily: "var(--mono, monospace)" }}>Opportunities</span>
        <span style={{ color: "var(--line-strong, #D8D3C8)" }}>·</span>
        <span style={{ fontSize: 13, color: "var(--ink, #111111)", fontWeight: 500 }}>{job.company} — {job.title}</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          {displayIps != null && <IPSChip score={displayIps} size="lg" solid />}
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "44px 40px 80px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "var(--serif, serif)", fontSize: 36, fontWeight: 400, letterSpacing: "-0.015em", lineHeight: 1.15, marginBottom: 8 }}>{job.title}</h1>
          <p style={{ fontSize: 14, color: "var(--ink-3, #6B6B6B)", fontFamily: "var(--mono, monospace)" }}>
            {job.company} · {job.location ?? "—"} · {job.remote_type}
            {salary ? ` · ${salary}` : ""}
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 36 }}>
          <button
            onClick={handleApply}
            disabled={busy !== null}
            style={{ background: "var(--accent, #234033)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13.5, fontWeight: 500, cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1 }}
          >
            {busy === "apply" ? "Queuing…" : "Apply"}
          </button>
          <button
            onClick={handleSkip}
            disabled={busy !== null}
            style={{ background: "transparent", color: "var(--ink-3, #6B6B6B)", border: "1px solid var(--line, #E8E4DC)", borderRadius: 8, padding: "10px 20px", fontSize: 13.5, fontWeight: 500, cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1 }}
          >
            {busy === "skip" ? "Skipping…" : "Skip"}
          </button>
          <a
            href={job.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginLeft: "auto", fontSize: 13, color: "var(--ink-3, #6B6B6B)", alignSelf: "center", textDecoration: "none" }}
          >
            View original posting →
          </a>
        </div>

        {actionMsg && (
          <div style={{ marginBottom: 28, fontSize: 13.5, color: "var(--accent, #234033)", background: "var(--accent-tint, #E4EAE3)", borderRadius: 8, padding: "10px 16px" }}>
            {actionMsg}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {tree && (
            <section>
              <div style={{ fontSize: 11, fontFamily: "var(--mono, monospace)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-4, #9A9488)", marginBottom: 14 }}>Score breakdown</div>
              <ScoreTree tree={tree} total={displayIps ?? 0} />
              {ips?.explanation && (
                <p style={{ fontSize: 13, color: "var(--ink-3, #6B6B6B)", marginTop: 10, lineHeight: 1.6 }}>{ips.explanation}</p>
              )}
            </section>
          )}

          {paths.length > 0 && (
            <section>
              <div style={{ fontSize: 11, fontFamily: "var(--mono, monospace)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-4, #9A9488)", marginBottom: 14 }}>Referral paths</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {paths.map((p) => (
                  <div key={p.id} style={{ background: "var(--paper, #FCFAF5)", border: "1px solid var(--line, #E8E4DC)", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--clay, #A96A2A)", color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--mono, monospace)", fontWeight: 600, fontSize: 13, flexShrink: 0 }}>
                      {p.connection_name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                    </span>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{p.connection_name}{p.connection_role ? ` · ${p.connection_role}` : ""}</div>
                      <div style={{ fontFamily: "var(--mono, monospace)", fontSize: 11, color: "var(--ink-3, #6B6B6B)", marginTop: 2 }}>
                        {p.path_type} · strength {Math.round(p.path_strength * 100)}%{p.mutual_contact ? ` · via ${p.mutual_contact}` : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {match && (
            <section>
              <div style={{ fontSize: 11, fontFamily: "var(--mono, monospace)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-4, #9A9488)", marginBottom: 14 }}>Resume match</div>
              <div style={{ background: "var(--paper, #FCFAF5)", border: "1px solid var(--line, #E8E4DC)", borderRadius: 12, padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 13.5, color: "var(--ink-3, #6B6B6B)" }}>Overall match</span>
                  <span style={{ fontSize: 13.5, fontFamily: "var(--mono, monospace)", fontWeight: 500 }}>{Math.round(match.overall_score * 100)}%</span>
                </div>
                {match.skills_matched.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11.5, color: "var(--ink-4, #9A9488)", marginBottom: 6 }}>Matched skills</div>
                    <div style={{ fontSize: 13, color: "var(--ink-2, #383530)" }}>{match.skills_matched.join(", ")}</div>
                  </div>
                )}
                {match.skills_missing.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-4, #9A9488)", marginBottom: 6 }}>Missing skills</div>
                    <div style={{ fontSize: 13, color: "var(--clay, #A96A2A)" }}>{match.skills_missing.join(", ")}</div>
                  </div>
                )}
              </div>
            </section>
          )}

          {job.description && (
            <section>
              <div style={{ fontSize: 11, fontFamily: "var(--mono, monospace)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-4, #9A9488)", marginBottom: 14 }}>Role</div>
              <div style={{ fontSize: 14, color: "var(--ink-2, #383530)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{job.description}</div>
            </section>
          )}

          <section>
            <div style={{ fontSize: 11, fontFamily: "var(--mono, monospace)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-4, #9A9488)", marginBottom: 14 }}>Signals</div>
            <div style={{ background: "var(--paper, #FCFAF5)", border: "1px solid var(--line, #E8E4DC)", borderRadius: 12, overflow: "hidden" }}>
              {([
                ["Posting age", ageFromPosted(job.posted_at)],
                job.job_sources && job.job_sources.length > 0 ? ["Sources", job.job_sources.map((s) => s.platform).join(", ")] : null,
                ["Skills required", job.skills_required.length > 0 ? job.skills_required.join(", ") : "—"],
                ["Job type", job.job_type ?? "—"],
                job.alternate_urls.length > 0 ? ["Also posted on", `${job.alternate_urls.length} other link(s)`] : null,
              ] as ([string, string] | null)[]).filter((x): x is [string, string] => x !== null).map(([k, v], i, arr) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "13px 20px", borderBottom: i < arr.length - 1 ? "1px solid var(--line-soft, #EDE9E1)" : "none" }}>
                  <span style={{ fontSize: 13.5, color: "var(--ink-3, #6B6B6B)" }}>{k}</span>
                  <span style={{ fontSize: 13.5, fontFamily: "var(--mono, monospace)", fontWeight: 500, textAlign: "right" }}>{v}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
