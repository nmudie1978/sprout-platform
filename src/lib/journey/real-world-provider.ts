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
import { getPathTypeForCareer } from '@/lib/career-pathways';

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
 * In-role development steps — the user is ALREADY in the job and is
 * growing/refining/specialising within it. These steps must NOT
 * surface job-board links (user is employed) OR study-path links
 * (user is done with school). Instead they get courses +
 * certifications, which is what professional development in an
 * existing role actually looks like.
 *
 * Runs BEFORE every other override so career-stage "Gain experience"
 * steps don't fall through to `buildConnections('milestone')` →
 * `jobsFor + coursesFor` (which would show LinkedIn / Finn.no job
 * listings to someone who already has the job).
 */
function inRoleDevelopmentOverride(
  step: JourneyItem,
  career: string,
): RealWorldItem[] | null {
  const text = `${step.title} ${step.subtitle || ''} ${step.description || ''}`.toLowerCase();
  // Signals that the user is growing WITHIN their current role, not
  // looking for a new one. Intentionally narrow — false positives
  // here would pull job-application steps into courses-only mode.
  //
  //  - "gain experience" (professional experience, real experience…)
  //  - "grow in your role" / "grow in the role"
  //  - "refine your skills" / "refine X skills"
  //  - "continue to grow"
  //  - "take on (more) responsibilit(y|ies)"
  //  - "develop in your role" / "develop your X"
  //  - "experiment with" — creative-role development signal
  //  - "on-the-job" — explicit learning-while-working signal
  //  - "professional development" / "upskill" / "upskilling"
  const inRoleSignal =
    /\bgain(\s+professional)?\s+experience\b|\bgrow\s+in\s+(your|the)\s+role\b|\brefine\s+your\s+\w+\s+skills\b|\bcontinue\s+to\s+grow\b|\btake\s+on\s+(more|additional)\s+responsibilit/.test(
      text,
    ) ||
    /\bdevelop\s+in\s+(your|the)\s+role\b|\bon[-\s]the[-\s]job\b|\bprofessional\s+development\b|\bupskill(ing)?\b|\bexperiment\s+with\s+new\b/.test(
      text,
    );
  // Also catch explicit career-stage signals where the user is
  // established — but require the step to NOT be about applying to
  // anything (applying = job search = should still hit the job
  // boards via applyJobOverride).
  const isApplying = /\bapply\b|\bapplication\b|\bentry[-\s]level\b|\bfirst\s+job\b|\bgraduate\s+role\b|\bstep\s+up\s+to\s+a\s+senior\b/.test(
    text,
  );
  if (!inRoleSignal || isApplying) return null;
  // Return a curated mix of real professional-development resources:
  // two courses, two certifications. Four items, no jobs, no study
  // paths.
  return [
    ...coursesFor(career).slice(0, 2),
    ...certificationsFor(career).slice(0, 2),
  ];
}

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
  // Education keywords — generic terms that unambiguously mark a step
  // as being about schooling. Intentionally does NOT include
  // career-specific adjectives like "culinary", "medical", "legal",
  // "engineering" etc. — those are career names, not education
  // signals, and matching them would mis-route in-role development
  // steps ("Refine your culinary skills", "Take on medical cases")
  // to study paths.
  //
  // Multi-word school/programme patterns like "culinary school" or
  // "trade school" still match via the "\bschool\b" keyword.
  const isEducational = /\bschool\b|\bcollege\b|universit|bachelor|master|\bdegree\b|programme\b|program\b|studies\b|\bstudy\b|coursework|curriculum|\bacademy\b|\binstitute\b|enrol|enroll|admission|apprenticeship|fagbrev|vocational\b|\beducation\b|videreg[aå]ende|gymnasium/.test(
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

// ── Specialist career links ─────────────────────────────────────────
// Careers with dedicated application paths (ESA, Forsvaret, Politihøgskolen, etc.)
// where generic LinkedIn / utdanning.no / Coursera links are misleading.

function spaceCareerLinks(career: string): RealWorldItem[] {
  return [
    { kind: 'job', title: 'ESA Careers', descriptor: 'Current vacancies at the European Space Agency', url: 'https://jobs.esa.int/', cta: 'Browse' },
    { kind: 'job', title: 'NASA Career Opportunities', descriptor: 'Job openings across NASA centres', url: 'https://www.nasa.gov/careers/', cta: 'Browse' },
    { kind: 'university', title: `${career} programmes on utdanning.no`, descriptor: 'Norwegian university programmes in aerospace and space science', url: `https://utdanning.no/sok?q=${enc(career)}`, cta: 'Browse' },
    { kind: 'platform', title: 'Norsk Romsenter', descriptor: 'Norwegian Space Agency — programmes, grants, and partnerships', url: 'https://www.romsenter.no/', cta: 'View' },
  ];
}

function militaryCareerLinks(): RealWorldItem[] {
  return [
    { kind: 'job', title: 'Forsvaret — Karriere', descriptor: 'Norwegian Armed Forces careers and application portal', url: 'https://www.forsvaret.no/karriere', cta: 'Apply' },
    { kind: 'university', title: 'Krigsskolen', descriptor: 'Norwegian Military Academy — officer training', url: 'https://www.forsvaret.no/utdanning/krigsskolen', cta: 'View' },
    { kind: 'university', title: 'Sjøkrigsskolen', descriptor: 'Royal Norwegian Naval Academy', url: 'https://www.forsvaret.no/utdanning/sjokrigsskolen', cta: 'View' },
    { kind: 'university', title: 'Luftkrigsskolen', descriptor: 'Royal Norwegian Air Force Academy', url: 'https://www.forsvaret.no/utdanning/luftkrigsskolen', cta: 'View' },
  ];
}

function policeCareerLinks(): RealWorldItem[] {
  return [
    { kind: 'university', title: 'Politihøgskolen — Opptak', descriptor: 'Police University College — application and entry requirements', url: 'https://www.politihogskolen.no/opptak/', cta: 'Apply' },
    { kind: 'university', title: 'Politihøgskolen — Bachelor', descriptor: 'Three-year bachelor in police studies', url: 'https://www.politihogskolen.no/studietilbud/bachelor/', cta: 'View' },
    { kind: 'job', title: 'Politiet.no — Karriere', descriptor: 'Norwegian Police careers and vacancies', url: 'https://www.politiet.no/jobb-i-politiet/', cta: 'Browse' },
  ];
}

function firefighterCareerLinks(): RealWorldItem[] {
  return [
    { kind: 'university', title: 'Norges brannskole', descriptor: 'Norwegian Fire Academy — the required training programme', url: 'https://www.nbsk.no/', cta: 'View' },
    { kind: 'job', title: 'DSB — Brann og redning', descriptor: 'Directorate for Civil Protection — fire service info', url: 'https://www.dsb.no/lover/brannvern-brannvesen/', cta: 'View' },
    { kind: 'job', title: 'Fire service vacancies on Finn.no', descriptor: 'Current openings at Norwegian fire departments', url: 'https://www.finn.no/job/fulltime/search.html?q=brannkonstabel', cta: 'Browse' },
  ];
}

function eliteSportCareerLinks(career: string): RealWorldItem[] {
  return [
    { kind: 'platform', title: 'Olympiatoppen', descriptor: 'Norwegian Olympic and Paralympic Committee — elite sport programmes', url: 'https://www.olympiatoppen.no/', cta: 'View' },
    { kind: 'platform', title: 'Norges idrettsforbund', descriptor: 'Norwegian Sports Federation — talent development', url: 'https://www.idrettsforbundet.no/', cta: 'View' },
    { kind: 'university', title: `${career} on NTG`, descriptor: 'Norwegian Top Sport Gymnasium — sports-focused secondary education', url: 'https://www.ntg.no/', cta: 'View' },
  ];
}

/**
 * Override for specialist careers (space, military, police, firefighter,
 * elite sport). Returns dedicated links instead of generic
 * LinkedIn/utdanning.no/Coursera results.
 */
function specialistPathOverride(career: string): RealWorldItem[] | null {
  const pathType = getPathTypeForCareer(career);
  if (!pathType) return null;
  switch (pathType) {
    case 'space': return spaceCareerLinks(career);
    case 'military': return militaryCareerLinks();
    case 'police': return policeCareerLinks();
    case 'firefighter': return firefighterCareerLinks();
    case 'elite-sport': return eliteSportCareerLinks(career);
  }
}

export const mockRealWorldProvider: RealWorldProvider = {
  getConnections({ step, career }) {
    const cleaned = cleanCareer(career, step.title);
    // In-role development first — user is already in the job. Must
    // run BEFORE studyPathOnlyOverride so steps like "Refine your
    // culinary skills" / "Gain professional experience" don't get
    // mis-routed to study-path links via partial keyword matches.
    // Must also run before stepType classification so
    // career-stage milestones don't fall through to jobsFor + coursesFor.
    const inRoleOverride = inRoleDevelopmentOverride(step, cleaned);
    if (inRoleOverride) return inRoleOverride.slice(0, 5);
    // Specialist careers (space, military, police, etc.) with dedicated
    // application paths — override before generic education/job links.
    const specOverride = specialistPathOverride(cleaned);
    if (specOverride) return specOverride.slice(0, 5);
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
