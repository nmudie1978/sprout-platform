"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";

/**
 * Fires a single anonymous theme ping per browser session for signed-in users,
 * feeding the admin dashboard's dark-vs-light split. Renders nothing.
 *
 * Privacy: posts only the resolved theme name ("dark"|"light") — no id, no
 * payload that could identify the user. Guarded to once-per-session via
 * sessionStorage, and only when authenticated. Mounted inside the (dashboard)
 * layout so it never runs on public/marketing pages. See /api/theme-ping.
 */
export function ThemeTallyPing() {
  const { resolvedTheme } = useTheme();
  const { status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!resolvedTheme) return;
    if (typeof window === "undefined") return;

    const KEY = "theme-tallied";
    try {
      if (window.sessionStorage.getItem(KEY)) return;
    } catch {
      return; // sessionStorage unavailable (private mode etc.) — skip silently
    }

    const theme = resolvedTheme === "light" ? "light" : "dark";
    fetch("/api/theme-ping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme }),
      keepalive: true,
    })
      .then(() => {
        try {
          window.sessionStorage.setItem(KEY, "1");
        } catch {
          /* ignore */
        }
      })
      .catch(() => {
        /* telemetry is best-effort */
      });
  }, [status, resolvedTheme]);

  return null;
}
