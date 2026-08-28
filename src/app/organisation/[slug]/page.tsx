/**
 * The organisation portal home — different for each staff role.
 *
 * ADVISOR gets their caseload. EDUCATOR gets their cohorts. MANAGER and
 * ORGANISATION_ADMIN get the programme picture. Nobody gets more than their
 * role and the organisation's privacy settings allow.
 */

import Link from "next/link";
import { OrgMembershipStatus, OrgRole, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { canShowAggregate } from "@/lib/organisations/visibility";
import { requirePortalAccess } from "@/lib/organisations/portal-guard";
import { getLicenceStatus } from "@/lib/entitlements/service";

export const dynamic = "force-dynamic";

function Stat({
  value,
  label,
  hint,
}: {
  value: string | number;
  label: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-4">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
      {hint && <p className="text-xs text-muted-foreground/70 mt-1">{hint}</p>}
    </div>
  );
}

export default async function OrganisationPortalHome({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const context = await requirePortalAccess(slug);

  const isAdvisor = context.role === OrgRole.ADVISOR;
  const isEducator = context.role === OrgRole.EDUCATOR;

  // Advisors and educators see their own slice; managers and admins see the
  // organisation. Derived here from the database, never from a parameter.
  let scopedMembershipIds: string[] | null = null;

  if (isAdvisor) {
    const assignments = await prisma.advisorAssignment.findMany({
      where: {
        organisationId: context.organisationId,
        advisorMembershipId: context.membershipId,
        endedAt: null,
      },
      select: { participantMembershipId: true },
    });
    scopedMembershipIds = assignments.map((a) => a.participantMembershipId);
  } else if (isEducator) {
    const cohorts = await prisma.orgCohortMembership.findMany({
      where: { membershipId: context.membershipId },
      select: { cohortId: true },
    });
    const peers = await prisma.orgCohortMembership.findMany({
      where: {
        cohortId: { in: cohorts.map((c) => c.cohortId) },
        cohort: { organisationId: context.organisationId },
      },
      select: { membershipId: true },
    });
    scopedMembershipIds = peers.map((p) => p.membershipId);
  }

  const participants = await prisma.organisationMembership.findMany({
    where: {
      organisationId: context.organisationId,
      status: OrgMembershipStatus.ACTIVE,
      role: OrgRole.PARTICIPANT,
      ...(scopedMembershipIds !== null ? { id: { in: scopedMembershipIds } } : {}),
    },
    select: { id: true, userId: true, dataSharingConsentAt: true, dataSharingConsentRevokedAt: true },
  });

  const userIds = participants.map((p) => p.userId);
  const groupSize = participants.length;
  const showAggregates = canShowAggregate(groupSize, context.settings);

  const [exploring, withGoal, cohortCount, licence] = await Promise.all([
    userIds.length
      ? prisma.careerInterest
          .findMany({ where: { userId: { in: userIds } }, select: { userId: true }, distinct: ["userId"] })
          .then((r) => r.length)
      : 0,
    userIds.length
      ? prisma.youthProfile.count({
          where: { userId: { in: userIds }, primaryGoal: { not: Prisma.DbNull } },
        })
      : 0,
    prisma.orgCohort.count({
      where: { organisationId: context.organisationId, deletedAt: null, status: "ACTIVE" },
    }),
    getLicenceStatus(context.organisationId),
  ]);

  const consented = participants.filter(
    (p) => p.dataSharingConsentAt !== null && p.dataSharingConsentRevokedAt === null
  ).length;

  const pct = (n: number) => (groupSize > 0 ? Math.round((n / groupSize) * 100) : 0);

  const scopeLabel = isAdvisor
    ? "your assigned participants"
    : isEducator
      ? "participants in your cohorts"
      : "everyone in this organisation";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">
          {isAdvisor ? "My participants" : isEducator ? "My cohorts" : "Programme overview"}
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Figures below cover {scopeLabel}.
        </p>
      </div>

      {groupSize === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card/40 p-8 text-center">
          <p className="text-muted-foreground">
            {isAdvisor
              ? "No participants assigned to you yet. An organisation admin can assign them."
              : isEducator
                ? "You're not in any cohorts yet."
                : "Nobody has joined yet. Invite people or share an access code to get started."}
          </p>
          {context.role === OrgRole.ORGANISATION_ADMIN && (
            <Link
              href={`/organisation/${slug}/people`}
              className="inline-block mt-4 text-sm text-primary hover:underline"
            >
              Invite people →
            </Link>
          )}
        </div>
      ) : !showAggregates ? (
        <div className="rounded-xl border border-border/60 bg-card/40 p-6">
          <p className="text-2xl font-semibold">{groupSize}</p>
          <p className="text-sm text-muted-foreground">
            participant{groupSize === 1 ? "" : "s"}
          </p>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Progress figures appear once there are at least{" "}
            {context.settings.minimumAggregateGroupSize} participants. Below that, a percentage
            would effectively point at one person.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat value={groupSize} label="Participants" />
          <Stat
            value={`${pct(exploring)}%`}
            label="Exploring careers"
            hint={`${exploring} of ${groupSize}`}
          />
          <Stat
            value={`${pct(withGoal)}%`}
            label="Have a direction"
            hint={`${withGoal} of ${groupSize}`}
          />
          <Stat value={cohortCount} label="Active cohorts" />
        </div>
      )}

      <section className="rounded-xl border border-border/60 bg-card/40 p-5 space-y-2">
        <h3 className="font-medium">What you can and can&apos;t see</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Endeavrly shows organisations how a programme is going, not what any individual young
          person wrote. Reflections, notes and journey text are never shared with an institution.
        </p>
        {context.settings.allowIndividualParticipantView ? (
          <p className="text-sm text-muted-foreground leading-relaxed">
            This organisation has enabled individual progress views.{" "}
            {context.settings.requireParticipantDataSharingConsent
              ? `${consented} of ${groupSize} participant${groupSize === 1 ? " has" : "s have"} agreed to share their progress; the rest appear as name and role only.`
              : "Participant consent is not required by this organisation's policy."}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground leading-relaxed">
            This organisation is set to aggregate-only. No individual progress is visible to any
            staff member, including admins.
          </p>
        )}
      </section>

      {licence.status && (
        <p className="text-xs text-muted-foreground">
          Licence: {licence.status.toLowerCase()}
          {licence.userLimit
            ? ` · ${licence.activeUserCount.toLocaleString()} of ${licence.userLimit.toLocaleString()} seats used`
            : " · unlimited seats"}
          {licence.daysRemaining !== null ? ` · ${licence.daysRemaining} days remaining` : ""}
        </p>
      )}
    </div>
  );
}
