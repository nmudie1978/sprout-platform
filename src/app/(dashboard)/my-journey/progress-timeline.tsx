"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Briefcase,
  CheckCircle2,
  Star,
  MessageSquare,
  Award,
  Heart,
  Lightbulb,
  Calendar,
  Sparkles,
  Eye,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Types
type TimelineEntryType =
  | "job_applied"
  | "job_completed"
  | "feedback_received"
  | "skill_demonstrated"
  | "reflection_added"
  | "volunteer_experience"
  | "certificate_earned"
  | "goal_set"
  | "milestone"
  | "shadow_completed";

interface TimelineEntry {
  id: string;
  type: TimelineEntryType;
  title: string;
  description?: string;
  date: Date;
  metadata?: {
    jobTitle?: string;
    rating?: number;
    skillName?: string;
    certificateName?: string;
  };
}

// Entry type configuration
const ENTRY_CONFIG: Record<
  TimelineEntryType,
  {
    icon: React.ElementType;
    color: string;
    bgColor: string;
    label: string;
  }
> = {
  job_applied: {
    icon: Briefcase,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    label: "Applied",
  },
  job_completed: {
    icon: CheckCircle2,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
    label: "Completed",
  },
  feedback_received: {
    icon: MessageSquare,
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
    label: "Feedback",
  },
  skill_demonstrated: {
    icon: Star,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    label: "Skill",
  },
  reflection_added: {
    icon: Lightbulb,
    color: "text-cyan-600",
    bgColor: "bg-cyan-500/10",
    label: "Reflection",
  },
  volunteer_experience: {
    icon: Heart,
    color: "text-rose-600",
    bgColor: "bg-rose-500/10",
    label: "Volunteer",
  },
  certificate_earned: {
    icon: Award,
    color: "text-indigo-600",
    bgColor: "bg-indigo-500/10",
    label: "Certificate",
  },
  goal_set: {
    icon: Calendar,
    color: "text-teal-600",
    bgColor: "bg-teal-500/10",
    label: "Goal",
  },
  milestone: {
    icon: Sparkles,
    color: "text-orange-600",
    bgColor: "bg-orange-500/10",
    label: "Milestone",
  },
  shadow_completed: {
    icon: Eye,
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
    label: "Shadow",
  },
};

// Timeline Entry Component
function TimelineEntryItem({
  entry,
  isFirst,
  isLast,
}: {
  entry: TimelineEntry;
  isFirst: boolean;
  isLast: boolean;
}) {
  const config = ENTRY_CONFIG[entry.type];
  const Icon = config.icon;

  return (
    <div className="flex gap-4">
      {/* Timeline line and dot */}
      <div className="flex flex-col items-center">
        <div
          className={`
            w-10 h-10 rounded-full flex items-center justify-center shrink-0
            ${config.bgColor}
          `}
        >
          <Icon className={`h-5 w-5 ${config.color}`} />
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-muted mt-2" />}
      </div>

      {/* Content */}
      <div className={`flex-1 pb-6 ${isLast ? "" : ""}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-medium ${config.color}`}>
            {config.label}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(entry.date, { addSuffix: true })}
          </span>
        </div>
        <h4 className="font-medium text-sm">{entry.title}</h4>
        {entry.description && (
          <p className="text-xs text-muted-foreground mt-1">
            {entry.description}
          </p>
        )}
        {entry.metadata?.rating && (
          <div className="flex items-center gap-1 mt-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < entry.metadata!.rating!
                    ? "text-amber-500 fill-amber-500"
                    : "text-muted"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Empty State Component
function EmptyTimeline() {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
        <Calendar className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-medium mb-2">Your journey is just beginning</h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
        As you complete jobs, earn feedback, and build skills, your progress will
        appear here.
      </p>
    </div>
  );
}

// Main Progress Timeline Component
interface ProgressTimelineProps {
  entries?: TimelineEntry[];
  maxEntries?: number;
}

export function ProgressTimeline({
  entries = [],
  maxEntries = 10,
}: ProgressTimelineProps) {
  // Sort entries by date (most recent first)
  const sortedEntries = [...entries]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, maxEntries);

  // Generate sample entries for demo (in production, this comes from API)
  const getSampleEntries = (): TimelineEntry[] => {
    const now = new Date();
    return [
      {
        id: "1",
        type: "milestone",
        title: "Joined Sprout",
        description: "Started your career exploration journey",
        date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      },
    ];
  };

  const displayEntries = sortedEntries.length > 0 ? sortedEntries : getSampleEntries();
  const hasRealEntries = entries.length > 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          Proof & Progress
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Your journey builds over time. Every step counts.
        </p>
      </CardHeader>
      <CardContent>
        {!hasRealEntries && entries.length === 0 ? (
          <EmptyTimeline />
        ) : (
          <div className="space-y-0">
            {displayEntries.map((entry, idx) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <TimelineEntryItem
                  entry={entry}
                  isFirst={idx === 0}
                  isLast={idx === displayEntries.length - 1}
                />
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Export types for use in other components
export type { TimelineEntry, TimelineEntryType };
