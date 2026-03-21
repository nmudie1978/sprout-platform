'use client';

import { useState } from 'react';
import { ArrowUpCircle, Target, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/mobile/ConfirmDialog';
import type { CareerGoal } from '@/lib/goals/types';

interface SecondaryGoalReminderProps {
  secondaryGoal: CareerGoal;
  onPromote: () => void;
  isPromoting?: boolean;
}

export function SecondaryGoalReminder({
  secondaryGoal,
  onPromote,
  isPromoting = false,
}: SecondaryGoalReminderProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const completedSteps = secondaryGoal.nextSteps?.filter((s) => s.completed).length ?? 0;
  const totalSteps = secondaryGoal.nextSteps?.length ?? 0;

  return (
    <>
      <Card className="border-border h-full">
        <CardContent className="p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                <Target className="h-4 w-4 text-purple-400 dark:text-purple-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/70">
                  Secondary Goal
                </p>
                <p className="text-sm font-bold truncate">
                  {secondaryGoal.title}
                </p>
                {totalSteps > 0 && (
                  <p className="text-[10px] text-muted-foreground">
                    {completedSteps}/{totalSteps} milestones
                  </p>
                )}
              </div>
            </div>
            <button
              className="flex-shrink-0 p-1.5 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
              onClick={() => setShowConfirm(true)}
              disabled={isPromoting}
              title="Make Primary"
            >
              {isPromoting ? (
                <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
              ) : (
                <ArrowUpCircle className="h-4 w-4 text-purple-400" />
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Swap Goals?"
        description="Your current primary goal will become your secondary goal, and this goal will become primary."
        confirmText="Swap Goals"
        cancelText="Cancel"
        onConfirm={() => {
          setShowConfirm(false);
          onPromote();
        }}
        isPending={isPromoting}
        icon={<ArrowUpCircle className="h-5 w-5 text-purple-500" />}
      />
    </>
  );
}
