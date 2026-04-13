"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { ThemeProvider } from "@/components/theme-provider";
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
  const prevUserRef = useRef<string | undefined>();

  useEffect(() => {
    const currentUser = session?.user?.id;
    if (prevUserRef.current && prevUserRef.current !== currentUser) {
      queryClient.clear();
    }
    prevUserRef.current = currentUser;
  }, [session?.user?.id, queryClient]);

  return null;
}

export function Providers({ children, session }: { children: React.ReactNode; session?: Session | null }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 3 * 60 * 1000, // 3 min before refetch
            gcTime: 10 * 60 * 1000, // Keep unused data in cache for 10 min
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

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <SessionProvider session={session} refetchOnWindowFocus={false} refetchInterval={0}>
        <QueryClientProvider client={queryClient}>
          <CacheCleaner queryClient={queryClient} />
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
