/**
 * Scenario Engine — generates realistic university→employer path
 * variations for the roadmap toggle.
 *
 * Given a career, produces 2-3 distinct scenarios, each with:
 *   - A specific university/programme
 *   - A specific employer or workplace
 *
 * The roadmap step titles are overlaid with these specifics so the
 * user can toggle between "Attend UiO" vs "Attend Charles University"
 * and "Apply at Oslo University Hospital" vs "Apply at Rikshospitalet".
 *
 * Data comes from the 3-layer education model (programmes.json) and
 * a small curated employer map per career sector.
 */

import {
  getProgrammesForCareer,
  getCareerRequirements,
  type ProgrammeWithInstitution,
  type CareerRequirements,
} from '@/lib/education';
import type { JourneyItem } from '@/lib/journey/career-journey-types';

// ── Types ───────────────────────────────────────────────────────────

export interface Scenario {
  id: number;
  label: string; // e.g. "Norwegian route" or "International route"
  university: { name: string; programme: string; city: string; country: string };
  employer: { name: string; role: string; city: string };
}

export interface ScenarioOverlay {
  /** Map of step index → overridden title suffix */
  stepOverrides: Map<number, string>;
}

// ── Employer data (curated per sector) ──────────────────────────────

const SECTOR_EMPLOYERS: Record<string, { name: string; role: string; city: string }[]> = {
  healthcare: [
    { name: 'Oslo University Hospital', role: 'Junior Doctor', city: 'Oslo' },
    { name: 'Haukeland University Hospital', role: 'Resident', city: 'Bergen' },
    { name: 'St. Olavs Hospital', role: 'Medical Officer', city: 'Trondheim' },
    { name: 'Karolinska University Hospital', role: 'Junior Doctor', city: 'Stockholm' },
    { name: 'Rigshospitalet', role: 'Clinical Trainee', city: 'Copenhagen' },
  ],
  technology: [
    { name: 'Equinor', role: 'Graduate Engineer', city: 'Stavanger' },
    { name: 'DNB', role: 'Junior Developer', city: 'Oslo' },
    { name: 'Telenor', role: 'Software Engineer', city: 'Oslo' },
    { name: 'Spotify', role: 'Backend Engineer', city: 'Stockholm' },
    { name: 'Cisco', role: 'Network Engineer', city: 'Oslo' },
    { name: 'Accenture', role: 'Technology Consultant', city: 'Oslo' },
  ],
  engineering: [
    { name: 'Aker Solutions', role: 'Graduate Engineer', city: 'Oslo' },
    { name: 'Equinor', role: 'Process Engineer', city: 'Stavanger' },
    { name: 'Multiconsult', role: 'Structural Engineer', city: 'Oslo' },
    { name: 'Rambøll', role: 'Civil Engineer', city: 'Copenhagen' },
    { name: 'Volvo Group', role: 'Mechanical Engineer', city: 'Gothenburg' },
  ],
  business: [
    { name: 'McKinsey & Company', role: 'Business Analyst', city: 'Oslo' },
    { name: 'PwC', role: 'Graduate Auditor', city: 'Oslo' },
    { name: 'Deloitte', role: 'Consultant', city: 'Oslo' },
    { name: 'Nordea', role: 'Financial Analyst', city: 'Stockholm' },
    { name: 'Schibsted', role: 'Business Analyst', city: 'Oslo' },
  ],
  law: [
    { name: 'Wikborg Rein', role: 'Trainee Lawyer', city: 'Oslo' },
    { name: 'Thommessen', role: 'Associate', city: 'Oslo' },
    { name: 'Schjødt', role: 'Trainee', city: 'Bergen' },
    { name: 'Regjeringsadvokaten', role: 'Government Lawyer', city: 'Oslo' },
  ],
  education: [
    { name: 'Oslo Kommune', role: 'Teacher', city: 'Oslo' },
    { name: 'Trondheim Kommune', role: 'Teacher', city: 'Trondheim' },
    { name: 'International School of Bergen', role: 'Teacher', city: 'Bergen' },
  ],
  creative: [
    { name: 'Snøhetta', role: 'Junior Architect', city: 'Oslo' },
    { name: 'BIG (Bjarke Ingels Group)', role: 'Architect', city: 'Copenhagen' },
    { name: 'Bleed Design', role: 'Designer', city: 'Oslo' },
    { name: 'Bekk', role: 'UX Designer', city: 'Oslo' },
  ],
  general: [
    { name: 'Norsk Hydro', role: 'Graduate', city: 'Oslo' },
    { name: 'Yara International', role: 'Trainee', city: 'Oslo' },
    { name: 'Telenor', role: 'Graduate', city: 'Oslo' },
    { name: 'DNB', role: 'Trainee', city: 'Oslo' },
  ],
};

function getSector(careerId: string): string {
  const id = careerId.toLowerCase();
  if (/doctor|nurse|surgeon|dentist|physio|vet|health|medic|pharma/.test(id)) return 'healthcare';
  if (/software|developer|data|it-|cyber|cloud|qa|devops|frontend|backend/.test(id)) return 'technology';
  if (/engineer|mechanical|civil|electrical|chemical/.test(id)) return 'engineering';
  if (/accountant|economist|finance|business|analyst|project|product/.test(id)) return 'business';
  if (/lawyer|legal|jurist/.test(id)) return 'law';
  if (/teacher|lecturer|professor/.test(id)) return 'education';
  if (/architect|designer|creative|artist|graphic/.test(id)) return 'creative';
  return 'general';
}

// ── Scenario generator ──────────────────────────────────────────────

export function generateScenarios(
  careerId: string,
  careerTitle: string,
): Scenario[] {
  const programmes = getProgrammesForCareer(careerId);
  const reqs = getCareerRequirements(careerId) || getCareerRequirements(careerTitle);
  const sector = getSector(careerId);
  const employers = SECTOR_EMPLOYERS[sector] ?? SECTOR_EMPLOYERS.general;

  // Split programmes into Norwegian vs international
  const noProgrammes = programmes.filter((p) => p.country === 'NO');
  const intlProgrammes = programmes.filter((p) => p.country !== 'NO');

  const scenarios: Scenario[] = [];

  // Scenario 1: Norwegian route
  const noProg = noProgrammes[0];
  const noEmployer = employers[0];
  if (noProg && noEmployer) {
    scenarios.push({
      id: 0,
      label: 'Norwegian route',
      university: {
        name: noProg.institution,
        programme: noProg.englishName,
        city: noProg.city,
        country: 'Norway',
      },
      employer: noEmployer,
    });
  }

  // Scenario 2: International route (or different Norwegian uni)
  const intlProg = intlProgrammes[0] ?? noProgrammes[1];
  const intlEmployer = employers[1] ?? employers[0];
  if (intlProg && intlEmployer) {
    scenarios.push({
      id: 1,
      label: intlProg.country === 'NO' ? 'Alternative Norwegian route' : `${intlProg.city} route`,
      university: {
        name: intlProg.institution,
        programme: intlProg.englishName,
        city: intlProg.city,
        country: intlProg.country === 'NO' ? 'Norway' : intlProg.country === 'SE' ? 'Sweden' : intlProg.country === 'DK' ? 'Denmark' : intlProg.country === 'FI' ? 'Finland' : intlProg.country,
      },
      employer: intlEmployer,
    });
  }

  // Scenario 3: if we have a third option
  const thirdProg = intlProgrammes[1] ?? noProgrammes[2];
  const thirdEmployer = employers[2];
  if (thirdProg && thirdEmployer && scenarios.length < 3) {
    scenarios.push({
      id: 2,
      label: thirdProg.country === 'NO' ? `${thirdProg.city} route` : `${thirdProg.city} route`,
      university: {
        name: thirdProg.institution,
        programme: thirdProg.englishName,
        city: thirdProg.city,
        country: thirdProg.country === 'NO' ? 'Norway' : thirdProg.country === 'SE' ? 'Sweden' : thirdProg.country === 'DK' ? 'Denmark' : thirdProg.country === 'FI' ? 'Finland' : thirdProg.country,
      },
      employer: thirdEmployer,
    });
  }

  // Fallback from career-requirements if no programmes available
  if (scenarios.length === 0 && reqs) {
    for (let i = 0; i < Math.min(reqs.universityPath.examples.length, 2); i++) {
      const emp = employers[i] ?? employers[0];
      if (emp) {
        scenarios.push({
          id: i,
          label: i === 0 ? 'Route A' : 'Route B',
          university: {
            name: reqs.universityPath.examples[i],
            programme: reqs.universityPath.programme,
            city: '',
            country: '',
          },
          employer: emp,
        });
      }
    }
  }

  return scenarios;
}

/**
 * Build step title overrides for a given scenario. Scans roadmap items
 * and appends university/employer names to relevant steps.
 */
export function buildScenarioOverlay(
  items: JourneyItem[],
  scenario: Scenario,
): ScenarioOverlay {
  const overrides = new Map<number, string>();

  for (let i = 0; i < items.length; i++) {
    const title = items[i].title.toLowerCase();

    // University steps
    if (/apply.*universit|begin.*universit|start.*degree|apply.*studi/i.test(title)) {
      overrides.set(i, `${items[i].title} at ${scenario.university.name}`);
    } else if (/complete.*graduation|graduate|earn.*degree|finish.*degree/i.test(title)) {
      overrides.set(i, `${items[i].title} from ${scenario.university.name}`);
    }

    // Job steps
    else if (/apply.*entry|apply.*role|apply.*job|apply.*intern/i.test(title)) {
      overrides.set(i, `${items[i].title} at ${scenario.employer.name}`);
    } else if (/accept.*entry|accept.*role|start.*first|begin.*first/i.test(title)) {
      overrides.set(i, `${items[i].title} at ${scenario.employer.name}, ${scenario.employer.city}`);
    }
  }

  return { stepOverrides: overrides };
}
