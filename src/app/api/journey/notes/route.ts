import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema for creating a note
const createNoteSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().min(1, "Note content is required"),
  color: z.enum(["yellow", "blue", "green", "pink", "purple", "gray"]).optional(),
  pinned: z.boolean().optional(),
  groupName: z.string().max(100).optional().nullable(),
});

// Schema for updating a note
const updateNoteSchema = z.object({
  id: z.string(),
  title: z.string().max(200).optional().nullable(),
  content: z.string().min(1).optional(),
  color: z.enum(["yellow", "blue", "green", "pink", "purple", "gray"]).optional().nullable(),
  pinned: z.boolean().optional(),
  groupName: z.string().max(100).optional().nullable(),
});

/**
 * GET /api/journey/notes
 * Fetch all notes for the current user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's profile
    const profile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Fetch active notes (not soft-deleted), pinned first, then by date
    const notes = await prisma.journeyNote.findMany({
      where: { profileId: profile.id, deletedAt: null },
      orderBy: [
        { pinned: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/journey/notes
 * Create a new note
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = createNoteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      );
    }

    // Get user's profile
    const profile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { title, content, color, pinned, groupName } = validation.data;

    const note = await prisma.journeyNote.create({
      data: {
        profileId: profile.id,
        title: title || null,
        content,
        color: color || null,
        pinned: pinned || false,
        groupName: groupName || null,
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/journey/notes
 * Update an existing note
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = updateNoteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      );
    }

    // Get user's profile
    const profile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { id, ...updateData } = validation.data;

    // Verify the note belongs to this user and is active
    const existingNote = await prisma.journeyNote.findFirst({
      where: { id, profileId: profile.id, deletedAt: null },
    });

    if (!existingNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Build update object (only include fields that were provided)
    const updateFields: Record<string, unknown> = {};
    if (updateData.title !== undefined) updateFields.title = updateData.title;
    if (updateData.content !== undefined) updateFields.content = updateData.content;
    if (updateData.color !== undefined) updateFields.color = updateData.color;
    if (updateData.pinned !== undefined) updateFields.pinned = updateData.pinned;
    if (updateData.groupName !== undefined) updateFields.groupName = updateData.groupName;

    const note = await prisma.journeyNote.update({
      where: { id },
      data: updateFields,
    });

    return NextResponse.json({ note });
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/journey/notes
 * Delete a note
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Note ID required" }, { status: 400 });
    }

    // Get user's profile
    const profile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Verify the note belongs to this user and is active
    const existingNote = await prisma.journeyNote.findFirst({
      where: { id, profileId: profile.id, deletedAt: null },
    });

    if (!existingNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Soft delete (30-day recovery window)
    await prisma.journeyNote.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
