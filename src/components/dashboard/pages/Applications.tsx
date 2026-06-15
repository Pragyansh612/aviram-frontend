"use client";
import { useState } from "react";
import { APPS } from "@/components/dashboard/data";
import { IPSChip, StatusPill, PageHead } from "@/components/dashboard/shared";
import { Icon } from "@/components/dashboard/icons";

const APP_TABS = [
  { id: "all", label: "All" }, { id: "applied", label: "In Progress" },
  { id: "response", label: "Responses" }, { id: "interview", label: "Interviews" },
  { id: "closed", label: "Closed" },
];

export default function Applications() {
  const [tab, setTab] = useState("all");
  const match = (a: typeof APPS[0]) => {
    switch (tab) {
      case "applied": return a.status === "applied";
      case "response": return a.status === "response";
      case "interview": return a.status === "interview";
      case "closed": return ["rejected", "offer", "withdrawn"].includes(a.status);
      default: return true;
    }
  };
  const list = APPS.filter(match);
  const counts = {
    all: APPS.length,
    applied: APPS.filter(a => a.status === "applied").length,
    response: APPS.filter(a => a.status === "response").length,
    interview: APPS.filter(a => a.status === "interview").length,
    closed: APPS.filter(a => ["rejected","offer","withdrawn"].includes(a.status)).length,
  };
  return (
    <div className="page">
      <PageHead
        eyebrow={<><span style={{ width: 13, height: 13, display: "inline-block" }}><Icon name="applications" /></span> Applications</>}
        title="The table view, for when you want the receipts."
        sub="Every application Aviram has submitted on your behalf, with the resume variant and score at the moment it went out."
      />
      <div className="filterbar">
        {APP_TABS.map((t) => (
          <button key={t.id} className={"fchip" + (tab === t.id ? " active" : "")} onClick={() => setTab(t.id)}>
            {t.label}<span className="cnt">{counts[t.id as keyof typeof counts]}</span>
          </button>
        ))}
      </div>
      <div className="apps-table">
        <div className="apps-colhead">
          <span>Company / Role</span><span>Status</span>
          <span className="h-variant">Resume</span><span className="h-ips">IPS</span><span>Applied</span>
        </div>
        {list.map((a) => (
          <div className="apps-row" key={a.id}>
            <div><div className="ar-co">{a.company}</div><div className="ar-role">{a.role} · {a.platform}</div></div>
            <StatusPill status={a.status} label={a.statusLabel} />
            <span className="ar-variant">Variant {a.variant}</span>
            <span className="ar-ips"><IPSChip score={a.ips} /></span>
            <span className="ar-date">{a.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}