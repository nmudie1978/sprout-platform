import Link from "next/link";
import { cookies } from "next/headers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Inbox, FolderSearch } from "lucide-react";
import { ResendVerificationButton } from "@/components/auth/resend-verification-button";
import {
  maskEmail,
  PENDING_VERIFICATION_COOKIE,
} from "@/lib/auth/email-verification";
import { isVerificationRequired } from "@/lib/auth/verification-gate";
import { VerificationWatcher } from "@/components/auth/verification-watcher";

export const dynamic = "force-dynamic";

/**
 * Shown straight after signup: "we've emailed you, go and click the link".
 *
 * The address comes from the httpOnly cookie signup set, not from a query
 * parameter — so it never appears in the URL bar, browser history, a bookmark,
 * or a Referer header, and no script on the page can read it. It is then
 * MASKED for display (see maskEmail): enough to recognise your own inbox, not
 * enough to hand the whole address to whoever is looking over your shoulder.
 *
 * Echoing it back at all matters because a mistyped address is far and away
 * the most common reason a verification email "never arrives", and the user
 * cannot spot that mistake unless we show them what we sent to.
 *
 * The card is wrapped in VerificationWatcher, which polls for the link being
 * clicked — on this device or any other — and signs the user in as soon as it
 * is, so this screen stops being somewhere you have to notice you're finished
 * with. Everything below is the fallback it renders until then, and remains
 * the whole experience without JavaScript.
 */
export default async function CheckEmailPage() {
  const store = await cookies();
  const raw = (store.get(PENDING_VERIFICATION_COOKIE)?.value ?? "").trim().toLowerCase();
  // Defensive: only render something that still looks like an address.
  const email =
    /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(raw) && raw.length <= 254 ? raw : "";
  const gated = isVerificationRequired();

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-blue-500/5" />
      <div className="hidden sm:block absolute top-20 -left-4 w-72 h-72 bg-teal-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="hidden sm:block absolute top-20 -right-4 w-72 h-72 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />

      <VerificationWatcher mode="poll">
        <Card className="w-full max-w-md shadow-2xl border-2">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-center text-2xl">Check your email</CardTitle>
            <CardDescription className="text-center text-base">
              {email ? (
                <>
                  We&apos;ve sent a confirmation link to{" "}
                  <span className="font-medium text-foreground">{maskEmail(email)}</span>.
                </>
              ) : (
                <>We&apos;ve sent a confirmation link to the address you signed up with.</>
              )}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <Inbox className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">
                  Open the email and tap <span className="text-foreground">Confirm my email</span>.
                  The link works on your phone or your computer.
                </span>
              </li>
              <li className="flex gap-3">
                <FolderSearch className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">
                  Nothing there? Check your spam or junk folder — first emails from a
                  new sender often land there.
                </span>
              </li>
            </ul>

            <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
              <p className="text-sm text-muted-foreground">
                {gated
                  ? "You'll be able to sign in as soon as your email is confirmed. The link expires in 24 hours."
                  : "You can keep exploring Endeavrly while you wait. Confirming your email is what lets you reset your password later, so it's worth doing today. The link expires in 24 hours."}
              </p>
            </div>

            <ResendVerificationButton
              variant="outline"
              className="w-full"
              label="Send it again"
            />

            <div className="flex flex-col gap-2 text-center text-sm">
              {/* Under the hard gate there is nothing to continue TO — offering
                  "Continue to Endeavrly" would just bounce off the sign-in
                  redirect and read as broken. */}
              {!gated && (
                <Link href="/dashboard" className="text-primary hover:underline">
                  Continue to Endeavrly
                </Link>
              )}
              <Link href="/auth/signin" className="text-muted-foreground hover:underline">
                {gated ? "Back to sign in" : "Sign in instead"}
              </Link>
            </div>
          </CardContent>
        </Card>
      </VerificationWatcher>
    </div>
  );
}
