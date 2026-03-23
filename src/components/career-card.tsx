"use client";

import { useState, memo, type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  GraduationCap,
  Banknote,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Sparkles,
  BookOpen,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import type { Career } from "@/lib/career-pathways";
import { CareerRealityCheck } from "./career-reality-check";
import { CareerProgression, CareerProgressionCompact } from "./career-progression";

interface CareerCardProps {
  career: Career;
  compact?: boolean;
  matchScore?: number;
  showExpandButton?: boolean;
  showRealityCheck?: boolean;
}

const growthConfig = {
  high: {
    icon: TrendingUp,
    label: "High Growth",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/30",
  },
  medium: {
    icon: Minus,
    label: "Moderate Growth",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30",
  },
  stable: {
    icon: TrendingDown,
    label: "Stable",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30",
  },
};

/* ------------------------------------------------------------------ */
/*  AccordionSection — internal collapsible section                   */
/* ------------------------------------------------------------------ */

function AccordionSection({
  icon,
  title,
  iconColor,
  children,
  defaultOpen = false,
}: {
  icon: ReactNode;
  title: string;
  iconColor?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-t">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
      >
        <span className={iconColor}>{icon}</span>
        <span className="text-sm font-medium flex-1">{title}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Action buttons (shared between full & compact)                    */
/* ------------------------------------------------------------------ */

function ActionButtons({
  title,
  small = false,
}: {
  title: string;
  small?: boolean;
}) {
  const q = encodeURIComponent(title);

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        variant="outline"
        size={small ? "sm" : "default"}
        className={small ? "text-xs h-7" : "text-sm"}
        asChild
      >
        <a
          href={`https://www.coursera.org/search?query=${q}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <BookOpen className={small ? "h-3 w-3 mr-1" : "h-4 w-4 mr-1.5"} />
          Start Learning
        </a>
      </Button>
      <Button
        variant="outline"
        size={small ? "sm" : "default"}
        className={small ? "text-xs h-7" : "text-sm"}
        asChild
      >
        <a
          href={`https://www.linkedin.com/jobs/search/?keywords=${q}&location=Norway`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink className={small ? "h-3 w-3 mr-1" : "h-4 w-4 mr-1.5"} />
          See Job Listings
        </a>
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CareerCard                                                        */
/* ------------------------------------------------------------------ */

export const CareerCard = memo(function CareerCard({
  career,
  compact = false,
  matchScore,
  showExpandButton = true,
  showRealityCheck = false,
}: CareerCardProps) {
  const [expanded, setExpanded] = useState(false);
  const growth = growthConfig[career.growthOutlook];
  const GrowthIcon = growth.icon;

  /* ---------- COMPACT MODE ---------- */
  if (compact) {
    return (
      <Card className="overflow-hidden border-2 hover:border-teal-500/30 transition-colors">
        <CardContent className="p-0">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="p-3"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{career.emoji}</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{career.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                  {career.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    <Banknote className="h-3 w-3 mr-1" />
                    {career.avgSalary.split(" ")[0]}
                  </Badge>
                  <Badge variant="outline" className={`text-xs px-1.5 py-0 ${growth.bg}`}>
                    <GrowthIcon className={`h-3 w-3 mr-1 ${growth.color}`} />
                    <span className={growth.color}>{career.growthOutlook}</span>
                  </Badge>
                </div>
                <div className="mt-2">
                  <ActionButtons title={career.title} small />
                </div>
              </div>
              {matchScore !== undefined && (
                <div className="flex flex-col items-center">
                  <div className="relative w-10 h-10">
                    <svg className="w-10 h-10 transform -rotate-90">
                      <circle
                        cx="20"
                        cy="20"
                        r="16"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        className="text-muted/30"
                      />
                      <circle
                        cx="20"
                        cy="20"
                        r="16"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray={`${matchScore} 100`}
                        className="text-teal-500"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                      {matchScore}%
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Match</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Expandable Details for compact mode */}
          {showExpandButton && (
            <>
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 py-3 border-t space-y-3">
                      {/* Key Skills */}
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <Sparkles className="h-3 w-3 text-teal-500" />
                          <span className="text-xs font-medium">Key Skills</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {career.keySkills.slice(0, 4).map((skill) => (
                            <Badge
                              key={skill}
                              variant="outline"
                              className="text-[10px] capitalize bg-teal-500/5 border-teal-500/20"
                            >
                              {skill.replace("-", " ")}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Career Progression */}
                      <CareerProgressionCompact careerId={career.id} />

                      {/* Education Path */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <GraduationCap className="h-3 w-3 text-blue-500" />
                          <span className="text-xs font-medium">Education</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {career.educationPath}
                        </p>
                      </div>

                      {/* Reality Check */}
                      {showRealityCheck && (
                        <div className="mt-2">
                          <CareerRealityCheck roleSlug={career.id} />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="button"
                variant="ghost"
                className="w-full rounded-none border-t h-8 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Learn More
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  /* ---------- FULL MODE ---------- */
  const searchQuery = encodeURIComponent(career.title);

  return (
    <Card className="overflow-hidden border hover:border-teal-500/30 transition-colors">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 bg-teal-50/30 dark:bg-teal-950/10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="text-3xl">{career.emoji}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg tracking-tight">{career.title}</h3>
                  {career.entryLevel && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      Entry Level
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {career.description}
                </p>
              </div>
            </div>
            {matchScore !== undefined && (
              <div className="flex flex-col items-center shrink-0">
                <div className="relative w-14 h-14">
                  <svg className="w-14 h-14 transform -rotate-90">
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-muted/30"
                    />
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${(matchScore / 100) * 150.8} 150.8`}
                      className="text-teal-500"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                    {matchScore}%
                  </span>
                </div>
                <span className="text-xs text-muted-foreground mt-1">Match</span>
              </div>
            )}
          </div>

          {/* Salary & Growth stat boxes */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="rounded-lg bg-muted/50 px-3 py-2.5 flex items-center gap-2">
              <Banknote className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Salary</p>
                <p className="text-sm font-semibold truncate">{career.avgSalary}</p>
              </div>
            </div>
            <div className={`rounded-lg px-3 py-2.5 flex items-center gap-2 border ${growth.bg}`}>
              <GrowthIcon className={`h-4 w-4 shrink-0 ${growth.color}`} />
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Growth</p>
                <p className={`text-sm font-semibold ${growth.color}`}>{growth.label}</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-3">
            <ActionButtons title={career.title} />
          </div>
        </div>

        {/* Accordion Sections */}
        <AccordionSection
          icon={<Sparkles className="h-4 w-4" />}
          title="Skills You'll Use"
          iconColor="text-teal-500"
        >
          <div className="flex flex-wrap gap-1.5">
            {career.keySkills.map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="text-xs capitalize bg-teal-500/5 border-teal-500/20"
              >
                {skill.replace("-", " ")}
              </Badge>
            ))}
          </div>
        </AccordionSection>

        <AccordionSection
          icon={<Briefcase className="h-4 w-4" />}
          title="What You'll Do"
          iconColor="text-amber-500"
        >
          <ul className="text-sm text-muted-foreground space-y-1">
            {career.dailyTasks.map((task, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-teal-500 mt-1">•</span>
                {task}
              </li>
            ))}
          </ul>
        </AccordionSection>

        <AccordionSection
          icon={<GraduationCap className="h-4 w-4" />}
          title="Education Path"
          iconColor="text-blue-500"
        >
          <p className="text-sm text-muted-foreground">
            {career.educationPath}
          </p>
          <a
            href={`https://www.classcentral.com/search?q=${searchQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2"
          >
            <BookOpen className="h-3 w-3" />
            Find courses
          </a>
        </AccordionSection>

        <AccordionSection
          icon={<TrendingUp className="h-4 w-4" />}
          title="Career Progression"
          iconColor="text-emerald-500"
        >
          <CareerProgression careerId={career.id} />
        </AccordionSection>

        {showRealityCheck && (
          <AccordionSection
            icon={<AlertTriangle className="h-4 w-4" />}
            title="Reality Check"
            iconColor="text-amber-500"
          >
            <CareerRealityCheck roleSlug={career.id} />
          </AccordionSection>
        )}
      </CardContent>
    </Card>
  );
});
