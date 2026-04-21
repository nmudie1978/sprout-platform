"use client";

/**
 * JoinClassCard.
 *
 * Youth-facing "join a class" surface. Shows the student's current
 * cohort memberships (if any) and offers an input for a join code.
 * Leaving a class is one click — students can always opt out.
 *
 * Lightweight: fetches /api/cohorts/join on mount for memberships;
 * POST to join, DELETE to leave. Toast feedback, no router refresh
 * required (this card owns its state).
 */

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { GraduationCap, Loader2, Plus, X } from "lucide-react";

interface CohortSummary {
  id: string;
  name: string;
  code: string;
  careerFocus: string | null;
}

interface Membership {
  joinedAt: string;
  cohort: CohortSummary;
}

export function JoinClassCard() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);

  async function loadMemberships() {
    try {
      const res = await fetch("/api/cohorts/join", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setMemberships(data.memberships ?? []);
    } catch {
      /* network */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMemberships();
  }, []);

  async function join(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    setJoining(true);
    try {
      const res = await fetch("/api/cohorts/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Could not join class");
        return;
      }
      toast.success(`Joined ${data.cohort?.name ?? "class"}`);
      setCode("");
      await loadMemberships();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setJoining(false);
    }
  }

  async function leave(cohortId: string, name: string) {
    if (!confirm(`Leave ${name}?`)) return;
    try {
      const res = await fetch("/api/cohorts/join", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cohortId }),
      });
      if (!res.ok) {
        toast.error("Could not leave class");
        return;
      }
      toast.success(`Left ${name}`);
      await loadMemberships();
    } catch {
      toast.error("Network error. Please try again.");
    }
  }

  return (
    <section className="rounded-xl border border-border/50 bg-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <GraduationCap className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">Your classes</h2>
      </div>

      {loading ? (
        <p className="text-xs text-muted-foreground">Loading…</p>
      ) : memberships.length > 0 ? (
        <ul className="space-y-2 mb-4">
          {memberships.map((m) => (
            <li
              key={m.cohort.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-background/40 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{m.cohort.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  <code className="font-mono">{m.cohort.code}</code>
                  {m.cohort.careerFocus && ` · ${m.cohort.careerFocus}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => leave(m.cohort.id, m.cohort.name)}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                title="Leave class"
                aria-label={`Leave ${m.cohort.name}`}
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          Your teacher or careers counsellor can give you a code to join a
          class. Joining is optional — nothing private is ever shared with
          your teacher.
        </p>
      )}

      <form onSubmit={join} className="flex items-center gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""))}
          placeholder="Class code"
          className="flex-1 h-10 rounded-md border border-border/50 bg-background px-3 text-sm font-mono tracking-[0.18em] focus:outline-none focus:ring-1 focus:ring-primary/50"
          maxLength={8}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={joining || code.trim().length < 6}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          {joining ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Join
        </button>
      </form>
    </section>
  );
}
