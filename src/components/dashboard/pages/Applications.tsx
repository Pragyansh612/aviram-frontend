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
  const [expanded, setExpanded] = useState<string | null>(null);

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

  const toggle = (id: string) => setExpanded(expanded === id ? null : id);

  return (
    <div className="page">
      <PageHead
        eyebrow={<><span style={{ width: 13, height: 13, display: "inline-block" }}><Icon name="applications" /></span> Applications</>}
        title="The table view, for when you want the receipts."
        sub="Every application Aviram has submitted on your behalf, with the resume variant and score at the moment it went out."
      />
      <div className="filterbar">
        {APP_TABS.map((t) => (
          <button key={t.id} type="button" className={"fchip" + (tab === t.id ? " active" : "")} onClick={() => setTab(t.id)}>
            {t.label}<span className="cnt">{counts[t.id as keyof typeof counts]}</span>
          </button>
        ))}
      </div>
      <div className="apps-table">
        <div className="apps-colhead">
          <span>Company / Role</span><span>Status</span>
          <span className="h-variant">Resume</span><span className="h-ips">IPS</span><span>Applied</span>
        </div>
        {list.map((a) => {
          const isOpen = expanded === a.id;
          const withdrawn = a.status === "withdrawn";
          return (
            <div key={a.id} className={"apps-block" + (isOpen ? " open" : "")}>
              <div
                className={"apps-row" + (withdrawn ? " withdrawn" : "") + (isOpen ? " sel" : "")}
                onClick={() => toggle(a.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(a.id); } }}
              >
                <div>
                  <div className="ar-co">{a.company}</div>
                  <div className="ar-role">{a.role} · {a.platform}</div>
                </div>
                <StatusPill status={a.status} label={a.statusLabel} />
                <span className="ar-variant">Variant {a.variant}</span>
                <span className="ar-ips"><IPSChip score={a.ips} /></span>
                <span className="ar-date">{a.date}</span>
              </div>
              {isOpen && (
                <div className="apps-expand">
                  <div className="ae-col">
                    <div className="ae-label">Cover letter generated</div>
                    <p className="ae-cover">{a.coverLetter}</p>
                  </div>
                  <div className="ae-col">
                    <div className="ae-label">Resume version</div>
                    <p className="ae-meta">Variant {a.variant} · IPS {a.ips} at submission · {a.platform}</p>
                  </div>
                  <div className="ae-col">
                    <div className="ae-label">Application timeline</div>
                    <ul className="ae-events">
                      {a.events.map((ev, i) => (
                        <li key={i}><span className="ae-time">{ev.time}</span>{ev.text}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="ae-act">
                    <button type="button" className="btn btn-ghost btn-sm">Update outcome</button>
                    <button type="button" className="btn btn-quiet btn-sm">View full detail →</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
