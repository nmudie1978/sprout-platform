/**
 * Guardian Activity Snapshot API
 * GET - Get activity summary for linked youth workers
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get guardian profile with linked workers
    const guardianProfile = await prisma.guardianProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        workerLinks: {
          where: { status: "ACTIVE" },
          include: {
            worker: {
              select: {
                id: true,
                dateOfBirth: true,
                youthAgeBand: true,
                youthProfile: {
                  select: {
                    displayName: true,
                    avatarId: true,
                    completedJobsCount: true,
                    averageRating: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!guardianProfile) {
      return NextResponse.json(
        { error: "Guardian profile not found", code: "NO_PROFILE" },
        { status: 404 }
      );
    }

    // Build snapshot for each linked worker
    const snapshots = await Promise.all(
      guardianProfile.workerLinks.map(async (link) => {
        const scope = link.visibilityScope as {
          canSeeApplications?: boolean;
          canSeeSavedJobs?: boolean;
          canSeeMessagesMeta?: boolean;
          canSeeMessageContent?: boolean;
          canSeeProfileBasics?: boolean;
        };

        const workerId = link.workerId;
        let workerAge: number | undefined;

        if (link.worker.dateOfBirth) {
          const today = new Date();
          const birth = new Date(link.worker.dateOfBirth);
          workerAge = today.getFullYear() - birth.getFullYear();
          const monthDiff = today.getMonth() - birth.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            workerAge--;
          }
        }

        // Base info (always visible)
        const snapshot: {
          workerId: string;
          displayName: string;
          avatarId: string | null | undefined;
          ageBand: string | null;
          age: number | undefined;
          visibilityScope: typeof scope;
          profileBasics?: {
            completedJobsCount: number;
            averageRating: number | null;
            totalEarnings: number;
          };
          applications?: {
            recent: Array<{
              id: string;
              status: string;
              createdAt: Date;
              job: {
                id: string;
                title: string;
                category: string;
                minimumAge: number;
                riskCategory: string;
                location: string | null;
                payAmount: number;
                payType: string;
                employer: string;
                employerVerified: boolean;
              };
            }>;
            counts: Record<string, number>;
          };
          savedCareers?: {
            recent: Array<{
              id: string;
              savedAt: Date;
              career: {
                id: string;
                roleName: string;
              };
            }>;
            totalCount: number;
          };
          messages?: {
            sentCount: number;
            conversationCount: number;
            unreadCount: number;
          };
        } = {
          workerId,
          displayName: link.worker.youthProfile?.displayName || "Unknown",
          avatarId: link.worker.youthProfile?.avatarId,
          ageBand: link.worker.youthAgeBand,
          age: workerAge,
          visibilityScope: scope,
        };

        // Profile basics (if permitted)
        if (scope.canSeeProfileBasics) {
          // Calculate total earnings from completed jobs
          const earnings = await prisma.earning.aggregate({
            where: { youthId: workerId },
            _sum: { amount: true },
          });

          snapshot.profileBasics = {
            completedJobsCount: link.worker.youthProfile?.completedJobsCount || 0,
            averageRating: link.worker.youthProfile?.averageRating || 0,
            totalEarnings: earnings._sum?.amount || 0,
          };
        }

        // Applications (if permitted)
        if (scope.canSeeApplications) {
          const recentApplications = await prisma.application.findMany({
            where: { youthId: workerId },
            select: {
              id: true,
              status: true,
              createdAt: true,
              job: {
                select: {
                  id: true,
                  title: true,
                  category: true,
                  minimumAge: true,
                  riskCategory: true,
                  location: true,
                  payAmount: true,
                  payType: true,
                  postedBy: {
                    select: {
                      employerProfile: {
                        select: {
                          companyName: true,
                          verified: true,
                        },
                      },
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
          });

          const applicationCounts = await prisma.application.groupBy({
            by: ["status"],
            where: { youthId: workerId },
            _count: { status: true },
          });

          snapshot.applications = {
            recent: recentApplications.map((app) => ({
              id: app.id,
              status: app.status,
              createdAt: app.createdAt,
              job: {
                id: app.job.id,
                title: app.job.title,
                category: app.job.category,
                minimumAge: app.job.minimumAge,
                riskCategory: app.job.riskCategory,
                location: app.job.location,
                payAmount: app.job.payAmount,
                payType: app.job.payType,
                employer: app.job.postedBy.employerProfile?.companyName || "Unknown",
                employerVerified: app.job.postedBy.employerProfile?.verified || false,
              },
            })),
            counts: applicationCounts.reduce(
              (acc, { status, _count }) => {
                acc[status.toLowerCase()] = _count.status;
                return acc;
              },
              { pending: 0, accepted: 0, rejected: 0, withdrawn: 0 } as Record<string, number>
            ),
          };
        }

        // Saved career cards (if permitted)
        if (scope.canSeeSavedJobs) {
          const savedSwipes = await prisma.swipe.findMany({
            where: {
              youthId: workerId,
              saved: true,
            },
            include: {
              careerCard: {
                select: {
                  id: true,
                  roleName: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
          });

          snapshot.savedCareers = {
            recent: savedSwipes.map((s) => ({
              id: s.id,
              savedAt: s.createdAt,
              career: {
                id: s.careerCard.id,
                roleName: s.careerCard.roleName,
              },
            })),
            totalCount: await prisma.swipe.count({
              where: { youthId: workerId, saved: true },
            }),
          };
        }

        // Messages meta (if permitted) - just counts, not content
        if (scope.canSeeMessagesMeta) {
          // Count messages where the worker is the sender
          const sentCount = await prisma.message.count({
            where: { senderId: workerId },
          });

          // Count conversations the worker is involved in (as participant1 or participant2)
          const conversationCount = await prisma.conversation.count({
            where: {
              OR: [{ participant1Id: workerId }, { participant2Id: workerId }],
            },
          });

          // Count unread messages in conversations where worker is participant
          const workerConversations = await prisma.conversation.findMany({
            where: {
              OR: [{ participant1Id: workerId }, { participant2Id: workerId }],
            },
            select: { id: true },
          });

          const unreadCount = await prisma.message.count({
            where: {
              conversationId: { in: workerConversations.map((c) => c.id) },
              senderId: { not: workerId },
              read: false,
            },
          });

          snapshot.messages = {
            sentCount,
            conversationCount,
            unreadCount,
          };
        }

        return snapshot;
      })
    );

    // Store the snapshot for caching/history
    for (const snapshot of snapshots) {
      await prisma.guardianActivitySnapshot.upsert({
        where: {
          workerId_guardianId: {
            workerId: snapshot.workerId,
            guardianId: guardianProfile.id,
          },
        },
        update: {
          summaryJson: snapshot as unknown as Prisma.InputJsonValue,
          lastUpdatedAt: new Date(),
        },
        create: {
          workerId: snapshot.workerId,
          guardianId: guardianProfile.id,
          summaryJson: snapshot as unknown as Prisma.InputJsonValue,
        },
      });
    }

    return NextResponse.json({
      guardianName: guardianProfile.fullName,
      linkedWorkersCount: snapshots.length,
      snapshots,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Guardian Snapshot] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity snapshot" },
      { status: 500 }
    );
  }
}
