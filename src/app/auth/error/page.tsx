"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout, AlertTriangle, XCircle, ShieldX, UserX, Loader2 } from "lucide-react";

interface ErrorInfo {
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: {
    label: string;
    href: string;
  };
}

function getErrorInfo(error: string | null, message: string | null): ErrorInfo {
  // VIPPS-specific errors
  if (error === "AgeRestriction") {
    return {
      title: "Age Restriction",
      description: message || "You must be at least 15 years old to use this platform.",
      icon: <UserX className="h-12 w-12 text-red-500" />,
      action: {
        label: "Learn More",
        href: "/legal/eligibility",
      },
    };
  }

  if (error === "OAuthAccountNotLinked") {
    return {
      title: "Account Already Exists",
      description: "An account with this email already exists using a different sign-in method. Please sign in with your original method, then you can link your Vipps account from settings.",
      icon: <ShieldX className="h-12 w-12 text-amber-500" />,
      action: {
        label: "Sign in",
        href: "/auth/signin",
      },
    };
  }

  if (error === "OAuthCallback" || error === "OAuthSignin") {
    return {
      title: "Vipps Sign-in Failed",
      description: "There was a problem signing in with Vipps. This could be a temporary issue. Please try again.",
      icon: <AlertTriangle className="h-12 w-12 text-amber-500" />,
      action: {
        label: "Try Again",
        href: "/auth/signin",
      },
    };
  }

  if (error === "AccessDenied") {
    return {
      title: "Access Denied",
      description: message || "You do not have permission to access this resource.",
      icon: <ShieldX className="h-12 w-12 text-red-500" />,
      action: {
        label: "Go Home",
        href: "/",
      },
    };
  }

  if (error === "Configuration") {
    return {
      title: "Configuration Error",
      description: "There is a problem with the server configuration. Please contact support if this persists.",
      icon: <XCircle className="h-12 w-12 text-red-500" />,
      action: {
        label: "Go Home",
        href: "/",
      },
    };
  }

  if (error === "Verification") {
    return {
      title: "Verification Failed",
      description: "The verification link is invalid or has expired. Please request a new one.",
      icon: <AlertTriangle className="h-12 w-12 text-amber-500" />,
      action: {
        label: "Sign in",
        href: "/auth/signin",
      },
    };
  }

  if (error === "CredentialsSignin") {
    return {
      title: "Sign-in Failed",
      description: "Invalid email or password. Please check your credentials and try again.",
      icon: <XCircle className="h-12 w-12 text-red-500" />,
      action: {
        label: "Try Again",
        href: "/auth/signin",
      },
    };
  }

  // Default error
  return {
    title: "Something Went Wrong",
    description: message || "An unexpected error occurred. Please try again later.",
    icon: <AlertTriangle className="h-12 w-12 text-amber-500" />,
    action: {
      label: "Go Home",
      href: "/",
    },
  };
}

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message");

  const errorInfo = getErrorInfo(error, message);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-red-500/5 via-background to-amber-500/5" />

      <Card className="w-full max-w-md shadow-2xl border-2">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            {errorInfo.icon}
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl">{errorInfo.title}</CardTitle>
            <CardDescription className="text-base">
              {errorInfo.description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorInfo.action && (
            <Button asChild className="w-full h-11 sm:h-10">
              <Link href={errorInfo.action.href}>
                {errorInfo.action.label}
              </Link>
            </Button>
          )}

          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
            >
              <Sprout className="h-4 w-4 mr-1" />
              Back to Sprout
            </Link>
          </div>

          {/* Debug info in development */}
          {process.env.NODE_ENV === "development" && error && (
            <div className="mt-6 p-3 bg-muted rounded-lg">
              <p className="text-xs font-mono text-muted-foreground">
                Error code: {error}
                {message && (
                  <>
                    <br />
                    Message: {message}
                  </>
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AuthErrorLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<AuthErrorLoading />}>
      <AuthErrorContent />
    </Suspense>
  );
}
