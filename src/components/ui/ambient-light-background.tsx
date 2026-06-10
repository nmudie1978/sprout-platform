"use client"

/**
 * AmbientLightBackground
 *
 * Light-mode canvas: Cool Stone — a calm, ~20% darker blue-grey wash
 * anchored on the DS background, with a whisper of teal in the top-right
 * and a faint gold warmth lower-left so it never reads cold/clinical.
 * Not stark white, no neon glow — just gentle depth.
 *
 * Values track the design tokens in globals.css (Cool Stone canvas +
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
          // Cool Stone base — toned blue-grey paper
          "linear-gradient(160deg, hsl(210 13% 88%) 0%, hsl(212 12% 87%) 55%, hsl(210 12% 86%) 100%)",
      }}
    />
  )
}
