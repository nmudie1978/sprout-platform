/**
 * Orchestrator Build Performance Tests
 *
 * Measures how fast the JourneyOrchestrator builds UI state
 * from raw context + DB state. This is the core computation
 * that runs on every journey page load.
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

describe('Orchestrator Build Performance', () => {
  // ============================================
  // BASELINE: Empty journey
  // ============================================

  it('builds UI state for empty journey within budget', () => {
    const preset = JOURNEY_PRESETS.empty();
    const { timing } = measureTimeSync(
      'Empty journey → UI state',
      () => {
        const orch = createOrchestrator(preset.context, preset.dbState);
        return orch.getUIState();
      },
      PERF_BUDGETS.ORCHESTRATOR_BUILD
    );

    expect(timing.duration).toBeLessThan(PERF_BUDGETS.ORCHESTRATOR_BUILD);
    expect(timing.passed).toBe(true);
  });

  // ============================================
  // MID-JOURNEY: Partial progress
  // ============================================

  it('builds UI state for partial discover within budget', () => {
    const preset = JOURNEY_PRESETS.partialDiscover();
    const { timing } = measureTimeSync(
      'Partial discover → UI state',
      () => {
        const orch = createOrchestrator(preset.context, preset.dbState);
        return orch.getUIState();
      },
      PERF_BUDGETS.ORCHESTRATOR_BUILD
    );

    expect(timing.duration).toBeLessThan(PERF_BUDGETS.ORCHESTRATOR_BUILD);
  });

  it('builds UI state for discover complete within budget', () => {
    const preset = JOURNEY_PRESETS.discoverComplete();
    const { timing } = measureTimeSync(
      'Discover complete → UI state',
      () => {
        const orch = createOrchestrator(preset.context, preset.dbState);
        return orch.getUIState();
      },
      PERF_BUDGETS.ORCHESTRATOR_BUILD
    );

    expect(timing.duration).toBeLessThan(PERF_BUDGETS.ORCHESTRATOR_BUILD);
  });

  it('builds UI state for partial understand within budget', () => {
    const preset = JOURNEY_PRESETS.partialUnderstand();
    const { timing } = measureTimeSync(
      'Partial understand → UI state',
      () => {
        const orch = createOrchestrator(preset.context, preset.dbState);
        return orch.getUIState();
      },
      PERF_BUDGETS.ORCHESTRATOR_BUILD
    );

    expect(timing.duration).toBeLessThan(PERF_BUDGETS.ORCHESTRATOR_BUILD);
  });

  // ============================================
  // FULLY COMPLETE: Maximum data
  // ============================================

  it('builds UI state for fully complete journey within budget', () => {
    const preset = JOURNEY_PRESETS.fullyComplete();
    const { timing } = measureTimeSync(
      'Fully complete → UI state',
      () => {
        const orch = createOrchestrator(preset.context, preset.dbState);
        return orch.getUIState();
      },
      PERF_BUDGETS.ORCHESTRATOR_BUILD
    );

    expect(timing.duration).toBeLessThan(PERF_BUDGETS.ORCHESTRATOR_BUILD);
  });

  // ============================================
  // SCALE: Heavy summary data
  // ============================================

  it('handles large summary data without degradation', () => {
    const heavyContext = makeContext({
      confirmedStrengths: ['Communication', 'Teamwork', 'Problem Solving', 'Leadership', 'Creativity'],
      savedCareers: Array.from({ length: 20 }, (_, i) => ({
        id: `career-${i}`,
        title: `Career ${i}`,
        savedAt: `2026-01-${String(i + 1).padStart(2, '0')}`,
      })),
      exploredRolesCount: 20,
      primaryGoalSelected: true,
      industryOutlookReviewed: true,
      pathDataSaved: true,
      shadowsCompleted: 5,
      planCreated: true,
      alignedActionsCompleted: 15,
      actionReflectionsSubmitted: 12,
    });

    const heavyDbState = {
      journeyState: 'COMPLETE_ALIGNED_ACTION',
      journeyCompletedSteps: [
        'REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE',
        'REVIEW_INDUSTRY_OUTLOOK', 'CAREER_SHADOW', 'CREATE_ACTION_PLAN',
      ],
      journeySummary: makeSummary({
        strengths: Array.from({ length: 10 }, (_, i) => `Strength ${i}`),
        careerInterests: Array.from({ length: 20 }, (_, i) => `Career ${i}`),
        exploredRoles: Array.from({ length: 20 }, (_, i) => makeExploredRole(`Role ${i}`)),
        rolePlans: Array.from({ length: 5 }, (_, i) => makeRolePlan(`Role ${i}`)),
        alignedActionsCount: 15,
        alignedActions: Array.from({ length: 15 }, (_, i) => ({
          id: `action-${i}`,
          type: 'VOLUNTEER_WORK',
          title: `Action ${i}`,
          completedAt: `2026-02-${String(i + 1).padStart(2, '0')}`,
          linkedToGoal: true,
        })),
        alignedActionReflections: Array.from({ length: 12 }, (_, i) => ({
          id: `ref-${i}`,
          actionId: `action-${i}`,
          prompt: `Reflect on action ${i}`,
          response: `Reflection content for action ${i}`,
          createdAt: `2026-03-${String(i + 1).padStart(2, '0')}`,
        })),
      }),
    };

    const { timing } = measureTimeSync(
      'Heavy data (20 careers, 15 actions) → UI state',
      () => {
        const orch = createOrchestrator(heavyContext, heavyDbState);
        return orch.getUIState();
      },
      PERF_BUDGETS.ORCHESTRATOR_BUILD
    );

    expect(timing.duration).toBeLessThan(PERF_BUDGETS.ORCHESTRATOR_BUILD);
  });

  // ============================================
  // BENCHMARK: Statistical analysis
  // ============================================

  it('orchestrator build benchmark (statistical)', () => {
    const presets = {
      empty: JOURNEY_PRESETS.empty(),
      discoverComplete: JOURNEY_PRESETS.discoverComplete(),
      understandComplete: JOURNEY_PRESETS.understandComplete(),
      fullyComplete: JOURNEY_PRESETS.fullyComplete(),
    };

    const results = Object.entries(presets).map(([name, preset]) =>
      benchmark(
        `orchestrator.build(${name})`,
        () => {
          const orch = createOrchestrator(preset.context, preset.dbState);
          orch.getUIState();
        },
        200
      )
    );

    // Log benchmark results
    console.log(formatBenchmarkReport(results));

    // All should be well under budget
    for (const result of results) {
      expect(result.p95).toBeLessThan(PERF_BUDGETS.ORCHESTRATOR_BUILD);
    }
  });

  // ============================================
  // CORRUPTED STATE: Graceful handling speed
  // ============================================

  it('handles corrupted state without performance penalty', () => {
    const preset = JOURNEY_PRESETS.corrupted();
    const { timing } = measureTimeSync(
      'Corrupted state → UI state',
      () => {
        const orch = createOrchestrator(preset.context, preset.dbState);
        return orch.getUIState();
      },
      PERF_BUDGETS.ORCHESTRATOR_BUILD
    );

    expect(timing.duration).toBeLessThan(PERF_BUDGETS.ORCHESTRATOR_BUILD);
  });
});
