"use client";
import { useState, useEffect, useRef } from "react";
import { OPPS, MISSIONS, APPS } from "@/components/dashboard/data";
import { IPSChip, Urgent, PageHead, EmptyState } from "@/components/dashboard/shared";
import { Icon } from "@/components/dashboard/icons";
import { addSkippedOpp, removeSkippedOpp } from "@/components/dashboard/session";
import type { Opp } from "@/components/dashboard/DetailPanel";

const OPP_FILTERS = ["All", "Remote", "Referral available", "⚡ Urgent", "IPS ≥ 80", "Series A–B"];

// Mission label map for group headers
const MISSION_LABELS: Record<string, string> = Object.fromEntries(
  MISSIONS.map((m) => [m.id, m.title])
);

// Map each opp ID to its current application status (if any), derived from APPS data.
// Uses company + role as the join key (matches the findOppForApp logic in Applications.tsx).
function buildAppliedMap(): Map<string, { status: string; statusLabel: string }> {
  const map = new Map<string, { status: string; statusLabel: string }>();
  for (const app of APPS) {
    const opp =
      OPPS.find((o) => o.company === app.company && o.role === app.role) ??
      OPPS.find((o) => o.company === app.company);
    if (opp && !map.has(opp.id)) {
      map.set(opp.id, { status: app.status, statusLabel: app.statusLabel });
    }
  }
  return map;
}

const APPLIED_MAP = buildAppliedMap();

// Labels shown on the opp row for each application status
const APP_STATUS_LABELS: Record<string, string> = {
  interview: "Interview",
  response: "Response",
  applied: "Applied",
  rejected: "Rejected",
  offer: "Offer",
  withdrawn: "Withdrawn",
};

// Variant selected per opp for bulk apply
function pickVariant(ips: number) { return ips >= 85 ? "B" : "A"; }

// Extracted row component used in both flat and grouped views
function OppRow({
  o,
  selectedId,
  fading,
  skipped,
  applied,
  sessionApplied,
  openOpp,
  handleSkip,
}: {
  o: Opp;
  selectedId: string | null | undefined;
  fading: Set<string>;
  skipped: Set<string>;
  applied: Map<string, { status: string; statusLabel: string }>;
  sessionApplied: Set<string>;
  openOpp: (o: Opp) => void;
  handleSkip: (e: React.MouseEvent, id: string) => void;
}) {
  const isSkipped = skipped.has(o.id);
  const isFading = fading.has(o.id);
  const existingApp = applied.get(o.id);
  const isSessionApplied = sessionApplied.has(o.id);
  const isApplied = !!existingApp || isSessionApplied;
  const appStatus = existingApp?.status ?? (isSessionApplied ? "applied" : null);
  const appStatusLabel = appStatus ? (APP_STATUS_LABELS[appStatus] ?? appStatus) : null;

  return (
    <div
      className={["opp-row", selectedId === o.id ? "sel" : "", isFading ? "fading" : "", isApplied && !isSkipped ? "already-applied" : ""].filter(Boolean).join(" ")}
      onClick={() => !isSkipped && openOpp(o)}
      style={{ cursor: isSkipped ? "default" : "pointer" }}
    >
      <IPSChip score={o.ips} size="lg" />
      <div className="or-m">
        <div className="or-role">
          {o.role}{" "}
          <span style={{ color: "var(--ink-3)", fontWeight: 400, fontFamily: "var(--mono)", fontSize: 12 }}>· {o.company}</span>
          {o.urgent && !isSkipped && !isApplied ? <Urgent /> : null}
        </div>
        <div className="or-sub">{o.stage} · {o.platform} · {o.age} old · {o.location}</div>
        <div className="or-tags">
          {o.stack.map((s) => <span className="tagchip" key={s}>{s}</span>)}
          {o.referral && !isSkipped && (
            <span className="ref">
              <span style={{ width: 12, height: 12, display: "inline-block" }}><Icon name="referral" /></span> Referral available
            </span>
          )}
        </div>
      </div>
      <div className="or-act">
        {isSkipped ? (
          <span className="pill withdrawn" style={{ fontSize: 11 }}>Skipped</span>
        ) : isApplied ? (
          <div className="opp-app-status">
            <span className={"pill app-" + (appStatus ?? "applied")} style={{ fontSize: 11 }}>
              <span className="pdot" style={{ background: "currentColor" }} />
              {appStatusLabel}
            </span>
            <button className="btn btn-quiet btn-sm" type="button" onClick={(e) => { e.stopPropagation(); openOpp(o); }}>View</button>
          </div>
        ) : (
          <>
            <button className="btn btn-quiet btn-sm" type="button" onClick={(e) => { e.stopPropagation(); openOpp(o); }}>View ▾</button>
            <button className="btn btn-quiet btn-sm" type="button" style={{ color: "var(--ink-4)" }} onClick={(e) => handleSkip(e, o.id)}>Skip</button>
          </>
        )}
      </div>
    </div>
  );
}

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
          <span className="bulk-count">{opps.length} applications · ~{opps.length * 2} min est.</span>
        </div>
      </div>
    </div>
  );
}

export default function Opportunities({ openOpp, selectedId }: { openOpp: (o: Opp) => void; selectedId?: string | null }) {
  const [filter, setFilter] = useState("All");
  const [groupByMission, setGroupByMission] = useState(false);
  // Seed with opps already skipped in data + session-skipped
  const [skipped, setSkipped] = useState<Set<string>>(() => new Set(OPPS.filter(o => o.skipped).map(o => o.id)));
  const [fading, setFading] = useState<Set<string>>(new Set());
  const [undo, setUndo] = useState<UndoState | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  // Seed applied set from APPS data + track bulk-apply adds for this session
  const [sessionApplied, setSessionApplied] = useState<Set<string>>(new Set());
  const undoRef = useRef<UndoState | null>(null);

  useEffect(() => { undoRef.current = undo; }, [undo]);

  const handleSkip = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (undoRef.current) clearTimeout(undoRef.current.timer);

    setFading((prev) => new Set(prev).add(id));

    const fadeTimer = setTimeout(() => {
      setSkipped((prev) => new Set(prev).add(id));
      setFading((prev) => { const n = new Set(prev); n.delete(id); return n; });
      // Persist to sessionStorage so Timeline can render a synthetic Skipped entry
      const opp = OPPS.find((o) => o.id === id);
      if (opp) {
        addSkippedOpp({
          id: opp.id,
          company: opp.company,
          role: opp.role,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
      }
    }, 380);

    const undoTimer = setTimeout(() => { setUndo(null); }, 3000);
    const state = { id, timer: undoTimer, fadeTimer } as UndoState & { fadeTimer: ReturnType<typeof setTimeout> };
    setUndo(state);
  };

  const handleUndo = () => {
    if (!undo) return;
    clearTimeout(undo.timer);
    const ft = (undo as UndoState & { fadeTimer?: ReturnType<typeof setTimeout> }).fadeTimer;
    if (ft) clearTimeout(ft);
    setFading((prev) => { const n = new Set(prev); n.delete(undo.id); return n; });
    setSkipped((prev) => { const n = new Set(prev); n.delete(undo.id); return n; });
    removeSkippedOpp(undo.id);
    setUndo(null);
  };

  const visibleList = OPPS.filter((o) => {
    if (skipped.has(o.id)) return filter === "All";
    switch (filter) {
      case "Remote": return o.remote;
      case "Referral available": return o.referral;
      case "⚡ Urgent": return o.urgent;
      case "IPS ≥ 80": return o.ips >= 80;
      case "Series A–B": return /Series [AB]|Seed/.test(o.stage);
      default: return true;
    }
  }).sort((a, b) => {
    // Skipped items always sort to the bottom within the "All" filter
    const aSkip = skipped.has(a.id) ? 1 : 0;
    const bSkip = skipped.has(b.id) ? 1 : 0;
    if (aSkip !== bSkip) return aSkip - bSkip;
    return b.ips - a.ips;
  });

  // Top 10 non-skipped, non-already-applied opps by IPS for bulk apply
  const bulkCandidates = [...OPPS]
    .filter((o) => !skipped.has(o.id) && !APPLIED_MAP.has(o.id))
    .sort((a, b) => b.ips - a.ips)
    .slice(0, 10);

  const handleBulkConfirm = () => {
    setSessionApplied((prev) => new Set([...prev, ...bulkCandidates.map(o => o.id)]));
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
            className={"btn btn-sm " + (groupByMission ? "btn-primary" : "btn-ghost")}
            onClick={() => setGroupByMission((g) => !g)}
            style={{ fontSize: 12 }}
          >
            {groupByMission ? "Flat view" : "Group by mission"}
          </button>
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
        ) : groupByMission ? (
          // Group by mission view
          (() => {
            const groups: Array<{ missionId: string | null; label: string; items: typeof visibleList }> = [];
            // Preserve IPS sort within groups; group order = missions order then null
            const orderedMissionIds = [...MISSIONS.map((m) => m.id), null];
            for (const mid of orderedMissionIds) {
              const items = visibleList
                .filter((o) => o.mission === mid)
                .sort((a, b) => b.ips - a.ips);
              if (items.length > 0) {
                groups.push({ missionId: mid, label: mid ? (MISSION_LABELS[mid] ?? mid) : "No mission", items });
              }
            }
            return groups.map(({ missionId, label, items }) => (
              <div key={missionId ?? "__none__"} className="mission-group">
                <div className="mg-head">
                  <span className="mg-label">{label}</span>
                  <span className="mg-count">{items.length}</span>
                  <span className="ln" />
                </div>
                {items.map((o) => <OppRow key={o.id} o={o} selectedId={selectedId} fading={fading} skipped={skipped} applied={APPLIED_MAP} sessionApplied={sessionApplied} openOpp={openOpp} handleSkip={handleSkip} />)}
              </div>
            ));
          })()
        ) : visibleList.map((o) => (
          <OppRow
            key={o.id}
            o={o}
            selectedId={selectedId}
            fading={fading}
            skipped={skipped}
            applied={APPLIED_MAP}
            sessionApplied={sessionApplied}
            openOpp={openOpp}
            handleSkip={handleSkip}
          />
        ))}
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
