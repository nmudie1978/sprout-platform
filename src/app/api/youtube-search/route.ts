import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/youtube-search?q=day+in+the+life+Doctor
 *
 * Searches YouTube and returns the top video ID.
 * Results cached in DB for 7 days to conserve API quota.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Missing q parameter' }, { status: 400 });
  }

  const cacheKey = `yt:${query.toLowerCase().trim()}`;

  // Check DB cache
  try {
    const cached = await prisma.videoCache.findUnique({ where: { cacheKey } });
    if (cached && cached.expiresAt > new Date()) {
      const data = cached.data as { videoId: string | null; title: string | null };
      return NextResponse.json(data, {
        headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400' },
      });
    }
  } catch { /* cache miss, proceed to API */ }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ videoId: null, title: null });
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=1&videoDuration=medium&relevanceLanguage=en&key=${apiKey}`;
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
      console.error('[YouTube Search] API error:', res.status);
      return NextResponse.json({ videoId: null, title: null });
    }

    const data = await res.json();
    const videoId = data.items?.[0]?.id?.videoId ?? null;
    const title = data.items?.[0]?.snippet?.title ?? null;
    const result = { videoId, title };

    // Save to DB cache (7 days)
    if (videoId) {
      prisma.videoCache.upsert({
        where: { cacheKey },
        create: { cacheKey, data: result, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        update: { data: result, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      }).catch(() => { /* non-blocking */ });
    }

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400' },
    });
  } catch (error) {
    console.error('[YouTube Search] Error:', error);
    return NextResponse.json({ videoId: null, title: null });
  }
}
