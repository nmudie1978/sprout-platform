-- CreateTable
CREATE TABLE "IngestedInsight" (
    "id" TEXT NOT NULL,
    "urlHash" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "sourceName" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "tags" TEXT[],
    "publishDate" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IngestedInsight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IngestedInsight_urlHash_key" ON "IngestedInsight"("urlHash");

-- CreateIndex
CREATE INDEX "IngestedInsight_contentType_idx" ON "IngestedInsight"("contentType");

-- CreateIndex
CREATE INDEX "IngestedInsight_verifiedAt_idx" ON "IngestedInsight"("verifiedAt");
