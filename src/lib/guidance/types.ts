/**
 * GUIDANCE LAYER — Type Definitions
 *
 * Defines the guidance system's type model: categories, placements, and rules.
 * Guidance is contextual, state-driven, and never intrusive.
 */

// ── Guidance Categories ─────────────────────────────────────────────

export type GuidanceCategory =
  | 'reassurance'   // Reduce pressure or uncertainty
  | 'direction'     // Help users know what to do next
  | 'reinforcement' // Acknowledge meaningful progress
  | 'context';      // Explain why something matters

// ── Guidance Placement ──────────────────────────────────────────────

export type GuidancePlacement =
  | 'dashboard'
  | 'discover'
  | 'understand'
  | 'act'
  | 'learning-goals'
  | 'school-alignment'
  | 'careers';

// ── Guidance Visual Variant ─────────────────────────────────────────

export type GuidanceVariant =
  | 'callout'      // Inline callout card with icon
  | 'highlight'    // Soft tinted panel
  | 'hint'         // Subtle contextual hint
  | 'nudge';       // Low-emphasis encouragement block

// ── Core Guidance Item ──────────────────────────────────────────────

export interface GuidanceItem {
  id: string;
  category: GuidanceCategory;
  variant: GuidanceVariant;
  placement: GuidancePlacement;
  message: string;
  submessage?: string;
  dismissible?: boolean;
  priority: number; // Lower = higher priority. Used to pick top items when multiple match.
}

// ── Guidance Context (derived from app state) ───────────────────────

export interface GuidanceContext {
  // Journey state
  currentLens: 'DISCOVER' | 'UNDERSTAND' | 'ACT' | null;
  completedSteps: string[];
  overallProgress: number; // 0-100

  // Lens progress
  discoverProgress: number;
  understandProgress: number;
  actProgress: number;
  discoverComplete: boolean;
  understandComplete: boolean;
  actComplete: boolean;

  // Profile / onboarding
  hasGoal: boolean;
  goalTitle: string | null;
  hasStrengths: boolean;
  strengthsCount: number;
  hasCareerInterests: boolean;
  careerInterestsCount: number;
  isFirstLogin: boolean;
  onboardingComplete: boolean;

  // Education
  hasEducationContext: boolean;
  hasSubjects: boolean;
  subjectCount: number;

  // Learning goals
  learningGoalCount: number;

  // Activity
  savedItemsCount: number;
  alignedActionsCount: number;
  reflectionsCount: number;
  jobsApplied: number;
}

// ── Guidance Rule ───────────────────────────────────────────────────

export interface GuidanceRule {
  id: string;
  placement: GuidancePlacement;
  /** Return true if this guidance should be shown */
  condition: (ctx: GuidanceContext) => boolean;
  /** The guidance to show when condition is met */
  item: Omit<GuidanceItem, 'id' | 'placement'>;
}
