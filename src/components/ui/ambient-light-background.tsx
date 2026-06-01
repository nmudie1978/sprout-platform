"use client"

/**
 * AmbientLightBackground
 *
 * Light-mode canvas: Warm Paper — a calm, premium wash in paper tones
 * (#F7F5F2 → #F2EEE8 → #ECE7DF) with a whisper of soft teal in one
 * corner. Not stark white, no neon glow — just gentle warmth and depth.
 *
 * Dark mode is untouched (this node renders `dark:hidden`).
 * Mounted once in the dashboard layout.
 */
export function AmbientLightBackground() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0 pointer-events-none dark:hidden"
      style={{
        background:
          "radial-gradient(120% 90% at 85% 8%, hsl(169 66% 92% / 0.5) 0%, transparent 45%)," +
          "linear-gradient(160deg, hsl(36 24% 97%) 0%, hsl(36 26% 94%) 55%, hsl(37 26% 91%) 100%)",
      }}
    />
  )
}
