/**
 * POST /api/simulation/narrate
 *
 * Converts a text segment to speech using OpenAI TTS.
 * Returns audio/mpeg stream. The client plays it via HTMLAudioElement.
 *
 * Body: { text: string, voice?: string }
 * Response: audio/mpeg binary
 *
 * Cost: ~$0.015 per 1000 characters (~$0.001 per full playthrough).
 * Rate limited to 30 requests/hour per user.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkRateLimit, checkRateLimitAsync, getRateLimitHeaders, RateLimits } from '@/lib/rate-limit';
import OpenAI from 'openai';

let _openai: OpenAI | null | undefined;
function getOpenAI(): OpenAI | null {
  if (_openai !== undefined) return _openai;
  const key = process.env.OPENAI_API_KEY;
  _openai =
    key && key.length > 10 && key.startsWith('sk-') && key !== 'sk-your-openai-api-key-here'
      ? new OpenAI({ apiKey: key })
      : null;
  return _openai;
}

// Allowed voices — 'nova' is young and encouraging, fitting the
// platform's tone. The user can override via the request body.
const ALLOWED_VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] as const;
type Voice = (typeof ALLOWED_VOICES)[number];
const DEFAULT_VOICE: Voice = 'nova';

export async function POST(req: NextRequest) {
  // Auth
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'YOUTH') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: monthly quota first (cost ceiling — survives restarts
  // when Redis is configured), then the short-window burst limit.
  const monthlyQuota = await checkRateLimitAsync(
    `sim-narrate-month:${session.user.id}`,
    RateLimits.AI_MONTHLY_NARRATE,
  );
  if (!monthlyQuota.success) {
    const res = NextResponse.json(
      { error: 'Monthly narration quota reached. The limit resets after the rolling 30-day window.' },
      { status: 429 },
    );
    const headers = getRateLimitHeaders(monthlyQuota.limit, monthlyQuota.remaining, monthlyQuota.reset);
    Object.entries(headers).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  }

  const rl = checkRateLimit(`sim-narrate:${session.user.id}`, {
    interval: 3600000,
    maxRequests: 30,
  });
  if (!rl.success) {
    const res = NextResponse.json(
      { error: 'Too many narration requests. Please try again later.' },
      { status: 429 },
    );
    const headers = getRateLimitHeaders(rl.limit, rl.remaining, rl.reset);
    Object.entries(headers).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  }

  // Parse body
  let text: string;
  let voice: Voice = DEFAULT_VOICE;
  try {
    const body = await req.json();
    text = typeof body.text === 'string' ? body.text.trim() : '';
    if (body.voice && ALLOWED_VOICES.includes(body.voice)) {
      voice = body.voice;
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!text || text.length < 5) {
    return NextResponse.json({ error: 'Text too short' }, { status: 400 });
  }
  if (text.length > 4096) {
    return NextResponse.json({ error: 'Text too long (max 4096 chars)' }, { status: 400 });
  }

  // Generate audio
  const openai = getOpenAI();
  if (!openai) {
    return NextResponse.json(
      { error: 'TTS service unavailable — OPENAI_API_KEY not configured' },
      { status: 503 },
    );
  }

  try {
    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice,
      input: text,
      response_format: 'mp3',
      speed: 0.95, // slightly slower for clarity with young audience
    });

    // The SDK returns a Response-like object with arrayBuffer()
    const buffer = Buffer.from(await response.arrayBuffer());

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(buffer.length),
        'Cache-Control': 'private, max-age=3600', // cache for 1 hour client-side
      },
    });
  } catch (err) {
    console.error('[simulation/narrate] TTS failed:', (err as Error).message);
    return NextResponse.json(
      { error: 'Failed to generate audio' },
      { status: 500 },
    );
  }
}
