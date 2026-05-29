/**
 * Norway programme sync — pulls structured programme + occupation data
 * from utdanning.no and stamps `lastVerifiedAt` on every record it
 * touches in `src/lib/education/data/programmes.json`.
 *
 * SCAFFOLD STATUS: this script is NOT yet wired against real
 * utdanning.no endpoints. The fetch layer in `fetchUtdanningProgrammes`
 * currently throws — replace with the live integration once you have
 * the endpoint paths and any required auth confirmed. Until then
 * `--dry-run` (default) walks the diff path against an empty source
 * set, which is useful for validating the comparison + stamping logic
 * without going to network.
 *
 * Usage:
 *   npx tsx scripts/sync-norway-programmes.ts            # dry run
 *   npx tsx scripts/sync-norway-programmes.ts --apply    # write changes
 *   npx tsx scripts/sync-norway-programmes.ts --verbose  # noisier diff
 *
 * Design notes:
 *   - Idempotent: a re-run with no upstream changes is a no-op (only
 *     `lastVerifiedAt` updates on records still matched at source).
 *   - Conservative: never deletes a hand-curated record that no longer
 *     appears upstream — flags it for human review instead. Loss of
 *     coverage from gov data shouldn't silently delete content.
 *   - Honest about provenance: every record stamped with
 *     verificationSource="utdanning.no" plus today's ISO date.
 *
 * What you need before going live:
 *   1. Confirm the utdanning.no API base URL and exact endpoints for
 *      `programmes` (utdanning) and `institutions` (lærested). The
 *      public docs live at https://data.utdanning.no/.
 *   2. Confirm whether any rate-limit / auth header is required.
 *   3. Map their canonical IDs to our internal `programme.id` shape
 *      (`<country>-<institution-short>-<slug>`). The mapping table at
 *      the bottom of this file is the seam.
 *   4. Decide what to do about programmes upstream that we don't
 *      currently track — `--include-new` flag, default false.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Programme } from '../src/lib/education';

// ── Config ────────────────────────────────────────────────────────

const ROOT = resolve(__dirname, '..');
const PROGRAMMES_PATH = resolve(ROOT, 'src/lib/education/data/programmes.json');
const VERIFICATION_SOURCE = 'utdanning.no';
const TODAY = new Date().toISOString().slice(0, 10);

// Public API base. NOT yet verified against live — placeholder until
// you confirm the actual endpoints. The data.utdanning.no portal
// exposes structured education + occupation data under stable URLs.
const UTDANNING_API_BASE = 'https://data.utdanning.no';

// ── CLI args ──────────────────────────────────────────────────────

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const VERBOSE = args.includes('--verbose');
const INCLUDE_NEW = args.includes('--include-new');

if (APPLY) {
  console.warn(
    '[sync-norway] APPLY mode — will write to programmes.json. Re-run without --apply for a dry run.',
  );
}

// ── Types for upstream data ───────────────────────────────────────

/**
 * Shape of a programme record as we expect to receive it from
 * utdanning.no. Based on data.utdanning.no docs; refine when wiring
 * the live fetch.
 */
interface UtdanningProgramme {
  /** Their canonical programme ID. */
  id: string;
  /** Norwegian programme name. */
  navn: string;
  /** English name if available. */
  englishName?: string;
  /** Programme URL on utdanning.no. */
  url: string;
  /** Institution code, e.g. "uio", "ntnu". */
  institusjonskode: string;
  /** Programme type — bachelor / master / integrert / yrkesfag. */
  utdanningstype: string;
  /** Duration string. */
  varighet?: string;
  /** Norwegian occupation IDs (yrker) this programme leads to. */
  yrkeIds?: string[];
}

/** Result of a diff between upstream and on-disk. */
interface DiffEntry {
  kind: 'matched' | 'new' | 'missing-upstream';
  programmeId: string;
  upstream?: UtdanningProgramme;
  local?: Programme;
  changes?: string[];
}

// ── Fetch ─────────────────────────────────────────────────────────

/**
 * Pulls all Norwegian programmes from utdanning.no. NOT YET WIRED —
 * fill in the actual endpoint(s) and pagination once you have them
 * confirmed. Keeping this as the only network seam makes it easy to
 * mock for tests later.
 */
async function fetchUtdanningProgrammes(): Promise<UtdanningProgramme[]> {
  if (APPLY) {
    throw new Error(
      '[sync-norway] live fetch not yet implemented. Wire fetchUtdanningProgrammes() against ' +
        UTDANNING_API_BASE +
        ' before re-running with --apply.',
    );
  }
  // Dry-run path — return an empty array so the diff machinery exercises
  // its "missing-upstream" branch against existing local programmes.
  // Once the live integration lands, swap this for the real call.
  if (VERBOSE) {
    console.log('[sync-norway] dry-run: returning empty upstream set (no network call).');
  }
  return [];
}

// ── Map upstream → our shape ──────────────────────────────────────

/**
 * Convert a utdanning.no record into our internal Programme shape.
 * The institution-code mapping is the trickiest bit because
 * utdanning.no uses short codes like "uio", "ntnu", "hvl", and our
 * internal IDs follow the convention `<country>-<inst-short>-<slug>`.
 *
 * Today's mapping is hand-coded; once you know the full universe of
 * utdanning.no institusjonskode values, replace this with a table
 * sourced from `data/institutions.json`.
 */
function mapToProgramme(upstream: UtdanningProgramme): Programme | null {
  const institutionId = mapInstitutionCode(upstream.institusjonskode);
  if (!institutionId) {
    if (VERBOSE) {
      console.log(
        `[sync-norway] skipping ${upstream.id}: unknown institution code "${upstream.institusjonskode}"`,
      );
    }
    return null;
  }

  return {
    id: `no-${upstream.institusjonskode}-${slugify(upstream.navn)}`,
    careerId: '', // resolved separately via yrkeIds → careerId mapping
    institutionId,
    programme: upstream.navn,
    englishName: upstream.englishName ?? upstream.navn,
    url: upstream.url,
    type: mapType(upstream.utdanningstype),
    duration: upstream.varighet ?? '',
    languageOfInstruction: 'Norwegian',
    lastVerifiedAt: TODAY,
    verificationSource: VERIFICATION_SOURCE,
  };
}

function mapInstitutionCode(code: string): string | null {
  // Replace with a real lookup against institutions.json once the
  // canonical short-code → institution.id table is built. The codes
  // here are illustrative — verify against actual upstream values.
  const map: Record<string, string> = {
    uio: 'no-uio',
    uib: 'no-uib',
    ntnu: 'no-ntnu',
    uit: 'no-uit',
    nmbu: 'no-nmbu',
    hvl: 'no-hvl',
    oslomet: 'no-oslomet',
    nhh: 'no-nhh',
    bi: 'no-bi',
  };
  return map[code.toLowerCase()] ?? null;
}

function mapType(utdanningstype: string): Programme['type'] {
  const map: Record<string, Programme['type']> = {
    bachelor: 'bachelor',
    master: 'master',
    integrert: 'integrated',
    yrkesfag: 'vocational',
    fagbrev: 'fagbrev',
    phd: 'phd',
    diploma: 'diploma',
  };
  return map[utdanningstype.toLowerCase()] ?? 'bachelor';
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

// ── Diff ──────────────────────────────────────────────────────────

function diffSets(
  upstream: Programme[],
  local: Programme[],
): DiffEntry[] {
  const localById = new Map(local.map((p) => [p.id, p]));
  const upstreamById = new Map(upstream.map((p) => [p.id, p]));
  const entries: DiffEntry[] = [];

  for (const u of upstream) {
    const l = localById.get(u.id);
    if (!l) {
      entries.push({ kind: 'new', programmeId: u.id, upstream: undefined, local: undefined });
      continue;
    }
    const changes = whatChanged(l, u);
    entries.push({
      kind: 'matched',
      programmeId: u.id,
      local: l,
      upstream: undefined,
      changes,
    });
  }

  for (const l of local) {
    if (!upstreamById.has(l.id) && isNorwegianRecord(l)) {
      entries.push({ kind: 'missing-upstream', programmeId: l.id, local: l });
    }
  }

  return entries;
}

function isNorwegianRecord(p: Programme): boolean {
  return p.id.startsWith('no-') || p.institutionId.startsWith('no-');
}

function whatChanged(local: Programme, upstreamMapped: Programme): string[] {
  const changes: string[] = [];
  const keys: Array<keyof Programme> = [
    'programme',
    'englishName',
    'url',
    'type',
    'duration',
    'languageOfInstruction',
  ];
  for (const k of keys) {
    if ((local[k] ?? '') !== (upstreamMapped[k] ?? '')) {
      changes.push(`${String(k)}: "${local[k] ?? ''}" → "${upstreamMapped[k] ?? ''}"`);
    }
  }
  return changes;
}

// ── Apply ─────────────────────────────────────────────────────────

function applyChanges(
  programmes: Programme[],
  diff: DiffEntry[],
): Programme[] {
  const byId = new Map(programmes.map((p) => [p.id, p]));

  for (const entry of diff) {
    if (entry.kind === 'matched' && entry.local) {
      // Stamp verification on every matched record, regardless of whether
      // any upstream field changed — this is the whole point of the sync.
      const updated: Programme = {
        ...entry.local,
        lastVerifiedAt: TODAY,
        verificationSource: VERIFICATION_SOURCE,
      };
      // If we collected field changes, apply them too.
      if (entry.changes && entry.changes.length > 0 && entry.upstream) {
        const mapped = mapToProgramme(entry.upstream);
        if (mapped) Object.assign(updated, mapped);
      }
      byId.set(updated.id, updated);
    } else if (entry.kind === 'new' && INCLUDE_NEW && entry.upstream) {
      const mapped = mapToProgramme(entry.upstream);
      if (mapped) byId.set(mapped.id, mapped);
    }
    // 'missing-upstream' is intentionally ignored on apply — we never
    // delete records based on a single upstream sync. Flagged in the
    // dry-run output for human review.
  }

  return Array.from(byId.values());
}

// ── Run ───────────────────────────────────────────────────────────

async function main() {
  if (!existsSync(PROGRAMMES_PATH)) {
    console.error('[sync-norway] programmes.json not found at', PROGRAMMES_PATH);
    process.exit(1);
  }

  const raw = JSON.parse(readFileSync(PROGRAMMES_PATH, 'utf-8'));
  const localProgrammes = (raw.programmes ?? []) as Programme[];

  console.log(`[sync-norway] loaded ${localProgrammes.length} local programme records.`);

  const upstreamRaw = await fetchUtdanningProgrammes();
  const upstreamMapped = upstreamRaw
    .map(mapToProgramme)
    .filter((p): p is Programme => p !== null);

  console.log(`[sync-norway] received ${upstreamRaw.length} upstream records (${upstreamMapped.length} mappable).`);

  const diff = diffSets(upstreamMapped, localProgrammes);

  const matched = diff.filter((d) => d.kind === 'matched');
  const newCount = diff.filter((d) => d.kind === 'new').length;
  const missing = diff.filter((d) => d.kind === 'missing-upstream');

  console.log(`[sync-norway] diff: ${matched.length} matched · ${newCount} new upstream · ${missing.length} not in upstream.`);

  if (VERBOSE) {
    for (const entry of matched) {
      if (entry.changes && entry.changes.length > 0) {
        console.log(`  ~ ${entry.programmeId}`);
        for (const c of entry.changes) console.log(`      ${c}`);
      }
    }
    for (const entry of missing) {
      console.log(`  ? ${entry.programmeId} — no longer at source (preserved, flagged for review)`);
    }
  }

  if (!APPLY) {
    console.log('[sync-norway] dry run — no changes written. Pass --apply to write.');
    return;
  }

  const updatedProgrammes = applyChanges(localProgrammes, diff);
  const out = {
    ...raw,
    programmes: updatedProgrammes,
    meta: {
      ...(raw.meta ?? {}),
      lastUpdated: TODAY,
      lastSyncFromUtdanningAt: TODAY,
    },
  };
  writeFileSync(PROGRAMMES_PATH, JSON.stringify(out, null, 2) + '\n', 'utf-8');
  console.log(`[sync-norway] wrote ${PROGRAMMES_PATH}`);
}

main().catch((err) => {
  console.error('[sync-norway] failed:', err);
  process.exit(1);
});
