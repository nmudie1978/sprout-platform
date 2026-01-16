import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createAnswerSchema = z.object({
  answerText: z.string().min(50, "Answer must be at least 50 characters").max(2000, "Answer too long"),
  professionalTitle: z.string().optional(),
  professionalCompany: z.string().optional(),
  yearsExperience: z.number().min(0).max(50).optional(),
});

// POST /api/questions/[id]/answer - Submit an answer (admin or approved professional)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can answer for now (can expand to verified professionals later)
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only professionals can answer questions" }, { status: 403 });
    }

    const questionId = params.id;

    // Check question exists and is in PENDING status
    const question = await prisma.proQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    if (question.status === "REJECTED") {
      return NextResponse.json({ error: "Cannot answer rejected question" }, { status: 400 });
    }

    const body = await req.json();
    const validatedData = createAnswerSchema.parse(body);

    // Create answer and update question status
    const answer = await prisma.proAnswer.create({
      data: {
        questionId,
        answeredBy: session.user.id,
        answerText: validatedData.answerText,
        professionalTitle: validatedData.professionalTitle,
        professionalCompany: validatedData.professionalCompany,
        yearsExperience: validatedData.yearsExperience,
        publishedAt: new Date(), // Auto-publish (can add review step later)
      },
      include: {
        answerer: {
          select: {
            email: true,
          },
        },
        question: true,
      },
    });

    // Update question status to PUBLISHED
    await prisma.proQuestion.update({
      where: { id: questionId },
      data: {
        status: "PUBLISHED",
        moderatedBy: session.user.id,
        moderatedAt: new Date(),
      },
    });

    return NextResponse.json(answer, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error creating answer:", error);
    return NextResponse.json({ error: "Failed to submit answer" }, { status: 500 });
  }
}

// GET /api/questions/[id]/answer - Get answers for a question
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questionId = params.id;

    const answers = await prisma.proAnswer.findMany({
      where: {
        questionId,
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
    });

    return NextResponse.json(answers);
  } catch (error) {
    console.error("Error fetching answers:", error);
    return NextResponse.json({ error: "Failed to fetch answers" }, { status: 500 });
  }
}
