"use client";
import { useState, useEffect, useMemo } from "react";
import { PREP } from "@/components/dashboard/data";
import { PageHead, EmptyState } from "@/components/dashboard/shared";
import { Icon } from "@/components/dashboard/icons";
import { useDashboard } from "@/contexts/DashboardContext";
import { apiListInterviewSessions } from "@/lib/api";

const arrIcon: React.CSSProperties = { width: 14, height: 14, display: "inline-block" };
const PREP_TASKS_KEY = "aviram-prep-tasks";
const QB_CATEGORIES = ["All", "Technical", "Behavioral", "System Design", "Company", "HR", "Coding"] as const;

function loadChecked(): Set<string> {
  try {
    const raw = localStorage.getItem(PREP_TASKS_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch { return new Set(); }
}

function saveChecked(set: Set<string>) {
  try { localStorage.setItem(PREP_TASKS_KEY, JSON.stringify([...set])); } catch {}
}

export default function InterviewPrep({ openBrief = false }: { openBrief?: boolean }) {
  const { apiLive } = useDashboard();
  const [upcoming, setUpcoming] = useState(PREP.upcoming);
  const [view, setView] = useState<"list" | "brief">(openBrief ? "brief" : "list");
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [qbFilter, setQbFilter] = useState<string>("All");
  const [taskPrep, setTaskPrep] = useState<string>("p1");
  const b = PREP.brief;

  useEffect(() => {
    if (!apiLive) return;
    apiListInterviewSessions()
      .then((sessions) => {
        if (!sessions.length) return;
        setUpcoming(sessions.map((s, i) => ({
          id: s.id,
          company: s.company_name,
          role: s.job_title,
          date: s.interview_at
            ? new Date(s.interview_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })
            : "Scheduled",
          countdown: i === 0 ? "Soon" : "—",
          progress: i === 0 ? 40 : 0,
          soon: i === 0,
        })));
        setTaskPrep(sessions[0]?.id ?? "p1");
      })
      .catch(() => {});
  }, [apiLive]);

  useEffect(() => { setChecked(loadChecked()); }, []);
  useEffect(() => {
    if (openBrief) setView("brief");
  }, [openBrief]);

  const toggleTask = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      saveChecked(next);
      return next;
    });
  };

  const tasksForPrep = PREP.tasks.filter(t => t.prepId === taskPrep);
  const tasksByDay = useMemo(() => {
    const days = [...new Set(tasksForPrep.map(t => t.day))].sort((a, b) => b - a);
    return days.map(day => ({ day, items: tasksForPrep.filter(t => t.day === day) }));
  }, [tasksForPrep]);

  const filteredQuestions = PREP.questionBank.filter(q =>
    qbFilter === "All" || q.category === qbFilter
  );

  const taskDone = tasksForPrep.filter(t => checked.has(t.id)).length;
  const taskPct = tasksForPrep.length ? Math.round(taskDone / tasksForPrep.length * 100) : 0;

  if (view === "brief") {
    return (
      <div className="page">
        <PageHead
          eyebrow={<><span style={{ width: 13, height: 13, display: "inline-block" }}><Icon name="prep" /></span> Interview Prep · Brief</>}
          title={b.company + " · " + b.role}
          right={<button type="button" className="btn btn-ghost btn-sm" onClick={() => setView("list")}>← All interviews</button>}
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
      {upcoming.length === 0 ? (
        <EmptyState>No interviews scheduled. Aviram will add prep plans when it books one.</EmptyState>
      ) : (
      <>
      <div className="prep-grid">
        {upcoming.map((p) => (
          <div
            className={"prep-card" + (p.soon ? " soon" : "") + (taskPrep === p.id ? " active-prep" : "")}
            key={p.id}
            onClick={() => setTaskPrep(p.id)}
            style={{ cursor: "pointer" }}
            role="button"
            tabIndex={0}
          >
            <div className="pc-count"><span style={{ width: 13, height: 13, display: "inline-block" }}><Icon name="clock" /></span> In {p.countdown}</div>
            <div className="pc-co">{p.company}</div>
            <div className="pc-role">{p.role}</div>
            <div className="pc-date">{p.date}</div>
            <div className="pc-progress">
              <div className="pl"><span>Prep tasks</span><span>{taskPrep === p.id ? taskPct : p.progress}%</span></div>
              <div className="pbar"><i style={{ width: (taskPrep === p.id ? taskPct : p.progress) + "%" }} /></div>
            </div>
            <div className="pc-act">
              <button type="button" className={"btn btn-sm " + (p.soon ? "btn-primary" : "btn-ghost")} onClick={(e) => { e.stopPropagation(); setTaskPrep(p.id); setView("brief"); }}>
                Open prep brief <span className="arr" style={arrIcon}><Icon name="arrow" /></span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="sec-label">Prep plan · {upcoming.find(p => p.id === taskPrep)?.company} <span className="ln" /></div>
      <div className="prep-tasks card card-pad">
        {tasksByDay.map(({ day, items }) => (
          <div className="prep-day" key={day}>
            <div className="prep-day-h">Day {day} {day === 1 ? "· interview day" : day === 2 ? "· eve before" : "· before"}</div>
            {items.map((t) => (
              <label className="prep-task" key={t.id}>
                <input type="checkbox" checked={checked.has(t.id)} onChange={() => toggleTask(t.id)} />
                <span className={checked.has(t.id) ? "done" : ""}>{t.label}</span>
              </label>
            ))}
          </div>
        ))}
      </div>

      <div className="sec-label">Question bank <span className="ln" /></div>
      <div className="filterbar">
        {QB_CATEGORIES.map((f) => (
          <button key={f} type="button" className={"fchip" + (qbFilter === f ? " active" : "")} onClick={() => setQbFilter(f)}>{f}</button>
        ))}
      </div>
      <div className="card">
        {filteredQuestions.length === 0 ? (
          <EmptyState>No questions in this category.</EmptyState>
        ) : filteredQuestions.map((q, i) => (
          <div key={i} className="dp-kv" style={{ padding: "14px 18px", borderBottom: i < filteredQuestions.length - 1 ? "1px solid var(--line-soft)" : "none" }}>
            <span className="k" style={{ fontSize: 13.5, color: "var(--ink-2)" }}>{q.q}</span>
            <span className="v" style={{ color: "var(--ink-4)", fontSize: 11 }}>{q.category}</span>
          </div>
        ))}
      </div>
      </>
      )}
    </div>
  );
}
