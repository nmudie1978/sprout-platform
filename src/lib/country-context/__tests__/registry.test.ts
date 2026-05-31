import { describe, it, expect } from "vitest";
import { getCountryContext } from "../index";

describe("getCountryContext", () => {
  it("returns Spain context for Spain", () => {
    const ctx = getCountryContext("Spain");
    expect(ctx.code).toBe("ES");
    expect(ctx.currency).toBe("EUR");
    expect(ctx.crisisLine).toMatch(/024|112/); // Spanish helpline, not Norwegian
    expect(ctx.condensedAiContext()).toMatch(/Bachillerato|FP/);
  });

  it("returns Norway context for Norway", () => {
    const ctx = getCountryContext("Norway");
    expect(ctx.code).toBe("NO");
    expect(ctx.currency).toBe("NOK");
    expect(ctx.crisisLine).toMatch(/116 111/);
  });

  it("falls back to Norway for unknown / missing country (never throws)", () => {
    expect(getCountryContext(null).code).toBe("NO");
    expect(getCountryContext(undefined).code).toBe("NO");
    expect(getCountryContext("Atlantis").code).toBe("NO");
    expect(getCountryContext("").code).toBe("NO");
  });
});
