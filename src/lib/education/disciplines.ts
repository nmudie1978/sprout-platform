/**
 * Fixed discipline taxonomy (~50 buckets).
 *
 * Single source of truth for the deterministic career → discipline mapping
 * (see scripts/education/classify-disciplines.ts) and for the later
 * university-coverage curation (1-2 local + 1-2 European universities per bucket).
 *
 * Each bucket represents a field of study whose universities would be a
 * sensible fit for the careers mapped to it.
 */
export const DISCIPLINE_IDS = [
  "medicine",
  "nursing-allied-health",
  "dentistry",
  "pharmacy",
  "veterinary",
  "psychology",
  "public-health",
  "biology-life-sciences",
  "chemistry",
  "environmental-earth-science",
  "mathematics-physics",
  "mechanical-engineering",
  "electrical-engineering",
  "civil-engineering",
  "chemical-process-engineering",
  "computer-science-software",
  "data-science-ai",
  "cybersecurity",
  "telecom-network",
  "architecture",
  "urban-planning",
  "law",
  "criminology-policing",
  "business-management",
  "economics-finance",
  "accounting",
  "marketing-communications",
  "human-resources",
  "education-teaching",
  "social-work",
  "humanities-languages",
  "history-philosophy",
  "political-science-ir",
  "journalism-media",
  "creative-arts-design",
  "music-performing-arts",
  "film-animation",
  "sport-science",
  "tourism-hospitality",
  "culinary",
  "agriculture-food",
  "maritime",
  "aviation",
  "logistics-supplychain",
  "geosciences-energy",
  "public-administration",
  "military-defence",
  "real-estate",
  "vocational-trades",
  "beauty-wellness",
  "other-applied",
] as const;

export type DisciplineId = (typeof DISCIPLINE_IDS)[number];
