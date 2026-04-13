-- AlterTable: Add doNotDisturb field to User
ALTER TABLE "User" ADD COLUMN "doNotDisturb" BOOLEAN NOT NULL DEFAULT false;

-- Step 1: Drop existing foreign key constraints on Conversation
ALTER TABLE "Conversation" DROP CONSTRAINT IF EXISTS "Conversation_employerId_fkey";
ALTER TABLE "Conversation" DROP CONSTRAINT IF EXISTS "Conversation_youthId_fkey";

-- Step 2: Drop existing unique constraint and indexes
DROP INDEX IF EXISTS "Conversation_employerId_youthId_jobId_key";
DROP INDEX IF EXISTS "Conversation_employerId_idx";
DROP INDEX IF EXISTS "Conversation_youthId_idx";

-- Step 3: Rename columns
ALTER TABLE "Conversation" RENAME COLUMN "employerId" TO "participant1Id";
ALTER TABLE "Conversation" RENAME COLUMN "youthId" TO "participant2Id";

-- Step 4: Normalize participant order (smaller ID first) for existing rows
-- This ensures the unique constraint works correctly
UPDATE "Conversation"
SET
  "participant1Id" = LEAST("participant1Id", "participant2Id"),
  "participant2Id" = GREATEST("participant1Id", "participant2Id")
WHERE "participant1Id" > "participant2Id";

-- Step 5: Add new foreign key constraints
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_participant1Id_fkey"
  FOREIGN KEY ("participant1Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_participant2Id_fkey"
  FOREIGN KEY ("participant2Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 6: Create new unique constraint and indexes
CREATE UNIQUE INDEX "Conversation_participant1Id_participant2Id_jobId_key"
  ON "Conversation"("participant1Id", "participant2Id", "jobId");

CREATE INDEX "Conversation_participant1Id_idx" ON "Conversation"("participant1Id");
CREATE INDEX "Conversation_participant2Id_idx" ON "Conversation"("participant2Id");
