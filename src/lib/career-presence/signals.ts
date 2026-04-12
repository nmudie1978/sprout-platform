/**
 * Career Presence Signal — Curated Seed Data
 *
 * This is mocked-but-realistic signal data for Phase 1.
 * Each entry represents directional indicators for how present a career
 * appears in a given country — NOT exact labour-market statistics.
 *
 * Designed to be replaced with real data sources later:
 *   - Job board APIs (NAV, FINN, Indeed, LinkedIn)
 *   - Industry mapping datasets
 *   - Education pathway registries (Samordna Opptak, UCAS)
 *
 * Careers are keyed by slug (matching the career ID in the app).
 */

import type { CareerPresenceSignals, CountryCode } from './types';
import generatedSignals from './signals.generated.json';

type SignalMap = Record<CountryCode, CareerPresenceSignals>;
const generated = generatedSignals as Record<string, SignalMap>;

/**
 * Curated signals. Each career maps to 4 countries.
 * Signal values: 'none' | 'low' | 'moderate' | 'high'
 */
const SEED_DATA: Record<string, SignalMap> = {
  // ── Healthcare ────────────────────────────────────────────────────
  doctor: {
    NO: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'none' },
    GB: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'none' },
    DE: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'none' },
    SE: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'none' },
  },
  nurse: {
    NO: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'none' },
    GB: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'none' },
    DE: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'none' },
    SE: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'none' },
  },
  dentist: {
    NO: { jobPostingPresence: 'moderate', companyPresence: 'moderate', industryPresence: 'high', pathwayAvailability: 'moderate', remoteViability: 'none' },
    GB: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'none' },
    DE: { jobPostingPresence: 'moderate', companyPresence: 'moderate', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'none' },
    SE: { jobPostingPresence: 'moderate', companyPresence: 'moderate', industryPresence: 'high', pathwayAvailability: 'moderate', remoteViability: 'none' },
  },
  physiotherapist: {
    NO: { jobPostingPresence: 'moderate', companyPresence: 'moderate', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'low' },
    GB: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'low' },
    DE: { jobPostingPresence: 'moderate', companyPresence: 'moderate', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'low' },
    SE: { jobPostingPresence: 'moderate', companyPresence: 'moderate', industryPresence: 'high', pathwayAvailability: 'moderate', remoteViability: 'low' },
  },
  psychologist: {
    NO: { jobPostingPresence: 'moderate', companyPresence: 'moderate', industryPresence: 'high', pathwayAvailability: 'moderate', remoteViability: 'moderate' },
    GB: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'moderate' },
    DE: { jobPostingPresence: 'moderate', companyPresence: 'moderate', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'moderate' },
    SE: { jobPostingPresence: 'moderate', companyPresence: 'moderate', industryPresence: 'high', pathwayAvailability: 'moderate', remoteViability: 'moderate' },
  },
  // ── Technology ────────────────────────────────────────────────────
  'software-developer': {
    NO: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'high' },
    GB: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'high' },
    DE: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'high' },
    SE: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'high' },
  },
  'data-scientist': {
    NO: { jobPostingPresence: 'moderate', companyPresence: 'moderate', industryPresence: 'moderate', pathwayAvailability: 'moderate', remoteViability: 'high' },
    GB: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'high' },
    DE: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'high' },
    SE: { jobPostingPresence: 'moderate', companyPresence: 'moderate', industryPresence: 'moderate', pathwayAvailability: 'moderate', remoteViability: 'high' },
  },
  'cybersecurity-analyst': {
    NO: { jobPostingPresence: 'moderate', companyPresence: 'moderate', industryPresence: 'moderate', pathwayAvailability: 'moderate', remoteViability: 'high' },
    GB: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'high' },
    DE: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'high' },
    SE: { jobPostingPresence: 'moderate', companyPresence: 'moderate', industryPresence: 'moderate', pathwayAvailability: 'moderate', remoteViability: 'high' },
  },
  'ux-designer': {
    NO: { jobPostingPresence: 'moderate', companyPresence: 'moderate', industryPresence: 'moderate', pathwayAvailability: 'low', remoteViability: 'high' },
    GB: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'high' },
    DE: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'moderate', remoteViability: 'high' },
    SE: { jobPostingPresence: 'moderate', companyPresence: 'moderate', industryPresence: 'moderate', pathwayAvailability: 'moderate', remoteViability: 'high' },
  },
  // ── Engineering ───────────────────────────────────────────────────
  'mechanical-engineer': {
    NO: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'low' },
    GB: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'low' },
    DE: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'low' },
    SE: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'low' },
  },
  'electrical-engineer': {
    NO: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'low' },
    GB: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'low' },
    DE: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'low' },
    SE: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'low' },
  },
  'civil-engineer': {
    NO: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'none' },
    GB: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'none' },
    DE: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'none' },
    SE: { jobPostingPresence: 'moderate', companyPresence: 'moderate', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'none' },
  },
  // ── Energy / Maritime (Norway-strong) ─────────────────────────────
  'petroleum-engineer': {
    NO: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'low' },
    GB: { jobPostingPresence: 'moderate', companyPresence: 'moderate', industryPresence: 'moderate', pathwayAvailability: 'moderate', remoteViability: 'low' },
    DE: { jobPostingPresence: 'low', companyPresence: 'low', industryPresence: 'low', pathwayAvailability: 'low', remoteViability: 'low' },
    SE: { jobPostingPresence: 'low', companyPresence: 'low', industryPresence: 'low', pathwayAvailability: 'low', remoteViability: 'low' },
  },
  'marine-biologist': {
    NO: { jobPostingPresence: 'moderate', companyPresence: 'moderate', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'low' },
    GB: { jobPostingPresence: 'moderate', companyPresence: 'moderate', industryPresence: 'moderate', pathwayAvailability: 'high', remoteViability: 'low' },
    DE: { jobPostingPresence: 'low', companyPresence: 'low', industryPresence: 'moderate', pathwayAvailability: 'moderate', remoteViability: 'low' },
    SE: { jobPostingPresence: 'low', companyPresence: 'low', industryPresence: 'moderate', pathwayAvailability: 'moderate', remoteViability: 'low' },
  },
  // ── Creative ──────────────────────────────────────────────────────
  'graphic-designer': {
    NO: { jobPostingPresence: 'moderate', companyPresence: 'moderate', industryPresence: 'moderate', pathwayAvailability: 'moderate', remoteViability: 'high' },
    GB: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'high' },
    DE: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'high' },
    SE: { jobPostingPresence: 'moderate', companyPresence: 'moderate', industryPresence: 'moderate', pathwayAvailability: 'moderate', remoteViability: 'high' },
  },
  architect: {
    NO: { jobPostingPresence: 'moderate', companyPresence: 'moderate', industryPresence: 'moderate', pathwayAvailability: 'moderate', remoteViability: 'low' },
    GB: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'low' },
    DE: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'low' },
    SE: { jobPostingPresence: 'moderate', companyPresence: 'moderate', industryPresence: 'moderate', pathwayAvailability: 'moderate', remoteViability: 'low' },
  },
  journalist: {
    NO: { jobPostingPresence: 'moderate', companyPresence: 'moderate', industryPresence: 'moderate', pathwayAvailability: 'high', remoteViability: 'moderate' },
    GB: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'moderate' },
    DE: { jobPostingPresence: 'moderate', companyPresence: 'moderate', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'moderate' },
    SE: { jobPostingPresence: 'moderate', companyPresence: 'moderate', industryPresence: 'moderate', pathwayAvailability: 'moderate', remoteViability: 'moderate' },
  },
  // ── Education ─────────────────────────────────────────────────────
  teacher: {
    NO: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'low' },
    GB: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'low' },
    DE: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'low' },
    SE: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'low' },
  },
  // ── Business / Finance ────────────────────────────────────────────
  accountant: {
    NO: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'moderate' },
    GB: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'moderate' },
    DE: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'moderate' },
    SE: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'moderate' },
  },
  lawyer: {
    NO: { jobPostingPresence: 'moderate', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'low' },
    GB: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'low' },
    DE: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'low' },
    SE: { jobPostingPresence: 'moderate', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'low' },
  },
  // ── Trades / Vocational ───────────────────────────────────────────
  electrician: {
    NO: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'none' },
    GB: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'none' },
    DE: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'none' },
    SE: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'none' },
  },
  plumber: {
    NO: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'none' },
    GB: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'none' },
    DE: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'none' },
    SE: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'none' },
  },
  chef: {
    NO: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'moderate', pathwayAvailability: 'high', remoteViability: 'none' },
    GB: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'none' },
    DE: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'none' },
    SE: { jobPostingPresence: 'moderate', companyPresence: 'moderate', industryPresence: 'moderate', pathwayAvailability: 'moderate', remoteViability: 'none' },
  },
  // ── Specialist / Niche ────────────────────────────────────────────
  'veterinarian': {
    NO: { jobPostingPresence: 'moderate', companyPresence: 'moderate', industryPresence: 'moderate', pathwayAvailability: 'moderate', remoteViability: 'none' },
    GB: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'none' },
    DE: { jobPostingPresence: 'moderate', companyPresence: 'moderate', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'none' },
    SE: { jobPostingPresence: 'moderate', companyPresence: 'moderate', industryPresence: 'moderate', pathwayAvailability: 'moderate', remoteViability: 'none' },
  },
  pharmacist: {
    NO: { jobPostingPresence: 'moderate', companyPresence: 'moderate', industryPresence: 'high', pathwayAvailability: 'moderate', remoteViability: 'none' },
    GB: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'none' },
    DE: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'none' },
    SE: { jobPostingPresence: 'moderate', companyPresence: 'moderate', industryPresence: 'high', pathwayAvailability: 'moderate', remoteViability: 'none' },
  },
  surgeon: {
    NO: { jobPostingPresence: 'moderate', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'moderate', remoteViability: 'none' },
    GB: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'none' },
    DE: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'none' },
    SE: { jobPostingPresence: 'moderate', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'moderate', remoteViability: 'none' },
  },
  // ── Sustainability / Green ────────────────────────────────────────
  'environmental-scientist': {
    NO: { jobPostingPresence: 'moderate', companyPresence: 'moderate', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'moderate' },
    GB: { jobPostingPresence: 'moderate', companyPresence: 'moderate', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'moderate' },
    DE: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'moderate' },
    SE: { jobPostingPresence: 'moderate', companyPresence: 'moderate', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'moderate' },
  },
  'renewable-energy-technician': {
    NO: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'moderate', remoteViability: 'none' },
    GB: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'none' },
    DE: { jobPostingPresence: 'high', companyPresence: 'high', industryPresence: 'high', pathwayAvailability: 'high', remoteViability: 'none' },
    SE: { jobPostingPresence: 'moderate', companyPresence: 'moderate', industryPresence: 'high', pathwayAvailability: 'moderate', remoteViability: 'none' },
  },
};

/**
 * Look up seed signals for a career. Tries the raw ID first,
 * then falls back to a slug derived from the title.
 */
export function getCareerSignals(careerId: string): SignalMap | null {
  const slug = careerId.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  // 1. Curated seed data
  const curated = SEED_DATA[slug] ?? SEED_DATA[careerId];
  if (curated) return curated;
  // 2. AI-generated signals
  return generated[slug] ?? generated[careerId] ?? null;
}

/** List all career IDs with signal data (curated + generated). */
export function getAvailableCareers(): string[] {
  return [...new Set([...Object.keys(SEED_DATA), ...Object.keys(generated)])];
}
