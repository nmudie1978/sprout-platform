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

const SYSTEM_PROMPT = `You generate realistic career path examples for Nordic youth. Output ONLY valid JSON.

You will be given a specific career title. Generate exactly 2 example career paths for THAT EXACT career — not a related or broader career.

CRITICAL RULE — THE TWO PATHS MUST BE GENUINELY DIFFERENT:
- Path 1: The NORWEGIAN ROUTE — studied in Norway (videregående → Norwegian university like UiO, NTNU, OsloMet, UiB, UiT, etc.) → works in Norway.
- Path 2: The INTERNATIONAL ROUTE — grew up in Norway but studied ABROAD (e.g. university in Sweden, Denmark, UK, Netherlands, Germany, Czech Republic, Hungary, or another country relevant to the career) → may have returned to work in Norway or stayed abroad.

This contrast is the entire point — showing that there is more than one way in.

JSON format:
{"examples":[{"name":"Firstname L.","title":"<exact career title> — <city>","currentAge":N,"location":"<city>","steps":[{"age":N,"label":"description"}]}]}

Rules:
- Path 1 uses Norwegian educational context (videregående, Norwegian universities, Norwegian companies)
- Path 2 uses an international educational context (studied abroad, possibly different school system, returned to Norway or works abroad)
- First step for both should be around age 16
- Career progression must be realistic — proper education duration, entry-level before senior
- Each path should have exactly 5 steps (keep labels concise, max ~10 words each)
- Names should be typical Norwegian first names with last initial
- Ages should be realistic for the career stage
- The international path should name the REAL foreign university (e.g. "Studied medicine at Charles University, Prague" or "BSc Computer Science at TU Delft")
- Both paths end at a realistic current age (25-35 depending on career length)`;

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
    // v2: Norwegian + international contrast. Bumped to invalidate
    // old cached results that had two Norwegian-only paths.
    const cacheKey = `career-paths:v2:${career.toLowerCase().trim()}`;
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
      temperature: 0.6,
      max_tokens: 400,
      response_format: { type: 'json_object' },
    }, { timeout: 25_000 });

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
