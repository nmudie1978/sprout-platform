import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/questions/[id] - Get a single question
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const questionId = params.id;

    const question = await prisma.proQuestion.findUnique({
      where: { id: questionId },
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
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Only show unpublished questions to admins or the question author
    if (question.status !== "PUBLISHED") {
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (session.user.role !== "ADMIN" && question.youthId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json({ error: "Failed to fetch question" }, { status: 500 });
  }
}

// PATCH /api/questions/[id] - Update question status (admin only for moderation)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const questionId = params.id;
    const body = await req.json();
    const { status, rejectionReason } = body;

    const question = await prisma.proQuestion.update({
      where: { id: questionId },
      data: {
        status,
        moderatedBy: session.user.id,
        moderatedAt: new Date(),
        rejectionReason: status === "REJECTED" ? rejectionReason : null,
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

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
  }
}
