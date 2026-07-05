"use client";
import { useState, useRef, useEffect } from "react";
import { RESUME } from "@/components/dashboard/data";
import { PageHead, EmptyState } from "@/components/dashboard/shared";
import { showToast } from "@/components/dashboard/Toast";
import { Icon } from "@/components/dashboard/icons";
import { useDashboard } from "@/contexts/DashboardContext";
import { apiListResumes, apiUploadResume } from "@/lib/api";

export default function ResumeLab() {
  const { apiLive } = useDashboard();
  const fileRef = useRef<HTMLInputElement>(null);
  const [variants, setVariants] = useState(RESUME.variants);
  const defaultVariant = variants.find(v => v.isDefault) ?? variants[0];
  const [active, setActive] = useState(defaultVariant?.id ?? "");
  const [compare, setCompare] = useState(false);

  useEffect(() => {
    if (!apiLive) return;
    apiListResumes()
      .then((data) => {
        const rows = data.resumes ?? [];
        if (!rows.length) return;
        setVariants((prev) => {
          const mapped = rows.map((r, i) => ({
            id: String(r.id ?? `api-${i}`),
            name: String(r.filename ?? r.name ?? `Resume ${i + 1}`),
            isDefault: i === 0,
            apps: 0,
            responses: 0,
            interviews: 0,
            responseRate: 14,
            note: "Uploaded via API",
            experienceYears: 5,
            wordCount: 420,
            skills: ["Python", "Go", "PostgreSQL"],
            highlights: ["Uploaded via API"],
          }));
          if (!mapped.length) return prev;
          setActive((cur) => mapped.some((v) => v.id === cur) ? cur : mapped[0]!.id);
          return mapped;
        });
      })
      .catch(() => {});
  }, [apiLive]);

  const handleUpload = async (file: File) => {
    if (!apiLive) {
      showToast("Start the backend at localhost:8000 to upload resumes.", "warn");
      return;
    }
    try {
      const res = await apiUploadResume(file);
      showToast(`Uploaded ${res.filename}`, "success");
      const data = await apiListResumes();
      const rows = data.resumes ?? [];
      if (rows.length) {
        const mapped = rows.map((r, i) => ({
          id: String(r.id ?? `api-${i}`),
          name: String(r.filename ?? r.name ?? `Resume ${i + 1}`),
          isDefault: i === 0,
          apps: 0,
          responses: 0,
          interviews: 0,
          responseRate: 14,
          note: "Uploaded via API",
          experienceYears: 5,
          wordCount: 420,
          skills: ["Python", "Go", "PostgreSQL"],
          highlights: ["Uploaded via API"],
        }));
        setVariants(mapped);
        setActive(mapped[0]!.id);
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Upload failed", "warn");
    }
  };

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

  const preview = variants.find(v => v.id === active) ?? variants[0]!;

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
            <button type="button" className="btn btn-quiet btn-sm" onClick={() => fileRef.current?.click()}>Upload new ↑</button>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleUpload(f);
                e.target.value = "";
              }}
            />
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
