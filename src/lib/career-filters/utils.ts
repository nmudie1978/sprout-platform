/**
 * Career Filter Utilities
 * Utility functions for parsing, formatting, and filtering career data
 */

import type { Career } from "@/lib/career-pathways";
import type {
  EducationLevel,
  CareerNature,
  SalaryRange,
  EDUCATION_LEVEL_LABELS,
  CAREER_NATURE_LABELS,
} from "./types";

/**
 * Parse salary string like "550,000 - 900,000 kr/year" to { min: 550, max: 900 }
 */
export function parseSalaryRange(salaryString: string): SalaryRange | null {
  // Handle variable salaries like "Variable - from loss to millions"
  if (salaryString.toLowerCase().includes("variable")) {
    return null;
  }

  // Match pattern: "X,XXX,XXX - Y,YYY,YYY kr/year" or similar
  const matches = salaryString.match(/[\d,]+/g);
  if (!matches || matches.length < 2) return null;

  const parseNumber = (str: string) =>
    parseInt(str.replace(/,/g, ""), 10) / 1000; // Convert to thousands

  const min = parseNumber(matches[0]);
  const max = parseNumber(matches[1]);

  if (isNaN(min) || isNaN(max)) return null;

  return { min, max };
}

/**
 * Get the min and max salary bounds across all careers
 */
export function getSalaryBounds(careers: Career[]): SalaryRange {
  let minSalary = Infinity;
  let maxSalary = 0;

  for (const career of careers) {
    const range = parseSalaryRange(career.avgSalary);
    if (range) {
      minSalary = Math.min(minSalary, range.min);
      maxSalary = Math.max(maxSalary, range.max);
    }
  }

  // Default bounds if no valid salaries found
  if (minSalary === Infinity) minSalary = 300;
  if (maxSalary === 0) maxSalary = 1500;

  // Round to nearest 25k
  minSalary = Math.floor(minSalary / 25) * 25;
  maxSalary = Math.ceil(maxSalary / 25) * 25;

  return { min: minSalary, max: maxSalary };
}

/**
 * Format salary value (in thousands) for display
 */
export function formatSalary(valueInThousands: number): string {
  if (valueInThousands >= 1000) {
    return `${(valueInThousands / 1000).toFixed(1)}M`;
  }
  return `${valueInThousands}k`;
}

/**
 * Categorize education path text to EducationLevel
 */
export function categorizeEducation(educationPath: string): EducationLevel {
  const lower = educationPath.toLowerCase();

  if (
    lower.includes("phd") ||
    lower.includes("doctorate") ||
    lower.includes("6+ years")
  ) {
    return "doctorate";
  }

  if (lower.includes("master") || lower.includes("5 years")) {
    return "master";
  }

  if (lower.includes("bachelor") || lower.includes("3 years")) {
    return "bachelor";
  }

  if (
    lower.includes("vocational") ||
    lower.includes("apprenticeship") ||
    lower.includes("fagbrev") ||
    lower.includes("certification")
  ) {
    return "vocational";
  }

  if (
    lower.includes("no formal") ||
    lower.includes("on-the-job") ||
    lower.includes("training provided") ||
    lower.includes("any background")
  ) {
    return "no-formal";
  }

  // Default to bachelor if unclear
  return "bachelor";
}

/**
 * Get all unique skills from all careers
 */
export function getAllSkills(careers: Career[]): string[] {
  const skillSet = new Set<string>();

  for (const career of careers) {
    for (const skill of career.keySkills) {
      skillSet.add(skill.toLowerCase());
    }
  }

  return Array.from(skillSet).sort();
}

/**
 * Get skill suggestions for autocomplete
 */
export function getSkillSuggestions(
  input: string,
  allSkills: string[],
  selectedSkills: string[]
): string[] {
  if (!input.trim()) return [];

  const query = input.toLowerCase();
  const selectedLower = new Set(selectedSkills.map((s) => s.toLowerCase()));

  return allSkills
    .filter(
      (skill) => skill.includes(query) && !selectedLower.has(skill)
    )
    .slice(0, 10);
}

/**
 * Nature-to-keyword mapping for career matching
 */
const NATURE_KEYWORDS: Record<CareerNature, string[]> = {
  "hands-on": [
    "install",
    "repair",
    "build",
    "physical",
    "manual",
    "equipment",
    "tools",
    "maintenance",
    "operate",
    "construct",
    "assemble",
    "vehicle",
    "drive",
    "cook",
    "craft",
  ],
  analytical: [
    "analyze",
    "data",
    "research",
    "statistics",
    "model",
    "financial",
    "audit",
    "investigate",
    "evaluate",
    "assess",
    "problem-solving",
    "mathematical",
    "logical",
    "strategy",
    "metrics",
  ],
  "people-focused": [
    "patient",
    "customer",
    "client",
    "communication",
    "team",
    "teach",
    "support",
    "care",
    "counsel",
    "advise",
    "service",
    "hospitality",
    "collaborate",
    "negotiate",
  ],
  creative: [
    "design",
    "creative",
    "art",
    "visual",
    "content",
    "brand",
    "style",
    "aesthetic",
    "marketing",
    "campaign",
    "innovation",
    "photography",
    "video",
    "music",
    "writing",
    "storytelling",
  ],
  technical: [
    "software",
    "programming",
    "code",
    "system",
    "network",
    "database",
    "cloud",
    "security",
    "IT",
    "technical",
    "engineering",
    "automation",
    "architecture",
    "infrastructure",
    "algorithm",
    "digital",
  ],
  "outdoors-active": [
    "outdoor",
    "field",
    "nature",
    "garden",
    "landscape",
    "environmental",
    "farm",
    "forest",
    "park",
    "wildlife",
    "survey",
    "inspect",
    "sport",
    "marine",
    "construction site",
    "fitness",
    "animal",
    "conservation",
  ],
  "structured-organised": [
    "project manage",
    "plan",
    "schedule",
    "deadline",
    "budget",
    "coordinate",
    "organis",
    "process",
    "methodology",
    "compliance",
    "audit",
    "quality",
    "framework",
    "roadmap",
    "timeline",
    "deliverable",
    "scope",
    "agile",
  ],
  leadership: [
    "leadership",
    "lead team",
    "manage team",
    "director",
    "chief",
    "executive",
    "mentor",
    "coaching",
    "strategic",
    "vision",
    "decision-making",
    "delegate",
    "senior manage",
    "cross-functional",
  ],
};

/**
 * Check if a career matches a given nature based on keywords
 */
export function matchesCareerNature(
  career: Career,
  nature: CareerNature
): boolean {
  const keywords = NATURE_KEYWORDS[nature];
  const searchText = [
    career.title,
    career.description,
    ...career.keySkills,
    ...career.dailyTasks,
  ]
    .join(" ")
    .toLowerCase();

  return keywords.some((keyword) => searchText.includes(keyword.toLowerCase()));
}

/**
 * Check if career salary range overlaps with filter range
 */
export function salaryOverlaps(
  career: Career,
  filterRange: SalaryRange
): boolean {
  const careerRange = parseSalaryRange(career.avgSalary);
  if (!careerRange) return true; // Include careers with variable/unknown salaries

  // Check if ranges overlap
  return careerRange.min <= filterRange.max && careerRange.max >= filterRange.min;
}

/**
 * Check if career matches education level filter
 */
export function matchesEducationLevel(
  career: Career,
  levels: EducationLevel[]
): boolean {
  if (levels.length === 0) return true;

  const careerLevel = categorizeEducation(career.educationPath);
  return levels.includes(careerLevel);
}

/**
 * Check if career has all specified skills
 */
export function hasAllSkills(career: Career, skills: string[]): boolean {
  if (skills.length === 0) return true;

  const careerSkillsLower = career.keySkills.map((s) => s.toLowerCase());

  return skills.every((skill) =>
    careerSkillsLower.some(
      (careerSkill) =>
        careerSkill.includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(careerSkill)
    )
  );
}

/**
 * Check if career matches any of the specified natures
 */
export function matchesAnyNature(
  career: Career,
  natures: CareerNature[]
): boolean {
  if (natures.length === 0) return true;

  return natures.some((nature) => matchesCareerNature(career, nature));
}
