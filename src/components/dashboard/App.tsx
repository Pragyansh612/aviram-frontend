"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar, MobileTabBar } from "./shared";
import Entry from "./Entry";
import DetailPanel from "./DetailPanel";
import CampaignPanel from "./CampaignPanel";
import VaultPanel from "./VaultPanel";
import type { Opp } from "./DetailPanel";
import type { Campaign } from "./CampaignPanel";
import type { VaultEntry } from "./VaultPanel";
import {
  clearFirstTimeBrief,
  getStoredProfile,
  isAuthed,
  isBriefSeen,
  isFirstTimeBrief,
  isOnboardingComplete,
  markBriefSeen,
} from "./session";
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
import ToastHost from "./Toast";

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

function avatarInitial(): string {
  const name = getStoredProfile()?.name?.trim();
  return name ? name[0]!.toUpperCase() : "P";
}

export default function DashboardApp() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [firstTime] = useState(() => isFirstTimeBrief());
  const [stage, setStage] = useState<"entry" | "app">(() => (isBriefSeen() ? "app" : "entry"));
  const [page, setPage] = useState<PageId>("command");
  const [theme, toggleTheme] = useTheme();
  const [running, setRunning] = useState(true);
  const [opp, setOpp] = useState<Opp | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [vaultEntry, setVaultEntry] = useState<VaultEntry | null>(null);

  useEffect(() => {
    if (!isAuthed()) {
      router.replace("/login");
      return;
    }
    if (!isOnboardingComplete()) {
      router.replace("/onboarding");
      return;
    }
    setReady(true);
  }, [router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpp(null); setCampaign(null); setVaultEntry(null); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const closePanels = () => { setOpp(null); setCampaign(null); setVaultEntry(null); };

  const finishBrief = () => {
    markBriefSeen();
    if (firstTime) clearFirstTimeBrief();
    setStage("app");
  };

  const navigate = (p: PageId) => { setPage(p); closePanels(); };
  const goTo = (p: string) => { finishBrief(); navigate(p as PageId); };
  const openOpp = (o: Opp) => { setCampaign(null); setVaultEntry(null); setOpp(o); };
  const openCampaign = (c: Campaign) => { setOpp(null); setVaultEntry(null); setCampaign(c); };
  const openVault = (v: VaultEntry) => { setOpp(null); setCampaign(null); setVaultEntry(v); };

  if (!ready) return null;

  if (stage === "entry") {
    return <Entry onEnter={finishBrief} goTo={goTo} firstTime={firstTime} />;
  }

  let content: React.ReactNode;
  switch (page) {
    case "command":       content = <CommandCenter goTo={navigate} openOpp={openOpp} />; break;
    case "timeline":      content = <Timeline goTo={navigate} />; break;
    case "opportunities": content = <Opportunities openOpp={openOpp} selectedId={opp?.id} />; break;
    case "applications":  content = <Applications openOpp={openOpp} />; break;
    case "resume":        content = <ResumeLab />; break;
    case "intelligence":  content = <CareerIntelligence />; break;
    case "vault":         content = <ResearchVault openVault={openVault} selectedId={vaultEntry?.id} />; break;
    case "outreach":      content = <Outreach openCampaign={openCampaign} selectedId={campaign?.id} />; break;
    case "prep":          content = <InterviewPrep />; break;
    case "settings":      content = <Settings running={running} toggleRunning={() => setRunning(r => !r)} />; break;
    default:              content = <CommandCenter goTo={navigate} openOpp={openOpp} />;
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
          <button
            className="topbar-theme-toggle"
            onClick={toggleTheme}
            title="Toggle light / dark"
            aria-label="Toggle theme"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" className="i-moon" />
              <g className="i-sun">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </g>
            </svg>
          </button>
          <span className="avatar">{avatarInitial()}</span>
        </div>
        {content}
      </div>
      <MobileTabBar page={page} setPage={navigate} />
      {opp && <DetailPanel opp={opp} onClose={closePanels} />}
      {campaign && <CampaignPanel campaign={campaign} onClose={closePanels} />}
      {vaultEntry && <VaultPanel entry={vaultEntry} onClose={closePanels} />}
      <ToastHost />
    </div>
  );
}
