export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkRateLimitAsync, RateLimits } from '@/lib/rate-limit';
import { scoreCareerPresence } from '@/lib/career-presence/scoring';
import { interpretPresence, buildFallbackResult } from '@/lib/career-presence/agent';
import type { CareerPresenceResult } from '@/lib/career-presence/types';

// Simple in-memory cache (survives within a single serverless instance).
// Keeps AI costs near zero — same career returns the cached result.
const cache = new Map<string, { result: CareerPresenceResult; expiresAt: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * GET /api/career-presence?career=Software+Developer&careerId=software-developer
 *
 * Returns a CareerPresenceResult with:
 *   - scored presence levels per country
 *   - AI or deterministic explanation
 *   - caution note
 *   - available flag (false = no data for this career)
 */
export async function GET(req: NextRequest) {
  // Auth + rate limit: interpretPresence() can call OpenAI, and the in-memory
  // cache resets on cold-start + is bustable by rotating ?careerId=, so an
  // anonymous caller could run up an unbounded bill. Mirrors career-reality /
  // youtube-search. (The deterministic fallback path is cheap, but gating the
  // whole route is simplest and this is an authenticated dashboard feature.)
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const rl = await checkRateLimitAsync(`career-presence:${session.user.id}`, RateLimits.AI_CHAT);
  if (!rl.success) {
    return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const careerId = searchParams.get('careerId')?.trim();
  // Cap the title: it's user-controlled and flows into the OpenAI prompt, so an
  // unbounded value would amplify token cost. 120 chars covers any real title.
  const careerTitle = searchParams.get('career')?.trim().slice(0, 120);

  if (!careerId || !careerTitle) {
    return NextResponse.json(
      { error: 'careerId and career (title) are required' },
      { status: 400 },
    );
  }

  // Check cache
  const cacheKey = careerId.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.result);
  }

  // Score the career
  const scored = scoreCareerPresence(careerId);

  if (!scored) {
    // No seed data — return a safe fallback
    const fallback = buildFallbackResult(careerId, careerTitle);
    return NextResponse.json(fallback);
  }

  // Interpret via the agent (AI or deterministic)
  const result = await interpretPresence(careerId, careerTitle, scored);

  // Cache the result
  cache.set(cacheKey, { result, expiresAt: Date.now() + CACHE_TTL });

  return NextResponse.json(result);
}
