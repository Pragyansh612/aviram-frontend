"use client";
import { useState } from "react";
import { VAULT } from "@/components/dashboard/data";
import { PageHead } from "@/components/dashboard/shared";
import { Icon } from "@/components/dashboard/icons";

export default function ResearchVault() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(VAULT[0].id);
  const list = VAULT.filter((v) => (v.name + " " + v.tagline).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="page">
      <PageHead
        eyebrow={<><span style={{ width: 13, height: 13, display: "inline-block" }}><Icon name="vault" /></span> Research Vault</>}
        title="An agent with memory — not a job board."
        sub="Every company Aviram has investigated, kept as a living dossier. This is the why behind every score."
      />
      <div className="vault-search">
        <div className="search-input">
          <span style={{ width: 15, height: 15, color: "var(--ink-4)", display: "block", flexShrink: 0 }}><Icon name="search" /></span>
          <input placeholder="Search companies, signals, ATS…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <span style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--ink-4)" }}>{list.length} dossiers</span>
      </div>
      {list.map((v) => {
        const isOpen = open === v.id;
        return (
          <div className="dossier" key={v.id}>
            <div className="ds-head" onClick={() => setOpen(isOpen ? "" : v.id)}>
              <span className="ds-logo">{v.logo}</span>
              <div className="ds-l">
                <div className="ds-name">{v.name}</div>
                <div className="ds-tagline">{v.tagline}</div>
              </div>
              <div className="ds-sig">
                <span className={"signal-pill " + v.signal}>{v.signal === "strong" ? "Strong signal" : v.signal === "medium" ? "Medium" : "Weak"}</span>
                <span style={{ width: 16, height: 16, color: "var(--ink-4)", transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .2s", display: "block" }}><Icon name="chevron" /></span>
              </div>
            </div>
            {isOpen && (
              <div className="ds-body">
                {v.kv.map((row, i) => (
                  <div className="intel-kv" key={i}>
                    <span className="ik">{row[0]}</span>
                    <span className={"iv " + (row[2] || "")}>{row[1]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}