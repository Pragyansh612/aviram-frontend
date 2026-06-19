"use client";
import { useState, useEffect } from "react";
import { USER, MISSIONS } from "@/components/dashboard/data";
import {
  getStoredProfile,
  saveStoredProfile,
  getStoredPrefs,
  saveStoredPrefs,
  getStoredRules,
  saveStoredRules,
  getCalibrationCount,
  getBriefVariant,
  saveBriefVariant,
} from "@/components/dashboard/session";
import {
  apiUpdateProfile,
  apiUpsertPreferences,
  apiUpdateAgentSettings,
  apiListCredentials,
  apiUpsertCredential,
  apiDeleteCredential,
  apiGetProfile,
  apiGetPreferences,
  apiGetAgentSettings,
} from "@/lib/api";
import { PageHead } from "@/components/dashboard/shared";
import { Icon } from "@/components/dashboard/icons";
import { showToast } from "@/components/dashboard/Toast";
import { useDashboard } from "@/contexts/DashboardContext";
import TagAutocomplete from "@/components/ui/TagAutocomplete";
import {
  INDUSTRIES,
  INDUSTRY_GROUPS,
  JOB_LOCATIONS,
  JOB_ROLE_GROUPS,
  JOB_ROLES,
  LOCATION_GROUPS,
  POPULAR_JOB_ROLES,
  POPULAR_LOCATIONS,
  TECH_COMPANIES,
} from "@/lib/job-catalog";

const STUB_MSG = "OAuth connection will be available when connected to backend.";

function SettingsSection({ icon, title, sub, children }: { icon: string; title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="settings-sec">
      <div className="ss-card">
        <div className="ss-head">
          <span className="si" style={{ width: 17, height: 17, display: "block" }}><Icon name={icon} /></span>
          <span className="st">{title}</span>
          <span className="sd">{sub}</span>
        </div>
        <div className="ss-body">{children}</div>
      </div>
    </div>
  );
}

function EditableRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="srow">
      <div className="sl"><div className="k">{label}</div></div>
      <input
        className="sv-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
      />
    </div>
  );
}

type TagFieldConfig = {
  options: readonly string[];
  separator: string;
  placeholder: string;
  browse?: { groups: { label: string; items: string[] }[]; popular: string[] };
  hint?: string;
};

const TAG_PREF_FIELDS: Partial<Record<string, TagFieldConfig>> = {
  Roles: {
    options: JOB_ROLES,
    separator: ", ",
    placeholder: "Add target roles",
    browse: { groups: JOB_ROLE_GROUPS, popular: POPULAR_JOB_ROLES },
    hint: "Type to search roles",
  },
  Locations: {
    options: JOB_LOCATIONS,
    separator: " · ",
    placeholder: "Add locations",
    browse: { groups: LOCATION_GROUPS, popular: POPULAR_LOCATIONS },
    hint: "Remote, hybrid, or city",
  },
  Industries: {
    options: INDUSTRIES,
    separator: ", ",
    placeholder: "Add industries",
    browse: { groups: INDUSTRY_GROUPS, popular: ["Fintech", "SaaS", "DevTools", "AI / Machine Learning"] },
    hint: "Sectors you want to target",
  },
};

function PrefRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const cfg = TAG_PREF_FIELDS[label];
  if (cfg) {
    return (
      <div className="srow srow-tag">
        <div className="sl"><div className="k">{label}</div></div>
        <div className="sv-tag-wrap">
          <TagAutocomplete
            value={value}
            onChange={onChange}
            options={cfg.options}
            browse={cfg.browse}
            separator={cfg.separator}
            placeholder={cfg.placeholder}
            className="tag-ac tag-ac--settings"
            hint={cfg.hint}
          />
        </div>
      </div>
    );
  }
  return <EditableRow label={label} value={value} onChange={onChange} />;
}

const DEFAULT_CONNS: Record<string, boolean> = {
  Greenhouse: true,
  Ashby: true,
  Lever: true,
  Workday: false,
  LinkedIn: true,
  Wellfound: false,
};

export default function Settings({ running, toggleRunning }: { running: boolean; toggleRunning: () => void }) {
  const { apiLive } = useDashboard();
  const [briefVariant, setBriefVariant] = useState<"letter" | "terminal">("letter");
  const [conns, setConns] = useState(DEFAULT_CONNS);

  const [profile, setProfile] = useState(() => {
    const stored = getStoredProfile();
    return {
      Name:      stored?.name      || USER.name,
      Email:     stored?.email     || USER.email,
      Phone:     stored?.phone     || USER.phone,
      LinkedIn:  stored?.linkedin  || USER.linkedin,
      GitHub:    USER.github,
      Portfolio: USER.portfolio,
    };
  });

  const [prefs, setPrefs] = useState(() => {
    const stored = getStoredPrefs();
    const p = getStoredProfile();
    return {
      Roles: stored?.Roles ?? p?.roles ?? "Backend, Distributed Systems, Platform",
      Locations: stored?.Locations ?? p?.locations ?? "Remote · Bengaluru",
      "Remote preference": stored?.["Remote preference"] ?? "Remote-first",
      "Salary floor": stored?.["Salary floor"] ?? p?.salaryFloor ?? "₹38 LPA",
      Industries: stored?.Industries ?? "Fintech, Dev tools, Infra",
      "Opportunity type": stored?.["Opportunity type"] ?? "Full-time",
    };
  });

  const [rules, setRules] = useState(() => {
    const stored = getStoredRules();
    return {
      "IPS threshold": stored?.["IPS threshold"] ?? "70",
      "Daily application limit": stored?.["Daily application limit"] ?? "20",
      "Blocked companies": stored?.["Blocked companies"] ?? "",
      "Timing window": stored?.["Timing window"] ?? "Thu 8–11 AM",
      "Quality score minimum": stored?.["Quality score minimum"] ?? "High",
      "Auto-send referrals": stored?.["Auto-send referrals"] === "true",
    };
  });

  useEffect(() => {
    setBriefVariant(getBriefVariant());
    apiListCredentials()
      .then((creds) => {
        if (!creds?.length) return;
        setConns((prev) => {
          const next = { ...prev };
          for (const c of creds) {
            const key = Object.keys(next).find((k) => k.toLowerCase() === c.platform);
            if (key) next[key] = true;
          }
          return next;
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!apiLive) return;
    Promise.all([
      apiGetProfile().catch(() => null),
      apiGetPreferences().catch(() => null),
      apiGetAgentSettings().catch(() => null),
    ]).then(([prof, prefsApi, agent]) => {
      if (prof) {
        setProfile({
          Name: prof.full_name ?? USER.name,
          Email: prof.email,
          Phone: prof.phone ?? USER.phone,
          LinkedIn: prof.linkedin_url?.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "") ?? USER.linkedin,
          GitHub: prof.github_url?.replace(/^https?:\/\//, "") ?? USER.github,
          Portfolio: prof.website_url?.replace(/^https?:\/\//, "") ?? USER.portfolio,
        });
      }
      if (prefsApi) {
        setPrefs((p) => ({
          ...p,
          Roles: prefsApi.desired_roles?.join(", ") ?? p.Roles,
          Locations: prefsApi.preferred_locations?.join(" · ") ?? p.Locations,
          "Remote preference": prefsApi.remote_preference ?? p["Remote preference"],
          Industries: prefsApi.industries?.join(", ") ?? p.Industries,
          "Opportunity type": prefsApi.opportunity_type ?? p["Opportunity type"],
        }));
      }
      if (agent) {
        const threshold = agent.ips_threshold as number | undefined;
        setRules((r) => ({
          ...r,
          "IPS threshold": threshold != null
            ? String(threshold > 1 ? Math.round(threshold) : Math.round(threshold * 100))
            : r["IPS threshold"],
          "Daily application limit": String(agent.daily_cap ?? r["Daily application limit"]),
          "Quality score minimum": (agent.quality_min as number) >= 80 ? "High" : "Medium",
        }));
      }
    });
  }, [apiLive]);

  const calibration = getCalibrationCount() ?? USER.calibration;
  const calibrationMax = USER.calibrationMax;

  const handleSave = async (section: string) => {
    if (section === "Profile") {
      const stored = getStoredProfile();
      saveStoredProfile({
        name: profile.Name,
        email: profile.Email,
        phone: profile.Phone,
        linkedin: profile.LinkedIn,
        roles: stored?.roles ?? prefs.Roles,
        locations: stored?.locations ?? prefs.Locations,
        salaryFloor: stored?.salaryFloor ?? prefs["Salary floor"],
      });
      try {
        await apiUpdateProfile({
          full_name: profile.Name,
          phone: profile.Phone,
          linkedin_url: profile.LinkedIn.startsWith("http") ? profile.LinkedIn : `https://linkedin.com/in/${profile.LinkedIn}`,
          github_url: profile.GitHub.startsWith("http") ? profile.GitHub : profile.GitHub ? `https://${profile.GitHub}` : null,
          website_url: profile.Portfolio.startsWith("http") ? profile.Portfolio : profile.Portfolio ? `https://${profile.Portfolio}` : null,
        });
      } catch { /* local save still works */ }
    }
    if (section === "Preferences") {
      saveStoredPrefs(prefs);
      try {
        await apiUpsertPreferences({
          desired_roles: prefs.Roles.split(",").map((s) => s.trim()).filter(Boolean),
          preferred_locations: prefs.Locations.split(/[,·]/).map((s) => s.trim()).filter(Boolean),
          industries: prefs.Industries.split(",").map((s) => s.trim()).filter(Boolean),
          remote_preference: prefs["Remote preference"].toLowerCase().includes("remote") ? "remote" : "any",
        });
      } catch { /* local */ }
    }
    if (section === "Auto-apply rules") {
      saveStoredRules({
        "IPS threshold": rules["IPS threshold"],
        "Daily application limit": rules["Daily application limit"],
        "Blocked companies": rules["Blocked companies"],
        "Timing window": rules["Timing window"],
        "Quality score minimum": rules["Quality score minimum"],
        "Auto-send referrals": rules["Auto-send referrals"] ? "true" : "false",
      });
      try {
        await apiUpdateAgentSettings({
          ips_threshold: parseFloat(rules["IPS threshold"]),
          daily_cap: parseInt(rules["Daily application limit"], 10),
          quality_min: rules["Quality score minimum"].toLowerCase() === "high" ? 80 : 60,
        });
      } catch { /* local */ }
    }
    showToast(`${section} saved successfully`, "success");
  };

  const handleBriefVariant = (v: "letter" | "terminal") => {
    setBriefVariant(v);
    saveBriefVariant(v);
    showToast(`Morning Brief set to ${v === "letter" ? "Letter" : "Terminal"} variant`, "success");
  };

  const handleConn = async (name: string) => {
    if (conns[name]) {
      setConns((c) => ({ ...c, [name]: false }));
      try { await apiDeleteCredential(name.toLowerCase()); } catch { /* demo */ }
      showToast(`${name} disconnected`, "info");
      return;
    }
    const email = prompt(`Email for ${name}:`);
    const password = prompt(`Password for ${name} (stored encrypted):`);
    if (!email || !password) return;
    try {
      await apiUpsertCredential(name.toLowerCase(), email, password);
      setConns((c) => ({ ...c, [name]: true }));
      showToast(`${name} connected`, "success");
    } catch {
      showToast(STUB_MSG, "warn");
    }
  };

  return (
    <div className="page">
      <PageHead
        eyebrow={<><span style={{ width: 13, height: 13, display: "inline-block" }}><Icon name="settings" /></span> Settings</>}
        title="You set the rules. Aviram stays inside them."
      />
      <div className="settings-wrap">
        <SettingsSection icon="user" title="Profile" sub={profile.Email}>
          {(Object.keys(profile) as (keyof typeof profile)[]).map((k) => (
            <EditableRow
              key={k}
              label={k}
              value={profile[k]}
              onChange={(v) => setProfile((p) => ({ ...p, [k]: v }))}
            />
          ))}
          <div className="ss-save-row">
            <button className="btn btn-primary btn-sm" onClick={() => handleSave("Profile")}>Save changes</button>
          </div>
        </SettingsSection>

        <SettingsSection icon="target" title="Job Preferences" sub="roles · locations · missions">
          {(Object.keys(prefs) as (keyof typeof prefs)[]).map((k) => (
            <PrefRow
              key={k}
              label={k}
              value={prefs[k]}
              onChange={(v) => setPrefs((p) => ({ ...p, [k]: v }))}
            />
          ))}
          <div className="dp-sec" style={{ marginTop: 20, marginBottom: 10 }}>Active missions</div>
          {MISSIONS.map((m) => (
            <div className="srow mission-srow" key={m.id}>
              <div className="sl">
                <div className="k">{m.title}</div>
                <div className="d">{m.done} / {m.target} target applications · predicted {m.predicted.toFixed(1)} interviews</div>
              </div>
              <div className="mission-bar-wrap">
                <div className="bar"><i style={{ width: (m.done / m.target * 100) + "%" }} /></div>
              </div>
            </div>
          ))}
          <div className="ss-save-row">
            <button className="btn btn-primary btn-sm" onClick={() => handleSave("Preferences")}>Save changes</button>
          </div>
        </SettingsSection>

        <SettingsSection icon="sliders" title="Auto-Apply Rules" sub="applied every run">
          {(["IPS threshold", "Daily application limit", "Timing window", "Quality score minimum"] as const).map((k) => (
            <EditableRow
              key={k}
              label={k}
              value={rules[k]}
              onChange={(v) => setRules((r) => ({ ...r, [k]: v }))}
            />
          ))}
          <div className="srow srow-tag">
            <div className="sl">
              <div className="k">Blocked companies</div>
              <div className="d">Never apply to these employers</div>
            </div>
            <div className="sv-tag-wrap">
              <TagAutocomplete
                value={rules["Blocked companies"]}
                onChange={(v) => setRules((r) => ({ ...r, "Blocked companies": v }))}
                options={TECH_COMPANIES}
                separator=", "
                placeholder="Add company"
                className="tag-ac tag-ac--settings"
              />
            </div>
          </div>
          <div className="srow">
            <div className="sl"><div className="k">Auto-send referrals</div><div className="d">Draft only — you press send. Always.</div></div>
            <div
              className={"toggle " + (rules["Auto-send referrals"] ? "on" : "off")}
              onClick={() => setRules((r) => ({ ...r, "Auto-send referrals": !r["Auto-send referrals"] }))}
              role="switch"
              aria-checked={rules["Auto-send referrals"]}
            ><i /></div>
          </div>
          <div className="ss-save-row">
            <button className="btn btn-primary btn-sm" onClick={() => handleSave("Auto-apply rules")}>Save changes</button>
          </div>
        </SettingsSection>

        <SettingsSection icon="plug" title="Platform Credentials" sub="connected ATS">
          <div className="conn-grid">
            {Object.entries(conns).map(([n, on]) => (
              <div className={"conn-card " + (on ? "on" : "off")} key={n}>
                <span className="cdot" />
                <div className="conn-info">
                  <div className="cn">{n}</div>
                  <div className={"cs " + (on ? "on" : "")}>{on ? "Connected" : "Not connected"}</div>
                </div>
                <button
                  type="button"
                  className={"btn btn-sm " + (on ? "btn-ghost" : "btn-quiet")}
                  onClick={() => handleConn(n)}
                >
                  {on ? "Disconnect" : "Connect"}
                </button>
              </div>
            ))}
          </div>
        </SettingsSection>

        <SettingsSection icon="brain" title="Calibration & Model" sub={calibration + "/" + calibrationMax}>
          <div className="arch-block">
            <div className="ab-name">Currently: <span>{USER.archetypeName}</span></div>
            <div className="ab-desc">Aviram is scoring you against the average mid-level backend engineer while it learns your specific patterns. At 25 signals, it switches to a model trained on <i>you</i> — your wins, your resume variants, your timing — and the IPS numbers get sharper.</div>
            <div className="calib" style={{ maxWidth: 420 }}>
              <div className="arch"><span className="tag">[{USER.archetype}]</span><span className="frac">{calibration} of {calibrationMax} signals</span></div>
              <div className="bar"><i style={{ width: (calibration / calibrationMax * 100) + "%" }} /></div>
            </div>
          </div>
          <div className="srow">
            <div className="sl"><div className="k">Morning Brief variant</div><div className="d">Letter feels editorial; Terminal feels like a system log.</div></div>
            <div className="variant-switch settings-variant">
              <button type="button" className={briefVariant === "letter" ? "on" : ""} onClick={() => handleBriefVariant("letter")}>Letter</button>
              <button type="button" className={briefVariant === "terminal" ? "on" : ""} onClick={() => handleBriefVariant("terminal")}>Terminal</button>
            </div>
          </div>
          <div className="srow">
            <div className="sl"><div className="k">Aviram status</div><div className="d">{running ? "Running — discovering, scoring, applying within your rules." : "Paused — no new applications will go out."}</div></div>
            <div className={"toggle " + (running ? "on" : "off")} onClick={toggleRunning} role="switch" aria-checked={running}><i /></div>
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}
