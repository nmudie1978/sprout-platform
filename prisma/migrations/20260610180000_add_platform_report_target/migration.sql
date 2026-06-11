-- Add a PLATFORM target type for general safeguarding reports that are not
-- tied to a specific user. Additive enum value — non-destructive. PG 12+
-- (Supabase is PG 15) permits ALTER TYPE ... ADD VALUE; IF NOT EXISTS keeps
-- the migration idempotent.
ALTER TYPE "CommunityReportTargetType" ADD VALUE IF NOT EXISTS 'PLATFORM';
