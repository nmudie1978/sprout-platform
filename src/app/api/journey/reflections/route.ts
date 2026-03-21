export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  createReflection,
  recordReflection,
  skipReflection,
  getReflections,
  getPendingReflections,
  getReflectionCounts,
  type CreateReflectionInput,
  type ReflectionQueryOptions,
  type ReflectionContextType,
} from '@/lib/journey';

/**
 * GET /api/journey/reflections
 *
 * Fetch reflections for the current user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'YOUTH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get profile ID
    const profile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const contextType = searchParams.get('contextType') as ReflectionContextType | null;
    const contextId = searchParams.get('contextId');
    const includeSkipped = searchParams.get('includeSkipped') !== 'false';
    const pendingOnly = searchParams.get('pendingOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    if (pendingOnly) {
      const pending = await getPendingReflections(profile.id);
      return NextResponse.json({
        success: true,
        reflections: pending,
        total: pending.length,
      });
    }

    const options: ReflectionQueryOptions = {
      profileId: profile.id,
      limit,
      offset,
      includeSkipped,
      ...(contextType ? { contextType } : {}),
      ...(contextId ? { contextId } : {}),
    };

    const [reflectionsResult, counts] = await Promise.all([
      getReflections(options),
      getReflectionCounts(profile.id),
    ]);

    return NextResponse.json({
      success: true,
      reflections: reflectionsResult.reflections,
      total: reflectionsResult.total,
      counts,
    });
  } catch (error) {
    console.error('Failed to fetch reflections:', error);
    return NextResponse.json({ error: 'Failed to fetch reflections' }, { status: 500 });
  }
}

/**
 * POST /api/journey/reflections
 *
 * Create a new reflection prompt or record a response
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'YOUTH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get profile ID
    const profile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const body = await req.json();
    const { action, reflectionId, contextType, contextId, prompt, response, skipped } = body;

    // Create a new reflection prompt
    if (action === 'create') {
      if (!contextType || !prompt) {
        return NextResponse.json(
          { error: 'Missing required fields: contextType, prompt' },
          { status: 400 }
        );
      }

      const validContextTypes: ReflectionContextType[] = [
        'ALIGNED_ACTION',
        'ROLE_DEEP_DIVE',
        'INDUSTRY_INSIGHTS',
        'SHADOW_COMPLETED',
        'CAREER_DISCOVERY',
        'PLAN_BUILD',
        'STRENGTHS_REFLECTION',
      ];

      if (!validContextTypes.includes(contextType)) {
        return NextResponse.json(
          { error: `Invalid contextType. Must be one of: ${validContextTypes.join(', ')}` },
          { status: 400 }
        );
      }

      const input: CreateReflectionInput = {
        profileId: profile.id,
        userId: session.user.id,
        contextType,
        contextId,
        prompt,
      };

      const reflection = await createReflection(input);

      return NextResponse.json({
        success: true,
        reflection,
      });
    }

    // Record a response to an existing reflection
    if (action === 'record') {
      if (!reflectionId) {
        return NextResponse.json({ error: 'Missing reflectionId' }, { status: 400 });
      }

      const reflection = await recordReflection(reflectionId, profile.id, session.user.id, {
        response,
        skipped: false,
      });

      if (!reflection) {
        return NextResponse.json({ error: 'Reflection not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        reflection,
      });
    }

    // Skip a reflection
    if (action === 'skip') {
      if (!reflectionId) {
        return NextResponse.json({ error: 'Missing reflectionId' }, { status: 400 });
      }

      const reflection = await skipReflection(reflectionId, profile.id);

      if (!reflection) {
        return NextResponse.json({ error: 'Reflection not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        reflection,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Failed to handle reflection:', error);
    return NextResponse.json({ error: 'Failed to handle reflection' }, { status: 500 });
  }
}
