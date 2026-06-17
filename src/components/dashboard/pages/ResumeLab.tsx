"use client";
import { useState } from "react";
import { RESUME } from "@/components/dashboard/data";
import { PageHead, EmptyState } from "@/components/dashboard/shared";
import { showToast } from "@/components/dashboard/Toast";
import { Icon } from "@/components/dashboard/icons";

export default function ResumeLab() {
  const variants = RESUME.variants;
  const defaultVariant = variants.find(v => v.isDefault) ?? variants[0];
  const [active, setActive] = useState(defaultVariant?.id ?? "");
  const [compare, setCompare] = useState(false);

  if (variants.length === 0) {
    return (
      <div className="page">
        <PageHead
          eyebrow={<><span style={{ width: 13, height: 13, display: "inline-block" }}><Icon name="resume" /></span> Resume Lab</>}
          title="A workspace, not a settings page."
          sub="Aviram keeps several versions of your resume in play, measures which one actually gets replies, and promotes the winner."
        />
        <EmptyState>No resume versions yet. Upload one to get started.</EmptyState>
      </div>
    );
  }

  const preview = variants.find(v => v.id === active)!;

  return (
    <div className="page">
      <PageHead
        eyebrow={<><span style={{ width: 13, height: 13, display: "inline-block" }}><Icon name="resume" /></span> Resume Lab</>}
        title="A workspace, not a settings page."
        sub="Aviram keeps several versions of your resume in play, measures which one actually gets replies, and promotes the winner."
        right={
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className={"btn btn-sm " + (compare ? "btn-primary" : "btn-ghost")} onClick={() => setCompare(!compare)}>
              {compare ? "Exit compare" : "Compare versions"}
            </button>
            <button type="button" className="btn btn-quiet btn-sm" onClick={() => showToast("Resume upload will be available when connected to backend.")}>Upload new ↑</button>
          </div>
        }
      />

      <div className="resume-active card">
        <div className="ra-head">
          <div>
            <span className="ra-kicker">Active resume · {preview.name}</span>
            {preview.isDefault && <span className="vc-default">Default</span>}
          </div>
          <div className="ra-stats mono">
            <span><b>{preview.experienceYears}</b> yrs exp</span>
            <span><b>{preview.wordCount}</b> words</span>
            <span><b>{preview.skills.length}</b> skills</span>
            <span><b>{preview.responseRate}%</b> reply rate</span>
          </div>
        </div>
        <div className="ra-skills">
          {preview.skills.map((s) => <span className="tagchip" key={s}>{s}</span>)}
        </div>
        <ul className="ra-highlights">
          {preview.highlights.map((h, i) => <li key={i}>{h}</li>)}
        </ul>
        <p className="ra-note">{preview.note}</p>
      </div>

      {compare && (
        <div className="compare-grid">
          {variants.map((v) => (
            <div className={"compare-col" + (v.isDefault ? " winner" : "")} key={v.id}>
              <div className="cmp-head">
                <span className="cmp-name">{v.name}</span>
                {v.isDefault && <span className="vc-default">Default</span>}
              </div>
              <div className="cmp-metrics">
                <div className="cmp-m"><span className="n">{v.responseRate}%</span><span className="k">reply rate</span></div>
                <div className="cmp-m"><span className="n">{v.interviews}</span><span className="k">interviews</span></div>
                <div className="cmp-m"><span className="n">{v.responses}</span><span className="k">responses</span></div>
                <div className="cmp-m"><span className="n">{v.apps}</span><span className="k">applications</span></div>
              </div>
              <p className="cmp-note">{v.note}</p>
            </div>
          ))}
        </div>
      )}

      <div className="lab-grid" style={{ marginTop: 28 }}>
        <div>
          <div className="sec-label">Versions in play <span className="ln" /></div>
          {variants.map((v) => (
            <div className={"variant-card" + (active === v.id ? " active" : "")} key={v.id} onClick={() => setActive(v.id)} style={{ cursor: "pointer" }} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") setActive(v.id); }}>
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
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ marginTop: 2 }}
              onClick={() => showToast(`Setting Variant ${RESUME.experiment.winner} as default will be available when connected to backend.`)}
            >
              Set {RESUME.experiment.winner} as default
            </button>
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
