-- Remove jobs-era guardian machinery.
--
-- The small-jobs marketplace is gone, so the parent-visibility layer
-- (GuardianProfile / WorkerGuardianLink / GuardianActivitySnapshot) and the
-- community-guardian moderation role (CommunityGuardian + the COMMUNITY_GUARDIAN
-- UserRole) are obsolete. Content/user reporting (CommunityReport) is KEPT and
-- is now admin-only.
--
-- DESTRUCTIVE: drops four tables and their data. These tables held marketplace
-- parent-visibility links and community-guardian assignments — none of which
-- apply to a pure career-guidance platform. Verify they are empty/abandoned in
-- production before running.

-- 1. Drop the parent-visibility layer. WorkerGuardianLink has an FK to
--    GuardianProfile, so drop it (and the snapshot) before GuardianProfile.
DROP TABLE IF EXISTS "GuardianActivitySnapshot";
DROP TABLE IF EXISTS "WorkerGuardianLink";
DROP TABLE IF EXISTS "GuardianProfile";

-- 2. Drop the community-guardian assignment table. CommunityReport keeps its
--    `assignedGuardianUserId` column (now "admin who claimed the report") — that
--    FK points at User, not CommunityGuardian, so it is unaffected.
DROP TABLE IF EXISTS "CommunityGuardian";

-- 3. Rebuild the UserRole enum without COMMUNITY_GUARDIAN. Postgres can't drop a
--    single enum value, so recreate the type. Any existing community-guardian
--    accounts were trusted moderators; promote them to ADMIN so they keep
--    moderation access via the admin reports queue.
UPDATE "User" SET "role" = 'ADMIN' WHERE "role" = 'COMMUNITY_GUARDIAN';

ALTER TYPE "UserRole" RENAME TO "UserRole_old";
CREATE TYPE "UserRole" AS ENUM ('YOUTH', 'EMPLOYER', 'ADMIN', 'TEACHER');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole" USING ("role"::text::"UserRole");
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'YOUTH';
DROP TYPE "UserRole_old";
