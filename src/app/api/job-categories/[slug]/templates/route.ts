import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET /api/job-categories/[slug]/templates - Get templates for a category
// Public endpoint (no auth required for browsing)
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

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

    const response = NextResponse.json({
      category: {
        id: category.id,
        slug: category.slug,
        name: category.name,
        description: category.description,
        icon: category.icon,
      },
      templates: category.templates,
      total: category.templates.length,
    });

    // Cache for 5 minutes
    response.headers.set(
      'Cache-Control',
      'public, max-age=300, stale-while-revalidate=600'
    );

    return response;
  } catch (error) {
    console.error('Failed to fetch category templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category templates' },
      { status: 500 }
    );
  }
}
