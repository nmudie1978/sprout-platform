-- CreateTable: anonymous aggregate dark/light theme usage counters.
-- No user/session identifiers — two running totals only.
CREATE TABLE "ThemeTally" (
    "theme" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThemeTally_pkey" PRIMARY KEY ("theme")
);
