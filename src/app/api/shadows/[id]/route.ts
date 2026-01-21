import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch a specific shadow request
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shadow = await prisma.shadowRequest.findUnique({
      where: { id },
      include: {
        youth: {
          select: {
            id: true,
            email: true,
            youthAgeBand: true,
            youthProfile: {
              select: {
                displayName: true,
                avatarId: true,
                city: true,
                phoneNumber: true,
              },
            },
          },
        },
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
                bio: true,
              },
            },
          },
        },
        reflection: true,
      },
    });

    if (!shadow) {
      return NextResponse.json({ error: "Shadow request not found" }, { status: 404 });
    }

    // Verify user has access to this shadow request
    const isYouth = shadow.youthId === session.user.id;
    const isHost = shadow.hostId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isYouth && !isHost && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(shadow);
  } catch (error) {
    console.error("Failed to fetch shadow request:", error);
    return NextResponse.json(
      { error: "Failed to fetch shadow request" },
      { status: 500 }
    );
  }
}

// PATCH - Update a shadow request
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shadow = await prisma.shadowRequest.findUnique({
      where: { id },
      include: {
        youth: {
          select: {
            youthProfile: {
              select: { displayName: true },
            },
          },
        },
      },
    });

    if (!shadow) {
      return NextResponse.json({ error: "Shadow request not found" }, { status: 404 });
    }

    const isYouth = shadow.youthId === session.user.id;
    const isHost = shadow.hostId === session.user.id;

    const body = await req.json();

    // Youth can update their own draft or pending requests
    if (isYouth) {
      if (!["DRAFT", "PENDING"].includes(shadow.status)) {
        return NextResponse.json(
          { error: "Cannot update a request that has already been processed" },
          { status: 400 }
        );
      }

      const {
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
        hostId,
        submitRequest,
      } = body;

      // Handle submission of draft
      let newStatus = shadow.status;
      if (submitRequest && shadow.status === "DRAFT") {
        if (!roleTitle || !message || !learningGoals || learningGoals.length === 0) {
          return NextResponse.json(
            { error: "Role title, learning goals, and message are required to submit" },
            { status: 400 }
          );
        }
        if (!acceptsSafeguarding && !shadow.acceptsSafeguarding) {
          return NextResponse.json(
            { error: "You must accept the safeguarding rules to submit" },
            { status: 400 }
          );
        }
        newStatus = "PENDING";
      }

      const updated = await prisma.shadowRequest.update({
        where: { id },
        data: {
          status: newStatus,
          hostId: hostId !== undefined ? hostId : shadow.hostId,
          learningGoals: learningGoals !== undefined ? learningGoals : shadow.learningGoals,
          roleTitle: roleTitle !== undefined ? roleTitle : shadow.roleTitle,
          roleCategory: roleCategory !== undefined ? roleCategory : shadow.roleCategory,
          format: format !== undefined ? format : shadow.format,
          availabilityStart: availabilityStart !== undefined ? (availabilityStart ? new Date(availabilityStart) : null) : shadow.availabilityStart,
          availabilityEnd: availabilityEnd !== undefined ? (availabilityEnd ? new Date(availabilityEnd) : null) : shadow.availabilityEnd,
          preferredDays: preferredDays !== undefined ? preferredDays : shadow.preferredDays,
          flexibleSchedule: flexibleSchedule !== undefined ? flexibleSchedule : shadow.flexibleSchedule,
          commitsPunctuality: commitsPunctuality !== undefined ? commitsPunctuality : shadow.commitsPunctuality,
          commitsCuriosity: commitsCuriosity !== undefined ? commitsCuriosity : shadow.commitsCuriosity,
          commitsRespect: commitsRespect !== undefined ? commitsRespect : shadow.commitsRespect,
          commitsFollowRules: commitsFollowRules !== undefined ? commitsFollowRules : shadow.commitsFollowRules,
          acceptsNda: acceptsNda !== undefined ? acceptsNda : shadow.acceptsNda,
          acceptsSafeguarding: acceptsSafeguarding !== undefined ? acceptsSafeguarding : shadow.acceptsSafeguarding,
          message: message !== undefined ? message : shadow.message,
          aiAssistedDraft: aiAssistedDraft !== undefined ? aiAssistedDraft : shadow.aiAssistedDraft,
          emergencyContact: emergencyContact !== undefined ? emergencyContact : shadow.emergencyContact,
          emergencyContactPhone: emergencyContactPhone !== undefined ? emergencyContactPhone : shadow.emergencyContactPhone,
        },
      });

      // Notify host if request was just submitted
      if (submitRequest && shadow.status === "DRAFT" && updated.hostId) {
        await prisma.notification.create({
          data: {
            userId: updated.hostId,
            type: "NEW_SHADOW_REQUEST",
            title: "New Shadow Request",
            message: `${shadow.youth.youthProfile?.displayName || "A youth"} would like to shadow you as a ${updated.roleTitle}`,
            link: `/shadows/${updated.id}`,
          },
        });
      }

      return NextResponse.json(updated);
    }

    // Host can approve, decline, or schedule
    if (isHost) {
      const { action, hostMessage, declineReason, scheduledDate, scheduledStartTime, scheduledEndTime, locationName, locationAddress } = body;

      if (action === "approve") {
        if (!scheduledDate || !scheduledStartTime || !scheduledEndTime) {
          return NextResponse.json(
            { error: "Schedule details are required to approve" },
            { status: 400 }
          );
        }

        const updated = await prisma.shadowRequest.update({
          where: { id },
          data: {
            status: "APPROVED",
            hostResponseAt: new Date(),
            hostMessage: hostMessage || null,
            scheduledDate: new Date(scheduledDate),
            scheduledStartTime,
            scheduledEndTime,
            locationName: locationName || null,
            locationAddress: locationAddress || null,
            hostVerified: session.user.isVerifiedAdult || false,
          },
        });

        // Notify youth
        await prisma.notification.create({
          data: {
            userId: shadow.youthId,
            type: "SHADOW_APPROVED",
            title: "Shadow Request Approved!",
            message: `Your request to shadow as a ${shadow.roleTitle} has been approved.`,
            link: `/shadows/${id}`,
          },
        });

        return NextResponse.json(updated);
      }

      if (action === "decline") {
        const updated = await prisma.shadowRequest.update({
          where: { id },
          data: {
            status: "DECLINED",
            hostResponseAt: new Date(),
            hostMessage: hostMessage || null,
            declineReason: declineReason || null,
          },
        });

        // Notify youth
        await prisma.notification.create({
          data: {
            userId: shadow.youthId,
            type: "SHADOW_DECLINED",
            title: "Shadow Request Update",
            message: `Your request to shadow as a ${shadow.roleTitle} was not approved at this time.`,
            link: `/shadows/${id}`,
          },
        });

        return NextResponse.json(updated);
      }

      if (action === "complete") {
        if (shadow.status !== "APPROVED") {
          return NextResponse.json(
            { error: "Only approved shadows can be marked as completed" },
            { status: 400 }
          );
        }

        const { youthAttended, durationMinutes } = body;

        const updated = await prisma.shadowRequest.update({
          where: { id },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
            youthAttended: youthAttended ?? true,
            durationMinutes: durationMinutes || null,
          },
        });

        // Notify youth to complete reflection
        if (youthAttended !== false) {
          await prisma.notification.create({
            data: {
              userId: shadow.youthId,
              type: "SHADOW_COMPLETED",
              title: "Shadow Experience Completed",
              message: "How did it go? Take a moment to reflect on your experience.",
              link: `/shadows/${id}/reflection`,
            },
          });
        }

        return NextResponse.json(updated);
      }

      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch (error) {
    console.error("Failed to update shadow request:", error);
    return NextResponse.json(
      { error: "Failed to update shadow request" },
      { status: 500 }
    );
  }
}

// DELETE - Cancel a shadow request (youth only, draft/pending only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shadow = await prisma.shadowRequest.findUnique({
      where: { id },
    });

    if (!shadow) {
      return NextResponse.json({ error: "Shadow request not found" }, { status: 404 });
    }

    // Only youth can cancel their own requests
    if (shadow.youthId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Can only cancel draft or pending requests
    if (!["DRAFT", "PENDING"].includes(shadow.status)) {
      // For approved requests, mark as cancelled instead of deleting
      if (shadow.status === "APPROVED") {
        await prisma.shadowRequest.update({
          where: { id },
          data: { status: "CANCELLED" },
        });

        // Notify host
        if (shadow.hostId) {
          await prisma.notification.create({
            data: {
              userId: shadow.hostId,
              type: "SHADOW_CANCELLED",
              title: "Shadow Cancelled",
              message: `The shadow request for ${shadow.roleTitle} has been cancelled.`,
              link: `/shadows/${id}`,
            },
          });
        }

        return NextResponse.json({ message: "Shadow request cancelled" });
      }

      return NextResponse.json(
        { error: "Cannot delete a request that has been processed" },
        { status: 400 }
      );
    }

    // Delete draft/pending requests
    await prisma.shadowRequest.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Shadow request deleted" });
  } catch (error) {
    console.error("Failed to delete shadow request:", error);
    return NextResponse.json(
      { error: "Failed to delete shadow request" },
      { status: 500 }
    );
  }
}
