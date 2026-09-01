-- ═══════════════════════════════════════════════════════════════════════════
--  Email verification tokens
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Same shape and threat model as PasswordResetToken: only the SHA-256 hash of
-- the token is stored, so a database leak cannot be used to mark anyone's
-- address as verified. Single-use via `usedAt`, short-lived via `expiresAt`.
--
-- `email` records the address the token was issued FOR. Verification compares
-- it against the account's current address, so a link issued for an old
-- address can never confirm a changed one.
--
-- NOTE: `User.emailVerified` already exists (it has been in the schema since
-- the NextAuth adapter was added) and was never written to. This migration
-- adds no column for it; the application now populates it.

-- CreateTable
CREATE TABLE "EmailVerificationToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationToken_tokenHash_key" ON "EmailVerificationToken"("tokenHash");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_userId_idx" ON "EmailVerificationToken"("userId");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_expiresAt_idx" ON "EmailVerificationToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "EmailVerificationToken" ADD CONSTRAINT "EmailVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ── Supabase hardening ────────────────────────────────────────────────────
-- Match the deny-by-default posture established in
-- 20260901093000_supabase_rls_deny_by_default. A new table created after that
-- migration does NOT inherit its ENABLE ROW LEVEL SECURITY, so state it here
-- or this table would be the one gap in the wall. Zero policies = no rows for
-- anyone except the BYPASSRLS roles the app connects as.
ALTER TABLE "EmailVerificationToken" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "EmailVerificationToken" FROM anon, authenticated;

-- ── Uniqueness of User.email ──────────────────────────────────────────────
-- Restated as a comment, not a change: "User_email_key" already exists and is
-- what actually prevents two accounts on one address. The signup route's
-- pre-check only narrows the race window; this constraint closes it, and the
-- route now treats the resulting P2002 as the duplicate case rather than a 500.
