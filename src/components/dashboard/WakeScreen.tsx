"use client";
import { useEffect, useRef, useState } from "react";

const LINES = [
  "syncing profile & preferences",
  "loading calibration model",
  "resuming discovery queue",
];

export default function WakeScreen({ onDone }: { onDone: () => void }) {
  const [shown, setShown] = useState(0);
  // Store onDone in a ref so the effect never needs to list it as a dependency.
  // Parent components typically pass an inline arrow that would create a new
  // function reference every render, causing the timers to reset prematurely.
  const onDoneRef = useRef(onDone);
  useEffect(() => { onDoneRef.current = onDone; });

  useEffect(() => {
    const timers = LINES.map((_, i) =>
      setTimeout(() => setShown(i + 1), 400 + i * 420)
    );
    const done = setTimeout(() => onDoneRef.current(), 400 + LINES.length * 420 + 600);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  }, []);

  return (
    <div className="entry-stage wake-stage">
      <div className="active-system">
        <div className="as-glyph">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 2 L21 20 H14.5 L12 13.5 L9.5 20 H3 Z" style={{ fill: "var(--accent)" }} />
          </svg>
        </div>
        <div className="as-line l1" style={{ opacity: 1, transform: "none", animation: "none" }}>
          Aviram is <b>waking up</b>.
        </div>
        <div className="wake-feed">
          {LINES.map((line, i) => (
            <div className={"wake-row" + (i < shown ? " in" : "")} key={line}>
              <span className="wk">›</span>
              <span className="tx">{line}</span>
              {i < shown && <span className="ok">✓</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
