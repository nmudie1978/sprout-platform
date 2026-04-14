"use client"

import { MeshGradient } from "@paper-design/shaders-react"

/**
 * AmbientLightBackground
 *
 * Light-mode canvas: subtle animated mesh-gradient shader in warm
 * cream tones so the surface has gentle ambient movement without
 * going dark or hurting text contrast. Dark mode is untouched
 * (this node is `dark:hidden`). Mounted once in the dashboard
 * layout. The shader sits behind everything; the sidebar covers
 * its region with its own latte background.
 */
export function AmbientLightBackground() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0 pointer-events-none dark:hidden overflow-hidden"
    >
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={["#F7EBD3", "#F3DDB5", "#FDF6E8", "#E9C99A", "#F7E4BE"]}
        speed={0.3}
        backgroundColor="#F7EBD3"
      />
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-40"
        colors={["#F7EBD3", "#FFFFFF", "#E9C99A", "#F7EBD3"]}
        speed={0.2}
        wireframe="true"
        backgroundColor="transparent"
      />
    </div>
  )
}
