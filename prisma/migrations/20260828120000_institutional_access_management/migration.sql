-- CreateEnum
CREATE TYPE "OrganisationType" AS ENUM ('SCHOOL', 'UNIVERSITY', 'COLLEGE', 'MUNICIPALITY', 'PUBLIC_SECTOR', 'EMPLOYMENT_SERVICE', 'CAREER_GUIDANCE', 'EMPLOYER', 'TRAINING_PROVIDER', 'NON_PROFIT', 'OTHER');

-- CreateEnum
CREATE TYPE "OrganisationStatus" AS ENUM ('PROSPECT', 'ONBOARDING', 'ACTIVE', 'SUSPENDED', 'CHURNED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "OrgRole" AS ENUM ('PARTICIPANT', 'PARENT', 'ADVISOR', 'EDUCATOR', 'MANAGER', 'ORGANISATION_ADMIN');

-- CreateEnum
CREATE TYPE "OrgMembershipStatus" AS ENUM ('INVITED', 'ACTIVE', 'SUSPENDED', 'EXPIRED', 'REMOVED');

-- CreateEnum
CREATE TYPE "LicenceStatus" AS ENUM ('TRIAL', 'ACTIVE', 'SUSPENDED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EntitlementModule" AS ENUM ('CORE', 'CAREER_DISCOVERY', 'CAREER_DNA', 'UNDERSTAND', 'CLARITY', 'CAREER_TWIN', 'AI_CAREER_GUIDANCE', 'CAREER_PATHWAYS', 'PARENT_PORTAL', 'LABOUR_MARKET_INTELLIGENCE', 'SKILLS_ANALYSIS', 'OPPORTUNITIES', 'INSTITUTION_ANALYTICS', 'ADVANCED_ANALYTICS', 'API_ACCESS', 'CUSTOM_INTEGRATIONS');

-- CreateEnum
CREATE TYPE "OrgCohortStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "OrgCohortType" AS ENUM ('CLASS', 'PROGRAMME', 'JOB_SEEKER_GROUP', 'APPRENTICESHIP', 'GRADUATE_PROGRAMME', 'EVENT', 'OTHER');

-- CreateEnum
CREATE TYPE "AccessCodeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED', 'EXHAUSTED');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "DomainEnrolmentPolicy" AS ENUM ('DISABLED', 'OFFER', 'AUTO_JOIN');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PREMIUM', 'FAMILY', 'FAMILY_PLUS');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'TRIALING', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "OrgAuditAction" AS ENUM ('ORGANISATION_CREATED', 'ORGANISATION_UPDATED', 'ORGANISATION_STATUS_CHANGED', 'LICENCE_CREATED', 'LICENCE_UPDATED', 'LICENCE_STATUS_CHANGED', 'LICENCE_EXPIRED', 'LICENCE_PLAN_CREATED', 'LICENCE_PLAN_UPDATED', 'MEMBERSHIP_CREATED', 'MEMBERSHIP_ROLE_CHANGED', 'MEMBERSHIP_STATUS_CHANGED', 'MEMBERSHIP_REMOVED', 'INVITATION_SENT', 'INVITATION_REVOKED', 'INVITATION_ACCEPTED', 'ACCESS_CODE_CREATED', 'ACCESS_CODE_UPDATED', 'ACCESS_CODE_REDEEMED', 'COHORT_CREATED', 'COHORT_UPDATED', 'COHORT_ARCHIVED', 'COHORT_MEMBER_ADDED', 'COHORT_MEMBER_REMOVED', 'DOMAIN_ADDED', 'DOMAIN_VERIFIED', 'DOMAIN_REMOVED', 'SETTINGS_UPDATED', 'ADVISOR_ASSIGNED', 'ADVISOR_UNASSIGNED', 'SUBSCRIPTION_CHANGED');

-- CreateTable
CREATE TABLE "Organisation" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "type" "OrganisationType" NOT NULL,
    "status" "OrganisationStatus" NOT NULL DEFAULT 'PROSPECT',
    "country" VARCHAR(2),
    "logoUrl" TEXT,
    "primaryContactName" VARCHAR(120),
    "primaryContactEmail" VARCHAR(254),
    "billingEmail" VARCHAR(254),
    "billingAddress" TEXT,
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganisationSettings" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "allowIndividualParticipantView" BOOLEAN NOT NULL DEFAULT false,
    "advisorCanViewAssignedDetail" BOOLEAN NOT NULL DEFAULT true,
    "educatorCanViewCohortDetail" BOOLEAN NOT NULL DEFAULT false,
    "managerCanViewIndividualDetail" BOOLEAN NOT NULL DEFAULT false,
    "minimumAggregateGroupSize" INTEGER NOT NULL DEFAULT 5,
    "requireParticipantDataSharingConsent" BOOLEAN NOT NULL DEFAULT true,
    "defaultMembershipDurationDays" INTEGER,
    "participantPrivacyNotice" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganisationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganisationDomain" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "domain" VARCHAR(253) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verificationToken" VARCHAR(64),
    "enrolmentPolicy" "DomainEnrolmentPolicy" NOT NULL DEFAULT 'OFFER',
    "defaultRole" "OrgRole" NOT NULL DEFAULT 'PARTICIPANT',
    "defaultCohortId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganisationDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganisationMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "role" "OrgRole" NOT NULL DEFAULT 'PARTICIPANT',
    "status" "OrgMembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "invitationId" TEXT,
    "accessCodeId" TEXT,
    "dataSharingConsentAt" TIMESTAMP(3),
    "dataSharingConsentRevokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganisationMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdvisorAssignment" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "advisorMembershipId" TEXT NOT NULL,
    "participantMembershipId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "AdvisorAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LicencePlan" (
    "id" TEXT NOT NULL,
    "key" VARCHAR(48) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "defaultModules" "EntitlementModule"[],
    "defaultUserLimit" INTEGER,
    "defaultTermMonths" INTEGER,
    "listPriceMinor" INTEGER,
    "currency" VARCHAR(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LicencePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Licence" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "licencePlanId" TEXT,
    "status" "LicenceStatus" NOT NULL DEFAULT 'TRIAL',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "userLimit" INTEGER,
    "activeUserCount" INTEGER NOT NULL DEFAULT 0,
    "enabledModules" "EntitlementModule"[],
    "contractReference" VARCHAR(120),
    "contractValueMinor" INTEGER,
    "currency" VARCHAR(3),
    "annualValueMinor" INTEGER,
    "renewalDate" TIMESTAMP(3),
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "trialEndsAt" TIMESTAMP(3),
    "commercialNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Licence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgCohort" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "name" VARCHAR(140) NOT NULL,
    "description" TEXT,
    "type" "OrgCohortType" NOT NULL DEFAULT 'PROGRAMME',
    "status" "OrgCohortStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "OrgCohort_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgCohortMembership" (
    "id" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrgCohortMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessCode" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "code" VARCHAR(64) NOT NULL,
    "label" VARCHAR(160),
    "status" "AccessCodeStatus" NOT NULL DEFAULT 'ACTIVE',
    "cohortId" TEXT,
    "assignedRole" "OrgRole" NOT NULL DEFAULT 'PARTICIPANT',
    "maxUses" INTEGER,
    "currentUses" INTEGER NOT NULL DEFAULT 0,
    "singleUse" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "allowedEmailDomains" TEXT[],
    "moduleOverrides" "EntitlementModule"[],
    "membershipDurationDays" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" VARCHAR(160),

    CONSTRAINT "AccessCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessCodeRedemption" (
    "id" TEXT NOT NULL,
    "accessCodeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessCodeRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganisationInvitation" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "role" "OrgRole" NOT NULL DEFAULT 'PARTICIPANT',
    "cohortId" TEXT,
    "tokenHash" VARCHAR(64) NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "invitedBy" VARCHAR(160),
    "acceptedAt" TIMESTAMP(3),
    "acceptedByUserId" TEXT,
    "revokedAt" TIMESTAMP(3),
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganisationInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "moduleOverrides" "EntitlementModule"[],
    "grantedBy" VARCHAR(160),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentChildLink" (
    "id" TEXT NOT NULL,
    "parentUserId" TEXT NOT NULL,
    "childUserId" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "sharesJourneySummary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ParentChildLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgAuditLog" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT,
    "action" "OrgAuditAction" NOT NULL,
    "actor" VARCHAR(160) NOT NULL,
    "actorUserId" TEXT,
    "targetType" VARCHAR(48),
    "targetId" VARCHAR(64),
    "summary" TEXT,
    "metadata" JSONB,
    "ipAddress" VARCHAR(64),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrgAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organisation_slug_key" ON "Organisation"("slug");

-- CreateIndex
CREATE INDEX "Organisation_status_idx" ON "Organisation"("status");

-- CreateIndex
CREATE INDEX "Organisation_type_idx" ON "Organisation"("type");

-- CreateIndex
CREATE INDEX "Organisation_deletedAt_idx" ON "Organisation"("deletedAt");

-- CreateIndex
CREATE INDEX "Organisation_country_idx" ON "Organisation"("country");

-- CreateIndex
CREATE UNIQUE INDEX "OrganisationSettings_organisationId_key" ON "OrganisationSettings"("organisationId");

-- CreateIndex
CREATE INDEX "OrganisationDomain_organisationId_idx" ON "OrganisationDomain"("organisationId");

-- CreateIndex
CREATE INDEX "OrganisationDomain_verified_idx" ON "OrganisationDomain"("verified");

-- CreateIndex
CREATE UNIQUE INDEX "OrganisationDomain_domain_key" ON "OrganisationDomain"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "OrganisationMembership_invitationId_key" ON "OrganisationMembership"("invitationId");

-- CreateIndex
CREATE INDEX "OrganisationMembership_organisationId_status_idx" ON "OrganisationMembership"("organisationId", "status");

-- CreateIndex
CREATE INDEX "OrganisationMembership_organisationId_role_idx" ON "OrganisationMembership"("organisationId", "role");

-- CreateIndex
CREATE INDEX "OrganisationMembership_userId_status_idx" ON "OrganisationMembership"("userId", "status");

-- CreateIndex
CREATE INDEX "OrganisationMembership_expiresAt_idx" ON "OrganisationMembership"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "OrganisationMembership_userId_organisationId_key" ON "OrganisationMembership"("userId", "organisationId");

-- CreateIndex
CREATE INDEX "AdvisorAssignment_organisationId_idx" ON "AdvisorAssignment"("organisationId");

-- CreateIndex
CREATE INDEX "AdvisorAssignment_participantMembershipId_idx" ON "AdvisorAssignment"("participantMembershipId");

-- CreateIndex
CREATE INDEX "AdvisorAssignment_advisorMembershipId_endedAt_idx" ON "AdvisorAssignment"("advisorMembershipId", "endedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdvisorAssignment_advisorMembershipId_participantMembership_key" ON "AdvisorAssignment"("advisorMembershipId", "participantMembershipId");

-- CreateIndex
CREATE UNIQUE INDEX "LicencePlan_key_key" ON "LicencePlan"("key");

-- CreateIndex
CREATE INDEX "LicencePlan_isActive_idx" ON "LicencePlan"("isActive");

-- CreateIndex
CREATE INDEX "Licence_organisationId_status_idx" ON "Licence"("organisationId", "status");

-- CreateIndex
CREATE INDEX "Licence_status_idx" ON "Licence"("status");

-- CreateIndex
CREATE INDEX "Licence_endDate_idx" ON "Licence"("endDate");

-- CreateIndex
CREATE INDEX "Licence_renewalDate_idx" ON "Licence"("renewalDate");

-- CreateIndex
CREATE INDEX "OrgCohort_organisationId_status_idx" ON "OrgCohort"("organisationId", "status");

-- CreateIndex
CREATE INDEX "OrgCohort_deletedAt_idx" ON "OrgCohort"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "OrgCohort_organisationId_name_key" ON "OrgCohort"("organisationId", "name");

-- CreateIndex
CREATE INDEX "OrgCohortMembership_membershipId_idx" ON "OrgCohortMembership"("membershipId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgCohortMembership_cohortId_membershipId_key" ON "OrgCohortMembership"("cohortId", "membershipId");

-- CreateIndex
CREATE UNIQUE INDEX "AccessCode_code_key" ON "AccessCode"("code");

-- CreateIndex
CREATE INDEX "AccessCode_organisationId_status_idx" ON "AccessCode"("organisationId", "status");

-- CreateIndex
CREATE INDEX "AccessCode_expiresAt_idx" ON "AccessCode"("expiresAt");

-- CreateIndex
CREATE INDEX "AccessCodeRedemption_userId_idx" ON "AccessCodeRedemption"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AccessCodeRedemption_accessCodeId_userId_key" ON "AccessCodeRedemption"("accessCodeId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganisationInvitation_tokenHash_key" ON "OrganisationInvitation"("tokenHash");

-- CreateIndex
CREATE INDEX "OrganisationInvitation_organisationId_status_idx" ON "OrganisationInvitation"("organisationId", "status");

-- CreateIndex
CREATE INDEX "OrganisationInvitation_email_idx" ON "OrganisationInvitation"("email");

-- CreateIndex
CREATE INDEX "OrganisationInvitation_expiresAt_idx" ON "OrganisationInvitation"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "OrganisationInvitation_organisationId_email_status_key" ON "OrganisationInvitation"("organisationId", "email", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalSubscription_userId_key" ON "PersonalSubscription"("userId");

-- CreateIndex
CREATE INDEX "PersonalSubscription_tier_status_idx" ON "PersonalSubscription"("tier", "status");

-- CreateIndex
CREATE INDEX "PersonalSubscription_expiresAt_idx" ON "PersonalSubscription"("expiresAt");

-- CreateIndex
CREATE INDEX "ParentChildLink_childUserId_idx" ON "ParentChildLink"("childUserId");

-- CreateIndex
CREATE UNIQUE INDEX "ParentChildLink_parentUserId_childUserId_key" ON "ParentChildLink"("parentUserId", "childUserId");

-- CreateIndex
CREATE INDEX "OrgAuditLog_organisationId_createdAt_idx" ON "OrgAuditLog"("organisationId", "createdAt");

-- CreateIndex
CREATE INDEX "OrgAuditLog_action_idx" ON "OrgAuditLog"("action");

-- CreateIndex
CREATE INDEX "OrgAuditLog_createdAt_idx" ON "OrgAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "OrgAuditLog_actorUserId_idx" ON "OrgAuditLog"("actorUserId");

-- AddForeignKey
ALTER TABLE "OrganisationSettings" ADD CONSTRAINT "OrganisationSettings_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganisationDomain" ADD CONSTRAINT "OrganisationDomain_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganisationDomain" ADD CONSTRAINT "OrganisationDomain_defaultCohortId_fkey" FOREIGN KEY ("defaultCohortId") REFERENCES "OrgCohort"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganisationMembership" ADD CONSTRAINT "OrganisationMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganisationMembership" ADD CONSTRAINT "OrganisationMembership_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganisationMembership" ADD CONSTRAINT "OrganisationMembership_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "OrganisationInvitation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganisationMembership" ADD CONSTRAINT "OrganisationMembership_accessCodeId_fkey" FOREIGN KEY ("accessCodeId") REFERENCES "AccessCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvisorAssignment" ADD CONSTRAINT "AdvisorAssignment_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvisorAssignment" ADD CONSTRAINT "AdvisorAssignment_advisorMembershipId_fkey" FOREIGN KEY ("advisorMembershipId") REFERENCES "OrganisationMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvisorAssignment" ADD CONSTRAINT "AdvisorAssignment_participantMembershipId_fkey" FOREIGN KEY ("participantMembershipId") REFERENCES "OrganisationMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Licence" ADD CONSTRAINT "Licence_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Licence" ADD CONSTRAINT "Licence_licencePlanId_fkey" FOREIGN KEY ("licencePlanId") REFERENCES "LicencePlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgCohort" ADD CONSTRAINT "OrgCohort_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgCohortMembership" ADD CONSTRAINT "OrgCohortMembership_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "OrgCohort"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgCohortMembership" ADD CONSTRAINT "OrgCohortMembership_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "OrganisationMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessCode" ADD CONSTRAINT "AccessCode_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessCode" ADD CONSTRAINT "AccessCode_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "OrgCohort"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessCodeRedemption" ADD CONSTRAINT "AccessCodeRedemption_accessCodeId_fkey" FOREIGN KEY ("accessCodeId") REFERENCES "AccessCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessCodeRedemption" ADD CONSTRAINT "AccessCodeRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganisationInvitation" ADD CONSTRAINT "OrganisationInvitation_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganisationInvitation" ADD CONSTRAINT "OrganisationInvitation_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "OrgCohort"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalSubscription" ADD CONSTRAINT "PersonalSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentChildLink" ADD CONSTRAINT "ParentChildLink_parentUserId_fkey" FOREIGN KEY ("parentUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentChildLink" ADD CONSTRAINT "ParentChildLink_childUserId_fkey" FOREIGN KEY ("childUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgAuditLog" ADD CONSTRAINT "OrgAuditLog_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

