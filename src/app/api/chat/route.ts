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

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/chat - Send a message to the AI assistant
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting: 20 messages per hour
    const rateLimit = checkRateLimit(`chat:${session.user.id}`, RateLimits.AI_CHAT);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Too many messages. Please try again later.",
          resetAt: rateLimit.reset,
        },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimit.limit, rateLimit.remaining, rateLimit.reset),
        }
      );
    }

    const body = await req.json();
    const { message, conversationHistory = [] } = body;

    if (!message || message.length < 1) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Classify intent
    const intent = classifyIntent(message);

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
    // Log the full error for debugging
    console.error("Error in chat API:", {
      message: error?.message,
      status: error?.status,
      code: error?.code,
      type: error?.type,
      error: error?.error,
    });

    // Get the original message and intent for smart fallback
    let originalMessage = "";
    let intent: IntentType = "career_explain";
    try {
      const body = await req.clone().json();
      originalMessage = body.message || "";
      intent = classifyIntent(originalMessage);
    } catch {
      // If we can't get the message, use default
    }

    // Use smart fallback based on the user's question
    const fallbackMessage = getSmartFallbackResponse(originalMessage, intent);

    return NextResponse.json({
      message: fallbackMessage,
      intent,
      sources: {},
      fallback: true,
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
