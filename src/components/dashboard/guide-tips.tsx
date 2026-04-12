"use client";

/**
 * Dashboard Guide Tips
 *
 * A small "?" icon that opens a navigable popover walkthrough
 * explaining how to use Endeavrly. Shows once automatically on first
 * visit (dismissed after the user closes or finishes), then stays
 * available as a subtle icon the user can tap any time.
 *
 * Tips are ordered to match the natural flow:
 *   1. Choose your Primary Goal
 *   2. Explore your journey (Discover / Understand / Clarity)
 *   3. Play through your roadmap
 *   4. Sharpen your match (Career Radar)
 *   5. Find real opportunities (Momentum)
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  Compass,
  Route,
  Rocket,
  Radar,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TIPS = [
  {
    icon: Compass,
    color: "text-teal-400",
    title: "Choose your Primary Goal",
    description:
      "Head to Career Radar, find something that sparks your interest, and set it as your Primary Goal \u2014 the career you want to explore properly first. Everything else builds from that choice. You can change it anytime.",
  },
  {
    icon: Route,
    color: "text-blue-400",
    title: "Explore your journey",
    description:
      "My Journey has three tabs you can visit in any order. Discover shows what a day in the role looks like. Understand breaks down education paths and entry requirements. Clarity brings everything together — showing your full journey and timeline.",
  },
  {
    icon: Rocket,
    color: "text-amber-400",
    title: "Play through your roadmap",
    description:
      "In the Clarity tab, hit Play Journey to hear your personalised roadmap narrated step by step — from where you are now to a senior role. It's built around your age and education automatically.",
  },
  {
    icon: Radar,
    color: "text-violet-400",
    title: "Sharpen your match",
    description:
      "Career Radar asks a few quick questions about your interests and work style. Your answers power the Match % on every career so the best fits rise to the top.",
  },
  {
    icon: Search,
    color: "text-emerald-400",
    title: "Find real opportunities",
    description:
      "The Momentum section in Clarity surfaces live jobs, courses, and programmes relevant to your career — plus a personal action list to track your next moves.",
  },
] as const;

const STORAGE_KEY = "dashboard-guide-seen";

export function DashboardGuideTips({
  className,
  hasGoal = false,
}: {
  className?: string;
  /** True when the user already has a primary career goal set. Users
   *  with a goal are not new — the guide should never auto-open. */
  hasGoal?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);

  // Track whether the user has seen the guide before.
  const [hasSeen, setHasSeen] = useState(true); // default true to avoid flash
  useEffect(() => {
    try {
      const seen = window.localStorage.getItem(STORAGE_KEY) === "1";
      setHasSeen(seen);
      // Auto-open ONLY for genuinely new users: no localStorage flag
      // AND no primary goal set (proves they haven't used the app).
      if (!seen && !hasGoal) {
        const t = setTimeout(() => setOpen(true), 1200);
        return () => clearTimeout(t);
      }
      // If the user already has a goal but localStorage was cleared,
      // silently mark as seen so they never get the strong pulse.
      if (!seen && hasGoal) {
        setHasSeen(true);
        window.localStorage.setItem(STORAGE_KEY, "1");
      }
    } catch {
      /* ignore */
    }
  }, [hasGoal]);

  const markSeen = () => {
    setHasSeen(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      markSeen();
      // Reset to first tip so the next open starts fresh.
      setTimeout(() => setCurrentTip(0), 300);
    }
  };

  const handleNext = () => {
    if (currentTip < TIPS.length - 1) {
      setCurrentTip(currentTip + 1);
    } else {
      // Finished the tour
      setOpen(false);
      markSeen();
      setTimeout(() => setCurrentTip(0), 300);
    }
  };

  const handlePrev = () => {
    if (currentTip > 0) setCurrentTip(currentTip - 1);
  };

  const tip = TIPS[currentTip];
  const TipIcon = tip.icon;
  const isFirst = currentTip === 0;
  const isLast = currentTip === TIPS.length - 1;

  return (
    <Popover open={open} onOpenChange={handleClose}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "relative inline-flex items-center justify-center rounded-full transition-all",
            "h-8 w-8",
            // Unseen state: teal-tinted, strong pulsing ring to draw
            // attention on first login. After seen, a faint subtle
            // pulse reminds the user guidance is still available.
            !hasSeen && !open
              ? "border-2 border-teal-400/70 bg-teal-500/15 text-teal-300 shadow-[0_0_12px_rgba(20,184,166,0.35)]"
              : "border border-border/40 bg-background/60 text-muted-foreground/60 hover:bg-muted/40 hover:text-foreground",
            open && "bg-teal-500/10 border-teal-500/40 text-teal-400",
            className,
          )}
          aria-label="How to use Endeavrly"
          title="How to use Endeavrly"
        >
          {/* Animated pulse ring — strong ping when unseen (first login),
              faint slow pulse after seen so the user remembers it's there. */}
          {!hasSeen && !open && (
            <span className="absolute inset-0 rounded-full border-2 border-teal-400/60 motion-safe:animate-ping" />
          )}
          {hasSeen && !open && (
            <span className="absolute inset-0 rounded-full border border-teal-400/20 motion-safe:animate-pulse" />
          )}
          <HelpCircle className={cn("h-4 w-4", !hasSeen && "drop-shadow-[0_0_4px_rgba(20,184,166,0.5)]")} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[300px] p-0 shadow-lg border-border/60"
        side="bottom"
        sideOffset={8}
        align="end"
      >
        {/* Tip body */}
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-2.5">
            <div
              className={cn(
                "shrink-0 rounded-lg p-1.5 bg-muted/30",
                tip.color,
              )}
            >
              <TipIcon className="h-4 w-4" />
            </div>
            <div className="space-y-1 min-w-0">
              <p className="text-[13px] font-semibold leading-tight">
                {tip.title}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {tip.description}
              </p>
            </div>
          </div>
        </div>

        {/* Footer: step counter + nav */}
        <div className="flex items-center justify-between border-t border-border/40 px-4 py-2.5 bg-muted/10">
          {/* Step dots */}
          <div className="flex items-center gap-1">
            {TIPS.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1 rounded-full transition-all duration-200",
                  i === currentTip
                    ? "w-3 bg-teal-500"
                    : i < currentTip
                      ? "w-1 bg-teal-500/40"
                      : "w-1 bg-muted-foreground/25",
                )}
              />
            ))}
            <span className="text-[10px] text-muted-foreground/60 ml-1.5">
              {currentTip + 1}/{TIPS.length}
            </span>
          </div>

          {/* Nav buttons */}
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={handlePrev}
              disabled={isFirst}
              aria-label="Previous tip"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant={isLast ? "default" : "ghost"}
              className={cn("h-6", isLast ? "w-auto px-2 text-[11px]" : "w-6")}
              onClick={handleNext}
              aria-label={isLast ? "Finish tour" : "Next tip"}
            >
              {isLast ? (
                "Got it"
              ) : (
                <ArrowRight className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
