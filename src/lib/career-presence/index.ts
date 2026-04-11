/**
 * Career Presence Signal — Public API
 *
 * Architecture:
 *
 *   ┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
 *   │  Seed Data   │────▶│   Scoring    │────▶│  Agent (AI or    │
 *   │  signals.ts  │     │  scoring.ts  │     │  deterministic)  │
 *   └─────────────┘     └──────────────┘     │  agent.ts        │
 *                                             └────────┬─────────┘
 *                                                      │
 *                                              CareerPresenceResult
 *                                                      │
 *                                             ┌────────▼─────────┐
 *                                             │   API Route      │
 *                                             │   /api/career-   │
 *                                             │   presence       │
 *                                             └────────┬─────────┘
 *                                                      │
 *                                             ┌────────▼─────────┐
 *                                             │   UI Card        │
 *                                             │   career-        │
 *                                             │   presence-card  │
 *                                             └──────────────────┘
 *
 * Signal data (signals.ts):
 *   Curated per-career, per-country input signals. Designed to be
 *   replaced with real data sources (job boards, industry datasets).
 *
 * Scoring (scoring.ts):
 *   Deterministic, transparent weighted combination of signals into
 *   a final presenceLevel (limited/moderate/high) and confidenceLevel.
 *   Weights are fixed in code, not decided by AI.
 *
 * Agent (agent.ts):
 *   Bounded interpretation layer. Takes scored data and produces
 *   plain-English explanations. Uses OpenAI when available, falls
 *   back to deterministic templates. Never invents facts.
 *
 * Extending with real data:
 *   Replace the SEED_DATA in signals.ts with a function that queries
 *   real sources. The scoring and agent layers remain unchanged.
 */

export type {
  SignalLevel,
  PresenceLevel,
  ConfidenceLevel,
  CountryCode,
  CareerPresenceSignals,
  CareerCountryPresence,
  ScoredPresence,
  CareerPresenceResult,
} from './types';

export { COUNTRY_LABELS, ALL_COUNTRIES, ANCHOR_COUNTRY, COMPARISON_COUNTRIES } from './types';
export { getCareerSignals, getAvailableCareers } from './signals';
export { scoreCareerPresence } from './scoring';
export { interpretPresence, buildFallbackResult } from './agent';
