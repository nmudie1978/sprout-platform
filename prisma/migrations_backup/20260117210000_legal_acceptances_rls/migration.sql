-- CreateTable
CREATE TABLE IF NOT EXISTS "LegalAcceptance" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "acceptedTermsAt" TIMESTAMP(3) NOT NULL,
    "acceptedPrivacyAt" TIMESTAMP(3) NOT NULL,
    "termsVersion" TEXT NOT NULL DEFAULT 'v1',
    "privacyVersion" TEXT NOT NULL DEFAULT 'v1',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalAcceptance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "LegalAcceptance_userId_key" ON "LegalAcceptance"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LegalAcceptance_userId_idx" ON "LegalAcceptance"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LegalAcceptance_createdAt_idx" ON "LegalAcceptance"("createdAt");

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Enable RLS on LegalAcceptance table
ALTER TABLE "LegalAcceptance" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can SELECT their own acceptance record
CREATE POLICY "legal_acceptances_select_own"
ON "LegalAcceptance"
FOR SELECT
USING (
    auth.uid()::text = "userId"
);

-- Policy: Users can INSERT their own acceptance record
CREATE POLICY "legal_acceptances_insert_own"
ON "LegalAcceptance"
FOR INSERT
WITH CHECK (
    auth.uid()::text = "userId"
);

-- Policy: Users can UPDATE their own acceptance record (for re-acceptance)
CREATE POLICY "legal_acceptances_update_own"
ON "LegalAcceptance"
FOR UPDATE
USING (
    auth.uid()::text = "userId"
)
WITH CHECK (
    auth.uid()::text = "userId"
);

-- Policy: Admin users can SELECT all acceptance records
-- (Assumes admin role is set via Supabase custom claims or app_metadata)
CREATE POLICY "legal_acceptances_admin_select"
ON "LegalAcceptance"
FOR SELECT
USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN'
    OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'ADMIN'
);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE "LegalAcceptance" IS 'Records user acceptance of Terms of Service and Privacy Policy. Required for platform access.';
COMMENT ON COLUMN "LegalAcceptance"."userId" IS 'Foreign key to User table - the user who accepted the terms';
COMMENT ON COLUMN "LegalAcceptance"."acceptedTermsAt" IS 'Timestamp when Terms of Service were accepted';
COMMENT ON COLUMN "LegalAcceptance"."acceptedPrivacyAt" IS 'Timestamp when Privacy Policy was accepted';
COMMENT ON COLUMN "LegalAcceptance"."termsVersion" IS 'Version of Terms of Service that was accepted';
COMMENT ON COLUMN "LegalAcceptance"."privacyVersion" IS 'Version of Privacy Policy that was accepted';
COMMENT ON COLUMN "LegalAcceptance"."ipAddress" IS 'IP address at time of acceptance (for audit trail)';
COMMENT ON COLUMN "LegalAcceptance"."userAgent" IS 'User agent at time of acceptance (for audit trail)';
