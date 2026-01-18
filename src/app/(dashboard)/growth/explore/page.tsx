"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  Lock,
  ArrowRight,
  ChevronRight,
  GraduationCap,
  Lightbulb,
  Bot,
  Play,
  Plus,
  Target,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { StageBanner } from "@/components/growth/stage-banner";
import { GoalManagerModal } from "@/components/goal-manager-modal";
import { getMultipleCareerJourneys, type MultipleCareerJourneys } from "@/lib/my-path/actions";
import { cn } from "@/lib/utils";

// Career Card Component
function CareerCard({
  title,
  emoji,
  matchPercent,
  isPrimary,
  onClick,
}: {
  title: string;
  emoji: string;
  matchPercent: number;
  isPrimary?: boolean;
  onClick?: () => void;
}) {
  return (
    <Card
      className={cn(
        "border-2 transition-colors cursor-pointer",
        isPrimary
          ? "border-blue-300 bg-blue-50/50 dark:bg-blue-950/20"
          : "hover:border-blue-200"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{emoji}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">{title}</p>
              {isPrimary && (
                <Badge className="text-[10px] px-1.5 py-0 h-4 bg-blue-100 text-blue-700 border-0">
                  Primary
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {matchPercent}% skill match
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

// Quick Action Card
function QuickActionCard({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  description,
  href,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="border hover:border-blue-200 transition-colors cursor-pointer h-full">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn("p-2 rounded-lg", iconBg)}>
              <Icon className={cn("w-5 h-5", iconColor)} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{title}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground mt-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function ExploreStagePage() {
  const { data: session, status: sessionStatus } = useSession();
  const [goalManagerOpen, setGoalManagerOpen] = useState(false);

  const { data: multiJourneys, isLoading: journeysLoading } = useQuery<MultipleCareerJourneys | null>({
    queryKey: ["multiple-career-journeys"],
    queryFn: () => getMultipleCareerJourneys(),
    enabled: session?.user?.role === "YOUTH",
  });

  const isLoading = sessionStatus === "loading" || journeysLoading;

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (session?.user?.role !== "YOUTH") {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-2">
          <CardContent className="py-12 text-center">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              This page is only available for youth workers.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const journeys = multiJourneys?.journeys || [];
  const currentGoals = journeys.map((j) => j.targetCareer.title);
  const hasCareerGoals = journeys.length > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Stage Banner */}
      <StageBanner stageId="explore" />

      {/* Career Goals Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600" />
            <h2 className="font-semibold text-sm">Your Career Goals</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setGoalManagerOpen(true)}
            className="text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            {hasCareerGoals ? "Manage" : "Add Goals"}
          </Button>
        </div>

        {hasCareerGoals ? (
          <div className="space-y-2">
            {journeys.map((journey, index) => (
              <CareerCard
                key={journey.targetCareer.id}
                title={journey.targetCareer.title}
                emoji={journey.targetCareer.emoji}
                matchPercent={journey.skillMatchPercent}
                isPrimary={index === 0}
                onClick={() =>
                  window.location.href = `/careers?search=${encodeURIComponent(journey.targetCareer.title)}`
                }
              />
            ))}
          </div>
        ) : (
          <Card className="border-2 border-dashed border-blue-300 bg-blue-50/50">
            <CardContent className="py-8 text-center">
              <GraduationCap className="h-10 w-10 mx-auto text-blue-500 mb-3" />
              <h3 className="font-semibold mb-1">No career goals yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Set up to 4 career goals to get personalised guidance
              </p>
              <Button
                onClick={() => setGoalManagerOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Career Goals
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Exploration Tools */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <h2 className="font-semibold text-sm">Explore More</h2>
        </div>
        <div className="grid gap-2">
          <QuickActionCard
            icon={GraduationCap}
            iconBg="bg-purple-100 dark:bg-purple-900/30"
            iconColor="text-purple-600"
            title="Browse All Careers"
            description="Discover careers that match your interests"
            href="/careers"
          />
          <QuickActionCard
            icon={Lightbulb}
            iconBg="bg-amber-100 dark:bg-amber-900/30"
            iconColor="text-amber-600"
            title="Industry Insights"
            description="Watch videos about different industries"
            href="/growth/insights"
          />
          <QuickActionCard
            icon={Users}
            iconBg="bg-green-100 dark:bg-green-900/30"
            iconColor="text-green-600"
            title="Pro Insights"
            description="Learn from professionals in your field"
            href="/growth/pro-insights"
          />
        </div>
      </motion.div>

      {/* AI Assistant */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                <Bot className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Not sure where to start?</h3>
                <p className="text-sm text-muted-foreground">
                  Ask Sprout AI for career suggestions based on your interests
                </p>
              </div>
              <Link href="/career-advisor?prompt=What careers might suit me?">
                <Button variant="outline" className="border-purple-300">
                  <Bot className="w-4 h-4 mr-2" />
                  Ask AI
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
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
