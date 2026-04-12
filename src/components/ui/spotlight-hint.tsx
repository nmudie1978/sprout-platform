"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SpotlightHintProps {
  /** Whether the hint is currently visible */
  visible: boolean;
  /** Called when the user dismisses (click anywhere / auto-timeout) */
  onDismiss: () => void;
  /** The short hint text */
  text: string;
  /** CSS selector or ref for the element to spotlight */
  targetSelector: string;
}

/**
 * SpotlightHint — full-page subtle overlay that spotlights one element.
 *
 * - Dims the rest of the page with a very light overlay
 * - Cuts out a soft rounded hole around the target element
 * - Shows compact hint text below the cutout
 * - Auto-layout: measures the target rect on mount and on resize
 * - Dismisses on click anywhere or programmatic dismiss
 * - Does not trap focus or block pointer events on the target
 */
export function SpotlightHint({
  visible,
  onDismiss,
  text,
  targetSelector,
}: SpotlightHintProps) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const rafRef = useRef<number>();

  // Measure target element position
  useEffect(() => {
    if (!visible) return;

    const measure = () => {
      const el = document.querySelector(targetSelector);
      if (el) {
        setRect(el.getBoundingClientRect());
      }
    };

    // Initial measure after a short delay to let layout settle
    const timer = setTimeout(measure, 50);

    // Re-measure on resize/scroll
    window.addEventListener("resize", measure, { passive: true });
    window.addEventListener("scroll", measure, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [visible, targetSelector]);

  const padding = 8;

  return (
    <AnimatePresence>
      {visible && rect && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-0 z-[90]"
          onClick={onDismiss}
        >
          {/* SVG overlay with cutout */}
          <svg
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <mask id="spotlight-mask">
                {/* White = visible (dimmed), Black = transparent (cutout) */}
                <rect width="100%" height="100%" fill="white" />
                <rect
                  x={rect.left - padding}
                  y={rect.top - padding}
                  width={rect.width + padding * 2}
                  height={rect.height + padding * 2}
                  rx={12}
                  ry={12}
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="rgba(0, 0, 0, 0.4)"
              mask="url(#spotlight-mask)"
            />
          </svg>

          {/* Soft glow ring around the target */}
          <div
            className="absolute rounded-xl ring-1 ring-foreground/10 pointer-events-none"
            style={{
              left: rect.left - padding,
              top: rect.top - padding,
              width: rect.width + padding * 2,
              height: rect.height + padding * 2,
            }}
          />

          {/* Hint text below the cutout */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute pointer-events-none",
              "flex items-center justify-center",
            )}
            style={{
              left: rect.left - padding,
              top: rect.top + rect.height + padding + 10,
              width: rect.width + padding * 2,
            }}
          >
            <span className="text-xs font-medium text-foreground/90 bg-card/95 backdrop-blur-sm border border-border/30 rounded-lg px-3 py-1.5 shadow-sm">
              {text}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
