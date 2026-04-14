"use client"

import { MeshGradient } from "@paper-design/shaders-react"
import { useEffect, useState } from "react"

/**
 * AmbientLightBackground
 *
 * Light-mode canvas: smooth animated MeshGradient in a soft teal /
 * peach / sage pastel palette, with a subtle white veil to calm
 * contrast. Dark mode is untouched (this node renders `dark:hidden`).
 * Mounted once in the dashboard layout.
 */
export function AmbientLightBackground() {
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const update = () =>
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0 pointer-events-none dark:hidden overflow-hidden"
    >
      {mounted && (
        <>
          <MeshGradient
            width={dimensions.width}
            height={dimensions.height}
            colors={["#3d7a7d", "#6fa9a9", "#b37a5a", "#8a6a4f", "#4d8a7a", "#7ca04a"]}
            distortion={0.8}
            swirl={0.6}
            grainMixer={0}
            grainOverlay={0}
            speed={0.21}
            offsetX={0.08}
          />
          <div className="absolute inset-0 pointer-events-none bg-black/15" />
        </>
      )}
    </div>
  )
}
