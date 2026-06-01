"use client"

/**
 * AmbientLightBackground
 *
 * Light-mode canvas: Warm Paper — a calm, premium wash anchored on the
 * Endeavrly DS background (#F8F5EF → #F5F1EA), with a whisper of soft
 * teal in the top-right corner and a faint gold warmth lower-left.
 * Not stark white, no neon glow — just gentle warmth and depth.
 *
 * Values track the design tokens in globals.css (warm paper canvas +
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
          "radial-gradient(120% 90% at 88% 6%, hsl(178 69% 29% / 0.06) 0%, transparent 42%)," +
          // faint soft-gold warmth, lower-left
          "radial-gradient(90% 80% at 8% 100%, hsl(40 61% 57% / 0.05) 0%, transparent 46%)," +
          // warm-paper base: #F8F5EF → #F5F1EA
          "linear-gradient(160deg, hsl(40 39% 95%) 0%, hsl(39 37% 95%) 55%, hsl(38 35% 94%) 100%)",
      }}
    />
  )
}
