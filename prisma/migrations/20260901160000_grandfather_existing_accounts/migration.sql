-- ═══════════════════════════════════════════════════════════════════════════
--  Grandfather accounts that predate the email-verification hard gate
-- ═══════════════════════════════════════════════════════════════════════════
--
-- The hard gate refuses a session to any account with `emailVerified IS NULL`.
-- Every account created before verification existed has NULL there — not
-- because those people failed to confirm, but because there was nothing to
-- confirm. Shipping the gate without this migration would sign every existing
-- user out and lock them out, with no email ever having been sent to them.
--
-- So: treat "existed before the gate" as verified. `createdAt` is used as the
-- timestamp rather than now(), so the row honestly records that the account
-- predates the feature rather than claiming it was confirmed today.
--
-- Anyone who signs up AFTER this migration runs gets NULL and must genuinely
-- confirm — the gate applies in full from here on.
--
-- NOT AUTOMATICALLY REVERSIBLE: once these are set, the information about
-- which rows were previously NULL is gone. To re-gate a specific account for
-- testing:  UPDATE "User" SET "emailVerified" = NULL WHERE email = '...';
UPDATE "User"
SET "emailVerified" = "createdAt"
WHERE "emailVerified" IS NULL;
