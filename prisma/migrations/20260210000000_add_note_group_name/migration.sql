-- AlterTable
ALTER TABLE "JourneyNote" ADD COLUMN "groupName" VARCHAR(100);

-- CreateIndex
CREATE INDEX "JourneyNote_profileId_groupName_idx" ON "JourneyNote"("profileId", "groupName");
