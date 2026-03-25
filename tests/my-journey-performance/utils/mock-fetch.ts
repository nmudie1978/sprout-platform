/**
 * Fetch Mock Utility for Performance Tests
 *
 * Intercepts fetch calls to simulate API behavior with
 * configurable delays, payload tracking, and request counting.
 */

import { type NetworkTracker } from './performance-helpers';

export interface MockRoute {
  pattern: string | RegExp;
  method?: string;
  response: unknown;
  delay?: number;
  status?: number;
}

export interface FetchMockOptions {
  routes: MockRoute[];
  networkTracker?: NetworkTracker;
  defaultDelay?: number;
}

/**
 * Creates a mock fetch function that intercepts requests matching defined routes.
 * Records all calls to the network tracker for analysis.
 */
export function createMockFetch(options: FetchMockOptions) {
  const { routes, networkTracker, defaultDelay = 0 } = options;
  let callCount = 0;

  const mockFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const method = init?.method || 'GET';
    const startTime = performance.now();
    callCount++;

    // Find matching route
    const route = routes.find((r) => {
      const patternMatch = typeof r.pattern === 'string'
        ? url.includes(r.pattern)
        : r.pattern.test(url);
      const methodMatch = !r.method || r.method.toUpperCase() === method.toUpperCase();
      return patternMatch && methodMatch;
    });

    const delay = route?.delay ?? defaultDelay;
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    const responseData = route?.response ?? { error: 'Not found' };
    const status = route?.status ?? (route ? 200 : 404);
    const body = JSON.stringify(responseData);
    const duration = performance.now() - startTime;

    // Record to network tracker
    networkTracker?.record({
      url,
      method,
      timestamp: Date.now(),
      duration: Math.round(duration * 100) / 100,
      payloadSize: new Blob([body]).size,
      status,
    });

    return new Response(body, {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  return {
    fetch: mockFetch as typeof globalThis.fetch,
    getCallCount: () => callCount,
    reset: () => { callCount = 0; },
  };
}

/**
 * Standard mock routes for My Journey page load.
 * Covers all API calls made during initial render.
 */
export function createJourneyMockRoutes(overrides: {
  journeyResponse?: unknown;
  goalsResponse?: unknown;
  reflectionsResponse?: unknown;
  goalDataResponse?: unknown;
  delay?: number;
} = {}): MockRoute[] {
  const delay = overrides.delay ?? 0;

  return [
    {
      pattern: '/api/journey/goal-data/migrate',
      method: 'POST',
      response: { success: true },
      delay,
    },
    {
      pattern: '/api/journey/goal-data/list',
      response: { goalDataList: [] },
      delay,
    },
    {
      pattern: /\/api\/journey\/goal-data\?goalId=/,
      response: overrides.goalDataResponse ?? { goalData: null },
      delay,
    },
    {
      pattern: '/api/journey/reflections',
      response: { reflections: [] },
      delay,
    },
    {
      pattern: '/api/journey/timeline',
      response: { events: [] },
      delay,
    },
    {
      pattern: '/api/journey/saved-items',
      response: { items: [] },
      delay,
    },
    {
      pattern: '/api/journey/complete',
      method: 'POST',
      response: overrides.journeyResponse ?? { success: true, journey: {} },
      delay,
    },
    {
      pattern: '/api/journey/advance-to-understand',
      method: 'POST',
      response: { success: true },
      delay,
    },
    {
      pattern: '/api/journey/save-interests',
      method: 'POST',
      response: { success: true },
      delay,
    },
    {
      pattern: '/api/journey',
      response: overrides.journeyResponse ?? { success: true, journey: {} },
      delay,
    },
    {
      pattern: '/api/discover/reflections',
      response: overrides.reflectionsResponse ?? { discoverReflections: null },
      delay,
    },
    {
      pattern: '/api/goals',
      response: overrides.goalsResponse ?? { primaryGoal: null, secondaryGoal: null },
      delay,
    },
  ];
}
