/**
 * Message Templates API
 *
 * Returns available message templates based on user role and recipient role.
 * Templates are direction-restricted for safety:
 * - ADULT_TO_YOUTH: Only employers/admins can send
 * - YOUTH_TO_ADULT: Only youth can send
 * - ANY: Both directions allowed
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MessageTemplateDirection } from "@prisma/client";

// GET /api/message-templates - Get available templates for current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role;
    const recipientRole = req.nextUrl.searchParams.get("recipientRole");

    // Determine allowed directions based on user role
    const allowedDirections: MessageTemplateDirection[] = ["ANY"];

    if (userRole === "EMPLOYER" || userRole === "ADMIN") {
      allowedDirections.push("ADULT_TO_YOUTH");
    } else if (userRole === "YOUTH") {
      allowedDirections.push("YOUTH_TO_ADULT");
    }

    // Fetch active templates for allowed directions
    const templates = await prisma.messageTemplate.findMany({
      where: {
        isActive: true,
        direction: { in: allowedDirections },
      },
      orderBy: [
        { category: "asc" },
        { sortOrder: "asc" },
      ],
      select: {
        id: true,
        key: true,
        label: true,
        description: true,
        category: true,
        direction: true,
        allowedFields: true,
      },
    });

    return NextResponse.json({
      templates: templates.map((t) => ({
        id: t.id,
        key: t.key,
        label: t.label,
        description: t.description,
        category: t.category,
        direction: t.direction,
        allowedFields: t.allowedFields as {
          fields: Array<{
            name: string;
            type: string;
            label: string;
            required?: boolean;
            options?: string[];
            min?: number;
            max?: number;
          }>;
          renderTemplate?: string;
        },
      })),
    });
  } catch (error) {
    console.error("Failed to fetch message templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}
