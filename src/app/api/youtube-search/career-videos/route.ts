import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAndSwallow } from '@/lib/observability';

/**
 * GET /api/youtube-search/career-videos?career=Physiotherapist
 *
 * Finds the single best "reality of the job" YouTube video for a career.
 * Uses score-based ranking across multiple search queries to pick the most
 * relevant, honest, reality-focused video — not generic career advice.
 *
 * Results cached in DB for 7 days.
 */

interface VideoResult {
  videoId: string;
  title: string;
  thumbnail: string;
  query: string;
}

interface ScoredVideo extends VideoResult {
  score: number;
}

/* ── Search queries — tightly focused on reality/honest content ── */

function buildQueries(career: string): string[] {
  return [
    `the reality of being a ${career}`,
    `${career} pros and cons`,
    `what they don't tell you about being a ${career}`,
    `is being a ${career} worth it`,
    `the worst part of being a ${career}`,
  ];
}

/* ── Reject patterns — content that is never relevant ── */

const REJECT_PATTERNS = [
  // Geography / immigration
  /\bmov(e|ing) to\b/i, /\bmigrat/i, /\bimmigrat/i, /\bvisa\b/i, /\brelocat/i,
  /\babroad\b/i, /\baustralia\b/i, /\bcanada\b/i, /\bdubai\b/i, /\buk\b.*\bvisa\b/i,
  // Spam / low-quality
  /\bprank\b/i, /\basmr\b/i, /\bcompilation\b/i, /\bmeme\b/i, /\bshorts?\b/i,
  /\breaction\b/i, /\bchallenge\b/i, /\bunboxing\b/i,
  /\bbuy now\b/i, /\bdiscount\b/i, /\bcoupon\b/i, /salary negotiation/i,
  /\bgameplay\b/i, /\btrailer\b/i, /\bmusic video\b/i,
  // News / TV
  /\bgood morning\b/i, /\bbreaking news\b/i, /\bnews\b.*\binterview\b/i,
  /\binterview\b.*\bnews\b/i, /\bthis morning\b/i, /\blorraine\b/i, /\bgmb\b/i,
  /\bbbc\b.*\bnews\b/i, /\bcnn\b/i, /\bfox news\b/i, /\bnbc\b/i,
  /\bitv\b.*\bnews\b/i, /\bdaily mail\b/i,
  /\binterview with\b/i, /\btalks to\b/i, /\bspeaks to\b/i, /\bsits down with\b/i,
  // Promotional / generic career content (not reality-focused)
  /\bbest\b.*\b(career|job|tech)\b/i, /\btop\s+\d+\b/i, /\bhighest paying\b/i,
  /\bhow to (get|become|start|land|break)\b/i, /\bstep[- ]by[- ]step\b/i,
  /\btutorial\b/i, /\bfull course\b/i, /\bcertification\b/i,
  /\bresume\b/i, /\bcv\b/i, /\bjob interview\b/i,
  /\br\/\w+/i, /\breddit\b/i, /\bstories\b/i, /\bask reddit\b/i,
];

/* ── Scoring tiers — heavier weight = more "reality" focused ── */

const STRONG_SIGNALS: RegExp[] = [
  /\breality\b/i, /\btruth\b/i, /\bharsh\b/i,
  /\bworst\b/i, /\bhardest\b/i,
  /\bshouldn'?t\b/i, /\breasons? not to\b/i,
  /\bnobody tells you\b/i, /\bwhat they don'?t tell you\b/i,
  /\bnot what you think\b/i, /\bdark side\b/i,
  /\bregret/i, /\bmistake/i,
  /\bbefore you\b.*\bbecome\b/i,
];

const MEDIUM_SIGNALS: RegExp[] = [
  /\bhonest\b/i, /\bpros?\b.*\bcons?\b/i, /\bcons?\b.*\bpros?\b/i,
  /\bworth it\b/i, /\bis it for me\b/i,
  /\bwhat it'?s (really )?like\b/i, /\bwhat i (actually )?do\b/i,
  /\bwish i knew\b/i, /\breal talk\b/i,
  /\bday in the life\b/i, /\bshould you\b/i,
  /\bbest part\b/i, /\bworst part\b/i,
  /\blove and hate\b/i, /\bgood and bad\b/i,
];

/**
 * Score a video title for "reality" relevance.
 * Returns -1 if the video should be rejected entirely.
 * Returns 0+ with higher = more reality-focused.
 */
function scoreVideo(title: string, career: string): number {
  const t = title.toLowerCase();
  const careerWords = career.toLowerCase().split(/[\s/()\\-]+/).filter(w => w.length > 3);

  // Must mention the career — for multi-word careers, require majority of words
  const matchCount = careerWords.filter(w => t.includes(w)).length;
  const threshold = careerWords.length > 1 ? Math.ceil(careerWords.length * 0.6) : 1;
  if (matchCount < threshold) return -1;

  // Hard reject
  if (REJECT_PATTERNS.some(p => p.test(title))) return -1;

  let score = 0;
  for (const p of STRONG_SIGNALS) if (p.test(title)) score += 3;
  for (const p of MEDIUM_SIGNALS) if (p.test(title)) score += 2;

  // No reality signals at all → not relevant for this section
  if (score === 0) return -1;

  return score;
}

/* ── YouTube search helper ── */

async function searchYouTube(
  query: string,
  apiKey: string,
  career: string,
): Promise<ScoredVideo[]> {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=10&videoDuration=medium&relevanceLanguage=en&key=${apiKey}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.items?.length) return [];

    const results: ScoredVideo[] = [];
    for (const item of data.items) {
      const videoId = item.id?.videoId;
      const title = item.snippet?.title ?? '';
      if (!videoId) continue;
      const score = scoreVideo(title, career);
      if (score > 0) {
        results.push({
          videoId,
          title,
          thumbnail: item.snippet?.thumbnails?.medium?.url ?? '',
          query,
          score,
        });
      }
    }
    return results;
  } catch {
    return [];
  }
}

/* ── Route handler ── */

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
  const candidates: ScoredVideo[] = [];

  // Search queries sequentially, collecting all scored candidates.
  // Stop early if we find a strong match (score >= 5).
  for (const query of queries) {
    const results = await searchYouTube(query, apiKey, career);
    for (const r of results) {
      if (!seen.has(r.videoId)) {
        seen.add(r.videoId);
        candidates.push(r);
      }
    }
    // Strong match found — no need to burn more API quota
    if (candidates.some(c => c.score >= 5)) break;
  }

  // Pick the single best candidate
  candidates.sort((a, b) => b.score - a.score);

  const videos: VideoResult[] = [];
  if (candidates.length > 0) {
    const best = candidates[0];
    videos.push({ videoId: best.videoId, title: best.title, thumbnail: best.thumbnail, query: best.query });
  }

  // Fallback for niche careers — still score-filtered, just with a broader query
  if (videos.length === 0) {
    const fallbackQuery = `${career} career reality honest`;
    const fallbackResults = await searchYouTube(fallbackQuery, apiKey, career);
    if (fallbackResults.length > 0) {
      fallbackResults.sort((a, b) => b.score - a.score);
      const best = fallbackResults[0];
      videos.push({ videoId: best.videoId, title: best.title, thumbnail: best.thumbnail, query: best.query });
    }
  }

  const response = { career, videos, count: videos.length };

  // Cache in DB for 7 days (only if we found videos)
  if (videos.length > 0) {
    prisma.videoCache.upsert({
      where: { cacheKey },
      create: { cacheKey, data: response as any, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      update: { data: response as any, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    }).catch(logAndSwallow('careerVideos:cache:write'));
  }

  return NextResponse.json(response, {
    headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400' },
  });
}
