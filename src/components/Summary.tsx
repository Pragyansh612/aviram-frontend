"use client";
import { useEffect, useRef } from "react";

function animCount(el: HTMLElement, to: number, dur = 1100) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { el.textContent = String(to); return; }
  const start = performance.now();
  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / dur);
    el.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 3))));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export default function Summary() {
  const triggered = useRef(false);

  useEffect(() => {
    const section = document.getElementById("summary");
    if (!section) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const run = () => {
      if (triggered.current) return;
      triggered.current = true;
      setTimeout(() => {
        section.querySelectorAll<HTMLElement>("[data-count]").forEach((el) =>
          animCount(el, Number(el.dataset.count), 1100)
        );
      }, reduce ? 0 : 300);
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
    <section className="beat soft" id="summary">
      <div className="container">
        <div className="section-label reveal">
          <span className="idx">07</span>
          <h2>By the time you check your phone</h2>
          <span className="ts mono">— three days later —</span>
        </div>
        <div className="summary-card reveal d1">
          <div className="stamp">Run summary · Mon–Wed</div>
          <div className="summary-grid">
            <div className="s"><div className="n" data-count="47">0</div><div className="k">Applications sent</div></div>
            <div className="s"><div className="n" data-count="9">0</div><div className="k">Predicted interviews</div></div>
            <div className="s"><div className="n" data-count="6">0</div><div className="k">Referrals drafted</div></div>
            <div className="s hl"><div className="n" data-count="1">0</div><div className="k">Interview already scheduled</div></div>
          </div>
        </div>
      </div>
    </section>
  );
}