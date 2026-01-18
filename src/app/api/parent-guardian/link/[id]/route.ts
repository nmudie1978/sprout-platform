/**
 * Guardian-Worker Link Management API
 * PUT - Update link status (accept/reject) or visibility scope
 * DELETE - Revoke a link
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateLinkSchema = z.object({
  action: z.enum(["accept", "reject", "update_scope"]).optional(),
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

// PUT - Update link (accept/reject or update visibility scope)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: linkId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const link = await prisma.workerGuardianLink.findUnique({
      where: { id: linkId },
      include: {
        guardian: true,
        worker: {
          select: {
            id: true,
            youthProfile: { select: { displayName: true } },
          },
        },
      },
    });

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    const body = await req.json();
    const validated = updateLinkSchema.parse(body);

    // Check permissions based on action
    if (validated.action === "accept" || validated.action === "reject") {
      // Only worker can accept/reject link requests
      if (link.workerId !== session.user.id) {
        return NextResponse.json(
          { error: "Only the worker can accept or reject link requests" },
          { status: 403 }
        );
      }

      if (link.status !== "PENDING") {
        return NextResponse.json(
          { error: "This link is no longer pending" },
          { status: 400 }
        );
      }

      if (validated.action === "accept") {
        const updatedLink = await prisma.workerGuardianLink.update({
          where: { id: linkId },
          data: {
            status: "ACTIVE",
            consentGivenAt: new Date(),
          },
        });

        // Notify guardian if they exist
        if (link.guardian) {
          await prisma.notification.create({
            data: {
              userId: link.guardian.userId,
              type: "GUARDIAN_LINK_ACCEPTED",
              title: "Link Request Accepted",
              message: `${link.worker.youthProfile?.displayName || "The worker"} has accepted your link request`,
              link: "/parent-guardian/dashboard",
            },
          });
        }

        return NextResponse.json({
          message: "Link accepted",
          status: updatedLink.status,
        });
      } else {
        // Reject - delete the link
        await prisma.workerGuardianLink.delete({
          where: { id: linkId },
        });

        // Notify guardian if they exist
        if (link.guardian) {
          await prisma.notification.create({
            data: {
              userId: link.guardian.userId,
              type: "GUARDIAN_LINK_REJECTED",
              title: "Link Request Declined",
              message: `Your link request was declined`,
              link: "/parent-guardian/dashboard",
            },
          });
        }

        return NextResponse.json({
          message: "Link request rejected",
        });
      }
    }

    // Update visibility scope - both worker and guardian can update
    if (validated.action === "update_scope" && validated.visibilityScope) {
      // Worker can update any scope
      // Guardian can only restrict scope (not expand)
      const isWorker = link.workerId === session.user.id;
      const guardianProfile = await prisma.guardianProfile.findUnique({
        where: { userId: session.user.id },
      });
      const isGuardian = guardianProfile?.id === link.guardianId;

      if (!isWorker && !isGuardian) {
        return NextResponse.json(
          { error: "You don't have permission to modify this link" },
          { status: 403 }
        );
      }

      // Merge with existing scope
      const currentScope = link.visibilityScope as Record<string, boolean>;
      const newScope = { ...currentScope, ...validated.visibilityScope };

      const updatedLink = await prisma.workerGuardianLink.update({
        where: { id: linkId },
        data: {
          visibilityScope: newScope,
        },
      });

      return NextResponse.json({
        message: "Visibility scope updated",
        visibilityScope: updatedLink.visibilityScope,
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    console.error("[Guardian Link Update] Error:", error);
    return NextResponse.json(
      { error: "Failed to update link" },
      { status: 500 }
    );
  }
}

// DELETE - Revoke a link
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: linkId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const link = await prisma.workerGuardianLink.findUnique({
      where: { id: linkId },
      include: {
        guardian: true,
      },
    });

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // Both worker and guardian can revoke
    const isWorker = link.workerId === session.user.id;
    const guardianProfile = await prisma.guardianProfile.findUnique({
      where: { userId: session.user.id },
    });
    const isGuardian = guardianProfile?.id === link.guardianId;

    if (!isWorker && !isGuardian) {
      return NextResponse.json(
        { error: "You don't have permission to revoke this link" },
        { status: 403 }
      );
    }

    // Mark as revoked instead of deleting (for audit purposes)
    await prisma.workerGuardianLink.update({
      where: { id: linkId },
      data: {
        status: "REVOKED",
        revokedAt: new Date(),
      },
    });

    // Notify the other party (if guardian exists)
    const notifyUserId = isWorker && link.guardian ? link.guardian.userId : link.workerId;
    if (notifyUserId && notifyUserId !== session.user.id) {
      await prisma.notification.create({
        data: {
          userId: notifyUserId,
          type: "GUARDIAN_LINK_REVOKED",
          title: "Guardian Link Revoked",
          message: "A guardian-worker link has been revoked",
          link: isWorker ? "/parent-guardian/dashboard" : "/profile/guardian-settings",
        },
      });
    }

    return NextResponse.json({
      message: "Link revoked successfully",
    });
  } catch (error) {
    console.error("[Guardian Link Delete] Error:", error);
    return NextResponse.json(
      { error: "Failed to revoke link" },
      { status: 500 }
    );
  }
}
