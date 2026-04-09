"use client";

/**
 * Career Preferences Section
 *
 * Compact editor for the user's `discoveryPreferences` — the same field
 * Career Radar writes to. Lets the user tweak subjects, work style,
 * people preference and free-form interests without having to re-do the
 * Radar onboarding flow. Saves are pushed via PATCH /api/profile and the
 * profile/recommendation queries are invalidated so the new prefs flow
 * through to the Match % column on /careers immediately.
 */

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Sparkles, X, Plus } from "lucide-react";

// Mirror the option lists used in the Career Radar onboarding wizard so
// /profile and /careers/radar stay in sync. If the wizard's vocab grows
// we'll re-import these from a shared module.
const SUBJECTS = [
  { id: "biology", label: "Biology" },
  { id: "math", label: "Math" },
  { id: "computing", label: "Computing" },
  { id: "english", label: "English" },
  { id: "art", label: "Art" },
  { id: "business", label: "Business" },
  { id: "languages", label: "Languages" },
  { id: "pe", label: "PE / Sport" },
  { id: "design-tech", label: "Design & Tech" },
  { id: "health-social", label: "Health & Social" },
] as const;

const WORK_STYLES = [
  { id: "hands-on", label: "Hands-on", emoji: "🛠️" },
  { id: "desk", label: "At a desk", emoji: "💻" },
  { id: "outdoors", label: "Outdoors", emoji: "🌲" },
  { id: "creative", label: "Creative", emoji: "🎨" },
  { id: "mixed", label: "A mix", emoji: "🔀" },
] as const;

const PEOPLE_PREFS = [
  { id: "with-people", label: "With people" },
  { id: "mixed", label: "A bit of both" },
  { id: "mostly-alone", label: "Mostly on my own" },
] as const;

const MAX_SUBJECTS = 3;
const MAX_INTERESTS = 12;

interface DiscoveryPrefs {
  subjects?: string[];
  starredSubjects?: string[];
  workStyles?: string[];
  peoplePref?: string;
  interests?: string[];
}

interface CareerPreferencesSectionProps {
  /** Current preferences from the loaded profile (may be null/undefined). */
  initial: DiscoveryPrefs | null | undefined;
}

export function CareerPreferencesSection({ initial }: CareerPreferencesSectionProps) {
  const queryClient = useQueryClient();

  const [subjects, setSubjects] = useState<string[]>(initial?.subjects ?? []);
  const [workStyle, setWorkStyle] = useState<string | null>(
    initial?.workStyles?.[0] ?? null
  );
  const [peoplePref, setPeoplePref] = useState<string | null>(
    initial?.peoplePref ?? null
  );
  const [interests, setInterests] = useState<string[]>(initial?.interests ?? []);
  const [interestDraft, setInterestDraft] = useState("");

  // Re-sync local state when the source profile loads / changes (e.g.
  // after the radar wizard runs). Without this the form would freeze on
  // whatever it was when this component first mounted.
  useEffect(() => {
    setSubjects(initial?.subjects ?? []);
    setWorkStyle(initial?.workStyles?.[0] ?? null);
    setPeoplePref(initial?.peoplePref ?? null);
    setInterests(initial?.interests ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initial?.subjects?.join("|"),
    initial?.workStyles?.join("|"),
    initial?.peoplePref,
    initial?.interests?.join("|"),
  ]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discoveryPreferences: {
            subjects,
            starredSubjects: initial?.starredSubjects ?? [],
            workStyles: workStyle ? [workStyle] : [],
            peoplePref: peoplePref ?? undefined,
            interests,
          },
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save preferences");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Career preferences saved",
        description: "Your recommendations and Match % will refresh.",
      });
      // Anything keyed off the profile or the radar should refetch so
      // the Match column on /careers updates without a hard reload.
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      queryClient.invalidateQueries({ queryKey: ["profile-completion"] });
      queryClient.invalidateQueries({ queryKey: ["discover-recommendations"] });
      queryClient.invalidateQueries({ queryKey: ["career-recommendations"] });
    },
    onError: (e: Error) => {
      toast({ title: "Couldn't save", description: e.message, variant: "destructive" });
    },
  });

  const toggleSubject = (id: string) => {
    setSubjects((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= MAX_SUBJECTS) return prev;
      return [...prev, id];
    });
  };

  const addInterest = () => {
    const v = interestDraft.trim();
    if (!v) return;
    if (interests.length >= MAX_INTERESTS) return;
    if (interests.some((i) => i.toLowerCase() === v.toLowerCase())) {
      setInterestDraft("");
      return;
    }
    setInterests([...interests, v]);
    setInterestDraft("");
  };

  const removeInterest = (i: string) =>
    setInterests((prev) => prev.filter((x) => x !== i));

  return (
    <Card className="border bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-teal-500" />
          <CardTitle className="text-base">Career preferences</CardTitle>
        </div>
        <CardDescription className="text-xs">
          What you like, how you want to work, and what interests you. Powers
          your Match % on Explore Careers and the Recommended for you list.
          Same field as Career Radar — edit in either place.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* ── Subjects ─────────────────────────────────────────────── */}
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Subjects you enjoy
          </Label>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5 mb-2">
            Pick up to {MAX_SUBJECTS}.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SUBJECTS.map((s) => {
              const selected = subjects.includes(s.id);
              const disabled = !selected && subjects.length >= MAX_SUBJECTS;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSubject(s.id)}
                  disabled={disabled}
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-medium border transition-colors",
                    selected
                      ? "border-teal-500/60 bg-teal-500/15 text-teal-300"
                      : disabled
                        ? "border-border/30 text-muted-foreground/30 cursor-not-allowed"
                        : "border-border/40 text-muted-foreground/70 hover:border-teal-500/40 hover:text-foreground"
                  )}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Work style ───────────────────────────────────────────── */}
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Where you work best
          </Label>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {WORK_STYLES.map((w) => {
              const selected = workStyle === w.id;
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setWorkStyle(selected ? null : w.id)}
                  className={cn(
                    "rounded-lg px-2 py-2 text-[11px] font-medium border transition-colors flex flex-col items-center gap-0.5",
                    selected
                      ? "border-teal-500/60 bg-teal-500/15 text-teal-300"
                      : "border-border/40 text-muted-foreground/70 hover:border-teal-500/40 hover:text-foreground"
                  )}
                >
                  <span className="text-base leading-none">{w.emoji}</span>
                  <span>{w.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── People preference ────────────────────────────────────── */}
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            People around you
          </Label>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            {PEOPLE_PREFS.map((p) => {
              const selected = peoplePref === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPeoplePref(selected ? null : p.id)}
                  className={cn(
                    "rounded-lg px-3 py-2 text-[11px] font-medium border transition-colors text-left",
                    selected
                      ? "border-teal-500/60 bg-teal-500/15 text-teal-300"
                      : "border-border/40 text-muted-foreground/70 hover:border-teal-500/40 hover:text-foreground"
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Free-form interests ──────────────────────────────────── */}
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Interests
          </Label>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5 mb-2">
            Anything you care about — sports, animals, gaming, music, etc.
          </p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {interests.map((i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-foreground ring-1 ring-inset ring-border/60"
              >
                {i}
                <button
                  type="button"
                  onClick={() => removeInterest(i)}
                  className="text-muted-foreground/60 hover:text-foreground"
                  aria-label={`Remove ${i}`}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
            {interests.length === 0 && (
              <span className="text-[11px] text-muted-foreground/40 italic">
                Nothing added yet.
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              value={interestDraft}
              onChange={(e) => setInterestDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addInterest();
                }
              }}
              placeholder="Add an interest…"
              className="h-8 text-sm"
              maxLength={32}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addInterest}
              disabled={!interestDraft.trim() || interests.length >= MAX_INTERESTS}
              className="h-8 px-2"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          {interests.length >= MAX_INTERESTS && (
            <p className="text-[10px] text-muted-foreground/50 mt-1">
              Maximum {MAX_INTERESTS} interests.
            </p>
          )}
        </div>

        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="w-full h-9 text-sm"
        >
          {saveMutation.isPending ? "Saving…" : "Save preferences"}
        </Button>
      </CardContent>
    </Card>
  );
}
