"use client"

import { useEffect, useState } from "react"

/**
 * AmbientBackdrop
 *
 * A whisper of ambient life so the app never feels dead at rest. Two large,
 * very low-opacity blurred gradient "blobs" in the brand palette (teal/emerald
 * with a touch of violet) drift slowly behind the main content, plus one very
 * slow "breathing" pulse on a soft central glow so there's a faint sign of life
 * even when nothing is happening.
 *
 * Design intent: CALM + premium, NOT a screensaver. Opacity is tiny (~3–6%),
 * motion is slow (20–40s drifts, ~7s breath), GPU-only transforms, and the
 * whole layer is pointer-events-none behind the content (z-0). Mounted once in
 * the dashboard layout so every page inherits it.
 *
 * Time-of-day warmth: tinted client-side by the local hour so the app feels
 * subtly different at 8am vs 9pm — cooler/calmer in the morning, neutral
 * midday, warmer in the evening/night. Stays within the brand palette.
 *
 * Reduced motion: every animation is killed by the prefers-reduced-motion
 * block in globals.css (.ambient-backdrop *), leaving a completely still,
 * faint static wash.
 */

type Warmth = {
  /** teal/emerald blob hue + alpha (brand cool anchor) */
  cool: string
  /** secondary blob — drifts from teal toward warm gold/amber by hour */
  warm: string
  /** central breathing glow */
  glow: string
}

/**
 * Map the local hour to a barely-perceptible warmth shift, all inside the
 * brand palette. Morning leans cool teal; midday neutral; evening/night
 * picks up a faint violet→amber warmth. Alphas stay tiny (≈0.03–0.06).
 */
function warmthForHour(hour: number): Warmth {
  // Early morning (5–10): cool, calm, fresh teal/emerald.
  if (hour >= 5 && hour < 11) {
    return {
      cool: "hsl(172 66% 45% / 0.05)", // teal
      warm: "hsl(160 60% 46% / 0.045)", // emerald
      glow: "hsl(174 60% 50% / 0.04)",
    }
  }
  // Midday (11–16): neutral brand teal, the most restful baseline.
  if (hour >= 11 && hour < 17) {
    return {
      cool: "hsl(174 64% 44% / 0.05)", // teal
      warm: "hsl(258 55% 60% / 0.04)", // touch of violet
      glow: "hsl(174 60% 50% / 0.04)",
    }
  }
  // Evening (17–21): warmer — teal cooled, a soft gold/amber creeps in.
  if (hour >= 17 && hour < 22) {
    return {
      cool: "hsl(176 50% 42% / 0.045)", // muted teal
      warm: "hsl(38 65% 58% / 0.05)", // soft gold warmth
      glow: "hsl(28 55% 56% / 0.038)",
    }
  }
  // Night (22–4): deepest warmth — violet dusk with a faint amber ember.
  return {
    cool: "hsl(258 48% 56% / 0.045)", // dusk violet
    warm: "hsl(30 55% 54% / 0.045)", // ember amber
    glow: "hsl(264 45% 58% / 0.04)",
  }
}

export function AmbientBackdrop() {
  // Default to the neutral midday palette for SSR / first paint so there's no
  // hydration mismatch and no flash; refine to the real local hour on mount.
  const [warmth, setWarmth] = useState<Warmth>(() => warmthForHour(13))

  useEffect(() => {
    const apply = () => setWarmth(warmthForHour(new Date().getHours()))
    apply()
    // Re-evaluate hourly so a session left open drifts with the day. Cheap:
    // one interval, no rAF loop. (Animations themselves are pure CSS.)
    const id = window.setInterval(apply, 60 * 60 * 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div
      aria-hidden
      className="ambient-backdrop fixed inset-0 z-0 pointer-events-none overflow-hidden"
    >
      {/* Cool teal/emerald blob — top-left, slow drift. */}
      <div
        className="ambient-blob animate-blob will-change-transform"
        style={{
          top: "-12%",
          left: "-10%",
          width: "46vmax",
          height: "46vmax",
          background: `radial-gradient(circle at 50% 50%, ${warmth.cool} 0%, transparent 68%)`,
          animationDuration: "34s",
        }}
      />
      {/* Secondary blob (warmth/violet by hour) — bottom-right, slower drift
          and a phase offset so the two never sync into a pulse. */}
      <div
        className="ambient-blob animate-blob will-change-transform"
        style={{
          bottom: "-14%",
          right: "-12%",
          width: "40vmax",
          height: "40vmax",
          background: `radial-gradient(circle at 50% 50%, ${warmth.warm} 0%, transparent 68%)`,
          animationDuration: "44s",
          animationDelay: "-9s",
        }}
      />
      {/* Central breathing glow — the faint sign of life at rest. Very slow,
          subtle scale/opacity only. */}
      <div
        className="ambient-breath will-change-transform"
        style={{
          top: "50%",
          left: "50%",
          width: "60vmax",
          height: "60vmax",
          marginTop: "-30vmax",
          marginLeft: "-30vmax",
          background: `radial-gradient(circle at 50% 50%, ${warmth.glow} 0%, transparent 60%)`,
        }}
      />
    </div>
  )
}
