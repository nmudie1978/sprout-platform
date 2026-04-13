-- Add soft-delete column to SavedItem
ALTER TABLE "SavedItem" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Add soft-delete column to JourneyNote
ALTER TABLE "JourneyNote" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Add soft-delete column to TraitObservation
ALTER TABLE "TraitObservation" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Composite indexes for efficient filtered queries
CREATE INDEX "SavedItem_profileId_deletedAt_idx" ON "SavedItem"("profileId", "deletedAt");
CREATE INDEX "JourneyNote_profileId_deletedAt_idx" ON "JourneyNote"("profileId", "deletedAt");
CREATE INDEX "TraitObservation_profileId_deletedAt_idx" ON "TraitObservation"("profileId", "deletedAt");

-- JourneySnapshot table
CREATE TABLE "JourneySnapshot" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "trigger" VARCHAR(50) NOT NULL,
    "label" VARCHAR(200),
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JourneySnapshot_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "JourneySnapshot_profileId_idx" ON "JourneySnapshot"("profileId");
CREATE INDEX "JourneySnapshot_createdAt_idx" ON "JourneySnapshot"("createdAt");

ALTER TABLE "JourneySnapshot" ADD CONSTRAINT "JourneySnapshot_profileId_fkey"
    FOREIGN KEY ("profileId") REFERENCES "YouthProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Extend AuditAction enum
ALTER TYPE "AuditAction" ADD VALUE 'JOURNEY_ITEM_DELETED';
ALTER TYPE "AuditAction" ADD VALUE 'JOURNEY_ITEM_RESTORED';
ALTER TYPE "AuditAction" ADD VALUE 'JOURNEY_DATA_EXPORTED';
ALTER TYPE "AuditAction" ADD VALUE 'JOURNEY_DATA_IMPORTED';
