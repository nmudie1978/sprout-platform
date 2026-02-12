import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuditAction } from '@prisma/client';
import { logAuditAction } from '@/lib/safety';
import { exportJourney } from '@/lib/journey/recovery-service';

/**
 * GET /api/journey/export
 * Download the user's journey data as a JSON file.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const data = await exportJourney(profile.id);

    await logAuditAction({
      userId: session.user.id,
      action: AuditAction.JOURNEY_DATA_EXPORTED,
      targetType: 'YouthProfile',
      targetId: profile.id,
    });

    const json = JSON.stringify(data, null, 2);

    return new NextResponse(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="journey-export-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    console.error('Error exporting journey:', error);
    return NextResponse.json({ error: 'Failed to export journey data' }, { status: 500 });
  }
}
