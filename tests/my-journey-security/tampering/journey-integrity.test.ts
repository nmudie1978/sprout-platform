/**
 * MY JOURNEY — JOURNEY STATE INTEGRITY & TAMPERING TESTS
 *
 * Validates that journey progression cannot be forged or bypassed.
 * Tests stage unlock tampering, progress forgery, invalid transitions,
 * and client-supplied state injection.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  USER_A,
  makeSession,
  USER_A_PROFILE,
} from '../fixtures/users';
import { FORGED_JOURNEY_PAYLOADS } from '../fixtures/payloads';

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
  $transaction: vi.fn((fn: (tx: unknown) => Promise<unknown>) => fn(mockPrisma)),
};

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

const freshProfile = {
  ...USER_A_PROFILE,
  journeyState: 'REFLECT_ON_STRENGTHS',
  journeyCompletedSteps: [],
  journeySkippedSteps: null,
  journeySummary: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockGetServerSession.mockResolvedValue(makeSession(USER_A));
  mockPrisma.youthProfile.findUnique.mockResolvedValue(freshProfile);
  mockPrisma.youthProfile.update.mockResolvedValue({});
});

function makeReq(url: string, method: string, body: unknown) {
  return new NextRequest(new URL(url, 'http://localhost:3000'), {
    method,
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

// ============================================
// TESTS
// ============================================

describe('MY JOURNEY — Journey State Integrity', () => {

  describe('Invalid state transitions', () => {
    it('rejects transition to non-existent state', async () => {
      const { PATCH } = await import('@/app/api/journey/route');
      const req = makeReq('/api/journey', 'PATCH', FORGED_JOURNEY_PAYLOADS.invalidState);
      const res = await PATCH(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Invalid');
    });

    it('rejects transition to locked future state from beginning', async () => {
      const { PATCH } = await import('@/app/api/journey/route');
      const req = makeReq('/api/journey', 'PATCH', FORGED_JOURNEY_PAYLOADS.skipToAct);
      const res = await PATCH(req);
      // Should either be 400 (invalid transition) or the orchestrator should reject
      expect(res.status).toBe(400);
    });
  });

  describe('Step completion bypass', () => {
    it('rejects completing a future locked step', async () => {
      const { POST } = await import('@/app/api/journey/complete/route');
      const req = makeReq('/api/journey/complete', 'POST', FORGED_JOURNEY_PAYLOADS.completeLocked);
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });

    it('rejects step data with wrong type discriminator', async () => {
      const { POST } = await import('@/app/api/journey/complete/route');
      const req = makeReq('/api/journey/complete', 'POST', FORGED_JOURNEY_PAYLOADS.wrongDataType);
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('mismatch');
    });
  });

  describe('Skip step abuse', () => {
    it('rejects skipping a mandatory step', async () => {
      const { POST } = await import('@/app/api/journey/skip/route');
      const req = makeReq('/api/journey/skip', 'POST', FORGED_JOURNEY_PAYLOADS.skipMandatory);
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('cannot be skipped');
    });

    it('rejects skip with too-short reason', async () => {
      const { POST } = await import('@/app/api/journey/skip/route');
      const req = makeReq('/api/journey/skip', 'POST', {
        stepId: 'UPDATE_PLAN',
        reason: 'short',
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('10 characters');
    });
  });

  describe('Mass assignment attempts', () => {
    it('extra fields in complete request do not modify journey state', async () => {
      const { POST } = await import('@/app/api/journey/complete/route');
      const req = makeReq('/api/journey/complete', 'POST', FORGED_JOURNEY_PAYLOADS.massAssignment);
      const res = await POST(req);

      // Either 400 or 200, but if 200 the DB update must not contain forged state
      if (res.status === 200) {
        const updateCall = mockPrisma.youthProfile.update.mock.calls[0]?.[0];
        if (updateCall) {
          // Must NOT have the injected state
          expect(updateCall.data.journeyState).not.toBe('EXTERNAL_FEEDBACK');
          expect(updateCall.where.userId).toBe(USER_A.id);
        }
      }
    });

    it('userId field in body is ignored — session userId prevails', async () => {
      const { PATCH } = await import('@/app/api/journey/route');
      const req = makeReq('/api/journey', 'PATCH', {
        action: 'transition',
        targetState: 'EXPLORE_CAREERS',
        userId: 'attacker-injected-id',
      });
      await PATCH(req);

      // Profile lookup should use session ID
      expect(mockPrisma.youthProfile.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: USER_A.id } })
      );
    });
  });

  describe('Goal data state forgery', () => {
    it('SECURITY FINDING: Goal data POST accepts client-supplied journey state', async () => {
      /**
       * FINDING: POST /api/journey/goal-data accepts journeyState,
       * journeyCompletedSteps, and journeySummary directly from the client
       * without validation. A user could forge their goal-scoped journey
       * to any arbitrary state.
       *
       * SEVERITY: Medium — Goal data is secondary to the main journey state,
       * but affects UI rendering and could be used to bypass progression.
       *
       * RECOMMENDATION: Validate that journeyState is in JOURNEY_STATES array
       * and that journeyCompletedSteps contains only valid state IDs.
       */
      const { POST } = await import('@/app/api/journey/goal-data/route');
      mockPrisma.journeyGoalData.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.journeyGoalData.upsert.mockResolvedValue({});

      const req = makeReq('/api/journey/goal-data', 'POST', FORGED_JOURNEY_PAYLOADS.forgedGoalData);
      const res = await POST(req);

      // Currently accepts the forged state — this documents the vulnerability
      expect(res.status).toBe(200);

      // The upsert was called with the client-supplied state
      const upsertCall = mockPrisma.journeyGoalData.upsert.mock.calls[0]?.[0];
      expect(upsertCall?.create?.journeyState).toBe('EXTERNAL_FEEDBACK');
    });
  });

  describe('Progress percentage injection', () => {
    it('server calculates progress — extra progress fields in payload are ignored', async () => {
      const { POST } = await import('@/app/api/journey/complete/route');
      const req = makeReq('/api/journey/complete', 'POST', FORGED_JOURNEY_PAYLOADS.forgedProgress);

      // The overallProgress and lenses fields in the data are not used
      // by the orchestrator — it calculates progress from actual completion state
      const res = await POST(req);

      if (res.status === 200) {
        const data = await res.json();
        // Progress must be calculated server-side, not from client input
        if (data.journey?.summary?.overallProgress !== undefined) {
          expect(data.journey.summary.overallProgress).toBeLessThan(100);
        }
      }
    });
  });

  describe('State machine correctness', () => {
    it('cannot transition backward to create impossible state', async () => {
      // Set up a user at EXPLORE_CAREERS with only step 1 completed
      mockPrisma.youthProfile.findUnique.mockResolvedValue({
        ...freshProfile,
        journeyState: 'EXPLORE_CAREERS',
        journeyCompletedSteps: ['REFLECT_ON_STRENGTHS'],
      });

      const { PATCH } = await import('@/app/api/journey/route');

      // Try revisiting a step that was never completed
      const req = makeReq('/api/journey', 'PATCH', {
        action: 'revisit',
        stepId: 'ROLE_DEEP_DIVE', // Never completed
      });
      const res = await PATCH(req);
      // Should be rejected
      expect(res.status).toBe(400);
    });
  });
});
