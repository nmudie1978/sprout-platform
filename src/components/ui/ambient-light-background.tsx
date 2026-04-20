"use client"

/**
 * AmbientLightBackground
 *
 * Light-mode canvas: DD · Purple Bliss — two-stop diagonal from deep
 * aubergine (#360033) to teal (#0b8793). Moody, rich — teal retained
 * on one end so the brand stays on-palette.
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
          "linear-gradient(120deg, hsl(303 100% 11%) 0%, hsl(186 86% 31%) 100%)",
      }}
    />
  )
}
