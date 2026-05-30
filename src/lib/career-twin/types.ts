/**
 * Career Twin — "AI Future Self" types.
 *
 * The Career Twin lets a young person talk to ONE POSSIBLE future version
 * of themselves who followed a selected career path. Nothing here is a
 * prediction — every persona is framed as a scenario, never a certainty.
 *
 * These types are intentionally free of any DB or Prisma coupling so the
 * persona/prompt builders stay pure and unit-testable.
 */

export type CareerTwinModeId =
  | "ask_future_me"
  | "day_in_life"
  | "how_i_got_here"
  | "what_i_wish_i_knew"
  | "study_skills"
  | "money_lifestyle"
  | "hard_truths"
  | "next_step_coach";

export interface CareerTwinMode {
  id: CareerTwinModeId;
  /** Short, youth-friendly chip label. */
  label: string;
  /** One-line tagline shown under the chip. */
  description: string;
  /**
   * Steering text appended to the system prompt when this mode is active.
   * Shapes WHAT the future self talks about, never HOW safe it is.
   */
  promptModifier: string;
  /** At least three starter questions surfaced when the mode is selected. */
  starterQuestions: string[];
}

/** Best-effort profile context. Every field is optional — the Twin works general when sparse. */
export interface CareerTwinProfileContext {
  age?: number | null;
  country?: string | null;
  preferredLanguage?: string | null;
  interests?: string[];
  subjects?: string[];
  /** Where the user is in the Discover → Understand → Clarity journey. */
  journeyStage?: string | null;
}

/**
 * The career the Twin is grounded in. May come from the rich catalog OR
 * be a minimal title-only context for careers not yet in the catalog —
 * the Twin must work for any selected career.
 */
export interface CareerTwinCareerContext {
  id: string;
  title: string;
  emoji?: string;
  educationPath?: string;
  avgSalary?: string;
  keySkills?: string[];
  dailyTasks?: string[];
  growthOutlook?: string;
  workSetting?: string;
  peopleIntensity?: string;
}

/**
 * Structured "future self" persona. Generated deterministically from
 * career + profile data. Deliberately scenario-framed: futureAgeEstimate
 * and summaries describe ONE possible path, not a forecast.
 */
export interface CareerTwinPersona {
  userId: string | null;
  careerId: string;
  careerTitle: string;
  futureAgeEstimate: number | null;
  countryContext: string;
  educationPathSummary: string;
  currentRoleSummary: string;
  typicalDaySummary: string;
  strengthsAssumedFromProfile: string[];
  uncertaintyDisclaimer: string;
  tone: string;
  safetyLevel: "standard" | "heightened";
  /** Warm, first-person opening line shown before the chat starts. */
  intro: string;
  createdAt: string;
  updatedAt: string;
}

export interface BuildPersonaInput {
  userId?: string | null;
  career: CareerTwinCareerContext;
  profile?: CareerTwinProfileContext | null;
}

export interface BuildPromptInput {
  persona: CareerTwinPersona;
  mode: CareerTwinMode;
  career: CareerTwinCareerContext;
  profile?: CareerTwinProfileContext | null;
}
