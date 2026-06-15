"use client";
import { useEffect, useRef } from "react";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export default function Tailor() {
  const triggered = useRef(false);

  useEffect(() => {
    const section = document.getElementById("tailor");
    if (!section) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const run = async () => {
      if (triggered.current) return;
      triggered.current = true;
      await wait(reduce ? 0 : 450);
      const doc = section.querySelector("#resumeDoc");
      const bullet = section.querySelector("#morphBullet");
      const el = section.querySelector<HTMLElement>("#morphText");
      if (!doc || !bullet || !el) return;

      const target = "Built 15+ REST APIs serving 10K+ daily requests, cutting p95 latency 40%";
      doc.classList.add("editing");

      if (reduce) { el.textContent = target; bullet.classList.add("done"); return; }

      const keep = "Built ";
      let cur = "Built APIs";
      while (cur.length > keep.length) { cur = cur.slice(0, -1); el.textContent = cur; await wait(30); }

      const rest = target.slice(keep.length);
      for (let i = 0; i < rest.length; i++) {
        el.innerHTML = keep + rest.slice(0, i + 1) + "<span class='cur'></span>";
        await wait(16);
      }
      el.textContent = target;
      await wait(500);
      bullet.classList.add("done");
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
    <section className="beat" id="tailor" data-rail-trigger="tailored">
      <div className="container">
        <div className="section-label reveal">
          <span className="idx">05</span>
          <h2>Rewriting the resume</h2>
          <span className="ts mono">07:44 · tailoring for Atlas Systems</span>
        </div>
        <div className="resume-grid">
          <div className="doc reveal" id="resumeDoc">
            <div className="doc-name">Priya Nair</div>
            <div className="doc-meta">Backend Engineer · 5 yrs · Bengaluru</div>
            <div className="doc-sec">Experience</div>
            <div className="doc-role">Senior Engineer, Fintech Co <span>2022 — present</span></div>
            <div className="bullet"><span className="mk">—</span><span className="text">Owned the payments service through a 3× traffic ramp</span></div>
            <div className="bullet morph" id="morphBullet">
              <span className="mk">—</span><span className="text" id="morphText">Built APIs</span>
            </div>
            <div className="bullet"><span className="mk">—</span><span className="text">Mentored two junior engineers</span></div>
          </div>
          <div className="resume-aside reveal d2">
            <div className="kicker">TAILORED, NOT TEMPLATED</div>
            <div className="serif-line">"Built APIs" becomes something a hiring manager actually stops on.</div>
            <p>It pulls the real numbers from your history and matches them to what this specific role is asking for. One resume per job, in seconds.</p>
            <div className="before-after">
              <div className="ba before"><div className="l">Before</div><div className="n">2 words</div></div>
              <div className="ba after"><div className="l">After</div><div className="n">match +14</div></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}