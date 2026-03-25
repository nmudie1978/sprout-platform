/**
 * Goal Switching Performance Tests
 *
 * Measures the speed of switching between career goals.
 * This is a critical interaction — stale data or slow switches
 * damage the core journey experience.
 */

import { describe, it, expect } from 'vitest';
import { createOrchestrator } from '@/lib/journey/orchestrator';
import {
  makeContext,
  makeSummary,
  makeExploredRole,
  makeRolePlan,
  JOURNEY_PRESETS,
} from '../../my-journey/utils/test-helpers';
import {
  benchmark,
  measureTimeSync,
  PERF_BUDGETS,
  formatBenchmarkReport,
} from '../utils/performance-helpers';
import {
  EMPTY_JOURNEY,
  MEDIUM_JOURNEY,
  LARGE_JOURNEY,
  GOAL_STATES,
} from '../fixtures/journey-states';

describe('Goal Switching Performance', () => {
  // ============================================
  // ORCHESTRATOR REBUILD ON GOAL SWITCH
  // ============================================

  it('rebuilding orchestrator for different goal is fast', () => {
    // Simulate switching from Doctor (large) to Engineer (medium) to Teacher (empty)
    const goals = [
      { name: 'doctor-large', journey: LARGE_JOURNEY },
      { name: 'engineer-medium', journey: MEDIUM_JOURNEY },
      { name: 'teacher-empty', journey: EMPTY_JOURNEY },
    ];

    const results = goals.map(({ name, journey }) => {
      // Simulate the rebuild that happens when goal data is loaded
      return benchmark(
        `rebuild_for_${name}`,
        () => {
          const context = makeContext({
            confirmedStrengths: journey.summary.strengths || [],
            savedCareers: (journey.summary.careerInterests || []).map((t, i) => ({
              id: `c-${i}`,
              title: t,
              savedAt: '2026-01-01',
            })),
            exploredRolesCount: journey.summary.exploredRoles?.length || 0,
            primaryGoalSelected: Boolean(journey.summary.primaryGoal?.title),
          });

          const dbState = {
            journeyState: journey.currentState,
            journeyCompletedSteps: [...journey.completedSteps],
            journeySummary: journey.summary,
          };

          const orch = createOrchestrator(context, dbState);
          orch.getUIState();
        },
        100
      );
    });

    console.log(formatBenchmarkReport(results));

    for (const result of results) {
      expect(result.p95).toBeLessThan(PERF_BUDGETS.ORCHESTRATOR_BUILD);
    }
  });

  // ============================================
  // RAPID GOAL SWITCHING
  // ============================================

  it('rapid sequential goal switches do not accumulate delay', () => {
    const journeys = [LARGE_JOURNEY, MEDIUM_JOURNEY, EMPTY_JOURNEY, LARGE_JOURNEY, MEDIUM_JOURNEY];

    const { timing } = measureTimeSync(
      'Rapid 5-goal switch sequence',
      () => {
        for (const journey of journeys) {
          const context = makeContext({
            confirmedStrengths: journey.summary.strengths || [],
            primaryGoalSelected: Boolean(journey.summary.primaryGoal?.title),
          });

          const orch = createOrchestrator(context, {
            journeyState: journey.currentState,
            journeyCompletedSteps: [...journey.completedSteps],
            journeySummary: journey.summary,
          });

          orch.getUIState();
        }
      },
      PERF_BUDGETS.ORCHESTRATOR_BUILD * 5
    );

    // 5 switches should be roughly 5x single switch, not exponential
    expect(timing.duration).toBeLessThan(PERF_BUDGETS.ORCHESTRATOR_BUILD * 5);
  });

  // ============================================
  // STATE ISOLATION VERIFICATION
  // ============================================

  it('switching goals does not bleed state between orchestrators', () => {
    // Build two orchestrators for different goals
    const doctorPreset = JOURNEY_PRESETS.fullyComplete();
    const emptyPreset = JOURNEY_PRESETS.empty();

    const doctorOrch = createOrchestrator(doctorPreset.context, doctorPreset.dbState);
    const doctorState = doctorOrch.getUIState();

    const emptyOrch = createOrchestrator(emptyPreset.context, emptyPreset.dbState);
    const emptyState = emptyOrch.getUIState();

    // States must be completely independent
    expect(doctorState.completedSteps.length).toBeGreaterThan(0);
    expect(emptyState.completedSteps.length).toBe(0);
    expect(doctorState.currentLens).not.toBe(emptyState.currentLens);
  });

  // ============================================
  // GOAL DATA SERIALIZATION SPEED
  // ============================================

  it('serializing journey state for goal save is fast', () => {
    const result = benchmark(
      'JSON.stringify(large journey)',
      () => {
        JSON.stringify(LARGE_JOURNEY);
      },
      200
    );

    expect(result.p95).toBeLessThan(5); // Serialization should be under 5ms
  });

  it('deserializing journey state on goal restore is fast', () => {
    const serialized = JSON.stringify(LARGE_JOURNEY);

    const result = benchmark(
      'JSON.parse(large journey)',
      () => {
        JSON.parse(serialized);
      },
      200
    );

    expect(result.p95).toBeLessThan(5);
  });
});
