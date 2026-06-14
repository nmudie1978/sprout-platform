/**
 * Career Twin — CONTEXT-AWARE starter chips.
 *
 * Turns the generic per-mode starter questions into a few prompts that react to
 * the user's REAL context — the career this Twin is grounded in, the other
 * careers they've recently explored/saved, and where they are in their journey.
 * This makes the very first turn feel personal ("How do I get from school to
 * {career}?", "Compare {career} with {otherExplored}?") instead of generic.
 *
 * It is DETERMINISTIC and template-based — built purely from already-loaded
 * context (the same `TwinRecentActivity` the proactive opener uses). So:
 *   - zero extra OpenAI cost (no AI call),
 *   - it can never reference a career the user hasn't actually touched, and
 *   - brand-new users gracefully fall back to the mode's generic chips.
 *
 * Localised (English / Norwegian / Spanish) so a NO/ES user sees the chips in
 * their own language — the caller passes the lang from the NEXT_LOCALE cookie.
 *
 * Kept free of Prisma/React so it stays pure and unit-testable.
 */
import type { TwinRecentActivity } from "./types";
import type { TwinLang } from "./opener";

interface StarterStrings {
  compare: (title: string, other: string) => string;
  clarity: (title: string) => string;
  understand: (title: string) => string;
  discover: (title: string) => string;
  waysIn: (title: string) => string;
}

const STRINGS: Record<TwinLang, StarterStrings> = {
  en: {
    compare: (t, o) => `How does ${t} compare with ${o}?`,
    clarity: (t) => `What's one small step toward ${t} I could take this week?`,
    understand: (t) => `What's the hardest part of actually being a ${t}?`,
    discover: (t) => `How do I get from school to ${t}?`,
    waysIn: (t) => `What's the most realistic way into ${t} from where I am?`,
  },
  no: {
    compare: (t, o) => `Hvordan står ${t} seg mot ${o}?`,
    clarity: (t) => `Hva er ett lite steg mot ${t} jeg kan ta denne uka?`,
    understand: (t) => `Hva er det vanskeligste med å faktisk være ${t}?`,
    discover: (t) => `Hvordan kommer jeg fra skolen til ${t}?`,
    waysIn: (t) => `Hva er den mest realistiske veien inn i ${t} fra der jeg er nå?`,
  },
  es: {
    compare: (t, o) => `¿Cómo se compara ${t} con ${o}?`,
    clarity: (t) => `¿Qué pequeño paso hacia ${t} podría dar esta semana?`,
    understand: (t) => `¿Qué es lo más difícil de ser ${t} en realidad?`,
    discover: (t) => `¿Cómo paso de la escuela a ${t}?`,
    waysIn: (t) => `¿Cuál es la forma más realista de llegar a ${t} desde donde estoy?`,
  },
};

/**
 * Build up to `max` context-aware starter chips for the chat's opening state.
 *
 * Returns an empty array when there's nothing real to personalise from (a
 * brand-new user with no activity) — the caller then shows the generic
 * mode starters as before.
 */
export function buildContextStarters(
  careerTitle: string,
  activity: TwinRecentActivity | null,
  max = 3,
  lang: TwinLang = "en",
): string[] {
  const s = STRINGS[lang] ?? STRINGS.en;
  const title = (careerTitle || "this career").trim();

  // Real, personal context to react to: a named OTHER career they've explored,
  // or a known journey stage. With neither, there's nothing to personalise from
  // (a brand-new user) → return empty so the caller shows generic mode chips.
  const other = activity?.recentCareers?.find(
    (c) => c.title && c.title.trim() && c.title.trim() !== title,
  );
  const stage = (activity?.journeyStage ?? "").toLowerCase();
  const hasStage = stage.includes("clarity") || stage.includes("understand") || stage.includes("discover");
  if (!other && !hasStage) return [];

  const chips: string[] = [];
  const seen = new Set<string>();
  const add = (q: string) => {
    const v = q.trim();
    if (v && !seen.has(v)) {
      seen.add(v);
      chips.push(v);
    }
  };

  // 1) Compare with the most-recent OTHER career they explored — only when we
  //    have a real, named alternative (never invents one).
  if (other) {
    add(s.compare(title, other.title));
  }

  // 2) A journey-stage-aware route question — calm, forward-looking.
  if (stage.includes("clarity")) {
    add(s.clarity(title));
  } else if (stage.includes("understand")) {
    add(s.understand(title));
  } else if (stage.includes("discover")) {
    add(s.discover(title));
  }

  // 3) A grounded "ways in" prompt — only added to round out a list that's
  //    already personally anchored (never the sole chip for a new user).
  add(s.waysIn(title));

  return chips.slice(0, Math.max(0, max));
}
