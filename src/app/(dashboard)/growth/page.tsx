"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  Lock,
  ArrowRight,
  Compass,
  Hammer,
  Send,
  Sparkles,
  CheckCircle2,
  Target,
  MapPin,
  FileText,
} from "lucide-react";
import Link from "next/link";
import {
  STAGES,
  STAGE_ORDER,
  getSuggestedStage,
  checkStageReadiness,
  getStageBanner,
  type StageId,
  type ReadinessCheck,
} from "@/lib/growth/stage-config";
import { cn } from "@/lib/utils";

// Next Stop Card - The primary action card
function NextStopCard({
  stageId,
  readiness,
}: {
  stageId: StageId;
  readiness: ReadinessCheck;
}) {
  const stage = STAGES[stageId];
  const banner = getStageBanner(stageId);
  const Icon = stage.icon;
  const { canAdvance, blockers } = checkStageReadiness(stageId, readiness);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1, duration: 0.3 }}
    >
      <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/30 dark:via-green-950/20 dark:to-teal-950/30 dark:border-emerald-800/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <Icon className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                  Your Next Stop
                </span>
                <Sparkles className="w-3 h-3 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{banner.title}</h2>
              <p className="text-muted-foreground mb-4">{banner.description}</p>

              <Link href={stage.route}>
                <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                  Go to {stage.label}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Readiness Checklist
function ReadinessChecklist({ readiness }: { readiness: ReadinessCheck }) {
  const items = [
    {
      key: "hasTargetCareer",
      label: "Career goal selected",
      completed: readiness.hasTargetCareer,
      icon: Target,
      href: "/growth/explore",
    },
    {
      key: "hasSkillTags",
      label: "Skills added to profile",
      completed: readiness.hasSkillTags,
      icon: CheckCircle2,
      href: "/profile",
    },
    {
      key: "hasLocationPreference",
      label: "Location set",
      completed: readiness.hasLocationPreference,
      icon: MapPin,
      href: "/profile",
    },
    {
      key: "hasCV",
      label: "Proof in vault",
      completed: readiness.hasCV,
      icon: FileText,
      href: "/growth/vault",
    },
  ];

  const completedCount = items.filter((i) => i.completed).length;

  return (
    <Card className="border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Journey Readiness</h3>
          <span className="text-xs text-muted-foreground">
            {completedCount}/{items.length} complete
          </span>
        </div>
        <div className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg transition-colors",
                  item.completed
                    ? "bg-emerald-50 dark:bg-emerald-950/20"
                    : "bg-gray-50 dark:bg-gray-900/20 hover:bg-gray-100 dark:hover:bg-gray-800/30"
                )}
              >
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center",
                    item.completed
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700"
                  )}
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Icon className="w-3 h-3 text-gray-500" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm flex-1",
                    item.completed
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
                {!item.completed && (
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                )}
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Stage Quick Links
function StageQuickLinks({ currentStage }: { currentStage: StageId }) {
  return (
    <div className="grid sm:grid-cols-3 gap-3">
      {STAGE_ORDER.map((stageId) => {
        const stage = STAGES[stageId];
        const Icon = stage.icon;
        const isCurrent = stageId === currentStage;

        return (
          <Link key={stageId} href={stage.route}>
            <Card
              className={cn(
                "border-2 transition-colors cursor-pointer h-full",
                isCurrent
                  ? "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20"
                  : "hover:border-gray-300"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      stageId === "explore" && "bg-blue-100 dark:bg-blue-900/30",
                      stageId === "build" && "bg-amber-100 dark:bg-amber-900/30",
                      stageId === "apply" && "bg-emerald-100 dark:bg-emerald-900/30"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5",
                        stageId === "explore" && "text-blue-600",
                        stageId === "build" && "text-amber-600",
                        stageId === "apply" && "text-emerald-600"
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{stage.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {stage.microcopy}
                    </p>
                  </div>
                  {isCurrent && (
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                      Next
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

export default function GrowthDashboardPage() {
  const { data: session, status: sessionStatus } = useSession();

  // Fetch readiness data
  const { data: readiness, isLoading: readinessLoading } = useQuery<ReadinessCheck>({
    queryKey: ["growth-readiness"],
    queryFn: async () => {
      const response = await fetch("/api/growth/readiness");
      if (!response.ok) throw new Error("Failed to fetch readiness");
      return response.json();
    },
    enabled: session?.user?.role === "YOUTH",
  });

  const isLoading = sessionStatus === "loading" || readinessLoading;

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-40 w-full" />
        <div className="grid sm:grid-cols-3 gap-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-48 w-full" />
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

  // Default readiness if not loaded
  const readinessData: ReadinessCheck = readiness || {
    hasTargetCareer: false,
    hasSkillTags: false,
    hasLocationPreference: false,
    hasCV: false,
  };

  // Determine suggested next stage
  const suggestedStage = getSuggestedStage(readinessData);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Next Stop Card */}
      <NextStopCard stageId={suggestedStage} readiness={readinessData} />

      {/* Stage Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <h3 className="font-semibold text-sm mb-3 text-muted-foreground">
          All Stages
        </h3>
        <StageQuickLinks currentStage={suggestedStage} />
      </motion.div>

      {/* Readiness Checklist */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <ReadinessChecklist readiness={readinessData} />
      </motion.div>

      {/* Help Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="text-center text-sm text-muted-foreground"
      >
        Complete each stage to unlock the next. Your progress is saved automatically.
      </motion.p>
    </div>
  );
}
