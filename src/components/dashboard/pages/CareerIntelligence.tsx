"use client";
import { useRef, useEffect, useState } from "react";
import { INTEL } from "@/components/dashboard/data";
import { CountUp, PageHead, EmptyState } from "@/components/dashboard/shared";
import { Icon } from "@/components/dashboard/icons";

export default function CareerIntelligence() {
  const ref = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const [countUp, setCountUp] = useState(false);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.querySelectorAll<HTMLElement>("i[data-w]").forEach((b) => { b.style.width = (b.dataset.w ?? "0") + "%"; });
        }
      });
    }, { threshold: 0.4 });
    el.querySelectorAll(".winbar").forEach((w) => io.observe(w));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = headlineRef.current; if (!el) return;
    const io = new IntersectionObserver((es) => {
      if (es.some(e => e.isIntersecting)) { setCountUp(true); io.disconnect(); }
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="page">
      <PageHead
        eyebrow={<><span style={{ width: 13, height: 13, display: "inline-block" }}><Icon name="intelligence" /></span> Career Intelligence</>}
        title="What Aviram has learned about your search."
      />
      {!INTEL.hasData ? (
        <EmptyState>Aviram needs more outcome data to generate insights — complete your first calibration period.</EmptyState>
      ) : (
      <div className="report" ref={ref}>
        <p className="report-lede">After 91 applications and 14 weeks of watching what works, here is what the data says about <span className="em">where you actually win</span> — and what's leaving interviews on the table.</p>
        <div className="report-block">
          <div className="rb-title">The headline <span className="ln" /></div>
          <div className="proj-row" ref={headlineRef}>
            <div className="stat"><div className="n"><CountUp to={INTEL.current} start={countUp} />%</div><div className="k">Current interview rate</div></div>
            <div className="arrow">→</div>
            <div className="stat"><div className="n up"><CountUp to={INTEL.projected} start={countUp} />%</div><div className="k">Projected with optimisation</div></div>
          </div>
          <p style={{ fontSize: 14, color: "var(--ink-3)", marginTop: 16, maxWidth: "52ch" }}>That gap isn't luck. It's three habits Aviram can enforce on every application: referral-first, post-fresh, and the right resume per role.</p>
        </div>
        <div className="report-block">
          <div className="rb-title">Where you win <span className="ln" /></div>
          <div className="winbars">
            {INTEL.wins.map((w, i) => (
              <div className="winbar" key={i}>
                <span className="wk">{w.k}</span>
                <span className="wtrack"><i className={w.hi ? "" : "lo"} data-w={w.v * 3.5} /></span>
                <span className={"wv" + (w.hi ? "" : " lo")}>{w.v}%</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13.5, color: "var(--ink-3)", marginTop: 16 }}>You convert <b style={{ color: "var(--accent)" }}>11× better</b> at Series A fintech than at FAANG. Aviram weights your queue toward that — not because FAANG is bad, but because your time isn't free.</p>
        </div>
        <div className="report-block">
          <div className="rb-title">What Aviram discovered <span className="ln" /></div>
          {INTEL.discoveries.map((d, i) => (
            <div className="disc-row" key={i}>
              <span className="dv">{d.v}</span>
              <span className="dk"><b>{d.b}</b> — {d.k}</span>
            </div>
          ))}
        </div>
        <div className="report-pull">"Applications within six hours of posting respond 3.1× more often." You weren't fast enough. Aviram never sleeps.</div>
        <div className="report-block">
          <div className="rb-title">Skill ROI — what to learn next <span className="ln" /></div>
          {INTEL.roi.map((r, i) => (
            <div className="roi-row" key={i}>
              <span className="rk">{r.skill}</span>
              <span className="rd"><b>{r.lift}</b> {r.desc}</span>
              <span className="rt">{r.time}</span>
            </div>
          ))}
          <p style={{ fontSize: 13.5, color: "var(--ink-3)", marginTop: 16 }}>Kubernetes shows up in 31 of your 47 queued roles. Six weeks of it lifts your predicted IPS across the whole backend queue — the single highest-leverage thing on this page.</p>
        </div>
      </div>
      )}
    </div>
  );
}
