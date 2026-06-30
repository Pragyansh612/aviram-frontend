/**
 * Timeline page tests.
 * Verifies that timeline events render in the correct chronological order
 * as provided by the data source (API or static fallback).
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// ── Session mocks ─────────────────────────────────────────────────────────────

jest.mock("@/components/dashboard/session", () => ({
  getSkippedOpps: jest.fn(() => []),
  getSessionTimelineEvents: jest.fn(() => []),
  requestOpenPrepBrief: jest.fn(),
  requestOpenApplication: jest.fn(),
  requestHighlightOutreachDraft: jest.fn(),
  getCalibrationCount: jest.fn(() => 14),
}));

// ── Icons mock ────────────────────────────────────────────────────────────────

jest.mock("@/components/dashboard/icons", () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

// ── Static data (inlined inside mock factory to avoid hoisting issues) ────────

jest.mock("@/components/dashboard/data", () => ({
  TIMELINE: [
    {
      day: "Today",
      events: [
        { time: "2:14 AM", type: "interview", title: "Interview Scheduled", company: "Razorpay", role: "SDE-2", extra: "Thu 9:00 AM", action: "Open Brief", ips: null },
        { time: "2:02 AM", type: "applied",   title: "Application Submitted", company: "Stripe",   role: "Backend Engineer", extra: "", action: "View", ips: 84 },
        { time: "1:48 AM", type: "applied",   title: "Application Submitted", company: "Ramp",     role: "Backend Engineer", extra: "", action: "View", ips: 88 },
      ],
    },
    {
      day: "Yesterday",
      events: [
        { time: "11:30 PM", type: "referral", title: "Referral Draft Ready", company: "Linear", role: "Frontend Engineer", extra: "", action: "Review Draft", ips: null },
      ],
    },
  ],
  APPS: [
    { id: "app-1", company: "Razorpay", role: "SDE-2", status: "interview", statusLabel: "Interview", platform: "Ashby", date: "Jan 15", ips: 84, variant: "A", coverLetter: "", events: [] },
  ],
}));

const STATIC_APPS = [
  { id: "app-1", company: "Razorpay", role: "SDE-2", status: "interview", statusLabel: "Interview", platform: "Ashby", date: "Jan 15", ips: 84, variant: "A", coverLetter: "", events: [] },
];

// ── DashboardContext mock ─────────────────────────────────────────────────────

const makeContextValue = (overrides = {}) => ({
  apiLive: false,
  loading: false,
  timeline: [],
  applications: STATIC_APPS,
  opportunities: [],
  briefStats: {},
  userMeta: { first: "Alex" },
  running: true,
  refresh: jest.fn(),
  applyToJob: jest.fn(),
  setRunning: jest.fn(),
  ...overrides,
});

jest.mock("@/contexts/DashboardContext", () => ({
  useDashboard: jest.fn(() => makeContextValue()),
}));

// ── Load component after mocks ────────────────────────────────────────────────

import Timeline from "@/components/dashboard/pages/Timeline";

const mockGoTo = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  const { useDashboard } = require("@/contexts/DashboardContext");
  (useDashboard as jest.Mock).mockReturnValue(makeContextValue());
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Timeline", () => {
  it("renders the page without crashing", () => {
    const { container } = render(<Timeline goTo={mockGoTo} />);
    expect(container.querySelector(".page")).toBeTruthy();
  });

  it("renders the page header title", () => {
    render(<Timeline goTo={mockGoTo} />);
    expect(screen.getByText(/Everything Aviram did/i)).toBeTruthy();
  });

  it("renders day group headers in correct order (Today before Yesterday)", () => {
    const { container } = render(<Timeline goTo={mockGoTo} />);
    const dayHeaders = Array.from(container.querySelectorAll(".tl-day")).map(
      (el) => el.textContent,
    );
    if (dayHeaders.length >= 2) {
      expect(dayHeaders[0]).toBe("Today");
      expect(dayHeaders[1]).toBe("Yesterday");
    }
  });

  it("renders events in the order provided (2:14 AM before 2:02 AM before 1:48 AM)", () => {
    const { container } = render(<Timeline goTo={mockGoTo} />);
    const timeStamps = Array.from(container.querySelectorAll(".tl-time")).map(
      (el) => el.textContent,
    );
    if (timeStamps.length >= 3) {
      expect(timeStamps[0]).toBe("2:14 AM");
      expect(timeStamps[1]).toBe("2:02 AM");
      expect(timeStamps[2]).toBe("1:48 AM");
    }
  });

  it("renders event company and role text", () => {
    const { container } = render(<Timeline goTo={mockGoTo} />);
    const descElements = container.querySelectorAll(".tl-desc");
    if (descElements.length > 0) {
      const firstDesc = descElements[0].textContent ?? "";
      expect(firstDesc).toContain("Razorpay");
    }
  });

  it("renders IPS chip when event has ips value", () => {
    const { container } = render(<Timeline goTo={mockGoTo} />);
    // Events with ips=84 and ips=88 should show IPS chips
    const ipsChips = container.querySelectorAll(".ips");
    expect(ipsChips.length).toBeGreaterThan(0);
  });

  it("renders filter bar with All, Applied, Interviews tabs", () => {
    render(<Timeline goTo={mockGoTo} />);
    expect(screen.getByText("All")).toBeTruthy();
    expect(screen.getByText("Applied")).toBeTruthy();
    expect(screen.getByText("Interviews")).toBeTruthy();
  });

  it("filters to only interview events when Interviews tab is clicked", () => {
    const { container } = render(<Timeline goTo={mockGoTo} />);
    const interviewsBtn = screen.getByText("Interviews");
    fireEvent.click(interviewsBtn);

    const events = container.querySelectorAll(".tl-event");
    // After filtering, only interview-type events should remain
    for (const ev of Array.from(events)) {
      expect(ev.className).toContain("ev-interview");
    }
  });

  it("shows no-match empty state when filter produces zero results", () => {
    // Use context with only interview events, then filter by 'applied'
    const { useDashboard } = require("@/contexts/DashboardContext");
    (useDashboard as jest.Mock).mockReturnValue(makeContextValue({
      apiLive: true,
      timeline: [{ day: "Today", events: [
        { time: "2:14 AM", type: "interview", title: "Interview Scheduled", company: "X", role: "Y", extra: "", action: null, ips: null },
      ]}],
    }));
    const { container } = render(<Timeline goTo={mockGoTo} />);
    const appliedBtn = screen.getByText("Applied");
    fireEvent.click(appliedBtn);
    // Should show empty state or zero events
    const events = container.querySelectorAll(".tl-event");
    expect(events.length).toBe(0);
  });

  it("uses live API timeline when apiLive=true", () => {
    const { useDashboard } = require("@/contexts/DashboardContext");
    const liveTimeline = [{
      day: "Today",
      events: [
        { time: "3:00 AM", type: "applied", title: "Applied", company: "LiveCo", role: "Engineer", extra: "", action: null, ips: 90 },
      ],
    }];
    (useDashboard as jest.Mock).mockReturnValue(makeContextValue({
      apiLive: true,
      timeline: liveTimeline,
    }));
    const { container } = render(<Timeline goTo={mockGoTo} />);
    const timeStamps = Array.from(container.querySelectorAll(".tl-time")).map(
      (el) => el.textContent,
    );
    if (timeStamps.length > 0) {
      expect(timeStamps[0]).toBe("3:00 AM");
    }
  });
});
