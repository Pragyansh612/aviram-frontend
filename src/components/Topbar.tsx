"use client";
import { useEffect, useRef } from "react";

export default function Topbar() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => {
      ref.current?.classList.toggle("scrolled", window.scrollY > 12);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    try { localStorage.setItem("aviram-theme", next); } catch {}
  };

  const handleReplay = () => {
    document.getElementById("top")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.dispatchEvent(new CustomEvent("aviram:replay"));
  };

  return (
    <header className="topbar" id="topbar" ref={ref}>
      <div className="container">
        <a className="brand" href="#top">
          <span className="glyph">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 2 L21 20 H14.5 L12 13.5 L9.5 20 H3 Z" fill="#234033" />
            </svg>
          </span>
          <span className="name">Aviram</span>
        </a>
        <div className="status">
          <span className="live-dot" />
          system live · 16 sources connected
        </div>
        <span className="spacer" />
        <button className="theme-toggle" id="themeToggle" aria-label="Toggle theme" onClick={toggleTheme}>
          <svg className="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
          </svg>
          <svg className="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        </button>
        <button className="btn btn-ghost btn-sm" onClick={handleReplay}>↻ Replay scan</button>
        <a href="#cta" className="btn btn-primary btn-sm">
          See it find your next job <span className="arr">→</span>
        </a>
      </div>
    </header>
  );
}