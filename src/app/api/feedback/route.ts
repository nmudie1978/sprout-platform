export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  feedbackSchema,
  containsContactInfo,
  sanitizeMessage,
  truncateUserAgent,
} from "@/lib/feedback-validation";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const data = feedbackSchema.parse(body);

    const message = sanitizeMessage(data.message);
    if (containsContactInfo(message)) {
      return NextResponse.json(
        {
          error: "Please don't include contact details. Share only general feedback.",
          field: "message",
        },
        { status: 400 },
      );
    }

    const userAgent = truncateUserAgent(request.headers.get("user-agent"));

    await prisma.feedback.create({
      data: {
        createdByUserId: session?.user?.id || null,
        kind: data.kind,
        area: data.area || null,
        message,
        role: data.role || null,
        source: data.source || null,
        userAgent,
        appVersion: process.env.npm_package_version || null,
      },
    });

    return NextResponse.json(
      { success: true, message: "Thank you for your feedback!" },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid feedback data", details: error.errors },
        { status: 400 },
      );
    }
    console.error("Error submitting feedback:", error);
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Feedback API. Use POST to submit feedback.",
  });
}
