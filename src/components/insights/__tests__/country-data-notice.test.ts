import { describe, it, expect } from "vitest";
import { showsForeignDataNotice } from "@/components/insights/country-data-notice";

describe("showsForeignDataNotice", () => {
  it("shows for non-Norway countries", () => {
    expect(showsForeignDataNotice("Spain")).toBe(true);
    expect(showsForeignDataNotice("Italy")).toBe(true);
  });
  it("does NOT show for Norway or missing country", () => {
    expect(showsForeignDataNotice("Norway")).toBe(false);
    expect(showsForeignDataNotice(null)).toBe(false);
    expect(showsForeignDataNotice(undefined)).toBe(false);
    expect(showsForeignDataNotice("")).toBe(false);
  });
});
