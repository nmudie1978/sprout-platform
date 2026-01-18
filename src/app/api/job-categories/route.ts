import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/job-categories - List all job categories with templates
// Public endpoint (no auth required for browsing)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeTemplates = searchParams.get('includeTemplates') === 'true';
    const includeJobCounts = searchParams.get('includeJobCounts') === 'true';

    const categories = await prisma.standardJobCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: includeTemplates
        ? {
            templates: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
            },
          }
        : undefined,
    });

    // Optionally include job counts per category
    let categoriesWithCounts = categories;
    if (includeJobCounts) {
      const jobCounts = await prisma.microJob.groupBy({
        by: ['standardCategoryId'],
        where: {
          standardCategoryId: { not: null },
          status: 'POSTED',
        },
        _count: { id: true },
      });

      const countMap = new Map(
        jobCounts.map((c) => [c.standardCategoryId, c._count.id])
      );

      categoriesWithCounts = categories.map((cat) => ({
        ...cat,
        jobCount: countMap.get(cat.id) || 0,
      }));
    }

    const response = NextResponse.json({
      categories: categoriesWithCounts,
      total: categories.length,
    });

    // Cache for 5 minutes (categories don't change often)
    response.headers.set(
      'Cache-Control',
      'public, max-age=300, stale-while-revalidate=600'
    );

    return response;
  } catch (error) {
    console.error('Failed to fetch job categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job categories' },
      { status: 500 }
    );
  }
}
