"use client";
import { useState, useEffect } from "react";
import { TIMELINE, APPS } from "@/components/dashboard/data";
import { IPSChip, PageHead, EmptyState, useStagger } from "@/components/dashboard/shared";
import { Icon } from "@/components/dashboard/icons";
import {
  getSkippedOpps,
  getSessionTimelineEvents,
  requestOpenPrepBrief,
  requestOpenApplication,
  requestHighlightOutreachDraft,
  type SkippedOpp,
  type SessionTimelineEvent,
} from "@/components/dashboard/session";
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

type TlEvent = {
  time: string;
  type: string;
  title: string;
  company: string;
  role: string;
  extra: string;
  action: string | null;
  ips: number | null;
  appId?: string;
  draftId?: string;
};

function findAppId(company: string, role?: string): string | undefined {
  const app = APPS.find((a) => a.company === company && (!role || a.role === role))
    ?? APPS.find((a) => a.company === company);
  return app?.id;
}

function referralDraftId(company: string): string | undefined {
  if (company === "Stripe") return "d1";
  if (company === "Linear") return "d2";
  return undefined;
}

export default function Timeline({ goTo }: { goTo: (p: PageId) => void }) {
  const [filter, setFilter] = useState("all");
  const [runtimeSkipped, setRuntimeSkipped] = useState<SkippedOpp[]>([]);
  const [sessionEvents, setSessionEvents] = useState<SessionTimelineEvent[]>([]);

  useEffect(() => {
    setRuntimeSkipped(getSkippedOpps());
    setSessionEvents(getSessionTimelineEvents());
  }, []);

  const match = (e: TlEvent) =>
    filter === "all" ? true : filter === "response" ? e.type === "response" : e.type === filter;

  const syntheticSkipped: TlEvent[] = runtimeSkipped.map((s) => ({
    type: "skipped",
    time: s.time,
    title: "Skipped",
    company: s.company,
    role: s.role,
    extra: "",
    action: null,
    ips: null,
  }));

  const sessionAsTl: TlEvent[] = sessionEvents.map((e) => ({
    type: e.type,
    time: e.time,
    title: e.title,
    company: e.company,
    role: e.role,
    extra: e.extra,
    action: e.action,
    ips: e.ips,
    appId: e.appId,
    draftId: e.draftId,
  }));

  const todayStatic: TlEvent[] = (TIMELINE.find((g) => g.day === "Today")?.events ?? []).map((e) => ({
    ...e,
    action: e.action,
    ips: e.ips,
  }));
  const todayMerged: TlEvent[] = [
    ...sessionAsTl,
    ...syntheticSkipped,
    ...todayStatic,
  ].filter(match);

  const otherGroups = TIMELINE.filter((g) => g.day !== "Today").map((group) => ({
    day: group.day,
    events: group.events.map((e) => ({ ...e, action: e.action, ips: e.ips } as TlEvent)).filter(match),
  })).filter((g) => g.events.length > 0);

  const groups = todayMerged.length > 0
    ? [{ day: "Today", events: todayMerged }, ...otherGroups]
    : otherGroups;

  const hasAnyEvents = TIMELINE.some((g) => g.events.length > 0) || runtimeSkipped.length > 0 || sessionEvents.length > 0;
  const totalEvents = groups.reduce((n, g) => n + g.events.length, 0);
  const shown = useStagger(totalEvents, totalEvents > 0, 50, 60);
  let eventIdx = 0;

  const handleTimelineAction = (e: TlEvent) => {
    if (e.type === "interview") {
      requestOpenPrepBrief();
      goTo("prep");
      return;
    }
    if (e.type === "resume") {
      goTo("resume");
      return;
    }
    if (e.type === "referral") {
      const draftId = e.draftId ?? referralDraftId(e.company);
      if (draftId) requestHighlightOutreachDraft(draftId);
      goTo("outreach");
      return;
    }
    if (e.type === "applied" || e.type === "response") {
      const appId = e.appId ?? findAppId(e.company, e.role);
      if (appId) requestOpenApplication(appId);
      goTo("applications");
    }
  };

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
                            onClick={() => handleTimelineAction(e)}
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
