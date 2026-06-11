// src/app/contribute/__tests__/career-param.test.ts
import { describe, it, expect } from "vitest";
import { careerTagFromParam } from "../career-param";
import { getCareerById } from "@/lib/career-pathways";

describe("careerTagFromParam", () => {
  it("returns {id,title} for a known career id", () => {
    const tag = careerTagFromParam("software-developer", getCareerById);
    expect(tag?.id).toBe("software-developer");
    expect(typeof tag?.title).toBe("string");
  });
  it("returns null for missing or unknown ids", () => {
    expect(careerTagFromParam(null, getCareerById)).toBeNull();
    expect(careerTagFromParam("", getCareerById)).toBeNull();
    expect(careerTagFromParam("not-a-real-career-xyz", getCareerById)).toBeNull();
  });
});
