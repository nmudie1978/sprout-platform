import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const markWatchedSchema = z.object({
  contentUrl: z.string().min(1).max(1000),
});

/**
 * GET /api/insights/interactions
 * Fetch all "watched" content URLs for the current user.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ watchedUrls: [] });
    }

    const interactions = await prisma.contentInteraction.findMany({
      where: { profileId: profile.id, interactionType: "watched" },
      select: { contentUrl: true },
    });

    return NextResponse.json({
      watchedUrls: interactions.map((i) => i.contentUrl),
    });
  } catch (error) {
    console.error("Error fetching content interactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch interactions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/insights/interactions
 * Mark a video as watched (upsert — idempotent).
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = markWatchedSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      );
    }

    const profile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { contentUrl } = validation.data;

    await prisma.contentInteraction.upsert({
      where: {
        profileId_contentUrl_interactionType: {
          profileId: profile.id,
          contentUrl,
          interactionType: "watched",
        },
      },
      update: {},
      create: {
        profileId: profile.id,
        contentUrl,
        interactionType: "watched",
      },
    });

    return NextResponse.json({ watched: true });
  } catch (error) {
    console.error("Error marking content as watched:", error);
    return NextResponse.json(
      { error: "Failed to mark as watched" },
      { status: 500 }
    );
  }
}
