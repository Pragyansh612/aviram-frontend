"use client";
import { useState, useEffect, useCallback } from "react";
import { PageHead, EmptyState, IPSChip } from "@/components/dashboard/shared";
import { Icon } from "@/components/dashboard/icons";
import { useDashboard } from "@/contexts/DashboardContext";
import { showToast } from "@/components/dashboard/Toast";
import {
  apiGetExtensionQueue,
  apiApproveExtensionTask,
  apiSkipExtensionTask,
  apiGetProfile,
  apiUpdateProfile,
} from "@/lib/api";
import type { ExtensionQueueItem } from "@/lib/api";

const POLL_MS = 30_000;

const PLATFORM_LABEL: Record<string, string> = {
  wellfound: "Wellfound",
  linkedin: "LinkedIn",
  glassdoor: "Glassdoor",
};

function platformClass(platform: string): string {
  const key = platform.toLowerCase();
  if (key.includes("wellfound")) return "wellfound";
  if (key.includes("linkedin")) return "linkedin";
  if (key.includes("glassdoor")) return "glassdoor";
  return "default";
}

function PlatformBadge({ platform }: { platform: string }) {
  const label = PLATFORM_LABEL[platform.toLowerCase()] || platform || "—";
  return <span className={"platform-badge pb-" + platformClass(platform)}>{label}</span>;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export default function ExtensionQueue() {
  const { apiLive } = useDashboard();
  const [queue, setQueue] = useState<ExtensionQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoApprove, setAutoApprove] = useState<boolean | null>(null);
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());
  const [fadingIds, setFadingIds] = useState<Set<string>>(new Set());
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  const fetchQueue = useCallback(async () => {
    if (!apiLive) { setLoading(false); return; }
    try {
      const data = await apiGetExtensionQueue();
      setQueue(data.queue);
    } catch {
      // non-blocking — keep whatever we last had
    } finally {
      setLoading(false);
    }
  }, [apiLive]);

  useEffect(() => {
    fetchQueue();
    const t = setInterval(fetchQueue, POLL_MS);
    return () => clearInterval(t);
  }, [fetchQueue]);

  useEffect(() => {
    if (!apiLive) return;
    apiGetProfile()
      .then((p) => setAutoApprove(p.extension_auto_approve ?? true))
      .catch(() => setAutoApprove(true));
  }, [apiLive]);

  const removeRow = (taskId: string) => {
    setFadingIds((prev) => new Set(prev).add(taskId));
    setTimeout(() => {
      setQueue((prev) => prev.filter((q) => q.task_id !== taskId));
      setFadingIds((prev) => { const n = new Set(prev); n.delete(taskId); return n; });
    }, 320);
  };

  const handleApprove = async (taskId: string) => {
    setBusyIds((prev) => new Set(prev).add(taskId));
    try {
      await apiApproveExtensionTask(taskId);
      setApprovedIds((prev) => new Set(prev).add(taskId));
    } catch {
      showToast("Couldn't approve that job — try again.", "warn");
    } finally {
      setBusyIds((prev) => { const n = new Set(prev); n.delete(taskId); return n; });
    }
  };

  const handleSkip = async (taskId: string) => {
    setBusyIds((prev) => new Set(prev).add(taskId));
    try {
      await apiSkipExtensionTask(taskId);
      removeRow(taskId);
    } catch {
      showToast("Couldn't skip that job — try again.", "warn");
      setBusyIds((prev) => { const n = new Set(prev); n.delete(taskId); return n; });
    }
  };

  const handleApproveAll = async () => {
    const targets = queue.filter((q) => !approvedIds.has(q.task_id));
    if (targets.length === 0) return;
    setBusyIds((prev) => new Set([...prev, ...targets.map((t) => t.task_id)]));
    const results = await Promise.all(
      targets.map((t) => apiApproveExtensionTask(t.task_id).then(() => t.task_id).catch(() => null))
    );
    const succeeded = results.filter((id): id is string => id !== null);
    setApprovedIds((prev) => new Set([...prev, ...succeeded]));
    setBusyIds((prev) => { const n = new Set(prev); targets.forEach((t) => n.delete(t.task_id)); return n; });
    if (succeeded.length > 0) {
      showToast(
        `${succeeded.length} job${succeeded.length === 1 ? "" : "s"} approved — extension will submit them when Chrome is open.`,
        "success"
      );
    }
    if (succeeded.length < targets.length) {
      showToast("Some jobs couldn't be approved — try again.", "warn");
    }
  };

  const handleSkipAll = async () => {
    const targets = queue.filter((q) => !fadingIds.has(q.task_id));
    if (targets.length === 0) return;
    setBusyIds((prev) => new Set([...prev, ...targets.map((t) => t.task_id)]));
    const results = await Promise.allSettled(targets.map((t) => apiSkipExtensionTask(t.task_id)));
    results.forEach((r, i) => {
      if (r.status === "fulfilled") removeRow(targets[i].task_id);
    });
    setBusyIds((prev) => { const n = new Set(prev); targets.forEach((t) => n.delete(t.task_id)); return n; });
    const failedCount = results.filter((r) => r.status === "rejected").length;
    if (failedCount > 0) {
      showToast("Some jobs couldn't be skipped — try again.", "warn");
    }
  };

  const handleToggleAutoApprove = async () => {
    const next = !autoApprove;
    setAutoApprove(next);
    try {
      await apiUpdateProfile({ extension_auto_approve: next });
    } catch {
      setAutoApprove(!next);
      showToast("Couldn't update auto-approve — try again.", "warn");
    }
  };

  const pendingCount = queue.length;

  return (
    <div className="page">
      <PageHead
        eyebrow={<><span style={{ width: 13, height: 13, display: "inline-block" }}><Icon name="plug" /></span> Extension Queue</>}
        title="Jobs waiting for browser submission."
        sub="Applications on platforms that need your own browser session — Wellfound, LinkedIn, and Glassdoor."
        right={
          <button
            type="button"
            className={"autoapprove-toggle" + (autoApprove ? " on" : "")}
            onClick={handleToggleAutoApprove}
            disabled={autoApprove === null}
            title="When ON, jobs are approved automatically and submitted as soon as the extension is running. When OFF, you review each batch before submission."
          >
            Auto-approve: {autoApprove === null ? "…" : autoApprove ? "ON" : "OFF"}
            <span className="dot" />
          </button>
        }
      />

      {!loading && pendingCount > 0 && (
        <>
          <p className="extq-summary">
            {pendingCount} job{pendingCount === 1 ? "" : "s"} queued for browser submission.
            The extension will submit these when Chrome is open with Aviram running.
          </p>
          <div className="extq-bulk-actions">
            <button type="button" className="btn btn-primary btn-sm" onClick={handleApproveAll}>
              <Icon name="check" /> Approve All
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleSkipAll}>
              Skip All
            </button>
          </div>
        </>
      )}

      <div className="extq-table">
        {loading ? (
          <EmptyState>Loading queue…</EmptyState>
        ) : pendingCount === 0 ? (
          <EmptyState>
            No jobs pending browser submission.
            <br />
            Aviram queues jobs here when it finds opportunities on Wellfound, LinkedIn, and Glassdoor that need your browser to submit.
          </EmptyState>
        ) : (
          <>
            <div className="extq-colhead">
              <span>IPS</span><span>Job</span><span>Company</span>
              <span>Platform</span><span>Queued</span><span />
            </div>
            {queue.map((item) => {
              const isApproved = approvedIds.has(item.task_id);
              const isFading = fadingIds.has(item.task_id);
              const isBusy = busyIds.has(item.task_id);
              return (
                <div
                  key={item.task_id}
                  className={"extq-row" + (isFading ? " fading" : "") + (isApproved ? " approved" : "")}
                >
                  <span className="extq-ips"><IPSChip score={item.ips ?? 0} /></span>
                  <span className="extq-job">{item.job_title || "—"}</span>
                  <span className="extq-company">{item.company || "—"}</span>
                  <span><PlatformBadge platform={item.platform} /></span>
                  <span className="extq-queued">{timeAgo(item.queued_at)}</span>
                  <span className="extq-actions">
                    {isApproved ? (
                      <span className="extq-approved-label"><Icon name="check" /> Approved</span>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          disabled={isBusy}
                          onClick={() => handleApprove(item.task_id)}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="btn btn-quiet btn-sm"
                          disabled={isBusy}
                          onClick={() => handleSkip(item.task_id)}
                        >
                          Skip
                        </button>
                      </>
                    )}
                  </span>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
