/**
 * My Journey Test Utilities
 *
 * Shared helpers for all journey tests. These provide:
 * - Context factories
 * - Summary factories
 * - Assertion utilities
 * - Predefined journey states
 */

import {
  type JourneyStateContext,
  type JourneySummary,
  type JourneyStateId,
  type JourneyLens,
  type JourneyUIState,
  type SkippedStepsMap,
  type ExploredRole,
  type RolePlan,
  type StepCompletionData,
  type AlignedActionType,
  DEFAULT_JOURNEY_SUMMARY,
  JOURNEY_STATES,
  MANDATORY_STATES,
} from '@/lib/journey/types';

import { createOrchestrator, JourneyOrchestrator, validateStepCompletionData } from '@/lib/journey/orchestrator';

// ============================================
// CONTEXT FACTORY
// ============================================

export function makeContext(overrides: Partial<JourneyStateContext> = {}): JourneyStateContext {
  return {
    userId: 'test-user-id',
    profile: null,
    confirmedStrengths: [],
    savedCareers: [],
    exploredRolesCount: 0,
    primaryGoalSelected: false,
    industryOutlookReviewed: false,
    requirementsReviewed: false,
    planCreated: false,
    shadowsRequested: 0,
    shadowsCompleted: 0,
    shadowsSkipped: false,
    pathDataSaved: false,
    savedItemsCount: 0,
    alignedActionsCompleted: 0,
    actionReflectionsSubmitted: 0,
    externalFeedbackReceived: false,
    planUpdatedAfterAction: false,
    completedJobs: 0,
    reflectionsCount: 0,
    journeySummary: null,
    skippedSteps: {} as SkippedStepsMap,
    ...overrides,
  };
}

// ============================================
// SUMMARY FACTORY
// ============================================

export function makeSummary(overrides: Partial<JourneySummary> = {}): JourneySummary {
  return {
    ...DEFAULT_JOURNEY_SUMMARY,
    ...overrides,
  };
}

// ============================================
// ROLE FACTORY
// ============================================

export function makeExploredRole(title = 'Doctor'): ExploredRole {
  return {
    title,
    exploredAt: new Date().toISOString(),
    educationPaths: ['Medical School'],
    certifications: ['MBBS'],
    companies: ['NHS'],
    humanSkills: ['Empathy', 'Communication'],
    entryExpectations: '5+ years training',
  };
}

export function makeRolePlan(roleTitle = 'Doctor'): RolePlan {
  return {
    roleTitle,
    shortTermActions: ['Research medical schools', 'Volunteer at clinic'],
    midTermMilestone: 'Apply to medical school',
    skillToBuild: 'Biology knowledge',
    createdAt: new Date().toISOString(),
  };
}

// ============================================
// STEP COMPLETION DATA FACTORIES
// ============================================

export function makeStrengthsData(strengths = ['Communication', 'Teamwork', 'Problem Solving']): StepCompletionData {
  return {
    type: 'REFLECT_ON_STRENGTHS',
    topStrengths: strengths,
    demonstratedSkills: ['Active Listening'],
  };
}

export function makeExploreCareersData(careers = ['Doctor']): StepCompletionData {
  return {
    type: 'EXPLORE_CAREERS',
    selectedCareers: careers,
  };
}

export function makeRoleDeepDiveData(role?: ExploredRole): StepCompletionData {
  return {
    type: 'ROLE_DEEP_DIVE',
    role: role || makeExploredRole(),
  };
}

export function makeIndustryOutlookData(): StepCompletionData {
  return {
    type: 'REVIEW_INDUSTRY_OUTLOOK',
    trendsReviewed: ['Growing demand', 'AI integration', 'Remote options'],
    outlookNotes: ['Positive outlook'],
    roleRealityNotes: ['Long hours', 'Continuous learning'],
    industryInsightNotes: ['Healthcare demand rising'],
  };
}

export function makeCareerShadowData(): StepCompletionData {
  return {
    type: 'CAREER_SHADOW',
    qualifications: ['MBBS', 'GMC Registration'],
    keySkills: ['Diagnosis', 'Patient Care'],
    courses: ['Biology A-Level', 'Chemistry A-Level'],
    requirements: ['DBS Check', 'UCAT score'],
  };
}

export function makeActionPlanData(roleTitle = 'Doctor'): StepCompletionData {
  return {
    type: 'CREATE_ACTION_PLAN',
    plan: makeRolePlan(roleTitle),
  };
}

export function makeAlignedActionData(
  actionType: AlignedActionType = 'VOLUNTEER_WORK',
  title = 'Hospital volunteering'
): StepCompletionData {
  return {
    type: 'COMPLETE_ALIGNED_ACTION',
    actionType,
    actionId: `action-${Date.now()}`,
    actionTitle: title,
    linkedToGoal: true,
  };
}

export function makeReflectionData(actionId = 'action-1'): StepCompletionData {
  return {
    type: 'SUBMIT_ACTION_REFLECTION',
    actionId,
    reflectionResponse: 'I learned that patient care requires empathy and patience.',
  };
}

export function makeUpdatePlanData(): StepCompletionData {
  return {
    type: 'UPDATE_PLAN',
    updatedPlan: makeRolePlan('Doctor'),
    changeReason: 'Updated after volunteering experience',
  };
}

export function makeExternalFeedbackData(): StepCompletionData {
  return {
    type: 'EXTERNAL_FEEDBACK',
    feedbackSource: 'mentor' as const,
    feedbackSummary: 'Great progress, consider focusing on biology coursework.',
    receivedAt: new Date().toISOString(),
  };
}

// ============================================
// PREDEFINED JOURNEY STATES
// ============================================

export const JOURNEY_PRESETS = {
  /** Brand new user, no progress */
  empty: () => ({
    context: makeContext(),
    dbState: {
      journeyState: 'REFLECT_ON_STRENGTHS',
      journeyCompletedSteps: [] as string[],
      journeySummary: DEFAULT_JOURNEY_SUMMARY,
    },
  }),

  /** User completed Discover, starting Understand */
  discoverComplete: () => ({
    context: makeContext({
      confirmedStrengths: ['Communication', 'Teamwork', 'Problem Solving'],
      savedCareers: [{ id: '1', title: 'Doctor', savedAt: '2026-01-01' }],
      exploredRolesCount: 1,
      primaryGoalSelected: true,
    }),
    dbState: {
      journeyState: 'REVIEW_INDUSTRY_OUTLOOK',
      journeyCompletedSteps: ['REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE'],
      journeySummary: makeSummary({
        strengths: ['Communication', 'Teamwork', 'Problem Solving'],
        careerInterests: ['Doctor'],
        exploredRoles: [makeExploredRole()],
        primaryGoal: { title: 'Doctor', selectedAt: '2026-01-01' },
      }),
    },
  }),

  /** User completed Discover + Understand, starting Act */
  understandComplete: () => ({
    context: makeContext({
      confirmedStrengths: ['Communication', 'Teamwork', 'Problem Solving'],
      savedCareers: [{ id: '1', title: 'Doctor', savedAt: '2026-01-01' }],
      exploredRolesCount: 1,
      primaryGoalSelected: true,
      industryOutlookReviewed: true,
      pathDataSaved: true,
      shadowsCompleted: 1,
      planCreated: true,
    }),
    dbState: {
      journeyState: 'COMPLETE_ALIGNED_ACTION',
      journeyCompletedSteps: [
        'REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE',
        'REVIEW_INDUSTRY_OUTLOOK', 'CAREER_SHADOW', 'CREATE_ACTION_PLAN',
      ],
      journeySummary: makeSummary({
        strengths: ['Communication', 'Teamwork', 'Problem Solving'],
        careerInterests: ['Doctor'],
        exploredRoles: [makeExploredRole()],
        primaryGoal: { title: 'Doctor', selectedAt: '2026-01-01' },
        industryInsightsSummary: { trendsReviewed: 3, insightsSaved: 0, lastReviewedAt: '2026-01-15' },
        pathQualifications: ['MBBS'],
        pathSkills: ['Diagnosis'],
        planCreated: true,
        rolePlans: [makeRolePlan()],
      }),
    },
  }),

  /** Full journey completed (all mandatory + optional steps) */
  fullyComplete: () => ({
    context: makeContext({
      confirmedStrengths: ['Communication', 'Teamwork', 'Problem Solving'],
      savedCareers: [{ id: '1', title: 'Doctor', savedAt: '2026-01-01' }],
      exploredRolesCount: 1,
      primaryGoalSelected: true,
      industryOutlookReviewed: true,
      pathDataSaved: true,
      shadowsCompleted: 1,
      planCreated: true,
      alignedActionsCompleted: 1,
      actionReflectionsSubmitted: 1,
      planUpdatedAfterAction: true,
      externalFeedbackReceived: true,
    }),
    dbState: {
      journeyState: 'EXTERNAL_FEEDBACK',
      journeyCompletedSteps: [
        'REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE',
        'REVIEW_INDUSTRY_OUTLOOK', 'CAREER_SHADOW', 'CREATE_ACTION_PLAN',
        'COMPLETE_ALIGNED_ACTION', 'SUBMIT_ACTION_REFLECTION',
        'UPDATE_PLAN', 'EXTERNAL_FEEDBACK',
      ],
      journeySummary: makeSummary({
        strengths: ['Communication', 'Teamwork', 'Problem Solving'],
        careerInterests: ['Doctor'],
        exploredRoles: [makeExploredRole()],
        primaryGoal: { title: 'Doctor', selectedAt: '2026-01-01' },
        industryInsightsSummary: { trendsReviewed: 3, insightsSaved: 0, lastReviewedAt: '2026-01-15' },
        planCreated: true,
        rolePlans: [makeRolePlan()],
        alignedActionsCount: 1,
        alignedActions: [{
          id: 'a1',
          type: 'VOLUNTEER_WORK',
          title: 'Hospital volunteering',
          completedAt: '2026-02-01',
          linkedToGoal: true,
        }],
        alignedActionReflections: [{
          id: 'r1',
          actionId: 'a1',
          prompt: 'What did you learn?',
          response: 'Learned about patient care',
          createdAt: '2026-02-05',
        }],
      }),
    },
  }),

  /** Partially through Discover (1 of 3 steps done) */
  partialDiscover: () => ({
    context: makeContext({
      confirmedStrengths: ['Communication', 'Teamwork', 'Problem Solving'],
    }),
    dbState: {
      journeyState: 'EXPLORE_CAREERS',
      journeyCompletedSteps: ['REFLECT_ON_STRENGTHS'],
      journeySummary: makeSummary({
        strengths: ['Communication', 'Teamwork', 'Problem Solving'],
      }),
    },
  }),

  /** Partially through Understand (halfway) */
  partialUnderstand: () => ({
    context: makeContext({
      confirmedStrengths: ['Communication', 'Teamwork', 'Problem Solving'],
      savedCareers: [{ id: '1', title: 'Doctor', savedAt: '2026-01-01' }],
      exploredRolesCount: 1,
      industryOutlookReviewed: true,
    }),
    dbState: {
      journeyState: 'CAREER_SHADOW',
      journeyCompletedSteps: [
        'REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE',
        'REVIEW_INDUSTRY_OUTLOOK',
      ],
      journeySummary: makeSummary({
        strengths: ['Communication', 'Teamwork', 'Problem Solving'],
        careerInterests: ['Doctor'],
        exploredRoles: [makeExploredRole()],
      }),
    },
  }),

  /** Corrupted state: DB says UNDERSTAND but context shows nothing complete */
  corrupted: () => ({
    context: makeContext(),
    dbState: {
      journeyState: 'CAREER_SHADOW',
      journeyCompletedSteps: ['REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE', 'REVIEW_INDUSTRY_OUTLOOK'],
      journeySummary: null as unknown as JourneySummary,
    },
  }),

  /** State with invalid/unknown journey state string */
  invalidState: () => ({
    context: makeContext(),
    dbState: {
      journeyState: 'NONEXISTENT_STATE',
      journeyCompletedSteps: [],
      journeySummary: DEFAULT_JOURNEY_SUMMARY,
    },
  }),
} as const;

// ============================================
// JOURNEY STATE ASSERTION UTILITY
// ============================================

export interface JourneyStateExpectation {
  stage?: JourneyLens;
  currentState?: JourneyStateId;
  progress?: {
    discover?: number;
    understand?: number;
    act?: number;
    overall?: number;
  };
  completedSteps?: JourneyStateId[];
  unlockedLenses?: JourneyLens[];
  lockedLenses?: JourneyLens[];
  stepStatuses?: Partial<Record<JourneyStateId, 'locked' | 'next' | 'completed' | 'skipped'>>;
}

/**
 * Standardized journey state assertion utility.
 * Used across all test suites to validate journey state consistently.
 */
export function assertJourneyState(
  uiState: JourneyUIState,
  expected: JourneyStateExpectation
): void {
  if (expected.stage !== undefined) {
    expect(uiState.currentLens).toBe(expected.stage);
  }

  if (expected.currentState !== undefined) {
    expect(uiState.currentState).toBe(expected.currentState);
  }

  if (expected.progress) {
    if (expected.progress.discover !== undefined) {
      expect(uiState.summary.lenses.discover.progress).toBe(expected.progress.discover);
    }
    if (expected.progress.understand !== undefined) {
      expect(uiState.summary.lenses.understand.progress).toBe(expected.progress.understand);
    }
    if (expected.progress.act !== undefined) {
      expect(uiState.summary.lenses.act.progress).toBe(expected.progress.act);
    }
  }

  if (expected.completedSteps) {
    for (const step of expected.completedSteps) {
      expect(uiState.completedSteps).toContain(step);
    }
  }

  if (expected.stepStatuses) {
    for (const [stepId, expectedStatus] of Object.entries(expected.stepStatuses)) {
      const step = uiState.steps.find((s) => s.id === stepId);
      expect(step, `Step ${stepId} should exist in UI state`).toBeDefined();
      expect(step!.status, `Step ${stepId} expected status=${expectedStatus}, got status=${step!.status}`).toBe(expectedStatus);
    }
  }
}

// ============================================
// ORCHESTRATOR FACTORY (shorthand)
// ============================================

export function createTestOrchestrator(
  preset: keyof typeof JOURNEY_PRESETS
): JourneyOrchestrator {
  const { context, dbState } = JOURNEY_PRESETS[preset]();
  return createOrchestrator(context, dbState);
}

/**
 * Walk a fresh orchestrator through a complete journey,
 * completing each step with valid data. Returns the final orchestrator.
 */
export function walkFullJourney(): JourneyOrchestrator {
  const preset = JOURNEY_PRESETS.empty();
  const orch = createOrchestrator(preset.context, preset.dbState);

  // Step 1: Reflect on Strengths
  orch.updateSummary(makeStrengthsData());
  orch.markStepCompleted('REFLECT_ON_STRENGTHS');
  orch.transitionTo('EXPLORE_CAREERS');

  // Step 2: Explore Careers
  orch.updateSummary(makeExploreCareersData());
  orch.markStepCompleted('EXPLORE_CAREERS');
  orch.transitionTo('ROLE_DEEP_DIVE');

  // Step 3: Role Deep Dive
  orch.updateSummary(makeRoleDeepDiveData());
  orch.markStepCompleted('ROLE_DEEP_DIVE');
  orch.transitionTo('REVIEW_INDUSTRY_OUTLOOK');

  // Step 4: Industry Outlook
  orch.updateSummary(makeIndustryOutlookData());
  orch.markStepCompleted('REVIEW_INDUSTRY_OUTLOOK');
  orch.transitionTo('CAREER_SHADOW');

  // Step 5: Career Shadow
  orch.updateSummary(makeCareerShadowData());
  orch.markStepCompleted('CAREER_SHADOW');
  orch.transitionTo('CREATE_ACTION_PLAN');

  // Step 6: Create Action Plan
  orch.updateSummary(makeActionPlanData());
  orch.markStepCompleted('CREATE_ACTION_PLAN');
  orch.transitionTo('COMPLETE_ALIGNED_ACTION');

  // Step 7: Complete Aligned Action
  orch.updateSummary(makeAlignedActionData());
  orch.markStepCompleted('COMPLETE_ALIGNED_ACTION');
  orch.transitionTo('SUBMIT_ACTION_REFLECTION');

  // Step 8: Submit Reflection
  orch.updateSummary(makeReflectionData());
  orch.markStepCompleted('SUBMIT_ACTION_REFLECTION');

  return orch;
}

// ============================================
// MOCK CAREERS
// ============================================

export const MOCK_CAREERS = {
  doctor: {
    id: 'doctor',
    title: 'Doctor',
    savedAt: '2026-01-01',
  },
  engineer: {
    id: 'engineer',
    title: 'Software Engineer',
    savedAt: '2026-01-02',
  },
  teacher: {
    id: 'teacher',
    title: 'Teacher',
    savedAt: '2026-01-03',
  },
  designer: {
    id: 'designer',
    title: 'UX Designer',
    savedAt: '2026-01-04',
  },
} as const;
