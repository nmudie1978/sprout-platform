import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/templates - Get all job templates for an employer
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const templates = await prisma.jobTemplate.findMany({
      where: { employerId: session.user.id },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Failed to fetch templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

// POST /api/templates - Create a new job template
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      title,
      description,
      category,
      location,
      duration,
      payAmount,
      payType,
      requirements,
    } = body;

    if (!name || !title || !category) {
      return NextResponse.json(
        { error: "Name, title, and category are required" },
        { status: 400 }
      );
    }

    const template = await prisma.jobTemplate.create({
      data: {
        employerId: session.user.id,
        name,
        title,
        description: description || "",
        category,
        location: location || "",
        duration: duration || null,
        payAmount: payAmount ? parseFloat(payAmount) : null,
        payType: payType || "FIXED",
        requirements: requirements || [],
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Failed to create template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}
