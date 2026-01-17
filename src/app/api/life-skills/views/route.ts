import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  markRecommendationShown,
  dismissRecommendation,
  saveCard,
} from '@/lib/life-skills';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { recommendationId, action } = body;

    if (!recommendationId) {
      return NextResponse.json(
        { error: 'Recommendation ID required' },
        { status: 400 }
      );
    }

    if (!action || !['shown', 'dismiss', 'save'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be: shown, dismiss, or save' },
        { status: 400 }
      );
    }

    let success = false;
    switch (action) {
      case 'shown':
        success = await markRecommendationShown(session.user.id, recommendationId);
        break;
      case 'dismiss':
        success = await dismissRecommendation(session.user.id, recommendationId);
        break;
      case 'save':
        success = await saveCard(session.user.id, recommendationId);
        break;
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update view status' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, action });
  } catch (error) {
    console.error('Failed to update life skill view:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
