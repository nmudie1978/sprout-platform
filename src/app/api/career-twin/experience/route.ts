export const dynamic = "force-dynamic";
// AI/OpenAI calls can be slow; raise above Vercel's short default.
export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import OpenAI from "openai";
import { buildPersona } from "@/lib/career-twin";
import { resolveCareerContext, loadProfileContext } from "@/lib/career-twin/resolve";
import {
  buildExperienceSystemPrompt,
  buildStartUserMessage,
  buildRespondUserMessage,
  scenarioContentSchema,
  respondContentSchema,
  isValidExperienceLength,
  getExperienceLength,
  totalScenarios,
  categoryForIndex,
  type Scenario,
} from "@/lib/career-twin/experience";
import { isResponseSafe, localeToLanguage, classifyIntent, getFallbackResponse } from "@/lib/ai-guardrails";
import { checkRateLimitAsync, RateLimits, checkGlobalAiBudget } from "@/lib/rate-limit";
import { logAndSwallow, captureServerError } from "@/lib/observability";
// Shared AI guardrails. The scenario runner is a Career Twin surface, so its
// spend is metered into the SAME ledger and stopped by the SAME kill switch —
// but it keeps its own request budget (a "day in the life" run is many calls,
// and must not eat the 15 conversation questions).
// Limits: src/lib/ai-usage/config.ts
import { checkAiGuardrails } from "@/lib/ai-usage/guard";
import { recordAiUsage } from "@/lib/ai-usage/record";
import { getCareerTwinConfig } from "@/lib/ai-usage/config";
import { estimateTokens } from "@/lib/ai-usage/pricing";
import { AI_FEATURES } from "@/lib/ai-usage/types";

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  const ok = !!(apiKey && apiKey.length > 10 && apiKey !== "sk-your-openai-api-key-here" && apiKey.startsWith("sk-"));
  return ok ? new OpenAI({ apiKey }) : null;
}

/**
 * One OpenAI JSON call. Returns the parsed object, or null on any failure.
 * Every call — success or failure — is written to the AI usage ledger.
 */
async function jsonCompletion(
  openai: OpenAI,
  userId: string,
  systemPrompt: string,
  userMessage: string,
): Promise<unknown | null> {
  const cfg = getCareerTwinConfig();
  const record = (
    status: "successful" | "failed",
    inputTokens: number,
    outputTokens: number,
    detail?: string,
  ) =>
    recordAiUsage({
      userId,
      feature: AI_FEATURES.CAREER_TWIN_EXPERIENCE,
      status,
      model: cfg.model,
      inputTokens,
      outputTokens,
      detail,
    });

  try {
    const completion = await openai.chat.completions.create(
      {
        model: cfg.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.85,
        // A scenario is a structured JSON object, so it needs more room than a
        // chat reply — but still a hard ceiling. [EXPERIENCE_MAX_OUTPUT_TOKENS]
        max_tokens: Number(process.env.EXPERIENCE_MAX_OUTPUT_TOKENS) || 750,
        response_format: { type: "json_object" },
      },
      { timeout: 30_000 },
    );
    const raw = completion.choices[0]?.message?.content?.trim();
    await record(
      raw ? "successful" : "failed",
      completion.usage?.prompt_tokens ?? estimateTokens(systemPrompt + userMessage),
      completion.usage?.completion_tokens ?? estimateTokens(raw ?? ""),
      raw ? undefined : "empty_response",
    );
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    logAndSwallow("career-twin:experience:openai")(e);
    await record("failed", estimateTokens(systemPrompt + userMessage), 0, "openai_error");
    return null;
  }
}

/** True when none of the supplied text trips the shared output guardrails. */
function allSafe(...parts: (string | undefined)[]): boolean {
  const text = parts.filter(Boolean).join("\n");
  return !text || isResponseSafe(text).safe;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ requiresAuth: true }, { status: 200 });
    }

    const body = await req.json();
    const action: string = (body.action ?? "").toString();
    const careerIdParam: string | null = body.careerId ?? null;
    const lengthParam: string = (body.length ?? "").toString();
    const length = isValidExperienceLength(lengthParam) ? lengthParam : getExperienceLength(null).id;

    // Kill switch + per-minute burst guard + monthly platform cost ceiling.
    // `dailyLimit: 0` opts this surface out of the 15-questions/24h allowance —
    // that budget belongs to the conversation, not the scenario runner.
    const guard = await checkAiGuardrails({
      userId: session.user.id,
      feature: AI_FEATURES.CAREER_TWIN_EXPERIENCE,
      dailyLimit: 0,
    });
    if (!guard.allowed) {
      return guard.status === "rate_limited"
        ? NextResponse.json({ rateLimited: true }, { status: 200 })
        : NextResponse.json({ unavailable: true }, { status: 200 });
    }

    // 30-day per-user cap. The step loop is stateless (the client drives
    // currentIndex), so this is what bounds total spend per account.
    const monthly = await checkRateLimitAsync(
      `career-twin-exp-month:${session.user.id}`,
      RateLimits.AI_MONTHLY_EXPERIENCE,
    );
    if (!monthly.success) {
      return NextResponse.json({ rateLimited: true }, { status: 200 });
    }

    const career = await resolveCareerContext(session.user.id, careerIdParam);
    if (!career) return NextResponse.json({ needsCareer: true }, { status: 200 });

    // Null the client when the global daily AI budget is spent → "unavailable".
    const openai = (await checkGlobalAiBudget()) ? getOpenAIClient() : null;
    if (!openai) return NextResponse.json({ unavailable: true }, { status: 200 });

    const profile = await loadProfileContext(session.user.id);
    const persona = buildPersona({ userId: session.user.id, career, profile });
    const language = localeToLanguage(req.cookies.get("NEXT_LOCALE")?.value);
    const systemPrompt = buildExperienceSystemPrompt({ persona, career, profile, length, language });
    const total = totalScenarios(length);

    // ── START: produce the first scene ──
    if (action === "start") {
      const parsed = await jsonCompletion(openai, session.user.id, systemPrompt, buildStartUserMessage(length));
      const content = scenarioContentSchema.safeParse(parsed);
      if (!content.success || !allSafe(content.data?.context, content.data?.situation)) {
        return NextResponse.json({ unavailable: true }, { status: 200 });
      }
      const scenario: Scenario = {
        index: 0,
        total,
        category: categoryForIndex(length, 0),
        context: content.data.context,
        situation: content.data.situation,
      };
      return NextResponse.json({ scenario });
    }

    // ── RESPOND: react to the user's reply, then next scene OR fit insights ──
    if (action === "respond") {
      // Clamp the client-supplied index to a real scene; reject nonsense.
      const rawIndex = Number.isInteger(body.currentIndex) ? body.currentIndex : 0;
      if (rawIndex < 0 || rawIndex >= total) {
        return NextResponse.json({ error: "Invalid scene." }, { status: 400 });
      }
      const currentIndex = rawIndex;
      // Bound the free-text reply before it reaches the model (token-cost guard).
      const userReply: string = (body.userReply ?? "").toString().slice(0, 1500);
      if (!userReply.trim()) {
        return NextResponse.json({ error: "A response is required." }, { status: 400 });
      }

      // Distress / unsafe disclosure in a free-text reply must be met with
      // support — NOT an in-character roleplay "consequence". Mirror the main
      // chat route: classify the user's input and, when unsafe, return the
      // supportive crisis-line response without ever calling the model.
      // Intentionally not persisted (the mode is ephemeral anyway).
      if (classifyIntent(userReply) === "unsafe") {
        return NextResponse.json({ support: getFallbackResponse("unsafe") }, { status: 200 });
      }

      const parsed = await jsonCompletion(
        openai,
        session.user.id,
        systemPrompt,
        buildRespondUserMessage({ length, currentIndex, userReply }),
      );
      const content = respondContentSchema.safeParse(parsed);
      if (
        !content.success ||
        !allSafe(
          content.data?.consequence,
          content.data?.reflection?.whatItsReallyLike,
          content.data?.reflection?.whyEnjoy,
          content.data?.reflection?.whyDislike,
          content.data?.next?.context,
          content.data?.next?.situation,
          content.data?.fitInsights?.enjoyed,
          content.data?.fitInsights?.lessInterested,
        )
      ) {
        return NextResponse.json({ unavailable: true }, { status: 200 });
      }

      const { consequence, reflection, next, fitInsights } = content.data;
      const nextIndex = currentIndex + 1;
      const wrappedNext: Scenario | null =
        nextIndex < total && next
          ? {
              index: nextIndex,
              total,
              category: categoryForIndex(length, nextIndex),
              context: next.context,
              situation: next.situation,
            }
          : null;

      return NextResponse.json({
        consequence,
        reflection,
        next: wrappedNext,
        // Only surface fit insights once the day is actually over.
        fitInsights: nextIndex >= total ? fitInsights ?? null : null,
        complete: nextIndex >= total,
      });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (error) {
    captureServerError("career-twin:experience:POST", error);
    return NextResponse.json({ unavailable: true }, { status: 200 });
  }
}
