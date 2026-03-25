/**
 * Performance Regression Gates
 *
 * Lightweight, stable tests suitable for CI.
 * These catch major performance regressions without being flaky.
 *
 * Each test focuses on one key metric with generous thresholds
 * to avoid false positives while still catching real problems.
 */

import { describe, it, expect } from 'vitest';
import { createOrchestrator } from '@/lib/journey/orchestrator';
import {
  JOURNEY_PRESETS,
  walkFullJourney,
  makeContext,
  makeSummary,
  makeExploredRole,
} from '../../my-journey/utils/test-helpers';
import { calculateLensProgress } from '@/lib/journey/state-machine';
import { JOURNEY_LENSES } from '@/lib/journey/types';
import {
  benchmark,
  measureTimeSync,
  measurePayloadSize,
  PERF_BUDGETS,
} from '../utils/performance-helpers';
import {
  EMPTY_JOURNEY,
  LARGE_JOURNEY,
  wrapJourneyResponse,
} from '../fixtures/journey-states';

describe('Performance Regression Gates (CI)', () => {
  // ============================================
  // GATE 1: Orchestrator build time
  // ============================================

  it('GATE: orchestrator builds UI state within budget', () => {
    const preset = JOURNEY_PRESETS.fullyComplete();

    const result = benchmark(
      'CI gate: orchestrator build',
      () => {
        const orch = createOrchestrator(preset.context, preset.dbState);
        orch.getUIState();
      },
      50 // Fewer iterations for CI speed
    );

    expect(result.p95).toBeLessThan(PERF_BUDGETS.ORCHESTRATOR_BUILD);
  });

  // ============================================
  // GATE 2: Full journey walkthrough speed
  // ============================================

  it('GATE: full journey completion stays fast', () => {
    const result = benchmark(
      'CI gate: full journey walkthrough',
      () => {
        walkFullJourney();
      },
      30
    );

    // Full journey should complete in under 20ms
    expect(result.p95).toBeLessThan(20);
  });

  // ============================================
  // GATE 3: Payload size budget
  // ============================================

  it('GATE: journey payload stays within size budget', () => {
    const payload = wrapJourneyResponse(LARGE_JOURNEY);
    const size = measurePayloadSize(payload);

    expect(size).toBeLessThan(PERF_BUDGETS.JOURNEY_PAYLOAD_SIZE);
  });

  // ============================================
  // GATE 4: State machine calculation speed
  // ============================================

  it('GATE: progress calculation stays fast', () => {
    const preset = JOURNEY_PRESETS.fullyComplete();

    const result = benchmark(
      'CI gate: progress calculation',
      () => {
        for (const lens of JOURNEY_LENSES) {
          calculateLensProgress(lens, preset.context);
        }
      },
      50
    );

    expect(result.p95).toBeLessThan(PERF_BUDGETS.PROGRESS_CALC);
  });

  // ============================================
  // GATE 5: Goal switch speed
  // ============================================

  it('GATE: goal switch rebuild stays fast', () => {
    const presets = [
      JOURNEY_PRESETS.fullyComplete(),
      JOURNEY_PRESETS.empty(),
      JOURNEY_PRESETS.fullyComplete(),
    ];

    const { timing } = measureTimeSync(
      'CI gate: 3-goal switch sequence',
      () => {
        for (const preset of presets) {
          const orch = createOrchestrator(preset.context, preset.dbState);
          orch.getUIState();
        }
      },
      PERF_BUDGETS.ORCHESTRATOR_BUILD * 3
    );

    expect(timing.duration).toBeLessThan(PERF_BUDGETS.ORCHESTRATOR_BUILD * 3);
  });

  // ============================================
  // GATE 6: Data serialization speed
  // ============================================

  it('GATE: journey serialization/deserialization stays fast', () => {
    const result = benchmark(
      'CI gate: serialize + deserialize',
      () => {
        const serialized = JSON.stringify(LARGE_JOURNEY);
        JSON.parse(serialized);
      },
      50
    );

    expect(result.p95).toBeLessThan(10);
  });

  // ============================================
  // GATE 7: UI state completeness
  // ============================================

  it('GATE: UI state has no undefined fields', () => {
    for (const [name, presetFn] of Object.entries(JOURNEY_PRESETS)) {
      if (name === 'invalidState') continue;

      const preset = presetFn();
      const orch = createOrchestrator(preset.context, preset.dbState);
      const state = orch.getUIState();

      // Critical fields must never be undefined
      expect(state.currentLens, `${name}: currentLens`).toBeDefined();
      expect(state.currentState, `${name}: currentState`).toBeDefined();
      expect(state.steps, `${name}: steps`).toBeDefined();
      expect(state.summary, `${name}: summary`).toBeDefined();
      expect(state.summary.lenses, `${name}: lenses`).toBeDefined();
      expect(state.summary.lenses.discover, `${name}: discover lens`).toBeDefined();
      expect(state.summary.lenses.understand, `${name}: understand lens`).toBeDefined();
      expect(state.summary.lenses.act, `${name}: act lens`).toBeDefined();

      // Progress must be valid numbers
      expect(Number.isFinite(state.summary.lenses.discover.progress)).toBe(true);
      expect(Number.isFinite(state.summary.lenses.understand.progress)).toBe(true);
      expect(Number.isFinite(state.summary.lenses.act.progress)).toBe(true);
    }
  });

  // ============================================
  // GATE 8: No performance cliff at scale
  // ============================================

  it('GATE: performance does not cliff at 10x data scale', () => {
    // Baseline: normal data
    const normalPreset = JOURNEY_PRESETS.fullyComplete();
    const normalResult = benchmark(
      'normal scale',
      () => {
        const orch = createOrchestrator(normalPreset.context, normalPreset.dbState);
        orch.getUIState();
      },
      50
    );

    // 10x scale
    const heavyContext = makeContext({
      ...normalPreset.context,
      savedCareers: Array.from({ length: 100 }, (_, i) => ({
        id: `c-${i}`, title: `Career ${i}`, savedAt: '2026-01-01',
      })),
      exploredRolesCount: 100,
      alignedActionsCompleted: 50,
      actionReflectionsSubmitted: 40,
    });

    const heavyDbState = {
      ...normalPreset.dbState,
      journeySummary: makeSummary({
        ...normalPreset.dbState.journeySummary,
        exploredRoles: Array.from({ length: 100 }, (_, i) => makeExploredRole(`Role ${i}`)),
        alignedActionsCount: 50,
      }),
    };

    const heavyResult = benchmark(
      '10x scale',
      () => {
        const orch = createOrchestrator(heavyContext, heavyDbState);
        orch.getUIState();
      },
      50
    );

    // 10x data should not cause more than 5x slowdown
    const ratio = heavyResult.p95 / Math.max(normalResult.p95, 0.01);
    console.log(`Scale ratio: ${ratio.toFixed(1)}x (normal: ${normalResult.p95}ms, 10x: ${heavyResult.p95}ms)`);
    expect(ratio).toBeLessThan(5);
  });
});
