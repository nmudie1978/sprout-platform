import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { recordLifeSkillEvent, LifeSkillEventType } from '@/lib/life-skills';

const VALID_EVENT_TYPES: LifeSkillEventType[] = [
  'JOB_ACCEPTED',
  'MESSAGE_SENT_FIRST',
  'JOB_STARTING_SOON',
  'RUNNING_LATE_TEMPLATE_USED',
  'CONVERSATION_STARTED',
  'JOB_DECLINED',
  'PAYMENT_DISCUSSED',
  'LOCATION_SHARED',
  'JOB_COMPLETED',
  'SAFETY_CONCERN_REPORTED',
];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { eventType, entityId, metadata } = body;

    if (!eventType || !VALID_EVENT_TYPES.includes(eventType)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      );
    }

    const result = await recordLifeSkillEvent(
      session.user.id,
      eventType as LifeSkillEventType,
      entityId,
      metadata
    );

    if (!result) {
      return NextResponse.json({ recorded: false });
    }

    return NextResponse.json({
      recorded: true,
      eventId: result.eventId,
      cardRecommended: result.cardRecommended,
    });
  } catch (error) {
    console.error('Failed to record life skill event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
