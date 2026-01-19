import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQuestionSet, getSeededQuestions } from "@/lib/interview-prep/mock-generator";
import type { GenerateOptions, Category } from "@/lib/interview-prep/types";

// GET - Get questions with user state
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") as Category | "All" | null;

    // Get seeded questions from mock generator
    const questions = getSeededQuestions(category || "All");

    // If user is logged in, fetch their question states
    let userStates: Record<string, any> = {};
    if (session?.user?.id) {
      const states = await prisma.userQuestionState.findMany({
        where: { userId: session.user.id },
      });
      userStates = states.reduce((acc, state) => {
        acc[state.questionId] = state;
        return acc;
      }, {} as Record<string, any>);
    }

    // Merge questions with user states
    const questionsWithState = questions.map(q => ({
      ...q,
      state: userStates[q.id] || null,
    }));

    return NextResponse.json({ questions: questionsWithState });
  } catch (error) {
    console.error("Error fetching interview questions:", error);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}

// POST - Generate new questions
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const options: GenerateOptions = body;

    // Generate questions using mock generator
    const questions = generateQuestionSet(options);

    // If user is logged in, save the generated set
    if (session?.user?.id) {
      await prisma.generatedQuestionSet.create({
        data: {
          userId: session.user.id,
          category: options.category,
          roleTarget: options.roleTarget,
          difficultyMix: options.difficultyMix,
          focusAreas: options.focusAreas || [],
          generatorType: "MOCK",
        },
      });
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error generating questions:", error);
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 });
  }
}
