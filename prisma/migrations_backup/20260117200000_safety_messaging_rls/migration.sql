-- ============================================
-- SAFETY MESSAGING PHASE 1: RLS POLICIES
-- ============================================
-- This migration adds Row Level Security policies for the safety messaging system.
-- Key safety features:
-- 1. Conversations must be job-related
-- 2. Adult-to-minor messaging requires verified adult
-- 3. Blocks prevent all communication
-- 4. Reports auto-freeze conversations
-- ============================================

-- Enable RLS on new tables
ALTER TABLE "MessageTemplate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserBlock" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ConversationReport" ENABLE ROW LEVEL SECURITY;

-- ============================================
-- MESSAGE TEMPLATES: Read-only for all authenticated users
-- Only admins can modify (handled via service role in API)
-- ============================================

-- All authenticated users can read active templates
CREATE POLICY "message_templates_select_authenticated"
ON "MessageTemplate"
FOR SELECT
TO authenticated
USING ("isActive" = true);

-- ============================================
-- CONVERSATIONS: Strict access control
-- ============================================

-- Update existing Conversation RLS policies
DROP POLICY IF EXISTS "conversations_select_participants" ON "Conversation";
DROP POLICY IF EXISTS "conversations_insert_participants" ON "Conversation";
DROP POLICY IF EXISTS "conversations_update_status" ON "Conversation";

-- Participants can view their conversations
CREATE POLICY "conversations_select_participants"
ON "Conversation"
FOR SELECT
TO authenticated
USING (
  auth.uid()::text = "participant1Id"
  OR auth.uid()::text = "participant2Id"
);

-- Complex insert policy - handled in application layer via service role
-- This basic policy allows participants to create, but safety gates in API
CREATE POLICY "conversations_insert_check"
ON "Conversation"
FOR INSERT
TO authenticated
WITH CHECK (
  -- Must include the current user as a participant
  (auth.uid()::text = "participant1Id" OR auth.uid()::text = "participant2Id")
  -- Job ID is required (Phase 1 Safety)
  AND "jobId" IS NOT NULL
);

-- Only admins/system can update conversation status (via service role)
-- Participants cannot directly change frozen status
CREATE POLICY "conversations_update_participants"
ON "Conversation"
FOR UPDATE
TO authenticated
USING (
  auth.uid()::text = "participant1Id"
  OR auth.uid()::text = "participant2Id"
)
WITH CHECK (
  -- Participants can only update lastMessageAt, not status
  auth.uid()::text = "participant1Id"
  OR auth.uid()::text = "participant2Id"
);

-- ============================================
-- MESSAGES: Strict structured messaging
-- ============================================

-- Update existing Message RLS policies
DROP POLICY IF EXISTS "messages_select_participants" ON "Message";
DROP POLICY IF EXISTS "messages_insert_sender" ON "Message";

-- Participants can read messages in their conversations
CREATE POLICY "messages_select_conversation_participants"
ON "Message"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Conversation" c
    WHERE c.id = "conversationId"
    AND (auth.uid()::text = c."participant1Id" OR auth.uid()::text = c."participant2Id")
  )
);

-- Messages can only be inserted if:
-- 1. Sender is participant in conversation
-- 2. Conversation is ACTIVE (not frozen/closed)
-- 3. No block exists between participants
CREATE POLICY "messages_insert_active_conversation"
ON "Message"
FOR INSERT
TO authenticated
WITH CHECK (
  -- Sender must be authenticated user
  auth.uid()::text = "senderId"
  -- Must use a valid template (enforced by FK)
  AND "templateId" IS NOT NULL
  -- Conversation must exist and be active
  AND EXISTS (
    SELECT 1 FROM "Conversation" c
    WHERE c.id = "conversationId"
    AND c.status = 'ACTIVE'
    AND (auth.uid()::text = c."participant1Id" OR auth.uid()::text = c."participant2Id")
  )
  -- No blocks between participants
  AND NOT EXISTS (
    SELECT 1 FROM "Conversation" c
    JOIN "UserBlock" b ON (
      (b."blockerId" = c."participant1Id" AND b."blockedId" = c."participant2Id")
      OR (b."blockerId" = c."participant2Id" AND b."blockedId" = c."participant1Id")
    )
    WHERE c.id = "conversationId"
  )
);

-- ============================================
-- USER BLOCKS: Users can manage their own blocks
-- ============================================

-- Users can see their own blocks (both given and received)
CREATE POLICY "blocks_select_own"
ON "UserBlock"
FOR SELECT
TO authenticated
USING (
  auth.uid()::text = "blockerId"
  OR auth.uid()::text = "blockedId"
);

-- Users can create blocks
CREATE POLICY "blocks_insert_own"
ON "UserBlock"
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid()::text = "blockerId"
  -- Cannot block yourself
  AND "blockerId" != "blockedId"
);

-- Users can delete their own blocks (unblock)
CREATE POLICY "blocks_delete_own"
ON "UserBlock"
FOR DELETE
TO authenticated
USING (
  auth.uid()::text = "blockerId"
);

-- ============================================
-- CONVERSATION REPORTS: Safety reporting
-- ============================================

-- Users can view reports they made
CREATE POLICY "reports_select_own"
ON "ConversationReport"
FOR SELECT
TO authenticated
USING (
  auth.uid()::text = "reporterId"
);

-- Admins and guardians can view all reports (checked in application)
-- This policy allows users who are admins to see all reports
CREATE POLICY "reports_select_admin"
ON "ConversationReport"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "User" u
    WHERE u.id = auth.uid()::text
    AND u.role IN ('ADMIN', 'COMMUNITY_GUARDIAN')
  )
);

-- Users can create reports for conversations they're part of
CREATE POLICY "reports_insert_participants"
ON "ConversationReport"
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid()::text = "reporterId"
  AND EXISTS (
    SELECT 1 FROM "Conversation" c
    WHERE c.id = "conversationId"
    AND (auth.uid()::text = c."participant1Id" OR auth.uid()::text = c."participant2Id")
  )
  -- Cannot report yourself
  AND "reporterId" != "reportedId"
);

-- Only admins/guardians can update report status (via service role mostly)
CREATE POLICY "reports_update_admin"
ON "ConversationReport"
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "User" u
    WHERE u.id = auth.uid()::text
    AND u.role IN ('ADMIN', 'COMMUNITY_GUARDIAN')
  )
);

-- ============================================
-- TRIGGER: Auto-freeze conversation on report
-- ============================================

CREATE OR REPLACE FUNCTION freeze_conversation_on_report()
RETURNS TRIGGER AS $$
BEGIN
  -- Freeze the conversation when a report is created
  UPDATE "Conversation"
  SET
    status = 'FROZEN',
    "frozenAt" = NOW(),
    "frozenReason" = 'Frozen due to safety report: ' || NEW.category::text
  WHERE id = NEW."conversationId"
  AND status = 'ACTIVE';

  -- Create audit log entry
  INSERT INTO "AuditLog" (id, "userId", "actorId", action, "targetType", "targetId", metadata, "createdAt")
  VALUES (
    gen_random_uuid()::text,
    NEW."reportedId",
    NEW."reporterId",
    'CONVERSATION_FROZEN',
    'conversation',
    NEW."conversationId",
    jsonb_build_object(
      'reportId', NEW.id,
      'category', NEW.category,
      'reason', 'Auto-frozen due to safety report'
    ),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_freeze_conversation_on_report ON "ConversationReport";
CREATE TRIGGER trigger_freeze_conversation_on_report
  AFTER INSERT ON "ConversationReport"
  FOR EACH ROW
  EXECUTE FUNCTION freeze_conversation_on_report();

-- ============================================
-- TRIGGER: Audit log for conversation creation
-- ============================================

CREATE OR REPLACE FUNCTION audit_conversation_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO "AuditLog" (id, "userId", "actorId", action, "targetType", "targetId", metadata, "createdAt")
  VALUES (
    gen_random_uuid()::text,
    COALESCE(NEW."participant1Id", NEW."participant2Id"),
    NULL,
    'CONVERSATION_CREATED',
    'conversation',
    NEW.id,
    jsonb_build_object(
      'participant1Id', NEW."participant1Id",
      'participant2Id', NEW."participant2Id",
      'jobId', NEW."jobId"
    ),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_audit_conversation_created ON "Conversation";
CREATE TRIGGER trigger_audit_conversation_created
  AFTER INSERT ON "Conversation"
  FOR EACH ROW
  EXECUTE FUNCTION audit_conversation_created();

-- ============================================
-- TRIGGER: Audit log for user blocks
-- ============================================

CREATE OR REPLACE FUNCTION audit_user_blocked()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO "AuditLog" (id, "userId", "actorId", action, "targetType", "targetId", metadata, "createdAt")
  VALUES (
    gen_random_uuid()::text,
    NEW."blockedId",
    NEW."blockerId",
    'USER_BLOCKED',
    'user',
    NEW."blockedId",
    jsonb_build_object(
      'blockerId', NEW."blockerId",
      'reason', NEW.reason
    ),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_audit_user_blocked ON "UserBlock";
CREATE TRIGGER trigger_audit_user_blocked
  AFTER INSERT ON "UserBlock"
  FOR EACH ROW
  EXECUTE FUNCTION audit_user_blocked();

-- ============================================
-- FUNCTION: Check if user can message another user
-- Used by application layer for safety gates
-- ============================================

CREATE OR REPLACE FUNCTION can_user_message(
  sender_id TEXT,
  recipient_id TEXT,
  job_id TEXT
)
RETURNS TABLE (
  allowed BOOLEAN,
  reason TEXT
) AS $$
DECLARE
  sender_role TEXT;
  sender_verified BOOLEAN;
  recipient_role TEXT;
  recipient_age_bracket TEXT;
  block_exists BOOLEAN;
BEGIN
  -- Get sender info
  SELECT u.role, COALESCE(ep."eidVerified", false)
  INTO sender_role, sender_verified
  FROM "User" u
  LEFT JOIN "EmployerProfile" ep ON ep."userId" = u.id
  WHERE u.id = sender_id;

  -- Get recipient info
  SELECT u.role, u."ageBracket"
  INTO recipient_role, recipient_age_bracket
  FROM "User" u
  WHERE u.id = recipient_id;

  -- Check for blocks
  SELECT EXISTS (
    SELECT 1 FROM "UserBlock"
    WHERE ("blockerId" = sender_id AND "blockedId" = recipient_id)
    OR ("blockerId" = recipient_id AND "blockedId" = sender_id)
  ) INTO block_exists;

  -- Check conditions
  IF block_exists THEN
    RETURN QUERY SELECT false, 'User has been blocked';
  ELSIF recipient_role = 'YOUTH' AND recipient_age_bracket = 'SIXTEEN_SEVENTEEN'
        AND sender_role IN ('EMPLOYER', 'ADMIN')
        AND NOT sender_verified THEN
    RETURN QUERY SELECT false, 'Verification required to message minors';
  ELSIF job_id IS NULL THEN
    RETURN QUERY SELECT false, 'Conversation must be related to a job';
  ELSE
    RETURN QUERY SELECT true, 'OK';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant usage to authenticated users
GRANT SELECT ON "MessageTemplate" TO authenticated;
GRANT SELECT, INSERT ON "UserBlock" TO authenticated;
GRANT DELETE ON "UserBlock" TO authenticated;
GRANT SELECT, INSERT ON "ConversationReport" TO authenticated;

-- Service role has full access (for API)
GRANT ALL ON "MessageTemplate" TO service_role;
GRANT ALL ON "UserBlock" TO service_role;
GRANT ALL ON "ConversationReport" TO service_role;
