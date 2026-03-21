import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getTimelineEvents,
  getTimelineEventCounts,
  type TimelineQueryOptions,
} from '@/lib/journey';

/**
 * GET /api/journey/timeline
 *
 * Fetch timeline events for the current user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'YOUTH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const types = searchParams.get('types')?.split(',').filter(Boolean);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const options: TimelineQueryOptions = {
      userId: session.user.id,
      limit,
      offset,
      types: types as TimelineQueryOptions['types'],
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    const [eventsResult, counts] = await Promise.all([
      getTimelineEvents(options),
      getTimelineEventCounts(session.user.id),
    ]);

    return NextResponse.json({
      success: true,
      events: eventsResult.events,
      total: eventsResult.total,
      counts,
    });
  } catch (error) {
    console.error('Failed to fetch timeline:', error);
    return NextResponse.json({ error: 'Failed to fetch timeline' }, { status: 500 });
  }
}
