"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Banknote,
  Check,
  Loader2,
  Star,
  ArrowLeftRight,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Career } from "@/lib/career-pathways";
import type { LocalizedCareerView } from "@/lib/career-localization/types";
import type { CareerGoal } from "@/lib/goals/types";
import { createEmptyGoal } from "@/lib/goals/types";
import { syncGuidanceGoal } from "@/lib/guidance/rules";
import { useCuriositySaves } from "@/hooks/use-curiosity-saves";
import { RealVoices } from "@/components/career-voices/real-voices";
import { CareerDepth } from "@/components/career-depth/career-depth";

interface CareerDetailSheetProps {
  career: Career | LocalizedCareerView | null;
  onClose: () => void;
  /** Localized "not yet tailored to your country" label; shown when the
   *  career view is marked not-localized. Omit for the default (Norway) path. */
  notTailoredLabel?: string;
}

const growthConfig = {
  high: {
    icon: TrendingUp,
    label: "High Growth",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-950",
  },
  medium: {
    icon: Minus,
    label: "Moderate Growth",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-950",
  },
  stable: {
    icon: TrendingDown,
    label: "Stable",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-950",
  },
};

export function CareerDetailSheet({
  career,
  onClose,
  notTailoredLabel,
}: CareerDetailSheetProps) {
  const { data: session, update: refreshSession } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPrimaryGoal, setIsPrimaryGoal] = useState(false);
  // True only right after the user sets this career as their goal — drives the
  // "explore it in My Journey now?" prompt (vs. just closing back to the radar).
  const [justSetGoal, setJustSetGoal] = useState(false);
  const { saveCuriosity, removeCuriosity, isSaved: isCuriositySaved } = useCuriositySaves();

  const isYouth = session?.user?.role === "YOUTH";

  // Always render Dialog - control visibility with open prop
  const isOpen = career !== null;

  // Fetch current goals
  const { data: goalsData } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const response = await fetch("/api/goals");
      if (!response.ok) throw new Error("Failed to fetch goals");
      return response.json();
    },
    enabled: !!session?.user?.id && isYouth,
  });

  const primaryGoal: CareerGoal | null = goalsData?.primaryGoal || null;

  // Reset state when career changes
  useEffect(() => {
    if (career) {
      setIsPrimaryGoal(false);
      setJustSetGoal(false);
    }
  }, [career?.id]);

  // Check if this career is already the career goal
  useEffect(() => {
    if (career && goalsData) {
      setIsPrimaryGoal(primaryGoal?.title === career.title);
    }
  }, [career, goalsData, primaryGoal]);

  // Mutation to set career as the career goal
  const setGoalMutation = useMutation({
    mutationFn: async ({ title }: { title: string }) => {
      const goal = createEmptyGoal(title);
      const putGoal = () =>
        fetch("/api/goals", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slot: "primary", goal }),
        });

      let response = await putGoal();

      // The middleware guardian-consent gate reads ageBracket /
      // guardianConsent from the NextAuth JWT, which is frozen at sign-in
      // and only refreshed on an explicit update(). If an account's age or
      // consent changed AFTER its last login, the stale token can wrongly
      // trip the gate (403 GUARDIAN_CONSENT_REQUIRED) even though the DB
      // would allow the write. On that specific 403, refresh the token from
      // the DB and retry once. A genuinely unconsented 16–17 user still gets
      // blocked on the retry — the gate is preserved, false positives aren't.
      if (response.status === 403) {
        const body = await response.clone().json().catch(() => null);
        if (body?.code === "GUARDIAN_CONSENT_REQUIRED") {
          await refreshSession();
          response = await putGoal();
        }
      }

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const err = new Error(body?.error || "Failed to set goal") as Error & {
          code?: string;
        };
        err.code = body?.code;
        throw err;
      }
      return;
    },
    onSuccess: () => {
      setIsPrimaryGoal(true);
      setJustSetGoal(true);
      toast({
        title: "Set as your career goal!",
        variant: "success",
      });
      // Sync guidance dismissals when the career goal changes
      syncGuidanceGoal(career?.title ?? null);
      // Invalidate all goal-dependent caches so UI reflects the new goal
      queryClient.removeQueries({ queryKey: ["personal-career-timeline"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["career-insights"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["journey-state"] });
      queryClient.invalidateQueries({ queryKey: ["goal-data"] });
      queryClient.invalidateQueries({ queryKey: ["discover-reflections"] });
      queryClient.invalidateQueries({ queryKey: ["education-context"] });
    },
    onError: (error: unknown) => {
      const consentRequired =
        (error as { code?: string })?.code === "GUARDIAN_CONSENT_REQUIRED";
      if (consentRequired) {
        toast({
          title: "Guardian confirmation needed",
          description:
            (error as Error)?.message ||
            "A parent or guardian needs to confirm your account before you can save this. You can keep exploring in the meantime.",
        });
        return;
      }
      toast({
        title: "Failed to set goal",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    },
  });

  const handleSetAsPrimary = () => {
    if (!career || !isYouth) return;
    // Replaces any existing career goal directly. The journey state for the
    // old goal is snapshotted server-side, so this is reversible.
    setGoalMutation.mutate({ title: career.title });
  };

  const goToJourney = () => {
    onClose();
    router.push("/my-journey");
  };

  // Get career details (use defaults if career is null)
  const growth = career ? growthConfig[career.growthOutlook] : growthConfig.medium;
  const GrowthIcon = growth.icon;

  // Show the "Set as your career goal" button unless it already is the goal.
  const showPrimaryButton = !isPrimaryGoal;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden p-0 [&>*]:min-w-0">
          {career && (
            <div className="min-w-0 w-full overflow-x-hidden">
              {/* Header */}
              <DialogHeader className="sticky top-0 bg-background z-10 p-4 pb-3 border-b">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="text-3xl shrink-0">{career.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <DialogTitle className="text-lg leading-tight break-words min-w-0">{career.title}</DialogTitle>
                      {career.entryLevel && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                          Entry Level
                        </Badge>
                      )}
                      {"isLocalized" in career && career.isLocalized === false && notTailoredLabel && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0 text-muted-foreground border-border">
                          {notTailoredLabel}
                        </Badge>
                      )}
                    </div>
                    <DialogDescription className="text-sm text-muted-foreground mt-1 break-words">
                      {career.description}
                    </DialogDescription>
                  </div>
                  <button
                    onClick={() => {
                      if (isCuriositySaved(career.id)) {
                        removeCuriosity(career.id);
                        toast({ title: "Removed from curiosities" });
                      } else {
                        saveCuriosity(career.id, career.title, career.emoji);
                        toast({ title: "Saved to curiosities", description: "Find it in My Journey → Library" });
                      }
                    }}
                    className="p-1.5 rounded-md hover:bg-muted transition-colors flex-shrink-0"
                    title={isCuriositySaved(career.id) ? "Remove from curiosities" : "Save to curiosities"}
                  >
                    {isCuriositySaved(career.id) ? (
                      <BookmarkCheck className="h-5 w-5 text-teal-500" />
                    ) : (
                      <Bookmark className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                </div>


                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2 mt-3 min-w-0">
                  <div className="p-2 rounded-lg border bg-muted/30 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Banknote className="h-3.5 w-3.5 text-green-600 shrink-0" />
                      <span className="text-[10px] font-medium">Salary</span>
                    </div>
                    <p className="text-xs font-semibold leading-snug break-words">{career.avgSalary || "—"}</p>
                  </div>
                  <div className="p-2 rounded-lg border bg-muted/30 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <GrowthIcon className={`h-3.5 w-3.5 ${growth.color} shrink-0`} />
                      <span className="text-[10px] font-medium">Growth</span>
                    </div>
                    <p className={`text-xs font-semibold leading-snug break-words ${growth.color}`}>{growth.label}</p>
                  </div>
                </div>

                {/* Key Skills */}
                {career.keySkills.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles className="h-3 w-3 text-teal-500" />
                      <span className="text-[10px] font-medium text-muted-foreground">Key Skills</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {career.keySkills.slice(0, 4).map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="text-[10px] capitalize bg-teal-500/5 border-teal-500/20"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </DialogHeader>

              <div className="p-4 space-y-5">
                {/* Journey nudge */}
                <div className="rounded-lg border border-teal-500/20 bg-teal-500/5 p-3">
                  <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                    Set this as your career goal to explore it properly
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Your career goal is the career you focus on first. My Journey gives you the full picture \u2014 and you can change it anytime.
                  </p>
                </div>

                {/* Career depth — day-in-life + pay progression snapshot */}
                <CareerDepth career={career} />

                {/* Actions */}
                <div className="space-y-2">
                  {isYouth && (
                    <>
                      {/* Just set → prompt to start exploring in My Journey */}
                      {isPrimaryGoal && justSetGoal ? (
                        <div className="rounded-lg border border-teal-500/30 bg-teal-500/10 p-3 space-y-2.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Check className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                            <span className="text-sm font-medium text-teal-700 dark:text-teal-300">
                              {career.title} is your career goal
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Explore it now in My Journey — Discover, Understand, then build your Clarity.
                          </p>
                          <Button
                            className="w-full bg-teal-600 hover:bg-teal-700"
                            size="sm"
                            onClick={goToJourney}
                          >
                            Go to My Journey
                            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                          </Button>
                        </div>
                      ) : (
                        /* Already the goal (set earlier) — quiet indicator */
                        isPrimaryGoal && (
                          <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
                            <Check className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-700 dark:text-green-400">
                              Your career goal
                            </span>
                          </div>
                        )
                      )}

                      {/* Set as your career goal button */}
                      {showPrimaryButton && (
                        <Button
                          className="w-full bg-teal-600 hover:bg-teal-700"
                          size="sm"
                          onClick={handleSetAsPrimary}
                          disabled={setGoalMutation.isPending}
                        >
                          {setGoalMutation.isPending ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                              Setting...
                            </>
                          ) : (
                            <>
                              <Star className="h-3.5 w-3.5 mr-1.5" />
                              Set as your career goal
                            </>
                          )}
                        </Button>
                      )}

                      {/* Add to compare shortlist — the radar listener shows toast feedback */}
                      <Button
                        variant="outline"
                        className="w-full"
                        size="sm"
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent("add-career-to-compare", { detail: career }));
                        }}
                      >
                        <ArrowLeftRight className="h-3.5 w-3.5 mr-1.5" />
                        Add to compare shortlist
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" className="w-full text-muted-foreground/50" size="sm" onClick={onClose}>
                    {justSetGoal ? "Maybe later" : "Close"}
                  </Button>
                </div>

                {/* Real voices — moderated real-human stories + contributions */}
                <RealVoices career={career} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
