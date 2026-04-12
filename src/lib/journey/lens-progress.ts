/**
 * Lens progress + snapshot predicate — single source of truth for
 * "has this career been meaningfully explored?" across the whole app.
 *
 * Three checkpoints define a "snapshot-worthy" career, in this order
 * from lightest to heaviest:
 *
 *   1. DISCOVER   — user clicked YES on "Have you explored what this
 *                   role is about?" at the bottom of the Discover tab.
 *                   Stored as `journey-discover-confirmed-{slug}`.
 *
 *   2. UNDERSTAND — user clicked YES on "Did you understand the role
 *                   in more detail?" at the bottom of the Understand
 *                   tab. Stored as `journey-understand-confirmed-{slug}`.
 *
 *   3. CLARITY    — user has completed both required Clarity tasks: filled
 *                   in the Foundation card AND added at least one
 *                   Momentum action. The Clarity tab marks this via
 *                   `markClarityActive()` once both conditions are met.
 *                   Stored as `journey-grow-active-{slug}` (legacy key preserved).
 *
 * A career becomes a snapshot the moment ANY ONE of these is true
 * (it's an OR, not a ladder). The highest reached checkpoint becomes
 * the stage label shown on the Dashboard's "Previously Explored
 * Journey snapshots" list.
 *
 * Passive page visits, setting a primary goal, or browsing Explore
 * Careers must never create a snapshot on their own — those are not
 * one of the three approved checkpoints.
 *
 * Cross-career rule: every flag is keyed on the slugified career
 * title, so switching careers resets the dashboard ring to a clean
 * state for the new career while preserving the old career's flags
 * for revisit.
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

function clarityActiveKey(careerTitle: string) {
  // Storage key kept as legacy 'journey-grow-active-' for backward compatibility
  return `${GROW_ACTIVE_PREFIX}${careerKey(careerTitle) ?? careerTitle}`;
}

/**
 * Mark Clarity as "active" for the given career — i.e. the user has
 * actually moved progress on this career (a roadmap step turned done,
 * or they added a momentum action). Called from the call sites that
 * actually mutate progress so we never have to guess from leaky
 * global storage.
 */
export function markClarityActive(careerTitle: string | null | undefined) {
  if (!careerTitle || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(clarityActiveKey(careerTitle), '1');
  } catch {
    /* ignore */
  }
}

/** @deprecated Use `markClarityActive` instead. Kept for backward compatibility. */
export const markGrowActive = markClarityActive;

export function isClarityActive(careerTitle: string | null | undefined): boolean {
  if (!careerTitle || typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(clarityActiveKey(careerTitle)) === '1';
  } catch {
    return false;
  }
}

/** @deprecated Use `isClarityActive` instead. Kept for backward compatibility. */
export const isGrowActive = isClarityActive;

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

export type LensKey = 'discover' | 'understand' | 'clarity';
/** @deprecated Use 'clarity' instead. Maps legacy 'grow' values at display layer. */
export type LegacyLensKey = 'discover' | 'understand' | 'grow';

export interface LensProgressSnapshot {
  /**
   * True when Discover is considered done. Uses an implicit cascade:
   * confirming Understand OR completing Clarity also marks Discover done,
   * because you can't understand a role without having explored it
   * and you can't build a roadmap without having understood it.
   * The cascade applies to display state (dashboard ring, stage label)
   * but NOT to `isJourneySnapshotWorthy`, which uses the raw flags so
   * each checkpoint remains a sufficient condition for snapshot
   * creation.
   */
  discoverDone: boolean;
  /**
   * True when Understand is considered done. Cascades from Clarity:
   * completing Clarity also marks Understand done.
   */
  understandDone: boolean;
  /** True iff the user has completed both required Clarity tasks. */
  clarityDone: boolean;
  /** @deprecated Alias for `clarityDone`. */
  growDone: boolean;
  /**
   * The first not-done lens in Discover → Understand → Clarity order.
   * After the cascade is applied this naturally points at the next
   * real gap (e.g. if Understand is confirmed, `currentLens === 'clarity'`
   * because Discover is derived as done too).
   */
  currentLens: LensKey;
  /** 0–3, for the dashboard ring. Uses cascaded values. */
  completedCount: number;
  /**
   * The highest checkpoint reached — used for the Dashboard
   * "Previously Explored Journey snapshots" stage label. `null` when
   * no checkpoint has been reached.
   */
  highestStage: LensKey | null;
}

export function computeLensProgress(opts: {
  /**
   * Kept for backwards compatibility with callers that still pass it;
   * no longer used to derive `discoverDone`. The old logic treated
   * "has primary goal" as Discover complete, which meant setting a
   * goal auto-registered the Discover lens. Per product spec, the
   * three checkpoints are now driven by explicit YES/NO answers
   * (Discover + Understand) and the Clarity two-task completion signal.
   */
  hasPrimaryGoal?: boolean;
  careerTitle?: string | null;
}): LensProgressSnapshot {
  // Raw per-checkpoint state from localStorage. These are the
  // authoritative YES/NO signals — each one is set by its own
  // confirmation card in the Discover, Understand and Clarity tabs of
  // /my-journey. `isJourneySnapshotWorthy` below uses these raw
  // values as an OR, so any single checkpoint is sufficient to
  // create a snapshot.
  const rawDiscover = isDiscoverConfirmed(opts.careerTitle);
  const rawUnderstand = isUnderstandConfirmed(opts.careerTitle);
  const rawClarity = isClarityActive(opts.careerTitle);

  // Implicit cascade for the *display* layer: a higher checkpoint
  // implies lower ones. This matches user intuition — if you've
  // confirmed Understand, you've by definition already explored the
  // role (Discover), and if you've completed the Clarity tasks you've
  // also been through the earlier stages. Without this cascade, a
  // user who clicks Understand YES sees the ring at 1/3 with
  // Discover stuck as the "current" lens, which is confusing.
  //
  // The cascade is applied to `discoverDone` / `understandDone` /
  // `clarityDone` on the snapshot object. `isJourneySnapshotWorthy`
  // intentionally reads the *raw* flags, not the cascaded ones, so
  // the spec's OR-of-three remains the snapshot predicate.
  const clarityDone = rawClarity;
  const growDone = clarityDone; // backward compat alias
  const understandDone = rawUnderstand || rawClarity;
  const discoverDone = rawDiscover || rawUnderstand || rawClarity;

  const currentLens: LensKey = !discoverDone
    ? 'discover'
    : !understandDone
      ? 'understand'
      : 'clarity';

  const completedCount =
    (discoverDone ? 1 : 0) + (understandDone ? 1 : 0) + (clarityDone ? 1 : 0);

  // Highest reached, in ladder order. `null` when none reached.
  const highestStage: LensKey | null = clarityDone
    ? 'clarity'
    : understandDone
      ? 'understand'
      : discoverDone
        ? 'discover'
        : null;

  return { discoverDone, understandDone, clarityDone, growDone, currentLens, completedCount, highestStage };
}

/**
 * The single source of truth for "is this career snapshot-worthy?".
 *
 * A career becomes a snapshot (appears in the Dashboard's "Previously
 * Explored Journey snapshots" list) when ANY of the three checkpoints
 * are reached:
 *
 *   - Discover YES
 *   - Understand YES
 *   - Clarity 2/2 tasks complete
 *
 * Passive page visits, setting a goal, or browsing Explore Careers
 * do NOT create a snapshot. The underlying DB row for per-goal data
 * (JourneyGoalData) may still exist for persistence of roadmap cards
 * and foundation mirrors, but it is invisible to the snapshot list
 * until one of the three checkpoints fires.
 */
export function isJourneySnapshotWorthy(
  careerTitle: string | null | undefined,
): boolean {
  if (!careerTitle) return false;
  return (
    isDiscoverConfirmed(careerTitle) ||
    isUnderstandConfirmed(careerTitle) ||
    isGrowActive(careerTitle)
  );
}

/**
 * The human-readable label for the "Stage" column in the Dashboard's
 * snapshots table. Uses the same implicit cascade as
 * `computeLensProgress` — Clarity implies Understand and Discover, so a
 * Clarity-complete journey shows "Complete" even if the user never
 * explicitly clicked Discover/Understand YES. This matches user
 * intuition: reaching Clarity means the whole journey is done.
 *
 * Returns null when the career has not reached any checkpoint yet —
 * callers should filter those rows out before passing them to this
 * helper.
 */
export function journeyStageLabel(
  careerTitle: string | null | undefined,
): { label: 'Discover' | 'Understand' | 'Clarity' | 'Complete'; highest: LensKey } | null {
  if (!careerTitle) return null;
  const clarity = isClarityActive(careerTitle);
  const understand = isUnderstandConfirmed(careerTitle);
  const discover = isDiscoverConfirmed(careerTitle);
  // "Complete" — Clarity reached (which cascades to understand +
  // discover as done, so all three display as complete). Shown as a
  // subtle flag on the Dashboard; the full celebration stays in Clarity.
  if (clarity) return { label: 'Complete', highest: 'clarity' };
  if (understand) return { label: 'Understand', highest: 'understand' };
  if (discover) return { label: 'Discover', highest: 'discover' };
  return null;
}
