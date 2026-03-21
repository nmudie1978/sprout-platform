'use client';

import { useState } from 'react';
import { Bookmark, X, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCuriositySaves } from '@/hooks/use-curiosity-saves';

function timeAgo(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function CuriositySaves() {
  const { curiosities, removeCuriosity, updateNote } = useCuriositySaves();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const startEdit = (careerId: string, currentNote?: string) => {
    setEditingId(careerId);
    setEditText(currentNote ?? '');
  };

  const saveEdit = (careerId: string) => {
    updateNote(careerId, editText.trim());
    setEditingId(null);
    setEditText('');
  };

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-base font-semibold flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-teal-500" />
          Saved curiosities
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Careers you found interesting — no commitment needed.
        </p>
      </div>

      {curiosities.length === 0 ? (
        <div className="text-center py-6 border rounded-lg bg-muted/20">
          <Bookmark className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">Nothing saved yet</p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            Browse careers and bookmark anything that sparks your interest.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {curiosities.map((c) => (
            <div
              key={c.careerId}
              className="rounded-lg border p-3 hover:bg-muted/30 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{c.careerEmoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.careerTitle}</p>
                  <p className="text-[10px] text-muted-foreground">{timeAgo(c.savedAt)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => startEdit(c.careerId, c.note)}
                  title="Add note"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeCuriosity(c.careerId)}
                  title="Remove"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Note display / editor */}
              {editingId === c.careerId ? (
                <div className="mt-2 space-y-1.5">
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder="Why did this catch your eye?"
                    className="min-h-[60px] text-xs"
                    autoFocus
                  />
                  <div className="flex gap-1.5 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" onClick={() => saveEdit(c.careerId)}>
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                c.note && (
                  <p className="mt-1.5 text-xs text-muted-foreground italic pl-7">
                    {c.note}
                  </p>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
