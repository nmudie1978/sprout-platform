import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface PathStep {
  age: number;
  label: string;
}

/**
 * POST /api/career-paths/contribute
 *
 * Public endpoint — anyone can submit their career path.
 * All submissions start as PENDING and require admin approval.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      displayName,
      currentTitle,
      country,
      city,
      steps,
      careerTags,
      didAttendUniversity,
      yearsOfExperience,
      headline,
      advice,
      submittedByEmail,
    } = body;

    // Validate required fields
    if (!displayName || typeof displayName !== "string" || displayName.trim().length < 2) {
      return NextResponse.json({ error: "Display name is required (min 2 characters)" }, { status: 400 });
    }
    if (!currentTitle || typeof currentTitle !== "string") {
      return NextResponse.json({ error: "Current job title is required" }, { status: 400 });
    }
    if (!country || typeof country !== "string") {
      return NextResponse.json({ error: "Country is required" }, { status: 400 });
    }
    if (!Array.isArray(steps) || steps.length < 2) {
      return NextResponse.json({ error: "At least 2 career steps are required" }, { status: 400 });
    }
    if (!Array.isArray(careerTags) || careerTags.length === 0) {
      return NextResponse.json({ error: "At least 1 career tag is required" }, { status: 400 });
    }

    // Validate step shape
    for (const step of steps as PathStep[]) {
      if (typeof step.age !== "number" || step.age < 14 || step.age > 70) {
        return NextResponse.json({ error: `Invalid age in step: ${step.age}` }, { status: 400 });
      }
      if (!step.label || typeof step.label !== "string") {
        return NextResponse.json({ error: "Each step must have a label" }, { status: 400 });
      }
    }

    const contribution = await prisma.careerPathContribution.create({
      data: {
        displayName: displayName.trim(),
        currentTitle: currentTitle.trim(),
        country: country.trim(),
        city: city?.trim() || null,
        steps: steps as unknown as import("@prisma/client").Prisma.JsonArray,
        careerTags: careerTags.map((t: string) => t.trim().toLowerCase()),
        didAttendUniversity: !!didAttendUniversity,
        yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : null,
        headline: headline?.trim() || null,
        advice: advice?.trim() || null,
        submittedByEmail: submittedByEmail?.trim() || null,
      },
    });

    return NextResponse.json(
      { id: contribution.id, message: "Thank you! Your career path has been submitted for review." },
      { status: 201 },
    );
  } catch (err) {
    console.error("Career path contribution error:", err);
    return NextResponse.json({ error: "Failed to submit. Please try again." }, { status: 500 });
  }
}
