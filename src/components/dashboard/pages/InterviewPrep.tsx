"use client";
import { useState, useEffect, useMemo } from "react";
import { PREP } from "@/components/dashboard/data";
import { PageHead, EmptyState } from "@/components/dashboard/shared";
import { Icon } from "@/components/dashboard/icons";
import { showToast } from "@/components/dashboard/Toast";
import { useDashboard } from "@/contexts/DashboardContext";
import {
  apiListInterviewSessions,
  apiGetInterviewQuestions,
  apiGetInterviewPrepPlan,
  apiMarkInterviewTaskDone,
  apiBuildInterviewSession,
} from "@/lib/api";
import type { InterviewQuestion, PrepTask, CompanyResearch } from "@/lib/api/types";

const arrIcon: React.CSSProperties = { width: 14, height: 14, display: "inline-block" };

const QB_CATEGORIES: { label: string; key: string | null }[] = [
  { label: "All", key: null },
  { label: "Technical", key: "technical" },
  { label: "Behavioral", key: "behavioral" },
  { label: "System Design", key: "system_design" },
  { label: "Company", key: "company" },
  { label: "HR", key: "hr" },
  { label: "Coding", key: "coding" },
];
function categoryLabel(key: string): string {
  return QB_CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

type UpcomingRow = { id: string; company: string; role: string; date: string; countdown: string; progress: number; soon: boolean };

export default function InterviewPrep({ openBrief = false }: { openBrief?: boolean }) {
  const { apiLive } = useDashboard();
  const [upcoming, setUpcoming] = useState<UpcomingRow[]>(apiLive ? [] : PREP.upcoming);
  const [view, setView] = useState<"list" | "brief">(openBrief ? "brief" : "list");
  const [qbFilter, setQbFilter] = useState<string | null>(null);
  const [taskPrep, setTaskPrep] = useState<string>("p1");

  // Real per-session content — fetched (GET-only, zero LLM cost) when a session is selected.
  const [questions, setQuestions] = useState<InterviewQuestion[] | null>(null);
  const [prepTasks, setPrepTasks] = useState<PrepTask[] | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  // The narrative brief (company snapshot / talking points / questions to ask /
  // reminders) only exists behind the paid LLM build endpoint — there is no
  // GET to re-fetch a previously generated one, so it only ever appears in
  // this component's state after the user explicitly clicks "Generate".
  const [brief, setBrief] = useState<{ snapshot: CompanyResearch | null; text: string } | null>(null);
  const [building, setBuilding] = useState(false);

  useEffect(() => {
    if (!apiLive) {
      setUpcoming(PREP.upcoming);
      return;
    }
    apiListInterviewSessions()
      .then((sessions) => {
        // Live and legitimately empty is a real state — always overwrite,
        // never leave the mock initial value in place.
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
        if (sessions.length) setTaskPrep(sessions[0]!.id);
      })
      .catch(() => setUpcoming([]));
  }, [apiLive]);

  useEffect(() => {
    if (openBrief) setView("brief");
  }, [openBrief]);

  // Fetch real questions + prep plan for whichever session is selected.
  useEffect(() => {
    if (!apiLive || !taskPrep) return;
    let cancelled = false;
    setPlanLoading(true);
    setBrief(null);
    Promise.all([
      apiGetInterviewQuestions(taskPrep).catch(() => []),
      apiGetInterviewPrepPlan(taskPrep).catch(() => null),
    ]).then(([qs, plan]) => {
      if (cancelled) return;
      setQuestions(qs);
      setPrepTasks(plan?.tasks ?? null);
      setPlanLoading(false);
    });
    return () => { cancelled = true; };
  }, [apiLive, taskPrep]);

  const toggleTask = async (task: PrepTask) => {
    if (!task.id) return;
    const nextDone = !task.is_done;
    setPrepTasks((prev) => prev?.map((t) => (t.id === task.id ? { ...t, is_done: nextDone } : t)) ?? prev);
    try {
      await apiMarkInterviewTaskDone(taskPrep, task.id, nextDone);
    } catch {
      // Roll back — the server didn't record it, so the UI shouldn't claim it did.
      setPrepTasks((prev) => prev?.map((t) => (t.id === task.id ? { ...t, is_done: !nextDone } : t)) ?? prev);
      showToast("Couldn't save that — try again.", "warn");
    }
  };

  // Local checked-state toggle used only in offline/demo mode, where PREP.tasks
  // has no backend counterpart to persist against.
  const [demoChecked, setDemoChecked] = useState<Set<string>>(new Set());
  const toggleDemoTask = (id: string) => {
    setDemoChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleGenerateBrief = async () => {
    setBuilding(true);
    try {
      const full = await apiBuildInterviewSession(taskPrep);
      setQuestions(full.questions);
      setPrepTasks(full.prep_plan?.tasks ?? null);
      setBrief({ snapshot: full.research, text: full.brief ?? "" });
      showToast("Prep brief generated", "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Couldn't generate the prep brief — try again.", "warn");
    } finally {
      setBuilding(false);
    }
  };

  const demoTasksForPrep = PREP.tasks.filter((t) => t.prepId === taskPrep);
  const demoTasksByDay = useMemo(() => {
    const days = [...new Set(demoTasksForPrep.map((t) => t.day))].sort((a, b) => b - a);
    return days.map((day) => ({ day, items: demoTasksForPrep.filter((t) => t.day === day) }));
  }, [demoTasksForPrep]);

  const realTasksByDay = useMemo(() => {
    if (!prepTasks) return [];
    const days = [...new Set(prepTasks.map((t) => t.day_number ?? 0))].sort((a, b) => b - a);
    return days.map((day) => ({ day, items: prepTasks.filter((t) => (t.day_number ?? 0) === day) }));
  }, [prepTasks]);

  type QRow = { text: string; categoryLabel: string; matchKey: string | null };
  const normalizedQuestions: QRow[] = apiLive
    ? (questions ?? []).map((q) => ({ text: q.question, categoryLabel: categoryLabel(q.category), matchKey: q.category }))
    : PREP.questionBank.map((q) => ({
        text: q.q,
        categoryLabel: q.category,
        matchKey: QB_CATEGORIES.find((c) => c.label === q.category)?.key ?? null,
      }));
  const filteredQuestions = normalizedQuestions.filter((q) => !qbFilter || q.matchKey === qbFilter);

  const demoTaskDone = demoTasksForPrep.filter((t) => demoChecked.has(t.id)).length;
  const demoTaskPct = demoTasksForPrep.length ? Math.round((demoTaskDone / demoTasksForPrep.length) * 100) : 0;
  const realTaskDone = prepTasks ? prepTasks.filter((t) => t.is_done).length : 0;
  const realTaskPct = prepTasks && prepTasks.length ? Math.round((realTaskDone / prepTasks.length) * 100) : 0;
  const taskPct = apiLive ? realTaskPct : demoTaskPct;

  const selectedUpcoming = upcoming.find((p) => p.id === taskPrep);

  if (view === "brief") {
    if (!apiLive) {
      const b = PREP.brief;
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
          eyebrow={<><span style={{ width: 13, height: 13, display: "inline-block" }}><Icon name="prep" /></span> Interview Prep · Brief</>}
          title={selectedUpcoming ? `${selectedUpcoming.company} · ${selectedUpcoming.role}` : "Interview brief"}
          right={<button type="button" className="btn btn-ghost btn-sm" onClick={() => setView("list")}>← All interviews</button>}
        />
        {!brief ? (
          <div className="card card-pad">
            <EmptyState>
              Aviram hasn&apos;t generated a written prep brief for this interview yet — it takes ~20-30s (real-time
              company research and question generation) once you ask for it.
            </EmptyState>
            <div className="ss-save-row" style={{ marginTop: 10 }}>
              <button type="button" className="btn btn-primary btn-sm" disabled={building} onClick={() => void handleGenerateBrief()}>
                {building ? "Generating…" : "Generate prep brief"}
              </button>
            </div>
          </div>
        ) : (
          <div className="brief-doc">
            {brief.snapshot && (
              <div className="bd-block">
                <div className="bd-h">Company snapshot</div>
                <div style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6 }}>
                  {brief.snapshot.overview ?? "—"}
                  {brief.snapshot.funding_stage ? ` · ${brief.snapshot.funding_stage}` : ""}
                </div>
              </div>
            )}
            <div className="bd-block" style={{ marginBottom: 0 }}>
              <div className="bd-h">Prep brief</div>
              <div style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{brief.text || "—"}</div>
            </div>
          </div>
        )}
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

      <div className="sec-label">Prep plan · {selectedUpcoming?.company} <span className="ln" /></div>
      <div className="prep-tasks card card-pad">
        {!apiLive ? (
          demoTasksByDay.map(({ day, items }) => (
            <div className="prep-day" key={day}>
              <div className="prep-day-h">Day {day} {day === 1 ? "· interview day" : day === 2 ? "· eve before" : "· before"}</div>
              {items.map((t) => (
                <label className="prep-task" key={t.id}>
                  <input type="checkbox" checked={demoChecked.has(t.id)} onChange={() => toggleDemoTask(t.id)} />
                  <span className={demoChecked.has(t.id) ? "done" : ""}>{t.label}</span>
                </label>
              ))}
            </div>
          ))
        ) : planLoading ? (
          <EmptyState>Loading prep plan…</EmptyState>
        ) : !prepTasks || prepTasks.length === 0 ? (
          <EmptyState>
            No prep plan yet for this interview — open the prep brief and generate one to get a day-by-day task list.
          </EmptyState>
        ) : (
          realTasksByDay.map(({ day, items }) => (
            <div className="prep-day" key={day}>
              <div className="prep-day-h">{day > 0 ? `Day ${day}` : "Tasks"}</div>
              {items.map((t, i) => (
                <label className="prep-task" key={t.id ?? i}>
                  <input type="checkbox" checked={t.is_done} onChange={() => void toggleTask(t)} />
                  <span className={t.is_done ? "done" : ""}>{t.title}</span>
                </label>
              ))}
            </div>
          ))
        )}
      </div>

      <div className="sec-label">Question bank <span className="ln" /></div>
      <div className="filterbar">
        {QB_CATEGORIES.map((f) => (
          <button key={f.label} type="button" className={"fchip" + (qbFilter === f.key ? " active" : "")} onClick={() => setQbFilter(f.key)}>{f.label}</button>
        ))}
      </div>
      <div className="card">
        {apiLive && planLoading ? (
          <EmptyState>Loading questions…</EmptyState>
        ) : filteredQuestions.length === 0 ? (
          <EmptyState>
            {apiLive
              ? "No questions yet for this interview — generate a prep brief to build a question bank."
              : "No questions in this category."}
          </EmptyState>
        ) : filteredQuestions.map((q, i) => (
          <div key={i} className="dp-kv" style={{ padding: "14px 18px", borderBottom: i < filteredQuestions.length - 1 ? "1px solid var(--line-soft)" : "none" }}>
            <span className="k" style={{ fontSize: 13.5, color: "var(--ink-2)" }}>{q.text}</span>
            <span className="v" style={{ color: "var(--ink-4)", fontSize: 11 }}>{q.categoryLabel}</span>
          </div>
        ))}
      </div>
      </>
      )}
    </div>
  );
}
