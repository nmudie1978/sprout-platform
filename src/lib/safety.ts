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
 * Check if an employer is verified to hire minors
 * Requirements: EID verified + age 18+
 */
export async function isEmployerVerified(userId: string): Promise<{
  verified: boolean;
  eidVerified: boolean;
  ageVerified: boolean;
  age: number | null;
  reason?: string;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      dateOfBirth: true,
      employerProfile: {
        select: {
          eidVerified: true,
          ageVerified: true,
        },
      },
    },
  });

  if (!user) {
    return {
      verified: false,
      eidVerified: false,
      ageVerified: false,
      age: null,
      reason: "User not found",
    };
  }

  const age = user.dateOfBirth ? calculateAge(user.dateOfBirth) : null;
  const eidVerified = user.employerProfile?.eidVerified ?? false;
  const ageVerified = user.employerProfile?.ageVerified ?? false;

  // For MVP: require age verification but EID is optional
  // In production: require both EID + age verification
  const verified = ageVerified && age !== null && age >= MIN_EMPLOYER_AGE;

  let reason: string | undefined;
  if (!verified) {
    if (!ageVerified) {
      reason = "Age verification required";
    } else if (age !== null && age < MIN_EMPLOYER_AGE) {
      reason = "Must be 18 or older to hire workers";
    }
  }

  return {
    verified,
    eidVerified,
    ageVerified,
    age,
    reason,
  };
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
 * Check if an employer can post jobs
 * Requirements:
 * - Account is ACTIVE
 * - Age verified (18+)
 */
export async function canEmployerPostJobs(userId: string): Promise<SafetyGateResult> {
  // Check account status
  const accountCheck = await isAccountActive(userId);
  if (!accountCheck.active) {
    return {
      allowed: false,
      reason: accountCheck.reason,
      code: "ACCOUNT_INACTIVE",
    };
  }

  // Check employer verification
  const verificationCheck = await isEmployerVerified(userId);
  if (!verificationCheck.ageVerified) {
    return {
      allowed: false,
      reason: "Age verification is required to post jobs",
      code: "AGE_NOT_VERIFIED",
    };
  }

  if (verificationCheck.age !== null && verificationCheck.age < MIN_EMPLOYER_AGE) {
    return {
      allowed: false,
      reason: "You must be 18 or older to post jobs",
      code: "EMPLOYER_NOT_VERIFIED",
    };
  }

  return { allowed: true };
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
