export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/youtube-search?q=Doctor
 *
 * Searches YouTube for "day in the life {career}" and returns the top video ID.
 * Uses YouTube Data API v3.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const career = searchParams.get('q');

  if (!career) {
    return NextResponse.json({ error: 'Missing q parameter' }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'YouTube API key not configured' }, { status: 500 });
  }

  try {
    const query = `day in the life ${career}`;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=1&videoDuration=medium&relevanceLanguage=en&key=${apiKey}`;

    const res = await fetch(url, { next: { revalidate: 86400 } }); // Cache 24h
    if (!res.ok) {
      console.error('[YouTube Search] API error:', await res.text());
      return NextResponse.json({ error: 'YouTube search failed' }, { status: 502 });
    }

    const data = await res.json();
    const videoId = data.items?.[0]?.id?.videoId ?? null;
    const title = data.items?.[0]?.snippet?.title ?? null;

    return NextResponse.json({ videoId, title });
  } catch (error) {
    console.error('[YouTube Search] Error:', error);
    return NextResponse.json({ error: 'Failed to search YouTube' }, { status: 500 });
  }
}
