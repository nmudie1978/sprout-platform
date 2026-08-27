import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { checkRateLimitAsync, RateLimits } from '@/lib/rate-limit';
import { logAndSwallow } from '@/lib/observability';
import {
  videoSearchLocale,
  buildDayInLifeQuery,
  buildEnglishDayInLifeQuery,
  buildEnglishExplainerQuery,
  broadenCareer,
  normaliseCareerSpelling,
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
  // Normalise spelling (programme → program) so a British catalogue title's
  // tokens match the American-spelled video titles that dominate YouTube.
  const cleaned = normaliseCareerSpelling(career.toLowerCase()).replace(/[^a-z0-9\s]/g, ' ');
  return cleaned
    .split(/\s+/)
    .filter((t) => t.length >= 4 && !CAREER_STOPWORDS.has(t));
}

function isTitleRelevant(title: string, career: string, tokens: string[]): boolean {
  const t = normaliseCareerSpelling(title.toLowerCase());
  if (t.includes(normaliseCareerSpelling(career.toLowerCase()))) return true;
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

// Upstream budget per YouTube call. A career can trigger up to 4 of them, and
// this route has no `maxDuration` override, so an unbounded fetch against a
// slow/black-holed upstream burns the whole function budget and 504s.
const YOUTUBE_FETCH_TIMEOUT_MS = 6000;

/**
 * One raw YouTube search → mapped, id-validated videos (no relevance filter).
 *
 * `failed` distinguishes "YouTube said there is nothing" from "we never got an
 * answer" — the caller must not cache the latter as an empty result.
 */
async function fetchYouTubeVideos(
  query: string,
  lang: string,
  region: string | undefined,
  apiKey: string,
): Promise<{ videos: YouTubeVideo[]; failed: boolean }> {
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

  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(YOUTUBE_FETCH_TIMEOUT_MS),
    });
    if (!res.ok) {
      // 403 here is usually quota exhaustion — transient, and must not be
      // cached as "this career has no videos".
      console.error('[YouTube Search] API error:', res.status);
      return { videos: [], failed: true };
    }
    const data = await res.json();
    const videos = (data.items ?? [])
      .map((it: { id?: { videoId?: string }; snippet?: { title?: string } }) => ({
        videoId: it.id?.videoId ?? '',
        title: it.snippet?.title ?? null,
      }))
      .filter((v: YouTubeVideo) => Boolean(v.videoId));
    return { videos, failed: false };
  } catch (error) {
    console.error('[YouTube Search] Upstream fetch failed:', error);
    return { videos: [], failed: true };
  }
}

/** Strict English title-relevance filter — drops loosely-related junk. */
function applyRelevanceFilter(videos: YouTubeVideo[], career: string): YouTubeVideo[] {
  const tokens = careerTokens(career);
  return videos.filter((v) => isTitleRelevant(v.title ?? '', career, tokens));
}

/** Merge several video lists, de-duping by videoId, preserving order. */
function mergeVideos(...lists: YouTubeVideo[][]): YouTubeVideo[] {
  const seen = new Set<string>();
  const out: YouTubeVideo[] = [];
  for (const list of lists) {
    for (const v of list) {
      if (v.videoId && !seen.has(v.videoId)) {
        seen.add(v.videoId);
        out.push(v);
      }
    }
  }
  return out;
}

export async function GET(req: NextRequest) {
  // Auth: this endpoint triggers paid YouTube Data API calls, so it must not be
  // anonymously reachable. (The rate limit is applied LATER — only on a cache
  // miss — so normal browsing of already-cached careers is never blocked.)
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

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

  // Cache MISS → we're about to make paid YouTube API calls, so apply the rate
  // limit HERE rather than before the cache. Browsing already-cached careers
  // (the popular ones — nurse, firefighter, etc.) is never blocked; the limit
  // still guards the only thing that costs money: an attacker (or heavy run)
  // rotating to fresh, uncached `?career=` values.
  const rl = await checkRateLimitAsync(`youtube-search:${session.user.id}`, RateLimits.AI_CHAT);
  if (!rl.success) {
    return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    // Loud: this silently blanks the Day-in-the-Life panel for EVERY career,
    // and nothing else in the app surfaces it (there is no env validation for
    // this key). Return empty without caching, so it self-heals on config fix.
    console.error(
      '[YouTube Search] YOUTUBE_API_KEY is not set — every career will show ' +
      '"No videos found". Set it in the deployment environment.',
    );
    return NextResponse.json(EMPTY_RESULT);
  }

  // Any failed upstream call makes this response untrustworthy as a cache
  // entry: caching an empty result from a quota blip or timeout "poisons" the
  // career until expiry (see the empty-TTL note below).
  let upstreamFailed = false;

  try {
    // 1) Localized search. For non-English we relax the (English) title-token
    //    relevance filter — the career token is English, so it would reject the
    //    Spanish/Norwegian titles we deliberately asked for. We trust
    //    relevanceLanguage + regionCode to keep results on-topic instead.
    const localized = await fetchYouTubeVideos(localizedQuery, locale.lang, locale.region, apiKey);
    upstreamFailed ||= localized.failed;
    let videos = locale.lang === 'en'
      ? applyRelevanceFilter(localized.videos, career)
      : localized.videos;
    let usedFallback = false;

    // 2) English fallback — if the localized search found nothing, fall back to
    //    the English search so a localized user never sees FEWER videos than an
    //    English user would for the same career.
    if (videos.length === 0 && locale.lang !== 'en') {
      const english = await fetchYouTubeVideos(buildEnglishDayInLifeQuery(career), 'en', undefined, apiKey);
      upstreamFailed ||= english.failed;
      videos = applyRelevanceFilter(english.videos, career);
      usedFallback = videos.length > 0;
    }

    // 3) Explainer formats — "what does a X do" surfaces the explainer-style
    //    videos ("what is a X / role of a X / X responsibilities") that the
    //    day-in-the-life query under-returns, especially for office/managerial
    //    roles with few vlogs. English only (so localized results stay
    //    localized). Merged in to supplement when results are thin; one extra
    //    call per career, cached for a week.
    if (locale.lang === 'en' && videos.length < 5) {
      const explainer = await fetchYouTubeVideos(buildEnglishExplainerQuery(career), 'en', undefined, apiKey);
      upstreamFailed ||= explainer.failed;
      videos = mergeVideos(videos, applyRelevanceFilter(explainer.videos, career));
    }

    // 4) Broaden niche/qualified titles when still empty: "IT Programme Manager"
    //    → "Program Manager". Strips a leading qualifier + normalises spelling,
    //    then tries both day-in-the-life and explainer for the broader term.
    if (videos.length === 0) {
      const broad = broadenCareer(career);
      if (broad) {
        const [broadDay, broadEx] = await Promise.all([
          fetchYouTubeVideos(buildEnglishDayInLifeQuery(broad), 'en', undefined, apiKey),
          fetchYouTubeVideos(buildEnglishExplainerQuery(broad), 'en', undefined, apiKey),
        ]);
        upstreamFailed ||= broadDay.failed || broadEx.failed;
        videos = mergeVideos(
          applyRelevanceFilter(broadDay.videos, broad),
          applyRelevanceFilter(broadEx.videos, broad),
        );
        usedFallback = usedFallback || videos.length > 0;
      }
    }

    videos = videos.slice(0, 6);

    const result: YouTubeSearchResult = {
      videos,
      videoId: videos[0]?.videoId ?? null,
      title: videos[0]?.title ?? null,
    };

    // TTL by result quality:
    //  - Empty result → 1 HOUR only. An empty is almost always a transient
    //    miss (a quota blip, an API hiccup, a moment during a deploy). The
    //    cache-read treats an empty `videos: []` as a hit, so a long TTL here
    //    "poisons" the career — users see no videos with no retry until expiry.
    //    A short TTL still throttles re-fetches but lets it self-heal in ~1h
    //    instead of 24h. (See: IT Programme Manager / nurse / firefighter were
    //    all stuck empty for a day.)
    //  - English-fallback hit → 1 day (so newly-indexed local content is found).
    //  - Localized hit → 7 days.
    // Don't cache an empty result we never actually got an answer for — a
    // quota 403 or an upstream timeout would otherwise be stored as fact and
    // served to every visitor of that career until it expires. Retry next view.
    const cacheable = videos.length > 0 || !upstreamFailed;
    const cachePayload = result as unknown as Prisma.InputJsonValue;
    const ttlMs = videos.length === 0
      ? 60 * 60 * 1000
      : usedFallback
      ? 1 * 24 * 60 * 60 * 1000
      : 7 * 24 * 60 * 60 * 1000;
    if (cacheable) {
      // AWAIT the write. This runs as a serverless function, so anything still
      // pending when the response is flushed may never run — the instance can
      // be frozen or reclaimed immediately. A dropped write here isn't a lost
      // optimisation: the next view of this career repeats 2-4 YouTube searches
      // at 100 quota units each against one 10k/day key, which is the exact
      // pressure that poisoned the cache in #282. One DB round-trip on the
      // (rare) miss path is nothing next to the upstream calls we just made.
      // `.catch()` keeps a write failure from ever costing the user their
      // videos. Matches career-reality/route.ts, which writes the same table.
      await prisma.videoCache.upsert({
        where: { cacheKey },
        create: { cacheKey, data: cachePayload, expiresAt: new Date(Date.now() + ttlMs) },
        update: { data: cachePayload, expiresAt: new Date(Date.now() + ttlMs) },
      }).catch(logAndSwallow('youtubeSearch:cache:write'));
    }

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400' },
    });
  } catch (error) {
    console.error('[YouTube Search] Error:', error);
    return NextResponse.json(EMPTY_RESULT);
  }
}
