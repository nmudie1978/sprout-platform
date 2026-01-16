"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Briefcase,
  TrendingUp,
  AlertCircle,
  Banknote,
  Building,
  Target,
  Heart,
  X,
  Bookmark,
  Award,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";

interface CareerDetailModalProps {
  card: any;
  matchedSkills: string[];
  onClose: () => void;
  onSwipe: (direction: "LEFT" | "RIGHT" | "UP") => void;
}

export function CareerDetailModal({
  card,
  matchedSkills,
  onClose,
  onSwipe,
}: CareerDetailModalProps) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Briefcase className="h-6 w-6 text-primary" />
            {card.roleName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary */}
          <div>
            <p className="text-muted-foreground">{card.summary}</p>
          </div>

          {/* Matched Skills */}
          {matchedSkills.length > 0 && (
            <div className="rounded-lg bg-green-100 p-4 dark:bg-green-950/30">
              <p className="flex items-center gap-2 font-medium text-green-800 dark:text-green-200">
                <TrendingUp className="h-5 w-5" />
                You already practice {matchedSkills.length} skill
                {matchedSkills.length > 1 ? "s" : ""} needed for this role!
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {matchedSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="bg-green-200 text-green-900 dark:bg-green-900/50"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Key Traits */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 font-semibold">
              <Target className="h-5 w-5" />
              Key Traits Needed
            </h3>
            <div className="flex flex-wrap gap-2">
              {card.traits.map((trait: string) => (
                <Badge key={trait} variant="outline">
                  {trait}
                </Badge>
              ))}
            </div>
          </div>

          {/* Day in the Life */}
          <div>
            <h3 className="mb-3 font-semibold">A Day in the Life</h3>
            <ul className="space-y-2">
              {card.dayInLife.map((item: string, i: number) => (
                <li key={i} className="flex gap-3">
                  <span className="text-primary">•</span>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Reality Check */}
          <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                Reality Check
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {card.realityCheck}
              </p>
            </CardContent>
          </Card>

          {/* Required Certifications - Prominent Section */}
          <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-purple-500/5 to-blue-500/5 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-600 shadow-md">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                Required Qualifications & Certifications
              </CardTitle>
              <CardDescription>
                These are typically needed to be eligible for this position
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {card.certifications?.map((cert: string, i: number) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-lg bg-background/50 p-3 border border-primary/20 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm leading-relaxed">{cert}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Salary & Companies */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Banknote className="h-5 w-5" />
                  Salary Range
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">{card.salaryBand}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building className="h-5 w-5" />
                  Example Companies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {card.companies.map((company: string) => (
                    <Badge key={company} variant="secondary">
                      {company}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Next Steps */}
          <div>
            <h3 className="mb-3 font-semibold">Next Steps to Get Started</h3>
            <ul className="space-y-2">
              {card.nextSteps.map((step: string, i: number) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 border-t pt-6">
            <Button
              variant="outline"
              className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
              onClick={() => onSwipe("LEFT")}
            >
              <X className="mr-2 h-4 w-4" />
              Not for Me
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-blue-500 text-blue-500 hover:bg-blue-50"
              onClick={() => onSwipe("UP")}
            >
              <Bookmark className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button
              className="flex-1 bg-green-500 hover:bg-green-600"
              onClick={() => onSwipe("RIGHT")}
            >
              <Heart className="mr-2 h-4 w-4" />
              Interested
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
