-- CreateTable
CREATE TABLE "CareerTwinMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareerTwinMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CareerTwinMessage_userId_careerId_createdAt_idx" ON "CareerTwinMessage"("userId", "careerId", "createdAt");

-- AddForeignKey
ALTER TABLE "CareerTwinMessage" ADD CONSTRAINT "CareerTwinMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
