"use client";
import { IPSChip } from "./shared";
import { Icon } from "./icons";
import type { Opp } from "./DetailPanel";

function pickVariant(ips: number) { return ips >= 85 ? "B" : "A"; }

export default function BulkApplyPanel({
  opps,
  onConfirm,
  onCancel,
}: {
  opps: Opp[];
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <div className="detail-scrim" onClick={onCancel} />
      <aside className="detail-panel bulk-panel">
        <div className="detail-head">
          <div className="dh-l">
            <div className="dh-role">Apply to top {opps.length}</div>
            <div className="dh-sub">Review exactly which roles, at what IPS, with what resume variant.</div>
          </div>
          <button className="dp-close" onClick={onCancel} aria-label="Close panel">
            <span style={{ width: 16, height: 16, display: "block" }}><Icon name="x" /></span>
          </button>
        </div>
        <div className="detail-body" style={{ paddingBottom: 0 }}>
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
        <div className="bulk-foot panel-foot">
          <button className="btn btn-primary" type="button" onClick={onConfirm}>
            Confirm — apply to all {opps.length}
          </button>
          <button className="btn btn-ghost" type="button" onClick={onCancel}>Cancel</button>
          <span className="bulk-count">{opps.length} applications · ~{opps.length * 2} min est.</span>
        </div>
      </aside>
    </>
  );
}
