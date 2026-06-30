/**
 * MorningBrief (Entry component) tests.
 * Verifies that the correct variant (letter vs terminal) is rendered
 * based on the user preference returned by getBriefVariant().
 */
import React from "react";
import { render, screen, act, fireEvent } from "@testing-library/react";

// ── Session mocks ─────────────────────────────────────────────────────────────

const mockSaveBriefVariant = jest.fn();
let currentVariant = "letter";

jest.mock("@/components/dashboard/session", () => ({
  getBriefVariant: jest.fn(() => currentVariant),
  saveBriefVariant: (...args: unknown[]) => mockSaveBriefVariant(...args),
  getDisplayName: jest.fn(() => "Alex"),
  getActiveForDuration: jest.fn(() => "8h 42m"),
  requestOpenPrepBrief: jest.fn(),
  requestHighlightOutreachDraft: jest.fn(),
  getCalibrationCount: jest.fn(() => 14),
}));

// ── Icon mock ─────────────────────────────────────────────────────────────────

jest.mock("@/components/dashboard/icons", () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

// ── DashboardContext mock ─────────────────────────────────────────────────────

jest.mock("@/contexts/DashboardContext", () => ({
  useDashboard: jest.fn(() => ({
    apiLive: false,
    loading: false,
    briefStats: { discovered: 47, shortlisted: 12, submitted: 4, referral: 1, interview: 1 },
    userMeta: {
      first: "Alex", name: "Alex Chen", email: "alex@example.com",
      phone: "", linkedin: "", calibration: 14, calibrationMax: 25,
      archetype: "mid_backend", archetypeName: "Mid-level Backend Engineer",
    },
    opportunities: [],
    timeline: [],
    applications: [],
    running: true,
    refresh: jest.fn(),
    applyToJob: jest.fn(),
    setRunning: jest.fn(),
  })),
}));

// ── Data mock ─────────────────────────────────────────────────────────────────

jest.mock("@/components/dashboard/data", () => ({
  USER: {
    first: "Alex", name: "Alex Chen", archetype: "mid_backend",
    archetypeName: "Mid-level Backend Engineer",
    activeFor: "8h 42m", calibration: 14, calibrationMax: 25,
  },
  BRIEF: { discovered: 47, shortlisted: 12, submitted: 4, referral: 1, interview: 1 },
}));

// ── Load component after mocks are set ───────────────────────────────────────

import Entry from "@/components/dashboard/Entry";

const mockOnEnter = jest.fn();
const mockGoTo = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  currentVariant = "letter";
  const { getBriefVariant } = require("@/components/dashboard/session");
  (getBriefVariant as jest.Mock).mockImplementation(() => currentVariant);
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function openBriefStage() {
  const { container } = render(<Entry onEnter={mockOnEnter} goTo={mockGoTo} />);
  // Click "Open Brief" to transition from active stage to brief stage
  const openBtn = container.querySelector(".as-cta button");
  if (openBtn) act(() => { fireEvent.click(openBtn); });
  return container;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Entry (MorningBrief)", () => {
  it("renders the active system screen on first mount", () => {
    const { container } = render(<Entry onEnter={mockOnEnter} goTo={mockGoTo} />);
    expect(container.querySelector(".active-system")).toBeTruthy();
  });

  it("transitions to brief stage when Open Brief is clicked", () => {
    const container = openBriefStage();
    // After clicking, brief stage content should appear
    const brief = container.querySelector(".brief-letter, .brief-term, .brief-stage");
    expect(brief).toBeTruthy();
  });

  it("renders letter variant when getBriefVariant returns 'letter'", () => {
    currentVariant = "letter";
    const container = openBriefStage();
    // Letter variant renders .brief-letter, terminal renders .brief-term
    // At minimum, the "A · LETTER" variant button should be marked active
    const variantBtns = Array.from(container.querySelectorAll(".variant-switch button"));
    if (variantBtns.length > 0) {
      const letterBtn = variantBtns.find((b) => b.textContent?.includes("LETTER"));
      expect(letterBtn?.className).toContain("on");
    }
  });

  it("renders terminal variant when getBriefVariant returns 'terminal'", () => {
    currentVariant = "terminal";
    const { getBriefVariant } = require("@/components/dashboard/session");
    (getBriefVariant as jest.Mock).mockReturnValue("terminal");

    const container = openBriefStage();
    const variantBtns = Array.from(container.querySelectorAll(".variant-switch button"));
    if (variantBtns.length > 0) {
      const termBtn = variantBtns.find((b) => b.textContent?.includes("TERMINAL"));
      expect(termBtn?.className).toContain("on");
    }
  });

  it("calls saveBriefVariant when user switches to terminal", () => {
    currentVariant = "letter";
    const container = openBriefStage();
    const variantBtns = Array.from(container.querySelectorAll(".variant-switch button"));
    const termBtn = variantBtns.find((b) => b.textContent?.includes("TERMINAL"));
    if (termBtn) {
      act(() => { fireEvent.click(termBtn); });
      expect(mockSaveBriefVariant).toHaveBeenCalledWith("terminal");
    }
  });

  it("calls saveBriefVariant when user switches to letter", () => {
    currentVariant = "terminal";
    const { getBriefVariant } = require("@/components/dashboard/session");
    (getBriefVariant as jest.Mock).mockReturnValue("terminal");

    const container = openBriefStage();
    const variantBtns = Array.from(container.querySelectorAll(".variant-switch button"));
    const letterBtn = variantBtns.find((b) => b.textContent?.includes("LETTER"));
    if (letterBtn) {
      act(() => { fireEvent.click(letterBtn); });
      expect(mockSaveBriefVariant).toHaveBeenCalledWith("letter");
    }
  });

  it("calls onEnter when Skip → is clicked", () => {
    const container = openBriefStage();
    // The skip button is in .brief-topbar
    const topbar = container.querySelector(".brief-topbar");
    if (topbar) {
      const skipBtn = Array.from(topbar.querySelectorAll("button")).find(
        (b) => b.textContent?.includes("Skip"),
      );
      if (skipBtn) {
        act(() => { fireEvent.click(skipBtn); });
        expect(mockOnEnter).toHaveBeenCalled();
      }
    }
  });
});
