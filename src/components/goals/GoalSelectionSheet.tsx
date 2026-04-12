"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, Target, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MobileSheet, MobileSheetFooter } from "@/components/mobile/MobileSheet";
import { ConfirmDialog, ConfirmDialogChoice } from "@/components/mobile/ConfirmDialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { searchCareers, getAllCareers, type Career } from "@/lib/career-pathways";
import { ArrowUp } from "lucide-react";
import { createGoalWithMilestones, type GoalSlot, type CareerGoal } from "@/lib/goals/types";
import { usePromoteGoal } from "@/hooks/use-goals";
import { useDebounce } from "@/hooks/use-debounce";
import { syncGuidanceGoal } from "@/lib/guidance/rules";

interface GoalSelectionSheetProps {
  open: boolean;
  onClose: () => void;
  /** The slot to set (primary/secondary), or null to let user choose */
  targetSlot?: GoalSlot | null;
  /** Current primary goal (if any) */
  primaryGoal: CareerGoal | null;
  /** Current secondary goal (if any) */
  secondaryGoal: CareerGoal | null;
  /** Called when goal is successfully set */
  onSuccess?: (slot: GoalSlot) => void;
}

/**
 * GoalSelectionSheet - Mobile-friendly goal selection interface
 *
 * Features:
 * - Search input with debounced query
 * - Suggested careers (high-growth)
 * - Tap to select career
 * - Slot selection (primary/secondary) via tabs or swap dialog
 * - Minimal, fast interactions
 */
export function GoalSelectionSheet({
  open,
  onClose,
  targetSlot = null,
  primaryGoal,
  secondaryGoal,
  onSuccess,
}: GoalSelectionSheetProps) {
  const queryClient = useQueryClient();
  const promoteGoal = usePromoteGoal();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [slotChoice, setSlotChoice] = useState<GoalSlot | null>(targetSlot);
  const [showSwapDialog, setShowSwapDialog] = useState(false);
  const [showPrimaryConfirm, setShowPrimaryConfirm] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 200);

  // Get suggested careers (high growth, not already goals)
  const suggestedCareers = useMemo(() => {
    const currentGoalTitles = [primaryGoal?.title, secondaryGoal?.title].filter(Boolean);
    return getAllCareers()
      .filter((c) => c.growthOutlook === "high" && !currentGoalTitles.includes(c.title))
      .slice(0, 6);
  }, [primaryGoal, secondaryGoal]);

  // Search results
  const searchResults = useMemo(() => {
    if (debouncedQuery.length < 2) return [];
    const currentGoalTitles = [primaryGoal?.title, secondaryGoal?.title].filter(Boolean);
    return searchCareers(debouncedQuery)
      .filter((career) => !currentGoalTitles.includes(career.title))
      .slice(0, 10);
  }, [debouncedQuery, primaryGoal, secondaryGoal]);

  // Reset state when sheet opens
  useEffect(() => {
    if (open) {
      setSearchQuery("");
      setSelectedCareer(null);
      setSlotChoice(targetSlot);
      setShowSwapDialog(false);
      setShowPrimaryConfirm(false);
    }
  }, [open, targetSlot]);

  // Mutation to set goal
  const setGoalMutation = useMutation({
    mutationFn: async ({ slot, title }: { slot: GoalSlot; title: string }) => {
      const goal = createGoalWithMilestones(title);
      const response = await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot, goal }),
      });
      if (!response.ok) throw new Error("Failed to set goal");
      return { slot };
    },
    onSuccess: ({ slot }, variables) => {
      toast.success(
        slot === "primary" ? "Primary Goal Set!" : "Secondary Goal Set!",
        { description: "View and customise your goals on the Goals page." }
      );
      if (slot === "primary") {
        syncGuidanceGoal(variables.title);
        // Pre-generate the career roadmap so it's cached before the user reaches Clarity
        fetch("/api/journey/generate-timeline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ career: variables.title }),
        }).catch(() => {});
      }
      queryClient.removeQueries({ queryKey: ["personal-career-timeline"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["career-insights"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["journey-state"] });
      queryClient.invalidateQueries({ queryKey: ["goal-data"] });
      queryClient.invalidateQueries({ queryKey: ["discover-reflections"] });
      queryClient.invalidateQueries({ queryKey: ["education-context"] });
      onSuccess?.(slot);
      onClose();
    },
    onError: () => {
      toast.error("Failed to set goal", {
        description: "Please try again.",
      });
    },
  });

  // Handle career selection
  const handleSelectCareer = useCallback((career: Career) => {
    setSelectedCareer(career);

    // If both slots are full, show swap dialog
    if (primaryGoal && secondaryGoal) {
      setShowSwapDialog(true);
      return;
    }

    // Always default to primary — this sheet is "Set your Primary Goal"
    // and users should be guided toward replacing their primary goal.
    // They can manually switch to secondary if they prefer.
    setSlotChoice("primary");
  }, [primaryGoal, secondaryGoal]);

  // Handle slot selection from swap dialog
  const handleSwapChoice = useCallback((slot: string) => {
    const goalSlot = slot as GoalSlot;
    setShowSwapDialog(false);
    if (!selectedCareer) return;
    // If replacing primary and there's an existing primary goal, require confirmation
    if (goalSlot === "primary" && primaryGoal && primaryGoal.title !== selectedCareer.title) {
      setSlotChoice("primary");
      setShowPrimaryConfirm(true);
      return;
    }
    setGoalMutation.mutate({ slot: goalSlot, title: selectedCareer.title });
  }, [selectedCareer, setGoalMutation, primaryGoal]);

  // Handle confirm button click
  const handleConfirm = useCallback(() => {
    if (!selectedCareer || !slotChoice) return;
    // If changing primary goal and there's already a different primary goal, require confirmation
    if (
      slotChoice === "primary" &&
      primaryGoal &&
      primaryGoal.title !== selectedCareer.title
    ) {
      setShowPrimaryConfirm(true);
      return;
    }
    setGoalMutation.mutate({ slot: slotChoice, title: selectedCareer.title });
  }, [selectedCareer, slotChoice, setGoalMutation, primaryGoal]);

  // Handle confirmed primary goal change
  const handlePrimaryChangeConfirmed = useCallback(() => {
    if (!selectedCareer) return;
    setShowPrimaryConfirm(false);
    setGoalMutation.mutate({ slot: "primary", title: selectedCareer.title });
  }, [selectedCareer, setGoalMutation]);

  // Determine what to show
  const showSuggestions = searchQuery.length < 2 && suggestedCareers.length > 0;
  const showResults = searchResults.length > 0;
  const showNoResults = debouncedQuery.length >= 2 && searchResults.length === 0;

  return (
    <>
      <MobileSheet
        open={open}
        onClose={onClose}
        title="Set your Primary Goal"
        description="Choose the career you want to explore properly first"
      >
        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search careers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-11"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Current goals — show when no career is selected so user can promote secondary */}
        {!selectedCareer && secondaryGoal && (
          <div className="mb-4 space-y-2">
            {primaryGoal && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-teal-500/5 border border-teal-500/15">
                <Star className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                <span className="text-xs font-medium flex-1 truncate">{primaryGoal.title}</span>
                <span className="text-[9px] text-teal-500/60 font-medium">Primary</span>
              </div>
            )}
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30 border border-border/40">
              <Target className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
              <span className="text-xs font-medium flex-1 truncate">{secondaryGoal.title}</span>
              <button
                onClick={() => {
                  promoteGoal.mutate(
                    { currentPrimary: primaryGoal, currentSecondary: secondaryGoal },
                    {
                      onSuccess: () => {
                        toast.success(`${secondaryGoal.title} is now your Primary Goal`);
                        syncGuidanceGoal(secondaryGoal.title);
                        onClose();
                      },
                    },
                  );
                }}
                disabled={promoteGoal.isPending}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-teal-600 dark:text-teal-400 hover:bg-teal-500/10 transition-colors"
              >
                <ArrowUp className="h-3 w-3" />
                Make Primary
              </button>
            </div>
          </div>
        )}

        {/* Slot Toggle (when career is selected and slots available) */}
        {selectedCareer && !showSwapDialog && slotChoice && (
          <div className="mb-4 p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{selectedCareer.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{selectedCareer.title}</p>
              </div>
              <button
                onClick={() => setSelectedCareer(null)}
                className="p-1 rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Slot choice (only if both options available) */}
            {!primaryGoal || !secondaryGoal ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setSlotChoice("primary")}
                  className={cn(
                    "flex-1 p-2 rounded-lg border-2 text-center text-sm font-medium transition-colors",
                    slotChoice === "primary"
                      ? "border-teal-500 bg-teal-500/10 text-teal-700 dark:text-teal-400"
                      : "border-transparent hover:bg-muted"
                  )}
                >
                  <Star className="h-4 w-4 inline mr-1" />
                  Primary
                </button>
                <button
                  onClick={() => setSlotChoice("secondary")}
                  title="A backup career to keep in mind. It won't affect your journey — just a reminder for later."
                  className={cn(
                    "flex-1 p-2 rounded-lg border-2 text-center text-sm font-medium transition-colors",
                    slotChoice === "secondary"
                      ? "border-slate-500 bg-slate-500/10 text-slate-700 dark:text-slate-400"
                      : "border-transparent hover:bg-muted"
                  )}
                >
                  <Target className="h-4 w-4 inline mr-1" />
                  Secondary
                </button>
              </div>
            ) : null}
          </div>
        )}

        {/* Suggestions */}
        {showSuggestions && !selectedCareer && (
          <div>
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Popular high-growth careers
            </p>
            <div className="space-y-1">
              {suggestedCareers.map((career) => (
                <CareerItem
                  key={career.id}
                  career={career}
                  onSelect={() => handleSelectCareer(career)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {showResults && !selectedCareer && (
          <div className="space-y-1">
            <AnimatePresence mode="popLayout">
              {searchResults.map((career, index) => (
                <motion.div
                  key={career.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <CareerItem
                    career={career}
                    onSelect={() => handleSelectCareer(career)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* No Results */}
        {showNoResults && !selectedCareer && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No careers found for "{debouncedQuery}"</p>
          </div>
        )}

        {/* Confirm Footer */}
        {selectedCareer && slotChoice && !showSwapDialog && (
          <MobileSheetFooter className="flex-col sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setSelectedCareer(null)}
              className="flex-1 h-11"
            >
              Back
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={setGoalMutation.isPending}
              className={cn(
                "flex-1 h-11",
                slotChoice === "primary"
                  ? "bg-teal-600 hover:bg-teal-700"
                  : ""
              )}
            >
              {setGoalMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Setting...
                </>
              ) : (
                <>
                  {slotChoice === "primary" ? (
                    <Star className="h-4 w-4 mr-2" />
                  ) : (
                    <Target className="h-4 w-4 mr-2" />
                  )}
                  Set as {slotChoice === "primary" ? "Primary" : "Secondary"} Goal
                </>
              )}
            </Button>
          </MobileSheetFooter>
        )}
      </MobileSheet>

      {/* Swap Dialog (when both slots full) */}
      <ConfirmDialogChoice
        open={showSwapDialog}
        onClose={() => {
          setShowSwapDialog(false);
          setSelectedCareer(null);
        }}
        title="Replace a goal?"
        description={`You already have a primary and secondary goal. Choose which one to replace with "${selectedCareer?.title}".`}
        choices={[
          {
            label: "Replace Primary",
            sublabel: primaryGoal?.title,
            icon: <Star className="h-4 w-4 text-teal-500 fill-teal-500" />,
            value: "primary",
            variant: "primary",
          },
          {
            label: "Replace Secondary",
            sublabel: secondaryGoal?.title,
            icon: <Target className="h-4 w-4 text-slate-500" />,
            value: "secondary",
            variant: "secondary",
          },
        ]}
        onSelect={handleSwapChoice}
        isPending={setGoalMutation.isPending}
      />

      {/* Confirmation dialog when changing existing primary goal */}
      <ConfirmDialog
        open={showPrimaryConfirm}
        onClose={() => {
          setShowPrimaryConfirm(false);
          setSelectedCareer(null);
        }}
        title="Change Primary Goal?"
        description={`"${primaryGoal?.title}" will be replaced as your Primary Goal. Any progress you've made will be saved and you can switch back anytime.`}
        confirmText="Change Goal"
        cancelText="Cancel"
        onConfirm={handlePrimaryChangeConfirmed}
        isPending={setGoalMutation.isPending}
        icon={<Star className="h-5 w-5 text-teal-500" />}
      />

    </>
  );
}

/**
 * CareerItem - A single career item in the list
 */
function CareerItem({
  career,
  onSelect,
}: {
  career: Career;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="w-full p-3 rounded-lg border hover:bg-muted/50 hover:border-primary/30 transition-colors text-left flex items-center gap-3"
    >
      <span className="text-xl flex-shrink-0">{career.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{career.title}</p>
        <p className="text-xs text-muted-foreground truncate">{career.description}</p>
      </div>
      {career.growthOutlook === "high" && (
        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 flex-shrink-0">
          High Growth
        </Badge>
      )}
    </button>
  );
}
