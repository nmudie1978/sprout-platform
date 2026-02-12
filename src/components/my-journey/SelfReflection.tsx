'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sparkles, ChevronDown, Trash2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  prefersReducedMotion,
  fadeInUp,
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

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => setExpanded(!expanded)}
    >
      <CardContent className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <p className="text-sm font-medium line-clamp-1 flex-1">{summary}</p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-muted-foreground">{formatDate(entry.createdAt)}</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform duration-200',
                expanded && 'rotate-180'
              )}
            />
          </div>
        </div>

        {/* Energy bar */}
        <EnergyBar level={entry.energy.level} />

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
              <div className="mt-4 space-y-4 border-t pt-4">
                {/* Awareness */}
                {(entry.awareness.tried || entry.awareness.learned || entry.awareness.surprised) && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5">
                      Awareness
                    </p>
                    <div className="space-y-1.5 text-sm text-muted-foreground">
                      {entry.awareness.tried && (
                        <p><span className="font-medium text-foreground">Tried:</span> {entry.awareness.tried}</p>
                      )}
                      {entry.awareness.learned && (
                        <p><span className="font-medium text-foreground">Learned:</span> {entry.awareness.learned}</p>
                      )}
                      {entry.awareness.surprised && (
                        <p><span className="font-medium text-foreground">Surprised:</span> {entry.awareness.surprised}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Energy notes */}
                {entry.energy.notes && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5">
                      Energy Notes
                    </p>
                    <p className="text-sm text-muted-foreground">{entry.energy.notes}</p>
                  </div>
                )}

                {/* Capability */}
                {hasCapabilityContent && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5">
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
                    <div className="space-y-1.5 text-sm text-muted-foreground">
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
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5">
                      Direction
                    </p>
                    <div className="space-y-1.5 text-sm text-muted-foreground">
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
                <div className="pt-2 border-t flex justify-end">
                  {confirmDelete ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Remove this reflection?</span>
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
                      className="h-7 text-xs text-muted-foreground hover:text-destructive"
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
      {/* New Self-Reflection button */}
      <div className="flex justify-center">
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Self-Reflection
        </Button>
      </div>

      {/* Reflection list or empty state */}
      {reflections.length === 0 ? (
        <div className="text-center py-12">
          <Sparkles className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            Your first reflection is just a few thoughts away.
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Take a moment to think about something recent — no pressure.
          </p>
        </div>
      ) : (
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
