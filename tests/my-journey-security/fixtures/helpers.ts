/**
 * Security Test Helpers
 *
 * Reusable utilities for My Journey security tests.
 * Mock setup, assertion helpers, and request builders.
 */

import { vi } from 'vitest';
import { NextRequest } from 'next/server';

// ============================================
// MOCK SETUP
// ============================================

/**
 * Creates a mock for getServerSession that returns the given session.
 * Call this in beforeEach to control auth state per test.
 */
export function mockSession(session: unknown) {
  const mock = vi.fn().mockResolvedValue(session);
  vi.doMock('next-auth', () => ({
    getServerSession: mock,
  }));
  return mock;
}

/**
 * Creates a mock Prisma client with chainable finders.
 * Returns the mock so tests can configure specific return values.
 */
export function createMockPrisma() {
  const mockPrisma = {
    youthProfile: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    journeyGoalData: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    jobCompletion: { count: vi.fn().mockResolvedValue(0) },
    shadowRequest: { count: vi.fn().mockResolvedValue(0) },
    savedIndustry: { findMany: vi.fn().mockResolvedValue([]) },
    savedItem: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      delete: vi.fn(),
    },
    journeyReflection: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      update: vi.fn(),
    },
    journeyNote: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    timelineEvent: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
    },
    journeySnapshot: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    auditLog: { create: vi.fn() },
    $transaction: vi.fn((fn: (tx: unknown) => Promise<unknown>) => fn(mockPrisma)),
  };
  return mockPrisma;
}

// ============================================
// REQUEST BUILDERS
// ============================================

/**
 * Builds a NextRequest-like object for API route testing.
 */
export function buildRequest(
  method: string,
  url: string,
  body?: unknown,
  headers?: Record<string, string>
): NextRequest {
  const init: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }
  return new NextRequest(new URL(url, 'http://localhost:3000'), init as never);
}

/**
 * Builds a GET request with query parameters
 */
export function buildGetRequest(
  url: string,
  params?: Record<string, string>
): NextRequest {
  const urlObj = new URL(url, 'http://localhost:3000');
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      urlObj.searchParams.set(key, value);
    }
  }
  return new NextRequest(urlObj, { method: 'GET' });
}

// ============================================
// ASSERTION HELPERS
// ============================================

/**
 * Asserts that a response indicates forbidden/unauthorized access.
 */
export function assertForbiddenAccess(response: Response) {
  expect([401, 403]).toContain(response.status);
}

/**
 * Asserts that the response indicates authentication is required.
 */
export async function assertUnauthorized(response: Response) {
  expect(response.status).toBe(401);
  const data = await response.json();
  expect(data.error).toBeDefined();
  // Must not leak internal details
  expect(data.error).not.toMatch(/stack|trace|prisma|sql|database/i);
}

/**
 * Asserts that journey ownership is enforced — the response
 * must not contain another user's data.
 */
export async function assertJourneyOwnershipEnforced(
  response: Response,
  otherUserId: string
) {
  const text = await response.text();
  expect(text).not.toContain(otherUserId);
}

/**
 * Asserts that unsafe HTML markup has been stripped from stored content.
 * Checks for executable HTML tags and embedded scripts.
 *
 * Note: Non-HTML payloads like "javascript:alert(1)" as plain text values
 * are safe in JSON responses and React auto-escaped rendering contexts.
 * They only become dangerous when used as href/src attribute values,
 * which is handled by safeUrl/safeHref at render time.
 */
export function assertUnsafeMarkupNotExecuted(content: string) {
  // Should not contain executable script tags
  expect(content).not.toMatch(/<script[\s>]/i);
  // Should not contain HTML tags with event handlers
  expect(content).not.toMatch(/<\w+[^>]+\bon\w+\s*=/i);
  // Should not contain iframe tags
  expect(content).not.toMatch(/<iframe[\s>]/i);
  // Should not contain svg tags with handlers
  expect(content).not.toMatch(/<svg[\s>]/i);
  // Should not contain img tags with onerror
  expect(content).not.toMatch(/<img[^>]+onerror/i);
}

/**
 * Asserts that an invalid journey state transition was rejected.
 */
export async function assertInvalidJourneyTransitionRejected(response: Response) {
  expect(response.status).toBe(400);
  const data = await response.json();
  expect(data.error).toBeDefined();
}

/**
 * Asserts that error responses do not leak internal implementation details.
 */
export async function assertNoInternalLeakage(response: Response) {
  const text = await response.text();
  // Must not contain stack traces
  expect(text).not.toMatch(/at\s+\w+\s+\(/);
  // Must not contain file paths
  expect(text).not.toMatch(/\/Users\/|\/home\/|\\Users\\/);
  // Must not contain Prisma errors
  expect(text).not.toMatch(/PrismaClient|P\d{4}/i);
  // Must not contain SQL
  expect(text).not.toMatch(/SELECT\s|INSERT\s|UPDATE\s|DELETE\s/i);
  // Must not contain tokens or secrets
  expect(text).not.toMatch(/token|secret|password|bearer/i);
}

/**
 * Asserts a response was rate limited.
 */
export function assertRateLimited(response: Response) {
  expect(response.status).toBe(429);
}

// ============================================
// TAMPERED PAYLOAD BUILDERS
// ============================================

/**
 * Takes a valid payload and injects extra fields that an attacker
 * might use to attempt mass assignment or privilege escalation.
 */
export function withMassAssignmentAttempt(
  payload: Record<string, unknown>,
  extras: Record<string, unknown> = {}
): Record<string, unknown> {
  return {
    ...payload,
    userId: 'attacker-id',
    role: 'ADMIN',
    isAdmin: true,
    __proto__: { isAdmin: true },
    constructor: { prototype: { isAdmin: true } },
    ...extras,
  };
}

/**
 * Creates a payload where a field has been swapped with another user's ID.
 */
export function withSwappedUserId(
  payload: Record<string, unknown>,
  targetUserId: string
): Record<string, unknown> {
  return {
    ...payload,
    userId: targetUserId,
    user_id: targetUserId,
    ownerId: targetUserId,
    profileId: targetUserId,
  };
}

/**
 * Injects XSS into all string fields of a payload
 */
export function withXSSInjection(
  payload: Record<string, unknown>,
  xssPayload = '<script>alert("xss")</script>'
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === 'string') {
      result[key] = value + xssPayload;
    } else if (Array.isArray(value)) {
      result[key] = value.map((v) =>
        typeof v === 'string' ? v + xssPayload : v
      );
    } else if (typeof value === 'object' && value !== null) {
      result[key] = withXSSInjection(
        value as Record<string, unknown>,
        xssPayload
      );
    } else {
      result[key] = value;
    }
  }
  return result;
}
