import { describe, it, expect } from "vitest";
import { looksLikeSoftNotFound } from "../soft-404";

/**
 * A soft 404 is a page that returns HTTP 200 while telling the reader the
 * page does not exist. antagning.se does exactly this. It matters here
 * because a "verified" figure is only as good as its citation, and a status
 * check alone cannot tell a real page from a polite apology.
 */
describe("looksLikeSoftNotFound", () => {
  it("catches the Swedish not-found wording antagning.se serves", () => {
    expect(
      looksLikeSoftNotFound(
        "<title>Sidan kan inte hittas (404) | antagning.se</title><body>Sidan kunde inte hittas</body>",
      ),
    ).toBe(true);
  });

  it("catches English and Norwegian equivalents", () => {
    expect(looksLikeSoftNotFound("<title>Page not found</title>")).toBe(true);
    expect(looksLikeSoftNotFound("<title>404 - Siden finnes ikke</title>")).toBe(true);
  });

  it("does not flag a real programme page that merely mentions a number", () => {
    expect(
      looksLikeSoftNotFound(
        "<title>Civilingenjör i datateknik | KTH</title><body>300 hp, 5 år. Antagningspoäng 20.4</body>",
      ),
    ).toBe(false);
  });

  // The phrase has to be prominent — a page that discusses 404s in its body
  // text is not itself a 404.
  it("only inspects the title and opening content, not the whole page", () => {
    const long = "<title>Om felmeddelanden</title><body>" + "x".repeat(5000) + "sidan kunde inte hittas</body>";
    expect(looksLikeSoftNotFound(long)).toBe(false);
  });

  it("is total — empty input is not a soft 404", () => {
    expect(looksLikeSoftNotFound("")).toBe(false);
  });
});
