/**
 * Edge Case & Boundary Tests
 *
 * Tests unusual, extreme, and error-prone scenarios:
 * - Minimum / maximum data boundaries
 * - Rapid state changes
 * - Concurrent-like operations
 * - Empty and oversized inputs
 * - State machine edge cases
 */

import { describe, it, expect } from 'vitest';
import { createOrchestrator, validateStepCompletionData } from '@/lib/journey/orchestrator';
import {
  calculateLensProgress,
  canEnterState,
  hasCompletedState,
  canTransition,
  canSkipState,
  determineCurrentState,
  getNextState,
  getStatesUpTo,
} from '@/lib/journey/state-machine';
import { JOURNEY_STATES, DEFAULT_JOURNEY_SUMMARY, type JourneyStateId, type SkippedStepsMap } from '@/lib/journey/types';
import {
  makeContext,
  makeSummary,
  makeStrengthsData,
  makeExploreCareersData,
  makeRoleDeepDiveData,
  makeExploredRole,
  makeRolePlan,
  JOURNEY_PRESETS,
  MOCK_CAREERS,
} from '../utils/test-helpers';

// ============================================
// MINIMUM BOUNDARIES
// ============================================

describe('Minimum Data Boundaries', () => {
  it('requires exactly 3 strengths (not 2)', () => {
    const ctx = makeContext({ confirmedStrengths: ['A', 'B'] });
    expect(hasCompletedState('REFLECT_ON_STRENGTHS', ctx)).toBe(false);
  });

  it('requires exactly 3 strengths (passes at 3)', () => {
    const ctx = makeContext({ confirmedStrengths: ['A', 'B', 'C'] });
    expect(hasCompletedState('REFLECT_ON_STRENGTHS', ctx)).toBe(true);
  });

  it('requires at least 1 saved career', () => {
    const ctx = makeContext({ savedCareers: [] });
    expect(hasCompletedState('EXPLORE_CAREERS', ctx)).toBe(false);

    const ctxWithCareer = makeContext({
      savedCareers: [MOCK_CAREERS.doctor],
    });
    expect(hasCompletedState('EXPLORE_CAREERS', ctxWithCareer)).toBe(true);
  });

  it('requires at least 1 explored role', () => {
    const ctx = makeContext({ exploredRolesCount: 0 });
    expect(hasCompletedState('ROLE_DEEP_DIVE', ctx)).toBe(false);

    const ctxWith = makeContext({ exploredRolesCount: 1 });
    expect(hasCompletedState('ROLE_DEEP_DIVE', ctxWith)).toBe(true);
  });

  it('requires at least 1 aligned action', () => {
    const ctx = makeContext({ alignedActionsCompleted: 0 });
    expect(hasCompletedState('COMPLETE_ALIGNED_ACTION', ctx)).toBe(false);

    const ctxWith = makeContext({ alignedActionsCompleted: 1 });
    expect(hasCompletedState('COMPLETE_ALIGNED_ACTION', ctxWith)).toBe(true);
  });

  it('requires at least 1 action reflection', () => {
    const ctx = makeContext({ actionReflectionsSubmitted: 0 });
    expect(hasCompletedState('SUBMIT_ACTION_REFLECTION', ctx)).toBe(false);

    const ctxWith = makeContext({ actionReflectionsSubmitted: 1 });
    expect(hasCompletedState('SUBMIT_ACTION_REFLECTION', ctxWith)).toBe(true);
  });
});

// ============================================
// ABOVE-MINIMUM (ACCEPTS MORE)
// ============================================

describe('Above-Minimum Data (Accepts More)', () => {
  it('accepts more than 3 strengths', () => {
    const ctx = makeContext({
      confirmedStrengths: ['A', 'B', 'C', 'D', 'E', 'F'],
    });
    expect(hasCompletedState('REFLECT_ON_STRENGTHS', ctx)).toBe(true);
  });

  it('accepts multiple saved careers', () => {
    const ctx = makeContext({
      savedCareers: [MOCK_CAREERS.doctor, MOCK_CAREERS.engineer, MOCK_CAREERS.teacher],
    });
    expect(hasCompletedState('EXPLORE_CAREERS', ctx)).toBe(true);
  });

  it('accepts many aligned actions', () => {
    const ctx = makeContext({ alignedActionsCompleted: 10 });
    expect(hasCompletedState('COMPLETE_ALIGNED_ACTION', ctx)).toBe(true);
  });
});

// ============================================
// RAPID STATE TRANSITIONS
// ============================================

describe('Rapid State Changes', () => {
  it('handles rapid forward-backward-forward transitions', () => {
    const { context, dbState } = JOURNEY_PRESETS.discoverComplete();
    const orch = createOrchestrator(context, dbState);

    // Forward to industry outlook
    orch.updateSummary({
      type: 'REVIEW_INDUSTRY_OUTLOOK',
      trendsReviewed: ['a', 'b', 'c'],
      outlookNotes: ['x'],
    });
    orch.markStepCompleted('REVIEW_INDUSTRY_OUTLOOK');
    orch.transitionTo('CAREER_SHADOW');
    expect(orch.getCurrentState()).toBe('CAREER_SHADOW');

    // Go back to strengths
    orch.revisitStep('REFLECT_ON_STRENGTHS');
    expect(orch.getCurrentState()).toBe('REFLECT_ON_STRENGTHS');

    // Go back forward — revisit the completed REVIEW_INDUSTRY_OUTLOOK
    orch.revisitStep('REVIEW_INDUSTRY_OUTLOOK');
    expect(orch.getCurrentState()).toBe('REVIEW_INDUSTRY_OUTLOOK');
    expect(orch.getCompletedSteps()).toContain('REVIEW_INDUSTRY_OUTLOOK');
  });

  it('handles transitioning to same state (no-op)', () => {
    const { context, dbState } = JOURNEY_PRESETS.partialDiscover();
    const orch = createOrchestrator(context, dbState);

    const result = orch.transitionTo('EXPLORE_CAREERS');
    expect(result.success).toBe(true);
    expect(orch.getCurrentState()).toBe('EXPLORE_CAREERS');
  });

  it('handles multiple markStepCompleted calls for same step', () => {
    const { context, dbState } = JOURNEY_PRESETS.empty();
    const orch = createOrchestrator(context, dbState);

    orch.updateSummary(makeStrengthsData());
    orch.markStepCompleted('REFLECT_ON_STRENGTHS');
    orch.markStepCompleted('REFLECT_ON_STRENGTHS'); // Duplicate

    const completed = orch.getCompletedSteps();
    const count = completed.filter((s) => s === 'REFLECT_ON_STRENGTHS').length;
    expect(count).toBe(1); // No duplicates in completed steps
  });
});

// ============================================
// CAREER SHADOW ALTERNATIVE COMPLETION
// ============================================

describe('Career Shadow Completion Paths', () => {
  it('completes via shadow request', () => {
    const ctx = makeContext({ shadowsCompleted: 1 });
    expect(hasCompletedState('CAREER_SHADOW', ctx)).toBe(true);
  });

  it('completes via path data saved (alternative path)', () => {
    const ctx = makeContext({ pathDataSaved: true });
    expect(hasCompletedState('CAREER_SHADOW', ctx)).toBe(true);
  });

  it('does not complete without either condition', () => {
    const ctx = makeContext({ shadowsCompleted: 0, pathDataSaved: false });
    expect(hasCompletedState('CAREER_SHADOW', ctx)).toBe(false);
  });
});

// ============================================
// VALIDATION EDGE CASES
// ============================================

describe('Step Completion Validation Edge Cases', () => {
  it('rejects strengths with fewer than 3', () => {
    const result = validateStepCompletionData('REFLECT_ON_STRENGTHS', {
      type: 'REFLECT_ON_STRENGTHS',
      topStrengths: ['A', 'B'],
      demonstratedSkills: [],
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('3 strengths');
  });

  it('rejects empty career selection', () => {
    const result = validateStepCompletionData('EXPLORE_CAREERS', {
      type: 'EXPLORE_CAREERS',
      selectedCareers: [],
    });
    expect(result.valid).toBe(false);
  });

  it('rejects role deep dive without title', () => {
    const result = validateStepCompletionData('ROLE_DEEP_DIVE', {
      type: 'ROLE_DEEP_DIVE',
      role: { ...makeExploredRole(), title: '' },
    });
    expect(result.valid).toBe(false);
  });

  it('rejects industry outlook with fewer than 3 trends', () => {
    const result = validateStepCompletionData('REVIEW_INDUSTRY_OUTLOOK', {
      type: 'REVIEW_INDUSTRY_OUTLOOK',
      trendsReviewed: ['one', 'two'],
      outlookNotes: [],
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('3 industry trends');
  });

  it('rejects action plan with fewer than 2 short-term actions', () => {
    const result = validateStepCompletionData('CREATE_ACTION_PLAN', {
      type: 'CREATE_ACTION_PLAN',
      plan: {
        ...makeRolePlan(),
        shortTermActions: ['Just one'],
      },
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('2 short-term');
  });

  it('rejects action plan without mid-term milestone', () => {
    const result = validateStepCompletionData('CREATE_ACTION_PLAN', {
      type: 'CREATE_ACTION_PLAN',
      plan: {
        ...makeRolePlan(),
        midTermMilestone: '',
      },
    });
    expect(result.valid).toBe(false);
  });

  it('rejects action plan without skill to build', () => {
    const result = validateStepCompletionData('CREATE_ACTION_PLAN', {
      type: 'CREATE_ACTION_PLAN',
      plan: {
        ...makeRolePlan(),
        skillToBuild: '',
      },
    });
    expect(result.valid).toBe(false);
  });

  it('rejects career shadow with all empty fields', () => {
    const result = validateStepCompletionData('CAREER_SHADOW', {
      type: 'CAREER_SHADOW',
      qualifications: [],
      keySkills: [],
      courses: [],
      requirements: [],
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('at least one');
  });

  it('accepts career shadow with just qualifications', () => {
    const result = validateStepCompletionData('CAREER_SHADOW', {
      type: 'CAREER_SHADOW',
      qualifications: ['MBBS'],
      keySkills: [],
      courses: [],
      requirements: [],
    });
    expect(result.valid).toBe(true);
  });

  it('rejects aligned action without type', () => {
    const result = validateStepCompletionData('COMPLETE_ALIGNED_ACTION', {
      type: 'COMPLETE_ALIGNED_ACTION',
      actionType: '' as unknown as 'SMALL_JOB',
      actionId: 'a1',
      actionTitle: 'test',
      linkedToGoal: true,
    });
    expect(result.valid).toBe(false);
  });

  it('rejects empty reflection response', () => {
    const result = validateStepCompletionData('SUBMIT_ACTION_REFLECTION', {
      type: 'SUBMIT_ACTION_REFLECTION',
      actionId: 'a1',
      reflectionResponse: '',
    });
    expect(result.valid).toBe(false);
  });

  it('rejects whitespace-only reflection response', () => {
    const result = validateStepCompletionData('SUBMIT_ACTION_REFLECTION', {
      type: 'SUBMIT_ACTION_REFLECTION',
      actionId: 'a1',
      reflectionResponse: '   ',
    });
    expect(result.valid).toBe(false);
  });

  it('rejects type mismatch between stepId and data.type', () => {
    const result = validateStepCompletionData('REFLECT_ON_STRENGTHS', {
      type: 'EXPLORE_CAREERS',
      selectedCareers: ['Doctor'],
    } as unknown as Parameters<typeof validateStepCompletionData>[1]);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('mismatch');
  });
});

// ============================================
// STATE MACHINE UTILITIES EDGE CASES
// ============================================

describe('State Machine Utility Edge Cases', () => {
  it('getNextState returns null for last state', () => {
    const next = getNextState('EXTERNAL_FEEDBACK');
    expect(next).toBeNull();
  });

  it('getStatesUpTo returns correct slice for each state', () => {
    const upToFirst = getStatesUpTo('REFLECT_ON_STRENGTHS');
    expect(upToFirst).toEqual(['REFLECT_ON_STRENGTHS']);

    const upToThird = getStatesUpTo('ROLE_DEEP_DIVE');
    expect(upToThird).toEqual(['REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE']);

    const upToLast = getStatesUpTo('EXTERNAL_FEEDBACK');
    expect(upToLast).toEqual([...JOURNEY_STATES]);
  });

  it('determineCurrentState returns first state for empty context', () => {
    const ctx = makeContext();
    expect(determineCurrentState(ctx)).toBe('REFLECT_ON_STRENGTHS');
  });

  it('determineCurrentState advances past all completed steps', () => {
    const ctx = makeContext({
      confirmedStrengths: ['A', 'B', 'C'],
      savedCareers: [MOCK_CAREERS.doctor],
      exploredRolesCount: 1,
      industryOutlookReviewed: true,
    });
    // Should advance past DISCOVER + first UNDERSTAND step
    const state = determineCurrentState(ctx);
    expect(state).toBe('CAREER_SHADOW');
  });

  it('canSkipState returns false for all mandatory states', () => {
    const mandatory: JourneyStateId[] = [
      'REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE',
      'REVIEW_INDUSTRY_OUTLOOK', 'CAREER_SHADOW', 'CREATE_ACTION_PLAN',
      'COMPLETE_ALIGNED_ACTION', 'SUBMIT_ACTION_REFLECTION',
    ];

    for (const state of mandatory) {
      const { canSkip } = canSkipState(state, makeContext());
      expect(canSkip, `${state} should not be skippable`).toBe(false);
    }
  });

  it('canSkipState returns true for optional states', () => {
    const optional: JourneyStateId[] = ['UPDATE_PLAN', 'EXTERNAL_FEEDBACK'];

    for (const state of optional) {
      const { canSkip } = canSkipState(state, makeContext());
      expect(canSkip, `${state} should be skippable`).toBe(true);
    }
  });
});

// ============================================
// LENS PROGRESS BOUNDARY
// ============================================

describe('Lens Progress Boundaries', () => {
  it('DISCOVER progress: 0% -> 33% -> 67% -> 100%', () => {
    // 0%
    let ctx = makeContext();
    let p = calculateLensProgress('DISCOVER', ctx);
    expect(p.progress).toBe(0);

    // 33%
    ctx = makeContext({ confirmedStrengths: ['A', 'B', 'C'] });
    p = calculateLensProgress('DISCOVER', ctx);
    expect(p.progress).toBe(33);

    // 67%
    ctx = makeContext({
      confirmedStrengths: ['A', 'B', 'C'],
      savedCareers: [MOCK_CAREERS.doctor],
    });
    p = calculateLensProgress('DISCOVER', ctx);
    expect(p.progress).toBe(67);

    // 100%
    ctx = makeContext({
      confirmedStrengths: ['A', 'B', 'C'],
      savedCareers: [MOCK_CAREERS.doctor],
      exploredRolesCount: 1,
    });
    p = calculateLensProgress('DISCOVER', ctx);
    expect(p.progress).toBe(100);
  });

  it('ACT progress: 0% -> 50% -> 100% (mandatory only)', () => {
    let ctx = makeContext();
    let p = calculateLensProgress('ACT', ctx);
    expect(p.progress).toBe(0);

    ctx = makeContext({ alignedActionsCompleted: 1 });
    p = calculateLensProgress('ACT', ctx);
    expect(p.progress).toBe(50);

    ctx = makeContext({ alignedActionsCompleted: 1, actionReflectionsSubmitted: 1 });
    p = calculateLensProgress('ACT', ctx);
    expect(p.progress).toBe(100);
  });

  it('optional ACT steps do not change mandatory progress', () => {
    const ctx = makeContext({
      planUpdatedAfterAction: true,
      externalFeedbackReceived: true,
    });
    const p = calculateLensProgress('ACT', ctx);
    expect(p.progress).toBe(0); // Optional steps don't contribute
  });
});
