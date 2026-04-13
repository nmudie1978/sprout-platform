"use client";

/**
 * Light-mode MeshGradient background — renders a slow, ambient
 * shader canvas behind the main content area. Only visible in
 * light mode; in dark mode the component renders nothing.
 *
 * Uses @paper-design/shaders-react MeshGradient with soft warm
 * tones (cream, blush, lavender, soft teal) at very low speed
 * so the effect feels calm, not distracting.
 */

import { MeshGradient } from "@paper-design/shaders-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function LightModeShaderBackground() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Don't render in dark mode or before hydration
  if (!mounted || resolvedTheme === "dark") return null;

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden
    >
      {/* Primary layer — soft warm mesh */}
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={[
          "#faf5ff",  // very light lavender
          "#fce7f3",  // soft blush pink
          "#fef3c7",  // warm cream
          "#d1fae5",  // soft mint/teal
          "#e0e7ff",  // soft periwinkle
        ]}
        speed={0.15}
      />
      {/* Secondary layer — subtle depth with very low opacity */}
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-30"
        colors={[
          "#ffffff",
          "#fbcfe8",  // pink
          "#fde68a",  // warm yellow
          "#ffffff",
        ]}
        speed={0.1}
      />
    </div>
  );
}
