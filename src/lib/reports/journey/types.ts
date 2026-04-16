/**
 * Journey Report — view model types.
 *
 * The view model is the contract between the data layer (mapper) and the
 * presentation layer (pages/components). Once a `JourneyReportViewModel`
 * is built, rendering the PDF is pure — nothing else needs to be fetched.
 *
 * This model intentionally blends three sources of truth:
 *   1. the user's authored content (notes, reflections, momentum),
 *   2. the user's Discover Radar preferences (structured choices), and
 *   3. the app's career catalog (real data about the role itself).
 *
 * The report should feel substantive even when the user has barely
 * written anything — because the catalog has a lot to say about any
 * career the user has chosen. Empty user input is not an empty section.
 */

export type Stage = "foundation" | "education" | "certification" | "experience" | "career";

export interface RoadmapStep {
  stage: Stage;
  title: string;
  subtitle?: string;
  startAge: number;
  endAge?: number;
  isMilestone: boolean;
  description?: string;
  microActions?: string[];
}

export interface SchoolStageItem {
  stage: Stage;
  title: string;
  subjects: string[];
  personalLearning?: string;
  startAge: number;
  endAge?: number;
}

export interface RouteVariant {
  label: string;
  university: { name: string; programme: string; city: string; country: string };
  employer: { name: string; role: string; city: string };
}

export interface MomentumAction {
  text: string;
  done: boolean;
  status?: "not_started" | "in_progress" | "done" | string;
  type?: string;
}

export interface NextStep {
  priority: "foundational" | "next" | "stretch";
  headline: string;
  body: string;
}

export interface CoverMeta {
  careerTitle: string | null;
  subtitle: string;
  generatedDate: string;
  generatedIso: string;
}

// ── Career-catalog view types ──────────────────────────────────────

export interface CareerFactSheet {
  description: string | null;
  avgSalary: string | null;
  growthOutlook: "high" | "medium" | "stable" | null;
  growthOutlookLabel: string | null;
  educationPath: string | null;
  sector: "public" | "private" | "mixed" | null;
  pensionNote: string | null;
}

export interface TypicalDay {
  morning: string[];
  midday: string[];
  afternoon: string[];
  tools: string[];
  environment: string | null;
}

export interface CareerInsights {
  whatYouActuallyDo: string[];
  whoThisIsGoodFor: string[];
  topSkills: string[];
  entryPaths: string[];
  realityCheck: string | null;
  typicalDay: TypicalDay | null;
}

export interface RequirementsSummary {
  subjects: { required: string[]; recommended: string[]; minimumGrade: string | null };
  universityPath: {
    programme: string | null;
    duration: string | null;
    type: string | null;
    examples: string[];
    applicationRoute: string | null;
    competitiveness: string | null;
  };
  entryLevel: {
    title: string | null;
    description: string | null;
    whatYouNeed: string | null;
  };
  qualifiesFor: { immediate: string | null; withExperience: string | null; seniorPath: string | null };
  specialisationNote: string | null;
}

export interface ProgrammeRow {
  institution: string;
  programme: string;
  city: string;
  country: string;
  duration: string;
  language: string | null;
  tuition: string | null;
  url: string | null;
}

export interface CertificationItem {
  name: string;
  provider: string;
  duration: string;
  cost: string;
  recognised: string;
  url: string;
}

export interface CertificationPathView {
  summary: string;
  certifications: CertificationItem[];
  recommendedDegrees: string[];
}

// ── User summaries ──────────────────────────────────────────────────

export interface RadarPreferences {
  peoplePreference: string | null; // "with-people" | "independently" | "mix-people"
  workType: string[];
  pace: string | null;
  environment: string | null;
  clarityLevel: string | null;
  /** Pretty labels derived from the ID values above, ready to render. */
  summaryLines: string[];
}

export interface DiscoverSummary {
  strengths: string[];
  motivations: string[];
  workStyle: string[];
  growthAreas: string[];
  careerInterests: string[];
  roleModels: string;
  experiences: string;
  /** From `youthProfile.discoverPreferences` — user's Career Radar answers.
   *  Always fill this when the profile has preferences, even if the user
   *  hasn't written free-text Discover notes. */
  radar: RadarPreferences | null;
}

export interface UnderstandSummary {
  /** User-authored role-reality notes. */
  roleReality: string[];
  /** User-authored industry insight notes. */
  industryInsights: string[];
  qualifications: string[];
  keySkills: string[];
  courses: string[];
  actionPlan: {
    roleTitle?: string;
    shortTermActions?: string[];
    midTermMilestone?: string;
    skillToBuild?: string;
  } | null;
  /** Career-catalog signals, always filled when the career is known. */
  facts: CareerFactSheet | null;
  insights: CareerInsights | null;
  requirements: RequirementsSummary | null;
  programmes: ProgrammeRow[];
  certifications: CertificationPathView | null;
}

export interface ClaritySummary {
  momentum: MomentumAction[];
  alignedActions: { type: string; title: string }[];
  reflections: string[];
  foundationSet: boolean;
  hasMomentum: boolean;
}

export interface EducationContext {
  stage: string | null;
  stageLabel: string | null;
  schoolName: string | null;
  studyProgram: string | null;
  subjects: string[];
  expectedCompletion: string | null;
}

export interface RoadmapSection {
  career: string | null;
  items: RoadmapStep[];
  schoolTrack: SchoolStageItem[];
  /** True when we generated the roadmap from requirements rather than
   *  reading the user's saved timeline. Used to show a gentle caveat. */
  isFallback: boolean;
  /** User's approximate birth year (report year − current age). Used by
   *  the PDF to render calendar-year ranges alongside age ranges on
   *  each roadmap row. Null when we can't determine age. */
  birthYear: number | null;
}

export interface ExecutiveSummaryData {
  headline: string;
  paragraphs: string[];
  highlights: { label: string; value: string }[];
}

export interface JourneyReportViewModel {
  cover: CoverMeta;
  executive: ExecutiveSummaryData;
  discover: DiscoverSummary;
  understand: UnderstandSummary;
  roadmap: RoadmapSection;
  routes: RouteVariant[];
  clarity: ClaritySummary;
  education: EducationContext;
  nextSteps: NextStep[];
  closingReflections: string[];
}
