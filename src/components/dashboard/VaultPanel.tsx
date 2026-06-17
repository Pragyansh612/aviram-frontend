"use client";
import Link from "next/link";
import { Icon } from "./icons";
import type { VAULT } from "./data";

export type VaultEntry = (typeof VAULT)[number];

export default function VaultPanel({ entry, onClose }: { entry: VaultEntry; onClose: () => void }) {
  return (
    <>
      <div className="detail-scrim" onClick={onClose} />
      <aside className="detail-panel">
        <div className="detail-head">
          <div className="dh-l">
            <div className="dh-role">{entry.name}</div>
            <div className="dh-sub">{entry.tagline}</div>
          </div>
          <span className={"signal-pill " + entry.signal} style={{ flexShrink: 0 }}>
            {entry.signal === "strong" ? "Strong signal" : entry.signal === "medium" ? "Medium" : "Weak"}
          </span>
          <button className="dp-close" onClick={onClose} aria-label="Close panel">
            <span style={{ width: 16, height: 16, display: "block" }}><Icon name="x" /></span>
          </button>
        </div>
        <div className="dp-fullpage-bar">
          <Link className="dp-fullpage-link" href={`/companies/${entry.name.toLowerCase()}`} target="_blank" rel="noopener noreferrer">
            Open full page →
          </Link>
        </div>
        <div className="detail-body">
          <div className="dp-sec">Dossier</div>
          {entry.kv.map(([k, v, cls], i) => (
            <div className="dp-kv" key={i}>
              <span className="k">{k}</span>
              <span className={"v " + (cls === "good" ? "" : cls === "amber" ? "" : "")} style={{
                color: cls === "good" ? "var(--accent)" : cls === "amber" ? "var(--clay)" : undefined,
                fontWeight: cls === "good" || cls === "amber" ? 500 : undefined,
              }}>{v}</span>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
