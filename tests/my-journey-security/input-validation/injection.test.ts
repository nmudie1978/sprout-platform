/**
 * MY JOURNEY — INPUT VALIDATION & INJECTION TESTS
 *
 * Tests XSS, injection, malformed payloads, oversized inputs,
 * and Unicode edge cases in all user-facing journey inputs.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  USER_A,
  makeSession,
  USER_A_PROFILE,
} from '../fixtures/users';
import {
  XSS_PAYLOADS,
  XSS_PAYLOAD_LIST,
  MALICIOUS_URLS,
  UNICODE_PAYLOADS,
  OVERSIZED_PAYLOADS,
} from '../fixtures/payloads';
import { assertUnsafeMarkupNotExecuted } from '../fixtures/helpers';

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

describe('MY JOURNEY — Input Validation & Injection', () => {

  describe('XSS in step completion data — Strengths', () => {
    it.each(
      Object.entries(XSS_PAYLOADS).map(([name, payload]) => ({ name, payload }))
    )('XSS payload "$name" is sanitized before storage in strengths', async ({ payload }) => {
      /**
       * FINDING: Step completion data (strengths, skills, career names, etc.)
       * is stored without server-side sanitization. The raw XSS payloads appear
       * in the JSON API response.
       *
       * MITIGATION: React auto-escapes when rendering via {value} in JSX.
       * JSON encoding in API responses prevents direct execution.
       *
       * RISK: Medium — If any future component uses dangerouslySetInnerHTML
       * or if data is consumed by non-React clients, stored XSS will execute.
       *
       * RECOMMENDATION: Add server-side input sanitization to strip HTML tags
       * from user-supplied text fields before storage.
       */
      const { POST } = await import('@/app/api/journey/complete/route');
      const req = makeReq('/api/journey/complete', 'POST', {
        stepId: 'REFLECT_ON_STRENGTHS',
        data: {
          type: 'REFLECT_ON_STRENGTHS',
          topStrengths: [payload, 'Teamwork', 'Problem Solving'],
          demonstratedSkills: [payload],
        },
      });

      const res = await POST(req);

      if (res.status === 200) {
        const data = await res.json();
        expect(data.success).toBe(true);

        // After remediation: sanitizeStepCompletionData strips HTML tags.
        // Verify XSS payloads are no longer stored with executable markup.
        const summaryStr = JSON.stringify(data.journey?.summary);
        assertUnsafeMarkupNotExecuted(summaryStr);
      }
    });
  });

  describe('XSS in journey notes', () => {
    it.each(XSS_PAYLOAD_LIST.slice(0, 5))('handles XSS in note content: %s', async (xssPayload) => {
      const { POST } = await import('@/app/api/journey/notes/route');
      mockPrisma.journeyNote.create.mockResolvedValue({
        id: 'note-1',
        content: xssPayload,
        title: null,
        color: null,
        pinned: false,
        groupName: null,
      });

      const req = makeReq('/api/journey/notes', 'POST', {
        content: xssPayload,
      });

      const res = await POST(req);

      if (res.status === 201) {
        // Note was created — verify the stored value
        const createCall = mockPrisma.journeyNote.create.mock.calls[0]?.[0];
        // The content is stored as-is currently (potential stored XSS)
        // JSON encoding in API response prevents immediate execution,
        // but rendering in React JSX with dangerouslySetInnerHTML would be dangerous
        expect(createCall).toBeDefined();
      }
    });

    it('handles XSS in note title', async () => {
      const { POST } = await import('@/app/api/journey/notes/route');
      mockPrisma.journeyNote.create.mockResolvedValue({ id: 'note-1' });

      const req = makeReq('/api/journey/notes', 'POST', {
        content: 'Normal content',
        title: XSS_PAYLOADS.scriptTag,
      });

      const res = await POST(req);
      // Should either reject or safely store (max 200 chars enforced by Zod)
      expect([201, 400]).toContain(res.status);
    });
  });

  describe('XSS in career exploration data', () => {
    it('SECURITY FINDING: XSS payloads stored in role deep dive data', async () => {
      /**
       * FINDING: Role deep dive data (title, educationPaths, certifications, etc.)
       * is stored without sanitization. Same stored XSS risk as strengths.
       */
      mockPrisma.youthProfile.findUnique.mockResolvedValue({
        ...profile,
        journeyState: 'ROLE_DEEP_DIVE',
        journeyCompletedSteps: ['REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS'],
        journeySummary: {
          strengths: ['a', 'b', 'c'],
          careerInterests: ['Doctor'],
        },
      });

      const { POST } = await import('@/app/api/journey/complete/route');
      const req = makeReq('/api/journey/complete', 'POST', {
        stepId: 'ROLE_DEEP_DIVE',
        data: {
          type: 'ROLE_DEEP_DIVE',
          role: {
            title: XSS_PAYLOADS.scriptTag,
            exploredAt: new Date().toISOString(),
            educationPaths: [XSS_PAYLOADS.imgOnError],
            certifications: ['<img onerror=alert(1) src=x>'],
            companies: ['Normal Company'],
            humanSkills: ['Empathy'],
            entryExpectations: XSS_PAYLOADS.eventHandler,
          },
        },
      });

      const res = await POST(req);
      // Documents that the API accepts and stores raw XSS payloads
      expect([200, 400]).toContain(res.status);
    });
  });

  describe('XSS in reflection responses', () => {
    it('handles XSS payload in reflection text', async () => {
      mockPrisma.youthProfile.findUnique.mockResolvedValue({
        ...profile,
        journeyState: 'SUBMIT_ACTION_REFLECTION',
        journeyCompletedSteps: [
          'REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE',
          'REVIEW_INDUSTRY_OUTLOOK', 'CAREER_SHADOW', 'CREATE_ACTION_PLAN',
          'COMPLETE_ALIGNED_ACTION',
        ],
        journeySummary: {
          alignedActionsCount: 1,
          alignedActions: [{ id: 'a1', type: 'VOLUNTEER_WORK', title: 'test', completedAt: '2026-01-01', linkedToGoal: true }],
        },
      });

      const { POST } = await import('@/app/api/journey/complete/route');
      const req = makeReq('/api/journey/complete', 'POST', {
        stepId: 'SUBMIT_ACTION_REFLECTION',
        data: {
          type: 'SUBMIT_ACTION_REFLECTION',
          actionId: 'a1',
          reflectionResponse: XSS_PAYLOADS.scriptTag + ' Some valid text too',
        },
      });

      const res = await POST(req);
      // Should accept but store safely, or reject
      expect([200, 400]).toContain(res.status);
    });
  });

  describe('Malformed payloads', () => {
    it('rejects empty body for step completion', async () => {
      const { POST } = await import('@/app/api/journey/complete/route');
      const req = makeReq('/api/journey/complete', 'POST', {});
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('rejects null stepId', async () => {
      const { POST } = await import('@/app/api/journey/complete/route');
      const req = makeReq('/api/journey/complete', 'POST', {
        stepId: null,
        data: { type: 'REFLECT_ON_STRENGTHS', topStrengths: ['a', 'b', 'c'] },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('rejects numeric stepId', async () => {
      const { POST } = await import('@/app/api/journey/complete/route');
      const req = makeReq('/api/journey/complete', 'POST', {
        stepId: 12345,
        data: { type: 'REFLECT_ON_STRENGTHS', topStrengths: ['a', 'b', 'c'] },
      });
      const res = await POST(req);
      expect([400, 500]).toContain(res.status);
    });

    it('handles missing data field', async () => {
      const { POST } = await import('@/app/api/journey/complete/route');
      const req = makeReq('/api/journey/complete', 'POST', {
        stepId: 'REFLECT_ON_STRENGTHS',
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('rejects transition with empty targetState', async () => {
      const { PATCH } = await import('@/app/api/journey/route');
      const req = makeReq('/api/journey', 'PATCH', {
        action: 'transition',
        targetState: '',
      });
      const res = await PATCH(req);
      expect(res.status).toBe(400);
    });

    it('rejects transition with no action', async () => {
      const { PATCH } = await import('@/app/api/journey/route');
      const req = makeReq('/api/journey', 'PATCH', { targetState: 'EXPLORE_CAREERS' });
      const res = await PATCH(req);
      expect(res.status).toBe(400);
    });
  });

  describe('Oversized inputs', () => {
    it('handles oversized strengths array', async () => {
      const { POST } = await import('@/app/api/journey/complete/route');
      const req = makeReq('/api/journey/complete', 'POST', {
        stepId: 'REFLECT_ON_STRENGTHS',
        data: {
          type: 'REFLECT_ON_STRENGTHS',
          topStrengths: OVERSIZED_PAYLOADS.hugeArray.slice(0, 1000),
          demonstratedSkills: OVERSIZED_PAYLOADS.hugeArray.slice(0, 1000),
        },
      });

      const res = await POST(req);
      // Should either accept (no length limit) or reject — document behavior
      expect([200, 400, 413]).toContain(res.status);
    });

    it('handles very long strength string', async () => {
      const { POST } = await import('@/app/api/journey/complete/route');
      const req = makeReq('/api/journey/complete', 'POST', {
        stepId: 'REFLECT_ON_STRENGTHS',
        data: {
          type: 'REFLECT_ON_STRENGTHS',
          topStrengths: [OVERSIZED_PAYLOADS.megabyteString, 'b', 'c'],
          demonstratedSkills: ['d'],
        },
      });

      const res = await POST(req);
      expect([200, 400, 413]).toContain(res.status);
    });

    it('note content respects Zod min/max constraints', async () => {
      const { POST } = await import('@/app/api/journey/notes/route');
      mockPrisma.journeyNote.create.mockResolvedValue({ id: 'n1' });

      // Empty content
      const req1 = makeReq('/api/journey/notes', 'POST', { content: '' });
      const res1 = await POST(req1);
      expect(res1.status).toBe(400);

      // Title over 200 chars
      const req2 = makeReq('/api/journey/notes', 'POST', {
        content: 'Valid',
        title: 'X'.repeat(201),
      });
      const res2 = await POST(req2);
      expect(res2.status).toBe(400);
    });
  });

  describe('Unicode edge cases', () => {
    it('handles RTL override characters in strengths', async () => {
      const { POST } = await import('@/app/api/journey/complete/route');
      const req = makeReq('/api/journey/complete', 'POST', {
        stepId: 'REFLECT_ON_STRENGTHS',
        data: {
          type: 'REFLECT_ON_STRENGTHS',
          topStrengths: [UNICODE_PAYLOADS.rtlOverride, 'Teamwork', 'Problem Solving'],
          demonstratedSkills: [UNICODE_PAYLOADS.homoglyph],
        },
      });

      const res = await POST(req);
      // Should accept (valid strings) but not break
      expect([200, 400]).toContain(res.status);
    });

    it('handles null byte injection', async () => {
      const { POST } = await import('@/app/api/journey/complete/route');
      const req = makeReq('/api/journey/complete', 'POST', {
        stepId: 'REFLECT_ON_STRENGTHS',
        data: {
          type: 'REFLECT_ON_STRENGTHS',
          topStrengths: [UNICODE_PAYLOADS.nullBytes, 'Teamwork', 'Problem Solving'],
          demonstratedSkills: ['Listening'],
        },
      });

      const res = await POST(req);
      expect([200, 400]).toContain(res.status);
    });
  });

  describe('URL validation for saved items', () => {
    it('SECURITY FINDING: Saved items URL not validated at API level', async () => {
      /**
       * FINDING: POST /api/journey/saved-items accepts arbitrary URLs
       * including javascript:, data:, and vbscript: schemes. The safeHref()
       * function exists only as a client-side rendering guard on the dashboard.
       *
       * SEVERITY: Medium — Stored XSS via URL field. If any component renders
       * these URLs without safeHref(), javascript: URLs will execute.
       *
       * RECOMMENDATION: Validate URLs at the API level. Reject non-http(s) schemes.
       */
      // This test documents the finding — the actual saved-items route
      // does basic type/title/url validation but not URL scheme validation
    });
  });

  describe('Goal data input validation', () => {
    it('rejects goal data without goalId', async () => {
      const { POST } = await import('@/app/api/journey/goal-data/route');
      mockPrisma.journeyGoalData.updateMany.mockResolvedValue({ count: 0 });

      const req = makeReq('/api/journey/goal-data', 'POST', {
        goalTitle: 'Doctor',
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('rejects goal data without goalTitle', async () => {
      const { POST } = await import('@/app/api/journey/goal-data/route');
      const req = makeReq('/api/journey/goal-data', 'POST', {
        goalId: 'doctor',
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('rejects PATCH without goalId', async () => {
      const { PATCH } = await import('@/app/api/journey/goal-data/route');
      const req = makeReq('/api/journey/goal-data', 'PATCH', {
        roadmapCardData: {},
      });
      const res = await PATCH(req);
      expect(res.status).toBe(400);
    });
  });

  describe('Skip step validation', () => {
    it('rejects skip without stepId', async () => {
      const { POST } = await import('@/app/api/journey/skip/route');
      const req = makeReq('/api/journey/skip', 'POST', {
        reason: 'I have a valid reason to skip',
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('rejects skip without reason', async () => {
      const { POST } = await import('@/app/api/journey/skip/route');
      const req = makeReq('/api/journey/skip', 'POST', {
        stepId: 'UPDATE_PLAN',
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('rejects skip reason that is only whitespace', async () => {
      const { POST } = await import('@/app/api/journey/skip/route');
      const req = makeReq('/api/journey/skip', 'POST', {
        stepId: 'UPDATE_PLAN',
        reason: '            ', // Whitespace only, < 10 after trim
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });
});
