import { describe, it, expect } from "vitest";
import {
  CAREER_TWIN_MODES,
  DEFAULT_MODE_ID,
  getMode,
  isValidModeId,
} from "../modes";
import { buildPersona, UNCERTAINTY_DISCLAIMER } from "../persona";
import { buildCareerTwinSystemPrompt, CAREER_TWIN_SAFETY_RULES } from "../prompt";
import type { CareerTwinCareerContext, CareerTwinProfileContext } from "../types";

const physio: CareerTwinCareerContext = {
  id: "physiotherapist",
  title: "Physiotherapist",
  emoji: "🧑‍⚕️",
  educationPath: "Bachelor's degree in physiotherapy",
  avgSalary: "550,000–700,000 NOK",
  keySkills: ["anatomy", "empathy", "communication"],
  dailyTasks: ["assessing patients", "designing rehab plans", "hands-on treatment"],
  growthOutlook: "high",
};

const richProfile: CareerTwinProfileContext = {
  age: 17,
  country: "Norway",
  preferredLanguage: "nb-NO",
  interests: ["sport", "helping people"],
  subjects: ["biology"],
  journeyStage: "Understand",
};

describe("Career Twin — modes", () => {
  it("exposes the seven conversation modes", () => {
    expect(CAREER_TWIN_MODES).toHaveLength(7);
    expect(CAREER_TWIN_MODES.map((m) => m.id)).toEqual([
      "ask_future_me",
      "study_skills",
      "money_lifestyle",
      "hard_truths",
      "doubts_risks",
      "opportunities",
      "next_steps",
    ]);
  });

  it("every mode has a label, a prompt modifier, and at least 3 starter questions", () => {
    for (const mode of CAREER_TWIN_MODES) {
      expect(mode.label.trim().length).toBeGreaterThan(0);
      expect(mode.promptModifier.trim().length).toBeGreaterThan(0);
      expect(mode.starterQuestions.length).toBeGreaterThanOrEqual(3);
      expect(mode.starterQuestions.every((q) => q.trim().length > 0)).toBe(true);
    }
  });

  it("getMode returns the requested mode and falls back to default for unknown ids", () => {
    expect(getMode("hard_truths").id).toBe("hard_truths");
    expect(getMode("not_a_real_mode").id).toBe(DEFAULT_MODE_ID);
    expect(getMode(null).id).toBe(DEFAULT_MODE_ID);
  });

  it("isValidModeId guards unknown ids", () => {
    expect(isValidModeId("doubts_risks")).toBe(true);
    expect(isValidModeId("nope")).toBe(false);
    expect(isValidModeId(null)).toBe(false);
  });
});

describe("Career Twin — persona builder", () => {
  it("builds a scenario-framed persona from career + profile", () => {
    const persona = buildPersona({ userId: "u1", career: physio, profile: richProfile });
    expect(persona.careerTitle).toBe("Physiotherapist");
    expect(persona.careerId).toBe("physiotherapist");
    expect(persona.countryContext).toBe("Norway");
    expect(persona.uncertaintyDisclaimer).toBe(UNCERTAINTY_DISCLAIMER);
    expect(persona.educationPathSummary).toContain("physiotherapy");
    expect(persona.typicalDaySummary).toContain("assessing patients");
    // future age = current age + a sensible span, never absurd
    expect(persona.futureAgeEstimate).not.toBeNull();
    expect(persona.futureAgeEstimate!).toBeGreaterThan(17);
    expect(persona.futureAgeEstimate!).toBeLessThanOrEqual(35);
  });

  it("the intro is first-person and explicitly non-deterministic", () => {
    const persona = buildPersona({ userId: "u1", career: physio, profile: richProfile });
    expect(persona.intro.toLowerCase()).toContain("i'm you");
    expect(persona.intro.toLowerCase()).toMatch(/one possible future|not a promise/);
  });

  it("derives assumed strengths from profile signals", () => {
    const persona = buildPersona({ userId: "u1", career: physio, profile: richProfile });
    expect(persona.strengthsAssumedFromProfile).toContain("sport");
  });

  it("treats under-16 users with a heightened safety level", () => {
    const persona = buildPersona({
      userId: "u1",
      career: physio,
      profile: { ...richProfile, age: 14 },
    });
    expect(persona.safetyLevel).toBe("heightened");
  });

  it("works general when the profile is sparse (no age, no interests)", () => {
    const persona = buildPersona({ userId: null, career: { id: "x", title: "Pilot" } });
    expect(persona.futureAgeEstimate).toBeNull();
    expect(persona.strengthsAssumedFromProfile).toEqual([]);
    expect(persona.countryContext).toBe("your country");
    expect(persona.careerTitle).toBe("Pilot");
  });
});

describe("Career Twin — system prompt (content)", () => {
  const persona = buildPersona({ userId: "u1", career: physio, profile: richProfile });

  it("includes the selected career title", () => {
    const prompt = buildCareerTwinSystemPrompt({
      persona,
      mode: getMode("ask_future_me"),
      career: physio,
      profile: richProfile,
    });
    expect(prompt).toContain("Physiotherapist");
  });

  it("includes the user's age when available", () => {
    const prompt = buildCareerTwinSystemPrompt({
      persona,
      mode: getMode("ask_future_me"),
      career: physio,
      profile: richProfile,
    });
    expect(prompt).toContain("17");
  });

  it("includes the country context when available", () => {
    const prompt = buildCareerTwinSystemPrompt({
      persona,
      mode: getMode("ask_future_me"),
      career: physio,
      profile: richProfile,
    });
    expect(prompt).toContain("Norway");
  });

  it("includes the uncertainty disclaimer and safety instructions", () => {
    const prompt = buildCareerTwinSystemPrompt({
      persona,
      mode: getMode("ask_future_me"),
      career: physio,
      profile: richProfile,
    });
    expect(prompt).toContain(UNCERTAINTY_DISCLAIMER);
    // a representative slice of the non-negotiable rules
    expect(prompt).toContain(CAREER_TWIN_SAFETY_RULES[0]);
  });

  it("reflects the selected mode's steer", () => {
    const doubtsMode = getMode("doubts_risks");
    const prompt = buildCareerTwinSystemPrompt({
      persona,
      mode: doubtsMode,
      career: physio,
      profile: richProfile,
    });
    expect(prompt).toContain(doubtsMode.label);
    expect(prompt).toContain(doubtsMode.promptModifier);
  });

  it("falls back to a general instruction when no profile context exists", () => {
    const bare = buildPersona({ userId: null, career: { id: "x", title: "Pilot" } });
    const prompt = buildCareerTwinSystemPrompt({
      persona: bare,
      mode: getMode("ask_future_me"),
      career: { id: "x", title: "Pilot" },
      profile: null,
    });
    expect(prompt.toLowerCase()).toContain("don't know much about this user");
  });
});

describe("Career Twin — system prompt (safety contract)", () => {
  const persona = buildPersona({ userId: "u1", career: physio, profile: richProfile });
  const prompt = buildCareerTwinSystemPrompt({
    persona,
    mode: getMode("hard_truths"),
    career: physio,
    profile: richProfile,
  });

  it("forbids guaranteed / deterministic future claims", () => {
    expect(prompt.toLowerCase()).toMatch(/never claim the user will become/);
    expect(prompt.toLowerCase()).toContain("guaranteed");
  });

  it("forbids inventing private memories", () => {
    expect(prompt.toLowerCase()).toMatch(/never invent specific private memories/);
  });

  it("requires salary RANGES, never a promised number", () => {
    expect(prompt.toLowerCase()).toMatch(/ranges/);
    expect(prompt.toLowerCase()).toMatch(/never promise a specific salary/);
  });

  it("routes big decisions and distress to a trusted adult", () => {
    expect(prompt.toLowerCase()).toContain("trusted adult");
    expect(prompt.toLowerCase()).toMatch(/never encourage quitting school/);
    expect(prompt.toLowerCase()).toMatch(/distressed|hopeless/);
  });

  it("escalates language guidance for younger teens", () => {
    const youngPersona = buildPersona({
      userId: "u1",
      career: physio,
      profile: { ...richProfile, age: 14 },
    });
    const youngPrompt = buildCareerTwinSystemPrompt({
      persona: youngPersona,
      mode: getMode("ask_future_me"),
      career: physio,
      profile: { ...richProfile, age: 14 },
    });
    expect(youngPrompt.toLowerCase()).toContain("under 16");
  });
});
