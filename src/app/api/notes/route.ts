import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/notes - Get notes for a specific worker or all notes
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const youthId = searchParams.get("youthId");

    const notes = await prisma.workerNote.findMany({
      where: {
        employerId: session.user.id,
        ...(youthId ? { youthId } : {}),
      },
      include: {
        youth: {
          select: {
            id: true,
            youthProfile: {
              select: {
                displayName: true,
                avatarId: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const formattedNotes = notes.map((note) => ({
      id: note.id,
      youthId: note.youthId,
      displayName: note.youth.youthProfile?.displayName || "Unknown",
      avatarId: note.youth.youthProfile?.avatarId,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    }));

    return NextResponse.json(formattedNotes);
  } catch (error) {
    console.error("Failed to fetch notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

// POST /api/notes - Create or update a note for a worker
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { youthId, content } = body;

    if (!youthId || !content) {
      return NextResponse.json(
        { error: "Youth ID and content are required" },
        { status: 400 }
      );
    }

    // Check if note already exists
    const existingNote = await prisma.workerNote.findUnique({
      where: {
        employerId_youthId: {
          employerId: session.user.id,
          youthId,
        },
      },
    });

    let note;
    if (existingNote) {
      // Update existing note
      note = await prisma.workerNote.update({
        where: { id: existingNote.id },
        data: { content },
      });
    } else {
      // Create new note
      note = await prisma.workerNote.create({
        data: {
          employerId: session.user.id,
          youthId,
          content,
        },
      });
    }

    return NextResponse.json(note, { status: existingNote ? 200 : 201 });
  } catch (error) {
    console.error("Failed to save note:", error);
    return NextResponse.json(
      { error: "Failed to save note" },
      { status: 500 }
    );
  }
}

// DELETE /api/notes - Delete a note
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const youthId = searchParams.get("youthId");

    if (!youthId) {
      return NextResponse.json(
        { error: "Youth ID is required" },
        { status: 400 }
      );
    }

    await prisma.workerNote.delete({
      where: {
        employerId_youthId: {
          employerId: session.user.id,
          youthId,
        },
      },
    });

    return NextResponse.json({ message: "Note deleted" });
  } catch (error) {
    console.error("Failed to delete note:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
