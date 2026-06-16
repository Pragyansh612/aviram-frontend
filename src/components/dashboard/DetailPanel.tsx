"use client";
import { IPSChip, ScoreTree } from "./shared";
import { Icon } from "./icons";
import type { OPPS } from "./data";

export type Opp = (typeof OPPS)[number];

function refInitials(refPath: string) {
  const m = refPath.match(/via (\w)\w* (\w)/);
  return m ? m[1] + m[2] : "—";
}

export default function DetailPanel({ opp, onClose }: { opp: Opp; onClose: () => void }) {
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
          <div className="dp-sec">Role</div>
          <ul className="dp-jd">{opp.jd.map((l, i) => <li key={i}>{l}</li>)}</ul>
          <div className="dp-sec">Signals</div>
          <div className="dp-kv"><span className="k">Recruiter response rate</span><span className="v" style={{ color: "var(--accent)" }}>{opp.respRate}%</span></div>
          {opp.fundedDays != null && <div className="dp-kv"><span className="k">Funding</span><span className="v" style={{ color: "var(--clay)" }}>{opp.fundedDays} days ago</span></div>}
          <div className="dp-kv"><span className="k">Posting age</span><span className="v">{opp.age}</span></div>
          <div className="dp-kv"><span className="k">ATS</span><span className="v">{opp.platform}</span></div>
          {!opp.skipped && (
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button className="btn btn-primary">Queue application <span className="arr" style={{ width: 14, height: 14, display: "inline-block" }}><Icon name="arrow" /></span></button>
              <button className="btn btn-ghost">Tailor resume</button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
