"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pin,
  PinOff,
  Trash2,
  Edit2,
  X,
  Save,
  StickyNote,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Note colors with their Tailwind classes
const NOTE_COLORS = {
  yellow: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    accent: "text-amber-600 dark:text-amber-400",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    accent: "text-blue-600 dark:text-blue-400",
  },
  green: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    accent: "text-emerald-600 dark:text-emerald-400",
  },
  pink: {
    bg: "bg-pink-50 dark:bg-pink-950/30",
    border: "border-pink-200 dark:border-pink-800",
    accent: "text-pink-600 dark:text-pink-400",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950/30",
    border: "border-purple-200 dark:border-purple-800",
    accent: "text-purple-600 dark:text-purple-400",
  },
  gray: {
    bg: "bg-neutral-50 dark:bg-neutral-800/50",
    border: "border-neutral-200 dark:border-neutral-700",
    accent: "text-neutral-600 dark:text-neutral-400",
  },
} as const;

type NoteColor = keyof typeof NOTE_COLORS;

interface JourneyNote {
  id: string;
  title: string | null;
  content: string;
  color: NoteColor | null;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

// Color picker component
function ColorPicker({
  selected,
  onSelect,
}: {
  selected: NoteColor | null;
  onSelect: (color: NoteColor) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {(Object.keys(NOTE_COLORS) as NoteColor[]).map((color) => (
        <button
          key={color}
          onClick={() => onSelect(color)}
          className={cn(
            "w-5 h-5 rounded-full border-2 transition-transform",
            NOTE_COLORS[color].bg,
            NOTE_COLORS[color].border,
            selected === color && "ring-2 ring-offset-1 ring-primary scale-110"
          )}
          title={color}
        />
      ))}
    </div>
  );
}

// Note card component
function NoteCard({
  note,
  onEdit,
  onDelete,
  onTogglePin,
}: {
  note: JourneyNote;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}) {
  const colors = NOTE_COLORS[note.color || "yellow"];
  const formattedDate = new Date(note.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year:
      new Date(note.createdAt).getFullYear() !== new Date().getFullYear()
        ? "numeric"
        : undefined,
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "rounded-lg border p-4 group relative",
        colors.bg,
        colors.border
      )}
    >
      {/* Pin indicator */}
      {note.pinned && (
        <div className="absolute -top-1.5 -right-1.5">
          <Pin className={cn("h-4 w-4", colors.accent)} />
        </div>
      )}

      {/* Actions - show on hover */}
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onTogglePin}
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5"
          title={note.pinned ? "Unpin" : "Pin"}
        >
          {note.pinned ? (
            <PinOff className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <Pin className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>
        <button
          onClick={onEdit}
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5"
          title="Edit"
        >
          <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        <button
          onClick={onDelete}
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-500" />
        </button>
      </div>

      {/* Content */}
      {note.title && (
        <h3 className="font-medium text-sm text-foreground mb-1 pr-16">
          {note.title}
        </h3>
      )}
      <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
        {note.content}
      </p>

      {/* Date */}
      <p className="text-[10px] text-muted-foreground/60 mt-2">{formattedDate}</p>
    </motion.div>
  );
}

// Note editor component
function NoteEditor({
  note,
  onSave,
  onCancel,
  isSaving,
}: {
  note?: JourneyNote;
  onSave: (data: { title?: string; content: string; color?: NoteColor }) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [color, setColor] = useState<NoteColor>(note?.color || "yellow");

  const handleSave = () => {
    if (!content.trim()) return;
    onSave({
      title: title.trim() || undefined,
      content: content.trim(),
      color,
    });
  };

  const colors = NOTE_COLORS[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn("rounded-lg border p-4", colors.bg, colors.border)}
    >
      <Input
        placeholder="Title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-2 bg-transparent border-0 p-0 h-auto text-sm font-medium placeholder:text-muted-foreground/50 focus-visible:ring-0"
        maxLength={200}
      />
      <Textarea
        placeholder="Write your note..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[100px] bg-transparent border-0 p-0 text-sm resize-none placeholder:text-muted-foreground/50 focus-visible:ring-0"
        autoFocus
      />

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-current/10">
        <ColorPicker selected={color} onSelect={setColor} />
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isSaving}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!content.trim() || isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            Save
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// Main Notes Tab component
export function NotesTab() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fetch notes
  const { data, isLoading, error } = useQuery<{ notes: JourneyNote[] }>({
    queryKey: ["journey-notes"],
    queryFn: async () => {
      const response = await fetch("/api/journey/notes");
      if (!response.ok) throw new Error("Failed to fetch notes");
      return response.json();
    },
  });

  // Create note mutation
  const createMutation = useMutation({
    mutationFn: async (noteData: {
      title?: string;
      content: string;
      color?: NoteColor;
    }) => {
      const response = await fetch("/api/journey/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noteData),
      });
      if (!response.ok) throw new Error("Failed to create note");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journey-notes"] });
      setIsCreating(false);
    },
  });

  // Update note mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      title?: string | null;
      content?: string;
      color?: NoteColor | null;
      pinned?: boolean;
    }) => {
      const response = await fetch("/api/journey/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });
      if (!response.ok) throw new Error("Failed to update note");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journey-notes"] });
      setEditingId(null);
    },
  });

  // Delete note mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/journey/notes?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete note");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journey-notes"] });
    },
  });

  const handleCreate = useCallback(
    (noteData: { title?: string; content: string; color?: NoteColor }) => {
      createMutation.mutate(noteData);
    },
    [createMutation]
  );

  const handleUpdate = useCallback(
    (
      id: string,
      noteData: { title?: string; content: string; color?: NoteColor }
    ) => {
      updateMutation.mutate({ id, ...noteData });
    },
    [updateMutation]
  );

  const handleTogglePin = useCallback(
    (note: JourneyNote) => {
      updateMutation.mutate({ id: note.id, pinned: !note.pinned });
    },
    [updateMutation]
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (confirm("Delete this note?")) {
        deleteMutation.mutate(id);
      }
    },
    [deleteMutation]
  );

  const notes = data?.notes || [];
  const editingNote = editingId
    ? notes.find((n) => n.id === editingId)
    : undefined;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">Failed to load notes</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-amber-500" />
            Notes
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Capture thoughts, ideas, and reminders along your journey
          </p>
        </div>
        {!isCreating && (
          <Button size="sm" onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Note
          </Button>
        )}
      </div>

      {/* New note editor */}
      <AnimatePresence>
        {isCreating && (
          <NoteEditor
            onSave={handleCreate}
            onCancel={() => setIsCreating(false)}
            isSaving={createMutation.isPending}
          />
        )}
      </AnimatePresence>

      {/* Notes grid */}
      {notes.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {notes.map((note) =>
              editingId === note.id ? (
                <NoteEditor
                  key={note.id}
                  note={editingNote}
                  onSave={(data) => handleUpdate(note.id, data)}
                  onCancel={() => setEditingId(null)}
                  isSaving={updateMutation.isPending}
                />
              ) : (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={() => setEditingId(note.id)}
                  onDelete={() => handleDelete(note.id)}
                  onTogglePin={() => handleTogglePin(note)}
                />
              )
            )}
          </AnimatePresence>
        </div>
      ) : (
        !isCreating && (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <StickyNote className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground mb-1">No notes yet</p>
            <p className="text-xs text-muted-foreground/70">
              Start capturing your thoughts and ideas
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setIsCreating(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create your first note
            </Button>
          </div>
        )
      )}
    </div>
  );
}

export default NotesTab;
