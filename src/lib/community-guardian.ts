/**
 * Community Guardian utilities
 * Handles guardian assignment checks, permissions, and actions
 */

import { prisma } from "@/lib/prisma";
import { logAuditAction } from "@/lib/safety";
import { AuditAction, UserRole, CommunityReportStatus } from "@prisma/client";

/**
 * Check if a user is an admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === UserRole.ADMIN;
}

/**
 * Check if a user is a guardian for a specific community
 */
export async function isGuardianForCommunity(
  userId: string,
  communityId: string
): Promise<boolean> {
  const assignment = await prisma.communityGuardian.findFirst({
    where: {
      guardianUserId: userId,
      communityId: communityId,
      isActive: true,
    },
  });
  return !!assignment;
}

/**
 * Get the active guardian for a community (if any)
 */
export async function getGuardianForCommunity(communityId: string): Promise<{
  guardianId: string | null;
  guardianName: string | null;
  community: { id: string; name: string } | null;
}> {
  const assignment = await prisma.communityGuardian.findFirst({
    where: {
      communityId: communityId,
      isActive: true,
    },
    include: {
      guardian: {
        select: {
          id: true,
          youthProfile: { select: { displayName: true } },
          employerProfile: { select: { companyName: true } },
        },
      },
      community: {
        select: { id: true, name: true },
      },
    },
  });

  if (!assignment) {
    const community = await prisma.community.findUnique({
      where: { id: communityId },
      select: { id: true, name: true },
    });
    return { guardianId: null, guardianName: null, community };
  }

  const guardianName =
    assignment.guardian.youthProfile?.displayName ||
    assignment.guardian.employerProfile?.companyName ||
    "Community Guardian";

  return {
    guardianId: assignment.guardianUserId,
    guardianName,
    community: assignment.community,
  };
}

/**
 * Get the guardian assignment for the current user
 */
export async function getMyGuardianAssignment(userId: string): Promise<{
  isGuardian: boolean;
  communityId: string | null;
  communityName: string | null;
}> {
  const assignment = await prisma.communityGuardian.findFirst({
    where: {
      guardianUserId: userId,
      isActive: true,
    },
    include: {
      community: {
        select: { id: true, name: true },
      },
    },
  });

  if (!assignment) {
    return { isGuardian: false, communityId: null, communityName: null };
  }

  return {
    isGuardian: true,
    communityId: assignment.communityId,
    communityName: assignment.community.name,
  };
}

/**
 * Derive community from a job post
 * First checks if job has explicit communityId, otherwise uses location to find community
 */
export async function deriveCommunityFromJob(jobId: string): Promise<string | null> {
  const job = await prisma.microJob.findUnique({
    where: { id: jobId },
    select: { communityId: true, location: true },
  });

  if (!job) return null;

  // If job already has a community, use it
  if (job.communityId) return job.communityId;

  // Try to find a community by location match
  if (job.location) {
    const community = await prisma.community.findFirst({
      where: {
        location: {
          contains: job.location.split(",")[0], // Match first part of location
          mode: "insensitive",
        },
        isActive: true,
      },
      select: { id: true },
    });
    return community?.id || null;
  }

  return null;
}

/**
 * Check if a user has activity in a community (for user-pausing rules)
 * A user "belongs" to a community if they have posted or applied to jobs there
 */
export async function userHasActivityInCommunity(
  userId: string,
  communityId: string
): Promise<boolean> {
  // Check if user has posted jobs in this community
  const postedJobInCommunity = await prisma.microJob.findFirst({
    where: {
      postedById: userId,
      communityId: communityId,
    },
  });
  if (postedJobInCommunity) return true;

  // Check if user has applied to jobs in this community
  const appliedToJobInCommunity = await prisma.application.findFirst({
    where: {
      youthId: userId,
      job: {
        communityId: communityId,
      },
    },
  });
  if (appliedToJobInCommunity) return true;

  return false;
}

/**
 * Guardian action: Pause a job post
 */
export async function pauseJobPost(
  jobId: string,
  guardianUserId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const job = await prisma.microJob.findUnique({
    where: { id: jobId },
    select: { communityId: true, postedById: true, isPaused: true },
  });

  if (!job) {
    return { success: false, error: "Job not found" };
  }

  if (job.isPaused) {
    return { success: false, error: "Job is already paused" };
  }

  // Verify guardian has permission
  const isAdminUser = await isAdmin(guardianUserId);
  const isGuardian = job.communityId
    ? await isGuardianForCommunity(guardianUserId, job.communityId)
    : false;

  if (!isAdminUser && !isGuardian) {
    return { success: false, error: "Not authorized to pause this job" };
  }

  await prisma.microJob.update({
    where: { id: jobId },
    data: {
      isPaused: true,
      pausedAt: new Date(),
      pausedReason: reason,
      pausedById: guardianUserId,
    },
  });

  // Log the action
  await logAuditAction({
    userId: job.postedById,
    actorId: guardianUserId,
    action: AuditAction.JOB_PAUSED,
    targetType: "job",
    targetId: jobId,
    metadata: { reason },
  });

  // Notify the job poster
  await prisma.notification.create({
    data: {
      userId: job.postedById,
      type: "COMMUNITY_ACTION_TAKEN",
      title: "Job Posting Paused",
      message: `Your job posting has been temporarily paused by a community guardian. Reason: ${reason}`,
      link: `/jobs/${jobId}`,
    },
  });

  return { success: true };
}

/**
 * Guardian action: Unpause a job post (admin only for MVP)
 */
export async function unpauseJobPost(
  jobId: string,
  adminUserId: string
): Promise<{ success: boolean; error?: string }> {
  const isAdminUser = await isAdmin(adminUserId);
  if (!isAdminUser) {
    return { success: false, error: "Only admins can unpause jobs" };
  }

  const job = await prisma.microJob.findUnique({
    where: { id: jobId },
    select: { postedById: true, isPaused: true },
  });

  if (!job) {
    return { success: false, error: "Job not found" };
  }

  if (!job.isPaused) {
    return { success: false, error: "Job is not paused" };
  }

  await prisma.microJob.update({
    where: { id: jobId },
    data: {
      isPaused: false,
      pausedAt: null,
      pausedReason: null,
      pausedById: null,
    },
  });

  await logAuditAction({
    userId: job.postedById,
    actorId: adminUserId,
    action: AuditAction.JOB_UNPAUSED,
    targetType: "job",
    targetId: jobId,
  });

  return { success: true };
}

/**
 * Guardian action: Pause a user (admin only for MVP)
 * Guardian can only recommend escalation; actual user pausing requires admin
 */
export async function pauseUser(
  targetUserId: string,
  adminUserId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const isAdminUser = await isAdmin(adminUserId);
  if (!isAdminUser) {
    return { success: false, error: "Only admins can pause users" };
  }

  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { isPaused: true },
  });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  if (user.isPaused) {
    return { success: false, error: "User is already paused" };
  }

  await prisma.user.update({
    where: { id: targetUserId },
    data: {
      isPaused: true,
      pausedAt: new Date(),
      pausedReason: reason,
      pausedById: adminUserId,
    },
  });

  await logAuditAction({
    userId: targetUserId,
    actorId: adminUserId,
    action: AuditAction.USER_PAUSED,
    targetType: "user",
    targetId: targetUserId,
    metadata: { reason },
  });

  // Notify the user
  await prisma.notification.create({
    data: {
      userId: targetUserId,
      type: "COMMUNITY_ACTION_TAKEN",
      title: "Account Temporarily Paused",
      message: `Your account has been temporarily paused. Reason: ${reason}. Please contact support if you believe this is an error.`,
    },
  });

  return { success: true };
}

/**
 * Assign a guardian to a community (admin only)
 * Deactivates any previous active guardian for MVP single-guardian rule
 */
export async function assignGuardian(
  communityId: string,
  guardianUserId: string,
  adminUserId: string
): Promise<{ success: boolean; error?: string }> {
  const isAdminUser = await isAdmin(adminUserId);
  if (!isAdminUser) {
    return { success: false, error: "Only admins can assign guardians" };
  }

  // Check community exists
  const community = await prisma.community.findUnique({
    where: { id: communityId },
  });
  if (!community) {
    return { success: false, error: "Community not found" };
  }

  // Check user exists
  const user = await prisma.user.findUnique({
    where: { id: guardianUserId },
  });
  if (!user) {
    return { success: false, error: "User not found" };
  }

  // Deactivate any existing active guardian for this community
  await prisma.communityGuardian.updateMany({
    where: {
      communityId: communityId,
      isActive: true,
    },
    data: {
      isActive: false,
      deactivatedAt: new Date(),
    },
  });

  // Create or reactivate guardian assignment
  await prisma.communityGuardian.upsert({
    where: {
      communityId_guardianUserId: {
        communityId,
        guardianUserId,
      },
    },
    update: {
      isActive: true,
      assignedAt: new Date(),
      deactivatedAt: null,
    },
    create: {
      communityId,
      guardianUserId,
      isActive: true,
    },
  });

  // Update user role if not already a guardian or admin
  if (user.role !== UserRole.ADMIN && user.role !== UserRole.COMMUNITY_GUARDIAN) {
    await prisma.user.update({
      where: { id: guardianUserId },
      data: { role: UserRole.COMMUNITY_GUARDIAN },
    });
  }

  await logAuditAction({
    userId: guardianUserId,
    actorId: adminUserId,
    action: AuditAction.GUARDIAN_ASSIGNED,
    targetType: "community",
    targetId: communityId,
  });

  return { success: true };
}

/**
 * Report reason codes
 */
export const REPORT_REASONS = {
  INAPPROPRIATE_CONTENT: "Inappropriate or offensive content",
  SUSPECTED_SCAM: "Suspected scam or fraud",
  SAFETY_CONCERN: "Safety concern",
  HARASSMENT: "Harassment or bullying",
  SPAM: "Spam or irrelevant content",
  UNDERPAYMENT: "Pay below legal minimum",
  OTHER: "Other",
} as const;

export type ReportReason = keyof typeof REPORT_REASONS;
