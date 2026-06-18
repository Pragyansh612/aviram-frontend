"use client";
import { useState, useEffect } from "react";
import { Icon } from "./icons";
import { CountUp, useStagger } from "./shared";
import { USER, BRIEF } from "./data";
import { useDashboard } from "@/contexts/DashboardContext";
import { getDisplayName, getActiveForDuration, requestOpenPrepBrief, requestHighlightOutreachDraft, getBriefVariant, saveBriefVariant } from "./session";

const arrIcon: React.CSSProperties = { width: 14, height: 14, display: "inline-block" };

function ActiveSystem({ onOpen, firstTime }: { onOpen: () => void; firstTime?: boolean }) {
  // Compute duration from real login timestamp; fall back to mock data
  const duration = getActiveForDuration() ?? USER.activeFor;

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

function BriefLetter({ onEnter, goTo, firstName, brief }: { onEnter: () => void; goTo: (p: string) => void; firstName: string; brief: typeof BRIEF }) {
  const activeDuration = getActiveForDuration() ?? USER.activeFor;
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
      <BlLine i={7} shown={shown} className="bl-rule" />
      <BlLine i={8} shown={shown} className="bl-need"><b>2</b> things need your attention.</BlLine>
      <div className="bl-actions">
        <BlLine i={9} shown={shown} className="bl-action">
          <div className="ba-l">
            <div className="ba-kicker">Interview in 47 hours</div>
            <div className="ba-title">Razorpay · SDE-2</div>
            <div className="ba-meta">Prep brief ready · Thursday 9:00 AM</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => { requestOpenPrepBrief(); goTo("prep"); }}>
            Open Brief <span className="arr" style={arrIcon}><Icon name="arrow" /></span>
          </button>
        </BlLine>
        <BlLine i={10} shown={shown} className="bl-action">
          <div className="ba-l">
            <div className="ba-kicker">Referral draft ready</div>
            <div className="ba-title">Stripe · Backend Engineer</div>
            <div className="ba-meta">2nd-degree via Arjun Mehta</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => { requestHighlightOutreachDraft("d1"); goTo("outreach"); }}>
            Review Draft <span className="arr" style={arrIcon}><Icon name="arrow" /></span>
          </button>
        </BlLine>
      </div>
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

function BriefTerminal({ onEnter, goTo, firstName, brief }: { onEnter: () => void; goTo: (p: string) => void; firstName: string; brief: typeof BRIEF }) {
  const activeDuration = getActiveForDuration() ?? USER.activeFor;
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
          <div className="bt-attn">
            <div className="hd">› 2 items need you — nothing else does</div>
            <div className="bt-task">
              <span className="bullet">▸</span>
              <div className="tl">
                <div className="tt">Interview in 47 hours · Razorpay SDE-2</div>
                <div className="tm">prep brief ready · thu 09:00</div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => { requestOpenPrepBrief(); goTo("prep"); }}>Open Brief</button>
            </div>
            <div className="bt-task">
              <span className="bullet">▸</span>
              <div className="tl">
                <div className="tt">Referral draft ready · Stripe Backend Engineer</div>
                <div className="tm">2nd-degree via arjun_mehta · awaiting your send</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => { requestHighlightOutreachDraft("d1"); goTo("outreach"); }}>Review</button>
            </div>
          </div>
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
  const { briefStats, userMeta, apiLive } = useDashboard();
  const brief = apiLive ? briefStats : BRIEF;
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
    return <ActiveSystem onOpen={() => setStage("brief")} firstTime={firstTime} />;
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
          <BriefLetter onEnter={onEnter} goTo={goTo} firstName={firstName} brief={brief} />
        ) : (
          <BriefTerminal onEnter={onEnter} goTo={goTo} firstName={firstName} brief={brief} />
        )}
      </div>
    </div>
  );
}
