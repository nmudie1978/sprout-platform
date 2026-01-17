-- Community Guardian RLS Policies
-- These policies control access to community guardian-related tables

-- =============================================================================
-- ENABLE RLS ON NEW TABLES
-- =============================================================================

ALTER TABLE "Community" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CommunityGuardian" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CommunityReport" ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM "User"
        WHERE id = current_setting('app.current_user_id', true)
        AND role = 'ADMIN'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is a guardian for a specific community
CREATE OR REPLACE FUNCTION is_guardian_for_community(community_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM "CommunityGuardian"
        WHERE "communityId" = community_id
        AND "guardianUserId" = current_setting('app.current_user_id', true)
        AND "isActive" = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- COMMUNITY TABLE POLICIES
-- =============================================================================

-- Anyone can read active communities
CREATE POLICY "communities_select_active" ON "Community"
    FOR SELECT
    USING ("isActive" = true);

-- Admins can do everything on communities
CREATE POLICY "communities_admin_all" ON "Community"
    FOR ALL
    USING (is_admin());

-- =============================================================================
-- COMMUNITY GUARDIAN TABLE POLICIES
-- =============================================================================

-- Guardians can see their own assignments
CREATE POLICY "guardian_select_own" ON "CommunityGuardian"
    FOR SELECT
    USING ("guardianUserId" = current_setting('app.current_user_id', true));

-- Admins can do everything on guardian assignments
CREATE POLICY "guardian_admin_all" ON "CommunityGuardian"
    FOR ALL
    USING (is_admin());

-- =============================================================================
-- COMMUNITY REPORT TABLE POLICIES
-- =============================================================================

-- Users can see reports they submitted
CREATE POLICY "reports_select_own" ON "CommunityReport"
    FOR SELECT
    USING ("reporterUserId" = current_setting('app.current_user_id', true));

-- Guardians can see reports for their assigned community
CREATE POLICY "reports_select_guardian" ON "CommunityReport"
    FOR SELECT
    USING (is_guardian_for_community("communityId"));

-- Admins can see all reports
CREATE POLICY "reports_admin_select" ON "CommunityReport"
    FOR SELECT
    USING (is_admin());

-- Authenticated users can create reports (server validates reporterUserId)
CREATE POLICY "reports_insert_authenticated" ON "CommunityReport"
    FOR INSERT
    WITH CHECK ("reporterUserId" = current_setting('app.current_user_id', true));

-- Guardians can update reports for their assigned community (limited fields enforced by app)
CREATE POLICY "reports_update_guardian" ON "CommunityReport"
    FOR UPDATE
    USING (is_guardian_for_community("communityId"));

-- Admins can update any report
CREATE POLICY "reports_admin_update" ON "CommunityReport"
    FOR UPDATE
    USING (is_admin());

-- =============================================================================
-- MICROJOB isPaused UPDATE POLICY
-- =============================================================================

-- Guardians can update isPaused on jobs in their community
CREATE POLICY "jobs_pause_guardian" ON "MicroJob"
    FOR UPDATE
    USING (
        is_guardian_for_community("communityId")
        OR is_admin()
    );

-- =============================================================================
-- USER isPaused UPDATE POLICY
-- =============================================================================

-- Note: User pausing is complex (user-to-community relationship)
-- For MVP, only admins can pause users; guardians can pause jobs
-- This is enforced at the application level

-- Admins can update any user's isPaused status
CREATE POLICY "users_pause_admin" ON "User"
    FOR UPDATE
    USING (is_admin());
