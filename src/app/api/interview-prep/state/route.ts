import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Get user's question states
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ states: {} });
    }

    const states = await prisma.userQuestionState.findMany({
      where: { userId: session.user.id },
    });

    const statesMap = states.reduce((acc, state) => {
      acc[state.questionId] = state;
      return acc;
    }, {} as Record<string, any>);

    // Calculate stats
    const practiced = states.filter(s => s.practicedCount > 0);
    const saved = states.filter(s => s.saved);
    const confidences = practiced.filter(s => s.confidence).map(s => s.confidence!);

    const stats = {
      totalPracticed: practiced.length,
      totalSaved: saved.length,
      avgConfidence: confidences.length > 0
        ? Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length * 10) / 10
        : 0,
    };

    return NextResponse.json({ states: statesMap, stats });
  } catch (error) {
    console.error("Error fetching question states:", error);
    return NextResponse.json({ error: "Failed to fetch states" }, { status: 500 });
  }
}

// POST - Update a question state (save or mark practiced)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { questionId, action, confidence, notes } = body;

    if (!questionId || !action) {
      return NextResponse.json({ error: "questionId and action are required" }, { status: 400 });
    }

    // Find existing state or create new one
    let state = await prisma.userQuestionState.findFirst({
      where: {
        userId: session.user.id,
        questionId,
      },
    });

    if (action === "toggle_save") {
      if (state) {
        state = await prisma.userQuestionState.update({
          where: { id: state.id },
          data: { saved: !state.saved },
        });
      } else {
        state = await prisma.userQuestionState.create({
          data: {
            userId: session.user.id,
            questionId,
            saved: true,
          },
        });
      }
    } else if (action === "mark_practiced") {
      if (state) {
        state = await prisma.userQuestionState.update({
          where: { id: state.id },
          data: {
            practicedCount: { increment: 1 },
            lastPracticedAt: new Date(),
            confidence: confidence ?? state.confidence,
            notes: notes ?? state.notes,
          },
        });
      } else {
        state = await prisma.userQuestionState.create({
          data: {
            userId: session.user.id,
            questionId,
            practicedCount: 1,
            lastPracticedAt: new Date(),
            confidence,
            notes,
          },
        });
      }
    } else if (action === "update_notes") {
      if (state) {
        state = await prisma.userQuestionState.update({
          where: { id: state.id },
          data: { notes },
        });
      } else {
        state = await prisma.userQuestionState.create({
          data: {
            userId: session.user.id,
            questionId,
            notes,
          },
        });
      }
    }

    return NextResponse.json({ success: true, state });
  } catch (error) {
    console.error("Error updating question state:", error);
    return NextResponse.json({ error: "Failed to update state" }, { status: 500 });
  }
}
