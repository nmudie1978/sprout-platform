/**
 * Curated residency / specialty-training program suggestions per
 * career. Surfaced as a tooltip/popover on residency-type roadmap
 * steps so students can see concrete options across the Nordics and
 * beyond before they apply.
 *
 * The data is deliberately terse — a handful of well-known programs
 * per country, not a full directory. The Clarity PDF surfaces the
 * official requirements; this module gives the in-app roadmap a
 * "here's what's actually available" hint.
 *
 * Matching is career-title based (case-insensitive, includes-match)
 * so "Cardiac Surgeon" matches the "cardiac surgeon" entry via
 * substring on "surgeon". Specific careers (e.g. "Cardiac Surgeon")
 * can override the generic entry by being defined with a longer key.
 */

export interface ResidencyProgram {
  institution: string;
  city: string;
  /** Optional programme/specialty name if it differs from the default. */
  programme?: string;
  /** Typical duration, e.g. "5 years" or "5–6 years". */
  duration?: string;
  /** Optional application link. */
  url?: string;
}

export interface ResidencyCountryGroup {
  country: string;
  programs: ResidencyProgram[];
}

export interface ResidencyRecommendation {
  /** Short human-readable label, e.g. "Surgical residency programs". */
  label: string;
  /** Short one-line caption shown at the top of the popover. */
  caption: string;
  groups: ResidencyCountryGroup[];
}

// ── Data (ordered generic → specific; specific wins via includes-match) ─

const RESIDENCY_DATA: { keys: string[]; data: ResidencyRecommendation }[] = [
  // ── Surgery (generic + specific specialties) ─────────────────────
  {
    keys: ['surgeon', 'surgery'],
    data: {
      label: 'Surgical residency programs',
      caption: 'Typical 5–7 year specialty training paths after medical degree.',
      groups: [
        {
          country: 'Norway',
          programs: [
            { institution: 'Oslo University Hospital (Rikshospitalet)', city: 'Oslo', duration: '6 years' },
            { institution: 'Haukeland University Hospital', city: 'Bergen', duration: '6 years' },
            { institution: 'St. Olavs Hospital', city: 'Trondheim', duration: '6 years' },
          ],
        },
        {
          country: 'Sweden',
          programs: [
            { institution: 'Karolinska University Hospital', city: 'Stockholm', duration: '5 years' },
            { institution: 'Sahlgrenska University Hospital', city: 'Gothenburg', duration: '5 years' },
          ],
        },
        {
          country: 'Denmark',
          programs: [
            { institution: 'Rigshospitalet', city: 'Copenhagen', duration: '6 years' },
            { institution: 'Aarhus University Hospital', city: 'Aarhus', duration: '6 years' },
          ],
        },
        {
          country: 'United Kingdom',
          programs: [
            { institution: 'Imperial College Healthcare NHS Trust', city: 'London', duration: '6 years (CT1–ST8)' },
            { institution: 'Oxford University Hospitals', city: 'Oxford', duration: '6 years (CT1–ST8)' },
          ],
        },
      ],
    },
  },

  // ── General medicine / GP ────────────────────────────────────────
  {
    keys: ['doctor', 'physician', 'general practitioner', 'gp '],
    data: {
      label: 'Medical specialty programs',
      caption: 'Specialty training / residency programs after medical school.',
      groups: [
        {
          country: 'Norway',
          programs: [
            { institution: 'Oslo University Hospital', city: 'Oslo', duration: '5–6 years' },
            { institution: 'Haukeland University Hospital', city: 'Bergen', duration: '5–6 years' },
          ],
        },
        {
          country: 'Sweden',
          programs: [
            { institution: 'Karolinska University Hospital', city: 'Stockholm', duration: '5 years' },
            { institution: 'Uppsala University Hospital', city: 'Uppsala', duration: '5 years' },
          ],
        },
        {
          country: 'Denmark',
          programs: [
            { institution: 'Rigshospitalet', city: 'Copenhagen', duration: '5 years' },
          ],
        },
        {
          country: 'United Kingdom',
          programs: [
            { institution: 'NHS Foundation Training → Specialty', city: 'Various', duration: '2 + 3–6 years' },
          ],
        },
      ],
    },
  },

  // ── Dentistry ────────────────────────────────────────────────────
  {
    keys: ['dentist', 'dental'],
    data: {
      label: 'Dental specialty programs',
      caption: 'Post-graduate dental specialty training options.',
      groups: [
        {
          country: 'Norway',
          programs: [
            { institution: 'University of Oslo (UiO)', city: 'Oslo', duration: '3 years' },
            { institution: 'University of Bergen (UiB)', city: 'Bergen', duration: '3 years' },
          ],
        },
        {
          country: 'Sweden',
          programs: [
            { institution: 'Karolinska Institutet', city: 'Stockholm', duration: '3 years' },
          ],
        },
      ],
    },
  },

  // ── Veterinary ───────────────────────────────────────────────────
  {
    keys: ['veterinar', 'vet '],
    data: {
      label: 'Veterinary residency programs',
      caption: 'European College of Veterinary Specialists (ECVS) tracks.',
      groups: [
        {
          country: 'Norway',
          programs: [
            { institution: 'Norwegian University of Life Sciences (NMBU)', city: 'Ås', duration: '3 years' },
          ],
        },
        {
          country: 'Sweden',
          programs: [
            { institution: 'Swedish University of Agricultural Sciences (SLU)', city: 'Uppsala', duration: '3 years' },
          ],
        },
        {
          country: 'Denmark',
          programs: [
            { institution: 'University of Copenhagen', city: 'Copenhagen', duration: '3 years' },
          ],
        },
      ],
    },
  },

  // ── Law (pupillage / traineeship) ────────────────────────────────
  {
    keys: ['lawyer', 'barrister', 'solicitor', 'advokat'],
    data: {
      label: 'Legal traineeship options',
      caption: 'Trainee-lawyer positions typically 2–3 years post-LLM.',
      groups: [
        {
          country: 'Norway',
          programs: [
            { institution: 'Wikborg Rein', city: 'Oslo', duration: '2 years' },
            { institution: 'Thommessen', city: 'Oslo', duration: '2 years' },
            { institution: 'Regjeringsadvokaten', city: 'Oslo', duration: '2 years' },
          ],
        },
        {
          country: 'Sweden',
          programs: [
            { institution: 'Mannheimer Swartling', city: 'Stockholm', duration: '2 years' },
            { institution: 'Vinge', city: 'Stockholm', duration: '2 years' },
          ],
        },
        {
          country: 'United Kingdom',
          programs: [
            { institution: 'Training contract (solicitor)', city: 'Various', duration: '2 years' },
            { institution: 'Pupillage (barrister)', city: 'Various', duration: '1 year' },
          ],
        },
      ],
    },
  },

  // ── Psychology (clinical) ────────────────────────────────────────
  {
    keys: ['clinical psycholog', 'psycholog'],
    data: {
      label: 'Clinical psychology specialisation',
      caption: 'Post-graduate clinical specialisation options after the cand.psychol.',
      groups: [
        {
          country: 'Norway',
          programs: [
            { institution: 'Norwegian Psychological Association specialist track', city: 'Various', duration: '5 years' },
          ],
        },
        {
          country: 'Sweden',
          programs: [
            { institution: 'Karolinska Institutet (PTP + specialist)', city: 'Stockholm', duration: '5 years' },
          ],
        },
      ],
    },
  },
];

// ── Lookup ─────────────────────────────────────────────────────────

/**
 * Find a residency recommendation for a given career title.
 * Matches on lowercase substring — longer keys are tried first so
 * specific specialties (e.g. "cardiac surgeon") can override generic
 * ones (e.g. "surgeon") if the data later gains specific entries.
 */
export function getResidencyRecommendation(
  careerTitle: string | null | undefined,
): ResidencyRecommendation | null {
  if (!careerTitle) return null;
  const lower = careerTitle.toLowerCase();
  const candidates = [...RESIDENCY_DATA].sort(
    (a, b) =>
      Math.max(...b.keys.map((k) => k.length)) -
      Math.max(...a.keys.map((k) => k.length)),
  );
  for (const entry of candidates) {
    for (const key of entry.keys) {
      if (lower.includes(key)) return entry.data;
    }
  }
  return null;
}

/**
 * True when a roadmap step title refers to residency / specialty
 * training / pupillage — the kind of step that benefits from the
 * residency-recommendation popover.
 */
export function isResidencyStep(title: string): boolean {
  const lower = title.toLowerCase();
  return /residen|fellowship|specialty|specialis|pupillage|traineeship|specialis\s*train/i.test(
    lower,
  );
}
