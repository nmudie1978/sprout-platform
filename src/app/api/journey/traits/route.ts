import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const upsertSchema = z.object({
  traitId: z.string().min(1).max(50),
  observation: z.enum(["noticed", "unsure", "not_me"]),
  contextType: z.string().max(50).optional().nullable(),
  contextId: z.string().max(100).optional().nullable(),
});

/**
 * GET /api/journey/traits
 * Fetch all trait observations for the current user.
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
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const observations = await prisma.traitObservation.findMany({
      where: { profileId: profile.id },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ observations });
  } catch (error) {
    console.error("Error fetching trait observations:", error);
    return NextResponse.json(
      { error: "Failed to fetch trait observations" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/journey/traits
 * Create or update a trait observation (upsert by profileId + traitId).
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = upsertSchema.safeParse(body);

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

    const { traitId, observation, contextType, contextId } = validation.data;

    const traitObservation = await prisma.traitObservation.upsert({
      where: {
        profileId_traitId: {
          profileId: profile.id,
          traitId,
        },
      },
      update: {
        observation,
        contextType: contextType ?? null,
        contextId: contextId ?? null,
      },
      create: {
        profileId: profile.id,
        traitId,
        observation,
        contextType: contextType ?? null,
        contextId: contextId ?? null,
      },
    });

    return NextResponse.json({ observation: traitObservation }, { status: 200 });
  } catch (error) {
    console.error("Error saving trait observation:", error);
    return NextResponse.json(
      { error: "Failed to save trait observation" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/journey/traits?traitId=X
 * Remove a trait observation.
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const traitId = searchParams.get("traitId");

    if (!traitId) {
      return NextResponse.json({ error: "traitId is required" }, { status: 400 });
    }

    const profile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const existing = await prisma.traitObservation.findUnique({
      where: {
        profileId_traitId: {
          profileId: profile.id,
          traitId,
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Observation not found" }, { status: 404 });
    }

    await prisma.traitObservation.delete({
      where: {
        profileId_traitId: {
          profileId: profile.id,
          traitId,
        },
      },
    });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Error deleting trait observation:", error);
    return NextResponse.json(
      { error: "Failed to delete trait observation" },
      { status: 500 }
    );
  }
}
