/** Curated job roles, locations, industries — offline, no API dependency. */

export type CatalogGroup = { label: string; items: string[] };

export const POPULAR_JOB_ROLES = [
  "Software Engineer",
  "Backend Engineer",
  "Frontend Engineer",
  "Full Stack Engineer",
  "Senior Software Engineer",
  "Staff Software Engineer",
  "Machine Learning Engineer",
  "Data Engineer",
  "DevOps Engineer",
  "Site Reliability Engineer (SRE)",
  "Platform Engineer",
  "Product Manager",
  "Engineering Manager",
];

export const JOB_ROLE_GROUPS: CatalogGroup[] = [
  {
    label: "Software engineering",
    items: [
      "Software Engineer",
      "Senior Software Engineer",
      "Staff Software Engineer",
      "Principal Software Engineer",
      "Distinguished Engineer",
      "Software Development Engineer (SDE)",
      "SDE-1",
      "SDE-2",
      "SDE-3",
      "Associate Software Engineer",
      "Junior Software Engineer",
      "Lead Software Engineer",
      "Technical Lead",
      "Architect",
      "Software Architect",
      "Solutions Architect",
      "Enterprise Architect",
      "Computer Scientist",
    ],
  },
  {
    label: "Frontend & mobile",
    items: [
      "Frontend Engineer",
      "Senior Frontend Engineer",
      "Staff Frontend Engineer",
      "UI Engineer",
      "Web Developer",
      "React Developer",
      "React Engineer",
      "Vue.js Developer",
      "Angular Developer",
      "Next.js Developer",
      "JavaScript Engineer",
      "TypeScript Engineer",
      "Mobile Engineer",
      "iOS Engineer",
      "Android Engineer",
      "React Native Developer",
      "Flutter Developer",
      "Mobile App Developer",
    ],
  },
  {
    label: "Backend & systems",
    items: [
      "Backend Engineer",
      "Senior Backend Engineer",
      "Staff Backend Engineer",
      "API Engineer",
      "Distributed Systems Engineer",
      "Systems Engineer",
      "Microservices Engineer",
      "Go Engineer",
      "Java Engineer",
      "Python Engineer",
      "Node.js Engineer",
      "Rust Engineer",
      "C++ Engineer",
      "C# / .NET Engineer",
      "Ruby on Rails Developer",
      "PHP Developer",
      "Scala Engineer",
      "Kotlin Engineer",
    ],
  },
  {
    label: "Full stack & generalist",
    items: [
      "Full Stack Engineer",
      "Senior Full Stack Engineer",
      "Full Stack Developer",
      "Web Engineer",
      "Application Engineer",
      "Integration Engineer",
    ],
  },
  {
    label: "Data, ML & AI",
    items: [
      "Data Engineer",
      "Senior Data Engineer",
      "Analytics Engineer",
      "Data Platform Engineer",
      "ETL Developer",
      "Big Data Engineer",
      "Machine Learning Engineer",
      "Senior ML Engineer",
      "AI Engineer",
      "Applied Scientist",
      "Research Engineer",
      "MLOps Engineer",
      "Data Scientist",
      "Senior Data Scientist",
      "AI Research Scientist",
      "NLP Engineer",
      "Computer Vision Engineer",
      "Deep Learning Engineer",
      "LLM Engineer",
      "Prompt Engineer",
      "BI Developer",
      "Data Analyst",
      "Business Intelligence Analyst",
    ],
  },
  {
    label: "DevOps, platform & security",
    items: [
      "DevOps Engineer",
      "Senior DevOps Engineer",
      "Site Reliability Engineer (SRE)",
      "Senior SRE",
      "Platform Engineer",
      "Infrastructure Engineer",
      "Cloud Engineer",
      "Cloud Architect",
      "Kubernetes Engineer",
      "Release Engineer",
      "Build Engineer",
      "Security Engineer",
      "Application Security Engineer",
      "DevSecOps Engineer",
      "Cybersecurity Analyst",
      "Penetration Tester",
      "SOC Analyst",
      "Network Engineer",
      "Systems Administrator",
      "Database Administrator (DBA)",
    ],
  },
  {
    label: "Quality & embedded",
    items: [
      "QA Engineer",
      "Senior QA Engineer",
      "SDET",
      "Test Automation Engineer",
      "Quality Assurance Analyst",
      "Embedded Engineer",
      "Firmware Engineer",
      "Hardware Engineer",
      "Robotics Engineer",
      "IoT Engineer",
    ],
  },
  {
    label: "Product, design & program",
    items: [
      "Product Manager",
      "Senior Product Manager",
      "Staff Product Manager",
      "Group Product Manager",
      "Director of Product",
      "Head of Product",
      "Chief Product Officer (CPO)",
      "Technical Product Manager",
      "Associate Product Manager",
      "Product Owner",
      "Product Designer",
      "Senior Product Designer",
      "UX Designer",
      "UI Designer",
      "UX Researcher",
      "Design Lead",
      "Head of Design",
      "Technical Program Manager",
      "Program Manager",
      "Project Manager",
      "Scrum Master",
      "Agile Coach",
      "Delivery Manager",
    ],
  },
  {
    label: "Leadership & management",
    items: [
      "Engineering Manager",
      "Senior Engineering Manager",
      "Director of Engineering",
      "VP of Engineering",
      "Head of Engineering",
      "Chief Technology Officer (CTO)",
      "Chief Information Officer (CIO)",
      "Chief Data Officer (CDO)",
      "Chief AI Officer",
      "Founding Engineer",
      "Tech Lead",
    ],
  },
  {
    label: "Specialized & emerging",
    items: [
      "Blockchain Engineer",
      "Smart Contract Developer",
      "Web3 Developer",
      "Game Developer",
      "Unity Developer",
      "Unreal Engine Developer",
      "AR/VR Developer",
      "Quantitative Developer",
      "Quant Researcher",
      "Bioinformatics Engineer",
      "Computational Biologist",
      "GIS Developer",
      "Salesforce Developer",
      "SAP Consultant",
      "ERP Consultant",
      "Technical Writer",
      "Developer Advocate",
      "Developer Relations Engineer",
      "Solutions Engineer",
      "Sales Engineer",
      "Customer Success Engineer",
      "Implementation Engineer",
      "Support Engineer",
      "IT Support Specialist",
      "Business Analyst",
      "Systems Analyst",
    ],
  },
  {
    label: "Business, GTM & operations",
    items: [
      "Account Executive",
      "Business Development Representative",
      "Customer Success Manager",
      "Marketing Manager",
      "Growth Manager",
      "Performance Marketing Manager",
      "SEO Specialist",
      "Content Marketing Manager",
      "Brand Manager",
      "Operations Manager",
      "Supply Chain Manager",
      "Financial Analyst",
      "Finance Manager",
      "Accountant",
      "Controller",
      "HR Business Partner",
      "Recruiter",
      "Technical Recruiter",
      "Talent Acquisition Specialist",
      "People Operations Manager",
      "Legal Counsel",
      "Compliance Officer",
      "Office Manager",
      "Executive Assistant",
    ],
  },
  {
    label: "Healthcare, science & other",
    items: [
      "Clinical Data Manager",
      "Health Informatics Specialist",
      "Regulatory Affairs Specialist",
      "Research Associate",
      "Laboratory Technician",
      "Mechanical Engineer",
      "Electrical Engineer",
      "Civil Engineer",
      "Chemical Engineer",
      "Environmental Engineer",
      "Architect (Built Environment)",
      "Teacher",
      "Instructional Designer",
    ],
  },
];

export const POPULAR_LOCATIONS = [
  "Remote",
  "Remote (Global)",
  "Remote (US)",
  "Remote (India)",
  "Hybrid",
  "Bengaluru",
  "San Francisco Bay Area",
  "New York City",
  "London",
  "Singapore",
];

export const LOCATION_GROUPS: CatalogGroup[] = [
  {
    label: "Remote & flexible",
    items: [
      "Remote",
      "Remote (Global)",
      "Remote (US)",
      "Remote (US Only)",
      "Remote (Canada)",
      "Remote (UK)",
      "Remote (Europe)",
      "Remote (India)",
      "Remote (APAC)",
      "Remote (LATAM)",
      "Remote (EMEA)",
      "Hybrid",
      "Hybrid — 2 days in office",
      "Hybrid — 3 days in office",
      "On-site",
      "Flexible",
    ],
  },
  {
    label: "United States",
    items: [
      "United States",
      "San Francisco Bay Area",
      "San Francisco",
      "Oakland",
      "San Jose",
      "Palo Alto",
      "Mountain View",
      "Los Angeles",
      "Seattle",
      "Bellevue",
      "New York City",
      "Brooklyn",
      "Boston",
      "Cambridge",
      "Austin",
      "Dallas",
      "Houston",
      "Chicago",
      "Denver",
      "Miami",
      "Atlanta",
      "Washington DC",
      "Philadelphia",
      "Phoenix",
      "San Diego",
      "Portland",
      "Raleigh",
      "Charlotte",
      "Nashville",
      "Salt Lake City",
      "Minneapolis",
      "Detroit",
      "Pittsburgh",
    ],
  },
  {
    label: "India",
    items: [
      "India",
      "Bengaluru",
      "Bangalore",
      "Hyderabad",
      "Pune",
      "Mumbai",
      "Chennai",
      "Delhi NCR",
      "New Delhi",
      "Gurugram",
      "Gurgaon",
      "Noida",
      "Kolkata",
      "Ahmedabad",
      "Jaipur",
      "Kochi",
      "Thiruvananthapuram",
      "Indore",
      "Chandigarh",
      "Coimbatore",
      "Visakhapatnam",
    ],
  },
  {
    label: "Europe",
    items: [
      "United Kingdom",
      "London",
      "Manchester",
      "Edinburgh",
      "Dublin",
      "Germany",
      "Berlin",
      "Munich",
      "Hamburg",
      "Frankfurt",
      "France",
      "Paris",
      "Netherlands",
      "Amsterdam",
      "Rotterdam",
      "Spain",
      "Barcelona",
      "Madrid",
      "Portugal",
      "Lisbon",
      "Sweden",
      "Stockholm",
      "Switzerland",
      "Zurich",
      "Geneva",
      "Poland",
      "Warsaw",
      "Kraków",
      "Czech Republic",
      "Prague",
      "Italy",
      "Milan",
      "Rome",
      "Belgium",
      "Brussels",
      "Austria",
      "Vienna",
      "Norway",
      "Oslo",
      "Denmark",
      "Copenhagen",
      "Finland",
      "Helsinki",
    ],
  },
  {
    label: "Asia-Pacific & Middle East",
    items: [
      "Singapore",
      "Japan",
      "Tokyo",
      "Osaka",
      "South Korea",
      "Seoul",
      "China",
      "Shanghai",
      "Beijing",
      "Shenzhen",
      "Hong Kong",
      "Taiwan",
      "Taipei",
      "Australia",
      "Sydney",
      "Melbourne",
      "Brisbane",
      "New Zealand",
      "Auckland",
      "Wellington",
      "Indonesia",
      "Jakarta",
      "Malaysia",
      "Kuala Lumpur",
      "Thailand",
      "Bangkok",
      "Vietnam",
      "Ho Chi Minh City",
      "Hanoi",
      "Philippines",
      "Manila",
      "United Arab Emirates",
      "Dubai",
      "Abu Dhabi",
      "Saudi Arabia",
      "Riyadh",
      "Israel",
      "Tel Aviv",
      "Turkey",
      "Istanbul",
    ],
  },
  {
    label: "Americas (outside US)",
    items: [
      "Canada",
      "Toronto",
      "Vancouver",
      "Montreal",
      "Ottawa",
      "Calgary",
      "Mexico",
      "Mexico City",
      "Guadalajara",
      "Brazil",
      "São Paulo",
      "Rio de Janeiro",
      "Argentina",
      "Buenos Aires",
      "Colombia",
      "Bogotá",
      "Chile",
      "Santiago",
    ],
  },
  {
    label: "Africa",
    items: [
      "South Africa",
      "Cape Town",
      "Johannesburg",
      "Nigeria",
      "Lagos",
      "Kenya",
      "Nairobi",
      "Egypt",
      "Cairo",
      "Morocco",
      "Casablanca",
      "Ghana",
      "Accra",
    ],
  },
];

export const INDUSTRY_GROUPS: CatalogGroup[] = [
  {
    label: "Technology",
    items: [
      "SaaS",
      "B2B Software",
      "Developer Tools",
      "DevTools",
      "Infrastructure",
      "Cloud Computing",
      "Cybersecurity",
      "AI / Machine Learning",
      "Data & Analytics",
      "Open Source",
      "Enterprise Software",
      "IT Services",
      "Semiconductors",
      "Hardware",
      "Telecommunications",
      "Networking",
    ],
  },
  {
    label: "Consumer & commerce",
    items: [
      "E-commerce",
      "Marketplace",
      "Retail",
      "Consumer Internet",
      "Social Media",
      "Gaming",
      "Media & Entertainment",
      "Travel & Hospitality",
      "Food & Beverage",
      "Fashion",
      "Beauty",
      "Sports",
    ],
  },
  {
    label: "Finance & professional",
    items: [
      "Fintech",
      "Banking",
      "Insurance",
      "Payments",
      "Wealth Management",
      "Cryptocurrency / Web3",
      "Venture Capital",
      "Private Equity",
      "Consulting",
      "Legal",
      "Accounting",
      "Real Estate",
      "PropTech",
    ],
  },
  {
    label: "Industry & impact",
    items: [
      "Healthcare",
      "HealthTech",
      "Biotech",
      "Pharma",
      "MedTech",
      "EdTech",
      "Education",
      "Climate / CleanTech",
      "Energy",
      "Automotive",
      "Aerospace",
      "Defense",
      "Manufacturing",
      "Logistics & Supply Chain",
      "Agriculture / AgTech",
      "Construction",
      "Government",
      "Non-profit",
    ],
  },
  {
    label: "Other",
    items: [
      "Startup",
      "Series A",
      "Series B",
      "Growth-stage",
      "Enterprise",
      "FAANG / Big Tech",
      "Agency",
      "Staffing / Recruiting",
      "Research",
      "Other",
    ],
  },
];

export const TECH_COMPANIES = [
  "Google", "Alphabet", "Meta", "Facebook", "Apple", "Amazon", "Microsoft", "Netflix",
  "Stripe", "Shopify", "Uber", "Lyft", "Airbnb", "DoorDash", "Instacart",
  "Coinbase", "Robinhood", "Plaid", "Brex", "Ramp", "Mercury", "Gusto",
  "Databricks", "Snowflake", "Palantir", "OpenAI", "Anthropic", "Cohere",
  "Salesforce", "Oracle", "SAP", "Adobe", "Atlassian", "ServiceNow", "Workday",
  "LinkedIn", "Twitter", "X", "Snap", "Pinterest", "Reddit", "Discord",
  "Spotify", "ByteDance", "TikTok", "Tencent", "Alibaba", "Baidu",
  "Razorpay", "PhonePe", "Paytm", "Flipkart", "Swiggy", "Zomato", "Ola",
  "Freshworks", "Zoho", "Infosys", "TCS", "Wipro", "HCL",
  "Vercel", "Netlify", "Cloudflare", "Fastly", "Datadog", "MongoDB",
  "Notion", "Figma", "Canva", "Linear", "Airtable", "Slack",
  "Goldman Sachs", "JPMorgan", "Morgan Stanley", "McKinsey", "BCG", "Bain",
  "Deloitte", "Accenture", "IBM", "Intel", "NVIDIA", "AMD", "Qualcomm",
  "Tesla", "SpaceX", "Anduril", "CrowdStrike", "Okta", "Zscaler",
];

/** Flat deduplicated lists for search. */
export const JOB_ROLES = dedupe([
  ...POPULAR_JOB_ROLES,
  ...JOB_ROLE_GROUPS.flatMap((g) => g.items),
]);

export const JOB_LOCATIONS = dedupe([
  ...POPULAR_LOCATIONS,
  ...LOCATION_GROUPS.flatMap((g) => g.items),
]);

export const INDUSTRIES = dedupe(INDUSTRY_GROUPS.flatMap((g) => g.items));

function dedupe(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const key = item.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(item);
    }
  }
  return out;
}

/** Split a stored preference string into individual tags. */
export function parseTags(value: string): string[] {
  return value
    .split(/[,·|/]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function joinTags(tags: string[], separator: string): string {
  return tags.join(separator);
}

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9+]/g, "");
}

function scoreMatch(option: string, query: string): number {
  const o = option.toLowerCase();
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  if (o === q) return 100;
  if (o.startsWith(q)) return 80;
  if (o.includes(q)) return 60;
  const words = q.split(/\s+/).filter(Boolean);
  if (words.every((w) => o.includes(w))) return 40;
  const nOpt = norm(option);
  const nQ = norm(q);
  if (nOpt.includes(nQ)) return 30;
  return 0;
}

/** Ranked substring search over a flat catalog. */
export function filterSuggestions(
  options: readonly string[],
  query: string,
  limit = 12,
): string[] {
  const q = query.trim();
  if (!q) return [];

  return options
    .map((opt) => ({ opt, score: scoreMatch(opt, q) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.opt.localeCompare(b.opt))
    .slice(0, limit)
    .map((x) => x.opt);
}

/** Grouped browse list when the input is empty (popular + first items per group). */
export function browseGroups(
  groups: CatalogGroup[],
  popular: string[],
  perGroup = 4,
): { label: string; items: string[] }[] {
  const out: { label: string; items: string[] }[] = [];
  if (popular.length) {
    out.push({ label: "Popular", items: popular });
  }
  for (const g of groups) {
    out.push({ label: g.label, items: g.items.slice(0, perGroup) });
  }
  return out;
}
