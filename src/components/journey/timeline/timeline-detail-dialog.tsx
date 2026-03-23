'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { STAGE_CONFIG, type JourneyItem } from '@/lib/journey/career-journey-types';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, Check, Loader2 } from 'lucide-react';

interface TimelineDetailDialogProps {
  item: JourneyItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
] as const;

const CONFIDENCE_OPTIONS = [
  { value: 'low', label: 'Low', emoji: '😟' },
  { value: 'medium', label: 'Medium', emoji: '😐' },
  { value: 'high', label: 'High', emoji: '😊' },
] as const;

export function TimelineDetailDialog({
  item,
  open,
  onOpenChange,
}: TimelineDetailDialogProps) {
  const [status, setStatus] = useState('not_started');
  const [notes, setNotes] = useState('');
  const [resourceLink, setResourceLink] = useState('');
  const [confidence, setConfidence] = useState('');
  const [guidanceOpen, setGuidanceOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!item) return null;

  const stage = STAGE_CONFIG[item.stage];
  const ageLabel = item.endAge
    ? `Age ${item.startAge}–${item.endAge}`
    : `Age ${item.startAge}`;

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: persist to backend when roadmap data model is ready
    await new Promise((r) => setTimeout(r, 500));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const hasGuidance = item.description || (item.microActions && item.microActions.length > 0);

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

        <div className="space-y-4 mt-2">
          {/* Status */}
          <div>
            <p className="text-xs font-medium text-foreground/70 mb-2">Status</p>
            <div className="grid grid-cols-3 gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatus(opt.value)}
                  className={cn(
                    'p-2 rounded-lg text-xs font-medium text-center transition-all border-2',
                    status === opt.value
                      ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                      : 'border-transparent bg-muted/30 text-muted-foreground hover:bg-muted/50'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes / Reflections */}
          <div>
            <p className="text-xs font-medium text-foreground/70 mb-2">Notes & Reflections</p>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you learn? What happened?"
              rows={3}
              className="text-sm"
            />
          </div>

          {/* Resources */}
          <div>
            <p className="text-xs font-medium text-foreground/70 mb-2">Resource Link</p>
            <Input
              value={resourceLink}
              onChange={(e) => setResourceLink(e.target.value)}
              placeholder="e.g., https://course-link.com or article title"
              className="text-sm"
            />
          </div>

          {/* Confidence */}
          <div>
            <p className="text-xs font-medium text-foreground/70 mb-2">How confident do you feel?</p>
            <div className="grid grid-cols-3 gap-2">
              {CONFIDENCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setConfidence(opt.value)}
                  className={cn(
                    'p-2 rounded-lg text-xs font-medium text-center transition-all border-2 flex flex-col items-center gap-1',
                    confidence === opt.value
                      ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                      : 'border-transparent bg-muted/30 text-muted-foreground hover:bg-muted/50'
                  )}
                >
                  <span className="text-base">{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Guidance — collapsible */}
          {hasGuidance && (
            <div className="border-t border-border/20 pt-3">
              <button
                onClick={() => setGuidanceOpen(!guidanceOpen)}
                className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50 hover:text-muted-foreground/70 transition-colors"
              >
                {guidanceOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                Guidance & suggested steps
              </button>
              {guidanceOpen && (
                <div className="mt-2 rounded-lg bg-muted/20 p-3 space-y-2">
                  {item.description && (
                    <p className="text-xs text-muted-foreground/60">{item.description}</p>
                  )}
                  {item.microActions && item.microActions.length > 0 && (
                    <ul className="space-y-1">
                      {item.microActions.map((action, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground/50">
                          <span className="h-1 w-1 rounded-full bg-muted-foreground/30 mt-1.5 shrink-0" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Save */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
              className={cn(
                'text-xs',
                saved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'
              )}
            >
              {isSaving ? (
                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
              ) : saved ? (
                <Check className="mr-1.5 h-3 w-3" />
              ) : null}
              {saved ? 'Saved' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
