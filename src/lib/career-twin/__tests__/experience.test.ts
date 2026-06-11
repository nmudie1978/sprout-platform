import { describe, it, expect } from "vitest";
import {
  EXPERIENCE_LENGTHS,
  getExperienceLength,
  isValidExperienceLength,
  totalScenarios,
  categoryForIndex,
  buildExperienceSystemPrompt,
  buildStartUserMessage,
  buildRespondUserMessage,
  scenarioContentSchema,
  respondContentSchema,
  fitInsightsSchema,
  type ExperienceCategory,
} from "../experience";
import type { CareerTwinPersona, CareerTwinCareerContext } from "../types";

const career: CareerTwinCareerContext = {
  id: "doctor",
  title: "Doctor",
  keySkills: ["clinical reasoning", "empathy"],
  dailyTasks: ["see patients", "review charts"],
};

const persona: CareerTwinPersona = {
  userId: "u1",
  careerId: "doctor",
  careerTitle: "Doctor",
  futureAgeEstimate: 30,
  countryContext: "Norway",
  educationPathSummary: "medical school then residency",
  currentRoleSummary: "hospital doctor",
  typicalDaySummary: "ward rounds, patients, paperwork",
  strengthsAssumedFromProfile: [],
  uncertaintyDisclaimer: "This is one possible future, not a promise.",
  tone: "warm",
  safetyLevel: "standard",
  intro: "Hi — I'm you, a few years ahead…",
  createdAt: "",
  updatedAt: "",
};

describe("experience lengths", () => {
  it("each length's plan length equals its total", () => {
    for (const l of EXPERIENCE_LENGTHS) {
      expect(l.plan).toHaveLength(l.total);
    }
  });

  it("every length includes at least one hard-reality moment (no sugar-coating)", () => {
    for (const l of EXPERIENCE_LENGTHS) {
      expect(l.plan).toContain<ExperienceCategory>("hard_reality");
    }
  });

  it("resolves and validates length ids, falling back to quick", () => {
    expect(getExperienceLength("typical_day").id).toBe("typical_day");
    expect(getExperienceLength("nonsense").id).toBe("quick");
    expect(isValidExperienceLength("challenging_day")).toBe(true);
    expect(isValidExperienceLength("nope")).toBe(false);
    expect(totalScenarios("typical_day")).toBe(6);
  });

  it("categoryForIndex follows the plan and clamps out-of-range", () => {
    expect(categoryForIndex("typical_day", 0)).toBe("daily_work");
    expect(categoryForIndex("typical_day", 5)).toBe("hard_reality");
    // clamp beyond the plan
    expect(categoryForIndex("typical_day", 99)).toBe("hard_reality");
  });
});

describe("system prompt", () => {
  const prompt = buildExperienceSystemPrompt({ persona, career, length: "typical_day" });

  it("carries the future-self framing and the career", () => {
    expect(prompt).toContain("Doctor");
    expect(prompt).toMatch(/one possible future version/i);
    expect(prompt).toMatch(/memories/i);
  });

  it("includes the safety rules and the JSON-only output contract", () => {
    expect(prompt).toMatch(/NON-NEGOTIABLE SAFETY RULES/);
    expect(prompt).toMatch(/SIMULATION, not a fortune teller/);
    expect(prompt).toMatch(/SINGLE valid JSON object/);
  });

  it("insists on realism and including the hard parts", () => {
    expect(prompt).toMatch(/REALISTIC/);
    expect(prompt).toMatch(/hard|stressful|dull/i);
    expect(prompt).toMatch(/never (score|mark)|right or wrong/i);
  });
});

describe("step user messages", () => {
  it("start asks for the first scene with the first category and JSON shape", () => {
    const m = buildStartUserMessage("typical_day");
    expect(m).toMatch(/scene 1 of 6/);
    expect(m).toMatch(/"context"/);
    expect(m).toMatch(/"situation"/);
  });

  it("a middle step asks for consequence + reflection + next, not fit insights", () => {
    const m = buildRespondUserMessage({ length: "typical_day", currentIndex: 1, userReply: "I'd triage." });
    expect(m).toMatch(/"consequence"/);
    expect(m).toMatch(/"reflection"/);
    expect(m).toMatch(/Then continue the day with the NEXT scene as "next"/);
    expect(m).toMatch(/Do NOT include a "fitInsights" key yet/);
  });

  it("the last step asks for fit insights and forbids a next scene", () => {
    const m = buildRespondUserMessage({ length: "typical_day", currentIndex: 5, userReply: "done" });
    expect(m).toMatch(/fitInsights/);
    expect(m).toMatch(/LAST scene/);
    expect(m).toMatch(/never tell them what they should become/i);
    expect(m).toMatch(/Do NOT include a "next" key/);
  });
});

describe("output validators", () => {
  it("accepts a well-formed scenario and respond payload", () => {
    expect(scenarioContentSchema.safeParse({ context: "It's Tuesday.", situation: "A patient arrives. What now?" }).success).toBe(true);
    const ok = respondContentSchema.safeParse({
      consequence: "The patient is stabilised.",
      reflection: { whatItsReallyLike: "fast-paced", skillsUsed: ["triage"], whyEnjoy: "you help people", whyDislike: "the stress" },
      next: { context: "Later that morning.", situation: "A chart is missing. What do you do?" },
    });
    expect(ok.success).toBe(true);
  });

  it("rejects empty required fields", () => {
    expect(scenarioContentSchema.safeParse({ context: "", situation: "x" }).success).toBe(false);
    expect(fitInsightsSchema.safeParse({ enjoyed: "", lessInterested: "x", skillsUsed: [], skillsToDevelop: [], questionsToExplore: [] }).success).toBe(false);
  });
});
