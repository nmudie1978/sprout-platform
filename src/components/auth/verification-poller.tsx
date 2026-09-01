"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

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
 */
export function VerificationPoller({ next = "/dashboard" }: { next?: string }) {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);
  const startedAt = useRef(Date.now());
  const stopped = useRef(false);

  useEffect(() => {
    const MAX_MS = 15 * 60 * 1000;
    let timer: ReturnType<typeof setTimeout>;

    const delay = () => (Date.now() - startedAt.current < 60_000 ? 3_000 : 10_000);

    const tick = async () => {
      if (stopped.current) return;
      if (Date.now() - startedAt.current > MAX_MS) return;

      if (document.visibilityState !== "visible") {
        timer = setTimeout(tick, delay());
        return;
      }

      try {
        const res = await fetch("/api/auth/verification-status", {
          cache: "no-store",
        });
        if (res.ok) {
          const data = (await res.json()) as { verified?: boolean };
          if (data.verified) {
            stopped.current = true;
            setConfirmed(true);
            // Give the confirmation a beat to register, then hard-navigate so
            // the server sees whatever session cookie now exists.
            setTimeout(() => {
              window.location.href = next;
            }, 900);
            return;
          }
        }
      } catch {
        // Offline or a transient failure — just try again on the next tick.
      }
      timer = setTimeout(tick, delay());
    };

    timer = setTimeout(tick, 3_000);
    return () => {
      stopped.current = true;
      clearTimeout(timer);
    };
  }, [next, router]);

  if (!confirmed) return null;

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
