-- CreateTable
CREATE TABLE "TraitObservation" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "traitId" VARCHAR(50) NOT NULL,
    "observation" VARCHAR(20) NOT NULL,
    "contextType" VARCHAR(50),
    "contextId" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TraitObservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TraitObservation_profileId_idx" ON "TraitObservation"("profileId");

-- CreateIndex
CREATE INDEX "TraitObservation_traitId_idx" ON "TraitObservation"("traitId");

-- CreateIndex
CREATE UNIQUE INDEX "TraitObservation_profileId_traitId_key" ON "TraitObservation"("profileId", "traitId");

-- AddForeignKey
ALTER TABLE "TraitObservation" ADD CONSTRAINT "TraitObservation_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "YouthProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
