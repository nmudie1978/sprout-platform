/**
 * Matching lookups — pure, catalog-free.
 *
 * Static maps + pure helpers extracted from career-pathways.ts so the matching
 * engine / Career Radar can use them WITHOUT pulling the ~740KB CAREER_PATHWAYS
 * data const into the client bundle. career-pathways.ts imports these back, so
 * there is a single source of truth and NO behaviour change.
 *
 * Types are imported type-only (erased at build → stays catalog-free at runtime).
 */
import type {
  Career,
  CareerCategory,
  WorkSetting,
  PeopleIntensity,
  EntryRoute,
  DiscoveryPreferences,
} from "@/lib/career-pathways";

export const CATEGORY_SECTOR_DEFAULTS: Partial<Record<CareerCategory, "public" | "private" | "mixed">> = {
  HEALTHCARE_LIFE_SCIENCES: "public",
  EDUCATION_TRAINING: "public",
  PUBLIC_SERVICE_SAFETY: "public",
  MILITARY_DEFENCE: "public",
  SOCIAL_CARE_COMMUNITY: "public",
  TECHNOLOGY_IT: "private",
  ARTIFICIAL_INTELLIGENCE: "private",
  FINANCE_BANKING: "private",
  CREATIVE_MEDIA: "private",
  SALES_MARKETING: "private",
  HOSPITALITY_TOURISM: "private",
  REAL_ESTATE_PROPERTY: "private",
  BUSINESS_MANAGEMENT: "private",
  LOGISTICS_TRANSPORT: "mixed",
  MANUFACTURING_ENGINEERING: "mixed",
  CONSTRUCTION_TRADES: "mixed",
  SPORT_FITNESS: "mixed",
  TELECOMMUNICATIONS: "mixed",
};

export const UNIVERSITY_ROUTES: ReadonlySet<EntryRoute> = new Set([
  "bachelor",
  "master",
  "profesjonsstudium",
]);

export const WORK_SETTING_DEFAULTS: Record<CareerCategory, WorkSetting> = {
  HEALTHCARE_LIFE_SCIENCES: "hands-on",
  EDUCATION_TRAINING: "hands-on",
  TECHNOLOGY_IT: "desk",
  ARTIFICIAL_INTELLIGENCE: "desk",
  BUSINESS_MANAGEMENT: "desk",
  FINANCE_BANKING: "desk",
  SALES_MARKETING: "desk",
  MANUFACTURING_ENGINEERING: "hands-on",
  LOGISTICS_TRANSPORT: "hands-on",
  HOSPITALITY_TOURISM: "hands-on",
  TELECOMMUNICATIONS: "mixed",
  CREATIVE_MEDIA: "creative",
  PUBLIC_SERVICE_SAFETY: "mixed",
  MILITARY_DEFENCE: "hands-on",
  SPORT_FITNESS: "hands-on",
  REAL_ESTATE_PROPERTY: "mixed",
  SOCIAL_CARE_COMMUNITY: "hands-on",
  CONSTRUCTION_TRADES: "hands-on",
};

export const PEOPLE_INTENSITY_DEFAULTS: Record<CareerCategory, PeopleIntensity> = {
  HEALTHCARE_LIFE_SCIENCES: "high",
  EDUCATION_TRAINING: "high",
  TECHNOLOGY_IT: "medium",
  ARTIFICIAL_INTELLIGENCE: "medium",
  BUSINESS_MANAGEMENT: "high",
  FINANCE_BANKING: "medium",
  SALES_MARKETING: "high",
  MANUFACTURING_ENGINEERING: "medium",
  LOGISTICS_TRANSPORT: "medium",
  HOSPITALITY_TOURISM: "high",
  TELECOMMUNICATIONS: "medium",
  CREATIVE_MEDIA: "medium",
  PUBLIC_SERVICE_SAFETY: "high",
  MILITARY_DEFENCE: "high",
  SPORT_FITNESS: "high",
  REAL_ESTATE_PROPERTY: "high",
  SOCIAL_CARE_COMMUNITY: "high",
  CONSTRUCTION_TRADES: "medium",
};

export const WORK_SETTING_OVERRIDES: Record<string, WorkSetting> = {
  // Tech that is genuinely creative
  "ux-designer": "creative",
  "frontend-developer": "creative",
  "game-developer": "creative",
  // Marketing that is creative not desk
  "graphic-designer": "creative",
  // Engineering / labs that are mostly desk-bound
  "data-scientist": "desk",
  "quantitative-analyst": "desk",
  "quant-developer": "desk",
  // Outdoors-heavy
  "park-ranger": "outdoors",
  "marine-biologist": "outdoors",
  "construction-worker": "outdoors",
  "farmer": "outdoors",
  "geologist": "outdoors",
  // Healthcare research that's lab/desk-leaning
  "biomedical-scientist": "mixed",
  "epidemiologist": "desk",
  "researcher": "desk",
};

export const PEOPLE_INTENSITY_OVERRIDES: Record<string, PeopleIntensity> = {
  // Solo/low-people tech roles
  "machine-learning-engineer": "low",
  "data-scientist": "low",
  "backend-developer": "low",
  "quantitative-analyst": "low",
  "quant-developer": "low",
  "researcher": "low",
  // High-people tech roles
  "scrum-master": "high",
  "product-manager-tech": "high",
  "agile-coach": "high",
  "ai-product-manager": "high",
  "it-support": "high",
  // Solo creative
  "writer": "low",
  "translator": "low",
};

export const SUBJECT_CATEGORY_WEIGHTS: Record<string, Partial<Record<CareerCategory, number>>> = {
  biology:      { HEALTHCARE_LIFE_SCIENCES: 4, SOCIAL_CARE_COMMUNITY: 2, SPORT_FITNESS: 2, MANUFACTURING_ENGINEERING: 1 },
  chemistry:    { HEALTHCARE_LIFE_SCIENCES: 4, MANUFACTURING_ENGINEERING: 3 },
  physics:      { MANUFACTURING_ENGINEERING: 4, TECHNOLOGY_IT: 3, ARTIFICIAL_INTELLIGENCE: 2, TELECOMMUNICATIONS: 2, MILITARY_DEFENCE: 1 },
  math:         { FINANCE_BANKING: 4, TECHNOLOGY_IT: 3, ARTIFICIAL_INTELLIGENCE: 4, MANUFACTURING_ENGINEERING: 2 },
  computing:    { TECHNOLOGY_IT: 4, ARTIFICIAL_INTELLIGENCE: 4, TELECOMMUNICATIONS: 2, MANUFACTURING_ENGINEERING: 1 },
  english:      { CREATIVE_MEDIA: 4, EDUCATION_TRAINING: 3, SALES_MARKETING: 2, BUSINESS_MANAGEMENT: 1 },
  history:      { EDUCATION_TRAINING: 3, PUBLIC_SERVICE_SAFETY: 3, BUSINESS_MANAGEMENT: 1, MILITARY_DEFENCE: 1 },
  geography:    { LOGISTICS_TRANSPORT: 3, HOSPITALITY_TOURISM: 3, PUBLIC_SERVICE_SAFETY: 2, MILITARY_DEFENCE: 1 },
  art:          { CREATIVE_MEDIA: 4, SALES_MARKETING: 2, HOSPITALITY_TOURISM: 1 },
  music:        { CREATIVE_MEDIA: 4, EDUCATION_TRAINING: 2 },
  pe:           { SPORT_FITNESS: 4, HEALTHCARE_LIFE_SCIENCES: 2, EDUCATION_TRAINING: 2, PUBLIC_SERVICE_SAFETY: 1, MILITARY_DEFENCE: 1 },
  business:     { BUSINESS_MANAGEMENT: 4, FINANCE_BANKING: 3, SALES_MARKETING: 3 },
  languages:    { HOSPITALITY_TOURISM: 3, EDUCATION_TRAINING: 3, BUSINESS_MANAGEMENT: 2 },
  psychology:   { HEALTHCARE_LIFE_SCIENCES: 3, SOCIAL_CARE_COMMUNITY: 4, EDUCATION_TRAINING: 2, PUBLIC_SERVICE_SAFETY: 1 },
  "design-tech":      { CREATIVE_MEDIA: 4, TECHNOLOGY_IT: 2, MANUFACTURING_ENGINEERING: 1 },
  "workshop-making":  { MANUFACTURING_ENGINEERING: 4, CONSTRUCTION_TRADES: 3 },
  "health-social": { SOCIAL_CARE_COMMUNITY: 4, HEALTHCARE_LIFE_SCIENCES: 3, EDUCATION_TRAINING: 2, PUBLIC_SERVICE_SAFETY: 2 },
  drama:           { CREATIVE_MEDIA: 4, EDUCATION_TRAINING: 2, SALES_MARKETING: 1 },
  "food-tech":     { HOSPITALITY_TOURISM: 4, HEALTHCARE_LIFE_SCIENCES: 2, MANUFACTURING_ENGINEERING: 2, CREATIVE_MEDIA: 1 },
  "media-studies": { CREATIVE_MEDIA: 4, SALES_MARKETING: 3, TECHNOLOGY_IT: 1 },
};

export const SUBJECT_CAREER_BOOSTS: Record<string, string[]> = {
  biology: [
    "registered-nurse", "nurse-practitioner", "midwife", "mental-health-nurse",
    "dietitian", "nutritionist", "sports-nutritionist",
    "epidemiologist", "public-health-specialist", "clinical-researcher",
    "food-scientist", "food-technologist", "food-safety-inspector",
    "occupational-therapist", "speech-language-therapist",
    "sports-physiotherapist", "sports-scientist", "sports-therapist",
    "emt", "veterinarian", "marine-biologist", "environmental-scientist",
  ],
  chemistry: [
    "pharmacist", "pharmacy-technician", "food-scientist", "food-technologist",
    "food-product-developer", "quality-assurance-food", "food-safety-inspector",
    "clinical-researcher", "laboratory-technician", "environmental-scientist",
    "materials-engineer", "chemical-engineer", "brewer",
  ],
  physics: [
    "electrical-engineer", "mechanical-engineer", "civil-engineer",
    "aerospace-engineer", "robotics-engineer", "network-engineer",
    "cloud-engineer", "systems-engineer", "solutions-architect",
    "radiographer", "sonographer", "audio-engineer", "sound-engineer",
    // Military — engineering, weapons systems, piloting
    "military-pilot", "drone-operator-uav", "weapons-specialist",
    "combat-engineer", "artillery-officer",
  ],
  math: [
    "data-analyst", "data-scientist", "data-engineer", "actuary",
    "financial-analyst", "investment-banker", "accountant", "auditor",
    "software-developer", "machine-learning-engineer", "ai-engineer",
    "quantitative-analyst", "statistician", "economist",
  ],
  computing: [
    // Core software & web
    "software-developer", "frontend-developer", "backend-developer",
    "full-stack-engineer", "mobile-developer", "game-developer",
    // Data & AI
    "data-analyst", "data-scientist", "data-engineer",
    "machine-learning-engineer", "ai-engineer", "ai-researcher",
    "computer-vision-engineer", "nlp-engineer",
    // Infra & ops
    "devops-engineer", "cloud-engineer", "site-reliability-engineer",
    "systems-engineer", "network-engineer", "platform-engineer",
    // Security
    "cybersecurity-analyst", "security-engineer", "security-architect",
    // Design / product / QA
    "ux-designer", "ui-designer", "qa-engineer", "test-automation-engineer",
    // Support / entry level
    "it-support-specialist", "database-administrator",
    // Emerging
    "blockchain-developer", "ar-vr-developer", "robotics-engineer",
  ],
  music: [
    // Playing & performance
    "musician", "vocalist", "dj", "session-musician", "orchestra-member", "busker",
    // Learning & teaching
    "music-teacher", "private-music-tutor", "music-lecturer", "vocal-coach", "music-therapist",
    // Making & production
    "music-producer", "songwriter", "composer", "audio-engineer", "beatmaker",
    "film-composer", "game-composer", "sound-engineer",
    // Industry & supporting
    "music-manager", "talent-agent", "ar-rep", "music-promoter", "tour-manager",
    "sound-technician", "music-journalist", "music-content-creator",
    "music-licensing-specialist",
  ],
  "food-tech": [
    // Cooking & hospitality
    "chef", "pastry-chef", "baker", "butcher", "barista", "sommelier",
    "catering-manager", "restaurant-manager", "restaurant-owner",
    "kitchen-porter", "fast-food-crew",
    // Food science & technology
    "food-scientist", "food-technologist", "food-product-developer",
    "food-safety-inspector", "quality-assurance-food",
    // Nutrition & health
    "dietitian", "nutritionist", "sports-nutritionist",
    // Production & craft
    "brewer",
    // Food media
    "food-blogger",
  ],
  pe: [
    // Fitness & training
    "personal-trainer", "fitness-instructor", "strength-conditioning-coach",
    "yoga-instructor", "swim-instructor", "athletic-trainer",
    // Coaching & performance
    "sports-coach", "assistant-coach", "professional-athlete",
    "sports-scientist", "performance-analyst", "sports-analyst",
    // Therapy & rehab
    "sports-physiotherapist", "sports-therapist", "sports-psychologist",
    // Outdoor & adventure
    "outdoor-instructor",
    // Sport industry
    "sports-manager", "team-manager", "sports-agent", "talent-scout",
    "scouting-analyst", "referee", "umpire",
    "sports-event-manager", "sports-event-coordinator",
    // Sport media
    "sports-journalist", "sports-commentator", "sports-broadcaster",
    "sports-photographer",
    // Cross-category sport careers
    "sports-nutritionist", "sports-marketing-manager", "nutritionist",
    // Esports
    "esports-player", "esports-coach", "esports-analyst",
    // Military — physical fitness is core
    "soldier", "marine", "special-forces-operator", "search-and-rescue-operator",
  ],
  english: [
    "journalist", "copywriter", "content-writer", "editor", "author",
    "communications-specialist", "public-relations-specialist",
    "primary-teacher", "secondary-teacher", "university-lecturer",
    "speech-language-therapist", "translator", "interpreter",
    "social-media-manager", "marketing-manager",
  ],
  history: [
    "primary-teacher", "secondary-teacher", "university-lecturer",
    "lawyer", "judge", "diplomat", "politician",
    "journalist", "author", "archivist", "gallery-curator",
    // Military — strategy, leadership, geopolitics
    "military-officer", "infantry-officer", "military-intelligence-analyst",
    "naval-officer",
  ],
  psychology: [
    // "clinical-psychologist" / "therapist" are now specialism branches of
    // "psychologist" (see career-specialisms.ts), not standalone careers — the
    // base "psychologist" id already carries the boost.
    "psychologist", "counsellor",
    "mental-health-nurse", "social-worker", "youth-worker",
    "special-needs-educator", "hr-specialist", "hr-manager",
    "sports-psychologist", "occupational-therapist",
    "ux-designer", "ux-researcher",
  ],
  "health-social": [
    "social-worker", "youth-worker", "support-worker", "care-assistant",
    "community-worker", "mental-health-nurse", "counsellor",
    "occupational-therapist", "speech-language-therapist",
    "special-needs-educator", "kindergarten-teacher", "midwife",
    "registered-nurse", "emt", "public-health-specialist",
  ],
  business: [
    "accountant", "auditor", "financial-analyst", "investment-banker",
    "management-consultant", "project-manager", "it-project-manager",
    "hr-specialist", "hr-manager", "operations-manager",
    "marketing-manager", "sales-manager", "entrepreneur",
    "real-estate-agent", "property-manager", "logistics-manager",
  ],
  art: [
    "graphic-designer", "illustrator", "animator", "ux-designer", "ui-designer",
    "interior-designer", "architect", "photographer", "film-editor",
    "art-teacher", "art-therapist", "tattoo-artist", "fashion-designer",
    "set-designer", "gallery-curator",
  ],
  drama: [
    "actor", "director", "theatre-producer", "casting-director",
    "drama-teacher", "drama-therapist", "voice-actor",
    "tv-presenter", "radio-presenter", "event-manager",
    "communications-specialist", "public-relations-specialist",
  ],
  "media-studies": [
    "journalist", "tv-producer", "film-director", "video-editor",
    "social-media-manager", "content-creator", "photographer",
    "public-relations-specialist", "communications-specialist",
    "marketing-manager", "advertising-creative",
    "sports-broadcaster", "sports-commentator", "sports-journalist",
  ],
  geography: [
    "urban-planner", "environmental-scientist", "surveyor",
    "logistics-manager", "supply-chain-analyst", "travel-agent",
    "tour-guide", "park-ranger", "cartographer",
    "civil-engineer", "transport-planner",
    // Military — navigation, terrain, logistics
    "military-officer", "soldier", "naval-officer", "logistics-officer",
    "search-and-rescue-operator",
  ],
  languages: [
    "translator", "interpreter", "diplomat", "travel-agent",
    "tour-guide", "flight-attendant", "hotel-manager",
    "primary-teacher", "secondary-teacher", "university-lecturer",
    "journalist", "foreign-correspondent",
    "import-export-specialist", "international-sales-manager",
  ],
};

export const INTEREST_CAREER_BOOSTS: Record<string, string[]> = {
  coding: [
    "software-developer", "game-developer", "mobile-developer", "frontend-developer",
    "backend-developer", "full-stack-engineer", "data-scientist", "ai-engineer",
    "cybersecurity-analyst", "devops-engineer", "robotics-engineer",
  ],
  gaming: [
    "game-developer", "esports-player", "esports-coach", "esports-analyst",
    "game-designer", "ux-designer", "streamer", "content-creator",
    "sports-commentator", "ar-vr-developer",
  ],
  cooking: [
    "chef", "pastry-chef", "baker", "restaurant-manager", "catering-manager",
    "food-scientist", "food-technologist", "food-product-developer",
    "nutritionist", "dietitian", "food-blogger", "brewer", "sommelier",
  ],
  "fixing-things": [
    "mechanic", "electrician", "plumber", "carpenter", "welder",
    "hvac-technician", "automotive-engineer", "maintenance-technician",
    "robotics-engineer", "air-force-technician", "combat-engineer",
  ],
  adventure: [
    "outdoor-instructor", "search-and-rescue-operator", "pilot", "military-pilot",
    "marine", "soldier", "special-forces-operator", "park-ranger",
    "firefighter", "paramedic", "emt", "ship-captain", "dive-instructor",
  ],
  animals: [
    "veterinarian", "veterinary-assistant", "marine-biologist", "zoologist",
    "animal-behaviourist", "dog-trainer", "wildlife-conservationist",
    "park-ranger", "farm-manager",
  ],
  drawing: [
    "graphic-designer", "illustrator", "animator", "ux-designer", "ui-designer",
    "architect", "interior-designer", "fashion-designer", "tattoo-artist",
    "art-teacher", "set-designer", "concept-artist",
  ],
  "sport-fitness": [
    "personal-trainer", "sports-coach", "fitness-instructor", "professional-athlete",
    "sports-physiotherapist", "sports-scientist", "athletic-trainer",
    "strength-conditioning-coach", "yoga-instructor", "swim-instructor",
    "outdoor-instructor", "sports-psychologist",
  ],
  "reading-writing": [
    "journalist", "author", "editor", "copywriter", "content-writer",
    "translator", "lawyer", "secondary-teacher", "university-lecturer",
    "librarian", "publisher", "communications-specialist",
  ],
  science: [
    "clinical-researcher", "laboratory-technician", "pharmacist",
    "food-scientist", "environmental-scientist", "marine-biologist",
    "epidemiologist", "data-scientist", "biomedical-scientist",
    "materials-engineer", "chemical-engineer",
  ],
  building: [
    "carpenter", "civil-engineer", "architect", "structural-engineer",
    "construction-manager", "bricklayer", "electrician", "plumber",
    "surveyor", "urban-planner", "interior-designer",
  ],
  performing: [
    "actor", "musician", "vocalist", "dj", "dancer", "comedian",
    "tv-presenter", "radio-presenter", "voice-actor", "stunt-performer",
    "drama-teacher", "director", "theatre-producer",
  ],
  "helping-people": [
    "registered-nurse", "social-worker", "counsellor", "psychologist",
    "youth-worker", "support-worker", "midwife", "emt", "paramedic",
    "firefighter", "police-officer", "teacher", "primary-teacher",
    "speech-language-therapist", "occupational-therapist",
  ],
  "money-business": [
    "accountant", "financial-analyst", "investment-banker", "entrepreneur",
    "management-consultant", "real-estate-agent", "sales-manager",
    "marketing-manager", "project-manager", "actuary",
  ],
  "photo-film": [
    "photographer", "film-director", "video-editor", "cinematographer",
    "tv-producer", "camera-operator", "sports-photographer",
    "content-creator", "film-editor", "documentary-maker",
  ],
  travel: [
    "pilot", "flight-attendant", "travel-agent", "tour-guide",
    "diplomat", "ship-captain", "hotel-manager", "foreign-correspondent",
    "import-export-specialist", "international-sales-manager",
  ],
  "music-making": [
    "musician", "music-producer", "songwriter", "composer", "audio-engineer",
    "sound-engineer", "dj", "session-musician", "film-composer",
    "music-teacher", "music-therapist", "vocal-coach",
  ],
  fashion: [
    "fashion-designer", "stylist", "textile-designer", "fashion-buyer",
    "fashion-journalist", "visual-merchandiser", "model",
    "photographer", "graphic-designer", "interior-designer",
  ],
  environment: [
    "environmental-scientist", "marine-biologist", "wildlife-conservationist",
    "park-ranger", "urban-planner", "sustainability-consultant",
    "environmental-engineer", "renewable-energy-engineer",
    "farm-manager", "forestry-worker",
  ],
  // Retired from the Discovery picker (use the Careers → Military category to
  // browse these). Kept so users who saved this interest before it was removed
  // still get sensible matches until they next update their preferences.
  "military-defence": [
    "military-officer", "soldier", "infantry-officer", "special-forces-operator",
    "military-pilot", "naval-officer", "marine", "combat-engineer",
    "military-intelligence-analyst", "cyber-warfare-specialist",
    "drone-operator-uav", "search-and-rescue-operator", "military-police",
    "weapons-specialist", "eod-technician",
  ],
};

export function measureSignalStrength(prefs: DiscoveryPreferences | null | undefined): number {
  if (!prefs) return 0;
  let dims = 0;
  // Subject count matters: 3+ subjects is a meaningfully stronger signal
  // than 1–2 and should unlock more radar results.
  const subjectCount = prefs.subjects?.length ?? 0;
  if (subjectCount >= 3) dims += 1.5;
  else if (subjectCount >= 2) dims += 1;
  else if (subjectCount === 1) dims += 0.5;
  if (prefs.workStyles && prefs.workStyles.length > 0) dims++;
  if (prefs.peoplePref) dims++;
  return dims;
}

// ── Pure category-aware resolvers ──────────────────────────────────
// These take the career's category as an argument instead of looking it up
// from the catalog, so the matching engine / radar can call them without
// importing the 740KB CAREER_PATHWAYS const. The career-pathways.ts wrappers
// (getCareerWorkSetting etc.) pass findCareerCategory(career.id) — identical
// behaviour; client callers pass the category from the fetched catalog.

/** Work setting: explicit field → per-id override → category default → mixed. */
export function workSettingFor(
  career: Career,
  category: CareerCategory | null | undefined,
): WorkSetting {
  if (career.workSetting) return career.workSetting;
  if (WORK_SETTING_OVERRIDES[career.id]) return WORK_SETTING_OVERRIDES[career.id];
  return category ? WORK_SETTING_DEFAULTS[category] : "mixed";
}

/** People intensity: explicit field → per-id override → category default → medium. */
export function peopleIntensityFor(
  career: Career,
  category: CareerCategory | null | undefined,
): PeopleIntensity {
  if (career.peopleIntensity) return career.peopleIntensity;
  if (PEOPLE_INTENSITY_OVERRIDES[career.id]) return PEOPLE_INTENSITY_OVERRIDES[career.id];
  return category ? PEOPLE_INTENSITY_DEFAULTS[category] : "medium";
}

/** Sector: explicit field → category default → mixed. */
export function sectorFor(
  career: Career | null | undefined,
  category: CareerCategory | null | undefined,
): "public" | "private" | "mixed" {
  if (career?.sector) return career.sector;
  return (category && CATEGORY_SECTOR_DEFAULTS[category]) ?? "mixed";
}
