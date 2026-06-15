export const USER = {
  name: "Pragyansh",
  first: "Pragyansh",
  email: "pragyansh@gmail.com",
  phone: "+91 98••• ••421",
  linkedin: "in/pragyansh-r",
  github: "github.com/pragyansh",
  portfolio: "pragyansh.dev",
  archetype: "mid_backend",
  archetypeName: "Mid-level Backend Engineer",
  calibration: 14,
  calibrationMax: 25,
  activeFor: "8h 42m",
  interviewRate: 6,
  projectedRate: 14,
};

export const BRIEF = {
  discovered: 47,
  shortlisted: 12,
  submitted: 4,
  referral: 1,
  interview: 1,
  needAttention: 2,
};

export const OPPS = [
  { id: "o1", role: "Backend Engineer", company: "Stripe", stage: "Series G", ips: 91, platform: "Greenhouse", age: "3h", urgent: false, remote: true, location: "Remote · US", stack: ["Python", "FastAPI", "PostgreSQL"], referral: true, refPath: "2nd-degree via Arjun Mehta", mission: "remote_backend", jd: ["Own and scale payment-critical backend services handling millions of requests/min.", "Design idempotent, fault-tolerant APIs in Python / FastAPI.", "Partner with infra on PostgreSQL performance and sharding.", "5+ years building distributed systems in production."], tree: { match: 92, urgency: 78, referral: "Found", response: 17 }, respRate: 17, fundedDays: null, skipped: false, skipReason: "" },
  { id: "o2", role: "ML Engineer", company: "Razorpay", stage: "Series F", ips: 84, platform: "Ashby", age: "6h", urgent: true, remote: false, location: "Bengaluru", stack: ["Python", "PyTorch", "Spark"], referral: false, refPath: null, mission: "series_a", jd: ["Build the fraud-detection model pipeline serving real-time scoring.", "Productionize models with low-latency inference (<40ms p99).", "Strong Python + applied ML; payments domain a plus."], tree: { match: 81, urgency: 94, referral: "Not found", response: 11 }, respRate: 11, fundedDays: 12, skipped: false, skipReason: "" },
  { id: "o3", role: "Frontend Engineer", company: "Linear", stage: "Series B", ips: 77, platform: "Lever", age: "1d", urgent: false, remote: true, location: "Remote · Global", stack: ["TypeScript", "React", "WebGL"], referral: true, refPath: "2nd-degree via Sara Kim", mission: "remote_backend", jd: ["Craft the issue-tracking experience used by thousands of teams.", "Obsessive about latency, keyboard-first interaction, and craft.", "Deep TypeScript + React; rendering performance experience."], tree: { match: 74, urgency: 66, referral: "Found", response: 14 }, respRate: 14, fundedDays: null, skipped: false, skipReason: "" },
  { id: "o4", role: "Backend Engineer", company: "Ramp", stage: "Series D", ips: 88, platform: "Ashby", age: "5h", urgent: true, remote: true, location: "Remote · US", stack: ["Go", "gRPC", "PostgreSQL"], referral: false, refPath: null, mission: "remote_backend", jd: ["Build the ledger and reconciliation engine behind corporate cards.", "Go services, gRPC, event-sourced architecture.", "Care deeply about correctness and money-safe systems."], tree: { match: 85, urgency: 90, referral: "Not found", response: 19 }, respRate: 19, fundedDays: 21, skipped: false, skipReason: "" },
  { id: "o5", role: "Platform Engineer", company: "Vercel", stage: "Series E", ips: 82, platform: "Greenhouse", age: "9h", urgent: false, remote: true, location: "Remote · Global", stack: ["Rust", "Kubernetes", "AWS"], referral: false, refPath: null, mission: "remote_backend", jd: ["Own the build & deploy pipeline serving the frontend cloud.", "Systems-level work in Rust and Go on multi-tenant infra.", "Kubernetes, edge networking, observability at scale."], tree: { match: 79, urgency: 70, referral: "Not found", response: 13 }, respRate: 13, fundedDays: null, skipped: false, skipReason: "" },
  { id: "o6", role: "Senior Backend Engineer", company: "Notion", stage: "Series C", ips: 79, platform: "Greenhouse", age: "11h", urgent: false, remote: true, location: "Remote · US", stack: ["TypeScript", "Node", "PostgreSQL"], referral: true, refPath: "2nd-degree via Arjun Mehta", mission: "remote_backend", jd: ["Scale the collaborative document backend and sync engine.", "Node + TypeScript; strong data-modeling instincts.", "Experience with realtime / CRDT systems a plus."], tree: { match: 80, urgency: 64, referral: "Found", response: 12 }, respRate: 12, fundedDays: null, skipped: false, skipReason: "" },
  { id: "o7", role: "Backend Engineer", company: "Mercury", stage: "Series B", ips: 86, platform: "Lever", age: "8h", urgent: true, remote: true, location: "Remote · US", stack: ["Haskell", "PostgreSQL", "AWS"], referral: false, refPath: null, mission: "series_a", jd: ["Build banking infrastructure for startups.", "Functional backend in Haskell — strong typing culture.", "Care about correctness, money movement, compliance."], tree: { match: 76, urgency: 88, referral: "Not found", response: 22 }, respRate: 22, fundedDays: 9, skipped: false, skipReason: "" },
  { id: "o8", role: "Infrastructure Engineer", company: "Render", stage: "Series A", ips: 81, platform: "Ashby", age: "14h", urgent: true, remote: true, location: "Remote · Global", stack: ["Go", "Kubernetes", "Terraform"], referral: false, refPath: null, mission: "series_a", jd: ["Build the managed-cloud control plane.", "Go + Kubernetes; multi-region orchestration.", "Early team, high ownership."], tree: { match: 83, urgency: 80, referral: "Not found", response: 24 }, respRate: 24, fundedDays: 6, skipped: false, skipReason: "" },
  { id: "o9", role: "Backend Engineer", company: "Supabase", stage: "Series B", ips: 80, platform: "Greenhouse", age: "16h", urgent: false, remote: true, location: "Remote · Global", stack: ["Elixir", "PostgreSQL", "Go"], referral: true, refPath: "2nd-degree via Sara Kim", mission: "series_a", jd: ["Build the open-source Firebase alternative's backend.", "PostgreSQL-deep; Elixir or Go.", "Open-source DNA, community-facing."], tree: { match: 82, urgency: 68, referral: "Found", response: 20 }, respRate: 20, fundedDays: null, skipped: false, skipReason: "" },
  { id: "o10", role: "Staff Backend Engineer", company: "Figma", stage: "Series E", ips: 73, platform: "Greenhouse", age: "1d", urgent: false, remote: false, location: "San Francisco", stack: ["C++", "Rust", "WebAssembly"], referral: false, refPath: null, mission: null, jd: ["Own the multiplayer rendering and sync backend.", "C++/Rust systems programming at scale.", "8+ years; staff-level scope."], tree: { match: 68, urgency: 60, referral: "Not found", response: 9 }, respRate: 9, fundedDays: null, skipped: false, skipReason: "" },
  { id: "o11", role: "Backend Engineer", company: "Retool", stage: "Series C", ips: 76, platform: "Lever", age: "1d", urgent: false, remote: true, location: "Remote · US", stack: ["TypeScript", "Node", "Postgres"], referral: false, refPath: null, mission: "remote_backend", jd: ["Build the platform that lets teams ship internal tools fast.", "Full-stack leaning backend, TypeScript.", "API design and integrations."], tree: { match: 75, urgency: 62, referral: "Not found", response: 15 }, respRate: 15, fundedDays: null, skipped: false, skipReason: "" },
  { id: "o12", role: "Distributed Systems Engineer", company: "Temporal", stage: "Series B", ips: 85, platform: "Ashby", age: "20h", urgent: false, remote: true, location: "Remote · Global", stack: ["Go", "gRPC", "Cassandra"], referral: false, refPath: null, mission: "series_a", jd: ["Build the durable execution engine powering reliable workflows.", "Go + distributed systems depth.", "Consensus, replication, fault tolerance."], tree: { match: 84, urgency: 72, referral: "Not found", response: 18 }, respRate: 18, fundedDays: null, skipped: false, skipReason: "" },
  { id: "o13", role: "Backend Engineer", company: "Cron", stage: "Seed", ips: 72, platform: "Lever", age: "1d", urgent: true, remote: true, location: "Remote · US", stack: ["Swift", "Go", "PostgreSQL"], referral: false, refPath: null, mission: "series_a", jd: ["Build the calendar people actually love.", "Backend in Go; sync-heavy.", "Tiny team, broad ownership."], tree: { match: 70, urgency: 78, referral: "Not found", response: 26 }, respRate: 26, fundedDays: 4, skipped: false, skipReason: "" },
  { id: "o14", role: "Senior Backend Engineer", company: "PlanetScale", stage: "Series C", ips: 83, platform: "Greenhouse", age: "1d", urgent: false, remote: true, location: "Remote · US", stack: ["Go", "MySQL", "Vitess"], referral: true, refPath: "3rd-degree via Arjun Mehta", mission: "remote_backend", jd: ["Build the database platform on top of Vitess.", "Go + deep MySQL internals.", "Scale, sharding, query performance."], tree: { match: 86, urgency: 66, referral: "Found", response: 16 }, respRate: 16, fundedDays: null, skipped: false, skipReason: "" },
  { id: "o15", role: "Backend Engineer", company: "Resend", stage: "Series A", ips: 78, platform: "Ashby", age: "2d", urgent: false, remote: true, location: "Remote · Global", stack: ["TypeScript", "Node", "Postgres"], referral: false, refPath: null, mission: "series_a", jd: ["Build the email API for developers.", "Node/TypeScript backend, deliverability systems.", "Developer-experience obsessed."], tree: { match: 77, urgency: 64, referral: "Not found", response: 21 }, respRate: 21, fundedDays: null, skipped: false, skipReason: "" },
  { id: "o16", role: "Backend Engineer", company: "Some Corp", stage: "Series C", ips: 38, platform: "Workday", age: "97d", urgent: false, remote: false, location: "Gurugram", stack: ["Java", "Spring"], referral: false, refPath: null, mission: null, jd: ["Maintain enterprise services.", "Java/Spring monolith.", "On-site, fixed hours."], tree: { match: 41, urgency: 12, referral: "Not found", response: 1 }, respRate: 1, fundedDays: null, skipped: true, skipReason: "Recruiter response rate <1% · Role open 97 days · 800+ applicants ahead" },
];

export const TIMELINE = [
  { day: "Today", events: [
    { time: "2:14 AM", type: "interview", title: "Interview Scheduled", company: "Razorpay", role: "SDE-2", extra: "Thu 9:00 AM · prep brief generated", action: "Open Brief", ips: null },
    { time: "2:02 AM", type: "applied", title: "Application Submitted", company: "Stripe", role: "Backend Engineer", extra: "Resume Variant B · ATS: Greenhouse", action: "View", ips: 84 },
    { time: "1:48 AM", type: "applied", title: "Application Submitted", company: "Ramp", role: "Backend Engineer", extra: "Resume Variant B · ATS: Ashby", action: "View", ips: 88 },
    { time: "1:31 AM", type: "scored", title: "Opportunity Scored", company: "Mercury", role: "Backend Engineer", extra: "Funding detected: 9 days ago · Response rate: 22%", action: null, ips: 86 },
    { time: "1:09 AM", type: "response", title: "Response Received", company: "Vercel", role: "Platform Engineer", extra: "Recruiter replied · screening call requested", action: "View", ips: 82 },
  ]},
  { day: "Yesterday", events: [
    { time: "11:47 PM", type: "referral", title: "Referral Found", company: "Linear", role: "Frontend Engineer", extra: "2nd-degree via Arjun Mehta · draft ready", action: "Review", ips: 77 },
    { time: "11:31 PM", type: "resume", title: "Resume Tailored", company: "Stripe", role: "Backend Engineer", extra: "3 bullets rewritten for payments scope", action: "View Changes", ips: null },
    { time: "11:18 PM", type: "scored", title: "Opportunity Scored", company: "Stripe", role: "Backend Engineer", extra: "Funding detected: stable · Response rate: 17%", action: null, ips: 91 },
    { time: "10:54 PM", type: "applied", title: "Application Submitted", company: "Temporal", role: "Distributed Systems Engineer", extra: "Resume Variant A · ATS: Ashby", action: "View", ips: 85 },
    { time: "11:02 PM", type: "skipped", title: "Skipped", company: "Some Corp", role: "Backend Engineer", extra: "Recruiter response rate <1% · Role open 97 days", action: null, ips: 38 },
    { time: "10:22 PM", type: "referral", title: "Referral Found", company: "Notion", role: "Senior Backend Engineer", extra: "2nd-degree via Arjun Mehta · draft ready", action: "Review", ips: 79 },
    { time: "9:48 PM", type: "skipped", title: "Skipped", company: "MegaCo", role: "Backend Engineer", extra: "Salary below floor · 1,400 applicants ahead", action: null, ips: 44 },
  ]},
  { day: "Tuesday", events: [
    { time: "11:36 PM", type: "applied", title: "Application Submitted", company: "Mercury", role: "Backend Engineer", extra: "Resume Variant B · ATS: Lever", action: "View", ips: 86 },
    { time: "10:11 PM", type: "resume", title: "Resume Tailored", company: "Ramp", role: "Backend Engineer", extra: "2 bullets rewritten · added ledger experience", action: "View Changes", ips: null },
    { time: "9:30 PM", type: "scored", title: "Opportunity Scored", company: "Render", role: "Infrastructure Engineer", extra: "Funding detected: 6 days ago · Response rate: 24%", action: null, ips: 81 },
    { time: "8:52 PM", type: "skipped", title: "Skipped", company: "Legacy Bank", role: "Java Engineer", extra: "On-site only · conflicts with remote preference", action: null, ips: 35 },
  ]},
];

export const APPS = [
  { id: "a1",  company: "Stripe",       role: "Backend Engineer",              platform: "Greenhouse", status: "interview",  statusLabel: "Interview Scheduled", date: "Today",     ips: 91, variant: "B" },
  { id: "a2",  company: "Razorpay",     role: "SDE-2",                         platform: "Ashby",      status: "interview",  statusLabel: "Interview Scheduled", date: "Today",     ips: 84, variant: "B" },
  { id: "a3",  company: "Vercel",       role: "Platform Engineer",             platform: "Greenhouse", status: "response",   statusLabel: "Response Received",   date: "Today",     ips: 82, variant: "A" },
  { id: "a4",  company: "Ramp",         role: "Backend Engineer",              platform: "Ashby",      status: "applied",    statusLabel: "Applied",             date: "Today",     ips: 88, variant: "B" },
  { id: "a5",  company: "Temporal",     role: "Distributed Systems Engineer",  platform: "Ashby",      status: "applied",    statusLabel: "Applied",             date: "Yesterday", ips: 85, variant: "A" },
  { id: "a6",  company: "Mercury",      role: "Backend Engineer",              platform: "Lever",      status: "response",   statusLabel: "Response Received",   date: "Tuesday",   ips: 86, variant: "B" },
  { id: "a7",  company: "PlanetScale",  role: "Senior Backend Engineer",       platform: "Greenhouse", status: "applied",    statusLabel: "Applied",             date: "Tuesday",   ips: 83, variant: "B" },
  { id: "a8",  company: "Supabase",     role: "Backend Engineer",              platform: "Greenhouse", status: "interview",  statusLabel: "Interview Scheduled", date: "Monday",    ips: 80, variant: "A" },
  { id: "a9",  company: "Render",       role: "Infrastructure Engineer",       platform: "Ashby",      status: "rejected",   statusLabel: "Rejected",            date: "Monday",    ips: 81, variant: "A" },
  { id: "a10", company: "Resend",       role: "Backend Engineer",              platform: "Ashby",      status: "offer",      statusLabel: "Offer",               date: "Last week", ips: 78, variant: "B" },
  { id: "a11", company: "Notion",       role: "Senior Backend Engineer",       platform: "Greenhouse", status: "applied",    statusLabel: "Applied",             date: "Last week", ips: 79, variant: "B" },
  { id: "a12", company: "Cron",         role: "Backend Engineer",              platform: "Lever",      status: "withdrawn",  statusLabel: "Withdrawn",           date: "Last week", ips: 72, variant: "A" },
  { id: "a13", company: "Retool",       role: "Backend Engineer",              platform: "Lever",      status: "rejected",   statusLabel: "Rejected",            date: "Last week", ips: 76, variant: "A" },
  { id: "a14", company: "Linear",       role: "Frontend Engineer",             platform: "Lever",      status: "response",   statusLabel: "Response Received",   date: "Last week", ips: 77, variant: "B" },
];

export const RESUME = {
  variants: [
    { id: "B", name: "Variant B", isDefault: true,  apps: 23, responses: 7, interviews: 4, responseRate: 30, note: "Quantified, systems-forward. Leads with scale numbers." },
    { id: "A", name: "Variant A", isDefault: false, apps: 19, responses: 3, interviews: 1, responseRate: 16, note: "Narrative, ownership-forward. Leads with scope of role." },
    { id: "C", name: "Variant C", isDefault: false, apps: 6,  responses: 1, interviews: 0, responseRate: 17, note: "Experimental — startup-tuned, terse." },
  ],
  experiment: { winner: "B", loser: "A", lift: 31, category: "backend roles", apps: 23, confidence: "High" },
  byCategory: [
    { cat: "Backend / Distributed", variant: "B" },
    { cat: "ML / Data",             variant: "C" },
    { cat: "Platform / Infra",      variant: "B" },
    { cat: "Frontend",              variant: "A" },
  ],
  gaps: [
    { skill: "Kubernetes", appearances: "in 31 of 47 queued roles" },
    { skill: "gRPC",       appearances: "in 18 of 47 queued roles" },
    { skill: "Terraform",  appearances: "in 14 of 47 queued roles" },
    { skill: "Kafka",      appearances: "in 12 of 47 queued roles" },
  ],
};

export const INTEL = {
  current: 6, projected: 14,
  wins: [
    { k: "Series A fintech", v: 22, hi: true },
    { k: "Seed stage",       v: 18, hi: true },
    { k: "Remote-first",     v: 17, hi: true },
    { k: "Series B SaaS",    v: 12, hi: true },
    { k: "Enterprise",       v: 4,  hi: false },
    { k: "FAANG",            v: 2,  hi: false },
  ],
  discoveries: [
    { v: "2.4×", k: "higher interview rate",      b: "Applications with a referral path" },
    { v: "3.1×", k: "higher response rate",       b: "Applications within 6h of posting" },
    { v: "31%",  k: "better for backend roles",   b: "Resume Variant B" },
    { v: "Thu",  k: "8–11 AM is your best submission window", b: "Thursdays" },
  ],
  roi: [
    { skill: "Kubernetes", lift: "+4%", desc: "predicted IPS lift for backend roles", time: "~6 weeks" },
    { skill: "AWS",        lift: "+4%", desc: "predicted IPS lift across infra roles", time: "~8 weeks" },
    { skill: "Docker",     lift: "+3%", desc: "predicted IPS lift",                   time: "~4 weeks" },
    { skill: "gRPC",       lift: "+3%", desc: "predicted IPS lift for distributed roles", time: "~3 weeks" },
  ],
};

export const VAULT = [
  { id: "v1", name: "Stripe",    tagline: "Payments infrastructure · 8,000+ staff",      logo: "S", signal: "strong", kv: [["Hiring signal","Strong","good"],["Response rate","17%",""],["Funding","Series G — stable",""],["Referral","Available — 2nd degree","amber"],["Recruiter speed","Fast — avg 2.3 days","good"],["Urgency","Medium",""],["ATS","Greenhouse — AI ranking detected",""],["Open backend roles","6",""]] },
  { id: "v2", name: "Razorpay",  tagline: "Payments · India · headcount +38%",           logo: "R", signal: "strong", kv: [["Hiring signal","Strong — headcount +38%","good"],["Response rate","11%",""],["Funding","Series F — 12 days ago ⚡","amber"],["Referral","Not found",""],["Recruiter speed","Average — avg 5.1 days",""],["Urgency","High","amber"],["ATS","Ashby",""],["Open backend roles","9",""]] },
  { id: "v3", name: "Ramp",      tagline: "Corporate cards & spend · Series D",          logo: "R", signal: "strong", kv: [["Hiring signal","Strong — backfilling lead","good"],["Response rate","19%","good"],["Funding","Series D — 21 days ago","amber"],["Referral","Not found",""],["Recruiter speed","Fast — avg 1.9 days","good"],["Urgency","High","amber"],["ATS","Ashby",""],["Open backend roles","4",""]] },
  { id: "v4", name: "Mercury",   tagline: "Banking for startups · Series B",             logo: "M", signal: "strong", kv: [["Hiring signal","Strong","good"],["Response rate","22%","good"],["Funding","Series B — 9 days ago ⚡","amber"],["Referral","Not found",""],["Recruiter speed","Fast — avg 2.1 days","good"],["Urgency","High","amber"],["ATS","Lever",""],["Open backend roles","3",""]] },
  { id: "v5", name: "Linear",    tagline: "Issue tracking · Series B",                   logo: "L", signal: "medium", kv: [["Hiring signal","Medium",""],["Response rate","14%",""],["Funding","Series B — stable",""],["Referral","Available — 2nd degree","amber"],["Recruiter speed","Average — avg 4.8 days",""],["Urgency","Medium",""],["ATS","Lever",""],["Open roles","2",""]] },
  { id: "v6", name: "Render",    tagline: "Managed cloud · Series A",                    logo: "R", signal: "strong", kv: [["Hiring signal","Strong — early team","good"],["Response rate","24%","good"],["Funding","Series A — 6 days ago ⚡","amber"],["Referral","Not found",""],["Recruiter speed","Very fast — avg 1.4 days","good"],["Urgency","High","amber"],["ATS","Ashby",""],["Open backend roles","5",""]] },
  { id: "v7", name: "Some Corp", tagline: "Enterprise services · Series C",              logo: "S", signal: "weak",   kv: [["Hiring signal","Weak",""],["Response rate","<1%",""],["Funding","Series C — 2 years ago",""],["Referral","Not found",""],["Recruiter speed","Slow — avg 21 days",""],["Urgency","Low — role open 97 days",""],["ATS","Workday — high applicant volume",""],["Applicants ahead","800+",""]] },
];

export const OUTREACH = {
  drafts: [
    { id: "d1", contact: "Arjun Mehta", initials: "AM", rel: "2nd · worked with you at Fintech Co", company: "Stripe",  role: "Backend Engineer",  body: "Hey Arjun — saw Stripe is hiring on the payments backend team. You're connected to their eng lead, Maya. Would you be open to a quick intro? Happy to send context — I think the role's a strong fit." },
    { id: "d2", contact: "Sara Kim",    initials: "SK", rel: "2nd · college, now at Supabase",       company: "Linear",  role: "Frontend Engineer", body: "Hi Sara — hope you're well! I noticed Linear has a frontend role open and saw you're connected to a couple folks on the team. Would you mind a quick intro or a pointer on who to talk to?" },
  ],
  campaigns: [
    { id: "c1", company: "Stripe",      role: "Backend Engineer",          status: "Draft ready",           sent: 0, last: "—" },
    { id: "c2", company: "Notion",      role: "Senior Backend Engineer",   status: "Awaiting reply",        sent: 1, last: "6h ago" },
    { id: "c3", company: "PlanetScale", role: "Senior Backend Engineer",   status: "Follow-up scheduled",  sent: 2, last: "1d ago" },
    { id: "c4", company: "Mercury",     role: "Backend Engineer",          status: "Replied — intro made",  sent: 2, last: "2d ago" },
  ],
};

export const PREP = {
  upcoming: [
    { id: "p1", company: "Razorpay", role: "SDE-2",              date: "Thursday · 9:00 AM",    countdown: "47 hours", progress: 60, soon: true },
    { id: "p2", company: "Stripe",   role: "Backend Engineer",   date: "Next Mon · 2:00 PM",    countdown: "5 days",   progress: 20, soon: false },
    { id: "p3", company: "Supabase", role: "Backend Engineer",   date: "Next Wed · 11:00 AM",   countdown: "7 days",   progress: 0,  soon: false },
  ],
  brief: {
    company: "Razorpay", role: "SDE-2",
    snapshot: "Payments company, Series F (12 days ago), headcount +38%. Interviewing for the fraud-detection platform team. Ashby ATS, fast-moving.",
    themes: ["Real-time systems & low-latency design", "Payments / fraud domain depth", "Scaling Python services"],
    talkingPoints: [
      "Owned a payments service through a 3× traffic ramp — maps directly to their scale story.",
      "Built an idempotent retry layer that cut duplicate charges 92% — fraud-adjacent.",
      "Mentored two engineers — signals the SDE-2 leadership scope they want.",
    ],
    questions: [
      { q: "Design a real-time fraud scoring service for 50k req/s.", star: "Systems design · latency, sharding, fallback" },
      { q: "Tell me about a time you handled a production incident.",  star: "STAR · the payments outage, 3× ramp" },
      { q: "How would you reduce p99 latency on an existing endpoint?", star: "Technical · profiling, caching, async" },
      { q: "Describe a disagreement with a senior engineer.",          star: "STAR · the schema migration debate" },
      { q: "Why Razorpay, why now?",                                   star: "Motivation · funding, growth, domain fit" },
    ],
    ask: [
      "What does the fraud-platform roadmap look like over the next two quarters?",
      "How is the team structured between ML and backend?",
      "What does success look like for an SDE-2 in the first 90 days?",
    ],
    reminders: ["Join link tested · 8:50 AM", "Resume Variant B open in tab", "Water, quiet room, notes ready"],
  },
};

export const MISSIONS = [
  { id: "remote_backend", title: "Remote Backend",       done: 12, target: 20, predicted: 3.4 },
  { id: "series_a",       title: "Series A Startups",    done: 7,  target: 10, predicted: 2.1 },
  { id: "ml_pivot",       title: "ML / Infra Crossover", done: 3,  target: 8,  predicted: 1.2 },
];