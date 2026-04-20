"use client"

/**
 * AmbientLightBackground
 *
 * Light-mode canvas: PP · Vasily — two-stop diagonal from mustard
 * yellow (#e9d362) to charcoal (#333333). Warm-to-dark, editorial,
 * unexpected. White cards sit crisply on top; the gradient peeks
 * around card edges and fills the full-bleed page chrome.
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
          "linear-gradient(120deg, hsl(51 76% 65%) 0%, hsl(0 0% 20%) 100%)",
      }}
    />
  )
}
