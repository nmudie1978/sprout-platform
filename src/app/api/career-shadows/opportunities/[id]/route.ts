/**
 * Career Shadow Opportunity by ID API
 *
 * GET /api/career-shadows/opportunities/[id]
 *   Get a single opportunity by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOpportunitiesProvider } from '@/lib/career-shadows/opportunities-provider';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Missing opportunity ID' }, { status: 400 });
    }

    const provider = getOpportunitiesProvider();
    const opportunity = await provider.getOpportunityById(id);

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      opportunity,
    });
  } catch (error) {
    console.error('Failed to fetch opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunity' },
      { status: 500 }
    );
  }
}
