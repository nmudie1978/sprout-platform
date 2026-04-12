"use client";

import { AnimatePresence, motion } from "framer-motion";

interface SpotlightHintProps {
  /** Whether the hint is currently visible */
  visible: boolean;
  /** The short hint text (4-6 words max) */
  text: string;
  /** Placement relative to the target element */
  placement?: "top" | "bottom" | "left" | "right";
  /** Additional className for positioning */
  className?: string;
}

/**
 * SpotlightHint — a minimal, floating micro-text hint.
 *
 * No box, no background, no border — just subtle text that fades in
 * with a slight slide, then fades out. Designed to feel invisible
 * yet helpful. Place this as a sibling or child of the target element
 * (the parent should be `relative`).
 */
export function SpotlightHint({
  visible,
  text,
  placement = "bottom",
  className = "",
}: SpotlightHintProps) {
  const slideDirection = {
    top: { initial: { y: 4 }, animate: { y: 0 } },
    bottom: { initial: { y: -4 }, animate: { y: 0 } },
    left: { initial: { x: 4 }, animate: { x: 0 } },
    right: { initial: { x: -4 }, animate: { x: 0 } },
  }[placement];

  return (
    <AnimatePresence>
      {visible && (
        <motion.span
          initial={{ opacity: 0, ...slideDirection.initial }}
          animate={{ opacity: 1, ...slideDirection.animate }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`pointer-events-none text-[10px] font-medium text-teal-500/80 ${className}`}
        >
          {text}
        </motion.span>
      )}
    </AnimatePresence>
  );
}
