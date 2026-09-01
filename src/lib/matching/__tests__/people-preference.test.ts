import { describe, it, expect } from "vitest";
import { buildUserProfile, rankCareers, buildCareerProfile } from "../engine";
import { PEOPLE_PREF_TO_SCORE, isKnownPeoplePref } from "../config";
import { getAllCareers, findCareerCategory } from "@/lib/career-pathways";
import type { DiscoveryPreferences } from "@/lib/career-pathways";

/**
 * How the engine reads `peoplePref`.
 *
 * This pins the fix for a defect that made a stated preference actively
 * harmful: an unrecognised value scored 0.5 while still counting as a stated
 * preference. 0.5 is not "no opinion" to the scorer — it is "prefers
 * medium-people work" — so a young person asking for people-facing careers was
 * ranked towards desk roles and away from the ones they asked for.
 *
 * The live surfaces (the discovery quiz and the radar onboarding wizard) both
 * emit the canonical three values, so users were not affected in practice. The
 * trap was waiting for the first vocabulary drift or typo.
 */

const CTX = { careers: getAllCareers(), findCategory: findCareerCategory };

const BASE: DiscoveryPreferences = {
  subjects: ["psychology", "english", "biology"],
  workStyles: ["desk"],
  interests: ["helping people", "talking"],
};

const withPref = (peoplePref?: string): DiscoveryPreferences =>
  ({ ...BASE, peoplePref } as DiscoveryPreferences);

/** Highest people-orientation among the top N results. */
function topPeopleOrientation(prefs: DiscoveryPreferences, n = 5): number {
  return Math.max(
    ...rankCareers(prefs, CTX, n).map(
      (c) => buildCareerProfile(c, findCareerCategory).peopleOrientation,
    ),
  );
}

describe("canonical values", () => {
  it("covers every value the live surfaces can emit", () => {
    // PEOPLE_PREFS in discovery-quiz-dialog.tsx and radar-onboarding-wizard.tsx.
    for (const id of ["with-people", "mixed", "mostly-alone"]) {
      expect(isKnownPeoplePref(id)).toBe(true);
      expect(typeof PEOPLE_PREF_TO_SCORE[id]).toBe("number");
    }
  });

  it("maps people-facing high and solo low", () => {
    expect(PEOPLE_PREF_TO_SCORE["with-people"]).toBeGreaterThan(0.7);
    expect(PEOPLE_PREF_TO_SCORE["mostly-alone"]).toBeLessThan(0.3);
    expect(PEOPLE_PREF_TO_SCORE.mixed).toBe(0.5);
  });

  it("treats 'mixed' as no active preference", () => {
    // "A bit of both" is a real answer, but it should not pull the ranking
    // toward mid-range careers — it should simply not discriminate.
    expect(buildUserProfile(withPref("mixed")).hasPeoplePreference).toBe(false);
  });
});

describe("synonyms", () => {
  it("scores the 'how many people' phrasing identically to the canonical one", () => {
    expect(PEOPLE_PREF_TO_SCORE["many-people"]).toBe(PEOPLE_PREF_TO_SCORE["with-people"]);
    expect(PEOPLE_PREF_TO_SCORE.solo).toBe(PEOPLE_PREF_TO_SCORE["mostly-alone"]);
  });

  it("produces the same ranking as the canonical value", () => {
    const a = rankCareers(withPref("with-people"), CTX, 5).map((c) => c.id);
    const b = rankCareers(withPref("many-people"), CTX, 5).map((c) => c.id);
    expect(b).toEqual(a);
  });
});

describe("an unknown value fails safe", () => {
  it("is not treated as a stated preference", () => {
    const u = buildUserProfile(withPref("TYPO-VALUE"));
    expect(isKnownPeoplePref("TYPO-VALUE")).toBe(false);
    // The critical assertion: unknown must mean "no preference", NOT a
    // neutral-but-active one that quietly steers toward medium-people careers.
    expect(u.hasPeoplePreference).toBe(false);
  });

  it("ranks identically to supplying no preference at all", () => {
    const none = rankCareers(withPref(undefined), CTX, 5).map((c) => c.id);
    const junk = rankCareers(withPref("TYPO-VALUE"), CTX, 5).map((c) => c.id);
    expect(junk).toEqual(none);
  });

  it("does not bias an unknown value toward medium-people careers", () => {
    // The old behaviour put six 0.50 careers at the top for this persona.
    const ranked = rankCareers(withPref("TYPO-VALUE"), CTX, 5);
    const orientations = ranked.map(
      (c) => buildCareerProfile(c, findCareerCategory).peopleOrientation,
    );
    expect(orientations.every((o) => o === 0.5)).toBe(false);
  });
});

describe("a stated preference actually steers the ranking", () => {
  it("surfaces high-people careers for someone who asked for people work", () => {
    expect(topPeopleOrientation(withPref("with-people"))).toBeGreaterThan(0.5);
  });

  it("does not surface high-people careers for someone who asked to work alone", () => {
    const ranked = rankCareers(withPref("mostly-alone"), CTX, 5);
    const avg =
      ranked.reduce(
        (sum, c) => sum + buildCareerProfile(c, findCareerCategory).peopleOrientation,
        0,
      ) / ranked.length;
    // Same subjects and interests as the people-facing persona; only the
    // preference differs, so the two must not produce the same shape of list.
    expect(avg).toBeLessThan(topPeopleOrientation(withPref("with-people")));
  });

  it("the preference changes the result — the engine is not ignoring it", () => {
    const people = rankCareers(withPref("with-people"), CTX, 5).map((c) => c.id);
    const alone = rankCareers(withPref("mostly-alone"), CTX, 5).map((c) => c.id);
    expect(people).not.toEqual(alone);
  });
});
