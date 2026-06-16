"use client";
import { useState, useEffect } from "react";
import { Sidebar } from "./shared";
import { Icon } from "./icons";
import Entry from "./Entry";
import DetailPanel from "./DetailPanel";
import type { Opp } from "./DetailPanel";
import { isBriefSeen, markBriefSeen } from "./session";
import type { PageId } from "./shared";
import CommandCenter from "./pages/CommandCenter";
import Timeline from "./pages/Timeline";
import Opportunities from "./pages/Opportunities";
import Applications from "./pages/Applications";
import ResumeLab from "./pages/ResumeLab";
import CareerIntelligence from "./pages/CareerIntelligence";
import ResearchVault from "./pages/ResearchVault";
import Outreach from "./pages/Outreach";
import InterviewPrep from "./pages/InterviewPrep";
import Settings from "./pages/Settings";

const PAGE_TITLE: Record<PageId, string> = {
  command: "Command Center", timeline: "Timeline", opportunities: "Opportunities",
  applications: "Applications", resume: "Resume Lab", intelligence: "Career Intelligence",
  vault: "Research Vault", outreach: "Outreach", prep: "Interview Prep", settings: "Settings",
};

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try { return (localStorage.getItem("aviram-theme") as "light" | "dark") || "light"; } catch { return "light"; }
  });
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("aviram-theme", theme); } catch {}
  }, [theme]);
  return [theme, () => setTheme((t) => (t === "light" ? "dark" : "light"))] as const;
}

export default function DashboardApp() {
  const [stage, setStage] = useState<"entry" | "app">(() => (isBriefSeen() ? "app" : "entry"));
  const [page, setPage] = useState<PageId>("command");
  const [theme, toggleTheme] = useTheme();
  const [running, setRunning] = useState(true);
  const [opp, setOpp] = useState<Opp | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpp(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const enterApp = () => {
    markBriefSeen();
    setStage("app");
  };

  const navigate = (p: PageId) => { setPage(p); setOpp(null); };
  const goTo = (p: string) => { markBriefSeen(); setStage("app"); navigate(p as PageId); };

  if (stage === "entry") {
    return <Entry onEnter={enterApp} goTo={goTo} />;
  }

  let content: React.ReactNode;
  switch (page) {
    case "command":       content = <CommandCenter goTo={navigate} openOpp={setOpp} />; break;
    case "timeline":      content = <Timeline goTo={navigate} />; break;
    case "opportunities": content = <Opportunities openOpp={setOpp} selectedId={opp?.id} />; break;
    case "applications":  content = <Applications />; break;
    case "resume":        content = <ResumeLab />; break;
    case "intelligence":  content = <CareerIntelligence />; break;
    case "vault":         content = <ResearchVault />; break;
    case "outreach":      content = <Outreach />; break;
    case "prep":          content = <InterviewPrep />; break;
    case "settings":      content = <Settings running={running} toggleRunning={() => setRunning(r => !r)} />; break;
    default:              content = <CommandCenter goTo={navigate} openOpp={setOpp} />;
  }

  return (
    <div className="app">
      <Sidebar page={page} setPage={navigate} running={running} toggleRunning={() => setRunning(r => !r)} />
      <div className="main">
        <div className="topbar2">
          <span className="crumb">Aviram · <b>{PAGE_TITLE[page]}</b></span>
          <span className="spacer" />
          <span className="clock">{running ? "● live" : "❚❚ paused"}</span>
          <button className="icon-btn theme-toggle" onClick={toggleTheme} title="Toggle light / dark" aria-label="Toggle theme">
            <svg className="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
            </svg>
            <svg className="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          </button>
          <span className="avatar">P</span>
        </div>
        {content}
      </div>
      {opp && <DetailPanel opp={opp} onClose={() => setOpp(null)} />}
    </div>
  );
}
