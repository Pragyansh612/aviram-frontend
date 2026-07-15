/**
 * API type mapping tests.
 * Verifies that mapIpsJobToOpp, mapApplicationStatus, mapTimelineEntry
 * produce correct output shapes.
 */
import { mapIpsJobToOpp, mapApplicationStatus, mapApplicationLabel, mapCalibration } from "@/lib/api/types";
import type { IPSJob, CalibrationStatus } from "@/lib/api/types";

// ── mapIpsJobToOpp ────────────────────────────────────────────────────────────

describe("mapIpsJobToOpp", () => {
  const sampleJob: IPSJob = {
    job_id: "abc123",
    job_title: "Backend Engineer",
    company: "Acme Corp",
    platform: "Greenhouse",
    ips_score: 0.91,
    apply_url: "https://boards.greenhouse.io/acme/jobs/1",
    location: "Remote · US",
    remote_type: "remote",
    posted_at: "2024-01-15T08:00:00Z",
    components: {
      semantic_score: 0.85,
      urgency_score: 0.78,
      referral_bonus: 0.2,
      company_rate: 0.17,
    },
  };

  it("maps ips_score to integer 0-100", () => {
    const opp = mapIpsJobToOpp(sampleJob, 0);
    expect(opp.ips).toBeGreaterThanOrEqual(0);
    expect(opp.ips).toBeLessThanOrEqual(100);
    expect(Number.isInteger(opp.ips)).toBe(true);
  });

  it("sets urgent=true when urgency_score >= 0.75", () => {
    const opp = mapIpsJobToOpp(sampleJob, 0);
    expect(opp.urgent).toBe(true);
  });

  it("sets urgent=false when urgency_score < 0.75", () => {
    const lowUrgency: IPSJob = { ...sampleJob, components: { ...sampleJob.components, urgency_score: 0.5 } };
    const opp = mapIpsJobToOpp(lowUrgency, 0);
    expect(opp.urgent).toBe(false);
  });

  it("sets referral=true when referral_bonus > 0", () => {
    const opp = mapIpsJobToOpp(sampleJob, 0);
    expect(opp.referral).toBe(true);
  });

  it("sets referral=false when referral_bonus is 0", () => {
    const noRef: IPSJob = { ...sampleJob, components: { ...sampleJob.components, referral_bonus: 0 } };
    const opp = mapIpsJobToOpp(noRef, 0);
    expect(opp.referral).toBe(false);
  });

  it("uses index-based fallback id when job_id is empty", () => {
    const noId: IPSJob = { ...sampleJob, job_id: "" };
    const opp = mapIpsJobToOpp(noId, 5);
    expect(opp.id).toBe("api-5");
  });

  it("computes age string from posted_at", () => {
    const opp = mapIpsJobToOpp(sampleJob, 0);
    expect(typeof opp.age).toBe("string");
    expect(opp.age.length).toBeGreaterThan(0);
  });

  it("passes through career_page_source=true (Direct badge source)", () => {
    const direct: IPSJob = { ...sampleJob, career_page_source: true };
    const opp = mapIpsJobToOpp(direct, 0);
    expect(opp.careerPageSource).toBe(true);
  });

  it("defaults careerPageSource to false when field is absent", () => {
    const opp = mapIpsJobToOpp(sampleJob, 0);
    expect(opp.careerPageSource).toBe(false);
  });
});

// ── mapApplicationStatus ──────────────────────────────────────────────────────

describe("mapApplicationStatus", () => {
  it("maps 'submitted' to 'applied'", () => {
    expect(mapApplicationStatus("submitted")).toBe("applied");
  });

  it("keeps 'failed' as 'failed' — automation failure is distinct from a recruiter rejection", () => {
    expect(mapApplicationStatus("failed")).toBe("failed");
  });

  it("keeps 'pending' as 'pending' — distinct from a submitted application", () => {
    expect(mapApplicationStatus("pending")).toBe("pending");
  });

  it("passes through unknown statuses unchanged", () => {
    expect(mapApplicationStatus("interview")).toBe("interview");
    expect(mapApplicationStatus("offer")).toBe("offer");
    expect(mapApplicationStatus("withdrawn")).toBe("withdrawn");
  });
});

describe("mapApplicationLabel", () => {
  it("returns 'Applied' for submitted", () => {
    expect(mapApplicationLabel("submitted")).toBe("Applied");
  });

  it("returns 'Apply Failed' for failed — not 'Rejected', which means a recruiter decision", () => {
    expect(mapApplicationLabel("failed")).toBe("Apply Failed");
  });

  it("returns 'Manual Required' for manual_required", () => {
    expect(mapApplicationLabel("manual_required")).toBe("Manual Required");
  });
});

// ── mapCalibration ────────────────────────────────────────────────────────────

describe("mapCalibration", () => {
  it("extracts apps_done from calibration status", () => {
    const cal: CalibrationStatus = {
      apps_done: 14,
      target: 25,
      archetype: "mid_backend",
      archetype_label: "Mid-level Backend Engineer",
    };
    const result = mapCalibration(cal);
    expect(result.count).toBe(14);
    expect(result.target).toBe(25);
    expect(result.archetype).toBe("mid_backend");
  });

  it("falls back to applications_count when apps_done is absent", () => {
    const cal: CalibrationStatus = { applications_count: 8 };
    const result = mapCalibration(cal);
    expect(result.count).toBe(8);
  });

  it("uses default target of 25 when not provided", () => {
    const result = mapCalibration(null);
    expect(result.target).toBe(25);
  });

  it("uses default archetype when not provided", () => {
    const result = mapCalibration(null);
    expect(result.archetype).toBe("mid_backend");
  });
});
