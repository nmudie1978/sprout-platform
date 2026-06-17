import { describe, it, expect } from "vitest";
import { locales } from "@/i18n/config";
import { localeToTwinLang } from "@/lib/career-twin/opener";
import { localeToLanguage } from "@/lib/ai-guardrails";

/**
 * Guard: the Career Twin (and every AI reply path that uses localeToLanguage)
 * must produce output in the user's chosen language for EVERY supported locale
 * — never a silent English fallback. If a new locale is added to
 * src/i18n/config without wiring the Twin opener/starter language + the
 * reply-language map, the first test below fails loudly.
 */
const EXPECTED: Record<string, { language: string; twin: string }> = {
  "en-GB": { language: "English", twin: "en" },
  "nb-NO": { language: "Norwegian", twin: "no" },
  es: { language: "Spanish", twin: "es" },
  sv: { language: "Swedish", twin: "sv" },
  da: { language: "Danish", twin: "da" },
};

describe("Career Twin / AI language coverage", () => {
  it("every configured locale has a coverage mapping", () => {
    for (const loc of locales) {
      expect(
        EXPECTED[loc],
        `Locale "${loc}" has no Twin language coverage. Add its opener + starter strings (src/lib/career-twin/opener.ts, starters.ts), a localeToLanguage case (src/lib/ai-guardrails.ts), and an EXPECTED entry here.`,
      ).toBeDefined();
    }
  });

  for (const [loc, exp] of Object.entries(EXPECTED)) {
    it(`${loc} → reply language "${exp.language}" + twin lang "${exp.twin}"`, () => {
      expect(localeToLanguage(loc)).toBe(exp.language);
      expect(localeToTwinLang(loc)).toBe(exp.twin);
    });
  }

  it("no non-English locale falls back to English replies", () => {
    for (const loc of locales) {
      if (loc !== "en-GB") {
        expect(localeToLanguage(loc), `${loc} should not reply in English`).not.toBe("English");
      }
    }
  });

  it("non-English locales use their own deterministic opener language (not the 'en' fallback)", () => {
    for (const loc of locales) {
      if (loc !== "en-GB") {
        expect(localeToTwinLang(loc), `${loc} opener should not fall back to 'en'`).not.toBe("en");
      }
    }
  });
});
