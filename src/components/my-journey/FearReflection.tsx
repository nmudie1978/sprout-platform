'use client';

import { useState } from 'react';
import { CloudRain, ChevronDown, ChevronRight, Trash2, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useFearEntries } from '@/hooks/use-fear-entries';

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

export function FearReflection() {
  const { entries, addEntry, updateEntry, deleteEntry } = useFearEntries();
  const [isOpen, setIsOpen] = useState(false);
  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showAll, setShowAll] = useState(false);

  const handleAdd = () => {
    if (!newText.trim()) return;
    addEntry(newText.trim());
    setNewText('');
  };

  const startEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const saveEdit = () => {
    if (editingId && editText.trim()) {
      updateEntry(editingId, editText.trim());
    }
    setEditingId(null);
    setEditText('');
  };

  const displayed = showAll ? entries : entries.slice(0, 10);

  return (
    <div className="space-y-3">
      {/* Collapsible header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full text-left hover:opacity-80 transition-opacity"
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        <CloudRain className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          Things that feel hard right now
        </h3>
      </button>

      {isOpen && (
        <div className="pl-6 space-y-3">
          <p className="text-xs text-muted-foreground">
            It&apos;s okay to name what feels difficult. You can always come back and change this.
          </p>

          {/* Input */}
          <div className="flex gap-2">
            <Textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="What feels hard right now?"
              className="min-h-[50px] text-xs flex-1"
            />
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!newText.trim()}
              className="self-end"
            >
              Add
            </Button>
          </div>

          {/* Entries */}
          {entries.length === 0 ? (
            <p className="text-xs text-muted-foreground/70 italic">
              Nothing here yet. Only add something if it feels right.
            </p>
          ) : (
            <div className="space-y-2">
              {displayed.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-lg border p-2.5 group bg-muted/20"
                >
                  {editingId === entry.id ? (
                    <div className="space-y-1.5">
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="min-h-[50px] text-xs"
                        autoFocus
                      />
                      <div className="flex gap-1.5 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={saveEdit} disabled={!editText.trim()}>
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <p className="text-xs text-foreground flex-1 whitespace-pre-wrap">
                        {entry.text}
                      </p>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => startEdit(entry.id, entry.text)}
                          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5"
                          title="Edit"
                        >
                          <Pencil className="h-3 w-3 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3 text-muted-foreground hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                  )}
                  {editingId !== entry.id && (
                    <p className="text-[9px] text-muted-foreground/60 mt-1">
                      {timeAgo(entry.createdAt)}
                    </p>
                  )}
                </div>
              ))}

              {entries.length > 10 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-xs text-primary hover:underline"
                >
                  {showAll ? 'Show less' : `Show all (${entries.length})`}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
