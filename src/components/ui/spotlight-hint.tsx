"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface SpotlightHintProps {
  /** Whether the hint is currently visible */
  visible: boolean;
  /** Called when the user dismisses (click anywhere / auto-timeout) */
  onDismiss: () => void;
  /** The short hint text */
  text: string;
  /** CSS selector for the element to spotlight */
  targetSelector: string;
}

/**
 * SpotlightHint — full-page subtle overlay that spotlights one element.
 *
 * - Dims the page with a light overlay
 * - Cuts out a soft rounded hole around the target element
 * - Adds a gentle animated glow around the cutout
 * - Shows compact hint text well below the cutout
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

  useEffect(() => {
    if (!visible) return;

    const measure = () => {
      const el = document.querySelector(targetSelector);
      if (el) setRect(el.getBoundingClientRect());
    };

    const timer = setTimeout(measure, 50);
    window.addEventListener("resize", measure, { passive: true });
    window.addEventListener("scroll", measure, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [visible, targetSelector]);

  const pad = 10;

  return (
    <AnimatePresence>
      {visible && rect && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
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
                <rect width="100%" height="100%" fill="white" />
                <rect
                  x={rect.left - pad}
                  y={rect.top - pad}
                  width={rect.width + pad * 2}
                  height={rect.height + pad * 2}
                  rx={14}
                  ry={14}
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="rgba(0, 0, 0, 0.45)"
              mask="url(#spotlight-mask)"
            />
          </svg>

          {/* Glow ring — soft pulsing light around the cutout */}
          <motion.div
            className="absolute rounded-[14px] pointer-events-none"
            animate={{
              boxShadow: [
                "0 0 12px 2px rgba(20, 184, 166, 0.15), 0 0 30px 4px rgba(20, 184, 166, 0.08)",
                "0 0 18px 4px rgba(20, 184, 166, 0.25), 0 0 45px 8px rgba(20, 184, 166, 0.12)",
                "0 0 12px 2px rgba(20, 184, 166, 0.15), 0 0 30px 4px rgba(20, 184, 166, 0.08)",
              ],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              left: rect.left - pad,
              top: rect.top - pad,
              width: rect.width + pad * 2,
              height: rect.height + pad * 2,
              border: "1px solid rgba(20, 184, 166, 0.2)",
            }}
          />

          {/* Hint label — centred below the cutout with clear spacing */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
            className="absolute pointer-events-none flex justify-center"
            style={{
              left: rect.left - 40,
              top: rect.top + rect.height + pad + 16,
              width: rect.width + 80,
            }}
          >
            <span className="text-xs font-medium text-foreground/90 bg-card border border-border/40 rounded-lg px-4 py-2 shadow-lg">
              {text}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
