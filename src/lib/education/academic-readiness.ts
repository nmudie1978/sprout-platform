/**
 * Career Readiness Framework
 *
 * Unified model for academic demand, subject alignment, pathway type,
 * and competitiveness. Derives structured readiness signals from
 * existing career data (career-requirements.json + career-pathways.ts)
 * so there is nothing extra to maintain.
 *
 * This is the SINGLE SOURCE OF TRUTH for readiness guidance. All
 * consumers — Discover hints, Understand detail, Explore Careers
 * filters, Career Radar — import from here.
 *
 * Design principles:
 *   - Supportive, not gatekeeping. Signals are indicative, not absolute.
 *   - Grades are ONE factor alongside subjects, pathway, and context.
 *   - Variability is always acknowledged — requirements differ by
 *     institution, year, and route.
 *   - Norwegian 1–6 scale is used as context, never as a hard gate.
 */

import {
  getCareerRequirements,
  type CareerRequirements,
} from "@/lib/education";
import {
  parseGradeRequirement,
  type GradeRequirement,
} from "./parse-grade-requirement";
import type { Career } from "@/lib/career-pathways";

// ── Types ──────────────────────────────────────────────────────────

export type AcademicDemand = "low" | "moderate" | "strong" | "very-strong";

export type PathwayType =
  | "vocational"
  | "bachelor"
  | "master"
  | "doctorate"
  | "professional-degree"
  | "mixed"
  | "entry-level"
  | "licence-based";

export type Competitiveness = "low" | "moderate" | "high" | "very-high";

export interface SubjectRequirement {
  name: string;
  importance: "essential" | "important" | "helpful";
}

export interface CareerReadiness {
  /** Overall academic demand signal */
  demand: AcademicDemand;
  /** Parsed grade range on the Norwegian 1–6 scale */
  grade: GradeRequirement;
  /** Primary pathway type */
  pathwayType: PathwayType;
  /** How competitive entry typically is */
  competitiveness: Competitiveness;
  /** Structured subject requirements */
  subjects: SubjectRequirement[];
  /** One-line Discover hint — calm, realistic */
  discoverHint: string;
  /** Whether there is a university/degree gate */
  requiresDegree: boolean;
  /** Acknowledges that requirements vary */
  variabilityNote: string;
  /** Alternative routes if any */
  alternativePathways: string[];
}

// Keep the old name as an alias so existing imports don't break
export type AcademicProfile = CareerReadiness;

// ── Derivation ─────────────────────────────────────────────────────

function derivePathwayType(
  career: Career,
  reqs: CareerRequirements | null,
): PathwayType {
  const edu = career.educationPath.toLowerCase();
  const prog = reqs?.universityPath?.type?.toLowerCase() ?? "";

  if (/medical degree|dental degree|veterinary degree|law degree/i.test(edu))
    return "professional-degree";
  if (/doctorate|ph\.?d/i.test(edu)) return "doctorate";
  if (/master/i.test(edu) || prog === "master" || prog === "integrated")
    return "master";
  if (/bachelor/i.test(edu) || prog === "bachelor") return "bachelor";
  if (
    /vocational|fagbrev|apprentice|trade certificate/i.test(edu) ||
    prog === "vocational" || prog === "fagbrev"
  )
    return "vocational";
  if (/licen[cs]e|lisens/i.test(edu)) return "licence-based";
  if (
    /no formal|self-taught|any background|on-the-job|experience/i.test(edu) ||
    career.entryLevel
  )
    return "entry-level";
  return "mixed";
}

function deriveCompetitiveness(
  reqs: CareerRequirements | null,
  grade: GradeRequirement,
  pathwayType: PathwayType,
): Competitiveness {
  const compText = (
    reqs?.universityPath?.competitiveness ?? ""
  ).toLowerCase();

  // Explicit signals from the competitiveness field
  if (/very.*competitive|extremely.*competitive|highly.*competitive/i.test(compText))
    return "very-high";
  if (/competitive|demanding|limited.*places|selective/i.test(compText))
    return "high";
  if (/moderate|fair|reasonable|accessible/i.test(compText)) return "moderate";
  if (/many.*spots|relatively.*accessible|not.*competitive|open/i.test(compText))
    return "low";

  // Fall back to grade + pathway inference
  if (grade.tier === "top") return "very-high";
  if (grade.tier === "strong") return "high";
  if (pathwayType === "professional-degree" || pathwayType === "doctorate")
    return "high";
  if (pathwayType === "entry-level" || pathwayType === "vocational")
    return "low";

  return "moderate";
}

function deriveDemand(
  grade: GradeRequirement,
  pathwayType: PathwayType,
  competitiveness: Competitiveness,
): AcademicDemand {
  // Grade-tier driven
  if (grade.tier === "top") return "very-strong";
  if (grade.tier === "strong") return "strong";

  // Pathway-type driven
  if (pathwayType === "professional-degree" || pathwayType === "doctorate")
    return "very-strong";
  if (pathwayType === "master") return "strong";

  // Competitiveness boost
  if (competitiveness === "very-high") return "very-strong";
  if (competitiveness === "high") return "strong";

  if (pathwayType === "bachelor") return "moderate";
  if (pathwayType === "entry-level") return "low";
  if (pathwayType === "vocational") return "low";

  if (grade.tier === "good") return "moderate";
  if (grade.tier === "pass") return "low";

  return "moderate";
}

function buildSubjects(
  reqs: CareerRequirements | null,
): SubjectRequirement[] {
  if (!reqs) return [];
  const subjects: SubjectRequirement[] = [];
  for (const s of reqs.schoolSubjects.required) {
    subjects.push({ name: s, importance: "essential" });
  }
  for (const s of reqs.schoolSubjects.recommended) {
    subjects.push({ name: s, importance: "important" });
  }
  return subjects;
}

function buildDiscoverHint(
  demand: AcademicDemand,
  pathwayType: PathwayType,
  subjects: SubjectRequirement[],
  competitiveness: Competitiveness,
): string {
  const essential = subjects
    .filter((s) => s.importance === "essential")
    .map((s) => s.name);

  const subjectPhrase =
    essential.length > 0
      ? essential.length <= 2
        ? essential.join(" and ")
        : `${essential.slice(0, 2).join(", ")} and others`
      : null;

  switch (demand) {
    case "very-strong":
      if (pathwayType === "professional-degree")
        return subjectPhrase
          ? `Often highly competitive. Strong performance in ${subjectPhrase} is typically expected.`
          : "Often highly competitive with demanding academic entry expectations.";
      return subjectPhrase
        ? `Typically requires strong academic performance, particularly in ${subjectPhrase}.`
        : "Typically requires strong academic performance across key subjects.";
    case "strong":
      return subjectPhrase
        ? `Good academic results typically expected, especially in ${subjectPhrase}.`
        : "Good academic performance is typically expected for this path.";
    case "moderate":
      return subjectPhrase
        ? `Solid school results are helpful. ${subjectPhrase} are particularly useful.`
        : "Solid school performance helps, though the route is less academically demanding.";
    case "low":
      if (pathwayType === "vocational")
        return "Practical and vocational route — more focused on hands-on skills than school grades.";
      return "Less dependent on school grades. Practical skills and experience often matter more.";
  }
}

function buildVariabilityNote(
  pathwayType: PathwayType,
  competitiveness: Competitiveness,
): string {
  if (pathwayType === "professional-degree")
    return "Entry requirements vary significantly by university and year. Competition levels change annually based on applicant numbers.";
  if (competitiveness === "very-high" || competitiveness === "high")
    return "Exact requirements vary by institution and programme. These are typical expectations, not guaranteed thresholds.";
  if (pathwayType === "vocational")
    return "Entry routes vary by region and employer. Some apprenticeships may have specific subject expectations.";
  if (pathwayType === "entry-level")
    return "Formal requirements are minimal, but relevant skills and experience can make a real difference.";
  return "Requirements may vary by institution, programme, and application year.";
}

function buildAlternativePathways(
  pathwayType: PathwayType,
  career: Career,
): string[] {
  const paths: string[] = [];
  if (pathwayType === "bachelor" || pathwayType === "master") {
    if (career.entryLevel) paths.push("May also be accessible without a formal degree via experience");
  }
  if (pathwayType === "professional-degree") {
    paths.push("Some related roles may be accessible through shorter study routes");
  }
  if (pathwayType === "vocational") {
    paths.push("Some employers accept on-the-job training as an alternative to formal apprenticeship");
  }
  return paths;
}

// ── Public API ─────────────────────────────────────────────────────

/**
 * Compute the career readiness profile. Uses existing career-requirements
 * data so there's nothing extra to maintain.
 */
export function getAcademicProfile(career: Career): CareerReadiness {
  const reqs =
    getCareerRequirements(career.id) ||
    getCareerRequirements(career.title);

  const grade = parseGradeRequirement(
    reqs?.schoolSubjects?.minimumGrade,
  );
  const pathwayType = derivePathwayType(career, reqs);
  const competitiveness = deriveCompetitiveness(reqs, grade, pathwayType);
  const demand = deriveDemand(grade, pathwayType, competitiveness);
  const subjects = buildSubjects(reqs);
  const discoverHint = buildDiscoverHint(demand, pathwayType, subjects, competitiveness);
  const requiresDegree = [
    "bachelor",
    "master",
    "doctorate",
    "professional-degree",
  ].includes(pathwayType);
  const variabilityNote = buildVariabilityNote(pathwayType, competitiveness);
  const alternativePathways = buildAlternativePathways(pathwayType, career);

  return {
    demand,
    grade,
    pathwayType,
    competitiveness,
    subjects,
    discoverHint,
    requiresDegree,
    variabilityNote,
    alternativePathways,
  };
}

// ── Demand ordering (for "up to" filtering) ────────────────────────

const DEMAND_ORDER: Record<AcademicDemand, number> = {
  low: 0,
  moderate: 1,
  strong: 2,
  "very-strong": 3,
};

/** True when career demand is at or below the given ceiling. */
export function demandAtMost(
  careerDemand: AcademicDemand,
  ceiling: AcademicDemand,
): boolean {
  return DEMAND_ORDER[careerDemand] <= DEMAND_ORDER[ceiling];
}

// ── Display helpers ────────────────────────────────────────────────

const DEMAND_LABELS: Record<AcademicDemand, string> = {
  low: "Lower",
  moderate: "Moderate",
  strong: "Strong",
  "very-strong": "Very strong",
};

// Deliberately calm colours — "very-strong" uses violet instead of red
// to avoid an alarming / discouraging feel.
const DEMAND_COLORS: Record<
  AcademicDemand,
  { text: string; bg: string }
> = {
  low: { text: "text-emerald-500", bg: "bg-emerald-500/10" },
  moderate: { text: "text-amber-500", bg: "bg-amber-500/10" },
  strong: { text: "text-orange-400", bg: "bg-orange-400/10" },
  "very-strong": { text: "text-violet-400", bg: "bg-violet-400/10" },
};

export function getDemandLabel(d: AcademicDemand): string {
  return DEMAND_LABELS[d];
}

export function getDemandColors(d: AcademicDemand) {
  return DEMAND_COLORS[d];
}

const PATHWAY_LABELS: Record<PathwayType, string> = {
  vocational: "Vocational / apprenticeship",
  bachelor: "University (bachelor's)",
  master: "University (master's)",
  doctorate: "University (doctorate)",
  "professional-degree": "Professional degree",
  mixed: "Multiple routes",
  "entry-level": "No formal degree needed",
  "licence-based": "Licence / certification",
};

export function getPathwayLabel(p: PathwayType): string {
  return PATHWAY_LABELS[p];
}

const COMPETITIVENESS_LABELS: Record<Competitiveness, string> = {
  low: "Less competitive",
  moderate: "Moderately competitive",
  high: "Competitive",
  "very-high": "Highly competitive",
};

export function getCompetitivenessLabel(c: Competitiveness): string {
  return COMPETITIVENESS_LABELS[c];
}
