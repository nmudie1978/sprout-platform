/**
 * Application Deadlines — real Norwegian deadlines relevant to
 * each career path. Shown in Clarity tab to create urgency and
 * actionable awareness.
 */

export interface Deadline {
  title: string;
  /** When it opens/closes (month or specific date). */
  when: string;
  /** Months from now (1-12). Recalculated at render time. */
  monthIndex: number;
  description: string;
  url?: string;
  /** Which careers this applies to. Empty = universal. */
  careerIds: string[];
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// Static deadlines — recur annually
const ANNUAL_DEADLINES: Omit<Deadline, 'monthIndex'>[] = [
  {
    title: 'Samordna opptak — application opens',
    when: 'February 1',
    description: 'The national university admissions portal opens for applications. Apply for bachelor and integrated master programmes at all Norwegian universities.',
    url: 'https://www.samordnaopptak.no',
    careerIds: [], // universal for all university-bound careers
  },
  {
    title: 'Samordna opptak — application deadline',
    when: 'April 15',
    description: 'Deadline for the main application round (ordinær kvote). Late applications accepted until July 1 for remaining spots.',
    url: 'https://www.samordnaopptak.no',
    careerIds: [],
  },
  {
    title: 'Samordna opptak — first offers',
    when: 'July 20',
    description: 'First round of offers published. Accept or decline within the deadline to keep your spot.',
    url: 'https://www.samordnaopptak.no',
    careerIds: [],
  },
  {
    title: 'Politihøgskolen — application deadline',
    when: 'March 1',
    description: 'Police University College has an earlier deadline than Samordna opptak. Physical tests are scheduled after the written application.',
    url: 'https://www.politihogskolen.no',
    careerIds: ['police-officer'],
  },
  {
    title: 'Forsvaret — application period',
    when: 'January – March',
    description: 'Norwegian Armed Forces open applications for officer training (Krigsskolen, Sjøkrigsskolen, Luftkrigsskolen) and conscription service.',
    url: 'https://www.forsvaret.no',
    careerIds: ['soldier', 'military-officer'],
  },
  {
    title: 'Summer internship applications (tech/consulting)',
    when: 'September – November',
    description: 'Major Norwegian companies (Bekk, Bouvet, DNB, Equinor, Capgemini) recruit summer interns in the autumn. Apply early — most close by December.',
    careerIds: ['software-developer', 'project-manager', 'data-analyst', 'engineer', 'it-project-manager', 'it-engineer'],
  },
  {
    title: 'Lånekassen — autumn semester deadline',
    when: 'November 15',
    description: 'Deadline to apply for student loan/grant for the current autumn semester. Don\'t miss it — late applications may lose a month of support.',
    url: 'https://lanekassen.no',
    careerIds: [],
  },
  {
    title: 'Lånekassen — spring semester deadline',
    when: 'March 15',
    description: 'Deadline to apply for student loan/grant for the spring semester.',
    url: 'https://lanekassen.no',
    careerIds: [],
  },
  {
    title: 'Vigo.no — videregående application deadline',
    when: 'March 1',
    description: 'Application deadline for videregående skole (upper secondary) programmes. Applies to fagbrev/vocational routes.',
    url: 'https://www.vigo.no',
    careerIds: ['chef', 'electrician', 'carpenter', 'hairdresser', 'healthcare-worker', 'auto-mechanic'],
  },
];

/**
 * Get deadlines relevant to a career, sorted by how soon they are.
 * Universal deadlines (empty careerIds) are always included.
 */
export function getDeadlinesForCareer(careerId: string): Deadline[] {
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-indexed

  return ANNUAL_DEADLINES
    .filter((d) => d.careerIds.length === 0 || d.careerIds.includes(careerId))
    .map((d) => {
      // Parse month from "when" string
      const monthMatch = d.when.match(new RegExp(MONTH_NAMES.join('|'), 'i'));
      const deadlineMonth = monthMatch
        ? MONTH_NAMES.findIndex((m) => m.toLowerCase() === monthMatch[0].toLowerCase())
        : 0;
      // Months until this deadline (wraps around year)
      const monthsAway = (deadlineMonth - currentMonth + 12) % 12 || 12;
      return { ...d, monthIndex: monthsAway };
    })
    .sort((a, b) => a.monthIndex - b.monthIndex);
}
