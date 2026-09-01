"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Navigation2, Loader2, MailWarning } from "lucide-react";
import {
  isUnverifiedError,
  UNVERIFIED_SIGNIN_MESSAGE,
} from "@/lib/auth/verification-gate";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // Set when the hard gate refuses an otherwise-correct sign-in. Holds the
  // credentials so the user can ask for a fresh link without retyping them —
  // the resend endpoint re-verifies the password before sending anything.
  const [unverified, setUnverified] = useState<{ email: string; password: string } | null>(null);
  const [resending, setResending] = useState(false);

  // If already authenticated, redirect immediately.
  //
  // This MUST be a hard navigation, not router.push. A soft client nav serves
  // the logged-out Router Cache entry for /dashboard, which still resolves to
  // the layout's redirect("/auth/signin") — and since this page then sees the
  // authenticated session again, it re-pushes, producing an endless
  // signin→dashboard→signin flicker that only a manual refresh breaks. It bites
  // hardest right after signup: the brand-new cookie can miss the first
  // server-side /dashboard read, bouncing the user here, where a soft redirect
  // would trap them in the loop. A hard navigation re-renders the server with
  // the fresh cookie and settles in one hop. Mirrors the signup page.
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role && !loading) {
      window.location.assign("/dashboard");
    }
  }, [session, status, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnverified(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        // The verification gate is its own case: the credentials were CORRECT,
        // so "invalid email or password" would be a lie that sends the user
        // round in circles. Show the real reason and the way out of it.
        if (isUnverifiedError(result.error)) {
          setUnverified({ email: email.trim().toLowerCase(), password });
          setLoading(false);
          return;
        }

        // Wrong credentials stay deliberately vague — naming which half was
        // wrong would confirm whether an address has an account here.
        // Throttling and suspension are different: the password may well be
        // right, so telling the user "invalid email or password" would send
        // them round in circles. Those two messages are passed through.
        const explained =
          result.error.includes("suspended") || result.error.includes("Too many");
        throw new Error(explained ? result.error : "Invalid email or password");
      }

      if (result?.ok) {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });

        // signIn() has already set the session cookie by the time it
        // resolves ok, so navigate straight to the dashboard. A hard
        // navigation guarantees the server renders with the fresh cookie
        // — no need to refetch the session client-side first. Keep
        // `loading` true so the form stays disabled through the redirect.
        window.location.assign("/dashboard");
        return;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-blue-500/5" />
      {/* Blobs hidden on mobile for performance */}
      <div className="hidden sm:block absolute top-20 -left-4 w-72 h-72 bg-teal-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="hidden sm:block absolute top-20 -right-4 w-72 h-72 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />

      <Card className="w-full max-w-md shadow-2xl border-2 sm:hover-lift">
        <CardHeader className="space-y-2">
          <div className="flex justify-center mb-2">
            <Navigation2 className="h-10 w-10 text-emerald-500 fill-emerald-500" strokeWidth={1.5} />
          </div>
          <CardTitle className="text-2xl text-center">Welcome back to Endeavrly</CardTitle>
          <CardDescription className="text-base text-center">
            Sign in to continue your growth journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* VIPPS Sign In Button - Only shown when VIPPS is enabled */}
          {process.env.NEXT_PUBLIC_VIPPS_ENABLED === "true" && (
            <div className="space-y-4 mb-4">
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 sm:h-10 border-2 border-[#ff5b24] text-[#ff5b24] hover:bg-[#ff5b24] hover:text-white font-semibold"
                onClick={() => signIn("vipps", { callbackUrl: "/dashboard" })}
                disabled={loading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z"/>
                </svg>
                Sign in with Vipps
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* HARD GATE recovery. Shown only after a sign-in where the password
              was right but the address is unconfirmed — so this panel is never
              visible to someone guessing, and revealing the account's state
              here tells them nothing they didn't already prove they knew. */}
          {unverified && (
            <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <div className="flex gap-3">
                <MailWarning className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" aria-hidden />
                <div className="min-w-0 space-y-3">
                  <p className="text-sm text-foreground">{UNVERIFIED_SIGNIN_MESSAGE}</p>
                  <p className="text-xs text-muted-foreground">
                    Remember to check your spam or junk folder — the first email from a
                    new sender often lands there.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={resending}
                    onClick={async () => {
                      setResending(true);
                      try {
                        const res = await fetch("/api/auth/resend-verification", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(unverified),
                        });
                        const data = await res.json().catch(() => ({}));
                        toast({
                          title: data.ok ? "On its way" : "Just a moment",
                          description:
                            data.message ??
                            "If that address still needs confirming, we've sent a new link.",
                        });
                      } catch {
                        toast({
                          title: "Couldn't send just now",
                          description: "Check your connection and try again.",
                          variant: "destructive",
                        });
                      } finally {
                        setResending(false);
                      }
                    }}
                  >
                    {resending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send me a new confirmation link"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 sm:h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 sm:h-10"
              />
              <div className="text-right">
                <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 sm:h-10" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>

          <p className="mt-6 text-center text-[11px] text-muted-foreground/70">
            Vipps and BankID login coming in production
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
