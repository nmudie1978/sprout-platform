/**
 * Safety utilities for trust & legal compliance
 * Handles age verification, guardian consent, and account status checks
 */

import { prisma } from "@/lib/prisma";
import { AccountStatus, AuditAction } from "@prisma/client";

// Age thresholds
// SAFETY INVARIANT: Platform is for ages 15-23. Under-15 is HARD BLOCKED.
export const MIN_YOUTH_AGE = 15;
export const MAX_YOUTH_AGE = 23;
export const ADULT_AGE = 18;
export const MIN_EMPLOYER_AGE = 18;

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Check if a date of birth indicates a minor (under 18)
 */
export function isMinor(dateOfBirth: Date): boolean {
  return calculateAge(dateOfBirth) < ADULT_AGE;
}

/**
 * Check if account can perform actions (is ACTIVE)
 */
export async function isAccountActive(userId: string): Promise<{
  active: boolean;
  status: AccountStatus;
  reason?: string;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      accountStatus: true,
      suspensionReason: true,
    },
  });

  if (!user) {
    return {
      active: false,
      status: AccountStatus.BANNED,
      reason: "Account not found",
    };
  }

  const active = user.accountStatus === AccountStatus.ACTIVE;

  let reason: string | undefined;
  if (!active) {
    switch (user.accountStatus) {
      case AccountStatus.ONBOARDING:
        reason = "Please complete your profile setup first";
        break;
      case AccountStatus.PENDING_VERIFICATION:
        reason = "Your account is pending verification";
        break;
      case AccountStatus.SUSPENDED:
        reason = user.suspensionReason || "Your account has been suspended";
        break;
      case AccountStatus.BANNED:
        reason = "Your account has been permanently banned";
        break;
    }
  }

  return {
    active,
    status: user.accountStatus,
    reason,
  };
}

/**
 * Safety gate result type
 */
export interface SafetyGateResult {
  allowed: boolean;
  reason?: string;
  code?: "ACCOUNT_INACTIVE" | "GUARDIAN_CONSENT_REQUIRED" | "EMPLOYER_NOT_VERIFIED" | "AGE_NOT_VERIFIED" | "BANKID_REQUIRED" | "CONVERSATION_FROZEN" | "USER_BLOCKED";
}

/**
 * Log an audit action
 */
export async function logAuditAction(params: {
  userId?: string;
  actorId?: string;
  action: AuditAction;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, string | number | boolean | null>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        actorId: params.actorId,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId,
        metadata: params.metadata as any, // Prisma Json type accepts any serializable value
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch (error) {
    // Don't throw - audit logging should not break the main flow
    console.error("Failed to log audit action:", error);
  }
}

/**
 * Record user consent (GDPR compliance)
 */
export async function recordConsent(params: {
  userId: string;
  consentType: string;
  version: string;
  granted?: boolean;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  await prisma.consentRecord.create({
    data: {
      userId: params.userId,
      consentType: params.consentType,
      version: params.version,
      granted: params.granted ?? true,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    },
  });

  // Also log to audit
  await logAuditAction({
    userId: params.userId,
    action: params.consentType === "terms"
      ? AuditAction.TERMS_ACCEPTED
      : AuditAction.PRIVACY_CONSENT_GRANTED,
    metadata: { version: params.version },
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });
}

/**
 * Generate a secure token for guardian consent
 */
export function generateGuardianToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate youth age bracket matches their date of birth
 */
export function validateAgeBracket(dateOfBirth: Date): "SIXTEEN_SEVENTEEN" | "EIGHTEEN_TWENTY" | null {
  const age = calculateAge(dateOfBirth);

  if (age >= 15 && age <= 17) {
    return "SIXTEEN_SEVENTEEN";
  } else if (age >= 18 && age <= 23) {
    return "EIGHTEEN_TWENTY";
  }

  return null; // Age out of range for youth workers
}
