/**
 * Generate a warm "Who Am I" self-portrait from the Career Radar
 * preferences (the "What I Like" panel) — subjects, work style, and
 * people preference.
 *
 * Per product decision: we deliberately don't ask 15–18 year olds to
 * self-rate strengths / motivations / clarity level — most haven't
 * done enough to know yet. The radar's lighter-touch prefs are the
 * single source of truth for both matching and the dashboard portrait.
 *
 * Tone rules: positive, uplifting, occasionally a little witty, no
 * use of the word "career" (we're talking about the human, not the
 * job), no filler, 2–3 sentences max.
 */

import type { DiscoveryPreferences } from "@/lib/career-pathways";

export interface RadarPortrait {
  /** A short, plain-language summary about the user. */
  summary: string;
  /** Up to 6 short tag labels surfaced as pills on the dashboard. */
  topTags: string[];
}

const SUBJECT_LABEL: Record<string, string> = {
  math: "Maths",
  science: "Science",
  biology: "Biology",
  chemistry: "Chemistry",
  physics: "Physics",
  english: "English",
  languages: "Languages",
  history: "History",
  geography: "Geography",
  art: "Art",
  music: "Music",
  pe: "Sport & PE",
  computing: "Computing",
  technology: "Technology",
  business: "Business",
  economics: "Economics",
  psychology: "Psychology",
  philosophy: "Philosophy",
  drama: "Drama",
  design: "Design",
  "media-studies": "Media Studies",
  "workshop-making": "Workshop & Making",
};

const WORK_STYLE_TAG: Record<string, string> = {
  "hands-on": "Hands-on",
  desk: "Head-down focus",
  outdoors: "Outdoors",
  creative: "Creative",
  mixed: "Flexible",
};

const PEOPLE_TAG: Record<string, string> = {
  "with-people": "People person",
  mixed: "Balanced",
  "mostly-alone": "Independent",
};

function pretty(s: string): string {
  return (
    SUBJECT_LABEL[s] ??
    s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

/**
 * Deterministic small-int hash of a string. Used to pick a phrase
 * variant that's stable per-user but changes the moment their prefs
 * change — so returning users don't see the same opener twice, but
 * the prose doesn't randomly re-roll on every refresh.
 */
function pick<T>(items: T[], seed: string): T {
  if (items.length === 0) throw new Error("pick() needs a non-empty array");
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return items[Math.abs(h) % items.length];
}

/** Natural comma + "and" join of a short list. */
function humanList(xs: string[]): string {
  if (xs.length === 0) return "";
  if (xs.length === 1) return xs[0];
  if (xs.length === 2) return `${xs[0]} and ${xs[1]}`;
  return `${xs.slice(0, -1).join(", ")}, and ${xs[xs.length - 1]}`;
}

/**
 * Truthy only when the radar prefs are rich enough to draw any
 * meaningful portrait — at least one subject OR one work style OR
 * a people preference.
 */
export function hasEnoughForPortrait(
  prefs: DiscoveryPreferences | null | undefined,
): boolean {
  if (!prefs) return false;
  const subjects = (prefs.subjects ?? []).length;
  const styles = (prefs.workStyles ?? []).length;
  const people = !!prefs.peoplePref;
  return subjects > 0 || styles > 0 || people;
}

export function buildRadarPortrait(
  prefs: DiscoveryPreferences | null | undefined,
): RadarPortrait | null {
  if (!hasEnoughForPortrait(prefs)) return null;
  const subjects = (prefs!.subjects ?? []).slice(0, 3).map(pretty);
  const styles = (prefs!.workStyles ?? []).slice(0, 2);
  const peoplePref = prefs!.peoplePref;

  // Stable seed per unique pref set so phrasing is consistent across
  // reloads, but shifts the moment prefs change.
  const seed = JSON.stringify({ subjects, styles, peoplePref });

  // ── Opening line — what the user is drawn to ───────────────────
  let opener: string;
  if (subjects.length === 0) {
    opener = pick(
      [
        "You already have a sense of how you like to work.",
        "You know the shape of your own day — that's a head start most people don't give themselves.",
      ],
      seed + ":opener-none",
    );
  } else if (subjects.length === 1) {
    const s = subjects[0];
    opener = pick(
      [
        `You light up around ${s} — and that's a real thing, not every mind does.`,
        `${s} pulls at your attention in a way most subjects don't.`,
        `There's a clear pattern here: ${s} keeps winning your curiosity.`,
      ],
      seed + ":opener-1",
    );
  } else if (subjects.length === 2) {
    const [a, b] = subjects;
    opener = pick(
      [
        `${a} and ${b} — two sides of the same curious brain.`,
        `You're drawn to ${a} and ${b}. Different lenses, same restless mind.`,
        `${a} plus ${b} is a combination worth paying attention to.`,
      ],
      seed + ":opener-2",
    );
  } else {
    const list = humanList(subjects);
    opener = pick(
      [
        `${list} — a spread most 16-year-olds would envy.`,
        `You're alive to ${list}. Range like that doesn't arrive by accident.`,
        `${list}: you're clearly not interested in picking just one corner of the world.`,
      ],
      seed + ":opener-3",
    );
  }

  // ── Work-style + people line ───────────────────────────────────
  let styleLine = "";
  const primaryStyle = styles[0];
  const stylePhrase: Record<string, string[]> = {
    "hands-on": [
      "You'd rather build something than talk about building it",
      "You think with your hands as much as with your head",
    ],
    desk: [
      "You do your best thinking with a quiet desk and a closed door",
      "A clear table and an uninterrupted hour is where you do your best work",
    ],
    outdoors: [
      "Any excuse to be outside, and you'll take it",
      "You feel most like yourself when the roof is the sky",
    ],
    creative: [
      "You think sideways — which is a strength, not a bug",
      "You see the angle other people miss",
    ],
    mixed: [
      "You don't sit still in one mode for long",
      "You move between making, thinking, and doing without losing the thread",
    ],
  };

  const peoplePhrase: Record<string, string[]> = {
    "with-people": [
      "and you come alive around other people",
      "and your energy comes from the room around you",
    ],
    mixed: [
      "and you can switch between team energy and solo focus without losing yourself",
      "and you hold your own in a crowd or a quiet corner",
    ],
    "mostly-alone": [
      "and you need your own headspace to do your best work — which is a feature, not a flaw",
      "and you do your best work when the world turns its volume down",
    ],
  };

  const stylePart =
    primaryStyle && stylePhrase[primaryStyle]
      ? pick(stylePhrase[primaryStyle], seed + ":style")
      : "";
  const peoplePart =
    peoplePref && peoplePhrase[peoplePref]
      ? pick(peoplePhrase[peoplePref], seed + ":people")
      : "";

  if (stylePart && peoplePart) {
    styleLine = `${stylePart}, ${peoplePart}.`;
  } else if (stylePart) {
    styleLine = `${stylePart}.`;
  } else if (peoplePart) {
    // Capitalise the "and" into "And" when standing alone.
    styleLine = `${peoplePart.replace(/^and /, "And ").replace(/^a/, "A")}.`;
  }

  // ── Closing nudge ──────────────────────────────────────────────
  const closers = [
    "Keep following the threads that actually interest you.",
    "That's a pretty good starting point, honestly.",
    "It adds up to someone the working world would be lucky to have.",
    "That's a real profile — worth listening to.",
  ];
  const closer = pick(closers, seed + ":closer");

  const summary = [opener, styleLine, closer].filter(Boolean).join(" ");

  // ── Tags — subjects first, then work style, then people pref ──
  const tags: string[] = [];
  for (const s of subjects) tags.push(s);
  for (const st of styles) {
    const tag = WORK_STYLE_TAG[st];
    if (tag && !tags.includes(tag)) tags.push(tag);
  }
  if (peoplePref && PEOPLE_TAG[peoplePref]) {
    const tag = PEOPLE_TAG[peoplePref];
    if (!tags.includes(tag)) tags.push(tag);
  }

  return {
    summary,
    topTags: tags.slice(0, 6),
  };
}
