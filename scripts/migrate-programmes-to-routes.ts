/**
 * Auto-migration: programmes.json → routes.json + stages.json.
 *
 * Phase 2a of the pathway data model rework (see
 * docs/pathway-data-model.md §5.2). This script is IDEMPOTENT — it
 * regenerates both output files from scratch each run, and is the
 * single source of truth until Phase 4 hand-edits the route data with
 * real alternative routes.
 *
 * Behaviour: for every unique careerId in programmes.json, emit one
 * default Route called "Standard route" containing one education
 * Stage that references every programme for that career. Net effect on
 * the running app: zero — Phase 2b API will read these files but Phase
 * 3 UI hides the route picker until a career has multiple routes.
 *
 * Run: npx tsx scripts/migrate-programmes-to-routes.ts
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Route, Stage, RoutesFile, StagesFile } from '../src/lib/education/route-types';

const root = resolve(__dirname, '..');
const today = new Date().toISOString().slice(0, 10);

interface ProgrammeRow {
  id: string;
  careerId: string;
  institutionId: string;
  programme: string;
  url: string;
  type?: string;
  duration?: string;
  // ... other fields ignored for migration purposes
}

const programmesFile = JSON.parse(
  readFileSync(resolve(root, 'src/lib/education/data/programmes.json'), 'utf8'),
) as { programmes: ProgrammeRow[] };

// Group programmes by careerId.
const byCareer = new Map<string, ProgrammeRow[]>();
for (const p of programmesFile.programmes) {
  if (!byCareer.has(p.careerId)) byCareer.set(p.careerId, []);
  byCareer.get(p.careerId)!.push(p);
}

const routes: Omit<Route, 'stages'>[] = [];
const stages: Stage[] = [];

// Average duration parsing — picks the first numeric token from a
// duration string like "5 years", "3 + 2 years", "18-24 months". Used
// for the route's estimatedYears at-a-glance number. Hand-edited
// routes will override this with a hand-curated value.
function parseYears(durations: (string | undefined)[]): number {
  const nums = durations
    .map((d) => {
      if (!d) return null;
      const lower = d.toLowerCase();
      const monthsMatch = lower.match(/(\d+)\s*month/);
      if (monthsMatch) return parseInt(monthsMatch[1], 10) / 12;
      const yearMatch = lower.match(/(\d+(?:\.\d+)?)/);
      return yearMatch ? parseFloat(yearMatch[1]) : null;
    })
    .filter((n): n is number => n !== null);
  if (nums.length === 0) return 3; // sensible default
  // Use median to avoid one weird "10 years" entry skewing the rest.
  const sorted = [...nums].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

for (const [careerId, programmes] of byCareer) {
  const routeId = `${careerId}--standard`;
  const stageId = `${routeId}--education`;

  routes.push({
    id: routeId,
    careerId,
    name: 'Standard route',
    shortName: 'Standard',
    // Empty summary → Phase 3 UI skips the route-summary block. Real
    // hand-curated routes set this. Not a user-facing string today.
    summary: '',
    tags: ['common'],
    isDefault: true,
    countryCode: null,
    estimatedYears: parseYears(programmes.map((p) => p.duration)),
  });

  stages.push({
    id: stageId,
    routeId,
    orderIndex: 0,
    kind: 'education',
    title: 'Education',
    durationYears: parseYears(programmes.map((p) => p.duration)),
    // Empty description → Phase 3 UI skips the stage-description
    // block. Real hand-curated stages set this. Avoiding placeholder
    // copy that would leak to users when Phase 3 UI ships.
    description: '',
    programmeIds: programmes.map((p) => p.id),
  });
}

const routesOut: RoutesFile = {
  meta: {
    source: 'Auto-migrated from programmes.json by scripts/migrate-programmes-to-routes.ts',
    lastUpdated: today,
    schemaVersion: 1,
  },
  routes,
};

const stagesOut: StagesFile = {
  meta: {
    source: 'Auto-migrated from programmes.json by scripts/migrate-programmes-to-routes.ts',
    lastUpdated: today,
    schemaVersion: 1,
  },
  stages,
};

const routesPath = resolve(root, 'src/lib/education/data/routes.json');
const stagesPath = resolve(root, 'src/lib/education/data/stages.json');

writeFileSync(routesPath, JSON.stringify(routesOut, null, 2) + '\n');
writeFileSync(stagesPath, JSON.stringify(stagesOut, null, 2) + '\n');

// Invariant check: every programme in the source file appears in
// exactly one stage. If this fails the migration is broken.
const stageProgrammeIds = new Set(stages.flatMap((s) => s.programmeIds));
const sourceProgrammeIds = new Set(programmesFile.programmes.map((p) => p.id));
let missing = 0;
for (const id of sourceProgrammeIds) {
  if (!stageProgrammeIds.has(id)) {
    console.error(`✗ programme not in any stage: ${id}`);
    missing++;
  }
}
if (missing > 0) {
  console.error(`\n✗ migration FAILED — ${missing} programme(s) lost.`);
  process.exit(1);
}

console.log(`✓ Wrote ${routesPath}`);
console.log(`✓ Wrote ${stagesPath}`);
console.log(`  ${routes.length} route(s), ${stages.length} stage(s), ${sourceProgrammeIds.size} programme(s) covered.`);
