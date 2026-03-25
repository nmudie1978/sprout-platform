/**
 * Journey Health Check
 *
 * A comprehensive diagnostic test suite that validates the structural
 * integrity of the journey system. Run this to confirm:
 *
 * - All state definitions are consistent
 * - Transition chain is complete and valid
 * - Config matches definitions
 * - No orphaned or unreachable states
 * - Progress calculations are deterministic
 * - Factory defaults are safe
 *
 * This is designed to run in CI/CD as a gate — if any of these fail,
 * the journey system has a structural problem that must be fixed before deploy.
 */

import { describe, it, expect } from 'vitest';
import {
  JOURNEY_STATE_DEFINITIONS,
  getStateLens,
  getStatePhase,
  getStateOrder,
  getNextState,
  calculateLensProgress,
  isOptionalState,
  hasCompletedState,
} from '@/lib/journey/state-machine';
import {
  JOURNEY_STATES,
  JOURNEY_STATE_CONFIG,
  MANDATORY_STATES,
  OPTIONAL_JOURNEY_STATES,
  JOURNEY_LENSES,
  DEFAULT_JOURNEY_SUMMARY,
  canAccessLens,
  getStatesByLens,
  getMandatoryStatesByLens,
  getOptionalStatesByLens,
  type JourneyStateId,
  type JourneyLens,
} from '@/lib/journey/types';
import {
  calculateDiscoverProgress,
  calculateUnderstandProgress,
  calculateActProgress,
  calculateAllLensProgress,
} from '@/lib/journey/progress-calculator';
import { createOrchestrator, validateStepCompletionData } from '@/lib/journey/orchestrator';
import { makeContext } from '../utils/test-helpers';

// ============================================
// STRUCTURAL INTEGRITY
// ============================================

describe('HEALTH CHECK: Structural Integrity', () => {
  it('JOURNEY_STATES array has 10 entries', () => {
    expect(JOURNEY_STATES.length).toBe(10);
  });

  it('JOURNEY_STATE_DEFINITIONS has entry for every state', () => {
    for (const state of JOURNEY_STATES) {
      expect(JOURNEY_STATE_DEFINITIONS[state], `Missing definition: ${state}`).toBeDefined();
    }
  });

  it('JOURNEY_STATE_CONFIG has entry for every state', () => {
    for (const state of JOURNEY_STATES) {
      expect(JOURNEY_STATE_CONFIG[state], `Missing config: ${state}`).toBeDefined();
    }
  });

  it('no extra states in definitions beyond JOURNEY_STATES', () => {
    const stateSet = new Set<string>(JOURNEY_STATES);
    for (const key of Object.keys(JOURNEY_STATE_DEFINITIONS)) {
      expect(stateSet.has(key), `Extra state in definitions: ${key}`).toBe(true);
    }
  });

  it('no extra states in config beyond JOURNEY_STATES', () => {
    const stateSet = new Set<string>(JOURNEY_STATES);
    for (const key of Object.keys(JOURNEY_STATE_CONFIG)) {
      expect(stateSet.has(key), `Extra state in config: ${key}`).toBe(true);
    }
  });
});

// ============================================
// TRANSITION CHAIN INTEGRITY
// ============================================

describe('HEALTH CHECK: Transition Chain', () => {
  it('every state (except terminal) has at least one transition', () => {
    for (let i = 0; i < JOURNEY_STATES.length - 1; i++) {
      const state = JOURNEY_STATES[i];
      expect(
        JOURNEY_STATE_DEFINITIONS[state].allowedTransitions.length,
        `${state} has no transitions`
      ).toBeGreaterThan(0);
    }
  });

  it('all transition targets are valid JOURNEY_STATES', () => {
    const validSet = new Set<string>(JOURNEY_STATES);
    for (const state of JOURNEY_STATES) {
      for (const target of JOURNEY_STATE_DEFINITIONS[state].allowedTransitions) {
        expect(validSet.has(target), `${state} transitions to invalid state: ${target}`).toBe(true);
      }
    }
  });

  it('every state is reachable from the first state', () => {
    const reachable = new Set<string>();
    const queue: JourneyStateId[] = ['REFLECT_ON_STRENGTHS'];
    reachable.add('REFLECT_ON_STRENGTHS');

    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const target of JOURNEY_STATE_DEFINITIONS[current].allowedTransitions) {
        if (!reachable.has(target)) {
          reachable.add(target);
          queue.push(target);
        }
      }
    }

    for (const state of JOURNEY_STATES) {
      expect(reachable.has(state), `State ${state} is unreachable`).toBe(true);
    }
  });

  it('no circular transitions (transition always goes forward or terminal)', () => {
    for (const state of JOURNEY_STATES) {
      const currentOrder = JOURNEY_STATE_DEFINITIONS[state].order;
      for (const target of JOURNEY_STATE_DEFINITIONS[state].allowedTransitions) {
        const targetOrder = JOURNEY_STATE_DEFINITIONS[target].order;
        expect(
          targetOrder > currentOrder,
          `${state} (order ${currentOrder}) has backward transition to ${target} (order ${targetOrder})`
        ).toBe(true);
      }
    }
  });
});

// ============================================
// LENS ASSIGNMENT INTEGRITY
// ============================================

describe('HEALTH CHECK: Lens Assignment', () => {
  it('every state has a valid lens', () => {
    const validLenses = new Set<string>(JOURNEY_LENSES);
    for (const state of JOURNEY_STATES) {
      const lens = getStateLens(state);
      expect(validLenses.has(lens), `${state} has invalid lens: ${lens}`).toBe(true);
    }
  });

  it('DISCOVER has exactly 3 states', () => {
    const states = getStatesByLens('DISCOVER');
    expect(states.length).toBe(3);
  });

  it('UNDERSTAND has exactly 3 states', () => {
    const states = getStatesByLens('UNDERSTAND');
    expect(states.length).toBe(3);
  });

  it('ACT has exactly 4 states (2 mandatory + 2 optional)', () => {
    const states = getStatesByLens('ACT');
    expect(states.length).toBe(4);
    expect(getMandatoryStatesByLens('ACT').length).toBe(2);
    expect(getOptionalStatesByLens('ACT').length).toBe(2);
  });

  it('states within each lens are contiguous in order', () => {
    for (const lens of JOURNEY_LENSES) {
      const states = getStatesByLens(lens);
      for (let i = 1; i < states.length; i++) {
        const prevOrder = getStateOrder(states[i - 1]);
        const currOrder = getStateOrder(states[i]);
        expect(currOrder).toBe(prevOrder + 1);
      }
    }
  });

  it('MANDATORY_STATES matches getStateMandatoryByLens', () => {
    for (const lens of JOURNEY_LENSES) {
      const fromConstant = MANDATORY_STATES[lens];
      const fromHelper = getMandatoryStatesByLens(lens);
      expect(fromConstant).toEqual(fromHelper);
    }
  });
});

// ============================================
// PROGRESS CALCULATION DETERMINISM
// ============================================

describe('HEALTH CHECK: Progress Determinism', () => {
  it('same inputs always produce same DISCOVER progress', () => {
    const input = { strengthsConfirmed: true, careersExplored: true, roleDeepDiveCompleted: false };
    const r1 = calculateDiscoverProgress(input);
    const r2 = calculateDiscoverProgress(input);
    expect(r1.progressPercent).toBe(r2.progressPercent);
    expect(r1.isComplete).toBe(r2.isComplete);
  });

  it('same inputs always produce same UNDERSTAND progress', () => {
    const input = { industryOutlookReviewed: true, careerShadowCompleted: false, planCreated: false };
    const r1 = calculateUnderstandProgress(input);
    const r2 = calculateUnderstandProgress(input);
    expect(r1.progressPercent).toBe(r2.progressPercent);
  });

  it('same inputs always produce same ACT progress', () => {
    const input = {
      alignedActionCompleted: true,
      actionReflectionSubmitted: false,
      planUpdated: false,
      externalFeedbackReceived: false,
    };
    const r1 = calculateActProgress(input);
    const r2 = calculateActProgress(input);
    expect(r1.progressPercent).toBe(r2.progressPercent);
  });

  it('same summary always produces same overall progress', () => {
    const summary = DEFAULT_JOURNEY_SUMMARY;
    const r1 = calculateAllLensProgress(summary);
    const r2 = calculateAllLensProgress(summary);
    expect(r1.overallProgress).toBe(r2.overallProgress);
  });
});

// ============================================
// ORCHESTRATOR FACTORY SAFETY
// ============================================

describe('HEALTH CHECK: Orchestrator Factory', () => {
  it('handles null dbState without crashing', () => {
    expect(() => createOrchestrator(makeContext(), null)).not.toThrow();
  });

  it('handles empty dbState without crashing', () => {
    expect(() =>
      createOrchestrator(makeContext(), {
        journeyState: '',
        journeyCompletedSteps: [],
        journeySummary: null,
      })
    ).not.toThrow();
  });

  it('always returns a valid UI state', () => {
    const orch = createOrchestrator(makeContext(), null);
    const ui = orch.getUIState();

    expect(ui.currentLens).toBeDefined();
    expect(ui.currentState).toBeDefined();
    expect(ui.steps.length).toBe(10);
    expect(ui.summary).toBeDefined();
    expect(typeof ui.canAdvanceToNextLens).toBe('boolean');
  });

  it('orchestrator survives rapid state changes without error', () => {
    const orch = createOrchestrator(makeContext(), null);

    // Rapidly try various operations
    expect(() => {
      orch.getUIState();
      orch.getCurrentState();
      orch.getCurrentLens();
      orch.getCompletedSteps();
      orch.getSkippedSteps();
      orch.getSummary();
      orch.canAdvanceToNext();
      orch.getNextAllowedStep();
    }).not.toThrow();
  });
});

// ============================================
// DEFAULT SUMMARY SAFETY
// ============================================

describe('HEALTH CHECK: Default Summary', () => {
  it('DEFAULT_JOURNEY_SUMMARY has all required fields', () => {
    const s = DEFAULT_JOURNEY_SUMMARY;

    // Lens progress
    expect(s.lenses).toBeDefined();
    expect(s.lenses.discover).toBeDefined();
    expect(s.lenses.understand).toBeDefined();
    expect(s.lenses.act).toBeDefined();

    // Core arrays
    expect(Array.isArray(s.strengths)).toBe(true);
    expect(Array.isArray(s.careerInterests)).toBe(true);
    expect(Array.isArray(s.exploredRoles)).toBe(true);
    expect(Array.isArray(s.rolePlans)).toBe(true);
    expect(Array.isArray(s.alignedActions)).toBe(true);
    expect(Array.isArray(s.alignedActionReflections)).toBe(true);

    // Booleans
    expect(typeof s.planCreated).toBe('boolean');
    expect(typeof s.requirementsReviewed).toBe('boolean');

    // Numbers
    expect(typeof s.overallProgress).toBe('number');
    expect(typeof s.alignedActionsCount).toBe('number');
  });

  it('DEFAULT_JOURNEY_SUMMARY starts at zero/empty', () => {
    const s = DEFAULT_JOURNEY_SUMMARY;
    expect(s.overallProgress).toBe(0);
    expect(s.alignedActionsCount).toBe(0);
    expect(s.strengths.length).toBe(0);
    expect(s.planCreated).toBe(false);
  });
});

// ============================================
// VALIDATION FUNCTION EXISTENCE
// ============================================

describe('HEALTH CHECK: Validation Coverage', () => {
  it('validateStepCompletionData handles all mandatory step types', () => {
    const mandatorySteps: JourneyStateId[] = [
      'REFLECT_ON_STRENGTHS',
      'EXPLORE_CAREERS',
      'ROLE_DEEP_DIVE',
      'REVIEW_INDUSTRY_OUTLOOK',
      'CAREER_SHADOW',
      'CREATE_ACTION_PLAN',
      'COMPLETE_ALIGNED_ACTION',
      'SUBMIT_ACTION_REFLECTION',
    ];

    for (const step of mandatorySteps) {
      // Should at least not crash on type mismatch
      const result = validateStepCompletionData(step, {
        type: 'REFLECT_ON_STRENGTHS', // Deliberate mismatch
        topStrengths: [],
        demonstratedSkills: [],
      } as StepCompletionData);

      if (step !== 'REFLECT_ON_STRENGTHS') {
        expect(result.valid).toBe(false); // Should catch mismatch
      }
    }
  });
});
