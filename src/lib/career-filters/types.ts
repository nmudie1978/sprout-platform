/**
 * Career Filter Types
 * Type definitions for the career filtering system
 */

export type EducationLevel =
  | "no-formal"
  | "vocational"
  | "bachelor"
  | "master"
  | "doctorate";

export type CareerNature =
  | "hands-on"
  | "analytical"
  | "people-focused"
  | "creative"
  | "technical"
  | "outdoors-active"
  | "structured-organised"
  | "leadership";

export type SectorFilter = "all" | "public" | "private";
export type AcademicDemandFilter = "all" | "low" | "moderate" | "strong" | "very-strong";

export interface SalaryRange {
  min: number; // in thousands (kr)
  max: number; // in thousands (kr)
}

export interface CareerFilterState {
  // Primary filters
  category: string;
  searchQuery: string;
  growthFilter: string;

  // Sector filter
  sector: SectorFilter;

  // Academic demand filter
  academicDemand: AcademicDemandFilter;

  // Advanced filters
  salaryRange: SalaryRange | null;
  educationLevels: EducationLevel[];
  skills: string[];
  careerNatures: CareerNature[];
}

export interface ActiveFilterChip {
  type:
    | "category"
    | "search"
    | "growth"
    | "sector"
    | "academic"
    | "salary"
    | "education"
    | "skill"
    | "nature";
  label: string;
  value: string | EducationLevel | CareerNature | SalaryRange;
}

export const DEFAULT_FILTER_STATE: CareerFilterState = {
  category: "ALL",
  searchQuery: "",
  growthFilter: "all",
  sector: "all",
  academicDemand: "all",
  salaryRange: null,
  educationLevels: [],
  skills: [],
  careerNatures: [],
};

export const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
  "no-formal": "No Formal Education",
  vocational: "Vocational Training",
  bachelor: "Bachelor's Degree",
  master: "Master's Degree",
  doctorate: "Doctorate/PhD",
};

export const CAREER_NATURE_LABELS: Record<CareerNature, string> = {
  "hands-on": "Hands-on",
  analytical: "Analytical",
  "people-focused": "People-focused",
  creative: "Creative",
  technical: "Technical",
  "outdoors-active": "Outdoors & Active",
  "structured-organised": "Structured & Organised",
  leadership: "Leadership",
};

export const CAREER_NATURE_EMOJIS: Record<CareerNature, string> = {
  "hands-on": "🔧",
  analytical: "📊",
  "people-focused": "👥",
  creative: "🎨",
  technical: "💻",
  "outdoors-active": "🌿",
  "structured-organised": "📋",
  leadership: "🎯",
};
