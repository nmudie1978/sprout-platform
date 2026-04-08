import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';
import type { RealityCheckResult, RealityVideo, RealityVideoType } from '@/lib/career-reality-types';

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
  /\bbest\b.*\b(career|job|tech)\b/i, /\btop\s+\d+\b/i, /\bhighest paying\b/i,
  /\bhow to (get|become|start|land|break)\b/i, /\bstep[- ]by[- ]step\b/i,
  /\btutorial\b/i, /\bfull course\b/i, /\bcertification\b/i,
  /\bresume\b/i, /\bcv\b/i, /\bjob interview\b/i,
  /\br\/\w+/i, /\breddit\b/i, /\bstories\b/i, /\bask reddit\b/i,
  /\bvs\.?\b/i, /\bversus\b/i, /\bor\b.*\bwhich\b/i, /\bshould you become\b/i,
  /\bsalary\b.*\b\d{4}\b/i, /\bhow much\b.*\bmake\b/i, /\bsalary breakdown\b/i,
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

function scoreVideo(title: string, career: string): { score: number; whySelected: string; videoType: RealityVideoType } {
  const t = title.toLowerCase();
  // Accept the title if ANY one of the career's alternate labels has 60% of its
  // words present. This still blocks "Interior Designer" matching "Graphic Designer"
  // (because "interior" must appear) while allowing "Beautician" to match the
  // career "Beautician / Makeup Artist (Kosmetolog)" via its first label.
  const { alternates } = normalizeCareer(career);
  const labelMatches = (label: string): boolean => {
    const words = label.toLowerCase().split(/[\s\\-]+/).filter(w => w.length > 3);
    if (words.length === 0) return false;
    const matchCount = words.filter(w => t.includes(w)).length;
    const threshold = words.length > 1 ? Math.ceil(words.length * 0.6) : 1;
    return matchCount >= threshold;
  };
  if (!alternates.some(labelMatches)) return { score: -1, whySelected: '', videoType: 'balanced' };
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
    // Strong match found — save API quota
    if (candidates.some(c => c.score >= 5)) break;
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

  // Take up to 2, but only if the second video is genuinely strong (score >= 3)
  const selected = candidates.slice(0, 2).filter((c, i) => i === 0 || c.score >= 3);

  // Try to diversify video types — if both are same type and there's an alternative, swap #2
  if (selected.length === 2 && selected[0]._videoType === selected[1]._videoType) {
    const alt = candidates.find(c => c._videoType !== selected[0]._videoType && c.score >= 3 && c.videoId !== selected[0].videoId);
    if (alt) selected[1] = alt;
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
    });

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
  const career = new URL(req.url).searchParams.get('career');
  if (!career) return NextResponse.json({ error: 'Missing career parameter' }, { status: 400 });

  const cacheKey = `career-reality:${career.toLowerCase().trim()}`;

  // Check DB cache
  try {
    const cached = await prisma.videoCache.findUnique({ where: { cacheKey } });
    if (cached && cached.expiresAt > new Date()) {
      return NextResponse.json(cached.data, {
        headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400' },
      });
    }
  } catch { /* cache miss */ }

  // Generate summary + find videos in parallel
  const [aiResult, videos] = await Promise.all([
    generateRealitySummary(career),
    findBestVideos(career),
  ]);

  const summary = aiResult ?? fallbackSummary(career);

  const response: RealityCheckResult = {
    career,
    realitySummary: summary.realitySummary,
    realityPoints: summary.realityPoints,
    fitSignal: summary.fitSignal,
    videos,
  };

  // Cache for 7 days — but only if we found videos.
  // If videos are empty (e.g. YouTube quota exhausted), use a short 1-hour cache
  // so it retries soon rather than locking in a bad result for a week.
  const ttl = videos.length > 0 ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000;
  prisma.videoCache.upsert({
    where: { cacheKey },
    create: { cacheKey, data: response as any, expiresAt: new Date(Date.now() + ttl) },
    update: { data: response as any, expiresAt: new Date(Date.now() + ttl) },
  }).catch(() => { /* non-blocking */ });

  // Shorter edge cache when videos are missing so retries happen sooner
  const edgeTtl = videos.length > 0 ? 86400 : 300;
  return NextResponse.json(response, {
    headers: { 'Cache-Control': `public, s-maxage=${edgeTtl}, stale-while-revalidate=${edgeTtl}` },
  });
}
