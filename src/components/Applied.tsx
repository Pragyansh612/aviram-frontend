"use client";
import { useEffect, useRef } from "react";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export default function Applied() {
  const triggered = useRef(false);

  useEffect(() => {
    const section = document.getElementById("applied");
    if (!section) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const run = async () => {
      if (triggered.current) return;
      triggered.current = true;
      await wait(reduce ? 0 : 250);
      section.querySelector("#checkBadge")?.classList.add("in");
      await wait(reduce ? 0 : 750);
      section.querySelector("#appliedRow")?.classList.add("done");
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
    <section className="beat" id="applied" data-rail-trigger="applied">
      <div className="container">
        <div className="applied-row reveal" id="appliedRow">
          <div className="check-badge" id="checkBadge">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12.5 L9.5 18 L20 6.5" />
            </svg>
          </div>
          <div className="applied-text">
            <div className="l1">
              <span className="flip-from">Submitting to Atlas Systems…</span>
              <span className="flip-to">Applied to Atlas Systems</span>
            </div>
            <div className="l2">07:46 · resume v3 · referral request sent · no further action needed</div>
          </div>
        </div>
      </div>
    </section>
  );
}