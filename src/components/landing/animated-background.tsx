"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { Boxes } from "@/components/ui/background-boxes";

/**
 * AnimatedBackground — isometric grid with interactive hover boxes.
 *
 * Renders behind the hero section content using a radial-gradient mask
 * so the effect fades to transparent at the edges.
 * Hidden on mobile for performance.
 */
export const AnimatedBackground = memo(function AnimatedBackground() {
  return (
    <div
      className={cn(
        "fixed inset-0 w-full h-full overflow-hidden z-0",
        "hidden sm:block"
      )}
      aria-hidden="true"
    >
      {/* Radial mask — fades the grid toward the edges so it stays subtle */}
      <div className="absolute inset-0 w-full h-full bg-slate-900 z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />

      <Boxes />
    </div>
  );
});
