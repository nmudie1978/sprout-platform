"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, Target, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MobileSheet, MobileSheetFooter } from "@/components/mobile/MobileSheet";
import { ConfirmDialogChoice } from "@/components/mobile/ConfirmDialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { searchCareers, getAllCareers, type Career } from "@/lib/career-pathways";
import { createEmptyGoal, type GoalSlot, type CareerGoal } from "@/lib/goals/types";
import { useDebounce } from "@/hooks/use-debounce";

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

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [slotChoice, setSlotChoice] = useState<GoalSlot | null>(targetSlot);
  const [showSwapDialog, setShowSwapDialog] = useState(false);

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
    }
  }, [open, targetSlot]);

  // Mutation to set goal
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
      toast.success(
        slot === "primary" ? "Primary Goal Set!" : "Secondary Goal Set!",
        { description: "View and customise your goals on the Goals page." }
      );
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["career-insights"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
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

    // If no slots filled, default to primary
    if (!primaryGoal) {
      setSlotChoice("primary");
    } else {
      // Primary filled, secondary empty - default to secondary
      setSlotChoice("secondary");
    }
  }, [primaryGoal, secondaryGoal]);

  // Handle slot selection from swap dialog
  const handleSwapChoice = useCallback((slot: string) => {
    const goalSlot = slot as GoalSlot;
    if (selectedCareer) {
      setGoalMutation.mutate({ slot: goalSlot, title: selectedCareer.title });
    }
    setShowSwapDialog(false);
  }, [selectedCareer, setGoalMutation]);

  // Handle confirm button click
  const handleConfirm = useCallback(() => {
    if (!selectedCareer || !slotChoice) return;
    setGoalMutation.mutate({ slot: slotChoice, title: selectedCareer.title });
  }, [selectedCareer, slotChoice, setGoalMutation]);

  // Determine what to show
  const showSuggestions = searchQuery.length < 2 && suggestedCareers.length > 0;
  const showResults = searchResults.length > 0;
  const showNoResults = debouncedQuery.length >= 2 && searchResults.length === 0;

  return (
    <>
      <MobileSheet
        open={open}
        onClose={onClose}
        title="Set your goal"
        description="Search for a career to set as your goal"
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
                  disabled={!!primaryGoal}
                  className={cn(
                    "flex-1 p-2 rounded-lg border-2 text-center text-sm font-medium transition-colors",
                    slotChoice === "primary"
                      ? "border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-400"
                      : "border-transparent hover:bg-muted",
                    primaryGoal && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Star className="h-4 w-4 inline mr-1" />
                  Primary
                </button>
                <button
                  onClick={() => setSlotChoice("secondary")}
                  disabled={!!secondaryGoal || !primaryGoal}
                  className={cn(
                    "flex-1 p-2 rounded-lg border-2 text-center text-sm font-medium transition-colors",
                    slotChoice === "secondary"
                      ? "border-slate-500 bg-slate-500/10 text-slate-700 dark:text-slate-400"
                      : "border-transparent hover:bg-muted",
                    (secondaryGoal || !primaryGoal) && "opacity-50 cursor-not-allowed"
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
                  ? "bg-purple-600 hover:bg-purple-700"
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
            icon: <Star className="h-4 w-4 text-purple-500 fill-purple-500" />,
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
