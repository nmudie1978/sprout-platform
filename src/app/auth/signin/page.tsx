"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Sprout, Loader2 } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Handle redirect when session becomes available
  useEffect(() => {
    if (redirecting && status === "authenticated" && session?.user?.role) {
      const destination = session.user.role === "EMPLOYER"
        ? "/employer/dashboard"
        : "/dashboard";
      router.push(destination);
      router.refresh();
    }
  }, [session, status, redirecting, router]);

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role && !loading) {
      const destination = session.user.role === "EMPLOYER"
        ? "/employer/dashboard"
        : "/dashboard";
      router.push(destination);
    }
  }, [session, status, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Invalid email or password");
      }

      if (result?.ok) {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });

        // Trigger session update and set redirecting flag
        setRedirecting(true);

        // Force session update - this is key to getting fresh session data
        await update();

        // Give a small delay for the session to propagate
        await new Promise(resolve => setTimeout(resolve, 100));

        // Fetch fresh session to get role
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" }
        });
        const sessionData = await response.json();

        if (sessionData?.user?.role) {
          const destination = sessionData.user.role === "EMPLOYER"
            ? "/employer/dashboard"
            : "/dashboard";
          router.push(destination);
          router.refresh();
        } else {
          // Fallback: if we still don't have role, do a hard refresh
          window.location.href = "/dashboard";
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setRedirecting(false);
    } finally {
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
      <div className="hidden sm:block absolute top-20 -left-4 w-72 h-72 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="hidden sm:block absolute top-20 -right-4 w-72 h-72 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />

      <Card className="w-full max-w-md shadow-2xl border-2 sm:hover-lift">
        <CardHeader className="space-y-2">
          <div className="flex justify-center mb-2">
            <Sprout className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-center">Welcome back to Sprout</CardTitle>
          <CardDescription className="text-base text-center">
            Sign in to continue your growth journey
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
