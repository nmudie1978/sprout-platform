import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getUserAge,
  buildAgeEligibilityFilter,
  buildNextUnlockFilter,
  getUnlockMessage,
  getPreparationTips,
} from "@/lib/age-policy/utils";
import { getNextAgeUnlock } from "@/lib/age-policy/policy";

/**
 * GET /api/jobs/recommendations/age-based
 *
 * Returns age-based job recommendations for youth users:
 * - "now": Jobs the user is currently eligible for based on age
 * - "next": Preview of jobs that will unlock at the next age threshold
 *
 * Query params:
 * - nowLimit: Max "now" jobs (default: 6, max: 20)
 * - nextLimit: Max "next" preview jobs (default: 3, max: 10)
 * - category: Optional category filter
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's age
    const userAge = await getUserAge(session.user.id);

    if (userAge === null) {
      return NextResponse.json(
        {
          error: "Date of birth not set",
          code: "DOB_REQUIRED",
          message: "Please complete your profile with your date of birth to see personalised job recommendations.",
        },
        { status: 400 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const nowLimit = Math.min(parseInt(searchParams.get("nowLimit") || "6"), 20);
    const nextLimit = Math.min(parseInt(searchParams.get("nextLimit") || "3"), 10);
    const category = searchParams.get("category");

    // Build base where clause
    const baseWhere: any = {
      status: "POSTED",
    };

    if (category) {
      baseWhere.category = category;
    }

    // Get "Now" jobs - eligible based on current age
    const nowFilter = buildAgeEligibilityFilter(userAge, false);
    const nowJobs = await prisma.microJob.findMany({
      where: {
        ...baseWhere,
        ...nowFilter,
      },
      select: {
        id: true,
        title: true,
        category: true,
        description: true,
        payAmount: true,
        payType: true,
        location: true,
        dateTime: true,
        minimumAge: true,
        riskCategory: true,
        requiresAdultPresent: true,
        images: true,
        standardCategory: {
          select: {
            id: true,
            slug: true,
            name: true,
            icon: true,
          },
        },
        postedBy: {
          select: {
            employerProfile: {
              select: {
                companyName: true,
                companyLogo: true,
                verified: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: nowLimit,
    });

    // Get "Next" jobs - preview of what unlocks at next age threshold
    const nextFilter = buildNextUnlockFilter(userAge);
    let nextJobs: any[] = [];
    let nextAgeThreshold: number | null = null;

    if (nextFilter) {
      nextAgeThreshold = getNextAgeUnlock(userAge);

      nextJobs = await prisma.microJob.findMany({
        where: {
          ...baseWhere,
          ...nextFilter,
        },
        select: {
          id: true,
          title: true,
          category: true,
          description: true,
          payAmount: true,
          payType: true,
          location: true,
          minimumAge: true,
          riskCategory: true,
          standardCategory: {
            select: {
              id: true,
              slug: true,
              name: true,
              icon: true,
            },
          },
          postedBy: {
            select: {
              employerProfile: {
                select: {
                  companyName: true,
                  verified: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: nextLimit,
      });

      // Add unlock message to each "next" job
      nextJobs = nextJobs.map((job) => ({
        ...job,
        unlockMessage: getUnlockMessage(job.minimumAge, userAge),
      }));
    }

    // Get preparation tips for the user's age
    const preparationTips = getPreparationTips(userAge);

    // Get counts for context
    const [nowCount, nextCount] = await Promise.all([
      prisma.microJob.count({
        where: {
          ...baseWhere,
          ...nowFilter,
        },
      }),
      nextFilter
        ? prisma.microJob.count({
            where: {
              ...baseWhere,
              ...nextFilter,
            },
          })
        : Promise.resolve(0),
    ]);

    return NextResponse.json({
      success: true,
      userAge,
      now: {
        jobs: nowJobs,
        totalCount: nowCount,
        message:
          nowCount > 0
            ? `${nowCount} job${nowCount !== 1 ? "s" : ""} available for you right now`
            : "No jobs currently available for your age bracket. Check back soon!",
      },
      next: nextAgeThreshold
        ? {
            ageThreshold: nextAgeThreshold,
            jobs: nextJobs,
            totalCount: nextCount,
            message:
              nextCount > 0
                ? `${nextCount} more job${nextCount !== 1 ? "s" : ""} unlock when you turn ${nextAgeThreshold}`
                : `More opportunities open up when you turn ${nextAgeThreshold}`,
            preparationTips,
          }
        : null,
    });
  } catch (error) {
    console.error("[Age-Based Recommendations API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
