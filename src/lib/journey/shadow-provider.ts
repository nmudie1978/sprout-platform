/**
 * Career Shadow Provider Interface
 *
 * Defines the interface for shadow request providers.
 * Includes a mock provider for testing and development.
 */

import { prisma } from '@/lib/prisma';
import { TimelineEvents } from './timeline-service';
import type { ShadowFormat as PrismaShadowFormat, ShadowRequestStatus as PrismaRequestStatus, ShadowLearningGoal } from '@prisma/client';

// ============================================
// TYPES
// ============================================

// Match Prisma enum values
export type ShadowRequestStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'DECLINED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

// Match Prisma enum values
export type ShadowFormat = 'WALKTHROUGH' | 'HALF_DAY' | 'FULL_DAY';

export interface ShadowHost {
  id: string;
  name: string;
  company?: string;
  role: string;
  verified: boolean;
  avatarUrl?: string;
}

export interface ShadowRequest {
  id: string;
  status: ShadowRequestStatus;
  createdAt: string;
  updatedAt: string;

  // Youth info (requester)
  youthId: string;

  // Host info
  hostId?: string;
  host?: ShadowHost;

  // Request details
  roleTitle: string;
  roleCategory?: string;
  learningGoals: string[];
  format: ShadowFormat;
  message?: string;

  // Availability
  availabilityStart?: string;
  availabilityEnd?: string;
  preferredDays: string[];

  // Scheduled details
  scheduledDate?: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  locationName?: string;

  // Response
  hostMessage?: string;
  declineReason?: string;

  // Completion
  completedAt?: string;
  durationMinutes?: number;
}

export interface ShadowSummary {
  requestsTotal: number;
  requestsPending: number;
  requestsApproved: number;
  requestsCompleted: number;
  requestsDeclined: number;
  skipped: boolean;
  skipReason: string | null;
  lastUpdatedAt: string | null;
}

// ============================================
// PROVIDER INTERFACE
// ============================================

export interface ShadowProvider {
  // Query operations
  getRequests(youthId: string): Promise<ShadowRequest[]>;
  getRequestById(requestId: string, youthId: string): Promise<ShadowRequest | null>;
  getSummary(youthId: string): Promise<ShadowSummary>;

  // Create/Update operations
  createRequest(youthId: string, data: CreateShadowRequestInput): Promise<ShadowRequest>;
  updateRequest(requestId: string, youthId: string, data: UpdateShadowRequestInput): Promise<ShadowRequest | null>;
  submitRequest(requestId: string, youthId: string): Promise<ShadowRequest | null>;
  cancelRequest(requestId: string, youthId: string): Promise<boolean>;

  // Skip functionality
  skipShadowStep(youthId: string, reason: string): Promise<void>;
  hasSkippedShadowStep(youthId: string): Promise<{ skipped: boolean; reason: string | null }>;
}

export interface CreateShadowRequestInput {
  roleTitle: string;
  roleCategory?: string;
  learningGoals: string[];
  format: ShadowFormat;
  message?: string;
  availabilityStart?: Date;
  availabilityEnd?: Date;
  preferredDays?: string[];
}

export interface UpdateShadowRequestInput {
  learningGoals?: string[];
  format?: ShadowFormat;
  message?: string;
  availabilityStart?: Date;
  availabilityEnd?: Date;
  preferredDays?: string[];
}

// ============================================
// DATABASE PROVIDER (Real Implementation)
// ============================================

export class DatabaseShadowProvider implements ShadowProvider {
  async getRequests(youthId: string): Promise<ShadowRequest[]> {
    const requests = await prisma.shadowRequest.findMany({
      where: { youthId },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((r) => this.formatRequest(r));
  }

  async getRequestById(requestId: string, youthId: string): Promise<ShadowRequest | null> {
    const request = await prisma.shadowRequest.findFirst({
      where: { id: requestId, youthId },
    });

    return request ? this.formatRequest(request) : null;
  }

  async getSummary(youthId: string): Promise<ShadowSummary> {
    const [counts, lastRequest, profile] = await Promise.all([
      prisma.shadowRequest.groupBy({
        by: ['status'],
        where: { youthId },
        _count: { status: true },
      }),
      prisma.shadowRequest.findFirst({
        where: { youthId },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      }),
      prisma.youthProfile.findUnique({
        where: { userId: youthId },
        select: { journeySkippedSteps: true },
      }),
    ]);

    const countMap: Record<string, number> = {};
    for (const c of counts) {
      countMap[c.status] = c._count.status;
    }

    // Check if shadow step was skipped
    const skippedSteps = (profile?.journeySkippedSteps as Record<string, { reason: string }>) || {};
    const shadowSkip = skippedSteps['CAREER_SHADOW_REQUEST'];

    return {
      requestsTotal: Object.values(countMap).reduce((a, b) => a + b, 0),
      requestsPending: countMap['PENDING'] || 0,
      requestsApproved: countMap['APPROVED'] || 0,
      requestsCompleted: countMap['COMPLETED'] || 0,
      requestsDeclined: countMap['DECLINED'] || 0,
      skipped: Boolean(shadowSkip),
      skipReason: shadowSkip?.reason || null,
      lastUpdatedAt: lastRequest?.updatedAt.toISOString() || null,
    };
  }

  async createRequest(youthId: string, data: CreateShadowRequestInput): Promise<ShadowRequest> {
    // Map learning goals to Prisma enum values
    const learningGoalsEnum = data.learningGoals.map((goal) => {
      // Map string goals to enum values - these should match ShadowLearningGoal enum
      const goalMap: Record<string, string> = {
        'DAILY_WORK': 'DAILY_WORK',
        'SKILLS_USED': 'SKILLS_USED',
        'WORK_ENVIRONMENT': 'WORK_ENVIRONMENT',
        'CAREER_PATH': 'CAREER_PATH',
        'EDUCATION_REQUIRED': 'EDUCATION_REQUIRED',
        'CHALLENGES': 'CHALLENGES',
      };
      return goalMap[goal] || goal;
    });

    const request = await prisma.shadowRequest.create({
      data: {
        youthId,
        roleTitle: data.roleTitle,
        roleCategory: data.roleCategory,
        learningGoals: learningGoalsEnum as ShadowLearningGoal[],
        format: data.format as PrismaShadowFormat,
        message: data.message || '',
        availabilityStart: data.availabilityStart,
        availabilityEnd: data.availabilityEnd,
        preferredDays: data.preferredDays || [],
        status: 'DRAFT' as PrismaRequestStatus,
      },
    });

    return this.formatRequest(request);
  }

  async updateRequest(
    requestId: string,
    youthId: string,
    data: UpdateShadowRequestInput
  ): Promise<ShadowRequest | null> {
    const existing = await prisma.shadowRequest.findFirst({
      where: { id: requestId, youthId },
    });

    if (!existing || existing.status !== 'DRAFT') return null;

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (data.learningGoals) {
      updateData.learningGoals = data.learningGoals;
    }
    if (data.format) {
      updateData.format = data.format as PrismaShadowFormat;
    }
    if (data.message !== undefined) {
      updateData.message = data.message;
    }
    if (data.availabilityStart) {
      updateData.availabilityStart = data.availabilityStart;
    }
    if (data.availabilityEnd) {
      updateData.availabilityEnd = data.availabilityEnd;
    }
    if (data.preferredDays) {
      updateData.preferredDays = data.preferredDays;
    }

    const updated = await prisma.shadowRequest.update({
      where: { id: requestId },
      data: updateData,
    });

    return this.formatRequest(updated);
  }

  async submitRequest(requestId: string, youthId: string): Promise<ShadowRequest | null> {
    const existing = await prisma.shadowRequest.findFirst({
      where: { id: requestId, youthId, status: 'DRAFT' },
    });

    if (!existing) return null;

    const updated = await prisma.shadowRequest.update({
      where: { id: requestId },
      data: { status: 'PENDING' as PrismaRequestStatus },
    });

    // Create timeline event
    await TimelineEvents.shadowRequested(youthId, requestId);

    return this.formatRequest(updated);
  }

  async cancelRequest(requestId: string, youthId: string): Promise<boolean> {
    const existing = await prisma.shadowRequest.findFirst({
      where: {
        id: requestId,
        youthId,
        status: { in: ['DRAFT', 'PENDING'] },
      },
    });

    if (!existing) return false;

    await prisma.shadowRequest.update({
      where: { id: requestId },
      data: { status: 'CANCELLED' as PrismaRequestStatus },
    });

    return true;
  }

  async skipShadowStep(youthId: string, reason: string): Promise<void> {
    const profile = await prisma.youthProfile.findUnique({
      where: { userId: youthId },
      select: { journeySkippedSteps: true },
    });

    const skippedSteps = (profile?.journeySkippedSteps as Record<string, unknown>) || {};

    await prisma.youthProfile.update({
      where: { userId: youthId },
      data: {
        journeySkippedSteps: {
          ...skippedSteps,
          CAREER_SHADOW_REQUEST: {
            stepId: 'CAREER_SHADOW_REQUEST',
            reason,
            skippedAt: new Date().toISOString(),
          },
        },
      },
    });

    // Create timeline event
    await TimelineEvents.shadowSkipped(youthId, reason);
  }

  async hasSkippedShadowStep(youthId: string): Promise<{ skipped: boolean; reason: string | null }> {
    const profile = await prisma.youthProfile.findUnique({
      where: { userId: youthId },
      select: { journeySkippedSteps: true },
    });

    const skippedSteps = (profile?.journeySkippedSteps as Record<string, { reason: string }>) || {};
    const shadowSkip = skippedSteps['CAREER_SHADOW_REQUEST'];

    return {
      skipped: Boolean(shadowSkip),
      reason: shadowSkip?.reason || null,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private formatRequest(request: any): ShadowRequest {
    return {
      id: request.id,
      status: request.status as ShadowRequestStatus,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
      youthId: request.youthId,
      hostId: request.hostId || undefined,
      roleTitle: request.roleTitle,
      roleCategory: request.roleCategory || undefined,
      learningGoals: request.learningGoals || [],
      format: request.format as ShadowFormat,
      message: request.message || undefined,
      availabilityStart: request.availabilityStart?.toISOString(),
      availabilityEnd: request.availabilityEnd?.toISOString(),
      preferredDays: request.preferredDays || [],
      scheduledDate: request.scheduledDate?.toISOString(),
      scheduledStartTime: request.scheduledStartTime || undefined,
      scheduledEndTime: request.scheduledEndTime || undefined,
      locationName: request.locationName || undefined,
      hostMessage: request.hostMessage || undefined,
      declineReason: request.declineReason || undefined,
      completedAt: request.completedAt?.toISOString(),
      durationMinutes: request.durationMinutes || undefined,
    };
  }
}

// ============================================
// MOCK PROVIDER (For Testing/Development)
// ============================================

export class MockShadowProvider implements ShadowProvider {
  private requests: Map<string, ShadowRequest> = new Map();
  private skippedUsers: Map<string, string> = new Map(); // userId -> reason

  async getRequests(youthId: string): Promise<ShadowRequest[]> {
    return Array.from(this.requests.values())
      .filter((r) => r.youthId === youthId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getRequestById(requestId: string, youthId: string): Promise<ShadowRequest | null> {
    const request = this.requests.get(requestId);
    if (!request || request.youthId !== youthId) return null;
    return request;
  }

  async getSummary(youthId: string): Promise<ShadowSummary> {
    const requests = Array.from(this.requests.values()).filter((r) => r.youthId === youthId);

    const pending = requests.filter((r) => r.status === 'PENDING').length;
    const approved = requests.filter((r) => r.status === 'APPROVED').length;
    const completed = requests.filter((r) => r.status === 'COMPLETED').length;
    const declined = requests.filter((r) => r.status === 'DECLINED').length;

    const lastRequest = requests.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0];

    return {
      requestsTotal: requests.length,
      requestsPending: pending,
      requestsApproved: approved,
      requestsCompleted: completed,
      requestsDeclined: declined,
      skipped: this.skippedUsers.has(youthId),
      skipReason: this.skippedUsers.get(youthId) || null,
      lastUpdatedAt: lastRequest?.updatedAt || null,
    };
  }

  async createRequest(youthId: string, data: CreateShadowRequestInput): Promise<ShadowRequest> {
    const id = `mock-${Date.now()}`;
    const now = new Date().toISOString();

    const request: ShadowRequest = {
      id,
      status: 'DRAFT',
      createdAt: now,
      updatedAt: now,
      youthId,
      roleTitle: data.roleTitle,
      roleCategory: data.roleCategory,
      learningGoals: data.learningGoals,
      format: data.format,
      message: data.message,
      availabilityStart: data.availabilityStart?.toISOString(),
      availabilityEnd: data.availabilityEnd?.toISOString(),
      preferredDays: data.preferredDays || [],
    };

    this.requests.set(id, request);
    return request;
  }

  async updateRequest(
    requestId: string,
    youthId: string,
    data: UpdateShadowRequestInput
  ): Promise<ShadowRequest | null> {
    const request = this.requests.get(requestId);
    if (!request || request.youthId !== youthId || request.status !== 'DRAFT') return null;

    const updated: ShadowRequest = {
      ...request,
      updatedAt: new Date().toISOString(),
      ...(data.learningGoals ? { learningGoals: data.learningGoals } : {}),
      ...(data.format ? { format: data.format } : {}),
      ...(data.message !== undefined ? { message: data.message } : {}),
      ...(data.availabilityStart ? { availabilityStart: data.availabilityStart.toISOString() } : {}),
      ...(data.availabilityEnd ? { availabilityEnd: data.availabilityEnd.toISOString() } : {}),
      ...(data.preferredDays ? { preferredDays: data.preferredDays } : {}),
    };

    this.requests.set(requestId, updated);
    return updated;
  }

  async submitRequest(requestId: string, youthId: string): Promise<ShadowRequest | null> {
    const request = this.requests.get(requestId);
    if (!request || request.youthId !== youthId || request.status !== 'DRAFT') return null;

    const updated: ShadowRequest = {
      ...request,
      status: 'PENDING',
      updatedAt: new Date().toISOString(),
    };

    this.requests.set(requestId, updated);
    return updated;
  }

  async cancelRequest(requestId: string, youthId: string): Promise<boolean> {
    const request = this.requests.get(requestId);
    if (!request || request.youthId !== youthId) return false;
    if (!['DRAFT', 'PENDING'].includes(request.status)) return false;

    const updated: ShadowRequest = {
      ...request,
      status: 'CANCELLED',
      updatedAt: new Date().toISOString(),
    };

    this.requests.set(requestId, updated);
    return true;
  }

  async skipShadowStep(youthId: string, reason: string): Promise<void> {
    this.skippedUsers.set(youthId, reason);
  }

  async hasSkippedShadowStep(youthId: string): Promise<{ skipped: boolean; reason: string | null }> {
    return {
      skipped: this.skippedUsers.has(youthId),
      reason: this.skippedUsers.get(youthId) || null,
    };
  }

  // Test helpers
  reset(): void {
    this.requests.clear();
    this.skippedUsers.clear();
  }

  seedWithData(requests: ShadowRequest[]): void {
    for (const request of requests) {
      this.requests.set(request.id, request);
    }
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

let shadowProvider: ShadowProvider | null = null;

export function getShadowProvider(): ShadowProvider {
  if (!shadowProvider) {
    // Use mock provider in test environment
    if (process.env.NODE_ENV === 'test' || process.env.USE_MOCK_SHADOW_PROVIDER === 'true') {
      shadowProvider = new MockShadowProvider();
    } else {
      shadowProvider = new DatabaseShadowProvider();
    }
  }

  return shadowProvider;
}

// For testing - allow resetting the provider
export function resetShadowProvider(): void {
  shadowProvider = null;
}

// For testing - allow setting a specific provider
export function setShadowProvider(provider: ShadowProvider): void {
  shadowProvider = provider;
}
