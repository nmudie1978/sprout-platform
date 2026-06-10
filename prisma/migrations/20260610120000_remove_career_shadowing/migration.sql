-- Remove the Career Shadowing feature 100%.
-- Drops ShadowRequest + ShadowReflection tables, their enums, and the
-- shadow-related NotificationType values.
--
-- Safety: verified against production 2026-06-10 — ShadowRequest=0 rows,
-- ShadowReflection=0 rows, no RLS policies on either table, and no
-- Notification rows use any SHADOW_* enum value (so the enum cast below
-- is lossless). No DROP POLICY needed (none exist).

-- AlterEnum: rebuild NotificationType without the shadow values
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('NEW_APPLICATION', 'APPLICATION_ACCEPTED', 'APPLICATION_REJECTED', 'JOB_COMPLETED', 'NEW_REVIEW', 'NEW_RECOMMENDATION', 'NEW_MESSAGE', 'SYSTEM', 'GUARDIAN_CONSENT_REQUESTED', 'GUARDIAN_CONSENT_RECEIVED', 'ACCOUNT_VERIFIED', 'ACCOUNT_SUSPENDED', 'VERIFICATION_REMINDER', 'COMMUNITY_REPORT_RECEIVED', 'COMMUNITY_ACTION_TAKEN', 'REPORT_ESCALATED', 'GUARDIAN_LINK_REQUEST', 'GUARDIAN_LINK_ACCEPTED', 'GUARDIAN_LINK_REJECTED', 'GUARDIAN_LINK_REVOKED');
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "NotificationType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "ShadowReflection" DROP CONSTRAINT "ShadowReflection_shadowRequestId_fkey";

-- DropForeignKey
ALTER TABLE "ShadowReflection" DROP CONSTRAINT "ShadowReflection_youthId_fkey";

-- DropForeignKey
ALTER TABLE "ShadowRequest" DROP CONSTRAINT "ShadowRequest_hostId_fkey";

-- DropForeignKey
ALTER TABLE "ShadowRequest" DROP CONSTRAINT "ShadowRequest_youthId_fkey";

-- DropTable
DROP TABLE "ShadowReflection";

-- DropTable
DROP TABLE "ShadowRequest";

-- DropEnum
DROP TYPE "ShadowFormat";

-- DropEnum
DROP TYPE "ShadowLearningGoal";

-- DropEnum
DROP TYPE "ShadowRequestStatus";
