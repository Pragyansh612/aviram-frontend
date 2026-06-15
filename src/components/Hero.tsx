"use client";
import { useEffect, useRef, useCallback } from "react";

const SOURCES = ["Greenhouse","Lever","Ashby","Wellfound","Indeed","LinkedIn","Workday","YC Jobs","Otta","Naukri","SmartRecruiters","BambooHR","Recurse","AngelList","Hacker News","Built In"];

const LOG = [
  "Scanning 16 sources<span class='cur'></span>",
  "Found <b>53 opportunities</b>",
  "Top match: <b>Backend Engineer, Series A</b> — IPS 84",
];

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function animCount(el: HTMLElement, to: number, dur = 900, suffix = "") {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { el.textContent = to + suffix; return; }
  const start = performance.now();
  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / dur);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(to * e) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export default function Hero() {
  const genRef = useRef(0);
  const demoBodyRef = useRef<HTMLDivElement>(null);
  const sourcesRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const demoTopRef = useRef<HTMLDivElement>(null);
  const demoResultRef = useRef<HTMLDivElement>(null);
  const scanBarRef = useRef<HTMLDivElement>(null);
  const demoStateRef = useRef<HTMLSpanElement>(null);
  const cFoundRef = useRef<HTMLSpanElement>(null);
  const cIntRef = useRef<HTMLSpanElement>(null);
  const heroNoteRef = useRef<HTMLSpanElement>(null);
  const uploadBtnRef = useRef<HTMLButtonElement>(null);

  const fresh = useCallback((my: number) => my === genRef.current, []);

  const resetDemo = useCallback(() => {
    if (demoStateRef.current) demoStateRef.current.textContent = "scanning";
    sourcesRef.current?.querySelectorAll(".src").forEach((e) => e.classList.remove("scanned"));
    logRef.current?.querySelectorAll(".log-line").forEach((l) => {
      l.classList.remove("in");
      const t = l.querySelector(".t");
      if (t) (t as HTMLElement).innerHTML = "";
    });
    demoTopRef.current?.classList.remove("in");
    demoResultRef.current?.classList.remove("in");
    if (cFoundRef.current) cFoundRef.current.textContent = "0";
    if (cIntRef.current) cIntRef.current.textContent = "0";
  }, []);

  const playCycle = useCallback(async (my: number) => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    demoBodyRef.current?.classList.add("fade");
    await wait(reduce ? 0 : 720); if (!fresh(my)) return;
    resetDemo();
    demoBodyRef.current?.classList.remove("fade");
    await wait(reduce ? 0 : 560); if (!fresh(my)) return;

    const bar = scanBarRef.current;
    if (bar) { bar.classList.remove("run"); void bar.offsetWidth; bar.classList.add("run"); }

    const srcEls = Array.from(sourcesRef.current?.querySelectorAll(".src") ?? []);
    for (let i = 0; i < srcEls.length; i++) {
      srcEls[i].classList.add("scanned");
      await wait(reduce ? 0 : 72); if (!fresh(my)) return;
    }
    await wait(reduce ? 0 : 260); if (!fresh(my)) return;

    const logLines = Array.from(logRef.current?.querySelectorAll(".log-line") ?? []);
    for (let i = 0; i < logLines.length; i++) {
      logLines[i].classList.add("in");
      const t = logLines[i].querySelector(".t");
      if (t) (t as HTMLElement).innerHTML = LOG[i];
      await wait(reduce ? 0 : 760); if (!fresh(my)) return;
    }
    if (demoStateRef.current) demoStateRef.current.textContent = "complete";
    await wait(reduce ? 0 : 340); if (!fresh(my)) return;
    demoTopRef.current?.classList.add("in");
    await wait(reduce ? 0 : 320); if (!fresh(my)) return;
    demoResultRef.current?.classList.add("in");
    if (cFoundRef.current) animCount(cFoundRef.current, 53, 1100);
    if (cIntRef.current) animCount(cIntRef.current, 11, 1100);
  }, [fresh, resetDemo]);

  const heroLoop = useCallback(async () => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    while (true) {
      genRef.current++;
      const my = genRef.current;
      await playCycle(my);
      if (!fresh(my)) continue;
      await wait(reduce ? 1200 : 4200);
      if (!fresh(my)) continue;
    }
  }, [playCycle, fresh]);

  useEffect(() => {
    const timer = setTimeout(heroLoop, 350);
    const onReplay = () => { genRef.current++; };
    window.addEventListener("aviram:replay", onReplay);
    return () => {
      clearTimeout(timer);
      genRef.current = -1;
      window.removeEventListener("aviram:replay", onReplay);
    };
  }, [heroLoop]);

  const handleUpload = async () => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const btn = uploadBtnRef.current;
    const note = heroNoteRef.current;
    if (!btn || !note) return;
    btn.disabled = true;
    btn.innerHTML = "⬆ priya_nair_resume.pdf";
    note.textContent = "parsing resume…";
    window.dispatchEvent(new CustomEvent("aviram:railrefresh"));
    await wait(reduce ? 0 : 650);
    note.textContent = "resume parsed · 5 yrs · backend · re-running scan";
    genRef.current++;
    await wait(reduce ? 0 : 1400);
    note.textContent = "scroll to watch the rest →";
    btn.innerHTML = "⬆ Try with a sample resume";
    btn.disabled = false;
  };

  return (
    <section className="hero" data-rail-trigger="uploaded">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-copy">
            <div className="eyebrow"><span className="dot" />An autonomous job search</div>
            <h1 className="hero-headline">
              Most job searches stop when you close the laptop.{" "}
              <span className="em">This one starts.</span>
            </h1>
            <p className="hero-sub">
              Aviram finds the openings, scores them by how likely they are to interview you, rewrites your resume for each, and applies. You read the results.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary" ref={uploadBtnRef} onClick={handleUpload}>
                ⬆ Try with a sample resume
              </button>
              <span className="note" ref={heroNoteRef}>no signup · runs in your browser</span>
            </div>
          </div>

          <div className="panel" id="demoPanel">
            <div className="panel-head">
              <span className="dots"><i /><i /><i /></span>
              <span className="title">aviram · live run</span>
              <span className="right">
                <span className="live-dot" />
                {" "}<span ref={demoStateRef}>scanning</span>
              </span>
            </div>
            <div className="demo-body" ref={demoBodyRef}>
              <div className="scan-bar" ref={scanBarRef}><i /></div>
              <div className="sources" ref={sourcesRef}>
                {SOURCES.map((s) => <div className="src" key={s}>{s}</div>)}
              </div>
              <div className="demo-log" ref={logRef}>
                <div className="log-line" data-i="0"><span className="mk">›</span><span className="t" /></div>
                <div className="log-line" data-i="1"><span className="mk ok">✓</span><span className="t" /></div>
                <div className="log-line" data-i="2"><span className="mk ok">✓</span><span className="t" /></div>
              </div>
              <div className="demo-toprow" ref={demoTopRef}>
                <div className="role">Backend Engineer <span>· Series A · remote</span></div>
                <div className="ips-chip">IPS <span id="demoIps">84</span></div>
              </div>
              <div className="demo-result" ref={demoResultRef}>
                <div className="stat">
                  <div className="k">Opportunities found</div>
                  <div className="v"><span ref={cFoundRef}>0</span></div>
                </div>
                <div className="stat">
                  <div className="k">Predicted interviews</div>
                  <div className="v"><span ref={cIntRef}>0</span><small>/ next 30 days</small></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}