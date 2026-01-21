"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import {
  Briefcase,
  MessageSquare,
  Eye,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface JourneyActivity {
  id: string;
  type: "job_completed" | "reflection_added" | "shadow_completed" | "skill_updated" | "career_explored";
  title: string;
  description?: string;
  date: Date;
  href?: string;
}

interface RecentJourneyActivityProps {
  activities: JourneyActivity[];
}

const activityIcons = {
  job_completed: Briefcase,
  reflection_added: MessageSquare,
  shadow_completed: Eye,
  skill_updated: Sparkles,
  career_explored: Sparkles,
};

const activityColors = {
  job_completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  reflection_added: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  shadow_completed: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  skill_updated: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  career_explored: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

function ActivityItem({ activity, index }: { activity: JourneyActivity; index: number }) {
  const Icon = activityIcons[activity.type];
  const colorClass = activityColors[activity.type];

  const content = (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group"
    >
      <div className={`p-2 rounded-lg shrink-0 ${colorClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground">{activity.title}</p>
        {activity.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {activity.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground/70 mt-1">
          {formatDistanceToNow(activity.date, { addSuffix: true })}
        </p>
      </div>
      {activity.href && (
        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
      )}
    </motion.div>
  );

  if (activity.href) {
    return (
      <Link href={activity.href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

export function RecentJourneyActivity({ activities }: RecentJourneyActivityProps) {
  if (activities.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Your Recent Journey Activity
        </h2>
        <Link
          href="/my-journey"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          View all
        </Link>
      </div>
      <Card className="border bg-card/50">
        <CardContent className="p-2">
          <div className="divide-y divide-border/50">
            {activities.slice(0, 4).map((activity, index) => (
              <ActivityItem key={activity.id} activity={activity} index={index} />
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default RecentJourneyActivity;
