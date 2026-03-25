/**
 * MY JOURNEY — AUTHORIZATION & DATA ISOLATION TESTS
 *
 * Validates that user data is strictly isolated and no cross-user
 * access is possible. Tests IDOR, ownership enforcement, and
 * parameter tampering for user ID substitution.
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
  journeyNote: {
    findMany: vi.fn().mockResolvedValue([]),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn((fn: (tx: unknown) => Promise<unknown>) => fn(mockPrisma)),
};

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

beforeEach(() => {
  vi.clearAllMocks();
});

// ============================================
// TESTS
// ============================================

describe('MY JOURNEY — Authorization & Data Isolation', () => {

  describe('Journey state read — User isolation', () => {
    it('GET /api/journey uses session userId, not request params', async () => {
      const { GET } = await import('@/app/api/journey/route');
      mockGetServerSession.mockResolvedValue(makeSession(USER_A));
      mockPrisma.youthProfile.findUnique.mockResolvedValue(USER_A_PROFILE);

      await GET();

      // Verify Prisma was called with the session user ID, not any injected ID
      expect(mockPrisma.youthProfile.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: USER_A.id },
        })
      );
    });

    it('User A cannot receive User B journey data', async () => {
      const { GET } = await import('@/app/api/journey/route');
      mockGetServerSession.mockResolvedValue(makeSession(USER_A));
      mockPrisma.youthProfile.findUnique.mockResolvedValue(USER_A_PROFILE);

      const res = await GET();
      const data = await res.json();

      // Response must not contain User B's data
      const text = JSON.stringify(data);
      expect(text).not.toContain(USER_B.id);
      expect(text).not.toContain(USER_B_PROFILE.displayName);
    });
  });

  describe('Journey state mutation — Ownership enforcement', () => {
    it('PATCH /api/journey always uses session userId for DB update', async () => {
      const { PATCH } = await import('@/app/api/journey/route');
      mockGetServerSession.mockResolvedValue(makeSession(USER_A));
      mockPrisma.youthProfile.findUnique.mockResolvedValue({
        ...USER_A_PROFILE,
        journeyState: 'REFLECT_ON_STRENGTHS',
        journeyCompletedSteps: [],
        journeySkippedSteps: null,
        journeySummary: { strengths: ['a', 'b', 'c'] },
      });

      const req = new NextRequest(new URL('/api/journey', 'http://localhost:3000'), {
        method: 'PATCH',
        body: JSON.stringify({
          action: 'transition',
          targetState: 'EXPLORE_CAREERS',
          // Attacker attempts to inject userId
          userId: USER_B.id,
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      await PATCH(req);

      // DB update MUST use session user ID, not the injected one
      if (mockPrisma.youthProfile.update.mock.calls.length > 0) {
        const updateCall = mockPrisma.youthProfile.update.mock.calls[0][0];
        expect(updateCall.where.userId).toBe(USER_A.id);
        expect(updateCall.where.userId).not.toBe(USER_B.id);
      }
    });

    it('POST /api/journey/complete ignores userId in request body', async () => {
      const { POST } = await import('@/app/api/journey/complete/route');
      mockGetServerSession.mockResolvedValue(makeSession(USER_A));
      mockPrisma.youthProfile.findUnique.mockResolvedValue({
        ...USER_A_PROFILE,
        journeyState: 'REFLECT_ON_STRENGTHS',
        journeyCompletedSteps: [],
        journeySkippedSteps: null,
        journeySummary: null,
      });

      const req = new NextRequest(new URL('/api/journey/complete', 'http://localhost:3000'), {
        method: 'POST',
        body: JSON.stringify({
          stepId: 'REFLECT_ON_STRENGTHS',
          data: {
            type: 'REFLECT_ON_STRENGTHS',
            topStrengths: ['Communication', 'Teamwork', 'Problem Solving'],
            demonstratedSkills: ['Active Listening'],
          },
          // Attacker injects another user's ID
          userId: USER_B.id,
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      await POST(req);

      // DB operations must scope to User A
      expect(mockPrisma.youthProfile.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: USER_A.id },
        })
      );
    });
  });

  describe('Goal data — Cross-user isolation', () => {
    it('GET /api/journey/goal-data scopes query to session user', async () => {
      const { GET } = await import('@/app/api/journey/goal-data/route');
      mockGetServerSession.mockResolvedValue(makeSession(USER_A));

      const req = new NextRequest(
        new URL('/api/journey/goal-data?goalId=doctor', 'http://localhost:3000'),
        { method: 'GET' }
      );

      await GET(req);

      expect(mockPrisma.journeyGoalData.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId_goalId: {
              userId: USER_A.id,
              goalId: 'doctor',
            },
          },
        })
      );
    });

    it('POST /api/journey/goal-data cannot create data for another user', async () => {
      const { POST } = await import('@/app/api/journey/goal-data/route');
      mockGetServerSession.mockResolvedValue(makeSession(USER_A));
      mockPrisma.journeyGoalData.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.journeyGoalData.upsert.mockResolvedValue({});

      const req = new NextRequest(new URL('/api/journey/goal-data', 'http://localhost:3000'), {
        method: 'POST',
        body: JSON.stringify({
          goalId: 'doctor',
          goalTitle: 'Doctor',
          userId: USER_B.id, // Attacker attempts injection
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      await POST(req);

      // Verify the upsert uses session user ID
      expect(mockPrisma.journeyGoalData.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId_goalId: {
              userId: USER_A.id,
              goalId: 'doctor',
            },
          },
          create: expect.objectContaining({
            userId: USER_A.id,
          }),
        })
      );
    });

    it('PATCH /api/journey/goal-data scopes update to session user', async () => {
      const { PATCH } = await import('@/app/api/journey/goal-data/route');
      mockGetServerSession.mockResolvedValue(makeSession(USER_A));
      mockPrisma.journeyGoalData.update.mockResolvedValue({});

      const req = new NextRequest(new URL('/api/journey/goal-data', 'http://localhost:3000'), {
        method: 'PATCH',
        body: JSON.stringify({
          goalId: 'doctor',
          roadmapCardData: { test: true },
          userId: USER_B.id, // Injected
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      await PATCH(req);

      expect(mockPrisma.journeyGoalData.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId_goalId: {
              userId: USER_A.id,
              goalId: 'doctor',
            },
          },
        })
      );
    });
  });

  describe('Notes — Ownership verification', () => {
    it('PATCH /api/journey/notes verifies note belongs to user before update', async () => {
      const { PATCH } = await import('@/app/api/journey/notes/route');
      mockGetServerSession.mockResolvedValue(makeSession(USER_A));
      mockPrisma.youthProfile.findUnique.mockResolvedValue({ id: USER_A_PROFILE.id });

      // Simulate trying to update a note that belongs to User B
      mockPrisma.journeyNote.findFirst.mockResolvedValue(null); // Not found for this profile

      const req = new NextRequest(new URL('/api/journey/notes', 'http://localhost:3000'), {
        method: 'PATCH',
        body: JSON.stringify({
          id: 'note-belonging-to-user-b',
          content: 'Attacker trying to modify',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await PATCH(req);
      expect(res.status).toBe(404); // Note not found for this user
    });

    it('DELETE /api/journey/notes verifies ownership before delete', async () => {
      const { DELETE } = await import('@/app/api/journey/notes/route');
      mockGetServerSession.mockResolvedValue(makeSession(USER_A));
      mockPrisma.youthProfile.findUnique.mockResolvedValue({ id: USER_A_PROFILE.id });
      mockPrisma.journeyNote.findFirst.mockResolvedValue(null); // Not owned by user A

      const req = new NextRequest(
        new URL('/api/journey/notes?id=note-belonging-to-user-b', 'http://localhost:3000'),
        { method: 'DELETE' }
      );

      const res = await DELETE(req);
      expect(res.status).toBe(404);
    });
  });

  describe('Journey reset — Scoped to authenticated user', () => {
    it('POST /api/journey/reset only modifies the session user profile', async () => {
      const { POST } = await import('@/app/api/journey/reset/route');
      mockGetServerSession.mockResolvedValue(makeSession(USER_A));
      mockPrisma.youthProfile.findUnique.mockResolvedValue({
        journeySummary: { strengths: ['test'], careerInterests: ['doc'] },
      });
      mockPrisma.youthProfile.update.mockResolvedValue({});

      await POST();

      expect(mockPrisma.youthProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: USER_A.id },
        })
      );
    });
  });

  describe('IDOR through parameter manipulation', () => {
    it('cannot access another user journey by swapping IDs in body', async () => {
      const { PATCH } = await import('@/app/api/journey/route');
      mockGetServerSession.mockResolvedValue(makeSession(USER_A));
      mockPrisma.youthProfile.findUnique.mockResolvedValue(USER_A_PROFILE);

      const req = new NextRequest(new URL('/api/journey', 'http://localhost:3000'), {
        method: 'PATCH',
        body: JSON.stringify({
          action: 'transition',
          targetState: 'EXPLORE_CAREERS',
          userId: USER_B.id,
          profileId: USER_B_PROFILE.id,
          user_id: USER_B.id,
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      await PATCH(req);

      // All DB calls must be scoped to USER_A
      for (const call of mockPrisma.youthProfile.findUnique.mock.calls) {
        expect(call[0].where.userId).toBe(USER_A.id);
      }
    });
  });
});
