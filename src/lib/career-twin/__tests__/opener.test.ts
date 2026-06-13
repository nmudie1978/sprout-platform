import { describe, it, expect } from "vitest";
import { buildProactiveOpener } from "@/lib/career-twin/opener";
import type { CareerTwinCareerContext, TwinRecentActivity } from "@/lib/career-twin/types";

const CAREER: CareerTwinCareerContext = { id: "radiologist", title: "Radiologist" };

function activity(over: Partial<TwinRecentActivity> = {}): TwinRecentActivity {
  return {
    activeCareerId: "radiologist",
    activeGoalTitle: null,
    recentCareers: [],
    journeyStage: null,
    daysSinceLastVisit: null,
    ...over,
  };
}

describe("buildProactiveOpener", () => {
  it("returns null for a brand-new user with no activity", () => {
    expect(buildProactiveOpener(CAREER, activity())).toBeNull();
  });

  it("returns null when activity is null", () => {
    expect(buildProactiveOpener(CAREER, null)).toBeNull();
  });

  it("leads with a warm re-entry for a returning user (gap >= threshold)", () => {
    const out = buildProactiveOpener(CAREER, activity({ daysSinceLastVisit: 30 }));
    expect(out).not.toBeNull();
    expect(out!.text).toMatch(/been a little while/i);
    expect(out!.text).toContain("Radiologist");
    expect(out!.question).toBeTruthy();
  });

  it("references TWO recently explored careers by name and offers a compare", () => {
    const out = buildProactiveOpener(
      CAREER,
      activity({
        recentCareers: [
          { careerId: "game-developer", title: "Game Developer" },
          { careerId: "data-scientist", title: "Data Scientist" },
        ],
      }),
    );
    expect(out).not.toBeNull();
    expect(out!.text).toContain("Game Developer");
    expect(out!.text).toContain("Data Scientist");
    expect(out!.text).toContain("Radiologist");
    expect(out!.question).toContain("Game Developer");
  });

  it("references ONE recently explored career", () => {
    const out = buildProactiveOpener(
      CAREER,
      activity({ recentCareers: [{ careerId: "game-developer", title: "Game Developer" }] }),
    );
    expect(out!.text).toContain("Game Developer");
    expect(out!.text).not.toContain("undefined");
  });

  it("never echoes the active career back as a recent one", () => {
    const out = buildProactiveOpener(
      CAREER,
      activity({
        recentCareers: [
          { careerId: "radiologist", title: "Radiologist" },
          { careerId: "game-developer", title: "Game Developer" },
        ],
      }),
    );
    // Should fall through to the single-other-career branch (Radiologist filtered out).
    expect(out!.text).toContain("Game Developer");
    // The "I noticed you've also been exploring" line should name only Game Developer.
    expect(out!.text).toMatch(/exploring Game Developer/);
  });

  it("acknowledges the active goal when it matches this career and no other careers", () => {
    const out = buildProactiveOpener(
      CAREER,
      activity({ activeGoalTitle: "Radiologist", journeyStage: "clarity" }),
    );
    expect(out).not.toBeNull();
    expect(out!.text).toContain("Radiologist");
    expect(out!.text).toMatch(/closer to a decision/i);
  });

  it("acknowledges journey stage alone when there's nothing else", () => {
    const out = buildProactiveOpener(CAREER, activity({ journeyStage: "understand" }));
    expect(out).not.toBeNull();
    expect(out!.text).toMatch(/how it really works|digging/i);
  });

  it("prioritises returning over recent careers", () => {
    const out = buildProactiveOpener(
      CAREER,
      activity({
        daysSinceLastVisit: 40,
        recentCareers: [{ careerId: "game-developer", title: "Game Developer" }],
      }),
    );
    expect(out!.text).toMatch(/been a little while/i);
  });
});
