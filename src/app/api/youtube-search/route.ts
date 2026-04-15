import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/youtube-search?q=day+in+the+life+Doctor
 *
 * Searches YouTube and returns up to 5 matching videos. The single-video
 * fields (videoId, title) are kept for backward compatibility with any
 * legacy callers — the `videos` array is what the UI now iterates to let
 * users cycle through alternative Day-in-the-Life clips.
 *
 * Results cached in DB for 7 days to conserve API quota.
 */
interface YouTubeVideo {
  videoId: string;
  title: string | null;
}

interface YouTubeSearchResult {
  videos: YouTubeVideo[];
  // Back-compat: first video repeated as top-level fields.
  videoId: string | null;
  title: string | null;
}

const EMPTY_RESULT: YouTubeSearchResult = { videos: [], videoId: null, title: null };

// Cache entries written before the list change hold only `{videoId, title}`.
// Normalise both shapes into the new `videos[]` response so we don't need to
// invalidate the cache — legacy entries transparently upgrade on read.
function normaliseCached(raw: unknown): YouTubeSearchResult {
  const d = raw as { videos?: YouTubeVideo[]; videoId?: string | null; title?: string | null };
  if (Array.isArray(d?.videos) && d.videos.length > 0) {
    return { videos: d.videos, videoId: d.videos[0].videoId, title: d.videos[0].title };
  }
  if (d?.videoId) {
    return { videos: [{ videoId: d.videoId, title: d.title ?? null }], videoId: d.videoId, title: d.title ?? null };
  }
  return EMPTY_RESULT;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Missing q parameter' }, { status: 400 });
  }

  const cacheKey = `yt:${query.toLowerCase().trim()}`;

  // Check DB cache. Legacy entries stored only one video — treat those as
  // a miss so the new multi-video query runs and replaces them. Without
  // this the "More" control never appears for any career that was
  // searched under the old single-result API.
  try {
    const cached = await prisma.videoCache.findUnique({ where: { cacheKey } });
    if (cached && cached.expiresAt > new Date()) {
      const d = cached.data as { videos?: unknown[] };
      const isLegacy = !Array.isArray(d?.videos);
      if (!isLegacy) {
        return NextResponse.json(normaliseCached(cached.data), {
          headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400' },
        });
      }
    }
  } catch { /* cache miss, proceed to API */ }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(EMPTY_RESULT);
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=5&videoDuration=medium&relevanceLanguage=en&key=${apiKey}`;
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
      console.error('[YouTube Search] API error:', res.status);
      return NextResponse.json(EMPTY_RESULT);
    }

    const data = await res.json();
    const videos: YouTubeVideo[] = (data.items ?? [])
      .map((it: { id?: { videoId?: string }; snippet?: { title?: string } }) => ({
        videoId: it.id?.videoId ?? '',
        title: it.snippet?.title ?? null,
      }))
      .filter((v: YouTubeVideo) => Boolean(v.videoId));

    const result: YouTubeSearchResult = {
      videos,
      videoId: videos[0]?.videoId ?? null,
      title: videos[0]?.title ?? null,
    };

    // Save to DB cache (7 days)
    if (videos.length > 0) {
      const cachePayload = result as unknown as Prisma.InputJsonValue;
      prisma.videoCache.upsert({
        where: { cacheKey },
        create: { cacheKey, data: cachePayload, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        update: { data: cachePayload, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      }).catch(() => { /* non-blocking */ });
    }

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400' },
    });
  } catch (error) {
    console.error('[YouTube Search] Error:', error);
    return NextResponse.json(EMPTY_RESULT);
  }
}
