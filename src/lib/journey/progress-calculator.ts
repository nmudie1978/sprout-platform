/**
 * Journey Progress Calculator
 *
 * NEW PHILOSOPHY: DISCOVER · UNDERSTAND · ACT
 *
 * Progress is based ONLY on mandatory milestones.
 * Optional milestones add depth but do not affect 100% eligibility.
 *
 * Total Journey Progress:
 * - DISCOVER = 33.3% of total
 * - UNDERSTAND = 33.3% of total
 * - ACT = 33.3% of total
 *
 * Each lens progress = (completedMandatory / totalMandatory) * 100
 */

import type {
  JourneySummary,
  JourneyStateContext,
  JourneyLens,
  JourneyStateId,
  LensProgress,
} from './types';

import { MANDATORY_STATES, JOURNEY_STATE_CONFIG } from './types';

// ============================================
// TYPES
// ============================================

export interface MilestoneStatus {
  id: JourneyStateId;
  label: string;
  completed: boolean;
  mandatory: boolean;
  stepNumber: number | null;
}

export interface LensProgressDetails {
  progressPercent: number;
  mandatoryTotal: number;
  mandatoryCompleted: number;
  optionalTotal: number;
  optionalCompleted: number;
  isComplete: boolean;
  nextMilestone: string | null;
  remainingMandatory: string[];
  milestones: MilestoneStatus[];
}

export interface AllLensProgress {
  DISCOVER: LensProgressDetails;
  UNDERSTAND: LensProgressDetails;
  ACT: LensProgressDetails;
  overallProgress: number;
}

// ============================================
// DISCOVER LENS PROGRESS
// ============================================

/**
 * DISCOVER Progress (3 Mandatory Steps):
 * 1. Reflect on strengths (MANDATORY)
 * 2. Explore at least 1 career (MANDATORY)
 * 3. Complete 1 role deep dive (MANDATORY)
 *
 * Progress = completedMandatory / 3 * 100
 * Cannot reach 100% without all 3 mandatory steps.
 */
export function calculateDiscoverProgress(context: {
  strengthsConfirmed: boolean;
  careersExplored: boolean;
  roleDeepDiveCompleted: boolean;
}): LensProgressDetails {
  const milestones: MilestoneStatus[] = [
    {
      id: 'REFLECT_ON_STRENGTHS',
      label: 'Reflect on strengths',
      completed: context.strengthsConfirmed,
      mandatory: true,
      stepNumber: 1,
    },
    {
      id: 'EXPLORE_CAREERS',
      label: 'Explore careers',
      completed: context.careersExplored,
      mandatory: true,
      stepNumber: 2,
    },
    {
      id: 'ROLE_DEEP_DIVE',
      label: 'Deep dive into role',
      completed: context.roleDeepDiveCompleted,
      mandatory: true,
      stepNumber: 3,
    },
  ];

  return computeLensProgress(milestones);
}

// ============================================
// UNDERSTAND LENS PROGRESS
// ============================================

/**
 * UNDERSTAND Progress (3 Mandatory):
 *
 * Mandatory:
 * 1. Review industry outlook for primary goal (MANDATORY)
 * 2. Career shadow (MANDATORY)
 * 3. Create draft action plan (MANDATORY)
 *
 * Progress = completedMandatory / 3 * 100
 */
export function calculateUnderstandProgress(context: {
  industryOutlookReviewed: boolean;
  careerShadowCompleted: boolean;
  planCreated: boolean;
}): LensProgressDetails {
  const milestones: MilestoneStatus[] = [
    {
      id: 'REVIEW_INDUSTRY_OUTLOOK',
      label: 'Review industry outlook',
      completed: context.industryOutlookReviewed,
      mandatory: true,
      stepNumber: 1,
    },
    {
      id: 'CAREER_SHADOW',
      label: 'Career shadow',
      completed: context.careerShadowCompleted,
      mandatory: true,
      stepNumber: 2,
    },
    {
      id: 'CREATE_ACTION_PLAN',
      label: 'Create action plan',
      completed: context.planCreated,
      mandatory: true,
      stepNumber: 3,
    },
  ];

  return computeLensProgress(milestones);
}

// ============================================
// ACT LENS PROGRESS
// ============================================

/**
 * ACT Progress (2 Mandatory + 2 Optional):
 *
 * Mandatory:
 * 1. Complete 1 aligned action (job OR shadow OR project OR event OR course) (MANDATORY)
 * 2. Submit reflection on action (MANDATORY)
 *
 * Optional (add depth, not required for 100%):
 * - Update plan after action (OPTIONAL)
 * - Receive external feedback (OPTIONAL)
 *
 * Progress = completedMandatory / 2 * 100
 * Small jobs are NOT mandatory - they are one option among many.
 */
export function calculateActProgress(context: {
  alignedActionCompleted: boolean;
  actionReflectionSubmitted: boolean;
  planUpdated: boolean;
  externalFeedbackReceived: boolean;
}): LensProgressDetails {
  const milestones: MilestoneStatus[] = [
    {
      id: 'COMPLETE_ALIGNED_ACTION',
      label: 'Complete aligned action',
      completed: context.alignedActionCompleted,
      mandatory: true,
      stepNumber: 1,
    },
    {
      id: 'SUBMIT_ACTION_REFLECTION',
      label: 'Reflect on action',
      completed: context.actionReflectionSubmitted,
      mandatory: true,
      stepNumber: 2,
    },
    {
      id: 'UPDATE_PLAN',
      label: 'Update plan (bonus)',
      completed: context.planUpdated,
      mandatory: false,
      stepNumber: null,
    },
    {
      id: 'EXTERNAL_FEEDBACK',
      label: 'External feedback (bonus)',
      completed: context.externalFeedbackReceived,
      mandatory: false,
      stepNumber: null,
    },
  ];

  return computeLensProgress(milestones);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function computeLensProgress(milestones: MilestoneStatus[]): LensProgressDetails {
  const mandatory = milestones.filter((m) => m.mandatory);
  const optional = milestones.filter((m) => !m.mandatory);

  const mandatoryCompleted = mandatory.filter((m) => m.completed).length;
  const optionalCompleted = optional.filter((m) => m.completed).length;

  const mandatoryTotal = mandatory.length;
  const optionalTotal = optional.length;

  // Progress is ONLY based on mandatory milestones
  const progressPercent = mandatoryTotal > 0
    ? Math.round((mandatoryCompleted / mandatoryTotal) * 100)
    : 0;

  const isComplete = mandatoryCompleted === mandatoryTotal;

  const remainingMandatory = mandatory
    .filter((m) => !m.completed)
    .map((m) => m.label);

  const nextMilestone = remainingMandatory.length > 0
    ? remainingMandatory[0]
    : null;

  return {
    progressPercent,
    mandatoryTotal,
    mandatoryCompleted,
    optionalTotal,
    optionalCompleted,
    isComplete,
    nextMilestone,
    remainingMandatory,
    milestones,
  };
}

// ============================================
// UNIFIED PROGRESS CALCULATOR
// ============================================

/**
 * Calculate progress for all lenses from journey summary data.
 *
 * Total progress = average of all lens progresses (each lens = 33.3%)
 */
export function calculateAllLensProgress(summary: JourneySummary): AllLensProgress {
  // DISCOVER lens
  const discoverProgress = calculateDiscoverProgress({
    strengthsConfirmed: (summary.strengths?.length ?? 0) >= 3,
    careersExplored: (summary.careerInterests?.length ?? 0) >= 1,
    roleDeepDiveCompleted: (summary.exploredRoles?.length ?? 0) >= 1,
  });

  // UNDERSTAND lens
  const understandProgress = calculateUnderstandProgress({
    industryOutlookReviewed: (summary.industryInsightsSummary?.trendsReviewed ?? 0) >= 3,
    careerShadowCompleted: (summary.shadowSummary?.completed ?? 0) > 0 ||
      Boolean(summary.pathQualifications?.length || summary.pathSkills?.length || summary.pathCourses?.length || summary.pathRequirements?.length),
    planCreated: summary.planCreated ?? false,
  });

  // ACT lens
  const actProgress = calculateActProgress({
    alignedActionCompleted: (summary.alignedActionsCount ?? 0) >= 1 || (summary.alignedActions?.length ?? 0) >= 1,
    actionReflectionSubmitted: (summary.alignedActionReflections?.length ?? 0) >= 1 || (summary.reflectionSummary?.total ?? 0) >= 1,
    planUpdated: summary.planUpdatedAt !== null && summary.planUpdatedAt !== undefined,
    externalFeedbackReceived: (summary.externalFeedback as unknown as unknown[] | undefined)?.length ? true : false,
  });

  // Overall progress = average of lens percentages
  const overallProgress = Math.round(
    (discoverProgress.progressPercent +
      understandProgress.progressPercent +
      actProgress.progressPercent) / 3
  );

  return {
    DISCOVER: discoverProgress,
    UNDERSTAND: understandProgress,
    ACT: actProgress,
    overallProgress,
  };
}

/**
 * Calculate progress from journey state context (for state machine).
 */
export function calculateProgressFromContext(context: JourneyStateContext): AllLensProgress {
  const discoverProgress = calculateDiscoverProgress({
    strengthsConfirmed: context.confirmedStrengths.length >= 3,
    careersExplored: context.savedCareers.length >= 1,
    roleDeepDiveCompleted: context.exploredRolesCount >= 1,
  });

  const understandProgress = calculateUnderstandProgress({
    industryOutlookReviewed: context.industryOutlookReviewed,
    careerShadowCompleted: context.shadowsCompleted > 0 || context.pathDataSaved === true,
    planCreated: context.planCreated,
  });

  const actProgress = calculateActProgress({
    alignedActionCompleted: context.alignedActionsCompleted >= 1,
    actionReflectionSubmitted: context.actionReflectionsSubmitted >= 1,
    planUpdated: context.planUpdatedAfterAction,
    externalFeedbackReceived: context.externalFeedbackReceived,
  });

  const overallProgress = Math.round(
    (discoverProgress.progressPercent +
      understandProgress.progressPercent +
      actProgress.progressPercent) / 3
  );

  return {
    DISCOVER: discoverProgress,
    UNDERSTAND: understandProgress,
    ACT: actProgress,
    overallProgress,
  };
}

/**
 * Convert LensProgressDetails to the LensProgress type used in JourneySummary.
 */
export function toLensProgress(details: LensProgressDetails, lens: JourneyLens): LensProgress {
  const mandatoryStates = MANDATORY_STATES[lens];
  const completedMandatory = details.milestones
    .filter((m) => m.mandatory && m.completed)
    .map((m) => m.id);
  const completedOptional = details.milestones
    .filter((m) => !m.mandatory && m.completed)
    .map((m) => m.id);

  return {
    progress: details.progressPercent,
    completedMandatory,
    completedOptional,
    totalMandatory: details.mandatoryTotal,
    totalOptional: details.optionalTotal,
    isComplete: details.isComplete,
  };
}

/**
 * Get a human-readable progress summary for a lens.
 */
export function getLensProgressSummary(details: LensProgressDetails): string {
  if (details.isComplete) {
    const bonus = details.optionalCompleted > 0
      ? ` (+${details.optionalCompleted} bonus)`
      : '';
    return `Complete${bonus}`;
  }

  return `Step ${details.mandatoryCompleted + 1} of ${details.mandatoryTotal}: ${details.nextMilestone}`;
}

/**
 * Check if a specific milestone is complete.
 */
export function isMilestoneComplete(
  milestoneId: JourneyStateId,
  completedSteps: JourneyStateId[]
): boolean {
  return completedSteps.includes(milestoneId);
}

/**
 * Get the current step number within a lens (1-based).
 */
export function getCurrentStepInLens(
  lens: JourneyLens,
  completedSteps: JourneyStateId[]
): number {
  const mandatoryStates = MANDATORY_STATES[lens];
  const completedCount = mandatoryStates.filter(s => completedSteps.includes(s)).length;
  return Math.min(completedCount + 1, mandatoryStates.length);
}

/**
 * Get the total number of mandatory steps in a lens.
 */
export function getTotalStepsInLens(lens: JourneyLens): number {
  return MANDATORY_STATES[lens].length;
}
