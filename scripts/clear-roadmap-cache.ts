/**
 * Clear all roadmap caches for a single user.
 *
 * Usage:
 *   npx tsx scripts/clear-roadmap-cache.ts <email>
 *
 * Wipes:
 *   - youthProfile.generatedTimeline           (per-user cached timeline)
 *   - youthProfile.foundationCardData          (Foundation card status)
 *   - videoCache rows keyed timeline:<career>:age*  (global cache)
 *
 * Browser localStorage (`roadmap-card-data`) is NOT touched — clear that
 * from the browser devtools after running this if you want a fully
 * clean slate:
 *
 *   localStorage.removeItem('roadmap-card-data');  location.reload();
 */

import { prisma } from '@/lib/prisma';

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: npx tsx scripts/clear-roadmap-cache.ts <email>');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, fullName: true },
  });
  if (!user) {
    console.error(`No user found for email: ${email}`);
    process.exit(1);
  }
  console.log(`Found user: ${user.email} (${user.id})`);

  const profile = await prisma.youthProfile.update({
    where: { userId: user.id },
    data: {
      generatedTimeline: null as never,
      foundationCardData: null as never,
    },
    select: { id: true },
  });
  console.log(`✓ Cleared per-user timeline + foundation cache (profile ${profile.id})`);

  // Global cache rows aren't user-scoped — they're shared by everyone
  // generating the same career+age+stage. Wipe everything timeline:* so
  // the next request regenerates fresh.
  const globalDeleted = await prisma.videoCache.deleteMany({
    where: { cacheKey: { startsWith: 'timeline:' } },
  });
  console.log(`✓ Cleared ${globalDeleted.count} global timeline cache rows`);

  console.log('\nDone. Reload the page in the browser. Also clear localStorage if needed:');
  console.log("  localStorage.removeItem('roadmap-card-data'); location.reload();");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
