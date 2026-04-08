"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type { DiscoveryPreferences } from "@/lib/career-pathways";

/**
 * Subjects: school subjects youth recognise. Lowercase keys to match
 * SUBJECT_CATEGORY_WEIGHTS in career-pathways.ts.
 */
const SUBJECTS: { id: string; label: string }[] = [
  { id: "biology", label: "Biology" },
  { id: "chemistry", label: "Chemistry" },
  { id: "physics", label: "Physics" },
  { id: "math", label: "Math" },
  { id: "computing", label: "Computing / IT" },
  { id: "english", label: "English" },
  { id: "history", label: "History" },
  { id: "geography", label: "Geography" },
  { id: "art", label: "Art / Design" },
  { id: "music", label: "Music" },
  { id: "pe", label: "PE / Sport" },
  { id: "business", label: "Business / Economics" },
  { id: "languages", label: "Languages" },
  { id: "psychology", label: "Psychology" },
  { id: "design-tech", label: "Design & Tech (digital, CAD, 3D)" },
  { id: "workshop-making", label: "Workshop & Making (woodwork, metalwork, electronics)" },
  { id: "health-social", label: "Health & Social Care" },
  { id: "drama", label: "Drama" },
  { id: "food-tech", label: "Food Tech" },
  { id: "media-studies", label: "Media Studies" },
];

const WORK_STYLES: { id: string; label: string; emoji: string }[] = [
  { id: "hands-on", label: "Hands-on", emoji: "🛠️" },
  { id: "desk", label: "At a desk", emoji: "💻" },
  { id: "outdoors", label: "Outdoors", emoji: "🌲" },
  { id: "creative", label: "Creative", emoji: "🎨" },
  { id: "mixed", label: "A mix", emoji: "🔀" },
];

const PEOPLE_PREFS: { id: string; label: string }[] = [
  { id: "with-people", label: "With people" },
  { id: "mixed", label: "A bit of both" },
  { id: "mostly-alone", label: "Mostly on my own" },
];

interface DiscoveryQuizDialogProps {
  open: boolean;
  onClose: () => void;
  initialValue?: DiscoveryPreferences | null;
  onSaved?: (prefs: DiscoveryPreferences) => void;
}

export function DiscoveryQuizDialog({
  open,
  onClose,
  initialValue,
  onSaved,
}: DiscoveryQuizDialogProps) {
  const queryClient = useQueryClient();
  const [subjects, setSubjects] = useState<string[]>([]);
  const [workStyles, setWorkStyles] = useState<string[]>([]);
  const [peoplePref, setPeoplePref] = useState<string | undefined>(undefined);

  // Sync from initialValue whenever the dialog re-opens
  useEffect(() => {
    if (open) {
      setSubjects(initialValue?.subjects || []);
      setWorkStyles(initialValue?.workStyles || []);
      setPeoplePref(initialValue?.peoplePref);
    }
  }, [open, initialValue]);

  const toggle = (
    list: string[],
    setter: (s: string[]) => void,
    value: string
  ) => {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const prefs: DiscoveryPreferences = {
        subjects,
        workStyles,
        peoplePref,
      };
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discoveryPreferences: prefs }),
      });
      if (!response.ok) throw new Error("Failed to save preferences");
      return prefs;
    },
    onSuccess: (prefs) => {
      toast.success("Preferences saved", {
        description: "Your Career Radar is updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      onSaved?.(prefs);
      onClose();
    },
    onError: () => {
      toast.error("Couldn't save preferences", { description: "Please try again." });
    },
  });

  const hasAny = subjects.length > 0 || workStyles.length > 0 || !!peoplePref;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-teal-500" />
            Tell us what you like
          </DialogTitle>
          <DialogDescription>
            We&apos;ll show you careers across every path — including ones you&apos;ve probably never heard of. Nothing is tracked; you can change this any time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Subjects */}
          <div>
            <Label className="text-xs font-semibold">Subjects you enjoy</Label>
            <p className="text-[10px] text-muted-foreground mb-2">Pick any that apply.</p>
            <div className="flex flex-wrap gap-1.5">
              {SUBJECTS.map((s) => (
                <Badge
                  key={s.id}
                  variant={subjects.includes(s.id) ? "default" : "outline"}
                  className="cursor-pointer text-[11px] px-2 py-0.5"
                  onClick={() => toggle(subjects, setSubjects, s.id)}
                >
                  {s.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Work styles */}
          <div>
            <Label className="text-xs font-semibold">How you like to work</Label>
            <p className="text-[10px] text-muted-foreground mb-2">Pick any that fit.</p>
            <div className="flex flex-wrap gap-1.5">
              {WORK_STYLES.map((w) => (
                <Badge
                  key={w.id}
                  variant={workStyles.includes(w.id) ? "default" : "outline"}
                  className="cursor-pointer text-[11px] px-2 py-0.5"
                  onClick={() => toggle(workStyles, setWorkStyles, w.id)}
                >
                  <span className="mr-1">{w.emoji}</span>
                  {w.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* People preference */}
          <div>
            <Label className="text-xs font-semibold">Working with people</Label>
            <p className="text-[10px] text-muted-foreground mb-2">Pick one.</p>
            <div className="flex flex-wrap gap-1.5">
              {PEOPLE_PREFS.map((p) => (
                <Badge
                  key={p.id}
                  variant={peoplePref === p.id ? "default" : "outline"}
                  className="cursor-pointer text-[11px] px-2 py-0.5"
                  onClick={() => setPeoplePref(peoplePref === p.id ? undefined : p.id)}
                >
                  {p.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose} disabled={saveMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={!hasAny || saveMutation.isPending}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Saving…
              </>
            ) : (
              "Save & see my radar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
