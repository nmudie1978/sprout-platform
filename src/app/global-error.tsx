"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // This is the last resort — fires when the root layout itself
    // throws. Capturing to Sentry here means we still see the crash
    // even when the app's own error boundaries failed.
    Sentry.captureException(error, {
      tags: { source: "global-error" },
      extra: { digest: error.digest },
    });
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          fontFamily: "system-ui, sans-serif",
          padding: "20px",
          textAlign: "center",
        }}>
          <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#666", marginBottom: "24px" }}>
            We encountered an unexpected error. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "12px 24px",
              backgroundColor: "#16a34a",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
