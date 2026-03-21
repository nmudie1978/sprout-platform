/**
 * SPOTLIGHT CAROUSEL
 *
 * Generic carousel wrapper that rotates between spotlight slides.
 * Used to combine PodcastSpotlight + FutureSnapshot into one unit.
 *
 * Features:
 * - Auto-advance every 25s
 * - Pause on hover/focus
 * - Keyboard navigation (ArrowLeft/ArrowRight)
 * - Reduced motion support
 * - Expandable dot indicators
 */

"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ============================================
// TYPES
// ============================================

export interface SpotlightSlide {
  id: string;
  label: string;
  accentColor: string; // e.g. "text-emerald-500"
  content: ReactNode;
}

interface SpotlightCarouselProps {
  slides: SpotlightSlide[];
}

// ============================================
// CONSTANTS
// ============================================

const AUTO_ADVANCE_INTERVAL = 25000; // 25 seconds

// ============================================
// COMPONENT
// ============================================

export function SpotlightCarousel({ slides }: SpotlightCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const total = slides.length;

  // Reduced motion detection
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Navigation
  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % total);
  }, [total]);

  const goToPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto-advance
  useEffect(() => {
    if (isPaused || prefersReducedMotion) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    intervalRef.current = setInterval(goToNext, AUTO_ADVANCE_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, prefersReducedMotion, goToNext]);

  // Pause on hover
  const handleMouseEnter = useCallback(() => setIsPaused(true), []);
  const handleMouseLeave = useCallback(() => setIsPaused(false), []);

  // Pause on focus within
  const handleFocusIn = useCallback(() => setIsPaused(true), []);
  const handleFocusOut = useCallback((e: React.FocusEvent) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setIsPaused(false);
    }
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      }
    },
    [goToPrev, goToNext]
  );

  const active = slides[currentSlide];

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocusIn}
      onBlur={handleFocusOut}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="Spotlight carousel"
      aria-roledescription="carousel"
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`inline-block h-2 w-2 rounded-full ${active.accentColor.replace("text-", "bg-")}`} />
          <span className="text-xs font-medium text-muted-foreground">{active.label}</span>
        </div>
        {!prefersReducedMotion && (
          <span className="text-[10px] text-muted-foreground/60">
            {isPaused ? "Paused" : "Auto-advances"}
          </span>
        )}
      </div>

      {/* Slide content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={prefersReducedMotion ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {active.content}
        </motion.div>
      </AnimatePresence>

      {/* Footer: arrows + dots */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          onClick={goToPrev}
          className="p-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2" role="tablist" aria-label="Spotlight slides">
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(idx)}
              role="tab"
              aria-selected={currentSlide === idx}
              aria-label={`Go to ${slide.label}`}
              className={`h-2 rounded-full transition-all duration-200 ${
                currentSlide === idx
                  ? "w-6 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>

        <button
          onClick={goToNext}
          className="p-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Next slide"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
