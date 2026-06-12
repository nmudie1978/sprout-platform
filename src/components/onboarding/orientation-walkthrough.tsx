"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Volume2,
  VolumeX,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWalkthroughNarration } from "@/hooks/use-walkthrough-narration";
import { STEPS } from "@/components/onboarding/tour-steps";
import { TourSpotlight } from "@/components/onboarding/tour-spotlight";

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

  // The sidebar destination this step describes (intro/CTA steps have none).
  const targetHref = current.target ?? null;

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
    <>
      {/* Spotlight the sidebar item this step describes. Renders its own dim
          (via a box-shadow hole, so the highlighted item stays un-blurred),
          which is why the Dialog's own overlay is made transparent below. */}
      <TourSpotlight targetHref={targetHref} active={open} />

      <Dialog open={open} onOpenChange={(v) => { if (!v) skip(); }}>
        <DialogContent
          overlayClassName="bg-transparent dark:bg-transparent backdrop-blur-none"
          className="themed-walkthrough sm:max-w-md p-0 gap-0 border-border/50 bg-card overflow-hidden text-white dark:text-card-foreground"
        >
          {/* Accessible title/description for screen readers — the visible
              heading swaps per step inside AnimatePresence, so we keep a stable
              hidden DialogTitle to satisfy Radix's accessibility requirement. */}
          <DialogTitle className="sr-only">Welcome to Endeavrly</DialogTitle>
          <DialogDescription className="sr-only">
            A short guided tour of how Endeavrly helps you explore careers.
          </DialogDescription>

          {/* Progress bar */}
          <div className="h-1 bg-white/20 dark:bg-muted/30 relative">
            <div
              className="h-full bg-teal-400 dark:bg-teal-500/60 transition-all duration-300"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
            {/* Narration progress — thin overlay showing audio position */}
            {narration.isPlaying && (
              <div
                className="absolute bottom-0 left-0 h-full bg-teal-300/40 dark:bg-teal-400/30 transition-all duration-200"
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
                <h2 className="text-lg font-semibold tracking-tight mb-2 text-white dark:text-foreground">
                  {current.title}
                </h2>

                {/* Body */}
                <p className="text-sm text-white/85 dark:text-muted-foreground/80 leading-relaxed">
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
                    ? "text-white/50 hover:text-white/80 dark:text-muted-foreground/65 dark:hover:text-muted-foreground/70"
                    : "text-teal-300 hover:text-teal-200 dark:text-teal-500 dark:hover:text-teal-400"
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
                        ? "w-4 bg-teal-300 dark:bg-teal-500"
                        : i < step
                        ? "w-1.5 bg-teal-300/60 dark:bg-teal-500/40"
                        : "w-1.5 bg-white/25 dark:bg-muted-foreground/20"
                    )}
                  />
                ))}
              </div>
              {!isLast && (
                <button
                  type="button"
                  onClick={skip}
                  className="text-[11px] text-white/60 hover:text-white dark:text-muted-foreground/70 dark:hover:text-muted-foreground transition-colors"
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
                  className="h-8 px-2.5 text-xs text-white/85 hover:text-white hover:bg-white/10 dark:text-inherit dark:hover:bg-accent"
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
                    Find your career goal
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
    </>
  );
}
