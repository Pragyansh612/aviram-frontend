"use client";
import { useEffect } from "react";

export default function Control() {
  useEffect(() => {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); revealObs.unobserve(e.target); } });
    }, { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll("#control .reveal").forEach((el) => revealObs.observe(el));
    return () => revealObs.disconnect();
  }, []);

  return (
    <section className="beat soft" id="control">
      <div className="container">
        <div className="section-label reveal">
          <span className="idx">08</span>
          <h2>You set the rules</h2>
          <span className="ts mono">preferences · applied to every run</span>
        </div>
        <div className="controls-grid">
          <div className="controls-aside reveal">
            <div className="serif-line">Is this going to spam applications with my name on them?</div>
            <p>No. It applies inside the limits you set, only above your score threshold, never to companies you've blocked. Nothing leaves without matching your rules.</p>
            <div className="quiet">— every value below is yours to change, any time —</div>
          </div>
          <div className="settings reveal d1">
            <div className="s-head">
              <span className="title">Application preferences</span>
              <span className="sub">priya@ · saved</span>
            </div>
            <div className="s-body">
              <div className="setting"><div className="s-label"><div className="k">Daily application limit</div><div className="d">Hard cap. It stops at this number.</div></div><div className="s-val">20</div></div>
              <div className="setting"><div className="s-label"><div className="k">Minimum match score</div><div className="d">Below this, it won't apply at all.</div></div><div className="s-val">70%</div></div>
              <div className="setting"><div className="s-label"><div className="k">Blocked companies</div><div className="d">Never surfaced, never contacted.</div></div><div className="s-val">3 added</div></div>
              <div className="setting"><div className="s-label"><div className="k">Salary floor</div><div className="d">Roles below are filtered out.</div></div><div className="s-val">₹12 LPA</div></div>
              <div className="setting"><div className="s-label"><div className="k">Auto-send referrals</div><div className="d">Draft only — you press send.</div></div><div className="toggle"><i /></div></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}