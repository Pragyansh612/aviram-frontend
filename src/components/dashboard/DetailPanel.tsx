"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { IPSChip, ScoreTree } from "./shared";
import { Icon } from "./icons";
import { showToast } from "./Toast";
import { useDashboard } from "@/contexts/DashboardContext";
import type { OPPS } from "./data";
import { apiGetJobDetail, apiGetActiveResume, apiGetResumeMatch } from "@/lib/api";
import type { ResumeMatchResponse } from "@/lib/api/types";

export type Opp = (typeof OPPS)[number] & {
  jobType?: string | null;
};

function refInitials(refPath: string) {
  const m = refPath.match(/via (\w)\w* (\w)/);
  return m ? m[1] + m[2] : "—";
}

export default function DetailPanel({ opp, onClose }: { opp: Opp; onClose: () => void }) {
  const { applyToJob, apiLive } = useDashboard();
  const [description, setDescription] = useState<string | null>(null);
  const [match, setMatch] = useState<ResumeMatchResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => { if (!cancelled) { setDescription(null); setMatch(null); } });
    if (!apiLive) return () => { cancelled = true; };

    apiGetJobDetail(opp.id).then((j) => { if (!cancelled) setDescription(j.description); }).catch(() => {});

    (async () => {
      try {
        const resume = await apiGetActiveResume();
        const m = await apiGetResumeMatch(resume.id, opp.id);
        if (!cancelled) setMatch(m);
      } catch {
        // no active resume or no scored match yet — section simply won't render
      }
    })();

    return () => { cancelled = true; };
  }, [opp.id, apiLive]);

  const handleQueue = async () => {
    const res = await applyToJob(opp.id);
    showToast(res.message, res.ok ? "success" : "warn");
    if (res.ok) onClose();
  };
  return (
    <>
      <div className="detail-scrim" onClick={onClose} />
      <aside className="detail-panel">
        <div className="detail-head">
          <div className="dh-l">
            <div className="dh-role">{opp.role}</div>
            <div className="dh-sub">{opp.company} · {opp.stage} · {opp.location}</div>
          </div>
          <IPSChip score={opp.ips} size="lg" solid />
          <button className="dp-close" onClick={onClose} aria-label="Close panel">
            <span style={{ width: 16, height: 16, display: "block" }}><Icon name="x" /></span>
          </button>
        </div>
        <div className="dp-fullpage-bar">
          <Link className="dp-fullpage-link" href={`/opportunities/${opp.id}`} target="_blank" rel="noopener noreferrer">
            Open full page →
          </Link>
        </div>
        <div className="detail-body">
          {opp.skipped && (
            <div className="card card-pad" style={{ background: "var(--skip-tint)", border: "none", marginBottom: 8 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--skip)", marginBottom: 6 }}>Skipped — and here's why</div>
              <div style={{ fontSize: 13.5, color: "var(--ink-2)" }}>{opp.skipReason}</div>
            </div>
          )}
          <div className="dp-sec">Score breakdown</div>
          <ScoreTree tree={opp.tree} total={opp.ips} />
          {opp.referral && opp.refPath && (
            <>
              <div className="dp-sec">Referral path</div>
              <div className="card card-pad" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className="ava" style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--clay)", color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--mono)", fontWeight: 600, fontSize: 13, flexShrink: 0 }}>
                  {refInitials(opp.refPath)}
                </span>
                <div style={{ flex: 1, fontSize: 13 }}>
                  <div style={{ fontWeight: 500 }}>{opp.refPath}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>warm path · draft available in Outreach</div>
                </div>
              </div>
            </>
          )}
          {match && (
            <>
              <div className="dp-sec">Resume match</div>
              <div className="card card-pad" style={{ fontSize: 13 }}>
                <div className="dp-kv" style={{ padding: 0, marginBottom: 8 }}>
                  <span className="k">Overall match</span>
                  <span className="v" style={{ color: "var(--accent)" }}>{Math.round(match.overall_score * 100)}%</span>
                </div>
                {match.skills_missing.length > 0 && (
                  <div style={{ color: "var(--clay)", fontSize: 12.5 }}>Missing: {match.skills_missing.join(", ")}</div>
                )}
              </div>
            </>
          )}
          <div className="dp-sec">Role</div>
          {description ? (
            <div style={{ fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{description}</div>
          ) : (
            <ul className="dp-jd">{opp.jd.map((l, i) => <li key={i}>{l}</li>)}</ul>
          )}
          <div className="dp-sec">Signals</div>
          <div className="dp-kv"><span className="k">Recruiter response rate</span><span className="v" style={{ color: "var(--accent)" }}>{opp.respRate}%</span></div>
          {opp.fundedDays != null && <div className="dp-kv"><span className="k">Funding</span><span className="v" style={{ color: "var(--clay)" }}>{opp.fundedDays} days ago</span></div>}
          <div className="dp-kv"><span className="k">Posting age</span><span className="v">{opp.age}</span></div>
          <div className="dp-kv"><span className="k">ATS</span><span className="v">{opp.platform}</span></div>
          {!opp.skipped && (
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button
                className={apiLive ? "btn btn-primary" : "btn btn-ghost"}
                onClick={handleQueue}
              >
                Queue application <span className="arr" style={{ width: 14, height: 14, display: "inline-block" }}><Icon name="arrow" /></span>
              </button>
              <button
                className="btn btn-quiet btn-sm"
                onClick={() => showToast(apiLive ? "Resume tailoring runs automatically on apply." : "Connect backend for resume tailoring.", "info")}
              >
                Tailor resume
              </button>
            </div>
          )}
          {!apiLive && (
            <div className="dp-stub-note">
              Demo mode — start the API at localhost:8000 for live applications.
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
