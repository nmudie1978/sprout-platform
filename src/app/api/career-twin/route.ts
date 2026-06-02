export const dynamic = "force-dynamic";
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
import { resolveCareerContext, loadProfileContext } from "@/lib/career-twin/resolve";
import {
  classifyIntent,
  isResponseSafe,
  getFallbackResponse,
  detectNonEnglishResponse,
  localeToLanguage,
} from "@/lib/ai-guardrails";
import { checkRateLimit, RateLimits } from "@/lib/rate-limit";
import { logAndSwallow } from "@/lib/observability";
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

    const [history, memory] = await Promise.all([
      loadTwinHistory(session.user.id, career.id),
      loadTwinMemory(session.user.id, career.id),
    ]);

    return NextResponse.json({
      needsCareer: false,
      career: { id: career.id, title: career.title, emoji: career.emoji ?? null },
      persona,
      intro: persona.intro,
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
    const rl = checkRateLimit(`career-twin:${session.user.id}`, RateLimits.AI_CHAT);
    if (!rl.success) {
      return NextResponse.json({
        message:
          "We've talked a lot just now — take a short break and come back soon. Your future self isn't going anywhere.",
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

    const profile = await loadProfileContext(session.user.id);
    const persona = buildPersona({ userId: session.user.id, career, profile });
    const mode = getMode(modeId);
    const replyLanguage = localeToLanguage(req.cookies.get("NEXT_LOCALE")?.value);

    const openai = getOpenAIClient();
    if (!openai) {
      await appendTwinTurns(session.user.id, career.id, [{ role: "user", content: message, mode: mode.id }]);
      return NextResponse.json({ message: twinFallback(career.title), fallback: true });
    }

    const [memory, dbHistory] = await Promise.all([
      loadTwinMemory(session.user.id, career.id),
      loadTwinHistory(session.user.id, career.id),
    ]);
    const systemPrompt = buildCareerTwinSystemPrompt({ persona, mode, career, profile, language: replyLanguage, memory });

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
    ];
    toPromptHistory(dbHistory, TWIN_CONTEXT_TURNS).forEach((m) => messages.push({ role: m.role, content: m.content }));
    messages.push({ role: "user", content: message.slice(0, 2000) });

    const completion = await openai.chat.completions.create(
      { model: "gpt-4o-mini", messages, temperature: 0.8, max_tokens: 500 },
      { timeout: 25_000 },
    );

    let assistantMessage = completion.choices[0]?.message?.content?.trim() || "";

    // Output safety net (reuses the platform guardrails)
    const safety = isResponseSafe(assistantMessage);
    if (!assistantMessage || !safety.safe) {
      await appendTwinTurns(session.user.id, career.id, [{ role: "user", content: message, mode: mode.id }]);
      return NextResponse.json({ message: twinFallback(career.title), fallback: true });
    }
    // Only enforce English when English is the target language — Norwegian
    // and Spanish users are meant to get non-English replies.
    if (replyLanguage === "English") {
      const lang = detectNonEnglishResponse(assistantMessage);
      if (lang.isNonEnglish) {
        await appendTwinTurns(session.user.id, career.id, [{ role: "user", content: message, mode: mode.id }]);
        return NextResponse.json({ message: twinFallback(career.title), fallback: true });
      }
    }

    try {
      await appendTwinTurns(session.user.id, career.id, [
        { role: "user", content: message, mode: mode.id },
        { role: "assistant", content: assistantMessage, mode: mode.id },
      ]);
    } catch (persistErr) {
      logAndSwallow("career-twin:POST:persist")(persistErr);
    }
    return NextResponse.json({ message: assistantMessage, mode: mode.id });
  } catch (error) {
    logAndSwallow("career-twin:POST")(error);
    return NextResponse.json({ message: twinFallback(careerTitle), fallback: true });
  }
}
