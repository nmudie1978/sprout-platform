import { describe, it, expect } from 'vitest';
import {
  JOURNEY_STATE_DEFINITIONS,
  getStateLens,
  getStatePhase,
  calculateLensProgress,
  isOptionalState,
  canEnterState,
  hasCompletedOrSkippedState,
} from '../state-machine';
import {
  type JourneyStateId,
  type JourneyStateContext,
  type JourneyLens,
  type SkippedStepsMap,
  JOURNEY_STATES,
  JOURNEY_STATE_CONFIG,
} from '../types';

// ============================================
// HELPERS
// ============================================

function makeContext(overrides: Partial<JourneyStateContext> = {}): JourneyStateContext {
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
// 1. getStateLens maps all states to correct lenses
// ============================================

describe('getStateLens', () => {
  it('maps DISCOVER states correctly', () => {
    expect(getStateLens('REFLECT_ON_STRENGTHS')).toBe('DISCOVER');
    expect(getStateLens('EXPLORE_CAREERS')).toBe('DISCOVER');
    expect(getStateLens('ROLE_DEEP_DIVE')).toBe('DISCOVER');
  });

  it('maps UNDERSTAND states correctly', () => {
    expect(getStateLens('REVIEW_INDUSTRY_OUTLOOK')).toBe('UNDERSTAND');
    expect(getStateLens('CAREER_SHADOW')).toBe('UNDERSTAND');
    expect(getStateLens('CREATE_ACTION_PLAN')).toBe('UNDERSTAND');
  });

  it('maps ACT states correctly', () => {
    expect(getStateLens('COMPLETE_ALIGNED_ACTION')).toBe('ACT');
    expect(getStateLens('SUBMIT_ACTION_REFLECTION')).toBe('ACT');
    expect(getStateLens('UPDATE_PLAN')).toBe('ACT');
    expect(getStateLens('EXTERNAL_FEEDBACK')).toBe('ACT');
  });

  it('every state in JOURNEY_STATES has a valid lens', () => {
    const validLenses: JourneyLens[] = ['DISCOVER', 'UNDERSTAND', 'ACT'];
    for (const state of JOURNEY_STATES) {
      expect(validLenses).toContain(getStateLens(state));
    }
  });
});

// ============================================
// 2. isOptionalState
// ============================================

describe('isOptionalState', () => {
  it('returns true for UPDATE_PLAN', () => {
    expect(isOptionalState('UPDATE_PLAN')).toBe(true);
  });

  it('returns true for EXTERNAL_FEEDBACK', () => {
    expect(isOptionalState('EXTERNAL_FEEDBACK')).toBe(true);
  });

  it('returns false for all mandatory states', () => {
    const mandatoryStates: JourneyStateId[] = [
      'REFLECT_ON_STRENGTHS',
      'EXPLORE_CAREERS',
      'ROLE_DEEP_DIVE',
      'REVIEW_INDUSTRY_OUTLOOK',
      'CAREER_SHADOW',
      'CREATE_ACTION_PLAN',
      'COMPLETE_ALIGNED_ACTION',
      'SUBMIT_ACTION_REFLECTION',
    ];
    for (const state of mandatoryStates) {
      expect(isOptionalState(state)).toBe(false);
    }
  });
});

// ============================================
// 3. canEnterState
// ============================================

describe('canEnterState', () => {
  it('first state (REFLECT_ON_STRENGTHS) is always accessible', () => {
    const ctx = makeContext();
    expect(canEnterState('REFLECT_ON_STRENGTHS', ctx)).toBe(true);
  });

  it('second state requires first state to be complete', () => {
    const ctxIncomplete = makeContext();
    expect(canEnterState('EXPLORE_CAREERS', ctxIncomplete)).toBe(false);

    const ctxComplete = makeContext({
      confirmedStrengths: ['Creativity', 'Communication', 'Teamwork'],
    });
    expect(canEnterState('EXPLORE_CAREERS', ctxComplete)).toBe(true);
  });

  it('third state requires second state to be complete', () => {
    const ctx = makeContext({
      confirmedStrengths: ['A', 'B', 'C'],
      savedCareers: [],
    });
    expect(canEnterState('ROLE_DEEP_DIVE', ctx)).toBe(false);

    const ctxWithCareers = makeContext({
      confirmedStrengths: ['A', 'B', 'C'],
      savedCareers: [{ id: '1', title: 'Doctor', savedAt: '2026-01-01' }],
    });
    expect(canEnterState('ROLE_DEEP_DIVE', ctxWithCareers)).toBe(true);
  });

  it('cannot enter a mid-journey state without completing the prior state', () => {
    const ctx = makeContext();
    expect(canEnterState('CREATE_ACTION_PLAN', ctx)).toBe(false);
  });

  it('optional states after SUBMIT_ACTION_REFLECTION require it to be complete', () => {
    const ctx = makeContext();
    expect(canEnterState('UPDATE_PLAN', ctx)).toBe(false);
  });
});

// ============================================
// 4. calculateLensProgress
// ============================================

describe('calculateLensProgress', () => {
  it('returns 0% progress with no completed states', () => {
    const ctx = makeContext();
    const result = calculateLensProgress('DISCOVER', ctx);
    expect(result.progress).toBe(0);
    expect(result.completedStates).toHaveLength(0);
    expect(result.completedPhases).toHaveLength(0);
  });

  it('returns 33% with 1 of 3 DISCOVER mandatory states completed', () => {
    const ctx = makeContext({
      confirmedStrengths: ['Creativity', 'Communication', 'Teamwork'],
    });
    const result = calculateLensProgress('DISCOVER', ctx);
    expect(result.progress).toBe(33);
    expect(result.completedStates).toEqual(['REFLECT_ON_STRENGTHS']);
  });

  it('returns 67% with 2 of 3 DISCOVER mandatory states completed', () => {
    const ctx = makeContext({
      confirmedStrengths: ['A', 'B', 'C'],
      savedCareers: [{ id: '1', title: 'Engineer', savedAt: '2026-01-01' }],
    });
    const result = calculateLensProgress('DISCOVER', ctx);
    expect(result.progress).toBe(67);
    expect(result.completedStates).toEqual([
      'REFLECT_ON_STRENGTHS',
      'EXPLORE_CAREERS',
    ]);
  });

  it('returns 100% with all DISCOVER mandatory states completed', () => {
    const ctx = makeContext({
      confirmedStrengths: ['A', 'B', 'C'],
      savedCareers: [{ id: '1', title: 'Engineer', savedAt: '2026-01-01' }],
      exploredRolesCount: 1,
    });
    const result = calculateLensProgress('DISCOVER', ctx);
    expect(result.progress).toBe(100);
    expect(result.completedStates).toEqual([
      'REFLECT_ON_STRENGTHS',
      'EXPLORE_CAREERS',
      'ROLE_DEEP_DIVE',
    ]);
  });

  it('returns 100% for ACT when both mandatory states are complete', () => {
    const ctx = makeContext({
      alignedActionsCompleted: 1,
      actionReflectionsSubmitted: 1,
    });
    const result = calculateLensProgress('ACT', ctx);
    expect(result.progress).toBe(100);
    expect(result.completedStates).toEqual([
      'COMPLETE_ALIGNED_ACTION',
      'SUBMIT_ACTION_REFLECTION',
    ]);
  });

  it('populates completedPhases correctly', () => {
    const ctx = makeContext({
      confirmedStrengths: ['A', 'B', 'C'],
      savedCareers: [{ id: '1', title: 'Engineer', savedAt: '2026-01-01' }],
      exploredRolesCount: 1,
    });
    const result = calculateLensProgress('DISCOVER', ctx);
    expect(result.completedPhases).toContain('SELF_AWARENESS');
    expect(result.completedPhases).toContain('EXPLORATION');
  });
});

// ============================================
// 5. State definitions: mandatory flag consistency
// ============================================

describe('JOURNEY_STATE_DEFINITIONS mandatory flags', () => {
  const mandatoryStateIds: JourneyStateId[] = [
    'REFLECT_ON_STRENGTHS',
    'EXPLORE_CAREERS',
    'ROLE_DEEP_DIVE',
    'REVIEW_INDUSTRY_OUTLOOK',
    'CAREER_SHADOW',
    'CREATE_ACTION_PLAN',
    'COMPLETE_ALIGNED_ACTION',
    'SUBMIT_ACTION_REFLECTION',
  ];

  const optionalStateIds: JourneyStateId[] = [
    'UPDATE_PLAN',
    'EXTERNAL_FEEDBACK',
  ];

  it('all mandatory states have mandatory=true', () => {
    for (const id of mandatoryStateIds) {
      expect(JOURNEY_STATE_DEFINITIONS[id].mandatory).toBe(true);
    }
  });

  it('all optional states have mandatory=false', () => {
    for (const id of optionalStateIds) {
      expect(JOURNEY_STATE_DEFINITIONS[id].mandatory).toBe(false);
    }
  });

  it('mandatory flag in definitions matches JOURNEY_STATE_CONFIG', () => {
    for (const state of JOURNEY_STATES) {
      expect(JOURNEY_STATE_DEFINITIONS[state].mandatory).toBe(
        JOURNEY_STATE_CONFIG[state].mandatory
      );
    }
  });

  it('all 10 states are defined', () => {
    expect(Object.keys(JOURNEY_STATE_DEFINITIONS)).toHaveLength(10);
  });
});

// ============================================
// 6. Allowed transitions form a valid chain
// ============================================

describe('allowedTransitions form a valid chain', () => {
  it('each state transitions to the next state in order (no gaps)', () => {
    const orderedStates = [...JOURNEY_STATES];

    for (let i = 0; i < orderedStates.length - 1; i++) {
      const current = orderedStates[i];
      const transitions = JOURNEY_STATE_DEFINITIONS[current].allowedTransitions;

      // Every non-terminal state must have at least one transition
      expect(transitions.length).toBeGreaterThan(0);

      // The next state in order must be reachable from current
      // (either directly or via one of the allowed transitions)
      const nextInOrder = orderedStates[i + 1];
      expect(transitions).toContain(nextInOrder);
    }
  });

  it('final state (EXTERNAL_FEEDBACK) has no transitions', () => {
    expect(
      JOURNEY_STATE_DEFINITIONS['EXTERNAL_FEEDBACK'].allowedTransitions
    ).toHaveLength(0);
  });

  it('SUBMIT_ACTION_REFLECTION branches to both optional states', () => {
    const transitions =
      JOURNEY_STATE_DEFINITIONS['SUBMIT_ACTION_REFLECTION'].allowedTransitions;
    expect(transitions).toContain('UPDATE_PLAN');
    expect(transitions).toContain('EXTERNAL_FEEDBACK');
  });

  it('order values are sequential from 0 to 9', () => {
    for (let i = 0; i < JOURNEY_STATES.length; i++) {
      expect(JOURNEY_STATE_DEFINITIONS[JOURNEY_STATES[i]].order).toBe(i);
    }
  });

  it('all transition targets are valid JourneyStateId values', () => {
    const validIds = new Set<string>(JOURNEY_STATES);
    for (const state of JOURNEY_STATES) {
      for (const target of JOURNEY_STATE_DEFINITIONS[state].allowedTransitions) {
        expect(validIds.has(target)).toBe(true);
      }
    }
  });
});

// ============================================
// getStatePhase
// ============================================

describe('getStatePhase', () => {
  it('maps states to correct phases', () => {
    expect(getStatePhase('REFLECT_ON_STRENGTHS')).toBe('SELF_AWARENESS');
    expect(getStatePhase('EXPLORE_CAREERS')).toBe('EXPLORATION');
    expect(getStatePhase('ROLE_DEEP_DIVE')).toBe('EXPLORATION');
    expect(getStatePhase('REVIEW_INDUSTRY_OUTLOOK')).toBe('REALITY');
    expect(getStatePhase('CAREER_SHADOW')).toBe('REALITY');
    expect(getStatePhase('CREATE_ACTION_PLAN')).toBe('STRATEGY');
    expect(getStatePhase('COMPLETE_ALIGNED_ACTION')).toBe('ALIGNED_ACTION');
    expect(getStatePhase('SUBMIT_ACTION_REFLECTION')).toBe('REFLECTION');
    expect(getStatePhase('UPDATE_PLAN')).toBe('REFLECTION');
    expect(getStatePhase('EXTERNAL_FEEDBACK')).toBe('REFLECTION');
  });
});

// ============================================
// hasCompletedOrSkippedState
// ============================================

describe('hasCompletedOrSkippedState', () => {
  it('returns false when state is not completed and not skipped', () => {
    const ctx = makeContext();
    expect(hasCompletedOrSkippedState('REFLECT_ON_STRENGTHS', ctx)).toBe(false);
  });

  it('returns true when a mandatory state is completed', () => {
    const ctx = makeContext({
      confirmedStrengths: ['A', 'B', 'C'],
    });
    expect(hasCompletedOrSkippedState('REFLECT_ON_STRENGTHS', ctx)).toBe(true);
  });

  it('returns true when an optional state is skipped', () => {
    const ctx = makeContext({
      skippedSteps: {
        UPDATE_PLAN: {
          stepId: 'UPDATE_PLAN',
          reason: 'Not needed yet',
          skippedAt: '2026-01-01',
        },
      } as SkippedStepsMap,
    });
    expect(hasCompletedOrSkippedState('UPDATE_PLAN', ctx)).toBe(true);
  });

  it('returns false when a mandatory state is in skippedSteps (skipping does not apply)', () => {
    // Mandatory states cannot be skipped; hasCompletedOrSkippedState checks
    // isOptionalState first before considering skippedSteps
    const ctx = makeContext({
      skippedSteps: {
        REFLECT_ON_STRENGTHS: {
          stepId: 'REFLECT_ON_STRENGTHS',
          reason: 'attempted skip',
          skippedAt: '2026-01-01',
        },
      } as unknown as SkippedStepsMap,
    });
    expect(hasCompletedOrSkippedState('REFLECT_ON_STRENGTHS', ctx)).toBe(false);
  });
});
