"use client"

/**
 * AmbientLightBackground
 *
 * Light-mode canvas: X · Decent — a soft, airy two-stop wash from teal
 * (#4ca1af) to pale sky (#c4e0e5), with a whisper of teal in the top-right
 * and a faint gold warmth lower-left so it never reads cold/clinical.
 * The lightest, most spa-like of the cool canvases — no neon glow.
 *
 * Values track the design tokens in globals.css (X · Decent canvas +
 * teal primary + soft gold accent). Dark mode is untouched (this node
 * renders `dark:hidden`). Mounted once in the dashboard layout.
 */
export function AmbientLightBackground() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0 pointer-events-none dark:hidden"
      style={{
        background:
          // whisper of teal, top-right
          "radial-gradient(120% 90% at 88% 6%, hsl(178 69% 29% / 0.07) 0%, transparent 42%)," +
          // faint soft-gold warmth, lower-left (keeps it from feeling clinical)
          "radial-gradient(90% 80% at 8% 100%, hsl(40 55% 60% / 0.045) 0%, transparent 46%)," +
          // X · Decent base — airy two-stop teal → pale-sky wash
          "linear-gradient(120deg, hsl(187 40% 49%) 0%, hsl(189 36% 83%) 100%)",
      }}
    />
  )
}
