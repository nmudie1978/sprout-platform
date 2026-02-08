import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';
import { checkRateLimitAsync, getRateLimitHeaders, RateLimits } from '@/lib/rate-limit';
import { generateFallbackTimeline } from '@/lib/journey/generate-fallback-timeline';
import type { Journey } from '@/lib/journey/career-journey-types';

// ============================================
// OPENAI HELPERS (same pattern as /api/chat)
// ============================================

function isOpenAIConfigured(): boolean {
  const apiKey = process.env.OPENAI_API_KEY;
  return !!(
    apiKey &&
    apiKey.length > 10 &&
    apiKey !== 'sk-your-openai-api-key-here' &&
    apiKey.startsWith('sk-')
  );
}

function getOpenAIClient(): OpenAI | null {
  if (!isOpenAIConfigured()) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// ============================================
// SYSTEM PROMPT
// ============================================

const SYSTEM_PROMPT = `You are a career timeline generator for a youth platform (ages 16-20).
Given a career goal, generate a realistic journey with 7 items across 4 stages.

Rules:
- Output ONLY valid JSON matching the schema below
- All text must be in English
- Items should be age-appropriate (starting age 16)
- Include practical, actionable microActions (2-3 per item)
- Be encouraging but realistic
- No jargon or overly complex language

Required JSON schema:
{
  "career": "string (the career title)",
  "startAge": 16,
  "startYear": <current year>,
  "items": [
    {
      "stage": "foundation" | "education" | "experience" | "career",
      "title": "string (short, clear title)",
      "subtitle": "string (brief context)",
      "startAge": number (16-22),
      "endAge": number | null (optional),
      "isMilestone": boolean,
      "icon": "Sparkles" | "Wrench" | "GraduationCap" | "BookOpen" | "Briefcase" | "FolderOpen" | "Target",
      "description": "string (1-2 sentences)",
      "microActions": ["string", "string", "string"]
    }
  ]
}

Distribution: 2 foundation, 2 education, 2 experience, 1 career.
Mark milestone items with isMilestone: true (at least 3 milestones).`;

// ============================================
// VALIDATION
// ============================================

function isValidJourney(data: unknown): data is Omit<Journey, 'id'> {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  if (typeof obj.career !== 'string') return false;
  if (typeof obj.startAge !== 'number') return false;
  if (typeof obj.startYear !== 'number') return false;
  if (!Array.isArray(obj.items) || obj.items.length < 5) return false;

  const validStages = ['foundation', 'education', 'experience', 'career'];
  for (const item of obj.items) {
    if (!item || typeof item !== 'object') return false;
    const i = item as Record<string, unknown>;
    if (typeof i.title !== 'string') return false;
    if (typeof i.stage !== 'string' || !validStages.includes(i.stage)) return false;
    if (typeof i.startAge !== 'number') return false;
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
      return NextResponse.json(
        { error: 'Career must be between 2 and 100 characters' },
        { status: 400 }
      );
    }

    // Check cache: does the user already have a generated timeline for this career?
    const profile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: { generatedTimeline: true },
    });

    if (profile?.generatedTimeline) {
      const cached = profile.generatedTimeline as { career?: string; journey?: Journey };
      if (cached.career?.toLowerCase() === career.toLowerCase() && cached.journey) {
        return NextResponse.json({
          journey: cached.journey,
          cached: true,
        });
      }
    }

    // Rate limit check
    const rateLimit = await checkRateLimitAsync(
      `timeline:${session.user.id}`,
      RateLimits.TIMELINE_GENERATION
    );

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: 'Too many timeline generations. Please try again later.',
          ...getRateLimitHeaders(rateLimit.limit, rateLimit.remaining, rateLimit.reset),
        },
        { status: 429 }
      );
    }

    // Try OpenAI generation
    let journey: Journey;
    const openai = getOpenAIClient();

    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `Generate a career timeline for: ${career}` },
          ],
          temperature: 0.7,
          max_tokens: 1500,
          response_format: { type: 'json_object' },
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) throw new Error('Empty response from OpenAI');

        const parsed = JSON.parse(content);

        if (!isValidJourney(parsed)) {
          console.warn('[Timeline API] Invalid journey structure from OpenAI, using fallback');
          throw new Error('Invalid journey structure');
        }

        // Add IDs to items (OpenAI doesn't generate them)
        journey = {
          id: `ai-${career.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
          career: parsed.career,
          startAge: parsed.startAge,
          startYear: parsed.startYear,
          items: parsed.items.map((item: Omit<Journey['items'][number], 'id'>, i: number) => ({
            id: `ai-${i}-${Math.random().toString(36).slice(2, 7)}`,
            ...item,
          })),
        };
      } catch (aiError) {
        console.error('[Timeline API] OpenAI generation failed, using fallback:', aiError);
        journey = generateFallbackTimeline(career);
      }
    } else {
      console.log('[Timeline API] OpenAI not configured, using fallback');
      journey = generateFallbackTimeline(career);
    }

    // Cache the result (serialize to plain JSON for Prisma's InputJsonValue)
    const cachePayload = JSON.parse(JSON.stringify({
      career,
      generatedAt: new Date().toISOString(),
      journey,
    }));

    await prisma.youthProfile.update({
      where: { userId: session.user.id },
      data: {
        generatedTimeline: cachePayload,
      },
    });

    return NextResponse.json({
      journey,
      cached: false,
    });
  } catch (error) {
    console.error('[Timeline API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to generate timeline' },
      { status: 500 }
    );
  }
}
