import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Valid clarity topics
const CLARITY_TOPICS = [
  "PRIMARY_VS_SECONDARY_GOAL",
  "REAL_LIFE_WORK",
  "SMALL_JOBS",
  "NEXT_STEPS",
  "NONE",
] as const;

// Validation schema
const feedbackSchema = z.object({
  role: z.enum(["TEEN_16_20", "PARENT_GUARDIAN", "ADULT_OTHER"]),
  q1: z.number().int().min(1).max(5),
  q2: z.number().int().min(1).max(5),
  q3: z.number().int().min(1).max(5),
  q4: z.number().int().min(1).max(5),
  q5: z.number().int().min(1).max(5),
  confusingText: z.string().max(500).optional().nullable(),
  clarityTopics: z
    .array(z.enum(CLARITY_TOPICS))
    .optional()
    .nullable(),
  source: z.string().max(50).optional().nullable(),
});

// Detect potential contact info in text
function containsContactInfo(text: string): boolean {
  if (!text) return false;

  const lowerText = text.toLowerCase();

  // Email pattern
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  if (emailPattern.test(text)) return true;

  // Phone number patterns (various formats)
  const phonePatterns = [
    /\b\d{8,}\b/, // 8+ consecutive digits
    /\b\d{2,4}[-.\s]?\d{2,4}[-.\s]?\d{2,4}\b/, // Formatted phone
    /\+\d{1,3}[-.\s]?\d/, // International format
  ];
  for (const pattern of phonePatterns) {
    if (pattern.test(text)) return true;
  }

  // Common contact phrases
  const contactPhrases = [
    "email me",
    "call me",
    "text me",
    "reach me",
    "contact me",
    "my number",
    "my email",
    "my phone",
  ];
  for (const phrase of contactPhrases) {
    if (lowerText.includes(phrase)) return true;
  }

  return false;
}

// Sanitize text input
function sanitizeText(text: string | null | undefined): string | null {
  if (!text) return null;

  return text
    .trim()
    .replace(/\s+/g, " ") // Collapse whitespace
    .slice(0, 500); // Enforce max length
}

// Truncate user agent
function truncateUserAgent(ua: string | null | undefined): string | null {
  if (!ua) return null;
  return ua.slice(0, 200);
}

export async function POST(request: Request) {
  try {
    // Get session (optional - feedback can be anonymous)
    const session = await getServerSession(authOptions);

    // Parse request body
    const body = await request.json();

    // Validate
    const validatedData = feedbackSchema.parse(body);

    // Sanitize free text
    const sanitizedText = sanitizeText(validatedData.confusingText);

    // Check for contact info in free text
    if (sanitizedText && containsContactInfo(sanitizedText)) {
      return NextResponse.json(
        {
          error: "Please don't include contact details. Share only general feedback.",
          field: "confusingText",
        },
        { status: 400 }
      );
    }

    // Get user agent from headers
    const userAgent = truncateUserAgent(
      request.headers.get("user-agent")
    );

    // Create feedback record
    await prisma.feedback.create({
      data: {
        createdByUserId: session?.user?.id || null,
        role: validatedData.role,
        q1: validatedData.q1,
        q2: validatedData.q2,
        q3: validatedData.q3,
        q4: validatedData.q4,
        q5: validatedData.q5,
        confusingText: sanitizedText,
        clarityTopics: validatedData.clarityTopics || [],
        source: validatedData.source || null,
        userAgent,
        appVersion: process.env.npm_package_version || null,
      },
    });

    return NextResponse.json(
      { success: true, message: "Thank you for your feedback!" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid feedback data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Feedback API. Use POST to submit feedback.",
  });
}
