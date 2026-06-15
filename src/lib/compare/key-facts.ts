/**
 * Key facts for the Compare modal — the objective "hard facts" that let a
 * young person line careers up at a glance: typical salary, what it takes to
 * qualify (time + route), and the work–life balance. Shared by the on-screen
 * card and the downloadable HTML export so they never drift.
 */
import { inferEducationRoute, type Career } from '@/lib/career-pathways';
import { deriveCareerDNA } from '@/lib/career-dna';

export interface KeyFacts {
  /** e.g. "850k–1.5M kr/yr" or "—" when no salary is parseable */
  salary: string;
  /** e.g. "~3 yrs · University", "~2 yrs · Vocational", "On-the-job" */
  qualify: string;
  /** "Predictable hours" | "Manageable" | "Demanding" */
  workLifeLabel: string;
  /** 0–10, for the small bar */
  workLifeScore: number;
}

/** Compact a NOK amount: 850000 → "850k", 1500000 → "1.5M". */
function compactNok(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(n);
}

/** Turn "850,000 - 1,500,000 kr/year" into a compact "850k–1.5M kr/yr". */
export function formatSalaryRange(avgSalary: string): string {
  const nums = (avgSalary.match(/[\d.,]+/g) ?? [])
    .map((x) => parseInt(x.replace(/[.,]/g, ''), 10))
    .filter((x) => Number.isFinite(x) && x > 1_000);
  if (nums.length === 0) return avgSalary?.trim() || '—';
  const lo = Math.min(...nums);
  const hi = Math.max(...nums);
  return lo === hi ? `${compactNok(hi)} kr/yr` : `${compactNok(lo)}–${compactNok(hi)} kr/yr`;
}

const ROUTE_LABEL: Record<string, string> = {
  university: 'University',
  vocational: 'Vocational',
  mixed: 'Mixed routes',
  'on-the-job': 'On-the-job',
};

/** Longest year-count mentioned in the education path, e.g. "6 years" → 6. */
function qualifyYears(career: Career): number | null {
  const matches = [
    ...career.educationPath.matchAll(/(\d+)\s*(?:-|–|to)?\s*(\d+)?\s*year/gi),
  ];
  const years = matches.flatMap((m) =>
    [m[1], m[2]].filter(Boolean).map((n) => parseInt(n as string, 10)),
  );
  return years.length ? Math.max(...years) : null;
}

/**
 * Curated TOTAL time-to-fully-qualified (years, Norway) for medical roles whose
 * education path either omits a number or only states the degree length — so a
 * surgeon shows "~13 yrs", not "University" or the bare 6-year degree. These
 * override the regex-parsed year because for doctors the realistic figure is
 * degree + LIS1 + specialty training, not the degree alone.
 */
const MEDICAL_TRAINING_YEARS: Record<string, number> = {
  "anesthesiologist": 13,
  "bariatric-surgeon": 15,
  "biomedical-scientist": 5,
  "breast-surgeon": 15,
  "cardiac-surgeon": 15,
  "cardiologist": 13,
  "cardiothoracic-surgeon": 15,
  "clinical-scientist": 5,
  "colorectal-surgeon": 15,
  "cosmetic-surgeon": 15,
  "dental-assistant": 2,
  "dental-hygienist": 3,
  "dental-technician": 3,
  "dentist": 5,
  "dermatologic-surgeon": 14,
  "dermatologist": 12,
  "doctor": 12,
  "emergency-medicine-physician": 12,
  "endocrine-surgeon": 15,
  "endocrinologist": 13,
  "food-scientist": 5,
  "general-surgeon": 13,
  "hand-surgeon": 15,
  "healthcare-data-scientist": 5,
  "hepatobiliary-surgeon": 15,
  "intensive-care-physician": 14,
  "internal-medicine-physician": 12,
  "mental-health-counsellor": 4,
  "mental-health-nurse": 4,
  "midwife": 5,
  "neurologist": 13,
  "neurosurgeon": 15,
  "obstetric-gynaecological-surgeon": 13,
  "obstetrician-gynaecologist": 13,
  "occupational-health-physician": 12,
  "oncological-surgeon": 15,
  "oncologist": 13,
  "ophthalmic-surgeon": 12,
  "ophthalmologist": 12,
  "optometrist": 4,
  "oral-maxillofacial-surgeon": 16,
  "orthopaedic-surgeon": 14,
  "otolaryngologist": 12,
  "paediatric-surgeon": 15,
  "pathologist": 12,
  "patient-navigator": 3,
  "pediatrician": 12,
  "peripheral-nerve-surgeon": 15,
  "pharmacist": 5,
  "physician-assistant": 5,
  "plastic-surgeon": 14,
  "podiatrist": 3,
  "psychiatrist": 12,
  "radiologic-technologist": 3,
  "radiologist": 12,
  "reconstructive-surgeon": 15,
  "rheumatologist": 13,
  "spinal-surgeon": 15,
  "sports-medicine-physician": 12,
  "sports-medicine-surgeon": 15,
  "surgeon": 13,
  "thoracic-surgeon": 14,
  "transplant-surgeon": 16,
  "trauma-surgeon": 15,
  "urological-surgeon": 14,
  "vascular-surgeon": 14,
  "veterinarian": 6,
  "veterinary-assistant": 2,
};

export function getKeyFacts(career: Career): KeyFacts {
  const route = inferEducationRoute(career);
  const years = MEDICAL_TRAINING_YEARS[career.id] ?? qualifyYears(career);
  const routeLabel = ROUTE_LABEL[route] ?? 'Varies';
  const qualify =
    route === 'on-the-job'
      ? 'On-the-job'
      : years != null
        ? `~${years} yr${years > 1 ? 's' : ''} · ${routeLabel}`
        : routeLabel;

  const wlb =
    deriveCareerDNA(career).traits.find((t) => t.id === 'work-life-balance')?.score ?? 5;
  const workLifeLabel = wlb >= 7 ? 'Predictable hours' : wlb >= 4 ? 'Manageable' : 'Demanding';

  return {
    salary: formatSalaryRange(career.avgSalary),
    qualify,
    workLifeLabel,
    workLifeScore: wlb,
  };
}
