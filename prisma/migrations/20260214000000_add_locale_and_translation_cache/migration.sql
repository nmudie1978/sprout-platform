-- AlterTable: Add preferredLocale to UserPreferences
ALTER TABLE "UserPreferences" ADD COLUMN "preferredLocale" VARCHAR(5);

-- CreateTable: TranslationCache
CREATE TABLE "TranslationCache" (
    "id" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "sourceLocale" VARCHAR(5) NOT NULL,
    "targetLocale" VARCHAR(5) NOT NULL,
    "sourceText" TEXT NOT NULL,
    "translated" TEXT NOT NULL,
    "contentType" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TranslationCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TranslationCache_contentHash_targetLocale_key" ON "TranslationCache"("contentHash", "targetLocale");

-- CreateIndex
CREATE INDEX "TranslationCache_contentHash_targetLocale_idx" ON "TranslationCache"("contentHash", "targetLocale");

-- CreateIndex
CREATE INDEX "TranslationCache_expiresAt_idx" ON "TranslationCache"("expiresAt");
