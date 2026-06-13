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
  | "study_skills"
  | "money_lifestyle"
  | "hard_truths"
  | "doubts_risks"
  | "opportunities"
  | "next_steps";

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

/** What the Twin "remembers" about a returning user — built server-side. */
export interface TwinMemory {
  /** ISO timestamp of the user's previous turn with THIS career's Twin, or null on first visit. */
  lastVisitAt: string | null;
  /** Whole days since the last turn (null on first ever visit). */
  daysSinceLastVisit: number | null;
  /** Up to 2 recent journey reflection responses (trimmed). */
  recentReflections: string[];
  /** Short labels of things that changed since lastVisitAt (e.g. "set a new primary goal"). */
  changedSinceLastVisit: string[];
  /** Top industry/strength labels from the user's latest career quiz. */
  quizLabels: string[];
}

/** A career the user has recently engaged with (saved or rated). */
export interface RecentCareerSignal {
  /** Slug/catalog id. */
  careerId: string;
  /** Human title (resolved from the catalog or stored alongside the save). */
  title: string;
  emoji?: string | null;
}

/**
 * Real, server-loaded signals of what the user has been doing lately. Used to
 * build a PROACTIVE, personalised opener so the Twin feels like a companion
 * who's been paying attention. Every field is best-effort and may be empty —
 * the opener gracefully falls back to the generic intro when there's nothing.
 */
export interface TwinRecentActivity {
  /** The career this Twin is grounded in (so we don't echo it back as "recent"). */
  activeCareerId: string;
  /** The active goal/career title, if any. */
  activeGoalTitle: string | null;
  /** Careers the user recently explored or saved, most-recent first (active one excluded). */
  recentCareers: RecentCareerSignal[];
  /** Where the user is in Discover → Understand → Clarity, if known. */
  journeyStage: string | null;
  /** Whole days since the user last spoke to THIS career's Twin (null on first visit). */
  daysSinceLastVisit: number | null;
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
  /** Language the Twin should reply in (from the user's UI locale). Defaults to English. */
  language?: string;
  /** What the Twin remembers about a returning user (built server-side). */
  memory?: TwinMemory | null;
}
