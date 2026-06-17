import { describe, it, expect } from "vitest";
import { selectWelcomeBack, type WelcomeBackSignals } from "../welcome-back";

const base: WelcomeBackSignals = {
  name: "Nick",
  lastExplored: null,
  topInterest: null,
  lastSaved: null,
};

describe("selectWelcomeBack", () => {
  it("keeps the user's name", () => {
    expect(selectWelcomeBack({ ...base, name: "Nick" }).name).toBe("Nick");
  });

  it("prefers the most-recently explored journey, and offers to resume it", () => {
    const r = selectWelcomeBack({
      ...base,
      lastExplored: { title: "AI Engineer" },
      topInterest: { title: "Physiotherapist", rating: 5 },
      lastSaved: { title: "Agile Coach" },
    });
    expect(r.memory).toEqual({ kind: "explored", career: "AI Engineer" });
    expect(r.cta.kind).toBe("resume");
  });

  it("falls back to a strong interest (4+ stars) when nothing was explored", () => {
    const r = selectWelcomeBack({
      ...base,
      topInterest: { title: "Speech and Language Therapist", rating: 4 },
      lastSaved: { title: "Agile Coach" },
    });
    expect(r.memory).toEqual({
      kind: "interest",
      career: "Speech and Language Therapist",
    });
    expect(r.cta.kind).toBe("explore");
  });

  it("ignores weak interest ratings (below 4 stars)", () => {
    const r = selectWelcomeBack({
      ...base,
      topInterest: { title: "Global Brand Director", rating: 3 },
      lastSaved: { title: "Agile Coach" },
    });
    expect(r.memory).toEqual({ kind: "saved", career: "Agile Coach" });
  });

  it("falls back to a saved career when there is no journey or strong interest", () => {
    const r = selectWelcomeBack({ ...base, lastSaved: { title: "Agile Coach" } });
    expect(r.memory).toEqual({ kind: "saved", career: "Agile Coach" });
    expect(r.cta.kind).toBe("explore");
  });

  it("uses a gentle generic line when there is no history at all", () => {
    const r = selectWelcomeBack(base);
    expect(r.memory).toEqual({ kind: "none" });
    expect(r.cta.kind).toBe("explore");
  });

  it("trims blank career titles and treats them as absent", () => {
    const r = selectWelcomeBack({
      ...base,
      lastExplored: { title: "   " },
      lastSaved: { title: "Agile Coach" },
    });
    expect(r.memory).toEqual({ kind: "saved", career: "Agile Coach" });
  });
});
