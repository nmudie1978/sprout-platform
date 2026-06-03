-- CreateTable
CREATE TABLE "SavedCareer" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "careerTitle" TEXT NOT NULL,
    "careerEmoji" TEXT,
    "note" TEXT,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedCareer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SavedCareer_profileId_careerId_key" ON "SavedCareer"("profileId", "careerId");

-- CreateIndex
CREATE INDEX "SavedCareer_profileId_savedAt_idx" ON "SavedCareer"("profileId", "savedAt");

-- AddForeignKey
ALTER TABLE "SavedCareer" ADD CONSTRAINT "SavedCareer_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "YouthProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
