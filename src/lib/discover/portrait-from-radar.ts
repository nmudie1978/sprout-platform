/**
 * Generate a friendly "Who Am I" self-portrait from the Career Radar
 * preferences (the "What I Like" panel) — subjects, work style, and
 * people preference.
 *
 * Per product decision: we deliberately don't ask 15–18 year olds to
 * self-rate strengths / motivations / clarity level — most haven't
 * done enough to know yet. The radar's lighter-touch prefs are the
 * single source of truth for both matching and the dashboard portrait.
 */

import type { DiscoveryPreferences } from "@/lib/career-pathways";

export interface RadarPortrait {
  /** A short, plain-language sentence about the user. */
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
  pe: "Sport / PE",
  computing: "Computing",
  technology: "Technology",
  business: "Business",
  economics: "Economics",
  psychology: "Psychology",
  philosophy: "Philosophy",
  drama: "Drama",
  design: "Design",
};

const WORK_STYLE_TAG: Record<string, string> = {
  "hands-on": "Hands-on",
  desk: "Desk-based",
  outdoors: "Outdoors",
  creative: "Creative",
  mixed: "Mixed",
};

const WORK_STYLE_PHRASE: Record<string, string> = {
  "hands-on": "hands-on work",
  desk: "deep desk-based work",
  outdoors: "being outdoors",
  creative: "creative projects",
  mixed: "a mix of settings",
};

const PEOPLE_PHRASE: Record<string, string> = {
  "with-people": "spending most of your time with other people",
  mixed: "a balance of people time and quiet focus",
  "mostly-alone": "deep, quiet focus on your own work",
};

const PEOPLE_TAG: Record<string, string> = {
  "with-people": "People person",
  mixed: "Balanced",
  "mostly-alone": "Independent worker",
};

function pretty(s: string): string {
  return SUBJECT_LABEL[s] ?? s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
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

  // Build the prose summary from whichever signals are present.
  const parts: string[] = [];
  if (subjects.length > 0) {
    if (subjects.length === 1) {
      parts.push(`You're drawn to ${subjects[0]}.`);
    } else if (subjects.length === 2) {
      parts.push(`You're drawn to ${subjects[0]} and ${subjects[1]}.`);
    } else {
      parts.push(`You're drawn to ${subjects[0]}, ${subjects[1]}, and ${subjects[2]}.`);
    }
  }
  if (styles.length > 0) {
    const phrases = styles.map((s) => WORK_STYLE_PHRASE[s] ?? s).filter(Boolean);
    if (phrases.length === 1) {
      parts.push(`You're at your best with ${phrases[0]}.`);
    } else {
      parts.push(`You enjoy ${phrases.join(" and ")}.`);
    }
  }
  if (peoplePref && PEOPLE_PHRASE[peoplePref]) {
    parts.push(`You lean towards ${PEOPLE_PHRASE[peoplePref]}.`);
  }
  if (parts.length === 0) {
    parts.push("Your preferences are still taking shape — keep exploring on Career Radar.");
  }

  // Tags — subjects first, then work styles, then people pref.
  const tags: string[] = [];
  for (const s of subjects) tags.push(s);
  for (const st of styles) {
    const tag = WORK_STYLE_TAG[st];
    if (tag) tags.push(tag);
  }
  if (peoplePref && PEOPLE_TAG[peoplePref]) tags.push(PEOPLE_TAG[peoplePref]);

  return {
    summary: parts.join(" "),
    topTags: tags.slice(0, 6),
  };
}
