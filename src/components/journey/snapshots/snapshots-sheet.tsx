'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/mobile/ConfirmDialog';
import {
  Camera,
  Pencil,
  RotateCcw,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import {
  useSnapshots,
  useRenameSnapshot,
  useDeleteSnapshot,
  useRestoreSnapshot,
} from '@/hooks/use-snapshots';
import type { SnapshotSummary } from '@/hooks/use-snapshots';

interface SnapshotsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TRIGGER_STYLES: Record<string, { label: string; className: string }> = {
  manual: { label: 'Manual', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  pre_import: { label: 'Pre-import', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  pre_restore: { label: 'Pre-restore', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  pre_bulk_delete: { label: 'Pre-delete', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function SnapshotRow({
  snapshot,
  onRestore,
}: {
  snapshot: SnapshotSummary;
  onRestore: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(snapshot.label ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const rename = useRenameSnapshot();
  const remove = useDeleteSnapshot();

  const triggerConfig = TRIGGER_STYLES[snapshot.trigger] ?? {
    label: snapshot.trigger,
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  };

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function handleRename() {
    const trimmed = editLabel.trim();
    if (!trimmed || trimmed === snapshot.label) {
      setEditing(false);
      setEditLabel(snapshot.label ?? '');
      return;
    }
    rename.mutate(
      { snapshotId: snapshot.id, label: trimmed },
      { onSuccess: () => setEditing(false) }
    );
  }

  return (
    <div className="group rounded-lg border p-3 space-y-1.5 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className={triggerConfig.className + ' text-[10px] px-1.5 py-0'}>
          {triggerConfig.label}
        </Badge>
        <span className="text-[11px] text-muted-foreground ml-auto">
          {formatDate(snapshot.createdAt)}
        </span>
      </div>

      {editing ? (
        <Input
          ref={inputRef}
          value={editLabel}
          maxLength={200}
          className="h-7 text-sm"
          onChange={(e) => setEditLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRename();
            if (e.key === 'Escape') { setEditing(false); setEditLabel(snapshot.label ?? ''); }
          }}
          onBlur={handleRename}
        />
      ) : (
        <p className="text-sm font-medium truncate">
          {snapshot.label || 'Untitled snapshot'}
        </p>
      )}

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs gap-1"
          onClick={() => { setEditLabel(snapshot.label ?? ''); setEditing(true); }}
        >
          <Pencil className="h-3 w-3" />
          Rename
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs gap-1"
          onClick={() => setConfirmRestore(true)}
        >
          <RotateCcw className="h-3 w-3" />
          Restore
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs gap-1 text-destructive hover:text-destructive"
          onClick={() => setConfirmDelete(true)}
        >
          <Trash2 className="h-3 w-3" />
          Delete
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete snapshot?"
        description="This will permanently delete this snapshot. This action cannot be undone."
        icon={<Trash2 className="h-5 w-5 text-destructive" />}
        confirmText="Delete"
        variant="destructive"
        isPending={remove.isPending}
        onConfirm={() => {
          remove.mutate(snapshot.id, {
            onSuccess: () => setConfirmDelete(false),
          });
        }}
      />

      <ConfirmDialog
        open={confirmRestore}
        onClose={() => setConfirmRestore(false)}
        title="Restore snapshot?"
        description="Your current roadmap state will be automatically saved as a backup before restoring. Any unsaved overlay changes will be overwritten."
        icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
        confirmText="Restore"
        onConfirm={() => {
          onRestore(snapshot.id);
          setConfirmRestore(false);
        }}
      />
    </div>
  );
}

export function SnapshotsSheet({ open, onOpenChange }: SnapshotsSheetProps) {
  const { data: snapshots, isLoading } = useSnapshots(open);
  const restore = useRestoreSnapshot();
  const count = snapshots?.length ?? 0;

  function handleRestore(snapshotId: string) {
    restore.mutate(snapshotId, {
      onSuccess: () => onOpenChange(false),
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Saved Snapshots</SheetTitle>
          <SheetDescription>
            {count > 0 ? `${count}/10 snapshots` : 'No snapshots saved yet'}
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border p-3 animate-pulse">
                <div className="h-4 w-20 bg-muted rounded mb-2" />
                <div className="h-4 w-40 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : count === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Camera className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No snapshots yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Save a snapshot to checkpoint your roadmap state.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {snapshots!.map((snap) => (
              <SnapshotRow
                key={snap.id}
                snapshot={snap}
                onRestore={handleRestore}
              />
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
