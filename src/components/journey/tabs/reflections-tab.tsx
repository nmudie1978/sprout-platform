'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Briefcase,
  Search,
  TrendingUp,
  Eye,
  Heart,
  Map as MapIcon,
  Filter,
  ChevronDown,
  ChevronUp,
  Send,
  SkipForward,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import type { ReflectionContextType } from '@/lib/journey/types';
import type { ReflectionData } from '@/lib/journey/reflections-service';

// Icon mapping for context types
const contextIcons: Record<ReflectionContextType, React.ComponentType<{ className?: string }>> = {
  ALIGNED_ACTION: Briefcase,
  ROLE_DEEP_DIVE: Search,
  INDUSTRY_INSIGHTS: TrendingUp,
  SHADOW_COMPLETED: Eye,
  CAREER_DISCOVERY: Heart,
  PLAN_BUILD: MapIcon,
  STRENGTHS_REFLECTION: MessageCircle,
};

// Color mapping for context types
const contextColors: Record<ReflectionContextType, string> = {
  ALIGNED_ACTION: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  ROLE_DEEP_DIVE: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  INDUSTRY_INSIGHTS: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
  SHADOW_COMPLETED: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
  CAREER_DISCOVERY: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
  PLAN_BUILD: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  STRENGTHS_REFLECTION: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
};

const contextLabels: Record<ReflectionContextType, string> = {
  ALIGNED_ACTION: 'Aligned Action',
  ROLE_DEEP_DIVE: 'Role Deep Dive',
  INDUSTRY_INSIGHTS: 'Industry Insights',
  SHADOW_COMPLETED: 'Career Shadow',
  CAREER_DISCOVERY: 'Career Discovery',
  PLAN_BUILD: 'Plan Building',
  STRENGTHS_REFLECTION: 'Strengths Reflection',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function ReflectionCard({
  reflection,
  onRecord,
  onSkip,
  isRecording,
}: {
  reflection: ReflectionData;
  onRecord: (response: string) => void;
  onSkip: () => void;
  isRecording: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(!reflection.response && !reflection.skipped);
  const [response, setResponse] = useState('');
  const Icon = contextIcons[reflection.contextType];
  const colorClass = contextColors[reflection.contextType];

  const handleSubmit = () => {
    if (response.trim()) {
      onRecord(response);
      setResponse('');
    }
  };

  return (
    <Card className={reflection.skipped ? 'opacity-60' : ''}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${colorClass}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Badge variant="secondary" className="text-xs mb-1">
                  {contextLabels[reflection.contextType]}
                </Badge>
                <p className="font-medium text-sm">{reflection.prompt}</p>
              </div>
              {(reflection.response || reflection.skipped) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex-shrink-0"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Response or Input */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pl-11">
                {reflection.response ? (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm italic">"{reflection.response}"</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDate(reflection.createdAt)}
                    </p>
                  </div>
                ) : reflection.skipped ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <SkipForward className="h-4 w-4" />
                    <span>Skipped</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Share your thoughts..."
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      rows={2}
                      className="text-sm"
                    />
                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onSkip}
                        disabled={isRecording}
                      >
                        <SkipForward className="h-3 w-3 mr-1" />
                        Skip
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={!response.trim() || isRecording}
                      >
                        <Send className="h-3 w-3 mr-1" />
                        {isRecording ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

export function ReflectionsTab() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<ReflectionContextType | 'all' | 'pending'>('all');

  const { data, isLoading, error } = useQuery<{
    success: boolean;
    reflections: ReflectionData[];
    total: number;
    counts: { total: number; thisMonth: number; lastReflectionAt: string | null };
  }>({
    queryKey: ['journey-reflections', filter],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '50' });
      if (filter === 'pending') {
        params.set('pendingOnly', 'true');
      } else if (filter !== 'all') {
        params.set('contextType', filter);
      }
      const response = await fetch(`/api/journey/reflections?${params}`);
      if (!response.ok) throw new Error('Failed to fetch reflections');
      return response.json();
    },
  });

  const recordMutation = useMutation({
    mutationFn: async ({ reflectionId, response }: { reflectionId: string; response: string }) => {
      const res = await fetch('/api/journey/reflections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'record',
          reflectionId,
          response,
        }),
      });
      if (!res.ok) throw new Error('Failed to record reflection');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journey-reflections'] });
    },
  });

  const skipMutation = useMutation({
    mutationFn: async (reflectionId: string) => {
      const res = await fetch('/api/journey/reflections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'skip',
          reflectionId,
        }),
      });
      if (!res.ok) throw new Error('Failed to skip reflection');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journey-reflections'] });
    },
  });

  const reflections = data?.reflections || [];
  const counts = data?.counts;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-8 text-center">
          <p className="text-destructive">Failed to load reflections</p>
        </CardContent>
      </Card>
    );
  }

  const pendingCount = reflections.filter((r) => !r.response && !r.skipped).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-rose-500" />
            Reflections
          </h2>
          {counts && (
            <p className="text-sm text-muted-foreground mt-1">
              {counts.total} reflection{counts.total !== 1 ? 's' : ''} recorded •{' '}
              {counts.thisMonth} this month
            </p>
          )}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="text-sm border rounded-md px-2 py-1 bg-background"
          >
            <option value="all">All Reflections</option>
            {pendingCount > 0 && (
              <option value="pending">Pending ({pendingCount})</option>
            )}
            <option value="ALIGNED_ACTION">Aligned Actions</option>
            <option value="ROLE_DEEP_DIVE">Role Deep Dives</option>
            <option value="INDUSTRY_INSIGHTS">Industry Insights</option>
            <option value="SHADOW_COMPLETED">Career Shadows</option>
            <option value="CAREER_DISCOVERY">Career Discovery</option>
            <option value="PLAN_BUILD">Plan Building</option>
            <option value="STRENGTHS_REFLECTION">Strengths</option>
          </select>
        </div>
      </div>

      {/* Pending Alert */}
      {pendingCount > 0 && filter !== 'pending' && (
        <Card className="bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900">
          <CardContent className="py-3 px-4 flex items-center justify-between">
            <p className="text-sm text-rose-700 dark:text-rose-300">
              You have {pendingCount} pending reflection{pendingCount !== 1 ? 's' : ''}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilter('pending')}
              className="border-rose-300 text-rose-700 hover:bg-rose-100 dark:border-rose-700 dark:text-rose-300"
            >
              View Pending
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Reflections List */}
      {reflections.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No reflections yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Reflection prompts will appear after completing jobs, shadows, and other activities
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {reflections.map((reflection, index) => (
              <motion.div
                key={reflection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ReflectionCard
                  reflection={reflection}
                  onRecord={(response) =>
                    recordMutation.mutate({ reflectionId: reflection.id, response })
                  }
                  onSkip={() => skipMutation.mutate(reflection.id)}
                  isRecording={recordMutation.isPending || skipMutation.isPending}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
