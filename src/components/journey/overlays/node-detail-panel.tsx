'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { STAGE_CONFIG, type JourneyItem } from '@/lib/journey/career-journey-types';
import type { NodeOverlayData, OverlayLayerId } from '@/lib/journey/overlay-types';

interface NodeDetailPanelProps {
  item: JourneyItem | null;
  nodeData: NodeOverlayData;
  activeLayers: Record<OverlayLayerId, boolean>;
  onUpdate: (data: Partial<NodeOverlayData>) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PROGRESS_OPTIONS: { value: NodeOverlayData['progress']; label: string; color: string }[] = [
  { value: 'not_started', label: 'Not Started', color: '#9ca3af' },
  { value: 'in_progress', label: 'In Progress', color: '#f59e0b' },
  { value: 'done', label: 'Done', color: '#22c55e' },
];

export function NodeDetailPanel({
  item,
  nodeData,
  activeLayers,
  onUpdate,
  open,
  onOpenChange,
}: NodeDetailPanelProps) {
  const [resourceInput, setResourceInput] = useState('');

  if (!item) return null;

  const stage = STAGE_CONFIG[item.stage];
  const ageLabel = item.endAge
    ? `Age ${item.startAge}\u2013${item.endAge}`
    : `Age ${item.startAge}`;

  const addResource = () => {
    const trimmed = resourceInput.trim();
    if (!trimmed) return;
    const current = nodeData.resources ?? [];
    onUpdate({ resources: [...current, trimmed] });
    setResourceInput('');
  };

  const removeResource = (index: number) => {
    const current = nodeData.resources ?? [];
    onUpdate({ resources: current.filter((_, i) => i !== index) });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto sm:max-w-md">
        <SheetHeader className="mb-4">
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
          </div>
          <SheetTitle>{item.title}</SheetTitle>
          {item.subtitle && (
            <SheetDescription>{item.subtitle}</SheetDescription>
          )}
        </SheetHeader>

        {/* Description */}
        {item.description && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {item.description}
          </p>
        )}

        <div className="space-y-5">
          {/* Progress section */}
          {activeLayers.progress && (
            <section>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Progress
              </h4>
              <div className="flex gap-2">
                {PROGRESS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => onUpdate({ progress: opt.value })}
                    className={cn(
                      'flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors',
                      nodeData.progress === opt.value
                        ? 'border-transparent text-white'
                        : 'border-border text-muted-foreground hover:border-border/80'
                    )}
                    style={
                      nodeData.progress === opt.value
                        ? { backgroundColor: opt.color }
                        : undefined
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Reflections section */}
          {activeLayers.reflections && (
            <section>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Reflection
              </h4>
              <textarea
                value={nodeData.reflection ?? ''}
                onChange={(e) => onUpdate({ reflection: e.target.value })}
                placeholder="Write a personal note about this step..."
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                rows={3}
              />
            </section>
          )}

          {/* Resources section */}
          {activeLayers.resources && (
            <section>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Resources
              </h4>
              {nodeData.resources && nodeData.resources.length > 0 && (
                <ul className="space-y-1.5 mb-2">
                  {nodeData.resources.map((res, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-sm">
                      <span className="flex-1 truncate text-muted-foreground">{res}</span>
                      <button
                        onClick={() => removeResource(i)}
                        className="flex-shrink-0 text-muted-foreground/50 hover:text-destructive transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex gap-1.5">
                <input
                  value={resourceInput}
                  onChange={(e) => setResourceInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addResource();
                    }
                  }}
                  placeholder="Add a link or resource..."
                  className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button size="sm" variant="outline" onClick={addResource} className="h-8 px-2">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </section>
          )}

          {/* Confidence section */}
          {activeLayers.confidence && (
            <section>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Confidence
              </h4>
              <div className="flex items-center gap-2">
                {([1, 2, 3, 4, 5] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => onUpdate({ confidence: level })}
                    className="h-8 w-8 rounded-full border-2 transition-colors flex items-center justify-center text-xs font-semibold"
                    style={
                      nodeData.confidence != null && nodeData.confidence >= level
                        ? { backgroundColor: '#f59e0b', borderColor: '#f59e0b', color: 'white' }
                        : { borderColor: '#e5e7eb', color: '#9ca3af' }
                    }
                  >
                    {level}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
