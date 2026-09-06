import { describe, it, expect } from "vitest";
import { formatSalaryCompact, salaryPeriodLabel, estimateNote } from "../display";

const NO = "550,000 - 850,000 kr/year";
const SE = "38 800–72 500 kr/mån (median ca 52 500 kr/mån)";

describe("formatSalaryCompact", () => {
  it("keeps the Norwegian lower bound intact", () => {
    expect(formatSalaryCompact(NO)).toBe("550,000");
  });

  // Swedish uses a SPACE as the thousands separator, so splitting on
  // whitespace yields "38" — the regression this helper exists to prevent.
  it("does not truncate a Swedish figure at its thousands separator", () => {
    expect(formatSalaryCompact(SE)).toBe("38 800");
  });

  it("drops the median annotation from the compact form", () => {
    expect(formatSalaryCompact(SE)).not.toContain("median");
  });

  it("is total — empty input yields a dash, never a crash", () => {
    expect(formatSalaryCompact("")).toBe("—");
    expect(formatSalaryCompact(undefined)).toBe("—");
  });
});

describe("salaryPeriodLabel", () => {
  it("says annual for Norway and monthly for Sweden", () => {
    // Swedish pay is quoted as månadslön; labelling it "Annual" overstates
    // it by a factor of twelve.
    expect(salaryPeriodLabel("Norway")).toBe("Annual Salary");
    expect(salaryPeriodLabel(null)).toBe("Annual Salary");
    expect(salaryPeriodLabel("Sweden")).toBe("Monthly Salary");
    expect(salaryPeriodLabel("Denmark")).toBe("Monthly Salary");
  });
});

describe("estimateNote", () => {
  it("returns a note only for estimated figures", () => {
    expect(estimateNote("estimated")).toBeTruthy();
    expect(estimateNote("verified")).toBeNull();
    expect(estimateNote(undefined)).toBeNull();
  });
});
