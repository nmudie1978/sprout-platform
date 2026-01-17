"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Briefcase,
  CheckCircle,
  Clock,
  GraduationCap,
  Lightbulb,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";

interface CareerRealityCheckProps {
  roleSlug: string;
}

export function CareerRealityCheck({ roleSlug }: CareerRealityCheckProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["reality-check", roleSlug],
    queryFn: async () => {
      const response = await fetch(`/api/careers/${roleSlug}/reality-check`);
      if (!response.ok) throw new Error("Failed to fetch reality check");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-48" />
          <div className="h-4 bg-muted rounded w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-5/6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data?.found) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Reality Check
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">
            Reality check coming soon for this career.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            We're working on honest, detailed information about what this career is really like.
          </p>
        </CardContent>
      </Card>
    );
  }

  const check = data.realityCheck;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Reality Check: {check.title}
          </CardTitle>
          <CardDescription className="mt-2 leading-relaxed">
            {check.overview}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Day-to-Day */}
          <Section
            icon={<Briefcase className="h-4 w-4" />}
            title="A Typical Day"
            color="text-blue-600"
          >
            <ul className="space-y-2">
              {check.dayToDay.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Separator />

          {/* Misconceptions */}
          <Section
            icon={<AlertCircle className="h-4 w-4" />}
            title="Common Misconceptions"
            color="text-amber-600"
          >
            <ul className="space-y-2">
              {check.misconceptions.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <XCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Separator />

          {/* Hard Parts */}
          <Section
            icon={<Target className="h-4 w-4" />}
            title="The Hard Parts"
            color="text-red-600"
          >
            <ul className="space-y-2">
              {check.hardParts.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-red-500 mt-0.5 flex-shrink-0">!</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Separator />

          {/* Starter Steps */}
          <Section
            icon={<TrendingUp className="h-4 w-4" />}
            title="How to Get Started"
            color="text-green-600"
          >
            <ol className="space-y-2">
              {check.starterSteps.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">
                    {i + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </Section>

          <Separator />

          {/* Typical Path */}
          <Section
            icon={<GraduationCap className="h-4 w-4" />}
            title="Typical Career Path"
            color="text-purple-600"
          >
            <div className="flex flex-wrap gap-2">
              {check.typicalPath.map((step: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
                  >
                    {step}
                  </Badge>
                  {i < check.typicalPath.length - 1 && (
                    <span className="text-muted-foreground">→</span>
                  )}
                </div>
              ))}
            </div>
          </Section>

          <Separator />

          {/* Skill Gaps */}
          <Section
            icon={<Target className="h-4 w-4" />}
            title="Skills to Develop"
            color="text-cyan-600"
          >
            <div className="flex flex-wrap gap-2">
              {check.skillGaps.map((skill: string, i: number) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </Section>

          {/* Market Note */}
          <div className="mt-6 p-4 rounded-lg bg-muted/50 border">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium text-sm mb-1">Market Outlook</div>
                <p className="text-sm text-muted-foreground">{check.saturationNote}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  color: string;
  children: React.ReactNode;
}

function Section({ icon, title, color, children }: SectionProps) {
  return (
    <div>
      <h3 className={`font-semibold text-sm flex items-center gap-2 mb-3 ${color}`}>
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}
