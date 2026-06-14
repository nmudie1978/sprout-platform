/**
 * Career DNA — types
 *
 * Career DNA describes what a *career* is made of — NOT who the user is.
 * Every career has a profile of ten objective traits, each scored 0–10,
 * plus a few "primary genes" (its dominant character) and a short snapshot.
 *
 * These types are deliberately data-only so the profiles can later be
 * replaced by a richer/server-sourced dataset without touching the UI.
 */

/** The ten canonical DNA trait ids, in display order. */
export type CareerDNATraitId =
  | 'technical-depth'
  | 'problem-solving'
  | 'people-interaction'
  | 'creativity'
  | 'leadership'
  | 'ai-exposure'
  | 'income-potential'
  | 'work-life-balance'
  | 'education-length'
  | 'independence';

export type CareerDNATrait = {
  id: CareerDNATraitId;
  /** Human-readable label, e.g. "Technical Depth". */
  label: string;
  /** Objective intensity of this trait for the career, 0–10. */
  score: number;
  /** One short, human-readable sentence explaining the score. */
  description: string;
  /** Accent colour (hex) used by the dots and the DNA strand. */
  color: string;
};

export type CareerDNASnapshot = {
  careerType: string;
  workEnvironment: string;
  /** Kept deliberately general (a band, not a precise figure). */
  incomePotential: string;
  jobOutlook: string;
  educationPath: string;
};

export type CareerDNAProfile = {
  careerId: string;
  careerTitle: string;
  subtitle: string;
  traits: CareerDNATrait[];
  primaryGenes: string[];
  snapshot: CareerDNASnapshot;
  /**
   * True when the profile is hand-authored (curated), false when it was
   * synthesised from the career's structured fields. Lets the UI add a
   * subtle "estimated" hint for derived profiles if desired.
   */
  curated: boolean;
};
