"use client";
import { useEffect, useRef } from "react";

const DISCOVERY = [
  { badge:"Lever",          role:"Backend Engineer",     co:"Atlas Systems" },
  { badge:"Greenhouse",     role:"Platform Engineer",    co:"Northwind" },
  { badge:"Ashby",          role:"Full-Stack Engineer",  co:"Cadence Labs" },
  { badge:"Wellfound",      role:"Backend Engineer",     co:"Ledgerline" },
  { badge:"YC Jobs",        role:"Software Engineer",    co:"Pylon" },
  { badge:"Indeed",         role:"Software Engineer II", co:"Brightwell" },
  { badge:"Workday",        role:"Backend Engineer",     co:"Meridian" },
  { badge:"LinkedIn",       role:"Backend Engineer",     co:"Goliath Corp" },
  { badge:"Otta",           role:"API Engineer",         co:"Fathom" },
  { badge:"AngelList",      role:"Backend Engineer",     co:"Drift Labs" },
  { badge:"SmartRecruiters",role:"Senior Engineer",      co:"Halcyon" },
  { badge:"Built In",       role:"Backend Engineer",     co:"Tessera" },
];

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export default function Discovery() {
  const triggered = useRef(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const srcRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = document.getElementById("discovery");
    if (!section) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const run = async () => {
      if (triggered.current) return;
      triggered.current = true;
      const grid = gridRef.current;
      const countEl = countRef.current;
      const srcEl = srcRef.current;
      if (!grid || !countEl || !srcEl) return;
      grid.innerHTML = "";
      let found = 0;
      for (let i = 0; i < DISCOVERY.length; i++) {
        const c = document.createElement("div");
        c.className = "minicard";
        c.innerHTML = `<span class="badge">${DISCOVERY[i].badge}</span><div class="role">${DISCOVERY[i].role}</div><div class="co">${DISCOVERY[i].co}</div>`;
        grid.appendChild(c);
        requestAnimationFrame(() => c.classList.add("in"));
        srcEl.textContent = DISCOVERY[i].badge;
        found += Math.floor(Math.random() * 4) + 3;
        countEl.textContent = String(Math.min(found, 53));
        await wait(reduce ? 0 : 110);
      }
      countEl.textContent = "53";
      srcEl.textContent = "all 16 sources";
    };

    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { run(); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(section);
    return () => obs.disconnect();
  }, []);

  // Reveal observer
  useEffect(() => {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); revealObs.unobserve(e.target); } });
    }, { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll("#discovery .reveal").forEach((el) => revealObs.observe(el));
    return () => revealObs.disconnect();
  }, []);

  return (
    <section className="beat soft" id="discovery" data-rail-trigger="found">
      <div className="container">
        <div className="section-label reveal">
          <span className="idx">01</span>
          <h2>Finding opportunities</h2>
          <span className="ts mono">07:41 · 16 sources, live</span>
        </div>
        <div className="discovery-head reveal">
          <span className="count"><span className="n" ref={countRef}>0</span> found</span>
          <span className="src-now">scanning <b ref={srcRef}>Greenhouse</b></span>
        </div>
        <div className="discovery-grid" ref={gridRef} />
      </div>
    </section>
  );
}