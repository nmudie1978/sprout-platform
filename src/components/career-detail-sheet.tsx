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
  Star,
  ArrowLeftRight,
  Video,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { toast } from "sonner";
import type { Career } from "@/lib/career-pathways";
import type { CareerGoal, GoalSlot } from "@/lib/goals/types";
import { createEmptyGoal } from "@/lib/goals/types";
import { CareerProgressionFlow } from "@/components/careers/CareerProgressionFlow";
import { RealWorldExamplesLinks } from "@/components/careers/RealWorldExamplesLinks";
import { useCuriositySaves } from "@/hooks/use-curiosity-saves";

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
            <ArrowLeftRight className="h-5 w-5 text-purple-500" />
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
              className="w-full p-3 rounded-lg border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 transition-colors text-left group"
            >
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4 text-purple-500 fill-purple-500" />
                <span className="text-xs font-medium text-muted-foreground">
                  Replace Primary Goal
                </span>
              </div>
              <p className="font-medium group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
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
  matchScore,
  onClose,
}: CareerDetailSheetProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [addedAs, setAddedAs] = useState<GoalSlot | null>(null);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const { saveCuriosity, removeCuriosity, isSaved: isCuriositySaved } = useCuriositySaves();

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

  const details = careerData?.details;
  const progression = careerData?.progression;
  const hasSpecificContent = careerData?.hasDetails ?? false;

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
      // Invalidate goals query
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["career-insights"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
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

    setGoalMutation.mutate({ slot: "primary", title: career.title });
  };

  const handleSetAsSecondary = () => {
    if (!career || !isYouth) return;

    // If both slots are full, show swap modal
    if (primaryGoal && secondaryGoal) {
      setShowSwapModal(true);
      return;
    }

    setGoalMutation.mutate({ slot: "secondary", title: career.title });
  };

  const handleSwap = (slot: GoalSlot) => {
    if (!career) return;
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

                        {/* Day in the Life Video Link */}
                        <div className="pt-2 border-t border-blue-200/50 dark:border-blue-800/50">
                          <a
                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`"a day in the life" ${career.title}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                          >
                            <Video className="h-3.5 w-3.5" />
                            Watch: A Day in the Life
                            <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
                          </a>
                        </div>
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

                    {/* Real-World Examples - Live Job Search Links */}
                    <RealWorldExamplesLinks careerTitle={career.title} />

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
                          className="w-full bg-purple-600 hover:bg-purple-700"
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
                          {setGoalMutation.isPending ? (
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
                    </>
                  )}
                  <Button variant="outline" className="w-full" size="sm" asChild>
                    <a
                      href={`https://vilbli.no/?Ession=SO&Sok=${encodeURIComponent(career.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                      Learn More on Vilbli.no
                    </a>
                  </Button>
                </div>
              </div>
            </>
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
