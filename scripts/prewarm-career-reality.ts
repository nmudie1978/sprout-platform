/**
 * Prewarm the career-reality cache for every career in CAREER_PATHWAYS.
 *
 * Why: the /api/career-reality route caches its result in `VideoCache` for 7
 * days. The first user to view a career still pays the full cost (OpenAI call
 * + several YouTube searches), which can be slow. By prewarming, every career
 * already has a warm cache so users see "The Reality" panel instantly.
 *
 * Usage:
 *   npm run prewarm:career-reality                   # hits http://localhost:3000
 *   BASE_URL=https://endeavrly.com \
 *     npm run prewarm:career-reality                 # hits production
 *   FORCE=1 npm run prewarm:career-reality           # bypass DB cache (re-fetch all)
 *   ONLY="Beautician,Doctor" npm run prewarm:...     # only specific careers
 *
 * Notes:
 *  - Runs against the live route, so it respects all the same logic
 *    (normalisation, scoring, cache TTL).
 *  - Sequential with a small delay to be polite to the YouTube API quota.
 *  - Reports per-career success / failure / video count at the end.
 */

import { CAREER_PATHWAYS } from '../src/lib/career-pathways';
import { prisma } from '../src/lib/prisma';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const FORCE = process.env.FORCE === '1';
const ONLY = process.env.ONLY?.split(',').map((s) => s.trim().toLowerCase());
// Polite delay between requests so we don't burn the YouTube quota in one burst.
const DELAY_MS = Number(process.env.DELAY_MS ?? 600);

interface Result {
  career: string;
  status: 'ok' | 'empty' | 'error' | 'skipped';
  videos: number;
  detail?: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function prewarmOne(career: string): Promise<Result> {
  const cacheKey = `career-reality:${career.toLowerCase().trim()}`;

  if (!FORCE) {
    try {
      const cached = await prisma.videoCache.findUnique({ where: { cacheKey } });
      if (cached && cached.expiresAt > new Date()) {
        const data = cached.data as any;
        const videos = Array.isArray(data?.videos) ? data.videos.length : 0;
        // Skip if already warm AND has at least one video.
        if (videos > 0) {
          return { career, status: 'skipped', videos, detail: 'already cached' };
        }
      }
    } catch {
      /* fall through and re-fetch */
    }
  }

  try {
    const url = `${BASE_URL}/api/career-reality?career=${encodeURIComponent(career)}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      return { career, status: 'error', videos: 0, detail: `HTTP ${res.status}` };
    }
    const data = (await res.json()) as { videos?: unknown[] };
    const videos = Array.isArray(data?.videos) ? data.videos.length : 0;
    return {
      career,
      status: videos > 0 ? 'ok' : 'empty',
      videos,
    };
  } catch (err) {
    return {
      career,
      status: 'error',
      videos: 0,
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}

async function main() {
  const allCareers: string[] = [];
  for (const list of Object.values(CAREER_PATHWAYS)) {
    for (const c of list) allCareers.push(c.title);
  }
  // De-dupe in case any title repeats across categories.
  const careers = Array.from(new Set(allCareers)).filter(
    (t) => !ONLY || ONLY.includes(t.toLowerCase()),
  );

  console.log(`Prewarming reality cache for ${careers.length} careers`);
  console.log(`  base: ${BASE_URL}`);
  console.log(`  force: ${FORCE}`);
  console.log(`  delay: ${DELAY_MS}ms`);
  console.log('');

  const results: Result[] = [];
  for (let i = 0; i < careers.length; i++) {
    const career = careers[i];
    process.stdout.write(`[${i + 1}/${careers.length}] ${career}… `);
    const r = await prewarmOne(career);
    results.push(r);
    const tag =
      r.status === 'ok' ? `✓ ${r.videos} videos`
      : r.status === 'empty' ? '∅ no videos'
      : r.status === 'skipped' ? `↷ ${r.detail}`
      : `✗ ${r.detail}`;
    console.log(tag);
    if (r.status !== 'skipped') await sleep(DELAY_MS);
  }

  // Summary
  const ok = results.filter((r) => r.status === 'ok').length;
  const empty = results.filter((r) => r.status === 'empty').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;
  const errored = results.filter((r) => r.status === 'error');

  console.log('');
  console.log('─'.repeat(50));
  console.log(`Done. ${ok} ok · ${empty} empty · ${skipped} skipped · ${errored.length} errored`);

  if (empty > 0) {
    console.log('');
    console.log('Empty (no videos found — review query/normaliser):');
    for (const r of results.filter((r) => r.status === 'empty')) {
      console.log(`  - ${r.career}`);
    }
  }
  if (errored.length > 0) {
    console.log('');
    console.log('Errors:');
    for (const r of errored) console.log(`  - ${r.career}: ${r.detail}`);
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
