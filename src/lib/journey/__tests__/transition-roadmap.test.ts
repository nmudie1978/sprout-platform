import { describe, it, expect } from "vitest";
import { isFormalDegreeStep, stripFormalEducationSteps } from "../transition-roadmap";

describe("transition-roadmap: stripFormalEducationSteps", () => {
  const aiAnimatorRoadmap = [
    { stage: "foundation", title: "Your Starting Point", description: "Not working" },
    { stage: "experience", title: "Land your first entry-level role", description: "Junior" },
    { stage: "education", title: "Begin university studies", description: "University or college" },
    { stage: "education", title: "Complete your degree", description: "Graduate with a BA" },
    { stage: "experience", title: "Begin advanced animation work", description: "" },
  ];

  it("removes university / degree education steps", () => {
    const out = stripFormalEducationSteps(aiAnimatorRoadmap);
    const titles = out.map((s) => s.title);
    expect(titles).not.toContain("Begin university studies");
    expect(titles).not.toContain("Complete your degree");
    // keeps the practical / experience steps
    expect(titles).toContain("Land your first entry-level role");
    expect(titles).toContain("Begin advanced animation work");
    expect(titles).toContain("Your Starting Point");
  });

  it("keeps vocational fagbrev and short courses (valid fast routes)", () => {
    const items = [
      { stage: "education", title: "Earn your fagbrev", description: "Vocational diploma" },
      { stage: "education", title: "Take a short Blender course", description: "8-week online course" },
      { stage: "certification", title: "Get a colour-grading certification", description: "" },
      { stage: "education", title: "Begin a bachelor's degree", description: "" },
    ];
    const titles = stripFormalEducationSteps(items).map((s) => s.title);
    expect(titles).toContain("Earn your fagbrev");
    expect(titles).toContain("Take a short Blender course");
    expect(titles).toContain("Get a colour-grading certification");
    expect(titles).not.toContain("Begin a bachelor's degree");
  });

  it("isFormalDegreeStep only flags education-stage degree steps", () => {
    expect(isFormalDegreeStep({ stage: "education", title: "Complete your university degree" })).toBe(true);
    expect(isFormalDegreeStep({ stage: "experience", title: "Graduate trainee role" })).toBe(false); // not education stage
    expect(isFormalDegreeStep({ stage: "education", title: "Build a portfolio" })).toBe(false);
  });

  it("never empties the roadmap (returns original if all matched)", () => {
    const allDegree = [{ stage: "education", title: "Bachelor's degree" }];
    expect(stripFormalEducationSteps(allDegree)).toEqual(allDegree);
  });
});
