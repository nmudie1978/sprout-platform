import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jobSchema } from "@/lib/validations/job";
import { JobCategory, PayType, JobStatus } from "@prisma/client";
import { geocodeAddress } from "@/lib/geocode";
import { canEmployerPostJobs } from "@/lib/safety";
import {
  validateJobCompliance,
  getWorkerAgeInfo,
  type JobInput,
} from "@/lib/compliance";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") as JobCategory | null;
    const standardCategorySlug = searchParams.get("standardCategory"); // New: filter by standard category slug
    const location = searchParams.get("location");
    const status = (searchParams.get("status") as JobStatus) || "POSTED";
    const myJobs = searchParams.get("my") === "true"; // For employer to get their own jobs

    // Pagination parameters
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

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

    // Filter by standard category slug
    if (standardCategorySlug) {
      where.standardCategory = {
        slug: standardCategorySlug,
      };
    }

    if (location) {
      where.location = {
        contains: location,
        mode: "insensitive",
      };
    }

    // Age-based filtering for youth users
    // Only show jobs that match the user's age bracket
    if (session?.user?.role === "YOUTH" && session.user.ageBracket) {
      const ageGroup = session.user.ageBracket === "SIXTEEN_SEVENTEEN" ? "15-17" : "18-20";
      where.eligibleAgeGroups = {
        has: ageGroup,
      };
    }

    // Include full applications data if employer is fetching their own jobs
    const includeApplications = myJobs && session?.user?.role === "EMPLOYER";

    // Get total count for pagination metadata
    const totalCount = await prisma.microJob.count({ where });

    const jobs = await prisma.microJob.findMany({
      where,
      skip,
      take: limit,
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
        eligibleAgeGroups: true,
        displayOrder: true,
        postedById: true,
        createdAt: true,
        updatedAt: true,
        standardCategoryId: true,
        standardTemplateId: true,
        standardCategory: {
          select: {
            id: true,
            slug: true,
            name: true,
            icon: true,
          },
        },
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
      orderBy: myJobs
        ? [
            { displayOrder: { sort: "asc", nulls: "last" } },
            { createdAt: "desc" },
          ]
        : { createdAt: "desc" },
    });

    // For employer's own jobs, apply smart sorting: active jobs first, completed/cancelled last
    const sortedJobs = myJobs
      ? jobs.sort((a, b) => {
          // If both have displayOrder, use that (already sorted by DB)
          if (a.displayOrder !== null && b.displayOrder !== null) {
            return 0; // Keep DB order
          }
          // If one has displayOrder, it comes first
          if (a.displayOrder !== null) return -1;
          if (b.displayOrder !== null) return 1;

          // Status priority: active jobs first, completed/cancelled last
          const statusPriority: Record<string, number> = {
            POSTED: 1,
            ASSIGNED: 2,
            IN_PROGRESS: 2,
            ON_HOLD: 3,
            DRAFT: 4,
            COMPLETED: 5,
            REVIEWED: 5,
            CANCELLED: 6,
          };
          const aPriority = statusPriority[a.status] || 99;
          const bPriority = statusPriority[b.status] || 99;

          if (aPriority !== bPriority) {
            return aPriority - bPriority;
          }

          // Same status priority, sort by createdAt desc
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        })
      : jobs;

    // Return with pagination metadata
    const response = NextResponse.json({
      jobs: sortedJobs,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: page * limit < totalCount,
      },
    });

    // Add cache headers for public job listings (not employer's own jobs)
    if (!myJobs) {
      response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    }

    return response;
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

    // Rate limit: 10 job postings per hour to prevent spam
    const rateLimit = checkRateLimit(
      `job-post:${session.user.id}`,
      { interval: 3600000, maxRequests: 10 }
    );

    if (!rateLimit.success) {
      const response = NextResponse.json(
        { error: "Too many job postings. Please try again later." },
        { status: 429 }
      );
      const headers = getRateLimitHeaders(rateLimit.limit, rateLimit.remaining, rateLimit.reset);
      Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      return response;
    }

    // Safety gate: Check if employer can post jobs (verified + 18+)
    const safetyCheck = await canEmployerPostJobs(session.user.id);
    if (!safetyCheck.allowed) {
      return NextResponse.json(
        {
          error: safetyCheck.reason || "Not authorized to post jobs",
          code: safetyCheck.code,
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = jobSchema.parse(body);

    // Build JobInput for compliance validation
    const jobInput: JobInput = {
      title: validatedData.title,
      category: validatedData.category,
      description: validatedData.description || "",
      payAmount: validatedData.payAmount,
      payType: validatedData.payType,
      duration: validatedData.duration ?? undefined,
      startTime: validatedData.startDate ?? validatedData.dateTime ?? undefined,
      endTime: validatedData.endDate ?? undefined,
      location: validatedData.location ?? undefined,
      isSchoolDay: body.isSchoolDay,
      isSchoolHoliday: body.isSchoolHoliday,
      requiresWorkingAlone: body.requiresWorkingAlone,
      involvesPrivateHome: body.involvesPrivateHome,
    };

    // Validate compliance for both age groups
    const resultsForMinors = validateJobCompliance(jobInput, getWorkerAgeInfo(16));
    const resultsForYoungAdults = validateJobCompliance(jobInput, getWorkerAgeInfo(19));

    const isCompliantForMinors = resultsForMinors.compliant;
    const isCompliantForYoungAdults = resultsForYoungAdults.compliant;

    // Calculate eligible age groups
    const eligibleAgeGroups: string[] = [];
    if (isCompliantForMinors) eligibleAgeGroups.push("15-17");
    if (isCompliantForYoungAdults) eligibleAgeGroups.push("18-20");

    // If neither age group can do this job, reject it with detailed violations
    if (eligibleAgeGroups.length === 0) {
      return NextResponse.json(
        {
          error: "Job does not comply with Norwegian youth labor laws",
          code: "COMPLIANCE_VIOLATION",
          violations: {
            minors: resultsForMinors.violations,
            youngAdults: resultsForYoungAdults.violations,
          },
          suggestions: [
            ...resultsForMinors.suggestions,
            ...resultsForYoungAdults.suggestions,
          ].filter((s, i, arr) => arr.indexOf(s) === i), // dedupe
        },
        { status: 400 }
      );
    }

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
        title: validatedData.title,
        category: validatedData.category,
        description: validatedData.description,
        payType: validatedData.payType,
        payAmount: validatedData.payAmount,
        location: validatedData.location,
        latitude,
        longitude,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        dateTime: validatedData.dateTime ? new Date(validatedData.dateTime) : null,
        duration: validatedData.duration,
        applicationDeadline: validatedData.applicationDeadline ? new Date(validatedData.applicationDeadline) : null,
        requiredTraits: validatedData.requiredTraits,
        images: validatedData.images,
        status: "POSTED",
        postedById: session.user.id,
        // Store eligible age groups as JSON
        eligibleAgeGroups: eligibleAgeGroups,
        // Standard taxonomy fields (optional)
        standardCategoryId: validatedData.standardCategoryId || null,
        standardTemplateId: validatedData.standardTemplateId || null,
      },
    });

    // Include compliance warnings in response
    const warnings = [
      ...resultsForMinors.warnings,
      ...resultsForYoungAdults.warnings,
    ].filter((w, i, arr) => arr.indexOf(w) === i);

    return NextResponse.json(
      {
        ...job,
        compliance: {
          eligibleAgeGroups,
          warnings: warnings.length > 0 ? warnings : undefined,
          minorsCompliant: isCompliantForMinors,
          youngAdultsCompliant: isCompliantForYoungAdults,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Failed to create job:", error?.message || String(error));
    return NextResponse.json(
      { error: error?.message || "Failed to create job" },
      { status: 400 }
    );
  }
}
