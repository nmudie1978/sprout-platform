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
import { logAuditAction } from "@/lib/safety";
import { AuditAction } from "@prisma/client";

const RETENTION_DAYS_SOFT_DELETED = 30;
const RETENTION_DAYS_AUDIT_LOG = 365 * 3; // 3 years
// AI conversation history (Career Twin + AI chat) is data-minimised: even on
// active accounts it isn't kept indefinitely. 2 years balances continuity of
// the assistant's memory against GDPR storage-limitation.
const RETENTION_DAYS_AI_MESSAGES = 365 * 2;

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
  const aiMessageCutoff = new Date(
    startedAt.getTime() - RETENTION_DAYS_AI_MESSAGES * 24 * 60 * 60 * 1000,
  );

  const results: Record<string, number> = {};

  try {
    const savedItems = await prisma.savedItem.deleteMany({
      where: { deletedAt: { not: null, lt: softDeleteCutoff } },
    });
    results.savedItems = savedItems.count;

    // Data-minimise AI conversation history older than the retention window.
    const aiChatMessages = await prisma.aiChatMessage.deleteMany({
      where: { createdAt: { lt: aiMessageCutoff } },
    });
    results.aiChatMessages = aiChatMessages.count;

    const careerTwinMessages = await prisma.careerTwinMessage.deleteMany({
      where: { createdAt: { lt: aiMessageCutoff } },
    });
    results.careerTwinMessages = careerTwinMessages.count;

    const journeyNotes = await prisma.journeyNote.deleteMany({
      where: { deletedAt: { not: null, lt: softDeleteCutoff } },
    });
    results.journeyNotes = journeyNotes.count;

    const traitObservations = await prisma.traitObservation.deleteMany({
      where: { deletedAt: { not: null, lt: softDeleteCutoff } },
    });
    results.traitObservations = traitObservations.count;

    // Hard-delete accounts whose 30-day deletion grace window has elapsed.
    // Cascades remove all related rows. We log a completion record (with
    // actorId, since the User row is about to disappear) before deleting.
    const usersToPurge = await prisma.user.findMany({
      where: { deletedAt: { not: null, lt: softDeleteCutoff } },
      select: { id: true, email: true },
    });
    for (const u of usersToPurge) {
      await logAuditAction({
        actorId: u.id,
        action: AuditAction.DATA_DELETION_COMPLETED,
        metadata: { deletedUserId: u.id, email: u.email },
      }).catch(() => {});
    }
    if (usersToPurge.length > 0) {
      const purgeIds = usersToPurge.map((u) => u.id);
      const purgeEmails = usersToPurge.map((u) => u.email).filter(Boolean);
      // Right-to-erasure: NewsletterSubscription.userId is onDelete:SetNull,
      // so the email row would otherwise survive the account purge. Delete
      // by userId OR email so no marketing email lingers after erasure.
      const newsletters = await prisma.newsletterSubscription.deleteMany({
        where: { OR: [{ userId: { in: purgeIds } }, { email: { in: purgeEmails } }] },
      });
      results.newsletterSubscriptions = newsletters.count;
      const purged = await prisma.user.deleteMany({
        where: { id: { in: purgeIds } },
      });
      results.users = purged.count;
    } else {
      results.users = 0;
    }

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
