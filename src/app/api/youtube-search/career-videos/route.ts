import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/youtube-search/career-videos?career=Physiotherapist
 *
 * Finds 2 high-quality, distinct YouTube videos about a career.
 * Uses multiple search queries, strict relevance filtering, and
 * deduplication to return only on-topic content.
 */

interface VideoResult {
  videoId: string;
  title: string;
  thumbnail: string;
  query: string;
}

function buildQueries(career: string): string[] {
  return [
    `would you be happy as a ${career}`,
    `the worst part of being a ${career}`,
    `is being a ${career} worth it`,
    `the reality of being a ${career}`,
    `what they don't tell you about being a ${career}`,
    `${career} podcast career`,
    `${career} career honest review`,
    `${career} pros and cons career`,
    `should you become a ${career}`,
  ];
}

// Words/phrases that indicate the video is NOT about career reality
const REJECT_PATTERNS = [
  // Immigration / relocation
  /\bmov(e|ing) to\b/i,
  /\bmigrat/i,
  /\bimmigrat/i,
  /\bvisa\b/i,
  /\brelocat/i,
  /\babroad\b/i,
  /\baustralia\b/i,
  /\bcanada\b/i,
  /\bdubai\b/i,
  /\buk\b.*\bvisa\b/i,
  // Clickbait / irrelevant
  /\bprank\b/i,
  /\basmr\b/i,
  /\bcompilation\b/i,
  /\bmeme\b/i,
  /\bshorts?\b/i,
  /\breaction\b/i,
  /\bchallenge\b/i,
  /\bunboxing\b/i,
  // Sales / marketing
  /\bbuy now\b/i,
  /\bdiscount\b/i,
  /\bcoupon\b/i,
  /salary negotiation/i,
  // Non-career content
  /\bgameplay\b/i,
  /\btrailer\b/i,
  /\bmusic video\b/i,
  // News / TV shows — not career exploration
  /\bgood morning\b/i,
  /\bbreaking news\b/i,
  /\bnews\b.*\binterview\b/i,
  /\binterview\b.*\bnews\b/i,
  /\bthis morning\b/i,
  /\blorraine\b/i,
  /\bgmb\b/i,
  /\bbbc\b.*\bnews\b/i,
  /\bcnn\b/i,
  /\bfox news\b/i,
  /\bnbc\b/i,
  /\bitv\b.*\bnews\b/i,
  /\bdaily mail\b/i,
  // Specific person interviews (not career-focused)
  /\binterview with\b/i,
  /\btalks to\b/i,
  /\bspeaks to\b/i,
  /\bsits down with\b/i,
];

// Words/phrases that indicate the video IS about career exploration
const POSITIVE_SIGNALS = [
  /\breality\b/i,
  /\bhonest\b/i,
  /\btruth\b/i,
  /\bpros?\b.*\bcons?\b/i,
  /\bworth it\b/i,
  /\bregret/i,
  /\badvice\b/i,
  /\bcareer\b/i,
  /\bbecome\b/i,
  /\bwhat i (actually )?do\b/i,
  /\bday in the life\b/i,
  /\bpodcast\b/i,
  /\binterview\b/i,
  /\bis it for me\b/i,
  /\bworst part\b/i,
  /\bbest part\b/i,
  /\bwhat it'?s like\b/i,
  /\bshould you\b/i,
  /\bhow to become\b/i,
  /\broadmap\b/i,
  /\bexplained\b/i,
];

function isRelevant(title: string, career: string): boolean {
  const t = title.toLowerCase();
  const c = career.toLowerCase();

  // Career word must appear in title
  const careerWords = c.split(/[\s/()]+/).filter(w => w.length > 3);
  const hasCareerWord = careerWords.some(w => t.includes(w.toLowerCase()));
  if (!hasCareerWord) return false;

  // Reject blacklisted content
  if (REJECT_PATTERNS.some(p => p.test(title))) return false;

  // Must have at least one positive signal (career-exploration related)
  const hasPositiveSignal = POSITIVE_SIGNALS.some(p => p.test(title));
  if (!hasPositiveSignal) return false;

  return true;
}

async function searchYouTube(
  query: string,
  apiKey: string,
  career: string,
): Promise<VideoResult | null> {
  try {
    // Request 5 results to have a larger pool to filter
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=5&videoDuration=medium&relevanceLanguage=en&key=${apiKey}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.items?.length) return null;

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
