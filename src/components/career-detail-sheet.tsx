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
} from "@/components/ui/dialog";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Banknote,
  GraduationCap,
  Briefcase,
  Sparkles,
  ExternalLink,
  Sun,
  Clock,
  Sunset,
  Wrench,
  Users,
  Target,
  AlertTriangle,
  ChevronRight,
  Check,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import type { Career } from "@/lib/career-pathways";
import { CareerProgressionFlow } from "@/components/careers/CareerProgressionFlow";

const MAX_GOALS = 4;

interface CareerDetailSheetProps {
  career: Career | null;
  matchScore?: number;
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

// Types for API response
interface CareerDetails {
  typicalDay: {
    morning: string[];
    midday: string[];
    afternoon: string[];
    tools?: string[];
    environment?: string;
  };
  whatYouActuallyDo: string[];
  whoThisIsGoodFor: string[];
  topSkills: string[];
  entryPaths: string[];
  realityCheck?: string;
}

interface CareerPathProgression {
  entry: string[];
  core: string[];
  next: string[];
}

export function CareerDetailSheet({
  career,
  matchScore,
  onClose,
}: CareerDetailSheetProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isAdded, setIsAdded] = useState(false);

  const isYouth = session?.user?.role === "YOUTH";

  // Always render Dialog - control visibility with open prop
  const isOpen = career !== null;

  // Fetch career details on demand (lazy loading)
  const { data: careerData, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["career-details", career?.id],
    queryFn: async () => {
      const response = await fetch(`/api/career-details/${career!.id}`);
      if (!response.ok) throw new Error("Failed to fetch career details");
      return response.json() as Promise<{
        details: CareerDetails | null;
        progression: CareerPathProgression | null;
        hasDetails: boolean;
      }>;
    },
    enabled: !!career?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const details = careerData?.details;
  const progression = careerData?.progression;
  const hasSpecificContent = careerData?.hasDetails ?? false;

  // Reset isAdded state when career changes
  useEffect(() => {
    if (career) {
      setIsAdded(false);
    }
  }, [career?.id]);

  // Mutation to add career to goals
  const addToGoalsMutation = useMutation({
    mutationFn: async (careerTitle: string) => {
      // First get current goals
      const getResponse = await fetch("/api/profile/career-goals");
      if (!getResponse.ok) throw new Error("Failed to fetch current goals");
      const { goals: currentGoals } = await getResponse.json();

      // Check if already in goals
      if (currentGoals.includes(careerTitle)) {
        throw new Error("ALREADY_EXISTS");
      }

      // Check if at max
      if (currentGoals.length >= MAX_GOALS) {
        throw new Error("MAX_REACHED");
      }

      // Add new goal
      const newGoals = [...currentGoals, careerTitle];

      // Save updated goals
      const putResponse = await fetch("/api/profile/career-goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goals: newGoals }),
      });

      if (!putResponse.ok) throw new Error("Failed to save goal");
      return putResponse.json();
    },
    onSuccess: () => {
      setIsAdded(true);
      toast.success("Career added to your goals!", {
        description: "View your goals on the Goals page.",
      });
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["career-goals"] });
      queryClient.invalidateQueries({ queryKey: ["career-insights"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["multiple-career-journeys"] });
    },
    onError: (error: Error) => {
      if (error.message === "ALREADY_EXISTS") {
        toast.info("Already in your goals", {
          description: "This career is already in your goals list.",
        });
        setIsAdded(true);
      } else if (error.message === "MAX_REACHED") {
        toast.error("Maximum goals reached", {
          description: `You can have up to ${MAX_GOALS} career goals. Remove one to add this.`,
        });
      } else {
        toast.error("Failed to add goal", {
          description: "Please try again later.",
        });
      }
    },
  });

  const handleAddToGoals = () => {
    if (!career || !isYouth) return;
    addToGoalsMutation.mutate(career.title);
  };

  // Get career details (use defaults if career is null)
  const growth = career ? growthConfig[career.growthOutlook] : growthConfig.medium;
  const GrowthIcon = growth.icon;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        {career && (
          <>
            {/* Header */}
            <DialogHeader className="sticky top-0 bg-background z-10 p-4 pb-3 border-b">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{career.emoji}</span>
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-lg leading-tight">{career.title}</DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {career.description}
                  </p>
                </div>
              </div>

              {/* Match Score */}
              {matchScore !== undefined && (
                <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-purple-500/10">
                  <div className="relative w-10 h-10 flex-shrink-0">
                    <svg className="w-10 h-10 transform -rotate-90">
                      <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="none" className="text-muted/30" />
                      <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray={`${(matchScore / 100) * 100.5} 100.5`} className="text-purple-500" strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                      {matchScore}%
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-700 dark:text-purple-400">
                      Match Score
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Based on your skills and experience
                    </p>
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="p-2 rounded-lg border bg-muted/30">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Banknote className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-[10px] font-medium">Salary</span>
                  </div>
                  <p className="text-sm font-semibold">{career.avgSalary}</p>
                </div>
                <div className="p-2 rounded-lg border bg-muted/30">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <GrowthIcon className={`h-3.5 w-3.5 ${growth.color}`} />
                    <span className="text-[10px] font-medium">Growth</span>
                  </div>
                  <p className={`text-sm font-semibold ${growth.color}`}>{growth.label}</p>
                </div>
              </div>
            </DialogHeader>

            <div className="p-4 space-y-5">
              {/* Loading State */}
              {isLoadingDetails && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading details...</span>
                </div>
              )}

              {/* Content - only show when loaded */}
              {details && (
                <>
                  {/* Entry Point & Progression - Only show if progression data exists */}
                  {progression && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Target className="h-4 w-4 text-indigo-500" />
                        <h3 className="text-sm font-semibold">Entry Point & Progression</h3>
                      </div>
                      <p className="text-[10px] text-muted-foreground mb-3">
                        A typical path — there are many ways to get there.
                      </p>
                      <CareerProgressionFlow progression={progression} />
                    </div>
                  )}

                  {/* A TYPICAL DAY - Most Important Section */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-900">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      A Typical Day
                    </h3>

                    <div className="space-y-3">
                      {/* Morning */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Sun className="h-3.5 w-3.5 text-amber-500" />
                          <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Morning</span>
                        </div>
                        <ul className="space-y-0.5">
                          {details.typicalDay.morning.map((task, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <span className="text-blue-500 mt-0.5">•</span>
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Midday */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Clock className="h-3.5 w-3.5 text-blue-500" />
                          <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Midday</span>
                        </div>
                        <ul className="space-y-0.5">
                          {details.typicalDay.midday.map((task, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <span className="text-blue-500 mt-0.5">•</span>
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Afternoon */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Sunset className="h-3.5 w-3.5 text-orange-500" />
                          <span className="text-xs font-medium text-orange-700 dark:text-orange-400">Afternoon</span>
                        </div>
                        <ul className="space-y-0.5">
                          {details.typicalDay.afternoon.map((task, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <span className="text-blue-500 mt-0.5">•</span>
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Tools & Environment */}
                      {(details.typicalDay.tools || details.typicalDay.environment) && (
                        <div className="pt-2 border-t border-blue-200/50 dark:border-blue-800/50">
                          {details.typicalDay.tools && (
                            <div className="flex items-center gap-1.5 flex-wrap mb-1">
                              <Wrench className="h-3 w-3 text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground">Tools:</span>
                              {details.typicalDay.tools.map((tool) => (
                                <Badge key={tool} variant="secondary" className="text-[9px] px-1.5 py-0">
                                  {tool}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {details.typicalDay.environment && (
                            <p className="text-[10px] text-muted-foreground">
                              Environment: {details.typicalDay.environment}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* What You Actually Do */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Briefcase className="h-4 w-4 text-amber-500" />
                      <h3 className="text-sm font-semibold">What You Actually Do</h3>
                    </div>
                    <ul className="space-y-1">
                      {details.whatYouActuallyDo.map((task, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <ChevronRight className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Who This Is Good For */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Users className="h-4 w-4 text-green-500" />
                      <h3 className="text-sm font-semibold">Who This Role Is Good For</h3>
                    </div>
                    <ul className="space-y-1">
                      {details.whoThisIsGoodFor.map((trait, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <span className="text-green-500 mt-0.5">✓</span>
                          {trait}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Skills You'll Use Most */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      <h3 className="text-sm font-semibold">Skills You'll Use Most</h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {details.topSkills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="text-[10px] capitalize bg-purple-500/5 border-purple-500/20"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Entry Paths */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      <h3 className="text-sm font-semibold">Entry Paths</h3>
                    </div>
                    <ul className="space-y-1">
                      {details.entryPaths.map((path, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <span className="text-blue-500 font-bold">{i + 1}.</span>
                          {path}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Education Path from Career */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <GraduationCap className="h-4 w-4 text-indigo-500" />
                      <h3 className="text-sm font-semibold">Education Overview</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">{career.educationPath}</p>
                  </div>

                  {/* Reality Check */}
                  {details.realityCheck && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3 border border-amber-200 dark:border-amber-900">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                        <h3 className="text-xs font-semibold text-amber-800 dark:text-amber-400">Reality Check</h3>
                      </div>
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        {details.realityCheck}
                      </p>
                    </div>
                  )}

                  {/* Content note */}
                  {!hasSpecificContent && (
                    <p className="text-[10px] text-muted-foreground text-center italic">
                      General information shown. More detailed content coming soon.
                    </p>
                  )}
                </>
              )}

              {/* Actions - always show */}
              <div className="pt-3 border-t space-y-2">
                {isYouth && (
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={handleAddToGoals}
                    disabled={addToGoalsMutation.isPending || isAdded}
                  >
                    {addToGoalsMutation.isPending ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        Adding...
                      </>
                    ) : isAdded ? (
                      <>
                        <Check className="h-3.5 w-3.5 mr-1.5" />
                        Added to Goals
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                        Add to My Goals
                      </>
                    )}
                  </Button>
                )}
                <Button variant="outline" className="w-full" size="sm" asChild>
                  <a
                    href={`https://utdanning.no/search?q=${encodeURIComponent(career.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    Learn More on Utdanning.no
                  </a>
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
