import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getShadowProvider,
  type CreateShadowRequestInput,
  type UpdateShadowRequestInput,
  type ShadowFormat,
} from '@/lib/journey';

/**
 * GET /api/journey/shadows
 *
 * Fetch shadow requests for the current user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'YOUTH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const provider = getShadowProvider();
    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get('id');

    // If ID is provided, get single request
    if (requestId) {
      const request = await provider.getRequestById(requestId, session.user.id);

      if (!request) {
        return NextResponse.json({ error: 'Shadow request not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        request,
      });
    }

    // Otherwise, get all requests with summary
    const [requests, summary] = await Promise.all([
      provider.getRequests(session.user.id),
      provider.getSummary(session.user.id),
    ]);

    return NextResponse.json({
      success: true,
      requests,
      summary,
    });
  } catch (error) {
    console.error('Failed to fetch shadow requests:', error);
    return NextResponse.json({ error: 'Failed to fetch shadow requests' }, { status: 500 });
  }
}

/**
 * POST /api/journey/shadows
 *
 * Create, update, submit, or cancel a shadow request
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'YOUTH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const provider = getShadowProvider();
    const body = await req.json();
    const { action, requestId, ...data } = body;

    // Create a new shadow request
    if (action === 'create') {
      const { roleTitle, roleCategory, learningGoals, format, message, availabilityStart, availabilityEnd, preferredDays } = data;

      if (!roleTitle || !learningGoals || !format || !message) {
        return NextResponse.json(
          { error: 'Missing required fields: roleTitle, learningGoals, format, message' },
          { status: 400 }
        );
      }

      const validFormats: ShadowFormat[] = ['WALKTHROUGH', 'HALF_DAY', 'FULL_DAY'];
      if (!validFormats.includes(format)) {
        return NextResponse.json(
          { error: `Invalid format. Must be one of: ${validFormats.join(', ')}` },
          { status: 400 }
        );
      }

      const input: CreateShadowRequestInput = {
        roleTitle,
        roleCategory,
        learningGoals,
        format,
        message,
        availabilityStart: availabilityStart ? new Date(availabilityStart) : undefined,
        availabilityEnd: availabilityEnd ? new Date(availabilityEnd) : undefined,
        preferredDays,
      };

      const request = await provider.createRequest(session.user.id, input);

      return NextResponse.json({
        success: true,
        request,
      });
    }

    // Update an existing draft request
    if (action === 'update') {
      if (!requestId) {
        return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });
      }

      const { learningGoals, format, message, availabilityStart, availabilityEnd, preferredDays } = data;

      const updates: UpdateShadowRequestInput = {
        ...(learningGoals ? { learningGoals } : {}),
        ...(format ? { format } : {}),
        ...(message ? { message } : {}),
        ...(availabilityStart ? { availabilityStart: new Date(availabilityStart) } : {}),
        ...(availabilityEnd ? { availabilityEnd: new Date(availabilityEnd) } : {}),
        ...(preferredDays ? { preferredDays } : {}),
      };

      const request = await provider.updateRequest(requestId, session.user.id, updates);

      if (!request) {
        return NextResponse.json(
          { error: 'Shadow request not found or cannot be updated' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        request,
      });
    }

    // Submit a draft request
    if (action === 'submit') {
      if (!requestId) {
        return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });
      }

      const request = await provider.submitRequest(requestId, session.user.id);

      if (!request) {
        return NextResponse.json(
          { error: 'Shadow request not found or cannot be submitted' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        request,
      });
    }

    // Cancel a request
    if (action === 'cancel') {
      if (!requestId) {
        return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });
      }

      const cancelled = await provider.cancelRequest(requestId, session.user.id);

      if (!cancelled) {
        return NextResponse.json(
          { error: 'Shadow request not found or cannot be cancelled' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
      });
    }

    // Skip the shadow step entirely
    if (action === 'skip') {
      const { reason } = data;

      if (!reason || reason.trim().length < 10) {
        return NextResponse.json(
          { error: 'A reason (at least 10 characters) is required to skip the shadow step' },
          { status: 400 }
        );
      }

      await provider.skipShadowStep(session.user.id, reason);

      return NextResponse.json({
        success: true,
        skipped: true,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Failed to handle shadow request:', error);
    return NextResponse.json({ error: 'Failed to handle shadow request' }, { status: 500 });
  }
}
