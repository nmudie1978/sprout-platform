import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/youtube-search?q=day+in+the+life+Doctor
 *
 * Searches YouTube and returns the top video ID.
 * Responses are cached for 24 hours to conserve API quota.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Missing q parameter' }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'YouTube API key not configured' }, { status: 500 });
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=1&videoDuration=medium&relevanceLanguage=en&key=${apiKey}`;

    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) {
      console.error('[YouTube Search] API error:', await res.text());
      return NextResponse.json({ videoId: null, title: null });
    }

    const data = await res.json();
    const videoId = data.items?.[0]?.id?.videoId ?? null;
    const title = data.items?.[0]?.snippet?.title ?? null;

    // Cache the response for 24 hours
    return NextResponse.json(
      { videoId, title },
      { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400' } }
    );
  } catch (error) {
    console.error('[YouTube Search] Error:', error);
    return NextResponse.json({ videoId: null, title: null });
  }
}
