/**
 * Regression Tests: Things That Must Never Break
 *
 * These tests encode critical invariants of the journey system.
 * If any of these fail, there is a serious product-level bug.
 */

import { describe, it, expect } from 'vitest';
import { createOrchestrator } from '@/lib/journey/orchestrator';
import {
  JOURNEY_STATE_DEFINITIONS,
  calculateLensProgress,
  canEnterState,
  hasCompletedState,
  isOptionalState,
  canTransition,
} from '@/lib/journey/state-machine';
import {
  canAccessLens,
  JOURNEY_STATES,
  JOURNEY_STATE_CONFIG,
  MANDATORY_STATES,
  OPTIONAL_JOURNEY_STATES,
  DEFAULT_JOURNEY_SUMMARY,
  type JourneyStateId,
  type JourneyLens,
} from '@/lib/journey/types';
import {
  makeContext,
  JOURNEY_PRESETS,
  assertJourneyState,
} from '../utils/test-helpers';

// ============================================
// INVARIANT: DISCOVER MUST COMPLETE BEFORE UNDERSTAND
// ============================================

describe('INVARIANT: Discover must complete before Understand unlocks', () => {
  it('cannot access UNDERSTAND without all 3 DISCOVER steps', () => {
    // Only 2 of 3 Discover steps done
    const completedSteps: JourneyStateId[] = ['REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS'];
    const { canAccess } = canAccessLens('UNDERSTAND', completedSteps);
    expect(canAccess).toBe(false);
  });

  it('can access UNDERSTAND when all 3 DISCOVER steps done', () => {
    const completedSteps: JourneyStateId[] = ['REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE'];
    const { canAccess } = canAccessLens('UNDERSTAND', completedSteps);
    expect(canAccess).toBe(true);
  });

  it('cannot enter REVIEW_INDUSTRY_OUTLOOK without ROLE_DEEP_DIVE complete', () => {
    const ctx = makeContext({
      confirmedStrengths: ['A', 'B', 'C'],
      savedCareers: [{ id: '1', title: 'Doctor', savedAt: '' }],
      exploredRolesCount: 0, // Role deep dive NOT done
    });
    expect(canEnterState('REVIEW_INDUSTRY_OUTLOOK', ctx)).toBe(false);
  });
});

// ============================================
// INVARIANT: UNDERSTAND MUST COMPLETE BEFORE ACT
// ============================================

describe('INVARIANT: Understand must complete before Act unlocks', () => {
  it('cannot access ACT without all UNDERSTAND steps', () => {
    const completedSteps: JourneyStateId[] = [
      'REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE',
      'REVIEW_INDUSTRY_OUTLOOK', 'CAREER_SHADOW',
      // Missing CREATE_ACTION_PLAN
    ];
    const { canAccess } = canAccessLens('ACT', completedSteps);
    expect(canAccess).toBe(false);
  });

  it('can access ACT when all DISCOVER + UNDERSTAND steps done', () => {
    const completedSteps: JourneyStateId[] = [
      'REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE',
      'REVIEW_INDUSTRY_OUTLOOK', 'CAREER_SHADOW', 'CREATE_ACTION_PLAN',
    ];
    const { canAccess } = canAccessLens('ACT', completedSteps);
    expect(canAccess).toBe(true);
  });
});

// ============================================
// INVARIANT: DISCOVER COMPLETION NEVER RESETS
// ============================================

describe('INVARIANT: Discover completion is preserved', () => {
  it('Discover progress stays at 100% after transitioning to Understand', () => {
    const { context, dbState } = JOURNEY_PRESETS.discoverComplete();
    const orch = createOrchestrator(context, dbState);

    // Now in Understand - Discover should still be fully complete
    const ui = orch.getUIState();
    expect(ui.completedSteps).toContain('REFLECT_ON_STRENGTHS');
    expect(ui.completedSteps).toContain('EXPLORE_CAREERS');
    expect(ui.completedSteps).toContain('ROLE_DEEP_DIVE');
  });

  it('Discover progress survives backward navigation', () => {
    const { context, dbState } = JOURNEY_PRESETS.discoverComplete();
    const orch = createOrchestrator(context, dbState);

    // Navigate backward
    orch.revisitStep('REFLECT_ON_STRENGTHS');

    // Discover steps still completed
    expect(orch.isStepCompleted('REFLECT_ON_STRENGTHS')).toBe(true);
    expect(orch.isStepCompleted('EXPLORE_CAREERS')).toBe(true);
    expect(orch.isStepCompleted('ROLE_DEEP_DIVE')).toBe(true);
  });
});

// ============================================
// INVARIANT: UNDERSTAND CANNOT UNLOCK EARLY
// ============================================

describe('INVARIANT: Understand cannot unlock early', () => {
  it('all UNDERSTAND step statuses are locked when DISCOVER is incomplete', () => {
    const { context, dbState } = JOURNEY_PRESETS.partialDiscover();
    const orch = createOrchestrator(context, dbState);
    const ui = orch.getUIState();

    const understandSteps = ui.steps.filter(
      (s) => ['REVIEW_INDUSTRY_OUTLOOK', 'CAREER_SHADOW', 'CREATE_ACTION_PLAN'].includes(s.id)
    );

    for (const step of understandSteps) {
      expect(step.status, `${step.id} should be locked`).toBe('locked');
    }
  });
});

// ============================================
// INVARIANT: GROW/ACT LOCKED UNTIL PREREQUISITES MET
// ============================================

describe('INVARIANT: Grow remains locked until rules satisfied', () => {
  it('all ACT step statuses are locked when only DISCOVER is complete', () => {
    const { context, dbState } = JOURNEY_PRESETS.discoverComplete();
    const orch = createOrchestrator(context, dbState);
    const ui = orch.getUIState();

    const actSteps = ui.steps.filter(
      (s) => ['COMPLETE_ALIGNED_ACTION', 'SUBMIT_ACTION_REFLECTION', 'UPDATE_PLAN', 'EXTERNAL_FEEDBACK'].includes(s.id)
    );

    for (const step of actSteps) {
      expect(step.status, `${step.id} should be locked`).toBe('locked');
    }
  });
});

// ============================================
// INVARIANT: MANDATORY STEPS CANNOT BE SKIPPED
// ============================================

describe('INVARIANT: Mandatory steps cannot be skipped', () => {
  it('all 8 mandatory states are marked mandatory in definitions', () => {
    const mandatoryStates: JourneyStateId[] = [
      'REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE',
      'REVIEW_INDUSTRY_OUTLOOK', 'CAREER_SHADOW', 'CREATE_ACTION_PLAN',
      'COMPLETE_ALIGNED_ACTION', 'SUBMIT_ACTION_REFLECTION',
    ];

    for (const state of mandatoryStates) {
      expect(JOURNEY_STATE_DEFINITIONS[state].mandatory, `${state} must be mandatory`).toBe(true);
      expect(isOptionalState(state), `${state} must not be optional`).toBe(false);
    }
  });

  it('skip attempt on mandatory step fails at orchestrator level', () => {
    const { context, dbState } = JOURNEY_PRESETS.empty();
    const orch = createOrchestrator(context, dbState);

    const result = orch.skipStep('REFLECT_ON_STRENGTHS', 'I want to skip');
    expect(result.success).toBe(false);
  });
});

// ============================================
// INVARIANT: STATE DEFINITIONS ARE CONSISTENT
// ============================================

describe('INVARIANT: State definition consistency', () => {
  it('exactly 10 states are defined', () => {
    expect(JOURNEY_STATES.length).toBe(10);
    expect(Object.keys(JOURNEY_STATE_DEFINITIONS).length).toBe(10);
    expect(Object.keys(JOURNEY_STATE_CONFIG).length).toBe(10);
  });

  it('8 mandatory + 2 optional = 10 total', () => {
    const mandatoryCount = JOURNEY_STATES.filter((s) => JOURNEY_STATE_CONFIG[s].mandatory).length;
    const optionalCount = JOURNEY_STATES.filter((s) => !JOURNEY_STATE_CONFIG[s].mandatory).length;

    expect(mandatoryCount).toBe(8);
    expect(optionalCount).toBe(2);
    expect(OPTIONAL_JOURNEY_STATES.length).toBe(2);
  });

  it('DISCOVER has 3 mandatory states', () => {
    expect(MANDATORY_STATES.DISCOVER.length).toBe(3);
  });

  it('UNDERSTAND has 3 mandatory states', () => {
    expect(MANDATORY_STATES.UNDERSTAND.length).toBe(3);
  });

  it('ACT has 2 mandatory states', () => {
    expect(MANDATORY_STATES.ACT.length).toBe(2);
  });

  it('order values are sequential 0 through 9', () => {
    for (let i = 0; i < JOURNEY_STATES.length; i++) {
      expect(JOURNEY_STATE_DEFINITIONS[JOURNEY_STATES[i]].order).toBe(i);
    }
  });

  it('all transition targets are valid state IDs', () => {
    const validIds = new Set(JOURNEY_STATES);
    for (const state of JOURNEY_STATES) {
      for (const target of JOURNEY_STATE_DEFINITIONS[state].allowedTransitions) {
        expect(validIds.has(target), `Invalid transition target: ${target}`).toBe(true);
      }
    }
  });

  it('each non-terminal state transitions to the next in order', () => {
    for (let i = 0; i < JOURNEY_STATES.length - 1; i++) {
      const current = JOURNEY_STATES[i];
      const next = JOURNEY_STATES[i + 1];
      expect(
        JOURNEY_STATE_DEFINITIONS[current].allowedTransitions,
        `${current} should transition to ${next}`
      ).toContain(next);
    }
  });

  it('EXTERNAL_FEEDBACK is terminal (no transitions)', () => {
    expect(JOURNEY_STATE_DEFINITIONS['EXTERNAL_FEEDBACK'].allowedTransitions).toHaveLength(0);
  });

  it('SUBMIT_ACTION_REFLECTION branches to both optional states', () => {
    const transitions = JOURNEY_STATE_DEFINITIONS['SUBMIT_ACTION_REFLECTION'].allowedTransitions;
    expect(transitions).toContain('UPDATE_PLAN');
    expect(transitions).toContain('EXTERNAL_FEEDBACK');
  });

  it('JOURNEY_STATE_CONFIG matches JOURNEY_STATE_DEFINITIONS mandatory flag', () => {
    for (const state of JOURNEY_STATES) {
      expect(JOURNEY_STATE_CONFIG[state].mandatory).toBe(
        JOURNEY_STATE_DEFINITIONS[state].mandatory
      );
    }
  });
});

// ============================================
// INVARIANT: PROGRESS CANNOT EXCEED 100%
// ============================================

describe('INVARIANT: Progress never exceeds 100%', () => {
  it('DISCOVER progress caps at 100%', () => {
    const ctx = makeContext({
      confirmedStrengths: Array.from({ length: 50 }, (_, i) => `Strength ${i}`),
      savedCareers: Array.from({ length: 10 }, (_, i) => ({
        id: String(i),
        title: `Career ${i}`,
        savedAt: '',
      })),
      exploredRolesCount: 20,
    });
    const p = calculateLensProgress('DISCOVER', ctx);
    expect(p.progress).toBeLessThanOrEqual(100);
    expect(p.progress).toBe(100);
  });

  it('ACT progress caps at 100% even with all optional steps', () => {
    const ctx = makeContext({
      alignedActionsCompleted: 100,
      actionReflectionsSubmitted: 50,
      planUpdatedAfterAction: true,
      externalFeedbackReceived: true,
    });
    const p = calculateLensProgress('ACT', ctx);
    expect(p.progress).toBe(100);
  });
});

// ============================================
// INVARIANT: DEFAULT SUMMARY IS SAFE
// ============================================

describe('INVARIANT: Default journey summary is well-formed', () => {
  it('has all required lens fields', () => {
    const s = DEFAULT_JOURNEY_SUMMARY;
    expect(s.lenses.discover).toBeDefined();
    expect(s.lenses.understand).toBeDefined();
    expect(s.lenses.act).toBeDefined();
  });

  it('starts with zero progress', () => {
    const s = DEFAULT_JOURNEY_SUMMARY;
    expect(s.overallProgress).toBe(0);
    expect(s.lenses.discover.progress).toBe(0);
    expect(s.lenses.understand.progress).toBe(0);
    expect(s.lenses.act.progress).toBe(0);
  });

  it('starts with empty arrays', () => {
    const s = DEFAULT_JOURNEY_SUMMARY;
    expect(s.strengths).toEqual([]);
    expect(s.careerInterests).toEqual([]);
    expect(s.exploredRoles).toEqual([]);
    expect(s.rolePlans).toEqual([]);
    expect(s.alignedActions).toEqual([]);
    expect(s.alignedActionReflections).toEqual([]);
  });

  it('has null primary goal', () => {
    const s = DEFAULT_JOURNEY_SUMMARY;
    expect(s.primaryGoal.title).toBeNull();
    expect(s.primaryGoal.selectedAt).toBeNull();
  });

  it('planCreated is false', () => {
    expect(DEFAULT_JOURNEY_SUMMARY.planCreated).toBe(false);
  });
});

// ============================================
// INVARIANT: canAccessLens ALWAYS allows DISCOVER
// ============================================

describe('INVARIANT: DISCOVER is always accessible', () => {
  it('can access DISCOVER with no completed steps', () => {
    expect(canAccessLens('DISCOVER', []).canAccess).toBe(true);
  });

  it('can access DISCOVER with all steps completed', () => {
    expect(canAccessLens('DISCOVER', [...JOURNEY_STATES] as JourneyStateId[]).canAccess).toBe(true);
  });

  it('first state REFLECT_ON_STRENGTHS is always enterable', () => {
    expect(canEnterState('REFLECT_ON_STRENGTHS', makeContext())).toBe(true);
  });
});
