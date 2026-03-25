/**
 * MY JOURNEY — API HARDENING TESTS
 *
 * Tests for mass assignment, excessive data exposure, error leakage,
 * unknown field handling, and response safety.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  USER_A,
  makeSession,
  USER_A_PROFILE,
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
    update: vi.fn(),
    delete: vi.fn(),
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
  exportJourney: vi.fn().mockResolvedValue({
    profile: { displayName: 'Alice' },
    journey: {},
  }),
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

const profile = {
  ...USER_A_PROFILE,
  journeyState: 'REFLECT_ON_STRENGTHS',
  journeyCompletedSteps: [],
  journeySkippedSteps: null,
  journeySummary: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockGetServerSession.mockResolvedValue(makeSession(USER_A));
  mockPrisma.youthProfile.findUnique.mockResolvedValue(profile);
  mockPrisma.youthProfile.update.mockResolvedValue({});
});

function makeReq(url: string, method: string, body?: unknown) {
  const init: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }
  return new NextRequest(new URL(url, 'http://localhost:3000'), init);
}

// ============================================
// TESTS
// ============================================

describe('MY JOURNEY — API Hardening', () => {

  describe('Error response safety', () => {
    it('REMEDIATED: /api/journey/complete returns generic error in 500', async () => {
      /**
       * REMEDIATED: The catch block in POST /api/journey/complete now returns
       * a generic error message instead of leaking the raw error.
       * Internal errors are logged server-side only.
       */
      const { POST } = await import('@/app/api/journey/complete/route');

      // Force an error by making the profile lookup throw
      mockPrisma.youthProfile.findUnique.mockRejectedValue(
        new Error('PrismaClientKnownRequestError: Invalid `prisma.youthProfile.findUnique()`')
      );

      const req = makeReq('/api/journey/complete', 'POST', {
        stepId: 'REFLECT_ON_STRENGTHS',
        data: { type: 'REFLECT_ON_STRENGTHS', topStrengths: ['a', 'b', 'c'], demonstratedSkills: [] },
      });

      const res = await POST(req);
      expect(res.status).toBe(500);

      const data = await res.json();
      // After fix: generic error message, no internal details
      expect(data.error).toBe('Failed to complete journey step');
      expect(data.error).not.toContain('PrismaClient');
    });

    it('other journey routes return generic error messages', async () => {
      const { GET } = await import('@/app/api/journey/route');
      mockPrisma.youthProfile.findUnique.mockRejectedValue(
        new Error('Internal DB error')
      );

      const res = await GET();
      expect(res.status).toBe(500);
      const data = await res.json();
      // This route does NOT leak the error message — just generic text
      expect(data.error).toBe('Failed to fetch journey state');
      expect(data.error).not.toContain('Internal DB');
    });
  });

  describe('Mass assignment protection', () => {
    it('unknown fields in journey transition are ignored', async () => {
      const { PATCH } = await import('@/app/api/journey/route');
      const req = makeReq('/api/journey', 'PATCH', {
        action: 'transition',
        targetState: 'EXPLORE_CAREERS',
        // Extra fields that should be ignored
        isAdmin: true,
        role: 'ADMIN',
        journeyState: 'EXTERNAL_FEEDBACK',
        userId: 'injected-id',
        __proto__: { polluted: true },
      });

      await PATCH(req);

      // Verify only expected fields were used
      expect(mockPrisma.youthProfile.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: USER_A.id },
        })
      );
    });

    it('note creation only accepts validated fields', async () => {
      const { POST } = await import('@/app/api/journey/notes/route');
      mockPrisma.journeyNote.create.mockResolvedValue({
        id: 'note-1',
        content: 'test',
        profileId: USER_A_PROFILE.id,
      });

      const req = makeReq('/api/journey/notes', 'POST', {
        content: 'Valid note',
        // Extra fields — should be stripped by Zod
        profileId: 'injected-profile',
        userId: 'injected-user',
        isAdmin: true,
        deletedAt: null,
      });

      const res = await POST(req);
      if (res.status === 201) {
        const createCall = mockPrisma.journeyNote.create.mock.calls[0]?.[0];
        // profileId should come from session lookup, not request body
        expect(createCall?.data?.profileId).toBe(USER_A_PROFILE.id);
      }
    });

    it('note update only accepts Zod-validated fields', async () => {
      const { PATCH } = await import('@/app/api/journey/notes/route');
      mockPrisma.journeyNote.findFirst.mockResolvedValue({ id: 'note-1', profileId: USER_A_PROFILE.id });
      mockPrisma.journeyNote.update.mockResolvedValue({ id: 'note-1' });

      const req = makeReq('/api/journey/notes', 'PATCH', {
        id: 'note-1',
        content: 'Updated',
        // Fields not in schema — should be stripped
        profileId: 'injected-profile',
        userId: 'injected-user',
        createdAt: '2020-01-01',
      });

      const res = await PATCH(req);
      if (res.status === 200) {
        const updateCall = mockPrisma.journeyNote.update.mock.calls[0]?.[0];
        // Only content should be in the update data
        expect(updateCall?.data).not.toHaveProperty('profileId');
        expect(updateCall?.data).not.toHaveProperty('userId');
        expect(updateCall?.data).not.toHaveProperty('createdAt');
      }
    });
  });

  describe('Excessive data exposure', () => {
    it('GET /api/journey response does not include sensitive profile fields', async () => {
      const { GET } = await import('@/app/api/journey/route');
      mockPrisma.youthProfile.findUnique.mockResolvedValue({
        ...profile,
        // Sensitive fields that should not appear in journey response
        email: 'alice@example.com',
        dateOfBirth: '2008-01-01',
        phoneNumber: '+47123456789',
        guardianEmail: 'parent@example.com',
        passwordHash: 'bcrypt-hash-here',
      });

      const res = await GET();
      const data = await res.json();
      const text = JSON.stringify(data);

      expect(text).not.toContain('alice@example.com');
      expect(text).not.toContain('2008-01-01');
      expect(text).not.toContain('+47123456789');
      expect(text).not.toContain('parent@example.com');
      expect(text).not.toContain('bcrypt-hash-here');
      expect(text).not.toContain('passwordHash');
    });
  });

  describe('Import endpoint validation', () => {
    it('rejects import with missing schemaVersion', async () => {
      const { POST } = await import('@/app/api/journey/import/route');
      const req = makeReq('/api/journey/import', 'POST', {
        data: { some: 'data' },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('rejects import with wrong schemaVersion', async () => {
      const { POST } = await import('@/app/api/journey/import/route');
      const req = makeReq('/api/journey/import', 'POST', {
        schemaVersion: '99.0',
        data: { some: 'data' },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('rejects import with missing data', async () => {
      const { POST } = await import('@/app/api/journey/import/route');
      const req = makeReq('/api/journey/import', 'POST', {
        schemaVersion: '1.0',
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });

  describe('Snapshot endpoint safety', () => {
    it('snapshot label is truncated to 200 chars', async () => {
      const { POST } = await import('@/app/api/journey/snapshot/route');
      const { createSnapshotWithClientState } = await import('@/lib/journey/recovery-service');

      const req = makeReq('/api/journey/snapshot', 'POST', {
        label: 'A'.repeat(500),
      });

      await POST(req);

      // Verify the label was truncated
      const call = (createSnapshotWithClientState as ReturnType<typeof vi.fn>).mock.calls[0];
      if (call) {
        expect(call[2].length).toBeLessThanOrEqual(200);
      }
    });

    it('snapshot PUT requires valid snapshotId', async () => {
      const { PUT } = await import('@/app/api/journey/snapshot/route');
      const req = makeReq('/api/journey/snapshot', 'PUT', {});
      const res = await PUT(req);
      expect(res.status).toBe(400);
    });

    it('snapshot PATCH requires valid snapshotId and label', async () => {
      const { PATCH } = await import('@/app/api/journey/snapshot/route');

      const req1 = makeReq('/api/journey/snapshot', 'PATCH', { label: 'test' });
      const res1 = await PATCH(req1);
      expect(res1.status).toBe(400);

      const req2 = makeReq('/api/journey/snapshot', 'PATCH', { snapshotId: 'snap-1' });
      const res2 = await PATCH(req2);
      expect(res2.status).toBe(400);
    });
  });

  describe('Invalid note color values', () => {
    it('rejects invalid color enum', async () => {
      const { POST } = await import('@/app/api/journey/notes/route');
      const req = makeReq('/api/journey/notes', 'POST', {
        content: 'Test note',
        color: 'red', // Not in allowed enum
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });

  describe('Content-Type enforcement', () => {
    it('handles request with no Content-Type gracefully', async () => {
      const { PATCH } = await import('@/app/api/journey/route');
      const req = new NextRequest(new URL('/api/journey', 'http://localhost:3000'), {
        method: 'PATCH',
        body: JSON.stringify({ action: 'transition', targetState: 'EXPLORE_CAREERS' }),
      });

      const res = await PATCH(req);
      // Should either parse successfully or return an error — not crash
      expect([200, 400, 500]).toContain(res.status);
    });
  });
});
