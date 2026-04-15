"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sparkles, Loader2, ChevronDown, Check, X } from "lucide-react";
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
import { cn } from "@/lib/utils";
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

/**
 * Interest / activity chips — things youth actually do and care about,
 * beyond school subjects. These give the matching engine a much richer
 * signal about what someone would enjoy doing for work.
 */
const INTERESTS: { id: string; label: string; emoji: string }[] = [
  { id: "coding", label: "Coding", emoji: "💻" },
  { id: "gaming", label: "Gaming", emoji: "🎮" },
  { id: "cooking", label: "Cooking", emoji: "🍳" },
  { id: "fixing-things", label: "Fixing things", emoji: "🔧" },
  { id: "adventure", label: "Adventure / outdoors", emoji: "⛰️" },
  { id: "animals", label: "Animals", emoji: "🐾" },
  { id: "drawing", label: "Drawing / art", emoji: "🎨" },
  { id: "sport-fitness", label: "Sport / fitness", emoji: "⚽" },
  { id: "reading-writing", label: "Reading / writing", emoji: "📚" },
  { id: "science", label: "Science experiments", emoji: "🔬" },
  { id: "building", label: "Building things", emoji: "🏗️" },
  { id: "performing", label: "Performing", emoji: "🎭" },
  { id: "helping-people", label: "Helping people", emoji: "❤️" },
  { id: "money-business", label: "Business / money", emoji: "💰" },
  { id: "photo-film", label: "Photography / film", emoji: "📸" },
  { id: "travel", label: "Travel", emoji: "✈️" },
  { id: "music-making", label: "Making music", emoji: "🎵" },
  { id: "fashion", label: "Fashion / style", emoji: "👗" },
  { id: "environment", label: "Environment / nature", emoji: "🌍" },
  { id: "military-defence", label: "Military / defence", emoji: "🎖️" },
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
  const [starredSubjects, setStarredSubjects] = useState<string[]>([]);
  const [workStyles, setWorkStyles] = useState<string[]>([]);
  const [peoplePref, setPeoplePref] = useState<string | undefined>(undefined);
  const [interests, setInterests] = useState<string[]>([]);

  // Sync from initialValue whenever the dialog re-opens
  useEffect(() => {
    if (open) {
      setSubjects(initialValue?.subjects || []);
      setStarredSubjects(initialValue?.starredSubjects || []);
      setWorkStyles(initialValue?.workStyles || []);
      setPeoplePref(initialValue?.peoplePref);
      setInterests(initialValue?.interests || []);
    }
  }, [open, initialValue]);

  // Click handler that distinguishes single vs double click using
  // MouseEvent.detail (the browser's own click counter — much more
  // reliable than a setTimeout race, and per-click rather than per-pill
  // so clicking subject A then B never crosses wires).
  const handleSubjectClick = (id: string, e: React.MouseEvent) => {
    if (e.detail === 2) {
      // Double-click: ensure selected AND toggle the star. The preceding
      // single-click (detail===1) would have toggled selection, so we
      // re-assert "selected" here regardless of that intermediate state.
      setSubjects((prev) => (prev.includes(id) ? prev : [...prev, id]));
      setStarredSubjects((prev) =>
        prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
      );
      return;
    }
    // Single click: toggle selection. Unselecting also clears the star.
    setSubjects((prev) => {
      if (prev.includes(id)) {
        setStarredSubjects((s) => s.filter((x) => x !== id));
        return prev.filter((s) => s !== id);
      }
      return [...prev, id];
    });
  };

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
        starredSubjects,
        workStyles,
        peoplePref,
        interests,
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
      // Invalidate every cached surface that reads from
      // discoveryPreferences so the dashboard "Who Am I" portrait,
      // recommended-careers strip, and the profile section all
      // re-render with the new prefs immediately.
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      queryClient.invalidateQueries({ queryKey: ["discover-recommendations"] });
      queryClient.invalidateQueries({ queryKey: ["profile-completion"] });
      queryClient.invalidateQueries({ queryKey: ["career-recommendations"] });
      onSaved?.(prefs);
      onClose();
    },
    onError: () => {
      toast.error("Couldn't save preferences", { description: "Please try again." });
    },
  });

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

        <div className="space-y-4 py-2">
          {/* Subjects — dropdown multi-select */}
          <div>
            <Label className="text-xs font-semibold">Subjects you enjoy</Label>
            <p className="text-[10px] text-muted-foreground mb-1.5">
              Select the subjects you like most. Pick 3–5 for the sharpest results.
            </p>
            <SubjectMultiSelect
              subjects={SUBJECTS}
              selected={subjects}
              starred={starredSubjects}
              onToggle={(id) => {
                setSubjects((prev) =>
                  prev.includes(id)
                    ? (setStarredSubjects((s) => s.filter((x) => x !== id)), prev.filter((s) => s !== id))
                    : [...prev, id]
                );
              }}
              onStar={(id) => {
                if (!subjects.includes(id)) setSubjects((prev) => [...prev, id]);
                setStarredSubjects((prev) =>
                  prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
                );
              }}
            />
          </div>

          {/* Work styles — compact inline */}
          <div>
            <Label className="text-xs font-semibold">How you like to work</Label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {WORK_STYLES.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => toggle(workStyles, setWorkStyles, w.id)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-[11px] font-medium transition-colors',
                    workStyles.includes(w.id)
                      ? 'border-teal-500/60 bg-teal-500/15 text-teal-300'
                      : 'border-border/40 text-muted-foreground/70 hover:border-teal-500/40',
                  )}
                >
                  {w.emoji} {w.label}
                </button>
              ))}
            </div>
          </div>

          {/* People preference — compact inline */}
          <div>
            <Label className="text-xs font-semibold">Working with people</Label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {PEOPLE_PREFS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPeoplePref(peoplePref === p.id ? undefined : p.id)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-[11px] font-medium transition-colors',
                    peoplePref === p.id
                      ? 'border-teal-500/60 bg-teal-500/15 text-teal-300'
                      : 'border-border/40 text-muted-foreground/70 hover:border-teal-500/40',
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interests / activities */}
          <div>
            <Label className="text-xs font-semibold">Things you enjoy</Label>
            <p className="text-[10px] text-muted-foreground mb-1.5">
              What do you like doing outside of school? Pick any that fit.
            </p>
            <InterestMultiSelect
              items={INTERESTS}
              selected={interests}
              onToggle={(id) => toggle(interests, setInterests, id)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose} disabled={saveMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
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

// ── Multi-select dropdown for subjects ──────────────────────────────

function SubjectMultiSelect({
  subjects,
  selected,
  starred,
  onToggle,
  onStar,
}: {
  subjects: { id: string; label: string }[];
  selected: string[];
  starred: string[];
  onToggle: (id: string) => void;
  onStar: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 rounded-lg border border-border/40 bg-muted/10 px-3 py-2 text-left hover:border-teal-500/40 transition-colors"
      >
        {selected.length === 0 ? (
          <span className="text-xs text-muted-foreground/60">Select subjects…</span>
        ) : (
          <div className="flex flex-wrap gap-1 flex-1 min-w-0">
            {selected.slice(0, 5).map((id) => {
              const label = subjects.find((s) => s.id === id)?.label ?? id;
              const isStarred = starred.includes(id);
              return (
                <span
                  key={id}
                  className={cn(
                    'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium',
                    isStarred
                      ? 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/25'
                      : 'bg-teal-500/15 text-teal-300 ring-1 ring-teal-500/25',
                  )}
                >
                  {isStarred && '⭐ '}{label}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onToggle(id); }}
                    className="ml-0.5 hover:text-foreground"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              );
            })}
            {selected.length > 5 && (
              <span className="text-[10px] text-muted-foreground/60">+{selected.length - 5}</span>
            )}
          </div>
        )}
        <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground/50 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-[200px] overflow-y-auto rounded-lg border border-border/50 bg-card shadow-lg">
          {subjects.map((s) => {
            const isSelected = selected.includes(s.id);
            const isStarred = starred.includes(s.id);
            return (
              <div
                key={s.id}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-muted/20 cursor-pointer"
                onClick={() => onToggle(s.id)}
              >
                <div className={cn(
                  'h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0',
                  isSelected ? 'bg-teal-500 border-teal-500' : 'border-border/50',
                )}>
                  {isSelected && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                </div>
                <span className="text-xs text-foreground/85 flex-1">{s.label}</span>
                {isSelected && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onStar(s.id); }}
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-full transition-colors',
                      isStarred
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'text-muted-foreground/40 hover:text-amber-300 hover:bg-amber-500/10',
                    )}
                    title="Star this subject — it counts more in your radar"
                  >
                    {isStarred ? '⭐' : '☆'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Multi-select dropdown for interests ─────────────────────────────

function InterestMultiSelect({
  items,
  selected,
  onToggle,
}: {
  items: { id: string; label: string; emoji: string }[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 rounded-lg border border-border/40 bg-muted/10 px-3 py-2 text-left hover:border-violet-500/40 transition-colors"
      >
        {selected.length === 0 ? (
          <span className="text-xs text-muted-foreground/60">Select activities you enjoy…</span>
        ) : (
          <div className="flex flex-wrap gap-1 flex-1 min-w-0">
            {selected.slice(0, 5).map((id) => {
              const item = items.find((i) => i.id === id);
              if (!item) return null;
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/25"
                >
                  {item.emoji} {item.label}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onToggle(id); }}
                    className="ml-0.5 hover:text-foreground"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              );
            })}
            {selected.length > 5 && (
              <span className="text-[10px] text-muted-foreground/60">+{selected.length - 5}</span>
            )}
          </div>
        )}
        <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground/50 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-[240px] overflow-y-auto rounded-lg border border-border/50 bg-card shadow-lg">
          {items.map((item) => {
            const isSelected = selected.includes(item.id);
            return (
              <div
                key={item.id}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-muted/20 cursor-pointer"
                onClick={() => onToggle(item.id)}
              >
                <div className={cn(
                  'h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0',
                  isSelected ? 'bg-violet-500 border-violet-500' : 'border-border/50',
                )}>
                  {isSelected && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                </div>
                <span className="text-base shrink-0">{item.emoji}</span>
                <span className="text-xs text-foreground/85 flex-1">{item.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
