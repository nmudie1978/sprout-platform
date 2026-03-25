/**
 * MY JOURNEY — CI SECURITY GATE (REGRESSION SUITE)
 *
 * Lightweight, stable tests that run in CI to catch critical security regressions.
 * Focuses on the highest-value checks:
 * - Route protection (auth required)
 * - Ownership enforcement (no cross-user access)
 * - Tampered payload rejection
 * - Invalid state transition rejection
 *
 * These tests must be fast, stable, and never flaky.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

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

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));
vi.mock('@/lib/auth', () => ({ authOptions: {} }));
vi.mock('@/lib/safety', () => ({ logAuditAction: vi.fn() }));
vi.mock('@/lib/journey/recovery-service', () => ({
  exportJourney: vi.fn().mockResolvedValue({}),
  importJourney: vi.fn().mockResolvedValue({}),
  EXPORT_SCHEMA_VERSION: '1.0',
  createSnapshotWithClientState: vi.fn().mockResolvedValue({ id: 's1' }),
  listSnapshots: vi.fn().mockResolvedValue([]),
  restoreSnapshot: vi.fn().mockResolvedValue({}),
  renameSnapshot: vi.fn().mockResolvedValue(true),
  deleteSnapshot: vi.fn().mockResolvedValue(true),
}));
vi.mock('@prisma/client', () => ({
  AuditAction: { JOURNEY_DATA_EXPORTED: 'JOURNEY_DATA_EXPORTED' },
  Prisma: { DbNull: null },
}));

const USER_A_ID = 'user-a-ci-test';
const USER_B_ID = 'user-b-ci-test';

const youthSession = (userId: string) => ({
  user: { id: userId, email: 'test@test.com', role: 'YOUTH' },
  expires: new Date(Date.now() + 86400000).toISOString(),
});

const freshProfile = (userId: string) => ({
  id: `profile-${userId}`,
  userId,
  displayName: 'Test',
  bio: null,
  city: null,
  skillTags: [],
  interests: [],
  careerAspiration: null,
  journeyState: 'REFLECT_ON_STRENGTHS',
  journeyCompletedSteps: [],
  journeySkippedSteps: null,
  journeySummary: null,
  journeyLastUpdated: null,
  primaryGoal: null,
});

function makeReq(url: string, method: string, body?: unknown) {
  const init: RequestInit = { method, headers: { 'Content-Type': 'application/json' } };
  if (body !== undefined) init.body = JSON.stringify(body);
  return new NextRequest(new URL(url, 'http://localhost:3000'), init);
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ============================================
// CI SECURITY GATE TESTS
// ============================================

describe('CI SECURITY GATE — My Journey', () => {

  // ----- AUTH GATE -----

  describe('[GATE] Authentication required', () => {
    it.each([
      ['GET /api/journey', 'GET', '/api/journey'],
      ['POST /api/journey/complete', 'POST', '/api/journey/complete'],
      ['POST /api/journey/skip', 'POST', '/api/journey/skip'],
      ['POST /api/journey/reset', 'POST', '/api/journey/reset'],
    ])('%s returns 401 without session', async (_label, method, url) => {
      mockGetServerSession.mockResolvedValue(null);

      let handler: (req: NextRequest) => Promise<Response>;
      const mod = await import(`@/app/api/journey${url.replace('/api/journey', '') || ''}/route`);
      handler = method === 'GET' ? mod.GET : method === 'POST' ? mod.POST : mod.PATCH;

      const body = method === 'POST' ? { stepId: 'REFLECT_ON_STRENGTHS', reason: 'test reason here', data: {} } : undefined;
      const req = makeReq(url, method, body);
      const res = await handler(req);
      expect(res.status).toBe(401);
    });
  });

  // ----- OWNERSHIP GATE -----

  describe('[GATE] Ownership enforcement', () => {
    it('DB queries always scoped to session user', async () => {
      mockGetServerSession.mockResolvedValue(youthSession(USER_A_ID));
      mockPrisma.youthProfile.findUnique.mockResolvedValue(freshProfile(USER_A_ID));

      const { GET } = await import('@/app/api/journey/route');
      await GET();

      expect(mockPrisma.youthProfile.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: USER_A_ID } })
      );
    });

    it('injected userId in body is ignored', async () => {
      mockGetServerSession.mockResolvedValue(youthSession(USER_A_ID));
      mockPrisma.youthProfile.findUnique.mockResolvedValue(freshProfile(USER_A_ID));

      const { PATCH } = await import('@/app/api/journey/route');
      const req = makeReq('/api/journey', 'PATCH', {
        action: 'transition',
        targetState: 'EXPLORE_CAREERS',
        userId: USER_B_ID,
      });
      await PATCH(req);

      expect(mockPrisma.youthProfile.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: USER_A_ID } })
      );
    });
  });

  // ----- INVALID TRANSITION GATE -----

  describe('[GATE] Invalid transition rejection', () => {
    it('rejects non-existent state', async () => {
      mockGetServerSession.mockResolvedValue(youthSession(USER_A_ID));
      mockPrisma.youthProfile.findUnique.mockResolvedValue(freshProfile(USER_A_ID));

      const { PATCH } = await import('@/app/api/journey/route');
      const req = makeReq('/api/journey', 'PATCH', {
        action: 'transition',
        targetState: 'HACKED_STATE',
      });
      const res = await PATCH(req);
      expect(res.status).toBe(400);
    });

    it('rejects skipping mandatory step', async () => {
      mockGetServerSession.mockResolvedValue(youthSession(USER_A_ID));
      mockPrisma.youthProfile.findUnique.mockResolvedValue(freshProfile(USER_A_ID));

      const { POST } = await import('@/app/api/journey/skip/route');
      const req = makeReq('/api/journey/skip', 'POST', {
        stepId: 'REFLECT_ON_STRENGTHS',
        reason: 'Trying to skip this mandatory step via API',
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });

  // ----- DATA TYPE GATE -----

  describe('[GATE] Data type mismatch rejection', () => {
    it('rejects step data with wrong type discriminator', async () => {
      mockGetServerSession.mockResolvedValue(youthSession(USER_A_ID));
      mockPrisma.youthProfile.findUnique.mockResolvedValue(freshProfile(USER_A_ID));

      const { POST } = await import('@/app/api/journey/complete/route');
      const req = makeReq('/api/journey/complete', 'POST', {
        stepId: 'REFLECT_ON_STRENGTHS',
        data: { type: 'EXPLORE_CAREERS', selectedCareers: ['Doctor'] },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });

  // ----- FUTURE STEP GATE -----

  describe('[GATE] Locked step completion rejected', () => {
    it('cannot complete ACT step from DISCOVER', async () => {
      mockGetServerSession.mockResolvedValue(youthSession(USER_A_ID));
      mockPrisma.youthProfile.findUnique.mockResolvedValue(freshProfile(USER_A_ID));

      const { POST } = await import('@/app/api/journey/complete/route');
      const req = makeReq('/api/journey/complete', 'POST', {
        stepId: 'COMPLETE_ALIGNED_ACTION',
        data: {
          type: 'COMPLETE_ALIGNED_ACTION',
          actionType: 'VOLUNTEER_WORK',
          actionId: 'fake',
          actionTitle: 'Fake',
          linkedToGoal: true,
        },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });

  // ----- EMPTY/NULL GATE -----

  describe('[GATE] Missing required fields rejected', () => {
    it('rejects empty body for step completion', async () => {
      mockGetServerSession.mockResolvedValue(youthSession(USER_A_ID));
      mockPrisma.youthProfile.findUnique.mockResolvedValue(freshProfile(USER_A_ID));

      const { POST } = await import('@/app/api/journey/complete/route');
      const req = makeReq('/api/journey/complete', 'POST', {});
      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });
});
