"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RESEND_COOLDOWN_MS } from "@/lib/auth/email-verification";

/**
 * "Send it again" control, shared by the check-your-email screen and the
 * dashboard banner.
 *
 * It deliberately sends NO address. The server resolves who to mail from the
 * session, or from the httpOnly cookie signup set on this browser — so this
 * button cannot be repointed at someone else's inbox by editing the page.
 *
 * The countdown here is a courtesy, not a control: it stops a user hammering a
 * button that won't do anything. The real cooldown is enforced server-side in
 * /api/auth/resend-verification, which is also where the response's
 * `retryAfterSeconds` comes from — so if the server says wait longer than the
 * local guess (another device already asked, say), the server wins.
 */
export function ResendVerificationButton({
  variant = "default",
  className,
  label = "Resend verification email",
}: {
  variant?: "default" | "outline" | "ghost" | "secondary";
  className?: string;
  label?: string;
}) {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (cooldown <= 0) {
      if (timer.current) clearInterval(timer.current);
      return;
    }
    timer.current = setInterval(() => setCooldown((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [cooldown]);

  const resend = useCallback(async () => {
    setSending(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = await res.json().catch(() => ({}));

      // Trust the server's wait time when it gives one; otherwise fall back to
      // the shared constant so the button still settles.
      const wait =
        typeof data.retryAfterSeconds === "number"
          ? data.retryAfterSeconds
          : Math.ceil(RESEND_COOLDOWN_MS / 1000);
      setCooldown(wait);

      toast({
        title: data.ok ? "On its way" : "Just a moment",
        description:
          data.message ??
          "If that address still needs confirming, we've sent a new link.",
        variant: data.ok === false && res.status === 429 ? "destructive" : "default",
      });
    } catch {
      // Network-level failure only — the route itself never throws to the client.
      toast({
        title: "Couldn't send just now",
        description: "Check your connection and try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  }, [toast]);

  const disabled = sending || cooldown > 0;

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      disabled={disabled}
      onClick={resend}
    >
      {sending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sending…
        </>
      ) : cooldown > 0 ? (
        `You can resend in ${cooldown}s`
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
}
