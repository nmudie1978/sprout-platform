"use client"

/**
 * AmbientLightBackground
 *
 * Light-mode canvas, anchored to the active light theme (24 · Deep Sea):
 * a grounded deep teal-blue "paper" with a subtle deeper-blue depth in the
 * top-right and a faint gold warmth lower-left so it never reads clinical.
 *
 * The base is the `--background` token (Deep Sea), NOT a hardcoded wash, so
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
          // subtle deeper teal-blue depth, top-right (premium, grounded)
          "radial-gradient(120% 90% at 88% 6%, hsl(198 44% 58% / 0.38) 0%, transparent 55%)," +
          // faint soft-gold warmth, lower-left (keeps it from feeling clinical)
          "radial-gradient(90% 80% at 8% 100%, hsl(40 55% 55% / 0.06) 0%, transparent 46%)," +
          // Deep Sea canvas — tracks the --background token so it never
          // drifts from the theme.
          "hsl(var(--background))",
      }}
    />
  )
}
