-- Safety Hardening Migration
-- Implements: Vipps/BankID auth, structured messaging, payment agreements (informational only)

-- ============================================
-- 1. NEW ENUMS
-- ============================================

-- Authentication provider enum
CREATE TYPE "AuthProvider" AS ENUM ('EMAIL', 'VIPPS', 'BANKID');

-- Youth age band enum (more granular)
CREATE TYPE "YouthAgeBand" AS ENUM ('UNDER_SIXTEEN', 'SIXTEEN_SEVENTEEN', 'EIGHTEEN_TWENTY');

-- Payment methods (for informational agreements only - NO transactions)
CREATE TYPE "PaymentMethod" AS ENUM ('VIPPS', 'CASH', 'BANK_TRANSFER');

-- Payment agreement status (informational only)
CREATE TYPE "PaymentAgreementStatus" AS ENUM ('AGREED', 'MARKED_PAID');

-- ============================================
-- 2. USER TABLE: Add authentication & verification fields
-- ============================================

-- Add authentication provider
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "authProvider" "AuthProvider" NOT NULL DEFAULT 'EMAIL';

-- Add full name (from Vipps/BankID)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "fullName" TEXT;

-- Add phone number to User (not just YouthProfile)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phoneNumber" TEXT;

-- Add phone verification
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phoneVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phoneVerifiedAt" TIMESTAMP(3);

-- Add adult verification fields (CRITICAL for safety)
-- Adults MUST verify via BankID before contacting youth
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isVerifiedAdult" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verificationProvider" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3);

-- Add youth age band
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "youthAgeBand" "YouthAgeBand";

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS "User_isVerifiedAdult_idx" ON "User"("isVerifiedAdult");
CREATE INDEX IF NOT EXISTS "User_authProvider_idx" ON "User"("authProvider");

-- ============================================
-- 3. MESSAGE TABLE: Support structured messaging
-- ============================================

-- Make templateId nullable (for backward compatibility with legacy messages)
ALTER TABLE "Message" ALTER COLUMN "templateId" DROP NOT NULL;

-- Make payload nullable
ALTER TABLE "Message" ALTER COLUMN "payload" DROP NOT NULL;

-- Make renderedText nullable
ALTER TABLE "Message" ALTER COLUMN "renderedText" DROP NOT NULL;

-- Add legacy content field (for backward compatibility)
-- New messages MUST NOT use this - enforced at API level
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "content" TEXT;

-- ============================================
-- 4. PAYMENT AGREEMENT TABLE (INFORMATIONAL ONLY)
-- ============================================
-- IMPORTANT: This table is for transparency ONLY.
-- NO money moves through the platform.
-- Payments happen externally (Vipps, cash, bank transfer).

CREATE TABLE IF NOT EXISTS "PaymentAgreement" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "agreedAmount" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'NOK',
    "status" "PaymentAgreementStatus" NOT NULL DEFAULT 'AGREED',
    "markedPaidById" TEXT,
    "markedPaidAt" TIMESTAMP(3),
    "notes" VARCHAR(200),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentAgreement_pkey" PRIMARY KEY ("id")
);

-- One agreement per conversation
CREATE UNIQUE INDEX IF NOT EXISTS "PaymentAgreement_conversationId_key" ON "PaymentAgreement"("conversationId");
CREATE INDEX IF NOT EXISTS "PaymentAgreement_status_idx" ON "PaymentAgreement"("status");

-- Foreign keys
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PaymentAgreement_conversationId_fkey') THEN
        ALTER TABLE "PaymentAgreement" ADD CONSTRAINT "PaymentAgreement_conversationId_fkey"
        FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PaymentAgreement_markedPaidById_fkey') THEN
        ALTER TABLE "PaymentAgreement" ADD CONSTRAINT "PaymentAgreement_markedPaidById_fkey"
        FOREIGN KEY ("markedPaidById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- ============================================
-- 5. SEED DEFAULT MESSAGE TEMPLATES
-- ============================================
-- These templates enable structured, safe communication

INSERT INTO "MessageTemplate" ("id", "key", "label", "description", "allowedFields", "direction", "isActive", "category", "sortOrder", "createdAt", "updatedAt")
VALUES
    -- Scheduling templates
    (gen_random_uuid()::text, 'ASK_AVAILABILITY', 'Ask about availability', 'Check if the worker is available',
     '{"fields": [{"name": "date", "type": "date", "label": "Date", "required": true}, {"name": "timeSlot", "type": "select", "label": "Time", "options": ["Morning (8-12)", "Afternoon (12-17)", "Evening (17-21)"], "required": true}]}',
     'ADULT_TO_YOUTH', true, 'scheduling', 1, NOW(), NOW()),

    (gen_random_uuid()::text, 'CONFIRM_AVAILABILITY', 'Confirm availability', 'Confirm you are available',
     '{"fields": [{"name": "available", "type": "boolean", "label": "I am available", "required": true}, {"name": "alternativeDate", "type": "date", "label": "Alternative date (if not available)", "required": false}]}',
     'YOUTH_TO_ADULT', true, 'scheduling', 2, NOW(), NOW()),

    (gen_random_uuid()::text, 'PROPOSE_TIME', 'Propose meeting time', 'Suggest a specific time to meet',
     '{"fields": [{"name": "date", "type": "date", "label": "Date", "required": true}, {"name": "time", "type": "time", "label": "Time", "required": true}, {"name": "location", "type": "select", "label": "Location", "options": ["At the job address", "A public place nearby"], "required": true}]}',
     'ANY', true, 'scheduling', 3, NOW(), NOW()),

    (gen_random_uuid()::text, 'ACCEPT_TIME', 'Accept proposed time', 'Confirm the proposed meeting time',
     '{"fields": [{"name": "confirmed", "type": "boolean", "label": "I confirm this time works", "required": true}]}',
     'ANY', true, 'scheduling', 4, NOW(), NOW()),

    -- Job-related templates
    (gen_random_uuid()::text, 'ASK_ABOUT_JOB', 'Ask about the job', 'Request more details about the job',
     '{"fields": [{"name": "question", "type": "select", "label": "What would you like to know?", "options": ["Duration and timing", "Specific tasks involved", "Any special requirements", "Location details"], "required": true}]}',
     'YOUTH_TO_ADULT', true, 'job', 10, NOW(), NOW()),

    (gen_random_uuid()::text, 'PROVIDE_JOB_DETAILS', 'Provide job details', 'Answer questions about the job',
     '{"fields": [{"name": "topic", "type": "select", "label": "Topic", "options": ["Duration and timing", "Specific tasks involved", "Special requirements", "Location details"], "required": true}, {"name": "response", "type": "select", "label": "Response", "options": ["As described in the job posting", "Will share details when we meet", "Please check the job description", "Contact me at the scheduled time"], "required": true}]}',
     'ADULT_TO_YOUTH', true, 'job', 11, NOW(), NOW()),

    (gen_random_uuid()::text, 'JOB_STARTED', 'Mark job as started', 'Confirm the job has started',
     '{"fields": [{"name": "started", "type": "boolean", "label": "The job has started", "required": true}]}',
     'ANY', true, 'job', 12, NOW(), NOW()),

    (gen_random_uuid()::text, 'JOB_COMPLETED', 'Mark job as completed', 'Confirm the job is finished',
     '{"fields": [{"name": "completed", "type": "boolean", "label": "The job is completed", "required": true}]}',
     'ANY', true, 'job', 13, NOW(), NOW()),

    -- Payment templates (INFORMATIONAL ONLY - no money through platform)
    (gen_random_uuid()::text, 'CONFIRM_PAYMENT_METHOD', 'Agree on payment method', 'Select how payment will happen (outside the platform)',
     '{"fields": [{"name": "method", "type": "select", "label": "Payment method", "options": ["Vipps", "Cash", "Bank transfer"], "required": true}]}',
     'ANY', true, 'payment', 20, NOW(), NOW()),

    (gen_random_uuid()::text, 'CONFIRM_AMOUNT', 'Confirm payment amount', 'Agree on the payment amount',
     '{"fields": [{"name": "amount", "type": "number", "label": "Amount (NOK)", "min": 1, "max": 10000, "required": true}]}',
     'ANY', true, 'payment', 21, NOW(), NOW()),

    (gen_random_uuid()::text, 'MARK_PAYMENT_COMPLETED', 'Mark payment as completed', 'Confirm payment has been made (informational)',
     '{"fields": [{"name": "paid", "type": "boolean", "label": "Payment has been made", "required": true}]}',
     'ANY', true, 'payment', 22, NOW(), NOW()),

    -- Safety templates
    (gen_random_uuid()::text, 'RUNNING_LATE', 'Running late', 'Let them know you are running late',
     '{"fields": [{"name": "minutes", "type": "select", "label": "How late?", "options": ["5-10 minutes", "15-20 minutes", "More than 20 minutes"], "required": true}]}',
     'ANY', true, 'safety', 30, NOW(), NOW()),

    (gen_random_uuid()::text, 'CANCEL_MEETING', 'Cancel meeting', 'Cancel the scheduled meeting',
     '{"fields": [{"name": "reason", "type": "select", "label": "Reason", "options": ["Sick", "Emergency", "Schedule conflict", "Other"], "required": true}]}',
     'ANY', true, 'safety', 31, NOW(), NOW()),

    (gen_random_uuid()::text, 'REQUEST_RESCHEDULE', 'Request to reschedule', 'Ask to reschedule the meeting',
     '{"fields": [{"name": "reason", "type": "select", "label": "Reason", "options": ["Sick", "Emergency", "Schedule conflict"], "required": true}]}',
     'ANY', true, 'safety', 32, NOW(), NOW()),

    -- Thank you / feedback templates
    (gen_random_uuid()::text, 'SAY_THANKS', 'Say thank you', 'Express gratitude',
     '{"fields": [{"name": "message", "type": "select", "label": "Message", "options": ["Thank you for the opportunity!", "Great working with you!", "Thanks for being reliable!", "Appreciate your help!"], "required": true}]}',
     'ANY', true, 'feedback', 40, NOW(), NOW())

ON CONFLICT ("key") DO NOTHING;

-- ============================================
-- 6. AUDIT LOG: Add new safety actions
-- ============================================

-- Add new audit actions for safety features (if not already exists)
-- Note: ALTER TYPE is tricky, so we use a safe approach
DO $$
BEGIN
    -- Add VIPPS_LOGIN if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'VIPPS_LOGIN' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'AuditAction')) THEN
        ALTER TYPE "AuditAction" ADD VALUE 'VIPPS_LOGIN';
    END IF;

    -- Add BANKID_VERIFICATION_STARTED if not exists (might already exist)
    -- Silently skip if exists
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

-- ============================================
-- 7. SAFETY COMMENTS
-- ============================================

COMMENT ON TABLE "PaymentAgreement" IS 'INFORMATIONAL ONLY - NO money moves through the platform. Payments happen externally via Vipps, cash, or bank transfer.';
COMMENT ON COLUMN "PaymentAgreement"."agreedAmount" IS 'Agreed amount in NOK - for transparency only, not enforced';
COMMENT ON COLUMN "PaymentAgreement"."status" IS 'AGREED = terms agreed, MARKED_PAID = one party marked complete (informational)';

COMMENT ON COLUMN "User"."isVerifiedAdult" IS 'CRITICAL: Adults MUST verify via BankID before contacting youth';
COMMENT ON COLUMN "User"."authProvider" IS 'How user signed up: EMAIL (legacy), VIPPS (youth), BANKID (adults)';

COMMENT ON COLUMN "Message"."content" IS 'DEPRECATED: Legacy free-text content. New messages MUST use templateId + payload.';
COMMENT ON COLUMN "Message"."templateId" IS 'REQUIRED for new messages: Links to approved message template';
