export const dynamic = "force-dynamic";
// AI/OpenAI calls can be slow; raise above Vercel's short default.
export const maxDuration = 60;
import { NextRequest, NextResponse, after } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import OpenAI from "openai";
import {
  buildPersona,
  buildCareerTwinSystemPrompt,
  getMode,
  CAREER_TWIN_MODES,
} from "@/lib/career-twin";
import { resolveCareerContext, loadProfileContext, loadRecentActivity, loadActiveGoal } from "@/lib/career-twin/resolve";
import { buildProactiveOpener, localeToTwinLang } from "@/lib/career-twin/opener";
import { buildContextStarters } from "@/lib/career-twin/starters";
import {
  classifyIntent,
  isResponseSafe,
  getFallbackResponse,
  detectNonEnglishResponse,
  localeToLanguage,
} from "@/lib/ai-guardrails";
import { checkGlobalAiBudget } from "@/lib/rate-limit";
import { logAndSwallow, captureServerError } from "@/lib/observability";
import { loadTwinHistory, loadLastTurnAt, appendTwinTurns } from "@/lib/career-twin/history";
import { loadTwinContext, buildSummaryBlock, refreshTwinSummaryIfNeeded } from "@/lib/career-twin/context";
import { loadTwinMemory, isReturningAfterGap } from "@/lib/career-twin/memory";
// ── AI usage guardrails: daily limit, rate limit, cost tracking, kill switch.
// Every limit below is configured in src/lib/ai-usage/config.ts (env-tunable).
import { checkCareerTwinGuardrails } from "@/lib/ai-usage/guard";
import { recordAiUsage, recentSuccessfulRequests } from "@/lib/ai-usage/record";
import { getCareerTwinConfig } from "@/lib/ai-usage/config";
import { estimateTokens } from "@/lib/ai-usage/pricing";
import { evaluateRollingWindow, DAY_MS } from "@/lib/ai-usage/limits";
import { AI_FEATURES } from "@/lib/ai-usage/types";

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

    // Fetch the profile, history, and the two SHARED rows (active goal + last
    // turn) once. loadTwinMemory and loadRecentActivity both need the latter
    // two, so injecting them avoids fetching the active goal and last turn 2-3×
    // across this open.
    const twinConfig = getCareerTwinConfig();
    const [profile, history, activeGoal, lastTurn, recentAsks] = await Promise.all([
      loadProfileContext(session.user.id),
      loadTwinHistory(session.user.id, career.id),
      loadActiveGoal(session.user.id),
      loadLastTurnAt(session.user.id, career.id),
      // Remaining questions in the rolling 24h allowance, so the UI can show
      // the limit before the user runs into it.
      recentSuccessfulRequests(
        session.user.id,
        AI_FEATURES.CAREER_TWIN,
        twinConfig.dailyQuestionLimit,
        DAY_MS,
      ),
    ]);
    const dailyWindow = evaluateRollingWindow(
      recentAsks,
      twinConfig.dailyQuestionLimit,
      DAY_MS,
    );
    const persona = buildPersona({ userId: session.user.id, career, profile });

    const [memory, recentActivity] = await Promise.all([
      loadTwinMemory(session.user.id, career.id, Date.now(), { lastTurn, activeGoal }),
      loadRecentActivity(session.user.id, career, profile, { activeGoal, lastTurn }),
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
      usage: {
        dailyLimit: twinConfig.dailyQuestionLimit,
        remaining: dailyWindow.remaining,
        resetAt: dailyWindow.retryAt?.toISOString() ?? null,
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

    // ── AI usage guardrails ─────────────────────────────────────────────
    // Kill switch → 5 requests/minute → 15 questions/rolling 24h → monthly
    // platform cost ceiling. Every refusal is recorded in the usage ledger and
    // returns friendly copy WITHOUT ever calling the AI provider.
    // These supersede the old 20/hour + 1000/month counters: 15/day is
    // strictly tighter than both, so nothing here is a loosening.
    // Tune the numbers in src/lib/ai-usage/config.ts (all env-overridable).
    const guard = await checkCareerTwinGuardrails(session.user.id);
    if (!guard.allowed) {
      return NextResponse.json({
        message: guard.message,
        // Distinct flags so the UI can tell "slow down" from "come back later".
        rateLimited: guard.status === "rate_limited",
        dailyLimitReached: guard.status === "daily_limit_reached",
        unavailable: guard.status === "disabled" || guard.status === "cost_capped",
        retryAt: guard.retryAt?.toISOString() ?? null,
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

    // Null the client when the global daily AI budget is spent so the request
    // degrades to the grounded fallback below instead of spending more.
    const openai = (await checkGlobalAiBudget()) ? getOpenAIClient() : null;
    if (!openai) {
      // No key, or the platform-wide daily request backstop is spent. Recorded
      // (at zero cost) so "why is everyone getting the fallback?" is answerable
      // from the ledger; doesn't consume the user's daily allowance.
      await recordAiUsage({
        userId: session.user.id,
        feature: AI_FEATURES.CAREER_TWIN,
        status: "failed",
        detail: "provider_unavailable",
      });
      return NextResponse.json({ message: twinFallback(career.title), fallback: true });
    }

    // Load profile + memory + conversation context together (independent once
    // the career is resolved) so the model call isn't waiting on a chain of
    // round-trips.
    const cfg = getCareerTwinConfig();
    const [profile, memory, context] = await Promise.all([
      loadProfileContext(session.user.id),
      loadTwinMemory(session.user.id, career.id),
      loadTwinContext(session.user.id, career.id, cfg),
    ]);
    const persona = buildPersona({ userId: session.user.id, career, profile });
    const mode = getMode(modeId);
    // Bounded context: a rolling SUMMARY of older turns in the system prompt,
    // plus the last few turns verbatim (capped by turn count AND token budget).
    // The prompt therefore stays a fixed size however long the thread runs.
    const systemPrompt =
      buildCareerTwinSystemPrompt({
        persona,
        mode,
        career,
        profile,
        language: replyLanguage,
        memory,
        // Soft word budget kept comfortably under the hard max_tokens cap, so
        // replies finish naturally instead of being truncated at the ceiling.
        maxWords: Math.floor(cfg.maxOutputTokens * 0.55),
      }) + buildSummaryBlock(context.summary);

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
    ];
    context.recent.forEach((m) => messages.push({ role: m.role, content: m.content }));
    messages.push({ role: "user", content: message.slice(0, 2000) });

    // Fallback token estimate, used only if the provider doesn't report usage.
    const estimatedInputTokens = messages.reduce(
      (sum, m) => sum + estimateTokens(typeof m.content === "string" ? m.content : "") + 4,
      0,
    );

    // Stream the reply token-by-token. The user sees text within a few hundred
    // ms instead of waiting for the whole completion (~3-8s). Safety is
    // preserved: the running buffer is checked against the output guardrail on
    // every chunk (so a blocked term never finishes rendering), and the
    // completed text gets the non-English backstop — either failure emits a
    // `replace` event telling the client to swap in the grounded fallback.
    // max_tokens keeps replies concise by default (config: maxOutputTokens);
    // stream_options gives us the real token counts for the usage ledger.
    const openaiStream = await openai.chat.completions.create(
      {
        model: cfg.model,
        messages,
        temperature: 0.8,
        max_tokens: cfg.maxOutputTokens,
        stream: true,
        stream_options: { include_usage: true },
      },
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
        // Real token counts from the provider's final usage chunk
        // (stream_options.include_usage); estimated only if it never arrives.
        let promptTokens: number | null = null;
        let completionTokens: number | null = null;
        /** Ledger write — the ONLY place a Twin turn's cost is recorded. */
        const record = (status: "successful" | "failed", detail?: string) =>
          recordAiUsage({
            userId,
            feature: AI_FEATURES.CAREER_TWIN,
            status,
            model: cfg.model,
            inputTokens: promptTokens ?? estimatedInputTokens,
            outputTokens: completionTokens ?? estimateTokens(full),
            detail,
          });
        try {
          for await (const chunk of openaiStream) {
            if (chunk.usage) {
              promptTokens = chunk.usage.prompt_tokens;
              completionTokens = chunk.usage.completion_tokens;
            }
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
              // The provider was called, so the spend is real and recorded —
              // but the user never got a usable answer, so this must NOT burn
              // one of their 15 daily questions.
              await record("failed", "output_guardrail");
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
              await record("failed", finalText ? "non_english" : "empty_response");
            } else {
              emit({ done: true, mode: modeForTurn });
              // Only a delivered answer counts against the daily allowance.
              await record("successful");
              try {
                await appendTwinTurns(userId, careerId, [
                  { role: "user", content: message, mode: modeForTurn },
                  { role: "assistant", content: finalText, mode: modeForTurn },
                ]);
                // Fold anything that has fallen out of the verbatim window into
                // the rolling summary. Runs AFTER the response is delivered
                // (next/server `after`) so it never adds latency to the turn.
                after(async () => {
                  await refreshTwinSummaryIfNeeded(openai, {
                    userId,
                    careerId,
                    careerTitle,
                    cfg,
                  });
                });
              } catch (persistErr) {
                logAndSwallow("career-twin:POST:persist")(persistErr);
              }
            }
          }
        } catch (streamErr) {
          captureServerError("career-twin:POST:stream", streamErr);
          emit({ replace: fallbackText, fallback: true });
          await record("failed", "stream_error");
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
