-- Decision Board per-user state (manual order + relegated careers).
ALTER TABLE "YouthProfile" ADD COLUMN IF NOT EXISTS "decisionBoard" JSONB;
