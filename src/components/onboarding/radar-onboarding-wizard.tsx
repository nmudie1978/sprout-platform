"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { DiscoveryPreferences } from "@/lib/career-pathways";

/**
 * Radar Onboarding Wizard
 * -----------------------
 * Three questions, ~60 seconds. Replaces the old 4-step priorities/availability
 * wizard with something that actually feeds the Career Radar — the feature most
 * likely to make a brand-new user understand what the app is for.
 *
 * Q1: Subjects you enjoy (multi, max 3)
 * Q2: How you like to work (single)
 * Q3: With people, or on your own (single)
 *
 * Auto-advances on single-select questions for momentum. Multi-select shows
 * a "Continue" button to let the user add more if they want. Skip is allowed
 * but quietly placed at the bottom (link, not button).
 */

interface RadarOnboardingWizardProps {
  open: boolean;
  onComplete: () => void;
}

// 10 highest-leverage subjects for radar coverage. Kept short on purpose —
// the deep quiz at /profile has 19 subjects; this is the onboarding subset.
const SUBJECTS = [
  { id: "biology", label: "Biology" },
  { id: "math", label: "Math" },
  { id: "computing", label: "Computing" },
  { id: "english", label: "English" },
  { id: "art", label: "Art" },
  { id: "business", label: "Business" },
  { id: "languages", label: "Languages" },
  { id: "pe", label: "PE / Sport" },
  { id: "design-tech", label: "Design & Tech" },
  { id: "health-social", label: "Health & Social" },
] as const;

const WORK_STYLES = [
  { id: "hands-on", label: "Hands-on", emoji: "🛠️" },
  { id: "desk", label: "At a desk", emoji: "💻" },
  { id: "outdoors", label: "Outdoors", emoji: "🌲" },
  { id: "creative", label: "Creative", emoji: "🎨" },
  { id: "mixed", label: "A mix", emoji: "🔀" },
] as const;

const PEOPLE_PREFS = [
  { id: "with-people", label: "With people" },
  { id: "mixed", label: "A bit of both" },
  { id: "mostly-alone", label: "Mostly on my own" },
] as const;

const MAX_SUBJECTS = 3;

type Step = 1 | 2 | 3;

export function RadarOnboardingWizard({ open, onComplete }: RadarOnboardingWizardProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>(1);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [workStyle, setWorkStyle] = useState<string | null>(null);
  const [peoplePref, setPeoplePref] = useState<string | null>(null);

  const toggleSubject = (id: string) => {
    setSubjects((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= MAX_SUBJECTS) return prev; // cap at 3
      return [...prev, id];
    });
  };

  // ── Save mutation ──────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async () => {
      const prefs: DiscoveryPreferences = {
        subjects,
        workStyles: workStyle ? [workStyle] : [],
        peoplePref: peoplePref || undefined,
      };

      // Save discovery preferences (drives the Career Radar)
      const discoveryRes = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discoveryPreferences: prefs }),
      });
      if (!discoveryRes.ok) throw new Error("Failed to save preferences");

      // Mark onboarding as complete
      const onboardingRes = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Default the legacy fields to sensible values so the existing
          // dashboard checks still work without showing the old wizard.
          currentPriorities: ["explore"],
          availabilityLevel: "some",
        }),
      });
      if (!onboardingRes.ok) throw new Error("Failed to complete onboarding");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding-status"] });
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      // Just close the wizard. The user lands back on the dashboard, where
      // the first-action card and "Suggested for you" cards take over and
      // guide them toward the radar at their own pace.
      onComplete();
    },
    onError: () => {
      toast.error("Couldn't save — please try again.");
    },
  });

  const handleSkip = async () => {
    // Skip just marks onboarding complete with no preferences. The user
    // lands on a dashboard with an empty radar prompting them to fill in
    // discovery preferences later.
    try {
      await fetch("/api/onboarding", { method: "PATCH" });
      queryClient.invalidateQueries({ queryKey: ["onboarding-status"] });
      onComplete();
    } catch {
      onComplete();
    }
  };

  // Auto-advance for single-select questions
  const handleWorkStyle = (id: string) => {
    setWorkStyle(id);
    setTimeout(() => setStep(3), 250);
  };
  const handlePeoplePref = (id: string) => {
    setPeoplePref(id);
    setTimeout(() => saveMutation.mutate(), 250);
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-0 shadow-2xl">
        {/* Header — calm, no distracting gradient */}
        <div className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-teal-500" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-500">
              Step {step} of 3
            </span>
          </div>
          {/* Progress bar */}
          <div className="flex gap-1 mt-2">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  n <= step ? "bg-teal-500" : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="p-6 min-h-[320px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="s1"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-xl font-bold tracking-tight">
                  What subjects do you actually enjoy?
                </h2>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Pick up to {MAX_SUBJECTS}. There&rsquo;s no wrong answer.
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map((s) => {
                    const selected = subjects.includes(s.id);
                    const disabled = !selected && subjects.length >= MAX_SUBJECTS;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleSubject(s.id)}
                        disabled={disabled}
                        className={cn(
                          "px-3 py-2 rounded-full text-sm font-medium border-2 transition-all",
                          selected
                            ? "bg-teal-500 border-teal-500 text-white scale-[1.03]"
                            : disabled
                            ? "border-border text-muted-foreground/40 cursor-not-allowed"
                            : "border-border hover:border-teal-500/50 hover:bg-teal-500/5"
                        )}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Skip for now
                  </button>
                  <Button
                    onClick={() => setStep(2)}
                    disabled={subjects.length === 0}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="s2"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-xl font-bold tracking-tight">
                  How do you like to work?
                </h2>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Pick the one that fits best.
                </p>
                <div className="flex flex-col gap-2">
                  {WORK_STYLES.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => handleWorkStyle(w.id)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all",
                        workStyle === w.id
                          ? "border-teal-500 bg-teal-500/10"
                          : "border-border hover:border-teal-500/50 hover:bg-teal-500/5"
                      )}
                    >
                      <span className="text-xl">{w.emoji}</span>
                      <span className="text-sm font-medium">{w.label}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Skip for now
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="s3"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-xl font-bold tracking-tight">
                  With people, or on your own?
                </h2>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Last one.
                </p>
                <div className="flex flex-col gap-2">
                  {PEOPLE_PREFS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handlePeoplePref(p.id)}
                      disabled={saveMutation.isPending}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all",
                        peoplePref === p.id
                          ? "border-teal-500 bg-teal-500/10"
                          : "border-border hover:border-teal-500/50 hover:bg-teal-500/5",
                        saveMutation.isPending && "opacity-50"
                      )}
                    >
                      <span className="text-sm font-medium">{p.label}</span>
                    </button>
                  ))}
                </div>
                {saveMutation.isPending && (
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Building your radar&hellip;
                  </div>
                )}
                <div className="mt-6 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Skip for now
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
