/**
 * Salary Progression — junior → mid → senior → lead trajectory
 * per career. Rendered as a horizontal step chart in Understand.
 *
 * Values are annual NOK ranges, editorial estimates from SSB,
 * Glassdoor NO, and industry reports. Add careers by editing
 * SALARY_PROGRESSIONS.
 */

export interface SalaryStep {
  label: string;
  /** Years of experience for this level. */
  years: string;
  /** Salary in thousands of NOK (e.g. 520 = 520,000 kr). */
  minK: number;
  maxK: number;
}

export interface SalaryProgression {
  steps: SalaryStep[];
  /** Norwegian median for context (~570k as of 2025). */
  nationalMedianK: number;
  note?: string;
}

const NATIONAL_MEDIAN_K = 570;

const SALARY_PROGRESSIONS: Record<string, SalaryProgression> = {
  doctor: {
    steps: [
      { label: 'LIS1 (intern)', years: '0-1.5', minK: 600, maxK: 700 },
      { label: 'LIS2/3 (specialising)', years: '2-6', minK: 750, maxK: 900 },
      { label: 'Specialist', years: '7-15', minK: 900, maxK: 1200 },
      { label: 'Senior / Overlege', years: '15+', minK: 1100, maxK: 1500 },
    ],
    nationalMedianK: NATIONAL_MEDIAN_K,
  },
  nurse: {
    steps: [
      { label: 'Junior nurse', years: '0-2', minK: 480, maxK: 540 },
      { label: 'Experienced', years: '3-7', minK: 540, maxK: 620 },
      { label: 'Specialist (intensiv/anestesi)', years: '8-15', minK: 620, maxK: 750 },
      { label: 'Section leader / Advanced', years: '15+', minK: 700, maxK: 850 },
    ],
    nationalMedianK: NATIONAL_MEDIAN_K,
  },
  'software-developer': {
    steps: [
      { label: 'Junior developer', years: '0-2', minK: 500, maxK: 600 },
      { label: 'Mid-level', years: '3-5', minK: 650, maxK: 800 },
      { label: 'Senior developer', years: '6-10', minK: 800, maxK: 1000 },
      { label: 'Tech lead / Architect', years: '10+', minK: 950, maxK: 1300 },
    ],
    nationalMedianK: NATIONAL_MEDIAN_K,
  },
  'project-manager': {
    steps: [
      { label: 'Junior PM / Coordinator', years: '0-3', minK: 500, maxK: 620 },
      { label: 'Project Manager', years: '3-7', minK: 650, maxK: 850 },
      { label: 'Senior PM', years: '7-12', minK: 850, maxK: 1050 },
      { label: 'Programme Manager / Director', years: '12+', minK: 1000, maxK: 1300 },
    ],
    nationalMedianK: NATIONAL_MEDIAN_K,
  },
  lawyer: {
    steps: [
      { label: 'Fullmektig (trainee)', years: '0-2', minK: 550, maxK: 700 },
      { label: 'Advokat (associate)', years: '3-6', minK: 700, maxK: 950 },
      { label: 'Senior advokat', years: '7-12', minK: 900, maxK: 1200 },
      { label: 'Partner / Equity', years: '12+', minK: 1200, maxK: 2500 },
    ],
    nationalMedianK: NATIONAL_MEDIAN_K,
    note: 'Partner earnings vary enormously by firm size and type.',
  },
  engineer: {
    steps: [
      { label: 'Junior engineer', years: '0-3', minK: 550, maxK: 650 },
      { label: 'Engineer', years: '3-7', minK: 650, maxK: 800 },
      { label: 'Senior / Lead engineer', years: '8-15', minK: 800, maxK: 1000 },
      { label: 'Principal / Manager', years: '15+', minK: 950, maxK: 1200 },
    ],
    nationalMedianK: NATIONAL_MEDIAN_K,
  },
  accountant: {
    steps: [
      { label: 'Junior / Assistant', years: '0-2', minK: 450, maxK: 550 },
      { label: 'Regnskapsfører', years: '3-6', minK: 550, maxK: 700 },
      { label: 'Senior / Manager', years: '7-12', minK: 700, maxK: 900 },
      { label: 'Partner / CFO', years: '12+', minK: 900, maxK: 1400 },
    ],
    nationalMedianK: NATIONAL_MEDIAN_K,
  },
  teacher: {
    steps: [
      { label: 'Newly qualified', years: '0-3', minK: 480, maxK: 530 },
      { label: 'Experienced (adjunkt)', years: '4-10', minK: 530, maxK: 600 },
      { label: 'Lektor (master-qualified)', years: '5-15', minK: 570, maxK: 680 },
      { label: 'Senior / Department head', years: '15+', minK: 650, maxK: 780 },
    ],
    nationalMedianK: NATIONAL_MEDIAN_K,
    note: 'Lektor pay requires a 5-year master degree. Adjunkt is 4-year bachelor.',
  },
  psychologist: {
    steps: [
      { label: 'Turnuspsykolog (PTP)', years: '0-1', minK: 550, maxK: 620 },
      { label: 'Psykolog', years: '2-6', minK: 620, maxK: 750 },
      { label: 'Spesialist', years: '7-12', minK: 750, maxK: 900 },
      { label: 'Private practice / Leader', years: '12+', minK: 850, maxK: 1200 },
    ],
    nationalMedianK: NATIONAL_MEDIAN_K,
  },
  'data-analyst': {
    steps: [
      { label: 'Junior analyst', years: '0-2', minK: 480, maxK: 580 },
      { label: 'Data analyst', years: '3-5', minK: 600, maxK: 750 },
      { label: 'Senior / Lead analyst', years: '6-10', minK: 750, maxK: 900 },
      { label: 'Head of Data / Analytics Manager', years: '10+', minK: 900, maxK: 1150 },
    ],
    nationalMedianK: NATIONAL_MEDIAN_K,
  },
  architect: {
    steps: [
      { label: 'Intern / Junior architect', years: '0-3', minK: 450, maxK: 550 },
      { label: 'Architect', years: '4-8', minK: 550, maxK: 700 },
      { label: 'Senior / Project architect', years: '9-15', minK: 700, maxK: 850 },
      { label: 'Partner / Practice leader', years: '15+', minK: 800, maxK: 1100 },
    ],
    nationalMedianK: NATIONAL_MEDIAN_K,
  },
  designer: {
    steps: [
      { label: 'Junior designer', years: '0-2', minK: 430, maxK: 530 },
      { label: 'Designer', years: '3-5', minK: 550, maxK: 700 },
      { label: 'Senior / Lead designer', years: '6-10', minK: 700, maxK: 880 },
      { label: 'Design Director / Head of Design', years: '10+', minK: 850, maxK: 1100 },
    ],
    nationalMedianK: NATIONAL_MEDIAN_K,
  },
  chef: {
    steps: [
      { label: 'Commis / Lærling', years: '0-2', minK: 350, maxK: 420 },
      { label: 'Kokk (qualified)', years: '3-6', minK: 420, maxK: 520 },
      { label: 'Sous-chef', years: '7-12', minK: 500, maxK: 620 },
      { label: 'Head chef / Owner', years: '12+', minK: 550, maxK: 900 },
    ],
    nationalMedianK: NATIONAL_MEDIAN_K,
    note: 'Restaurant ownership can significantly exceed these ranges — or earn less.',
  },
};

// Aliases
const ALIASES: Record<string, string> = {
  'it-project-manager': 'project-manager',
  'telco-project-manager': 'project-manager',
  'mobile-developer': 'software-developer',
  'web-developer': 'software-developer',
  'frontend-developer': 'software-developer',
  'backend-developer': 'software-developer',
  'fullstack-developer': 'software-developer',
  'qa-engineer': 'software-developer',
  'ai-engineer': 'software-developer',
  'civil-engineer': 'engineer',
  'mechanical-engineer': 'engineer',
  'robotics-engineer': 'engineer',
  'it-engineer': 'engineer',
  'dentist': 'doctor',
};

export function getSalaryProgression(careerId: string): SalaryProgression | null {
  return SALARY_PROGRESSIONS[careerId]
    ?? SALARY_PROGRESSIONS[ALIASES[careerId] ?? '']
    ?? null;
}
