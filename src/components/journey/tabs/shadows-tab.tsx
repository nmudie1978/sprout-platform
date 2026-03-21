'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  Plus,
  AlertCircle,
  SkipForward,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import Link from 'next/link';
import type { ShadowRequest, ShadowSummary, ShadowRequestStatus } from '@/lib/journey';

// Status configurations
const statusConfig: Record<ShadowRequestStatus, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = {
  DRAFT: {
    label: 'Draft',
    icon: Clock,
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  },
  PENDING: {
    label: 'Pending',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  APPROVED: {
    label: 'Approved',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  },
  COMPLETED: {
    label: 'Completed',
    icon: CheckCircle,
    color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  DECLINED: {
    label: 'Declined',
    icon: XCircle,
    color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: XCircle,
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  },
  NO_SHOW: {
    label: 'No Show',
    icon: XCircle,
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  },
};

function formatDate(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ShadowsTab() {
  const queryClient = useQueryClient();
  const [skipDialogOpen, setSkipDialogOpen] = useState(false);
  const [skipReason, setSkipReason] = useState('');

  const { data, isLoading, error } = useQuery<{
    success: boolean;
    requests: ShadowRequest[];
    summary: ShadowSummary;
  }>({
    queryKey: ['journey-shadows'],
    queryFn: async () => {
      const response = await fetch('/api/journey/shadows');
      if (!response.ok) throw new Error('Failed to fetch shadows');
      return response.json();
    },
  });

  const skipMutation = useMutation({
    mutationFn: async (reason: string) => {
      const response = await fetch('/api/journey/shadows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'skip', reason }),
      });
      if (!response.ok) throw new Error('Failed to skip shadow step');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journey-shadows'] });
      queryClient.invalidateQueries({ queryKey: ['journey-state'] });
      setSkipDialogOpen(false);
      setSkipReason('');
    },
  });

  const requests = data?.requests || [];
  const summary = data?.summary;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-24 w-full" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-8 text-center">
          <p className="text-destructive">Failed to load career shadows</p>
        </CardContent>
      </Card>
    );
  }

  // If step was skipped
  if (summary?.skipped) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Eye className="h-5 w-5 text-indigo-500" />
            Career Shadows
          </h2>
        </div>

        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <SkipForward className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="font-medium">You skipped this step</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              Reason: {summary.skipReason}
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              You can still request career shadows anytime through the Shadows page
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/shadows">View Shadows Page</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Eye className="h-5 w-5 text-indigo-500" />
            Career Shadows
          </h2>
          {summary && (
            <p className="text-sm text-muted-foreground mt-1">
              {summary.requestsTotal} request{summary.requestsTotal !== 1 ? 's' : ''} •{' '}
              {summary.requestsCompleted} completed
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setSkipDialogOpen(true)}>
            <SkipForward className="h-4 w-4 mr-1" />
            Skip this step
          </Button>
          <Button size="sm" asChild>
            <Link href="/shadows/new">
              <Plus className="h-4 w-4 mr-1" />
              New Request
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && summary.requestsTotal > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{summary.requestsPending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{summary.requestsApproved}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{summary.requestsCompleted}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{summary.requestsDeclined}</p>
              <p className="text-xs text-muted-foreground">Declined</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Requests List */}
      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="font-medium">No shadow requests yet</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              Career shadowing lets you observe professionals in your field of interest.
              It's a great way to learn what a job is really like!
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <Button asChild>
                <Link href="/shadows/new">
                  <Plus className="h-4 w-4 mr-1" />
                  Create Request
                </Link>
              </Button>
              <Button variant="outline" onClick={() => setSkipDialogOpen(true)}>
                Skip for now
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {requests.map((request, index) => {
              const status = statusConfig[request.status];
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Status Icon */}
                        <div className={`p-2 rounded-lg ${status.color}`}>
                          <StatusIcon className="h-5 w-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium">{request.roleTitle}</p>
                              {request.host && (
                                <p className="text-sm text-muted-foreground">
                                  with {request.host.name}
                                  {request.host.company && ` at ${request.host.company}`}
                                </p>
                              )}
                            </div>
                            <Badge className={status.color}>{status.label}</Badge>
                          </div>

                          {/* Learning Goals */}
                          {request.learningGoals.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {request.learningGoals.map((goal, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {goal}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Scheduled Info */}
                          {request.scheduledDate && (
                            <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(request.scheduledDate)}
                              </span>
                              {request.locationName && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {request.locationName}
                                </span>
                              )}
                            </div>
                          )}

                          {/* View Details Link */}
                          <div className="mt-3">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/shadows/${request.id}`}>
                                View Details
                                <ArrowRight className="h-3 w-3 ml-1" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Skip Dialog */}
      <Dialog open={skipDialogOpen} onOpenChange={setSkipDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Skip Career Shadows?</DialogTitle>
            <DialogDescription>
              Career shadowing is optional. If you'd prefer to skip this step, please tell us why.
              This helps us improve the experience for others.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              placeholder="I'm skipping because... (at least 10 characters)"
              value={skipReason}
              onChange={(e) => setSkipReason(e.target.value)}
              rows={3}
            />
            {skipReason.length > 0 && skipReason.length < 10 && (
              <p className="text-xs text-destructive mt-1">
                Please provide a bit more detail (at least 10 characters)
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSkipDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => skipMutation.mutate(skipReason)}
              disabled={skipReason.length < 10 || skipMutation.isPending}
            >
              {skipMutation.isPending ? 'Skipping...' : 'Skip this step'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
