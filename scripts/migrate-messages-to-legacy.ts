/**
 * Migration Script: Mark existing messages as legacy
 *
 * This script marks all existing messages that don't use the new
 * intent-based system as legacy. Legacy messages are read-only
 * and cannot be replied to.
 *
 * Run with: npx tsx scripts/migrate-messages-to-legacy.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting message migration to legacy...\n");

  // Count existing messages
  const totalMessages = await prisma.message.count();
  console.log(`Total messages in database: ${totalMessages}`);

  // Count messages without intent (these are legacy)
  const legacyCount = await prisma.message.count({
    where: {
      intent: null,
    },
  });
  console.log(`Messages without intent (to be marked as legacy): ${legacyCount}`);

  if (legacyCount === 0) {
    console.log("\nNo legacy messages to migrate. All messages are intent-based.");
    return;
  }

  // Mark all messages without intent as legacy
  console.log("\nMarking messages as legacy...");
  const result = await prisma.message.updateMany({
    where: {
      intent: null,
      isLegacy: false, // Only update if not already marked
    },
    data: {
      isLegacy: true,
    },
  });

  console.log(`\nMarked ${result.count} messages as legacy.`);

  // Verify
  const verifyCount = await prisma.message.count({
    where: {
      isLegacy: true,
    },
  });
  console.log(`Total legacy messages now: ${verifyCount}`);

  console.log("\nMigration complete!");
  console.log("\nNote: Legacy messages are read-only and render with a 'Legacy message' indicator.");
  console.log("New messages must use the intent-based system.");
}

main()
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
