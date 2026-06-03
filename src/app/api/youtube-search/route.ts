import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { logAndSwallow } from '@/lib/observability';
import {
  videoSearchLocale,
  buildDayInLifeQuery,
  buildEnglishDayInLifeQuery,
  type VideoSearchLocale,
} from '@/lib/video-locale';

/**
 * GET /api/youtube-search?career=Doctor&country=Spain   (preferred)
 * GET /api/youtube-search?q=day+in+the+life+Doctor        (legacy, English)
 *
 * Searches YouTube for a "day in the life" career video and returns up to 5
 * matches. With `career` (+ optional `country`) the search is localized to the
 * user's country language (Spain → Spanish, Norway → Norwegian, else English),
 * falling back to an English search if the localized one finds nothing. The
 * single-video fields (videoId, title) are kept for backward compatibility; the
 * `videos` array is what the UI iterates to cycle through alternatives.
 *
 * Results cached in DB (keyed by language) to conserve API quota.
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

// Relevance filter. YouTube happily returns random videos for niche or
// novel career titles ("Telco Transformation Lead" → generic leadership
// talks). Keep only results whose title actually references the career.
//
// Rule: derive meaningful career tokens from the query (strip the
// "day in the life" prefix, drop tiny/common words), then keep a video
// if its title contains any of those tokens with a word boundary OR the
// full career phrase as a substring. Careers with no meaningful tokens
// after filtering (e.g. "Chef") skip the filter to avoid false negatives.
const QUERY_PREFIX = /^(a\s+)?day\s+in\s+the\s+life\s+(of\s+a\s+|of\s+an\s+|of\s+)?/i;
const CAREER_STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'your', 'you', 'this', 'that',
  'day', 'life', 'role', 'work', 'job',
]);

function extractCareerFromQuery(q: string): string {
  return q.replace(QUERY_PREFIX, '').trim();
}

function careerTokens(career: string): string[] {
  const cleaned = career.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  return cleaned
    .split(/\s+/)
    .filter((t) => t.length >= 4 && !CAREER_STOPWORDS.has(t));
}

function isTitleRelevant(title: string, career: string, tokens: string[]): boolean {
  const t = title.toLowerCase();
  if (t.includes(career.toLowerCase())) return true;
  if (tokens.length === 0) return true; // no meaningful filter → keep
  return tokens.some((tok) => new RegExp(`\\b${tok}\\b`, 'i').test(t));
}

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

/** One raw YouTube search → mapped, id-validated videos (no relevance filter). */
async function fetchYouTubeVideos(
  query: string,
  lang: string,
  region: string | undefined,
  apiKey: string,
): Promise<YouTubeVideo[]> {
  const params = new URLSearchParams({
    part: 'snippet',
    q: query,
    type: 'video',
    maxResults: '5',
    videoDuration: 'medium',
    relevanceLanguage: lang,
    key: apiKey,
  });
  if (region) params.set('regionCode', region);

  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`, { cache: 'no-store' });
  if (!res.ok) {
    console.error('[YouTube Search] API error:', res.status);
    return [];
  }
  const data = await res.json();
  return (data.items ?? [])
    .map((it: { id?: { videoId?: string }; snippet?: { title?: string } }) => ({
      videoId: it.id?.videoId ?? '',
      title: it.snippet?.title ?? null,
    }))
    .filter((v: YouTubeVideo) => Boolean(v.videoId));
}

/** Strict English title-relevance filter — drops loosely-related junk. */
function applyRelevanceFilter(videos: YouTubeVideo[], career: string): YouTubeVideo[] {
  const tokens = careerTokens(career);
  return videos.filter((v) => isTitleRelevant(v.title ?? '', career, tokens));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const careerParam = searchParams.get('career');
  const country = searchParams.get('country');
  const legacyQ = searchParams.get('q');

  // Resolve search inputs. Preferred: `career` (+ optional `country`) drives a
  // country-localized search. Legacy: a raw English `q` (kept for back-compat).
  let career: string;
  let locale: VideoSearchLocale;
  let localizedQuery: string;
  if (careerParam) {
    career = careerParam.trim();
    locale = videoSearchLocale(country);
    localizedQuery = buildDayInLifeQuery(career, country);
  } else if (legacyQ) {
    career = extractCareerFromQuery(legacyQ);
    locale = videoSearchLocale(null); // English
    localizedQuery = legacyQ;
  } else {
    return NextResponse.json({ error: 'Missing career or q parameter' }, { status: 400 });
  }

  // Cache key includes the search language so localized and English results for
  // the same career never clobber each other. `yt2:` prefix kept so the old
  // relevance-filter rollout's cache busting still applies.
  const cacheKey = `yt2:${locale.lang}:${localizedQuery.toLowerCase().trim()}`;

  // Check DB cache. Legacy single-video entries (no `videos[]`) are treated as
  // a miss so the multi-video query runs and replaces them.
  try {
    const cached = await prisma.videoCache.findUnique({ where: { cacheKey } });
    if (cached && cached.expiresAt > new Date()) {
      const d = cached.data as { videos?: unknown[] };
      if (Array.isArray(d?.videos)) {
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
    // 1) Localized search. For non-English we relax the (English) title-token
    //    relevance filter — the career token is English, so it would reject the
    //    Spanish/Norwegian titles we deliberately asked for. We trust
    //    relevanceLanguage + regionCode to keep results on-topic instead.
    const rawLocalized = await fetchYouTubeVideos(localizedQuery, locale.lang, locale.region, apiKey);
    let videos = locale.lang === 'en'
      ? applyRelevanceFilter(rawLocalized, career)
      : rawLocalized;
    let usedFallback = false;

    // 2) English fallback — if the localized search found nothing, fall back to
    //    the English search so a localized user never sees FEWER videos than an
    //    English user would for the same career.
    if (videos.length === 0 && locale.lang !== 'en') {
      const rawEnglish = await fetchYouTubeVideos(buildEnglishDayInLifeQuery(career), 'en', undefined, apiKey);
      videos = applyRelevanceFilter(rawEnglish, career);
      usedFallback = videos.length > 0;
    }

    const result: YouTubeSearchResult = {
      videos,
      videoId: videos[0]?.videoId ?? null,
      title: videos[0]?.title ?? null,
    };

    // Localized hit caches 7 days. An English-fallback result (or an empty miss)
    // caches 1 day so newly-indexed local-language content is picked up sooner.
    const cachePayload = result as unknown as Prisma.InputJsonValue;
    const ttlMs = videos.length > 0 && !usedFallback
      ? 7 * 24 * 60 * 60 * 1000
      : 1 * 24 * 60 * 60 * 1000;
    prisma.videoCache.upsert({
      where: { cacheKey },
      create: { cacheKey, data: cachePayload, expiresAt: new Date(Date.now() + ttlMs) },
      update: { data: cachePayload, expiresAt: new Date(Date.now() + ttlMs) },
    }).catch(logAndSwallow('youtubeSearch:cache:write'));

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400' },
    });
  } catch (error) {
    console.error('[YouTube Search] Error:', error);
    return NextResponse.json(EMPTY_RESULT);
  }
}
