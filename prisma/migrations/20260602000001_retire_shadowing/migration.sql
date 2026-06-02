-- Retire the shadowing feature: drop ShadowRequest + ShadowReflection and
-- their enums (ShadowRequestStatus, ShadowFormat, ShadowLearningGoal).
-- Stacks on 20260602000000_drop_jobs_marketplace (Phase B).
--
-- DESTRUCTIVE: drops tables and their data. Take a DB backup first.
-- See RUNBOOK.md in this directory.

-- DropForeignKey
ALTER TABLE "ShadowRequest" DROP CONSTRAINT "ShadowRequest_youthId_fkey";

-- DropForeignKey
ALTER TABLE "ShadowRequest" DROP CONSTRAINT "ShadowRequest_hostId_fkey";

-- DropForeignKey
ALTER TABLE "ShadowReflection" DROP CONSTRAINT "ShadowReflection_shadowRequestId_fkey";

-- DropForeignKey
ALTER TABLE "ShadowReflection" DROP CONSTRAINT "ShadowReflection_youthId_fkey";

-- DropTable
DROP TABLE "ShadowRequest";

-- DropTable
DROP TABLE "ShadowReflection";

-- DropEnum
DROP TYPE "ShadowRequestStatus";

-- DropEnum
DROP TYPE "ShadowFormat";

-- DropEnum
DROP TYPE "ShadowLearningGoal";

