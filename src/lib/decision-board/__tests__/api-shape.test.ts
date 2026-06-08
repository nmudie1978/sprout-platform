import { describe, it, expect } from "vitest";
import { decisionBoardSchema } from "@/app/api/journey/decision-board/route";

describe("decisionBoardSchema", () => {
  it("accepts a valid board", () => {
    expect(decisionBoardSchema.parse({ order: ["a", "b"], ruledOut: ["c"] })).toEqual({
      order: ["a", "b"],
      ruledOut: ["c"],
    });
  });
  it("defaults missing arrays to empty", () => {
    expect(decisionBoardSchema.parse({})).toEqual({ order: [], ruledOut: [] });
  });
  it("rejects non-string ids", () => {
    expect(() => decisionBoardSchema.parse({ order: [1] })).toThrow();
  });
});
