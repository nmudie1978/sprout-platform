import { describe, it, expect } from "vitest";
import { selectGreetingKind, timeOfDayGreeting, type GreetingKind } from "../greeting";

describe("timeOfDayGreeting", () => {
  it("maps the hour to morning / afternoon / evening", () => {
    expect(timeOfDayGreeting(0)).toBe("morning");
    expect(timeOfDayGreeting(11)).toBe("morning");
    expect(timeOfDayGreeting(12)).toBe("afternoon");
    expect(timeOfDayGreeting(16)).toBe("afternoon");
    expect(timeOfDayGreeting(17)).toBe("evening");
    expect(timeOfDayGreeting(23)).toBe("evening");
  });
});

describe("selectGreetingKind", () => {
  it("is deterministic for the same moment (no per-render flicker)", () => {
    const d = new Date(2026, 5, 17, 20, 30); // evening
    expect(selectGreetingKind(d)).toBe(selectGreetingKind(new Date(2026, 5, 17, 20, 5)));
  });

  it("only ever returns a known greeting kind", () => {
    const valid: GreetingKind[] = [
      "morning",
      "afternoon",
      "evening",
      "welcomeBack",
      "niceToSeeYou",
      "goodToSeeYou",
    ];
    for (let h = 0; h < 24; h++) {
      for (let day = 0; day < 40; day++) {
        const kind = selectGreetingKind(new Date(2026, 0, 1 + day, h));
        expect(valid).toContain(kind);
      }
    }
  });

  it("when it picks a time-of-day greeting, it matches the actual time of day", () => {
    for (let h = 0; h < 24; h++) {
      const kind = selectGreetingKind(new Date(2026, 2, 3, h));
      if (kind === "morning" || kind === "afternoon" || kind === "evening") {
        expect(kind).toBe(timeOfDayGreeting(h));
      }
    }
  });

  it("varies across the day — not the same greeting every hour", () => {
    const kinds = new Set<GreetingKind>();
    for (let h = 0; h < 24; h++) kinds.add(selectGreetingKind(new Date(2026, 3, 9, h)));
    expect(kinds.size).toBeGreaterThan(1);
  });

  it("surfaces the warmer relational greetings over a span of visits", () => {
    const kinds = new Set<GreetingKind>();
    for (let day = 0; day < 12; day++) {
      for (let h = 0; h < 24; h++) kinds.add(selectGreetingKind(new Date(2026, 4, 1 + day, h)));
    }
    expect(kinds.has("welcomeBack")).toBe(true);
    expect(kinds.has("niceToSeeYou")).toBe(true);
    expect(kinds.has("goodToSeeYou")).toBe(true);
  });
});
