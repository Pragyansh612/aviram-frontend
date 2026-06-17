"use client";
import { useState } from "react";
import { USER, MISSIONS } from "@/components/dashboard/data";
import { PageHead } from "@/components/dashboard/shared";
import { Icon } from "@/components/dashboard/icons";

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

export default function Settings({ running, toggleRunning }: { running: boolean; toggleRunning: () => void }) {
  const [autoRef, setAutoRef] = useState(false);
  const profile: [string, string][] = [
    ["Name", USER.name], ["Email", USER.email], ["Phone", USER.phone],
    ["LinkedIn", USER.linkedin], ["GitHub", USER.github], ["Portfolio", USER.portfolio],
  ];
  const prefs: [string, string][] = [
    ["Roles", "Backend, Distributed Systems, Platform"], ["Locations", "Remote · Bengaluru"],
    ["Remote preference", "Remote-first"], ["Salary floor", "₹38 LPA"],
    ["Industries", "Fintech, Dev tools, Infra"], ["Opportunity type", "Full-time"],
  ];
  const rules: [string, string][] = [
    ["IPS threshold", "70"], ["Daily application limit", "20"], ["Blocked companies", "3 added"],
    ["Timing window", "Thu 8–11 AM"], ["Quality score minimum", "High"],
  ];
  const conns: [string, boolean][] = [
    ["Greenhouse", true], ["Ashby", true], ["Lever", true],
    ["Workday", false], ["LinkedIn", true], ["Wellfound", false],
  ];

  return (
    <div className="page">
      <PageHead
        eyebrow={<><span style={{ width: 13, height: 13, display: "inline-block" }}><Icon name="settings" /></span> Settings</>}
        title="You set the rules. Aviram stays inside them."
      />
      <div className="settings-wrap">
        <SettingsSection icon="user" title="Profile" sub={USER.email}>
          {profile.map(([k, v], i) => (
            <div className="srow" key={i}><div className="sl"><div className="k">{k}</div></div><div className="sv txt">{v}</div></div>
          ))}
        </SettingsSection>
        {/* Job Preferences: roles, locations, salary, industry — no Missions here.
            Missions are their own section below (P4 decision: distinct concept, distinct space). */}
        <SettingsSection icon="target" title="Job Preferences" sub="roles · locations · salary">
          {prefs.map(([k, v], i) => (
            <div className="srow" key={i}><div className="sl"><div className="k">{k}</div></div><div className="sv txt">{v}</div></div>
          ))}
        </SettingsSection>
        <SettingsSection icon="command" title="Missions" sub={`${MISSIONS.length} active`}>
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
        </SettingsSection>
        <SettingsSection icon="sliders" title="Auto-Apply Rules" sub="applied every run">
          {rules.map(([k, v], i) => (
            <div className="srow" key={i}><div className="sl"><div className="k">{k}</div></div><div className="sv">{v}</div></div>
          ))}
          <div className="srow">
            <div className="sl"><div className="k">Auto-send referrals</div><div className="d">Draft only — you press send. Always.</div></div>
            <div className={"toggle " + (autoRef ? "on" : "off")} onClick={() => setAutoRef(!autoRef)}><i /></div>
          </div>
        </SettingsSection>
        <SettingsSection icon="plug" title="Platform Credentials" sub="connected ATS">
          <div className="conn-grid">
            {conns.map(([n, on], i) => (
              <div className={"conn-card " + (on ? "on" : "off")} key={i}>
                <span className="cdot" />
                <div><div className="cn">{n}</div><div className={"cs " + (on ? "on" : "")}>{on ? "Connected" : "Not connected"}</div></div>
              </div>
            ))}
          </div>
        </SettingsSection>
        <SettingsSection icon="brain" title="Calibration & Model" sub={USER.calibration + "/" + USER.calibrationMax}>
          <div className="arch-block">
            <div className="ab-name">Currently: <span>{USER.archetypeName}</span></div>
            <div className="ab-desc">Aviram is scoring you against the average mid-level backend engineer while it learns your specific patterns. At 25 signals, it switches to a model trained on <i>you</i> — your wins, your resume variants, your timing — and the IPS numbers get sharper.</div>
            <div className="calib" style={{ maxWidth: 420 }}>
              <div className="arch"><span className="tag">[{USER.archetype}]</span><span className="frac">{USER.calibration} of {USER.calibrationMax} signals</span></div>
              <div className="bar"><i style={{ width: (USER.calibration / USER.calibrationMax * 100) + "%" }} /></div>
            </div>
          </div>
          <div className="srow">
            <div className="sl"><div className="k">Aviram status</div><div className="d">{running ? "Running — discovering, scoring, applying within your rules." : "Paused — no new applications will go out."}</div></div>
            <div className={"toggle " + (running ? "on" : "off")} onClick={toggleRunning}><i /></div>
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}
