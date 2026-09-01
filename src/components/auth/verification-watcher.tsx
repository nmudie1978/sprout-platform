"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Watches for the confirmation link being clicked, then signs the user in.
 *
 * The screen it wraps ("Check your email", and the confirmation screen itself)
 * used to be a dead end: you confirm in another tab or on your phone, come
 * back, and nothing has changed — the card still tells you to check your email,
 * and the only way forward is to type the password you chose sixty seconds ago.
 * This polls /api/auth/verification-status, and the moment the confirmation
 * lands it exchanges the returned handoff token for a real session and moves
 * the user on.
 *
 * The polling is deliberately unhurried and self-limiting: it backs off after
 * the first couple of minutes, stops entirely once the signup grant would have
 * expired, and pauses while the tab is in the background — checking instead the
 * instant the tab is looked at again, which is exactly when someone returns
 * from clicking the link in another tab.
 *
 * It renders `children` (the normal card) until something happens, so with
 * JavaScript disabled, cookies cleared, or the link opened on a different
 * device, the page behaves exactly as it did before: manual sign-in, resend
 * button, no dead ends introduced.
 */

/** Gap between checks for the first BRISK_WINDOW_MS. */
const BRISK_INTERVAL_MS = 3_000;
/** How long to stay brisk — long enough to cover "click the link right now". */
const BRISK_WINDOW_MS = 2 * 60_000;
/** Gap after that. Someone who wanders off for ten minutes needs no urgency. */
const RELAXED_INTERVAL_MS = 10_000;
/** Give up here. The signup grant expires at 30 minutes; polling past it is noise. */
const MAX_WATCH_MS = 30 * 60_000;
/** The confirmation screen only needs a moment — the row is already written. */
const ONCE_WATCH_MS = 12_000;
/** Don't let focus/visibility events turn into a request storm. */
const MIN_CHECK_GAP_MS = 1_500;

type WatchState = "waiting" | "signing-in" | "manual";

export function VerificationWatcher({
  children,
  mode = "poll",
}: {
  children: ReactNode;
  /**
   * "poll" — the Check your email screen, waiting for a click that may happen
   * on another device. "once" — the confirmation screen, where the click has
   * just happened and we only need to know whether THIS browser is the one
   * that signed up.
   */
  mode?: "poll" | "once";
}) {
  const router = useRouter();
  const [state, setState] = useState<WatchState>("waiting");
  // Guards against React's double-invoked effects and against a second check
  // landing while the first is already signing in.
  const settled = useRef(false);
  const lastCheck = useRef(0);

  const completeSignIn = useCallback(
    async (token: string) => {
      settled.current = true;
      setState("signing-in");
      const result = await signIn("verification-handoff", {
        token,
        redirect: false,
      }).catch(() => null);

      if (!result || result.error) {
        // Confirmed but not signed in — an expired token, a throttle, a
        // network blip. Never leave them on "check your email": the address IS
        // confirmed, so the honest next step is the sign-in screen.
        setState("manual");
        return;
      }

      // Housekeeping only; the grant expires on its own regardless.
      await fetch("/api/auth/verification-status", { method: "DELETE" }).catch(() => {});
      router.replace("/dashboard");
      router.refresh();
    },
    [router],
  );

  useEffect(() => {
    const startedAt = Date.now();
    const deadline = startedAt + (mode === "once" ? ONCE_WATCH_MS : MAX_WATCH_MS);
    let timer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const schedule = () => {
      if (cancelled || settled.current) return;
      const elapsed = Date.now() - startedAt;
      const gap =
        mode === "once" || elapsed < BRISK_WINDOW_MS ? BRISK_INTERVAL_MS : RELAXED_INTERVAL_MS;
      if (Date.now() + gap > deadline) return;
      timer = setTimeout(check, gap);
    };

    const check = async () => {
      if (cancelled || settled.current) return;
      if (Date.now() > deadline) return;
      // A background tab has nobody watching it. Skip the request; the
      // visibility listener below fires one the moment it's looked at again.
      if (typeof document !== "undefined" && document.hidden) {
        schedule();
        return;
      }
      lastCheck.current = Date.now();
      try {
        const res = await fetch("/api/auth/verification-status", {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled || settled.current) return;
        if (data?.verified && typeof data.handoff === "string") {
          await completeSignIn(data.handoff);
          return;
        }
      } catch {
        // Offline or a blip — nothing to say, just try again on schedule.
      }
      schedule();
    };

    // The first check is immediate on the confirmation screen (the answer is
    // already known) and after a beat on the waiting screen, so a freshly
    // rendered page doesn't fire a request before it has finished painting.
    timer = setTimeout(check, mode === "once" ? 0 : 1_200);

    const onWake = () => {
      if (cancelled || settled.current) return;
      if (typeof document !== "undefined" && document.hidden) return;
      if (Date.now() - lastCheck.current < MIN_CHECK_GAP_MS) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(check, 0);
    };

    document.addEventListener("visibilitychange", onWake);
    window.addEventListener("focus", onWake);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onWake);
      window.removeEventListener("focus", onWake);
    };
  }, [mode, completeSignIn]);

  if (state === "waiting") return <>{children}</>;

  return (
    <Card className="w-full max-w-md shadow-2xl border-2">
      <CardHeader>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        </div>
        <CardTitle className="text-center text-2xl">Email confirmed</CardTitle>
        <CardDescription className="text-center text-base">
          {state === "signing-in"
            ? "Thanks — signing you in now."
            : "Thanks — your address is verified."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {state === "signing-in" ? (
          <div
            className="flex items-center justify-center gap-3 py-4 text-sm text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Taking you to Endeavrly…
          </div>
        ) : (
          <>
            <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
              <p className="text-sm text-muted-foreground">
                Your account is ready. Sign in and you can pick up your journey wherever
                you left off.
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/auth/signin">Sign in to Endeavrly</Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
