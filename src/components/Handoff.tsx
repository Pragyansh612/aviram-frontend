"use client";
import { useEffect } from "react";

export default function Handoff() {
  useEffect(() => {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); revealObs.unobserve(e.target); } });
    }, { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll("#handoff .reveal").forEach((el) => revealObs.observe(el));
    return () => revealObs.disconnect();
  }, []);

  return (
    <section className="beat" id="handoff" data-rail-trigger="interview">
      <div className="container">
        <div className="handoff">
          <div className="clock reveal">08:12 AM</div>
          <div className="state reveal d1">Interview scheduled — Thursday, 3:00 PM.<br />Prep brief ready.</div>
          <div className="line-a reveal d2">The application was automated. <span className="em">The conversation won't be.</span></div>
          <div className="line-b reveal d3">Job searching is a full-time job. It doesn't have to be yours.</div>
        </div>
      </div>
    </section>
  );
}