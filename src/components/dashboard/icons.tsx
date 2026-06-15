export const ICON_PATHS: Record<string, React.ReactNode> = {
  command:      <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
  timeline:     <><path d="M5 3v18"/><circle cx="5" cy="8" r="1.6" fill="currentColor" stroke="none"/><circle cx="5" cy="16" r="1.6" fill="currentColor" stroke="none"/><path d="M9 8h10M9 16h7"/></>,
  opportunities:<><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v6l9 4 9-4V7"/></>,
  applications: <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
  resume:       <><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/><circle cx="16.5" cy="16" r="2.6"/></>,
  intelligence: <><path d="M12 3a6 6 0 0 0-4 10.5V17h8v-3.5A6 6 0 0 0 12 3z"/><path d="M9 21h6M10 17v4M14 17v4"/></>,
  vault:        <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="12" cy="12" r="3.4"/><path d="M12 8.6v.8M12 14.6v.8M8.6 12h.8M14.6 12h.8"/></>,
  outreach:     <><path d="M4 5h16v12H7l-3 3V5z"/><path d="M8 9h8M8 13h5"/></>,
  prep:         <><path d="M4 19V6a2 2 0 0 1 2-2h11l3 3v12"/><path d="M9 4v5l2.5-1.6L14 9V4"/></>,
  settings:     <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 2.9-1.2V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></>,
  arrow:        <path d="M5 12h13M13 6l6 6-6 6"/>,
  bolt:         <path d="M13 2L3 14h7l-1 8L19 10h-7l1-8z" fill="currentColor" stroke="none"/>,
  check:        <path d="M4 12.5L9.5 18 20 6.5"/>,
  clock:        <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  calendar:     <><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></>,
  doc:          <><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v4h4M9 13h6M9 17h6"/></>,
  user:         <><circle cx="12" cy="8" r="4"/><path d="M5 20a7 7 0 0 1 14 0"/></>,
  sliders:      <><path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h7M15 18h5"/><circle cx="16" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="13" cy="18" r="2"/></>,
  shield:       <path d="M12 3l8 3v6c0 4.5-3.2 7.7-8 9-4.8-1.3-8-4.5-8-9V6l8-3z"/>,
  plug:         <><path d="M9 2v6M15 2v6M7 8h10v3a5 5 0 0 1-10 0V8zM12 16v6"/></>,
  brain:        <><path d="M12 4a4 4 0 0 0-4 4 3.5 3.5 0 0 0-1 6.8V17a3 3 0 0 0 5 2 3 3 0 0 0 5-2v-2.2A3.5 3.5 0 0 0 16 8a4 4 0 0 0-4-4z"/></>,
  skip:         <><circle cx="12" cy="12" r="9"/><path d="M6.5 6.5l11 11"/></>,
  referral:     <><circle cx="6" cy="7" r="2.6"/><circle cx="18" cy="7" r="2.6"/><circle cx="12" cy="17" r="2.6"/><path d="M7.8 8.6L11 15M16.2 8.6L13 15"/></>,
  flame:        <path d="M12 3c2 3 5 4 5 8a5 5 0 0 1-10 0c0-1.6.7-2.7 1.5-3.5C8.8 8.6 9 9.6 10 10c0-2.5 1-4.5 2-7z"/>,
  send:         <path d="M21 3L3 10.5l7 2.5 2.5 7L21 3z"/>,
  search:       <><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></>,
  target:       <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/></>,
  trending:     <><path d="M3 17l6-6 4 4 8-8"/><path d="M21 7h-5M21 7v5"/></>,
  dot:          <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>,
  chevron:      <path d="M9 6l6 6-6 6"/>,
  chevrondown:  <path d="M6 9l6 6 6-6"/>,
  x:            <path d="M6 6l12 12M18 6L6 18"/>,
};

export function Icon({ name, style, className }: { name: string; style?: React.CSSProperties; className?: string }) {
  const p = ICON_PATHS[name] || ICON_PATHS.dot;
  return (
    <svg
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
      style={{ width: "100%", height: "100%", display: "block", ...style }}
      className={className}
    >
      {p}
    </svg>
  );
}