"use client"

import { MeshGradient } from "@paper-design/shaders-react"

/**
 * AmbientLightBackground
 *
 * Light-mode canvas: animated mesh-gradient shader in the warm
 * espresso palette from the 21st.dev reference design. Dark mode
 * is untouched (this node renders `dark:hidden`). Mounted once in
 * the dashboard layout. The shader paints the whole viewport
 * behind everything; the sidebar covers its region with its own
 * latte background, so only the main content area shows the
 * animation.
 */
export function AmbientLightBackground() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0 pointer-events-none dark:hidden overflow-hidden"
    >
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={["#000000", "#8B4513", "#ffffff", "#3E2723", "#5D4037"]}
        speed={0.3}
        backgroundColor="#000000"
      />
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-60"
        colors={["#000000", "#ffffff", "#8B4513", "#000000"]}
        speed={0.2}
        wireframe="true"
        backgroundColor="transparent"
      />
    </div>
  )
}
