"use client";
import { useState } from "react";
import { TIMELINE } from "@/components/dashboard/data";
import { IPSChip, PageHead, EmptyState, useStagger } from "@/components/dashboard/shared";
import { Icon } from "@/components/dashboard/icons";
import type { PageId } from "@/components/dashboard/shared";

const arrIcon: React.CSSProperties = { width: 14, height: 14, display: "inline-block" };
const iconSm: React.CSSProperties = { width: 13, height: 13, display: "inline-block" };

const TL_FILTERS = [
  { id: "all", label: "All" }, { id: "applied", label: "Applied" },
  { id: "response", label: "Responses" }, { id: "interview", label: "Interviews" },
  { id: "referral", label: "Referrals" }, { id: "skipped", label: "Skipped" },
];
const TL_ICON: Record<string, string> = {
  interview: "calendar", applied: "check", referral: "referral", resume: "doc",
  scored: "target", skipped: "skip", response: "outreach",
};

export default function Timeline({ goTo }: { goTo: (p: PageId) => void }) {
  const [filter, setFilter] = useState("all");
  const match = (e: typeof TIMELINE[0]["events"][0]) =>
    filter === "all" ? true : filter === "response" ? e.type === "response" : e.type === filter;

  const groups = TIMELINE.map((group) => ({
    day: group.day,
    events: group.events.filter(match),
  })).filter((g) => g.events.length > 0);

  const hasAnyEvents = TIMELINE.some((g) => g.events.length > 0);
  const totalEvents = groups.reduce((n, g) => n + g.events.length, 0);
  const shown = useStagger(totalEvents, totalEvents > 0, 50, 60);
  let eventIdx = 0;

  return (
    <div className="page">
      <PageHead
        eyebrow={<><span style={iconSm}><Icon name="timeline" /></span> Timeline</>}
        title="Everything Aviram did, while you didn't."
        sub="A chronological log of every action — the applications, the rewrites, and the openings it chose to walk away from."
      />
      <div className="filterbar">
        {TL_FILTERS.map((f) => (
          <button key={f.id} className={"fchip" + (filter === f.id ? " active" : "")} onClick={() => setFilter(f.id)}>{f.label}</button>
        ))}
      </div>
      {!hasAnyEvents ? (
        <EmptyState>No activity yet. Aviram will begin logging actions once auto-apply is configured.</EmptyState>
      ) : totalEvents === 0 ? (
        <EmptyState>No events match this filter.</EmptyState>
      ) : (
        <div className="tl-wrap">
          {groups.map((group) => (
            <div key={group.day}>
              <div className="tl-day">{group.day}</div>
              <div className="tl-dayrule" />
              {group.events.map((e, i) => {
                const idx = eventIdx++;
                const visible = idx < shown;
                return (
                  <div
                    className={"tl-event ev-" + e.type + (visible ? " tl-in" : "")}
                    key={group.day + "-" + i}
                  >
                    <div className="tl-time">{e.time}</div>
                    <div className="tl-body">
                      <div className="tl-type">
                        <span className="tic"><Icon name={TL_ICON[e.type] || "dot"} /></span>
                        <span className="tname">{e.title}</span>
                        {e.ips != null && <span style={{ marginLeft: "auto" }}><IPSChip score={e.ips} /></span>}
                      </div>
                      <div className="tl-desc"><span className="co">{e.company}</span> · {e.role}</div>
                      {e.extra && <div className="tl-extra">{e.extra}</div>}
                      {e.action && (
                        <div className="tl-row-act">
                          <button
                            className="btn-link"
                            onClick={() => goTo(e.type === "interview" ? "prep" : e.type === "referral" ? "outreach" : "applications")}
                          >
                            {e.action} <span className="arr" style={arrIcon}><Icon name="arrow" /></span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
