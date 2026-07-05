import { apiFetch } from "./client";
import { saveTokens, clearTokens } from "./tokens";
import type {
  ActiveResume,
  AgentStatusResponse,
  AnalyticsSummary,
  ApplicationRow,
  ApplyQueueResponse,
  CalibrationStatus,
  ComputeIPSResponse,
  InterviewSession,
  JobDetail,
  PathDetectionResponse,
  PlatformCredential,
  PreferencesResponse,
  ProfileResponse,
  ReferralRequest,
  ResumeMatchResponse,
  TimelineEntry,
  TokenResponse,
} from "./types";

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function apiLogin(email: string, password: string): Promise<TokenResponse> {
  const data = await apiFetch<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    skipAuth: true,
  });
  saveTokens(data);
  return data;
}

export async function apiRegister(email: string, password: string, full_name: string): Promise<void> {
  await apiFetch<{ message: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, full_name }),
    skipAuth: true,
  });
}

export async function apiLogout(): Promise<void> {
  try {
    await apiFetch<{ message: string }>("/auth/logout", { method: "POST" });
  } catch {
    // still clear local tokens
  }
  clearTokens();
}

// ── Profile ───────────────────────────────────────────────────────────────────

export async function apiGetProfile(): Promise<ProfileResponse> {
  return apiFetch<ProfileResponse>("/profile/me");
}

export async function apiUpdateProfile(body: Partial<ProfileResponse>): Promise<ProfileResponse> {
  return apiFetch<ProfileResponse>("/profile/me", {
    method: "PATCH",
    body: JSON.stringify({
      full_name: body.full_name,
      phone: body.phone,
      linkedin_url: body.linkedin_url,
      github_url: body.github_url,
      website_url: body.website_url,
      bio: body.bio,
    }),
  });
}

export async function apiGetCalibration(): Promise<CalibrationStatus> {
  return apiFetch<CalibrationStatus>("/profile/me/calibration");
}

export async function apiCompleteOnboarding(): Promise<{ onboarding_completed: boolean; onboarding_completed_at: string }> {
  return apiFetch("/profile/me/onboarding-complete", { method: "POST" });
}

// ── Preferences ───────────────────────────────────────────────────────────────

export async function apiGetPreferences(): Promise<PreferencesResponse | null> {
  try {
    return await apiFetch<PreferencesResponse>("/preferences/");
  } catch {
    return null;
  }
}

export async function apiUpsertPreferences(body: {
  desired_roles?: string[];
  preferred_locations?: string[];
  min_salary?: number;
  industries?: string[];
  remote_preference?: string;
  opportunity_type?: string;
}): Promise<PreferencesResponse> {
  return apiFetch<PreferencesResponse>("/preferences/", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

// ── Agent ─────────────────────────────────────────────────────────────────────

export async function apiGetAgentStatus(): Promise<AgentStatusResponse> {
  return apiFetch<AgentStatusResponse>("/agent/status");
}

export async function apiPauseAgent(reason = "Paused by user"): Promise<void> {
  await apiFetch("/agent/pause", {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export async function apiResumeAgent(): Promise<void> {
  await apiFetch("/agent/resume", { method: "POST" });
}

export async function apiGetAgentActivity(limit = 50): Promise<{ activity: Array<Record<string, unknown>> }> {
  return apiFetch(`/agent/activity?limit=${limit}`);
}

// ── IPS / Opportunities ───────────────────────────────────────────────────────

export async function apiGetApplyQueue(limit = 50): Promise<ApplyQueueResponse> {
  return apiFetch<ApplyQueueResponse>(`/ips/queue?limit=${limit}`);
}

export async function apiApplyToJob(job_id: string): Promise<{ success: boolean; message: string }> {
  return apiFetch("/applications/apply", {
    method: "POST",
    body: JSON.stringify({ job_id }),
  });
}

// ── Job / Opportunity detail ──────────────────────────────────────────────────

export async function apiGetJobDetail(jobId: string): Promise<JobDetail> {
  return apiFetch<JobDetail>(`/jobs/${jobId}`);
}

export async function apiComputeIPS(job_id: string, was_referred = false): Promise<ComputeIPSResponse> {
  return apiFetch<ComputeIPSResponse>("/ips/compute", {
    method: "POST",
    body: JSON.stringify({ job_id, was_referred }),
  });
}

export async function apiGetReferralPaths(jobId: string): Promise<PathDetectionResponse> {
  return apiFetch<PathDetectionResponse>(`/referral/paths/${jobId}`);
}

export async function apiGetActiveResume(): Promise<ActiveResume> {
  return apiFetch<ActiveResume>("/resumes/active");
}

export async function apiGetResumeMatch(resumeId: string, jobId: string): Promise<ResumeMatchResponse> {
  return apiFetch<ResumeMatchResponse>(`/resume-intelligence/match/${resumeId}/${jobId}`);
}

// ── Applications & Analytics ──────────────────────────────────────────────────

export async function apiListApplications(limit = 50): Promise<ApplicationRow[]> {
  return apiFetch<ApplicationRow[]>(`/applications/?limit=${limit}`);
}

export async function apiGetTimeline(limit = 50): Promise<TimelineEntry[]> {
  return apiFetch<TimelineEntry[]>(`/analytics/timeline?limit=${limit}`);
}

export async function apiGetAnalyticsSummary(): Promise<AnalyticsSummary> {
  return apiFetch<AnalyticsSummary>("/analytics/summary");
}

export async function apiUpdateApplicationOutcome(
  appId: string,
  outcome: string,
): Promise<void> {
  await apiFetch(`/analytics/applications/${appId}/outcome`, {
    method: "PATCH",
    body: JSON.stringify({ outcome }),
  });
}

// ── Credentials ───────────────────────────────────────────────────────────────

export async function apiListCredentials(): Promise<PlatformCredential[]> {
  return apiFetch<PlatformCredential[]>("/applications/credentials");
}

export async function apiUpsertCredential(
  platform: string,
  email: string,
  password: string,
): Promise<PlatformCredential> {
  return apiFetch<PlatformCredential>("/applications/credentials", {
    method: "POST",
    body: JSON.stringify({ platform, email, password }),
  });
}

export async function apiDeleteCredential(platform: string): Promise<void> {
  await apiFetch(`/applications/credentials/${encodeURIComponent(platform)}`, {
    method: "DELETE",
  });
}

// ── Resume ────────────────────────────────────────────────────────────────────

export async function apiUploadResume(file: File): Promise<{ id: string; filename: string }> {
  const form = new FormData();
  form.append("file", file);
  return apiFetch("/resumes/upload", { method: "POST", body: form });
}

export async function apiListResumes(): Promise<{ resumes: Array<Record<string, unknown>> }> {
  return apiFetch("/resumes/");
}

// ── Interview ─────────────────────────────────────────────────────────────────

export async function apiListInterviewSessions(): Promise<InterviewSession[]> {
  const data = await apiFetch<InterviewSession[] | { sessions: InterviewSession[] }>("/interview/sessions");
  return Array.isArray(data) ? data : (data.sessions ?? []);
}

// ── Outreach & Referral ───────────────────────────────────────────────────────

export async function apiListReferralRequests(): Promise<ReferralRequest[]> {
  const data = await apiFetch<{ requests: ReferralRequest[] } | ReferralRequest[]>("/referral/requests");
  return Array.isArray(data) ? data : (data.requests ?? []);
}

export async function apiListOutreachCampaigns(): Promise<Array<Record<string, unknown>>> {
  const data = await apiFetch<Array<Record<string, unknown>> | { campaigns: Array<Record<string, unknown>> }>(
    "/outreach/campaigns",
  );
  return Array.isArray(data) ? data : (data.campaigns ?? []);
}

// ── Career intelligence ───────────────────────────────────────────────────────

export async function apiGetPersonalInsights(): Promise<Record<string, unknown>> {
  return apiFetch("/personal-model/insights");
}

export async function apiGetCareerRoi(limit = 8): Promise<Record<string, unknown>> {
  return apiFetch(`/career-roi/recommendations?limit=${limit}`);
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function apiGetDashboardActions(limit = 7): Promise<{
  actions: Array<{
    id: string;
    type: string;
    kicker: string;
    title: string;
    meta: string;
    btn: string;
    to: string;
    primary: boolean;
    reference_id?: string;
  }>;
  total: number;
}> {
  return apiFetch(`/dashboard/actions?limit=${limit}`);
}

export async function apiDismissAction(actionId: string): Promise<void> {
  await apiFetch(`/dashboard/actions/${actionId}/dismiss`, { method: "POST" });
}

// ── Opportunity Memory ────────────────────────────────────────────────────────

export async function apiRecordOpportunityInteraction(
  job_id: string,
  action: "viewed" | "skipped" | "queued" | "applied" | "blocked",
  skip_reason?: string,
): Promise<void> {
  await apiFetch("/opportunity-memory/record", {
    method: "POST",
    body: JSON.stringify({ job_id, action, skip_reason }),
  });
}

// ── Agent settings (auto-apply rules) ─────────────────────────────────────────

export async function apiGetAgentSettings(): Promise<Record<string, unknown>> {
  return apiFetch("/agent/settings");
}

export async function apiUpdateAgentSettings(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  return apiFetch("/agent/settings", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}
