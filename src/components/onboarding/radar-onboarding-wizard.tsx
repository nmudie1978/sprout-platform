"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { DiscoveryPreferences } from "@/lib/career-pathways";

/**
 * Radar Onboarding Wizard
 * -----------------------
 * Four questions, ~90 seconds. Replaces the old priorities/availability wizard
 * with something that actually feeds the Career Radar — the feature most
 * likely to make a brand-new user understand what the app is for.
 *
 * Mirrors the four inputs of the deep quiz at /profile
 * (discovery-quiz-dialog.tsx), in the same order, so the two surfaces ask the
 * same things and a user who later opens the deep quiz recognises it:
 *
 * Q1: Subjects you enjoy (multi, max 3)
 * Q2: Things you enjoy — out-of-school activities (multi)
 * Q3: How you like to work (multi — most people are a mix of these)
 * Q4: With people, or on your own (single — it's one spectrum)
 *
 * Auto-advances on the single-select question for momentum. Multi-select
 * questions show a "Continue" button to let the user add more if they want.
 * Skip is allowed but quietly placed at the bottom (link, not button).
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

// Out-of-school activities. The deep quiz has 19; this is the onboarding
// subset, spread across the interest→category map so every broad area of the
// catalogue is reachable from one chip.
const INTERESTS = [
  { id: "coding", label: "Coding", emoji: "💻" },
  { id: "gaming", label: "Gaming", emoji: "🎮" },
  { id: "fixing-things", label: "Fixing things", emoji: "🔧" },
  { id: "building", label: "Building things", emoji: "🏗️" },
  { id: "adventure", label: "Adventure / outdoors", emoji: "⛰️" },
  { id: "animals", label: "Animals", emoji: "🐾" },
  { id: "drawing", label: "Drawing / art", emoji: "🎨" },
  { id: "music-making", label: "Making music", emoji: "🎵" },
  { id: "sport-fitness", label: "Sport / fitness", emoji: "⚽" },
  { id: "helping-people", label: "Helping people", emoji: "❤️" },
  { id: "money-business", label: "Business / money", emoji: "💰" },
  { id: "photo-film", label: "Photography / film", emoji: "📸" },
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

type Step = 1 | 2 | 3 | 4;

export function RadarOnboardingWizard({ open, onComplete }: RadarOnboardingWizardProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>(1);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [workStyles, setWorkStyles] = useState<string[]>([]);
  const [peoplePref, setPeoplePref] = useState<string | null>(null);

  const toggleSubject = (id: string) => {
    setSubjects((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= MAX_SUBJECTS) return prev; // cap at 3
      return [...prev, id];
    });
  };

  const toggleInterest = (id: string) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleWorkStyle = (id: string) => {
    setWorkStyles((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  };

  // ── Save mutation ──────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async () => {
      const prefs: DiscoveryPreferences = {
        subjects,
        interests,
        workStyles,
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
      // The dashboard reads its own copy of the profile under a separate
      // query key — invalidate that too so the "Find your matches" card
      // flips to "We found career matches for you" immediately instead of
      // waiting for the 5-min stale window to expire.
      queryClient.invalidateQueries({ queryKey: ["profile-completion"] });
      // Just close the wizard. The user lands back on the dashboard, where
      // the first-action card and "Suggested for you" cards take over and
      // guide them toward the radar at their own pace.
      onComplete();
    },
    onError: () => {
      toast({ title: "Couldn't save — please try again.", variant: "destructive" });
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

  // Auto-advance for the single-select question
  const handlePeoplePref = (id: string) => {
    setPeoplePref(id);
    setTimeout(() => saveMutation.mutate(), 250);
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      {/* overflow-y-auto (not hidden) so the taller question steps stay
          reachable on short screens — the base DialogContent already caps
          height at 85dvh. */}
      <DialogContent className="max-w-md p-0 overflow-y-auto border-0 shadow-2xl">
        {/* Header — calm, no distracting gradient */}
        <div className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-teal-500" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-500">
              Step {step} of 4
            </span>
          </div>
          {/* Progress bar */}
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4].map((n) => (
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
                            ? "border-border text-muted-foreground/65 cursor-not-allowed"
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
                  What do you enjoy doing?
                </h2>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Outside of school. Pick any that fit.
                </p>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((i) => {
                    const selected = interests.includes(i.id);
                    return (
                      <button
                        key={i.id}
                        type="button"
                        onClick={() => toggleInterest(i.id)}
                        aria-pressed={selected}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium border-2 transition-all",
                          selected
                            ? "bg-teal-500 border-teal-500 text-white scale-[1.03]"
                            : "border-border hover:border-teal-500/50 hover:bg-teal-500/5"
                        )}
                      >
                        <span aria-hidden>{i.emoji}</span>
                        {i.label}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-6 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
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
                  <Button
                    onClick={() => setStep(3)}
                    disabled={interests.length === 0}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
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
                  How do you like to work?
                </h2>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Pick as many as fit &mdash; most people are a mix.
                </p>
                <div className="flex flex-col gap-2">
                  {WORK_STYLES.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => toggleWorkStyle(w.id)}
                      aria-pressed={workStyles.includes(w.id)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all",
                        workStyles.includes(w.id)
                          ? "border-teal-500 bg-teal-500/10"
                          : "border-border hover:border-teal-500/50 hover:bg-teal-500/5"
                      )}
                    >
                      <span className="text-xl">{w.emoji}</span>
                      <span className="text-sm font-medium">{w.label}</span>
                      {workStyles.includes(w.id) && (
                        <Check className="h-4 w-4 ml-auto text-teal-500" strokeWidth={3} />
                      )}
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
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
                  <Button
                    onClick={() => setStep(4)}
                    disabled={workStyles.length === 0}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="s4"
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
                    onClick={() => setStep(3)}
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
