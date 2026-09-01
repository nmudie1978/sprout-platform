"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { VERIFICATION_CHANNEL } from "@/lib/auth/verification-channel";

/**
 * Watches for "the address has been confirmed" while the person sits on the
 * check-email page, then moves them on.
 *
 * Why polling and not something cleverer: the confirmation happens in a
 * DIFFERENT context — another tab, or more often the phone the email was
 * opened on. There is no shared channel with that context, so this tab has to
 * ask. A websocket for a once-per-signup event that resolves in under a
 * minute would cost far more than it saves.
 *
 * Behaviour:
 *  • polls every 3s, backing off to 10s after a minute, and stops after 15
 *    minutes so a tab left open overnight isn't calling the API forever
 *  • pauses entirely while the tab is hidden (Page Visibility) — a
 *    backgrounded tab shouldn't generate traffic
 *  • on confirmation, does a full navigation rather than a client-side push,
 *    so the new session cookie is picked up by the server render
 *  • reacts instantly, without waiting for a tick, when another tab of this
 *    browser announces the confirmation (BroadcastChannel), and whenever this
 *    tab regains focus — the moment a person expects something to happen
 *
 * The endpoint mints a session when it sees the confirmation, which is what
 * makes this work across devices: verifying on a phone leaves this browser
 * with no session cookie, so navigating without one would just bounce off the
 * dashboard's auth redirect back to sign-in. `signedIn: false` means the
 * account cannot hold a session (suspended), so we route to sign-in, which
 * explains why.
 */
export function VerificationPoller({ next = "/dashboard" }: { next?: string }) {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);
  // Set inside the effect, not during render: reading the clock while
  // rendering is impure and re-runs on every render.
  const startedAt = useRef<number | null>(null);
  const stopped = useRef(false);

  /**
   * One check. Shared by the timer, the focus handler and the cross-tab
   * broadcast, so all three routes behave identically.
   */
  const check = useCallback(async () => {
    if (stopped.current) return;
    try {
      const res = await fetch("/api/auth/verification-status", { cache: "no-store" });
      // A 429 means back off, not "not verified" — just wait for the next tick.
      if (!res.ok) return;
      const data = (await res.json()) as { verified?: boolean; signedIn?: boolean };
      if (!data.verified) return;

      stopped.current = true;
      setConfirmed(true);
      // Give the confirmation a beat to register, then hard-navigate so the
      // server sees the session cookie the endpoint just set.
      setTimeout(() => {
        window.location.href = data.signedIn === false ? "/auth/signin" : next;
      }, 900);
    } catch {
      // Offline or a transient failure — just try again on the next tick.
    }
  }, [next]);

  // The polling loop.
  useEffect(() => {
    const MAX_MS = 15 * 60 * 1000;
    startedAt.current ??= Date.now();
    let timer: ReturnType<typeof setTimeout>;
    const delay = () =>
      Date.now() - (startedAt.current ?? 0) < 60_000 ? 3_000 : 10_000;

    const tick = async () => {
      if (stopped.current) return;
      if (Date.now() - (startedAt.current ?? 0) > MAX_MS) return;
      // A backgrounded tab shouldn't generate traffic; the focus handler
      // below catches up the instant the person returns to it.
      if (document.visibilityState === "visible") await check();
      timer = setTimeout(tick, delay());
    };

    timer = setTimeout(tick, 3_000);
    return () => {
      clearTimeout(timer);
    };
  }, [check]);

  // Instant paths: another tab of this browser confirming, or this tab
  // regaining focus after the person confirmed on their phone.
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(VERIFICATION_CHANNEL);
      // The message carries no payload — we re-ask the server rather than
      // trusting a claim from another tab.
      channel.onmessage = () => void check();
    } catch {
      // Safari private mode / older browsers: polling still covers it.
    }

    const onVisible = () => {
      if (document.visibilityState === "visible") void check();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    return () => {
      channel?.close();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [check]);

  // Marks the component as finished for good once unmounted, so a late
  // in-flight request can't navigate a page the user has already left.
  useEffect(() => () => {
    stopped.current = true;
  }, []);

  if (!confirmed) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground"
      >
        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
        Waiting for you to confirm — this page will continue on its own.
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-teal-500/30 bg-teal-500/10 px-4 py-3 text-sm text-teal-700 dark:text-teal-300"
    >
      <CheckCircle2 className="h-4 w-4 shrink-0" />
      Confirmed — taking you in…
    </div>
  );
}
