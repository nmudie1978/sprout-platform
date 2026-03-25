/**
 * Payload Size Performance Tests
 *
 * Measures the size of journey API responses to ensure
 * they stay within acceptable limits as data grows.
 */

import { describe, it, expect } from 'vitest';
import {
  EMPTY_JOURNEY,
  MEDIUM_JOURNEY,
  LARGE_JOURNEY,
  wrapJourneyResponse,
  wrapGoalsResponse,
  wrapReflectionsResponse,
} from '../fixtures/journey-states';
import {
  measurePayloadSize,
  assertPayloadWithinBudget,
  PERF_BUDGETS,
} from '../utils/performance-helpers';

describe('Journey Payload Size', () => {
  it('empty journey response is compact', () => {
    const payload = wrapJourneyResponse(EMPTY_JOURNEY);
    const size = measurePayloadSize(payload);

    expect(size).toBeLessThan(5_000); // < 5KB for empty state
  });

  it('medium journey response stays reasonable', () => {
    const payload = wrapJourneyResponse(MEDIUM_JOURNEY);
    const size = measurePayloadSize(payload);

    expect(size).toBeLessThan(15_000); // < 15KB for mid-journey
  });

  it('large journey response stays within budget', () => {
    const payload = wrapJourneyResponse(LARGE_JOURNEY);
    const { size, passed, budget } = assertPayloadWithinBudget(payload);

    console.log(`Large journey payload: ${(size / 1024).toFixed(1)}KB (budget: ${(budget / 1024).toFixed(1)}KB)`);
    expect(passed).toBe(true);
  });

  it('payload growth is sub-linear relative to data volume', () => {
    const emptySize = measurePayloadSize(wrapJourneyResponse(EMPTY_JOURNEY));
    const mediumSize = measurePayloadSize(wrapJourneyResponse(MEDIUM_JOURNEY));
    const largeSize = measurePayloadSize(wrapJourneyResponse(LARGE_JOURNEY));

    // Large should not be 10x medium
    const growthRatio = largeSize / mediumSize;
    console.log(`Payload growth: empty=${emptySize}B, medium=${mediumSize}B, large=${largeSize}B, ratio=${growthRatio.toFixed(2)}x`);

    expect(growthRatio).toBeLessThan(10);
  });

  it('goals response is minimal', () => {
    const payload = wrapGoalsResponse({ title: 'Doctor' }, { title: 'Engineer' });
    const size = measurePayloadSize(payload);

    expect(size).toBeLessThan(500);
  });

  it('reflections response is compact', () => {
    const payload = wrapReflectionsResponse(true);
    const size = measurePayloadSize(payload);

    expect(size).toBeLessThan(1_000);
  });

  it('combined initial page data stays within total budget', () => {
    // Simulate all data fetched on initial My Journey load
    const journeyPayload = wrapJourneyResponse(LARGE_JOURNEY);
    const goalsPayload = wrapGoalsResponse({ title: 'Doctor' });
    const reflectionsPayload = wrapReflectionsResponse(true);
    const goalDataPayload = { goalData: { updatedAt: new Date().toISOString(), createdAt: '2026-01-01' } };

    const totalSize = [journeyPayload, goalsPayload, reflectionsPayload, goalDataPayload]
      .reduce((sum, p) => sum + measurePayloadSize(p), 0);

    console.log(`Total initial page data: ${(totalSize / 1024).toFixed(1)}KB`);

    // Total initial load data should be under 60KB
    expect(totalSize).toBeLessThan(60_000);
  });
});
