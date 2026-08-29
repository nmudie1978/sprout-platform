/**
 * Administrative audit logging.
 *
 * Separate from the safeguarding `AuditLog`: that one records what happened
 * to a young person's safety, this one records commercial and administrative
 * decisions. Keeping them apart means a GDPR export of a user's safety
 * record never sweeps up an unrelated commercial trail, and vice versa.
 *
 * Never throws. An audit write failing must not take down the action it was
 * recording — but it is logged loudly so a silent gap is noticeable.
 */

import type { OrgAuditAction, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export interface OrgAuditEntry {
  action: OrgAuditAction;
  /** "super-admin:<username>" or "user:<id>". Free text so it survives deletion. */
  actor: string;
  organisationId?: string | null;
  actorUserId?: string | null;
  targetType?: string;
  targetId?: string;
  summary?: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
}

export async function logOrgAudit(entry: OrgAuditEntry): Promise<void> {
  try {
    await prisma.orgAuditLog.create({
      data: {
        action: entry.action,
        actor: entry.actor.slice(0, 160),
        organisationId: entry.organisationId ?? null,
        actorUserId: entry.actorUserId ?? null,
        targetType: entry.targetType?.slice(0, 48) ?? null,
        targetId: entry.targetId?.slice(0, 64) ?? null,
        summary: entry.summary ?? null,
        metadata: entry.metadata,
        ipAddress: entry.ipAddress?.slice(0, 64) ?? null,
      },
    });
  } catch (error) {
    console.error("[org-audit] failed to write audit entry", entry.action, error);
  }
}

/** Actor label for an action taken through the internal Endeavrly portal. */
export function superAdminActor(username: string): string {
  return `super-admin:${username}`;
}

/** Actor label for an action taken by a signed-in Endeavrly user. */
export function userActor(userId: string, email?: string | null): string {
  return email ? `user:${userId} (${email})` : `user:${userId}`;
}

/**
 * Client IP from the standard proxy headers Vercel sets. Best-effort — used
 * for audit context only, never for authorisation.
 */
export function requestIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? null;
  return headers.get("x-real-ip");
}
