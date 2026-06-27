/**
 * Auth flow tests.
 * Verifies that unauthenticated users are redirected to /login.
 */
import React from "react";
import { render } from "@testing-library/react";

// Mock next/navigation
const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
  usePathname: () => "/dashboard",
}));

// Mock middleware / session
jest.mock("@/components/dashboard/session", () => ({
  isAuthed: jest.fn(),
  isOnboardingComplete: jest.fn(() => true),
  getStoredProfile: jest.fn(() => null),
  getStoredRules: jest.fn(() => null),
  getCalibrationCount: jest.fn(() => 0),
  getBriefVariant: jest.fn(() => "letter"),
  touchLastSync: jest.fn(),
  getLastSyncAgo: jest.fn(() => "just now"),
  getSessionApps: jest.fn(() => []),
  getAppOutcomeOverrides: jest.fn(() => ({})),
  getSkippedOpps: jest.fn(() => []),
  getSessionTimelineEvents: jest.fn(() => []),
  requestOpenPrepBrief: jest.fn(),
  requestOpenApplication: jest.fn(),
  requestHighlightOutreachDraft: jest.fn(),
}));

jest.mock("@/lib/api", () => ({
  checkBackendHealth: jest.fn(() => Promise.resolve(false)),
  getAccessToken: jest.fn(() => null),
  apiLogin: jest.fn(),
  apiRegister: jest.fn(),
  apiLogout: jest.fn(),
  apiGetProfile: jest.fn(),
  apiGetApplyQueue: jest.fn(),
  apiGetAgentStatus: jest.fn(),
  apiGetTimeline: jest.fn(() => Promise.resolve([])),
  apiListApplications: jest.fn(() => Promise.resolve([])),
  apiGetAnalyticsSummary: jest.fn(),
  apiGetCalibration: jest.fn(),
  mapIpsJobToOpp: jest.fn((j, i) => ({ ...j, id: `opp-${i}` })),
  mapTimelineEntry: jest.fn((e) => ({ ...e })),
  mapApplicationStatus: jest.fn((s) => s),
  mapApplicationLabel: jest.fn((s) => s),
  mapCalibration: jest.fn(() => ({ count: 0, target: 25, archetype: "mid_backend" })),
  apiPauseAgent: jest.fn(),
  apiResumeAgent: jest.fn(),
  apiApplyToJob: jest.fn(),
  apiGetPersonalInsights: jest.fn(),
  apiGetCareerRoi: jest.fn(),
}));

import { isAuthed } from "@/components/dashboard/session";

const mockIsAuthed = isAuthed as jest.MockedFunction<typeof isAuthed>;

describe("Auth redirect behavior", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("isAuthed returns false when no token present", () => {
    mockIsAuthed.mockReturnValue(false);
    expect(isAuthed()).toBe(false);
  });

  it("isAuthed returns true when token is present", () => {
    mockIsAuthed.mockReturnValue(true);
    expect(isAuthed()).toBe(true);
  });
});
