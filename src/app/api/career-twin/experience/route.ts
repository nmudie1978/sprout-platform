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
import { checkRateLimitAsync, RateLimits } from "@/lib/rate-limit";
import { logAndSwallow, captureServerError } from "@/lib/observability";

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  const ok = !!(apiKey && apiKey.length > 10 && apiKey !== "sk-your-openai-api-key-here" && apiKey.startsWith("sk-"));
  return ok ? new OpenAI({ apiKey }) : null;
}

/** One OpenAI JSON call. Returns the parsed object, or null on any failure. */
async function jsonCompletion(
  openai: OpenAI,
  systemPrompt: string,
  userMessage: string,
): Promise<unknown | null> {
  try {
    const completion = await openai.chat.completions.create(
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.85,
        max_tokens: 750,
        response_format: { type: "json_object" },
      },
      { timeout: 30_000 },
    );
    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    logAndSwallow("career-twin:experience:openai")(e);
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

    // Two-tier rate limit: a short-window burst cap AND a 30-day per-user cap.
    // The step loop is stateless (the client drives currentIndex), so the
    // monthly cap is what actually bounds total spend per account.
    const burst = await checkRateLimitAsync(`career-twin-exp:${session.user.id}`, RateLimits.AI_CHAT);
    if (!burst.success) {
      return NextResponse.json({ rateLimited: true }, { status: 200 });
    }
    const monthly = await checkRateLimitAsync(
      `career-twin-exp-month:${session.user.id}`,
      RateLimits.AI_MONTHLY_EXPERIENCE,
    );
    if (!monthly.success) {
      return NextResponse.json({ rateLimited: true }, { status: 200 });
    }

    const career = await resolveCareerContext(session.user.id, careerIdParam);
    if (!career) return NextResponse.json({ needsCareer: true }, { status: 200 });

    const openai = getOpenAIClient();
    if (!openai) return NextResponse.json({ unavailable: true }, { status: 200 });

    const profile = await loadProfileContext(session.user.id);
    const persona = buildPersona({ userId: session.user.id, career, profile });
    const language = localeToLanguage(req.cookies.get("NEXT_LOCALE")?.value);
    const systemPrompt = buildExperienceSystemPrompt({ persona, career, profile, length, language });
    const total = totalScenarios(length);

    // ── START: produce the first scene ──
    if (action === "start") {
      const parsed = await jsonCompletion(openai, systemPrompt, buildStartUserMessage(length));
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
