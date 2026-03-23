/**
 * REALITY CHECK PANEL
 *
 * Myth vs Reality comparisons to help youth understand
 * common misconceptions about careers and the job market.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Scale,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RealityCheck {
  id: string;
  myth: string;
  reality: string;
  source?: string;
}

// Curated reality checks
// TODO: Connect to backend when available
const REALITY_CHECKS: RealityCheck[] = [
  {
    id: "rc-1",
    myth: "You need to know exactly what career you want by 18",
    reality:
      "Most people change careers 5-7 times in their lifetime. Exploration is normal and valuable.",
    source: "Bureau of Labor Statistics",
  },
  {
    id: "rc-2",
    myth: "Grades are the only thing that matters",
    reality:
      "Employers increasingly value skills, experience, and soft skills alongside qualifications.",
    source: "WEF Future of Jobs Report",
  },
  {
    id: "rc-3",
    myth: "All good jobs require a university degree",
    reality:
      "Apprenticeships, vocational training, and certifications lead to well-paying careers in many fields.",
    source: "OECD Employment Outlook",
  },
  {
    id: "rc-4",
    myth: "You should follow your passion blindly",
    reality:
      "Passion often develops from competence. Try things, get good at them, then decide.",
    source: "Cal Newport, So Good They Can't Ignore You",
  },
  {
    id: "rc-5",
    myth: "Networking is only for older professionals",
    reality:
      "Starting connections early, even informally, builds relationships that help throughout your career.",
    source: "LinkedIn Career Research",
  },
  {
    id: "rc-6",
    myth: "Entry-level jobs are beneath you",
    reality:
      "Entry-level roles teach real-world skills that school can't. Everyone starts somewhere.",
    source: "Industry consensus",
  },
];

const AUTO_ROTATE_INTERVAL = 12000; // 12 seconds

interface RealityCheckPanelProps {
  className?: string;
}

export function RealityCheckPanel({ className }: RealityCheckPanelProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

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
    setCurrentIndex((prev) => (prev + 1) % REALITY_CHECKS.length);
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex(
      (prev) => (prev - 1 + REALITY_CHECKS.length) % REALITY_CHECKS.length
    );
  }, []);

  // Auto-rotation
  useEffect(() => {
    if (isPaused || prefersReducedMotion) return;

    const interval = setInterval(goToNext, AUTO_ROTATE_INTERVAL);
    return () => clearInterval(interval);
  }, [isPaused, prefersReducedMotion, goToNext]);

  const currentCheck = REALITY_CHECKS[currentIndex];

  return (
    <Card
      className={`border-2 overflow-hidden ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="h-1 bg-gradient-to-r from-teal-400 via-pink-400 to-teal-400" />

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-900/30">
              <Scale className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            </div>
            Reality Check
          </CardTitle>

          {/* Navigation controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={goToPrev}
              aria-label="Previous reality check"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsPaused(!isPaused)}
              aria-label={isPaused ? "Resume auto-rotation" : "Pause auto-rotation"}
            >
              {isPaused ? (
                <Play className="h-3 w-3" />
              ) : (
                <Pause className="h-3 w-3" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={goToNext}
              aria-label="Next reality check"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Common myths vs what research actually shows
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Myth vs Reality comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Myth */}
          <div className="p-4 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 rounded-full bg-red-200 dark:bg-red-800/50">
                <X className="h-3 w-3 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">
                Myth
              </span>
            </div>
            <p className="text-sm text-red-800 dark:text-red-300 font-medium italic">
              &ldquo;{currentCheck.myth}&rdquo;
            </p>
          </div>

          {/* Reality */}
          <div className="p-4 rounded-lg bg-green-50/50 dark:bg-green-950/20 border border-green-200/50 dark:border-green-800/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 rounded-full bg-green-200 dark:bg-green-800/50">
                <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">
                Reality
              </span>
            </div>
            <p className="text-sm text-green-800 dark:text-green-300 font-medium">
              {currentCheck.reality}
            </p>
          </div>
        </div>

        {/* Source */}
        {currentCheck.source && (
          <p className="text-[10px] text-muted-foreground text-center">
            Source: {currentCheck.source}
          </p>
        )}

        {/* Progress dots */}
        <div
          className="flex items-center justify-center gap-1.5"
          role="tablist"
          aria-label="Reality check navigation"
        >
          {REALITY_CHECKS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              role="tab"
              aria-selected={currentIndex === idx}
              aria-label={`Go to reality check ${idx + 1}`}
              className={`
                h-1.5 rounded-full transition-all duration-200
                ${
                  currentIndex === idx
                    ? "w-4 bg-teal-500"
                    : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }
              `}
            />
          ))}
        </div>

        {/* Status */}
        <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground/60">
          <span>
            {currentIndex + 1} of {REALITY_CHECKS.length}
          </span>
          {!prefersReducedMotion && (
            <>
              <span>•</span>
              <span>{isPaused ? "Paused" : "Auto-rotating"}</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default RealityCheckPanel;
