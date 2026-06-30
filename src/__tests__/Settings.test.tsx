/**
 * Settings page tests.
 * Verifies that saving each settings section calls the API with the
 * correct payload shape.
 */
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";

// ── API mocks ─────────────────────────────────────────────────────────────────

const mockApiUpdateProfile = jest.fn(() => Promise.resolve({ full_name: "Test User" }));
const mockApiUpsertPreferences = jest.fn(() => Promise.resolve({}));
const mockApiUpdateAgentSettings = jest.fn(() => Promise.resolve({}));
const mockApiListCredentials = jest.fn(() => Promise.resolve([]));
const mockApiUpsertCredential = jest.fn(() => Promise.resolve({ platform: "greenhouse" }));
const mockApiDeleteCredential = jest.fn(() => Promise.resolve());
const mockApiGetProfile = jest.fn(() => Promise.resolve(null));
const mockApiGetPreferences = jest.fn(() => Promise.resolve(null));
const mockApiGetAgentSettings = jest.fn(() => Promise.resolve(null));

jest.mock("@/lib/api", () => ({
  apiUpdateProfile: (...args: unknown[]) => mockApiUpdateProfile(...args),
  apiUpsertPreferences: (...args: unknown[]) => mockApiUpsertPreferences(...args),
  apiUpdateAgentSettings: (...args: unknown[]) => mockApiUpdateAgentSettings(...args),
  apiListCredentials: (...args: unknown[]) => mockApiListCredentials(...args),
  apiUpsertCredential: (...args: unknown[]) => mockApiUpsertCredential(...args),
  apiDeleteCredential: (...args: unknown[]) => mockApiDeleteCredential(...args),
  apiGetProfile: (...args: unknown[]) => mockApiGetProfile(...args),
  apiGetPreferences: (...args: unknown[]) => mockApiGetPreferences(...args),
  apiGetAgentSettings: (...args: unknown[]) => mockApiGetAgentSettings(...args),
}));

// ── Toast mock ────────────────────────────────────────────────────────────────

const mockShowToast = jest.fn();
jest.mock("@/components/dashboard/Toast", () => ({
  showToast: (...args: unknown[]) => mockShowToast(...args),
}));

// ── Session mocks ─────────────────────────────────────────────────────────────

jest.mock("@/components/dashboard/session", () => ({
  getStoredProfile: jest.fn(() => null),
  saveStoredProfile: jest.fn(),
  getStoredPrefs: jest.fn(() => null),
  saveStoredPrefs: jest.fn(),
  getStoredRules: jest.fn(() => null),
  saveStoredRules: jest.fn(),
  getCalibrationCount: jest.fn(() => 14),
  getBriefVariant: jest.fn(() => "letter"),
  saveBriefVariant: jest.fn(),
}));

// ── Icons mock ────────────────────────────────────────────────────────────────

jest.mock("@/components/dashboard/icons", () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

// ── TagAutocomplete mock (avoids complex rendering) ───────────────────────────

jest.mock("@/components/ui/TagAutocomplete", () => ({
  __esModule: true,
  default: ({
    value,
    onChange,
    placeholder,
  }: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
  }) => (
    <input
      data-testid="tag-autocomplete"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

// ── Job catalog mock ──────────────────────────────────────────────────────────

jest.mock("@/lib/job-catalog", () => ({
  JOB_ROLES: ["Backend Engineer", "ML Engineer"],
  JOB_ROLE_GROUPS: [{ label: "Engineering", items: ["Backend Engineer"] }],
  JOB_LOCATIONS: ["Remote", "Bengaluru"],
  LOCATION_GROUPS: [{ label: "Global", items: ["Remote"] }],
  POPULAR_JOB_ROLES: ["Backend Engineer"],
  POPULAR_LOCATIONS: ["Remote"],
  INDUSTRIES: ["Fintech", "SaaS"],
  INDUSTRY_GROUPS: [{ label: "Tech", items: ["Fintech"] }],
  TECH_COMPANIES: ["Google", "Meta"],
  parseTags: (v: string) => v.split(",").map((s: string) => s.trim()).filter(Boolean),
}));

// ── DashboardContext mock ─────────────────────────────────────────────────────

jest.mock("@/contexts/DashboardContext", () => ({
  useDashboard: jest.fn(() => ({
    apiLive: false,
    loading: false,
    opportunities: [],
    timeline: [],
    applications: [],
    briefStats: {},
    userMeta: {
      first: "Alex", name: "Alex Chen", email: "alex@example.com",
      calibration: 14, calibrationMax: 25,
      archetype: "mid_backend", archetypeName: "Mid-level Backend Engineer",
    },
    running: true,
    refresh: jest.fn(),
    applyToJob: jest.fn(),
    setRunning: jest.fn(),
  })),
}));

// ── Data mock ─────────────────────────────────────────────────────────────────

jest.mock("@/components/dashboard/data", () => ({
  USER: {
    name: "Alex Chen", email: "alex@example.com", phone: "+91 98000 00000",
    linkedin: "in/alex", github: "github.com/alex", portfolio: "alex.dev",
    archetype: "mid_backend", archetypeName: "Mid-level Backend Engineer",
    calibration: 14, calibrationMax: 25,
  },
  MISSIONS: [
    { id: "m1", title: "Remote Backend", done: 12, target: 50, predicted: 3.4 },
  ],
}));

// ── Load component after mocks ────────────────────────────────────────────────

import Settings from "@/components/dashboard/pages/Settings";

const mockToggleRunning = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Settings", () => {
  it("renders the settings page without crashing", () => {
    const { container } = render(<Settings running={true} toggleRunning={mockToggleRunning} />);
    expect(container.querySelector(".page")).toBeTruthy();
  });

  it("renders all four sections (Profile, Job Preferences, Auto-Apply Rules, Credentials)", () => {
    render(<Settings running={true} toggleRunning={mockToggleRunning} />);
    expect(screen.getByText("Profile")).toBeTruthy();
    expect(screen.getByText("Job Preferences")).toBeTruthy();
    expect(screen.getByText("Auto-Apply Rules")).toBeTruthy();
    expect(screen.getByText("Platform Credentials")).toBeTruthy();
  });

  it("saves profile section with correct fields on Save changes click", async () => {
    render(<Settings running={true} toggleRunning={mockToggleRunning} />);

    // Find the Profile section's "Save changes" button (first one)
    const saveBtns = screen.getAllByText("Save changes");
    await act(async () => {
      fireEvent.click(saveBtns[0]);
    });

    expect(mockApiUpdateProfile).toHaveBeenCalledTimes(1);
    const profilePayload = mockApiUpdateProfile.mock.calls[0][0] as Record<string, unknown>;
    expect(profilePayload).toHaveProperty("full_name");
    expect(profilePayload).toHaveProperty("phone");
    expect(profilePayload).toHaveProperty("linkedin_url");
  });

  it("saves preferences section with correct payload shape", async () => {
    render(<Settings running={true} toggleRunning={mockToggleRunning} />);

    // Second Save changes button = Job Preferences
    const saveBtns = screen.getAllByText("Save changes");
    await act(async () => {
      fireEvent.click(saveBtns[1]);
    });

    expect(mockApiUpsertPreferences).toHaveBeenCalledTimes(1);
    const prefsPayload = mockApiUpsertPreferences.mock.calls[0][0] as Record<string, unknown>;
    expect(prefsPayload).toHaveProperty("desired_roles");
    expect(prefsPayload).toHaveProperty("preferred_locations");
    expect(Array.isArray(prefsPayload.desired_roles)).toBe(true);
    expect(Array.isArray(prefsPayload.preferred_locations)).toBe(true);
  });

  it("saves auto-apply rules with numeric IPS threshold", async () => {
    render(<Settings running={true} toggleRunning={mockToggleRunning} />);

    const saveBtns = screen.getAllByText("Save changes");
    // Third Save changes = Auto-Apply Rules
    await act(async () => {
      fireEvent.click(saveBtns[2]);
    });

    expect(mockApiUpdateAgentSettings).toHaveBeenCalledTimes(1);
    const rulesPayload = mockApiUpdateAgentSettings.mock.calls[0][0] as Record<string, unknown>;
    expect(typeof rulesPayload.ips_threshold).toBe("number");
    expect(typeof rulesPayload.daily_cap).toBe("number");
    expect(rulesPayload).toHaveProperty("quality_min");
    expect(rulesPayload).toHaveProperty("company_blocklist");
  });

  it("shows success toast after saving profile", async () => {
    render(<Settings running={true} toggleRunning={mockToggleRunning} />);
    const saveBtns = screen.getAllByText("Save changes");
    await act(async () => {
      fireEvent.click(saveBtns[0]);
    });
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.stringContaining("Profile"),
      "success",
    );
  });

  it("shows calibration section with archetype name", () => {
    render(<Settings running={true} toggleRunning={mockToggleRunning} />);
    expect(screen.getByText(/Calibration/i) || screen.getByText(/archetype/i)).toBeTruthy();
  });

  it("shows Aviram status toggle reflecting running prop", () => {
    const { container } = render(<Settings running={true} toggleRunning={mockToggleRunning} />);
    const toggle = container.querySelector(".toggle.on");
    expect(toggle).toBeTruthy();
  });

  it("shows paused state when running=false", () => {
    const { container } = render(<Settings running={false} toggleRunning={mockToggleRunning} />);
    const toggle = container.querySelector(".toggle.off");
    expect(toggle).toBeTruthy();
  });

  it("shows morning brief variant switch", () => {
    render(<Settings running={true} toggleRunning={mockToggleRunning} />);
    expect(screen.getByText("Letter")).toBeTruthy();
    expect(screen.getByText("Terminal")).toBeTruthy();
  });
});
