export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
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
  const { searchParams } = new URL(req.url);
  const careerId = searchParams.get('careerId')?.trim();
  const careerTitle = searchParams.get('career')?.trim();

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
