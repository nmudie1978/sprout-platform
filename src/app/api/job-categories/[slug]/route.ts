import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET /api/job-categories/[slug] - Get a single category with templates and active jobs
// Public endpoint (no auth required for browsing)
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const includeJobs = searchParams.get('includeJobs') === 'true';
    const jobLimit = Math.min(parseInt(searchParams.get('jobLimit') || '10'), 50);

    // Find the category by slug
    const category = await prisma.standardJobCategory.findUnique({
      where: { slug },
      include: {
        templates: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    if (!category.isActive) {
      return NextResponse.json(
        { error: 'Category is not active' },
        { status: 404 }
      );
    }

    // Optionally include active jobs in this category
    let jobs: unknown[] = [];
    let totalJobs = 0;
    if (includeJobs) {
      [jobs, totalJobs] = await Promise.all([
        prisma.microJob.findMany({
          where: {
            standardCategoryId: category.id,
            status: 'POSTED',
            isPaused: false,
          },
          take: jobLimit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            description: true,
            payType: true,
            payAmount: true,
            location: true,
            startDate: true,
            duration: true,
            createdAt: true,
            postedBy: {
              select: {
                employerProfile: {
                  select: {
                    companyName: true,
                    verified: true,
                  },
                },
              },
            },
          },
        }),
        prisma.microJob.count({
          where: {
            standardCategoryId: category.id,
            status: 'POSTED',
            isPaused: false,
          },
        }),
      ]);
    }

    const response = NextResponse.json({
      category: {
        id: category.id,
        slug: category.slug,
        name: category.name,
        description: category.description,
        icon: category.icon,
        sortOrder: category.sortOrder,
      },
      templates: category.templates,
      templateCount: category.templates.length,
      ...(includeJobs && { jobs, totalJobs }),
    });

    // Cache for 2 minutes (jobs can change)
    response.headers.set(
      'Cache-Control',
      'public, max-age=120, stale-while-revalidate=300'
    );

    return response;
  } catch (error) {
    console.error('Failed to fetch category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}
