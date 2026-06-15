"use client";
import { useEffect, useRef } from "react";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export default function Referral() {
  const triggered = useRef(false);
  const graphDrawn = useRef(false);

  useEffect(() => {
    const section = document.getElementById("referral");
    if (!section) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const typeMessage = async () => {
      const card = section.querySelector("#msgCard");
      const bodyEl = card?.querySelector(".body") as HTMLElement | null;
      const full = `"Hey Rahul — saw Atlas is hiring on the backend team. You're connected to their eng lead, Maya. Would you be open to a quick intro? Happy to send context."`;
      card?.classList.add("in");
      if (!bodyEl) return;
      if (reduce) { bodyEl.textContent = full; return; }
      bodyEl.textContent = "";
      await wait(400);
      for (let i = 0; i < full.length; i++) {
        bodyEl.textContent = full.slice(0, i + 1);
        await wait(11);
      }
    };

    const drawGraph = () => {
      if (graphDrawn.current) return;
      graphDrawn.current = true;
      const edgesG = section.querySelector("#edges");
      const nodesG = section.querySelector("#nodes");
      const NS = "http://www.w3.org/2000/svg";
      if (!edgesG || !nodesG) return;

      const nodes = [
        { id:"you",  x:60,  y:160, r:22, label:"You",          cls:"n-you" },
        { id:"rk",   x:175, y:90,  r:16, label:"Rahul",        cls:"n-mid" },
        { id:"sn",   x:175, y:230, r:13, label:"Sara",         cls:"n-mid" },
        { id:"maya", x:300, y:120, r:18, label:"Maya · Atlas", cls:"n-target" },
        { id:"x1",   x:300, y:230, r:10, label:"",             cls:"n-dim" },
        { id:"x2",   x:300, y:40,  r:9,  label:"",             cls:"n-dim" },
      ];
      const edges = [
        { a:"you", b:"rk", warm:true },
        { a:"you", b:"sn",  warm:false },
        { a:"rk",  b:"maya", warm:true },
        { a:"rk",  b:"x2",  warm:false },
        { a:"sn",  b:"x1",  warm:false },
      ];
      const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
      const warmEdgeEls: SVGLineElement[] = [];

      edges.forEach((e, i) => {
        const a = byId[e.a], b = byId[e.b];
        const line = document.createElementNS(NS, "line");
        line.setAttribute("x1", String(a.x)); line.setAttribute("y1", String(a.y));
        line.setAttribute("x2", String(b.x)); line.setAttribute("y2", String(b.y));
        line.setAttribute("class", "gedge" + (e.warm ? " warm" : ""));
        const len = Math.hypot(b.x - a.x, b.y - a.y);
        if (!reduce) {
          line.style.strokeDasharray = String(len);
          line.style.strokeDashoffset = String(len);
          line.style.transition = `stroke-dashoffset .8s cubic-bezier(.22,1,.36,1) ${0.3 + i * 0.12}s, stroke .4s`;
          requestAnimationFrame(() => { line.style.strokeDashoffset = "0"; });
        }
        edgesG.appendChild(line);
        if (e.warm) warmEdgeEls.push(line);
      });

      nodes.forEach((n, i) => {
        const g = document.createElementNS(NS, "g");
        g.setAttribute("class", "gnode " + n.cls);
        const c = document.createElementNS(NS, "circle");
        c.setAttribute("cx", String(n.x)); c.setAttribute("cy", String(n.y));
        c.setAttribute("r", reduce ? String(n.r) : "0");
        c.setAttribute("stroke-width", "2");
        if (!reduce) {
          c.style.transition = `r .5s cubic-bezier(.22,1,.36,1) ${i * 0.1}s`;
          requestAnimationFrame(() => c.setAttribute("r", String(n.r)));
        }
        g.appendChild(c);
        if (n.label) {
          const t = document.createElementNS(NS, "text");
          t.setAttribute("x", String(n.x)); t.setAttribute("y", String(n.y + n.r + 14));
          t.setAttribute("text-anchor", "middle");
          t.textContent = n.label;
          g.appendChild(t);
        }
        nodesG.appendChild(g);
      });

      setTimeout(() => {
        warmEdgeEls.forEach((el) => el.classList.add("discovered"));
        typeMessage();
      }, reduce ? 0 : 1500);
    };

    const run = () => {
      if (triggered.current) return;
      triggered.current = true;
      drawGraph();
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
    <section className="beat soft" id="referral" data-rail-trigger="referral">
      <div className="container">
        <div className="section-label reveal">
          <span className="idx">06</span>
          <h2>Found a referral</h2>
          <span className="ts mono">07:45 · graph · 2nd-degree</span>
        </div>
        <div className="ref-grid">
          <div>
            <div className="graph-wrap reveal" id="graphWrap">
              <svg viewBox="0 0 400 320" id="graphSvg">
                <g id="edges" />
                <g id="nodes" />
              </svg>
            </div>
          </div>
          <div className="ref-aside reveal d1">
            <div className="kicker">A WARM PATH, NOT A COLD ONE</div>
            <div className="serif-line">You know someone who knows the hiring manager.</div>
            <p>Aviram maps your network two degrees out, finds the shortest path into Atlas, and drafts the intro for you to send.</p>
            <div className="msg-card" id="msgCard">
              <div className="mhead">
                <div className="ava">RK</div>
                <div className="who">Rahul Krishnan <span>2nd · worked with you at Fintech Co</span></div>
                <div className="draft-tag">DRAFT</div>
              </div>
              <div className="body" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}