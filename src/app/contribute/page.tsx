"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Check,
  Loader2,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { searchCareers, type Career } from "@/lib/career-pathways";
import { useDebounce } from "@/hooks/use-debounce";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────

interface PathStep {
  age: number;
  label: string;
}

interface FormData {
  displayName: string;
  currentTitle: string;
  country: string;
  city: string;
  steps: PathStep[];
  careerTags: { id: string; title: string }[];
  didAttendUniversity: boolean;
  yearsOfExperience: string;
  headline: string;
  advice: string;
  submittedByEmail: string;
}

const INITIAL_FORM: FormData = {
  displayName: "",
  currentTitle: "",
  country: "",
  city: "",
  steps: [{ age: 16, label: "" }],
  careerTags: [],
  didAttendUniversity: false,
  yearsOfExperience: "",
  headline: "",
  advice: "",
  submittedByEmail: "",
};

const STEP_TITLES = [
  "About you",
  "Your career timeline",
  "Link to careers",
  "Final details",
];

// ── Career Search ─────────────────────────────────────────────────

function CareerSearch({
  selected,
  onAdd,
  onRemove,
}: {
  selected: { id: string; title: string }[];
  onAdd: (career: Career) => void;
  onRemove: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 250);
  const results =
    debouncedQuery.length >= 2
      ? searchCareers(debouncedQuery).slice(0, 6)
      : [];

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search for careers your path relates to..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      {results.length > 0 && (
        <div className="border rounded-lg divide-y max-h-[200px] overflow-y-auto">
          {results
            .filter((c) => !selected.some((s) => s.id === c.id))
            .map((career) => (
              <button
                key={career.id}
                type="button"
                onClick={() => {
                  onAdd(career);
                  setQuery("");
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted/50 transition-colors"
              >
                <span>{career.emoji}</span>
                <span className="font-medium">{career.title}</span>
                <Plus className="h-3.5 w-3.5 ml-auto text-muted-foreground" />
              </button>
            ))}
        </div>
      )}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
            >
              {tag.title}
              <button
                type="button"
                onClick={() => onRemove(tag.id)}
                className="hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────

export default function ContributePage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const addStep = () => {
    const lastAge = form.steps[form.steps.length - 1]?.age ?? 16;
    update("steps", [...form.steps, { age: Math.min(lastAge + 3, 65), label: "" }]);
  };

  const removeStep = (index: number) => {
    if (form.steps.length <= 1) return;
    update(
      "steps",
      form.steps.filter((_, i) => i !== index),
    );
  };

  const updateStep = (index: number, field: keyof PathStep, value: string | number) => {
    const updated = [...form.steps];
    updated[index] = { ...updated[index], [field]: value };
    update("steps", updated);
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 0:
        return !!(form.displayName.trim() && form.currentTitle.trim() && form.country.trim());
      case 1:
        return form.steps.length >= 2 && form.steps.every((s) => s.label.trim());
      case 2:
        return form.careerTags.length >= 1;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/career-paths/contribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: form.displayName,
          currentTitle: form.currentTitle,
          country: form.country,
          city: form.city || undefined,
          steps: form.steps.sort((a, b) => a.age - b.age),
          careerTags: form.careerTags.map((t) => t.id),
          didAttendUniversity: form.didAttendUniversity,
          yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : undefined,
          headline: form.headline || undefined,
          advice: form.advice || undefined,
          submittedByEmail: form.submittedByEmail || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success state ─────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md"
        >
          <div className="text-center mb-6">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 mb-4">
              <Check className="h-8 w-8 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Thank you</h1>
            <p className="text-muted-foreground mb-1">
              Your career path has been submitted for review.
            </p>
            <p className="text-sm text-muted-foreground/70">
              Once approved, young people exploring similar careers will see your
              real journey alongside the textbook route — showing them that there
              is more than one way to get there.
            </p>
          </div>

          {/* Summary of what was submitted */}
          <div className="rounded-xl border bg-card/50 p-4 mb-6">
            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mb-3">What you submitted</p>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                {form.displayName.charAt(0).toUpperCase() || "?"}
              </div>
              <div>
                <p className="text-sm font-medium">{form.displayName}</p>
                <p className="text-[10px] text-muted-foreground">
                  {form.currentTitle} &middot; {form.country}{form.didAttendUniversity ? "" : " · No university"}
                </p>
              </div>
            </div>
            {form.headline && (
              <p className="text-xs italic text-muted-foreground/70 mb-2">&ldquo;{form.headline}&rdquo;</p>
            )}
            <div className="space-y-1 mb-2">
              {form.steps.sort((a, b) => a.age - b.age).map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground/50 w-6 text-right tabular-nums">{s.age}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" />
                  <span className="text-foreground/70">{s.label}</span>
                </div>
              ))}
            </div>
            {form.advice && (
              <p className="text-[10px] text-muted-foreground/60 mt-2">
                Advice: &ldquo;{form.advice}&rdquo;
              </p>
            )}
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setForm(INITIAL_FORM);
                setStep(0);
                setSubmitted(false);
              }}
            >
              Submit another
            </Button>
            <Button asChild>
              <Link href="/for-parents">Back</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 mb-3">
            <Heart className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            Share Your Career Path
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Your real journey helps young people see that careers rarely follow
            a straight line. Every path contributed makes the picture clearer.
          </p>
        </div>

        {/* MVP notice */}
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] px-4 py-3 mb-6 text-center">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-amber-500">Early access</span>{" "}
            — This feature is community-powered and growing. The more paths
            shared, the more accurate the picture becomes for everyone.
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1 mb-6">
          {STEP_TITLES.map((title, i) => (
            <div key={title} className="flex-1">
              <div
                className={cn(
                  "h-1 rounded-full transition-colors",
                  i <= step ? "bg-primary" : "bg-muted",
                )}
              />
              <p
                className={cn(
                  "text-[10px] mt-1 text-center",
                  i === step
                    ? "text-foreground font-medium"
                    : "text-muted-foreground/50",
                )}
              >
                {title}
              </p>
            </div>
          ))}
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Step 0: About you */}
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Display name
                  </label>
                  <Input
                    placeholder='e.g. "Nicky M." or "Anna K."'
                    value={form.displayName}
                    onChange={(e) => update("displayName", e.target.value)}
                  />
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    Your first name and last initial — shown to young people
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Current job title
                  </label>
                  <Input
                    placeholder="e.g. Programme Manager"
                    value={form.currentTitle}
                    onChange={(e) => update("currentTitle", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Country
                    </label>
                    <Input
                      placeholder="e.g. Norway"
                      value={form.country}
                      onChange={(e) => update("country", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      City <span className="text-muted-foreground/50">(optional)</span>
                    </label>
                    <Input
                      placeholder="e.g. Oslo"
                      value={form.city}
                      onChange={(e) => update("city", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    Did you attend university?
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: true, label: "Yes" },
                      { value: false, label: "No" },
                    ].map((opt) => (
                      <button
                        key={String(opt.value)}
                        type="button"
                        onClick={() => update("didAttendUniversity", opt.value)}
                        className={cn(
                          "flex-1 px-3 py-2 rounded-lg border text-sm transition-colors",
                          form.didAttendUniversity === opt.value
                            ? "border-primary bg-primary/10 text-primary font-medium"
                            : "border-border hover:bg-muted/50",
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Timeline */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-medium mb-1">Your career timeline</h2>
                  <p className="text-xs text-muted-foreground mb-4">
                    Add each major step — from leaving school to where you are
                    now. Include job changes, education, moves abroad, career
                    switches — everything that shaped your path.
                  </p>
                </div>

                <div className="space-y-3">
                  {form.steps.map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="flex flex-col items-center pt-2">
                        <div className="h-3 w-3 rounded-full border-2 border-primary bg-background" />
                        {i < form.steps.length - 1 && (
                          <div className="w-px flex-1 bg-border mt-1" />
                        )}
                      </div>
                      <div className="flex-1 flex gap-2">
                        <div className="w-16 shrink-0">
                          <label className="text-[10px] text-muted-foreground">
                            Age
                          </label>
                          <Input
                            type="number"
                            min={14}
                            max={70}
                            value={s.age}
                            onChange={(e) =>
                              updateStep(i, "age", parseInt(e.target.value) || 16)
                            }
                            className="h-9 text-center"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] text-muted-foreground">
                            What happened
                          </label>
                          <Input
                            placeholder="e.g. Started as IT support at local company"
                            value={s.label}
                            onChange={(e) =>
                              updateStep(i, "label", e.target.value)
                            }
                            className="h-9"
                          />
                        </div>
                        {form.steps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeStep(i)}
                            className="mt-4 p-1.5 text-muted-foreground/40 hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addStep}
                  className="w-full"
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add step
                </Button>
              </div>
            )}

            {/* Step 2: Career tags */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-medium mb-1">
                    Which careers does your path relate to?
                  </h2>
                  <p className="text-xs text-muted-foreground mb-4">
                    Search for the careers your experience is most relevant to.
                    Your path will appear when young people explore these careers.
                  </p>
                </div>
                <CareerSearch
                  selected={form.careerTags}
                  onAdd={(career) =>
                    update("careerTags", [
                      ...form.careerTags,
                      { id: career.id, title: career.title },
                    ])
                  }
                  onRemove={(id) =>
                    update(
                      "careerTags",
                      form.careerTags.filter((t) => t.id !== id),
                    )
                  }
                />
              </div>
            )}

            {/* Step 3: Final details */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Headline{" "}
                    <span className="text-muted-foreground/50">(optional)</span>
                  </label>
                  <Input
                    placeholder='e.g. "School to Programme Manager — no degree, three countries"'
                    value={form.headline}
                    onChange={(e) => update("headline", e.target.value)}
                  />
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    A one-liner summarising your journey
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    One piece of advice for a young person{" "}
                    <span className="text-muted-foreground/50">(optional)</span>
                  </label>
                  <Input
                    placeholder='e.g. "Say yes to sideways moves — they teach you more than promotions"'
                    value={form.advice}
                    onChange={(e) => update("advice", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Years of experience
                    <span className="text-muted-foreground/50"> (optional)</span>
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={50}
                    placeholder="e.g. 20"
                    value={form.yearsOfExperience}
                    onChange={(e) => update("yearsOfExperience", e.target.value)}
                    className="w-24"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Your email{" "}
                    <span className="text-muted-foreground/50">(optional, never shown)</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="In case we need to follow up"
                    value={form.submittedByEmail}
                    onChange={(e) => update("submittedByEmail", e.target.value)}
                  />
                </div>

                {/* Preview */}
                <div className="rounded-xl border bg-card/50 p-4 mt-4">
                  <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mb-2">
                    Preview
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {form.displayName.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{form.displayName || "—"}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {form.currentTitle || "—"} · {form.country || "—"}
                        {!form.didAttendUniversity && " · No university"}
                      </p>
                    </div>
                  </div>
                  {form.headline && (
                    <p className="text-xs text-foreground/80 italic mb-2">
                      &ldquo;{form.headline}&rdquo;
                    </p>
                  )}
                  <div className="space-y-1.5">
                    {form.steps
                      .sort((a, b) => a.age - b.age)
                      .map((s, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground w-8 text-right shrink-0 tabular-nums">
                            {s.age}
                          </span>
                          <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                          <span className="text-foreground/80">{s.label || "—"}</span>
                        </div>
                      ))}
                  </div>
                  {form.advice && (
                    <p className="text-[10px] text-muted-foreground mt-3 border-t pt-2">
                      Advice: &ldquo;{form.advice}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Error */}
        {error && (
          <p className="text-sm text-destructive mt-3 text-center">{error}</p>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>

          {step < STEP_TITLES.length - 1 ? (
            <Button
              size="sm"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit path
                  <Check className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          )}
        </div>

        {/* Footer */}
        <p className="text-[10px] text-muted-foreground/40 text-center mt-8">
          Your path will be reviewed before it goes live. Names are shown as
          initials only. No personal data is shared beyond what you enter here.
        </p>
      </div>
    </div>
  );
}
