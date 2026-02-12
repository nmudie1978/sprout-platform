'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, RotateCcw, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type RecoverableTable = 'savedItem' | 'journeyNote' | 'traitObservation';

interface DeletedItem {
  id: string;
  title?: string | null;
  content?: string | null;
  traitId?: string;
  observation?: string;
  deletedAt: string;
}

interface RecentlyDeletedProps {
  type: RecoverableTable;
}

const RETENTION_DAYS = 30;

function getLabel(item: DeletedItem, type: RecoverableTable): string {
  if (type === 'savedItem') return item.title || 'Untitled item';
  if (type === 'journeyNote') return item.title || item.content?.slice(0, 60) || 'Untitled note';
  return item.traitId || 'Unknown trait';
}

function getDaysLeft(deletedAt: string): number {
  const deleted = new Date(deletedAt);
  const expiry = new Date(deleted.getTime() + RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const now = new Date();
  return Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
}

function getDeletedDate(deletedAt: string): string {
  return new Date(deletedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function RecentlyDeleted({ type }: RecentlyDeletedProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading } = useQuery<{ savedItems: DeletedItem[]; notes: DeletedItem[]; traits: DeletedItem[] }>({
    queryKey: ['journey-deleted', type],
    queryFn: async () => {
      const response = await fetch(`/api/journey/deleted?type=${type}`);
      if (!response.ok) throw new Error('Failed to fetch deleted items');
      return response.json();
    },
    enabled: isOpen,
  });

  const restoreMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await fetch('/api/journey/deleted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: type, itemId }),
      });
      if (!response.ok) throw new Error('Failed to restore item');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journey-deleted', type] });
      queryClient.invalidateQueries({ queryKey: ['journey-library'] });
      queryClient.invalidateQueries({ queryKey: ['journey-notes'] });
      queryClient.invalidateQueries({ queryKey: ['trait-observations'] });
    },
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await fetch(`/api/journey/deleted?table=${type}&id=${itemId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to permanently delete');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journey-deleted', type] });
    },
  });

  const items: DeletedItem[] =
    type === 'savedItem'
      ? data?.savedItems || []
      : type === 'journeyNote'
        ? data?.notes || []
        : data?.traits || [];

  const count = items.length;

  return (
    <div className="border-t pt-4 mt-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        <Clock className="h-3.5 w-3.5" />
        Recently deleted{isOpen && !isLoading ? ` (${count})` : ''}
      </button>

      {isOpen && (
        <div className="mt-3 space-y-2">
          {isLoading ? (
            <p className="text-xs text-muted-foreground pl-6">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-xs text-muted-foreground pl-6">No recently deleted items</p>
          ) : (
            items.map((item) => {
              const daysLeft = getDaysLeft(item.deletedAt);
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 pl-6 py-2 rounded-md hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground truncate">
                      {getLabel(item, type)}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60">
                      Deleted {getDeletedDate(item.deletedAt)} · {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                    </p>
                  </div>
                  <div className={cn(
                    'flex items-center gap-1 shrink-0',
                    'opacity-0 group-hover:opacity-100 transition-opacity'
                  )}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs gap-1"
                      onClick={() => restoreMutation.mutate(item.id)}
                      disabled={restoreMutation.isPending}
                    >
                      <RotateCcw className="h-3 w-3" />
                      Restore
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs gap-1 text-destructive hover:text-destructive"
                      onClick={() => {
                        if (confirm('Permanently delete this item? This cannot be undone.')) {
                          permanentDeleteMutation.mutate(item.id);
                        }
                      }}
                      disabled={permanentDeleteMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
