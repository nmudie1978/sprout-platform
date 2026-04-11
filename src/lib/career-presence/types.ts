/**
 * Career Presence Signal — Data Model
 *
 * Each signal is a categorical bucket (none / low / moderate / high)
 * representing how present or available a career appears to be along
 * a specific dimension in a specific country.
 *
 * These are directional indicators, not exact measurements.
 */

// ── Signal levels ───────────────────────────────────────────────────

/** How strong a single input signal is. */
export type SignalLevel = 'none' | 'low' | 'moderate' | 'high';

/** The final user-facing presence label. */
export type PresenceLevel = 'limited' | 'moderate' | 'high';

/** How much we trust the overall result. */
export type ConfidenceLevel = 'low' | 'medium' | 'high';

// ── Country ─────────────────────────────────────────────────────────

export type CountryCode = 'NO' | 'GB' | 'DE' | 'SE';

export const COUNTRY_LABELS: Record<CountryCode, string> = {
  NO: 'Norway',
  GB: 'United Kingdom',
  DE: 'Germany',
  SE: 'Sweden',
};

/** Norway is always the anchor. Others are comparison benchmarks. */
export const ANCHOR_COUNTRY: CountryCode = 'NO';
export const COMPARISON_COUNTRIES: CountryCode[] = ['GB', 'DE', 'SE'];
export const ALL_COUNTRIES: CountryCode[] = ['NO', 'GB', 'DE', 'SE'];

// ── Per-country signal inputs ───────────────────────────────────────

export interface CareerPresenceSignals {
  /** Whether this role appears on job boards in the country. */
  jobPostingPresence: SignalLevel;
  /** Whether companies in this country typically employ this role. */
  companyPresence: SignalLevel;
  /** Whether the relevant industry ecosystem is present. */
  industryPresence: SignalLevel;
  /** Whether study/training/entry pathways exist locally. */
  pathwayAvailability: SignalLevel;
  /** Whether this career can realistically be done remotely. */
  remoteViability: SignalLevel;
}

// ── Full record for one career × one country ────────────────────────

export interface CareerCountryPresence {
  careerId: string;
  countryCode: CountryCode;
  signals: CareerPresenceSignals;
  /** Computed by the scoring layer — not stored in seed data. */
  presenceLevel?: PresenceLevel;
  /** Computed by the scoring layer. */
  confidenceLevel?: ConfidenceLevel;
  /** Internal notes for debugging / data lineage. Not shown to users. */
  notes?: string;
}

// ── Scored output (after deterministic scoring) ─────────────────────

export interface ScoredPresence {
  countryCode: CountryCode;
  countryName: string;
  presenceLevel: PresenceLevel;
  confidenceLevel: ConfidenceLevel;
  /** Raw numeric score (0–1) used internally. Not shown to users. */
  rawScore: number;
}

// ── Full result for one career ──────────────────────────────────────

export interface CareerPresenceResult {
  careerId: string;
  careerTitle: string;
  /** Norway is always first. */
  countries: ScoredPresence[];
  /** AI-generated plain-English explanation. */
  explanation: string;
  /** Short caution / helper note. */
  cautionNote: string;
  /** Whether this result has enough data to be useful. */
  available: boolean;
}
