"use client";
import { useState } from "react";
import { PREP } from "@/components/dashboard/data";
import { PageHead } from "@/components/dashboard/shared";
import { Icon } from "@/components/dashboard/icons";

const arrIcon: React.CSSProperties = { width: 14, height: 14, display: "inline-block" };

export default function InterviewPrep() {
  const [view, setView] = useState<"list" | "brief">("list");
  const b = PREP.brief;

  if (view === "brief") {
    return (
      <div className="page">
        <PageHead
          eyebrow={<><span style={{ width: 13, height: 13, display: "inline-block" }}><Icon name="prep" /></span> Interview Prep · Brief</>}
          title={b.company + " · " + b.role}
          right={<button className="btn btn-ghost btn-sm" onClick={() => setView("list")}>← All interviews</button>}
        />
        <div className="brief-doc">
          <div className="bd-block">
            <div className="bd-h">Company snapshot</div>
            <div style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6 }}>{b.snapshot}</div>
          </div>
          <div className="bd-block">
            <div className="bd-h">Role themes</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {b.themes.map((t, i) => <span className="tagchip" key={i} style={{ fontSize: 12, padding: "6px 11px" }}>{t}</span>)}
            </div>
          </div>
          <div className="bd-block">
            <div className="bd-h">3 talking points — from your actual history</div>
            {b.talkingPoints.map((t, i) => <div className="bd-li" key={i}><span className="qn">{i + 1}</span>{t}</div>)}
          </div>
          <div className="bd-block">
            <div className="bd-h">5 likely questions · STAR ready</div>
            {b.questions.map((q, i) => (
              <div className="bd-li" key={i}><span className="qn">Q{i + 1}</span><div><div>{q.q}</div><div className="star">{q.star}</div></div></div>
            ))}
          </div>
          <div className="bd-block">
            <div className="bd-h">3 questions to ask them</div>
            {b.ask.map((q, i) => <div className="bd-li" key={i}><span className="qn">→</span>{q}</div>)}
          </div>
          <div className="bd-block" style={{ marginBottom: 0 }}>
            <div className="bd-h">Day-of reminders</div>
            {b.reminders.map((r, i) => (
              <div className="bd-li" key={i}>
                <span style={{ width: 15, height: 15, color: "var(--accent)", flexShrink: 0, display: "block" }}><Icon name="check" /></span>
                {r}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHead
        eyebrow={<><span style={{ width: 13, height: 13, display: "inline-block" }}><Icon name="prep" /></span> Interview Prep</>}
        title="The application was automated. This part won't be."
        sub="Aviram assembles a prep brief from your real history for every interview it books."
      />
      <div className="prep-grid">
        {PREP.upcoming.map((p) => (
          <div className={"prep-card" + (p.soon ? " soon" : "")} key={p.id}>
            <div className="pc-count"><span style={{ width: 13, height: 13, display: "inline-block" }}><Icon name="clock" /></span> In {p.countdown}</div>
            <div className="pc-co">{p.company}</div>
            <div className="pc-role">{p.role}</div>
            <div className="pc-date">{p.date}</div>
            <div className="pc-progress">
              <div className="pl"><span>Prep tasks</span><span>{p.progress}%</span></div>
              <div className="pbar"><i style={{ width: p.progress + "%" }} /></div>
            </div>
            <div className="pc-act">
              <button className={"btn btn-sm " + (p.soon ? "btn-primary" : "btn-ghost")} onClick={() => setView("brief")}>
                Open prep brief <span className="arr" style={arrIcon}><Icon name="arrow" /></span>
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="sec-label">Question bank <span className="ln" /></div>
      <div className="filterbar">
        {["All", "Systems design", "Behavioral", "Coding", "Domain"].map((f, i) => (
          <button key={f} className={"fchip" + (i === 0 ? " active" : "")}>{f}</button>
        ))}
      </div>
      <div className="card">
        {b.questions.map((q, i) => (
          <div key={i} className="dp-kv" style={{ padding: "14px 18px", borderBottom: i < b.questions.length - 1 ? "1px solid var(--line-soft)" : "none" }}>
            <span className="k" style={{ fontSize: 13.5, color: "var(--ink-2)" }}>{q.q}</span>
            <span className="v" style={{ color: "var(--ink-4)", fontSize: 11 }}>{q.star.split(" · ")[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}