import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import OpenAI from "openai";

const openai = new OpenAI();

// POST - AI-assisted message rewrite for shadow requests
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 10 rewrites per hour
    const rateLimit = checkRateLimit(
      `shadow-rewrite:${session.user.id}`,
      { interval: 3600000, maxRequests: 10 }
    );

    if (!rateLimit.success) {
      const response = NextResponse.json(
        { error: "Too many rewrite requests. Please try again later." },
        { status: 429 }
      );
      const headers = getRateLimitHeaders(rateLimit.limit, rateLimit.remaining, rateLimit.reset);
      Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      return response;
    }

    const body = await req.json();
    const { originalMessage, roleTitle, learningGoals, format } = body;

    if (!originalMessage || originalMessage.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide a message to improve" },
        { status: 400 }
      );
    }

    // Format learning goals for context
    const goalsContext = learningGoals && learningGoals.length > 0
      ? `Their learning goals are: ${learningGoals.join(", ")}.`
      : "";

    const formatContext = format
      ? `They're requesting a ${format.toLowerCase().replace("_", " ")} format.`
      : "";

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content: `You are helping a young person (aged 14-22) write a professional and respectful message to request a career shadow opportunity.

Your role is to:
1. Keep their voice and intent but make it more polished
2. Ensure the message is polite, clear, and professional
3. Keep it concise (2-3 short paragraphs max)
4. Never make it sound overly formal or corporate
5. Maintain a genuine, curious, respectful tone
6. Do not add flattery or exaggeration

Important: This is for observation only, not a job application. The youth wants to learn about the role, not get hired.

Return ONLY the improved message, nothing else.`,
        },
        {
          role: "user",
          content: `Please improve this shadow request message for a ${roleTitle || "professional"} role. ${goalsContext} ${formatContext}

Original message:
"${originalMessage}"

Please rewrite this to be more polite, professional, and clear while keeping the youth's authentic voice.`,
        },
      ],
    });

    const rewrittenMessage = response.choices[0]?.message?.content?.trim() || originalMessage;

    return NextResponse.json({
      original: originalMessage,
      rewritten: rewrittenMessage,
    });
  } catch (error) {
    console.error("Failed to rewrite message:", error);
    return NextResponse.json(
      { error: "Failed to improve message. Please try again." },
      { status: 500 }
    );
  }
}
