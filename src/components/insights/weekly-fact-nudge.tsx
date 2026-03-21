/**
 * WEEKLY "DID YOU KNOW?" MOBILE NUDGE
 *
 * Shows a weekly fact popup for mobile users.
 * Features:
 * - Only shows once per week
 * - Only on mobile viewports
 * - Uses localStorage to track last shown date
 * - Non-intrusive toast/modal design
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DidYouKnowCard } from "./did-you-know-card";

const STORAGE_KEY = "weeklyFactNudge_lastShownAt";
const DAYS_BETWEEN_NUDGES = 7;
const MOBILE_BREAKPOINT = 768; // px

interface WeeklyFactNudgeProps {
  /** Override the days between nudges (for testing) */
  daysBetween?: number;
  /** Called when nudge is shown */
  onShow?: () => void;
  /** Called when nudge is dismissed */
  onDismiss?: () => void;
}

/**
 * Check if we should show the nudge based on last shown date.
 */
function shouldShowNudge(daysBetween: number): boolean {
  if (typeof window === "undefined") return false;

  const lastShown = localStorage.getItem(STORAGE_KEY);
  if (!lastShown) return true;

  const lastDate = new Date(lastShown);
  const now = new Date();
  const daysSince = Math.floor(
    (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysSince >= daysBetween;
}

/**
 * Check if viewport is mobile-sized.
 */
function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < MOBILE_BREAKPOINT;
}

export function WeeklyFactNudge({
  daysBetween = DAYS_BETWEEN_NUDGES,
  onShow,
  onDismiss,
}: WeeklyFactNudgeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check conditions on mount
  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    // Check if mobile
    const checkMobile = () => setIsMobile(isMobileViewport());
    checkMobile();

    // Listen for resize
    window.addEventListener("resize", checkMobile);

    // Check if we should show the nudge
    if (isMobileViewport() && shouldShowNudge(daysBetween)) {
      // Small delay to not interrupt initial page load
      const timeout = setTimeout(() => {
        setIsVisible(true);
        onShow?.();
      }, 2000);

      return () => {
        clearTimeout(timeout);
        window.removeEventListener("resize", checkMobile);
      };
    }

    return () => window.removeEventListener("resize", checkMobile);
  }, [daysBetween, onShow]);

  // Mark as shown and dismiss
  const handleDismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    setIsVisible(false);
    onDismiss?.();
  }, [onDismiss]);

  // Don't render on non-mobile
  if (!isMobile) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe"
          >
            <div className="relative bg-background rounded-t-2xl shadow-2xl overflow-hidden max-w-md mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-4 pb-2 border-b">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30">
                    <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-sm font-medium">Weekly Insight</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>

              {/* Content */}
              <div className="p-4">
                <DidYouKnowCard compact />
              </div>

              {/* Footer */}
              <div className="px-4 pb-4 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDismiss}
                  className="w-full"
                >
                  Got it
                </Button>
                <p className="text-[10px] text-center text-muted-foreground mt-2">
                  You'll see another fact next week
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook to check if there's a new weekly fact available.
 * Can be used to show a badge indicator.
 */
export function useWeeklyFactAvailable(daysBetween = DAYS_BETWEEN_NUDGES): boolean {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setAvailable(shouldShowNudge(daysBetween));
  }, [daysBetween]);

  return available;
}

export default WeeklyFactNudge;
