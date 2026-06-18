import bucketsData from "@/lib/education/data/discipline-buckets.json";
import mapData from "@/lib/education/data/career-discipline-map.json";
import { getCareersForDiscipline } from "./degree-to-careers";

export interface FieldOption {
  id: string;
  label: string;
  aliases: string[];
  /** Curated career ids for synthetic fields that span multiple discipline buckets. */
  careerIds?: string[];
}

// Build a lookup: disciplineId -> label (from the buckets JSON)
const bucketLabelMap = new Map<string, string>(
  (bucketsData as { buckets: { id: string; label: string }[] }).buckets.map((b) => [b.id, b.label]),
);

// Only include disciplines that actually appear as values in the career-discipline map
const usedDisciplineIds = new Set(
  Object.values((mapData as { map: Record<string, string> }).map),
);

// Curated alias lists per discipline id (lowercase)
const ALIASES: Record<string, string[]> = {
  medicine: ["medicine", "medical", "mbbs", "md", "doctor", "clinical medicine"],
  "nursing-allied-health": [
    "nursing",
    "nurse",
    "physiotherapy",
    "radiography",
    "paramedic",
    "allied health",
    "occupational therapy",
    "nutrition",
  ],
  dentistry: ["dentistry", "dental", "dentist", "oral health", "bds"],
  pharmacy: ["pharmacy", "pharmacology", "pharmaceutical", "pharmacist", "drug science"],
  veterinary: ["veterinary", "vet", "animal medicine", "animal science", "zoomed", "veterinary medicine"],
  psychology: ["psychology", "psych", "behavioural science", "mental health"],
  "public-health": ["public health", "epidemiology", "community health", "health promotion"],
  "biology-life-sciences": [
    "biology",
    "life sciences",
    "biochemistry",
    "bioscience",
    "microbiology",
    "biotechnology",
    "biomedical science",
    "zoology",
  ],
  chemistry: ["chemistry", "chemical science", "organic chemistry", "analytical chemistry"],
  "environmental-earth-science": [
    "environmental science",
    "earth science",
    "ecology",
    "environmental studies",
    "climate science",
    "geography",
  ],
  "mathematics-physics": [
    "mathematics",
    "maths",
    "physics",
    "math",
    "theoretical physics",
    "applied mathematics",
    "statistics",
  ],
  "mechanical-engineering": [
    "mechanical engineering",
    "mechanical",
    "aerospace",
    "automotive",
    "mechatronics",
  ],
  "electrical-engineering": [
    "electrical engineering",
    "electrical",
    "electronics",
    "power systems",
    "electronic engineering",
  ],
  "civil-engineering": [
    "civil engineering",
    "civil",
    "structural engineering",
    "construction engineering",
    "infrastructure",
  ],
  "chemical-process-engineering": [
    "chemical engineering",
    "process engineering",
    "chemical process",
    "chemical plant",
    "industrial chemistry",
  ],
  "computer-science-software": [
    "computer science",
    "cs",
    "software",
    "software engineering",
    "informatics",
    "it",
    "programming",
    "computer engineering",
    "information systems",
    "web development",
  ],
  "data-science-ai": [
    "data science",
    "artificial intelligence",
    "ai",
    "machine learning",
    "ml",
    "data analytics",
    "big data",
  ],
  cybersecurity: [
    "cybersecurity",
    "cyber security",
    "information security",
    "network security",
    "infosec",
  ],
  "telecom-network": [
    "telecommunications",
    "telecom",
    "networking",
    "network engineering",
    "wireless",
    "communications engineering",
  ],
  architecture: ["architecture", "architectural", "building design", "architect"],
  "urban-planning": [
    "urban planning",
    "town planning",
    "city planning",
    "spatial planning",
    "urban design",
  ],
  law: ["law", "llb", "legal", "jurisprudence", "legal studies", "solicitor", "barrister"],
  "criminology-policing": [
    "criminology",
    "policing",
    "criminal justice",
    "forensic science",
    "forensics",
  ],
  "business-management": [
    "business",
    "management",
    "mba",
    "administration",
    "business administration",
    "bba",
    "international business",
    "project management",
  ],
  "economics-finance": [
    "economics",
    "finance",
    "econ",
    "financial economics",
    "banking",
    "fintech",
    "actuarial science",
  ],
  accounting: [
    "accounting",
    "accountancy",
    "audit",
    "auditing",
    "financial accounting",
    "cpa",
    "acca",
  ],
  "marketing-communications": [
    "marketing",
    "communications",
    "advertising",
    "pr",
    "public relations",
    "brand management",
  ],
  "human-resources": [
    "human resources",
    "hr",
    "people management",
    "organisational behaviour",
    "talent management",
    "human resource management",
  ],
  "education-teaching": [
    "education",
    "teaching",
    "pedagogy",
    "teacher training",
    "pgce",
    "early childhood",
  ],
  "social-work": [
    "social work",
    "social care",
    "community work",
    "welfare",
    "social services",
    "sociology",
  ],
  "humanities-languages": [
    "humanities",
    "languages",
    "linguistics",
    "literature",
    "english",
    "modern languages",
    "translation",
    "anthropology",
    "english literature",
    "history",
    "philosophy",
  ],
  "history-philosophy": [
    "history",
    "philosophy",
    "classics",
    "ethics",
    "ancient history",
    "intellectual history",
  ],
  "political-science-ir": [
    "political science",
    "politics",
    "international relations",
    "ir",
    "diplomacy",
    "public policy",
  ],
  "journalism-media": [
    "journalism",
    "media",
    "media studies",
    "broadcasting",
    "digital media",
    "news",
  ],
  "creative-arts-design": [
    "creative arts",
    "design",
    "graphic design",
    "fine art",
    "product design",
    "visual arts",
    "illustration",
  ],
  "music-performing-arts": [
    "music",
    "performing arts",
    "drama",
    "theatre",
    "dance",
    "conservatoire",
  ],
  "film-animation": [
    "film",
    "animation",
    "filmmaking",
    "cinematography",
    "visual effects",
    "vfx",
    "screenwriting",
  ],
  "sport-science": [
    "sport science",
    "sports science",
    "kinesiology",
    "exercise science",
    "physical education",
    "pe",
  ],
  "tourism-hospitality": [
    "tourism",
    "hospitality",
    "hotel management",
    "travel",
    "events management",
  ],
  culinary: [
    "culinary",
    "culinary arts",
    "cooking",
    "gastronomy",
    "chef",
    "food and beverage",
  ],
  "agriculture-food": [
    "agriculture",
    "food science",
    "agronomy",
    "food technology",
    "horticulture",
    "agricultural science",
  ],
  maritime: [
    "maritime",
    "nautical science",
    "marine engineering",
    "shipping",
    "naval architecture",
    "seafaring",
  ],
  aviation: [
    "aviation",
    "flight",
    "pilot",
    "aerospace engineering",
    "aeronautics",
    "atpl",
  ],
  "logistics-supplychain": [
    "logistics",
    "supply chain",
    "operations management",
    "procurement",
    "supply chain management",
  ],
  "geosciences-energy": [
    "geosciences",
    "geology",
    "geophysics",
    "petroleum engineering",
    "energy",
    "renewable energy",
  ],
  "public-administration": [
    "public administration",
    "government",
    "public sector",
    "public policy",
    "public service",
  ],
  "military-defence": [
    "military",
    "defence",
    "defense",
    "armed forces",
    "security studies",
    "military science",
  ],
  "real-estate": [
    "real estate",
    "property",
    "land management",
    "property development",
    "surveying",
  ],
  "vocational-trades": [
    "vocational",
    "trades",
    "apprenticeship",
    "skilled trades",
    "technical training",
    "plumbing",
    "electrician",
    "carpentry",
  ],
  "beauty-wellness": [
    "beauty",
    "wellness",
    "cosmetology",
    "hairdressing",
    "skincare",
    "aesthetics",
    "spa",
  ],
};

// Discipline-bucket-backed options (careerIds resolved via the discipline map).
const disciplineOptions: FieldOption[] = [...usedDisciplineIds].map((id) => ({
  id,
  label: bucketLabelMap.get(id) ?? id,
  aliases: ALIASES[id] ?? [],
}));

/**
 * Synthetic fields that span multiple discipline buckets and therefore carry an
 * explicit curated career list rather than mapping to a single discipline.
 */
const syntheticOptions: FieldOption[] = [
  {
    id: "robotics",
    label: "Robotics & Autonomous Systems",
    aliases: [
      "robotics",
      "robotics engineering",
      "robotics & ai",
      "autonomous systems",
      "autonomous vehicles engineering",
      "autonomous vehicles",
      "autonomous vehicle",
      "mechatronics",
      "mechatronics engineering",
      "control systems engineering",
      "embedded systems engineering",
      "automation engineering",
      "intelligent systems",
      "human-robot interaction",
      "cyber-physical systems",
      "systems engineering",
      "machine learning",
    ],
    careerIds: [
      "robotics-engineer",
      "robotics-software-engineer",
      "space-robotics-engineer",
      "autonomous-systems-engineer",
      "autonomous-vehicle-engineer",
      "human-robot-interaction-specialist",
      "automation-engineer",
      "automation-technician",
      "ai-automation-engineer",
      "embedded-developer",
      "systems-engineer",
      "drone-systems-engineer",
      "drone-operator-uav",
    ],
  },
];

/**
 * One entry per discipline id that actually appears in the career-discipline map,
 * plus synthetic cross-bucket fields. Sorted by label A–Z.
 */
export const FIELD_OPTIONS: FieldOption[] = [...disciplineOptions, ...syntheticOptions].sort(
  (a, b) => a.label.localeCompare(b.label),
);

/**
 * Career ids for a field option. Synthetic fields use their curated `careerIds`;
 * discipline-backed fields resolve via the career-discipline map.
 */
export function getCareersForField(fieldId: string): string[] {
  const option = FIELD_OPTIONS.find((o) => o.id === fieldId);
  if (option?.careerIds) return option.careerIds;
  return getCareersForDiscipline(fieldId);
}

/**
 * Search field options by query.
 * - Empty / whitespace-only query → all options sorted A–Z.
 * - Non-empty → options whose label OR any alias contains the query,
 *   label-prefix matches first, then A–Z within each tier.
 */
export function searchFields(query: string): FieldOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return FIELD_OPTIONS;

  const prefixMatches: FieldOption[] = [];
  const substringMatches: FieldOption[] = [];

  for (const option of FIELD_OPTIONS) {
    const labelLower = option.label.toLowerCase();
    const labelMatches = labelLower.includes(q);
    const aliasMatches = option.aliases.some((a) => a.includes(q));

    if (!labelMatches && !aliasMatches) continue;

    if (labelLower.startsWith(q)) {
      prefixMatches.push(option);
    } else {
      substringMatches.push(option);
    }
  }

  // Each tier is already in A–Z order (FIELD_OPTIONS is pre-sorted)
  return [...prefixMatches, ...substringMatches];
}
