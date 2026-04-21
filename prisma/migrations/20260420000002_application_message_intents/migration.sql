-- F10: Application.message intent templates.
--
-- Ports Application.message from a raw-text free-form field into the
-- same structured intent system conversations use. See
-- src/lib/message-intents.ts for the template set and validation.
--
-- Rows that exist before this migration are soft-migrated:
--   messageIntent        = 'FREE_TEXT_LEGACY'
--   messageVariables     = NULL
--   message              = (unchanged — the original free-text, shown
--                           to the employer with a legacy badge)
--
-- All applications written after this migration will use a real
-- MessageIntent value + structured variables. The `message` column
-- is kept for display convenience (stores the rendered text) but is
-- no longer source of truth.

-- Step 1 (enum value) is in the previous migration
-- (20260420000001_add_free_text_legacy_enum) so the new value is
-- committed and usable by the time this migration runs.

-- Step 2: Add the new nullable columns.
ALTER TABLE "Application" ADD COLUMN "messageIntent" "MessageIntent";
ALTER TABLE "Application" ADD COLUMN "messageVariables" JSONB;

-- Step 3: Soft-migrate existing rows. Any row with a non-empty
-- message string predates the intent system; tag it as legacy so
-- the employer view can render it with a "Legacy message" badge
-- and new code can tell structured rows from unstructured ones.
UPDATE "Application"
SET "messageIntent" = 'FREE_TEXT_LEGACY'
WHERE "message" IS NOT NULL AND "message" <> '';

-- Step 4: Make `message` nullable. New applications can be submitted
-- with no message at all (intent is optional per product requirement).
ALTER TABLE "Application" ALTER COLUMN "message" DROP NOT NULL;
