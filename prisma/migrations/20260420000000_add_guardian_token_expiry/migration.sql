-- Add expiry column for guardian consent tokens.
-- Tokens issued BEFORE this migration have NULL expiresAt and are
-- grandfathered by the GET/PUT handlers (NULL = legacy = accept).
-- New tokens written after the handler update will always set a
-- 14-day expiry, at which point a periodic cleanup can drop any
-- lingering legacy NULLs by observing `guardianToken IS NOT NULL
-- AND guardianTokenExpiresAt IS NULL AND createdAt < now() - 14d`.

ALTER TABLE "YouthProfile"
  ADD COLUMN "guardianTokenExpiresAt" TIMESTAMP(3);
