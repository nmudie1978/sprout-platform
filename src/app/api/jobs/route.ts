import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jobSchema } from "@/lib/validations/job";
import { JobCategory, PayType, JobStatus } from "@prisma/client";
import { geocodeAddress } from "@/lib/geocode";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") as JobCategory | null;
    const location = searchParams.get("location");
    const status = (searchParams.get("status") as JobStatus) || "POSTED";
    const myJobs = searchParams.get("my") === "true"; // For employer to get their own jobs

    const where: any = {};

    // If employer wants their own jobs, don't filter by status
    if (myJobs && session?.user?.role === "EMPLOYER") {
      where.postedById = session.user.id;
    } else {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (location) {
      where.location = {
        contains: location,
        mode: "insensitive",
      };
    }

    // Include full applications data if employer is fetching their own jobs
    const includeApplications = myJobs && session?.user?.role === "EMPLOYER";

    const jobs = await prisma.microJob.findMany({
      where,
      select: {
        id: true,
        title: true,
        category: true,
        description: true,
        payType: true,
        payAmount: true,
        location: true,
        latitude: true,
        longitude: true,
        startDate: true,
        endDate: true,
        dateTime: true,
        duration: true,
        status: true,
        requiredTraits: true,
        images: true,
        applicationDeadline: true,
        postedById: true,
        createdAt: true,
        updatedAt: true,
        postedBy: {
          select: {
            id: true,
            employerProfile: {
              select: {
                companyName: true,
                companyLogo: true,
                verified: true,
                averageRating: true,
                totalReviews: true,
              },
            },
          },
        },
        applications: includeApplications ? {
          include: {
            youth: {
              select: {
                id: true,
                email: true,
                youthProfile: {
                  select: {
                    displayName: true,
                    completedJobsCount: true,
                    averageRating: true,
                    avatarId: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        } : undefined,
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized - No session" }, { status: 401 });
    }

    if (session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized - Not an employer" }, { status: 401 });
    }

    if (!session.user.id) {
      return NextResponse.json({ error: "Unauthorized - No user ID" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = jobSchema.parse(body);

    // Geocode the location (don't block on failure)
    let latitude: number | null = null;
    let longitude: number | null = null;

    if (validatedData.location) {
      const coords = await geocodeAddress(validatedData.location);
      if (coords) {
        latitude = coords.latitude;
        longitude = coords.longitude;
      }
    }

    const job = await prisma.microJob.create({
      data: {
        ...validatedData,
        latitude,
        longitude,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        dateTime: validatedData.dateTime ? new Date(validatedData.dateTime) : null,
        applicationDeadline: validatedData.applicationDeadline ? new Date(validatedData.applicationDeadline) : null,
        status: "POSTED",
        postedById: session.user.id,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create job:", error?.message || String(error));
    return NextResponse.json(
      { error: error?.message || "Failed to create job" },
      { status: 400 }
    );
  }
}
