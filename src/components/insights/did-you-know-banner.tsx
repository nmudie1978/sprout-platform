/**
 * DID YOU KNOW ROTATING STAT BANNER
 *
 * A subtle rotating banner displaying research-backed statistics.
 * Features:
 * - Auto-rotation every 10 seconds
 * - Pause on hover/focus
 * - Reduced motion support
 * - Accessible and non-distracting design
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, Lightbulb, ChevronLeft, ChevronRight } from "lucide-react";
import { getRotatingStats, type ResearchStatWithYear } from "@/lib/researchEvidence";

const ROTATION_INTERVAL = 10000; // 10 seconds

export function DidYouKnowBanner() {
  const stats = getRotatingStats();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Navigation
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % stats.length);
  }, [stats.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + stats.length) % stats.length);
  }, [stats.length]);

  // Auto-rotation
  useEffect(() => {
    if (isPaused || prefersReducedMotion) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(goToNext, ROTATION_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, prefersReducedMotion, goToNext]);

  // Pause handlers
  const handleMouseEnter = useCallback(() => setIsPaused(true), []);
  const handleMouseLeave = useCallback(() => setIsPaused(false), []);
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

  const currentStat: ResearchStatWithYear = stats[currentIndex];

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocusIn}
      onBlur={handleFocusOut}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="Research insights banner"
      aria-live="polite"
      className="relative rounded-lg border bg-gradient-to-r from-amber-50/50 via-background to-amber-50/50 dark:from-amber-950/20 dark:via-background dark:to-amber-950/20 p-4 mb-6"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <div className="p-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">
            Did you know?
          </p>
          <p
            className={`text-sm text-foreground font-medium leading-snug ${
              prefersReducedMotion ? "" : "transition-opacity duration-300"
            }`}
          >
            {currentStat.headline}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <a
              href={currentStat.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
            >
              <span>
                Source: {currentStat.sourceName} ({currentStat.sourceYear})
              </span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={goToPrev}
            className="p-1 rounded-full text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/50 transition-colors"
            aria-label="Previous statistic"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="text-[10px] text-muted-foreground/50 tabular-nums w-8 text-center">
            {currentIndex + 1}/{stats.length}
          </span>
          <button
            onClick={goToNext}
            className="p-1 rounded-full text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/50 transition-colors"
            aria-label="Next statistic"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Progress indicator dots */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {stats.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to statistic ${idx + 1}`}
            aria-current={currentIndex === idx}
            className={`h-1 rounded-full transition-all duration-200 ${
              currentIndex === idx
                ? "w-4 bg-amber-500 dark:bg-amber-400"
                : "w-1 bg-muted-foreground/20 hover:bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
