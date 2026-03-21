/**
 * Career Shadow Metadata API
 *
 * GET /api/career-shadows/metadata
 *   Get available categories and cities for filtering
 */

import { NextResponse } from 'next/server';
import { getOpportunitiesProvider } from '@/lib/career-shadows/opportunities-provider';

export async function GET() {
  try {
    const provider = getOpportunitiesProvider();

    const [categories, cities] = await Promise.all([
      provider.getCategories(),
      provider.getCities(),
    ]);

    return NextResponse.json({
      success: true,
      categories,
      cities,
      formats: [
        { value: 'WALKTHROUGH', label: 'Walkthrough (1-2 hours)' },
        { value: 'HALF_DAY', label: 'Half Day (3-4 hours)' },
        { value: 'FULL_DAY', label: 'Full Day (6-8 hours)' },
      ],
    });
  } catch (error) {
    console.error('Failed to fetch metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metadata' },
      { status: 500 }
    );
  }
}
