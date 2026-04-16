/**
 * Pathway-rework scope helpers.
 *
 * The career-pathway data model rework (see docs/pathway-data-model.md)
 * introduces multi-route Study Paths for academic-track careers. Until
 * Phase 4 ships the actual route content, the affected careers display
 * a small disclaimer in their Study Path so users know we're aware
 * the current view shows only one common route.
 *
 * This list mirrors §9 of the design doc — "Get the multi-route
 * treatment". Vocational careers (electrician, chef, hairdresser,
 * etc.) and long-tail careers stay on the existing single-route or
 * fallback view and do NOT get the disclaimer.
 *
 * When Phase 4 lands a real alternative route for a career, we can
 * either remove that career from this list (so the disclaimer goes
 * away) or replace this list with a runtime check against
 * `getRoutesForCareer(id).length > 1`. Until then this is the
 * single source of truth.
 */

const ACADEMIC_TRACK_CAREER_IDS: ReadonlySet<string> = new Set([
  // Health & medicine
  'doctor',
  'dentist',
  'nurse',
  'psychologist',
  'physiotherapist',
  'veterinarian',

  // Law / business / economics
  'lawyer',
  'accountant',
  'economist',

  // Tech & engineering
  'software-developer',
  'data-analyst',
  'it-engineer',
  'engineer',
  'civil-engineer',
  'mechanical-engineer',

  // Creative & built environment
  'architect',
  'designer',

  // Public service & education
  'teacher',
  'social-worker',

  // Sciences
  'biologist',
  'chemist',

  // Aviation / public safety (academic / specialised training)
  'airline-pilot',
  'helicopter-pilot',
  'police-officer',
  'firefighter',
]);

/**
 * Whether a given career is in scope for the multi-route Study Path
 * rework. Used to gate the "alternative routes coming soon" disclaimer
 * shown on the affected careers' Study Path until Phase 4 lands.
 */
export function isAcademicTrackCareer(careerId: string | null | undefined): boolean {
  if (!careerId) return false;
  return ACADEMIC_TRACK_CAREER_IDS.has(careerId);
}
