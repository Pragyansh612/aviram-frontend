"use client";
import { useState, useEffect } from "react";
import { Icon } from "./icons";
import { CountUp, useStagger } from "./shared";
import { USER, BRIEF } from "./data";
import { useDashboard } from "@/contexts/DashboardContext";
import { apiGetDashboardActions } from "@/lib/api";
import { getDisplayName, getActiveForDuration, getActiveForDurationSince, requestOpenPrepBrief, requestHighlightOutreachDraft, getBriefVariant, saveBriefVariant } from "./session";

type BriefAction = {
  kicker: string;
  title: string;
  meta: string;
  btn: string;
  to: string;
};

const FALLBACK_ACTIONS: BriefAction[] = [
  { kicker: "Interview in 47 hours", title: "Razorpay · SDE-2", meta: "Prep brief ready · Thursday 9:00 AM", btn: "Open Brief", to: "prep" },
  { kicker: "Referral draft ready", title: "Stripe · Backend Engineer", meta: "2nd-degree via Arjun Mehta", btn: "Review Draft", to: "outreach" },
];

function useBriefActions(apiLive: boolean): BriefAction[] {
  const [actions, setActions] = useState<BriefAction[] | null>(null);
  useEffect(() => {
    if (!apiLive) { setActions(null); return; }
    let cancelled = false;
    apiGetDashboardActions(2)
      .then((data) => {
        if (cancelled) return;
        setActions((data?.actions ?? []).slice(0, 2).map((a) => ({
          kicker: a.kicker, title: a.title, meta: a.meta, btn: a.btn, to: a.to,
        })));
      })
      .catch(() => { if (!cancelled) setActions([]); });
    return () => { cancelled = true; };
  }, [apiLive]);
  return apiLive ? (actions ?? []) : FALLBACK_ACTIONS;
}

const arrIcon: React.CSSProperties = { width: 14, height: 14, display: "inline-block" };

function ActiveSystem({ onOpen, firstTime, briefSince, apiLive }: { onOpen: () => void; firstTime?: boolean; briefSince: string | null; apiLive: boolean }) {
  // Live: real duration since profiles.previous_login_at (server-anchored,
  // accurate across devices). Demo: client-local localStorage timestamp.
  const duration = (apiLive && briefSince ? getActiveForDurationSince(briefSince) : null)
    ?? getActiveForDuration()
    ?? USER.activeFor;

  useEffect(() => {
    const t = setTimeout(onOpen, firstTime ? 1800 : 2600);
    return () => clearTimeout(t);
  }, [onOpen, firstTime]);

  return (
    <div className="entry-stage">
      <div className="active-system">
        <div className="as-glyph">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 2 L21 20 H14.5 L12 13.5 L9.5 20 H3 Z" style={{ fill: "var(--accent)" }} />
          </svg>
        </div>
        {firstTime ? (
          <>
            <div className="as-line l1">Aviram is <b>ready</b>.</div>
            <div className="as-line l2">Your workspace is set up.<span className="as-caret" /></div>
          </>
        ) : (
          <>
            <div className="as-line l1">Aviram was active for <b>{duration}</b>.</div>
            <div className="as-line l2">Brief ready.<span className="as-caret" /></div>
          </>
        )}
        <div className="as-cta">
          <button className="btn btn-primary" onClick={onOpen}>
            Open Brief <span className="arr" style={{ width: 15, height: 15, display: "inline-block" }}><Icon name="arrow" /></span>
          </button>
        </div>
      </div>
    </div>
  );
}

function BlLine({ i, shown, className, children }: { i: number; shown: number; className?: string; children?: React.ReactNode }) {
  return (
    <div className={"bl-line" + (i < shown ? " in" : "") + (className ? " " + className : "")}>
      {children}
    </div>
  );
}

function BriefLetterFirst({ onEnter, firstName }: { onEnter: () => void; firstName: string }) {
  const shown = useStagger(4, true, 50, 140);
  return (
    <div className="brief-letter">
      <BlLine i={0} shown={shown} className="bl-greet">Good morning, <span className="em">{firstName}</span>.</BlLine>
      <BlLine i={1} shown={shown} className="bl-first-msg">
        Aviram is starting. Your first opportunities will appear within the hour.
      </BlLine>
      <BlLine i={2} shown={shown} className="bl-rule" />
      <BlLine i={3} shown={shown} className="bl-foot">
        <button className="btn btn-primary" onClick={onEnter}>
          Open Command Center <span className="arr" style={arrIcon}><Icon name="arrow" /></span>
        </button>
      </BlLine>
    </div>
  );
}

function BriefLetter({ onEnter, goTo, firstName, brief, actions, briefSince, apiLive }: { onEnter: () => void; goTo: (p: string) => void; firstName: string; brief: typeof BRIEF; actions: BriefAction[]; briefSince: string | null; apiLive: boolean }) {
  const activeDuration = (apiLive && briefSince ? getActiveForDurationSince(briefSince) : null)
    ?? getActiveForDuration()
    ?? USER.activeFor;
  const stats = [
    { n: brief.discovered, k: "opportunities discovered" },
    { n: brief.shortlisted, k: "shortlisted by score" },
    { n: brief.submitted,  k: "applications submitted" },
    { n: brief.referral,   k: "referral surfaced" },
    { n: brief.interview,  k: "interview scheduled" },
  ];
  const shown = useStagger(13, true, 50, 140);
  return (
    <div className="brief-letter">
      <BlLine i={0} shown={shown} className="bl-greet">Good morning, <span className="em">{firstName}</span>.</BlLine>
      <BlLine i={1} shown={shown} className="bl-while">While you were away — {activeDuration} of autonomous work.</BlLine>
      <div className="bl-stats">
        {stats.map((s, i) => (
          <BlLine i={2 + i} shown={shown} className={"bl-stat" + (s.n <= 1 ? " muted" : "")} key={i}>
            <span className="n"><CountUp to={s.n} duration={900 + i * 120} start={i + 2 < shown} /></span>
            <span className="k">{s.k}</span>
          </BlLine>
        ))}
      </div>
      {actions.length > 0 && (
        <>
          <BlLine i={7} shown={shown} className="bl-rule" />
          <BlLine i={8} shown={shown} className="bl-need"><b>{actions.length}</b> thing{actions.length === 1 ? "" : "s"} need your attention.</BlLine>
          <div className="bl-actions">
            {actions.map((a, i) => (
              <BlLine i={9 + i} shown={shown} className="bl-action" key={i}>
                <div className="ba-l">
                  <div className="ba-kicker">{a.kicker}</div>
                  <div className="ba-title">{a.title}</div>
                  <div className="ba-meta">{a.meta}</div>
                </div>
                <button className={"btn btn-sm " + (i === 0 ? "btn-primary" : "btn-ghost")} onClick={() => {
                  if (a.to === "prep") requestOpenPrepBrief();
                  if (a.to === "outreach") requestHighlightOutreachDraft("d1");
                  goTo(a.to);
                }}>
                  {a.btn} <span className="arr" style={arrIcon}><Icon name="arrow" /></span>
                </button>
              </BlLine>
            ))}
          </div>
        </>
      )}
      <BlLine i={11} shown={shown} className="bl-rule" />
      <BlLine i={12} shown={shown} className="bl-foot">
        <button className="btn btn-quiet" onClick={onEnter}>
          Open Command Center <span className="arr" style={arrIcon}><Icon name="arrow" /></span>
        </button>
      </BlLine>
    </div>
  );
}

function BriefTerminalFirst({ onEnter, firstName }: { onEnter: () => void; firstName: string }) {
  const rows = [
    { tk: "00:01", tx: "profile loaded · preferences saved" },
    { tk: "00:04", tx: "resume parsed · archetype: mid_backend" },
    { tk: "00:08", tx: "calibration started · 0 / 25 signals" },
    { tk: "00:12", tx: "discovery queued · first scan in progress" },
  ];
  const shown = useStagger(rows.length, true, 160, 400);
  return (
    <div className="brief-term">
      <div className="bt-window">
        <div className="bt-head">
          <span className="dots"><i /><i /><i /></span>
          <span className="ttl">aviram · first session</span>
          <span className="live"><span className="dot" /> starting</span>
        </div>
        <div className="bt-body">
          <div className="bt-prompt"><span className="usr">aviram@mid_backend</span>:<span className="cmd">~$</span> status</div>
          <div className="bt-greet">Good morning, {firstName}.</div>
          <div className="bt-sub">Aviram is starting. Your first opportunities will appear within the hour.</div>
          <div className="bt-feed">
            {rows.map((r, i) => (
              <div className={"bt-row" + (i < shown ? " in" : "")} key={i}>
                <span className="tk">{r.tk}</span>
                <span className="mk">✓</span>
                <span className="tx">{r.tx}</span>
              </div>
            ))}
          </div>
          <div className="bt-foot">
            <span className="bt-prompt"><span className="usr">aviram</span>:<span className="cmd">~$</span> <span className="cur">█</span></span>
            <span style={{ flex: 1 }} />
            <button className="btn btn-primary btn-sm" onClick={onEnter}>Open Command Center →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BriefTerminal({ onEnter, goTo, firstName, brief, actions, briefSince, apiLive }: { onEnter: () => void; goTo: (p: string) => void; firstName: string; brief: typeof BRIEF; actions: BriefAction[]; briefSince: string | null; apiLive: boolean }) {
  const activeDuration = (apiLive && briefSince ? getActiveForDurationSince(briefSince) : null)
    ?? getActiveForDuration()
    ?? USER.activeFor;
  const rows = [
    { tk: "22:48", n: brief.discovered, tx: "opportunities discovered across 16 sources" },
    { tk: "23:31", n: brief.shortlisted, tx: "shortlisted above your IPS threshold" },
    { tk: "01:09", n: 1, tx: "recruiter response received · Vercel" },
    { tk: "01:48", n: brief.submitted, tx: "applications submitted · resume tailored each" },
    { tk: "02:02", n: brief.referral, tx: "referral path surfaced · draft written" },
    { tk: "02:14", n: brief.interview, tx: "interview scheduled · Razorpay SDE-2" },
  ];
  const shown = useStagger(rows.length, true, 160, 400);
  return (
    <div className="brief-term">
      <div className="bt-window">
        <div className="bt-head">
          <span className="dots"><i /><i /><i /></span>
          <span className="ttl">aviram · overnight session · {activeDuration}</span>
          <span className="live"><span className="dot" /> session closed</span>
        </div>
        <div className="bt-body">
          <div className="bt-prompt"><span className="usr">aviram@{USER.archetype}</span>:<span className="cmd">~$</span> summary --since last-login</div>
          <div className="bt-greet">Good morning, {firstName}.</div>
          <div className="bt-sub">{activeDuration} active · 16 sources · {brief.discovered} found · {brief.submitted} applied · {brief.interview} interview</div>
          <div className="bt-feed">
            {rows.map((r, i) => (
              <div className={"bt-row" + (i < shown ? " in" : "")} key={i}>
                <span className="tk">{r.tk}</span>
                <span className="mk">✓</span>
                <span className="n">{r.n}</span>
                <span className="tx">{r.tx}</span>
              </div>
            ))}
          </div>
          {actions.length > 0 && (
            <div className="bt-attn">
              <div className="hd">› {actions.length} item{actions.length === 1 ? "" : "s"} need you — nothing else does</div>
              {actions.map((a, i) => (
                <div className="bt-task" key={i}>
                  <span className="bullet">▸</span>
                  <div className="tl">
                    <div className="tt">{a.kicker} · {a.title}</div>
                    <div className="tm">{a.meta}</div>
                  </div>
                  <button className={"btn btn-sm " + (i === 0 ? "btn-primary" : "btn-ghost")} onClick={() => {
                    if (a.to === "prep") requestOpenPrepBrief();
                    if (a.to === "outreach") requestHighlightOutreachDraft("d1");
                    goTo(a.to);
                  }}>{a.btn}</button>
                </div>
              ))}
            </div>
          )}
          <div className="bt-foot">
            <span className="bt-prompt"><span className="usr">aviram</span>:<span className="cmd">~$</span> <span className="cur">█</span></span>
            <span style={{ flex: 1 }} />
            <button className="btn btn-quiet btn-sm" onClick={onEnter}>Open Command Center →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Entry({
  onEnter,
  goTo,
  firstTime = false,
}: {
  onEnter: () => void;
  goTo: (p: string) => void;
  firstTime?: boolean;
}) {
  const { briefStats, briefSince, userMeta, apiLive } = useDashboard();
  const brief = apiLive ? briefStats : BRIEF;
  const actions = useBriefActions(apiLive);
  const [stage, setStage] = useState<"active" | "brief">("active");
  const [variant, setVariant] = useState<"letter" | "terminal">("letter");
  const firstName = userMeta.first || getDisplayName();

  useEffect(() => {
    setVariant(getBriefVariant());
  }, []);

  const pick = (v: "letter" | "terminal") => {
    setVariant(v);
    saveBriefVariant(v);
  };

  if (stage === "active") {
    return <ActiveSystem onOpen={() => setStage("brief")} firstTime={firstTime} briefSince={briefSince} apiLive={apiLive} />;
  }

  return (
    <div className="brief-stage">
      <div className="brief-topbar">
        <span className="glyph" style={{ width: 18, height: 18, display: "block" }}>
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 2 L21 20 H14.5 L12 13.5 L9.5 20 H3 Z" style={{ fill: "var(--accent)" }} /></svg>
        </span>
        <span className="bt-name">Aviram</span>
        <span className="spacer" />
        {!firstTime && (
          <div className="variant-switch">
            <button type="button" className={variant === "letter" ? "on" : ""} onClick={() => pick("letter")}>A · LETTER</button>
            <button type="button" className={variant === "terminal" ? "on" : ""} onClick={() => pick("terminal")}>B · TERMINAL</button>
          </div>
        )}
        <button type="button" className="btn btn-quiet btn-sm" onClick={onEnter} style={{ marginLeft: 4 }}>Skip →</button>
      </div>
      <div className="brief-scroll" key={variant + (firstTime ? "-first" : "-return")}>
        {firstTime ? (
          variant === "letter"
            ? <BriefLetterFirst onEnter={onEnter} firstName={firstName} />
            : <BriefTerminalFirst onEnter={onEnter} firstName={firstName} />
        ) : variant === "letter" ? (
          <BriefLetter onEnter={onEnter} goTo={goTo} firstName={firstName} brief={brief} actions={actions} briefSince={briefSince} apiLive={apiLive} />
        ) : (
          <BriefTerminal onEnter={onEnter} goTo={goTo} firstName={firstName} brief={brief} actions={actions} briefSince={briefSince} apiLive={apiLive} />
        )}
      </div>
    </div>
  );
}
