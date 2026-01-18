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
  BookOpen,
  TrendingUp,
  Target,
  CheckCircle2,
  Briefcase,
  Archive,
  Bot,
  Plus,
  Star,
} from "lucide-react";
import Link from "next/link";
import { StageBanner } from "@/components/growth/stage-banner";
import { GoalManagerModal } from "@/components/goal-manager-modal";
import { getMultipleCareerJourneys, type MultipleCareerJourneys, type SingleCareerJourney } from "@/lib/my-path/actions";
import { HonestProgressSection } from "@/components/growth/honest-progress-section";
import {
  computeFoundationalProgress,
  computeCareerProgress,
  computeRunwayData,
} from "@/lib/growth/progress-helpers";
import { cn } from "@/lib/utils";

// Skills Progress Card
function SkillsProgressCard({
  skillsYouHave,
  skillsToGain,
  careerName,
}: {
  skillsYouHave: string[];
  skillsToGain: string[];
  careerName: string;
}) {
  return (
    <Card className="border">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-amber-600" />
          <h3 className="font-semibold text-sm">Skills for {careerName}</h3>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Skills You Have */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">
                Skills You Have
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {skillsYouHave.length > 0 ? (
                skillsYouHave.slice(0, 5).map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30"
                  >
                    {skill}
                  </Badge>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">
                  Complete jobs to build skills
                </p>
              )}
            </div>
          </div>

          {/* Skills to Build */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">
                Skills to Build
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {skillsToGain.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="outline" className="text-[10px]">
                  {skill}
                </Badge>
              ))}
              {skillsToGain.length > 4 && (
                <Badge variant="outline" className="text-[10px]">
                  +{skillsToGain.length - 4} more
                </Badge>
              )}
            </div>
          </div>
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
  badge,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  href: string;
  badge?: string;
}) {
  return (
    <Link href={href}>
      <Card className="border hover:border-amber-200 transition-colors cursor-pointer h-full">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn("p-2 rounded-lg", iconBg)}>
              <Icon className={cn("w-5 h-5", iconColor)} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">{title}</p>
                {badge && (
                  <Badge className="text-[10px] px-1.5 py-0 h-4 bg-amber-100 text-amber-700 border-0">
                    {badge}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground mt-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Career Selector Tabs
function CareerSelector({
  journeys,
  activeIndex,
  onSelect,
}: {
  journeys: SingleCareerJourney[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  if (journeys.length <= 1) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
      {journeys.map((journey, index) => (
        <button
          key={journey.targetCareer.id}
          onClick={() => onSelect(index)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors",
            activeIndex === index
              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700"
              : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
          )}
        >
          <span>{journey.targetCareer.emoji}</span>
          <span className="text-sm font-medium">{journey.targetCareer.title}</span>
        </button>
      ))}
    </div>
  );
}

export default function BuildStagePage() {
  const { data: session, status: sessionStatus } = useSession();
  const [activeCareerIndex, setActiveCareerIndex] = useState(0);
  const [goalManagerOpen, setGoalManagerOpen] = useState(false);

  const { data: multiJourneys, isLoading: journeysLoading } = useQuery<MultipleCareerJourneys | null>({
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

  const isLoading = sessionStatus === "loading" || journeysLoading || growthLoading;

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
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
  const activeJourney = journeys[activeCareerIndex];

  // Compute progress data
  const foundationalProgress = computeFoundationalProgress(growthData);
  const careerProgress = activeJourney
    ? computeCareerProgress(activeJourney.targetCareer.title, multiJourneys?.userSkills || [])
    : computeCareerProgress("", []);
  const runwayData = computeRunwayData(
    multiJourneys ?? null,
    multiJourneys?.availabilityLevel ?? null
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Stage Banner */}
      <StageBanner stageId="build" />

      {/* No Career Goals Warning */}
      {!hasCareerGoals && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <Card className="border-2 border-amber-300 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-amber-100">
                  <Target className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Set a career goal first</h3>
                  <p className="text-sm text-muted-foreground">
                    Go to Explore to choose a career direction
                  </p>
                </div>
                <Link href="/growth/explore">
                  <Button className="bg-amber-600 hover:bg-amber-700">
                    Explore Careers
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Career Selector */}
      {hasCareerGoals && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <CareerSelector
            journeys={journeys}
            activeIndex={activeCareerIndex}
            onSelect={setActiveCareerIndex}
          />
        </motion.div>
      )}

      {/* Skills Progress */}
      {activeJourney && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          <SkillsProgressCard
            skillsYouHave={activeJourney.skillsYouHave}
            skillsToGain={activeJourney.skillsToGain}
            careerName={activeJourney.targetCareer.title}
          />
        </motion.div>
      )}

      {/* Honest Progress Section */}
      {activeJourney && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <HonestProgressSection
            careerName={activeJourney.targetCareer.title}
            careerEmoji={activeJourney.targetCareer.emoji}
            foundational={foundationalProgress}
            careerProgress={careerProgress}
            runway={runwayData}
          />
        </motion.div>
      )}

      {/* Build Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-4 h-4 text-amber-600" />
          <h2 className="font-semibold text-sm">Build Your Profile</h2>
        </div>
        <div className="grid gap-2">
          <QuickActionCard
            icon={Briefcase}
            iconBg="bg-green-100 dark:bg-green-900/30"
            iconColor="text-green-600"
            title="Complete Small Jobs"
            description="Build skills and earn money through small jobs"
            href="/jobs"
            badge="Earn & Learn"
          />
          <QuickActionCard
            icon={TrendingUp}
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            iconColor="text-blue-600"
            title="Track Your Progress"
            description="See your short-term growth and reliability score"
            href="/growth/short-term"
          />
          <QuickActionCard
            icon={BookOpen}
            iconBg="bg-purple-100 dark:bg-purple-900/30"
            iconColor="text-purple-600"
            title="Learning Path"
            description="Courses and resources for your career"
            href={
              activeJourney
                ? `/growth/career-path?goal=${encodeURIComponent(activeJourney.targetCareer.title)}`
                : "/growth/career-path"
            }
          />
          <QuickActionCard
            icon={Archive}
            iconBg="bg-amber-100 dark:bg-amber-900/30"
            iconColor="text-amber-600"
            title="Your Vault"
            description="Save proof, badges, and achievements"
            href="/growth/vault"
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
                <h3 className="font-semibold">Need guidance?</h3>
                <p className="text-sm text-muted-foreground">
                  Ask Sprout AI what to focus on next
                </p>
              </div>
              <Link
                href={
                  activeJourney
                    ? `/career-advisor?goal=${encodeURIComponent(activeJourney.targetCareer.title)}&prompt=What should I work on next to become a ${activeJourney.targetCareer.title}?`
                    : "/career-advisor?prompt=What skills should I build?"
                }
              >
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
