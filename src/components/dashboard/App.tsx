"use client";
import { useState, useEffect } from "react";
import { Sidebar, MobileTabBar } from "./shared";
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
      <Sidebar
        page={page}
        setPage={navigate}
        running={running}
        toggleRunning={() => setRunning(r => !r)}
        toggleTheme={toggleTheme}
      />
      <div className="main">
        <div className="topbar2">
          <span className="crumb">Aviram · <b>{PAGE_TITLE[page]}</b></span>
          <span className="spacer" />
          <span className="clock">{running ? "● live" : "❚❚ paused"}</span>
          <span className="avatar">P</span>
        </div>
        {content}
      </div>
      <MobileTabBar page={page} setPage={navigate} />
      {opp && <DetailPanel opp={opp} onClose={() => setOpp(null)} />}
    </div>
  );
}
