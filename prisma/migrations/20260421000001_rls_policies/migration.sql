-- Row-Level Security — Phase 1: single-hop user-owned tables
--
-- Defense-in-depth against "API route forgot to filter by userId"
-- bugs. Even if an authenticated user hits a route that doesn't
-- check ownership, the database refuses to return rows that don't
-- match `app.current_user_id` (set by withRLSContext).
--
-- This migration only covers tables whose ownership is a direct
-- column on User.id — two-hop tables (JourneyNote via YouthProfile,
-- Message via Conversation, etc.) are deferred to phase 2 because
-- their policies require joins that need careful testing.
--
-- IMPORTANT — ROLLOUT CAVEAT
-- RLS only takes effect if Prisma connects as a non-superuser role.
-- Supabase's default `postgres` role has BYPASSRLS. Enabling RLS
-- without flipping the connection role is a no-op in production.
-- Read docs/RLS_ROLLOUT.md before assuming these policies are live.
--
-- Admin / cron contexts bypass RLS by not calling withRLSContext —
-- their Prisma calls run outside the transaction that sets the
-- session variable, so `current_setting('app.current_user_id', true)`
-- returns '' and the policies below fall through harmlessly. If/when
-- we move to a non-superuser Prisma role, admin code paths must
-- switch to a BYPASSRLS-granted role or an explicit admin-context
-- variable (see ROLLOUT doc).

-- ============================================================
-- HELPER — reads the context variable set by withRLSContext.
-- ============================================================

CREATE OR REPLACE FUNCTION current_app_user_id() RETURNS text AS $$
  SELECT NULLIF(current_setting('app.current_user_id', true), '');
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION current_app_user_id() IS
  'Returns the app.current_user_id session variable set by withRLSContext, or NULL when not set. NULL short-circuits every RLS policy below.';

-- ============================================================
-- YouthProfile — owner accesses own profile only
-- ============================================================

ALTER TABLE "YouthProfile" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "youth_profile_owner_access"
  ON "YouthProfile"
  FOR ALL
  USING ("userId" = current_app_user_id())
  WITH CHECK ("userId" = current_app_user_id());

-- ============================================================
-- JourneyGoalData — goal-scoped journey state
-- ============================================================

ALTER TABLE "JourneyGoalData" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "journey_goal_data_owner_access"
  ON "JourneyGoalData"
  FOR ALL
  USING ("userId" = current_app_user_id())
  WITH CHECK ("userId" = current_app_user_id());

-- ============================================================
-- TimelineEvent — user's journey timeline
-- ============================================================

ALTER TABLE "TimelineEvent" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "timeline_event_owner_access"
  ON "TimelineEvent"
  FOR ALL
  USING ("userId" = current_app_user_id())
  WITH CHECK ("userId" = current_app_user_id());

-- ============================================================
-- Notification — user's own notifications only
-- ============================================================

ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_owner_access"
  ON "Notification"
  FOR ALL
  USING ("userId" = current_app_user_id())
  WITH CHECK ("userId" = current_app_user_id());

-- ============================================================
-- CohortMembership — youth sees own memberships
--
-- Teachers need to see memberships of THEIR cohorts too. That's a
-- two-hop read (CohortMembership.cohortId → Cohort.teacherId) and
-- needs a separate SELECT policy. Written as USING-only since
-- teachers never mutate memberships directly in app code.
-- ============================================================

ALTER TABLE "CohortMembership" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cohort_membership_youth_own"
  ON "CohortMembership"
  FOR ALL
  USING ("youthId" = current_app_user_id())
  WITH CHECK ("youthId" = current_app_user_id());

CREATE POLICY "cohort_membership_teacher_read"
  ON "CohortMembership"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Cohort" c
      WHERE c.id = "CohortMembership"."cohortId"
        AND c."teacherId" = current_app_user_id()
    )
  );

-- ============================================================
-- Cohort — teacher owns; youth members can read
-- ============================================================

ALTER TABLE "Cohort" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cohort_teacher_owner"
  ON "Cohort"
  FOR ALL
  USING ("teacherId" = current_app_user_id())
  WITH CHECK ("teacherId" = current_app_user_id());

CREATE POLICY "cohort_youth_member_read"
  ON "Cohort"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "CohortMembership" m
      WHERE m."cohortId" = "Cohort".id
        AND m."youthId" = current_app_user_id()
    )
  );

-- ============================================================
-- ConversationReport — reporter sees own; admin routes bypass
-- (admin routes don't call withRLSContext, so they see all rows)
-- ============================================================

ALTER TABLE "ConversationReport" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversation_report_reporter_access"
  ON "ConversationReport"
  FOR ALL
  USING ("reporterId" = current_app_user_id())
  WITH CHECK ("reporterId" = current_app_user_id());
