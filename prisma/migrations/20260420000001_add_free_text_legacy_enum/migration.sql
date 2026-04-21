-- Step 1 (isolated transaction): Add the FREE_TEXT_LEGACY enum value.
-- Postgres requires ALTER TYPE ... ADD VALUE to commit before the
-- new value can be used in DML, so this must be its own migration.
ALTER TYPE "MessageIntent" ADD VALUE IF NOT EXISTS 'FREE_TEXT_LEGACY';
