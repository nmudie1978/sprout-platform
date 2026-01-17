-- Life Skills Track RLS Policies
-- Enable RLS on all Life Skills tables

-- ============================================
-- LifeSkillCard - Public read for active cards
-- ============================================
ALTER TABLE "LifeSkillCard" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "life_skill_card_public_read" ON "LifeSkillCard";
CREATE POLICY "life_skill_card_public_read" ON "LifeSkillCard"
  FOR SELECT
  USING ("isActive" = true);

-- ============================================
-- LifeSkillEvent - Own read/write
-- ============================================
ALTER TABLE "LifeSkillEvent" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "life_skill_event_own_read" ON "LifeSkillEvent";
CREATE POLICY "life_skill_event_own_read" ON "LifeSkillEvent"
  FOR SELECT
  USING (auth.uid()::text = "userId");

DROP POLICY IF EXISTS "life_skill_event_own_insert" ON "LifeSkillEvent";
CREATE POLICY "life_skill_event_own_insert" ON "LifeSkillEvent"
  FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

-- ============================================
-- LifeSkillRecommendation - Own read only
-- ============================================
ALTER TABLE "LifeSkillRecommendation" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "life_skill_recommendation_own_read" ON "LifeSkillRecommendation";
CREATE POLICY "life_skill_recommendation_own_read" ON "LifeSkillRecommendation"
  FOR SELECT
  USING (auth.uid()::text = "userId");

-- ============================================
-- LifeSkillView - Own read/write
-- ============================================
ALTER TABLE "LifeSkillView" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "life_skill_view_own_read" ON "LifeSkillView";
CREATE POLICY "life_skill_view_own_read" ON "LifeSkillView"
  FOR SELECT
  USING (auth.uid()::text = "userId");

DROP POLICY IF EXISTS "life_skill_view_own_insert" ON "LifeSkillView";
CREATE POLICY "life_skill_view_own_insert" ON "LifeSkillView"
  FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

DROP POLICY IF EXISTS "life_skill_view_own_update" ON "LifeSkillView";
CREATE POLICY "life_skill_view_own_update" ON "LifeSkillView"
  FOR UPDATE
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

-- ============================================
-- UserPreferences - Own read/write
-- ============================================
ALTER TABLE "UserPreferences" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_preferences_own_read" ON "UserPreferences";
CREATE POLICY "user_preferences_own_read" ON "UserPreferences"
  FOR SELECT
  USING (auth.uid()::text = "userId");

DROP POLICY IF EXISTS "user_preferences_own_insert" ON "UserPreferences";
CREATE POLICY "user_preferences_own_insert" ON "UserPreferences"
  FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

DROP POLICY IF EXISTS "user_preferences_own_update" ON "UserPreferences";
CREATE POLICY "user_preferences_own_update" ON "UserPreferences"
  FOR UPDATE
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");
