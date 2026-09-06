import { Loader2 } from "lucide-react";

/**
 * The visible "we are still watching for your confirmation" line on the
 * check-email page.
 *
 * Reconstructed 2026-09-06. The file was referenced by
 * `app/auth/check-email/page.tsx` but never committed, which left the branch
 * unable to typecheck or build. Its intent is stated verbatim in the commit
 * that introduced the reference (1cf068bf):
 *
 *   "A visible 'waiting… this page will continue on its own' line. Silence
 *    reads as a broken page."
 *
 * That is the whole job. The actual watching is done by `VerificationPoller`,
 * which polls, listens on the BroadcastChannel and navigates on success. This
 * component deliberately holds NO state and does no work: two things polling
 * for the same event would double the traffic and could disagree about what
 * is happening.
 *
 * Kept a server component on purpose — the animation is CSS, so this ships no
 * JavaScript. The poller beside it is the only client code the page needs.
 */
export function AwaitingVerification() {
  return (
    <p
      // aria-live so a screen-reader user is told the page is working rather
      // than being left in the silence the commit was written to fix.
      aria-live="polite"
      className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
    >
      <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
      Waiting for you to confirm — this page will continue on its own.
    </p>
  );
}
