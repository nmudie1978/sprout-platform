/**
 * Journey Profiler Tests
 *
 * Uses the profiling utilities to validate render budgets,
 * detect hot components, and verify memoization opportunities.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createJourneyProfiler,
  validateRenderBudgets,
  JOURNEY_COMPONENTS,
  testMemoizationBenefit,
} from './component-profiler';
import { createRenderTracker, PERF_BUDGETS } from '../utils/performance-helpers';
import { createOrchestrator } from '@/lib/journey/orchestrator';
import { JOURNEY_PRESETS } from '../../my-journey/utils/test-helpers';

describe('Journey Profiler', () => {
  let profiler: ReturnType<typeof createJourneyProfiler>;

  beforeEach(() => {
    profiler = createJourneyProfiler();
  });

  // ============================================
  // PAGE MOUNT SIMULATION
  // ============================================

  it('page mount stays within render budgets', () => {
    profiler.simulatePageMount();
    const report = profiler.report();

    expect(report.hotComponents.length).toBe(0);
    expect(report.budgetResults.every((r) => r.passed)).toBe(true);
  });

  // ============================================
  // TAB SWITCH SIMULATION
  // ============================================

  it('tab switch does not cause excessive renders', () => {
    profiler.simulatePageMount();
    profiler.simulateTabSwitch('DiscoverTab', 'UnderstandTab');

    const report = profiler.report();

    // MyJourneyPage: 2 (mount) + 1 (switch) = 3
    expect(profiler.tracker.getRenderCount('MyJourneyPage')).toBeLessThanOrEqual(
      JOURNEY_COMPONENTS.MyJourneyPage.maxRenders
    );

    // Each tab should only render once
    expect(profiler.tracker.getRenderCount('DiscoverTab')).toBe(1);
    expect(profiler.tracker.getRenderCount('UnderstandTab')).toBe(1);
  });

  it('multiple tab switches maintain budget', () => {
    profiler.simulatePageMount();
    profiler.simulateTabSwitch('DiscoverTab', 'UnderstandTab');
    profiler.simulateTabSwitch('UnderstandTab', 'ActTab');
    profiler.simulateTabSwitch('ActTab', 'DiscoverTab');

    // Each tab should have rendered exactly once (mount only, not remount)
    // But if tabs unmount/remount, each switch causes 1 render
    const discoverRenders = profiler.tracker.getRenderCount('DiscoverTab');
    const understandRenders = profiler.tracker.getRenderCount('UnderstandTab');
    const actRenders = profiler.tracker.getRenderCount('ActTab');

    // Total tab renders should be reasonable
    expect(discoverRenders + understandRenders + actRenders).toBeLessThanOrEqual(6);
  });

  // ============================================
  // STEP COMPLETION SIMULATION
  // ============================================

  it('step completion triggers targeted re-renders', () => {
    profiler.simulatePageMount();
    profiler.simulateStepCompletion('StepRow');

    const report = profiler.report();

    // Most components should be within budget after one step completion
    const failures = report.budgetResults.filter((r) => !r.passed);
    expect(failures.length).toBe(0);
  });

  // ============================================
  // RECOMMENDATIONS ENGINE
  // ============================================

  it('generates recommendations for over-rendering components', () => {
    // Simulate excessive rendering
    for (let i = 0; i < 10; i++) {
      profiler.recordRender('StageTabBar', 2);
    }

    const report = profiler.report();
    expect(report.recommendations.length).toBeGreaterThan(0);
    expect(report.hotComponents).toContain('StageTabBar');
  });

  it('detects expensive + frequent components', () => {
    // Simulate expensive component rendering multiple times
    profiler.recordRender('PersonalCareerTimeline', 15); // 15ms
    profiler.recordRender('PersonalCareerTimeline', 12); // 12ms
    profiler.recordRender('PersonalCareerTimeline', 18); // 18ms

    const report = profiler.report();

    const timelineEntry = report.renderReport.components.find(
      (c) => c.name === 'PersonalCareerTimeline'
    );
    expect(timelineEntry).toBeDefined();
    expect(timelineEntry!.renderCount).toBe(3);
    expect(timelineEntry!.avgDuration).toBeGreaterThan(10);

    // Should generate a recommendation
    expect(report.recommendations.some((r) => r.includes('PersonalCareerTimeline'))).toBe(true);
  });

  // ============================================
  // MEMOIZATION ANALYSIS
  // ============================================

  it('identifies computations worth memoizing', () => {
    const preset = JOURNEY_PRESETS.fullyComplete();

    const orchestratorBuild = testMemoizationBenefit(
      'Orchestrator build',
      () => {
        const orch = createOrchestrator(preset.context, preset.dbState);
        orch.getUIState();
      }
    );

    console.log(`Orchestrator build: avg=${orchestratorBuild.firstRunAvg}ms, worth memoizing: ${orchestratorBuild.worthMemoizing}`);

    // The orchestrator build should be fast enough that memoization
    // is nice-to-have but not critical
    expect(orchestratorBuild.firstRunAvg).toBeLessThan(PERF_BUDGETS.ORCHESTRATOR_BUILD);
  });

  it('identifies trivial computations not worth memoizing', () => {
    const result = testMemoizationBenefit(
      'Simple array.includes check',
      () => {
        const states = ['A', 'B', 'C', 'D', 'E'];
        states.includes('C');
      }
    );

    // This should be too fast to benefit from memoization
    expect(result.firstRunAvg).toBeLessThan(0.1);
  });
});
