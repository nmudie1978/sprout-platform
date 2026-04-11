/**
 * Real-World Connections Provider
 *
 * Connects abstract roadmap steps to real-world outcomes — universities,
 * courses, certifications, jobs, internships and platforms — so each
 * step in the My Journey roadmap is grounded in something the user can
 * actually click on and act on.
 *
 * The default implementation is a deterministic mock provider that
 * generates relevant search/landing URLs from the user's chosen career
 * and the type of step they're looking at. It is intentionally
 * structured behind a `RealWorldProvider` interface so it can later be
 * swapped for a live API integration (e.g. utdanning.no, Coursera API,
 * a real job board) without touching the UI.
 */

import { classifyStepType } from '@/lib/education/alignment';
import type { JourneyItem } from '@/lib/journey/career-journey-types';
import type { RoadmapStepType } from '@/lib/education/types';

// ── Data model ───────────────────────────────────────────────────────

export type RealWorldKind =
  | 'university'
  | 'course'
  | 'certification'
  | 'platform'
  | 'job'
  | 'internship'
  | 'volunteering';

export interface RealWorldItem {
  kind: RealWorldKind;
  title: string;
  descriptor: string;
  url: string;
  cta: 'View' | 'Apply' | 'Start' | 'Browse';
}

export interface RealWorldRequest {
  step: JourneyItem;
  career: string | null | undefined;
  /** Optional ISO country hint, e.g. "NO". Currently unused but plumbed
   *  through so a future provider can geo-localise results. */
  country?: string;
}

export interface RealWorldProvider {
  getConnections(req: RealWorldRequest): RealWorldItem[];
}

// ── Helpers ──────────────────────────────────────────────────────────

const enc = encodeURIComponent;

function cleanCareer(raw: string | null | undefined, fallback: string): string {
  const c = (raw || '').trim();
  if (!c) return fallback;
  // Strip "Entry-level X role" etc., similar to dialog logic.
  return c
    .replace(/^Entry[-\s]?level\s+/i, '')
    .replace(/^Senior\s+/i, '')
    .replace(/\s+role$/i, '')
    .trim() || fallback;
}

// ── Generators per kind ──────────────────────────────────────────────

function universitiesFor(career: string): RealWorldItem[] {
  return [
    {
      kind: 'university',
      title: `${career} programmes on utdanning.no`,
      descriptor: 'Norwegian higher-education search — courses, entry requirements, application portals',
      url: `https://utdanning.no/sok?q=${enc(career)}`,
      cta: 'Browse',
    },
    {
      kind: 'university',
      title: `${career} via Samordna opptak`,
      descriptor: 'Official application portal for Norwegian universities and colleges',
      url: `https://www.samordnaopptak.no/info/utdanning/`,
      cta: 'Apply',
    },
    {
      kind: 'university',
      title: `Bachelor & Master programmes — ${career}`,
      descriptor: 'Compare international universities offering degrees in this field',
      url: `https://www.bachelorsportal.com/search/bachelor/${enc(career)}`,
      cta: 'View',
    },
  ];
}

function coursesFor(career: string): RealWorldItem[] {
  return [
    {
      kind: 'course',
      title: `${career} courses on Coursera`,
      descriptor: 'Free and paid courses from leading universities and companies',
      url: `https://www.coursera.org/search?query=${enc(career)}`,
      cta: 'Start',
    },
    {
      kind: 'course',
      title: `${career} on edX`,
      descriptor: 'University-led online learning, including verified certificates',
      url: `https://www.edx.org/search?q=${enc(career)}`,
      cta: 'Start',
    },
    {
      kind: 'platform',
      title: `${career} learning paths on LinkedIn Learning`,
      descriptor: 'Structured skill paths with practice exercises',
      url: `https://www.linkedin.com/learning/search?keywords=${enc(career)}`,
      cta: 'Browse',
    },
  ];
}

function certificationsFor(career: string): RealWorldItem[] {
  return [
    {
      kind: 'certification',
      title: `${career} professional certificates`,
      descriptor: 'Recognised credentials you can earn online',
      url: `https://www.coursera.org/professional-certificates?query=${enc(career)}`,
      cta: 'Start',
    },
    {
      kind: 'certification',
      title: `${career} certifications on edX`,
      descriptor: 'Verified certificates from accredited institutions',
      url: `https://www.edx.org/search?q=${enc(career)}&tab=program`,
      cta: 'View',
    },
  ];
}

function jobsFor(career: string): RealWorldItem[] {
  return [
    {
      kind: 'job',
      title: `Entry-level ${career} jobs on LinkedIn`,
      descriptor: 'Real listings, filtered to entry-level roles',
      url: `https://www.linkedin.com/jobs/search/?keywords=${enc(career)}&f_E=2`,
      cta: 'View',
    },
    {
      kind: 'job',
      title: `${career} roles on Finn.no`,
      descriptor: "Norway's largest job board",
      url: `https://www.finn.no/job/fulltime/search.html?q=${enc(career)}`,
      cta: 'Browse',
    },
    {
      kind: 'job',
      title: `${career} jobs on Indeed`,
      descriptor: 'International listings with salary insights',
      url: `https://www.indeed.com/jobs?q=${enc(career)}&explvl=entry_level`,
      cta: 'View',
    },
  ];
}

function internshipsFor(career: string): RealWorldItem[] {
  return [
    {
      kind: 'internship',
      title: `${career} internships on LinkedIn`,
      descriptor: 'Internship listings filtered for this field',
      url: `https://www.linkedin.com/jobs/search/?keywords=${enc(career)}%20internship&f_JT=I`,
      cta: 'Apply',
    },
    {
      kind: 'internship',
      title: `${career} traineeships on Finn.no`,
      descriptor: 'Norwegian internships, traineeships and summer jobs',
      url: `https://www.finn.no/job/fulltime/search.html?q=${enc(career)}+praktikant`,
      cta: 'Browse',
    },
    {
      kind: 'volunteering',
      title: 'Frivillig.no — volunteer in this field',
      descriptor: 'Find Norwegian volunteer opportunities to build experience',
      url: `https://frivillig.no/sok?q=${enc(career)}`,
      cta: 'View',
    },
  ];
}

// ── Step type → connections ──────────────────────────────────────────

function buildConnections(stepType: RoadmapStepType, career: string): RealWorldItem[] {
  switch (stepType) {
    case 'school':
    case 'qualification': {
      const studyPathsLink: RealWorldItem = {
        kind: 'university',
        title: `Browse study paths for ${career}`,
        descriptor: 'Explore matching universities, programmes and alignment in-app',
        // Study Paths now lives only inside the Understand tab of
        // My Journey. The standalone /study-paths route was removed
        // during consolidation; deep-link via URL hash so the user
        // lands directly on the right tab.
        url: `/my-journey#understand`,
        cta: 'Browse',
      };
      return [studyPathsLink, ...universitiesFor(career).slice(0, 2), ...certificationsFor(career).slice(0, 1)];
    }
    case 'learning':
      return [...coursesFor(career), ...certificationsFor(career)].slice(0, 5);
    case 'real-world': {
      // Apply steps are the most action-critical moment in the roadmap
      // — so instead of dumping every internship/job link we curate a
      // small, mixed launchpad: one LinkedIn entry-level role, one
      // LinkedIn internship, one Norwegian programme route, one
      // certification route. Four items, four modes of action — enough
      // to guide without overloading.
      const internships = internshipsFor(career);
      const jobs = jobsFor(career);
      const unis = universitiesFor(career);
      const certs = certificationsFor(career);
      const linkedInJob = jobs.find((j) => j.url.includes('linkedin.com'));
      const linkedInInternship = internships.find((i) => i.url.includes('linkedin.com'));
      const utdanning = unis.find((u) => u.url.includes('utdanning.no'));
      return [
        linkedInJob,
        linkedInInternship,
        utdanning,
        certs[0],
      ].filter((x): x is RealWorldItem => !!x);
    }
    case 'milestone':
      return [...jobsFor(career), ...coursesFor(career)].slice(0, 4);
  }
}

// ── Default mock provider ────────────────────────────────────────────

/**
 * Education-focused steps — any step that mentions a school, college,
 * university, studies, programme, degree, apprenticeship, fagbrev etc.
 * — must surface *only* study-path links. A user looking at "Apply for
 * culinary school" or "Begin culinary studies" is researching schools,
 * not looking for a job, so dumping LinkedIn / Finn.no / Indeed / Coursera
 * into "Where to go next" is wrong regardless of step type classification.
 *
 * This override runs before every other override and before the
 * stepType-based switch, so it always wins when the step text is
 * clearly educational. In particular it defeats milestone-flagged
 * education steps that would otherwise route through the
 * jobsFor/coursesFor mix.
 */
function studyPathOnlyOverride(
  step: JourneyItem,
  career: string,
): RealWorldItem[] | null {
  const text = `${step.title} ${step.description || ''}`.toLowerCase();
  // Broad keyword set covering academic and vocational education.
  // The "study"/"studies" match is intentionally loose — any step
  // talking about studying should route here. Job-board noise ("job
  // shadowing at a school", etc.) is a theoretical false positive we
  // accept because the alternative (showing LinkedIn on an education
  // step) is the worse failure mode.
  const isEducational = /school|college|universit|bachelor|master|degree|programme|program\b|studies|study|coursework|curriculum|academy|institute|enrol|enroll|admission|apprenticeship|fagbrev|vocational|culinary|trade\s+school/.test(
    text,
  );
  if (!isEducational) return null;
  return [
    {
      kind: 'university',
      title: `Browse study paths for ${career}`,
      descriptor: 'Explore matching universities, programmes and alignment in-app',
      url: `/my-journey#understand`,
      cta: 'Browse',
    },
    ...universitiesFor(career).slice(0, 2),
    ...certificationsFor(career).slice(0, 1),
  ];
}

/**
 * Some step types want a *single-mode* list rather than the curated
 * multi-mode mix. The clearest example is "Apply for university studies"
 * — for that step, every link should be a university search, not a
 * grab-bag of jobs and courses. Detect those overrides up front so the
 * stepType-based switch doesn't have to know about every special case.
 *
 * Note: the broader studyPathOnlyOverride above also handles this case
 * now, and runs first. This override remains as a secondary safety net
 * for edge-case phrasings not caught by the broad educational regex.
 */
function universityApplicationOverride(
  step: JourneyItem,
  career: string,
): RealWorldItem[] | null {
  const text = `${step.title} ${step.description || ''}`.toLowerCase();
  const isUniversity = /universit|bachelor|master|samordna|utdanning/.test(text);
  const isApplication = /apply|application|enrol|enroll|admiss/.test(text);
  if (!isUniversity || !isApplication) return null;
  // Lead with in-app Study Paths browser, then external fallbacks.
  // Study Paths now lives only in the Understand tab of My Journey;
  // deep-link there via URL hash.
  return [
    {
      kind: 'university',
      title: `Browse study paths for ${career}`,
      descriptor: 'Explore matching universities, programmes and alignment in-app',
      url: `/my-journey#understand`,
      cta: 'Browse',
    },
    ...universitiesFor(career).slice(0, 2),
  ];
}

/**
 * Internship / entry-level apply steps must stay job-search-only.
 * Coursera and other learning platforms are irrelevant here — the user
 * is ready to apply, not study. We override before stepType
 * classification so milestone/real-world both route the same way.
 */
function applyJobOverride(
  step: JourneyItem,
  career: string,
): RealWorldItem[] | null {
  const text = `${step.title} ${step.description || ''}`.toLowerCase();
  const isInternship = /intern|placement|traineeship|praktikant/.test(text);
  const isEntryRole = /entry[-\s]?level|first\s+job|graduate\s+role/.test(text);
  const isApplication = /apply|application/.test(text);
  if (!(isApplication && (isInternship || isEntryRole))) return null;
  return isInternship
    ? [...internshipsFor(career), ...jobsFor(career)].slice(0, 4)
    : [...jobsFor(career), ...internshipsFor(career)].slice(0, 4);
}

export const mockRealWorldProvider: RealWorldProvider = {
  getConnections({ step, career }) {
    const cleaned = cleanCareer(career, step.title);
    // Education-first: any step mentioning school/college/university/
    // studies/etc. gets ONLY study-path links. Runs before every other
    // override so milestone-flagged education steps and "Apply for
    // {culinary} school" steps can't leak into the job-board branches.
    const studyOverride = studyPathOnlyOverride(step, cleaned);
    if (studyOverride) return studyOverride.slice(0, 5);
    const uniOverride = universityApplicationOverride(step, cleaned);
    if (uniOverride) return uniOverride.slice(0, 5);
    const jobOverride = applyJobOverride(step, cleaned);
    if (jobOverride) return jobOverride;
    const stepType = classifyStepType(step);
    const items = buildConnections(stepType, cleaned);
    // Hard cap at 5 — never overwhelm the panel.
    return items.slice(0, 5);
  },
};

// Convenience helper used by the dialog so callers don't have to know
// about provider construction.
export function getRealWorldConnections(req: RealWorldRequest): RealWorldItem[] {
  return mockRealWorldProvider.getConnections(req);
}
