import { describe, it, expect, vi } from "vitest";
import {
  userPromptForMyth,
  userPromptForTypicalDay,
  userPromptForEmployer,
  parseVerdict,
  runReview,
  summarise,
  type ReviewItem,
  type Verdict,
  type VerdictResult,
} from "../semantic-qa-core";
import type { CareerDetails } from "../career-typical-days";

describe("prompt builders", () => {
  it("userPromptForMyth includes career, claim and reality", () => {
    const p = userPromptForMyth("nurse", { claim: "Nurses only assist doctors", reality: "Nurses lead care" });
    expect(p).toContain("nurse");
    expect(p).toContain("Nurses only assist doctors");
    expect(p).toContain("Nurses lead care");
  });

  const details: CareerDetails = {
    typicalDay: { morning: ["a"], midday: ["b"], afternoon: ["c"] },
    whatYouActuallyDo: ["diagnose", "treat"],
    whoThisIsGoodFor: ["empathetic people"],
    topSkills: ["precision", "communication"],
    entryPaths: ["medical school"],
    realityCheck: "Fewer than 600 people have ever been to space.",
  };

  it("userPromptForTypicalDay surfaces the driftable fields", () => {
    const p = userPromptForTypicalDay("astronaut", details);
    expect(p).toContain("astronaut");
    expect(p).toContain("Fewer than 600 people have ever been to space.");
    expect(p).toContain("precision, communication");
    expect(p).toContain("diagnose; treat");
  });

  it("userPromptForTypicalDay handles a missing realityCheck", () => {
    const p = userPromptForTypicalDay("x", { ...details, realityCheck: undefined });
    expect(p).toContain("(none)");
  });
});

describe("parseVerdict", () => {
  it("normalises each valid verdict", () => {
    expect(parseVerdict('{"verdict":"current","reasoning":"ok"}').verdict).toBe("current");
    expect(parseVerdict('{"verdict":"review","reasoning":"num"}').verdict).toBe("review");
    expect(parseVerdict('{"verdict":"outdated","reasoning":"wrong"}').verdict).toBe("outdated");
  });

  it("defaults an unknown verdict to current and extracts fields", () => {
    const r = parseVerdict('{"verdict":"maybe","reasoning":"hmm","suggestedUpdate":"fix it"}');
    expect(r.verdict).toBe("current");
    expect(r.reasoning).toBe("hmm");
    expect(r.suggestedUpdate).toBe("fix it");
  });

  it("falls back to review on unparseable output", () => {
    const r = parseVerdict("not json");
    expect(r.verdict).toBe("review");
    expect(r.reasoning).toMatch(/could not be parsed/i);
  });
});

describe("runReview", () => {
  const items: ReviewItem[] = [0, 1, 2].map((i) => ({
    target: "myths",
    careerId: "c",
    index: i,
    content: { i },
    prompt: `p${i}`,
  }));

  const stub = (verdict: Verdict) => async (): Promise<VerdictResult> => ({ verdict, reasoning: "stub" });

  it("reviews every item and assembles entries", async () => {
    const reviewFn = vi.fn(stub("current"));
    const out = await runReview(items, reviewFn);
    expect(out).toHaveLength(3);
    expect(reviewFn).toHaveBeenCalledTimes(3);
    expect(out[0]).toMatchObject({ target: "myths", index: 0, verdict: "current", reasoning: "stub" });
  });

  it("respects --limit (stops early)", async () => {
    const reviewFn = vi.fn(stub("review"));
    const out = await runReview(items, reviewFn, 2);
    expect(out).toHaveLength(2);
    expect(reviewFn).toHaveBeenCalledTimes(2);
  });

  it("calls onProgress per reviewed item", async () => {
    const seen: number[] = [];
    await runReview(items, stub("current"), Infinity, (it) => seen.push(it.index));
    expect(seen).toEqual([0, 1, 2]);
  });
});

describe("summarise", () => {
  it("counts verdicts", () => {
    const entries = [
      { target: "t", careerId: "c", index: 0, content: {}, verdict: "current" as const, reasoning: "" },
      { target: "t", careerId: "c", index: 1, content: {}, verdict: "review" as const, reasoning: "" },
      { target: "t", careerId: "c", index: 2, content: {}, verdict: "outdated" as const, reasoning: "" },
      { target: "t", careerId: "c", index: 3, content: {}, verdict: "review" as const, reasoning: "" },
    ];
    expect(summarise(entries)).toEqual({ current: 1, review: 2, outdated: 1, total: 4 });
  });
});

describe("userPromptForEmployer", () => {
  const employers = [
    { name: "Equinor", industry: "Energy" },
    { name: "NAV", industry: "Public sector" },
  ];

  it("tells the model a fallback list was never chosen for this career", () => {
    const prompt = userPromptForEmployer("Marine Biologist", employers, {
      category: "SCIENCE",
      source: "fallback",
      country: "Norway",
    });
    // The provenance is the whole point: a sector list judged as if it were
    // hand-picked reads as merely uninspiring rather than wrong.
    expect(prompt).toContain("NOT chosen for this career");
    expect(prompt).toContain("SCIENCE");
    expect(prompt).toContain("Equinor");
    expect(prompt).toContain("Norway");
  });

  it("marks curated lists as hand-picked", () => {
    const prompt = userPromptForEmployer("Petroleum Engineer", employers, {
      category: "ENGINEERING",
      source: "curated",
      country: "Norway",
    });
    expect(prompt).toContain("hand-picked");
    expect(prompt).not.toContain("NOT chosen for this career");
  });

  it("separates a broad employer from a wrong one", () => {
    // The pilot run flagged 17/40 as outdated by treating "generic" as
    // "incorrect". The verdict bands must make that distinction explicit or
    // the review queue is mostly noise.
    const prompt = userPromptForEmployer("Andrologist", employers, {
      category: "HEALTHCARE_LIFE_SCIENCES",
      source: "fallback",
      country: "Norway",
    });
    expect(prompt).toContain("Judge EMPLOYABILITY, not specificity");
    expect(prompt).toContain("would NOT hire this role");
    expect(prompt).toContain("Do not penalise a list for being");
  });

  it("asks the plausibility question, not the liveness question", () => {
    const prompt = userPromptForEmployer("Nurse", employers, {
      category: null,
      source: "fallback",
      country: "Norway",
    });
    // Link checking already covers "does this employer exist".
    expect(prompt).toContain("realistically be employed");
    expect(prompt).toContain("current / review / outdated");
  });
});
