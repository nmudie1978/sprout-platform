"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  LayoutDashboard,
  Route,
  Briefcase,
  BarChart3,
  Compass,
  ArrowRight,
  ArrowLeft,
  Volume2,
  VolumeX,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { useWalkthroughNarration } from "@/hooks/use-walkthrough-narration";

// ── Step data ──────────────────────────────────────────────────────

interface WalkthroughStep {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  title: string;
  body: string;
}

const STEPS: WalkthroughStep[] = [
  {
    icon: Sparkles,
    iconColor: "text-teal-500",
    iconBg: "bg-teal-500/10",
    title: "Let me show you around",
    body: "Endeavrly helps you explore careers properly \u2014 step by step. Here\u2019s how the platform works.",
  },
  {
    icon: Compass,
    iconColor: "text-pink-500",
    iconBg: "bg-pink-500/10",
    title: "Career Radar",
    body: "This is where you explore careers and choose your Primary Goal \u2014 the one career you want to focus on first. Tell it what you enjoy and it maps careers across every path, including ones you\u2019ve never heard of.",
  },
  {
    icon: LayoutDashboard,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
    title: "Dashboard",
    body: "Your home area. See your current chosen career, saved journeys, saved content, and pick up where you left off.",
  },
  {
    icon: Route,
    iconColor: "text-violet-500",
    iconBg: "bg-violet-500/10",
    title: "My Journey",
    body: "Once you\u2019ve set a Primary Goal, this is where you explore it properly. Three phases \u2014 Discover, Understand, and Clarity \u2014 help you figure out if it\u2019s right for you.",
  },
  {
    icon: Briefcase,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/10",
    title: "Small Jobs",
    body: "An optional area for local small jobs. A way to build independence and get light real-world experience.",
  },
  {
    icon: BarChart3,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
    title: "Industry Insights",
    body: "Understand what\u2019s happening across different industries \u2014 career demand, pay, and broader trends that affect your choices.",
  },
  {
    icon: Compass,
    iconColor: "text-teal-500",
    iconBg: "bg-teal-500/10",
    title: "Choose your first Primary Goal",
    body: "Head to Career Radar, explore what\u2019s out there, and set one career as your Primary Goal. That\u2019s your starting point \u2014 you can always change it later.",
  },
];

// ── Component ──────────────────────────────────────────────────────

interface OrientationWalkthroughProps {
  open: boolean;
  onComplete: () => void;
}

export function OrientationWalkthrough({
  open,
  onComplete,
}: OrientationWalkthroughProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back

  // Narration — auto-plays each step's body text via TTS
  const stepContents = useMemo(
    () => STEPS.map((s) => ({ title: s.title, body: s.body })),
    [],
  );
  const [narration, narrationControls] = useWalkthroughNarration(stepContents, step);

  const current = STEPS[step];
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;

  const next = useCallback(() => {
    if (isLast) {
      onComplete();
      // Reset for potential replay
      setTimeout(() => setStep(0), 300);
      return;
    }
    setDirection(1);
    setStep((s) => s + 1);
  }, [isLast, onComplete]);

  const back = useCallback(() => {
    if (isFirst) return;
    setDirection(-1);
    setStep((s) => s - 1);
  }, [isFirst]);

  const skip = useCallback(() => {
    onComplete();
    setTimeout(() => setStep(0), 300);
  }, [onComplete]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) skip(); }}>
      <DialogContent
        className="sm:max-w-md p-0 gap-0 border-border/50 bg-card overflow-hidden"
      >
        {/* Progress bar */}
        <div className="h-1 bg-muted/30 relative">
          <div
            className="h-full bg-teal-500/60 transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
          {/* Narration progress — thin overlay showing audio position */}
          {narration.isPlaying && (
            <div
              className="absolute bottom-0 left-0 h-full bg-teal-400/30 transition-all duration-200"
              style={{
                width: `${((step + narration.progress) / STEPS.length) * 100}%`,
              }}
            />
          )}
        </div>

        {/* Step content */}
        <div className="px-6 pt-6 pb-2 min-h-[220px] flex flex-col">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: direction * 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -30 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex-1"
            >
              {/* Icon */}
              <div
                className={cn(
                  "inline-flex items-center justify-center h-11 w-11 rounded-xl mb-4",
                  current.iconBg
                )}
              >
                <current.icon className={cn("h-5 w-5", current.iconColor)} />
              </div>

              {/* Title */}
              <h2 className="text-lg font-semibold tracking-tight mb-2">
                {current.title}
              </h2>

              {/* Body */}
              <p className="text-sm text-muted-foreground/80 leading-relaxed">
                {current.body}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 pb-5 pt-3">
          {/* Left: narration toggle + step indicator + skip */}
          <div className="flex items-center gap-3">
            {/* Narration toggle */}
            <button
              type="button"
              onClick={narrationControls.toggleMute}
              className={cn(
                "relative p-1 rounded-md transition-colors",
                narration.isMuted
                  ? "text-muted-foreground/40 hover:text-muted-foreground/70"
                  : "text-teal-500 hover:text-teal-400"
              )}
              title={narration.isMuted ? "Turn on narration" : "Mute narration"}
              aria-label={narration.isMuted ? "Turn on narration" : "Mute narration"}
            >
              {narration.isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : narration.isMuted ? (
                <VolumeX className="h-3.5 w-3.5" />
              ) : (
                <Volume2 className="h-3.5 w-3.5" />
              )}
            </button>

            <div className="flex items-center gap-1">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1 rounded-full transition-all duration-200",
                    i === step
                      ? "w-4 bg-teal-500"
                      : i < step
                      ? "w-1.5 bg-teal-500/40"
                      : "w-1.5 bg-muted-foreground/20"
                  )}
                />
              ))}
            </div>
            {!isLast && (
              <button
                type="button"
                onClick={skip}
                className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              >
                Skip
              </button>
            )}
          </div>

          {/* Right: nav buttons */}
          <div className="flex items-center gap-2">
            {!isFirst && (
              <Button
                variant="ghost"
                size="sm"
                onClick={back}
                className="h-8 px-2.5 text-xs"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Back
              </Button>
            )}
            <Button
              size="sm"
              onClick={next}
              className="h-8 px-4 text-xs bg-teal-600 hover:bg-teal-700"
            >
              {isLast ? (
                <>
                  Find your Primary Goal
                  <Sparkles className="h-3.5 w-3.5 ml-1.5" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
