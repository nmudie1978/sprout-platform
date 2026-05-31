/**
 * Safety audit logging.
 *
 * This module used to power the structured-messaging system (templates,
 * payload validation, conversation/contact gates) that belonged to the
 * removed jobs/messaging surface. All of that is gone. Only the audit-
 * logging helper remains — it is still used by the live user-blocking
 * route (src/app/api/users/[id]/block/route.ts).
 */

import { prisma } from "@/lib/prisma";

/**
 * Log a safety-related action
 */
export async function logSafetyAction(
  action: string,
  userId: string,
  actorId: string | null,
  targetType: string,
  targetId: string,
  metadata: Record<string, any>
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        actorId,
        action: action as any,
        targetType,
        targetId,
        metadata,
      },
    });
  } catch (error) {
    console.error("Failed to log safety action:", error);
    // Don't throw - logging should not block the main operation
  }
}
