"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, Pencil, Save, X, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface WorkerNoteProps {
  youthId: string;
}

interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export function WorkerNote({ youthId }: WorkerNoteProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const queryClient = useQueryClient();

  const { data: notes, isLoading } = useQuery<Note[]>({
    queryKey: ["worker-notes", youthId],
    queryFn: async () => {
      const response = await fetch(`/api/notes?youthId=${youthId}`);
      if (!response.ok) return [];
      return response.json();
    },
  });

  const note = notes?.[0];

  useEffect(() => {
    if (note) {
      setNoteContent(note.content);
    }
  }, [note]);

  const saveMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youthId, content }),
      });
      if (!response.ok) throw new Error("Failed to save note");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worker-notes", youthId] });
      setIsEditing(false);
      toast.success("Note saved");
    },
    onError: () => {
      toast.error("Failed to save note");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/notes?youthId=${youthId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete note");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worker-notes", youthId] });
      setNoteContent("");
      setIsEditing(false);
      toast.success("Note deleted");
    },
    onError: () => {
      toast.error("Failed to delete note");
    },
  });

  const handleSave = () => {
    if (!noteContent.trim()) {
      toast.error("Note cannot be empty");
      return;
    }
    saveMutation.mutate(noteContent.trim());
  };

  const handleCancel = () => {
    setNoteContent(note?.content || "");
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-4 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-amber-600" />
            <CardTitle className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Private Note
            </CardTitle>
          </div>
          {note && !isEditing && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-amber-700 hover:text-amber-800 hover:bg-amber-100"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing || !note ? (
          <div className="space-y-3">
            <Textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Add a private note about this worker (only you can see this)..."
              className="bg-white dark:bg-gray-900 min-h-[100px]"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                Save
              </Button>
              {note && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saveMutation.isPending}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm whitespace-pre-wrap text-amber-900 dark:text-amber-100">
              {note.content}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
              Last updated{" "}
              {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
