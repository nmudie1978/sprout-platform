-- CreateTable
CREATE TABLE "ContentInteraction" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "contentUrl" VARCHAR(1000) NOT NULL,
    "interactionType" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentInteraction_profileId_idx" ON "ContentInteraction"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentInteraction_profileId_contentUrl_interactionType_key" ON "ContentInteraction"("profileId", "contentUrl", "interactionType");

-- AddForeignKey
ALTER TABLE "ContentInteraction" ADD CONSTRAINT "ContentInteraction_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "YouthProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
