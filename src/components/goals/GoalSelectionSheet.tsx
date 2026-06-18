"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MobileSheet, MobileSheetFooter } from "@/components/mobile/MobileSheet";
import { logAndSwallow } from "@/lib/observability";
import { ConfirmDialog } from "@/components/mobile/ConfirmDialog";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { Career } from "@/lib/career-pathways";
import { useCareerCatalog } from "@/hooks/use-career-catalog";
import { createGoalWithMilestones, type GoalSlot, type CareerGoal } from "@/lib/goals/types";
import { useDebounce } from "@/hooks/use-debounce";
import { useIsMobile } from "@/hooks/use-media-query";
import { syncGuidanceGoal } from "@/lib/guidance/rules";

interface GoalSelectionSheetProps {
  open: boolean;
  onClose: () => void;
  /** Retained for API compatibility; only the Primary goal exists. */
  targetSlot?: GoalSlot | null;
  /** Current career goal (if any) */
  primaryGoal: CareerGoal | null;
  /** Called when goal is successfully set */
  onSuccess?: (slot: GoalSlot) => void;
}

/**
 * GoalSelectionSheet - Mobile-friendly Career goal selection interface
 *
 * Features:
 * - Search input with debounced query
 * - Suggested careers (high-growth)
 * - Tap to select career → confirm
 * - Confirmation when replacing an existing Career goal
 */
export function GoalSelectionSheet({
  open,
  onClose,
  primaryGoal,
  onSuccess,
}: GoalSelectionSheetProps) {
  const queryClient = useQueryClient();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [showPrimaryConfirm, setShowPrimaryConfirm] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 200);
  const { getAllCareers, searchCareers } = useCareerCatalog();
  // Don't auto-focus the search on mobile: it pops the keyboard on open, which
  // covers the "Set as your career goal" footer so it can't be reached.
  const isMobile = useIsMobile();

  // Get suggested careers (high growth, not already the goal)
  const suggestedCareers = useMemo(() => {
    return getAllCareers()
      .filter((c) => c.growthOutlook === "high" && c.title !== primaryGoal?.title)
      .slice(0, 6);
  }, [primaryGoal, getAllCareers]);

  // Search results
  const searchResults = useMemo(() => {
    if (debouncedQuery.length < 2) return [];
    return searchCareers(debouncedQuery)
      .filter((career) => career.title !== primaryGoal?.title)
      .slice(0, 10);
  }, [debouncedQuery, primaryGoal, searchCareers]);

  // Reset state when sheet opens
  useEffect(() => {
    if (open) {
      setSearchQuery("");
      setSelectedCareer(null);
      setShowPrimaryConfirm(false);
    }
  }, [open]);

  // Mutation to set the career goal
  const setGoalMutation = useMutation({
    mutationFn: async ({ title }: { title: string }) => {
      const goal = createGoalWithMilestones(title);
      const response = await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot: "primary", goal }),
      });
      if (!response.ok) throw new Error("Failed to set goal");
      return { title };
    },
    onSuccess: ({ title }) => {
      toast({ title: "Career goal set!", description: "View and customise it on the Goals page.", variant: "success" });
      syncGuidanceGoal(title);
      // Pre-generate the career roadmap so it's cached before the user reaches Clarity
      fetch("/api/journey/generate-timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ career: title }),
      }).catch(logAndSwallow("goalSelection:pregenerateTimeline"));
      queryClient.removeQueries({ queryKey: ["personal-career-timeline"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["career-insights"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["journey-state"] });
      queryClient.invalidateQueries({ queryKey: ["goal-data"] });
      queryClient.invalidateQueries({ queryKey: ["discover-reflections"] });
      queryClient.invalidateQueries({ queryKey: ["education-context"] });
      onSuccess?.("primary");
      onClose();
    },
    onError: () => {
      toast({ title: "Failed to set goal", description: "Please try again.", variant: "destructive" });
    },
  });

  // Handle career selection
  const handleSelectCareer = useCallback((career: Career) => {
    setSelectedCareer(career);
  }, []);

  // Handle confirm button click — confirm first if replacing a different primary
  const handleConfirm = useCallback(() => {
    if (!selectedCareer) return;
    if (primaryGoal && primaryGoal.title !== selectedCareer.title) {
      setShowPrimaryConfirm(true);
      return;
    }
    setGoalMutation.mutate({ title: selectedCareer.title });
  }, [selectedCareer, setGoalMutation, primaryGoal]);

  // Handle confirmed career goal change
  const handlePrimaryChangeConfirmed = useCallback(() => {
    if (!selectedCareer) return;
    setShowPrimaryConfirm(false);
    setGoalMutation.mutate({ title: selectedCareer.title });
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
        title="Set your career goal"
        description="Choose the career you want to explore properly"
      >
        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search careers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-11"
            autoFocus={!isMobile}
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

        {/* Current goal — show when no career is selected */}
        {!selectedCareer && primaryGoal && (
          <div className="mb-4 flex items-center gap-2 p-2.5 rounded-lg bg-teal-500/5 border border-teal-500/15">
            <Star className="h-3.5 w-3.5 text-teal-500 shrink-0" />
            <span className="text-xs font-medium flex-1 truncate">{primaryGoal.title}</span>
            <span className="text-[9px] text-teal-500/60 font-medium">Current</span>
          </div>
        )}

        {/* Selected career preview */}
        {selectedCareer && (
          <div className="mb-4 p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-2">
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
        {selectedCareer && (
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
              className={cn("flex-1 h-11", "bg-teal-600 hover:bg-teal-700")}
            >
              {setGoalMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Setting...
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 mr-2" />
                  Set as your career goal
                </>
              )}
            </Button>
          </MobileSheetFooter>
        )}
      </MobileSheet>

      {/* Confirmation dialog when changing existing career goal */}
      <ConfirmDialog
        open={showPrimaryConfirm}
        onClose={() => {
          setShowPrimaryConfirm(false);
          setSelectedCareer(null);
        }}
        title="Change career goal?"
        description={`"${primaryGoal?.title}" will be replaced as your career goal. Any progress you've made will be saved and you can switch back anytime.`}
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
