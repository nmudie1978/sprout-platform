/**
 * Welcome-back card logic — picks the single most meaningful thing to say
 * to a returning user, drawn from their real recent activity.
 *
 * Pure + UI-free so it can be unit-tested directly. The dashboard resolves
 * its raw hooks (explored journeys, interest ratings, saved careers) into
 * {@link WelcomeBackSignals}; the component maps the returned descriptor to
 * localized copy via next-intl. No business logic lives in the component.
 */

/** A named career the user touched, e.g. an explored journey or a save. */
export interface CareerRef {
  title: string;
}

/** Resolved, ranked inputs for one returning user. */
export interface WelcomeBackSignals {
  /** First name (already display-cased by the caller). */
  name: string;
  /** Most-recently explored journey, if any. */
  lastExplored?: CareerRef | null;
  /** Highest-rated career and its 1–5 star rating, if any. */
  topInterest?: { title: string; rating: number } | null;
  /** Most-recently saved career, if any. */
  lastSaved?: CareerRef | null;
}

/** Which "we remember you" line to show. */
export type WelcomeBackMemoryKind = "explored" | "interest" | "saved" | "none";

export interface WelcomeBackDescriptor {
  name: string;
  /** The chosen memory line + the career it names (absent for "none"). */
  memory: { kind: WelcomeBackMemoryKind; career?: string };
  /** Where the forward prompt should take them. */
  cta: { kind: "resume" | "explore" };
}

/** Stars at or above this count count as a "strong" interest worth naming. */
const STRONG_INTEREST = 4;

const clean = (s: string | undefined | null): string => (s ?? "").trim();

/**
 * Choose the warmest accurate thing to say. Priority order:
 *   1. the journey they were last exploring  → offer to resume it
 *   2. a career they rated 4–5 stars         → invite them to explore
 *   3. a career they saved for later         → invite them to explore
 *   4. nothing yet                           → a gentle generic welcome
 */
export function selectWelcomeBack(
  signals: WelcomeBackSignals,
): WelcomeBackDescriptor {
  const name = clean(signals.name);

  const explored = clean(signals.lastExplored?.title);
  if (explored) {
    return { name, memory: { kind: "explored", career: explored }, cta: { kind: "resume" } };
  }

  const interest = signals.topInterest;
  const interestTitle = clean(interest?.title);
  if (interest && interestTitle && interest.rating >= STRONG_INTEREST) {
    return { name, memory: { kind: "interest", career: interestTitle }, cta: { kind: "explore" } };
  }

  const saved = clean(signals.lastSaved?.title);
  if (saved) {
    return { name, memory: { kind: "saved", career: saved }, cta: { kind: "explore" } };
  }

  return { name, memory: { kind: "none" }, cta: { kind: "explore" } };
}
