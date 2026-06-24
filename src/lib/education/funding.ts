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

  // ── Sweden — CSN ─────────────────────────────────────────────────
  {
    id: "csn-studiemedel",
    name: "CSN — Studiemedel (grant + loan)",
    provider: "Centrala studiestödsnämnden (CSN)",
    description:
      "Every eligible student gets studiemedel: a grant (studiebidrag) plus an optional low-interest loan (studielån). No competitive application — you just apply to CSN.",
    eligibility: "Swedish students in approved higher or upper-secondary education",
    amount: "~3,900 SEK/month grant + up to ~8,200 SEK/month loan (full-time)",
    url: "https://www.csn.se",
    country: "SE",
    tags: ["universal", "loan", "grant"],
  },
  {
    id: "csn-studiebidrag",
    name: "CSN — Studiebidrag (gymnasium)",
    provider: "Centrala studiestödsnämnden (CSN)",
    description:
      "Students aged 16-20 in gymnasium (upper secondary) automatically receive a monthly study allowance (studiebidrag) — a pure grant, no application needed.",
    eligibility: "Students aged 16-20 in Swedish upper-secondary education",
    amount: "~1,250 SEK/month (grant)",
    url: "https://www.csn.se/bidrag-och-lan/studiestod/bidrag-for-gymnasiestudier.html",
    country: "SE",
    tags: ["universal", "grant"],
  },
  {
    id: "csn-abroad",
    name: "CSN — Studying Abroad",
    provider: "Centrala studiestödsnämnden (CSN)",
    description:
      "Swedish students can take studiemedel abroad, and CSN may also cover tuition costs (merkostnadslån) for approved foreign institutions.",
    eligibility: "Swedish students at approved institutions abroad",
    amount: "Studiemedel + possible tuition loan",
    url: "https://www.csn.se/bidrag-och-lan/studiestod/studera-utomlands.html",
    country: "SE",
    tags: ["universal", "abroad", "loan", "grant"],
  },

  // ── Denmark — SU ─────────────────────────────────────────────────
  {
    id: "su-stipend",
    name: "SU — Statens Uddannelsesstøtte",
    provider: "Uddannelses- og Forskningsstyrelsen (SU)",
    description:
      "Danish students in higher education get a monthly SU grant (no repayment) plus an optional low-interest SU loan. The grant is means-tested against your own income.",
    eligibility: "Danish students aged 18+ in approved higher education",
    amount: "~6,600 DKK/month grant (living away from home) + ~3,500 DKK/month optional loan",
    url: "https://www.su.dk",
    country: "DK",
    tags: ["universal", "grant", "loan"],
  },
  {
    id: "su-ungdom",
    name: "SU — Ungdomsuddannelse (upper secondary)",
    provider: "Uddannelses- og Forskningsstyrelsen (SU)",
    description:
      "Students aged 18+ in a youth/upper-secondary education can receive SU; under-18s may get a smaller youth grant depending on parental income.",
    eligibility: "Students in Danish upper-secondary education (mainly 18+)",
    amount: "Varies by age and parental income",
    url: "https://www.su.dk/su/su-til-ungdomsuddannelser",
    country: "DK",
    tags: ["universal", "grant"],
  },
  {
    id: "su-abroad",
    name: "SU — Studying Abroad",
    provider: "Uddannelses- og Forskningsstyrelsen (SU)",
    description:
      "You can usually take your SU abroad for a full degree or an exchange at an approved institution.",
    eligibility: "Danish students at approved institutions abroad",
    amount: "SU grant (+ optional loan), as at home",
    url: "https://www.su.dk/su-i-udlandet",
    country: "DK",
    tags: ["universal", "abroad", "grant"],
  },

  // ── Finland — Kela ───────────────────────────────────────────────
  {
    id: "kela-opintotuki",
    name: "Kela — Opintotuki (study grant + loan guarantee)",
    provider: "Kela (Social Insurance Institution of Finland)",
    description:
      "Kela's financial aid for students: a monthly study grant (opintoraha) plus a state-guaranteed student loan. Both higher-education and upper-secondary students qualify.",
    eligibility: "Finnish students in approved higher or upper-secondary education",
    amount: "Up to ~280 €/month grant + ~650 €/month state-guaranteed loan (higher ed)",
    url: "https://www.kela.fi/financial-aid-for-students",
    country: "FI",
    tags: ["universal", "grant", "loan"],
  },
  {
    id: "kela-abroad",
    name: "Kela — Studying Abroad",
    provider: "Kela (Social Insurance Institution of Finland)",
    description:
      "Finnish students can receive study aid for a full degree or an exchange abroad at an approved institution.",
    eligibility: "Finnish students at approved institutions abroad",
    amount: "Study grant + state-guaranteed loan, as at home",
    url: "https://www.kela.fi/financial-aid-for-students-studies-abroad",
    country: "FI",
    tags: ["universal", "abroad", "grant", "loan"],
  },

  // ── Iceland — Menntasjóður námsmanna ─────────────────────────────
  {
    id: "menntasjodur-loan",
    name: "Menntasjóður — Student loans + completion grant",
    provider: "Menntasjóður námsmanna (Icelandic Student Loan Fund)",
    description:
      "Icelandic students can take needs-based student loans; 30% of the loan is converted to a grant if you finish your programme on time.",
    eligibility: "Icelandic students in approved higher education",
    amount: "Needs-based loan; 30% converts to a grant on timely completion",
    url: "https://menntasjodur.is",
    country: "IS",
    tags: ["universal", "loan", "grant"],
  },
  {
    id: "menntasjodur-abroad",
    name: "Menntasjóður — Studying Abroad",
    provider: "Menntasjóður námsmanna (Icelandic Student Loan Fund)",
    description:
      "The loans (and the 30% completion grant) are also available for approved study abroad.",
    eligibility: "Icelandic students at approved institutions abroad",
    amount: "Needs-based loan + completion grant, as at home",
    url: "https://menntasjodur.is",
    country: "IS",
    tags: ["universal", "abroad", "loan", "grant"],
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
 * Get funding sources for a career, scoped to the viewer's country.
 * Returns that country's universal national student finance (Lånekassen for
 * NO, CSN for SE, SU for DK, Kela for FI, Menntasjóður for IS) plus any
 * country-matching career-specific scholarships. Countries without curated
 * funding data (e.g. ES) return empty lists so the section hides itself
 * rather than showing the wrong country's scheme.
 *
 * Defaults to Norway when no country is given (backwards compatible).
 */
export function getFundingForCareer(
  careerId: string | null,
  country: string = "NO",
): FundingResult {
  return {
    universal: UNIVERSAL_FUNDING.filter((f) => f.country === country),
    careerSpecific: (careerId ? (CAREER_SCHOLARSHIPS[careerId] ?? []) : []).filter(
      (f) => f.country === country,
    ),
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
