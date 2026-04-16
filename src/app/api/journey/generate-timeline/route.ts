export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';
import { checkRateLimitAsync, getRateLimitHeaders, RateLimits } from '@/lib/rate-limit';
import { generateFallbackTimeline, type EducationStage } from '@/lib/journey/generate-fallback-timeline';
import { enrichFirstRoleStep } from '@/lib/journey/enrich-first-role';
import { buildPromptRules } from '@/lib/journey/roadmap-rules';
import type { Journey } from '@/lib/journey/career-journey-types';

// ============================================
// OPENAI CLIENT (singleton)
// ============================================

let _openai: OpenAI | null | undefined;
function getOpenAIClient(): OpenAI | null {
  if (_openai !== undefined) return _openai;
  const apiKey = process.env.OPENAI_API_KEY;
  _openai = apiKey && apiKey.length > 10 && apiKey.startsWith('sk-') && apiKey !== 'sk-your-openai-api-key-here'
    ? new OpenAI({ apiKey })
    : null;
  return _openai;
}

// ============================================
// COMPACT PROMPT (fewer tokens = faster)
// ============================================

// Rules section is built from the shared rules engine so the prompt and
// the client sanitiser stay in sync. See src/lib/journey/roadmap-rules.ts.
const SYSTEM_PROMPT = `Career timeline generator for youth (15-23). Output ONLY valid JSON.

ROADMAP RULES (all mandatory):
${buildPromptRules()}

JSON SHAPE: {"career":"str","startAge":N,"startYear":N,"items":[{"stage":"foundation"|"education"|"certification"|"experience"|"career","title":"str","subtitle":"str","startAge":N,"endAge":N|null,"isMilestone":bool,"icon":"Sparkles"|"Wrench"|"GraduationCap"|"BookOpen"|"Briefcase"|"FolderOpen"|"Award"|"Target","description":"str","microActions":["str","str"]}],"schoolTrack":[{"stage":"str","title":"str","subjects":["str"],"personalLearning":"str","startAge":N,"endAge":N|null}]}

OUTPUT REQUIREMENTS:
- Generate 7-8 items + 4 schoolTrack items.
- The first item must have startAge equal to the user's current age — UNLESS that first item represents entering higher education (university/bachelor/master/profesjonsstudium/fagskole), in which case it MUST have startAge >= 18 even if the user is currently 15, 16 or 17. In Norway, university admission opens only from age 18 — model a brief wait if needed. Apprenticeships and fagbrev (læretid) are exempt and may start at 17.
- KEEP SUBTITLES TO ONE SHORT LINE OR OMIT THEM. Subtitles must never repeat the career name either.
- Be encouraging but honest about time commitment.`;

// ============================================
// VALIDATION
// ============================================

function isValidJourney(data: unknown): data is Omit<Journey, 'id'> {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  if (typeof obj.career !== 'string') return false;
  if (typeof obj.startAge !== 'number') return false;
  if (!Array.isArray(obj.items) || obj.items.length < 5) return false;
  const validStages = ['foundation', 'education', 'certification', 'experience', 'career'];
  for (const item of obj.items) {
    if (!item || typeof item !== 'object') return false;
    const i = item as Record<string, unknown>;
    if (typeof i.title !== 'string' || typeof i.stage !== 'string' || !validStages.includes(i.stage)) return false;
  }
  return true;
}

// ============================================
// POST /api/journey/generate-timeline
// ============================================

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'YOUTH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const career = typeof body.career === 'string' ? body.career.trim() : '';
    if (career.length < 2 || career.length > 100) {
      return NextResponse.json({ error: 'Career must be between 2 and 100 characters' }, { status: 400 });
    }

    // Parallel: fetch user age + cached timeline + education context
    // + foundation card data + rate limit check
    const [userData, profile, rateLimit] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { dateOfBirth: true },
      }),
      prisma.youthProfile.findUnique({
        where: { userId: session.user.id },
        select: { generatedTimeline: true, journeySummary: true, foundationCardData: true },
      }),
      checkRateLimitAsync(`timeline:${session.user.id}`, RateLimits.TIMELINE_GENERATION),
    ]);

    const userAge = userData?.dateOfBirth
      ? Math.floor((Date.now() - new Date(userData.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : 16;

    // Education stage drives which steps get generated. Pull it from
    // the saved education context (set via the Foundation card). The
    // request body can override it for explicit regeneration.
    const summary = (profile?.journeySummary as Record<string, unknown> | null) || null;
    const ctx = summary?.educationContext as { stage?: string; expectedCompletion?: string } | undefined;
    // Prefer body.expectedCompletion (fresher — just saved) over the DB snapshot.
    const expectedCompletion =
      typeof body.expectedCompletion === 'string' && body.expectedCompletion.trim()
        ? body.expectedCompletion.trim()
        : typeof ctx?.expectedCompletion === 'string' ? ctx.expectedCompletion.trim() : '';
    const validStages: EducationStage[] = ['school', 'college', 'university', 'other'];
    const bodyStage = typeof body.educationStage === 'string' ? body.educationStage : undefined;
    const educationStage: EducationStage | undefined =
      (bodyStage && validStages.includes(bodyStage as EducationStage))
        ? (bodyStage as EducationStage)
        : (ctx?.stage && validStages.includes(ctx.stage as EducationStage))
          ? (ctx.stage as EducationStage)
          : undefined;

    // Foundation completion drives whether we drop the leading
    // education steps. Body wins over DB so toggling Complete in the
    // UI gives an instant fresh roadmap.
    const foundationData = (profile?.foundationCardData as { status?: string } | null) || null;
    const foundationCompleteFromBody = typeof body.foundationComplete === 'boolean'
      ? body.foundationComplete
      : undefined;
    const foundationComplete = foundationCompleteFromBody ?? (foundationData?.status === 'done');

    // The strings we use to namespace caches — undefined stage falls
    // back to "default" so legacy users keep their existing cache key.
    const stageKey = educationStage ?? 'default';
    const completeKey = foundationComplete ? 'done' : 'open';

    // Extract the 4-digit year from expectedCompletion (accepts "2034",
    // "June 2034", "Spring 2034", "2034-06", etc.) — mirrors the parser
    // in generate-fallback-timeline.ts. Part of the cache key below, so
    // changing the finish year on the Foundation card invalidates the
    // cached timeline and forces regeneration. Previously absent,
    // which caused the roadmap to ignore new finish-year values.
    const finishYearKey = ((): string => {
      const match = expectedCompletion.match(/(20\d{2})/);
      return match ? match[1] : 'none';
    })();

    // Check per-user cache first — must match career, age, stage,
    // foundation completion, expected finish year AND version. The
    // version stamp invalidates old cached timelines when roadmap
    // rules change (currently v2 = no-university-before-18).
    const ROADMAP_CACHE_VERSION = 'v3';
    if (profile?.generatedTimeline) {
      const cached = profile.generatedTimeline as { version?: string; career?: string; stage?: string; complete?: string; finish?: string; journey?: Journey };
      if (
        (cached.version ?? 'v1') === ROADMAP_CACHE_VERSION &&
        cached.career?.toLowerCase() === career.toLowerCase() &&
        cached.journey &&
        cached.journey.startAge === userAge &&
        (cached.stage ?? 'default') === stageKey &&
        (cached.complete ?? 'open') === completeKey &&
        (cached.finish ?? 'none') === finishYearKey
      ) {
        return NextResponse.json({ journey: cached.journey, cached: true });
      }
    }

    // Check global cache — same career + age + stage + completion + finish year = same timeline.
    // The version suffix invalidates old caches when roadmap rules change
    // (e.g. v2 = no-university-before-18 enforcement). Bump on rule changes
    // that alter timeline shape in ways the client sanitiser cannot fix
    // retroactively.
    const globalCacheKey = `timeline:v2:${career.toLowerCase().trim()}:age${userAge}:stage${stageKey}:${completeKey}:finish${finishYearKey}`;
    try {
      const globalCached = await prisma.videoCache.findUnique({ where: { cacheKey: globalCacheKey } });
      if (globalCached && globalCached.expiresAt > new Date()) {
        const cachedData = globalCached.data as Record<string, unknown> | null;
        const cachedJourney = (cachedData as { journey?: Journey })?.journey;
        if (cachedJourney) {
          // Save to per-user cache too (non-blocking)
          prisma.youthProfile.update({
            where: { userId: session.user.id },
            data: { generatedTimeline: JSON.parse(JSON.stringify({ career, generatedAt: new Date().toISOString(), journey: cachedJourney })) },
          }).catch(() => {});
          return NextResponse.json({ journey: cachedJourney, cached: true });
        }
      }
    } catch { /* global cache miss */ }

    // Rate limit
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many timeline generations. Please try again later.', ...getRateLimitHeaders(rateLimit.limit, rateLimit.remaining, rateLimit.reset) },
        { status: 429 }
      );
    }

    // Generate timeline via AI (synchronous — Vercel kills function after response)
    let journey: Journey;
    const openai = getOpenAIClient();

    // Stage-specific instruction we append to the user prompt so the AI
    // knows where the user is starting from. The system prompt covers
    // the school case implicitly; these notes correct it for everyone else.
    const stageInstruction = educationStage === 'university'
      ? ' The user is ALREADY at university — DO NOT include "Complete Videregående". Start the timeline at their current university studies and graduate roughly 3 years from their current age.'
      : educationStage === 'college'
        ? ' The user is ALREADY in vocational/college (fagskole) training — DO NOT include "Complete Videregående". Start at their current programme. Use vocational language (fagbrev, apprenticeship) rather than degree language.'
        : educationStage === 'other'
          ? ' The user is NOT currently in formal education (gap year, self-taught, working, or undeclared). DO NOT include school or university completion steps. Start the timeline at the experience phase — entry-level work, portfolio building, and any qualifications they\'ll pick up along the way.'
          : '';

    // Foundation-complete instruction — tells the AI the user has
    // already finished their current education stage, so any
    // "in-progress" or "graduate" step for that stage must be skipped.
    const completeInstruction = foundationComplete
      ? educationStage === 'university'
        ? ' The user has ALREADY GRADUATED from university — DO NOT include "Continue studying" or "Graduate". Start the timeline at their first entry-level job, anchored to their current age.'
        : educationStage === 'college'
          ? ' The user has ALREADY COMPLETED their vocational training (fagbrev/diploma earned) — DO NOT include in-progress training or qualification steps. Start the timeline at their first entry-level role, anchored to their current age.'
          : educationStage === 'school'
            ? ' The user has ALREADY COMPLETED Videregående — DO NOT include "Complete Videregående". Start the timeline at the next education or work step, anchored to their current age.'
            : ' The user has marked their foundation as complete — assume they are ready to enter the workforce immediately. Start the timeline at the experience phase, anchored to their current age.'
      : '';

    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `Career: ${career}. Age: ${userAge}. Start year: ${new Date().getFullYear()}.${expectedCompletion ? ` The user expects to finish their current education stage in ${expectedCompletion} — anchor the first post-foundation step to start in the SAME year (e.g. they finish school in summer 2027 and begin university in autumn 2027, same age).` : ''}${stageInstruction}${completeInstruction}` },
          ],
          temperature: 0.7,
          max_tokens: 1200,
          response_format: { type: 'json_object' },
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) throw new Error('Empty response');

        const parsed = JSON.parse(content);
        if (!isValidJourney(parsed)) throw new Error('Invalid structure');

        const clampAge = (age: number) => Math.max(age, userAge);

        journey = {
          id: `ai-${career.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
          career: parsed.career,
          startAge: userAge,
          startYear: parsed.startYear || new Date().getFullYear(),
          items: parsed.items.map((item: Omit<Journey['items'][number], 'id'>, i: number) => ({
            id: `ai-${i}-${Math.random().toString(36).slice(2, 7)}`,
            ...item,
            startAge: clampAge(item.startAge),
            endAge: item.endAge ? clampAge(item.endAge) : item.endAge,
          })),
          schoolTrack: Array.isArray(parsed.schoolTrack)
            ? (parsed.schoolTrack as unknown as Record<string, unknown>[]).map((st, i) => ({
                id: `st-${i}-${Math.random().toString(36).slice(2, 7)}`,
                stage: st.stage as 'foundation' | 'education' | 'certification' | 'experience' | 'career',
                title: (st.title as string) || '',
                subjects: Array.isArray(st.subjects) ? st.subjects as string[] : [],
                personalLearning: (st.personalLearning as string) || undefined,
                startAge: clampAge((st.startAge as number) || userAge),
                endAge: (st.endAge as number) ? clampAge(st.endAge as number) : undefined,
              }))
            : undefined,
        };
        // Inject the curated first-role suggestion (role title + why)
        // into the entry-level step so the AI path matches the fallback
        // path's behaviour. The LLM shouldn't invent employer/role copy —
        // this is grounded in career-requirements.json.
        journey = enrichFirstRoleStep(journey);
      } catch (aiError) {
        console.error('[Timeline] OpenAI failed, using fallback:', aiError);
        journey = generateFallbackTimeline(career, userAge, educationStage, foundationComplete, expectedCompletion);
      }
    } else {
      journey = generateFallbackTimeline(career, userAge, educationStage, foundationComplete, expectedCompletion);
    }

    // Cache result (non-blocking) — stamp the version, stage,
    // completion AND finish year so future requests cleanly miss the
    // cache when any of them changes.
    const cacheData = JSON.parse(JSON.stringify({ version: ROADMAP_CACHE_VERSION, career, stage: stageKey, complete: completeKey, finish: finishYearKey, generatedAt: new Date().toISOString(), journey }));
    prisma.youthProfile.update({
      where: { userId: session.user.id },
      data: { generatedTimeline: cacheData },
    }).catch(() => {});
    prisma.videoCache.upsert({
      where: { cacheKey: globalCacheKey },
      create: { cacheKey: globalCacheKey, data: JSON.parse(JSON.stringify({ journey })), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      update: { data: JSON.parse(JSON.stringify({ journey })), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    }).catch(() => {});

    return NextResponse.json({ journey, cached: false });
  } catch (error) {
    console.error('[Timeline] Unexpected error:', error);
    return NextResponse.json({ error: 'Failed to generate timeline' }, { status: 500 });
  }
}
