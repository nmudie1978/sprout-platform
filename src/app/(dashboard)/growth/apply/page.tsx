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
  Briefcase,
  Search,
  FileText,
  CheckCircle2,
  AlertCircle,
  Bot,
  Target,
  MapPin,
  Send,
  Star,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { StageBanner } from "@/components/growth/stage-banner";
import { getMultipleCareerJourneys, type MultipleCareerJourneys, type SingleCareerJourney } from "@/lib/my-path/actions";
import type { ReadinessCheck } from "@/lib/growth/stage-config";
import { cn } from "@/lib/utils";

// Application Readiness Card
function ApplicationReadinessCard({
  readiness,
  journey,
}: {
  readiness: ReadinessCheck;
  journey?: SingleCareerJourney;
}) {
  const checks = [
    {
      key: "career",
      label: "Career goal set",
      completed: readiness.hasTargetCareer,
      detail: journey?.targetCareer.title,
    },
    {
      key: "skills",
      label: "Skills added",
      completed: readiness.hasSkillTags,
    },
    {
      key: "location",
      label: "Location set",
      completed: readiness.hasLocationPreference,
    },
    {
      key: "proof",
      label: "Proof in vault",
      completed: readiness.hasCV,
      detail: "Certificates, badges, or work samples",
    },
  ];

  const completedCount = checks.filter((c) => c.completed).length;
  const isReady = completedCount >= 3;

  return (
    <Card
      className={cn(
        "border-2",
        isReady
          ? "border-emerald-300 bg-emerald-50/50"
          : "border-amber-300 bg-amber-50/50"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "p-2 rounded-lg",
              isReady ? "bg-emerald-100" : "bg-amber-100"
            )}
          >
            {isReady ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-amber-600" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">
              {isReady ? "Ready to Apply!" : "Almost Ready"}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {isReady
                ? "Your profile is complete. Start applying to opportunities!"
                : "Complete your profile to improve your chances"}
            </p>

            <div className="space-y-2">
              {checks.map((check) => (
                <div key={check.key} className="flex items-center gap-2">
                  {check.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                  )}
                  <span
                    className={cn(
                      "text-sm",
                      check.completed ? "text-gray-700" : "text-muted-foreground"
                    )}
                  >
                    {check.label}
                    {check.detail && check.completed && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({check.detail})
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>

            {!isReady && (
              <Link href="/growth/build">
                <Button variant="outline" size="sm" className="mt-3">
                  Complete Profile
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            )}
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
  external,
  badge,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  href: string;
  external?: boolean;
  badge?: string;
}) {
  const content = (
    <Card className="border hover:border-emerald-200 transition-colors cursor-pointer h-full">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-lg", iconBg)}>
            <Icon className={cn("w-5 h-5", iconColor)} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm">{title}</p>
              {badge && (
                <Badge className="text-[10px] px-1.5 py-0 h-4 bg-emerald-100 text-emerald-700 border-0">
                  {badge}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          {external ? (
            <ExternalLink className="w-4 h-4 text-muted-foreground mt-1" />
          ) : (
            <ArrowRight className="w-4 h-4 text-muted-foreground mt-1" />
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return <Link href={href}>{content}</Link>;
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
              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700"
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

export default function ApplyStagePage() {
  const { data: session, status: sessionStatus } = useSession();
  const [activeCareerIndex, setActiveCareerIndex] = useState(0);

  const { data: multiJourneys, isLoading: journeysLoading } = useQuery<MultipleCareerJourneys | null>({
    queryKey: ["multiple-career-journeys"],
    queryFn: () => getMultipleCareerJourneys(),
    enabled: session?.user?.role === "YOUTH",
  });

  const { data: readiness, isLoading: readinessLoading } = useQuery<ReadinessCheck>({
    queryKey: ["growth-readiness"],
    queryFn: async () => {
      const response = await fetch("/api/growth/readiness");
      if (!response.ok) throw new Error("Failed to fetch readiness");
      return response.json();
    },
    enabled: session?.user?.role === "YOUTH",
  });

  const isLoading = sessionStatus === "loading" || journeysLoading || readinessLoading;

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
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
  const hasCareerGoals = journeys.length > 0;
  const activeJourney = journeys[activeCareerIndex];
  const readinessData: ReadinessCheck = readiness || {
    hasTargetCareer: false,
    hasSkillTags: false,
    hasLocationPreference: false,
    hasCV: false,
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Stage Banner */}
      <StageBanner stageId="apply" />

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
                    Know what you&apos;re aiming for before applying
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

      {/* Application Readiness */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
      >
        <ApplicationReadinessCard
          readiness={readinessData}
          journey={activeJourney}
        />
      </motion.div>

      {/* Apply Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Send className="w-4 h-4 text-emerald-600" />
          <h2 className="font-semibold text-sm">Find Opportunities</h2>
        </div>
        <div className="grid gap-2">
          <QuickActionCard
            icon={Briefcase}
            iconBg="bg-emerald-100 dark:bg-emerald-900/30"
            iconColor="text-emerald-600"
            title="Browse Small Jobs"
            description="Find local jobs to build experience and earn"
            href="/jobs"
            badge="Quick Wins"
          />
          <QuickActionCard
            icon={Search}
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            iconColor="text-blue-600"
            title="Search Career Jobs"
            description={
              activeJourney
                ? `Find ${activeJourney.targetCareer.title} positions`
                : "Find positions in your target field"
            }
            href={
              activeJourney
                ? `https://www.finn.no/job/fulltime/search.html?q=${encodeURIComponent(activeJourney.targetCareer.title)}`
                : "https://www.finn.no/job/fulltime/search.html"
            }
            external
          />
          <QuickActionCard
            icon={Star}
            iconBg="bg-purple-100 dark:bg-purple-900/30"
            iconColor="text-purple-600"
            title="Traineeships & Internships"
            description="Entry-level opportunities to get started"
            href="https://www.finn.no/job/fulltime/search.html?occupation=0.71"
            external
          />
        </div>
      </motion.div>

      {/* Your Application Kit */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-amber-600" />
          <h2 className="font-semibold text-sm">Your Application Kit</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          <QuickActionCard
            icon={FileText}
            iconBg="bg-amber-100 dark:bg-amber-900/30"
            iconColor="text-amber-600"
            title="Your Vault"
            description="Proof, certificates, and achievements"
            href="/growth/vault"
          />
          <QuickActionCard
            icon={Star}
            iconBg="bg-green-100 dark:bg-green-900/30"
            iconColor="text-green-600"
            title="Your Profile"
            description="Update your public profile"
            href="/profile"
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
                <h3 className="font-semibold">Need help with applications?</h3>
                <p className="text-sm text-muted-foreground">
                  Get tips on CVs, cover letters, and interviews
                </p>
              </div>
              <Link
                href={
                  activeJourney
                    ? `/career-advisor?goal=${encodeURIComponent(activeJourney.targetCareer.title)}&prompt=How do I write a good application for ${activeJourney.targetCareer.title} roles?`
                    : "/career-advisor?prompt=How do I write a good job application?"
                }
              >
                <Button variant="outline" className="border-purple-300">
                  <Bot className="w-4 h-4 mr-2" />
                  Get Help
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
