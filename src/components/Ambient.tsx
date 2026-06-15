"use client";
import { useEffect, useRef } from "react";

const AMBIENT = [
  "Posting is 4 hours old",
  "Recruiter responds faster than average",
  "Resume variant B selected for this role type",
  "Salary band inferred from 3 comparable roles",
  "Hiring manager active on LinkedIn today",
  "Two roles deduplicated across sources",
  "Referral path re-checked — still warm",
  "Application window closes in 6 days",
];

export default function Ambient() {
  const ref = useRef<HTMLDivElement>(null);
  const idxRef = useRef(0);
  const activeRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const push = () => {
      if (document.hidden) return;
      const el = ref.current;
      if (!el) return;
      const line = document.createElement("div");
      line.className = "amb-line";
      line.innerHTML = `<span class="mk">·</span> ${AMBIENT[idxRef.current % AMBIENT.length]}`;
      idxRef.current++;
      el.appendChild(line);
      requestAnimationFrame(() => line.classList.add("in"));
      activeRef.current.push(line);

      setTimeout(() => {
        line.classList.remove("in");
        setTimeout(() => line.remove(), 600);
        activeRef.current = activeRef.current.filter((l) => l !== line);
      }, 4200);

      if (activeRef.current.length > 2) {
        const old = activeRef.current.shift()!;
        old.classList.remove("in");
        setTimeout(() => old.remove(), 600);
      }
    };

    let timer: ReturnType<typeof setTimeout>;
    const loop = () => {
      const y = window.scrollY, h = window.innerHeight, doc = document.body.scrollHeight;
      const inStory = y > h * 0.8 && y < doc - h * 1.7;
      if (inStory) push();
      timer = setTimeout(loop, 3200);
    };
    timer = setTimeout(loop, 4000);
    return () => clearTimeout(timer);
  }, []);

  return <div className="ambient" id="ambient" ref={ref} />;
}