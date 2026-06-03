-- CreateTable
CREATE TABLE "JourneyNotebook" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "careerSlug" TEXT NOT NULL,
    "discover" TEXT,
    "understand" TEXT,
    "clarity" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JourneyNotebook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JourneyNotebook_profileId_careerSlug_key" ON "JourneyNotebook"("profileId", "careerSlug");

-- CreateIndex
CREATE INDEX "JourneyNotebook_profileId_updatedAt_idx" ON "JourneyNotebook"("profileId", "updatedAt");

-- AddForeignKey
ALTER TABLE "JourneyNotebook" ADD CONSTRAINT "JourneyNotebook_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "YouthProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
