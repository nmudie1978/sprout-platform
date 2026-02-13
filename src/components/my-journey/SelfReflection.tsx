'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Trash2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  prefersReducedMotion,
  staggerContainerVariants,
  staggerItem,
  PREMIUM_EASE,
  DURATION,
} from '@/lib/motion';
import { useSelfReflection } from '@/hooks/use-self-reflection';
import { ReflectionDialog } from './ReflectionDialog';
import { ENERGY_LABELS, type ReflectionEntry } from '@/lib/my-journey/reflection-types';

const ENERGY_BAR_COLORS = [
  'from-red-500 to-red-400',      // 1
  'from-amber-500 to-amber-400',  // 2
  'from-amber-400 to-yellow-300', // 3
  'from-emerald-400 to-green-300', // 4
  'from-emerald-500 to-emerald-400', // 5
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getSummary(entry: ReflectionEntry): string {
  return entry.awareness.tried || entry.awareness.learned || entry.awareness.surprised || 'Reflection';
}

function EnergyBar({ level }: { level: number }) {
  const widthPercent = (level / 5) * 100;
  return (
    <div className="flex items-center gap-2">
      <Zap className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
      <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-500', ENERGY_BAR_COLORS[level - 1])}
          style={{ width: `${widthPercent}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-16 text-right">{ENERGY_LABELS[level - 1]}</span>
    </div>
  );
}

function ReflectionCard({
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
    <Card
      className="cursor-pointer transition-all duration-300 hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/10"
      onClick={() => setExpanded(!expanded)}
    >
      <CardContent className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <p className="text-sm font-medium line-clamp-1 flex-1">{summary}</p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-muted-foreground/60">{formatDate(entry.createdAt)}</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground/40 transition-transform duration-200',
                expanded && 'rotate-180'
              )}
            />
          </div>
        </div>

        {/* Energy bar — only show if user set a non-default level */}
        {hasNonDefaultEnergy && <EnergyBar level={entry.energy.level} />}

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
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mt-4 space-y-4 border-t border-border/50 pt-4">
                {/* Awareness */}
                {(entry.awareness.tried || entry.awareness.learned || entry.awareness.surprised) && (
                  <div className="space-y-2.5">
                    {entry.awareness.tried && (
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/50 mb-0.5">
                          Tried
                        </p>
                        <p className="text-sm text-foreground/80">{entry.awareness.tried}</p>
                      </div>
                    )}
                    {entry.awareness.learned && (
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/50 mb-0.5">
                          Learned
                        </p>
                        <p className="text-sm text-foreground/80">{entry.awareness.learned}</p>
                      </div>
                    )}
                    {entry.awareness.surprised && (
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/50 mb-0.5">
                          Surprised by
                        </p>
                        <p className="text-sm text-foreground/80">{entry.awareness.surprised}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Energy notes */}
                {hasEnergyNotes && (
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/50 mb-0.5">
                      Energy Notes
                    </p>
                    <p className="text-sm text-foreground/80">{entry.energy.notes}</p>
                  </div>
                )}

                {/* Capability */}
                {hasCapabilityContent && (
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/50 mb-1.5">
                      Capability
                    </p>
                    {entry.capability.skills && entry.capability.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {entry.capability.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="space-y-1.5 text-sm text-foreground/80">
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
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/50 mb-1.5">
                      Direction
                    </p>
                    <div className="space-y-1.5 text-sm text-foreground/80">
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
                <div className="pt-2 border-t border-border/50 flex justify-end">
                  {confirmDelete ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground/60">Remove this reflection?</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setConfirmDelete(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => onDelete(entry.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-muted-foreground/50 hover:text-destructive"
                      onClick={() => setConfirmDelete(true)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

export function SelfReflection({ onReflectionSaved }: { onReflectionSaved?: () => void } = {}) {
  const { reflections, createReflection, deleteReflection } = useSelfReflection();
  const [dialogOpen, setDialogOpen] = useState(false);
  const reduced = typeof window !== 'undefined' && prefersReducedMotion();

  const handleSave = useCallback(
    (entry: Parameters<typeof createReflection>[0]) => {
      createReflection(entry);
      onReflectionSaved?.();
    },
    [createReflection, onReflectionSaved]
  );

  return (
    <div className="space-y-6">
      {reflections.length === 0 ? (
        /* ──── Empty state — inviting, not instructional ──── */
        <div className="text-center py-14">
          <div className="h-12 w-12 mx-auto rounded-full bg-emerald-500/[0.07] dark:bg-emerald-400/[0.05] mb-5" />
          <p className="text-sm font-medium text-foreground/70 mb-1">
            Your first reflection is a few thoughts away.
          </p>
          <p className="text-xs text-muted-foreground/50 mb-6">
            A few gentle prompts — skip any, write what feels right.
          </p>
          <Button
            onClick={() => setDialogOpen(true)}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-6"
          >
            Take a moment
          </Button>
        </div>
      ) : (
        <>
          {/* ──── Invitation for returning users ──── */}
          <div className="flex justify-center">
            <button
              onClick={() => setDialogOpen(true)}
              className={cn(
                'rounded-2xl border border-dashed border-muted-foreground/15 px-7 py-4',
                'transition-all duration-300',
                'hover:border-emerald-500/25 hover:bg-muted/20',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20',
              )}
            >
              <p className="text-sm font-medium text-foreground/80">Take a moment</p>
              <p className="text-xs text-muted-foreground/40 mt-0.5">
                A few gentle prompts, nothing required.
              </p>
            </button>
          </div>

          {/* ──── Reflection history ──── */}
          <motion.div
            variants={reduced ? undefined : staggerContainerVariants}
            initial={reduced ? undefined : 'initial'}
            animate={reduced ? undefined : 'animate'}
            className="space-y-3 max-w-2xl mx-auto"
          >
            {reflections.map((entry) => (
              <motion.div
                key={entry.id}
                variants={reduced ? undefined : staggerItem}
              >
                <ReflectionCard
                  entry={entry}
                  onDelete={deleteReflection}
                  reduced={reduced}
                />
              </motion.div>
            ))}
          </motion.div>
        </>
      )}

      {/* Dialog */}
      <ReflectionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
