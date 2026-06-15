"use client";
import { useEffect, useRef } from "react";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function animCount(el: HTMLElement, to: number, dur = 800, suffix = "") {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { el.textContent = to + suffix; return; }
  const start = performance.now();
  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / dur);
    el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export default function Explain() {
  const triggered = useRef(false);

  useEffect(() => {
    const section = document.getElementById("explain");
    if (!section) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const run = async () => {
      if (triggered.current) return;
      triggered.current = true;
      const topEl = section.querySelector<HTMLElement>("#treeTop");
      if (topEl) animCount(topEl, 84, 1100);
      const rows = Array.from(section.querySelectorAll(".trow"));
      for (const r of rows) {
        r.classList.add("in");
        const bar = r.querySelector<HTMLElement>(".track i");
        if (bar) requestAnimationFrame(() => { bar.style.width = bar.dataset.w + "%"; });
        const v = r.querySelector<HTMLElement>(".v[data-count]");
        if (v) animCount(v, Number(v.dataset.count), 800, v.dataset.suffix ?? "");
        await wait(reduce ? 0 : 300);
      }
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
    <section className="beat" id="explain">
      <div className="container">
        <div className="section-label reveal">
          <span className="idx">09</span>
          <h2>Every score, opened up</h2>
          <span className="ts mono">Atlas Systems · Backend Engineer</span>
        </div>
        <div className="explain-grid">
          <div className="explain-aside reveal">
            <div className="serif-line">No black box. Expand any row and see exactly why.</div>
            <p>The 84 isn't a vibe. It's four signals you can inspect, weigh, and disagree with.</p>
          </div>
          <div className="tree reveal d1" id="tree">
            <div className="t-top">
              <span className="k">Interview Probability Score</span>
              <span className="v" id="treeTop" data-count="84">0</span>
            </div>
            <div className="trow" data-i="0"><span className="branch">├─</span><span className="k">Resume match</span><span className="track"><i data-w="89" /></span><span className="v" data-count="89">0</span></div>
            <div className="trow" data-i="1"><span className="branch">├─</span><span className="k">Hiring urgency</span><span className="track"><i data-w="92" /></span><span className="v" data-count="92">0</span></div>
            <div className="trow" data-i="2"><span className="branch">├─</span><span className="k">Referral path</span><span className="track"><i data-w="100" /></span><span className="v found">Found</span></div>
            <div className="trow" data-i="3"><span className="branch">└─</span><span className="k">Company response rate</span><span className="track"><i data-w="17" /></span><span className="v" data-count="17" data-suffix="%">0</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}