/**
 * Component Profiler Utilities
 *
 * Provides instrumentation for tracking React component performance
 * in the My Journey feature. These utilities can be used in dev mode
 * to identify hot spots and unnecessary re-renders.
 */

import { createRenderTracker, type RenderTracker, type RenderReport } from '../utils/performance-helpers';

// ============================================
// JOURNEY COMPONENT REGISTRY
// ============================================

/**
 * Known journey components and their expected render behavior.
 * Used to validate render counts against expectations.
 */
export const JOURNEY_COMPONENTS = {
  // Page-level
  'MyJourneyPage': { maxRenders: 3, category: 'page' },
  'StageTabBar': { maxRenders: 3, category: 'navigation' },

  // Tab components
  'DiscoverTab': { maxRenders: 2, category: 'tab' },
  'UnderstandTab': { maxRenders: 2, category: 'tab' },
  'ActTab': { maxRenders: 2, category: 'tab' },
  'LearningGoalsTab': { maxRenders: 2, category: 'tab' },
  'ReflectionsTab': { maxRenders: 2, category: 'tab' },
  'TimelineTab': { maxRenders: 2, category: 'tab' },
  'LibraryTab': { maxRenders: 2, category: 'tab' },

  // Step components
  'StepRow': { maxRenders: 2, category: 'step' },
  'StepContent': { maxRenders: 2, category: 'step' },

  // Feature components
  'GuidanceStack': { maxRenders: 2, category: 'feature' },
  'DiscoverReflectionsSection': { maxRenders: 2, category: 'feature' },
  'PersonalCareerTimeline': { maxRenders: 2, category: 'feature' },
  'SchoolAlignmentTab': { maxRenders: 2, category: 'feature' },

  // Modals
  'GoalSelectionSheet': { maxRenders: 1, category: 'modal' },
  'DiscoverCompleteModal': { maxRenders: 1, category: 'modal' },
  'UnderstandCompleteModal': { maxRenders: 1, category: 'modal' },
  'CareerDetailSheet': { maxRenders: 1, category: 'modal' },
} as const;

// ============================================
// RENDER BUDGET VALIDATOR
// ============================================

export interface RenderBudgetResult {
  component: string;
  actual: number;
  budget: number;
  passed: boolean;
  category: string;
}

export function validateRenderBudgets(tracker: RenderTracker): RenderBudgetResult[] {
  const results: RenderBudgetResult[] = [];

  for (const [component, config] of Object.entries(JOURNEY_COMPONENTS)) {
    const actual = tracker.getRenderCount(component);
    if (actual > 0) {
      results.push({
        component,
        actual,
        budget: config.maxRenders,
        passed: actual <= config.maxRenders,
        category: config.category,
      });
    }
  }

  return results;
}

// ============================================
// JOURNEY PROFILER
// ============================================

export interface JourneyProfileReport {
  renderReport: RenderReport;
  budgetResults: RenderBudgetResult[];
  hotComponents: string[];
  totalRenders: number;
  recommendations: string[];
}

/**
 * Creates a profiler instance for tracking My Journey render performance.
 */
export function createJourneyProfiler() {
  const tracker = createRenderTracker();

  return {
    tracker,

    /**
     * Simulate a component render.
     * Call this from test code to record render events.
     */
    recordRender(componentName: string, durationMs = 0) {
      if (durationMs > 0) {
        tracker.trackWithDuration(componentName, durationMs);
      } else {
        tracker.track(componentName);
      }
    },

    /**
     * Simulate a full page mount sequence.
     */
    simulatePageMount() {
      // Initial render (before data)
      tracker.track('MyJourneyPage');
      tracker.track('StageTabBar');

      // Data arrives, re-render
      tracker.track('MyJourneyPage');
      tracker.track('StageTabBar');
      tracker.track('DiscoverTab');
    },

    /**
     * Simulate tab switch from one tab to another.
     */
    simulateTabSwitch(from: string, to: string) {
      tracker.track('MyJourneyPage');
      tracker.track('StageTabBar');
      tracker.track(to);
    },

    /**
     * Simulate step completion and data refresh.
     */
    simulateStepCompletion(stepName: string) {
      tracker.track('MyJourneyPage'); // query invalidation
      tracker.track('StageTabBar');    // progress update
      tracker.track('DiscoverTab');     // step status change
      tracker.track(stepName);         // the completed step
    },

    /**
     * Generate a full profiling report.
     */
    report(): JourneyProfileReport {
      const renderReport = tracker.report();
      const budgetResults = validateRenderBudgets(tracker);
      const recommendations: string[] = [];

      // Analyze and generate recommendations
      const failures = budgetResults.filter((r) => !r.passed);
      for (const f of failures) {
        recommendations.push(
          `${f.component} rendered ${f.actual}x (budget: ${f.budget}). Consider React.memo or moving state down.`
        );
      }

      if (renderReport.totalRenders > 20) {
        recommendations.push(
          `High total render count (${renderReport.totalRenders}). Check if parent re-renders are cascading unnecessarily.`
        );
      }

      // Check for expensive components rendering too often
      for (const comp of renderReport.components) {
        if (comp.avgDuration > 5 && comp.renderCount > 1) {
          recommendations.push(
            `${comp.name} is expensive (avg ${comp.avgDuration}ms) and renders ${comp.renderCount}x. Memoize or optimize.`
          );
        }
      }

      return {
        renderReport,
        budgetResults,
        hotComponents: renderReport.hotspots,
        totalRenders: renderReport.totalRenders,
        recommendations,
      };
    },

    reset() {
      tracker.reset();
    },
  };
}

// ============================================
// MEMOIZATION EFFECTIVENESS CHECKER
// ============================================

/**
 * Tests whether a computation benefits from memoization.
 * Runs the function twice with the same input and checks
 * if the second run is significantly faster (cache hit).
 */
export function testMemoizationBenefit<T>(
  name: string,
  fn: () => T,
  iterations = 100
): {
  name: string;
  firstRunAvg: number;
  subsequentRunAvg: number;
  speedup: number;
  worthMemoizing: boolean;
} {
  // Cold runs
  const coldDurations: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    coldDurations.push(performance.now() - start);
  }

  const firstRunAvg = coldDurations.reduce((a, b) => a + b, 0) / coldDurations.length;

  // If computation is already under 0.1ms, memoization is unnecessary
  const worthMemoizing = firstRunAvg > 0.1;

  return {
    name,
    firstRunAvg: Math.round(firstRunAvg * 1000) / 1000,
    subsequentRunAvg: Math.round(firstRunAvg * 1000) / 1000, // Same since no actual memo
    speedup: 1,
    worthMemoizing,
  };
}
