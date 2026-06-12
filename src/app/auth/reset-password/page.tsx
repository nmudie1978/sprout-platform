"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Star, Loader2, CheckCircle2 } from "lucide-react";

function ResetPasswordInner() {
  const router = useRouter();
  const { toast } = useToast();
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  // Whether we confirmed the new password actually works by signing in with it
  // (end-to-end verification, not just trusting the reset endpoint's 200).
  const [verified, setVerified] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ title: "Password too short", description: "Use at least 8 characters.", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Passwords don't match", description: "Please re-enter them.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Couldn't reset password", description: data.error ?? "Please try again.", variant: "destructive" });
        return;
      }

      // Verify the change end-to-end: sign in with the brand-new password
      // against the SAME backend that just claimed to have set it. This turns
      // "the endpoint returned 200" into "the new credentials actually work" —
      // and lands the user straight in their dashboard on success.
      if (data.email) {
        const signInResult = await signIn("credentials", {
          email: data.email,
          password,
          redirect: false,
        });
        if (signInResult?.ok && !signInResult.error) {
          setVerified(true);
          setDone(true);
          setTimeout(() => router.push("/dashboard"), 1500);
          return;
        }
        // Reset succeeded server-side but the auto sign-in didn't go through
        // (e.g. transient/rate-limit). The password IS changed — send them to
        // sign in manually rather than claiming failure.
        toast({
          title: "Password updated",
          description: "Please sign in with your new password.",
        });
      }
      setDone(true);
      setTimeout(() => router.push("/auth/signin"), 2500);
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Star className="h-5 w-5" />
          </div>
          <CardTitle>Choose a new password</CardTitle>
          <CardDescription>
            {done ? "Password updated." : "Enter a new password for your account."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {done ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                {verified
                  ? "Your new password is confirmed and you're signed in. Taking you to your dashboard…"
                  : "Your password has been updated. Redirecting you to sign in…"}
              </p>
              <Button asChild className="w-full">
                <Link href={verified ? "/dashboard" : "/auth/signin"}>
                  {verified ? "Go to dashboard" : "Sign in"}
                </Link>
              </Button>
            </div>
          ) : !token ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                This reset link is missing or invalid. Request a new one.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/forgot-password">Request a new link</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 sm:h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm new password</Label>
                <Input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="h-11 sm:h-10"
                />
              </div>
              <Button type="submit" className="w-full h-11 sm:h-10" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  );
}
