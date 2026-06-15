"use client";
import { useState, useEffect } from "react";
import { Icon } from "./icons";
import { CountUp, useStagger } from "./shared";
import { USER, BRIEF } from "./data";

const arrIcon: React.CSSProperties = { width: 14, height: 14, display: "inline-block" };

function ActiveSystem({ onOpen }: { onOpen: () => void }) {
  useEffect(() => {
    const t = setTimeout(onOpen, 2600);
    return () => clearTimeout(t);
  }, [onOpen]);
  return (
    <div className="entry-stage">
      <div className="active-system">
        <div className="as-glyph">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 2 L21 20 H14.5 L12 13.5 L9.5 20 H3 Z" style={{ fill: "var(--accent)" }} />
          </svg>
        </div>
        <div className="as-line l1">Aviram was active for <b>{USER.activeFor}</b>.</div>
        <div className="as-line l2">Brief ready.<span className="as-caret" /></div>
        <div className="as-cta">
          <button className="btn btn-primary" onClick={onOpen}>
            Open Brief <span className="arr" style={{ width: 15, height: 15, display: "inline-block" }}><Icon name="arrow" /></span>
          </button>
        </div>
      </div>
    </div>
  );
}

function BriefLetter({ onEnter, goTo }: { onEnter: () => void; goTo: (p: string) => void }) {
  const stats = [
    { n: BRIEF.discovered, k: "opportunities discovered" },
    { n: BRIEF.shortlisted, k: "shortlisted by score" },
    { n: BRIEF.submitted,  k: "applications submitted" },
    { n: BRIEF.referral,   k: "referral surfaced" },
    { n: BRIEF.interview,  k: "interview scheduled" },
  ];
  return (
    <div className="brief-letter">
      <div className="bl-greet">Good morning, <span className="em">{USER.first}</span>.</div>
      <div className="bl-while">While you were away — {USER.activeFor} of autonomous work.</div>
      <div className="bl-stats">
        {stats.map((s, i) => (
          <div className={"bl-stat" + (s.n <= 1 ? " muted" : "")} key={i}>
            <span className="n"><CountUp to={s.n} duration={900 + i * 120} /></span>
            <span className="k">{s.k}</span>
          </div>
        ))}
      </div>
      <div className="bl-rule" />
      <div className="bl-need"><b>2</b> things need your attention.</div>
      <div className="bl-actions">
        <div className="bl-action">
          <div className="ba-l">
            <div className="ba-kicker">Interview in 47 hours</div>
            <div className="ba-title">Razorpay · SDE-2</div>
            <div className="ba-meta">Prep brief ready · Thursday 9:00 AM</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => goTo("prep")}>
            Open Brief <span className="arr" style={arrIcon}><Icon name="arrow" /></span>
          </button>
        </div>
        <div className="bl-action">
          <div className="ba-l">
            <div className="ba-kicker">Referral draft ready</div>
            <div className="ba-title">Stripe · Backend Engineer</div>
            <div className="ba-meta">2nd-degree via Arjun Mehta</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => goTo("outreach")}>
            Review Draft <span className="arr" style={arrIcon}><Icon name="arrow" /></span>
          </button>
        </div>
      </div>
      <div className="bl-rule" />
      <div className="bl-foot">
        <button className="btn btn-quiet" onClick={onEnter}>
          Open Command Center <span className="arr" style={arrIcon}><Icon name="arrow" /></span>
        </button>
      </div>
    </div>
  );
}

function BriefTerminal({ onEnter, goTo }: { onEnter: () => void; goTo: (p: string) => void }) {
  const rows = [
    { tk: "22:48", n: BRIEF.discovered, tx: "opportunities discovered across 16 sources" },
    { tk: "23:31", n: BRIEF.shortlisted, tx: "shortlisted above your IPS threshold" },
    { tk: "01:09", n: 1, tx: "recruiter response received · Vercel" },
    { tk: "01:48", n: BRIEF.submitted, tx: "applications submitted · resume tailored each" },
    { tk: "02:02", n: BRIEF.referral, tx: "referral path surfaced · draft written" },
    { tk: "02:14", n: BRIEF.interview, tx: "interview scheduled · Razorpay SDE-2" },
  ];
  const shown = useStagger(rows.length, true, 160, 400);
  return (
    <div className="brief-term">
      <div className="bt-window">
        <div className="bt-head">
          <span className="dots"><i /><i /><i /></span>
          <span className="ttl">aviram · overnight session · {USER.activeFor}</span>
          <span className="live"><span className="dot" /> session closed</span>
        </div>
        <div className="bt-body">
          <div className="bt-prompt"><span className="usr">aviram@{USER.archetype}</span>:<span className="cmd">~$</span> summary --since last-login</div>
          <div className="bt-greet">Good morning, {USER.first}.</div>
          <div className="bt-sub">{USER.activeFor} active · 16 sources · {BRIEF.discovered} found · {BRIEF.submitted} applied · {BRIEF.interview} interview</div>
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
              <button className="btn btn-primary btn-sm" onClick={() => goTo("prep")}>Open Brief</button>
            </div>
            <div className="bt-task">
              <span className="bullet">▸</span>
              <div className="tl">
                <div className="tt">Referral draft ready · Stripe Backend Engineer</div>
                <div className="tm">2nd-degree via arjun_mehta · awaiting your send</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => goTo("outreach")}>Review</button>
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

export default function Entry({ onEnter, goTo }: { onEnter: () => void; goTo: (p: string) => void }) {
  const [stage, setStage] = useState<"active" | "brief">("active");
  const [variant, setVariant] = useState<"letter" | "terminal">(() => {
    try { return (localStorage.getItem("aviram-brief-variant") as "letter" | "terminal") || "letter"; } catch { return "letter"; }
  });

  const pick = (v: "letter" | "terminal") => {
    setVariant(v);
    try { localStorage.setItem("aviram-brief-variant", v); } catch {}
  };

  if (stage === "active") return <ActiveSystem onOpen={() => setStage("brief")} />;

  return (
    <div className="brief-stage">
      <div className="brief-topbar">
        <span className="glyph" style={{ width: 18, height: 18, display: "block" }}>
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 2 L21 20 H14.5 L12 13.5 L9.5 20 H3 Z" style={{ fill: "var(--accent)" }} /></svg>
        </span>
        <span className="bt-name">Aviram</span>
        <span className="spacer" />
        <div className="variant-switch">
          <button className={variant === "letter" ? "on" : ""} onClick={() => pick("letter")}>A · LETTER</button>
          <button className={variant === "terminal" ? "on" : ""} onClick={() => pick("terminal")}>B · TERMINAL</button>
        </div>
        <button className="btn btn-quiet btn-sm" onClick={onEnter} style={{ marginLeft: 4 }}>Skip →</button>
      </div>
      <div className="brief-scroll">
        {variant === "letter"
          ? <BriefLetter onEnter={onEnter} goTo={goTo} />
          : <BriefTerminal onEnter={onEnter} goTo={goTo} />}
      </div>
    </div>
  );
}