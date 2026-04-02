import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/youtube-search/career-videos?career=Physiotherapist
 *
 * Finds 2 high-quality, distinct YouTube videos about a career.
 * Results cached in DB for 7 days — same career never hits YouTube twice.
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

const REJECT_PATTERNS = [
  /\bmov(e|ing) to\b/i, /\bmigrat/i, /\bimmigrat/i, /\bvisa\b/i, /\brelocat/i,
  /\babroad\b/i, /\baustralia\b/i, /\bcanada\b/i, /\bdubai\b/i, /\buk\b.*\bvisa\b/i,
  /\bprank\b/i, /\basmr\b/i, /\bcompilation\b/i, /\bmeme\b/i, /\bshorts?\b/i,
  /\breaction\b/i, /\bchallenge\b/i, /\bunboxing\b/i,
  /\bbuy now\b/i, /\bdiscount\b/i, /\bcoupon\b/i, /salary negotiation/i,
  /\bgameplay\b/i, /\btrailer\b/i, /\bmusic video\b/i,
  /\bgood morning\b/i, /\bbreaking news\b/i, /\bnews\b.*\binterview\b/i,
  /\binterview\b.*\bnews\b/i, /\bthis morning\b/i, /\blorraine\b/i, /\bgmb\b/i,
  /\bbbc\b.*\bnews\b/i, /\bcnn\b/i, /\bfox news\b/i, /\bnbc\b/i,
  /\bitv\b.*\bnews\b/i, /\bdaily mail\b/i,
  /\binterview with\b/i, /\btalks to\b/i, /\bspeaks to\b/i, /\bsits down with\b/i,
];

const POSITIVE_SIGNALS = [
  /\breality\b/i, /\bhonest\b/i, /\btruth\b/i, /\bpros?\b.*\bcons?\b/i,
  /\bworth it\b/i, /\bregret/i, /\badvice\b/i, /\bcareer\b/i, /\bbecome\b/i,
  /\bwhat i (actually )?do\b/i, /\bday in the life\b/i, /\bpodcast\b/i,
  /\binterview\b/i, /\bis it for me\b/i, /\bworst part\b/i, /\bbest part\b/i,
  /\bwhat it'?s like\b/i, /\bshould you\b/i, /\bhow to become\b/i,
  /\broadmap\b/i, /\bexplained\b/i,
];

function isRelevant(title: string, career: string): boolean {
  const t = title.toLowerCase();
  const careerWords = career.toLowerCase().split(/[\s/()]+/).filter(w => w.length > 3);
  if (!careerWords.some(w => t.includes(w))) return false;
  if (REJECT_PATTERNS.some(p => p.test(title))) return false;
  if (!POSITIVE_SIGNALS.some(p => p.test(title))) return false;
  return true;
}

async function searchYouTube(query: string, apiKey: string, career: string): Promise<VideoResult | null> {
  try {
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
        return { videoId, title, thumbnail: item.snippet?.thumbnails?.medium?.url ?? '', query };
      }
    }
    return null;
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  const career = new URL(req.url).searchParams.get('career');
  if (!career) return NextResponse.json({ error: 'Missing career parameter' }, { status: 400 });

  const cacheKey = `career-videos:${career.toLowerCase().trim()}`;

  // Check DB cache first
  try {
    const cached = await prisma.videoCache.findUnique({ where: { cacheKey } });
    if (cached && cached.expiresAt > new Date()) {
      return NextResponse.json(cached.data, {
        headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400' },
      });
    }
  } catch { /* cache miss */ }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return NextResponse.json({ career, videos: [], count: 0 });

  const queries = buildQueries(career);
  const seen = new Set<string>();
  const videos: VideoResult[] = [];

  // Try strict filtered search first
  for (const query of queries) {
    if (videos.length >= 1) break;
    const result = await searchYouTube(query, apiKey, career);
    if (result && !seen.has(result.videoId)) {
      seen.add(result.videoId);
      videos.push(result);
    }
  }

  // Fallback for niche careers — simple search without strict filtering
  if (videos.length === 0) {
    const fallbackQuery = `${career} career explained`;
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(fallbackQuery)}&type=video&maxResults=1&videoDuration=medium&relevanceLanguage=en&key=${apiKey}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const item = data.items?.[0];
        if (item?.id?.videoId) {
          videos.push({ videoId: item.id.videoId, title: item.snippet?.title ?? '', thumbnail: item.snippet?.thumbnails?.medium?.url ?? '', query: fallbackQuery });
        }
      }
    } catch { /* fallback failed */ }
  }

  const response = { career, videos, count: videos.length };

  // Cache in DB for 7 days (only if we found videos)
  if (videos.length > 0) {
    prisma.videoCache.upsert({
      where: { cacheKey },
      create: { cacheKey, data: response as any, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      update: { data: response as any, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    }).catch(() => { /* non-blocking */ });
  }

  return NextResponse.json(response, {
    headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400' },
  });
}
