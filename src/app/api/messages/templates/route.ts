import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/messages/templates - Get available message templates
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role;
    const isYouth = userRole === "YOUTH";
    const isAdult = userRole === "EMPLOYER" || userRole === "ADMIN";

    // Get active templates that the user can use based on their role
    const templates = await prisma.messageTemplate.findMany({
      where: {
        isActive: true,
        // Filter by direction
        OR: [
          { direction: "ANY" },
          ...(isYouth ? [{ direction: "YOUTH_TO_ADULT" as const }] : []),
          ...(isAdult ? [{ direction: "ADULT_TO_YOUTH" as const }] : []),
        ],
      },
      select: {
        id: true,
        key: true,
        label: true,
        description: true,
        allowedFields: true,
        direction: true,
        category: true,
        sortOrder: true,
      },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    });

    // Group templates by category for easier UI rendering
    const groupedTemplates = templates.reduce(
      (acc, template) => {
        const category = template.category || "general";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(template);
        return acc;
      },
      {} as Record<string, typeof templates>
    );

    const response = NextResponse.json({
      templates,
      grouped: groupedTemplates,
      userRole,
    });

    // Cache templates for a bit since they don't change often
    response.headers.set(
      "Cache-Control",
      "private, max-age=300, stale-while-revalidate=600"
    );

    return response;
  } catch (error) {
    console.error("Failed to fetch message templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch message templates" },
      { status: 500 }
    );
  }
}
