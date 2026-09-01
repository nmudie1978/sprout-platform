"use client";

import { useState } from "react";
import { Mail, X } from "lucide-react";
import { ResendVerificationButton } from "@/components/auth/resend-verification-button";

/**
 * The soft gate: a calm, dismissible strip asking an unverified user to confirm
 * their address.
 *
 * Deliberately NOT a blocker. Endeavrly's whole premise is that a young person
 * can start exploring careers the moment they arrive — the same reasoning that
 * keeps the age/consent write-gate empty (CLAUDE.md <age_policy>). So this
 * nudges and never obstructs: no modal, no interstitial, no disabled features.
 *
 * Dismissal is per-browser and per-session-ish (localStorage), because this is
 * a convenience, not state anyone else needs to read. It reappears on the next
 * device or after the key is cleared, which is the right side to err on for
 * something the user genuinely should do.
 */
const DISMISS_KEY = "endeavrly:verify-banner-dismissed";

/** Read the dismissal flag once, at mount, without tripping over SSR. */
function initiallyVisible(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(DISMISS_KEY) !== "1";
  } catch {
    // Private mode / storage blocked — show it; the banner is harmless.
    return true;
  }
}

export function VerifyEmailBanner() {
  // Lazy initialiser rather than an effect: reading storage in an effect makes
  // the banner flash in and then out for users who already dismissed it, and
  // costs a second render on every load.
  const [visible, setVisible] = useState(initiallyVisible);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Nothing to do — it'll simply show again next time.
    }
  };

  return (
    <div className="border-b border-primary/15 bg-primary/5">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-2.5 sm:px-6">
        <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        <p className="min-w-0 flex-1 text-sm text-muted-foreground">
          <span className="text-foreground">Confirm your email</span> to secure your
          account and be able to reset your password.
        </p>
        <ResendVerificationButton
          variant="outline"
          className="h-8 px-3 text-xs"
          label="Send the link"
        />
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="rounded-md p-1.5 text-muted-foreground transition hover:bg-primary/10 hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
