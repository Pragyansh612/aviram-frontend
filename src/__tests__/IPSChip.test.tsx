/**
 * IPSChip component tests.
 * Verifies correct color tier for different score ranges.
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { IPSChip, ipsTier } from "@/components/dashboard/shared";

// Minimal CSS mock (Next.js/CSS modules don't load in jsdom)
jest.mock("@/components/dashboard/icons", () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));
jest.mock("@/components/dashboard/session", () => ({
  getCalibrationCount: jest.fn(() => 5),
}));
jest.mock("@/contexts/DashboardContext", () => ({
  useDashboard: jest.fn(() => ({
    apiLive: false, loading: false, opportunities: [], timeline: [],
    applications: [], briefStats: {}, userMeta: {}, running: true,
    refresh: jest.fn(), applyToJob: jest.fn(), setRunning: jest.fn(),
  })),
}));

describe("ipsTier()", () => {
  it("returns 'high' for scores >= 75", () => {
    expect(ipsTier(75)).toBe("high");
    expect(ipsTier(91)).toBe("high");
    expect(ipsTier(100)).toBe("high");
  });

  it("returns 'mid' for scores 50-74", () => {
    expect(ipsTier(50)).toBe("mid");
    expect(ipsTier(64)).toBe("mid");
    expect(ipsTier(74)).toBe("mid");
  });

  it("returns 'low' for scores below 50", () => {
    expect(ipsTier(0)).toBe("low");
    expect(ipsTier(38)).toBe("low");
    expect(ipsTier(49)).toBe("low");
  });
});

describe("IPSChip", () => {
  it("renders the score number", () => {
    render(<IPSChip score={91} />);
    expect(screen.getByText("91")).toBeTruthy();
  });

  it("renders IPS label", () => {
    render(<IPSChip score={84} />);
    expect(screen.getByText("IPS")).toBeTruthy();
  });

  it("applies 'high' class for score >= 75", () => {
    const { container } = render(<IPSChip score={91} />);
    expect(container.querySelector(".high")).toBeTruthy();
  });

  it("applies 'mid' class for score 50-74", () => {
    const { container } = render(<IPSChip score={62} />);
    expect(container.querySelector(".mid")).toBeTruthy();
  });

  it("applies 'low' class for score below 50", () => {
    const { container } = render(<IPSChip score={38} />);
    expect(container.querySelector(".low")).toBeTruthy();
  });

  it("applies 'lg' class when size='lg'", () => {
    const { container } = render(<IPSChip score={80} size="lg" />);
    expect(container.querySelector(".lg")).toBeTruthy();
  });

  it("applies 'solid' class when solid prop is true", () => {
    const { container } = render(<IPSChip score={80} solid />);
    expect(container.querySelector(".solid")).toBeTruthy();
  });
});
