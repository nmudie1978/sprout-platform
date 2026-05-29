"use client";

/**
 * JoinClassCard.
 *
 * Youth-facing "join a class" surface. Shows the student's current
 * cohort memberships (if any) and offers an input for a join code.
 * Leaving a class is one click — students can always opt out.
 * Dismissible — persisted in localStorage so it stays hidden until
 * the user wants it back (e.g. from profile settings).
 */

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { GraduationCap, Loader2, Plus, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

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

const DISMISS_KEY = "join-class-dismissed";

export function JoinClassCard() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");
    } catch { /* private tab */ }
    setHydrated(true);
  }, []);

  async function loadMemberships() {
    try {
      const res = await fetch("/api/cohorts/join", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const m = data.memberships ?? [];
      setMemberships(m);
      // Auto-expand if the student already has memberships
      if (m.length > 0) setCollapsed(false);
    } catch {
      /* network */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMemberships();
  }, []);

  function dismiss() {
    setDismissed(true);
    try { window.localStorage.setItem(DISMISS_KEY, "1"); } catch { /* ignore */ }
  }

  function restore() {
    setDismissed(false);
    try { window.localStorage.removeItem(DISMISS_KEY); } catch { /* ignore */ }
  }

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

  if (!hydrated) return null;

  // Dismissed — show a small restore link
  if (dismissed) {
    return (
      <button
        type="button"
        onClick={restore}
        className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
      >
        Have a class code? Show join form
      </button>
    );
  }

  return (
    <section className="rounded-xl border border-border/50 bg-card overflow-hidden">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setCollapsed(!collapsed)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCollapsed(!collapsed); } }}
        className="flex items-center justify-between w-full px-5 py-3.5 text-left hover:bg-muted/20 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Your classes</h2>
          {memberships.length > 0 && (
            <span className="text-[9px] text-muted-foreground/50 bg-muted/30 px-1.5 py-0.5 rounded-full">{memberships.length}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); dismiss(); }}
            className="p-1 rounded hover:bg-muted text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
            title="Hide this section"
            aria-label="Dismiss class join"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <ChevronDown className={cn(
            "h-4 w-4 text-muted-foreground/55 transition-transform duration-200",
            collapsed && "-rotate-90",
          )} />
        </div>
      </div>

      {!collapsed && (
        <div className="px-5 pb-4 space-y-3">
          {loading ? (
            <p className="text-xs text-muted-foreground">Loading…</p>
          ) : memberships.length > 0 ? (
            <ul className="space-y-2">
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
            <p className="text-xs text-muted-foreground leading-relaxed">
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
        </div>
      )}
    </section>
  );
}
