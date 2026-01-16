import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Simple in-memory rate limiting (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string, maxQuestions = 3, windowMs = 24 * 60 * 60 * 1000): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (userLimit.count >= maxQuestions) {
    return false;
  }

  userLimit.count++;
  return true;
}

const createQuestionSchema = z.object({
  question: z.string().min(10, "Question must be at least 10 characters").max(500, "Question too long"),
  category: z.string().optional(),
  relatedCareerIds: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

// POST /api/questions - Submit a new question
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Only youth can submit questions" }, { status: 403 });
    }

    // Rate limiting: 3 questions per 24 hours
    if (!checkRateLimit(session.user.id, 3)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. You can submit 3 questions per day." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validatedData = createQuestionSchema.parse(body);

    const question = await prisma.proQuestion.create({
      data: {
        youthId: session.user.id,
        question: validatedData.question,
        category: validatedData.category,
        relatedCareerIds: validatedData.relatedCareerIds || [],
        tags: validatedData.tags || [],
        status: "PENDING",
      },
      include: {
        youth: {
          select: {
            email: true,
            youthProfile: {
              select: {
                displayName: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error creating question:", error);
    return NextResponse.json({ error: "Failed to submit question" }, { status: 500 });
  }
}

// GET /api/questions - List questions (public answered questions, or user's own questions)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const myQuestions = searchParams.get("my") === "true";

    const where: any = {};

    // If viewing own questions
    if (myQuestions) {
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      where.youthId = session.user.id;
    } else {
      // Public view - only show published questions
      where.status = "PUBLISHED";
    }

    if (status && !myQuestions) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    const questions = await prisma.proQuestion.findMany({
      where,
      include: {
        youth: {
          select: {
            youthProfile: {
              select: {
                displayName: true,
              },
            },
          },
        },
        answers: {
          where: {
            publishedAt: { not: null },
          },
          include: {
            answerer: {
              select: {
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}
