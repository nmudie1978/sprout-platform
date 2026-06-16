export const dynamic = "force-dynamic";
// AI/OpenAI calls can be slow; raise above Vercel's short default.
export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import OpenAI from "openai";
import {
  buildPersona,
  buildCareerTwinSystemPrompt,
  getMode,
  CAREER_TWIN_MODES,
} from "@/lib/career-twin";
import { resolveCareerContext, loadProfileContext, loadRecentActivity } from "@/lib/career-twin/resolve";
import { buildProactiveOpener, localeToTwinLang } from "@/lib/career-twin/opener";
import { buildContextStarters } from "@/lib/career-twin/starters";
import {
  classifyIntent,
  isResponseSafe,
  getFallbackResponse,
  detectNonEnglishResponse,
  localeToLanguage,
} from "@/lib/ai-guardrails";
import { checkRateLimitAsync, RateLimits } from "@/lib/rate-limit";
import { logAndSwallow, captureServerError } from "@/lib/observability";
import { loadTwinHistory, appendTwinTurns, toPromptHistory, TWIN_CONTEXT_TURNS } from "@/lib/career-twin/history";
import { loadTwinMemory, isReturningAfterGap } from "@/lib/career-twin/memory";

function isOpenAIConfigured(): boolean {
  const apiKey = process.env.OPENAI_API_KEY;
  return !!(
    apiKey &&
    apiKey.length > 10 &&
    apiKey !== "sk-your-openai-api-key-here" &&
    apiKey.startsWith("sk-")
  );
}

function getOpenAIClient(): OpenAI | null {
  if (!isOpenAIConfigured()) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/**
 * A grounded, on-brand fallback when OpenAI isn't configured — still
 * future-self framed and never deterministic.
 */
function twinFallback(careerTitle: string): string {
  return (
    `Honestly? Becoming a ${careerTitle} had good days and hard days — and remember this is just one possible version of your future, not a promise. ` +
    `I can't run the full conversation right now, but a good next move is to explore one real day-in-the-life of this career and notice what excites you. ` +
    `For anything big, talk it through with someone you trust too.`
  );
}

// ── GET: resolve the career + build a persona to start the experience ──
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ requiresAuth: true, needsCareer: true });
    }

    const careerIdParam = req.nextUrl.searchParams.get("careerId");
    const career = await resolveCareerContext(session.user.id, careerIdParam);
    if (!career) {
      return NextResponse.json({ needsCareer: true });
    }

    const profile = await loadProfileContext(session.user.id);
    const persona = buildPersona({ userId: session.user.id, career, profile });

    const [history, memory, recentActivity] = await Promise.all([
      loadTwinHistory(session.user.id, career.id),
      loadTwinMemory(session.user.id, career.id),
      loadRecentActivity(session.user.id, career, profile),
    ]);

    // Deterministic, zero-cost proactive opener built from REAL recent
    // activity (saved/explored careers, active goal, journey stage, returning
    // gap). Null for brand-new users with no activity → the client falls back
    // to the generic persona intro.
    // Localised to the viewer's UI language (NEXT_LOCALE cookie) so a NO/ES
    // user is greeted and prompted in their own language.
    const twinLang = localeToTwinLang(req.cookies.get("NEXT_LOCALE")?.value);
    const opener = buildProactiveOpener(career, recentActivity, twinLang);

    // Context-aware starter chips, built from the SAME already-loaded recent
    // activity as the opener (zero extra cost, never hallucinated). Empty for
    // brand-new users → the client falls back to the generic mode starters.
    const contextStarters = buildContextStarters(career.title, recentActivity, 3, twinLang);

    return NextResponse.json({
      needsCareer: false,
      career: { id: career.id, title: career.title, emoji: career.emoji ?? null },
      persona,
      intro: persona.intro,
      opener,
      contextStarters,
      disclaimer: persona.uncertaintyDisclaimer,
      modes: CAREER_TWIN_MODES.map((m) => ({
        id: m.id,
        label: m.label,
        description: m.description,
        starterQuestions: m.starterQuestions,
      })),
      history: history
        .filter((r) => r.role === "user" || r.role === "assistant")
        .map((r) => ({ role: r.role, content: r.content })),
      checkIn: {
        returning: isReturningAfterGap(memory.daysSinceLastVisit),
        daysSinceLastVisit: memory.daysSinceLastVisit,
      },
    });
  } catch (error) {
    console.error("[Career Twin] GET error:", error);
    return NextResponse.json({ needsCareer: true, error: "Failed to load Career Twin" });
  }
}

// ── POST: one conversation turn with the future self ──
export async function POST(req: NextRequest) {
  let careerTitle = "this career";
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Please sign in to talk to your Career Twin.", requiresAuth: true },
        { status: 200 },
      );
    }

    const body = await req.json();
    const message: string = (body.message ?? "").toString();
    const modeId: string = (body.mode ?? "").toString();
    const careerIdParam: string | null = body.careerId ?? null;

    if (!message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Rate limit (shares the AI chat budget: 20/hour)
    const rl = await checkRateLimitAsync(`career-twin:${session.user.id}`, RateLimits.AI_CHAT);
    if (!rl.success) {
      return NextResponse.json({
        message:
          "We've talked a lot just now — take a short break and come back soon. Your future self isn't going anywhere.",
        rateLimited: true,
      });
    }
    // Monthly cost ceiling — caps total Twin spend per account over a rolling
    // 30-day window so a single user can't drain the OpenAI budget by spreading
    // calls across days (the per-hour limit alone allows ~14k/month).
    const monthlyRl = await checkRateLimitAsync(
      `career-twin-month:${session.user.id}`,
      RateLimits.AI_MONTHLY_TWIN
    );
    if (!monthlyRl.success) {
      return NextResponse.json({
        message:
          "You've explored a lot with your Career Twin this month. Take some time to sit with what you've learned — we'll be right here when you're ready for more.",
        rateLimited: true,
      });
    }

    // Resolve the career the Twin is grounded in
    const career = await resolveCareerContext(session.user.id, careerIdParam);
    if (!career) {
      return NextResponse.json({ needsCareer: true });
    }
    careerTitle = career.title;

    // Distress / unsafe content → supportive, non-diagnostic, route to a trusted adult.
    const intent = classifyIntent(message);
    if (intent === "unsafe") {
      // Intentionally NOT persisted — we don't replay distress signals into future model context.
      return NextResponse.json({ message: getFallbackResponse("unsafe"), intent: "unsafe" });
    }

    const replyLanguage = localeToLanguage(req.cookies.get("NEXT_LOCALE")?.value);

    const openai = getOpenAIClient();
    if (!openai) {
      return NextResponse.json({ message: twinFallback(career.title), fallback: true });
    }

    // Load profile + memory + history together (independent once the career is
    // resolved) so the model call isn't waiting on a chain of round-trips.
    const [profile, memory, dbHistory] = await Promise.all([
      loadProfileContext(session.user.id),
      loadTwinMemory(session.user.id, career.id),
      loadTwinHistory(session.user.id, career.id),
    ]);
    const persona = buildPersona({ userId: session.user.id, career, profile });
    const mode = getMode(modeId);
    const systemPrompt = buildCareerTwinSystemPrompt({ persona, mode, career, profile, language: replyLanguage, memory });

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
    ];
    toPromptHistory(dbHistory, TWIN_CONTEXT_TURNS).forEach((m) => messages.push({ role: m.role, content: m.content }));
    messages.push({ role: "user", content: message.slice(0, 2000) });

    // Stream the reply token-by-token. The user sees text within a few hundred
    // ms instead of waiting for the whole completion (~3-8s). Safety is
    // preserved: the running buffer is checked against the output guardrail on
    // every chunk (so a blocked term never finishes rendering), and the
    // completed text gets the non-English backstop — either failure emits a
    // `replace` event telling the client to swap in the grounded fallback.
    const openaiStream = await openai.chat.completions.create(
      { model: "gpt-4o-mini", messages, temperature: 0.8, max_tokens: 500, stream: true },
      { timeout: 25_000 },
    );

    const encoder = new TextEncoder();
    const userId = session.user.id;
    const careerId = career.id;
    const fallbackText = twinFallback(career.title);
    const modeForTurn = mode.id;

    const responseStream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const emit = (obj: unknown) =>
          controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
        let full = "";
        let replaced = false;
        try {
          for await (const chunk of openaiStream) {
            const delta = chunk.choices[0]?.delta?.content ?? "";
            if (!delta) continue;
            const next = full + delta;
            // Output safety net (reuses the platform guardrails): only `full`
            // (already forwarded) is ever shown, so stopping before forwarding
            // the chunk that completes a blocked keyword means it never fully
            // renders. The client discards what it has on `replace`.
            if (!isResponseSafe(next).safe) {
              replaced = true;
              emit({ replace: fallbackText, fallback: true });
              break;
            }
            full = next;
            emit({ delta });
          }

          if (!replaced) {
            const finalText = full.trim();
            // Only enforce English when English is the target language —
            // Norwegian and Spanish users are meant to get non-English replies.
            const nonEnglishBad =
              replyLanguage === "English" && detectNonEnglishResponse(finalText).isNonEnglish;
            if (!finalText || nonEnglishBad) {
              emit({ replace: fallbackText, fallback: true });
            } else {
              emit({ done: true, mode: modeForTurn });
              try {
                await appendTwinTurns(userId, careerId, [
                  { role: "user", content: message, mode: modeForTurn },
                  { role: "assistant", content: finalText, mode: modeForTurn },
                ]);
              } catch (persistErr) {
                logAndSwallow("career-twin:POST:persist")(persistErr);
              }
            }
          }
        } catch (streamErr) {
          captureServerError("career-twin:POST:stream", streamErr);
          emit({ replace: fallbackText, fallback: true });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(responseStream, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-store",
        // Disable proxy buffering so chunks reach the client as produced.
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    captureServerError("career-twin:POST", error);
    return NextResponse.json({ message: twinFallback(careerTitle), fallback: true });
  }
}
