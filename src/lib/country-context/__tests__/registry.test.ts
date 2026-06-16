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

  it("returns Sweden context for Sweden", () => {
    const ctx = getCountryContext("Sweden");
    expect(ctx.code).toBe("SE");
    expect(ctx.currency).toBe("SEK");
    expect(ctx.crisisLine).toMatch(/90101|112/); // Swedish helpline, not Norwegian
    expect(ctx.crisisLine).not.toMatch(/116 111/);
    expect(ctx.condensedAiContext()).toMatch(/gymnasium|Högskoleprovet|CSN/);
  });

  it("returns Denmark context for Denmark", () => {
    const ctx = getCountryContext("Denmark");
    expect(ctx.code).toBe("DK");
    expect(ctx.currency).toBe("DKK");
    expect(ctx.crisisLine).toMatch(/70 201 201|112/); // Danish helpline, not Norwegian
    expect(ctx.crisisLine).not.toMatch(/116 111/);
    expect(ctx.condensedAiContext()).toMatch(/7-trins-skala|optagelse\.dk|SU/);
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
