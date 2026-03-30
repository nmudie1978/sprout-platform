'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { STAGE_CONFIG, type JourneyItem } from '@/lib/journey/career-journey-types';
import { classifyStepType } from '@/lib/education/alignment';
import { STEP_TYPE_CONFIG } from '@/lib/education/types';
import { cn } from '@/lib/utils';
import {
  Check,
  Circle,
  CircleDot,
  CheckCircle2,
} from 'lucide-react';

interface TimelineDetailDialogProps {
  item: JourneyItem | null;
  allItems?: JourneyItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

interface CardData {
  status: 'not_started' | 'in_progress' | 'done';
  notes: string;
  resourceLink: string;
  confidence: string;
  completedMicroActions?: number[];
  stickyNote?: string;
}

const STORAGE_KEY = 'roadmap-card-data';

export function loadCardData(itemId: string): CardData {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return all[itemId] || { status: 'not_started', notes: '', resourceLink: '', confidence: '' };
  } catch {
    return { status: 'not_started', notes: '', resourceLink: '', confidence: '' };
  }
}

function saveCardData(itemId: string, data: CardData) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    all[itemId] = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // silent fail
  }
}

/** Cycle progress: not_started → in_progress → done → not_started */
export function cycleProgress(itemId: string): CardData['status'] {
  const data = loadCardData(itemId);
  const next: CardData['status'] =
    data.status === 'not_started' ? 'in_progress' :
    data.status === 'in_progress' ? 'done' : 'not_started';
  saveCardData(itemId, { ...data, status: next });
  return next;
}

const STATUS_OPTIONS = [
  { value: 'not_started' as const, label: 'Not started', icon: Circle, color: 'text-muted-foreground/50' },
  { value: 'in_progress' as const, label: 'In progress', icon: CircleDot, color: 'text-amber-500' },
  { value: 'done' as const, label: 'Done', icon: CheckCircle2, color: 'text-emerald-500' },
];

export function TimelineDetailDialog({
  item,
  allItems,
  open,
  onOpenChange,
  onSaved,
}: TimelineDetailDialogProps) {
  const [status, setStatus] = useState<CardData['status']>('not_started');
  const [completedActions, setCompletedActions] = useState<number[]>([]);

  // Load saved data when item changes
  useEffect(() => {
    if (item && open) {
      const data = loadCardData(item.id);
      setStatus(data.status || 'not_started');
      setCompletedActions(data.completedMicroActions || []);
    }
  }, [item?.id, open]);

  const toggleMicroAction = useCallback((index: number) => {
    setCompletedActions((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  }, []);

  // Auto-save on status or action change
  useEffect(() => {
    if (!item || !open) return;
    const existing = loadCardData(item.id);
    saveCardData(item.id, { ...existing, status, completedMicroActions: completedActions });
    onSaved?.();
  }, [status, completedActions]);

  if (!item) return null;

  const stage = STAGE_CONFIG[item.stage];
  const ageLabel = item.endAge
    ? `Age ${item.startAge}\u2013${item.endAge}`
    : `Age ${item.startAge}`;
  const stepType = classifyStepType(item);
  const hasMicroActions = item.microActions && item.microActions.length > 0;
  const microActionsDone = hasMicroActions
    ? completedActions.filter((i) => i < item.microActions!.length).length
    : 0;
  const microActionsTotal = item.microActions?.length ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.color }} />
            <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">
              {stage.label} &middot; {ageLabel}
            </span>
          </div>
          <DialogTitle className="text-base">{item.title}</DialogTitle>
          {item.subtitle && (
            <p className="text-xs text-muted-foreground/70">{item.subtitle}</p>
          )}
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* 1. What this step involves */}
          {item.description && (
            <div className="rounded-lg bg-muted/10 border border-border/20 p-3.5">
              <p className="text-[13px] text-foreground/70 leading-relaxed">{item.description}</p>
            </div>
          )}

          {/* 2. Progress */}
          <div className="flex gap-1.5">
            {STATUS_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => setStatus(opt.value)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-[11px] font-medium transition-all border',
                    status === opt.value
                      ? 'border-foreground/20 bg-foreground/5'
                      : 'border-transparent bg-muted/20 text-muted-foreground/50 hover:bg-muted/40'
                  )}
                >
                  <Icon className={cn('h-3.5 w-3.5', status === opt.value ? opt.color : '')} />
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* 3. Action checklist */}
          {hasMicroActions && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-foreground/70">Actions</p>
                <span className="text-[10px] text-muted-foreground/40">
                  {microActionsDone}/{microActionsTotal}
                </span>
              </div>
              {microActionsTotal > 0 && (
                <div className="h-1 w-full rounded-full bg-foreground/5 mb-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${(microActionsDone / microActionsTotal) * 100}%` }}
                  />
                </div>
              )}
              <ul className="space-y-1">
                {item.microActions!.map((action, i) => {
                  const isDone = completedActions.includes(i);
                  return (
                    <li key={i}>
                      <button
                        onClick={() => toggleMicroAction(i)}
                        className={cn(
                          'w-full flex items-start gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors',
                          isDone ? 'bg-emerald-500/5' : 'hover:bg-muted/30'
                        )}
                      >
                        <div className={cn(
                          'flex h-4 w-4 items-center justify-center rounded border mt-0.5 shrink-0 transition-colors',
                          isDone
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-muted-foreground/30'
                        )}>
                          {isDone && <Check className="h-2.5 w-2.5 text-white" />}
                        </div>
                        <span className={cn(
                          'text-[13px] leading-snug',
                          isDone ? 'text-muted-foreground/40 line-through' : 'text-foreground/75'
                        )}>
                          {action}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
