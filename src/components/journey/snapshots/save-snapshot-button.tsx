'use client';

import { useState } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCreateSnapshot, useSnapshots } from '@/hooks/use-snapshots';
import type { SnapshotClientState } from '@/lib/journey/recovery-service';
import { Loader2 } from 'lucide-react';

interface SaveSnapshotButtonProps {
  goalId?: string;
  disabled?: boolean;
}

export function SaveSnapshotButton({ goalId, disabled }: SaveSnapshotButtonProps) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const create = useCreateSnapshot();
  const { data: snapshots } = useSnapshots(open);

  const count = snapshots?.length ?? 0;
  const atCapacity = count >= 10;

  function collectClientState(): SnapshotClientState | undefined {
    if (typeof window === 'undefined') return undefined;

    const state: SnapshotClientState = {};

    // Collect overlay annotations for the current goal
    if (goalId) {
      const raw = localStorage.getItem(`sprout-roadmap-overlays-${goalId}`);
      if (raw) {
        try {
          state.overlayAnnotations = { [goalId]: JSON.parse(raw) };
        } catch { /* ignore */ }
      }
    }

    // Timeline style
    const style = localStorage.getItem('sprout-timeline-style');
    if (style) state.timelineStyle = style;

    // Learning goals
    const goalsRaw = localStorage.getItem('sprout-learning-goals');
    if (goalsRaw) {
      try {
        state.learningGoals = JSON.parse(goalsRaw);
      } catch { /* ignore */ }
    }

    return Object.keys(state).length > 0 ? state : undefined;
  }

  function handleSave() {
    create.mutate(
      {
        label: label.trim() || undefined,
        clientState: collectClientState(),
      },
      {
        onSuccess: () => {
          setOpen(false);
          setLabel('');
        },
      }
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 text-xs"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        <Camera className="h-3.5 w-3.5" />
        Save Snapshot
      </Button>

      <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) { setOpen(false); setLabel(''); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-emerald-600" />
              Save Snapshot
            </DialogTitle>
            <DialogDescription>
              Save the current state of your roadmap — including progress, notes, and annotations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <label htmlFor="snapshot-label" className="text-sm font-medium">
                Label (optional)
              </label>
              <Input
                id="snapshot-label"
                placeholder="e.g. Before exploring new path"
                maxLength={200}
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                }}
              />
            </div>
            {atCapacity && (
              <p className="text-xs text-amber-600">
                You have {count}/10 snapshots — the oldest will be replaced.
              </p>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => { setOpen(false); setLabel(''); }}
              disabled={create.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={create.isPending}>
              {create.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
