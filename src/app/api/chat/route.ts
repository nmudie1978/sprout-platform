import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import {
  retrieveRelevantCareerCards,
  retrieveRelevantHelpDocs,
  retrieveRelevantQA,
  formatContextForPrompt,
} from "@/lib/rag-retrieval";
import {
  classifyIntent,
  getSystemPrompt,
  isResponseSafe,
  getFallbackResponse,
  getSmartFallbackResponse,
  type IntentType,
} from "@/lib/ai-guardrails";
import { checkRateLimit, getRateLimitHeaders, RateLimits } from "@/lib/rate-limit";
import { aiRecommendCard } from "@/lib/life-skills";

// Valid Life Skills card keys the AI can recommend
const LIFE_SKILL_CARD_KEYS = [
  "FIRST_JOB_ACCEPTED",
  "FIRST_MESSAGE_TO_ADULT",
  "ARRIVING_ON_TIME",
  "RUNNING_LATE",
  "CLARIFY_THE_TASK",
  "DECLINING_A_JOB",
  "PRICE_AND_PAYMENT",
  "SAFETY_BOUNDARIES",
  "AFTER_THE_JOB",
  "WHEN_SOMETHING_FEELS_OFF",
];

// Life Skills tool definition for OpenAI function calling
const lifeSkillsTool: OpenAI.Chat.ChatCompletionTool = {
  type: "function",
  function: {
    name: "recommendLifeSkillCard",
    description: "Recommend a helpful life skill tip to the user when you detect a teachable moment. Use this when the user is discussing job-related situations where a tip would be supportive.",
    parameters: {
      type: "object",
      properties: {
        cardKey: {
          type: "string",
          enum: LIFE_SKILL_CARD_KEYS,
          description: "The key of the life skill card to recommend",
        },
        reason: {
          type: "string",
          maxLength: 140,
          description: "A brief reason why this tip is being recommended (max 140 chars)",
        },
      },
      required: ["cardKey", "reason"],
    },
  },
};

/**
 * Check if OpenAI is properly configured
 */
function isOpenAIConfigured(): boolean {
  const apiKey = process.env.OPENAI_API_KEY;
  return !!(
    apiKey &&
    apiKey.length > 10 &&
    apiKey !== "sk-your-openai-api-key-here" &&
    apiKey.startsWith("sk-")
  );
}

/**
 * Create OpenAI client lazily (only when needed and configured)
 */
function getOpenAIClient(): OpenAI | null {
  if (!isOpenAIConfigured()) {
    return null;
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// POST /api/chat - Send a message to the AI assistant
export async function POST(req: NextRequest) {
  // Parse these early so they're available in error handling
  let message = "";
  let conversationHistory: any[] = [];
  let intent: IntentType = "career_explain";

  try {
    // Parse request body first
    const body = await req.json();
    message = body.message || "";
    conversationHistory = body.conversationHistory || [];

    if (!message || message.length < 1) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Classify intent early so it's available throughout
    intent = classifyIntent(message);

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      // Return a helpful response instead of 401 error
      return NextResponse.json({
        message: "Please sign in to chat with the AI assistant. You can still browse careers and jobs without an account!",
        intent,
        sources: {},
        requiresAuth: true,
      });
    }

    // Rate limiting: 20 messages per hour
    const rateLimit = checkRateLimit(`chat:${session.user.id}`, RateLimits.AI_CHAT);
    if (!rateLimit.success) {
      return NextResponse.json({
        message: "You've sent a lot of messages! Take a short break and try again soon. In the meantime, browse careers or check the Q&A section.",
        intent,
        sources: {},
        rateLimited: true,
      });
    }

    // Check for unsafe content immediately
    if (intent === "unsafe") {
      const fallbackResponse = getFallbackResponse(intent);

      // Log intent (non-blocking)
      logIntent(session.user.id, intent, { triggered: "unsafe_content" }).catch(() => {});

      return NextResponse.json({
        message: fallbackResponse,
        intent,
        sources: [],
      });
    }

    // Check for off-topic
    if (intent === "off_topic") {
      const fallbackResponse = getFallbackResponse(intent);

      // Log intent (non-blocking)
      logIntent(session.user.id, intent, { triggered: "off_topic" }).catch(() => {});

      return NextResponse.json({
        message: fallbackResponse,
        intent,
        sources: [],
      });
    }

    // Fetch user's profile to get career aspiration for personalization (optional)
    let userProfile: { careerAspiration: string | null } | null = null;
    try {
      userProfile = await prisma.youthProfile.findUnique({
        where: { userId: session.user.id },
        select: { careerAspiration: true },
      });
    } catch (profileError) {
      console.error("Profile fetch error (continuing without personalization):", profileError);
    }

    // Retrieve relevant context (RAG) - wrapped in try-catch to be resilient
    let careerCards: any[] = [];
    let helpDocs: any[] = [];
    let qaItems: any[] = [];

    try {
      [careerCards, helpDocs, qaItems] = await Promise.all([
        retrieveRelevantCareerCards(message, 3),
        retrieveRelevantHelpDocs(message, 2),
        retrieveRelevantQA(message, 2),
      ]);
    } catch (ragError) {
      console.error("RAG retrieval error (continuing without context):", ragError);
      // Continue without RAG context - OpenAI can still answer general questions
    }

    const context = formatContextForPrompt(careerCards, helpDocs, qaItems);

    // Build messages for OpenAI with personalization based on career aspiration
    const systemPrompt = getSystemPrompt(intent, userProfile?.careerAspiration);
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: systemPrompt + (context ? `\n\n${context}` : ""),
      },
    ];

    // Add conversation history (last 4 messages only to keep context window small)
    const recentHistory = conversationHistory.slice(-4);
    recentHistory.forEach((msg: any) => {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    });

    // Add current user message
    messages.push({
      role: "user",
      content: message,
    });

    // Check if Life Skills AI is enabled
    const lifeSkillsAIEnabled = process.env.LIFE_SKILLS_AI_ENABLED === "true";
    const isYouth = session.user.role === "YOUTH";

    // Get OpenAI client - returns null if not configured
    const openai = getOpenAIClient();
    if (!openai) {
      // OpenAI is not configured - use smart fallback
      const fallbackResponse = getSmartFallbackResponse(message, intent);

      // Log that we're using fallback mode
      logIntent(session.user.id, intent, {
        mode: "fallback",
        reason: "openai_not_configured",
        retrieved_careers: careerCards.length,
      }).catch(() => {});

      return NextResponse.json({
        message: fallbackResponse,
        intent,
        sources: {
          careers: careerCards.map((c) => ({ id: c.id, roleName: c.roleName })),
          helpDocs: helpDocs.map((d) => ({ id: d.id, title: d.title })),
          qa: qaItems.map((q) => ({ id: q.id, question: q.question })),
        },
      });
    }

    // Call OpenAI with optional Life Skills tool
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Fast and affordable
      messages,
      temperature: 0.7,
      max_tokens: 300, // Keep responses concise
      ...(lifeSkillsAIEnabled && isYouth && { tools: [lifeSkillsTool] }),
    });

    let assistantMessage = completion.choices[0]?.message?.content || "";
    let lifeSkillRecommended: { cardKey: string; reason: string } | null = null;

    // Handle tool calls if any (Life Skills recommendation)
    const toolCalls = completion.choices[0]?.message?.tool_calls;
    if (toolCalls && toolCalls.length > 0) {
      for (const toolCall of toolCalls) {
        if (toolCall.function.name === "recommendLifeSkillCard") {
          try {
            const args = JSON.parse(toolCall.function.arguments);
            const { cardKey, reason } = args;

            // Call the AI recommend function (validates and creates recommendation)
            const result = await aiRecommendCard(session.user.id, cardKey, reason);
            if (result.success) {
              lifeSkillRecommended = { cardKey, reason };
            }
          } catch (toolError) {
            console.error("Life Skills tool call error:", toolError);
          }
        }
      }
    }

    // Safety check on response
    const safetyCheck = isResponseSafe(assistantMessage);
    if (!safetyCheck.safe) {
      console.warn("Unsafe response detected:", safetyCheck.reason);
      const fallbackResponse = getFallbackResponse(intent);

      // Log intent (non-blocking)
      logIntent(session.user.id, intent, {
        triggered: "unsafe_response",
        reason: safetyCheck.reason,
      }).catch(() => {});

      return NextResponse.json({
        message: fallbackResponse,
        intent,
        sources: [],
      });
    }

    // Log intent (anonymously) - don't await to avoid blocking the response
    logIntent(session.user.id, intent, {
      retrieved_careers: careerCards.length,
      retrieved_docs: helpDocs.length,
      retrieved_qa: qaItems.length,
    }).catch(() => {}); // Silently catch any logging errors

    // Return response with sources and optional life skill recommendation
    return NextResponse.json({
      message: assistantMessage,
      intent,
      sources: {
        careers: careerCards.map((c) => ({
          id: c.id,
          roleName: c.roleName,
        })),
        helpDocs: helpDocs.map((d) => ({
          id: d.id,
          title: d.title,
        })),
        qa: qaItems.map((q) => ({
          id: q.id,
          question: q.question,
        })),
      },
      ...(lifeSkillRecommended && { lifeSkillRecommended }),
    });
  } catch (error: any) {
    // Log error for debugging (in development/staging)
    console.error("Chat API error:", error?.message || error);

    // Use smart fallback - we have message and intent from early parsing
    const fallbackMessage = getSmartFallbackResponse(message, intent);

    return NextResponse.json({
      message: fallbackMessage,
      intent,
      sources: {},
    });
  }
}

/**
 * Log intent anonymously for analytics
 */
async function logIntent(
  userId: string,
  intentType: IntentType,
  metadata: Record<string, any>
) {
  try {
    await prisma.aiIntentLog.create({
      data: {
        userId,
        intentType,
        metadata,
      },
    });
  } catch (error) {
    console.error("Failed to log intent:", error);
    // Don't fail the request if logging fails
  }
}
