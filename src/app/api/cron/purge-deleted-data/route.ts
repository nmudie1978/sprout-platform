/**
 * 30-day data retention purge.
 *
 * Runs daily via Vercel Cron. Hard-deletes rows that were soft-deleted
 * more than 30 days ago on the tables that carry a `deletedAt` column:
 *
 *   - SavedItem       (users' saved library items)
 *   - JourneyNote     (free-form notes)
 *   - TraitObservation (strengths observations)
 *
 * Also prunes audit logs older than 3 years, matching the retention
 * commitment in /legal/privacy §8.
 *
 * Authorisation: Vercel Cron sends a bearer token from CRON_SECRET.
 * The request is rejected if the header is missing or wrong.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const RETENTION_DAYS_SOFT_DELETED = 30;
const RETENTION_DAYS_AUDIT_LOG = 365 * 3; // 3 years

function authorise(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    // In production we insist on a secret. In dev we allow the endpoint
    // to run manually so you can test it with curl without setup.
    return process.env.NODE_ENV !== "production";
  }

  // Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`.
  const header = req.headers.get("authorization") || "";
  return header === `Bearer ${expected}`;
}

export async function GET(req: NextRequest) {
  if (!authorise(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const startedAt = new Date();
  const softDeleteCutoff = new Date(
    startedAt.getTime() - RETENTION_DAYS_SOFT_DELETED * 24 * 60 * 60 * 1000,
  );
  const auditLogCutoff = new Date(
    startedAt.getTime() - RETENTION_DAYS_AUDIT_LOG * 24 * 60 * 60 * 1000,
  );

  const results: Record<string, number> = {};

  try {
    const savedItems = await prisma.savedItem.deleteMany({
      where: { deletedAt: { not: null, lt: softDeleteCutoff } },
    });
    results.savedItems = savedItems.count;

    const journeyNotes = await prisma.journeyNote.deleteMany({
      where: { deletedAt: { not: null, lt: softDeleteCutoff } },
    });
    results.journeyNotes = journeyNotes.count;

    const traitObservations = await prisma.traitObservation.deleteMany({
      where: { deletedAt: { not: null, lt: softDeleteCutoff } },
    });
    results.traitObservations = traitObservations.count;

    const auditLogs = await prisma.auditLog.deleteMany({
      where: { createdAt: { lt: auditLogCutoff } },
    });
    results.auditLogs = auditLogs.count;

    const durationMs = Date.now() - startedAt.getTime();
    console.log(
      `[cron/purge-deleted-data] done in ${durationMs}ms`,
      JSON.stringify(results),
    );

    return NextResponse.json({
      success: true,
      startedAt: startedAt.toISOString(),
      durationMs,
      softDeleteCutoff: softDeleteCutoff.toISOString(),
      auditLogCutoff: auditLogCutoff.toISOString(),
      deleted: results,
    });
  } catch (error) {
    console.error("[cron/purge-deleted-data] failed:", error);
    return NextResponse.json(
      { error: "Purge failed", message: String(error) },
      { status: 500 },
    );
  }
}
