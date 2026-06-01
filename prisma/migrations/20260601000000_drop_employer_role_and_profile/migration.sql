-- Remove the job-poster (EMPLOYER) role and the EmployerProfile model.
--
-- Endeavrly is a youth-only career-exploration platform; job-poster/employer
-- accounts have been removed from the product entirely (signup already rejects
-- them). This migration removes the remaining schema-level footprint.

-- 1. Defensive reassignment: move any remaining EMPLOYER users to YOUTH before
--    the enum is recreated. The cast in step 3 would otherwise fail on a
--    leftover row whose role is no longer a valid enum value.
UPDATE "User" SET "role" = 'YOUTH' WHERE "role" = 'EMPLOYER';

-- 2. Drop the EmployerProfile table. Its only foreign key (userId -> User) is
--    owned by this table and is dropped along with it; no other table
--    references EmployerProfile.
DROP TABLE "EmployerProfile";

-- 3. Recreate the UserRole enum without the EMPLOYER value.
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
CREATE TYPE "UserRole" AS ENUM ('YOUTH', 'ADMIN', 'TEACHER');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole" USING ("role"::text::"UserRole");
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'YOUTH';
DROP TYPE "UserRole_old";
