"use client";

import { useEffect } from "react";
import { VERIFICATION_CHANNEL } from "@/lib/auth/verification-channel";

/**
 * Tells any other tab of this browser that the email has just been confirmed.
 *
 * Rendered on the verification result page after a successful confirmation.
 * The common case it fixes: the person signed up in one tab, the mail client
 * opened the link in a second tab, and the first tab is still showing "check
 * your email". This makes that first tab react immediately instead of waiting
 * out its polling interval.
 *
 * Purely an accelerator — AwaitingVerification polls regardless, so nothing
 * breaks where BroadcastChannel is unavailable (Safari private mode, older
 * browsers). It carries no payload: the listener re-checks with the server
 * rather than trusting a message from another tab.
 */
export function AnnounceVerified() {
  useEffect(() => {
    try {
      const channel = new BroadcastChannel(VERIFICATION_CHANNEL);
      channel.postMessage("verified");
      channel.close();
    } catch {
      // Unsupported or blocked — polling covers it.
    }
  }, []);

  return null;
}
