"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Check,
  Loader2,
  Heart,
  Search,
  X,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { searchCareers, type Career } from "@/lib/career-pathways";
import { useDebounce } from "@/hooks/use-debounce";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────

interface FormData {
  displayName: string;
  currentTitle: string;
  country: string;
  city: string;
  howIGotHere: string;
  whatIStudied: string;
  firstSalary: string;
  hardestPart: string;
  adviceToSeventeen: string;
  realityOfJob: string;
  careerTags: { id: string; title: string }[];
  submittedByEmail: string;
}

const INITIAL_FORM: FormData = {
  displayName: "",
  currentTitle: "",
  country: "",
  city: "",
  howIGotHere: "",
  whatIStudied: "",
  firstSalary: "",
  hardestPart: "",
  adviceToSeventeen: "",
  realityOfJob: "",
  careerTags: [],
  submittedByEmail: "",
};

const STEP_TITLES = [
  "About you",
  "Your story",
  "The honest truth",
  "Link & finish",
];

// Minimum chars required to advance the prose-prompt step
const MIN_PROSE = 10;

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

// ── Prose prompt block ────────────────────────────────────────────

function PromptBlock({
  label,
  hint,
  placeholder,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  hint?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label className="text-sm font-medium mb-1 block">{label}</label>
      {hint && <p className="text-[11px] text-muted-foreground/60 mb-1.5">{hint}</p>}
      <Textarea
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="resize-none"
      />
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

  const canProceed = (): boolean => {
    switch (step) {
      case 0:
        return !!(form.displayName.trim() && form.currentTitle.trim() && form.country.trim());
      case 1:
        return (
          form.howIGotHere.trim().length >= MIN_PROSE &&
          form.whatIStudied.trim().length >= 2 &&
          form.firstSalary.trim().length >= 2
        );
      case 2:
        return (
          form.hardestPart.trim().length >= MIN_PROSE &&
          form.adviceToSeventeen.trim().length >= MIN_PROSE &&
          form.realityOfJob.trim().length >= MIN_PROSE
        );
      case 3:
        return form.careerTags.length >= 1;
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
          howIGotHere: form.howIGotHere,
          whatIStudied: form.whatIStudied,
          firstSalary: form.firstSalary,
          hardestPart: form.hardestPart,
          adviceToSeventeen: form.adviceToSeventeen,
          realityOfJob: form.realityOfJob,
          careerTags: form.careerTags.map((t) => t.id),
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
              Your career story has been submitted for review.
            </p>
            <p className="text-sm text-muted-foreground/70">
              Once approved, young people exploring similar careers will see your
              real journey alongside the textbook route — showing them that there
              is more than one way to get there.
            </p>
          </div>

          <div className="rounded-xl border bg-card/50 p-4 mb-6">
            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mb-3">
              What you submitted
            </p>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                {form.displayName.charAt(0).toUpperCase() || "?"}
              </div>
              <div>
                <p className="text-sm font-medium">{form.displayName}</p>
                <p className="text-[10px] text-muted-foreground">
                  {form.currentTitle} &middot; {form.country}
                </p>
              </div>
            </div>
            <p className="text-xs text-foreground/70 line-clamp-3">
              {form.howIGotHere}
            </p>
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
            Your real story helps young people see that careers rarely follow
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
                    Current role
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
              </div>
            )}

            {/* Step 1: Your story */}
            {step === 1 && (
              <div className="space-y-5">
                <PromptBlock
                  label="How I got here"
                  hint="The honest path from school to your current role — sideways moves, gaps and all."
                  placeholder="e.g. Left school at 18 with no real plan. Took an admin job, got bored, taught myself SQL on weekends. Two years later jumped to a junior analyst role at a small consultancy..."
                  value={form.howIGotHere}
                  onChange={(v) => update("howIGotHere", v)}
                  rows={6}
                />
                <PromptBlock
                  label="What I studied"
                  hint="School, university, courses, self-taught — or none of the above."
                  placeholder='e.g. "Two A-levels, no degree. Did a free Google certificate at 22." or "BSc Economics, then a part-time bootcamp."'
                  value={form.whatIStudied}
                  onChange={(v) => update("whatIStudied", v)}
                  rows={3}
                />
                <PromptBlock
                  label="My first salary"
                  hint="A real number is most useful, but ranges or context are fine too."
                  placeholder='e.g. "£18,000 in 2008", "Minimum wage", "Unpaid internship for 6 months"'
                  value={form.firstSalary}
                  onChange={(v) => update("firstSalary", v)}
                  rows={2}
                />
              </div>
            )}

            {/* Step 2: The honest truth */}
            {step === 2 && (
              <div className="space-y-5">
                <PromptBlock
                  label="The hardest part of the journey"
                  hint="The bit you'd never see on a LinkedIn profile."
                  placeholder="e.g. Spent two years feeling like everyone around me knew what they were doing and I was faking it. Got made redundant once. Almost quit twice..."
                  value={form.hardestPart}
                  onChange={(v) => update("hardestPart", v)}
                  rows={5}
                />
                <PromptBlock
                  label="What I'd tell my 17-year-old self"
                  hint="The single thing you wish someone had told you back then."
                  placeholder="e.g. Stop trying to pick the perfect path. The first job is just a starting point — not a verdict on the rest of your life..."
                  value={form.adviceToSeventeen}
                  onChange={(v) => update("adviceToSeventeen", v)}
                  rows={4}
                />
                <PromptBlock
                  label="The reality of my job"
                  hint="What an actual day looks like — including the boring bits."
                  placeholder="e.g. Maybe 30% real work, 40% meetings, 20% chasing people for answers, 10% writing the same status update three different ways..."
                  value={form.realityOfJob}
                  onChange={(v) => update("realityOfJob", v)}
                  rows={5}
                />
              </div>
            )}

            {/* Step 3: Link & finish */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-sm font-medium mb-1">
                    Which careers does your path relate to?
                  </h2>
                  <p className="text-xs text-muted-foreground mb-3">
                    Search for the careers your experience is most relevant to.
                    Your story will appear when young people explore these careers.
                  </p>
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

                {/* Video stub */}
                <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-5">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                      <Video className="h-4 w-4 text-muted-foreground/60" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground/80">
                        Optional 45-second selfie video
                      </p>
                      <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                        Coming soon — you'll be able to record a short clip
                        introducing yourself and your path. For now, your written
                        story is enough.
                      </p>
                    </div>
                  </div>
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
                <div className="rounded-xl border bg-card/50 p-4 mt-2">
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
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-foreground/80 line-clamp-3 mb-2">
                    {form.howIGotHere || "Your story will appear here."}
                  </p>
                  {form.adviceToSeventeen && (
                    <p className="text-[10px] text-primary/70 italic border-t pt-2 mt-2">
                      &ldquo;{form.adviceToSeventeen}&rdquo;
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
              disabled={submitting || !canProceed()}
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
