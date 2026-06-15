"use client";
import { useEffect, useRef } from "react";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export default function Rejection() {
  const triggered = useRef(false);

  useEffect(() => {
    const section = document.getElementById("rejection");
    if (!section) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const run = async () => {
      if (triggered.current) return;
      triggered.current = true;
      await wait(reduce ? 0 : 700);
      section.querySelector("#goCard .verdict-pill")?.classList.add("in");
      await wait(reduce ? 0 : 500);
      section.querySelector("#skipCard .verdict-pill")?.classList.add("in");
      await wait(reduce ? 0 : 350);
      section.querySelector("#skipCard")?.classList.add("struck");
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
    <section className="beat emphasis soft" id="rejection">
      <div className="container">
        <div className="section-label reveal">
          <span className="idx">04</span>
          <h2>One it pursued, one it walked away from</h2>
          <span className="ts mono">07:43 · decision</span>
        </div>
        <div className="versus">
          <div className="vcard skip reveal" id="skipCard">
            <div className="vhead">
              <div className="role">Backend Engineer</div>
              <div className="stage">Series C · 1,200 staff</div>
            </div>
            <div className="vrows">
              <div className="vrow"><span className="k">Recruiter response rate</span><span className="v" style={{color:"var(--skip)"}}>{"< 1%"}</span></div>
              <div className="vrow"><span className="k">Role open</span><span className="v" style={{color:"var(--skip)"}}>97 days</span></div>
              <div className="vrow"><span className="k">Applicants ahead</span><span className="v">800+</span></div>
            </div>
            <div className="score-big"><small>Match</small>42</div>
            <div style={{marginTop:20}}><span className="verdict-pill">⊘ Skipped — low interview probability</span></div>
          </div>
          <div className="vcard go reveal d1" id="goCard">
            <div className="vhead">
              <div className="role">Backend Engineer</div>
              <div className="stage">Series A · 40 staff</div>
            </div>
            <div className="vrows">
              <div className="vrow"><span className="k">Recruiter response rate</span><span className="v" style={{color:"var(--forest, var(--accent))"}}>17%</span></div>
              <div className="vrow"><span className="k">Role open</span><span className="v" style={{color:"var(--forest, var(--accent))"}}>4 days</span></div>
              <div className="vrow"><span className="k">Referral path</span><span className="v" style={{color:"var(--clay)"}}>Found</span></div>
            </div>
            <div className="score-big"><small>IPS</small>84</div>
            <div style={{marginTop:20}}><span className="verdict-pill">→ Proceeding</span></div>
          </div>
        </div>
        <div className="versus-mid reveal d2">
          <div className="serif-line">Apply <span className="em">better</span>, not apply more.</div>
          <div className="sub">Same title. Same salary band. A 10× difference in whether anyone replies.</div>
        </div>
      </div>
    </section>
  );
}