"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function Closing() {
  useEffect(() => {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); revealObs.unobserve(e.target); } });
    }, { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll("#cta .reveal").forEach((el) => revealObs.observe(el));
    return () => revealObs.disconnect();
  }, []);

  return (
    <section className="closing deep" id="cta">
      <div className="container">
        <div className="stat-line reveal">
          <div className="serif-line">
            The average application interviews <span className="from">2–4%</span> of the time.<br />
            Aviram's applicants sit at <span className="to">15–20%.</span>
          </div>
        </div>
        <div className="cta-row reveal d1">
          <Link href="/signup" className="btn btn-cta" id="ctaBtn">See it find your next job →</Link>
          <Link href="/login" className="btn btn-ghost btn-sm" style={{ marginLeft: 12 }}>Sign in</Link>
          <span className="cta-note">it's already running. point it at your search.</span>
        </div>
      </div>
    </section>
  );
}