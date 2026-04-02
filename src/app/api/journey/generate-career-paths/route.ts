export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';
import type { CareerPathExample } from '@/lib/education/career-path-examples';

let _openai: OpenAI | null | undefined;
function getOpenAIClient(): OpenAI | null {
  if (_openai !== undefined) return _openai;
  const apiKey = process.env.OPENAI_API_KEY;
  _openai = apiKey && apiKey.length > 10 && apiKey.startsWith('sk-') && apiKey !== 'sk-your-openai-api-key-here'
    ? new OpenAI({ apiKey })
    : null;
  return _openai;
}

const SYSTEM_PROMPT = `You generate realistic career path examples for Norwegian youth. Output ONLY valid JSON.

You will be given a specific career title. Generate exactly 2 example career paths for THAT EXACT career — not a related or broader career.

CRITICAL: The career paths must be specifically about the career title given. For example:
- "Network Engineer" → paths about network engineering, NOT mechanical or civil engineering
- "Data Scientist" → paths about data science, NOT generic data analysis
- "UX Designer" → paths about UX design, NOT graphic design

Each example should show a different realistic route to that career in Norway.

JSON format:
{"examples":[{"name":"Firstname L.","title":"<exact career title> — <Norwegian city>","currentAge":N,"location":"<city>","steps":[{"age":N,"label":"description"}]}]}

Rules:
- Use Norwegian educational context (videregående, Norwegian universities: UiO, NTNU, OsloMet, UiB, UiT, HVL, etc.)
- Use Norwegian companies and organisations
- First step should be videregående at age 16
- Career progression must be realistic — proper education duration, entry-level before senior
- Each path should have 5-7 steps
- The two examples should show genuinely different routes (e.g. different universities, different specialisations, academic vs vocational)
- Names should be typical Norwegian first names with last initial
- Ages should be realistic for the career stage`;

function isValidExamples(data: unknown): data is { examples: CareerPathExample[] } {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  if (!Array.isArray(obj.examples) || obj.examples.length < 2) return false;
  for (const ex of obj.examples) {
    if (!ex || typeof ex !== 'object') return false;
    const e = ex as Record<string, unknown>;
    if (typeof e.name !== 'string' || typeof e.title !== 'string') return false;
    if (typeof e.currentAge !== 'number') return false;
    if (!Array.isArray(e.steps) || e.steps.length < 3) return false;
  }
  return true;
}

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

    // Check global cache first
    const cacheKey = `career-paths:${career.toLowerCase().trim()}`;
    try {
      const cached = await prisma.videoCache.findUnique({ where: { cacheKey } });
      if (cached && cached.expiresAt > new Date()) {
        const data = cached.data as unknown as { examples: CareerPathExample[] };
        if (data?.examples?.length) {
          return NextResponse.json({ examples: data.examples, cached: true });
        }
      }
    } catch { /* cache miss */ }

    const openai = getOpenAIClient();
    if (!openai) {
      return NextResponse.json({ examples: [], error: 'AI not configured' }, { status: 200 });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Career: ${career}` },
      ],
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ examples: [] }, { status: 200 });
    }

    const parsed = JSON.parse(content);
    if (!isValidExamples(parsed)) {
      return NextResponse.json({ examples: [] }, { status: 200 });
    }

    const examples = parsed.examples.slice(0, 2);

    // Cache for 30 days (non-blocking)
    prisma.videoCache.upsert({
      where: { cacheKey },
      create: { cacheKey, data: JSON.parse(JSON.stringify({ examples })), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      update: { data: JSON.parse(JSON.stringify({ examples })), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    }).catch(() => {});

    return NextResponse.json({ examples, cached: false });
  } catch (error) {
    console.error('[CareerPaths] Error:', error);
    return NextResponse.json({ examples: [] }, { status: 200 });
  }
}
