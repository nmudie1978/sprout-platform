"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { LifeSkillsProvider } from "@/components/life-skills-provider";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 min before refetch
            gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 min
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
      <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
        <QueryClientProvider client={queryClient}>
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
