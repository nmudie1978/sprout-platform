import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, ShieldAlert, BadgeCheck } from "lucide-react";
import { ResendVerificationButton } from "@/components/auth/resend-verification-button";
import {
  parseVerificationOutcome,
  type VerificationOutcome,
} from "@/lib/auth/email-verification";
import { safeRelativePath } from "@/lib/auth/app-url";
import { isVerificationRequired } from "@/lib/auth/verification-gate";

export const dynamic = "force-dynamic";

/**
 * Where /api/auth/verify-email lands the user after consuming their token.
 *
 * This page never sees the token — only a coarse ?status=, which is narrowed
 * through parseVerificationOutcome so an arbitrary value renders the safe
 * "invalid" state rather than falling through to a blank screen. Nothing here
 * explains WHY a link failed beyond expired-vs-not: the difference between
 * "no such token" and "token belongs to someone else" is exactly the kind of
 * detail an attacker probes for, and a user can't act on it either way.
 */
const STATES: Record<
  VerificationOutcome,
  {
    icon: typeof CheckCircle2;
    tone: string;
    title: string;
    description: string;
    body: string;
    showResend: boolean;
  }
> = {
  success: {
    icon: CheckCircle2,
    tone: "text-emerald-500",
    title: "Email confirmed",
    description: "Thanks — your address is verified.",
    body: "Your account is fully set up. You can pick up your journey wherever you left off.",
    showResend: false,
  },
  already: {
    icon: BadgeCheck,
    tone: "text-primary",
    title: "Already confirmed",
    description: "This address was verified previously.",
    body: "Nothing more to do here — some email apps open links automatically, so this can happen even on your first click. Carry on.",
    showResend: false,
  },
  expired: {
    icon: Clock,
    tone: "text-amber-500",
    title: "That link has expired",
    description: "Confirmation links last 24 hours, and each one can be used once.",
    body: "Ask for a fresh link below and it'll arrive in a moment. If you're signed in on this device we'll send it to your account's address automatically.",
    showResend: true,
  },
  invalid: {
    icon: ShieldAlert,
    tone: "text-muted-foreground",
    title: "We couldn't confirm that link",
    description: "The link may be incomplete, or it may have been replaced by a newer one.",
    body: "Email apps sometimes split long links across lines. Request a new one below, then open it directly from the email.",
    showResend: true,
  },
};

export default async function VerifyEmailResultPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; next?: string }>;
}) {
  const params = await searchParams;
  const status = parseVerificationOutcome(params.status);
  // Open-redirect guard: only a same-origin relative path is honoured.
  const next = safeRelativePath(params.next, "/dashboard");
  // Under the hard gate the user reaches this page from an email link, in a
  // browser with no session — so "continue" has to mean "now go and sign in",
  // not "go to the dashboard", which would only bounce them to sign-in anyway.
  const gated = isVerificationRequired();
  const state = STATES[status];
  const Icon = state.icon;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-blue-500/5" />
      <div className="hidden sm:block absolute top-20 -left-4 w-72 h-72 bg-teal-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="hidden sm:block absolute top-20 -right-4 w-72 h-72 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />

      <Card className="w-full max-w-md shadow-2xl border-2">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20">
            <Icon className={`h-8 w-8 ${state.tone}`} />
          </div>
          <CardTitle className="text-center text-2xl">{state.title}</CardTitle>
          <CardDescription className="text-center text-base">
            {state.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
            <p className="text-sm text-muted-foreground">{state.body}</p>
          </div>

          {state.showResend && (
            <ResendVerificationButton
              variant="default"
              className="w-full"
              label="Send me a new link"
            />
          )}

          <Button asChild variant={state.showResend ? "outline" : "default"} className="w-full">
            <Link
              href={
                gated ? "/auth/signin" : status === "success" ? next : "/dashboard"
              }
            >
              {gated
                ? status === "success" || status === "already"
                  ? "Sign in to Endeavrly"
                  : "Back to sign in"
                : status === "success" || status === "already"
                  ? "Continue to Endeavrly"
                  : "Back to Endeavrly"}
            </Link>
          </Button>

          {state.showResend && !gated && (
            <p className="text-center text-sm text-muted-foreground">
              Not signed in?{" "}
              <Link href="/auth/signin" className="text-primary hover:underline">
                Sign in
              </Link>{" "}
              and we&apos;ll offer the link again from your dashboard.
            </p>
          )}
          {state.showResend && gated && (
            <p className="text-center text-sm text-muted-foreground">
              Still stuck? Try signing in — we&apos;ll offer you a fresh link there.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
