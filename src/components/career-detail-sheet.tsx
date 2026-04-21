"use client";

import { useState, useEffect } from "react";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Banknote,
  Target,
  Check,
  Loader2,
  Star,
  ArrowLeftRight,
  Bookmark,
  BookmarkCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import type { Career } from "@/lib/career-pathways";
import { getAllCareers as getAllCareersForCluster } from "@/lib/career-pathways";
import type { CareerGoal, GoalSlot } from "@/lib/goals/types";
import { CareerClusterMap } from "@/components/discovery/career-cluster-map";
import { createEmptyGoal } from "@/lib/goals/types";
import { syncGuidanceGoal } from "@/lib/guidance/rules";
import { useCuriositySaves } from "@/hooks/use-curiosity-saves";

interface CareerDetailSheetProps {
  career: Career | null;
  onClose: () => void;
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

// Swap Modal Component
function SwapGoalModal({
  open,
  onClose,
  careerTitle,
  primaryGoal,
  secondaryGoal,
  onSwap,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  careerTitle: string;
  primaryGoal: CareerGoal | null;
  secondaryGoal: CareerGoal | null;
  onSwap: (slot: GoalSlot) => void;
  isPending: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-teal-500" />
            Replace a Goal
          </DialogTitle>
          <DialogDescription>
            Both goal slots are full. Choose which goal to replace with "{careerTitle}".
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {primaryGoal && (
            <button
              onClick={() => onSwap("primary")}
              disabled={isPending}
              className="w-full p-3 rounded-lg border-2 border-teal-200 dark:border-teal-800 hover:border-teal-400 dark:hover:border-teal-600 transition-colors text-left group"
            >
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4 text-teal-500 fill-teal-500" />
                <span className="text-xs font-medium text-muted-foreground">
                  Replace Primary Goal
                </span>
              </div>
              <p className="font-medium group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                {primaryGoal.title}
              </p>
            </button>
          )}

          {secondaryGoal && (
            <button
              onClick={() => onSwap("secondary")}
              disabled={isPending}
              className="w-full p-3 rounded-lg border hover:border-slate-400 dark:hover:border-slate-600 transition-colors text-left group"
            >
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-slate-500" />
                <span className="text-xs font-medium text-muted-foreground">
                  Replace Secondary Goal
                </span>
              </div>
              <p className="font-medium group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors">
                {secondaryGoal.title}
              </p>
            </button>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CareerDetailSheet({
  career,
  onClose,
}: CareerDetailSheetProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [addedAs, setAddedAs] = useState<GoalSlot | null>(null);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [savingSlot, setSavingSlot] = useState<GoalSlot | null>(null);
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
  const secondaryGoal: CareerGoal | null = goalsData?.secondaryGoal || null;

  // Reset state when career changes
  useEffect(() => {
    if (career) {
      setAddedAs(null);
      setShowSwapModal(false);
    }
  }, [career?.id]);

  // Check if career is already a goal
  useEffect(() => {
    if (career && goalsData) {
      if (primaryGoal?.title === career.title) {
        setAddedAs("primary");
      } else if (secondaryGoal?.title === career.title) {
        setAddedAs("secondary");
      }
    }
  }, [career, goalsData, primaryGoal, secondaryGoal]);

  // Mutation to set career as goal
  const setGoalMutation = useMutation({
    mutationFn: async ({ slot, title }: { slot: GoalSlot; title: string }) => {
      const goal = createEmptyGoal(title);
      const response = await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot, goal }),
      });
      if (!response.ok) throw new Error("Failed to set goal");
      return { slot };
    },
    onSuccess: ({ slot }) => {
      setAddedAs(slot);
      setShowSwapModal(false);
      toast.success(
        slot === "primary" ? "Set as Primary Goal!" : "Set as Secondary Goal!",
        { description: "View and customise your goals on the Goals page." }
      );
      // Sync guidance dismissals when primary goal changes
      if (slot === "primary") {
        const title = career?.title ?? null;
        syncGuidanceGoal(title);
      }
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
    onError: () => {
      toast.error("Failed to set goal", {
        description: "Please try again later.",
      });
    },
  });

  const handleSetAsPrimary = () => {
    if (!career || !isYouth) return;

    // If both slots are full, show swap modal
    if (primaryGoal && secondaryGoal) {
      setShowSwapModal(true);
      return;
    }

    setSavingSlot("primary");
    setGoalMutation.mutate({ slot: "primary", title: career.title });
  };

  const handleSetAsSecondary = () => {
    if (!career || !isYouth) return;

    // If both slots are full, show swap modal
    if (primaryGoal && secondaryGoal) {
      setShowSwapModal(true);
      return;
    }

    setSavingSlot("secondary");
    setGoalMutation.mutate({ slot: "secondary", title: career.title });
  };

  const handleSwap = (slot: GoalSlot) => {
    if (!career) return;
    setSavingSlot(slot);
    setGoalMutation.mutate({ slot, title: career.title });
  };

  // Get career details (use defaults if career is null)
  const growth = career ? growthConfig[career.growthOutlook] : growthConfig.medium;
  const GrowthIcon = growth.icon;

  // Determine which buttons to show
  const showPrimaryButton = !addedAs;
  const showSecondaryButton = !addedAs && primaryGoal !== null;

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
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 break-words">
                      {career.description}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (isCuriositySaved(career.id)) {
                        removeCuriosity(career.id);
                        toast("Removed from curiosities");
                      } else {
                        saveCuriosity(career.id, career.title, career.emoji);
                        toast("Saved to curiosities", { description: "Find it in My Journey → Library" });
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
                    <p className="text-xs font-semibold leading-snug break-words">{career.avgSalary}</p>
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
                    Set this as your Primary Goal to explore it properly
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Your Primary Goal is the career you focus on first. My Journey gives you the full picture \u2014 and you can change it anytime.
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  {isYouth && (
                    <>
                      {/* Already added indicator */}
                      {addedAs && (
                        <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-700 dark:text-green-400">
                            Added as {addedAs === "primary" ? "Primary" : "Secondary"} Goal
                          </span>
                        </div>
                      )}

                      {/* Set as Primary Goal button */}
                      {showPrimaryButton && (
                        <Button
                          className="w-full bg-teal-600 hover:bg-teal-700"
                          size="sm"
                          onClick={handleSetAsPrimary}
                          disabled={setGoalMutation.isPending}
                        >
                          {setGoalMutation.isPending && savingSlot === "primary" ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                              Setting...
                            </>
                          ) : (
                            <>
                              <Star className="h-3.5 w-3.5 mr-1.5" />
                              Set as Primary Goal
                            </>
                          )}
                        </Button>
                      )}

                      {/* Set as Secondary Goal button */}
                      {showSecondaryButton && (
                        <Button
                          variant="outline"
                          className="w-full"
                          size="sm"
                          onClick={handleSetAsSecondary}
                          disabled={setGoalMutation.isPending}
                        >
                          {setGoalMutation.isPending && savingSlot === "secondary" ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                              Setting...
                            </>
                          ) : (
                            <>
                              <Target className="h-3.5 w-3.5 mr-1.5" />
                              Set as Secondary Goal
                            </>
                          )}
                        </Button>
                      )}

                      {/* ── Related Careers (cluster map) ──────── */}
                      <div className="border-t border-border/30 pt-4 -mx-1">
                        <CareerClusterMap
                          careerId={career.id}
                          limit={6}
                          onSelectCareer={(id) => {
                            // Look up the full career object and open it
                            // in this same detail sheet via the existing
                            // CustomEvent the radar page listens for.
                            const found = getAllCareersForCluster().find((c) => c.id === id);
                            if (found) {
                              window.dispatchEvent(new CustomEvent("open-career-detail", { detail: found }));
                            }
                          }}
                        />
                      </div>

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
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Swap Modal */}
      {career && (
        <SwapGoalModal
          open={showSwapModal}
          onClose={() => setShowSwapModal(false)}
          careerTitle={career.title}
          primaryGoal={primaryGoal}
          secondaryGoal={secondaryGoal}
          onSwap={handleSwap}
          isPending={setGoalMutation.isPending}
        />
      )}
    </>
  );
}
