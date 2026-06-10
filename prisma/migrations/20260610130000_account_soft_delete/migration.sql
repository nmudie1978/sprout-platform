-- Account soft-delete (GDPR Art. 17 with a 30-day grace period).
-- Adds User.deletedAt + index and a DATA_DELETION_CANCELLED audit action.
-- The shadow-table drops live in the preceding migration
-- (20260610120000_remove_career_shadowing) and are intentionally NOT
-- repeated here.

-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'DATA_DELETION_CANCELLED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");
