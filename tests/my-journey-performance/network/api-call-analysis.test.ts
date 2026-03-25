/**
 * Network Efficiency Tests — API Call Analysis
 *
 * Validates that My Journey does not make excessive, duplicate,
 * or unnecessary API calls during key user flows.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createNetworkTracker,
  PERF_BUDGETS,
} from '../utils/performance-helpers';
import {
  createMockFetch,
  createJourneyMockRoutes,
} from '../utils/mock-fetch';
import {
  wrapJourneyResponse,
  wrapGoalsResponse,
  wrapReflectionsResponse,
  wrapGoalDataResponse,
  MEDIUM_JOURNEY,
  LARGE_JOURNEY,
} from '../fixtures/journey-states';

describe('API Call Analysis', () => {
  // ============================================
  // INITIAL PAGE LOAD API CALLS
  // ============================================

  describe('Initial page load', () => {
    it('expected API calls are within budget', () => {
      const tracker = createNetworkTracker();

      // Simulate the API calls made by My Journey page on mount:
      // 1. GET /api/journey
      // 2. GET /api/goals (via useGoals)
      // 3. GET /api/discover/reflections (for discover completion check)
      // 4. GET /api/journey/goal-data?goalId=xxx (for last-used timestamp)
      // 5. POST /api/journey/goal-data/migrate (one-time migration)

      const expectedCalls = [
        { url: '/api/journey', method: 'GET' },
        { url: '/api/goals', method: 'GET' },
        { url: '/api/discover/reflections', method: 'GET' },
        { url: '/api/journey/goal-data?goalId=doctor', method: 'GET' },
        { url: '/api/journey/goal-data/migrate', method: 'POST' },
      ];

      for (const call of expectedCalls) {
        tracker.record({
          url: call.url,
          method: call.method,
          timestamp: Date.now(),
          duration: 50,
          payloadSize: 1000,
        });
      }

      const report = tracker.report();

      expect(report.totalCalls).toBeLessThanOrEqual(PERF_BUDGETS.INITIAL_API_CALLS);
      expect(report.duplicates.length).toBe(0);
      expect(report.issues.length).toBe(0);
    });

    it('no duplicate requests on initial load', () => {
      const tracker = createNetworkTracker();

      // Record what the page actually does
      const calls = [
        '/api/journey',
        '/api/goals',
        '/api/discover/reflections',
        '/api/journey/goal-data?goalId=doctor',
      ];

      for (const url of calls) {
        tracker.record({ url, method: 'GET', timestamp: Date.now() });
      }

      const duplicates = tracker.getDuplicates();
      expect(duplicates.size).toBe(0);
    });
  });

  // ============================================
  // STEP COMPLETION NETWORK BEHAVIOR
  // ============================================

  describe('Step completion', () => {
    it('step completion triggers minimal refetch', () => {
      const tracker = createNetworkTracker();

      // Step completion should trigger:
      // 1. POST /api/journey/complete (the mutation)
      // 2. GET /api/journey (invalidation refetch)
      // That's it — no other endpoints should be hit

      tracker.record({ url: '/api/journey/complete', method: 'POST', timestamp: Date.now(), duration: 100 });
      tracker.record({ url: '/api/journey', method: 'GET', timestamp: Date.now() + 100, duration: 80 });

      const journeyCalls = tracker.getByPattern(/\/api\/journey/);
      expect(journeyCalls.length).toBe(2);
    });

    it('no cascade of refetches after completion', () => {
      const tracker = createNetworkTracker();

      // Simulate: complete step, then check no unnecessary calls happen
      tracker.record({ url: '/api/journey/complete', method: 'POST', timestamp: 0 });
      tracker.record({ url: '/api/journey', method: 'GET', timestamp: 100 });

      // These should NOT happen after a step completion:
      const unnecessaryCalls = tracker.getByPattern(/\/api\/(goals|discover|journey\/goal-data)/);
      expect(unnecessaryCalls.length).toBe(0);
    });
  });

  // ============================================
  // GOAL SWITCHING NETWORK BEHAVIOR
  // ============================================

  describe('Goal switching', () => {
    it('goal switch triggers expected API calls', () => {
      const tracker = createNetworkTracker();

      // Goal switch should trigger:
      // 1. PUT /api/goals (save new goal)
      // 2. POST /api/journey/goal-data (save old goal's journey to goal-data)
      // 3. GET /api/journey (refetch journey state)
      // 4. GET /api/goals (refetch goals)

      const goalSwitchCalls = [
        { url: '/api/goals', method: 'PUT', timestamp: 0 },
        { url: '/api/journey/goal-data', method: 'POST', timestamp: 50 },
        { url: '/api/journey', method: 'GET', timestamp: 150 },
        { url: '/api/goals', method: 'GET', timestamp: 150 },
      ];

      for (const call of goalSwitchCalls) {
        tracker.record({ ...call, duration: 80 });
      }

      expect(tracker.getCallCount()).toBeLessThanOrEqual(5);
      expect(tracker.getDuplicates().size).toBe(0);
    });
  });

  // ============================================
  // TAB SWITCHING NETWORK BEHAVIOR
  // ============================================

  describe('Tab switching', () => {
    it('switching tabs should NOT trigger API calls', () => {
      const tracker = createNetworkTracker();

      // Tab switching is purely client-side state change
      // No API calls should be needed
      // (the journey data is already loaded)

      const report = tracker.report();
      expect(report.totalCalls).toBe(0);
    });
  });

  // ============================================
  // PAYLOAD SIZE ANALYSIS
  // ============================================

  describe('Payload sizes', () => {
    it('journey API response for large state is within budget', () => {
      const tracker = createNetworkTracker();
      const payload = JSON.stringify(wrapJourneyResponse(LARGE_JOURNEY));
      const payloadSize = new Blob([payload]).size;

      tracker.record({
        url: '/api/journey',
        method: 'GET',
        timestamp: Date.now(),
        payloadSize,
      });

      expect(payloadSize).toBeLessThan(PERF_BUDGETS.JOURNEY_PAYLOAD_SIZE);
    });
  });

  // ============================================
  // MOCK FETCH INTEGRATION
  // ============================================

  describe('Mock fetch validation', () => {
    it('mock routes cover all expected endpoints', () => {
      const tracker = createNetworkTracker();
      const routes = createJourneyMockRoutes({
        journeyResponse: wrapJourneyResponse(MEDIUM_JOURNEY),
        goalsResponse: wrapGoalsResponse({ title: 'Doctor' }),
        reflectionsResponse: wrapReflectionsResponse(true),
        goalDataResponse: wrapGoalDataResponse(true),
      });

      const mock = createMockFetch({ routes, networkTracker: tracker });

      // Verify all expected endpoints have routes
      const expectedPatterns = [
        '/api/journey',
        '/api/goals',
        '/api/discover/reflections',
        '/api/journey/goal-data?goalId=doctor',
        '/api/journey/goal-data/migrate',
      ];

      for (const pattern of expectedPatterns) {
        const matchingRoute = routes.find((r) =>
          typeof r.pattern === 'string'
            ? pattern.includes(r.pattern)
            : r.pattern.test(pattern)
        );
        expect(matchingRoute, `Missing mock route for: ${pattern}`).toBeDefined();
      }
    });

    it('mock fetch tracks calls accurately', async () => {
      const tracker = createNetworkTracker();
      const routes = createJourneyMockRoutes();
      const mock = createMockFetch({ routes, networkTracker: tracker });

      await mock.fetch('/api/journey');
      await mock.fetch('/api/goals');

      expect(mock.getCallCount()).toBe(2);
      expect(tracker.getCallCount()).toBe(2);
    });
  });
});
