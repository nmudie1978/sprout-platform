/**
 * Step Completion Interaction Performance Tests
 *
 * Measures the speed of completing steps, transitioning states,
 * and updating summaries — the core user interaction flow.
 */

import { describe, it, expect } from 'vitest';
import { createOrchestrator } from '@/lib/journey/orchestrator';
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
  JOURNEY_PRESETS,
} from '../../my-journey/utils/test-helpers';
import {
  benchmark,
  measureTimeSync,
  PERF_BUDGETS,
  formatBenchmarkReport,
} from '../utils/performance-helpers';

describe('Step Completion Performance', () => {
  // ============================================
  // SINGLE STEP COMPLETION
  // ============================================

  it('completing a single step is fast', () => {
    const preset = JOURNEY_PRESETS.empty();
    const orch = createOrchestrator(preset.context, preset.dbState);

    const { timing } = measureTimeSync(
      'Complete REFLECT_ON_STRENGTHS',
      () => {
        orch.updateSummary(makeStrengthsData());
        orch.markStepCompleted('REFLECT_ON_STRENGTHS');
        orch.transitionTo('EXPLORE_CAREERS');
        return orch.getUIState();
      },
      PERF_BUDGETS.STATE_MACHINE_CALC
    );

    expect(timing.duration).toBeLessThan(PERF_BUDGETS.STATE_MACHINE_CALC);
  });

  // ============================================
  // FULL JOURNEY WALK-THROUGH
  // ============================================

  it('walking through the full journey is fast', () => {
    const stepData = [
      { step: 'REFLECT_ON_STRENGTHS', next: 'EXPLORE_CAREERS', data: makeStrengthsData() },
      { step: 'EXPLORE_CAREERS', next: 'ROLE_DEEP_DIVE', data: makeExploreCareersData() },
      { step: 'ROLE_DEEP_DIVE', next: 'REVIEW_INDUSTRY_OUTLOOK', data: makeRoleDeepDiveData() },
      { step: 'REVIEW_INDUSTRY_OUTLOOK', next: 'CAREER_SHADOW', data: makeIndustryOutlookData() },
      { step: 'CAREER_SHADOW', next: 'CREATE_ACTION_PLAN', data: makeCareerShadowData() },
      { step: 'CREATE_ACTION_PLAN', next: 'COMPLETE_ALIGNED_ACTION', data: makeActionPlanData() },
      { step: 'COMPLETE_ALIGNED_ACTION', next: 'SUBMIT_ACTION_REFLECTION', data: makeAlignedActionData() },
    ] as const;

    const result = benchmark(
      'Full journey walk-through (7 steps)',
      () => {
        const preset = JOURNEY_PRESETS.empty();
        const orch = createOrchestrator(preset.context, preset.dbState);

        for (const { step, next, data } of stepData) {
          orch.updateSummary(data);
          orch.markStepCompleted(step);
          orch.transitionTo(next);
        }

        // Final step
        orch.updateSummary(makeReflectionData());
        orch.markStepCompleted('SUBMIT_ACTION_REFLECTION');
        orch.getUIState();
      },
      100
    );

    console.log(`Full journey walk-through: median=${result.median}ms, p95=${result.p95}ms`);

    // Full journey completion should still be very fast
    expect(result.p95).toBeLessThan(PERF_BUDGETS.ORCHESTRATOR_BUILD * 2);
  });

  // ============================================
  // SUMMARY UPDATE PERFORMANCE
  // ============================================

  it('updateSummary does not slow down with data accumulation', () => {
    const results = [];

    for (const [name, presetFn] of Object.entries(JOURNEY_PRESETS)) {
      if (name === 'corrupted' || name === 'invalidState') continue;

      const preset = presetFn();
      const orch = createOrchestrator(preset.context, preset.dbState);

      const result = benchmark(
        `updateSummary(${name})`,
        () => {
          orch.updateSummary(makeStrengthsData());
        },
        200
      );

      results.push(result);
    }

    console.log(formatBenchmarkReport(results));

    // All should be fast regardless of existing data
    for (const result of results) {
      expect(result.p95).toBeLessThan(PERF_BUDGETS.STATE_MACHINE_CALC);
    }
  });

  // ============================================
  // getUIState REPEATED CALLS
  // ============================================

  it('getUIState is consistent speed across repeated calls', () => {
    const preset = JOURNEY_PRESETS.fullyComplete();
    const orch = createOrchestrator(preset.context, preset.dbState);

    const durations: number[] = [];
    for (let i = 0; i < 50; i++) {
      const start = performance.now();
      orch.getUIState();
      durations.push(performance.now() - start);
    }

    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const max = Math.max(...durations);

    // No call should be significantly slower than average (no hidden accumulation)
    // Use generous multiplier since sub-ms timings have high variance
    expect(max).toBeLessThan(avg * 20);
    expect(avg).toBeLessThan(PERF_BUDGETS.ORCHESTRATOR_BUILD);
  });
});
