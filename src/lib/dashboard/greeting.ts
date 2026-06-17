/**
 * Smart dashboard greeting.
 *
 * Instead of always showing a flat time-of-day greeting ("Good evening"), we
 * rotate among the time greeting and a few warmer, relational ones ("Welcome
 * back", "Nice to see you again", "Good to see you").
 *
 * The choice is DETERMINISTIC for a given moment — seeded by the day + hour — so
 * it:
 *   - varies across visits (a different hour or day yields a different
 *     greeting), yet
 *   - stays stable within a render (no flicker on re-render, and no SSR/CSR
 *     hydration mismatch beyond the hour the dashboard already reads).
 *
 * Time-of-day greetings fill half the rotation, so the heading keeps its time
 * context while still feeling personal.
 */
export type GreetingKind =
  | "morning"
  | "afternoon"
  | "evening"
  | "welcomeBack"
  | "niceToSeeYou"
  | "goodToSeeYou";

export function timeOfDayGreeting(hour: number): "morning" | "afternoon" | "evening" {
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

export function selectGreetingKind(date: Date): GreetingKind {
  const tod = timeOfDayGreeting(date.getHours());
  // Three of the six slots are the time-of-day greeting, so it shows ~half the
  // time; the rest are warmer relational greetings.
  const pool: GreetingKind[] = [tod, "welcomeBack", tod, "niceToSeeYou", tod, "goodToSeeYou"];
  const startOfYear = Date.UTC(date.getFullYear(), 0, 0);
  const startOfDay = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const dayOfYear = Math.floor((startOfDay - startOfYear) / 86_400_000);
  const seed = dayOfYear * 24 + date.getHours();
  return pool[seed % pool.length];
}
