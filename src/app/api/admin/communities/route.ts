/**
 * Admin Communities API
 * GET - List all communities
 * POST - Create a new community
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/community-guardian";

// GET /api/admin/communities - List all communities
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdminUser = await isAdmin(session.user.id);
    if (!isAdminUser) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const communities = await prisma.community.findMany({
      include: {
        guardians: {
          where: { isActive: true },
          include: {
            guardian: {
              select: {
                id: true,
                email: true,
                youthProfile: { select: { displayName: true } },
                employerProfile: { select: { companyName: true } },
              },
            },
          },
        },
        _count: {
          select: {
            jobs: true,
            reports: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(communities);
  } catch (error) {
    console.error("Error fetching communities:", error);
    return NextResponse.json(
      { error: "Failed to fetch communities" },
      { status: 500 }
    );
  }
}

// POST /api/admin/communities - Create a new community
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdminUser = await isAdmin(session.user.id);
    if (!isAdminUser) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, description, location } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Community name is required (min 2 characters)" },
        { status: 400 }
      );
    }

    // Check for duplicate name
    const existing = await prisma.community.findUnique({
      where: { name: name.trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A community with this name already exists" },
        { status: 400 }
      );
    }

    const community = await prisma.community.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        location: location?.trim() || null,
        isActive: true,
      },
    });

    return NextResponse.json(community, { status: 201 });
  } catch (error) {
    console.error("Error creating community:", error);
    return NextResponse.json(
      { error: "Failed to create community" },
      { status: 500 }
    );
  }
}
