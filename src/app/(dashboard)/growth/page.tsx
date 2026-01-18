"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  Target,
  Briefcase,
  BookOpen,
  ArrowRight,
  Lock,
  Settings,
  Zap,
  TrendingUp,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Bot,
  Plus,
  Compass,
} from "lucide-react";
import Link from "next/link";
import { getMultipleCareerJourneys, type MultipleCareerJourneys, type SingleCareerJourney } from "@/lib/my-path/actions";
import { formatCurrency } from "@/lib/utils";
import { GoalManagerModal } from "@/components/goal-manager-modal";
import { cn } from "@/lib/utils";
import { HonestProgressSection } from "@/components/growth/honest-progress-section";
import {
  computeFoundationalProgress,
  computeCareerProgress,
  computeRunwayData,
} from "@/lib/growth/progress-helpers";

// Empty State Banner - when no career goals set
function EmptyStateBanner({ onAddGoal }: { onAddGoal: () => void }) {
  return (
    <Card className="border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
      <CardContent className="py-8 text-center">
        <Target className="h-12 w-12 mx-auto text-emerald-600 mb-4" />
        <h3 className="font-semibold text-lg mb-2">Set your career goals</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
          Tell us your dream careers (up to 4) and we&apos;ll tailor everything to help you get there.
        </p>
        <Button onClick={onAddGoal} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Career Goals
        </Button>
      </CardContent>
    </Card>
  );
}

// Exploring State Banner - for users who haven't set goals yet
function ExploringBanner({ onAddGoal }: { onAddGoal: () => void }) {
  return (
    <div className="space-y-6">
      <Card className="border-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Compass className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Exploring Mode</h3>
              <p className="text-sm text-muted-foreground">
                You&apos;re browsing without specific career goals. Add goals to get personalised guidance.
              </p>
            </div>
            <Button onClick={onAddGoal} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Set Goals
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* General Growth Links */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/growth/short-term">
          <Card className="border-2 hover:border-emerald-300 transition-colors cursor-pointer h-full">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Short-term Growth</p>
                  <p className="text-xs text-muted-foreground">Track skills & reliability</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/careers">
          <Card className="border-2 hover:border-purple-300 transition-colors cursor-pointer h-full">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-purple-600" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Explore Careers</p>
                  <p className="text-xs text-muted-foreground">Discover what suits you</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/growth/vault">
          <Card className="border-2 hover:border-blue-300 transition-colors cursor-pointer h-full">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Your Vault</p>
                  <p className="text-xs text-muted-foreground">Saved items & achievements</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/career-advisor">
          <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <Bot className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Ask Sprout AI</p>
                  <p className="text-xs text-muted-foreground">Get career advice</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

// Next Action Card Component
function NextActionCard({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  description,
  reason,
  href,
  actionLabel,
}: {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  reason?: string;
  href: string;
  actionLabel: string;
}) {
  return (
    <Link href={href}>
      <Card className="border hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors group cursor-pointer">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl ${iconBg}`}>
              <Icon className={`h-4 w-4 ${iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm mb-0.5">{title}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
              {reason && (
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  {reason}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-emerald-600 transition-colors">
              <span className="hidden sm:inline">{actionLabel}</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Career Tab Content Component - goal-scoped view
function CareerTabContent({
  journey,
  growthData,
  multiJourneys,
  availabilityLevel,
}: {
  journey: SingleCareerJourney;
  growthData: any;
  multiJourneys: MultipleCareerJourneys | null;
  availabilityLevel: string | null;
}) {
  const skillsToGain = journey.skillsToGain || [];
  const goalName = journey.targetCareer.title;

  // Compute honest progress data
  const foundationalProgress = computeFoundationalProgress(growthData);
  const careerProgress = computeCareerProgress(goalName, multiJourneys?.userSkills || []);
  const runwayData = computeRunwayData(multiJourneys, availabilityLevel);

  // Generate personalised next steps based on career
  const nextSteps = [];

  // 1. Skill to build next
  if (skillsToGain.length > 0) {
    const nextSkill = skillsToGain[0];
    nextSteps.push({
      icon: Target,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      title: `Build "${nextSkill}" skill`,
      description: `Essential for becoming a ${goalName}. Look for small jobs that help you practice.`,
      reason: `Required for ${goalName}`,
      href: "/jobs",
      actionLabel: "Find jobs",
    });
  }

  // 2. Relevant job suggestion
  nextSteps.push({
    icon: Briefcase,
    iconColor: "text-green-600",
    iconBg: "bg-green-100 dark:bg-green-900/30",
    title: "Complete a skill-building small job",
    description: `Even small jobs help build skills for your ${goalName} goal. Every job is a step forward.`,
    reason: "Builds toward your career goal",
    href: "/jobs",
    actionLabel: "Browse jobs",
  });

  // 3. Learning suggestion
  nextSteps.push({
    icon: BookOpen,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    title: "Explore learning resources",
    description: `Discover courses and certifications for ${goalName}.`,
    reason: `Aligned to ${goalName} requirements`,
    href: `/growth/career-path?goal=${encodeURIComponent(goalName)}`,
    actionLabel: "View path",
  });

  // 4. Career exploration
  nextSteps.push({
    icon: GraduationCap,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    title: "Review your career path",
    description: `See what steps lie ahead on your journey to ${goalName}.`,
    href: `/growth/career-path?goal=${encodeURIComponent(goalName)}`,
    actionLabel: "View path",
  });

  return (
    <div className="space-y-5">
      {/* Career Header */}
      <Card className="border-2 border-emerald-200 dark:border-emerald-800/50 bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/30 dark:via-green-950/20 dark:to-teal-950/30">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="text-3xl">{journey.targetCareer.emoji}</div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">{goalName}</h3>
              <p className="text-sm text-muted-foreground">{journey.educationPath}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Honest Progress Framework */}
      <HonestProgressSection
        careerName={goalName}
        careerEmoji={journey.targetCareer.emoji}
        foundational={foundationalProgress}
        careerProgress={careerProgress}
        runway={runwayData}
      />

      {/* Skills Progress */}
      <div className="grid sm:grid-cols-2 gap-3">
        <Card className="border">
          <CardContent className="py-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <h4 className="font-medium text-xs">Skills You Have</h4>
            </div>
            <div className="flex flex-wrap gap-1">
              {journey.skillsYouHave.length > 0 ? (
                journey.skillsYouHave.slice(0, 5).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30">
                    {skill}
                  </Badge>
                ))
              ) : (
                <p className="text-[10px] text-muted-foreground">Complete small jobs to build skills</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="py-3">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-amber-600" />
              <h4 className="font-medium text-xs">Skills to Build</h4>
            </div>
            <div className="flex flex-wrap gap-1">
              {journey.skillsToGain.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="outline" className="text-[10px]">
                  {skill}
                </Badge>
              ))}
              {journey.skillsToGain.length > 4 && (
                <Badge variant="outline" className="text-[10px]">
                  +{journey.skillsToGain.length - 4} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Personalised Next Steps */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-emerald-600" />
          <h2 className="font-semibold text-sm">Next steps for {goalName}</h2>
        </div>
        <div className="grid gap-2">
          {nextSteps.slice(0, 3).map((step, i) => (
            <NextActionCard key={i} {...step} />
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-2">
        <Link href={`/growth/short-term?goal=${encodeURIComponent(goalName)}`}>
          <Card className="border hover:border-emerald-300 transition-colors cursor-pointer h-full">
            <CardContent className="py-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <div className="flex-1">
                  <p className="font-medium text-xs">Short-term Growth</p>
                  <p className="text-[10px] text-muted-foreground">Skills & reliability</p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/growth/vault">
          <Card className="border hover:border-blue-300 transition-colors cursor-pointer h-full">
            <CardContent className="py-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium text-xs">Your Vault</p>
                  <p className="text-[10px] text-muted-foreground">Saved items</p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* AI Assistant Prompt - Goal Scoped */}
      <Card className="border-2 border-purple-200 dark:border-purple-800/50 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
        <CardContent className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Bot className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Ask Sprout AI about {goalName}</h4>
                <p className="text-[10px] text-muted-foreground">Get personalised advice</p>
              </div>
            </div>
            <Link href={`/career-advisor?goal=${encodeURIComponent(goalName)}&prompt=${encodeURIComponent(`Tell me about becoming a ${goalName}`)}`}>
              <Button variant="outline" size="sm" className="h-7 text-xs border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30">
                <Bot className="h-3 w-3 mr-1" />
                Chat
              </Button>
            </Link>
          </div>
          {/* Quick AI prompts for this goal */}
          <div className="flex flex-wrap gap-1.5 mt-2 pl-11">
            <Link href={`/career-advisor?goal=${encodeURIComponent(goalName)}&prompt=${encodeURIComponent(`What should I do next to become a ${goalName}?`)}`}>
              <Badge variant="secondary" className="text-[10px] cursor-pointer hover:bg-purple-100">
                What should I do next?
              </Badge>
            </Link>
            <Link href={`/career-advisor?goal=${encodeURIComponent(goalName)}&prompt=${encodeURIComponent(`What skills am I missing for ${goalName}?`)}`}>
              <Badge variant="secondary" className="text-[10px] cursor-pointer hover:bg-purple-100">
                Skills I need
              </Badge>
            </Link>
            <Link href={`/career-advisor?goal=${encodeURIComponent(goalName)}&prompt=${encodeURIComponent(`What is being a ${goalName} really like?`)}`}>
              <Badge variant="secondary" className="text-[10px] cursor-pointer hover:bg-purple-100">
                Reality check
              </Badge>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Career Tabs Component with horizontal scrolling
function CareerTabs({
  journeys,
  activeTab,
  onTabChange,
  onManageGoals,
}: {
  journeys: SingleCareerJourney[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onManageGoals: () => void;
}) {
  return (
    <div className="relative">
      {/* Scrollable tabs container */}
      <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
        <div className="flex items-center gap-1.5 min-w-max pb-1">
          {journeys.map((journey, index) => {
            const isActive = activeTab === journey.targetCareer.id;
            return (
              <button
                key={journey.targetCareer.id}
                onClick={() => onTabChange(journey.targetCareer.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap",
                  isActive
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-100 font-medium"
                    : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="text-base">{journey.targetCareer.emoji}</span>
                <span className="text-sm">{journey.targetCareer.title}</span>
                <Badge
                  variant={isActive ? "secondary" : "outline"}
                  className={cn(
                    "text-[10px] px-1.5 py-0",
                    isActive && "bg-emerald-200 dark:bg-emerald-800"
                  )}
                >
                  {journey.skillMatchPercent}%
                </Badge>
                {index === 0 && (
                  <Badge variant="secondary" className="text-[10px] px-1 py-0 bg-primary/10 text-primary">
                    Primary
                  </Badge>
                )}
              </button>
            );
          })}

          {/* Add/Manage button */}
          <button
            onClick={onManageGoals}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground transition-all whitespace-nowrap border border-dashed"
          >
            <Settings className="h-3.5 w-3.5" />
            <span className="text-xs">Manage</span>
          </button>
        </div>
      </div>

      {/* Scroll indicators for mobile */}
      {journeys.length > 2 && (
        <>
          <div className="absolute left-0 top-0 bottom-1 w-4 bg-gradient-to-r from-background to-transparent pointer-events-none sm:hidden" />
          <div className="absolute right-0 top-0 bottom-1 w-4 bg-gradient-to-l from-background to-transparent pointer-events-none sm:hidden" />
        </>
      )}
    </div>
  );
}

export default function GrowthPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [activeTab, setActiveTab] = useState<string>("");
  const [goalManagerOpen, setGoalManagerOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: multiJourneys, isLoading: journeyLoading } = useQuery<MultipleCareerJourneys | null>({
    queryKey: ["multiple-career-journeys"],
    queryFn: () => getMultipleCareerJourneys(),
    enabled: session?.user?.role === "YOUTH",
  });

  const { data: growthData, isLoading: growthLoading } = useQuery({
    queryKey: ["growth-data"],
    queryFn: async () => {
      const response = await fetch("/api/growth");
      if (!response.ok) throw new Error("Failed to fetch growth data");
      return response.json();
    },
    enabled: session?.user?.role === "YOUTH",
  });

  // Mutation to save active tab
  const saveActiveTab = useMutation({
    mutationFn: async (goalId: string) => {
      await fetch("/api/profile/career-goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeGoal: goalId }),
      });
    },
  });

  const journeys = multiJourneys?.journeys || [];

  // Set initial active tab
  useEffect(() => {
    if (journeys.length > 0 && !activeTab) {
      // Try to restore from saved preference or use first
      setActiveTab(journeys[0].targetCareer.id);
    }
  }, [journeys, activeTab]);

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Save preference (fire and forget)
    const journey = journeys.find((j) => j.targetCareer.id === tabId);
    if (journey) {
      saveActiveTab.mutate(journey.targetCareer.title);
    }
  };

  // Get current goals for the goal manager
  const currentGoals = journeys.map((j) => j.targetCareer.title);

  const isLoading = sessionStatus === "loading" || journeyLoading || growthLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (session?.user?.role !== "YOUTH") {
    return (
      <Card className="border-2">
        <CardContent className="py-12 text-center">
          <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">This page is only available for youth workers.</p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const hasCareerGoals = journeys.length > 0;
  const activeJourney = journeys.find((j) => j.targetCareer.id === activeTab);

  // No career goals set - show empty/exploring state
  if (!hasCareerGoals) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <EmptyStateBanner onAddGoal={() => setGoalManagerOpen(true)} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <ExploringBanner onAddGoal={() => setGoalManagerOpen(true)} />
        </motion.div>

        <GoalManagerModal
          open={goalManagerOpen}
          onOpenChange={setGoalManagerOpen}
          currentGoals={currentGoals}
        />
      </div>
    );
  }

  // Has career goals - show tabbed view
  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-600" />
            <h1 className="font-bold text-lg">My Career Goals</h1>
            <Badge variant="secondary" className="text-xs">
              {journeys.length} goal{journeys.length > 1 ? "s" : ""}
            </Badge>
          </div>
        </div>

        {/* Progress Summary */}
        {growthData?.hasData && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Card className="border">
              <CardContent className="py-2.5 text-center">
                <p className="text-lg font-bold text-emerald-600">{growthData.growth.totalJobsCompleted}</p>
                <p className="text-[10px] text-muted-foreground">Small Jobs Done</p>
              </CardContent>
            </Card>
            <Card className="border">
              <CardContent className="py-2.5 text-center">
                <p className="text-lg font-bold text-purple-600">{growthData.growth.skillsDemonstrated?.length || 0}</p>
                <p className="text-[10px] text-muted-foreground">Skills Built</p>
              </CardContent>
            </Card>
            <Card className="border">
              <CardContent className="py-2.5 text-center">
                <p className="text-lg font-bold text-amber-600">{formatCurrency(multiJourneys?.totalEarnings || 0)}</p>
                <p className="text-[10px] text-muted-foreground">Earned</p>
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>

      {/* Career Goal Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <CareerTabs
          journeys={journeys}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onManageGoals={() => setGoalManagerOpen(true)}
        />
      </motion.div>

      {/* Active Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeJourney && (
          <CareerTabContent
            journey={activeJourney}
            growthData={growthData}
            multiJourneys={multiJourneys ?? null}
            availabilityLevel={multiJourneys?.availabilityLevel ?? null}
          />
        )}
      </motion.div>

      {/* Goal Manager Modal */}
      <GoalManagerModal
        open={goalManagerOpen}
        onOpenChange={setGoalManagerOpen}
        currentGoals={currentGoals}
      />
    </div>
  );
}
