"use client";

/**
 * Clarity Shift client state for a single career.
 *
 * Server is the source of truth (so a shift follows the user across devices),
 * with an optimistic in-memory layer so the reflection updates the instant the
 * user rates. Mirrors the privacy-first, fire-and-forget persistence used by
 * Interest Level.
 */
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { ClarityPhase, ClarityScore } from "@/lib/clarity-shift/types";

type Status = "loading" | "ready";

export interface ClarityShiftState {
  beforeScore: ClarityScore | null;
  afterScore: ClarityScore | null;
}

export interface UseClarityShift extends ClarityShiftState {
  status: Status;
  /** True iff a careerId is provided and the user is signed in. */
  enabled: boolean;
  setBefore: (score: ClarityScore) => void;
  setAfter: (score: ClarityScore) => void;
}

function toScore(n: unknown): ClarityScore | null {
  return n === 1 || n === 2 || n === 3 || n === 4 || n === 5 ? (n as ClarityScore) : null;
}

export function useClarityShift(careerId: string | null | undefined): UseClarityShift {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const enabled = Boolean(userId && careerId);

  const [beforeScore, setBeforeScore] = useState<ClarityScore | null>(null);
  const [afterScore, setAfterScore] = useState<ClarityScore | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  // Load this career's shift once.
  useEffect(() => {
    if (!enabled || !careerId) {
      setStatus("ready");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    fetch(`/api/clarity-shift?careerSlug=${encodeURIComponent(careerId)}`)
      .then((r) => (r.ok ? r.json() : { shift: null }))
      .then((data: { shift: ClarityShiftState | null }) => {
        if (cancelled) return;
        setBeforeScore(toScore(data.shift?.beforeScore));
        setAfterScore(toScore(data.shift?.afterScore));
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("ready");
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, careerId]);

  const persist = useCallback(
    (phase: ClarityPhase, score: ClarityScore) => {
      if (!enabled || !careerId) return;
      void fetch("/api/clarity-shift", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ careerSlug: careerId, phase, score }),
        keepalive: true,
      }).catch(() => {
        /* offline / transient — the optimistic value stands */
      });
    },
    [enabled, careerId],
  );

  const setBefore = useCallback(
    (score: ClarityScore) => {
      setBeforeScore(score);
      persist("before", score);
    },
    [persist],
  );

  const setAfter = useCallback(
    (score: ClarityScore) => {
      setAfterScore(score);
      persist("after", score);
    },
    [persist],
  );

  return { beforeScore, afterScore, status, enabled, setBefore, setAfter };
}
