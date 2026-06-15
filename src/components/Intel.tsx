"use client";
import { useEffect, useRef } from "react";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export default function Intel() {
  const triggered = useRef(false);

  useEffect(() => {
    const section = document.getElementById("intel");
    if (!section) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const run = async () => {
      if (triggered.current) return;
      triggered.current = true;
      const sigs = Array.from(section.querySelectorAll(".signal"));
      for (const s of sigs) { s.classList.add("in"); await wait(reduce ? 0 : 520); }
      await wait(reduce ? 0 : 450);
      section.querySelector("#intelVerdict")?.classList.add("in");
    };

    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { run(); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(section);

    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); revealObs.unobserve(e.target); } });
    }, { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });
    section.querySelectorAll(".reveal").forEach((el) => revealObs.observe(el));

    return () => { obs.disconnect(); revealObs.disconnect(); };
  }, []);

  return (
    <section className="beat emphasis deep" id="intel">
      <div className="container">
        <div className="section-label reveal">
          <span className="idx">03</span>
          <h2>Why this one moved up</h2>
          <span className="ts mono">07:42 · signals · company intelligence</span>
        </div>
        <div className="intel-grid">
          <div className="intel-card reveal">
            <div className="ic-head">
              <div className="role">Backend Engineer <span>· Atlas Systems · Series A</span></div>
            </div>
            <div className="ic-body" id="intelBody">
              <div className="signal" data-i="0">
                <span className="ico">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2 L3 14 h7 l-1 8 L19 10 h-7 z"/></svg>
                </span>
                <span className="txt"><b>Hiring urgency detected</b> — backfilling a lead who just left</span>
              </div>
              <div className="signal" data-i="1">
                <span className="ico">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                </span>
                <span className="txt">Series A funding announced <b>12 days ago</b></span>
              </div>
              <div className="signal" data-i="2">
                <span className="ico">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 17 L9 11 L13 15 L21 7"/><path d="M21 7h-5M21 7v5"/></svg>
                </span>
                <span className="txt">Engineering headcount</span>
                <span className="val up">38%</span>
              </div>
              <div className="signal" data-i="3">
                <span className="ico">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h16M14 6l6 6-6 6"/></svg>
                </span>
                <span className="txt">Recruiter response rate</span>
                <span className="val">17%</span>
              </div>
            </div>
            <div className="intel-verdict" id="intelVerdict">
              <span className="lbl">Verdict</span>
              <span className="big serif">Prioritized</span>
            </div>
          </div>
          <div className="intel-aside reveal d2">
            <div className="kicker">THE PART YOU DIDN'T ASK FOR</div>
            <p>You'd never have known a lead just walked out the door, or that the round closed twelve days ago. Aviram did.</p>
            <div className="serif-line">It isn't matching keywords. It's reading the room.</div>
          </div>
        </div>
      </div>
    </section>
  );
}