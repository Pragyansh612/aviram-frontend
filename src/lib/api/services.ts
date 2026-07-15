import { apiFetch, ApiError } from "./client";
import { saveTokens, clearTokens } from "./tokens";
import type {
  ActiveResume,
  AgentStatusResponse,
  AnalyticsSummary,
  ApplicationDetail,
  ApplicationRow,
  ApplyQueueResponse,
  CalibrationStatus,
  CompanyResearch,
  ComputeIPSResponse,
  DiscoverySummary,
  JobStats,
  ScrapeRun,
  FullSessionResponse,
  InterviewQuestion,
  InterviewSession,
  JobDetail,
  PrepPlan,
  ConnectionsBySource,
  ExperimentInsight,
  ExperimentVariant,
  ExtensionQueueResponse,
  LinkedInConnectionItem,
  NetworkImportResult,
  NetworkProfile,
  PathDetectionResponse,
  PlatformCredential,
  PreferencesResponse,
  ProfileResponse,
  ReferralRequest,
  ReferralPathResponse,
  CompanyUrgencyResponse,
  OutreachMessage,
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
      connections_prompted: body.connections_prompted,
      extension_auto_approve: body.extension_auto_approve,
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

export type ApplyQueueFilters = {
  window_hours?: number;
  min_ips?: number;
  remote?: string;
  platform?: string;
  job_type?: string;
};

export async function apiGetApplyQueue(limit = 50, filters?: ApplyQueueFilters): Promise<ApplyQueueResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (filters?.window_hours != null) params.set("window_hours", String(filters.window_hours));
  if (filters?.min_ips != null) params.set("min_ips", String(filters.min_ips));
  if (filters?.remote) params.set("remote", filters.remote);
  if (filters?.platform) params.set("platform", filters.platform);
  if (filters?.job_type) params.set("job_type", filters.job_type);
  return apiFetch<ApplyQueueResponse>(`/ips/queue?${params.toString()}`);
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

export async function apiImportLinkedInConnections(
  connections: LinkedInConnectionItem[],
): Promise<NetworkImportResult> {
  return apiFetch<NetworkImportResult>("/referral/network/linkedin", {
    method: "POST",
    body: JSON.stringify({ connections }),
  });
}

export async function apiSyncGithubNetwork(
  githubUsername: string,
  githubToken?: string,
  maxConnections = 100,
): Promise<NetworkImportResult> {
  return apiFetch<NetworkImportResult>("/referral/network/github", {
    method: "POST",
    body: JSON.stringify({
      github_username: githubUsername,
      github_token: githubToken || undefined,
      max_connections: maxConnections,
    }),
  });
}

export async function apiGetNetworkProfile(): Promise<NetworkProfile> {
  return apiFetch<NetworkProfile>("/referral/profile");
}

export async function apiGetConnectionsBySource(): Promise<ConnectionsBySource> {
  return apiFetch<ConnectionsBySource>("/referral/connections?limit=1");
}

export async function apiGetExperimentInsights(): Promise<{ insights: ExperimentInsight[]; summary: string | null }> {
  return apiFetch<{ insights: ExperimentInsight[]; summary: string | null }>("/resume-experiments/insights");
}

export async function apiGetExperimentVariants(roleCategory?: string): Promise<{ items: ExperimentVariant[] }> {
  const q = roleCategory ? `?role_category=${encodeURIComponent(roleCategory)}` : "";
  return apiFetch<{ items: ExperimentVariant[] }>(`/resume-experiments/variants${q}`);
}

export async function apiListCompanyResearch(limit = 100): Promise<CompanyResearch[]> {
  return apiFetch<CompanyResearch[]>(`/companies/research?limit=${limit}`);
}

// ── Discovery (Part 3/4, 2026-07-15) ───────────────────────────────────────────

export async function apiGetJobStats(): Promise<JobStats> {
  return apiFetch<JobStats>("/jobs/stats");
}

export async function apiGetScrapeRuns(): Promise<ScrapeRun[]> {
  return apiFetch<ScrapeRun[]>("/jobs/scrape/runs");
}

export async function apiGetDiscoverySummary(): Promise<DiscoverySummary> {
  return apiFetch<DiscoverySummary>("/jobs/discovery/summary");
}

export async function apiTriggerCareerPageScrape(): Promise<{ message: string }> {
  return apiFetch("/jobs/scrape/career-pages", { method: "POST" });
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

export async function apiGetApplication(appId: string): Promise<ApplicationDetail> {
  return apiFetch<ApplicationDetail>(`/applications/${appId}`);
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

export async function apiActivateResume(resumeId: string): Promise<{ id: string; is_active: boolean }> {
  return apiFetch(`/resumes/${resumeId}/activate`, { method: "PATCH" });
}

// ── Interview ─────────────────────────────────────────────────────────────────

export async function apiListInterviewSessions(): Promise<InterviewSession[]> {
  const data = await apiFetch<InterviewSession[] | { sessions: InterviewSession[] }>("/interview/sessions");
  return Array.isArray(data) ? data : (data.sessions ?? []);
}

export async function apiGetCompanyResearch(companyName: string): Promise<CompanyResearch> {
  return apiFetch<CompanyResearch>(`/interview/research/${encodeURIComponent(companyName)}`);
}

export async function apiGetInterviewSession(sessionId: string): Promise<InterviewSession> {
  return apiFetch<InterviewSession>(`/interview/sessions/${sessionId}`);
}

export async function apiGetInterviewQuestions(sessionId: string): Promise<InterviewQuestion[]> {
  return apiFetch<InterviewQuestion[]>(`/interview/sessions/${sessionId}/questions`);
}

// Returns null when the plan hasn't been built yet (404) rather than throwing —
// "not built yet" is an expected, common state, not an error condition.
export async function apiGetInterviewPrepPlan(sessionId: string): Promise<PrepPlan | null> {
  try {
    return await apiFetch<PrepPlan>(`/interview/sessions/${sessionId}/prep-plan`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function apiMarkInterviewTaskDone(
  sessionId: string,
  taskId: string,
  isDone: boolean,
): Promise<{ id: string; is_done: boolean }> {
  return apiFetch(`/interview/sessions/${sessionId}/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify({ is_done: isDone }),
  });
}

// Full LLM build (research → questions → prep plan → brief). Takes 15-30s and
// makes real Gemini calls — only ever call this from an explicit user action,
// never automatically on page load.
export async function apiBuildInterviewSession(sessionId: string): Promise<FullSessionResponse> {
  return apiFetch<FullSessionResponse>(`/interview/sessions/${sessionId}/build`, { method: "POST" });
}

// ── Outreach & Referral ───────────────────────────────────────────────────────

export async function apiListReferralRequests(): Promise<ReferralRequest[]> {
  const data = await apiFetch<{ requests: ReferralRequest[] } | ReferralRequest[]>("/referral/requests");
  return Array.isArray(data) ? data : (data.requests ?? []);
}

// All detected referral paths across every job — used to answer "does this
// company have a referral path" without needing a job_id (e.g. Research Vault).
export async function apiListReferralPaths(limit = 500): Promise<ReferralPathResponse[]> {
  return apiFetch<ReferralPathResponse[]>(`/referral/paths?limit=${limit}`);
}

// Draft → sent → converted | declined. Aviram never sends the message itself —
// this just records that the user copied it and sent it manually.
export async function apiUpdateReferralRequestStatus(
  requestId: string,
  status: "draft" | "sent" | "converted" | "declined",
): Promise<ReferralRequest> {
  return apiFetch<ReferralRequest>(`/referral/requests/${encodeURIComponent(requestId)}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// Cached-fast-path (no `refresh`): DB-cache hit returns instantly; a cache
// miss computes inline via free signals (funding/HN/velocity) — zero LLM cost.
export async function apiGetCompanyUrgency(companyName: string): Promise<CompanyUrgencyResponse> {
  return apiFetch<CompanyUrgencyResponse>(`/urgency/${encodeURIComponent(companyName)}`);
}

export async function apiListOutreachCampaigns(): Promise<Array<Record<string, unknown>>> {
  const data = await apiFetch<Array<Record<string, unknown>> | { campaigns: Array<Record<string, unknown>> }>(
    "/outreach/campaigns",
  );
  return Array.isArray(data) ? data : (data.campaigns ?? []);
}

export async function apiGetOutreachCampaign(campaignId: string): Promise<Record<string, unknown>> {
  return apiFetch(`/outreach/campaigns/${encodeURIComponent(campaignId)}`);
}

export async function apiCreateOutreachCampaign(body: {
  company_name: string;
  target_role: string;
  job_id?: string;
  notes?: string;
}): Promise<Record<string, unknown>> {
  return apiFetch("/outreach/campaigns", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function apiListOutreachMessages(campaignId: string): Promise<OutreachMessage[]> {
  return apiFetch<OutreachMessage[]>(`/outreach/campaigns/${encodeURIComponent(campaignId)}/messages`);
}

export async function apiUpdateOutreachMessageStatus(
  campaignId: string,
  messageId: string,
  status: "draft" | "copied" | "sent" | "replied" | "bounced",
): Promise<OutreachMessage> {
  return apiFetch<OutreachMessage>(
    `/outreach/campaigns/${encodeURIComponent(campaignId)}/messages/${encodeURIComponent(messageId)}/status`,
    { method: "PATCH", body: JSON.stringify({ status }) },
  );
}

// ── Career intelligence ───────────────────────────────────────────────────────

export async function apiGetPersonalInsights(): Promise<Record<string, unknown>> {
  return apiFetch("/personal-model/insights");
}

export async function apiGetCareerRoi(limit = 8): Promise<Record<string, unknown>> {
  return apiFetch(`/career-roi/recommendations?limit=${limit}`);
}

export type PersonalModelSegment = {
  dimension_type: string;
  dimension_key: string;
  applications: number;
  positive_outcomes: number;
  response_rate: number | null;
  avg_ips: number | null;
  lift_vs_baseline: number | null;
};

export async function apiGetPersonalModelSegments(): Promise<{
  dimension_type: string | null;
  segments: PersonalModelSegment[];
  week_start: string;
}> {
  return apiFetch("/personal-model/segments");
}

// ── Extension queue ───────────────────────────────────────────────────────────

export async function apiGetExtensionQueue(): Promise<ExtensionQueueResponse> {
  return apiFetch<ExtensionQueueResponse>("/extension/tasks/queue");
}

export async function apiApproveExtensionTask(taskId: string): Promise<{ task_id: string; status: string; approved_by_user: boolean }> {
  return apiFetch(`/extension/tasks/${taskId}/approve`, { method: "POST" });
}

export async function apiSkipExtensionTask(taskId: string): Promise<{ task_id: string; status: string; approved_by_user: boolean }> {
  return apiFetch(`/extension/tasks/${taskId}/skip`, { method: "POST" });
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

export async function apiGetDashboardBrief(): Promise<{
  since: string;
  opportunities_discovered: number;
  shortlisted: number;
  applications_submitted: number;
  referrals_surfaced: number;
  interviews_scheduled: number;
}> {
  return apiFetch(`/dashboard/brief`);
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

// The "unsee" undo affordance — reverses a skip (or any other recorded
// interaction) recorded within the last few seconds, so an Undo click
// doesn't leave the backend thinking the job was skipped.
export async function apiUnseeOpportunity(job_id: string): Promise<void> {
  await apiFetch(`/opportunity-memory/${encodeURIComponent(job_id)}`, {
    method: "DELETE",
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
