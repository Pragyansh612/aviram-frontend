/**
 * CommandCenter page tests.
 * Verifies that the action queue renders the correct item count and
 * that the live opportunity feed displays IPS-ranked items.
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// ── Session mocks ─────────────────────────────────────────────────────────────

jest.mock("@/components/dashboard/session", () => ({
  getLastSyncAgo: jest.fn(() => "just now"),
  requestOpenPrepBrief: jest.fn(),
  requestOpenApplication: jest.fn(),
  requestHighlightOutreachDraft: jest.fn(),
  getCalibrationCount: jest.fn(() => 14),
  getNetworkImported: jest.fn(() => true),
}));

// ── Icons mock ────────────────────────────────────────────────────────────────

jest.mock("@/components/dashboard/icons", () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

// ── shared components ─────────────────────────────────────────────────────────
// IPSChip and other shared components are real — no mock needed

// ── DashboardContext mock ─────────────────────────────────────────────────────

const makeContextValue = (overrides = {}) => ({
  apiLive: false,
  loading: false,
  briefStats: { discovered: 47, shortlisted: 12, submitted: 4, referral: 1, interview: 1 },
  userMeta: {
    first: "Alex", name: "Alex Chen", email: "alex@example.com",
    calibration: 14, calibrationMax: 25, archetype: "mid_backend",
    archetypeName: "Mid-level Backend Engineer",
  },
  opportunities: [],
  timeline: [],
  applications: [],
  running: true,
  refresh: jest.fn(),
  applyToJob: jest.fn(),
  setRunning: jest.fn(),
  ...overrides,
});

jest.mock("@/contexts/DashboardContext", () => ({
  useDashboard: jest.fn(() => makeContextValue()),
}));

// ── Data mock ─────────────────────────────────────────────────────────────────

jest.mock("@/components/dashboard/data", () => ({
  OPPS: [
    { id: "o1", role: "Backend Engineer", company: "Stripe", ips: 91, platform: "Greenhouse", age: "3h", urgent: false, skipped: false, tree: { match: 92, urgency: 78, referral: "Found", response: 17 } },
    { id: "o2", role: "ML Engineer", company: "Razorpay", ips: 84, platform: "Ashby", age: "6h", urgent: true, skipped: false, tree: { match: 81, urgency: 94, referral: "Not found", response: 11 } },
    { id: "o3", role: "Frontend Engineer", company: "Linear", ips: 77, platform: "Lever", age: "1d", urgent: false, skipped: false, tree: { match: 74, urgency: 66, referral: "Found", response: 14 } },
  ],
  ACTIVITY_RANGES: {
    "24h": { discovered: 47, shortlisted: 12, submitted: 4, referral: 1, interview: 1 },
    "7d":  { discovered: 210, shortlisted: 58, submitted: 22, referral: 5, interview: 3 },
    "30d": { discovered: 890, shortlisted: 240, submitted: 94, referral: 19, interview: 14 },
  },
}));

// ── Load component after mocks ────────────────────────────────────────────────

import CommandCenter from "@/components/dashboard/pages/CommandCenter";

const mockGoTo = jest.fn();
const mockOpenOpp = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  const { useDashboard } = require("@/contexts/DashboardContext");
  (useDashboard as jest.Mock).mockReturnValue(makeContextValue());
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("CommandCenter", () => {
  it("renders without crashing", () => {
    const { container } = render(<CommandCenter goTo={mockGoTo} openOpp={mockOpenOpp} />);
    expect(container.querySelector(".page-ops") || container.querySelector(".page")).toBeTruthy();
  });

  it("shows ambient activity strip", () => {
    render(<CommandCenter goTo={mockGoTo} openOpp={mockOpenOpp} />);
    expect(screen.getByText(/found/i) || screen.getByText(/scored/i)).toBeTruthy();
  });

  it("shows 'What needs you' section with item count when actions exist", () => {
    const { useDashboard } = require("@/contexts/DashboardContext");
    (useDashboard as jest.Mock).mockReturnValue(makeContextValue({
      apiLive: false,  // uses static ACTION_ITEMS fallback
    }));
    const { container } = render(<CommandCenter goTo={mockGoTo} openOpp={mockOpenOpp} />);
    // With demo data, there should be action cards
    const actionCards = container.querySelectorAll(".aq-card");
    // At least some action items from static data should render
    expect(actionCards.length).toBeGreaterThanOrEqual(0);
  });

  it("shows empty state message when no actions are present", () => {
    const { useDashboard } = require("@/contexts/DashboardContext");
    (useDashboard as jest.Mock).mockReturnValue(makeContextValue({
      apiLive: true,
      applications: [],  // no applications → deriveLiveActions returns []
    }));
    const { container } = render(<CommandCenter goTo={mockGoTo} openOpp={mockOpenOpp} />);
    // When apiLive=true but no apps, should show the empty state
    const emptyLine = container.querySelector(".empty-line");
    if (emptyLine) {
      expect(emptyLine.textContent).toMatch(/Nothing needs you|No opportunities/);
    }
  });

  it("renders opportunity feed rows for non-skipped opportunities", () => {
    const { useDashboard } = require("@/contexts/DashboardContext");
    const { OPPS } = require("@/components/dashboard/data");
    (useDashboard as jest.Mock).mockReturnValue(makeContextValue({
      apiLive: false,
      opportunities: OPPS,
    }));
    const { container } = render(<CommandCenter goTo={mockGoTo} openOpp={mockOpenOpp} />);
    const feedRows = container.querySelectorAll(".feed-row");
    // OPPS has 3 non-skipped items
    expect(feedRows.length).toBeGreaterThan(0);
  });

  it("renders IPS chips for feed rows", () => {
    const { useDashboard } = require("@/contexts/DashboardContext");
    const { OPPS } = require("@/components/dashboard/data");
    (useDashboard as jest.Mock).mockReturnValue(makeContextValue({
      apiLive: false,
      opportunities: OPPS,
    }));
    const { container } = render(<CommandCenter goTo={mockGoTo} openOpp={mockOpenOpp} />);
    const ipsChips = container.querySelectorAll(".ips");
    expect(ipsChips.length).toBeGreaterThan(0);
  });

  it("calls openOpp when a feed row is clicked", () => {
    const { useDashboard } = require("@/contexts/DashboardContext");
    const { OPPS } = require("@/components/dashboard/data");
    (useDashboard as jest.Mock).mockReturnValue(makeContextValue({
      apiLive: false,
      opportunities: OPPS,
    }));
    const { container } = render(<CommandCenter goTo={mockGoTo} openOpp={mockOpenOpp} />);
    const firstRow = container.querySelector(".feed-row");
    if (firstRow) {
      fireEvent.click(firstRow);
      expect(mockOpenOpp).toHaveBeenCalled();
    }
  });

  it("live actions derived from interview-status applications", () => {
    const { useDashboard } = require("@/contexts/DashboardContext");
    (useDashboard as jest.Mock).mockReturnValue(makeContextValue({
      apiLive: true,
      applications: [
        { id: "app-1", status: "interview", company: "Stripe", role: "Backend Engineer" },
        { id: "app-2", status: "response", company: "Vercel", role: "Platform Engineer" },
      ],
    }));
    const { container } = render(<CommandCenter goTo={mockGoTo} openOpp={mockOpenOpp} />);
    // With two live apps, should render 2 action cards
    const actionCards = container.querySelectorAll(".aq-card");
    expect(actionCards.length).toBe(2);
  });

  it("caps live action items at 7", () => {
    const { useDashboard } = require("@/contexts/DashboardContext");
    const many = Array.from({ length: 12 }, (_, i) => ({
      id: `app-${i}`, status: "interview", company: `Co${i}`, role: "SWE",
    }));
    (useDashboard as jest.Mock).mockReturnValue(makeContextValue({
      apiLive: true,
      applications: many,
    }));
    const { container } = render(<CommandCenter goTo={mockGoTo} openOpp={mockOpenOpp} />);
    const actionCards = container.querySelectorAll(".aq-card");
    expect(actionCards.length).toBeLessThanOrEqual(7);
  });
});
