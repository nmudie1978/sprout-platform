/**
 * SKILL LONGEVITY INDEX
 *
 * Displays skills categorized by their expected longevity:
 * - Evergreen: Always valuable
 * - Emerging: Growing in demand
 * - Volatile: May change rapidly
 *
 * Each skill includes why it matters and a quick-start action.
 */

"use client";

import { useState } from "react";
import {
  Leaf,
  Sprout,
  Wind,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type SkillCategory = "evergreen" | "emerging" | "volatile";

interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  whyItMatters: string;
  quickStartLabel: string;
  quickStartUrl: string;
  quickStartTime: string; // e.g., "5 min"
}

// Curated skill data
// TODO: Connect to backend when available
const SKILLS_DATA: Skill[] = [
  // Evergreen Skills
  {
    id: "skill-1",
    name: "Clear Communication",
    category: "evergreen",
    whyItMatters: "Essential in every role and industry, regardless of technology changes",
    quickStartLabel: "Watch: How to explain anything clearly",
    quickStartUrl: "https://www.youtube.com/results?search_query=how+to+communicate+clearly",
    quickStartTime: "5 min",
  },
  {
    id: "skill-2",
    name: "Problem Solving",
    category: "evergreen",
    whyItMatters: "Employers consistently rank this as the #1 skill they look for",
    quickStartLabel: "Try: Solve a puzzle on Brilliant.org",
    quickStartUrl: "https://brilliant.org/",
    quickStartTime: "10 min",
  },
  {
    id: "skill-3",
    name: "Adaptability",
    category: "evergreen",
    whyItMatters: "With rapid change, those who adapt thrive in any environment",
    quickStartLabel: "Read: Learning how to learn",
    quickStartUrl: "https://www.coursera.org/learn/learning-how-to-learn",
    quickStartTime: "5 min",
  },

  // Emerging Skills
  {
    id: "skill-4",
    name: "AI Literacy",
    category: "emerging",
    whyItMatters: "Understanding AI tools is becoming basic workplace literacy",
    quickStartLabel: "Try: Chat with Claude or ChatGPT",
    quickStartUrl: "https://claude.ai/",
    quickStartTime: "5 min",
  },
  {
    id: "skill-5",
    name: "Data Interpretation",
    category: "emerging",
    whyItMatters: "Every industry now relies on data-driven decisions",
    quickStartLabel: "Watch: Intro to reading data",
    quickStartUrl: "https://www.khanacademy.org/math/statistics-probability",
    quickStartTime: "10 min",
  },
  {
    id: "skill-6",
    name: "Sustainability Awareness",
    category: "emerging",
    whyItMatters: "Green transition is creating new roles and reshaping existing ones",
    quickStartLabel: "Read: Green jobs overview",
    quickStartUrl: "https://www.ilo.org/global/topics/green-jobs/lang--en/index.htm",
    quickStartTime: "5 min",
  },

  // Volatile Skills
  {
    id: "skill-7",
    name: "Specific Software Tools",
    category: "volatile",
    whyItMatters: "Tools change; underlying concepts matter more",
    quickStartLabel: "Focus: Learn principles, not just buttons",
    quickStartUrl: "https://www.youtube.com/results?search_query=software+principles+beginners",
    quickStartTime: "5 min",
  },
  {
    id: "skill-8",
    name: "Platform-Specific Knowledge",
    category: "volatile",
    whyItMatters: "Social platforms and tech stacks evolve rapidly",
    quickStartLabel: "Tip: Build transferable skills first",
    quickStartUrl: "https://www.freecodecamp.org/",
    quickStartTime: "5 min",
  },
  {
    id: "skill-9",
    name: "Trendy Frameworks",
    category: "volatile",
    whyItMatters: "Hot today, replaced tomorrow. Core languages last longer.",
    quickStartLabel: "Learn: Core JavaScript basics",
    quickStartUrl: "https://javascript.info/",
    quickStartTime: "10 min",
  },
];

const CATEGORY_CONFIG: Record<
  SkillCategory,
  {
    label: string;
    icon: typeof Leaf;
    color: string;
    bgColor: string;
    description: string;
  }
> = {
  evergreen: {
    label: "Evergreen",
    icon: Leaf,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    description: "Always valuable, regardless of tech changes",
  },
  emerging: {
    label: "Emerging",
    icon: Sprout,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    description: "Growing rapidly in demand",
  },
  volatile: {
    label: "Volatile",
    icon: Wind,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    description: "May change quickly; learn fundamentals instead",
  },
};

interface SkillLongevityIndexProps {
  className?: string;
  onAddToJourney?: (skill: Skill) => void;
  initialExpanded?: boolean;
}

export function SkillLongevityIndex({
  className,
  onAddToJourney,
  initialExpanded = false,
}: SkillLongevityIndexProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [activeCategory, setActiveCategory] = useState<SkillCategory | "all">("all");

  const filteredSkills =
    activeCategory === "all"
      ? SKILLS_DATA
      : SKILLS_DATA.filter((s) => s.category === activeCategory);

  const visibleSkills = isExpanded ? filteredSkills : filteredSkills.slice(0, 3);

  return (
    <Card className={`border overflow-hidden ${className}`}>
      <div className="h-0.5 bg-gradient-to-r from-green-400 via-blue-400 to-amber-400" />

      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Clock className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
            Skill Longevity Index
          </CardTitle>
          {/* Inline category filter pills */}
          <div className="flex gap-1">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                activeCategory === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              All
            </button>
            {(Object.keys(CATEGORY_CONFIG) as SkillCategory[]).map((cat) => {
              const config = CATEGORY_CONFIG[cat];
              const CatIcon = config.icon;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors flex items-center gap-0.5 ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }`}
                >
                  <CatIcon className="h-2.5 w-2.5" />
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-3 pt-2 space-y-1">
        {/* Compact skills rows */}
        {visibleSkills.map((skill) => {
          const config = CATEGORY_CONFIG[skill.category];
          const SkillIcon = config.icon;

          return (
            <div
              key={skill.id}
              className="flex items-center gap-2 py-1.5 px-2 rounded-md border bg-card hover:bg-muted/30 transition-colors group"
            >
              <div className={`p-0.5 rounded ${config.bgColor} flex-shrink-0`}>
                <SkillIcon className={`h-3 w-3 ${config.color}`} />
              </div>
              <span className="text-xs font-medium flex-shrink-0">{skill.name}</span>
              <span className="text-[10px] text-muted-foreground truncate hidden sm:inline">
                — {skill.whyItMatters}
              </span>
              <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
                <a
                  href={skill.quickStartUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span>{skill.quickStartTime}</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
                {onAddToJourney && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddToJourney(skill)}
                    className="h-5 px-1.5 text-[9px] opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Plus className="h-2.5 w-2.5" />
                  </Button>
                )}
                <Badge
                  variant="secondary"
                  className={`text-[8px] px-1 py-0 leading-tight ${config.bgColor} ${config.color}`}
                >
                  {config.label}
                </Badge>
              </div>
            </div>
          );
        })}

        {/* Expand/collapse */}
        {filteredSkills.length > 3 && (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[10px] h-6 px-2"
            >
              {isExpanded ? (
                <>
                  Show less
                  <ChevronUp className="h-2.5 w-2.5 ml-1" />
                </>
              ) : (
                <>
                  +{filteredSkills.length - 3} more
                  <ChevronDown className="h-2.5 w-2.5 ml-1" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* Source note */}
        <p className="text-[9px] text-muted-foreground/50 text-center pt-1 border-t">
          Based on WEF Future of Jobs Report
        </p>
      </CardContent>
    </Card>
  );
}

export default SkillLongevityIndex;
