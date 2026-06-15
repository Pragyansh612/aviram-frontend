"use client";
import { useEffect, useRef } from "react";

const JOBS = [
  { badge:"Lever",      role:"Backend Engineer",     co:"Atlas Systems", tag:"Series A · remote", ips:84, cls:"high" },
  { badge:"Greenhouse", role:"Platform Engineer",    co:"Northwind",     tag:"Series B · hybrid", ips:76, cls:"high" },
  { badge:"Ashby",      role:"Full-Stack Engineer",  co:"Cadence Labs",  tag:"Seed · remote",     ips:71, cls:"mid"  },
  { badge:"Wellfound",  role:"Backend Engineer",     co:"Ledgerline",    tag:"Series A · onsite", ips:68, cls:"mid"  },
  { badge:"Indeed",     role:"Software Engineer II", co:"Brightwell",    tag:"Series C · hybrid", ips:54, cls:"mid"  },
  { badge:"LinkedIn",   role:"Backend Engineer",     co:"Goliath Corp",  tag:"Series C · onsite", ips:42, cls:"low"  },
];
const THRESHOLD = 70;
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function animCount(el: HTMLElement, to: number, dur = 900) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { el.textContent = String(to); return; }
  const start = performance.now();
  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / dur);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = String(Math.round(to * e));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export default function Scoring() {
  const triggered = useRef(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const shortRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = document.getElementById("scoring");
    if (!section) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const run = async () => {
      if (triggered.current) return;
      triggered.current = true;
      const feed = feedRef.current;
      const shortEl = shortRef.current;
      if (!feed || !shortEl) return;
      feed.innerHTML = "";

      const cards = JOBS.map((j) => {
        const c = document.createElement("div");
        c.className = "jobcard";
        c.dataset.ips = String(j.ips);
        c.innerHTML = `<span class="meterbar"></span><span class="badge">${j.badge}</span><div class="meta"><div class="role">${j.role}</div><div class="co">${j.co} <span class="tag">· ${j.tag}</span></div></div><div class="score"><span class="num">—</span><small>IPS</small></div><span class="crown">Top pick</span>`;
        feed.appendChild(c);
        return c;
      });

      requestAnimationFrame(() => cards.forEach((c) => c.classList.add("in")));
      await wait(reduce ? 0 : 550);

      for (let i = 0; i < cards.length; i++) {
        cards[i].classList.add(JOBS[i].cls);
        cards[i].querySelector(".score")!.classList.add("in");
        animCount(cards[i].querySelector(".num") as HTMLElement, JOBS[i].ips, 650);
        await wait(reduce ? 0 : 150);
      }
      await wait(reduce ? 0 : 600);

      let survivors = JOBS.length;
      for (let i = cards.length - 1; i >= 0; i--) {
        if (JOBS[i].ips < THRESHOLD) {
          cards[i].classList.add("dropped");
          survivors--;
          shortEl.textContent = String(survivors);
          await wait(reduce ? 0 : 260);
        }
      }
      shortEl.textContent = String(survivors);
      await wait(reduce ? 0 : 350);

      const live = cards.filter((_, i) => JOBS[i].ips >= THRESHOLD);
      const sorted = [...live].sort((a, b) => Number(b.dataset.ips) - Number(a.dataset.ips));
      const firstMap = new Map<HTMLElement, number>();
      live.forEach((c) => firstMap.set(c, c.getBoundingClientRect().top));
      sorted.forEach((c) => feed.appendChild(c));
      cards.filter((_, i) => JOBS[i].ips < THRESHOLD).forEach((c) => feed.appendChild(c));

      if (!reduce) {
        live.forEach((c) => {
          const last = c.getBoundingClientRect().top;
          const dy = (firstMap.get(c) ?? last) - last;
          if (dy) {
            c.style.transform = `translateY(${dy}px)`;
            c.style.transition = "none";
            requestAnimationFrame(() => {
              c.style.transition = "transform .7s cubic-bezier(.22,1,.36,1)";
              c.style.transform = "";
            });
          }
        });
      }
      await wait(reduce ? 0 : 700);
      if (sorted[0]) sorted[0].classList.add("toppick");
    };

    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { run(); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(section);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); revealObs.unobserve(e.target); } });
    }, { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll("#scoring .reveal").forEach((el) => revealObs.observe(el));
    return () => revealObs.disconnect();
  }, []);

  return (
    <section className="beat" id="scoring" data-rail-trigger="shortlisted">
      <div className="container">
        <div className="section-label reveal">
          <span className="idx">02</span>
          <h2>Scoring</h2>
          <p className="lede">Each opening gets an Interview Probability Score. The flood narrows — only the openings worth your time survive.</p>
          <span className="ts mono">07:41 · IPS model v4</span>
        </div>
        <div className="scoring-shell">
          <div className="scoring-meter reveal">
            <span className="from">53 scanned</span>
            <span className="arrow">→</span>
            <span className="to"><span className="n" ref={shortRef}>53</span> above your threshold</span>
          </div>
          <div className="feed narrow" ref={feedRef} />
        </div>
      </div>
    </section>
  );
}