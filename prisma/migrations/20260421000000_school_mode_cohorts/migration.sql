-- School Mode: TEACHER role + Cohort + CohortMembership
--
-- Adds a TEACHER UserRole, a Cohort table (teacher's class) and a
-- CohortMembership join table (youth ↔ cohort). Teacher never sees
-- per-student content — cohort detail endpoints aggregate only.
--
-- Note: per Postgres, a new enum value cannot be used in the same
-- transaction it's declared in. ALTER TYPE is therefore on its own
-- statement with no dependency in this migration.

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'TEACHER';

-- CreateTable
CREATE TABLE "Cohort" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "careerFocus" VARCHAR(80),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Cohort_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CohortMembership" (
    "id" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "youthId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CohortMembership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cohort_code_key" ON "Cohort"("code");

-- CreateIndex
CREATE INDEX "Cohort_teacherId_idx" ON "Cohort"("teacherId");

-- CreateIndex
CREATE INDEX "Cohort_code_idx" ON "Cohort"("code");

-- CreateIndex
CREATE INDEX "Cohort_deletedAt_idx" ON "Cohort"("deletedAt");

-- CreateIndex
CREATE INDEX "CohortMembership_cohortId_idx" ON "CohortMembership"("cohortId");

-- CreateIndex
CREATE INDEX "CohortMembership_youthId_idx" ON "CohortMembership"("youthId");

-- CreateIndex
CREATE UNIQUE INDEX "CohortMembership_cohortId_youthId_key" ON "CohortMembership"("cohortId", "youthId");

-- AddForeignKey
ALTER TABLE "Cohort" ADD CONSTRAINT "Cohort_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CohortMembership" ADD CONSTRAINT "CohortMembership_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "Cohort"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CohortMembership" ADD CONSTRAINT "CohortMembership_youthId_fkey" FOREIGN KEY ("youthId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
