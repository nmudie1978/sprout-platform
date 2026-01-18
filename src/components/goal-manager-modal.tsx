"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Target,
  Search,
  Plus,
  X,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { searchCareers, getAllCareers, type Career } from "@/lib/career-pathways";
import { useToast } from "@/hooks/use-toast";

interface GoalManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentGoals: string[];
  onGoalsUpdate?: (goals: string[]) => void;
}

const MAX_GOALS = 4;

export function GoalManagerModal({
  open,
  onOpenChange,
  currentGoals,
  onGoalsUpdate,
}: GoalManagerModalProps) {
  const [goals, setGoals] = useState<string[]>(currentGoals);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Career[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Sync goals when modal opens
  useEffect(() => {
    if (open) {
      setGoals(currentGoals);
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [open, currentGoals]);

  // Search careers as user types
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      const results = searchCareers(searchQuery)
        .filter((career) => !goals.includes(career.title))
        .slice(0, 6);
      setSearchResults(results);
      setIsSearching(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, goals]);

  const addGoal = (careerTitle: string) => {
    if (goals.length >= MAX_GOALS) {
      toast({
        title: "Maximum goals reached",
        description: `You can have up to ${MAX_GOALS} career goals.`,
        variant: "destructive",
      });
      return;
    }
    if (goals.includes(careerTitle)) {
      toast({
        title: "Goal already exists",
        description: "This career is already in your goals.",
        variant: "destructive",
      });
      return;
    }
    setGoals([...goals, careerTitle]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const moveGoal = (index: number, direction: "up" | "down") => {
    const newGoals = [...goals];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= goals.length) return;
    [newGoals[index], newGoals[newIndex]] = [newGoals[newIndex], newGoals[index]];
    setGoals(newGoals);
  };

  const saveGoals = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/profile/career-goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goals }),
      });

      if (!response.ok) {
        throw new Error("Failed to save goals");
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["multiple-career-journeys"] });
      queryClient.invalidateQueries({ queryKey: ["career-journey"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });

      onGoalsUpdate?.(goals);
      onOpenChange(false);

      toast({
        title: "Goals updated",
        description: `You now have ${goals.length} career goal${goals.length !== 1 ? "s" : ""}.`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to save your career goals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Get popular/suggested careers for empty state
  const suggestedCareers = getAllCareers()
    .filter((c) => c.growthOutlook === "high" && !goals.includes(c.title))
    .slice(0, 4);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Manage Career Goals
          </DialogTitle>
          <DialogDescription>
            Set up to {MAX_GOALS} career goals. Your first goal is your primary focus.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Current Goals */}
          <div>
            <h3 className="text-sm font-medium mb-2">Your Career Goals ({goals.length}/{MAX_GOALS})</h3>
            {goals.length === 0 ? (
              <Card className="border-2 border-dashed">
                <CardContent className="py-6 text-center text-muted-foreground">
                  <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No career goals set yet</p>
                  <p className="text-xs mt-1">Search below to add your first goal</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {goals.map((goal, index) => (
                  <Card key={goal} className={index === 0 ? "border-2 border-primary/30 bg-primary/5" : ""}>
                    <CardContent className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">{goal}</span>
                            {index === 0 && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                Primary
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => moveGoal(index, "up")}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => moveGoal(index, "down")}
                            disabled={index === goals.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            onClick={() => removeGoal(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Add Goal Search */}
          {goals.length < MAX_GOALS && (
            <div>
              <h3 className="text-sm font-medium mb-2">Add a Career Goal</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search careers (e.g., Developer, Nurse, Teacher)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-2 border rounded-lg divide-y max-h-48 overflow-y-auto">
                  {searchResults.map((career) => (
                    <button
                      key={career.id}
                      onClick={() => addGoal(career.title)}
                      className="w-full px-3 py-2 text-left hover:bg-muted/50 transition-colors flex items-center gap-2"
                    >
                      <span className="text-lg">{career.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{career.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{career.description}</p>
                      </div>
                      <Plus className="h-4 w-4 text-primary flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* No Results */}
              {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                <div className="mt-2 p-3 border rounded-lg text-center text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4 mx-auto mb-1" />
                  No careers found for "{searchQuery}"
                </div>
              )}

              {/* Suggestions when not searching */}
              {searchQuery.length < 2 && goals.length < MAX_GOALS && suggestedCareers.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Popular high-growth careers
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedCareers.map((career) => (
                      <Button
                        key={career.id}
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => addGoal(career.title)}
                      >
                        {career.emoji} {career.title}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={saveGoals} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Goals"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
