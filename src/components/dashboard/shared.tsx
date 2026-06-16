"use client";
import { useState, useEffect, useRef } from "react";
import { Icon } from "./icons";

export type PageId =
  | "command" | "timeline" | "opportunities" | "applications"
  | "resume" | "intelligence" | "vault" | "outreach" | "prep" | "settings";

// ---------- IPS chip ----------
export function ipsTier(n: number) { return n >= 75 ? "high" : n >= 50 ? "mid" : "low"; }

export function IPSChip({ score, size, solid }: { score: number; size?: "lg"; solid?: boolean }) {
  const cls = ["ips", ipsTier(score), size === "lg" ? "lg" : "", solid ? "solid" : ""].filter(Boolean).join(" ");
  return (
    <span className={cls}>
      <span className="lbl">IPS</span>
      <span className="num">{score}</span>
    </span>
  );
}

// ---------- count-up ----------
export function useCountUp(target: number, duration = 1100, start = true) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setVal(target); return; }
    let raf: number;
    let t0 = 0;
    const tick = (t: number) => {
      if (!t0) t0 = t;
      const p = Math.min((t - t0) / duration, 1);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return val;
}

export function CountUp({ to, duration, start }: { to: number; duration?: number; start?: boolean }) {
  const v = useCountUp(to, duration, start !== false);
  return <span className="cu">{v}</span>;
}

// ---------- urgent ----------
export function Urgent() {
  return (
    <span className="urgent">
      <span style={{ width: 12, height: 12, display: "inline-block" }}><Icon name="bolt" /></span>
      Urgent
    </span>
  );
}

// ---------- status pill ----------
export function StatusPill({ status, label }: { status: string; label: string }) {
  return (
    <span className={"pill " + status}>
      <span className="pdot" style={{ background: "currentColor" }} />
      {label}
    </span>
  );
}

// ---------- score tree ----------
export function ScoreTree({ tree, total }: { tree: { match: number; urgency: number; referral: string; response: number }; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting) {
          el.querySelectorAll<HTMLElement>(".track i").forEach((bar) => { bar.style.width = (bar.dataset.w ?? "0") + "%"; });
          io.disconnect();
        }
      });
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const rows = [
    { k: "Resume match",          w: tree.match,                              v: String(tree.match),    found: false },
    { k: "Hiring urgency",        w: tree.urgency,                            v: String(tree.urgency),  found: false },
    { k: "Referral path",         w: tree.referral === "Found" ? 100 : 0,     v: tree.referral,         found: true  },
    { k: "Company response rate", w: tree.response,                           v: tree.response + "%",   found: false },
  ];

  return (
    <div className="tree" ref={ref}>
      <div className="t-top"><span className="k">Interview Probability Score</span><span className="v">{total}</span></div>
      {rows.map((r, i) => (
        <div className="trow" key={i}>
          <span className="branch">{i === rows.length - 1 ? "└─" : "├─"}</span>
          <span className="k">{r.k}</span>
          <span className="track"><i data-w={r.w} /></span>
          <span className={"v" + (r.found && r.v === "Found" ? " found" : "")}>{r.v}</span>
        </div>
      ))}
    </div>
  );
}

// ---------- page header ----------
export function PageHead({ eyebrow, title, sub, right }: { eyebrow?: React.ReactNode; title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="page-head">
      <div className="ph-l">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {sub && <div className="sub">{sub}</div>}
      </div>
      {right && <div className="ph-r">{right}</div>}
    </div>
  );
}

// ---------- stagger hook ----------
export function useStagger(count: number, active = true, step = 70, base = 80) {
  const [shown, setShown] = useState(active ? 0 : count);
  useEffect(() => {
    if (!active) { setShown(count); return; }
    setShown(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < count; i++) {
      timers.push(setTimeout(() => setShown((s) => Math.max(s, i + 1)), base + i * step));
    }
    return () => timers.forEach(clearTimeout);
  }, [count, active, base, step]);
  return shown;
}

// ---------- sidebar nav ----------
export const NAV_ITEMS: { id?: PageId; label?: string; icon?: string; div?: boolean }[] = [
  { id: "command",      label: "Command Center",    icon: "command" },
  { id: "timeline",     label: "Timeline",          icon: "timeline" },
  { div: true },
  { id: "opportunities",label: "Opportunities",     icon: "opportunities" },
  { id: "applications", label: "Applications",      icon: "applications" },
  { div: true },
  { id: "resume",       label: "Resume Lab",        icon: "resume" },
  { div: true },
  { id: "intelligence", label: "Career Intelligence", icon: "intelligence" },
  { id: "vault",        label: "Research Vault",    icon: "vault" },
  { div: true },
  { id: "outreach",     label: "Outreach",          icon: "outreach" },
  { id: "prep",         label: "Interview Prep",    icon: "prep" },
  { div: true },
  { id: "settings",     label: "Settings",          icon: "settings" },
];

export const MOBILE_TABS: { id: PageId; label: string; icon: string }[] = [
  { id: "command",       label: "Command",  icon: "command" },
  { id: "timeline",      label: "Timeline", icon: "timeline" },
  { id: "opportunities", label: "Queue",    icon: "opportunities" },
  { id: "prep",          label: "Prep",     icon: "prep" },
  { id: "settings",      label: "Settings", icon: "settings" },
];

function ThemeToggle({ onClick }: { onClick: () => void }) {
  return (
    <button className="theme-toggle sb-theme" onClick={onClick} title="Toggle light / dark" aria-label="Toggle theme">
      <svg className="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
      </svg>
      <svg className="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
}

export function Sidebar({ page, setPage, running, toggleRunning, toggleTheme }: {
  page: PageId; setPage: (p: PageId) => void;
  running: boolean; toggleRunning: () => void;
  toggleTheme: () => void;
}) {
  const [confirmPause, setConfirmPause] = useState(false);
  const u = { archetype: "mid_backend", calibration: 14, calibrationMax: 25 };

  const handleStatusClick = () => {
    if (running) setConfirmPause(true);
    else { setConfirmPause(false); toggleRunning(); }
  };

  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <span className="glyph">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 2 L21 20 H14.5 L12 13.5 L9.5 20 H3 Z" style={{ fill: "var(--accent)" }} />
          </svg>
        </span>
        <span className="name">Aviram</span>
        <span className="ver">v4</span>
      </div>
      <nav className="sb-nav">
        {NAV_ITEMS.map((item, i) =>
          item.div
            ? <div className="sb-divider" key={"d" + i} />
            : (
              <button
                key={item.id}
                type="button"
                className={"nav-item" + (page === item.id ? " active" : "")}
                onClick={() => item.id && setPage(item.id)}
              >
                <span className="ico"><Icon name={item.icon!} /></span>
                <span>{item.label}</span>
              </button>
            )
        )}
      </nav>
      <div className="sb-foot">
        <div className="calib">
          <div className="arch">
            <span className="tag">[{u.archetype}]</span>
            <span className="frac">{u.calibration}/{u.calibrationMax}</span>
          </div>
          <div className="bar"><i style={{ width: (u.calibration / u.calibrationMax * 100) + "%" }} /></div>
        </div>
        {confirmPause && (
          <div className="status-confirm">
            <p className="sc-msg">Pause Aviram? Applications will stop.</p>
            <div className="sc-act">
              <button type="button" className="btn btn-primary btn-sm" onClick={() => { toggleRunning(); setConfirmPause(false); }}>Confirm</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmPause(false)}>Cancel</button>
            </div>
          </div>
        )}
        <button
          type="button"
          className={"status-pill " + (running ? "running" : "paused")}
          onClick={handleStatusClick}
          title={running ? "Pause Aviram" : "Resume Aviram"}
        >
          <span className="dot" />
          <span className="st-label">{running ? "Running" : "Paused"}</span>
          <span className="st-meta">{running ? "active" : "click to resume"}</span>
        </button>
        <div className="sb-foot-row">
          <ThemeToggle onClick={toggleTheme} />
        </div>
      </div>
    </aside>
  );
}

export function MobileTabBar({ page, setPage }: { page: PageId; setPage: (p: PageId) => void }) {
  return (
    <nav className="mobile-tabs" aria-label="Main navigation">
      {MOBILE_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={"mtab" + (page === tab.id ? " active" : "")}
          onClick={() => setPage(tab.id)}
          aria-current={page === tab.id ? "page" : undefined}
        >
          <span className="mtab-ico"><Icon name={tab.icon} /></span>
          <span className="mtab-lbl">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}