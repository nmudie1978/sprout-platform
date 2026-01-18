import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getVerifiedLearningRecommendations,
  NO_RESULTS_MESSAGE,
  NO_RESULTS_NEXT_STEPS,
} from "@/lib/verified-learning";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/learning/recommendations
 *
 * Returns verified learning recommendations for the authenticated user.
 *
 * Query params:
 * - careers: comma-separated career goals (optional)
 * - includeInternational: "true" or "false" (default: true)
 * - maxResults: number (default: 7, max: 10)
 *
 * ACCURACY RULES:
 * - Only returns VERIFIED resources
 * - Returns empty result with clear message if nothing matches
 * - Never fabricates or hallucinates courses
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Get user's age if authenticated
    let userAge = 18; // Default assumption
    let userCareerGoals: string[] = [];

    if (session?.user?.id) {
      // Fetch user profile for age and career goals
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          youthProfile: true,
          careerSnapshot: {
            select: {
              primaryInterest: true,
              exploring: true,
            },
          },
        },
      });

      // Calculate age from date of birth
      if (user?.dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(user.dateOfBirth);
        userAge = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          userAge--;
        }
      }

      // Get career goals from snapshot
      if (user?.careerSnapshot) {
        if (user.careerSnapshot.primaryInterest) {
          userCareerGoals.push(user.careerSnapshot.primaryInterest);
        }
        if (user.careerSnapshot.exploring && user.careerSnapshot.exploring.length > 0) {
          userCareerGoals.push(...user.careerSnapshot.exploring);
        }
      }
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const careersParam = searchParams.get("careers");
    const includeInternational =
      searchParams.get("includeInternational") !== "false";
    const maxResultsParam = searchParams.get("maxResults");

    // Use query param careers if provided, otherwise use user's career goals
    const careerGoals = careersParam
      ? careersParam.split(",").map((c) => c.trim())
      : userCareerGoals;

    // Parse maxResults with bounds
    let maxResults = 7;
    if (maxResultsParam) {
      const parsed = parseInt(maxResultsParam, 10);
      if (!isNaN(parsed) && parsed > 0) {
        maxResults = Math.min(parsed, 10); // Cap at 10
      }
    }

    // Get verified recommendations
    const result = await getVerifiedLearningRecommendations({
      careerGoals,
      userAge,
      includeInternational,
      maxResults,
    });

    // If no results, return with explicit messaging
    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: NO_RESULTS_MESSAGE,
        nextSteps: NO_RESULTS_NEXT_STEPS,
        localRegional: [],
        international: [],
        totalCount: 0,
        meta: {
          userAge,
          careerGoals,
          verificationNote: result.verificationNote,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      localRegional: result.localRegional,
      international: result.international,
      totalCount: result.totalCount,
      meta: {
        userAge,
        careerGoals,
        verificationNote: result.verificationNote,
      },
    });
  } catch (error) {
    console.error("[Learning Recommendations API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch learning recommendations",
        message: NO_RESULTS_MESSAGE,
        nextSteps: NO_RESULTS_NEXT_STEPS,
        localRegional: [],
        international: [],
        totalCount: 0,
      },
      { status: 500 }
    );
  }
}
