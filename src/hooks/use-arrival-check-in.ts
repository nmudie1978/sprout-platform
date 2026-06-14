"use client";

/**
 * Arrival Check-in client state.
 *
 * Loads today's check-in once (server is the source of truth), and exposes
 * `submit` / `skip`. Skipping is session-local only (sessionStorage) — we
 * record NOTHING when a user skips, honouring the "optional, no nagging,
 * minimal data" guardrails.
 */
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { ArrivalMood } from "@/lib/arrival/types";

type Status = "loading" | "ready";

const SKIP_KEY = "endeavrly:arrival-skipped-session";

interface TodaysCheckIn {
  mood: ArrivalMood;
}

export interface UseArrivalCheckIn {
  /** Today's check-in, or null if not yet done. */
  today: TodaysCheckIn | null;
  /** i18n key for the acknowledgement to show after submitting. */
  acknowledgementKey: string | null;
  /** True once the user has skipped for this browser session. */
  skipped: boolean;
  status: Status;
  submit: (mood: ArrivalMood) => Promise<void>;
  skip: () => void;
}

function readSkipped(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(SKIP_KEY) === "1";
  } catch {
    return false;
  }
}

export function useArrivalCheckIn(): UseArrivalCheckIn {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [today, setToday] = useState<TodaysCheckIn | null>(null);
  const [acknowledgementKey, setAcknowledgementKey] = useState<string | null>(null);
  const [skipped, setSkipped] = useState(false);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    setSkipped(readSkipped());
  }, []);

  // Load today's check-in once per signed-in user.
  useEffect(() => {
    if (!userId) {
      setStatus("ready");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    fetch("/api/arrival-check-in")
      .then((r) => (r.ok ? r.json() : { today: null }))
      .then((data: { today: TodaysCheckIn | null }) => {
        if (cancelled) return;
        setToday(data.today ?? null);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("ready");
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const submit = useCallback(async (mood: ArrivalMood) => {
    // Optimistic: reflect the mood immediately so the UI feels instant.
    setToday({ mood });
    try {
      const res = await fetch("/api/arrival-check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood }),
      });
      if (res.ok) {
        const data = (await res.json()) as { acknowledgementKey?: string };
        setAcknowledgementKey(data.acknowledgementKey ?? null);
      }
    } catch {
      /* offline / transient — the optimistic value stands for this session */
    }
  }, []);

  const skip = useCallback(() => {
    setSkipped(true);
    try {
      window.sessionStorage.setItem(SKIP_KEY, "1");
    } catch {
      /* private tab — in-memory skip is enough */
    }
  }, []);

  return { today, acknowledgementKey, skipped, status, submit, skip };
}
