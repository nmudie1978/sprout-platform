"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";

// Loading skeleton for session-dependent content
function NavSkeleton() {
  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <div className="h-9 w-20 bg-muted/50 rounded animate-pulse hidden sm:block" />
      <div className="h-10 w-24 bg-green-600/50 rounded animate-pulse" />
    </div>
  );
}

export function LandingNavAuth() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <NavSkeleton />;
  }

  if (session) {
    return (
      <>
        <span className="text-sm text-muted-foreground hidden lg:inline">
          {session.user.email}
        </span>
        <Button asChild className="h-10 sm:h-9 px-3 sm:px-4">
          <Link href={session.user.role === "EMPLOYER" ? "/employer/dashboard" : "/dashboard"}>
            <LayoutDashboard className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </Button>
      </>
    );
  }

  return (
    <>
      <Button variant="ghost" asChild className="h-10 sm:h-9 px-3 sm:px-4 hidden sm:inline-flex">
        <Link href="/auth/signin">Sign In</Link>
      </Button>
      <Button asChild className="bg-green-600 hover:bg-green-700 h-10 sm:h-9 px-4">
        <Link href="/auth/signup">
          <span className="sm:hidden">Start</span>
          <span className="hidden sm:inline">Get Started</span>
        </Link>
      </Button>
    </>
  );
}
