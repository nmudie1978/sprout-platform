-- ═══════════════════════════════════════════════════════════════════════════
--  Grandfather existing users onto Pro for six months
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Every feature the Pro plan gates — Events & Opportunities, AI guidance, the
-- personal roadmap, comparison, progress tracking — was free until this
-- release, and Career Twin was unlimited. Enforcing the new limits without
-- this migration would take things away, mid-journey, from people who were
-- never told a limit existed.
--
-- So anyone who already has a profile gets Pro until 2027-03-07. `expiresAt`
-- does the work: isSubscriptionUsable() already treats an elapsed expiry as
-- no subscription, so these grants lapse to Free on their own with no second
-- migration and no cron.
--
-- grantedBy records WHY, so a support conversation in five months can tell a
-- grandfathered grant from a purchase. provider stays NULL — nobody paid.
--
-- ONLY existing rows. An account created after this runs gets nothing here
-- and meets the Free allowances immediately, which is the intended new
-- behaviour.
--
-- Idempotent: ON CONFLICT DO NOTHING means re-running cannot overwrite a real
-- subscription bought in the meantime.
--
-- TO REVERSE (before the date):
--   DELETE FROM "PersonalSubscription" WHERE "grantedBy" = 'grandfather:free-pro-launch';

INSERT INTO "PersonalSubscription" (
  "id", "userId", "tier", "status", "startedAt", "expiresAt",
  "moduleOverrides", "grantedBy", "note", "createdAt", "updatedAt"
)
SELECT
  gen_random_uuid()::text,
  p."userId",
  'PRO'::"SubscriptionTier",
  'ACTIVE'::"SubscriptionStatus",
  NOW(),
  TIMESTAMP '2027-03-07 00:00:00',
  ARRAY[]::"EntitlementModule"[],
  'grandfather:free-pro-launch',
  'Account existed before the Free/Pro split; these features were free when they signed up.',
  NOW(),
  NOW()
FROM "YouthProfile" p
ON CONFLICT ("userId") DO NOTHING;
