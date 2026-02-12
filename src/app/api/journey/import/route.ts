import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  importJourney,
  EXPORT_SCHEMA_VERSION,
  type JourneyExportEnvelope,
} from '@/lib/journey/recovery-service';

/**
 * POST /api/journey/import
 * Upload and merge journey JSON data.
 */
export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const payload = body as JourneyExportEnvelope;

    // Validate schema version
    if (!payload.schemaVersion) {
      return NextResponse.json({ error: 'Missing schemaVersion in payload' }, { status: 400 });
    }

    if (payload.schemaVersion !== EXPORT_SCHEMA_VERSION) {
      return NextResponse.json(
        { error: `Unsupported schema version: ${payload.schemaVersion}. Expected: ${EXPORT_SCHEMA_VERSION}` },
        { status: 400 }
      );
    }

    if (!payload.data) {
      return NextResponse.json({ error: 'Missing data in payload' }, { status: 400 });
    }

    const result = await importJourney(profile.id, session.user.id, payload);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Error importing journey:', error);
    return NextResponse.json({ error: 'Failed to import journey data' }, { status: 500 });
  }
}
