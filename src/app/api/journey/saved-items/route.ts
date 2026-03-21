import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  saveItem,
  unsaveItem,
  getSavedItems,
  getSavedItemCounts,
  getRecentSavedItems,
  type CreateSavedItemInput,
  type SavedItemQueryOptions,
  type SavedItemType,
} from '@/lib/journey';

/**
 * GET /api/journey/saved-items
 *
 * Fetch saved items (My Library) for the current user
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
    const type = searchParams.get('type') as SavedItemType | null;
    const careerPathId = searchParams.get('careerPathId');
    const roleId = searchParams.get('roleId');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const options: SavedItemQueryOptions = {
      profileId: profile.id,
      limit,
      offset,
      ...(type ? { type } : {}),
      ...(careerPathId ? { careerPathId } : {}),
      ...(roleId ? { roleId } : {}),
      ...(tags ? { tags } : {}),
      ...(search ? { search } : {}),
    };

    const [itemsResult, counts, recentItems] = await Promise.all([
      getSavedItems(options),
      getSavedItemCounts(profile.id),
      getRecentSavedItems(profile.id, 5),
    ]);

    return NextResponse.json({
      success: true,
      items: itemsResult.items,
      total: itemsResult.total,
      counts,
      recentItems,
    });
  } catch (error) {
    console.error('Failed to fetch saved items:', error);
    return NextResponse.json({ error: 'Failed to fetch saved items' }, { status: 500 });
  }
}

/**
 * POST /api/journey/saved-items
 *
 * Save a new item to the user's library
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
    const { type, title, url, source, tags, careerPathId, roleId, thumbnail, description } = body;

    if (!type || !title || !url) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, url' },
        { status: 400 }
      );
    }

    const validTypes: SavedItemType[] = ['ARTICLE', 'VIDEO', 'PODCAST', 'SHORT'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const input: CreateSavedItemInput = {
      profileId: profile.id,
      userId: session.user.id,
      type,
      title,
      url,
      source,
      tags: tags || [],
      careerPathId,
      roleId,
      thumbnail,
      description,
    };

    const item = await saveItem(input);

    return NextResponse.json({
      success: true,
      item,
    });
  } catch (error) {
    console.error('Failed to save item:', error);
    return NextResponse.json({ error: 'Failed to save item' }, { status: 500 });
  }
}

/**
 * DELETE /api/journey/saved-items
 *
 * Remove an item from the user's library
 */
export async function DELETE(req: NextRequest) {
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
    const itemId = searchParams.get('id');

    if (!itemId) {
      return NextResponse.json({ error: 'Missing item id' }, { status: 400 });
    }

    const removed = await unsaveItem(itemId, profile.id);

    if (!removed) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Failed to remove saved item:', error);
    return NextResponse.json({ error: 'Failed to remove saved item' }, { status: 500 });
  }
}
