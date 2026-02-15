'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { SnapshotClientState } from '@/lib/journey/recovery-service';

export interface SnapshotSummary {
  id: string;
  trigger: string;
  label: string | null;
  createdAt: string;
}

const QUERY_KEY = ['journey-snapshots'];

export function useSnapshots(enabled = true) {
  return useQuery<SnapshotSummary[]>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await fetch('/api/journey/snapshot');
      if (!res.ok) throw new Error('Failed to fetch snapshots');
      const data = await res.json();
      return data.snapshots ?? [];
    },
    enabled,
  });
}

export function useCreateSnapshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      label,
      clientState,
    }: {
      label?: string;
      clientState?: SnapshotClientState;
    }) => {
      const res = await fetch('/api/journey/snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label, clientState }),
      });
      if (!res.ok) throw new Error('Failed to create snapshot');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Snapshot saved');
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: () => {
      toast.error('Failed to save snapshot');
    },
  });
}

export function useRenameSnapshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      snapshotId,
      label,
    }: {
      snapshotId: string;
      label: string;
    }) => {
      const res = await fetch('/api/journey/snapshot', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshotId, label }),
      });
      if (!res.ok) throw new Error('Failed to rename snapshot');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Snapshot renamed');
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: () => {
      toast.error('Failed to rename snapshot');
    },
  });
}

export function useDeleteSnapshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (snapshotId: string) => {
      const res = await fetch(`/api/journey/snapshot?id=${encodeURIComponent(snapshotId)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete snapshot');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Snapshot deleted');
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: () => {
      toast.error('Failed to delete snapshot');
    },
  });
}

export function useRestoreSnapshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (snapshotId: string) => {
      const res = await fetch('/api/journey/snapshot', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshotId }),
      });
      if (!res.ok) throw new Error('Failed to restore snapshot');
      return res.json();
    },
    onSuccess: (data) => {
      // Restore client-side state to localStorage if present
      const clientState = data.clientState as SnapshotClientState | undefined;
      if (clientState) {
        if (clientState.overlayAnnotations) {
          // Overlay annotations are stored per goalId
          for (const [key, value] of Object.entries(clientState.overlayAnnotations)) {
            localStorage.setItem(
              `sprout-roadmap-overlays-${key}`,
              JSON.stringify(value)
            );
          }
        }
        if (clientState.timelineStyle) {
          localStorage.setItem('sprout-timeline-style', clientState.timelineStyle);
        }
        if (clientState.learningGoals) {
          localStorage.setItem('sprout-learning-goals', JSON.stringify(clientState.learningGoals));
        }
      }

      const imported = data.imported as { savedItems: number; notes: number } | undefined;
      const desc = imported
        ? `Restored ${imported.savedItems} items, ${imported.notes} notes`
        : 'Snapshot restored';

      toast.success('Snapshot restored', { description: desc });

      // Invalidate all journey-related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['journey-state'] });
      queryClient.invalidateQueries({ queryKey: ['journey-library'] });
      queryClient.invalidateQueries({ queryKey: ['journey-notes'] });
      queryClient.removeQueries({ queryKey: ['personal-career-timeline'] });
    },
    onError: () => {
      toast.error('Failed to restore snapshot');
    },
  });
}
