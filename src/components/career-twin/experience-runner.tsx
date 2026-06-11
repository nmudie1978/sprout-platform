"use client";

/**
 * Experience The Job — guided scenario runner for Career Twin.
 *
 * The user steps out of free chat and experiences realistic moments from the
 * selected career, narrated by their future self. Each scene: Context +
 * Situation → free-text reply → Consequence + Reflection → next scene … →
 * Career Fit insights. Ephemeral — all state lives here, nothing is persisted.
 */

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Loader2,
  Send,
  Compass,
  Clock,
  CloudSun,
  RotateCcw,
  Lightbulb,
  ShieldAlert,
} from "lucide-react";
import {
  EXPERIENCE_LENGTHS,
  type ExperienceLength,
  type Scenario,
  type Reflection,
  type FitInsights,
} from "@/lib/career-twin/experience";

interface CompletedTurn {
  scenario: Scenario;
  userReply: string;
  consequence: string;
  reflection: Reflection;
}

const LENGTH_ICON: Record<ExperienceLength, typeof Compass> = {
  quick: Compass,
  typical_day: Clock,
  challenging_day: CloudSun,
};

// Honest, non-fabricated fallback shown when the run completes but the model
// didn't return structured fit insights — so the experience never dead-ends.
const FALLBACK_FIT: FitInsights = {
  enjoyed:
    "You worked through a full set of moments from this job — sit with which ones felt natural or energising. That's a real signal.",
  lessInterested:
    "Notice any moments that felt flat, stressful or draining. Those tell you just as much as the parts you enjoyed.",
  skillsUsed: [],
  skillsToDevelop: [],
  questionsToExplore: [],
};

export function ExperienceRunner({
  careerId,
  careerTitle,
}: {
  careerId: string | null;
  careerTitle: string;
}) {
  const [length, setLength] = useState<ExperienceLength | null>(null);
  const [turns, setTurns] = useState<CompletedTurn[]>([]);
  const [current, setCurrent] = useState<Scenario | null>(null);
  const [fitInsights, setFitInsights] = useState<FitInsights | null>(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Shown when a reply trips the distress guard — a supportive message in
  // place of an in-character continuation. The current scene stays so the
  // user can respond differently or step away.
  const [supportMessage, setSupportMessage] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const post = useCallback(
    async (payload: Record<string, unknown>) => {
      const res = await fetch("/api/career-twin/experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ careerId, length, ...payload }),
      });
      return res.json();
    },
    [careerId, length],
  );

  const messageFor = (data: { rateLimited?: boolean; unavailable?: boolean; needsCareer?: boolean; requiresAuth?: boolean }) => {
    if (data.rateLimited) return "You've explored a lot just now — take a short break and come back soon.";
    if (data.needsCareer) return "Pick a career goal first, then come back to experience it.";
    if (data.requiresAuth) return "Please sign in to try this.";
    return "Your future self is having a quiet moment — please try again shortly.";
  };

  const start = useCallback(
    async (chosen: ExperienceLength) => {
      setLength(chosen);
      setTurns([]);
      setCurrent(null);
      setFitInsights(null);
      setReply("");
      setError(null);
      setLoading(true);
      try {
        const res = await fetch("/api/career-twin/experience", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "start", careerId, length: chosen }),
        });
        const data = await res.json();
        if (data.scenario) setCurrent(data.scenario);
        else setError(messageFor(data));
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [careerId],
  );

  const submitReply = useCallback(async () => {
    if (!current || !reply.trim() || loading) return;
    const answered = current;
    const myReply = reply.trim();
    setLoading(true);
    setError(null);
    setSupportMessage(null);
    try {
      const data = await post({ action: "respond", currentIndex: answered.index, userReply: myReply });
      // Distress guard tripped server-side: show support, keep the scene.
      if (data.support) {
        setSupportMessage(data.support);
        return;
      }
      if (!data.consequence) {
        setError(messageFor(data));
        return;
      }
      setTurns((prev) => [
        ...prev,
        { scenario: answered, userReply: myReply, consequence: data.consequence, reflection: data.reflection },
      ]);
      setReply("");
      // Drive terminal state off the server's `complete` flag — NOT off the
      // presence of fitInsights (which is optional and the model can omit).
      // Without this, a "complete but no insights" reply left the screen
      // frozen blank with no way forward but losing the run.
      if (data.complete) {
        setCurrent(null);
        setFitInsights(data.fitInsights ?? FALLBACK_FIT);
      } else if (data.next) {
        setCurrent(data.next);
      } else {
        // Model dropped the next scene mid-run — recover gracefully instead
        // of dead-ending on a blank screen.
        setCurrent(null);
        setError("Your future self lost the thread for a moment. Your reflections above are saved here — start another experience whenever you're ready.");
      }
      requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }));
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [current, reply, loading, post]);

  const reset = () => {
    setLength(null);
    setTurns([]);
    setCurrent(null);
    setFitInsights(null);
    setReply("");
    setError(null);
    setSupportMessage(null);
  };

  // ── Length picker ──
  if (!length) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Step into a {careerTitle.toLowerCase()}&apos;s shoes for a while. Your future self will walk
          you through real moments from the job — you decide how you&apos;d handle them. Nothing is
          right or wrong; it&apos;s about how it feels.
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {EXPERIENCE_LENGTHS.map((l) => {
            const Icon = LENGTH_ICON[l.id];
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => start(l.id)}
                className="flex flex-col gap-1.5 rounded-control border border-border bg-card/50 p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/[0.04]"
              >
                <Icon className="h-5 w-5 text-primary" />
                <span className="font-semibold text-sm">{l.label}</span>
                <span className="text-xs text-muted-foreground">{l.description}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress + reset */}
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground/80">
          {EXPERIENCE_LENGTHS.find((l) => l.id === length)?.label}
          {current && ` · scene ${current.index + 1} of ${current.total}`}
          {!current && fitInsights && " · complete"}
        </span>
        <Button variant="ghost" size="sm" onClick={reset} className="text-muted-foreground hover:text-foreground gap-1.5">
          <RotateCcw className="h-3.5 w-3.5" />
          Start over
        </Button>
      </div>

      {/* Completed turns */}
      {turns.map((t, i) => (
        <div key={i} className="space-y-2.5">
          <SceneCard scenario={t.scenario} />
          <div className="ml-3 rounded-2xl bg-primary/10 border border-primary/15 px-3.5 py-2.5 text-sm">
            {t.userReply}
          </div>
          <Card className="p-3.5 space-y-3">
            <p className="text-sm leading-relaxed">{t.consequence}</p>
            <ReflectionCard reflection={t.reflection} />
          </Card>
        </div>
      ))}

      {/* Supportive interjection when a reply tripped the distress guard. */}
      {supportMessage && (
        <div className="rounded-control border border-teal-300/50 bg-teal-50 dark:bg-teal-950/30 px-4 py-3 text-sm text-teal-900 dark:text-teal-200 flex items-start gap-2.5">
          <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0 text-teal-600 dark:text-teal-400" />
          <p className="leading-relaxed">{supportMessage}</p>
        </div>
      )}

      {/* Current unanswered scene + input */}
      {current && (
        <div className="space-y-3">
          <SceneCard scenario={current} active />
          <Textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="What would you do first? Answer as you naturally would…"
            rows={3}
            maxLength={1500}
            className="resize-none"
            disabled={loading}
          />
          <div className="flex justify-end">
            <Button onClick={submitReply} disabled={!reply.trim() || loading} className="gap-1.5">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Respond
            </Button>
          </div>
        </div>
      )}

      {/* Loading the first scene */}
      {!current && !fitInsights && loading && (
        <div className="flex h-24 items-center justify-center text-muted-foreground/70">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}

      {/* End-of-experience career fit insights */}
      {fitInsights && !current && <FitInsightsCard fit={fitInsights} onReset={reset} />}

      {error && (
        <div className="rounded-control border border-amber-300/50 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          {error}
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}

function SceneCard({ scenario, active }: { scenario: Scenario; active?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3.5",
        active ? "border-primary/30 bg-gradient-to-br from-primary/[0.06] to-teal-500/[0.04]" : "border-border bg-muted/20",
      )}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-teal-600">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Scene {scenario.index + 1}
        </span>
      </div>
      <p className="text-sm text-muted-foreground italic mb-1.5">{scenario.context}</p>
      <p className="text-sm leading-relaxed font-medium">{scenario.situation}</p>
    </div>
  );
}

function ReflectionCard({ reflection: r }: { reflection: Reflection }) {
  return (
    <div className="rounded-control border border-border/60 bg-muted/20 p-3 space-y-2.5 text-sm">
      <Block label="What this part of the job is really like">{r.whatItsReallyLike}</Block>
      {r.skillsUsed?.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Skills often used here</p>
          <div className="flex flex-wrap gap-1.5">
            {r.skillsUsed.map((s) => (
              <span key={s} className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs">{s}</span>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <Block label="Why some people enjoy this">{r.whyEnjoy}</Block>
        <Block label="Why some people dislike this">{r.whyDislike}</Block>
      </div>
    </div>
  );
}

function FitInsightsCard({ fit, onReset }: { fit: FitInsights; onReset: () => void }) {
  return (
    <Card className="p-4 space-y-3.5 border-2 border-primary/20">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-base">What this experience suggested</h3>
      </div>
      <Block label="What you seemed to enjoy">{fit.enjoyed}</Block>
      <Block label="What you seemed less interested in">{fit.lessInterested}</Block>
      {fit.skillsUsed?.length > 0 && (
        <ChipBlock label="Skills you naturally used" items={fit.skillsUsed} />
      )}
      {fit.skillsToDevelop?.length > 0 && (
        <ChipBlock label="Skills you might want to develop" items={fit.skillsToDevelop} />
      )}
      {fit.questionsToExplore?.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Questions worth exploring further</p>
          <ul className="list-disc list-inside space-y-1 text-sm text-foreground/90">
            {fit.questionsToExplore.map((q) => <li key={q}>{q}</li>)}
          </ul>
        </div>
      )}
      <div className="flex items-start gap-2 rounded-control bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
        <ShieldAlert className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        This is one possible version of the job, not a prediction or advice — a way to feel what it could be like.
      </div>
      <Button variant="outline" onClick={onReset} className="gap-1.5">
        <RotateCcw className="h-4 w-4" />
        Try another experience
      </Button>
    </Card>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm leading-relaxed text-foreground/90">{children}</p>
    </div>
  );
}

function ChipBlock({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((s) => (
          <span key={s} className="rounded-full bg-muted px-2 py-0.5 text-xs">{s}</span>
        ))}
      </div>
    </div>
  );
}
