export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/youtube-search/career-videos?career=CIO
 *
 * Searches YouTube with multiple query variations to find the 2 best
 * distinct videos about a career. Tries queries like:
 *   - "how to become a CIO"
 *   - "what is a CIO"
 *   - "roadmap to CIO"
 *   - "what it takes to be a CIO"
 *
 * Returns the top 2 unique videos (by videoId) from across all queries.
 */

interface VideoResult {
  videoId: string;
  title: string;
  thumbnail: string;
  query: string;
}

function buildQueries(career: string): string[] {
  return [
    `how to become a ${career}`,
    `what is a ${career}`,
    `roadmap to ${career}`,
    `what it takes to be a ${career}`,
    `${career} career path explained`,
    `how to be a ${career}`,
  ];
}

async function searchYouTube(
  query: string,
  apiKey: string
): Promise<VideoResult | null> {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=1&videoDuration=medium&relevanceLanguage=en&key=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;

    const data = await res.json();
    const item = data.items?.[0];
    if (!item?.id?.videoId) return null;

    return {
      videoId: item.id.videoId,
      title: item.snippet?.title ?? '',
      thumbnail: item.snippet?.thumbnails?.medium?.url ?? '',
      query,
    };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const career = new URL(req.url).searchParams.get('career');

  if (!career) {
    return NextResponse.json({ error: 'Missing career parameter' }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'YouTube API key not configured' }, { status: 500 });
  }

  const queries = buildQueries(career);
  const seen = new Set<string>();
  const videos: VideoResult[] = [];

  // Search queries sequentially to avoid quota burst, stop when we have 2 unique videos
  for (const query of queries) {
    if (videos.length >= 2) break;

    const result = await searchYouTube(query, apiKey);
    if (result && !seen.has(result.videoId)) {
      seen.add(result.videoId);
      videos.push(result);
    }
  }

  return NextResponse.json({
    career,
    videos,
    count: videos.length,
  });
}
