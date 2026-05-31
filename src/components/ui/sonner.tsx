"use client";

import { useTheme } from "next-themes";
import { Toaster as SonnerToaster, type ToasterProps } from "sonner";

/**
 * App-wide mount point for sonner toasts.
 *
 * ~24 files across the app call `toast` from "sonner" (goal setting,
 * chat, library saves, etc.). Without this component mounted, none of
 * those toasts render — success confirmations AND error messages are
 * silently dropped, which makes actions like "Set as Primary Goal"
 * feel like they do nothing. Mount this once near the app root.
 *
 * Kept separate from the existing Radix `@/components/ui/toaster`
 * (driven by `useToast`); both systems coexist.
 */
export function SonnerToasterProvider(props: ToasterProps) {
  const { resolvedTheme } = useTheme();

  return (
    <SonnerToaster
      theme={(resolvedTheme as ToasterProps["theme"]) ?? "dark"}
      position="top-center"
      richColors
      closeButton
      {...props}
    />
  );
}
