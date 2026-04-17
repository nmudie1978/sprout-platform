"use client";

/**
 * Light-mode MeshGradient background — renders a slow, ambient
 * shader canvas behind the main content area. Only visible in
 * light mode; in dark mode the component renders nothing.
 *
 * M · Teal Mist palette — pale teal, warm cream, soft sage. Keeps
 * the teal brand intact while giving the canvas a calm, blended
 * glow instead of a flat fill.
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
      {/* Primary layer — Teal Mist blend */}
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={[
          "#c4ead6",  // pale teal
          "#f0e5cc",  // warm cream
          "#eaf3ef",  // near-white sage
          "#d6e8dd",  // soft mint-sage
          "#f6efe2",  // soft cream white
        ]}
        speed={0.15}
      />
      {/* Secondary layer — subtle highlight depth */}
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-30"
        colors={[
          "#ffffff",
          "#d9ede2",  // misty teal
          "#f5ecd4",  // butter cream
          "#ffffff",
        ]}
        speed={0.1}
      />
    </div>
  );
}
