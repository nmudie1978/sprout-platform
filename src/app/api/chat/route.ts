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
import { semanticSearchCareers, semanticSearchHelpDocs } from "@/lib/semantic-search";
import {
  classifyIntent,
  getSystemPrompt,
  isResponseSafe,
  getFallbackResponse,
  getSmartFallbackResponse,
  detectNonEnglishResponse,
  getEnglishOnlyRegenerationPrompt,
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

    // Fetch persistent chat history for context (last 20 messages)
    let persistentHistory: { role: string; content: string; createdAt: Date }[] = [];
    try {
      persistentHistory = await prisma.aiChatMessage.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          role: true,
          content: true,
          createdAt: true,
        },
      });
      // Reverse to get chronological order
      persistentHistory = persistentHistory.reverse();
    } catch (historyError) {
      console.error("Failed to fetch chat history (continuing without):", historyError);
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

    // Retrieve relevant context using semantic search (with fallback to keyword search)
    let careerCards: any[] = [];
    let helpDocs: any[] = [];
    let qaItems: any[] = [];

    try {
      // Use semantic search for better relevance (falls back to keywords if embeddings unavailable)
      const [semanticCareers, semanticHelpDocs, keywordQA] = await Promise.all([
        semanticSearchCareers(message, 5), // Get more careers for better context
        semanticSearchHelpDocs(message, 3),
        retrieveRelevantQA(message, 2), // Q&A still uses keyword search
      ]);

      careerCards = semanticCareers;
      helpDocs = semanticHelpDocs;
      qaItems = keywordQA;
    } catch (ragError) {
      console.error("RAG retrieval error (continuing without context):", ragError);
      // Continue without RAG context - fallback system will handle
    }

    const context = formatContextForPrompt(careerCards, helpDocs, qaItems);

    // Build a summary of conversation history for context
    let historyContext = "";
    if (persistentHistory.length > 4) {
      // Summarize older messages (beyond the last 4)
      const olderMessages = persistentHistory.slice(0, -4);
      const topics = olderMessages
        .filter((m) => m.role === "user")
        .map((m) => m.content.slice(0, 100))
        .slice(-5); // Last 5 topics from older history
      if (topics.length > 0) {
        historyContext = `\n\nYou have previously discussed these topics with this user: ${topics.join("; ")}. Use this context naturally if relevant.`;
      }
    }

    // Build messages for OpenAI with personalization based on career aspiration
    const systemPrompt = getSystemPrompt(intent, userProfile?.careerAspiration);
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: systemPrompt + (context ? `\n\n${context}` : "") + historyContext,
      },
    ];

    // Add persistent conversation history (last 4 messages for immediate context)
    // Prefer persistent history over client-provided history
    const recentHistory = persistentHistory.length > 0
      ? persistentHistory.slice(-4)
      : conversationHistory.slice(-4);
    recentHistory.forEach((msg: any) => {
      messages.push({
        role: msg.role as "user" | "assistant",
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
      console.log("[Chat API] OpenAI not configured, using fallback. Key check:", {
        hasKey: !!process.env.OPENAI_API_KEY,
        keyLength: process.env.OPENAI_API_KEY?.length || 0,
        startsWithSk: process.env.OPENAI_API_KEY?.startsWith("sk-") || false,
      });
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
    console.log("[Chat API] Calling OpenAI with intent:", intent, "message:", message.substring(0, 50));
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Fast and affordable
      messages,
      temperature: 0.7,
      max_tokens: 600, // Allow detailed responses for questions like "day in the life"
      ...(lifeSkillsAIEnabled && isYouth && { tools: [lifeSkillsTool] }),
    });

    let assistantMessage = completion.choices[0]?.message?.content || "";
    console.log("[Chat API] OpenAI response received, length:", assistantMessage.length);
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

    // Language check - ensure response is in English (silent regeneration if needed)
    const languageCheck = detectNonEnglishResponse(assistantMessage);
    if (languageCheck.isNonEnglish) {
      console.warn("[Chat API] Non-English response detected, regenerating:", languageCheck.detectedPatterns);

      // Attempt to regenerate with stronger English-only instruction
      try {
        const regenerationMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
          ...messages,
          { role: "assistant", content: assistantMessage },
          { role: "user", content: getEnglishOnlyRegenerationPrompt() },
        ];

        const regeneration = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: regenerationMessages,
          temperature: 0.5, // Lower temperature for more consistent output
          max_tokens: 600,
        });

        const regeneratedMessage = regeneration.choices[0]?.message?.content;
        if (regeneratedMessage) {
          // Check regenerated response is now in English
          const recheck = detectNonEnglishResponse(regeneratedMessage);
          if (!recheck.isNonEnglish) {
            assistantMessage = regeneratedMessage;
            console.log("[Chat API] Successfully regenerated response in English");
          } else {
            // Still not English - use smart fallback (don't expose to user)
            console.warn("[Chat API] Regeneration still not in English, using fallback");
            assistantMessage = getSmartFallbackResponse(message, intent);
          }
        }
      } catch (regenError) {
        console.error("[Chat API] Regeneration failed, using fallback:", regenError);
        // Silently fall back to smart response - don't expose error to user
        assistantMessage = getSmartFallbackResponse(message, intent);
      }

      // Log the language issue (non-blocking)
      logIntent(session.user.id, intent, {
        triggered: "non_english_response",
        patterns: languageCheck.detectedPatterns,
      }).catch(() => {});
    }

    // Log intent (anonymously) - don't await to avoid blocking the response
    logIntent(session.user.id, intent, {
      retrieved_careers: careerCards.length,
      retrieved_docs: helpDocs.length,
      retrieved_qa: qaItems.length,
    }).catch(() => {}); // Silently catch any logging errors

    // Save messages to persistent history (non-blocking)
    saveMessages(session.user.id, message, assistantMessage, intent).catch((err) => {
      console.error("Failed to save chat messages:", err);
    });

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
    console.error("[Chat API] Error occurred:", {
      message: error?.message || error,
      name: error?.name,
      status: error?.status,
      code: error?.code,
    });

    // Use smart fallback - we have message and intent from early parsing
    console.log("[Chat API] Using fallback due to error");
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

/**
 * Save user and assistant messages to persistent chat history
 */
async function saveMessages(
  userId: string,
  userMessage: string,
  assistantMessage: string,
  intent?: string
) {
  try {
    // Save both messages in a transaction
    await prisma.$transaction([
      prisma.aiChatMessage.create({
        data: {
          userId,
          role: "user",
          content: userMessage,
        },
      }),
      prisma.aiChatMessage.create({
        data: {
          userId,
          role: "assistant",
          content: assistantMessage,
          intent,
        },
      }),
    ]);
  } catch (error) {
    console.error("Failed to save chat messages:", error);
    // Don't fail the request if saving fails
  }
}
