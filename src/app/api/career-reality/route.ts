import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';
import type { RealityCheckResult, RealityVideo, RealityVideoType } from '@/lib/career-reality-types';
import { getAllCareers } from '@/lib/career-pathways';
import { checkRateLimitAsync, RateLimits } from '@/lib/rate-limit';
import { logAndSwallow } from '@/lib/observability';

// OpenAI + YouTube calls can be slow; raise above Vercel's short default.
export const maxDuration = 60;

// Known career titles (lowercased) — only these may trigger an OpenAI /
// YouTube generation. An attacker rotating arbitrary `?career=` values then
// just gets the static fallback, never a paid call. Built once at module load.
const KNOWN_CAREER_TITLES = new Set(
  getAllCareers().map((c) => c.title.toLowerCase().trim()),
);

// Cache keys currently being generated in the background on THIS instance —
// dedupes the work so a client polling every few seconds doesn't kick off a
// fresh OpenAI + YouTube generation on each poll. Best-effort (per-instance).
const inFlightGenerations = new Set<string>();

/**
 * GET /api/career-reality?career=Network+Engineer
 *
 * Returns a structured reality-check payload for the given career:
 *   - AI-generated summary, reality points, and fit signal
 *   - 1–2 scored, curated YouTube videos about the real experience
 *
 * Cached in DB for 7 days.
 */

// ── OpenAI singleton ──

let _openai: OpenAI | null | undefined;
function getOpenAIClient(): OpenAI | null {
  if (_openai !== undefined) return _openai;
  const apiKey = process.env.OPENAI_API_KEY;
  _openai =
    apiKey && apiKey.length > 10 && apiKey.startsWith('sk-') && apiKey !== 'sk-your-openai-api-key-here'
      ? new OpenAI({ apiKey })
      : null;
  return _openai;
}

// ── YouTube video search & scoring ──

interface RawVideo {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  query: string;
  score: number;
}

/**
 * Normalize a career label into clean, query-friendly forms.
 *
 * Career titles in our data often look like:
 *   "Beautician / Makeup Artist (Kosmetolog)"
 *   "Nurse (Sykepleier)"
 *   "Doctor / Physician"
 *
 * For YouTube queries we want a single short English term ("beautician").
 * For title matching we want to accept ANY of the alternate labels
 * (so "Beautician" alone can match, even though the full string also
 * mentions "Makeup Artist").
 */
function normalizeCareer(career: string): { primary: string; alternates: string[] } {
  // Strip parenthetical translations: "Nurse (Sykepleier)" -> "Nurse"
  const withoutParens = career.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
  // Split on "/" or " or " into alternate labels
  const alternates = withoutParens
    .split(/\s*(?:\/|\bor\b)\s*/i)
    .map(s => s.trim())
    .filter(Boolean);
  const primary = alternates[0] ?? career.trim();
  return { primary, alternates };
}

function buildQueries(career: string): string[] {
  const { primary } = normalizeCareer(career);
  return [
    `the harsh reality of being a ${primary}`,
    `what they don't tell you about being a ${primary}`,
    `the worst part of being a ${primary} honest`,
    `struggles of being a ${primary}`,
    `I regret becoming a ${primary}`,
  ];
}

// Hard country reject — anything explicitly tied to a non-Norway
// country in the title or channel makes the video useless for a
// Norwegian youth audience. Norway / Norwegian / Norge / Scandinavia
// stay allowed. We deliberately keep this list broad rather than
// trying to be clever — false negatives are far less harmful than
// recommending an "Indian doctor" video to a Norwegian teen.
const COUNTRY_REJECT_RE =
  /\b(india|indian|usa|u\.s\.a\.|america|american|uk|u\.k\.|britain|british|england|english(?!\s+language)|scotland|scottish|wales|welsh|ireland|irish|canada|canadian|australia|australian|new zealand|kiwi|south africa|south african|nigeria|nigerian|kenya|kenyan|ghana|ghanaian|pakistan|pakistani|bangladesh|sri lanka|sri lankan|china|chinese|japan|japanese|korea|korean|taiwan|taiwanese|philippines|filipino|filipina|vietnam|vietnamese|thailand|thai|malaysia|malaysian|indonesia|indonesian|singapore|hong kong|dubai|uae|saudi|qatar|kuwait|iran|iranian|iraq|israel|israeli|turkey|turkish|egypt|egyptian|morocco|moroccan|brazil|brazilian|mexico|mexican|argentina|argentinian|chile|chilean|colombia|colombian|peru|peruvian|venezuela|venezuelan|france|french|germany|german|spain|spanish|italy|italian|portugal|portuguese|netherlands|dutch|holland|belgium|belgian|switzerland|swiss|austria|austrian|poland|polish|russia|russian|ukraine|ukrainian|romania|romanian|greece|greek|hungary|hungarian|czech|slovakia|slovenia|croatia|croatian|serbia|serbian|bulgaria|finland|finnish|sweden|swedish|denmark|danish|iceland|icelandic)\b/i;

const REJECT_PATTERNS = [
  /\bmov(e|ing) to\b/i, /\bmigrat/i, /\bimmigrat/i, /\bvisa\b/i, /\brelocat/i,
  /\babroad\b/i, /\bdubai\b/i, /\buk\b.*\bvisa\b/i,
  /\bprank\b/i, /\basmr\b/i, /\bcompilation\b/i, /\bmeme\b/i, /\bshorts?\b/i,
  /\breacts?\b/i, /\breaction\b/i, /\bchallenge\b/i, /\bunboxing\b/i,
  /\bpounds?\b/i, /\bweight\b/i, /\bobese\b/i, /\bobesity\b/i, /\boverweight\b/i,
  /\bdiagnos/i, /\bpatient\b/i, /\bsymptoms?\b/i, /\btreatment\b/i,
  /\bbuy now\b/i, /\bdiscount\b/i, /\bcoupon\b/i, /salary negotiation/i,
  /\bgameplay\b/i, /\btrailer\b/i, /\bmusic video\b/i,
  /\bgood morning\b/i, /\bbreaking news\b/i, /\bnews\b.*\binterview\b/i,
  /\binterview\b.*\bnews\b/i, /\bthis morning\b/i, /\blorraine\b/i, /\bgmb\b/i,
  /\bbbc\b.*\bnews\b/i, /\bcnn\b/i, /\bfox news\b/i, /\bnbc\b/i,
  /\bitv\b.*\bnews\b/i, /\bdaily mail\b/i,
  /\binterview with\b/i, /\btalks to\b/i, /\bspeaks to\b/i, /\bsits down with\b/i,
  /\bbest\b.*\b(career|job|tech)\b/i, /\btop\s+\d+\b/i, /\bhighest paying\b/i,
  /\bhow to (get|become|start|land|break)\b/i, /\bstep[- ]by[- ]step\b/i,
  /\btutorial\b/i, /\bfull course\b/i, /\bcertification\b/i,
  /\bresume\b/i, /\bcv\b/i, /\bjob interview\b/i,
  /\br\/\w+/i, /\breddit\b/i, /\bstories\b/i, /\bask reddit\b/i,
  /\bvs\.?\b/i, /\bversus\b/i, /\bor\b.*\bwhich\b/i, /\bshould you become\b/i,
  /\bsalary\b.*\b\d{4}\b/i, /\bhow much\b.*\bmake\b/i, /\bsalary breakdown\b/i,
  // Personal/emotional content that doesn't help the user understand the career
  /\bimposter\b/i, /\bimpostor\b/i, /\banxiety\b/i, /\bdepression\b/i, /\bmental health\b/i,
  /\bcrying\b/i, /\bbreakdown\b/i, /\bpanic\b/i, /\btherapy\b/i, /\btrauma\b/i,
  /\bgrind\b.*\bculture\b/i, /\bhustle\b.*\bculture\b/i, /\btoxic\b.*\bboss\b/i,
  /\bgot fired\b/i, /\blaid off\b/i, /\blayoff\b/i,
  /\bmotivation\b/i, /\bmindset\b/i, /\bmanifest/i, /\baffirmation/i,
];

// Scoring tiers — heavier = more "reality" focused
const STRONG_SIGNALS: [RegExp, string][] = [
  [/\breality\b/i, 'Shows the less glamorous side'],
  [/\btruth\b/i, 'Candid look at what to expect'],
  [/\bharsh\b/i, 'Honest about the challenges'],
  [/\bworst\b/i, 'Reveals the hardest parts'],
  [/\bhardest\b/i, 'Reveals the hardest parts'],
  [/\bstruggl/i, 'Real struggles from experience'],
  [/\bburnout\b/i, 'Honest about the toll it takes'],
  [/\bshouldn'?t\b/i, 'Useful reality check before committing'],
  [/\breasons? not to\b/i, 'Useful reality check before committing'],
  [/\bnobody tells you\b/i, 'Insider perspective most people miss'],
  [/\bwhat they don'?t tell you\b/i, 'Insider perspective most people miss'],
  [/\bnot what you think\b/i, 'Corrects common misconceptions'],
  [/\bdark side\b/i, 'Shows the less glamorous side'],
  [/\bregret/i, 'Important considerations before starting'],
  [/\bmistake/i, 'Lessons learned from experience'],
  [/\bbefore you\b.*\bbecome\b/i, 'What to know before committing'],
  [/\bquit\b/i, 'Why some people leave the profession'],
  [/\bhate\b.*\bjob\b/i, 'Honest frustrations from the field'],
  [/\btoxic\b/i, 'Honest about workplace culture'],
];

const MEDIUM_SIGNALS: [RegExp, string][] = [
  [/\bhonest\b/i, 'Candid first-person perspective'],
  [/\bpros?\b.*\bcons?\b/i, 'Balanced view of trade-offs'],
  [/\bcons?\b.*\bpros?\b/i, 'Balanced view of trade-offs'],
  [/\bworth it\b/i, 'Helps assess if it\'s the right fit'],
  [/\bis it for me\b/i, 'Helps assess if it\'s the right fit'],
  [/\bwhat it'?s (really )?like\b/i, 'First-hand experience of the role'],
  [/\bwhat i (actually )?do\b/i, 'Shows the actual work involved'],
  [/\bwish i knew\b/i, 'Lessons from experience'],
  [/\breal talk\b/i, 'Candid first-person perspective'],
  [/\bday in the life\b/i, 'Shows the actual daily rhythm'],
  [/\bshould you\b/i, 'Helps assess if it\'s the right fit'],
  [/\bbest part\b/i, 'Balanced view of trade-offs'],
  [/\bworst part\b/i, 'Honest about the challenges'],
  [/\blove and hate\b/i, 'Balanced view of trade-offs'],
  [/\bgood and bad\b/i, 'Balanced view of trade-offs'],
];

// "Career context" words — we require at least one of these to appear
// in the title alongside the career label, so a video that just
// happens to mention "doctor" once in passing (e.g. a film clip) is
// rejected, while genuine career-reality content passes.
const CAREER_CONTEXT_RE =
  /\b(career|job|profession|professional|becoming|being|work(ing)?|life|reality|truth|harsh|honest|day in the life|salary|struggl|burnout|advice|tips|experience|interview|i am a|i'm a|as a|why i|year as)\b/i;

function scoreVideo(title: string, career: string): { score: number; whySelected: string; videoType: RealityVideoType } {
  const t = title.toLowerCase();

  // 1. Country reject — fast path. A title or query that pins the
  //    video to a non-Norway country is useless for our audience.
  if (COUNTRY_REJECT_RE.test(title)) return { score: -1, whySelected: '', videoType: 'balanced' };

  // 2. Career label matching. Stricter than before:
  //    - For multi-word labels (e.g. "Healthcare Worker", "Software
  //      Developer") we require AT LEAST 2 of the meaningful words to
  //      appear, so a "Worker" or "Developer" alone never wins.
  //    - For single-word labels ("Doctor", "Nurse") we require the
  //      career word AND at least one CAREER_CONTEXT word — that
  //      blocks unrelated mentions while keeping real content in.
  const { alternates } = normalizeCareer(career);
  const labelMatches = (label: string): boolean => {
    const words = label.toLowerCase().split(/[\s\-/]+/).filter(w => w.length > 3);
    if (words.length === 0) return false;
    const matchCount = words.filter(w => t.includes(w)).length;
    if (words.length === 1) {
      // Single-word career: require the word + a context signal.
      return matchCount >= 1 && CAREER_CONTEXT_RE.test(t);
    }
    // Multi-word: need at least 2 words present (or all of them if
    // the label only has 2 — same outcome).
    return matchCount >= Math.min(2, words.length);
  };
  if (!alternates.some(labelMatches)) return { score: -1, whySelected: '', videoType: 'balanced' };

  // 3. Reject patterns (junk, off-topic, listicles, etc.)
  if (REJECT_PATTERNS.some(p => p.test(title))) return { score: -1, whySelected: '', videoType: 'balanced' };

  let score = 0;
  let bestReason = '';
  let bestWeight = 0;

  for (const [p, reason] of STRONG_SIGNALS) {
    if (p.test(title)) {
      score += 3;
      if (3 > bestWeight) { bestWeight = 3; bestReason = reason; }
    }
  }
  for (const [p, reason] of MEDIUM_SIGNALS) {
    if (p.test(title)) {
      score += 2;
      if (bestWeight === 0) { bestWeight = 2; bestReason = reason; }
    }
  }

  if (score === 0) return { score: -1, whySelected: '', videoType: 'balanced' };

  // Derive video type
  let videoType: RealityVideoType = 'balanced';
  if (/\bday in the life\b/i.test(title)) videoType = 'day_in_the_life';
  else if (/\b(harsh|worst|shouldn'?t|dark side|regret|mistake|reasons? not)\b/i.test(title)) videoType = 'harsh_truth';

  return { score, whySelected: bestReason, videoType };
}

async function searchYouTube(query: string, apiKey: string, career: string): Promise<RawVideo[]> {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=10&videoDuration=medium&relevanceLanguage=en&key=${apiKey}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.items?.length) return [];

    const results: RawVideo[] = [];
    for (const item of data.items) {
      const videoId = item.id?.videoId;
      const title = item.snippet?.title ?? '';
      const channel = item.snippet?.channelTitle ?? '';
      if (!videoId) continue;
      // Channel-level country reject — some channels are explicitly
      // tied to a non-Norway country (e.g. "BeerBiceps" / India,
      // "Doctor Mike" / USA) even when the title is neutral.
      if (COUNTRY_REJECT_RE.test(channel)) continue;
      const { score, whySelected, videoType } = scoreVideo(title, career);
      if (score > 0) {
        results.push({ videoId, title, channel, thumbnail: item.snippet?.thumbnails?.medium?.url ?? '', query, score });
        // Store whySelected/videoType on the object for later
        (results[results.length - 1] as any)._whySelected = whySelected;
        (results[results.length - 1] as any)._videoType = videoType;
      }
    }
    return results;
  } catch {
    return [];
  }
}

// Keep only videos that can actually be played in our embedded player.
// YouTube's search.list does NOT report embeddability, so a video whose owner
// has disabled off-site playback (status.embeddable === false) or that isn't
// public sails through and renders as "Video unavailable" in the iframe. One
// videos.list?part=status call (1 quota unit, up to 50 ids) tells us which ids
// are safe to show. On any API hiccup we fail OPEN — returning the original
// list rather than blanking the section — and let the player degrade as before.
async function filterEmbeddable(videoIds: string[], apiKey: string): Promise<Set<string>> {
  if (videoIds.length === 0) return new Set();
  try {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=status&id=${videoIds
      .slice(0, 50)
      .join(',')}&key=${apiKey}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return new Set(videoIds); // fail open
    const data = await res.json();
    const playable = new Set<string>();
    for (const item of data.items ?? []) {
      const id = item.id as string | undefined;
      const status = item.status as { embeddable?: boolean; privacyStatus?: string } | undefined;
      if (id && status?.embeddable === true && status.privacyStatus !== 'private') {
        playable.add(id);
      }
    }
    return playable;
  } catch {
    return new Set(videoIds); // fail open
  }
}

// The Understand-tab "Reality" UI shows 3 videos side by side and lets the
// user reveal the rest on demand, so we return a pool rather than just the
// top 1–2. Generated once per career and cached, so the extra YouTube reads
// only happen on a cold miss.
const REALITY_VIDEO_POOL = 8;

async function findBestVideos(career: string): Promise<RealityVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return [];

  const queries = buildQueries(career);
  const seen = new Set<string>();
  const candidates: (RawVideo & { _whySelected: string; _videoType: RealityVideoType })[] = [];

  for (const query of queries) {
    const results = await searchYouTube(query, apiKey, career);
    for (const r of results) {
      if (!seen.has(r.videoId)) {
        seen.add(r.videoId);
        candidates.push(r as any);
      }
    }
    // Stop once we have a healthy pool that includes a strong match — gathers
    // enough to fill the "show more" pool while still bounding API quota.
    if (candidates.length >= REALITY_VIDEO_POOL + 4 && candidates.some(c => c.score >= 5)) break;
  }

  // Fallback for niche careers
  if (candidates.length === 0) {
    const fallbackResults = await searchYouTube(`${career} harsh truth struggles honest`, apiKey, career);
    for (const r of fallbackResults) {
      if (!seen.has(r.videoId)) {
        seen.add(r.videoId);
        candidates.push(r as any);
      }
    }
  }

  // Sort by score descending
  candidates.sort((a, b) => b.score - a.score);

  // Drop anything that can't be embedded (owner disabled off-site playback,
  // private, etc.) so the UI never shows a dead "Video unavailable" tile. Done
  // after scoring/sorting but before the pool slice, so non-playable leads
  // don't crowd out playable clips. Fails open if the status call errors.
  const playable = await filterEmbeddable(candidates.map(c => c.videoId), apiKey);
  const embeddable = candidates.filter(c => playable.has(c.videoId));

  // Build a pool of up to REALITY_VIDEO_POOL videos: the UI shows 3 and lets
  // the user reveal the rest on demand. All candidates have already passed the
  // rejection + country filters; we keep them ordered by score so the strongest
  // reality clips lead and weaker (but still on-topic) ones fill the pool.
  const selected = embeddable.slice(0, REALITY_VIDEO_POOL);

  // Diversify the lead pair by video type when possible, so the first two
  // shown aren't both (e.g.) "harsh_truth".
  if (selected.length >= 2 && selected[0]._videoType === selected[1]._videoType) {
    const altIdx = selected.findIndex(
      (c, i) => i >= 2 && c._videoType !== selected[0]._videoType && c.videoId !== selected[0].videoId,
    );
    if (altIdx > 1) {
      const tmp = selected[1];
      selected[1] = selected[altIdx];
      selected[altIdx] = tmp;
    }
  }

  return selected.map(v => ({
    videoId: v.videoId,
    title: v.title,
    channel: v.channel,
    thumbnailUrl: v.thumbnail,
    whySelected: v._whySelected,
    videoType: v._videoType,
  }));
}

// ── AI-generated reality summary ──

const REALITY_PROMPT = `You generate concise, honest career reality checks for young people (ages 15-23) exploring careers.

Given a career title, produce a JSON object with:
- "realitySummary": 1-2 sentences. Balanced, calm, honest. What this career is really like beyond the surface. Mention both a positive and a realistic challenge. No hype, no discouragement.
- "realityPoints": Array of 2-3 short bullet strings (each under 60 chars). Specific, grounded truths. Focus on things that surprise or matter — training demands, emotional toll, work patterns, common misconceptions, daily realities.
- "fitSignal": 1 sentence. Who this career genuinely suits — personality traits, interests, strengths. Be specific and helpful, not generic.

Rules:
- Write for a 16-year-old reading level.
- Be supportive but honest. Never sugar-coat.
- Never use jargon.
- Never use exclamation marks.
- Output ONLY valid JSON, nothing else.`;

interface AiReality {
  realitySummary: string;
  realityPoints: string[];
  fitSignal: string;
}

async function generateRealitySummary(career: string): Promise<AiReality | null> {
  const openai = getOpenAIClient();
  if (!openai) return null;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: REALITY_PROMPT },
        { role: 'user', content: `Career: ${career}` },
      ],
      temperature: 0.6,
      max_tokens: 400,
      response_format: { type: 'json_object' },
    }, { timeout: 25_000 });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (
      typeof parsed.realitySummary === 'string' &&
      Array.isArray(parsed.realityPoints) &&
      typeof parsed.fitSignal === 'string'
    ) {
      return {
        realitySummary: parsed.realitySummary,
        realityPoints: parsed.realityPoints.slice(0, 3),
        fitSignal: parsed.fitSignal,
      };
    }
    return null;
  } catch {
    return null;
  }
}

// ── Fallback summary (no AI) ──

function fallbackSummary(career: string): AiReality {
  return {
    realitySummary: `${career} can be rewarding work, but it comes with real demands that are worth understanding before you commit.`,
    realityPoints: [
      'Research the training path carefully',
      'Talk to someone already in the role',
      'Consider the day-to-day, not just the highlights',
    ],
    fitSignal: `Best suited to people who are genuinely curious about what ${career.toLowerCase()} involves and willing to invest the time to get there.`,
  };
}

// ── Route handler ──

export async function GET(req: NextRequest) {
  // Auth + rate limit: this endpoint can trigger paid OpenAI + YouTube calls,
  // so it must not be anonymously reachable. Without these, an attacker could
  // rotate `?career=` values to bypass the cache and run up an unbounded bill.
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const rl = await checkRateLimitAsync(`career-reality:${session.user.id}`, RateLimits.AI_CHAT);
  if (!rl.success) {
    return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
  }

  const career = new URL(req.url).searchParams.get('career');
  if (!career) return NextResponse.json({ error: 'Missing career parameter' }, { status: 400 });

  // v4: now drops non-embeddable videos (owner disabled off-site playback /
  // private) that previously rendered as "Video unavailable". Bumping the
  // version invalidates v3 entries that may still hold those dead videos.
  const cacheKey = `career-reality:v4:${career.toLowerCase().trim()}`;

  // Check DB cache
  try {
    const cached = await prisma.videoCache.findUnique({ where: { cacheKey } });
    if (cached && cached.expiresAt > new Date()) {
      return NextResponse.json(cached.data, {
        headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400' },
      });
    }
  } catch { /* cache miss */ }

  // Only spend on OpenAI/YouTube for careers that exist in the catalogue.
  // Unknown labels get the free static fallback (and are not cached, so they
  // can't be used to poison the cache table either).
  if (!KNOWN_CAREER_TITLES.has(career.toLowerCase().trim())) {
    return NextResponse.json(
      {
        career,
        ...fallbackSummary(career),
        videos: [],
      } satisfies RealityCheckResult,
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }

  // Cold cache. The AI summary + YouTube search take ~5-15s, which previously
  // blocked the whole request (and the Understand "Reality" tab) for that long.
  // Instead: kick off the generation in the BACKGROUND (Next `after()` keeps it
  // alive after the response is sent) and return immediately with a `pending`
  // flag. The client shows curated/placeholder content and polls until the
  // generated result is cached. Deduped per-instance so polling doesn't spawn
  // repeated generations.
  if (!inFlightGenerations.has(cacheKey)) {
    inFlightGenerations.add(cacheKey);
    after(async () => {
      let generated: RealityCheckResult;
      try {
        const [aiResult, videos] = await Promise.all([
          generateRealitySummary(career),
          findBestVideos(career),
        ]);
        const summary = aiResult ?? fallbackSummary(career);
        generated = {
          career,
          realitySummary: summary.realitySummary,
          realityPoints: summary.realityPoints,
          fitSignal: summary.fitSignal,
          videos,
        };
      } catch (err) {
        // Always write SOMETHING so the client's poll terminates.
        logAndSwallow('careerReality:bg-generate')(err);
        generated = { career, ...fallbackSummary(career), videos: [] };
      }
      // Cache 7 days when we found videos; 1 hour otherwise (e.g. YouTube quota
      // exhausted) so it retries soon rather than locking in a thin result.
      const ttl = generated.videos.length > 0 ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000;
      try {
        await prisma.videoCache.upsert({
          where: { cacheKey },
          create: { cacheKey, data: generated as any, expiresAt: new Date(Date.now() + ttl) },
          update: { data: generated as any, expiresAt: new Date(Date.now() + ttl) },
        });
      } catch (err) {
        logAndSwallow('careerReality:cache:write')(err);
      } finally {
        inFlightGenerations.delete(cacheKey);
      }
    });
  }

  return NextResponse.json(
    {
      career,
      ...fallbackSummary(career),
      videos: [],
      pending: true,
    } satisfies RealityCheckResult,
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
