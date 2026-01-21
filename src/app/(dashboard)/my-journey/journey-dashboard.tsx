"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Briefcase,
  Target,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  Circle,
} from "lucide-react";

// Types
interface JourneyStage {
  id: string;
  label: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
}

interface NextAction {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  priority: "high" | "medium" | "low";
}

interface WeeklyFocus {
  theme: string;
  description: string;
  tips: string[];
}

// Journey stages data
const JOURNEY_STAGES: JourneyStage[] = [
  {
    id: "earn",
    label: "Earn",
    description: "Complete small jobs to build experience",
    isActive: false,
    isCompleted: true,
  },
  {
    id: "learn",
    label: "Learn",
    description: "Discover skills and strengths",
    isActive: true,
    isCompleted: false,
  },
  {
    id: "explore",
    label: "Explore",
    description: "Research career paths",
    isActive: false,
    isCompleted: false,
  },
  {
    id: "grow",
    label: "Grow",
    description: "Build toward your goals",
    isActive: false,
    isCompleted: false,
  },
];

// Weekly focus themes (rotates based on user activity)
const WEEKLY_FOCUSES: WeeklyFocus[] = [
  {
    theme: "Reliability",
    description: "Being someone others can count on opens doors. This week, focus on following through.",
    tips: [
      "Respond to messages within 24 hours",
      "Show up 5 minutes early",
      "If something changes, communicate quickly",
    ],
  },
  {
    theme: "Communication",
    description: "Clear communication builds trust. This week, practice expressing yourself clearly.",
    tips: [
      "Ask questions when unsure",
      "Confirm details in writing",
      "Listen before responding",
    ],
  },
  {
    theme: "Initiative",
    description: "Taking the first step shows confidence. This week, look for opportunities to act.",
    tips: [
      "Apply to one new opportunity",
      "Offer help before being asked",
      "Share an idea or suggestion",
    ],
  },
  {
    theme: "Confidence",
    description: "Confidence grows through action. This week, step slightly outside your comfort zone.",
    tips: [
      "Try something new",
      "Accept feedback gracefully",
      "Celebrate small wins",
    ],
  },
];

// Progress Ring Component
function ProgressRing({ progress, size = 120 }: { progress: number; size?: number }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{progress}%</span>
        <span className="text-xs text-muted-foreground">Progress</span>
      </div>
    </div>
  );
}

// Journey Stage Indicator
function JourneyStageIndicator({ stages }: { stages: JourneyStage[] }) {
  return (
    <div className="flex items-center justify-between w-full">
      {stages.map((stage, idx) => (
        <div key={stage.id} className="flex items-center flex-1">
          {/* Stage node */}
          <div className="flex flex-col items-center">
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center transition-all
                ${stage.isCompleted
                  ? "bg-emerald-500 text-white"
                  : stage.isActive
                  ? "bg-gradient-to-br from-purple-500 to-indigo-500 text-white ring-4 ring-purple-500/20"
                  : "bg-muted text-muted-foreground"
                }
              `}
            >
              {stage.isCompleted ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </div>
            <span
              className={`
                mt-2 text-xs font-medium
                ${stage.isActive ? "text-foreground" : "text-muted-foreground"}
              `}
            >
              {stage.label}
            </span>
          </div>
          {/* Connector line */}
          {idx < stages.length - 1 && (
            <div
              className={`
                flex-1 h-0.5 mx-2
                ${stage.isCompleted ? "bg-emerald-500" : "bg-muted"}
              `}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// Next Best Action Card
function NextBestActionCard({
  action,
  hasGoals,
  hasCompletedJobs,
}: {
  action: NextAction | null;
  hasGoals: boolean;
  hasCompletedJobs: boolean;
}) {
  // Determine the best next action based on user state
  const getDefaultAction = (): NextAction => {
    if (!hasCompletedJobs) {
      return {
        id: "first-job",
        title: "Apply for your first small job",
        description: "Start earning and building real experience with a local job.",
        href: "/jobs",
        icon: Briefcase,
        priority: "high",
      };
    }
    if (!hasGoals) {
      return {
        id: "set-goal",
        title: "Set your first career goal",
        description: "Define what you're working toward to make progress meaningful.",
        href: "/my-journey?section=goals",
        icon: Target,
        priority: "high",
      };
    }
    return {
      id: "explore-career",
      title: "Explore a career you saved",
      description: "Learn more about paths that interest you.",
      href: "/careers",
      icon: BookOpen,
      priority: "medium",
    };
  };

  const currentAction = action || getDefaultAction();
  const Icon = currentAction.icon;

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20">
            <Icon className="h-6 w-6 text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-medium text-amber-600">Next Best Action</span>
            </div>
            <h3 className="font-semibold text-base mb-1">{currentAction.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {currentAction.description}
            </p>
            <Button asChild size="sm">
              <Link href={currentAction.href}>
                Get Started
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Weekly Focus Card
function WeeklyFocusCard({ focus }: { focus: WeeklyFocus }) {
  return (
    <Card className="bg-muted/30">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-medium text-muted-foreground">This Week's Focus</span>
        </div>
        <h3 className="font-semibold mb-2">{focus.theme}</h3>
        <p className="text-sm text-muted-foreground mb-3">{focus.description}</p>
        <ul className="space-y-1.5">
          {focus.tips.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
              <span className="text-emerald-500 mt-0.5">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// Main Journey Dashboard Component
interface JourneyDashboardProps {
  hasGoals?: boolean;
  hasCompletedJobs?: boolean;
  completedJobsCount?: number;
  goalsCount?: number;
}

export function JourneyDashboard({
  hasGoals = false,
  hasCompletedJobs = false,
  completedJobsCount = 0,
  goalsCount = 0,
}: JourneyDashboardProps) {
  // Calculate progress based on user activity
  const calculateProgress = () => {
    let progress = 0;
    if (hasCompletedJobs) progress += 25;
    if (completedJobsCount >= 3) progress += 15;
    if (hasGoals) progress += 20;
    if (goalsCount >= 2) progress += 10;
    // Add more factors as needed
    return Math.min(progress + 10, 100); // Base 10% for signing up
  };

  // Determine active journey stage
  const getActiveStages = (): JourneyStage[] => {
    return JOURNEY_STAGES.map((stage) => ({
      ...stage,
      isCompleted: stage.id === "earn" && hasCompletedJobs,
      isActive:
        (stage.id === "earn" && !hasCompletedJobs) ||
        (stage.id === "learn" && hasCompletedJobs && !hasGoals) ||
        (stage.id === "explore" && hasGoals && goalsCount < 2) ||
        (stage.id === "grow" && goalsCount >= 2),
    }));
  };

  // Get weekly focus (rotate based on week number)
  const getWeeklyFocus = (): WeeklyFocus => {
    const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    return WEEKLY_FOCUSES[weekNumber % WEEKLY_FOCUSES.length];
  };

  const progress = calculateProgress();
  const stages = getActiveStages();
  const weeklyFocus = getWeeklyFocus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Progress Section */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Progress Ring */}
        <div className="flex flex-col items-center">
          <ProgressRing progress={progress} />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Journey Progress
          </p>
        </div>

        {/* Journey Stages */}
        <div className="flex-1 w-full">
          <h3 className="text-sm font-medium mb-4 text-muted-foreground">Your Path</h3>
          <JourneyStageIndicator stages={stages} />
        </div>
      </div>

      {/* Next Best Action */}
      <NextBestActionCard
        action={null}
        hasGoals={hasGoals}
        hasCompletedJobs={hasCompletedJobs}
      />

      {/* Weekly Focus */}
      <WeeklyFocusCard focus={weeklyFocus} />
    </motion.div>
  );
}
