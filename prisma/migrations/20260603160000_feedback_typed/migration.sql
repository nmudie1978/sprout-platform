-- CreateEnum
CREATE TYPE "FeedbackKind" AS ENUM ('CONFUSED', 'PROBLEM', 'IDEA', 'PRAISE');

-- CreateEnum
CREATE TYPE "FeedbackArea" AS ENUM ('JOURNEY', 'CAREER_RADAR', 'EXPLORE_CAREERS', 'LIBRARY', 'CAREER_TWIN', 'OTHER');

-- AlterTable: add new typed-feedback columns, relax legacy NOT NULLs
ALTER TABLE "Feedback"
  ADD COLUMN "kind" "FeedbackKind",
  ADD COLUMN "area" "FeedbackArea",
  ADD COLUMN "message" VARCHAR(1000),
  ALTER COLUMN "role" DROP NOT NULL,
  ALTER COLUMN "q1" DROP NOT NULL,
  ALTER COLUMN "q2" DROP NOT NULL,
  ALTER COLUMN "q3" DROP NOT NULL,
  ALTER COLUMN "q4" DROP NOT NULL,
  ALTER COLUMN "q5" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Feedback_kind_idx" ON "Feedback"("kind");

-- CreateIndex
CREATE INDEX "Feedback_area_idx" ON "Feedback"("area");
