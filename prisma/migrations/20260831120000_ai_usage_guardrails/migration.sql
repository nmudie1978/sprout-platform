-- AI usage guardrails: per-request usage/cost ledger + rolling Career Twin
-- conversation summaries.
--
-- Both tables are written ONLY by server-side code (API route handlers via
-- Prisma). Nothing in the browser reads or writes them.

-- CreateTable
CREATE TABLE "AiUsageEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "model" TEXT,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "estimatedCostUsd" DECIMAL(12,6) NOT NULL DEFAULT 0,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiUsageEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerTwinSummary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "coveredThrough" TIMESTAMP(3) NOT NULL,
    "turnsCovered" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerTwinSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
-- Rolling 24h per-user question limit lookup.
CREATE INDEX "AiUsageEvent_userId_feature_status_createdAt_idx" ON "AiUsageEvent"("userId", "feature", "status", "createdAt");

-- CreateIndex
-- Monthly platform cost aggregate.
CREATE INDEX "AiUsageEvent_createdAt_idx" ON "AiUsageEvent"("createdAt");

-- CreateIndex
CREATE INDEX "AiUsageEvent_feature_createdAt_idx" ON "AiUsageEvent"("feature", "createdAt");

-- CreateIndex
CREATE INDEX "CareerTwinSummary_userId_careerId_idx" ON "CareerTwinSummary"("userId", "careerId");

-- CreateIndex
CREATE UNIQUE INDEX "CareerTwinSummary_userId_careerId_key" ON "CareerTwinSummary"("userId", "careerId");

-- AddForeignKey
ALTER TABLE "AiUsageEvent" ADD CONSTRAINT "AiUsageEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerTwinSummary" ADD CONSTRAINT "CareerTwinSummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================
-- Row-Level Security
-- ============================================================
-- Supabase exposes every table in `public` through PostgREST (anon /
-- authenticated roles). These two tables hold per-user AI usage metadata and
-- summarised conversation context, and are only ever touched by server code
-- through Prisma — so enable RLS with NO policies: PostgREST clients get
-- nothing, while the Prisma connection role (superuser, BYPASSRLS) is
-- unaffected. See prisma/migrations/20260421000000_rls_phase_1 for the wider
-- rollout caveats.
ALTER TABLE "AiUsageEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CareerTwinSummary" ENABLE ROW LEVEL SECURITY;
