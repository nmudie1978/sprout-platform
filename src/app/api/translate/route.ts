export const dynamic = "force-dynamic";
// AI/OpenAI calls can be slow; raise above Vercel's short default.
export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { checkRateLimitAsync, RateLimits } from "@/lib/rate-limit";
import { translateText, translateBatch } from "@/lib/translate/translator";
import { locales } from "@/i18n/config";

const MAX_TEXT_LENGTH = 5000;
const MAX_BATCH_SIZE = 20;

const singleSchema = z.object({
  text: z.string().min(1).max(MAX_TEXT_LENGTH),
  targetLocale: z.enum(locales),
  contentType: z.string().max(50).optional(),
});

const batchSchema = z.object({
  items: z
    .array(
      z.object({
        key: z.string().min(1),
        text: z.string().min(1).max(MAX_TEXT_LENGTH),
      })
    )
    .min(1)
    .max(MAX_BATCH_SIZE),
  targetLocale: z.enum(locales),
  contentType: z.string().max(50).optional(),
});

/** 30 requests per hour per user */
const TRANSLATION_RATE_LIMIT = { interval: 3600000, maxRequests: 30 };

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit
  const rl = await checkRateLimitAsync(
    `translate:${session.user.id}`,
    TRANSLATION_RATE_LIMIT
  );
  if (!rl.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.reset - Date.now()) / 1000)) } }
    );
  }
  // Monthly cost ceiling — caps total translation spend per account over a
  // rolling 30-day window so a single user can't drain the OpenAI budget by
  // spreading batches across days. The UI degrades to the source language.
  const monthlyRl = await checkRateLimitAsync(
    `translate-month:${session.user.id}`,
    RateLimits.AI_MONTHLY_TRANSLATE
  );
  if (!monthlyRl.success) {
    return NextResponse.json(
      { error: "Monthly translation quota reached. It resets after the rolling 30-day window." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((monthlyRl.reset - Date.now()) / 1000)) } }
    );
  }

  try {
    const body = await req.json();

    // Single text
    if ("text" in body) {
      const parsed = singleSchema.parse(body);
      const translation = await translateText(parsed.text, {
        targetLocale: parsed.targetLocale,
        contentType: parsed.contentType,
      });
      return NextResponse.json({ translation });
    }

    // Batch
    if ("items" in body) {
      const parsed = batchSchema.parse(body);
      const translations = await translateBatch(parsed.items, {
        targetLocale: parsed.targetLocale,
        contentType: parsed.contentType,
      });
      return NextResponse.json({ translations });
    }

    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: err.errors },
        { status: 400 }
      );
    }
    console.error("[translate] Error:", err);
    return NextResponse.json(
      { error: "Translation failed" },
      { status: 500 }
    );
  }
}
