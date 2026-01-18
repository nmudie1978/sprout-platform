/**
 * Guardian-Worker Link API
 * POST - Create a link request (guardian requests to link with worker, or worker generates invite)
 * GET - Get all link requests for the authenticated user
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { randomBytes } from "crypto";

const linkRequestSchema = z.object({
  // Either workerId (guardian initiating) or generateInvite (worker generating invite code)
  workerId: z.string().optional(),
  generateInvite: z.boolean().optional(),
  visibilityScope: z
    .object({
      canSeeApplications: z.boolean().optional(),
      canSeeSavedJobs: z.boolean().optional(),
      canSeeMessagesMeta: z.boolean().optional(),
      canSeeMessageContent: z.boolean().optional(),
      canSeeProfileBasics: z.boolean().optional(),
    })
    .optional(),
});

function generateInviteCode(): string {
  return randomBytes(16).toString("hex").slice(0, 8).toUpperCase();
}

// POST - Create link request
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = linkRequestSchema.parse(body);

    // Case 1: Worker generating invite code for their guardian
    if (validated.generateInvite) {
      // Verify user is a youth worker
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, dateOfBirth: true },
      });

      if (user?.role !== "YOUTH") {
        return NextResponse.json(
          { error: "Only youth workers can generate guardian invite codes" },
          { status: 403 }
        );
      }

      // Generate invite code
      const inviteCode = generateInviteCode();
      const inviteExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      // Create pending link with invite code (no guardianId yet - will be set when claimed)
      const link = await prisma.workerGuardianLink.create({
        data: {
          workerId: session.user.id,
          // guardianId is null - will be set when guardian claims the invite
          status: "PENDING",
          inviteCode,
          inviteExpiresAt,
          visibilityScope: validated.visibilityScope ?? {
            canSeeApplications: true,
            canSeeSavedJobs: true,
            canSeeMessagesMeta: true,
            canSeeMessageContent: false,
            canSeeProfileBasics: true,
          },
        },
      });

      return NextResponse.json(
        {
          inviteCode,
          expiresAt: inviteExpiresAt,
          message: "Share this code with your parent/guardian",
        },
        { status: 201 }
      );
    }

    // Case 2: Guardian linking with a worker directly (if they know the workerId)
    if (validated.workerId) {
      // Verify user has a guardian profile
      const guardianProfile = await prisma.guardianProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!guardianProfile) {
        return NextResponse.json(
          { error: "You must create a guardian profile first", code: "NO_PROFILE" },
          { status: 400 }
        );
      }

      // Check if worker exists and is a youth
      const worker = await prisma.user.findUnique({
        where: { id: validated.workerId },
        select: { role: true, youthProfile: { select: { displayName: true } } },
      });

      if (!worker || worker.role !== "YOUTH") {
        return NextResponse.json(
          { error: "Worker not found" },
          { status: 404 }
        );
      }

      // Check if link already exists
      const existingLink = await prisma.workerGuardianLink.findUnique({
        where: {
          workerId_guardianId: {
            workerId: validated.workerId,
            guardianId: guardianProfile.id,
          },
        },
      });

      if (existingLink) {
        return NextResponse.json(
          { error: "Link already exists", status: existingLink.status },
          { status: 400 }
        );
      }

      // Create pending link (worker must approve)
      const link = await prisma.workerGuardianLink.create({
        data: {
          workerId: validated.workerId,
          guardianId: guardianProfile.id,
          status: "PENDING",
          visibilityScope: validated.visibilityScope ?? {
            canSeeApplications: true,
            canSeeSavedJobs: true,
            canSeeMessagesMeta: true,
            canSeeMessageContent: false,
            canSeeProfileBasics: true,
          },
        },
      });

      // Create notification for worker
      await prisma.notification.create({
        data: {
          userId: validated.workerId,
          type: "GUARDIAN_LINK_REQUEST",
          title: "Guardian Link Request",
          message: `${guardianProfile.fullName} wants to link as your ${guardianProfile.relationship.toLowerCase()}`,
          link: "/profile/guardian-settings",
        },
      });

      return NextResponse.json(
        {
          linkId: link.id,
          status: link.status,
          message: "Link request sent. The worker must approve this request.",
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { error: "Either workerId or generateInvite must be provided" },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    console.error("[Guardian Link] Error:", error);
    return NextResponse.json(
      { error: "Failed to create link request" },
      { status: 500 }
    );
  }
}

// GET - Get link requests
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role"); // 'guardian' or 'worker'

    if (role === "guardian") {
      // Get links where user is the guardian
      const guardianProfile = await prisma.guardianProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!guardianProfile) {
        return NextResponse.json({ links: [] });
      }

      const links = await prisma.workerGuardianLink.findMany({
        where: { guardianId: guardianProfile.id },
        include: {
          worker: {
            select: {
              id: true,
              youthProfile: {
                select: { displayName: true, avatarId: true },
              },
              youthAgeBand: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({
        links: links.map((l) => ({
          id: l.id,
          status: l.status,
          visibilityScope: l.visibilityScope,
          consentGivenAt: l.consentGivenAt,
          createdAt: l.createdAt,
          worker: {
            id: l.worker.id,
            displayName: l.worker.youthProfile?.displayName || "Unknown",
            avatarId: l.worker.youthProfile?.avatarId,
            ageBand: l.worker.youthAgeBand,
          },
        })),
      });
    }

    // Default: Get links where user is the worker (youth)
    const links = await prisma.workerGuardianLink.findMany({
      where: { workerId: session.user.id },
      include: {
        guardian: {
          select: {
            id: true,
            fullName: true,
            relationship: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      links: links.map((l) => ({
        id: l.id,
        status: l.status,
        visibilityScope: l.visibilityScope,
        consentGivenAt: l.consentGivenAt,
        createdAt: l.createdAt,
        guardian: l.guardian
          ? {
              id: l.guardian.id,
              fullName: l.guardian.fullName,
              relationship: l.guardian.relationship,
            }
          : null, // Guardian not yet linked (invite pending)
      })),
    });
  } catch (error) {
    console.error("[Guardian Link] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch link requests" },
      { status: 500 }
    );
  }
}
