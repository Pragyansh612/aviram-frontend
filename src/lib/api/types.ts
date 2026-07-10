import type { Opp } from "@/components/dashboard/DetailPanel";

// ── Backend response shapes (subset) ─────────────────────────────────────────

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user_id: string;
  email: string;
};

export type ProfileResponse = {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  website_url: string | null;
  bio: string | null;
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
};

export type PreferencesResponse = {
  desired_roles: string[];
  preferred_locations: string[];
  opportunity_type: string;
  remote_preference: string;
  min_salary: number | null;
  skills: string[];
  industries: string[];
};

export type UserHistory = {
  action: string | null;
  outcome: string | null;
  last_action_at: string | null;
  display: string | null;
};

export type IPSJob = {
  job_id: string;
  job_title: string;
  company: string;
  platform: string;
  ips_score: number;
  apply_url: string;
  location: string | null;
  remote_type: string | null;
  job_type?: string | null;
  posted_at: string | null;
  components: {
    semantic_score: number;
    urgency_score: number;
    referral_bonus: number;
    company_rate: number | null;
  };
  user_history?: UserHistory | null;
};

export type ApplyQueueResponse = {
  jobs: IPSJob[];
  total_candidates: number;
  returned: number;
};

export type AgentStatusResponse = {
  is_enabled: boolean;
  is_paused: boolean;
  pause_reason: string | null;
  pending_approvals: number;
  ips_threshold: number | null;
  daily_cap: number | null;
};

export type ApplicationRow = {
  id: string;
  job_id: string;
  platform: string;
  status: string;
  applied_at: string | null;
  match_score: number | null;
  resume_version: number | null;
};

export type TimelineEntry = {
  application_id: string;
  job_title: string;
  company: string;
  platform: string;
  status: string;
  outcome: string | null;
  match_score: number | null;
  applied_at: string | null;
  apply_url: string;
  event_type: string;
  event_at: string | null;
  job_id: string | null;
  detail: string | null;
};

export type AnalyticsSummary = {
  total_applications: number;
  submitted?: number;
  interviews?: number;
  offers?: number;
  overall_response_rate?: number;
  overall_offer_rate?: number;
  applications_this_week?: number;
};

export type LinkedInConnectionItem = {
  first_name: string;
  last_name?: string;
  email?: string | null;
  company?: string | null;
  position?: string | null;
  connected_on?: string | null;
};

export type NetworkImportResult = {
  imported: number;
  updated: number;
  skipped: number;
  total: number;
  message: string;
};

export type ReferralRequest = {
  id: string;
  status: string;
  company?: string;
  company_name?: string;
  job_title?: string;
  connection_name?: string;
  draft_message?: string;
};

export type OutreachCampaign = {
  id: string;
  name: string;
  status: string;
  company?: string;
};

export type InterviewSession = {
  id: string;
  company_name: string;
  job_title: string;
  prep_mode: string;
  interview_at?: string | null;
};

export type JobDetail = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  description: string | null;
  job_type: string | null;
  remote_type: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  skills_required: string[];
  apply_url: string;
  alternate_urls: string[];
  is_active: boolean;
  posted_at: string | null;
  last_seen_at: string;
  created_at: string;
  job_sources?: Array<{ platform: string; source_url: string; scraped_at: string }>;
};

export type IPSComponents = {
  semantic_score: number;
  platform_rate: number;
  company_rate: number | null;
  recency_score: number;
  urgency_score: number;
  referral_bonus: number;
  calibration_adj: number;
};

export type ComputeIPSResponse = {
  job_id: string;
  ips_score: number;
  estimated_probability: number;
  components: IPSComponents;
  platform: string;
  archetype: string;
  quality_multiplier: number;
  explanation: string;
};

export type ReferralPath = {
  id: string;
  job_id: string;
  connection_id: string | null;
  connection_name: string;
  connection_role: string | null;
  connection_company: string | null;
  path_type: string;
  path_strength: number;
  mutual_contact: string | null;
  notes: string | null;
  detected_at: string;
};

export type PathDetectionResponse = {
  job_id: string;
  company: string;
  paths: ReferralPath[];
  total: number;
  best_strength: number;
  message: string;
};

export type SkillGap = { skill: string; category: string; importance: string; suggestion: string };
export type Suggestion = { area: string; severity: string; message: string; action: string | null };

export type ResumeMatchResponse = {
  resume_id: string;
  job_id: string;
  overall_score: number;
  skills_score: number;
  title_score: number;
  description_score: number;
  preference_score: number;
  skills_matched: string[];
  skills_missing: string[];
  skill_gaps: SkillGap[];
  suggestions: Suggestion[];
};

export type ActiveResume = {
  id: string;
  filename: string;
  is_active: boolean;
  version: number;
};

export type ApplicationDetail = {
  id: string;
  job_id: string;
  platform: string;
  status: string;
  decision_type: string;
  applied_at: string | null;
  failure_reason: string | null;
  result_message: string | null;
  form_snapshot: Record<string, unknown> | null;
  resume_id: string | null;
  resume_version: number | null;
  match_score: number | null;
  quality_gate_score: number | null;
  quality_gate_status: string | null;
  quality_gate_breakdown: Record<string, unknown> | null;
  outcome: string | null;
  outcome_at: string | null;
  interview_at: string | null;
  notes: string | null;
  salary_offered: number | null;
  created_at: string;
  updated_at: string;
};

export type CompanyResearch = {
  company_name: string;
  domain: string | null;
  overview: string | null;
  products: string | null;
  tech_stack: string[];
  culture_signals: string[];
  funding_stage: string | null;
  funding_amount: string | null;
  employee_count: string | null;
  recent_news: Array<Record<string, unknown>>;
  sources: string[];
  researched_at: string | null;
};

export type PlatformCredential = {
  id: string;
  platform: string;
  email: string;
};

export type CalibrationStatus = {
  applications_count?: number;
  apps_done?: number;
  target?: number;
  archetype?: string;
  archetype_label?: string;
  model_status?: string;
  in_calibration?: boolean;
  pct?: number;
};

export function mapCalibration(cal: CalibrationStatus | null | undefined) {
  return {
    count: cal?.apps_done ?? cal?.applications_count ?? 0,
    target: cal?.target ?? 25,
    archetype: cal?.archetype ?? "mid_backend",
    archetypeLabel: cal?.archetype_label,
  };
}

// ── Mappers ─────────────────────────────────────────────────────────────────

export function ipsDisplay(score: number): number {
  return Math.round(Math.min(0.9, Math.max(0.01, score)) * 100);
}

export function ageFromPosted(posted: string | null): string {
  if (!posted) return "recent";
  const diff = Date.now() - new Date(posted).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 24) return `${Math.max(1, h)}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

export function mapIpsJobToOpp(job: IPSJob, index: number): Opp {
  const ips = ipsDisplay(job.ips_score);
  const urgent = (job.components?.urgency_score ?? 0) >= 0.75;
  const referral = (job.components?.referral_bonus ?? 0) > 0;
  const match = Math.round((job.components?.semantic_score ?? 0.7) * 100);
  const resp = job.components?.company_rate != null
    ? Math.round(job.components.company_rate * 100)
    : 15;

  return {
    id: job.job_id || `api-${index}`,
    role: job.job_title,
    company: job.company,
    stage: "—",
    ips,
    platform: job.platform || "ATS",
    age: ageFromPosted(job.posted_at),
    urgent,
    remote: job.remote_type === "remote" || job.remote_type === "hybrid",
    location: job.location || "—",
    jobType: job.job_type ?? null,
    stack: [] as string[],
    referral,
    refPath: referral ? "Referral path available" : null,
    mission: null,
    jd: ["Full job description available on the company careers page."],
    tree: {
      match,
      urgency: Math.round((job.components?.urgency_score ?? 0.5) * 100),
      referral: referral ? "Found" : "Not found",
      response: resp,
    },
    respRate: resp,
    fundedDays: urgent ? 14 : null,
    skipped: false,
    skipReason: "",
    userHistoryDisplay: job.user_history?.display ?? null,
  } as Opp;
}

export function mapApplicationStatus(status: string): string {
  switch (status) {
    case "submitted": return "applied";
    // "failed" must NOT map to "rejected" — "rejected" means recruiter rejection;
    // "failed" means our automation could not submit (very different to the user).
    case "failed": return "failed";
    case "manual_required": return "manual_required";
    case "assisted": return "manual_required";
    case "quality_review": return "quality_review";
    case "referral_pending": return "referral_pending";
    case "pending": return "pending";
    default: return status;
  }
}

export function mapApplicationLabel(status: string): string {
  switch (status) {
    case "submitted": return "Applied";
    // Clear distinction: automation failure vs. recruiter decision
    case "failed": return "Apply Failed";
    case "manual_required":
    case "assisted": return "Manual Required";
    case "quality_review": return "Quality Review";
    case "referral_pending": return "Referral Pending";
    case "pending": return "Queued";
    // Recruiter outcomes
    case "rejected": return "Rejected";
    case "interview": return "Interview";
    case "offer": return "Offer";
    case "response": return "Response";
    case "withdrawn": return "Withdrawn";
    case "applied": return "Applied";
    default: return status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  }
}

export function mapTimelineEntry(e: TimelineEntry) {
  const ips = e.match_score != null ? ipsDisplay(e.match_score) : null;
  let type = "applied";
  let title = "Application Submitted";

  switch (e.event_type) {
    case "interview_scheduled":
      type = "interview"; title = "Interview Scheduled"; break;
    case "outcome":
      if (e.outcome === "interview") { type = "interview"; title = "Interview Confirmed"; }
      else if (e.outcome === "rejected") { type = "skipped"; title = "Rejected"; }
      else if (e.outcome === "offer") { type = "response"; title = "Offer Received"; }
      else { type = "response"; title = `Outcome: ${e.outcome ?? "updated"}`; }
      break;
    case "referral_found":
      type = "referral"; title = "Referral Found"; break;
    case "resume_tailored":
      type = "resume"; title = "Resume Tailored"; break;
    case "opportunity_scored":
      type = "scored"; title = "Opportunity Scored"; break;
    case "skipped":
      type = "skipped"; title = "Skipped"; break;
    default:
      type = "applied"; title = "Application Submitted";
  }

  const at = e.event_at ?? e.applied_at;
  const time = at
    ? new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "—";

  return {
    time,
    type,
    title,
    company: e.company,
    role: e.job_title,
    extra: e.detail || `${e.platform}${ips != null ? ` · IPS ${ips}` : ""}`,
    action: type === "interview" ? "Open Brief" : type === "referral" ? "Review" : type === "resume" ? "View Changes" : type === "scored" ? null : "View",
    ips,
    appId: e.application_id,
  };
}
