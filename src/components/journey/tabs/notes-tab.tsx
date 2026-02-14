"use client";

import { useState, useCallback, useMemo } from "react";
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
  FolderOpen,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useViewMode } from "@/hooks/useViewMode";
import { ViewModeToggle } from "@/components/view/ViewModeToggle";
import { RecentlyDeleted } from "@/components/journey/recently-deleted";

// Note colors with their Tailwind classes
const NOTE_COLORS = {
  yellow: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    accent: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-400",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    accent: "text-blue-600 dark:text-blue-400",
    dot: "bg-blue-400",
  },
  green: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    accent: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-400",
  },
  pink: {
    bg: "bg-pink-50 dark:bg-pink-950/30",
    border: "border-pink-200 dark:border-pink-800",
    accent: "text-pink-600 dark:text-pink-400",
    dot: "bg-pink-400",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950/30",
    border: "border-purple-200 dark:border-purple-800",
    accent: "text-purple-600 dark:text-purple-400",
    dot: "bg-purple-400",
  },
  gray: {
    bg: "bg-neutral-50 dark:bg-neutral-800/50",
    border: "border-neutral-200 dark:border-neutral-700",
    accent: "text-neutral-600 dark:text-neutral-400",
    dot: "bg-neutral-400",
  },
} as const;

type NoteColor = keyof typeof NOTE_COLORS;

interface JourneyNote {
  id: string;
  title: string | null;
  content: string;
  color: NoteColor | null;
  pinned: boolean;
  groupName: string | null;
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

// Note card component (grid view)
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

      {/* Footer: group + date */}
      <div className="flex items-center gap-2 mt-2">
        {note.groupName && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            <FolderOpen className="h-2.5 w-2.5 mr-0.5" />
            {note.groupName}
          </Badge>
        )}
        <p className="text-[10px] text-muted-foreground/60">{formattedDate}</p>
      </div>
    </motion.div>
  );
}

// Note list row component (list view)
function NoteListRow({
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
  });

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors group">
      <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", colors.dot)} />
      {note.pinned && <Pin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
      <div className="flex-1 min-w-0 flex items-center gap-3">
        <p className="font-medium text-sm truncate shrink-0 max-w-[200px]">
          {note.title || "Untitled"}
        </p>
        <p className="text-sm text-muted-foreground truncate flex-1">
          {note.content}
        </p>
      </div>
      {note.groupName && (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0 hidden sm:flex">
          <FolderOpen className="h-2.5 w-2.5 mr-0.5" />
          {note.groupName}
        </Badge>
      )}
      <span className="text-xs text-muted-foreground shrink-0">{formattedDate}</span>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
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
    </div>
  );
}

// Note editor component
function NoteEditor({
  note,
  onSave,
  onCancel,
  isSaving,
  existingGroups,
}: {
  note?: JourneyNote;
  onSave: (data: {
    title?: string;
    content: string;
    color?: NoteColor;
    groupName?: string | null;
  }) => void;
  onCancel: () => void;
  isSaving: boolean;
  existingGroups?: string[];
}) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [color, setColor] = useState<NoteColor>(note?.color || "yellow");
  const [groupName, setGroupName] = useState(note?.groupName || "");

  const handleSave = () => {
    if (!content.trim()) return;
    onSave({
      title: title.trim() || undefined,
      content: content.trim(),
      color,
      groupName: groupName.trim() || null,
    });
  };

  const colors = NOTE_COLORS[color];
  const datalistId = `note-groups-${note?.id || "new"}`;

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
        <div className="flex items-center gap-3">
          <ColorPicker selected={color} onSelect={setColor} />
          <div className="relative">
            <FolderOpen className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <input
              type="text"
              list={datalistId}
              placeholder="Group (optional)"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              maxLength={100}
              className="h-7 w-36 rounded-md border bg-transparent pl-7 pr-2 text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {existingGroups && existingGroups.length > 0 && (
              <datalist id={datalistId}>
                {existingGroups.map((g) => (
                  <option key={g} value={g} />
                ))}
              </datalist>
            )}
          </div>
        </div>
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

// Renders a section of notes in the current view mode
function NoteSection({
  notes,
  viewMode,
  editingId,
  editingNote,
  groupNames,
  onEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  onTogglePin,
  isUpdatePending,
}: {
  notes: JourneyNote[];
  viewMode: "grid" | "list";
  editingId: string | null;
  editingNote?: JourneyNote;
  groupNames: string[];
  onEdit: (id: string) => void;
  onCancelEdit: () => void;
  onUpdate: (id: string, data: { title?: string; content: string; color?: NoteColor; groupName?: string | null }) => void;
  onDelete: (id: string) => void;
  onTogglePin: (note: JourneyNote) => void;
  isUpdatePending: boolean;
}) {
  if (viewMode === "list") {
    return (
      <div className="space-y-2">
        {notes.map((note) =>
          editingId === note.id ? (
            <NoteEditor
              key={note.id}
              note={editingNote}
              onSave={(data) => onUpdate(note.id, data)}
              onCancel={onCancelEdit}
              isSaving={isUpdatePending}
              existingGroups={groupNames}
            />
          ) : (
            <NoteListRow
              key={note.id}
              note={note}
              onEdit={() => onEdit(note.id)}
              onDelete={() => onDelete(note.id)}
              onTogglePin={() => onTogglePin(note)}
            />
          )
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {notes.map((note) =>
          editingId === note.id ? (
            <NoteEditor
              key={note.id}
              note={editingNote}
              onSave={(data) => onUpdate(note.id, data)}
              onCancel={onCancelEdit}
              isSaving={isUpdatePending}
              existingGroups={groupNames}
            />
          ) : (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={() => onEdit(note.id)}
              onDelete={() => onDelete(note.id)}
              onTogglePin={() => onTogglePin(note)}
            />
          )
        )}
      </AnimatePresence>
    </div>
  );
}

// Main Notes Tab component
export function NotesTab() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<string | "all" | "ungrouped">("all");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const { viewMode, setViewMode } = useViewMode({ storageKey: "notesViewMode", defaultMode: "list" });

  // Fetch notes
  const { data, isLoading, error } = useQuery<{ notes: JourneyNote[] }>({
    queryKey: ["journey-notes"],
    queryFn: async () => {
      const response = await fetch("/api/journey/notes");
      if (!response.ok) throw new Error("Failed to fetch notes");
      return response.json();
    },
  });

  const notes = data?.notes || [];

  // Derive group names from notes
  const groupNames = useMemo(() => {
    const names = new Set<string>();
    for (const note of notes) {
      if (note.groupName) names.add(note.groupName);
    }
    return Array.from(names).sort();
  }, [notes]);

  // Filter notes based on active group
  const filteredNotes = useMemo(() => {
    if (activeGroup === "all") return notes;
    if (activeGroup === "ungrouped") return notes.filter((n) => !n.groupName);
    return notes.filter((n) => n.groupName === activeGroup);
  }, [notes, activeGroup]);

  // Group counts for filter pills
  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = { all: notes.length, ungrouped: 0 };
    for (const note of notes) {
      if (note.groupName) {
        counts[note.groupName] = (counts[note.groupName] || 0) + 1;
      } else {
        counts.ungrouped++;
      }
    }
    return counts;
  }, [notes]);

  // Grouped notes for "all" view with collapsible sections
  const groupedSections = useMemo(() => {
    if (activeGroup !== "all") return null;

    const pinned = notes.filter((n) => n.pinned);
    const unpinned = notes.filter((n) => !n.pinned);

    const grouped: { name: string; notes: JourneyNote[] }[] = [];
    for (const name of groupNames) {
      const groupNotes = unpinned.filter((n) => n.groupName === name);
      if (groupNotes.length > 0) {
        grouped.push({ name, notes: groupNotes });
      }
    }
    const ungrouped = unpinned.filter((n) => !n.groupName);

    return { pinned, grouped, ungrouped };
  }, [notes, activeGroup, groupNames]);

  // Create note mutation
  const createMutation = useMutation({
    mutationFn: async (noteData: {
      title?: string;
      content: string;
      color?: NoteColor;
      groupName?: string | null;
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
      groupName?: string | null;
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
    (noteData: { title?: string; content: string; color?: NoteColor; groupName?: string | null }) => {
      createMutation.mutate(noteData);
    },
    [createMutation]
  );

  const handleUpdate = useCallback(
    (
      id: string,
      noteData: { title?: string; content: string; color?: NoteColor; groupName?: string | null }
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

  const toggleGroupCollapse = useCallback((name: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }, []);

  const editingNote = editingId
    ? notes.find((n) => n.id === editingId)
    : undefined;

  // Only use grid/list (no compact)
  const effectiveViewMode = viewMode === "compact" ? "grid" : viewMode;

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

  const hasGroups = groupNames.length > 0;

  // Shared note section props
  const sectionProps = {
    viewMode: effectiveViewMode as "grid" | "list",
    editingId,
    editingNote,
    groupNames,
    onEdit: setEditingId,
    onCancelEdit: () => setEditingId(null),
    onUpdate: handleUpdate,
    onDelete: handleDelete,
    onTogglePin: handleTogglePin,
    isUpdatePending: updateMutation.isPending,
  };

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
        <div className="flex items-center gap-2">
          <ViewModeToggle
            viewMode={effectiveViewMode}
            onViewModeChange={setViewMode}
            showCompact={false}
          />
          {!isCreating && (
            <Button size="sm" onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Note
            </Button>
          )}
        </div>
      </div>

      {/* Group filter pills */}
      {hasGroups && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeGroup === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveGroup("all")}
          >
            All ({groupCounts.all})
          </Button>
          {groupNames.map((name) => (
            <Button
              key={name}
              variant={activeGroup === name ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveGroup(name)}
              className="gap-1"
            >
              <FolderOpen className="h-3 w-3" />
              {name} ({groupCounts[name] || 0})
            </Button>
          ))}
          <Button
            variant={activeGroup === "ungrouped" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveGroup("ungrouped")}
          >
            Ungrouped ({groupCounts.ungrouped})
          </Button>
        </div>
      )}

      {/* New note editor */}
      <AnimatePresence>
        {isCreating && (
          <NoteEditor
            onSave={handleCreate}
            onCancel={() => setIsCreating(false)}
            isSaving={createMutation.isPending}
            existingGroups={groupNames}
          />
        )}
      </AnimatePresence>

      {/* Notes content */}
      {notes.length > 0 ? (
        activeGroup === "all" && hasGroups && groupedSections ? (
          // Grouped "all" view with collapsible sections
          <div className="space-y-6">
            {/* Pinned notes first */}
            {groupedSections.pinned.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Pin className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-muted-foreground">Pinned</h3>
                  <Badge variant="secondary" className="text-[10px]">{groupedSections.pinned.length}</Badge>
                </div>
                <NoteSection notes={groupedSections.pinned} {...sectionProps} />
              </div>
            )}

            {/* Per-group sections */}
            {groupedSections.grouped.map(({ name, notes: groupNotes }) => {
              const isCollapsed = collapsedGroups.has(name);
              return (
                <div key={name} className="space-y-3">
                  <button
                    onClick={() => toggleGroupCollapse(name)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-muted-foreground">{name}</h3>
                    <Badge variant="secondary" className="text-[10px]">{groupNotes.length}</Badge>
                  </button>
                  {!isCollapsed && <NoteSection notes={groupNotes} {...sectionProps} />}
                </div>
              );
            })}

            {/* Ungrouped section */}
            {groupedSections.ungrouped.length > 0 && (
              <div className="space-y-3">
                <button
                  onClick={() => toggleGroupCollapse("__ungrouped")}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  {collapsedGroups.has("__ungrouped") ? (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                  <h3 className="text-sm font-medium text-muted-foreground">Ungrouped</h3>
                  <Badge variant="secondary" className="text-[10px]">{groupedSections.ungrouped.length}</Badge>
                </button>
                {!collapsedGroups.has("__ungrouped") && (
                  <NoteSection notes={groupedSections.ungrouped} {...sectionProps} />
                )}
              </div>
            )}
          </div>
        ) : (
          // Filtered view or no groups — flat rendering
          <NoteSection notes={filteredNotes} {...sectionProps} />
        )
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

      {/* Recently Deleted */}
      <RecentlyDeleted type="journeyNote" />
    </div>
  );
}

export default NotesTab;
