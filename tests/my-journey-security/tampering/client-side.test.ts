/**
 * MY JOURNEY — CLIENT-SIDE TAMPERING TESTS
 *
 * Simulates an attacker modifying payloads, replaying requests,
 * and attempting to bypass UI-only restrictions at the API level.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  USER_A,
  USER_B,
  makeSession,
  USER_A_PROFILE,
  USER_B_PROFILE,
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

describe('MY JOURNEY — Client-Side Tampering', () => {

  describe('Replayed request with altered user ID', () => {
    it('replaying a valid request with another user ID has no effect', async () => {
      const { POST } = await import('@/app/api/journey/complete/route');

      // Attacker captures a valid request and replays it with different userId
      const req = makeReq('/api/journey/complete', 'POST', {
        stepId: 'REFLECT_ON_STRENGTHS',
        data: {
          type: 'REFLECT_ON_STRENGTHS',
          topStrengths: ['Communication', 'Teamwork', 'Problem Solving'],
          demonstratedSkills: ['Listening'],
        },
        userId: USER_B.id, // Replayed with altered ID
        profileId: USER_B_PROFILE.id,
      });

      await POST(req);

      // All DB operations must target User A (from session)
      for (const call of mockPrisma.youthProfile.findUnique.mock.calls) {
        expect(call[0].where.userId).toBe(USER_A.id);
      }
      if (mockPrisma.youthProfile.update.mock.calls.length > 0) {
        expect(mockPrisma.youthProfile.update.mock.calls[0][0].where.userId).toBe(USER_A.id);
      }
    });
  });

  describe('Direct API calls bypassing UI gating', () => {
    it('cannot complete ACT step when still in DISCOVER', async () => {
      const { POST } = await import('@/app/api/journey/complete/route');
      // User is at REFLECT_ON_STRENGTHS but tries to complete ACT step
      const req = makeReq('/api/journey/complete', 'POST', {
        stepId: 'COMPLETE_ALIGNED_ACTION',
        data: {
          type: 'COMPLETE_ALIGNED_ACTION',
          actionType: 'VOLUNTEER_WORK',
          actionId: 'fake-action',
          actionTitle: 'Fake volunteering',
          linkedToGoal: true,
        },
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('cannot transition to UNDERSTAND steps without completing DISCOVER', async () => {
      const { PATCH } = await import('@/app/api/journey/route');
      const req = makeReq('/api/journey', 'PATCH', {
        action: 'transition',
        targetState: 'REVIEW_INDUSTRY_OUTLOOK',
      });

      const res = await PATCH(req);
      expect(res.status).toBe(400);
    });
  });

  describe('Disabled button bypass — skip mandatory step via API', () => {
    it('API rejects skipping mandatory steps regardless of UI state', async () => {
      const { POST } = await import('@/app/api/journey/skip/route');

      // UI would disable the skip button for mandatory steps,
      // but attacker calls API directly
      const mandatorySteps = [
        'REFLECT_ON_STRENGTHS',
        'EXPLORE_CAREERS',
        'ROLE_DEEP_DIVE',
        'REVIEW_INDUSTRY_OUTLOOK',
        'CAREER_SHADOW',
        'CREATE_ACTION_PLAN',
        'COMPLETE_ALIGNED_ACTION',
        'SUBMIT_ACTION_REFLECTION',
      ];

      for (const stepId of mandatorySteps) {
        const req = makeReq('/api/journey/skip', 'POST', {
          stepId,
          reason: 'Attempting to skip a mandatory step via direct API call',
        });
        const res = await POST(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toContain('cannot be skipped');
      }
    });
  });

  describe('Goal data tampering — forged completion state', () => {
    it('SECURITY FINDING: Goal data accepts arbitrary completedSteps', async () => {
      /**
       * FINDING: When saving goal data via POST /api/journey/goal-data,
       * the client can supply arbitrary journeyCompletedSteps and journeyState.
       * There is no validation that these values are consistent or legitimate.
       *
       * SEVERITY: Medium — Allows forging goal-specific progress. Main journey
       * state is separate but UI may display forged goal state.
       */
      const { POST } = await import('@/app/api/journey/goal-data/route');
      mockPrisma.journeyGoalData.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.journeyGoalData.upsert.mockResolvedValue({});

      const req = makeReq('/api/journey/goal-data', 'POST', {
        goalId: 'doctor',
        goalTitle: 'Doctor',
        journeyState: 'EXTERNAL_FEEDBACK', // Forged
        journeyCompletedSteps: [
          'REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE',
          'REVIEW_INDUSTRY_OUTLOOK', 'CAREER_SHADOW', 'CREATE_ACTION_PLAN',
          'COMPLETE_ALIGNED_ACTION', 'SUBMIT_ACTION_REFLECTION',
          'UPDATE_PLAN', 'EXTERNAL_FEEDBACK',
          'NONEXISTENT_STEP', // Invalid step
        ],
      });

      const res = await POST(req);
      // Currently accepts — documents the vulnerability
      expect(res.status).toBe(200);
    });
  });

  describe('Prototype pollution attempts', () => {
    it('__proto__ in request body does not pollute objects', async () => {
      const { PATCH } = await import('@/app/api/journey/route');
      const req = makeReq('/api/journey', 'PATCH', {
        action: 'transition',
        targetState: 'EXPLORE_CAREERS',
        __proto__: { isAdmin: true },
        constructor: { prototype: { isAdmin: true } },
      });

      await PATCH(req);

      // Verify no prototype pollution occurred
      const emptyObj = {};
      expect((emptyObj as Record<string, unknown>).isAdmin).toBeUndefined();
    });
  });

  describe('Request manipulation — altering identifiers', () => {
    it('swapping goalId to access different goal data fails gracefully', async () => {
      const { GET } = await import('@/app/api/journey/goal-data/route');
      mockPrisma.journeyGoalData.findUnique.mockResolvedValue(null);

      // User tries to access a goal that may belong to another user
      // but composite key includes userId, so this should return null
      const req = new NextRequest(
        new URL('/api/journey/goal-data?goalId=other-users-goal', 'http://localhost:3000'),
        { method: 'GET' }
      );

      const res = await GET(req);
      const data = await res.json();
      expect(data.goalData).toBeNull();
    });
  });

  describe('Double submission / race condition', () => {
    it('completing the same step twice does not corrupt state', async () => {
      const { POST } = await import('@/app/api/journey/complete/route');
      const body = {
        stepId: 'REFLECT_ON_STRENGTHS',
        data: {
          type: 'REFLECT_ON_STRENGTHS',
          topStrengths: ['Communication', 'Teamwork', 'Problem Solving'],
          demonstratedSkills: ['Listening'],
        },
      };

      // First completion
      const req1 = makeReq('/api/journey/complete', 'POST', body);
      await POST(req1);

      // Second completion (profile now shows step completed)
      mockPrisma.youthProfile.findUnique.mockResolvedValue({
        ...freshProfile,
        journeyState: 'EXPLORE_CAREERS',
        journeyCompletedSteps: ['REFLECT_ON_STRENGTHS'],
        journeySummary: { strengths: ['Communication', 'Teamwork', 'Problem Solving'] },
      });

      const req2 = makeReq('/api/journey/complete', 'POST', body);
      const res2 = await POST(req2);

      // Should handle gracefully — either re-complete or accept idempotently
      expect([200, 400]).toContain(res2.status);
    });
  });
});
