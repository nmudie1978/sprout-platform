/**
 * POST /api/agents/career-opportunities
 *
 * Body:
 *   { "career": "Healthcare Worker", "location"?: "Oslo" }
 *
 * Returns the final validated array from the three-stage agent
 * pipeline. See `src/lib/agents/career-opportunities.ts` for the
 * full pipeline; this route is only the HTTP wrapper plus a 7-day
 * DB cache so we don't pay for the same query twice.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import {
  runCareerOpportunitiesAgent,
  type CareerOpportunitiesResult,
} from '@/lib/agents/career-opportunities';

export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  career: z.string().min(1).max(120),
  location: z.string().max(80).optional(),
});

function cacheKeyFor(career: string, location?: string): string {
  const c = career.toLowerCase().trim().replace(/\s+/g, '-');
  const l = (location ?? '').toLowerCase().trim().replace(/\s+/g, '-');
  return `agent:career-opportunities:v1:${c}${l ? `:${l}` : ''}`;
}

const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const EMPTY_TTL_MS = 60 * 60 * 1000; // 1 hour for empty results so retries happen sooner

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid input', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { career, location } = parsed.data;
  const cacheKey = cacheKeyFor(career, location);

  // 1. Cache lookup
  try {
    const cached = await prisma.videoCache.findUnique({ where: { cacheKey } });
    if (cached && cached.expiresAt > new Date()) {
      return NextResponse.json(
        { items: cached.data, cached: true, generatedAt: cached.createdAt },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400',
          },
        },
      );
    }
  } catch {
    /* cache miss is fine */
  }

  // 2. Run the agent
  let result: CareerOpportunitiesResult = [];
  try {
    result = await runCareerOpportunitiesAgent({ career, location });
  } catch (err) {
    console.error('[career-opportunities route] pipeline failed:', err);
    return NextResponse.json(
      { error: 'agent pipeline failed', message: (err as Error).message },
      { status: 500 },
    );
  }

  // 3. Cache write — short TTL when empty so we retry sooner
  const ttl = result.length > 0 ? TTL_MS : EMPTY_TTL_MS;
  prisma.videoCache
    .upsert({
      where: { cacheKey },
      create: {
        cacheKey,
        data: result as unknown as object,
        expiresAt: new Date(Date.now() + ttl),
      },
      update: {
        data: result as unknown as object,
        expiresAt: new Date(Date.now() + ttl),
      },
    })
    .catch(() => {
      /* non-blocking */
    });

  return NextResponse.json(
    { items: result, cached: false },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400',
      },
    },
  );
}
