/**
 * Study funding & scholarship data.
 *
 * Provides structured funding information for the Study Path section
 * of My Journey. Two layers:
 *
 * 1. Universal funding (Lånekassen) — applies to every Norwegian
 *    student regardless of career choice. Shown by default.
 * 2. Career/route-specific scholarships — curated per career or
 *    per route (e.g. "Equinor PhD scholarships for engineers").
 *    Shown when the career has entries in CAREER_SCHOLARSHIPS.
 *
 * All data is hand-curated and static (same pattern as programmes.json).
 * A future integration with Lånekassen's API or a scholarship
 * aggregator could replace this.
 */

// ── Types ──────────────────────────────────────────────────────────

export interface FundingSource {
  id: string;
  name: string;
  provider: string;
  /** 1-2 sentence description. */
  description: string;
  /** Who can apply: "all" | "under-20" | "via-abroad" | "specific-career" */
  eligibility: string;
  /** Approximate amount in NOK per year (or total). */
  amount: string;
  /** URL to the official source. */
  url: string;
  /** Country this funding applies to. */
  country: string;
  /** Tags for filtering. */
  tags: ('universal' | 'scholarship' | 'loan' | 'grant' | 'abroad' | 'vocational' | 'masters')[];
}

export interface FundingResult {
  universal: FundingSource[];
  careerSpecific: FundingSource[];
}

// ── Universal funding (Lånekassen) ─────────────────────────────────

const UNIVERSAL_FUNDING: FundingSource[] = [
  {
    id: "lanekassen-basis",
    name: "Lånekassen — Basislån + stipend",
    provider: "Statens lånekasse for utdanning",
    description:
      "Every Norwegian student is entitled to a basic student loan (~130,000 kr/year) of which up to 40% converts to a grant if you pass your exams. No income requirement, no competitive application — you just apply.",
    eligibility: "All Norwegian residents in approved education programmes",
    amount: "~130,000 kr/year (loan); ~52,000 kr/year converts to grant on completion",
    url: "https://lanekassen.no",
    country: "NO",
    tags: ["universal", "loan", "grant"],
  },
  {
    id: "lanekassen-abroad",
    name: "Lånekassen — Study Abroad Support",
    provider: "Statens lånekasse for utdanning",
    description:
      "Norwegian students studying at approved institutions abroad receive the same base support as domestic students, plus extra grants for tuition fees (up to ~70,000 kr/year) and travel costs. Covers EU/EEA + selected institutions worldwide.",
    eligibility: "Norwegian residents studying at approved institutions abroad",
    amount: "Base loan + up to ~70,000 kr/year tuition grant + travel",
    url: "https://lanekassen.no/nb-NO/Stipend-og-lan/utland/",
    country: "NO",
    tags: ["universal", "loan", "grant", "abroad"],
  },
  {
    id: "lanekassen-vgs",
    name: "Lånekassen — Videregående (upper secondary) stipend",
    provider: "Statens lånekasse for utdanning",
    description:
      "Students in videregående skole (16-19) can receive a means-tested grant (bostipend, utstyrsstipend) to cover equipment and living costs. No loan component — it's a pure grant.",
    eligibility: "Students in videregående skole (upper secondary) with family income below threshold",
    amount: "Varies: equipment stipend ~1,000-4,000 kr + housing stipend up to ~4,700 kr/month",
    url: "https://lanekassen.no/nb-NO/Stipend-og-lan/Norge/videregaende/",
    country: "NO",
    tags: ["universal", "grant", "vocational"],
  },
];

// ── Career-specific scholarships ───────────────────────────────────
// Keyed by careerId. Careers not in this map show only universal funding.

const CAREER_SCHOLARSHIPS: Record<string, FundingSource[]> = {
  doctor: [
    {
      id: "legat-medisin",
      name: "Legeforeningens fond for medisinsk forskning",
      provider: "Den norske legeforening",
      description: "Research grants for medical students and early-career doctors pursuing research alongside clinical training.",
      eligibility: "Medical students and junior doctors in Norway",
      amount: "30,000 - 100,000 kr (project-based)",
      url: "https://www.legeforeningen.no",
      country: "NO",
      tags: ["scholarship", "grant"],
    },
  ],
  engineer: [
    {
      id: "equinor-scholarship",
      name: "Equinor Engineering Scholarship",
      provider: "Equinor",
      description: "Annual scholarships for engineering students at NTNU, UiB, UiS, and UiT. Includes mentorship + summer internship offer.",
      eligibility: "Engineering students at selected Norwegian universities",
      amount: "~50,000 kr/year + summer internship",
      url: "https://www.equinor.com/careers/students",
      country: "NO",
      tags: ["scholarship"],
    },
  ],
  "software-developer": [
    {
      id: "dnb-tech-scholarship",
      name: "DNB Tech Scholarship",
      provider: "DNB",
      description: "For CS and IT students — includes mentoring, networking events, and a paid summer internship at DNB.",
      eligibility: "CS/IT students at Norwegian universities",
      amount: "~40,000 kr + summer internship",
      url: "https://www.dnb.no/karriere",
      country: "NO",
      tags: ["scholarship"],
    },
  ],
  teacher: [
    {
      id: "slettestipend",
      name: "Slettestipend (debt forgiveness for teachers)",
      provider: "Lånekassen",
      description: "Teachers who work in designated schools in Northern Norway or other eligible areas can have up to 25,000 kr of student debt forgiven per year.",
      eligibility: "Qualified teachers working in eligible municipalities (mostly Northern Norway)",
      amount: "Up to 25,000 kr/year debt forgiveness",
      url: "https://lanekassen.no/nb-NO/Stipend-og-lan/Norge/ettergivelse/",
      country: "NO",
      tags: ["grant"],
    },
  ],
};

// ── Public API ─────────────────────────────────────────────────────

/**
 * Get funding sources for a career. Returns universal sources (always)
 * plus any career-specific scholarships if available.
 */
export function getFundingForCareer(careerId: string | null): FundingResult {
  return {
    universal: UNIVERSAL_FUNDING,
    careerSpecific: careerId ? (CAREER_SCHOLARSHIPS[careerId] ?? []) : [],
  };
}

/**
 * Whether a career has specific scholarships beyond the universal ones.
 */
export function hasCareerScholarships(careerId: string): boolean {
  return (CAREER_SCHOLARSHIPS[careerId]?.length ?? 0) > 0;
}

/**
 * Get all available funding sources across all careers (for admin/audit).
 */
export function getAllFundingSources(): FundingSource[] {
  const all = [...UNIVERSAL_FUNDING];
  for (const sources of Object.values(CAREER_SCHOLARSHIPS)) {
    all.push(...sources);
  }
  return all;
}
