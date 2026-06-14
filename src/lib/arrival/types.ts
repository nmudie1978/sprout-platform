/**
 * Arrival Check-in — the SENSING half of Endeavrly's emotional-signal loop.
 *
 * A young person often arrives feeling lost, pressured, unsure or motivated
 * (product.md → User States). The check-in lets them tell us, in one calm tap,
 * how they're arriving today so the product can respond in-voice.
 *
 * Pure module (no React / DOM) so it can be unit-tested in isolation and
 * shared by the API route, the client hook and the UI component.
 *
 * PRIVACY: this models a SELF-REPORTED mood only. Nothing here infers a mood
 * from behaviour — that would be profiling, which the platform forbids
 * (CLAUDE.md → "No behavioral profiling"). One mood, one timestamp, kept
 * private to the user.
 */

export type ArrivalMood = "lost" | "curious" | "pressured" | "motivated";

export interface ArrivalMoodMeta {
  key: ArrivalMood;
  /** i18n key (under the `arrival` namespace) for the button label. */
  labelKey: string;
  /** i18n key for the calm acknowledgement shown after the user taps. */
  acknowledgementKey: string;
}

/**
 * The four moods, ordered lowest → highest energy. Deliberately small and calm
 * — see the design spec. Labels and acknowledgements live in i18n so they can
 * be localised and tuned without code changes.
 */
export const ARRIVAL_MOODS: readonly ArrivalMoodMeta[] = [
  { key: "lost", labelKey: "moods.lost", acknowledgementKey: "ack.lost" },
  { key: "curious", labelKey: "moods.curious", acknowledgementKey: "ack.curious" },
  { key: "pressured", labelKey: "moods.pressured", acknowledgementKey: "ack.pressured" },
  { key: "motivated", labelKey: "moods.motivated", acknowledgementKey: "ack.motivated" },
] as const;

const META_BY_KEY = new Map<ArrivalMood, ArrivalMoodMeta>(
  ARRIVAL_MOODS.map((m) => [m.key, m]),
);

export function isArrivalMood(x: unknown): x is ArrivalMood {
  return typeof x === "string" && META_BY_KEY.has(x as ArrivalMood);
}

export function arrivalMoodMeta(mood: ArrivalMood): ArrivalMoodMeta {
  return META_BY_KEY.get(mood)!;
}

/** i18n key for the acknowledgement copy that responds to a given mood. */
export function moodAcknowledgementKey(mood: ArrivalMood): string {
  return META_BY_KEY.get(mood)!.acknowledgementKey;
}

/** True iff two dates fall on the same calendar day (local time). Underpins
 *  the once-per-day rule — we never re-prompt a user who already checked in. */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
