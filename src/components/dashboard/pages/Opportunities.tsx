"use client";
import { useState, useEffect, useRef } from "react";
import { OPPS, MISSIONS } from "@/components/dashboard/data";
import { IPSChip, Urgent, PageHead, EmptyState } from "@/components/dashboard/shared";
import { Icon } from "@/components/dashboard/icons";
import type { Opp } from "@/components/dashboard/DetailPanel";

const OPP_FILTERS = ["All", "Remote", "Referral available", "⚡ Urgent", "IPS ≥ 80", "Series A–B"];

// Variant selected per opp for bulk apply — in a real app this would come from the resume engine
function pickVariant(ips: number) { return ips >= 85 ? "B" : "A"; }

interface UndoState { id: string; timer: ReturnType<typeof setTimeout> }

function BulkApplySheet({
  opps,
  onConfirm,
  onCancel,
}: {
  opps: Opp[];
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="bulk-scrim" onClick={onCancel}>
      <div className="bulk-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="bulk-head">
          <div>
            <h2>Apply to top {opps.length}</h2>
            <p className="bh-sub">
              Aviram will tailor your resume for each role before submitting. Review and confirm.
            </p>
          </div>
          <button className="dp-close" onClick={onCancel} aria-label="Cancel">
            <span style={{ width: 16, height: 16, display: "block" }}><Icon name="x" /></span>
          </button>
        </div>
        <div className="bulk-body">
          {opps.map((o) => (
            <div className="bulk-row" key={o.id}>
              <IPSChip score={o.ips} />
              <div>
                <div className="br-co">{o.company}</div>
                <div className="br-role">{o.role} · {o.platform}</div>
              </div>
              <div className="br-variant">Variant {pickVariant(o.ips)}</div>
            </div>
          ))}
        </div>
        <div className="bulk-foot">
          <button className="btn btn-primary" onClick={onConfirm}>
            Confirm — apply to all {opps.length}
          </button>
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <span className="bulk-count">{opps.length} applications · {opps.length * 2} min est.</span>
        </div>
      </div>
    </div>
  );
}

export default function Opportunities({ openOpp, selectedId }: { openOpp: (o: Opp) => void; selectedId?: string | null }) {
  const [filter, setFilter] = useState("All");
  const [skipped, setSkipped] = useState<Set<string>>(() => new Set(OPPS.filter(o => o.skipped).map(o => o.id)));
  const [fading, setFading] = useState<Set<string>>(new Set());
  const [undo, setUndo] = useState<UndoState | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const undoRef = useRef<UndoState | null>(null);

  // Keep ref in sync so cleanup in skip handler can always reach latest undo
  useEffect(() => { undoRef.current = undo; }, [undo]);

  const handleSkip = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // Clear any existing undo timer
    if (undoRef.current) clearTimeout(undoRef.current.timer);

    // Fade out row
    setFading((prev) => new Set(prev).add(id));

    // After animation, mark as skipped
    const fadeTimer = setTimeout(() => {
      setSkipped((prev) => new Set(prev).add(id));
      setFading((prev) => { const n = new Set(prev); n.delete(id); return n; });
    }, 380);

    // Undo for 3 s
    const undoTimer = setTimeout(() => {
      setUndo(null);
    }, 3000);

    const state: UndoState = { id, timer: undoTimer };
    setUndo(state);

    // Store fadeTimer so undo can cancel it
    (state as UndoState & { fadeTimer: ReturnType<typeof setTimeout> }).fadeTimer = fadeTimer;
  };

  const handleUndo = () => {
    if (!undo) return;
    clearTimeout(undo.timer);
    // Also cancel any pending fade timer
    const ft = (undo as UndoState & { fadeTimer?: ReturnType<typeof setTimeout> }).fadeTimer;
    if (ft) clearTimeout(ft);
    setFading((prev) => { const n = new Set(prev); n.delete(undo.id); return n; });
    setSkipped((prev) => { const n = new Set(prev); n.delete(undo.id); return n; });
    setUndo(null);
  };

  const visibleList = OPPS.filter((o) => {
    if (skipped.has(o.id)) return filter === "All"; // show pre-skipped under All
    switch (filter) {
      case "Remote": return o.remote;
      case "Referral available": return o.referral;
      case "⚡ Urgent": return o.urgent;
      case "IPS ≥ 80": return o.ips >= 80;
      case "Series A–B": return /Series [AB]|Seed/.test(o.stage);
      default: return true;
    }
  });

  // Top 10 non-skipped by IPS for bulk apply
  const bulkCandidates = [...OPPS]
    .filter((o) => !skipped.has(o.id))
    .sort((a, b) => b.ips - a.ips)
    .slice(0, 10);

  const handleBulkConfirm = () => {
    setApplied((prev) => new Set([...prev, ...bulkCandidates.map(o => o.id)]));
    setBulkOpen(false);
  };

  return (
    <>
    <div className="page">
      <PageHead
        eyebrow={<><span style={{ width: 13, height: 13, display: "inline-block" }}><Icon name="opportunities" /></span> Opportunities</>}
        title="Not a job board. A queue, pointed at your goals."
        sub="Every opening Aviram has scored, ranked by interview probability and grouped under the missions you set."
      />
      <div className="sec-label">Active missions <span className="ln" /></div>
      <div className="missions">
        {MISSIONS.map((m) => (
          <div className="mission" key={m.id}>
            <div className="mh"><span className="mt">{m.title}</span><span className="mk">Mission</span></div>
            <div className="mfrac"><span className="big">{m.done}<span style={{ color: "var(--ink-4)", fontWeight: 400 }}>/{m.target}</span></span><span className="lbl">applications</span></div>
            <div className="mbar"><i style={{ width: (m.done / m.target * 100) + "%" }} /></div>
            <div className="mpred"><span style={{ width: 13, height: 13, display: "inline-block", color: "var(--clay)" }}><Icon name="trending" /></span> Predicted interviews <b>{m.predicted.toFixed(1)}</b></div>
          </div>
        ))}
      </div>
      <div className="sec-label" style={{ marginTop: 30 }}>Queued toward your missions <span className="ln" /></div>
      <div className="filterbar" style={{ justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {OPP_FILTERS.map((f) => (
            <button key={f} className={"fchip" + (filter === f ? " active" : "")} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {undo && (
            <button className="undo-pill" onClick={handleUndo} aria-label="Undo skip">
              ↩ Undo skip
            </button>
          )}
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setBulkOpen(true)}
            disabled={bulkCandidates.length === 0}
          >
            Apply to top 10 →
          </button>
        </div>
      </div>
      <div className="opp-list">
        {visibleList.length === 0 ? (
          <EmptyState>No opportunities match your current filters. Adjust the IPS minimum or add role types in Settings.</EmptyState>
        ) : visibleList.map((o) => {
          const isSkipped = skipped.has(o.id);
          const isFading = fading.has(o.id);
          const isApplied = applied.has(o.id);
          return (
            <div
              className={"opp-row" + (selectedId === o.id ? " sel" : "") + (isFading ? " fading" : "")}
              key={o.id}
              onClick={() => !isSkipped && openOpp(o)}
              style={{ cursor: isSkipped ? "default" : "pointer" }}
            >
              <IPSChip score={o.ips} size="lg" />
              <div className="or-m">
                <div className="or-role">
                  {o.role} <span style={{ color: "var(--ink-3)", fontWeight: 400, fontFamily: "var(--mono)", fontSize: 12 }}>· {o.company}</span>{" "}
                  {o.urgent && !isSkipped ? <Urgent /> : null}
                  {isApplied && !isSkipped && (
                    <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--accent)", marginLeft: 8, letterSpacing: "0.04em" }}>QUEUED</span>
                  )}
                </div>
                <div className="or-sub">{o.stage} · {o.platform} · {o.age} old · {o.location}</div>
                <div className="or-tags">
                  {o.stack.map((s) => <span className="tagchip" key={s}>{s}</span>)}
                  {o.referral && !isSkipped && (
                    <span className="ref"><span style={{ width: 12, height: 12, display: "inline-block" }}><Icon name="referral" /></span> Referral available</span>
                  )}
                </div>
              </div>
              <div className="or-act">
                {!isSkipped ? (
                  <>
                    <button className="btn btn-quiet btn-sm" type="button" onClick={(e) => { e.stopPropagation(); openOpp(o); }}>View ▾</button>
                    <button
                      className="btn btn-quiet btn-sm"
                      type="button"
                      style={{ color: "var(--ink-4)" }}
                      onClick={(e) => handleSkip(e, o.id)}
                    >
                      Skip
                    </button>
                  </>
                ) : (
                  <span className="pill withdrawn" style={{ fontSize: 11 }}>Skipped</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {bulkOpen && (
      <BulkApplySheet
        opps={bulkCandidates}
        onConfirm={handleBulkConfirm}
        onCancel={() => setBulkOpen(false)}
      />
    )}
    </>
  );
}
