export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';
import { checkRateLimitAsync, getRateLimitHeaders, RateLimits } from '@/lib/rate-limit';
import { generateFallbackTimeline, type EducationStage } from '@/lib/journey/generate-fallback-timeline';
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

const SYSTEM_PROMPT = `Career timeline generator for youth (15-23). Output ONLY valid JSON.

REALISTIC CAREER PROGRESSION (MANDATORY ORDER):
1. FOUNDATION (ages 16-19): School subjects — videregående (upper secondary) in Norway. Focus on relevant subjects. NO professional certifications at this stage.
2. EDUCATION (ages 19-24): University degree or vocational training (fagbrev). The specific programme that leads to this career. Duration must be realistic (3-6 years for degree, 2+2 for fagbrev).
3. EXPERIENCE (ages 22-28): Always include TWO distinct steps for getting into work — first an "Apply for entry-level X roles" milestone (the job-search phase: CV, applications, interviews), THEN a separate "Entry-level X role" step for the actual job. Never jump from graduation straight into a role without showing the application phase. Then progression to mid-level after 2-3 years.
4. PROFESSIONAL DEVELOPMENT (ages 25+): Professional certifications (e.g. PRINCE2, PMP, CISSP) ONLY after gaining work experience. Never before age 23. Never during school or university.
5. CAREER (ages 28+): Senior role, specialist position, or leadership. Only after 5+ years of work experience.

Generate 7-8 items following this exact order + 4 schoolTrack items.
JSON: {"career":"str","startAge":N,"startYear":N,"items":[{"stage":"foundation"|"education"|"experience"|"career","title":"str","subtitle":"str","startAge":N,"endAge":N|null,"isMilestone":bool,"icon":"Sparkles"|"Wrench"|"GraduationCap"|"BookOpen"|"Briefcase"|"FolderOpen"|"Target","description":"str","microActions":["str","str"]}],"schoolTrack":[{"stage":"str","title":"str","subjects":["str"],"personalLearning":"str","startAge":N,"endAge":N|null}]}

CRITICAL RULES:
- The user's current age is provided. ALL items must have startAge >= the user's current age.
- The first foundation item should start at exactly the user's age.
- NEVER suggest professional certifications (PRINCE2, PMP, AWS, etc.) before age 23 or before completing university.
- NEVER suggest courses outside school/university for anyone under 20.
- School foundation (ages 16-19) should focus ONLY on school subjects relevant to the career.
- Internships come AFTER university, not during school.
- Career progression must be realistic — no one becomes a senior engineer at 22 or a CIO at 25.
- Use Norwegian context: videregående, university names (UiO, NTNU, OsloMet), Norwegian companies.
- Be encouraging but honest about the time commitment required.`;

// ============================================
// VALIDATION
// ============================================

function isValidJourney(data: unknown): data is Omit<Journey, 'id'> {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  if (typeof obj.career !== 'string') return false;
  if (typeof obj.startAge !== 'number') return false;
  if (!Array.isArray(obj.items) || obj.items.length < 5) return false;
  const validStages = ['foundation', 'education', 'experience', 'career'];
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
    const ctx = summary?.educationContext as { stage?: string } | undefined;
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

    // Check per-user cache first — must match career, age, stage AND
    // foundation completion, otherwise toggling Complete on the
    // Foundation card wouldn't visibly change the roadmap.
    if (profile?.generatedTimeline) {
      const cached = profile.generatedTimeline as { career?: string; stage?: string; complete?: string; journey?: Journey };
      if (
        cached.career?.toLowerCase() === career.toLowerCase() &&
        cached.journey &&
        cached.journey.startAge === userAge &&
        (cached.stage ?? 'default') === stageKey &&
        (cached.complete ?? 'open') === completeKey
      ) {
        return NextResponse.json({ journey: cached.journey, cached: true });
      }
    }

    // Check global cache — same career + age + stage + completion = same timeline for all users
    const globalCacheKey = `timeline:${career.toLowerCase().trim()}:age${userAge}:stage${stageKey}:${completeKey}`;
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
            { role: 'user', content: `Career: ${career}. Age: ${userAge}. Start year: ${new Date().getFullYear()}.${stageInstruction}${completeInstruction}` },
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
                stage: st.stage as 'foundation' | 'education' | 'experience' | 'career',
                title: (st.title as string) || '',
                subjects: Array.isArray(st.subjects) ? st.subjects as string[] : [],
                personalLearning: (st.personalLearning as string) || undefined,
                startAge: clampAge((st.startAge as number) || userAge),
                endAge: (st.endAge as number) ? clampAge(st.endAge as number) : undefined,
              }))
            : undefined,
        };
      } catch (aiError) {
        console.error('[Timeline] OpenAI failed, using fallback:', aiError);
        journey = generateFallbackTimeline(career, userAge, educationStage, foundationComplete);
      }
    } else {
      journey = generateFallbackTimeline(career, userAge, educationStage, foundationComplete);
    }

    // Cache result (non-blocking) — stamp the stage AND completion so
    // future requests cleanly miss the cache when either changes.
    const cacheData = JSON.parse(JSON.stringify({ career, stage: stageKey, complete: completeKey, generatedAt: new Date().toISOString(), journey }));
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
