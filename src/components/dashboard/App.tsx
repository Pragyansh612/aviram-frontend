"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar, MobileTabBar, DashboardShellSkeleton } from "./shared";
import Entry from "./Entry";
import DetailPanel from "./DetailPanel";
import CampaignPanel from "./CampaignPanel";
import VaultPanel from "./VaultPanel";
import type { Opp } from "./DetailPanel";
import type { Campaign } from "./CampaignPanel";
import type { VaultEntry } from "./VaultPanel";
import WakeScreen from "./WakeScreen";
import { DashboardProvider, useDashboard } from "@/contexts/DashboardContext";
import {
  clearAuth,
  clearFirstTimeBrief,
  consumeHighlightOutreachDraft,
  consumeNavigatePage,
  consumeOpenApplication,
  consumeOpenPrepBrief,
  consumeWakeScreen,
  getStoredProfile,
  isAuthed,
  isBriefSeen,
  isFirstTimeBrief,
  isOnboardingComplete,
  markBriefSeen,
  requestNavigatePage,
  requestOpenPrepBrief,
  requestHighlightOutreachDraft,
  touchLastSync,
} from "./session";
import { apiLogout } from "@/lib/api";
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
import ExtensionQueue from "./pages/ExtensionQueue";
import ToastHost from "./Toast";

const PAGE_TITLE: Record<PageId, string> = {
  command: "Command Center", timeline: "Timeline", "extension-queue": "Extension Queue",
  opportunities: "Opportunities", applications: "Applications", resume: "Resume Lab",
  intelligence: "Career Intelligence", vault: "Research Vault", outreach: "Outreach",
  prep: "Interview Prep", settings: "Settings",
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

function DashboardShell() {
  const router = useRouter();
  const [page, setPage] = useState<PageId>("command");
  const [, toggleTheme] = useTheme();
  const { running, setRunning, apiLive } = useDashboard();
  const [opp, setOpp] = useState<Opp | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [vaultEntry, setVaultEntry] = useState<VaultEntry | null>(null);
  const [prepOpenBrief, setPrepOpenBrief] = useState(false);
  const [expandAppId, setExpandAppId] = useState<string | null>(null);
  const [highlightDraftId, setHighlightDraftId] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpp(null); setCampaign(null); setVaultEntry(null); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const closePanels = () => { setOpp(null); setCampaign(null); setVaultEntry(null); };

  const navigate = (p: PageId) => {
    setPrepOpenBrief(p === "prep" && consumeOpenPrepBrief());
    setExpandAppId(p === "applications" ? consumeOpenApplication() : null);
    setHighlightDraftId(p === "outreach" ? consumeHighlightOutreachDraft() : null);
    setPage(p);
    closePanels();
  };

  useEffect(() => {
    const pending = consumeNavigatePage();
    if (pending) navigate(pending as PageId);
  }, []);

  const openOpp = (o: Opp) => { setCampaign(null); setVaultEntry(null); setOpp(o); };
  const openCampaign = (c: Campaign) => { setOpp(null); setVaultEntry(null); setCampaign(c); };
  const openVault = (v: VaultEntry) => { setOpp(null); setCampaign(null); setVaultEntry(v); };

  const toggleRunning = () => { setRunning(!running); };

  const handleLogout = async () => {
    try { await apiLogout(); } catch { /* clear local anyway */ }
    clearAuth();
    router.replace("/login");
  };

  let content: React.ReactNode;
  switch (page) {
    case "command":       content = <CommandCenter goTo={navigate} openOpp={openOpp} />; break;
    case "timeline":      content = <Timeline goTo={navigate} />; break;
    case "extension-queue": content = <ExtensionQueue />; break;
    case "opportunities": content = <Opportunities openOpp={openOpp} selectedId={opp?.id} />; break;
    case "applications":  content = <Applications openOpp={openOpp} expandAppId={expandAppId} />; break;
    case "resume":        content = <ResumeLab />; break;
    case "intelligence":  content = <CareerIntelligence />; break;
    case "vault":         content = <ResearchVault openVault={openVault} selectedId={vaultEntry?.id} />; break;
    case "outreach":      content = <Outreach openCampaign={openCampaign} selectedId={campaign?.id} highlightDraftId={highlightDraftId} />; break;
    case "prep":          content = <InterviewPrep openBrief={prepOpenBrief} />; break;
    case "settings":      content = <Settings running={running} toggleRunning={toggleRunning} />; break;
    default:              content = <CommandCenter goTo={navigate} openOpp={openOpp} />;
  }

  return (
    <div className="app">
      <Sidebar
        page={page}
        setPage={navigate}
        running={running}
        toggleRunning={toggleRunning}
        toggleTheme={toggleTheme}
      />
      <div className="main">
        <div className="topbar2">
          <span className="crumb">Aviram · <b>{PAGE_TITLE[page]}</b></span>
          <span className="spacer" />
          <span className="clock" title={apiLive ? "Connected to API" : "Demo mode — API offline"}>
            {apiLive ? "● live" : "○ demo"} · {running ? "running" : "paused"}
          </span>
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
          <button
            type="button"
            className="btn btn-quiet btn-sm"
            onClick={handleLogout}
            title="Sign out"
          >
            Log out
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

// Gates the real content behind the very first data load, so a page
// refresh never briefly flashes fabricated demo data before apiLive
// resolves (initialLoading never goes true again after the first cycle,
// unlike `loading`, so this doesn't re-flash on the 30s background poll).
function DashboardGate({ children }: { children: React.ReactNode }) {
  const { initialLoading } = useDashboard();
  if (initialLoading) return <DashboardShellSkeleton />;
  return <>{children}</>;
}

export default function DashboardApp() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [firstTime] = useState(() => isFirstTimeBrief());
  const [stage, setStage] = useState<"entry" | "app">(() => (isBriefSeen() ? "app" : "entry"));
  const [showWake, setShowWake] = useState(() => consumeWakeScreen());

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
    touchLastSync();
  }, [router]);

  const finishBrief = () => {
    markBriefSeen();
    if (firstTime) clearFirstTimeBrief();
    setStage("app");
  };

  const goTo = (p: string) => {
    requestNavigatePage(p);
    if (p === "prep") requestOpenPrepBrief();
    if (p === "outreach") requestHighlightOutreachDraft("d1");
    finishBrief();
  };

  if (!ready) return null;

  const inner = showWake ? (
    <WakeScreen onDone={() => setShowWake(false)} />
  ) : (
    <DashboardGate>
      {stage === "entry" ? (
        <Entry onEnter={finishBrief} goTo={goTo} firstTime={firstTime} />
      ) : (
        <DashboardShell />
      )}
    </DashboardGate>
  );

  return (
    <DashboardProvider>
      {inner}
    </DashboardProvider>
  );
}
