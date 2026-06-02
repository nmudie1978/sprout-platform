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

  it("falls back to a NEUTRAL international context — never silently Norway", () => {
    // Safety: an unlocalised country must NOT inherit Norway's currency or
    // (critically) its crisis number. See international.ts.
    for (const input of [null, undefined, "Atlantis", "", "Italy"] as const) {
      const ctx = getCountryContext(input);
      expect(ctx.code).toBe("INT");
      expect(ctx.code).not.toBe("NO");
      expect(ctx.currency).not.toBe("NOK");
      expect(ctx.crisisLine).not.toMatch(/116 111/);
    }
  });
});
