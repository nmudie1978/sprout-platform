/**
 * Career Presence Signal — Deterministic Scoring Layer
 *
 * Combines per-country signal inputs into a final presenceLevel
 * and confidenceLevel using transparent, fixed weights.
 *
 * The AI agent does NOT decide weights — this is pure business logic.
 * Weights are explainable and auditable.
 */

import type {
  CareerPresenceSignals,
  SignalLevel,
  PresenceLevel,
  ConfidenceLevel,
  ScoredPresence,
  CountryCode,
} from './types';
import { COUNTRY_LABELS, ALL_COUNTRIES } from './types';
import { getCareerSignals } from './signals';

// ── Signal → numeric mapping ────────────────────────────────────────

const SIGNAL_VALUES: Record<SignalLevel, number> = {
  none: 0,
  low: 0.25,
  moderate: 0.6,
  high: 1.0,
};

// ── Weights (transparent, deterministic) ────────────────────────────
// These control how much each signal contributes to the final score.
// Job postings and company presence are the strongest indicators.

const WEIGHTS = {
  jobPostingPresence: 0.35,
  companyPresence: 0.25,
  industryPresence: 0.20,
  pathwayAvailability: 0.12,
  remoteViability: 0.08,
} as const;

// ── Score thresholds ────────────────────────────────────────────────

function toPresenceLevel(score: number): PresenceLevel {
  if (score >= 0.65) return 'high';
  if (score >= 0.35) return 'moderate';
  return 'limited';
}

// ── Confidence ──────────────────────────────────────────────────────
// Confidence is driven by how many signals are "none" (missing data).
// If most signals are populated, confidence is high.

function toConfidenceLevel(signals: CareerPresenceSignals): ConfidenceLevel {
  const values = Object.values(signals) as SignalLevel[];
  const noneCount = values.filter(v => v === 'none').length;
  const total = values.length;

  if (noneCount === 0) return 'high';
  if (noneCount <= 1) return 'medium';
  return 'low';
}

// ── Scoring function ────────────────────────────────────────────────

function scoreSignals(signals: CareerPresenceSignals): { rawScore: number; presenceLevel: PresenceLevel; confidenceLevel: ConfidenceLevel } {
  const rawScore =
    SIGNAL_VALUES[signals.jobPostingPresence] * WEIGHTS.jobPostingPresence +
    SIGNAL_VALUES[signals.companyPresence] * WEIGHTS.companyPresence +
    SIGNAL_VALUES[signals.industryPresence] * WEIGHTS.industryPresence +
    SIGNAL_VALUES[signals.pathwayAvailability] * WEIGHTS.pathwayAvailability +
    SIGNAL_VALUES[signals.remoteViability] * WEIGHTS.remoteViability;

  return {
    rawScore: Math.round(rawScore * 100) / 100,
    presenceLevel: toPresenceLevel(rawScore),
    confidenceLevel: toConfidenceLevel(signals),
  };
}

// ── Public API ──────────────────────────────────────────────────────

/**
 * Score a career across all countries. Returns null if no signal data
 * exists for this career (graceful fallback).
 */
export function scoreCareerPresence(careerId: string): ScoredPresence[] | null {
  const signalMap = getCareerSignals(careerId);
  if (!signalMap) return null;

  return ALL_COUNTRIES.map((code: CountryCode) => {
    const signals = signalMap[code];
    const { rawScore, presenceLevel, confidenceLevel } = scoreSignals(signals);
    return {
      countryCode: code,
      countryName: COUNTRY_LABELS[code],
      presenceLevel,
      confidenceLevel,
      rawScore,
    };
  });
}
