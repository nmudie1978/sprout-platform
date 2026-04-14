/**
 * Mapping from Career.id → Statistics Norway (SSB) occupation classification.
 *
 * SSB publishes wage statistics under the STYRK-08 occupation codes
 * (4-digit standard for Norwegian classification of occupations,
 * aligned with ISCO-08). The salary refresh script
 * (`scripts/refresh-career-salaries.ts`) joins our catalogue to the
 * official wage table via this mapping.
 *
 * Coverage is intentionally partial — only the careers where SSB has
 * a clean STYRK-08 match. Add more rows as you verify them. Anything
 * not in this map will still display salary data from the catalogue
 * but won't be refreshable, and the "salary may be out of date"
 * disclaimer will continue to surface (per `isCareerSalaryStale`).
 *
 * Useful SSB references:
 *   - Table 11418: Wages — average monthly earnings by occupation
 *   - https://www.ssb.no/en/statbank/list/lonnansatt
 *   - STYRK-08 codes: https://www.ssb.no/en/klass/klassifikasjoner/7
 */

export interface SsbOccupationMapping {
  /** Career.id from career-pathways.ts */
  careerId: string;
  /** STYRK-08 4-digit code (e.g. "2211" = Doctors, generalist medical) */
  styrkCode: string;
  /** Human-readable label for logs / diff reports */
  styrkLabel: string;
}

export const SSB_OCCUPATION_MAP: SsbOccupationMapping[] = [
  // Health
  { careerId: "doctor", styrkCode: "2211", styrkLabel: "Generalist medical practitioners" },
  { careerId: "nurse", styrkCode: "2221", styrkLabel: "Nursing professionals" },
  { careerId: "dentist", styrkCode: "2261", styrkLabel: "Dentists" },
  { careerId: "veterinarian", styrkCode: "2250", styrkLabel: "Veterinarians" },
  { careerId: "pharmacist", styrkCode: "2262", styrkLabel: "Pharmacists" },
  { careerId: "physiotherapist", styrkCode: "2264", styrkLabel: "Physiotherapists" },
  { careerId: "midwife", styrkCode: "2222", styrkLabel: "Midwifery professionals" },
  { careerId: "dental-hygienist", styrkCode: "3251", styrkLabel: "Dental assistants and therapists" },

  // Education
  { careerId: "primary-teacher", styrkCode: "2341", styrkLabel: "Primary school teachers" },
  { careerId: "secondary-teacher", styrkCode: "2330", styrkLabel: "Secondary education teachers" },
  { careerId: "kindergarten-teacher", styrkCode: "2342", styrkLabel: "Early childhood educators" },
  { careerId: "university-lecturer", styrkCode: "2310", styrkLabel: "University and higher education teachers" },

  // Tech
  { careerId: "software-developer", styrkCode: "2512", styrkLabel: "Software developers" },
  { careerId: "data-analyst", styrkCode: "2511", styrkLabel: "Systems analysts" },
  { careerId: "cloud-engineer", styrkCode: "2521", styrkLabel: "Database designers and administrators" },
  { careerId: "it-support", styrkCode: "3512", styrkLabel: "Computer network and systems technicians" },

  // Business / finance
  { careerId: "accountant", styrkCode: "2411", styrkLabel: "Accountants" },
  { careerId: "financial-analyst", styrkCode: "2413", styrkLabel: "Financial analysts" },
  { careerId: "investment-banker", styrkCode: "2412", styrkLabel: "Financial and investment advisers" },
  { careerId: "lawyer", styrkCode: "2611", styrkLabel: "Lawyers" },
  { careerId: "project-manager", styrkCode: "2421", styrkLabel: "Management and organisation analysts" },
  { careerId: "hr-specialist", styrkCode: "2423", styrkLabel: "Personnel and careers professionals" },

  // Trades
  { careerId: "plumber", styrkCode: "7126", styrkLabel: "Plumbers and pipefitters" },
  { careerId: "carpenter", styrkCode: "7115", styrkLabel: "Carpenters and joiners" },
  { careerId: "electrician", styrkCode: "7411", styrkLabel: "Building and related electricians" },
  { careerId: "auto-mechanic", styrkCode: "7231", styrkLabel: "Motor vehicle mechanics and repairers" },
  { careerId: "bricklayer", styrkCode: "7112", styrkLabel: "Bricklayers and related workers" },
  { careerId: "mechanical-engineer", styrkCode: "2144", styrkLabel: "Mechanical engineers" },
  { careerId: "electrical-engineer", styrkCode: "2151", styrkLabel: "Electrical engineers" },

  // Public service / military
  { careerId: "police-officer", styrkCode: "5412", styrkLabel: "Police officers" },
  { careerId: "firefighter", styrkCode: "5411", styrkLabel: "Fire-fighters" },
  { careerId: "military-officer", styrkCode: "0110", styrkLabel: "Commissioned armed forces officers" },
  { careerId: "soldier", styrkCode: "0210", styrkLabel: "Non-commissioned armed forces officers" },

  // Hospitality / service
  { careerId: "chef", styrkCode: "3434", styrkLabel: "Chefs" },
  { careerId: "hairdresser", styrkCode: "5141", styrkLabel: "Hairdressers" },

  // Logistics
  { careerId: "truck-driver", styrkCode: "8332", styrkLabel: "Heavy truck and lorry drivers" },
  { careerId: "bus-driver", styrkCode: "8331", styrkLabel: "Bus and tram drivers" },
  { careerId: "airline-pilot", styrkCode: "3153", styrkLabel: "Aircraft pilots and related associate professionals" },

  // Creative
  { careerId: "architect", styrkCode: "2161", styrkLabel: "Building architects" },
  { careerId: "journalist", styrkCode: "2642", styrkLabel: "Journalists" },
  { careerId: "graphic-designer", styrkCode: "2166", styrkLabel: "Graphic and multimedia designers" },
  { careerId: "photographer", styrkCode: "3431", styrkLabel: "Photographers" },

  // Sport
  { careerId: "personal-trainer", styrkCode: "3422", styrkLabel: "Sports coaches, instructors and officials" },
  { careerId: "sports-coach", styrkCode: "3422", styrkLabel: "Sports coaches, instructors and officials" },

  // Social care
  { careerId: "social-worker", styrkCode: "2635", styrkLabel: "Social work and counselling professionals" },
  { careerId: "psychologist", styrkCode: "2634", styrkLabel: "Psychologists" },

  // Real estate
  { careerId: "real-estate-agent", styrkCode: "3334", styrkLabel: "Real estate agents and property managers" },
  { careerId: "property-manager", styrkCode: "3334", styrkLabel: "Real estate agents and property managers" },
];

export function findStyrkForCareer(
  careerId: string,
): SsbOccupationMapping | undefined {
  return SSB_OCCUPATION_MAP.find((m) => m.careerId === careerId);
}
