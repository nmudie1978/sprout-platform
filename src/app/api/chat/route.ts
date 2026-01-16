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
  type IntentType,
} from "@/lib/ai-guardrails";
import { checkRateLimit, getRateLimitHeaders, RateLimits } from "@/lib/rate-limit";

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

      // Log intent (anonymously)
      await logIntent(session.user.id, intent, { triggered: "unsafe_content" });

      return NextResponse.json({
        message: fallbackResponse,
        intent,
        sources: [],
      });
    }

    // Check for off-topic
    if (intent === "off_topic") {
      const fallbackResponse = getFallbackResponse(intent);

      await logIntent(session.user.id, intent, { triggered: "off_topic" });

      return NextResponse.json({
        message: fallbackResponse,
        intent,
        sources: [],
      });
    }

    // Retrieve relevant context (RAG)
    const [careerCards, helpDocs, qaItems] = await Promise.all([
      retrieveRelevantCareerCards(message, 3),
      retrieveRelevantHelpDocs(message, 2),
      retrieveRelevantQA(message, 2),
    ]);

    const context = formatContextForPrompt(careerCards, helpDocs, qaItems);

    // Build messages for OpenAI
    const systemPrompt = getSystemPrompt(intent);
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

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Fast and affordable
      messages,
      temperature: 0.7,
      max_tokens: 300, // Keep responses concise
    });

    const assistantMessage = completion.choices[0]?.message?.content || "";

    // Safety check on response
    const safetyCheck = isResponseSafe(assistantMessage);
    if (!safetyCheck.safe) {
      console.warn("Unsafe response detected:", safetyCheck.reason);
      const fallbackResponse = getFallbackResponse(intent);

      await logIntent(session.user.id, intent, {
        triggered: "unsafe_response",
        reason: safetyCheck.reason,
      });

      return NextResponse.json({
        message: fallbackResponse,
        intent,
        sources: [],
      });
    }

    // Log intent (anonymously)
    await logIntent(session.user.id, intent, {
      retrieved_careers: careerCards.length,
      retrieved_docs: helpDocs.length,
      retrieved_qa: qaItems.length,
    });

    // Return response with sources
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
    });
  } catch (error) {
    console.error("Error in chat API:", error);

    // Check if OpenAI API key is missing
    if (error instanceof Error && error.message.includes("API key")) {
      return NextResponse.json(
        {
          error: "AI service not configured. Please add OPENAI_API_KEY to .env",
          message:
            "I'm temporarily unavailable. Please try browsing careers or asking a question in the Q&A section!",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to process message",
        message:
          "I'm having trouble right now. Please try again or explore careers and Q&A!",
      },
      { status: 500 }
    );
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
