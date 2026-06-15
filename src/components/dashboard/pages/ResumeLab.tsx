"use client";
import { useState } from "react";
import { RESUME } from "@/components/dashboard/data";
import { PageHead } from "@/components/dashboard/shared";
import { Icon } from "@/components/dashboard/icons";

export default function ResumeLab() {
  const [active, setActive] = useState(RESUME.variants.find(v => v.isDefault)!.id);
  return (
    <div className="page">
      <PageHead
        eyebrow={<><span style={{ width: 13, height: 13, display: "inline-block" }}><Icon name="resume" /></span> Resume Lab</>}
        title="A workspace, not a settings page."
        sub="Aviram keeps several versions of your resume in play, measures which one actually gets replies, and promotes the winner."
        right={<button className="btn btn-ghost btn-sm">Upload new ↑</button>}
      />
      <div className="lab-grid">
        <div>
          <div className="sec-label">Versions in play <span className="ln" /></div>
          {RESUME.variants.map((v) => (
            <div className={"variant-card" + (active === v.id ? " active" : "")} key={v.id} onClick={() => setActive(v.id)} style={{ cursor: "pointer" }}>
              <div className="vc-head">
                <span className="vc-name">{v.name}</span>
                {v.isDefault && <span className="vc-default">Default</span>}
                <span style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-3)" }}>{v.responseRate}% reply rate</span>
              </div>
              <div className="vc-stats">
                <div className="vc-stat"><div className="n">{v.apps}</div><div className="k">applications</div></div>
                <div className="vc-stat"><div className="n">{v.responses}</div><div className="k">responses</div></div>
                <div className="vc-stat"><div className="n">{v.interviews}</div><div className="k">interviews</div></div>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 12, borderTop: "1px solid var(--line-soft)", paddingTop: 10 }}>{v.note}</div>
            </div>
          ))}
          <div className="sec-label" style={{ marginTop: 26 }}>Active variant by role <span className="ln" /></div>
          <div className="card">
            {RESUME.byCategory.map((c, i) => (
              <div key={i} className="dp-kv" style={{ padding: "13px 18px", borderBottom: i < RESUME.byCategory.length - 1 ? "1px solid var(--line-soft)" : "none" }}>
                <span className="k" style={{ fontSize: 13.5 }}>{c.cat}</span>
                <span className="v" style={{ color: "var(--accent)" }}>Variant {c.variant}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="sec-label">Experiment engine <span className="ln" /></div>
          <div className="exp-card">
            <div className="ec-kick">Live A/B · statistically significant</div>
            <div className="ec-stat">Variant {RESUME.experiment.winner} is outperforming Variant {RESUME.experiment.loser} by <b>{RESUME.experiment.lift}%</b> for {RESUME.experiment.category}.</div>
            <div className="ec-meta">{RESUME.experiment.apps} applications tested · confidence: {RESUME.experiment.confidence}</div>
            <button className="btn" style={{ background: "var(--deep-fg)", color: "var(--deep-bg)" }}>Set {RESUME.experiment.winner} as default</button>
          </div>
          <div className="sec-label" style={{ marginTop: 26 }}>Skills gap <span className="ln" /></div>
          <div className="card card-pad">
            <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 6 }}>Appearing in your queue, missing from your active resume:</div>
            {RESUME.gaps.map((g, i) => (
              <div className="gap-row" key={i}>
                <span className="gk">{g.skill}</span>
                <span className="gc">{g.appearances}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}