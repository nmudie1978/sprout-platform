'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  prefersReducedMotion,
  PREMIUM_EASE,
  DURATION,
} from '@/lib/motion';
import { useSelfReflection } from '@/hooks/use-self-reflection';
import { ReflectionDialog } from './ReflectionDialog';
import { ENERGY_LABELS, type ReflectionEntry } from '@/lib/my-journey/reflection-types';
import { LENS_DESCRIPTIONS, type JourneyLens } from '@/lib/journey/types';

// ────────────────────────────────────────────
// Phase badge styles
// ────────────────────────────────────────────

const PHASE_BADGE_STYLES: Record<JourneyLens, string> = {
  DISCOVER: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  UNDERSTAND: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  ACT: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
};

const PHASE_DOT_COLORS: Record<JourneyLens, string> = {
  DISCOVER: 'bg-teal-500',
  UNDERSTAND: 'bg-emerald-500',
  ACT: 'bg-amber-500',
};

// ────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────

const ENERGY_BAR_COLORS = [
  'from-red-500 to-red-400',
  'from-amber-500 to-amber-400',
  'from-amber-400 to-yellow-300',
  'from-emerald-400 to-green-300',
  'from-emerald-500 to-emerald-400',
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

function getSummary(entry: ReflectionEntry): string {
  return entry.awareness.tried || entry.awareness.learned || entry.awareness.surprised || 'Reflection';
}

// ────────────────────────────────────────────
// PhaseBadge — small colored label
// ────────────────────────────────────────────

function PhaseBadge({ phase }: { phase: JourneyLens }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
        PHASE_BADGE_STYLES[phase],
      )}
    >
      {LENS_DESCRIPTIONS[phase].title}
    </span>
  );
}

// ────────────────────────────────────────────
// EnergyBar
// ────────────────────────────────────────────

function EnergyBar({ level }: { level: number }) {
  const widthPercent = (level / 5) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-500', ENERGY_BAR_COLORS[level - 1])}
          style={{ width: `${widthPercent}%` }}
        />
      </div>
      <span className="text-[11px] text-muted-foreground w-14 text-right">{ENERGY_LABELS[level - 1]}</span>
    </div>
  );
}

// ────────────────────────────────────────────
// ReflectionRow — slim, expandable row
// ────────────────────────────────────────────

function ReflectionRow({
  entry,
  onDelete,
  reduced,
}: {
  entry: ReflectionEntry;
  onDelete: (id: string) => void;
  reduced: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const summary = getSummary(entry);
  const hasCapabilityContent = entry.capability.skills?.length || entry.capability.responsibility || entry.capability.growthNote;
  const hasDirectionContent = entry.direction.nextInterest || entry.direction.perspectiveShift;
  const hasEnergyNotes = entry.energy.notes;
  const hasNonDefaultEnergy = entry.energy.level !== 3;

  return (
    <div className="border-b border-border/30 last:border-b-0">
      {/* Collapsed row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 py-3 px-3 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="text-xs text-muted-foreground/50 w-14 flex-shrink-0">
          {formatDate(entry.createdAt)}
        </span>
        <span className="text-sm text-foreground/80 truncate flex-1 min-w-0">
          {summary}
        </span>
        {entry.linkedPhase && (
          <PhaseBadge phase={entry.linkedPhase} />
        )}
        <ChevronRight
          className={cn(
            'h-3.5 w-3.5 text-muted-foreground/30 flex-shrink-0 transition-transform duration-200',
            expanded && 'rotate-90'
          )}
        />
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={reduced ? undefined : { height: 0, opacity: 0 }}
            animate={reduced ? undefined : { height: 'auto', opacity: 1 }}
            exit={reduced ? undefined : { height: 0, opacity: 0 }}
            transition={{
              height: { duration: DURATION.standard, ease: PREMIUM_EASE as unknown as string },
              opacity: { duration: DURATION.micro },
            }}
            className="overflow-hidden"
          >
            <div className="pl-[4.25rem] pr-3 pb-4 space-y-3">
              {/* Awareness */}
              {(entry.awareness.tried || entry.awareness.learned || entry.awareness.surprised) && (
                <div className="space-y-2">
                  {entry.awareness.tried && (
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/50 mb-0.5">Tried</p>
                      <p className="text-sm text-foreground/80">{entry.awareness.tried}</p>
                    </div>
                  )}
                  {entry.awareness.learned && (
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/50 mb-0.5">Learned</p>
                      <p className="text-sm text-foreground/80">{entry.awareness.learned}</p>
                    </div>
                  )}
                  {entry.awareness.surprised && (
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/50 mb-0.5">Surprised by</p>
                      <p className="text-sm text-foreground/80">{entry.awareness.surprised}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Energy */}
              {hasNonDefaultEnergy && (
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/50 mb-1">Energy</p>
                  <EnergyBar level={entry.energy.level} />
                </div>
              )}
              {hasEnergyNotes && (
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/50 mb-0.5">Energy Notes</p>
                  <p className="text-sm text-foreground/80">{entry.energy.notes}</p>
                </div>
              )}

              {/* Capability */}
              {hasCapabilityContent && (
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/50 mb-1">Capability</p>
                  {entry.capability.skills && entry.capability.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      {entry.capability.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-[10px] px-1.5 py-0">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="space-y-1 text-sm text-foreground/80">
                    {entry.capability.responsibility && (
                      <p><span className="font-medium text-foreground">Responsibility:</span> {entry.capability.responsibility}</p>
                    )}
                    {entry.capability.growthNote && (
                      <p><span className="font-medium text-foreground">Growth:</span> {entry.capability.growthNote}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Direction */}
              {hasDirectionContent && (
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/50 mb-1">Direction</p>
                  <div className="space-y-1 text-sm text-foreground/80">
                    {entry.direction.nextInterest && (
                      <p><span className="font-medium text-foreground">Next interest:</span> {entry.direction.nextInterest}</p>
                    )}
                    {entry.direction.perspectiveShift && (
                      <p><span className="font-medium text-foreground">Perspective shift:</span> {entry.direction.perspectiveShift}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Delete */}
              <div className="pt-1 flex justify-end">
                {confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground/60">Remove this reflection?</span>
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setConfirmDelete(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" size="sm" className="h-6 text-xs" onClick={() => onDelete(entry.id)}>
                      Delete
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-muted-foreground/40 hover:text-destructive"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ────────────────────────────────────────────
// PhaseLinkingPrompt — optional phase tag
// ────────────────────────────────────────────

function PhaseLinkingPrompt({
  open,
  onSelect,
  onSkip,
}: {
  open: boolean;
  onSelect: (phase: JourneyLens) => void;
  onSkip: () => void;
}) {
  const lenses: JourneyLens[] = ['DISCOVER', 'UNDERSTAND', 'ACT'];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onSkip(); }}>
      <DialogContent
        className={cn(
          'sm:max-w-sm border-0 p-0 overflow-hidden sm:rounded-2xl',
          'bg-gradient-to-b from-background to-muted/20 dark:to-muted/5',
          'shadow-xl shadow-black/5 dark:shadow-black/20',
        )}
      >
        <DialogTitle className="sr-only">Link to a phase</DialogTitle>
        <div className="px-8 pt-8 pb-8 space-y-5">
          <div className="text-center space-y-1">
            <h2 className="text-base font-semibold tracking-tight">
              Does this connect to a phase?
            </h2>
            <p className="text-xs text-muted-foreground/50">
              Totally optional — skip if nothing feels right.
            </p>
          </div>

          <div className="space-y-2">
            {lenses.map((lens) => (
              <button
                key={lens}
                onClick={() => onSelect(lens)}
                className={cn(
                  'w-full flex items-center gap-3 rounded-xl border border-border/40 px-4 py-3',
                  'text-left transition-colors',
                  'hover:bg-muted/40 hover:border-border/60',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                )}
              >
                <div className={cn('h-2.5 w-2.5 rounded-full flex-shrink-0', PHASE_DOT_COLORS[lens])} />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{LENS_DESCRIPTIONS[lens].title}</p>
                  <p className="text-xs text-muted-foreground/50">{LENS_DESCRIPTIONS[lens].subtitle}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={onSkip}
              className="text-xs text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors"
            >
              Skip this step
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ────────────────────────────────────────────
// Main component
// ────────────────────────────────────────────

type PendingEntry = Omit<ReflectionEntry, 'id' | 'createdAt'>;

export function SelfReflection({ onReflectionSaved }: { onReflectionSaved?: () => void } = {}) {
  const { reflections, createReflection, deleteReflection } = useSelfReflection();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingEntry, setPendingEntry] = useState<PendingEntry | null>(null);
  const reduced = typeof window !== 'undefined' && prefersReducedMotion();

  // ReflectionDialog saves to pending state (not localStorage yet)
  const handleSave = useCallback(
    (entry: PendingEntry) => {
      setPendingEntry(entry);
    },
    []
  );

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
  }, []);

  // User picks a phase for the pending entry
  const handlePhaseSelect = useCallback(
    (phase: JourneyLens) => {
      if (pendingEntry) {
        createReflection({ ...pendingEntry, linkedPhase: phase });
        onReflectionSaved?.();
      }
      setPendingEntry(null);
    },
    [pendingEntry, createReflection, onReflectionSaved]
  );

  // User skips phase linking
  const handlePhaseSkip = useCallback(() => {
    if (pendingEntry) {
      createReflection(pendingEntry);
      onReflectionSaved?.();
    }
    setPendingEntry(null);
  }, [pendingEntry, createReflection, onReflectionSaved]);

  return (
    <div className="max-w-2xl space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground/70">Recent reflections</p>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs rounded-lg"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add reflection
        </Button>
      </div>

      {/* List container */}
      {reflections.length === 0 ? (
        <p className="text-sm text-muted-foreground/50 py-6">
          Nothing here yet. Reflections appear when you add them.
        </p>
      ) : (
        <div className="max-h-[420px] overflow-y-auto rounded-lg border border-border/30">
          {reflections.map((entry) => (
            <ReflectionRow
              key={entry.id}
              entry={entry}
              onDelete={deleteReflection}
              reduced={reduced}
            />
          ))}
        </div>
      )}

      {/* Reflection Dialog */}
      <ReflectionDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSave={handleSave}
      />

      {/* Phase Linking Prompt — opens after dialog closes */}
      <PhaseLinkingPrompt
        open={pendingEntry !== null && !dialogOpen}
        onSelect={handlePhaseSelect}
        onSkip={handlePhaseSkip}
      />
    </div>
  );
}
