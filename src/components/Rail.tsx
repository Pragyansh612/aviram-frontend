"use client";
import { useEffect, useRef } from "react";

const RAIL_ITEMS = [
  { key: "uploaded",   label: "Resume uploaded" },
  { key: "found",      label: "Opportunities found" },
  { key: "shortlisted",label: "Shortlisted" },
  { key: "tailored",   label: "Resume tailored" },
  { key: "referral",   label: "Referral surfaced" },
  { key: "applied",    label: "Applied" },
  { key: "interview",  label: "Interview scheduled" },
];

export default function Rail() {
  const railRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const trigEls = Array.from(document.querySelectorAll<HTMLElement>("[data-rail-trigger]"));

    const railRefresh = () => {
      const marker = window.scrollY + window.innerHeight * 0.5;
      const tops = trigEls.map((el) => el.getBoundingClientRect().top + window.scrollY);
      let reachedIdx = -1;
      for (let i = 0; i < tops.length; i++) { if (tops[i] <= marker) reachedIdx = i; }

      trigEls.forEach((el, i) => {
        const key = el.dataset.railTrigger!;
        const it = rail.querySelector<HTMLElement>(`[data-rail="${key}"]`);
        if (!it) return;
        it.classList.toggle("reached", i <= reachedIdx);
        it.classList.toggle("active", i === reachedIdx);
        if (i >= 1) {
          const fill = it.querySelector<HTMLElement>(".rail-track .fill");
          if (fill) {
            const span = tops[i] - tops[i - 1];
            let frac = span > 0 ? (marker - tops[i - 1]) / span : (marker >= tops[i] ? 1 : 0);
            frac = Math.max(0, Math.min(1, frac));
            fill.style.height = frac * 100 + "%";
          }
        }
      });

      rail.classList.toggle("visible", window.scrollY > window.innerHeight * 0.5);
    };

    const onScroll = () => { requestAnimationFrame(railRefresh); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", railRefresh, { passive: true });
    window.addEventListener("aviram:railrefresh", railRefresh);
    railRefresh();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", railRefresh);
      window.removeEventListener("aviram:railrefresh", railRefresh);
    };
  }, []);

  return (
    <nav className="rail" id="rail" aria-label="Process status" ref={railRef}>
      {RAIL_ITEMS.map((item) => (
        <div className="rail-item" data-rail={item.key} key={item.key}>
          <span className="rail-track"><i className="fill" /></span>
          <span className="rail-dot" />
          <span className="rail-label">{item.label}</span>
        </div>
      ))}
    </nav>
  );
}