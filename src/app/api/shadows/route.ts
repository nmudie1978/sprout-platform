import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

// GET - Fetch shadow requests for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    if (session.user.role === "YOUTH") {
      // Youth sees their shadow requests
      const shadows = await prisma.shadowRequest.findMany({
        where: {
          youthId: session.user.id,
          ...(status ? { status: status as any } : {}),
        },
        include: {
          host: {
            select: {
              id: true,
              email: true,
              fullName: true,
              isVerifiedAdult: true,
              employerProfile: {
                select: {
                  companyName: true,
                  companyLogo: true,
                  verified: true,
                },
              },
            },
          },
          reflection: {
            select: {
              id: true,
              createdAt: true,
              overallExperience: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(shadows);
    } else if (session.user.role === "EMPLOYER") {
      // Employer/Host sees requests sent to them
      const shadows = await prisma.shadowRequest.findMany({
        where: {
          hostId: session.user.id,
          ...(status ? { status: status as any } : {}),
        },
        include: {
          youth: {
            select: {
              id: true,
              email: true,
              youthProfile: {
                select: {
                  displayName: true,
                  avatarId: true,
                  city: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(shadows);
    }

    return NextResponse.json({ error: "Invalid role" }, { status: 403 });
  } catch (error) {
    console.error("Failed to fetch shadow requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch shadow requests" },
      { status: 500 }
    );
  }
}

// POST - Create a new shadow request (youth only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 5 shadow requests per day
    const rateLimit = checkRateLimit(
      `shadow-create:${session.user.id}`,
      { interval: 86400000, maxRequests: 5 }
    );

    if (!rateLimit.success) {
      const response = NextResponse.json(
        { error: "Too many shadow requests today. Please try again tomorrow." },
        { status: 429 }
      );
      const headers = getRateLimitHeaders(rateLimit.limit, rateLimit.remaining, rateLimit.reset);
      Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      return response;
    }

    const body = await req.json();
    const {
      hostId,
      learningGoals,
      roleTitle,
      roleCategory,
      format,
      availabilityStart,
      availabilityEnd,
      preferredDays,
      flexibleSchedule,
      commitsPunctuality,
      commitsCuriosity,
      commitsRespect,
      commitsFollowRules,
      acceptsNda,
      acceptsSafeguarding,
      message,
      aiAssistedDraft,
      emergencyContact,
      emergencyContactPhone,
      isDraft,
    } = body;

    // Validate required fields for non-draft submissions
    if (!isDraft) {
      if (!roleTitle || !message || !learningGoals || learningGoals.length === 0) {
        return NextResponse.json(
          { error: "Role title, learning goals, and message are required" },
          { status: 400 }
        );
      }

      if (learningGoals.length > 2) {
        return NextResponse.json(
          { error: "Maximum 2 learning goals allowed" },
          { status: 400 }
        );
      }

      if (!acceptsSafeguarding) {
        return NextResponse.json(
          { error: "You must accept the safeguarding rules" },
          { status: 400 }
        );
      }
    }

    // Check if youth needs guardian consent (under 16)
    const youthUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        youthAgeBand: true,
        dateOfBirth: true,
      },
    });

    const requiresGuardianConsent = youthUser?.youthAgeBand === "UNDER_SIXTEEN";

    // If host is specified, verify they exist
    if (hostId) {
      const host = await prisma.user.findUnique({
        where: { id: hostId },
        select: { id: true, isVerifiedAdult: true },
      });

      if (!host) {
        return NextResponse.json(
          { error: "Host not found" },
          { status: 404 }
        );
      }
    }

    const shadow = await prisma.shadowRequest.create({
      data: {
        youthId: session.user.id,
        hostId: hostId || null,
        status: isDraft ? "DRAFT" : "PENDING",
        learningGoals: learningGoals || [],
        roleTitle: roleTitle || "",
        roleCategory: roleCategory || null,
        format: format || "WALKTHROUGH",
        availabilityStart: availabilityStart ? new Date(availabilityStart) : null,
        availabilityEnd: availabilityEnd ? new Date(availabilityEnd) : null,
        preferredDays: preferredDays || [],
        flexibleSchedule: flexibleSchedule ?? true,
        commitsPunctuality: commitsPunctuality ?? true,
        commitsCuriosity: commitsCuriosity ?? true,
        commitsRespect: commitsRespect ?? true,
        commitsFollowRules: commitsFollowRules ?? true,
        acceptsNda: acceptsNda ?? false,
        acceptsSafeguarding: acceptsSafeguarding ?? false,
        message: message || "",
        aiAssistedDraft: aiAssistedDraft ?? false,
        requiresGuardianConsent,
        emergencyContact: emergencyContact || null,
        emergencyContactPhone: emergencyContactPhone || null,
        isObservationOnly: true,
        publicWorkplace: true,
        noPrivateTransport: true,
        noIsolatedScenarios: true,
      },
    });

    // If not a draft and host is specified, notify the host
    if (!isDraft && hostId) {
      const youthProfile = await prisma.youthProfile.findUnique({
        where: { userId: session.user.id },
        select: { displayName: true },
      });

      await prisma.notification.create({
        data: {
          userId: hostId,
          type: "NEW_SHADOW_REQUEST",
          title: "New Shadow Request",
          message: `${youthProfile?.displayName || "A youth"} would like to shadow you as a ${roleTitle}`,
          link: `/shadows/${shadow.id}`,
        },
      });
    }

    return NextResponse.json(shadow, { status: 201 });
  } catch (error) {
    console.error("Failed to create shadow request:", error);
    return NextResponse.json(
      { error: "Failed to create shadow request" },
      { status: 500 }
    );
  }
}
