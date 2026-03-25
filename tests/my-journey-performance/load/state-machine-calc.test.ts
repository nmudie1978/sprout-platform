/**
 * State Machine Calculation Performance Tests
 *
 * Measures the speed of core state machine operations:
 * - State transitions
 * - Progress calculations
 * - Lens completion checks
 * - Step gating logic
 */

import { describe, it, expect } from 'vitest';
import {
  canTransition,
  hasCompletedState,
  hasCompletedOrSkippedState,
  determineCurrentState,
  calculateLensProgress,
  getStateLens,
  getStatePhase,
} from '@/lib/journey/state-machine';
import { JOURNEY_STATES, JOURNEY_LENSES, type JourneyStateId } from '@/lib/journey/types';
import {
  makeContext,
  JOURNEY_PRESETS,
} from '../../my-journey/utils/test-helpers';
import {
  benchmark,
  measureTimeSync,
  PERF_BUDGETS,
  formatBenchmarkReport,
} from '../utils/performance-helpers';

describe('State Machine Calculation Performance', () => {
  // ============================================
  // TRANSITION CHECKS
  // ============================================

  it('canTransition check is near-instant', () => {
    const ctx = makeContext({
      confirmedStrengths: ['A', 'B', 'C'],
      savedCareers: [{ id: '1', title: 'Doctor', savedAt: '2026-01-01' }],
      exploredRolesCount: 1,
    });
    const result = benchmark(
      'canTransition()',
      () => {
        canTransition('REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', ctx);
        canTransition('EXPLORE_CAREERS', 'ROLE_DEEP_DIVE', ctx);
        canTransition('ROLE_DEEP_DIVE', 'REVIEW_INDUSTRY_OUTLOOK', ctx);
        canTransition('REFLECT_ON_STRENGTHS', 'COMPLETE_ALIGNED_ACTION', ctx); // invalid
      },
      500
    );

    expect(result.p95).toBeLessThan(PERF_BUDGETS.STATE_MACHINE_CALC);
  });

  // ============================================
  // LENS PROGRESS CALCULATION
  // ============================================

  it('calculateLensProgress is fast for all lenses', () => {
    const context = makeContext({
      confirmedStrengths: ['A', 'B', 'C'],
      savedCareers: [{ id: '1', title: 'Doctor', savedAt: '2026-01-01' }],
      exploredRolesCount: 1,
      primaryGoalSelected: true,
      industryOutlookReviewed: true,
      pathDataSaved: true,
      shadowsCompleted: 1,
      planCreated: true,
      alignedActionsCompleted: 1,
      actionReflectionsSubmitted: 1,
    });

    const result = benchmark(
      'calculateLensProgress(all lenses)',
      () => {
        for (const lens of JOURNEY_LENSES) {
          calculateLensProgress(lens, context);
        }
      },
      500
    );

    expect(result.p95).toBeLessThan(PERF_BUDGETS.PROGRESS_CALC);
  });

  it('progress calculation does not degrade with rich context', () => {
    const richContext = makeContext({
      confirmedStrengths: Array.from({ length: 20 }, (_, i) => `Strength ${i}`),
      savedCareers: Array.from({ length: 50 }, (_, i) => ({
        id: `c-${i}`,
        title: `Career ${i}`,
        savedAt: '2026-01-01',
      })),
      exploredRolesCount: 50,
      primaryGoalSelected: true,
      alignedActionsCompleted: 30,
      actionReflectionsSubmitted: 25,
    });

    const { timing } = measureTimeSync(
      'Progress calc with rich context',
      () => {
        for (const lens of JOURNEY_LENSES) {
          calculateLensProgress(lens, richContext);
        }
      },
      PERF_BUDGETS.PROGRESS_CALC
    );

    expect(timing.duration).toBeLessThan(PERF_BUDGETS.PROGRESS_CALC);
  });

  // ============================================
  // STATE LOOKUP OPERATIONS
  // ============================================

  it('getStateLens is O(1) for all states', () => {
    const result = benchmark(
      'getStateLens(all states)',
      () => {
        for (const state of JOURNEY_STATES) {
          getStateLens(state);
        }
      },
      500
    );

    expect(result.p95).toBeLessThan(1); // Should be sub-millisecond
  });

  it('getStatePhase is O(1) for all states', () => {
    const result = benchmark(
      'getStatePhase(all states)',
      () => {
        for (const state of JOURNEY_STATES) {
          getStatePhase(state);
        }
      },
      500
    );

    expect(result.p95).toBeLessThan(1);
  });

  // ============================================
  // COMPLETION CHECKS
  // ============================================

  it('hasCompletedState checks are fast with many completed steps', () => {
    const ctx = makeContext({
      confirmedStrengths: ['A', 'B', 'C'],
      savedCareers: [{ id: '1', title: 'Doctor', savedAt: '2026-01-01' }],
      exploredRolesCount: 1,
      industryOutlookReviewed: true,
      pathDataSaved: true,
      shadowsCompleted: 1,
      planCreated: true,
      alignedActionsCompleted: 1,
      actionReflectionsSubmitted: 1,
      planUpdatedAfterAction: true,
      externalFeedbackReceived: true,
    });

    const result = benchmark(
      'hasCompletedState(all states)',
      () => {
        for (const state of JOURNEY_STATES) {
          hasCompletedState(state, ctx);
        }
      },
      500
    );

    expect(result.p95).toBeLessThan(1);
  });

  // ============================================
  // FULL PROGRESS PIPELINE BENCHMARK
  // ============================================

  it('full progress pipeline benchmark across journey stages', () => {
    const presets = {
      empty: JOURNEY_PRESETS.empty(),
      partial: JOURNEY_PRESETS.partialDiscover(),
      discoverDone: JOURNEY_PRESETS.discoverComplete(),
      understandDone: JOURNEY_PRESETS.understandComplete(),
      complete: JOURNEY_PRESETS.fullyComplete(),
    };

    const results = Object.entries(presets).map(([name, preset]) =>
      benchmark(
        `progress_pipeline(${name})`,
        () => {
          for (const lens of JOURNEY_LENSES) {
            calculateLensProgress(lens, preset.context);
          }
        },
        300
      )
    );

    console.log(formatBenchmarkReport(results));

    for (const result of results) {
      expect(result.p95).toBeLessThan(PERF_BUDGETS.PROGRESS_CALC);
    }
  });
});
