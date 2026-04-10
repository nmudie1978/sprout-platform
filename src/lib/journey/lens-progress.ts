/**
 * Lens progress — small client-side calc that maps the *refactored*
 * My Journey UX to Discover / Understand / Grow completion.
 *
 * Background: the original orchestrator (`state-machine.ts`,
 * `orchestrator.ts`, `progress-calculator.ts`) was wired up to a set of
 * journey states (`CREATE_ACTION_PLAN`, `COMPLETE_ALIGNED_ACTION`, …)
 * that the refactored `/my-journey` page no longer drives. As a result
 * the dashboard's 0/3 journey card was permanently stuck at 0/3.
 *
 * Rather than resurrect the dead state machine, we derive the three
 * lens completions directly from the things the new UI actually
 * persists:
 *
 *   • Discover  → user has picked a primary career goal
 *                 ("This looks interesting" — the entire point of
 *                  Discover is making the choice.)
 *
 *   • Understand → user has explicitly confirmed "I understand the
 *                  role in more detail" via the YES/NO prompt at the
 *                  bottom of the Understand tab. The Understand tab is
 *                  read-only deep-dive content, so a deliberate
 *                  self-confirmation is the cleanest signal. Stored
 *                  under `journey-understand-confirmed-{careerTitle}`.
 *
 *   • Grow      → only counts once Understand is confirmed for the
 *                 same career. After that, Grow is "active" the moment
 *                 the user does anything that moves progress for THIS
 *                 career — marking a roadmap step done, or adding a
 *                 momentum action. We track that as a single
 *                 per-career flag (`journey-grow-active-{slug}`) which
 *                 is written at the call sites, instead of trying to
 *                 reverse-engineer it from the legacy global
 *                 `roadmap-card-data` blob (which leaks across goals).
 *
 * Cross-career rule: switching careers must reset the dashboard ring
 * to a clean state for the new career, while preserving the old
 * career's progress for snapshot/revert. We achieve that by keying
 * Understand and Grow flags on the slugified career title — old
 * flags survive in localStorage untouched, but lens-progress only
 * reads the ones for the *current* career.
 */

const DISCOVER_CONFIRMED_PREFIX = 'journey-discover-confirmed-';
const UNDERSTAND_CONFIRMED_PREFIX = 'journey-understand-confirmed-';
const GROW_ACTIVE_PREFIX = 'journey-grow-active-';

/**
 * Slugify a career title into a stable per-career storage key.
 * Mirrors `slugify` in lib/utils so the dashboard, my-journey page,
 * and timeline all derive the same key from the same title.
 */
export function careerKey(careerTitle: string | null | undefined): string | null {
  if (!careerTitle) return null;
  const slug = careerTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return slug || null;
}

function discoverKey(careerTitle: string) {
  return `${DISCOVER_CONFIRMED_PREFIX}${careerKey(careerTitle) ?? careerTitle}`;
}

export function setDiscoverConfirmed(
  careerTitle: string | null | undefined,
  confirmed: boolean,
) {
  if (!careerTitle || typeof window === 'undefined') return;
  try {
    if (confirmed) {
      window.localStorage.setItem(discoverKey(careerTitle), '1');
    } else {
      window.localStorage.removeItem(discoverKey(careerTitle));
    }
  } catch {
    /* ignore */
  }
}

export function isDiscoverConfirmed(
  careerTitle: string | null | undefined,
): boolean {
  if (!careerTitle || typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(discoverKey(careerTitle)) === '1';
  } catch {
    return false;
  }
}

function understandKey(careerTitle: string) {
  return `${UNDERSTAND_CONFIRMED_PREFIX}${careerKey(careerTitle) ?? careerTitle}`;
}

function growActiveKey(careerTitle: string) {
  return `${GROW_ACTIVE_PREFIX}${careerKey(careerTitle) ?? careerTitle}`;
}

/**
 * Mark Grow as "active" for the given career — i.e. the user has
 * actually moved progress on this career (a roadmap step turned done,
 * or they added a momentum action). Called from the call sites that
 * actually mutate progress so we never have to guess from leaky
 * global storage.
 */
export function markGrowActive(careerTitle: string | null | undefined) {
  if (!careerTitle || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(growActiveKey(careerTitle), '1');
  } catch {
    /* ignore */
  }
}

export function isGrowActive(careerTitle: string | null | undefined): boolean {
  if (!careerTitle || typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(growActiveKey(careerTitle)) === '1';
  } catch {
    return false;
  }
}

/** YES on the Understand tab confirmation prompt. */
export function setUnderstandConfirmed(
  careerTitle: string | null | undefined,
  confirmed: boolean,
) {
  if (!careerTitle || typeof window === 'undefined') return;
  try {
    if (confirmed) {
      window.localStorage.setItem(understandKey(careerTitle), '1');
    } else {
      window.localStorage.removeItem(understandKey(careerTitle));
    }
  } catch {
    /* ignore */
  }
}

export function isUnderstandConfirmed(
  careerTitle: string | null | undefined,
): boolean {
  if (!careerTitle || typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(understandKey(careerTitle)) === '1';
  } catch {
    return false;
  }
}

export type LensKey = 'discover' | 'understand' | 'grow';

export interface LensProgressSnapshot {
  discoverDone: boolean;
  understandDone: boolean;
  growDone: boolean;
  /** First not-done lens — used to highlight the active stage. */
  currentLens: LensKey;
  /** 0–3, for the dashboard ring. */
  completedCount: number;
}

export function computeLensProgress(opts: {
  hasPrimaryGoal: boolean;
  careerTitle?: string | null;
}): LensProgressSnapshot {
  // Discover = the user has set a primary career goal. The act of
  // choosing the career IS Discover — that's the whole point of the
  // stage ("This looks interesting"). The dashboard ring should
  // reflect that immediately, no extra confirmation card required.
  const discoverDone = opts.hasPrimaryGoal;

  // Understand = explicit YES on the new career's confirmation card.
  // Per-career via slugified key, so switching careers wipes the
  // signal for the new one without touching the old career's flag.
  const understandDone = discoverDone && isUnderstandConfirmed(opts.careerTitle);

  // Grow = Understand confirmed for THIS career AND the user has done
  // something concrete since (`grow-active` flag). The flag is written
  // at the call sites that actually mutate progress (roadmap step
  // turning done, momentum action added) so we never have to scan
  // legacy global storage that leaks across careers.
  const growDone = understandDone && isGrowActive(opts.careerTitle);

  const currentLens: LensKey = !discoverDone
    ? 'discover'
    : !understandDone
      ? 'understand'
      : 'grow';

  const completedCount =
    (discoverDone ? 1 : 0) + (understandDone ? 1 : 0) + (growDone ? 1 : 0);

  return { discoverDone, understandDone, growDone, currentLens, completedCount };
}
