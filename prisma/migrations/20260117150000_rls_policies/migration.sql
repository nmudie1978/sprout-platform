-- Row Level Security (RLS) Policies for Sprout Youth Platform
-- These policies enforce data access at the database level as a defense-in-depth measure

-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "YouthProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EmployerProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MicroJob" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Application" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Conversation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Earning" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Badge" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Poke" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ConsentRecord" ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies require the application to set the current user context
-- In Supabase, this is typically done via auth.uid() or a custom session variable
-- For server-side apps using Prisma, we use the service role which bypasses RLS
-- These policies are for additional protection and direct database access

-- =============================================================================
-- USER TABLE POLICIES
-- =============================================================================

-- Users can read their own data
CREATE POLICY "users_select_own" ON "User"
    FOR SELECT
    USING (id = current_setting('app.current_user_id', true));

-- Users can update their own data
CREATE POLICY "users_update_own" ON "User"
    FOR UPDATE
    USING (id = current_setting('app.current_user_id', true));

-- =============================================================================
-- YOUTH PROFILE POLICIES
-- =============================================================================

-- Youth can read and update their own profile
CREATE POLICY "youth_profile_select_own" ON "YouthProfile"
    FOR SELECT
    USING ("userId" = current_setting('app.current_user_id', true));

CREATE POLICY "youth_profile_update_own" ON "YouthProfile"
    FOR UPDATE
    USING ("userId" = current_setting('app.current_user_id', true));

-- Public profiles can be read by anyone (when profileVisibility = true)
CREATE POLICY "youth_profile_select_public" ON "YouthProfile"
    FOR SELECT
    USING ("profileVisibility" = true);

-- =============================================================================
-- EMPLOYER PROFILE POLICIES
-- =============================================================================

-- Employers can read and update their own profile
CREATE POLICY "employer_profile_select_own" ON "EmployerProfile"
    FOR SELECT
    USING ("userId" = current_setting('app.current_user_id', true));

CREATE POLICY "employer_profile_update_own" ON "EmployerProfile"
    FOR UPDATE
    USING ("userId" = current_setting('app.current_user_id', true));

-- Verified employers can be read by youth (for job listings)
CREATE POLICY "employer_profile_select_verified" ON "EmployerProfile"
    FOR SELECT
    USING ("ageVerified" = true);

-- =============================================================================
-- MICROJOB POLICIES
-- =============================================================================

-- Posted jobs can be read by anyone
CREATE POLICY "jobs_select_posted" ON "MicroJob"
    FOR SELECT
    USING (status = 'POSTED');

-- Employers can CRUD their own jobs
CREATE POLICY "jobs_select_own" ON "MicroJob"
    FOR SELECT
    USING ("postedById" = current_setting('app.current_user_id', true));

CREATE POLICY "jobs_insert_own" ON "MicroJob"
    FOR INSERT
    WITH CHECK ("postedById" = current_setting('app.current_user_id', true));

CREATE POLICY "jobs_update_own" ON "MicroJob"
    FOR UPDATE
    USING ("postedById" = current_setting('app.current_user_id', true));

CREATE POLICY "jobs_delete_own" ON "MicroJob"
    FOR DELETE
    USING ("postedById" = current_setting('app.current_user_id', true));

-- =============================================================================
-- APPLICATION POLICIES
-- =============================================================================

-- Youth can read their own applications
CREATE POLICY "applications_select_youth" ON "Application"
    FOR SELECT
    USING ("youthId" = current_setting('app.current_user_id', true));

-- Employers can read applications for their jobs
CREATE POLICY "applications_select_employer" ON "Application"
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM "MicroJob"
            WHERE "MicroJob".id = "Application"."jobId"
            AND "MicroJob"."postedById" = current_setting('app.current_user_id', true)
        )
    );

-- Youth can create applications
CREATE POLICY "applications_insert_youth" ON "Application"
    FOR INSERT
    WITH CHECK ("youthId" = current_setting('app.current_user_id', true));

-- Youth can update (withdraw) their own applications
CREATE POLICY "applications_update_youth" ON "Application"
    FOR UPDATE
    USING ("youthId" = current_setting('app.current_user_id', true));

-- Employers can update applications for their jobs
CREATE POLICY "applications_update_employer" ON "Application"
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM "MicroJob"
            WHERE "MicroJob".id = "Application"."jobId"
            AND "MicroJob"."postedById" = current_setting('app.current_user_id', true)
        )
    );

-- =============================================================================
-- CONVERSATION POLICIES
-- =============================================================================

-- Users can only see conversations they're part of
CREATE POLICY "conversations_select_participant" ON "Conversation"
    FOR SELECT
    USING (
        "participant1Id" = current_setting('app.current_user_id', true)
        OR "participant2Id" = current_setting('app.current_user_id', true)
    );

-- =============================================================================
-- MESSAGE POLICIES
-- =============================================================================

-- Users can only see messages in conversations they're part of
CREATE POLICY "messages_select_participant" ON "Message"
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM "Conversation"
            WHERE "Conversation".id = "Message"."conversationId"
            AND (
                "Conversation"."participant1Id" = current_setting('app.current_user_id', true)
                OR "Conversation"."participant2Id" = current_setting('app.current_user_id', true)
            )
        )
    );

-- Users can only send messages in conversations they're part of
CREATE POLICY "messages_insert_participant" ON "Message"
    FOR INSERT
    WITH CHECK (
        "senderId" = current_setting('app.current_user_id', true)
        AND EXISTS (
            SELECT 1 FROM "Conversation"
            WHERE "Conversation".id = "Message"."conversationId"
            AND (
                "Conversation"."participant1Id" = current_setting('app.current_user_id', true)
                OR "Conversation"."participant2Id" = current_setting('app.current_user_id', true)
            )
        )
    );

-- =============================================================================
-- NOTIFICATION POLICIES
-- =============================================================================

-- Users can only see their own notifications
CREATE POLICY "notifications_select_own" ON "Notification"
    FOR SELECT
    USING ("userId" = current_setting('app.current_user_id', true));

CREATE POLICY "notifications_update_own" ON "Notification"
    FOR UPDATE
    USING ("userId" = current_setting('app.current_user_id', true));

-- =============================================================================
-- EARNING POLICIES
-- =============================================================================

-- Youth can see their own earnings
CREATE POLICY "earnings_select_own" ON "Earning"
    FOR SELECT
    USING ("youthId" = current_setting('app.current_user_id', true));

-- =============================================================================
-- BADGE POLICIES
-- =============================================================================

-- Youth can see their own badges
CREATE POLICY "badges_select_own" ON "Badge"
    FOR SELECT
    USING ("youthId" = current_setting('app.current_user_id', true));

-- =============================================================================
-- POKE POLICIES
-- =============================================================================

-- Employers can see pokes they sent
CREATE POLICY "pokes_select_employer" ON "Poke"
    FOR SELECT
    USING ("employerId" = current_setting('app.current_user_id', true));

-- Youth can see pokes they received
CREATE POLICY "pokes_select_youth" ON "Poke"
    FOR SELECT
    USING ("youthId" = current_setting('app.current_user_id', true));

-- =============================================================================
-- AUDIT LOG POLICIES
-- =============================================================================

-- Only admins can read audit logs (no policy for regular users)
-- Audit logs are write-only for the application

-- =============================================================================
-- CONSENT RECORD POLICIES
-- =============================================================================

-- Users can see their own consent records
CREATE POLICY "consents_select_own" ON "ConsentRecord"
    FOR SELECT
    USING ("userId" = current_setting('app.current_user_id', true));

-- =============================================================================
-- REVIEW POLICIES
-- =============================================================================

-- Users can see reviews they gave
CREATE POLICY "reviews_select_reviewer" ON "Review"
    FOR SELECT
    USING ("reviewerId" = current_setting('app.current_user_id', true));

-- Users can see reviews they received
CREATE POLICY "reviews_select_reviewed" ON "Review"
    FOR SELECT
    USING ("reviewedId" = current_setting('app.current_user_id', true));
