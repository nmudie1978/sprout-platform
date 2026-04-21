-- Phase 1 RLS (Row Level Security) — scaffolding for the 6
-- highest-sensitivity tables. See docs/rls-rollout.md (forthcoming)
-- for the full plan.
--
-- STATUS OF ENFORCEMENT
-- =====================
-- These policies enable RLS on each table and define the per-user
-- access rules, but they do NOT force RLS. The default Prisma
-- connection runs as Supabase's `postgres` role (superuser), which
-- bypasses RLS — so these policies are INERT for app traffic today.
--
-- Phase 2 will:
--   (a) switch the runtime role to a non-superuser (or add
--       `ALTER TABLE ... FORCE ROW LEVEL SECURITY`);
--   (b) add a bypass context for admin / cron / service paths;
--   (c) flip enforcement on after integration testing.
--
-- The phase-1 split means: policies are codified + reviewed now, but
-- zero runtime behavior changes. If phase 2 surfaces a missed query
-- site, we flip enforcement off with `ALTER TABLE ... DISABLE ROW
-- LEVEL SECURITY` without losing the policy definitions.
--
-- CONTEXT MECHANISM
-- =================
-- Policies read the current user id from a Postgres session setting
-- `app.current_user_id`, set by `withRLSContext(userId, fn)` in
-- src/lib/prisma.ts. Pattern:
--
--   USING ("userId" = current_setting('app.current_user_id', true))
--
-- `current_setting(..., true)` returns '' if the setting isn't set,
-- so a missing context evaluates to no-match and (once forced) blocks
-- the query.
--
-- We drop-if-exists at the top of each block so re-running the
-- migration or re-applying in dev doesn't duplicate.


-- ─────────────────────────────────────────────────────────────────
-- YouthProfile
-- Owner: the user whose profile this is (YouthProfile.userId).
-- Public read of opt-in public profiles handled via a separate
-- policy that checks `profileVisibility = true`.
-- ─────────────────────────────────────────────────────────────────

ALTER TABLE "YouthProfile" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "youth_profile_self_read" ON "YouthProfile";
CREATE POLICY "youth_profile_self_read" ON "YouthProfile"
  FOR SELECT
  USING ("userId" = current_setting('app.current_user_id', true));

DROP POLICY IF EXISTS "youth_profile_public_read" ON "YouthProfile";
CREATE POLICY "youth_profile_public_read" ON "YouthProfile"
  FOR SELECT
  USING ("profileVisibility" = true);

DROP POLICY IF EXISTS "youth_profile_self_write" ON "YouthProfile";
CREATE POLICY "youth_profile_self_write" ON "YouthProfile"
  FOR ALL
  USING ("userId" = current_setting('app.current_user_id', true))
  WITH CHECK ("userId" = current_setting('app.current_user_id', true));


-- ─────────────────────────────────────────────────────────────────
-- Application
-- Owner: the youth who applied (Application.youthId).
-- Employer-read is handled at the app layer (employer fetches
-- applications through their job relation, which carries its own
-- ownership check via MicroJob.postedById). Phase 2 will add a
-- cross-role policy using a helper function.
-- ─────────────────────────────────────────────────────────────────

ALTER TABLE "Application" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "application_youth_self" ON "Application";
CREATE POLICY "application_youth_self" ON "Application"
  FOR ALL
  USING ("youthId" = current_setting('app.current_user_id', true))
  WITH CHECK ("youthId" = current_setting('app.current_user_id', true));


-- ─────────────────────────────────────────────────────────────────
-- Conversation
-- Owners: both participants.
-- ─────────────────────────────────────────────────────────────────

ALTER TABLE "Conversation" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conversation_participant_read" ON "Conversation";
CREATE POLICY "conversation_participant_read" ON "Conversation"
  FOR SELECT
  USING (
    "participant1Id" = current_setting('app.current_user_id', true)
    OR "participant2Id" = current_setting('app.current_user_id', true)
  );

DROP POLICY IF EXISTS "conversation_participant_write" ON "Conversation";
CREATE POLICY "conversation_participant_write" ON "Conversation"
  FOR UPDATE
  USING (
    "participant1Id" = current_setting('app.current_user_id', true)
    OR "participant2Id" = current_setting('app.current_user_id', true)
  );


-- ─────────────────────────────────────────────────────────────────
-- Message
-- Read: any participant in the parent conversation.
-- Write: only the sender.
-- Using an EXISTS subquery on Conversation is standard for RLS —
-- performance is fine given the index on Conversation(id).
-- ─────────────────────────────────────────────────────────────────

ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "message_participant_read" ON "Message";
CREATE POLICY "message_participant_read" ON "Message"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Conversation" c
      WHERE c.id = "Message"."conversationId"
        AND (
          c."participant1Id" = current_setting('app.current_user_id', true)
          OR c."participant2Id" = current_setting('app.current_user_id', true)
        )
    )
  );

DROP POLICY IF EXISTS "message_sender_write" ON "Message";
CREATE POLICY "message_sender_write" ON "Message"
  FOR INSERT
  WITH CHECK ("senderId" = current_setting('app.current_user_id', true));


-- ─────────────────────────────────────────────────────────────────
-- CommunityReport
-- Read: the reporter, the assigned guardian, any admin (admin
-- handling is out of phase-1 scope — admins use a bypass context
-- in phase 2).
-- Write: insert limited to the reporter; all other state changes
-- flow through server actions that set the context appropriately.
-- ─────────────────────────────────────────────────────────────────

ALTER TABLE "CommunityReport" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_report_self_read" ON "CommunityReport";
CREATE POLICY "community_report_self_read" ON "CommunityReport"
  FOR SELECT
  USING (
    "reporterUserId" = current_setting('app.current_user_id', true)
    OR "assignedGuardianUserId" = current_setting('app.current_user_id', true)
  );

DROP POLICY IF EXISTS "community_report_reporter_insert" ON "CommunityReport";
CREATE POLICY "community_report_reporter_insert" ON "CommunityReport"
  FOR INSERT
  WITH CHECK ("reporterUserId" = current_setting('app.current_user_id', true));


-- ─────────────────────────────────────────────────────────────────
-- AuditLog
-- Read: the subject (userId) sees their own audit trail for GDPR
-- subject-access. Admin + compliance exports use a bypass context
-- in phase 2.
-- Write: no user-facing write — all writes come from server paths
-- that set the context. Phase 2 will narrow the INSERT policy.
-- ─────────────────────────────────────────────────────────────────

ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_log_subject_read" ON "AuditLog";
CREATE POLICY "audit_log_subject_read" ON "AuditLog"
  FOR SELECT
  USING ("userId" = current_setting('app.current_user_id', true));

-- Permissive insert policy for phase 1 — audit log rows are written
-- from trusted server paths (logAuditAction helper). Phase 2 will
-- narrow this to "actorId matches context OR bypass context is set".
DROP POLICY IF EXISTS "audit_log_open_insert" ON "AuditLog";
CREATE POLICY "audit_log_open_insert" ON "AuditLog"
  FOR INSERT
  WITH CHECK (true);
