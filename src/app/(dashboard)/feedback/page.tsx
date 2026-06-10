"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Loader2,
  CheckCircle2,
  HelpCircle,
  Bug,
  Lightbulb,
  Heart,
  Star,
} from "lucide-react";

const RATING_LABELS: Record<number, string> = {
  1: "Highly disappointing",
  2: "Disappointing",
  3: "Okay",
  4: "Good",
  5: "Amazing",
};

type Kind = "CONFUSED" | "PROBLEM" | "IDEA" | "PRAISE";
type Area = "JOURNEY" | "CAREER_RADAR" | "EXPLORE_CAREERS" | "LIBRARY" | "CAREER_TWIN" | "OTHER";
type Role = "TEEN_16_20" | "PARENT_GUARDIAN" | "ADULT_OTHER";

const KIND_OPTIONS: { value: Kind; label: string; icon: typeof HelpCircle; placeholder: string }[] = [
  { value: "CONFUSED", label: "Something confused me", icon: HelpCircle, placeholder: "What were you trying to do, and where did it get unclear?" },
  { value: "PROBLEM", label: "Found a problem", icon: Bug, placeholder: "What happened? What did you expect instead?" },
  { value: "IDEA", label: "I have an idea", icon: Lightbulb, placeholder: "Tell us what you'd love to see." },
  { value: "PRAISE", label: "Something I liked", icon: Heart, placeholder: "What worked well for you?" },
];

const AREA_OPTIONS: { value: Area; label: string }[] = [
  { value: "JOURNEY", label: "My Journey" },
  { value: "CAREER_RADAR", label: "Career Radar" },
  { value: "EXPLORE_CAREERS", label: "Explore Careers" },
  { value: "LIBRARY", label: "My Library" },
  { value: "CAREER_TWIN", label: "Career Twin" },
  { value: "OTHER", label: "Something else" },
];

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "TEEN_16_20", label: "Teen (15–23)" },
  { value: "PARENT_GUARDIAN", label: "Parent / Guardian" },
  { value: "ADULT_OTHER", label: "Adult (teacher / mentor / other)" },
];

const MAX = 1000;

export default function FeedbackPage() {
  const searchParams = useSearchParams();
  const source = searchParams.get("source") || undefined;

  const [rating, setRating] = useState<number | null>(null);
  const [kind, setKind] = useState<Kind | null>(null);
  const [area, setArea] = useState<Area | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A rating alone is enough to submit; written feedback needs a kind + message.
  const isValid = rating !== null || (kind !== null && message.trim().length > 0);
  const placeholder =
    KIND_OPTIONS.find((k) => k.value === kind)?.placeholder ?? "Tell us what's on your mind.";

  const handleSubmit = async () => {
    if (!isValid) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          kind,
          area,
          message: message.trim() || null,
          role,
          source,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit feedback");
        return;
      }
      setIsSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <div className="rounded-card border border-border bg-card text-center px-6 pt-12 pb-10">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Thank you</h1>
          <p className="text-muted-foreground">
            This genuinely helps us make Endeavrly clearer.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-control bg-primary">
            <MessageSquare className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Share feedback</h1>
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
            Beta
          </span>
        </div>
        <p className="text-muted-foreground text-sm">
          Tell us what&apos;s working and what isn&apos;t. It takes less than a minute and helps us improve Endeavrly.
        </p>
      </div>

      <div className="space-y-6">
        {/* Overall rating (optional, can be submitted on its own) */}
        <section>
          <h2 className="text-sm font-semibold mb-1">
            How would you rate Endeavrly?
            <span className="text-muted-foreground font-normal ml-2">(optional)</span>
          </h2>
          <div className="flex items-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((n) => {
              const filled = (rating ?? 0) >= n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(rating === n ? null : n)}
                  aria-label={`${n} star${n > 1 ? "s" : ""} — ${RATING_LABELS[n]}`}
                  aria-pressed={rating === n}
                  className="rounded-control p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "h-7 w-7 transition-colors",
                      filled
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/35 hover:text-amber-400/50",
                    )}
                  />
                </button>
              );
            })}
            <span className="ml-2 text-xs text-muted-foreground min-w-[7rem]">
              {rating != null ? RATING_LABELS[rating] : "1 = poor · 5 = amazing"}
            </span>
          </div>
        </section>

        {/* Kind (required for written feedback) */}
        <section>
          <h2 className="text-sm font-semibold mb-3">What kind of feedback is this?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {KIND_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = kind === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setKind(opt.value)}
                  aria-pressed={active}
                  className={cn(
                    "flex items-center gap-2.5 rounded-control border px-3.5 py-3 text-left text-sm transition-colors",
                    active
                      ? "border-primary bg-primary/[0.06] text-foreground"
                      : "border-border bg-card/40 text-foreground/80 hover:border-border hover:bg-muted/40",
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground/60")} />
                  <span className="font-medium">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Area (optional) */}
        <section>
          <h2 className="text-sm font-semibold mb-1">
            Which part is it about?
            <span className="text-muted-foreground font-normal ml-2">(optional)</span>
          </h2>
          <div className="flex flex-wrap gap-2 mt-2">
            {AREA_OPTIONS.map((opt) => {
              const active = area === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setArea(active ? null : opt.value)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "border-primary/40 bg-primary/[0.08] text-primary"
                      : "border-border text-muted-foreground/80 hover:text-foreground hover:border-border",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Message (required) */}
        <section>
          <h2 className="text-sm font-semibold mb-2">Your feedback</h2>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            maxLength={MAX}
            rows={5}
            className="resize-none"
          />
          <div className="flex justify-between mt-2">
            <p className="text-[11px] text-muted-foreground">
              Please avoid sharing personal contact details.
            </p>
            <span className="text-[11px] text-muted-foreground">
              {message.length}/{MAX}
            </span>
          </div>
        </section>

        {/* Role (optional) */}
        <section>
          <h2 className="text-sm font-semibold mb-1">
            You are…
            <span className="text-muted-foreground font-normal ml-2">(optional)</span>
          </h2>
          <div className="flex flex-wrap gap-2 mt-2">
            {ROLE_OPTIONS.map((opt) => {
              const active = role === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(active ? null : opt.value)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "border-primary/40 bg-primary/[0.08] text-primary"
                      : "border-border text-muted-foreground/80 hover:text-foreground hover:border-border",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </section>

        {error && (
          <div className="rounded-control border border-destructive/30 bg-destructive/[0.06] p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className="w-full h-12 text-base"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Sending…
            </>
          ) : (
            "Send feedback"
          )}
        </Button>
      </div>
    </div>
  );
}
