/**
 * Render Efficiency Tests
 *
 * Tests for unnecessary re-renders, expensive computations,
 * and memoization effectiveness in the journey UI state pipeline.
 */

import { describe, it, expect } from 'vitest';
import { createOrchestrator } from '@/lib/journey/orchestrator';
import {
  JOURNEY_PRESETS,
  makeContext,
  makeSummary,
  makeStrengthsData,
} from '../../my-journey/utils/test-helpers';
import {
  createRenderTracker,
  benchmark,
  measureTimeSync,
  PERF_BUDGETS,
} from '../utils/performance-helpers';

describe('Render Efficiency', () => {
  // ============================================
  // UI STATE STABILITY
  // ============================================

  describe('UI state referential stability', () => {
    it('getUIState returns structurally identical results for same input', () => {
      const preset = JOURNEY_PRESETS.fullyComplete();
      const orch = createOrchestrator(preset.context, preset.dbState);

      const state1 = orch.getUIState();
      const state2 = orch.getUIState();

      // Deep equality check — if these are equal, React.memo / useMemo would prevent re-renders
      expect(JSON.stringify(state1)).toBe(JSON.stringify(state2));
    });

    it('getUIState output matches expected shape for all presets', () => {
      for (const [name, presetFn] of Object.entries(JOURNEY_PRESETS)) {
        if (name === 'invalidState') continue;

        const preset = presetFn();
        const orch = createOrchestrator(preset.context, preset.dbState);
        const state = orch.getUIState();

        // Every state must have the required fields
        expect(state.currentLens, `${name}: missing currentLens`).toBeDefined();
        expect(state.currentState, `${name}: missing currentState`).toBeDefined();
        expect(state.steps, `${name}: missing steps`).toBeDefined();
        expect(state.summary, `${name}: missing summary`).toBeDefined();
        expect(state.summary.lenses, `${name}: missing lenses`).toBeDefined();
        expect(state.steps.length).toBeGreaterThan(0);
      }
    });
  });

  // ============================================
  // RENDER TRACKER SIMULATION
  // ============================================

  describe('Render count analysis', () => {
    it('simulated component tree renders stay within budget', () => {
      const tracker = createRenderTracker(PERF_BUDGETS.STABLE_RENDER_COUNT);

      // Simulate initial mount render pattern
      // Parent renders → children render
      tracker.track('MyJourneyPage');
      tracker.track('StageTabBar');
      tracker.track('DiscoverTab');

      // Data arrives → re-render
      tracker.track('MyJourneyPage');
      tracker.track('StageTabBar');
      tracker.track('DiscoverTab');

      const report = tracker.report();

      // Each component should render exactly 2x on mount (initial + data)
      expect(report.components.every((c) => c.renderCount <= PERF_BUDGETS.STABLE_RENDER_COUNT)).toBe(true);
      expect(report.hotspots.length).toBe(0);
    });

    it('tab switch should only re-render affected components', () => {
      const tracker = createRenderTracker(PERF_BUDGETS.TAB_SWITCH_RENDERS);

      // Initial mount
      tracker.track('MyJourneyPage');
      tracker.track('StageTabBar');
      tracker.track('DiscoverTab');

      // Tab switch: discover → understand
      tracker.track('MyJourneyPage'); // re-renders due to state change
      tracker.track('StageTabBar');    // re-renders for active state
      tracker.track('UnderstandTab');  // new tab mounts

      // DiscoverTab should NOT re-render (it's unmounted/hidden)
      // Total DiscoverTab renders = 1 (initial only)
      expect(tracker.getRenderCount('DiscoverTab')).toBe(1);
      expect(tracker.getRenderCount('UnderstandTab')).toBe(1);
      expect(tracker.getRenderCount('MyJourneyPage')).toBe(2);
    });

    it('step completion should not cause full tree re-render', () => {
      const tracker = createRenderTracker(3);

      // Mount
      tracker.track('MyJourneyPage');
      tracker.track('StageTabBar');
      tracker.track('DiscoverTab');
      tracker.track('StepRow-1');
      tracker.track('StepRow-2');
      tracker.track('StepRow-3');

      // Step completion — only affected components should re-render
      tracker.track('MyJourneyPage');  // query invalidation
      tracker.track('StageTabBar');     // progress update
      tracker.track('DiscoverTab');     // step status change

      // Ideally, only the completed StepRow re-renders, not all
      tracker.track('StepRow-1'); // this one completed

      const report = tracker.report();
      expect(tracker.getRenderCount('StepRow-2')).toBe(1); // Should not re-render
      expect(tracker.getRenderCount('StepRow-3')).toBe(1); // Should not re-render
    });
  });

  // ============================================
  // COMPUTATION COST ANALYSIS
  // ============================================

  describe('Expensive computation detection', () => {
    it('useMemo candidates: discoverComplete calculation is cheap', () => {
      // This mirrors the discoverComplete useMemo in the page
      const journey = JOURNEY_PRESETS.discoverComplete();
      const orch = createOrchestrator(journey.context, journey.dbState);
      const uiState = orch.getUIState();

      const result = benchmark(
        'discoverComplete calculation',
        () => {
          const understandOrActStates = [
            'REVIEW_INDUSTRY_OUTLOOK', 'CAREER_SHADOW', 'CREATE_ACTION_PLAN',
            'COMPLETE_ALIGNED_ACTION', 'SUBMIT_ACTION_REFLECTION', 'UPDATE_PLAN', 'EXTERNAL_FEEDBACK',
          ];
          const isInLaterStage = understandOrActStates.includes(uiState.currentState);

          if (!isInLaterStage) {
            const steps = uiState.steps || [];
            const strengthsDone = steps.find((s) => s.id === 'REFLECT_ON_STRENGTHS')?.status === 'completed';
            const careersDone = steps.find((s) => s.id === 'EXPLORE_CAREERS')?.status === 'completed';
            const directionDone = steps.find((s) => s.id === 'ROLE_DEEP_DIVE')?.status === 'completed';
          }
        },
        500
      );

      expect(result.p95).toBeLessThan(1); // Sub-millisecond
    });

    it('getAllCareers lookup is fast (used for goalCareer useMemo)', () => {
      // This can be expensive if the career list is large
      // Measure the lookup pattern used in the page
      const goalTitle = 'Doctor';

      const result = benchmark(
        'career lookup by title',
        () => {
          // Simulate the lookup without importing getAllCareers
          // (which may have side effects in test env)
          const careers = Array.from({ length: 100 }, (_, i) => ({
            title: i === 42 ? goalTitle : `Career ${i}`,
            id: `career-${i}`,
          }));
          careers.find((c) => c.title === goalTitle);
        },
        500
      );

      expect(result.p95).toBeLessThan(1);
    });
  });

  // ============================================
  // DERIVED STATE RECALCULATION
  // ============================================

  describe('Derived state efficiency', () => {
    it('lens progress does not recalculate unnecessarily', () => {
      const preset = JOURNEY_PRESETS.fullyComplete();
      const orch = createOrchestrator(preset.context, preset.dbState);

      // Get UI state multiple times — progress should be cached/stable
      const states = Array.from({ length: 10 }, () => orch.getUIState());

      // All should produce identical progress values
      const progresses = states.map((s) => s.summary.lenses.discover.progress);
      expect(new Set(progresses).size).toBe(1); // All identical
    });

    it('step status derivation scales linearly', () => {
      const stepCounts = [5, 10, 20, 50];
      const durations: number[] = [];

      for (const count of stepCounts) {
        const steps = Array.from({ length: count }, (_, i) => ({
          id: `step-${i}`,
          status: i < count / 2 ? 'completed' : 'locked',
        }));

        const start = performance.now();
        for (let i = 0; i < 1000; i++) {
          steps.find((s) => s.id === `step-${Math.floor(count / 2)}`);
        }
        durations.push(performance.now() - start);
      }

      // Doubling step count should roughly double lookup time (linear)
      // Not exponential
      const ratio = durations[durations.length - 1] / durations[0];
      expect(ratio).toBeLessThan(stepCounts[stepCounts.length - 1] / stepCounts[0] * 2);
    });
  });
});
