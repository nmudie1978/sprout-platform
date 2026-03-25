/**
 * MY JOURNEY — AUTHENTICATION SECURITY TESTS
 *
 * Validates that all journey API endpoints require proper authentication.
 * Tests unauthenticated access, wrong roles, and session edge cases.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import {
  USER_A,
  EMPLOYER_USER,
  ADMIN_USER,
  makeSession,
  NO_SESSION,
} from '../fixtures/users';

// ============================================
// MOCK SETUP
// ============================================

const mockGetServerSession = vi.fn();
vi.mock('next-auth', () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

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
  journeyNote: {
    findMany: vi.fn().mockResolvedValue([]),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  journeySnapshot: {
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
  },
  auditLog: { create: vi.fn() },
  $transaction: vi.fn((fn: (tx: unknown) => Promise<unknown>) => fn(mockPrisma)),
};

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

vi.mock('@/lib/safety', () => ({
  logAuditAction: vi.fn(),
}));

vi.mock('@/lib/journey/recovery-service', () => ({
  exportJourney: vi.fn().mockResolvedValue({ data: {} }),
  importJourney: vi.fn().mockResolvedValue({ imported: true }),
  EXPORT_SCHEMA_VERSION: '1.0',
  createSnapshotWithClientState: vi.fn().mockResolvedValue({ id: 'snap-1' }),
  listSnapshots: vi.fn().mockResolvedValue([]),
  restoreSnapshot: vi.fn().mockResolvedValue({}),
  renameSnapshot: vi.fn().mockResolvedValue(true),
  deleteSnapshot: vi.fn().mockResolvedValue(true),
}));

vi.mock('@prisma/client', () => ({
  AuditAction: { JOURNEY_DATA_EXPORTED: 'JOURNEY_DATA_EXPORTED' },
  Prisma: { DbNull: null },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

// ============================================
// HELPER: Test unauthenticated access on a route handler
// ============================================

type RouteHandler = (req: NextRequest) => Promise<NextResponse>;

async function testUnauthenticated(handler: RouteHandler, method: string, url: string, body?: unknown) {
  mockGetServerSession.mockResolvedValue(NO_SESSION);
  const req = new NextRequest(new URL(url, 'http://localhost:3000'), {
    method,
    ...(body ? { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } } : {}),
  });
  const res = await handler(req);
  expect(res.status).toBe(401);
  const data = await res.json();
  expect(data.error).toBeDefined();
  return data;
}

async function testWrongRole(handler: RouteHandler, method: string, url: string, role: string, body?: unknown) {
  const user = role === 'EMPLOYER' ? EMPLOYER_USER : ADMIN_USER;
  mockGetServerSession.mockResolvedValue(makeSession(user));
  const req = new NextRequest(new URL(url, 'http://localhost:3000'), {
    method,
    ...(body ? { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } } : {}),
  });
  const res = await handler(req);
  expect(res.status).toBe(401);
}

// ============================================
// TESTS
// ============================================

describe('MY JOURNEY — Authentication Security', () => {

  describe('GET /api/journey — Unauthenticated', () => {
    it('returns 401 when no session exists', async () => {
      const { GET } = await import('@/app/api/journey/route');
      mockGetServerSession.mockResolvedValue(NO_SESSION);
      const res = await GET();
      expect(res.status).toBe(401);
    });

    it('returns 401 for EMPLOYER role', async () => {
      const { GET } = await import('@/app/api/journey/route');
      mockGetServerSession.mockResolvedValue(makeSession(EMPLOYER_USER));
      const res = await GET();
      expect(res.status).toBe(401);
    });

    it('returns 401 for ADMIN role', async () => {
      const { GET } = await import('@/app/api/journey/route');
      mockGetServerSession.mockResolvedValue(makeSession(ADMIN_USER));
      const res = await GET();
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/journey — Unauthenticated', () => {
    it('returns 401 when no session exists', async () => {
      const { PATCH } = await import('@/app/api/journey/route');
      await testUnauthenticated(
        PATCH,
        'PATCH',
        '/api/journey',
        { action: 'transition', targetState: 'EXPLORE_CAREERS' }
      );
    });

    it('returns 401 for non-YOUTH roles', async () => {
      const { PATCH } = await import('@/app/api/journey/route');
      await testWrongRole(
        PATCH,
        'PATCH',
        '/api/journey',
        'EMPLOYER',
        { action: 'transition', targetState: 'EXPLORE_CAREERS' }
      );
    });
  });

  describe('POST /api/journey/complete — Unauthenticated', () => {
    it('returns 401 when no session exists', async () => {
      const { POST } = await import('@/app/api/journey/complete/route');
      await testUnauthenticated(POST, 'POST', '/api/journey/complete', {
        stepId: 'REFLECT_ON_STRENGTHS',
        data: { type: 'REFLECT_ON_STRENGTHS', topStrengths: ['a', 'b', 'c'], demonstratedSkills: [] },
      });
    });

    it('returns 401 for EMPLOYER role', async () => {
      const { POST } = await import('@/app/api/journey/complete/route');
      await testWrongRole(POST, 'POST', '/api/journey/complete', 'EMPLOYER', {
        stepId: 'REFLECT_ON_STRENGTHS',
        data: { type: 'REFLECT_ON_STRENGTHS', topStrengths: ['a', 'b', 'c'], demonstratedSkills: [] },
      });
    });
  });

  describe('POST /api/journey/skip — Unauthenticated', () => {
    it('returns 401 when no session exists', async () => {
      const { POST } = await import('@/app/api/journey/skip/route');
      await testUnauthenticated(POST, 'POST', '/api/journey/skip', {
        stepId: 'UPDATE_PLAN',
        reason: 'I want to skip this optional step',
      });
    });
  });

  describe('POST /api/journey/reset — Unauthenticated', () => {
    it('returns 401 when no session exists', async () => {
      const { POST } = await import('@/app/api/journey/reset/route');
      mockGetServerSession.mockResolvedValue(NO_SESSION);
      const res = await POST();
      expect(res.status).toBe(401);
    });
  });

  describe('Goal Data endpoints — Unauthenticated', () => {
    it('GET /api/journey/goal-data returns 401 without session', async () => {
      const { GET } = await import('@/app/api/journey/goal-data/route');
      await testUnauthenticated(GET, 'GET', '/api/journey/goal-data?goalId=doctor');
    });

    it('POST /api/journey/goal-data returns 401 without session', async () => {
      const { POST } = await import('@/app/api/journey/goal-data/route');
      await testUnauthenticated(POST, 'POST', '/api/journey/goal-data', {
        goalId: 'doctor',
        goalTitle: 'Doctor',
      });
    });

    it('PATCH /api/journey/goal-data returns 401 without session', async () => {
      const { PATCH } = await import('@/app/api/journey/goal-data/route');
      await testUnauthenticated(PATCH, 'PATCH', '/api/journey/goal-data', {
        goalId: 'doctor',
        roadmapCardData: {},
      });
    });
  });

  describe('Export/Import endpoints — Unauthenticated', () => {
    it('GET /api/journey/export returns 401 without session', async () => {
      const { GET } = await import('@/app/api/journey/export/route');
      mockGetServerSession.mockResolvedValue(NO_SESSION);
      const res = await GET();
      expect(res.status).toBe(401);
    });

    it('POST /api/journey/import returns 401 without session', async () => {
      const { POST } = await import('@/app/api/journey/import/route');
      await testUnauthenticated(POST, 'POST', '/api/journey/import', {
        schemaVersion: '1.0',
        data: {},
      });
    });
  });

  describe('Notes endpoints — Unauthenticated', () => {
    it('GET /api/journey/notes returns 401 without session', async () => {
      const { GET } = await import('@/app/api/journey/notes/route');
      mockGetServerSession.mockResolvedValue(NO_SESSION);
      const res = await GET();
      expect(res.status).toBe(401);
    });

    it('POST /api/journey/notes returns 401 without session', async () => {
      const { POST } = await import('@/app/api/journey/notes/route');
      await testUnauthenticated(POST, 'POST', '/api/journey/notes', {
        content: 'Test note',
      });
    });
  });

  describe('Snapshot endpoints — Unauthenticated', () => {
    it('GET /api/journey/snapshot returns 401 without session', async () => {
      const { GET } = await import('@/app/api/journey/snapshot/route');
      mockGetServerSession.mockResolvedValue(NO_SESSION);
      const res = await GET();
      expect(res.status).toBe(401);
    });

    it('POST /api/journey/snapshot returns 401 without session', async () => {
      const { POST } = await import('@/app/api/journey/snapshot/route');
      await testUnauthenticated(POST, 'POST', '/api/journey/snapshot', {});
    });
  });

  describe('Export endpoint — Role enforcement', () => {
    it('REMEDIATED: Export endpoint now enforces YOUTH role', async () => {
      /**
       * REMEDIATED: GET /api/journey/export now checks both
       * session?.user?.id AND session.user.role === 'YOUTH',
       * consistent with all other journey endpoints.
       */
      const { GET } = await import('@/app/api/journey/export/route');
      mockGetServerSession.mockResolvedValue(makeSession(EMPLOYER_USER));

      const res = await GET();
      // After fix: EMPLOYER gets 401
      expect(res.status).toBe(401);
    });
  });

  describe('Error response does not leak auth details', () => {
    it('401 response does not contain stack traces or internal paths', async () => {
      const { GET } = await import('@/app/api/journey/route');
      mockGetServerSession.mockResolvedValue(NO_SESSION);
      const res = await GET();
      const text = JSON.stringify(await res.json());

      expect(text).not.toMatch(/at\s+\w+\s+\(/);
      expect(text).not.toMatch(/\/Users\/|\/home\//);
      expect(text).not.toMatch(/PrismaClient/i);
    });
  });
});
