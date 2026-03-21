/**
 * Career Shadow Opportunities API
 *
 * GET /api/career-shadows/opportunities
 *   Search for shadow opportunities
 *
 * Query params:
 *   - q: Search keyword (roleTitle, category, description)
 *   - category: Filter by category
 *   - city: Filter by city
 *   - remote: Include remote opportunities (true/false)
 *   - age: User's age for eligibility filtering
 *   - format: WALKTHROUGH | HALF_DAY | FULL_DAY
 *   - limit: Number of results (default 20)
 *   - offset: Pagination offset
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import {
  getOpportunitiesProvider,
  type SearchOpportunitiesParams,
} from '@/lib/career-shadows/opportunities-provider';

// ============================================
// VALIDATION SCHEMA
// ============================================

const searchParamsSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  city: z.string().optional(),
  remote: z.enum(['true', 'false']).optional(),
  age: z.coerce.number().min(15).max(25).optional(),
  format: z.enum(['WALKTHROUGH', 'HALF_DAY', 'FULL_DAY']).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

// ============================================
// GET /api/career-shadows/opportunities
// ============================================

export async function GET(req: NextRequest) {
  try {
    // Auth check (optional - allow unauthenticated for browsing)
    const session = await getServerSession(authOptions);

    // Parse query params
    const { searchParams } = new URL(req.url);
    const rawParams = Object.fromEntries(searchParams.entries());

    const parseResult = searchParamsSchema.safeParse(rawParams);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const params = parseResult.data;

    // Build search params
    const searchPayload: SearchOpportunitiesParams = {
      limit: params.limit,
      offset: params.offset,
    };

    if (params.q) {
      searchPayload.roleTitle = params.q;
    }

    if (params.category) {
      searchPayload.roleCategory = params.category;
    }

    if (params.city) {
      searchPayload.city = params.city;
    }

    if (params.remote !== undefined) {
      searchPayload.remoteAllowed = params.remote === 'true';
    }

    if (params.age) {
      searchPayload.minAge = params.age;
    }

    if (params.format) {
      searchPayload.format = params.format;
    }

    // Search opportunities
    const provider = getOpportunitiesProvider();
    const opportunities = await provider.searchOpportunities(searchPayload);

    return NextResponse.json({
      success: true,
      opportunities,
      count: opportunities.length,
      pagination: {
        limit: params.limit,
        offset: params.offset,
        hasMore: opportunities.length === params.limit,
      },
      authenticated: !!session,
    });
  } catch (error) {
    console.error('Failed to search opportunities:', error);
    return NextResponse.json(
      { error: 'Failed to search opportunities' },
      { status: 500 }
    );
  }
}
