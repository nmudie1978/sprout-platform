"use client";

import { useEffect, useRef, useState } from "react";
import type { VisualizationSpec } from "vega-embed";

interface VegaLiteChartProps {
  /** A valid Vega-Lite v5 specification object. */
  spec: VisualizationSpec;
  /** Additional CSS class names for the wrapper div. */
  className?: string;
}

/**
 * VegaLiteChart — standard renderer for all Industry Insights charts.
 *
 * Accepts a Vega-Lite v5 spec and renders it via vega-embed.
 * Handles responsive resize, dark-mode background swap,
 * reduced-motion, and loading/error states.
 */
export function VegaLiteChart({ spec, className }: VegaLiteChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );

  useEffect(() => {
    if (!containerRef.current) return;

    let disposed = false;

    // Dynamic import to keep vega out of the initial bundle
    import("vega-embed").then(({ default: embed }) => {
      if (disposed || !containerRef.current) return;

      // Detect dark mode
      const isDark = document.documentElement.classList.contains("dark");

      // Detect reduced motion
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      // Merge dark-mode background into the spec
      const themedSpec: VisualizationSpec = {
        ...spec,
        background: isDark ? "#1c1917" : (spec as Record<string, unknown>).background as string ?? "#fafaf9",
      };

      embed(containerRef.current!, themedSpec, {
        actions: false, // hide export/source/editor links
        renderer: "svg", // sharper rendering, accessible
        tooltip: { theme: isDark ? "dark" : "custom" },
        // Disable animated transitions when user prefers reduced motion
        ...(prefersReducedMotion ? { config: { autosize: { type: "fit" } } } : {}),
      })
        .then((result) => {
          if (disposed) {
            result.finalize();
            return;
          }

          // Re-render on resize for responsive "container" width
          const observer = new ResizeObserver(() => {
            if (!disposed) result.view.resize().runAsync();
          });
          observer.observe(containerRef.current!);

          setStatus("ready");

          // Cleanup on unmount
          const cleanup = () => {
            disposed = true;
            observer.disconnect();
            result.finalize();
          };
          (containerRef.current as HTMLDivElement & { __vegaCleanup?: () => void }).__vegaCleanup = cleanup;
        })
        .catch((err) => {
          if (!disposed) {
            console.error("[VegaLiteChart] render failed:", err);
            setStatus("error");
          }
        });
    });

    return () => {
      disposed = true;
      const el = containerRef.current as HTMLDivElement & { __vegaCleanup?: () => void } | null;
      el?.__vegaCleanup?.();
    };
  }, [spec]);

  return (
    <div
      ref={containerRef}
      className={className}
      role="img"
      aria-label="Data visualization chart"
      style={{ minHeight: 200 }}
    >
      {status === "loading" && (
        <div className="flex items-center justify-center h-48 text-sm text-muted-foreground animate-pulse">
          Loading chart…
        </div>
      )}
      {status === "error" && (
        <div className="flex items-center justify-center h-48 text-sm text-red-500/80">
          Chart could not be loaded.
        </div>
      )}
    </div>
  );
}
