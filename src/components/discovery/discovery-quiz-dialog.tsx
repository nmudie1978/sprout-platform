"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
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
];

/**
 * Dismiss-on-outside-interaction hook. When `isOpen` is true, listens for a
 * mousedown anywhere outside `ref` (and the Escape key) and calls `onClose`.
 * Listeners are torn down whenever the dropdown closes or the component
 * unmounts, so we never leak a document handler.
 */
function useDismiss(
  ref: React.RefObject<HTMLElement | null>,
  onClose: () => void,
  isOpen: boolean
) {
  useEffect(() => {
    if (!isOpen) return;

    const handlePointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [ref, onClose, isOpen]);
}

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
  /**
   * Grade range state. `null` = user hasn't set a range yet (no filter
   * applied). Both values default to 3-4 when the user clicks "Set a
   * range" — a sane midpoint that matches the most common VGS bell curve.
   */
  const [gradeRange, setGradeRange] = useState<{ low: number; high: number } | null>(null);
  const [excludeUniversity, setExcludeUniversity] = useState(false);

  // Sync from initialValue whenever the dialog re-opens
  useEffect(() => {
    if (open) {
      setSubjects(initialValue?.subjects || []);
      setStarredSubjects(initialValue?.starredSubjects || []);
      setWorkStyles(initialValue?.workStyles || []);
      setPeoplePref(initialValue?.peoplePref);
      setInterests(initialValue?.interests || []);
      setGradeRange(initialValue?.gradeRange ?? null);
      setExcludeUniversity(!!initialValue?.excludeUniversity);
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
        // Send null/false explicitly so the server can clear them —
        // otherwise a user who turns the range off won't be able to.
        gradeRange: gradeRange ?? undefined,
        excludeUniversity: excludeUniversity || undefined,
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
      toast({ title: "Preferences saved", description: "Your Career Radar is updated.", variant: "success" });
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
      toast({ title: "Couldn't save preferences", description: "Please try again.", variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header — refined badge + tightened title, subtle divider beneath */}
        <DialogHeader className="space-y-0 px-6 pt-6 pb-4 border-b border-border/60">
          <div className="flex items-start gap-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/15 to-emerald-500/15 ring-1 ring-teal-500/20">
              <Sparkles className="h-5 w-5 text-teal-400" />
            </span>
            <div className="min-w-0 space-y-1">
              <DialogTitle className="text-lg font-semibold tracking-tight">
                Tell us what you like
              </DialogTitle>
              <DialogDescription className="text-[13px] leading-relaxed text-muted-foreground">
                We&apos;ll surface careers across every path — including ones you&apos;ve probably
                never heard of. Nothing is tracked, and you can change this any time.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 px-6 py-5">
          {/* Subjects + Things you enjoy — side by side */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Subjects — dropdown multi-select */}
            <div className="space-y-1.5">
              <Label className="text-[13px] font-semibold text-foreground">Subjects you enjoy</Label>
              <p className="text-[11px] leading-snug text-muted-foreground">
                Pick the ones you like most — 3–5 gives the sharpest results.
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

            {/* Interests / activities */}
            <div className="space-y-1.5">
              <Label className="text-[13px] font-semibold text-foreground">Things you enjoy</Label>
              <p className="text-[11px] leading-snug text-muted-foreground">
                What you like doing outside of school — pick any that fit.
              </p>
              <InterestMultiSelect
                items={INTERESTS}
                selected={interests}
                onToggle={(id) => toggle(interests, setInterests, id)}
              />
            </div>
          </div>

          {/* Work styles */}
          <div className="space-y-2">
            <div className="space-y-0.5">
              <Label className="text-[13px] font-semibold text-foreground">How you like to work</Label>
              <p className="text-[11px] leading-snug text-muted-foreground">
                Choose any that feel like you.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {WORK_STYLES.map((w) => {
                const isOn = workStyles.includes(w.id);
                return (
                  <button
                    key={w.id}
                    type="button"
                    aria-pressed={isOn}
                    onClick={() => toggle(workStyles, setWorkStyles, w.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                      isOn
                        ? "border-teal-500/50 bg-teal-500/15 text-teal-300 ring-1 ring-teal-500/20"
                        : "border-border/60 text-foreground/70 hover:border-teal-500/40 hover:bg-teal-500/5 hover:text-foreground",
                    )}
                  >
                    <span aria-hidden>{w.emoji}</span>
                    {w.label}
                    {isOn && <Check className="h-3 w-3 text-teal-300" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* People preference */}
          <div className="space-y-2">
            <div className="space-y-0.5">
              <Label className="text-[13px] font-semibold text-foreground">Working with people</Label>
              <p className="text-[11px] leading-snug text-muted-foreground">
                How much contact suits you best?
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {PEOPLE_PREFS.map((p) => {
                const isOn = peoplePref === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={isOn}
                    onClick={() => setPeoplePref(isOn ? undefined : p.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                      isOn
                        ? "border-teal-500/50 bg-teal-500/15 text-teal-300 ring-1 ring-teal-500/20"
                        : "border-border/60 text-foreground/70 hover:border-teal-500/40 hover:bg-teal-500/5 hover:text-foreground",
                    )}
                  >
                    {p.label}
                    {isOn && <Check className="h-3 w-3 text-teal-300" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* University preference — refined toggle row */}
          <div className="rounded-xl border border-border/60 bg-muted/20 px-3.5 py-3">
            <label className="flex cursor-pointer items-center gap-2.5 group">
              <input
                type="checkbox"
                checked={excludeUniversity}
                onChange={(e) => setExcludeUniversity(e.target.checked)}
                className="h-4 w-4 rounded border-border/60 accent-teal-500"
              />
              <span className="text-[13px] font-medium text-foreground/80 transition-colors group-hover:text-foreground">
                I&apos;d rather not go to university
              </span>
            </label>
            {excludeUniversity && (
              <p className="mt-2 pl-[26px] text-[11px] leading-relaxed text-muted-foreground">
                Bachelor / master / profesjonsstudium paths will be hidden. Fagbrev, fagskole,
                apprenticeships and direct-entry roles still show.
              </p>
            )}
          </div>
        </div>

        {/* Footer — subtle divider, ghost cancel + polished primary CTA */}
        <DialogFooter className="gap-2 border-t border-border/60 px-6 py-4 sm:gap-2">
          <Button variant="ghost" onClick={onClose} disabled={saveMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-sm shadow-teal-900/20 hover:from-teal-500 hover:to-emerald-500"
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
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
  const rootRef = useRef<HTMLDivElement>(null);
  useDismiss(rootRef, () => setOpen(false), open);

  return (
    <div className="relative" ref={rootRef}>
      {/* Trigger — a <div role="button"> rather than a real <button> because
          the selected-subject chips inside it each contain an X <button>, and
          HTML forbids a button nested in a button (causes a hydration error).
          role/tabIndex/onKeyDown keep it keyboard-operable. min-h keeps the
          two columns aligned even when one has chips and the other is empty. */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(!open);
          }
        }}
        className={cn(
          "flex min-h-[42px] w-full cursor-pointer items-center justify-between gap-2 rounded-xl border bg-muted/20 px-3 py-2 text-left transition-colors",
          open
            ? "border-teal-500/50 ring-1 ring-teal-500/20"
            : "border-border/60 hover:border-teal-500/40",
        )}
      >
        {selected.length === 0 ? (
          <span className="text-xs text-muted-foreground">Select subjects…</span>
        ) : (
          <div className="flex min-w-0 flex-1 flex-wrap gap-1">
            {selected.slice(0, 5).map((id) => {
              const label = subjects.find((s) => s.id === id)?.label ?? id;
              const isStarred = starred.includes(id);
              return (
                <span
                  key={id}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1",
                    isStarred
                      ? "bg-amber-500/15 text-amber-300 ring-amber-500/25"
                      : "bg-teal-500/15 text-teal-300 ring-teal-500/25",
                  )}
                >
                  {isStarred && <span aria-hidden>⭐</span>}
                  {label}
                  <button
                    type="button"
                    aria-label={`Remove ${label}`}
                    onClick={(e) => { e.stopPropagation(); onToggle(id); }}
                    className="-mr-0.5 rounded-full p-0.5 opacity-70 transition-opacity hover:opacity-100"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              );
            })}
            {selected.length > 5 && (
              <span className="self-center text-[10px] text-muted-foreground">+{selected.length - 5}</span>
            )}
          </div>
        )}
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1.5 max-h-[220px] w-full overflow-y-auto rounded-xl border border-border/60 bg-card p-1 shadow-xl">
          {subjects.map((s) => {
            const isSelected = selected.includes(s.id);
            const isStarred = starred.includes(s.id);
            return (
              <div
                key={s.id}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-teal-500/10"
                onClick={() => onToggle(s.id)}
              >
                <div className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                  isSelected ? "border-teal-500 bg-teal-500" : "border-border/70",
                )}>
                  {isSelected && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                </div>
                <span className="flex-1 text-xs text-foreground/90">{s.label}</span>
                {isSelected && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onStar(s.id); }}
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[11px] transition-colors",
                      isStarred
                        ? "bg-amber-500/20 text-amber-300"
                        : "text-muted-foreground hover:bg-amber-500/10 hover:text-amber-300",
                    )}
                    title="Star this subject — it counts more in your radar"
                  >
                    {isStarred ? "⭐" : "☆"}
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
  const rootRef = useRef<HTMLDivElement>(null);
  useDismiss(rootRef, () => setOpen(false), open);

  return (
    <div className="relative" ref={rootRef}>
      {/* Trigger — a <div role="button"> rather than a real <button> because
          the selected chips inside it each contain an X <button>, and HTML
          forbids a button nested in a button (causes a hydration error).
          role/tabIndex/onKeyDown keep it keyboard-operable. min-h matches the
          subjects column so the two align even when this one is empty. */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(!open);
          }
        }}
        className={cn(
          "flex min-h-[42px] w-full cursor-pointer items-center justify-between gap-2 rounded-xl border bg-muted/20 px-3 py-2 text-left transition-colors",
          open
            ? "border-violet-500/50 ring-1 ring-violet-500/20"
            : "border-border/60 hover:border-violet-500/40",
        )}
      >
        {selected.length === 0 ? (
          <span className="text-xs text-muted-foreground">Select activities you enjoy…</span>
        ) : (
          <div className="flex min-w-0 flex-1 flex-wrap gap-1">
            {selected.slice(0, 5).map((id) => {
              const item = items.find((i) => i.id === id);
              if (!item) return null;
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-medium text-violet-300 ring-1 ring-violet-500/25"
                >
                  <span aria-hidden>{item.emoji}</span>
                  {item.label}
                  <button
                    type="button"
                    aria-label={`Remove ${item.label}`}
                    onClick={(e) => { e.stopPropagation(); onToggle(id); }}
                    className="-mr-0.5 rounded-full p-0.5 opacity-70 transition-opacity hover:opacity-100"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              );
            })}
            {selected.length > 5 && (
              <span className="self-center text-[10px] text-muted-foreground">+{selected.length - 5}</span>
            )}
          </div>
        )}
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1.5 max-h-[240px] w-full overflow-y-auto rounded-xl border border-border/60 bg-card p-1 shadow-xl">
          {items.map((item) => {
            const isSelected = selected.includes(item.id);
            return (
              <div
                key={item.id}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-violet-500/10"
                onClick={() => onToggle(item.id)}
              >
                <div className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                  isSelected ? "border-violet-500 bg-violet-500" : "border-border/70",
                )}>
                  {isSelected && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                </div>
                <span className="shrink-0 text-base" aria-hidden>{item.emoji}</span>
                <span className="flex-1 text-xs text-foreground/90">{item.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
