export const dynamic = "force-dynamic";
/**
 * GDPR Data Export Endpoint
 * Allows users to download all their personal data (Article 20)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditAction } from "@/lib/safety";
import { AuditAction } from "@prisma/client";
import { anonymiseIp } from "@/lib/legal/versions";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Log the export request
    await logAuditAction({
      userId,
      action: AuditAction.DATA_EXPORT_REQUESTED,
      ipAddress: anonymiseIp(req.headers.get("x-forwarded-for")),
      userAgent: req.headers.get("user-agent") || undefined,
    });

    // Fetch all user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        youthProfile: true,
        badges: true,
        notifications: {
          take: 100, // Limit to recent notifications
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const profileId = user.youthProfile?.id;

    // Resilient fetch: a single empty/edge table must never sink the whole
    // export. Each user-owned model is queried independently; on error we
    // record the failure rather than 500 the request.
    const fetchWarnings: string[] = [];
    const safe = async <T>(label: string, fn: () => Promise<T>): Promise<T | []> => {
      try {
        return await fn();
      } catch (e) {
        console.error(`[GDPR export] failed to fetch ${label}:`, e);
        fetchWarnings.push(label);
        return [];
      }
    };
    const byUser = { where: { userId } } as const;
    const byProfile = profileId ? { where: { profileId } } : null;
    const ofProfile = async <T>(label: string, fn: (args: { where: { profileId: string } }) => Promise<T>) =>
      byProfile ? safe(label, () => fn(byProfile)) : [];

    // Fetch the full user-owned tree in parallel.
    const [
      consents,
      twinMessages,
      aiChatMessages,
      swipes,
      careerInterests,
      careerQuizResults,
      journeyGoalData,
      timelineEvents,
      generatedQuestionSets,
      questionStates,
      savedIndustries,
      industryProgress,
      learningProgress,
      userSkillSignals,
      pathSnapshots,
      vaultItems,
      lifeSkillEvents,
      feedbackSubmissions,
      communityReportsFiled,
      proQuestions,
      proAnswers,
      userPreferences,
      newsletterSubscriptions,
      // profile-owned
      savedCareers,
      savedItems,
      journeyReflections,
      journeyNotes,
      journeyNotebooks,
      journeySnapshots,
      traitObservations,
      userNotes,
      contentInteractions,
    ] = await Promise.all([
      safe("consents", () => prisma.consentRecord.findMany({ ...byUser, orderBy: { grantedAt: "desc" } })),
      safe("careerTwinMessages", () => prisma.careerTwinMessage.findMany({ ...byUser, orderBy: { createdAt: "asc" }, select: { careerId: true, role: true, content: true, mode: true, createdAt: true } })),
      safe("aiChatMessages", () => prisma.aiChatMessage.findMany({ ...byUser, orderBy: { createdAt: "asc" } })),
      safe("swipes", () => prisma.swipe.findMany({ where: { youthId: userId } })),
      safe("careerInterests", () => prisma.careerInterest.findMany(byUser)),
      safe("careerQuizResults", () => prisma.careerQuizResult.findMany(byUser)),
      safe("journeyGoalData", () => prisma.journeyGoalData.findMany(byUser)),
      safe("timelineEvents", () => prisma.timelineEvent.findMany({ ...byUser, orderBy: { createdAt: "asc" } })),
      safe("generatedQuestionSets", () => prisma.generatedQuestionSet.findMany(byUser)),
      safe("questionStates", () => prisma.userQuestionState.findMany(byUser)),
      safe("savedIndustries", () => prisma.savedIndustry.findMany(byUser)),
      safe("industryProgress", () => prisma.industryProgress.findMany(byUser)),
      safe("learningProgress", () => prisma.userLearningProgress.findMany(byUser)),
      safe("userSkillSignals", () => prisma.userSkillSignal.findMany(byUser)),
      safe("pathSnapshots", () => prisma.pathSnapshot.findMany(byUser)),
      safe("vaultItems", () => prisma.vaultItem.findMany(byUser)),
      safe("lifeSkillEvents", () => prisma.lifeSkillEvent.findMany(byUser)),
      safe("feedbackSubmissions", () => prisma.feedback.findMany({ where: { createdByUserId: userId } })),
      safe("communityReportsFiled", () => prisma.communityReport.findMany({ where: { reporterUserId: userId } })),
      safe("proQuestions", () => prisma.proQuestion.findMany({ where: { youthId: userId } })),
      safe("proAnswers", () => prisma.proAnswer.findMany({ where: { answeredBy: userId } })),
      safe("userPreferences", () => prisma.userPreferences.findUnique(byUser)),
      safe("newsletterSubscriptions", () => prisma.newsletterSubscription.findMany({ where: { OR: [{ userId }, { email: user.email }] } })),
      ofProfile("savedCareers", (a) => prisma.savedCareer.findMany(a)),
      ofProfile("savedItems", (a) => prisma.savedItem.findMany(a)),
      ofProfile("journeyReflections", (a) => prisma.journeyReflection.findMany(a)),
      ofProfile("journeyNotes", (a) => prisma.journeyNote.findMany(a)),
      ofProfile("journeyNotebooks", (a) => prisma.journeyNotebook.findMany(a)),
      ofProfile("journeySnapshots", (a) => prisma.journeySnapshot.findMany(a)),
      ofProfile("traitObservations", (a) => prisma.traitObservation.findMany(a)),
      ofProfile("userNotes", (a) => prisma.userNote.findMany(a)),
      ofProfile("contentInteractions", (a) => prisma.contentInteraction.findMany(a)),
    ]);

    // Structure the export data
    const exportData = {
      exportDate: new Date().toISOString(),
      // Models that could not be read at export time (should be empty).
      incompleteSections: fetchWarnings,
      dataSubject: {
        id: user.id,
        email: user.email,
        role: user.role,
        ageBracket: user.ageBracket,
        dateOfBirth: user.dateOfBirth,
        location: user.location,
        accountStatus: user.accountStatus,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      profile:
        user.role === "YOUTH"
          ? {
              type: "youth",
              ...user.youthProfile,
              // Remove internal IDs
              userId: undefined,
            }
          : null,
      preferences: userPreferences ?? null,
      badges: user.badges.map((b) => ({
        type: b.type,
        earnedAt: b.earnedAt,
      })),
      notifications: user.notifications.map((n) => ({
        type: n.type,
        title: n.title,
        message: n.message,
        read: n.read,
        createdAt: n.createdAt,
      })),
      consents: (consents as Array<{ consentType: unknown; version: unknown; granted: unknown; grantedAt: unknown; revokedAt: unknown }>).map((c) => ({
        type: c.consentType,
        version: c.version,
        granted: c.granted,
        grantedAt: c.grantedAt,
        revokedAt: c.revokedAt,
      })),
      // Career discovery & matching
      savedCareers,
      savedItems,
      careerInterests,
      swipes,
      careerQuizResults,
      savedIndustries,
      industryProgress,
      // My Journey
      journeyGoalData,
      journeyReflections,
      journeyNotes,
      journeyNotebooks,
      journeySnapshots,
      traitObservations,
      userNotes,
      pathSnapshots,
      timelineEvents,
      contentInteractions,
      learningProgress,
      userSkillSignals,
      vaultItems,
      lifeSkillEvents,
      // Q&A, questions and feedback the user authored
      proQuestions,
      proAnswers,
      generatedQuestionSets,
      questionStates,
      feedbackSubmissions,
      communityReportsFiled,
      // AI conversations
      aiChatMessages,
      careerTwinConversations: twinMessages,
      // Marketing
      newsletterSubscriptions,
    };

    // Log successful export
    await logAuditAction({
      userId,
      action: AuditAction.DATA_EXPORT_COMPLETED,
      metadata: {
        badgeCount: user.badges.length,
        notificationCount: user.notifications.length,
        incompleteSections: fetchWarnings.join(",") || "none",
      },
      ipAddress: anonymiseIp(req.headers.get("x-forwarded-for")),
      userAgent: req.headers.get("user-agent") || undefined,
    });

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="endeavrly-data-export-${userId}-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Error exporting data:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
