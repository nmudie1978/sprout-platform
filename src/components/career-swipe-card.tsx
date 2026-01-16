"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Award,
  GraduationCap
} from "lucide-react";

interface CareerCard {
  id: string;
  roleName: string;
  summary: string;
  traits: string[];
  dayInLife: string[];
  realityCheck: string;
  salaryBand: string;
  companies: string[];
  certifications: string[];
  nextSteps: string[];
  tags: string[];
}

interface CareerSwipeCardProps {
  card: CareerCard;
  matchedSkills?: string[];
  onShowDetails: () => void;
}

export function CareerSwipeCard({
  card,
  matchedSkills = [],
  onShowDetails,
}: CareerSwipeCardProps) {
  return (
    <Card className="w-full overflow-hidden border shadow-lg bg-background">
      {/* Header */}
      <div className="bg-muted/30 p-5 border-b">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-2xl font-bold">
              {card.roleName}
            </CardTitle>
            <CardDescription className="mt-2 text-sm">
              {card.summary}
            </CardDescription>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
        </div>

        {/* Matched Skills Banner */}
        {matchedSkills.length > 0 && (
          <div className="mt-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3 border border-emerald-200 dark:border-emerald-800">
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
              <TrendingUp className="h-4 w-4" />
              You already practice {matchedSkills.length} skill
              {matchedSkills.length > 1 ? "s" : ""} needed for this role!
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {matchedSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 text-xs"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <CardContent className="space-y-5 p-5">
        {/* Key Traits */}
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Briefcase className="h-4 w-4" />
            Key Traits
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {card.traits.map((trait) => (
              <Badge key={trait} variant="outline" className="text-xs">
                {trait}
              </Badge>
            ))}
          </div>
        </div>

        {/* Day in Life */}
        <div>
          <h3 className="mb-2 text-sm font-semibold">A Day in the Life</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {card.dayInLife.slice(0, 3).map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Reality Check */}
        <div className="rounded-lg bg-muted/50 p-3 border">
          <h3 className="mb-1.5 flex items-center gap-2 text-sm font-semibold">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            Reality Check
          </h3>
          <p className="text-sm text-muted-foreground">
            {card.realityCheck.slice(0, 150)}...
          </p>
        </div>

        {/* Required Certifications */}
        <div className="rounded-lg bg-primary/5 p-3 border border-primary/20">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <GraduationCap className="h-4 w-4 text-primary" />
            Required Qualifications
          </h3>
          <div className="space-y-1.5">
            {card.certifications.slice(0, 2).map((cert, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <Award className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
                <span className="text-muted-foreground">{cert}</span>
              </div>
            ))}
            {card.certifications.length > 2 && (
              <p className="text-xs text-muted-foreground italic">
                +{card.certifications.length - 2} more requirements
              </p>
            )}
          </div>
        </div>

        {/* Salary & Companies */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
            <p className="font-medium text-emerald-700 dark:text-emerald-400 text-xs">Salary Range</p>
            <p className="text-sm font-semibold mt-0.5">{card.salaryBand}</p>
          </div>
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <p className="font-medium text-blue-700 dark:text-blue-400 text-xs">Example Companies</p>
            <p className="text-sm font-semibold mt-0.5">
              {card.companies.slice(0, 2).join(", ")}
            </p>
          </div>
        </div>

        {/* View Details Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={onShowDetails}
        >
          View Full Details
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
