-- ═══════════════════════════════════════════════════════════════════════════
--  Free + Pro consumer plan: PRO tier, provider linkage, exploration counter
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Additive throughout. Nothing is dropped, no existing row changes meaning,
-- and the deploy is safe to run before the application code that uses it.

-- ── 1. The PRO tier ────────────────────────────────────────────────────────
-- PG 12+ (Supabase is PG 15) permits ALTER TYPE ... ADD VALUE. IF NOT EXISTS
-- keeps this idempotent.
--
-- PREMIUM, FAMILY and FAMILY_PLUS are deliberately NOT removed. Dropping an
-- enum value would fail against existing rows, and anyone holding one of
-- those tiers must keep their access — a rename is not a downgrade. They
-- resolve to the same entitlements as PRO in TIER_MODULES / limits.ts.
ALTER TYPE "SubscriptionTier" ADD VALUE IF NOT EXISTS 'PRO';

-- ── 2. Payment provider linkage on PersonalSubscription ────────────────────
-- The provider is the source of truth for payment status; these columns only
-- point at it. No card details are stored here, by design — see CLAUDE.md
-- principle 2.
ALTER TABLE "PersonalSubscription"
  ADD COLUMN IF NOT EXISTS "provider"               VARCHAR(40),
  ADD COLUMN IF NOT EXISTS "externalCustomerId"     VARCHAR(200),
  ADD COLUMN IF NOT EXISTS "externalSubscriptionId" VARCHAR(200),
  ADD COLUMN IF NOT EXISTS "billingInterval"        VARCHAR(10),
  ADD COLUMN IF NOT EXISTS "currency"               VARCHAR(3),
  ADD COLUMN IF NOT EXISTS "billingCountry"         VARCHAR(60),
  ADD COLUMN IF NOT EXISTS "currentPeriodEnd"       TIMESTAMP(3);

-- A provider subscription id must map to at most one row, so a replayed or
-- out-of-order webhook cannot be applied twice or to the wrong user.
CREATE UNIQUE INDEX IF NOT EXISTS "PersonalSubscription_externalSubscriptionId_key"
  ON "PersonalSubscription" ("externalSubscriptionId");

-- ── 3. Career exploration counter ──────────────────────────────────────────
-- One row per career taken into My Journey. The unique constraint is what
-- makes revisiting free and concurrent requests safe: the second insert loses
-- the race harmlessly rather than consuming a second allowance.
CREATE TABLE IF NOT EXISTS "CareerExploration" (
  "id"        TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "careerId"  TEXT NOT NULL,
  "firstAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CareerExploration_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CareerExploration_profileId_careerId_key"
  ON "CareerExploration" ("profileId", "careerId");

CREATE INDEX IF NOT EXISTS "CareerExploration_profileId_firstAt_idx"
  ON "CareerExploration" ("profileId", "firstAt");

ALTER TABLE "CareerExploration"
  DROP CONSTRAINT IF EXISTS "CareerExploration_profileId_fkey";
ALTER TABLE "CareerExploration"
  ADD CONSTRAINT "CareerExploration_profileId_fkey"
  FOREIGN KEY ("profileId") REFERENCES "YouthProfile"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ── 4. Finer-grained modules for the Pro proposition ───────────────────────
-- CLARITY covers "the personal roadmap, next steps and reflection surface".
-- The Pro model gates the roadmap but keeps reflections free, so the module
-- is too coarse to gate directly. Rather than redefine CLARITY — which
-- organisation licences already grant — the roadmap gets its own module.
-- Likewise comparison, which lived inside CAREER_DISCOVERY alongside browsing.
ALTER TYPE "EntitlementModule" ADD VALUE IF NOT EXISTS 'PERSONAL_ROADMAP';
ALTER TYPE "EntitlementModule" ADD VALUE IF NOT EXISTS 'CAREER_COMPARISON';
ALTER TYPE "EntitlementModule" ADD VALUE IF NOT EXISTS 'PROGRESS_TRACKING';
