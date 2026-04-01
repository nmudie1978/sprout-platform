import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/youtube-search/career-videos?career=Primary+School+Teacher
 *
 * Finds 2 high-quality, distinct YouTube videos about a career focused on:
 *   1. The reality of the job (honest, first-person accounts)
 *   2. How to get into the career (practical advice)
 *
 * Searches multiple query patterns, filters for relevance, deduplicates,
 * and returns the best 2 results.
 */

interface VideoResult {
  videoId: string;
  title: string;
  thumbnail: string;
  query: string;
}

function buildQueries(career: string): string[] {
  // Ordered by likely quality for "reality" content
  // Each query targets a different content style
  // Interleaved so the 2 picked videos are different formats
  return [
    // Happiness / satisfaction — honest reflections
    `would you be happy as a ${career}`,
    `is being a ${career} worth it`,
    // Reality / honesty
    `the reality of being a ${career}`,
    `what they don't tell you about being a ${career}`,
    // Podcasts and interviews
    `${career} podcast career`,
    `${career} career honest review`,
    // Fallbacks
    `${career} pros and cons career`,
    `should you become a ${career}`,
  ];
}

/** Check if a video title is relevant to the career */
function isRelevant(title: string, career: string): boolean {
  const t = title.toLowerCase();
  const c = career.toLowerCase();

  // Extract key words from career title (e.g. "Primary School Teacher" → ["primary", "school", "teacher"])
  const careerWords = c.split(/\s+/).filter(w => w.length > 2);

  // At least one career word must appear in the title
  const hasCareerWord = careerWords.some(w => t.includes(w));
  if (!hasCareerWord) return false;

  // Reject obviously irrelevant content
  const rejectPatterns = [
    /salary negotiation/i,
    /moving to/i,
    /migrate/i,
    /immigration/i,
    /visa/i,
    /prank/i,
    /asmr/i,
    /compilation/i,
    /meme/i,
    /shorts/i,
  ];
  if (rejectPatterns.some(p => p.test(title))) return false;

  return true;
}

async function searchYouTube(
  query: string,
  apiKey: string,
  career: string,
): Promise<VideoResult | null> {
  try {
    // Request 3 results so we can filter for relevance
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=3&videoDuration=medium&relevanceLanguage=en&key=${apiKey}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.items?.length) return null;

    // Find the first relevant result
    for (const item of data.items) {
      const videoId = item.id?.videoId;
      const title = item.snippet?.title ?? '';
      if (!videoId) continue;

      if (isRelevant(title, career)) {
        return {
          videoId,
          title,
          thumbnail: item.snippet?.thumbnails?.medium?.url ?? '',
          query,
        };
      }
    }

    return null;
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

  // Search sequentially, stop when we have 2 unique relevant videos
  for (const query of queries) {
    if (videos.length >= 2) break;

    const result = await searchYouTube(query, apiKey, career);
    if (result && !seen.has(result.videoId)) {
      seen.add(result.videoId);
      videos.push(result);
    }
  }

  return NextResponse.json(
    { career, videos, count: videos.length },
    { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400' } },
  );
}
