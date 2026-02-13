'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { STAGE_CONFIG, type JourneyItem } from '@/lib/journey/career-journey-types';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface TimelineDetailDialogProps {
  item: JourneyItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TimelineDetailDialog({
  item,
  open,
  onOpenChange,
}: TimelineDetailDialogProps) {
  if (!item) return null;

  const stage = STAGE_CONFIG[item.stage];
  const ageLabel = item.endAge
    ? `Age ${item.startAge}–${item.endAge}`
    : `Age ${item.startAge}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          {/* Stage badge */}
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider',
                stage.bgClass,
                stage.textClass
              )}
            >
              {stage.label}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              {ageLabel}
            </span>
            {item.isMilestone && (
              <span className="text-xs font-medium" style={{ color: stage.color }}>
                Milestone
              </span>
            )}
          </div>

          <DialogTitle className="text-lg">{item.title}</DialogTitle>

          {item.subtitle && (
            <DialogDescription>{item.subtitle}</DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {/* Description */}
          {item.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.description}
            </p>
          )}

          {/* Micro-actions */}
          {item.microActions && item.microActions.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Next Steps</h4>
              <ul className="space-y-2">
                {item.microActions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ChevronRight
                      className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground/40"
                    />
                    <span className="text-sm text-muted-foreground">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
