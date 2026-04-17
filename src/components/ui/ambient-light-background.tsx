"use client"

/**
 * AmbientLightBackground
 *
 * Light-mode canvas: solid pale steel — I · Steel & Serious. Flat
 * near-white with a cool steel tint, quietly confident and trust-
 * signalling. Swaps teal brand for steel blue. No gradient, no
 * animation, no shader. Dark mode is untouched (this node renders
 * `dark:hidden`). Mounted once in the dashboard layout.
 */
export function AmbientLightBackground() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0 pointer-events-none dark:hidden"
      style={{ background: "hsl(210 40% 98%)" }}
    />
  )
}
