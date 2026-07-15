"use client";

import { useMemo, useState } from "react";
import TagAutocomplete from "@/components/ui/TagAutocomplete";
import { JOB_LOCATIONS, LOCATION_GROUPS, parseTags } from "@/lib/job-catalog";

// Mirrors app/data/companies.py's INDIA_CITY_ALIASES canonical keys on the
// backend (Part 2, 2026-07-15) — these exact labels are what
// normalize_location() in companies.py recognizes directly, so no mapping
// layer is needed between what a user picks here and what the scraper reads.
export const INDIA_CITIES = [
  "Bangalore",
  "Mumbai",
  "Delhi NCR",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Kolkata",
] as const;

const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Germany",
  "Singapore",
  "Other",
] as const;

const OTHER_COUNTRY_GROUP: Record<string, string[]> = Object.fromEntries(
  LOCATION_GROUPS.filter((g) => g.label !== "India" && g.label !== "Remote & flexible").map(
    (g) => [g.label, g.items],
  ),
);

function inferCountry(tags: string[]): (typeof COUNTRIES)[number] {
  const lower = tags.map((t) => t.toLowerCase());
  if (lower.some((t) => INDIA_CITIES.some((c) => c.toLowerCase() === t) || t === "india")) {
    return "India";
  }
  for (const country of COUNTRIES) {
    if (country === "India" || country === "Other") continue;
    const items = OTHER_COUNTRY_GROUP[country] ?? [];
    if (lower.some((t) => items.some((i) => i.toLowerCase() === t)) || lower.includes(country.toLowerCase())) {
      return country;
    }
  }
  return tags.length === 0 ? "India" : "Other";
}

/**
 * Structured location-preference input: a country selector (India
 * pre-selected), an India city multi-select when India is chosen, a
 * free-text city picker for other countries, and a Remote toggle that's
 * independent of city selection (Part 3, 2026-07-15).
 *
 * Reads/writes the same " · "-joined location string every other preference
 * field already uses (StoredProfile.locations, preferences.preferred_locations)
 * so it drops in wherever a plain TagAutocomplete Locations field was — no
 * schema change needed on either side.
 */
export default function LocationPreferenceSelector({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}) {
  const initialTags = useMemo(() => parseTags(value), [value]);
  const [country, setCountry] = useState<(typeof COUNTRIES)[number]>(() => inferCountry(initialTags));
  const [indiaCities, setIndiaCities] = useState<string[]>(() =>
    initialTags.filter((t) => INDIA_CITIES.some((c) => c.toLowerCase() === t.toLowerCase())),
  );
  const [otherLocation, setOtherLocation] = useState(() =>
    initialTags.filter((t) => t.toLowerCase() !== "remote").join(" · "),
  );
  const [remote, setRemote] = useState(() => initialTags.some((t) => t.toLowerCase() === "remote"));

  // Re-sync from an external value change (e.g. loaded from the backend
  // after this component already mounted with onboarding-flow defaults).
  // Adjusted during render (not in an effect) per React's "you might not
  // need an effect" guidance — avoids an extra render pass just to catch up.
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    const tags = parseTags(value);
    setCountry(inferCountry(tags));
    setIndiaCities(tags.filter((t) => INDIA_CITIES.some((c) => c.toLowerCase() === t.toLowerCase())));
    setOtherLocation(tags.filter((t) => t.toLowerCase() !== "remote").join(" · "));
    setRemote(tags.some((t) => t.toLowerCase() === "remote"));
    setLastValue(value);
  }

  const emit = (next: { country?: typeof country; indiaCities?: string[]; otherLocation?: string; remote?: boolean }) => {
    const c = next.country ?? country;
    const cities = next.indiaCities ?? indiaCities;
    const other = next.otherLocation ?? otherLocation;
    const isRemote = next.remote ?? remote;

    const parts = c === "India" ? [...cities] : parseTags(other);
    if (isRemote) parts.push("Remote");
    const joined = parts.join(" · ");
    setLastValue(joined);
    onChange(joined);
  };

  const toggleCity = (city: string) => {
    const next = indiaCities.includes(city)
      ? indiaCities.filter((c) => c !== city)
      : [...indiaCities, city];
    setIndiaCities(next);
    emit({ indiaCities: next });
  };

  return (
    <div className="loc-sel" id={id}>
      <div className="loc-sel-row">
        <label className="loc-sel-label" htmlFor={`${id ?? "loc"}-country`}>Country</label>
        <select
          id={`${id ?? "loc"}-country`}
          className="auth-input loc-sel-country"
          value={country}
          onChange={(e) => {
            const next = e.target.value as (typeof COUNTRIES)[number];
            setCountry(next);
            emit({ country: next });
          }}
        >
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {country === "India" ? (
        <div className="loc-sel-chips">
          {INDIA_CITIES.map((city) => (
            <button
              type="button"
              key={city}
              className={"loc-chip" + (indiaCities.includes(city) ? " on" : "")}
              onClick={() => toggleCity(city)}
              aria-pressed={indiaCities.includes(city)}
            >
              {city}
            </button>
          ))}
        </div>
      ) : (
        <TagAutocomplete
          value={otherLocation}
          onChange={(v) => { setOtherLocation(v); emit({ otherLocation: v }); }}
          options={country === "Other" ? JOB_LOCATIONS : (OTHER_COUNTRY_GROUP[country] ?? JOB_LOCATIONS)}
          separator=" · "
          placeholder={`Add a city in ${country}`}
          hint={`Cities in ${country}`}
        />
      )}

      <label className="loc-sel-remote">
        <div
          className={"toggle " + (remote ? "on" : "off")}
          onClick={() => { const next = !remote; setRemote(next); emit({ remote: next }); }}
          role="switch"
          aria-checked={remote}
        ><i /></div>
        <span>Also open to remote roles{country === "India" && indiaCities.length > 0 ? " (in addition to selected cities)" : ""}</span>
      </label>
    </div>
  );
}
