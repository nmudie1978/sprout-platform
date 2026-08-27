"use client"

/**
 * AmbientLightBackground
 *
 * Light-mode canvas, anchored to the active light theme (15 · Wheat):
 * a sunny golden "paper" with a subtle deeper-wheat depth in the top-right
 * and a faint gold warmth lower-left so it never reads flat.
 *
 * The base is the `--background` token (Wheat), NOT a hardcoded wash, so
 * this canvas always matches the theme tokens in globals.css instead of
 * drifting from them. (It previously painted the old lighter "Decent"
 * teal → pale-sky gradient, which sat ON TOP of the Deep Sea token and made
 * the new theme invisible.) Dark mode is untouched (`dark:hidden`).
 * Mounted once in the dashboard layout.
 */
export function AmbientLightBackground() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0 pointer-events-none dark:hidden"
      style={{
        background:
          // Subtle deeper-wheat depth, top-right (premium, grounded). This one
          // is hardcoded rather than token-derived, so it MUST be retinted
          // alongside --background — at 0.38 alpha a stale hue lays a visible
          // wash of the old theme over the new canvas.
          "radial-gradient(120% 90% at 88% 6%, hsl(44 44% 66% / 0.38) 0%, transparent 55%)," +
          // faint soft-gold warmth, lower-left (keeps it from feeling clinical)
          "radial-gradient(90% 80% at 8% 100%, hsl(40 55% 55% / 0.06) 0%, transparent 46%)," +
          // Wheat canvas — tracks the --background token so it never
          // drifts from the theme.
          "hsl(var(--background))",
      }}
    />
  )
}
