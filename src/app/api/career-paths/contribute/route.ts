import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimitAsync, RateLimits } from "@/lib/rate-limit";

// Upper bound on any single submitted field — prose prompts are long-form but
// not unbounded; caps the DB-flood / huge-payload abuse surface.
const MAX_FIELD_LEN = 4000;

/**
 * POST /api/career-paths/contribute
 *
 * Public endpoint — anyone can submit their career path.
 * All submissions start as PENDING and require admin approval.
 * This is the parent injection model: prose prompts, not a step-by-step timeline.
 */
export async function POST(req: NextRequest) {
  try {
    // IP rate limit: this is a public, unauthenticated write — throttle so it
    // can't be used to flood the admin-review queue / the DB.
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    const rl = await checkRateLimitAsync(`contribute:${ip}`, RateLimits.STRICT);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many submissions from this network. Please try again later." },
        { status: 429 },
      );
    }

    const body = await req.json();

    const {
      displayName,
      currentTitle,
      country,
      city,
      howIGotHere,
      whatIStudied,
      firstSalary,
      hardestPart,
      adviceToSeventeen,
      realityOfJob,
      careerTags,
      submittedByEmail,
    } = body;

    const requireString = (value: unknown, label: string, min = 2) => {
      if (typeof value !== "string" || value.trim().length < min) {
        return `${label} is required (min ${min} characters)`;
      }
      if (value.length > MAX_FIELD_LEN) {
        return `${label} is too long (max ${MAX_FIELD_LEN} characters)`;
      }
      return null;
    };

    const errors = [
      requireString(displayName, "Display name"),
      requireString(currentTitle, "Current role"),
      requireString(country, "Country"),
      requireString(howIGotHere, "How I got here", 10),
      requireString(whatIStudied, "What I studied", 2),
      requireString(firstSalary, "First salary", 2),
      requireString(hardestPart, "Hardest part of the journey", 10),
      requireString(adviceToSeventeen, "Advice to your 17-year-old self", 10),
      requireString(realityOfJob, "Reality of the job", 10),
    ].filter(Boolean) as string[];

    if (errors.length > 0) {
      return NextResponse.json({ error: errors[0] }, { status: 400 });
    }

    if (!Array.isArray(careerTags) || careerTags.length === 0) {
      return NextResponse.json({ error: "At least 1 career tag is required" }, { status: 400 });
    }
    if (careerTags.length > 20) {
      return NextResponse.json({ error: "Too many career tags (max 20)" }, { status: 400 });
    }
    if (typeof submittedByEmail === "string" && submittedByEmail.length > 200) {
      return NextResponse.json({ error: "Email is too long" }, { status: 400 });
    }

    const contribution = await prisma.careerPathContribution.create({
      data: {
        displayName: displayName.trim(),
        currentTitle: currentTitle.trim(),
        country: country.trim(),
        city: city?.trim() || null,
        howIGotHere: howIGotHere.trim(),
        whatIStudied: whatIStudied.trim(),
        firstSalary: firstSalary.trim(),
        hardestPart: hardestPart.trim(),
        adviceToSeventeen: adviceToSeventeen.trim(),
        realityOfJob: realityOfJob.trim(),
        careerTags: careerTags.map((t: string) => t.trim().toLowerCase()),
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
