-- Career Interest: server-authoritative ★1–5 self-rating per career,
-- keyed by (userId, careerId). Additive, non-destructive. New table only
-- — no RLS policies are dropped/altered, and the app connects as the
-- table owner so RLS does not block these writes.

-- CreateTable
CREATE TABLE "CareerInterest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerInterest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CareerInterest_userId_idx" ON "CareerInterest"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CareerInterest_userId_careerId_key" ON "CareerInterest"("userId", "careerId");

-- AddForeignKey
ALTER TABLE "CareerInterest" ADD CONSTRAINT "CareerInterest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
