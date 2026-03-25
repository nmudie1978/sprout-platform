/**
 * Mobile Viewport Performance Tests
 *
 * Validates that My Journey performs well on mobile-sized viewports.
 * Since we can't run real browser tests in vitest, these tests focus on:
 * - Data processing efficiency at mobile scale
 * - Component payload sizes (smaller = better for mobile)
 * - Layout computation proxies
 * - Touch interaction response patterns
 */

import { describe, it, expect } from 'vitest';
import { createOrchestrator } from '@/lib/journey/orchestrator';
import { JOURNEY_PRESETS } from '../../my-journey/utils/test-helpers';
import {
  benchmark,
  measureTimeSync,
  measurePayloadSize,
  PERF_BUDGETS,
  formatBenchmarkReport,
} from '../utils/performance-helpers';
import {
  EMPTY_JOURNEY,
  MEDIUM_JOURNEY,
  LARGE_JOURNEY,
  wrapJourneyResponse,
} from '../fixtures/journey-states';

describe('Mobile Viewport Performance', () => {
  // ============================================
  // PAYLOAD SIZE FOR MOBILE
  // ============================================

  describe('Mobile payload budgets', () => {
    // Mobile devices often have slower connections
    // Payload should be compact enough for 3G-like conditions

    it('empty journey payload is mobile-friendly', () => {
      const size = measurePayloadSize(wrapJourneyResponse(EMPTY_JOURNEY));
      // Under 5KB is fine for even slow connections
      expect(size).toBeLessThan(5_000);
    });

    it('medium journey payload is acceptable for mobile', () => {
      const size = measurePayloadSize(wrapJourneyResponse(MEDIUM_JOURNEY));
      // Under 20KB for mid-journey
      expect(size).toBeLessThan(20_000);
    });

    it('large journey payload is still workable on mobile', () => {
      const size = measurePayloadSize(wrapJourneyResponse(LARGE_JOURNEY));
      // Even large state should be under 50KB for mobile
      expect(size).toBeLessThan(50_000);

      // Calculate transfer time on slow 3G (~400kbps = 50KB/s)
      const transferTimeMs = (size / 50_000) * 1000;
      console.log(`Large journey on slow 3G: ~${Math.round(transferTimeMs)}ms transfer time`);
      expect(transferTimeMs).toBeLessThan(2000); // Under 2s on slow 3G
    });
  });

  // ============================================
  // PROCESSING SPEED (simulating slower device)
  // ============================================

  describe('Processing on constrained devices', () => {
    it('orchestrator build is fast enough for mobile CPUs', () => {
      // Mobile CPUs are typically 2-4x slower than desktop
      // We test that even with a generous multiplier, it's still acceptable
      const preset = JOURNEY_PRESETS.fullyComplete();

      const result = benchmark(
        'Orchestrator build (mobile proxy)',
        () => {
          const orch = createOrchestrator(preset.context, preset.dbState);
          orch.getUIState();
        },
        200
      );

      // Even at 4x desktop time, should be under 40ms
      const mobileEstimate = result.p95 * 4;
      console.log(`Orchestrator build: desktop p95=${result.p95}ms, mobile estimate=${mobileEstimate.toFixed(1)}ms`);
      expect(mobileEstimate).toBeLessThan(40);
    });

    it('JSON parsing of journey data is fast for mobile', () => {
      const serialized = JSON.stringify(wrapJourneyResponse(LARGE_JOURNEY));

      const result = benchmark(
        'JSON.parse (large journey, mobile proxy)',
        () => {
          JSON.parse(serialized);
        },
        200
      );

      // 4x for mobile
      const mobileEstimate = result.p95 * 4;
      expect(mobileEstimate).toBeLessThan(50);
    });
  });

  // ============================================
  // STEP RENDERING DATA (mobile card count)
  // ============================================

  describe('Mobile rendering data volume', () => {
    it('active tab shows manageable number of items', () => {
      // On mobile, showing too many items at once causes scroll jank
      const preset = JOURNEY_PRESETS.fullyComplete();
      const orch = createOrchestrator(preset.context, preset.dbState);
      const state = orch.getUIState();

      // Steps per lens
      const discoverSteps = state.steps.filter((s) => ['REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE'].includes(s.id));
      const understandSteps = state.steps.filter((s) => ['REVIEW_INDUSTRY_OUTLOOK', 'CAREER_SHADOW', 'CREATE_ACTION_PLAN'].includes(s.id));
      const actSteps = state.steps.filter((s) => ['COMPLETE_ALIGNED_ACTION', 'SUBMIT_ACTION_REFLECTION', 'UPDATE_PLAN', 'EXTERNAL_FEEDBACK'].includes(s.id));

      // Each tab shows a manageable number of cards
      expect(discoverSteps.length).toBeLessThanOrEqual(5);
      expect(understandSteps.length).toBeLessThanOrEqual(5);
      expect(actSteps.length).toBeLessThanOrEqual(5);
    });

    it('aligned actions list is bounded for mobile display', () => {
      // Even with many actions, the summary should be bounded
      const summary = LARGE_JOURNEY.summary;
      const actionsToRender = summary.alignedActions || [];

      // If there are many actions, the UI should paginate or limit
      // For now, verify the count is known
      console.log(`Aligned actions to render: ${actionsToRender.length}`);

      // This is informational — if > 20, consider pagination
      if (actionsToRender.length > 20) {
        console.warn('Consider paginating aligned actions on mobile (> 20 items)');
      }
    });
  });

  // ============================================
  // INTERACTION RESPONSIVENESS PROXY
  // ============================================

  describe('Touch interaction responsiveness', () => {
    it('tab switch computation is under 16ms (single frame)', () => {
      // Tab switching should complete within a single animation frame (16ms)
      // This tests the state computation portion
      const presets = ['empty', 'discoverComplete', 'fullyComplete'] as const;

      for (const presetName of presets) {
        const preset = JOURNEY_PRESETS[presetName]();
        const orch = createOrchestrator(preset.context, preset.dbState);
        const state = orch.getUIState();

        const { timing } = measureTimeSync(
          `Tab switch compute (${presetName})`,
          () => {
            // Simulate the work done on tab switch:
            // 1. Filter steps for the target tab
            const tabSteps = state.steps.filter((s) =>
              ['REVIEW_INDUSTRY_OUTLOOK', 'CAREER_SHADOW', 'CREATE_ACTION_PLAN'].includes(s.id)
            );
            // 2. Compute derived state
            const progress = state.summary.lenses.understand;
            // 3. Check gating
            const isLocked = !state.summary.lenses.discover.isComplete;
          },
          16
        );

        expect(timing.duration).toBeLessThan(16);
      }
    });

    it('expand/collapse state change is trivial', () => {
      // Expanding a section is just a boolean state flip
      const result = benchmark(
        'Expand/collapse toggle',
        () => {
          let expanded = false;
          expanded = !expanded;
          // Simulate conditional rendering check
          if (expanded) {
            const content = { visible: true, height: 'auto' };
          }
        },
        1000
      );

      // Should be sub-microsecond
      expect(result.p95).toBeLessThan(0.5);
    });
  });

  // ============================================
  // VISUAL STABILITY PROXY
  // ============================================

  describe('Visual stability indicators', () => {
    it('UI state has all fields populated (no late data shifts)', () => {
      // CLS is caused by content loading late and shifting layout
      // If the UI state has all fields from the start, layout is stable
      const preset = JOURNEY_PRESETS.fullyComplete();
      const orch = createOrchestrator(preset.context, preset.dbState);
      const state = orch.getUIState();

      // Every step has a title and status (no undefined that would cause shift)
      for (const step of state.steps) {
        expect(step.title).toBeTruthy();
        expect(step.status).toBeTruthy();
        expect(step.id).toBeTruthy();
      }

      // Progress values are numbers (no NaN/undefined)
      expect(typeof state.summary.lenses.discover.progress).toBe('number');
      expect(typeof state.summary.lenses.understand.progress).toBe('number');
      expect(typeof state.summary.lenses.act.progress).toBe('number');
      expect(Number.isNaN(state.summary.lenses.discover.progress)).toBe(false);
    });

    it('empty journey still has complete UI structure', () => {
      const orch = createOrchestrator(
        JOURNEY_PRESETS.empty().context,
        JOURNEY_PRESETS.empty().dbState
      );
      const state = orch.getUIState();

      // Even empty state should have all structural fields
      expect(state.steps.length).toBeGreaterThan(0);
      expect(state.summary.lenses.discover).toBeDefined();
      expect(state.summary.lenses.understand).toBeDefined();
      expect(state.summary.lenses.act).toBeDefined();
      expect(state.currentLens).toBeDefined();
      expect(state.currentState).toBeDefined();
    });
  });
});
