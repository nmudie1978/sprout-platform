/**
 * Integration Tests: Orchestrator User Flows
 *
 * Tests real user journeys through the orchestrator:
 * - First-time user flow
 * - Returning user with partial progress
 * - Full journey completion
 * - Multi-session resume behavior
 * - Summary data accumulation
 */

import { describe, it, expect } from 'vitest';
import { createOrchestrator } from '@/lib/journey/orchestrator';
import { DEFAULT_JOURNEY_SUMMARY } from '@/lib/journey/types';
import {
  makeContext,
  makeSummary,
  makeStrengthsData,
  makeExploreCareersData,
  makeRoleDeepDiveData,
  makeIndustryOutlookData,
  makeCareerShadowData,
  makeActionPlanData,
  makeAlignedActionData,
  makeReflectionData,
  makeUpdatePlanData,
  makeExternalFeedbackData,
  makeExploredRole,
  assertJourneyState,
  JOURNEY_PRESETS,
  walkFullJourney,
} from '../utils/test-helpers';

// ============================================
// FIRST-TIME USER FLOW
// ============================================

describe('First-Time User Flow', () => {
  it('starts at REFLECT_ON_STRENGTHS with zero progress', () => {
    const { context, dbState } = JOURNEY_PRESETS.empty();
    const orch = createOrchestrator(context, dbState);
    const ui = orch.getUIState();

    assertJourneyState(ui, {
      stage: 'DISCOVER',
      currentState: 'REFLECT_ON_STRENGTHS',
      completedSteps: [],
      stepStatuses: {
        REFLECT_ON_STRENGTHS: 'next',
        EXPLORE_CAREERS: 'locked',
        ROLE_DEEP_DIVE: 'locked',
        REVIEW_INDUSTRY_OUTLOOK: 'locked',
      },
    });
  });

  it('cannot advance without completing strengths reflection', () => {
    const { context, dbState } = JOURNEY_PRESETS.empty();
    const orch = createOrchestrator(context, dbState);

    const { canAdvance, reason } = orch.canAdvanceToNext();
    expect(canAdvance).toBe(false);
    expect(reason).toContain('strengths');
  });

  it('progresses through entire Discover stage', () => {
    const { context, dbState } = JOURNEY_PRESETS.empty();
    const orch = createOrchestrator(context, dbState);

    // Step 1: Strengths
    orch.updateSummary(makeStrengthsData());
    orch.markStepCompleted('REFLECT_ON_STRENGTHS');
    const t1 = orch.transitionTo('EXPLORE_CAREERS');
    expect(t1.success).toBe(true);
    expect(orch.getCurrentState()).toBe('EXPLORE_CAREERS');

    // Step 2: Explore Careers
    orch.updateSummary(makeExploreCareersData());
    orch.markStepCompleted('EXPLORE_CAREERS');
    const t2 = orch.transitionTo('ROLE_DEEP_DIVE');
    expect(t2.success).toBe(true);

    // Step 3: Role Deep Dive
    orch.updateSummary(makeRoleDeepDiveData());
    orch.markStepCompleted('ROLE_DEEP_DIVE');
    const t3 = orch.transitionTo('REVIEW_INDUSTRY_OUTLOOK');
    expect(t3.success).toBe(true);
    expect(orch.getCurrentLens()).toBe('UNDERSTAND');

    // Verify Discover is marked complete
    const ui = orch.getUIState();
    expect(ui.completedSteps).toContain('REFLECT_ON_STRENGTHS');
    expect(ui.completedSteps).toContain('EXPLORE_CAREERS');
    expect(ui.completedSteps).toContain('ROLE_DEEP_DIVE');
  });

  it('summary accumulates data correctly across Discover steps', () => {
    const { context, dbState } = JOURNEY_PRESETS.empty();
    const orch = createOrchestrator(context, dbState);

    orch.updateSummary(makeStrengthsData(['Creativity', 'Leadership', 'Analytical']));
    orch.markStepCompleted('REFLECT_ON_STRENGTHS');
    orch.transitionTo('EXPLORE_CAREERS');

    orch.updateSummary(makeExploreCareersData(['Doctor', 'Engineer']));
    orch.markStepCompleted('EXPLORE_CAREERS');

    const summary = orch.getSummary();
    expect(summary.strengths).toEqual(['Creativity', 'Leadership', 'Analytical']);
    expect(summary.careerInterests).toContain('Doctor');
    expect(summary.careerInterests).toContain('Engineer');
  });
});

// ============================================
// FULL JOURNEY COMPLETION
// ============================================

describe('Full Journey Completion', () => {
  it('completes entire journey from start to finish', () => {
    const orch = walkFullJourney();
    const ui = orch.getUIState();

    // All 8 mandatory steps should be completed
    expect(ui.completedSteps).toContain('REFLECT_ON_STRENGTHS');
    expect(ui.completedSteps).toContain('EXPLORE_CAREERS');
    expect(ui.completedSteps).toContain('ROLE_DEEP_DIVE');
    expect(ui.completedSteps).toContain('REVIEW_INDUSTRY_OUTLOOK');
    expect(ui.completedSteps).toContain('CAREER_SHADOW');
    expect(ui.completedSteps).toContain('CREATE_ACTION_PLAN');
    expect(ui.completedSteps).toContain('COMPLETE_ALIGNED_ACTION');
    expect(ui.completedSteps).toContain('SUBMIT_ACTION_REFLECTION');
  });

  it('includes optional steps when completed', () => {
    const orch = walkFullJourney();

    // Optional step: Update Plan
    orch.transitionTo('UPDATE_PLAN');
    orch.updateSummary(makeUpdatePlanData());
    orch.markStepCompleted('UPDATE_PLAN');

    // Optional step: External Feedback
    orch.transitionTo('EXTERNAL_FEEDBACK');
    orch.updateSummary(makeExternalFeedbackData());
    orch.markStepCompleted('EXTERNAL_FEEDBACK');

    const ui = orch.getUIState();
    expect(ui.completedSteps).toContain('UPDATE_PLAN');
    expect(ui.completedSteps).toContain('EXTERNAL_FEEDBACK');
  });

  it('summary contains all accumulated data after full journey', () => {
    const orch = walkFullJourney();
    const summary = orch.getSummary();

    // Discover data
    expect(summary.strengths.length).toBeGreaterThanOrEqual(3);
    expect(summary.careerInterests.length).toBeGreaterThanOrEqual(1);
    expect(summary.exploredRoles.length).toBeGreaterThanOrEqual(1);

    // Understand data
    expect(summary.roleRealityNotes.length).toBeGreaterThan(0);
    expect(summary.industryInsightNotes.length).toBeGreaterThan(0);
    expect(summary.pathQualifications.length).toBeGreaterThan(0);
    expect(summary.planCreated).toBe(true);
    expect(summary.rolePlans.length).toBeGreaterThan(0);

    // Act data
    expect(summary.alignedActionsCount).toBeGreaterThanOrEqual(1);
    expect(summary.alignedActionReflections.length).toBeGreaterThanOrEqual(1);
  });
});

// ============================================
// UNDERSTAND STAGE FLOW
// ============================================

describe('Understand Stage Flow', () => {
  it('opens at REVIEW_INDUSTRY_OUTLOOK after Discover completion', () => {
    const { context, dbState } = JOURNEY_PRESETS.discoverComplete();
    const orch = createOrchestrator(context, dbState);

    expect(orch.getCurrentState()).toBe('REVIEW_INDUSTRY_OUTLOOK');
    expect(orch.getCurrentLens()).toBe('UNDERSTAND');
  });

  it('accumulates path data through shadow and plan steps', () => {
    const { context, dbState } = JOURNEY_PRESETS.discoverComplete();
    const orch = createOrchestrator(context, dbState);

    // Industry Outlook
    orch.updateSummary(makeIndustryOutlookData());
    orch.markStepCompleted('REVIEW_INDUSTRY_OUTLOOK');
    orch.transitionTo('CAREER_SHADOW');

    // Career Shadow
    orch.updateSummary(makeCareerShadowData());
    orch.markStepCompleted('CAREER_SHADOW');
    orch.transitionTo('CREATE_ACTION_PLAN');

    const summary = orch.getSummary();
    expect(summary.pathQualifications).toContain('MBBS');
    expect(summary.pathSkills).toContain('Diagnosis');
    expect(summary.pathCourses).toContain('Biology A-Level');

    // Action Plan
    orch.updateSummary(makeActionPlanData());
    orch.markStepCompleted('CREATE_ACTION_PLAN');

    const finalSummary = orch.getSummary();
    expect(finalSummary.planCreated).toBe(true);
    expect(finalSummary.rolePlans.length).toBe(1);
    expect(finalSummary.rolePlans[0].roleTitle).toBe('Doctor');
    expect(finalSummary.nextActions.length).toBeGreaterThan(0);
  });
});

// ============================================
// ACT STAGE FLOW
// ============================================

describe('Act Stage Flow', () => {
  it('opens at COMPLETE_ALIGNED_ACTION after Understand completion', () => {
    const { context, dbState } = JOURNEY_PRESETS.understandComplete();
    const orch = createOrchestrator(context, dbState);

    expect(orch.getCurrentState()).toBe('COMPLETE_ALIGNED_ACTION');
    expect(orch.getCurrentLens()).toBe('ACT');
  });

  it('supports all aligned action types', () => {
    const actionTypes = [
      'SMALL_JOB',
      'CAREER_SHADOW',
      'PERSONAL_PROJECT',
      'COURSE_OR_CERTIFICATION',
      'INDUSTRY_EVENT',
      'VOLUNTEER_WORK',
      'MENTORSHIP_SESSION',
    ] as const;

    for (const actionType of actionTypes) {
      const { context, dbState } = JOURNEY_PRESETS.understandComplete();
      const orch = createOrchestrator(context, dbState);

      orch.updateSummary(makeAlignedActionData(actionType, `Test ${actionType}`));
      orch.markStepCompleted('COMPLETE_ALIGNED_ACTION');

      const summary = orch.getSummary();
      expect(summary.alignedActionsCount).toBeGreaterThanOrEqual(1);
      // Check the last added action (array may have prior entries from shared default)
      const lastAction = summary.alignedActions[summary.alignedActions.length - 1];
      expect(lastAction.type).toBe(actionType);
      expect(lastAction.title).toBe(`Test ${actionType}`);
    }
  });

  it('can complete Act with reflection (without optional steps)', () => {
    const { context, dbState } = JOURNEY_PRESETS.understandComplete();
    const orch = createOrchestrator(context, dbState);

    orch.updateSummary(makeAlignedActionData());
    orch.markStepCompleted('COMPLETE_ALIGNED_ACTION');
    orch.transitionTo('SUBMIT_ACTION_REFLECTION');

    orch.updateSummary(makeReflectionData());
    orch.markStepCompleted('SUBMIT_ACTION_REFLECTION');

    const ui = orch.getUIState();
    expect(ui.completedSteps).toContain('COMPLETE_ALIGNED_ACTION');
    expect(ui.completedSteps).toContain('SUBMIT_ACTION_REFLECTION');
  });
});

// ============================================
// RETURNING USER / MULTI-SESSION
// ============================================

describe('Returning User (Multi-Session Behavior)', () => {
  it('restores partial Discover progress correctly', () => {
    const { context, dbState } = JOURNEY_PRESETS.partialDiscover();
    const orch = createOrchestrator(context, dbState);
    const ui = orch.getUIState();

    assertJourneyState(ui, {
      currentState: 'EXPLORE_CAREERS',
      completedSteps: ['REFLECT_ON_STRENGTHS'],
      stepStatuses: {
        REFLECT_ON_STRENGTHS: 'completed',
        EXPLORE_CAREERS: 'next',
        ROLE_DEEP_DIVE: 'locked',
      },
    });
  });

  it('restores partial Understand progress correctly', () => {
    const { context, dbState } = JOURNEY_PRESETS.partialUnderstand();
    const orch = createOrchestrator(context, dbState);
    const ui = orch.getUIState();

    assertJourneyState(ui, {
      stage: 'UNDERSTAND',
      currentState: 'CAREER_SHADOW',
      completedSteps: [
        'REFLECT_ON_STRENGTHS',
        'EXPLORE_CAREERS',
        'ROLE_DEEP_DIVE',
        'REVIEW_INDUSTRY_OUTLOOK',
      ],
    });
  });

  it('allows user to revisit completed steps', () => {
    const { context, dbState } = JOURNEY_PRESETS.discoverComplete();
    const orch = createOrchestrator(context, dbState);

    // Revisit strengths reflection
    const result = orch.revisitStep('REFLECT_ON_STRENGTHS');
    expect(result.success).toBe(true);
    expect(orch.getCurrentState()).toBe('REFLECT_ON_STRENGTHS');

    // Can still see completed steps
    expect(orch.getCompletedSteps()).toContain('REFLECT_ON_STRENGTHS');
  });

  it('cannot revisit steps that were never completed', () => {
    const { context, dbState } = JOURNEY_PRESETS.partialDiscover();
    const orch = createOrchestrator(context, dbState);

    const result = orch.revisitStep('CREATE_ACTION_PLAN');
    expect(result.success).toBe(false);
    expect(result.error).toContain('not been completed');
  });

  it('preserves summary data when revisiting steps', () => {
    const { context, dbState } = JOURNEY_PRESETS.discoverComplete();
    const orch = createOrchestrator(context, dbState);

    const summaryBefore = orch.getSummary();
    orch.revisitStep('REFLECT_ON_STRENGTHS');
    const summaryAfter = orch.getSummary();

    expect(summaryAfter.strengths).toEqual(summaryBefore.strengths);
    expect(summaryAfter.careerInterests).toEqual(summaryBefore.careerInterests);
  });
});

// ============================================
// LENS TRANSITION BOUNDARIES
// ============================================

describe('Lens Transition Boundaries', () => {
  it('transitions from DISCOVER to UNDERSTAND correctly', () => {
    const { context, dbState } = JOURNEY_PRESETS.empty();
    const orch = createOrchestrator(context, dbState);

    // Complete all DISCOVER steps
    orch.updateSummary(makeStrengthsData());
    orch.markStepCompleted('REFLECT_ON_STRENGTHS');
    orch.transitionTo('EXPLORE_CAREERS');

    orch.updateSummary(makeExploreCareersData());
    orch.markStepCompleted('EXPLORE_CAREERS');
    orch.transitionTo('ROLE_DEEP_DIVE');

    orch.updateSummary(makeRoleDeepDiveData());
    orch.markStepCompleted('ROLE_DEEP_DIVE');

    // Transition to UNDERSTAND
    const result = orch.transitionTo('REVIEW_INDUSTRY_OUTLOOK');
    expect(result.success).toBe(true);
    expect(orch.getCurrentLens()).toBe('UNDERSTAND');
  });

  it('transitions from UNDERSTAND to ACT correctly', () => {
    const { context, dbState } = JOURNEY_PRESETS.discoverComplete();
    const orch = createOrchestrator(context, dbState);

    orch.updateSummary(makeIndustryOutlookData());
    orch.markStepCompleted('REVIEW_INDUSTRY_OUTLOOK');
    orch.transitionTo('CAREER_SHADOW');

    orch.updateSummary(makeCareerShadowData());
    orch.markStepCompleted('CAREER_SHADOW');
    orch.transitionTo('CREATE_ACTION_PLAN');

    orch.updateSummary(makeActionPlanData());
    orch.markStepCompleted('CREATE_ACTION_PLAN');

    const result = orch.transitionTo('COMPLETE_ALIGNED_ACTION');
    expect(result.success).toBe(true);
    expect(orch.getCurrentLens()).toBe('ACT');
  });

  it('blocks forward transition when current step not complete', () => {
    const { context, dbState } = JOURNEY_PRESETS.empty();
    const orch = createOrchestrator(context, dbState);

    // Try to jump to EXPLORE_CAREERS without completing strengths
    const result = orch.transitionTo('EXPLORE_CAREERS');
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });
});

// ============================================
// OPTIONAL STEP FLOWS
// ============================================

describe('Optional Step Flows', () => {
  it('can skip UPDATE_PLAN', () => {
    const orch = walkFullJourney();
    orch.transitionTo('UPDATE_PLAN');

    const result = orch.skipStep('UPDATE_PLAN', 'Not needed right now');
    expect(result.success).toBe(true);
    expect(orch.isStepSkipped('UPDATE_PLAN')).toBe(true);
  });

  it('can skip EXTERNAL_FEEDBACK', () => {
    const orch = walkFullJourney();
    orch.transitionTo('UPDATE_PLAN');
    orch.skipStep('UPDATE_PLAN', 'Skipping');
    orch.transitionTo('EXTERNAL_FEEDBACK');

    const result = orch.skipStep('EXTERNAL_FEEDBACK', 'No mentor available');
    expect(result.success).toBe(true);
    expect(orch.isStepSkipped('EXTERNAL_FEEDBACK')).toBe(true);
  });

  it('cannot skip mandatory steps', () => {
    const { context, dbState } = JOURNEY_PRESETS.empty();
    const orch = createOrchestrator(context, dbState);

    const result = orch.skipStep('REFLECT_ON_STRENGTHS', 'I want to skip');
    expect(result.success).toBe(false);
    expect(result.error).toContain('optional');
  });

  it('skipped steps show correct status in UI', () => {
    const orch = walkFullJourney();
    orch.transitionTo('UPDATE_PLAN');
    orch.skipStep('UPDATE_PLAN', 'Skipping');

    const ui = orch.getUIState();
    const updatePlanStep = ui.steps.find((s) => s.id === 'UPDATE_PLAN');
    expect(updatePlanStep?.status).toBe('skipped');
    expect(updatePlanStep?.skipReason).toBe('Skipping');
  });
});

// ============================================
// BACKWARD NAVIGATION
// ============================================

describe('Backward Navigation', () => {
  it('allows transitioning to any earlier state', () => {
    const { context, dbState } = JOURNEY_PRESETS.understandComplete();
    const orch = createOrchestrator(context, dbState);

    // Go back to REFLECT_ON_STRENGTHS from ACT
    const result = orch.transitionTo('REFLECT_ON_STRENGTHS');
    expect(result.success).toBe(true);
    expect(orch.getCurrentState()).toBe('REFLECT_ON_STRENGTHS');
    expect(orch.getCurrentLens()).toBe('DISCOVER');
  });

  it('does not remove completed steps when going backward', () => {
    const { context, dbState } = JOURNEY_PRESETS.understandComplete();
    const orch = createOrchestrator(context, dbState);

    const completedBefore = orch.getCompletedSteps().length;
    orch.transitionTo('REFLECT_ON_STRENGTHS');
    const completedAfter = orch.getCompletedSteps().length;

    expect(completedAfter).toBe(completedBefore);
  });
});
