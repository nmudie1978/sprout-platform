/**
 * Resolve a data-driven bar colour to an inline background style.
 *
 * Bar colours in the insights data come in two flavours: Tailwind classes
 * ("bg-blue-500") and raw colour values ("#8b5cf6"). Both have failed in the
 * UI before: a raw hex dropped into className is invalid CSS, and a Tailwind
 * class that only ever appears as a string in a data file may be purged by the
 * JIT compiler and never generated. Either way the bar gets no fill and reads
 * as a black bar against the dark track.
 *
 * To be immune to both, resolve EVERY colour to an inline background — Tailwind
 * classes via the lookup below, raw values straight through — so the fill never
 * depends on the compiler. Add new entries here when the data adds new classes.
 */
import type { CSSProperties } from "react";

const BAR_COLOR_HEX: Record<string, string> = {
  "bg-amber-400": "#fbbf24",
  "bg-amber-500": "#f59e0b",
  "bg-blue-400": "#60a5fa",
  "bg-blue-500": "#3b82f6",
  "bg-blue-600": "#2563eb",
  "bg-cyan-500": "#06b6d4",
  "bg-emerald-400": "#34d399",
  "bg-emerald-500": "#10b981",
  "bg-green-500": "#22c55e",
  "bg-indigo-500": "#6366f1",
  "bg-lime-500": "#84cc16",
  "bg-orange-400": "#fb923c",
  "bg-orange-500": "#f97316",
  "bg-pink-500": "#ec4899",
  "bg-purple-500": "#a855f7",
  "bg-red-400": "#f87171",
  "bg-red-500": "#ef4444",
  "bg-rose-400": "#fb7185",
  "bg-rose-500": "#f43f5e",
  "bg-sky-400": "#38bdf8",
  "bg-sky-500": "#0ea5e9",
  "bg-slate-400": "#94a3b8",
  "bg-teal-500": "#14b8a6",
  "bg-violet-500": "#8b5cf6",
  "bg-yellow-400": "#facc15",
  "bg-yellow-500": "#eab308",
};

/** A visible default so a missing/unknown colour never renders as a black bar. */
const FALLBACK_BAR_HEX = "#10b981";

export function resolveBarColor(color?: string): { className: string; style: CSSProperties } {
  if (!color) return { className: "", style: { backgroundColor: FALLBACK_BAR_HEX } };
  if (color.startsWith("bg-")) {
    return { className: "", style: { backgroundColor: BAR_COLOR_HEX[color] ?? FALLBACK_BAR_HEX } };
  }
  return { className: "", style: { backgroundColor: color } };
}
