-- Add a CONTENT target type for reporting a specific piece of content
-- (Ask-a-Pro question, AI Career Twin response). Additive enum value —
-- non-destructive, idempotent.
ALTER TYPE "CommunityReportTargetType" ADD VALUE IF NOT EXISTS 'CONTENT';
