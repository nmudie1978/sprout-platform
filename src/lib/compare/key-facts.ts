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

export function getKeyFacts(career: Career): KeyFacts {
  const route = inferEducationRoute(career);
  const years = qualifyYears(career);
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
