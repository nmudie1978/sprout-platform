/**
 * Data Scale Performance Tests
 *
 * Validates that the journey system maintains acceptable
 * performance as data volume grows — more goals, more actions,
 * more reflections, more saved content.
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
  measurePayloadSize,
  PERF_BUDGETS,
  formatBenchmarkReport,
} from '../utils/performance-helpers';

describe('Data Scale Performance', () => {
  // ============================================
  // SCALING: Explored Roles
  // ============================================

  it('performance with increasing explored roles count', () => {
    const roleCounts = [1, 5, 10, 25, 50];
    const results = [];

    for (const count of roleCounts) {
      const context = makeContext({
        confirmedStrengths: ['A', 'B', 'C'],
        exploredRolesCount: count,
        primaryGoalSelected: true,
      });

      const dbState = {
        journeyState: 'ROLE_DEEP_DIVE',
        journeyCompletedSteps: ['REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS'],
        journeySummary: makeSummary({
          exploredRoles: Array.from({ length: count }, (_, i) =>
            makeExploredRole(`Role ${i}`)
          ),
        }),
      };

      const result = benchmark(
        `${count} explored roles`,
        () => {
          const orch = createOrchestrator(context, dbState);
          orch.getUIState();
        },
        100
      );

      results.push(result);
    }

    console.log(formatBenchmarkReport(results));

    // Performance should not degrade significantly from 1 to 50 roles
    // Use median for stability (p95 is noisy at sub-ms scale)
    const ratio = results[results.length - 1].median / Math.max(results[0].median, 0.001);
    expect(ratio).toBeLessThan(10);
  });

  // ============================================
  // SCALING: Aligned Actions
  // ============================================

  it('performance with increasing aligned actions', () => {
    const actionCounts = [1, 5, 10, 25, 50];
    const results = [];

    for (const count of actionCounts) {
      const context = makeContext({
        confirmedStrengths: ['A', 'B', 'C'],
        primaryGoalSelected: true,
        alignedActionsCompleted: count,
        actionReflectionsSubmitted: Math.floor(count * 0.8),
      });

      const dbState = {
        journeyState: 'COMPLETE_ALIGNED_ACTION',
        journeyCompletedSteps: [
          'REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE',
          'REVIEW_INDUSTRY_OUTLOOK', 'CAREER_SHADOW', 'CREATE_ACTION_PLAN',
        ],
        journeySummary: makeSummary({
          alignedActionsCount: count,
          alignedActions: Array.from({ length: count }, (_, i) => ({
            id: `action-${i}`,
            type: 'VOLUNTEER_WORK',
            title: `Action ${i}`,
            completedAt: `2026-02-${String(i + 1).padStart(2, '0')}`,
            linkedToGoal: true,
          })),
          alignedActionReflections: Array.from({ length: Math.floor(count * 0.8) }, (_, i) => ({
            id: `ref-${i}`,
            actionId: `action-${i}`,
            prompt: `Reflect on ${i}`,
            response: `Reflection ${i}`,
            createdAt: `2026-03-${String(i + 1).padStart(2, '0')}`,
          })),
        }),
      };

      const result = benchmark(
        `${count} aligned actions`,
        () => {
          const orch = createOrchestrator(context, dbState);
          orch.getUIState();
        },
        100
      );

      results.push(result);
    }

    console.log(formatBenchmarkReport(results));

    const ratio = results[results.length - 1].median / Math.max(results[0].median, 0.001);
    expect(ratio).toBeLessThan(10);
  });

  // ============================================
  // SCALING: Payload size growth
  // ============================================

  it('payload size grows linearly with data', () => {
    const sizes: { count: number; bytes: number }[] = [];

    for (const count of [1, 5, 10, 25, 50]) {
      const summary = makeSummary({
        exploredRoles: Array.from({ length: count }, (_, i) => makeExploredRole(`Role ${i}`)),
        alignedActions: Array.from({ length: count }, (_, i) => ({
          id: `a-${i}`, type: 'VOLUNTEER_WORK', title: `Action ${i}`,
          completedAt: '2026-01-01', linkedToGoal: true,
        })),
        alignedActionReflections: Array.from({ length: count }, (_, i) => ({
          id: `r-${i}`, actionId: `a-${i}`, prompt: `Prompt ${i}`,
          response: `Response ${i}`, createdAt: '2026-01-01',
        })),
      });

      const bytes = measurePayloadSize({ success: true, journey: { summary } });
      sizes.push({ count, bytes });
    }

    // Check growth is roughly linear
    const first = sizes[0];
    const last = sizes[sizes.length - 1];
    const dataGrowth = last.count / first.count;
    const sizeGrowth = last.bytes / first.bytes;

    console.log('Payload growth:', sizes.map((s) => `${s.count} items → ${(s.bytes / 1024).toFixed(1)}KB`).join(', '));

    // Size should grow less than data volume (sub-linear to linear)
    expect(sizeGrowth).toBeLessThan(dataGrowth * 1.5);
  });

  // ============================================
  // SCALING: Multiple saved goals
  // ============================================

  it('performance with multiple saved goal states', () => {
    const goalCounts = [1, 3, 5, 10];
    const results = [];

    for (const count of goalCounts) {
      const goalStates = Array.from({ length: count }, (_, i) => ({
        goalId: `goal-${i}`,
        goalTitle: `Career ${i}`,
        journeyState: 'CAREER_SHADOW',
        completedSteps: ['REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE', 'REVIEW_INDUSTRY_OUTLOOK'],
        summary: makeSummary({
          primaryGoal: { title: `Career ${i}`, selectedAt: '2026-01-01' },
          exploredRoles: [makeExploredRole(`Career ${i}`)],
        }),
      }));

      const result = benchmark(
        `${count} saved goals (serialize/deserialize)`,
        () => {
          const serialized = JSON.stringify(goalStates);
          JSON.parse(serialized);
        },
        100
      );

      results.push(result);
    }

    console.log(formatBenchmarkReport(results));

    for (const result of results) {
      expect(result.p95).toBeLessThan(10); // Under 10ms even for 10 goals
    }
  });

  // ============================================
  // EDGE: Very large summary
  // ============================================

  it('handles extremely large summary without crash', () => {
    const context = makeContext({
      confirmedStrengths: Array.from({ length: 50 }, (_, i) => `Strength ${i}`),
      savedCareers: Array.from({ length: 100 }, (_, i) => ({
        id: `c-${i}`, title: `Career ${i}`, savedAt: '2026-01-01',
      })),
      exploredRolesCount: 100,
      primaryGoalSelected: true,
      alignedActionsCompleted: 100,
      actionReflectionsSubmitted: 80,
    });

    const dbState = {
      journeyState: 'COMPLETE_ALIGNED_ACTION',
      journeyCompletedSteps: [
        'REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE',
        'REVIEW_INDUSTRY_OUTLOOK', 'CAREER_SHADOW', 'CREATE_ACTION_PLAN',
      ],
      journeySummary: makeSummary({
        exploredRoles: Array.from({ length: 100 }, (_, i) => makeExploredRole(`Role ${i}`)),
        alignedActionsCount: 100,
        alignedActions: Array.from({ length: 100 }, (_, i) => ({
          id: `a-${i}`, type: 'VOLUNTEER_WORK', title: `Action ${i}`,
          completedAt: '2026-01-01', linkedToGoal: true,
        })),
      }),
    };

    const { timing, result } = measureTimeSync(
      'Extreme data (100 roles, 100 actions)',
      () => {
        const orch = createOrchestrator(context, dbState);
        return orch.getUIState();
      },
      50 // Allow more headroom for extreme case
    );

    expect(result).toBeDefined();
    expect(result.steps.length).toBeGreaterThan(0);
    expect(timing.duration).toBeLessThan(50);

    const payloadSize = measurePayloadSize(result);
    console.log(`Extreme data payload: ${(payloadSize / 1024).toFixed(1)}KB, build time: ${timing.duration}ms`);
  });
});
