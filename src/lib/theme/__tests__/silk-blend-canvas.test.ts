import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

import { SILK_BLEND_BASE } from "@/components/ui/silk-blend-gradient";

/**
 * The light-mode canvas gradient is hard-coded inside the component (it came
 * out of the 21st.dev builder as literal CSS), while `--background` lives in
 * globals.css. They describe the same colour: `--background` is what shows
 * anywhere the fixed canvas layer doesn't reach, so if the two drift apart you
 * get a seam. Nothing in the type system ties them together, so tie them here.
 */
const GLOBALS = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
const COMPONENT = readFileSync(
  join(process.cwd(), "src/components/ui/silk-blend-gradient.tsx"),
  "utf8"
);

/** The `:root` block only — never `.dark`, which is a separate theme. */
function rootBlock(): string {
  const start = GLOBALS.indexOf(":root {");
  const end = GLOBALS.indexOf(".dark {", start);
  expect(start).toBeGreaterThan(-1);
  expect(end).toBeGreaterThan(start);
  // Strip comments first: the block's own documentation mentions token
  // names followed by a colon ("darkening --muted-foreground: ..."), which
  // otherwise parse as declarations.
  return GLOBALS.slice(start, end).replace(/\/\*[\s\S]*?\*\//g, "");
}

function rootToken(name: string): string {
  const m = rootBlock().match(new RegExp(`--${name}:\\s*([^;]+);`));
  expect(m, `--${name} missing from :root`).toBeTruthy();
  return m![1].trim();
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [
    Math.round(255 * f(0)),
    Math.round(255 * f(8)),
    Math.round(255 * f(4)),
  ];
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

describe("Silk Blend light canvas", () => {
  it("keeps --background in sync with the gradient's first stop", () => {
    const [h, s, l] = rootToken("background")
      .replace(/%/g, "")
      .split(/\s+/)
      .map(Number);
    const fromToken = hslToRgb(h, s, l);
    const fromComponent = hexToRgb(SILK_BLEND_BASE);

    // HSL→RGB rounding means an exact match isn't reasonable; a couple of
    // levels per channel is invisible, a real drift is not.
    fromToken.forEach((channel, i) => {
      expect(
        Math.abs(channel - fromComponent[i]),
        `--background ${fromToken} differs from ${SILK_BLEND_BASE}`
      ).toBeLessThanOrEqual(3);
    });
  });

  it("renders the softened stops, not the builder's original vivid ones", () => {
    // The exported recipe's blue (#4C6CB3) measures 3.52:1 against the theme
    // ink — under AA. Shipping it again would silently regress contrast.
    expect(COMPONENT).toContain("#7B93CC");
    expect(COMPONENT).toContain("#C7AEDC");
    expect(COMPONENT).toContain("#F7C9D4");
    // Check the gradient declaration itself — the doc comment above it cites
    // the original stops on purpose, and must not trip this.
    const gradient = COMPONENT.match(/linear-gradient\(170deg[^"]+/)?.[0] ?? "";
    expect(gradient).not.toBe("");
    expect(gradient).not.toContain("#4C6CB3");
    expect(gradient).not.toContain("#B28FCE");
    expect(gradient).not.toContain("#F4B3C2");
  });

  it("keeps light mode a light theme — ink dark, card near-white", () => {
    // Guards against a future canvas swap quietly re-inverting the theme:
    // the previous two light themes were actually dark, and the tokens were
    // derived upward from the canvas.
    const lightness = (token: string) =>
      Number(rootToken(token).split(/\s+/)[2].replace("%", ""));

    expect(lightness("foreground")).toBeLessThan(25);
    expect(lightness("card")).toBeGreaterThan(90);
    expect(lightness("muted-foreground")).toBeLessThan(45);
  });
});
