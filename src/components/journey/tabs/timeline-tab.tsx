'use client';

import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Briefcase,
  Star,
  Heart,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Award,
  SkipForward,
  Map as MapIcon,
  TrendingUp,
  Bookmark,
  MessageCircle,
  UserPlus,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import type { TimelineEventData, TimelineEventTypeId } from '@/lib/journey/types';

// Icon mapping for event types
const eventIcons: Record<TimelineEventTypeId, React.ComponentType<{ className?: string }>> = {
  PROFILE_CREATED: UserPlus,
  STRENGTHS_CONFIRMED: Star,
  CAREER_EXPLORED: Heart,
  ROLE_DEEP_DIVE_COMPLETED: Search,
  PRIMARY_GOAL_SET: Star,
  INDUSTRY_OUTLOOK_REVIEWED: TrendingUp,
  REQUIREMENTS_REVIEWED: Search,
  PLAN_CREATED: MapIcon,
  PLAN_UPDATED: MapIcon,
  SHADOW_REQUESTED: Eye,
  SHADOW_APPROVED: CheckCircle,
  SHADOW_DECLINED: XCircle,
  SHADOW_COMPLETED: Award,
  SHADOW_SKIPPED: SkipForward,
  ALIGNED_ACTION_COMPLETED: Briefcase,
  ACTION_REFLECTION_SUBMITTED: MessageCircle,
  EXTERNAL_FEEDBACK_RECEIVED: Award,
  ITEM_SAVED: Bookmark,
  REFLECTION_RECORDED: MessageCircle,
};

// Color mapping for event types
const eventColors: Record<TimelineEventTypeId, string> = {
  PROFILE_CREATED: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  STRENGTHS_CONFIRMED: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
  CAREER_EXPLORED: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
  ROLE_DEEP_DIVE_COMPLETED: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
  PRIMARY_GOAL_SET: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  INDUSTRY_OUTLOOK_REVIEWED: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
  REQUIREMENTS_REVIEWED: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
  PLAN_CREATED: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  PLAN_UPDATED: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  SHADOW_REQUESTED: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
  SHADOW_APPROVED: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  SHADOW_DECLINED: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  SHADOW_COMPLETED: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
  SHADOW_SKIPPED: 'bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400',
  ALIGNED_ACTION_COMPLETED: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  ACTION_REFLECTION_SUBMITTED: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  EXTERNAL_FEEDBACK_RECEIVED: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  ITEM_SAVED: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
  REFLECTION_RECORDED: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
}

export function TimelineTab() {
  const [filter, setFilter] = useState<string>('all');

  const { data, isLoading, error } = useQuery<{
    success: boolean;
    events: TimelineEventData[];
    total: number;
    counts: { total: number; thisMonth: number; lastEventAt: string | null };
  }>({
    queryKey: ['journey-timeline', filter],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '50' });
      if (filter !== 'all') {
        params.set('types', filter);
      }
      const response = await fetch(`/api/journey/timeline?${params}`);
      if (!response.ok) throw new Error('Failed to fetch timeline');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-8 text-center">
          <p className="text-destructive">Failed to load timeline</p>
        </CardContent>
      </Card>
    );
  }

  const events = data?.events || [];
  const counts = data?.counts;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-teal-500" />
            Your Timeline
          </h2>
          {counts && (
            <p className="text-sm text-muted-foreground mt-1">
              {counts.total} events total • {counts.thisMonth} this month
            </p>
          )}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm border rounded-md px-2 py-1 bg-background"
          >
            <option value="all">All Events</option>
            <option value="ALIGNED_ACTION_COMPLETED">Aligned Actions</option>
            <option value="SHADOW_REQUESTED,SHADOW_APPROVED,SHADOW_COMPLETED">Shadows</option>
            <option value="CAREER_EXPLORED,ROLE_DEEP_DIVE_COMPLETED">Careers</option>
            <option value="REFLECTION_RECORDED">Reflections</option>
          </select>
        </div>
      </div>

      {/* Timeline */}
      {events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No events yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your journey milestones will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

          <AnimatePresence>
            <div className="space-y-4">
              {events.map((event, index) => {
                const Icon = eventIcons[event.type] || Calendar;
                const colorClass = eventColors[event.type] || 'bg-gray-100 text-gray-600';

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative pl-12"
                  >
                    {/* Timeline dot */}
                    <div
                      className={`absolute left-3 w-5 h-5 rounded-full flex items-center justify-center ${colorClass}`}
                    >
                      <Icon className="h-3 w-3" />
                    </div>

                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{event.title}</p>
                            {event.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {event.description}
                              </p>
                            )}
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <Badge variant="secondary" className="text-xs">
                              {formatDate(event.createdAt)}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
