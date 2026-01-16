import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch pokes (for youth to see who's interested)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role === "YOUTH") {
      // Youth sees pokes they've received
      const pokes = await prisma.poke.findMany({
        where: { youthId: session.user.id },
        include: {
          employer: {
            select: {
              id: true,
              email: true,
              employerProfile: {
                select: {
                  companyName: true,
                  companyLogo: true,
                  verified: true,
                  averageRating: true,
                },
              },
            },
          },
          job: {
            select: {
              id: true,
              title: true,
              category: true,
              payAmount: true,
              payType: true,
              startDate: true,
              endDate: true,
              dateTime: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(pokes);
    } else if (session.user.role === "EMPLOYER") {
      // Employer sees pokes they've sent
      const pokes = await prisma.poke.findMany({
        where: { employerId: session.user.id },
        include: {
          youth: {
            select: {
              id: true,
              email: true,
              youthProfile: {
                select: {
                  displayName: true,
                  availabilityStatus: true,
                  averageRating: true,
                },
              },
            },
          },
          job: {
            select: {
              id: true,
              title: true,
              startDate: true,
              endDate: true,
              dateTime: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(pokes);
    }

    return NextResponse.json({ error: "Invalid role" }, { status: 403 });
  } catch (error) {
    console.error("Failed to fetch pokes:", error);
    return NextResponse.json(
      { error: "Failed to fetch pokes" },
      { status: 500 }
    );
  }
}

// POST - Create a poke (employer reaches out to youth)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { youthId, jobId, message } = body;

    if (!youthId) {
      return NextResponse.json(
        { error: "Youth ID is required" },
        { status: 400 }
      );
    }

    // Check if youth exists and has a profile
    const youthProfile = await prisma.youthProfile.findUnique({
      where: { userId: youthId },
    });

    if (!youthProfile) {
      return NextResponse.json(
        { error: "Youth profile not found" },
        { status: 404 }
      );
    }

    // Check if poke already exists (use findFirst since jobId can be null)
    const existingPoke = await prisma.poke.findFirst({
      where: {
        employerId: session.user.id,
        youthId,
        jobId: jobId || null,
      },
    });

    if (existingPoke) {
      return NextResponse.json(
        { error: "You've already poked this youth" },
        { status: 400 }
      );
    }

    // Get employer info for notification
    const employer = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        employerProfile: {
          select: { companyName: true },
        },
      },
    });

    const poke = await prisma.poke.create({
      data: {
        employerId: session.user.id,
        youthId,
        jobId: jobId || null,
        message,
        status: "PENDING",
      },
      include: {
        youth: {
          select: {
            youthProfile: {
              select: {
                displayName: true,
              },
            },
          },
        },
      },
    });

    // Notify the youth about the poke
    await prisma.notification.create({
      data: {
        userId: youthId,
        type: "NEW_POKE",
        title: "New Poke!",
        message: `${employer?.employerProfile?.companyName || "An employer"} is interested in working with you!`,
        link: "/pokes",
      },
    });

    return NextResponse.json(poke, { status: 201 });
  } catch (error) {
    console.error("Failed to create poke:", error);
    return NextResponse.json(
      { error: "Failed to create poke" },
      { status: 500 }
    );
  }
}

// PATCH - Update poke status (youth responds to poke)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { pokeId, status } = body;

    if (!pokeId || !status) {
      return NextResponse.json(
        { error: "Poke ID and status are required" },
        { status: 400 }
      );
    }

    if (!["READ", "ACCEPTED", "DECLINED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Verify poke belongs to this youth
    const poke = await prisma.poke.findUnique({
      where: { id: pokeId },
    });

    if (!poke || poke.youthId !== session.user.id) {
      return NextResponse.json(
        { error: "Poke not found" },
        { status: 404 }
      );
    }

    const updatedPoke = await prisma.poke.update({
      where: { id: pokeId },
      data: { status },
    });

    return NextResponse.json(updatedPoke);
  } catch (error) {
    console.error("Failed to update poke:", error);
    return NextResponse.json(
      { error: "Failed to update poke" },
      { status: 500 }
    );
  }
}
