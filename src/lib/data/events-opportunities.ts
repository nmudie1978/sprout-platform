/**
 * Events & Opportunities — structured directory.
 *
 * Curated, trusted STARTING POINTS (event categories + a directory of reputable
 * external sources). This is deliberately NOT a live job board — we never claim
 * live availability; these are signposts to places worth looking.
 *
 * COUNTRY-AWARE: the source directory is split into GLOBAL_SOURCES (applicable
 * everywhere — LinkedIn, EURES, pan-European graduate platforms) and
 * COUNTRY_SOURCES (nation-specific portals like NAV/FINN for Norway, SEPE/
 * InfoJobs for Spain). `getSourcesForCountry()` resolves the right set from a
 * user's `YouthProfile.country`. Unknown/missing countries fall back to GLOBAL
 * only — we never show a Spanish user Norwegian portals (and vice versa).
 *
 * Pure data + filtering (no React) so it's easy to test and to validate the
 * external URLs from a script.
 */

/** The filterable opportunity/event types (the type filter + source tags). */
export type OppType =
  | "events"
  | "apprenticeships"
  | "internships"
  | "graduate-programs"
  | "student-jobs"
  | "entry-level";

export const OPP_TYPE_LABEL: Record<OppType, string> = {
  events: "Events",
  apprenticeships: "Apprenticeships",
  internships: "Internships",
  "graduate-programs": "Graduate Programs",
  "student-jobs": "Student Jobs",
  "entry-level": "Entry-Level Jobs",
};

/** Muted accent classes per type (Tailwind). Colour is never the only signal —
 *  every card also carries a text label. */
export const OPP_TYPE_ACCENT: Record<OppType, { pill: string; dot: string; ring: string }> = {
  // Events → soft blue
  events: { pill: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/25", dot: "bg-sky-400", ring: "border-sky-500/30" },
  // Apprenticeships / Lærling → warm gold
  apprenticeships: { pill: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25", dot: "bg-amber-400", ring: "border-amber-500/30" },
  // Internships → teal
  internships: { pill: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/25", dot: "bg-teal-400", ring: "border-teal-500/30" },
  // Graduate Programs → muted purple
  "graduate-programs": { pill: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/25", dot: "bg-violet-400", ring: "border-violet-500/30" },
  // Student Jobs → soft green
  "student-jobs": { pill: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25", dot: "bg-emerald-400", ring: "border-emerald-500/30" },
  // Entry-Level → calm slate
  "entry-level": { pill: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/25", dot: "bg-slate-400", ring: "border-slate-500/30" },
};

export type Audience = "school-student" | "student" | "graduate" | "career-changer" | "returning";

export const AUDIENCE_LABEL: Record<Audience, string> = {
  "school-student": "School student",
  student: "Student",
  graduate: "Graduate",
  "career-changer": "Career changer",
  returning: "Returning to work",
};

/** A location filter value: "all", "remote", or a city slug (e.g. "oslo"). */
export type LocationKey = string;

/** A category "explainer" card (Events tab). */
export interface CategoryCard {
  /** Stable id, also used to map an icon in the page. */
  id: string;
  /** The filter type this card maps to (opportunity cards only). */
  type?: OppType;
  name: string;
  description: string;
  /** Suggested search terms (opportunity categories). */
  searchTerms?: string[];
}

export const EVENT_CATEGORIES: CategoryCard[] = [
  { id: "job-fairs", name: "Job Fairs", description: "Meet employers, explore industries, and discover roles you may not have considered." },
  { id: "open-days", name: "Open Days", description: "Visit universities, colleges, employers, or training providers to understand real pathways." },
  { id: "career-workshops", name: "Career Workshops", description: "Practical sessions for CVs, interviews, applications, skills, and confidence." },
  { id: "webinars", name: "Webinars & Online Events", description: "Remote events for career learning, employer insight, and sector introductions." },
  { id: "employer-discovery", name: "Employer Discovery Sessions", description: "Learn what companies actually do, who they hire, and what early roles look like." },
];

export const OPPORTUNITY_CATEGORIES: CategoryCard[] = [
  { id: "apprenticeships", type: "apprenticeships", name: "Apprenticeships", description: "Structured work-based learning routes where you train while gaining real experience.", searchTerms: ["apprenticeship", "trainee", "work-based learning"] },
  { id: "internships", type: "internships", name: "Internships", description: "Short-term work experience, often for students or early-career users.", searchTerms: ["internship", "intern", "summer internship", "placement"] },
  { id: "graduate-programs", type: "graduate-programs", name: "Graduate Programs", description: "Structured entry routes for recent graduates, often with rotations and mentoring.", searchTerms: ["graduate", "trainee", "graduate programme"] },
  { id: "student-jobs", type: "student-jobs", name: "Student Jobs", description: "Part-time, flexible, or summer roles that fit around study.", searchTerms: ["student job", "summer job", "part-time"] },
  { id: "entry-level", type: "entry-level", name: "Entry-Level Jobs", description: "First-step roles where experience requirements are low or training is provided.", searchTerms: ["junior", "entry level", "no experience"] },
];

/** A curated external source in the directory. */
export interface ExternalSource {
  id: string;
  name: string;
  url: string;
  /** Filterable types this source is genuinely useful for. */
  categories: OppType[];
  /** Free-text display pills (e.g. "Internship", "Norway"). */
  tags: string[];
  /** One-line "best for" summary. */
  bestFor: string;
  /** Optional notes / suggested search terms. */
  notes?: string;
  searchTerms?: string[];
  /** City slugs where it's most relevant; omit = nation-wide / everywhere. */
  locations?: LocationKey[];
}

// ── Global sources (shown for EVERY country) ─────────────────────────────────
// Pan-European / worldwide platforms. These are the safe default for users in
// countries we don't yet have a localised list for.
export const GLOBAL_SOURCES: ExternalSource[] = [
  {
    id: "linkedin-pathways",
    name: "LinkedIn Pathways / Entry-Level Programs",
    url: "https://careers.linkedin.com/pathways-programs/entry-level",
    categories: ["entry-level", "graduate-programs"],
    tags: ["Entry-Level", "Graduate", "Pathways", "Global"],
    bestFor: "Understanding structured early-career pathways and entry-level programs",
    notes: "A good example of how structured early-career pathways and entry-level programs work.",
  },
  {
    id: "linkedin-jobs",
    name: "LinkedIn Jobs",
    url: "https://www.linkedin.com/jobs/",
    categories: ["internships", "graduate-programs", "entry-level"],
    tags: ["Internship", "Graduate", "Entry-Level", "Global"],
    bestFor: "Internships, graduate and entry-level roles worldwide",
    searchTerms: ["internship", "graduate", "trainee", "junior"],
  },
  {
    id: "graduateland",
    name: "Graduateland",
    url: "https://graduateland.com/",
    categories: ["internships", "graduate-programs", "student-jobs"],
    tags: ["Internship", "Graduate", "Student Jobs", "Europe"],
    bestFor: "Internships, graduate programs and student jobs across Europe",
  },
  {
    id: "the-hub",
    name: "The Hub",
    url: "https://thehub.io/",
    categories: ["internships", "student-jobs", "entry-level"],
    tags: ["Startup", "Internship", "Entry-Level", "Europe"],
    bestFor: "Startup and scale-up opportunities across Europe",
    notes: "Useful for startup and scale-up opportunities, strongest in the Nordics but pan-European.",
  },
  {
    id: "eures",
    name: "EURES — European Job Mobility Portal",
    url: "https://eures.europa.eu/",
    categories: ["internships", "graduate-programs", "entry-level", "student-jobs"],
    tags: ["EU/EEA", "Jobs", "Traineeships", "Europe"],
    bestFor: "Jobs, traineeships and apprenticeships across the EU/EEA",
    notes: "Official EU portal — strong for moving or working across European countries.",
  },
];

// ── Country-specific sources (keyed by ISO 3166-1 alpha-2) ───────────────────
export const COUNTRY_SOURCES: Record<string, ExternalSource[]> = {
  NO: [
    {
      id: "nav-arbeidsplassen",
      name: "NAV Arbeidsplassen",
      url: "https://arbeidsplassen.nav.no/",
      categories: ["apprenticeships", "student-jobs", "entry-level", "internships"],
      tags: ["Lærling", "Student Jobs", "Entry-Level", "Norway"],
      bestFor: "Apprenticeships, summer jobs, part-time and entry-level roles",
      notes: "Norway's public job portal — strong for young people, summer jobs, apprenticeships, part-time and entry-level roles.",
    },
    {
      id: "finn-jobb",
      name: "FINN Jobb",
      url: "https://www.finn.no/job/",
      categories: ["internships", "graduate-programs", "entry-level", "apprenticeships"],
      tags: ["Trainee", "Internship", "Lærling", "Graduate", "Norway"],
      bestFor: "Internships, trainee and graduate roles, entry-level jobs",
      searchTerms: ["trainee", "internship", "lærling", "graduate", "student", "junior", "nyutdannet"],
    },
    {
      id: "academic-work",
      name: "Academic Work Norway",
      url: "https://www.academicwork.no/",
      categories: ["student-jobs", "internships", "graduate-programs"],
      tags: ["Student Jobs", "Graduate", "Young Professionals", "Norway"],
      bestFor: "Students, graduates and young professionals",
      notes: "Recruitment agency strong for students, graduates and young professionals.",
    },
    {
      id: "glassdoor-internships",
      name: "Glassdoor Norway Internships",
      url: "https://www.glassdoor.com/Job/norway-internship-jobs-SRCH_IL.0,6_IN180_KO7,17.htm",
      categories: ["internships", "entry-level"],
      tags: ["Internship", "Entry-Level", "Norway"],
      bestFor: "Internships and entry-level roles in Norway",
    },
    {
      id: "study-in-norway",
      name: "Study in Norway — Working While Studying",
      url: "https://studyinnorway.no/working-while-studying",
      categories: ["student-jobs", "internships"],
      tags: ["Guidance", "Student Jobs", "Norway"],
      bestFor: "Guidance for students who want to work while studying",
      notes: "A guidance source rather than a job board — good context for students in Norway.",
    },
    {
      id: "uio-careers",
      name: "University of Oslo — Career Opportunities",
      url: "https://www.uio.no/english/studies/career/career-opportunities/",
      categories: ["student-jobs", "internships", "graduate-programs"],
      tags: ["Student Jobs", "Internship", "Volunteering", "Graduate"],
      bestFor: "Student jobs, internships, volunteering and graduate roles",
      locations: ["oslo"],
    },
    {
      id: "jobbnorge",
      name: "Jobbnorge",
      url: "https://www.jobbnorge.no/",
      categories: ["graduate-programs", "entry-level", "apprenticeships"],
      tags: ["Public sector", "Academia", "Graduate", "Norway"],
      bestFor: "Public-sector and academic roles, incl. graduate and entry-level",
    },
  ],
  SE: [
    {
      id: "arbetsformedlingen",
      name: "Arbetsförmedlingen (Platsbanken)",
      url: "https://arbetsformedlingen.se/",
      categories: ["apprenticeships", "student-jobs", "entry-level", "internships"],
      tags: ["Public", "Entry-Level", "Sweden"],
      bestFor: "Sweden's public employment service — entry-level, apprenticeships and summer jobs",
      notes: "Sweden's public job portal (Platsbanken) — strong for young people, apprenticeships (lärling) and summer jobs.",
    },
    {
      id: "academic-work-se",
      name: "Academic Work Sweden",
      url: "https://www.academicwork.se/",
      categories: ["student-jobs", "internships", "graduate-programs"],
      tags: ["Student Jobs", "Graduate", "Young Professionals", "Sweden"],
      bestFor: "Students, graduates and young professionals in Sweden",
    },
  ],
  ES: [
    {
      id: "sepe",
      name: "SEPE — Servicio Público de Empleo Estatal",
      url: "https://www.sepe.es/",
      categories: ["apprenticeships", "entry-level", "student-jobs", "internships"],
      tags: ["Public", "Entry-Level", "Spain"],
      bestFor: "Spain's public employment service — training, apprenticeships (FP dual) and entry-level",
      notes: "Spain's public employment service — good for vocational training (FP dual), apprenticeships and entry-level routes.",
    },
    {
      id: "infojobs",
      name: "InfoJobs",
      url: "https://www.infojobs.net/",
      categories: ["internships", "entry-level", "student-jobs", "graduate-programs"],
      tags: ["Internship", "Entry-Level", "Spain"],
      bestFor: "Spain's largest job board — internships, graduate and entry-level roles",
      searchTerms: ["prácticas", "becario", "junior", "sin experiencia", "trainee"],
    },
    {
      id: "jobandtalent",
      name: "Jobandtalent",
      url: "https://www.jobandtalent.com/",
      categories: ["entry-level", "student-jobs"],
      tags: ["Entry-Level", "Student Jobs", "Spain"],
      bestFor: "Entry-level, temporary and flexible roles in Spain",
    },
  ],
  DK: [
    {
      id: "jobnet",
      name: "Jobnet",
      url: "https://job.jobnet.dk/",
      categories: ["apprenticeships", "student-jobs", "entry-level", "internships"],
      tags: ["Public", "Entry-Level", "Denmark"],
      bestFor: "Denmark's public job portal — entry-level, apprenticeships and student jobs",
      notes: "Denmark's public job portal — strong for apprenticeships (lærling), student jobs and entry-level roles.",
    },
    {
      id: "workindenmark",
      name: "WorkinDenmark",
      url: "https://www.workindenmark.dk/",
      categories: ["graduate-programs", "entry-level", "internships"],
      tags: ["Official", "Graduate", "Denmark"],
      bestFor: "Official service for working in Denmark — graduate and entry-level roles",
    },
    {
      id: "academic-work-dk",
      name: "Academic Work Denmark",
      url: "https://www.academicwork.dk/",
      categories: ["student-jobs", "internships", "graduate-programs"],
      tags: ["Student Jobs", "Graduate", "Young Professionals", "Denmark"],
      bestFor: "Students, graduates and young professionals in Denmark",
    },
  ],
};

/** `YouthProfile.country` display name → ISO alpha-2 key used above. */
const COUNTRY_KEY: Record<string, string> = {
  Norway: "NO",
  Sweden: "SE",
  Spain: "ES",
  Denmark: "DK",
};

/**
 * Resolve the curated source directory for a user's country: the country's
 * own portals first, then the global sources. Unknown/missing country →
 * GLOBAL only (never a wrong-country portal). Never throws.
 */
export function getSourcesForCountry(country?: string | null): ExternalSource[] {
  const key = (country && COUNTRY_KEY[country]) || null;
  const local = key ? (COUNTRY_SOURCES[key] ?? []) : [];
  return [...local, ...GLOBAL_SOURCES];
}

// ── Country-aware location options ───────────────────────────────────────────
/** Major cities per country (city slug → display label). */
const COUNTRY_CITIES: Record<string, { value: string; label: string }[]> = {
  NO: [
    { value: "oslo", label: "Oslo" },
    { value: "bergen", label: "Bergen" },
    { value: "trondheim", label: "Trondheim" },
    { value: "stavanger", label: "Stavanger" },
  ],
  SE: [
    { value: "stockholm", label: "Stockholm" },
    { value: "gothenburg", label: "Gothenburg" },
    { value: "malmo", label: "Malmö" },
    { value: "uppsala", label: "Uppsala" },
  ],
  ES: [
    { value: "madrid", label: "Madrid" },
    { value: "barcelona", label: "Barcelona" },
    { value: "valencia", label: "Valencia" },
    { value: "seville", label: "Seville" },
  ],
  DK: [
    { value: "copenhagen", label: "Copenhagen" },
    { value: "aarhus", label: "Aarhus" },
    { value: "odense", label: "Odense" },
    { value: "aalborg", label: "Aalborg" },
  ],
};

/**
 * Build the Location filter options for a user's country: "All <Country>"
 * (or "All locations" when unknown), the country's major cities, then Remote.
 */
export function getLocationOptions(country?: string | null): { value: string; label: string }[] {
  const key = (country && COUNTRY_KEY[country]) || null;
  const allLabel = key && country ? `All ${country}` : "All locations";
  const cities = key ? (COUNTRY_CITIES[key] ?? []) : [];
  return [
    { value: "all", label: allLabel },
    ...cities,
    { value: "remote", label: "Remote / Online" },
  ];
}

// ── Country-aware external event search (Events tab) ─────────────────────────
/** English search phrases per event category; `{country}` is filled at runtime. */
const EVENT_SEARCH_TEMPLATE: Record<string, string> = {
  "job-fairs": "job fair career fair",
  "open-days": "university open day",
  "career-workshops": "career workshop CV interview",
  webinars: "career webinar online event",
  "employer-discovery": "employer presentation career event",
};

/** A safe external Google search for an event category, tailored to the country. */
export function eventSearchQuery(categoryId: string, country?: string | null, fallbackName?: string): string {
  const base = EVENT_SEARCH_TEMPLATE[categoryId] ?? fallbackName ?? categoryId;
  return [base, country?.trim()].filter(Boolean).join(" ");
}

/** Back-compat: the Norway + global directory (Norway is the platform default). */
export const EXTERNAL_SOURCES: ExternalSource[] = getSourcesForCountry("Norway");

/** Every configured external URL across all countries — for the link-validation script + tests. */
export const ALL_EVENT_OPP_URLS: string[] = [
  ...GLOBAL_SOURCES,
  ...Object.values(COUNTRY_SOURCES).flat(),
].map((s) => s.url);

export interface SourceFilter {
  query?: string;
  type?: OppType | "all";
  location?: LocationKey;
  audience?: Audience | "all";
}

/** Pure filter over the external source directory. */
export function filterSources(sources: ExternalSource[], f: SourceFilter): ExternalSource[] {
  const q = (f.query ?? "").trim().toLowerCase();
  return sources.filter((s) => {
    if (f.type && f.type !== "all" && f.type !== "events" && !s.categories.includes(f.type)) return false;
    if (f.location && f.location !== "all" && f.location !== "remote") {
      // A source scoped to specific cities must include the chosen one;
      // nation-wide sources (no `locations`) always match a city.
      if (s.locations && !s.locations.includes(f.location)) return false;
    }
    if (q) {
      const hay = [s.name, s.bestFor, s.notes ?? "", ...s.tags, ...(s.searchTerms ?? [])]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/** Filter category cards by a free-text query (name + description + terms). */
export function filterCategories(cards: CategoryCard[], query?: string): CategoryCard[] {
  const q = (query ?? "").trim().toLowerCase();
  if (!q) return cards;
  return cards.filter((c) =>
    [c.name, c.description, ...(c.searchTerms ?? [])].join(" ").toLowerCase().includes(q),
  );
}
