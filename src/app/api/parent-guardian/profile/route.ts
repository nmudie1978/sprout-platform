/**
 * Parent/Guardian Profile API
 * GET - Get the authenticated user's guardian profile
 * POST - Create a guardian profile
 * PUT - Update the guardian profile
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const guardianProfileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  relationship: z.enum(["PARENT", "GUARDIAN"]),
});

// GET - Get guardian profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.guardianProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        workerLinks: {
          include: {
            worker: {
              select: {
                id: true,
                email: true,
                youthProfile: {
                  select: {
                    displayName: true,
                    avatarId: true,
                  },
                },
                dateOfBirth: true,
                youthAgeBand: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Guardian profile not found", code: "NO_PROFILE" },
        { status: 404 }
      );
    }

    // Transform worker links to include age info without exposing full DOB
    const transformedLinks = profile.workerLinks.map((link) => {
      let workerAge: number | undefined;
      if (link.worker.dateOfBirth) {
        const today = new Date();
        const birth = new Date(link.worker.dateOfBirth);
        workerAge = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          workerAge--;
        }
      }

      return {
        id: link.id,
        status: link.status,
        consentGivenAt: link.consentGivenAt,
        visibilityScope: link.visibilityScope,
        createdAt: link.createdAt,
        worker: {
          id: link.worker.id,
          displayName: link.worker.youthProfile?.displayName || "Unknown",
          avatarId: link.worker.youthProfile?.avatarId,
          ageBand: link.worker.youthAgeBand,
          age: workerAge,
        },
      };
    });

    return NextResponse.json({
      id: profile.id,
      fullName: profile.fullName,
      relationship: profile.relationship,
      createdAt: profile.createdAt,
      linkedWorkers: transformedLinks,
    });
  } catch (error) {
    console.error("[Parent-Guardian Profile] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch guardian profile" },
      { status: 500 }
    );
  }
}

// POST - Create guardian profile
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if profile already exists
    const existing = await prisma.guardianProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Guardian profile already exists", code: "PROFILE_EXISTS" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validated = guardianProfileSchema.parse(body);

    const profile = await prisma.guardianProfile.create({
      data: {
        userId: session.user.id,
        fullName: validated.fullName,
        relationship: validated.relationship,
      },
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    console.error("[Parent-Guardian Profile] Error:", error);
    return NextResponse.json(
      { error: "Failed to create guardian profile" },
      { status: 500 }
    );
  }
}

// PUT - Update guardian profile
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.guardianProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Guardian profile not found", code: "NO_PROFILE" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validated = guardianProfileSchema.partial().parse(body);

    const profile = await prisma.guardianProfile.update({
      where: { userId: session.user.id },
      data: validated,
    });

    return NextResponse.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    console.error("[Parent-Guardian Profile] Error:", error);
    return NextResponse.json(
      { error: "Failed to update guardian profile" },
      { status: 500 }
    );
  }
}
