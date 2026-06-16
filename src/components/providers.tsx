"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { ThemeProvider } from "@/components/theme-provider";
import { readUserTheme, writeUserTheme } from "@/lib/theme/user-theme";
import { Toaster } from "@/components/ui/toaster";
import { LifeSkillsProvider } from "@/components/life-skills-provider";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import type { Session } from "next-auth";

/**
 * Clears the React Query cache when the authenticated user changes.
 * Without this, cached data from user A (dashboard stats, library,
 * explored journeys) leaks into user B's session on the same tab.
 */
function CacheCleaner({ queryClient }: { queryClient: QueryClient }) {
  const { data: session } = useSession();
  const prevUserRef = useRef<string | undefined | null>(null);

  useEffect(() => {
    const currentUser = session?.user?.id;
    // Only clear when switching from one real user to a DIFFERENT real
    // user. Ignore undefined → user (initial load) and user → undefined
    // (session refresh flicker) — those are not real user switches and
    // clearing the cache during them wipes the current user's data.
    if (prevUserRef.current && currentUser && prevUserRef.current !== currentUser) {
      queryClient.clear();
    }
    if (currentUser) {
      prevUserRef.current = currentUser;
    }
  }, [session?.user?.id, queryClient]);

  return null;
}

/**
 * Dark-first per-user theme. next-themes persists one theme per *browser*,
 * shared across accounts and never reset on login — so a new user can inherit
 * a light value left by a previous user/session. ThemeBoot fixes that: on each
 * login (or user switch) it applies THIS user's saved choice, or falls back to
 * dark, overriding any leaked browser-global value. It then records the user's
 * subsequent explicit toggles per-user so their opt-in light persists for them
 * (and only them). Pre-auth routes are already forced dark, and this only runs
 * once a user id is present, so the two never conflict.
 */
function ThemeBoot() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const userId = session?.user?.id;
  const bootedFor = useRef<string | null>(null);

  // On login / user switch: apply this user's saved theme, else dark.
  useEffect(() => {
    if (!userId || typeof window === "undefined") return;
    if (bootedFor.current === userId) return;
    bootedFor.current = userId;
    setTheme(readUserTheme(userId, window.localStorage) ?? "dark");
  }, [userId, setTheme]);

  // After boot, persist any theme change as this user's explicit choice.
  useEffect(() => {
    if (!userId || typeof window === "undefined") return;
    if (bootedFor.current !== userId) return;
    if (theme === "light" || theme === "dark") {
      writeUserTheme(userId, theme, window.localStorage);
    }
  }, [theme, userId]);

  return null;
}

export function Providers({ children, session }: { children: React.ReactNode; session?: Session | null }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 3 * 60 * 1000, // 3 min before refetch
            gcTime: 60 * 60 * 1000, // Keep unused data cached 60 min so re-opening a previously explored career is instant

            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: 1, // Reduce retries from default 3 to 1
          },
          mutations: {
            retry: 0, // Don't retry mutations
          },
        },
      })
  );

  // Pre-auth "front door" — the public landing and the whole auth flow
  // (sign in / sign up / verify / etc.) — is ALWAYS dark, regardless of any
  // light preference a returning user may have saved. Once signed in, the
  // in-app light/dark toggle applies as normal (forcedTheme falls back to
  // undefined off these routes). New users already default to dark via
  // defaultTheme="dark" + enableSystem={false}.
  const pathname = usePathname();
  const forceDarkPreAuth =
    pathname === "/" || (pathname?.startsWith("/auth") ?? false);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      forcedTheme={forceDarkPreAuth ? "dark" : undefined}
      disableTransitionOnChange
    >
      <SessionProvider session={session} refetchOnWindowFocus={false} refetchInterval={0}>
        <QueryClientProvider client={queryClient}>
          <CacheCleaner queryClient={queryClient} />
          <ThemeBoot />
          <LifeSkillsProvider>
            {children}
            <MobileBottomNav />
          </LifeSkillsProvider>
          <Toaster />
        </QueryClientProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
