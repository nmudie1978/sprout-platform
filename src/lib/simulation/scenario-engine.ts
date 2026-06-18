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
import { getCategoryForCareerByName, type CareerCategory } from '@/lib/career-pathways';
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
  military: [
    { name: 'Forsvaret', role: 'Officer Cadet', city: 'Oslo' },
    { name: 'Hæren (Norwegian Army)', role: 'Soldier', city: 'Bardufoss' },
    { name: 'Sjøforsvaret (Royal Norwegian Navy)', role: 'Naval Rating', city: 'Bergen' },
    { name: 'Heimevernet (Home Guard)', role: 'Guard', city: 'Oslo' },
  ],
  public_safety: [
    { name: 'Politiet (Norwegian Police)', role: 'Police Officer', city: 'Oslo' },
    { name: 'Brann- og redningsetaten', role: 'Firefighter', city: 'Oslo' },
    { name: 'Sivilforsvaret', role: 'Civil Defence Officer', city: 'Oslo' },
    { name: 'Kriminalomsorgen', role: 'Correctional Officer', city: 'Oslo' },
  ],
  social_care: [
    { name: 'Oslo Kommune', role: 'Social Worker', city: 'Oslo' },
    { name: 'Bufetat', role: 'Child Welfare Worker', city: 'Oslo' },
    { name: 'Frelsesarmeen (Salvation Army)', role: 'Support Worker', city: 'Oslo' },
    { name: 'Bergen Kommune', role: 'Care Worker', city: 'Bergen' },
  ],
  sport: [
    { name: 'Olympiatoppen', role: 'Coach', city: 'Oslo' },
    { name: 'Norges idrettsforbund', role: 'Sport Officer', city: 'Oslo' },
    { name: 'SATS', role: 'Personal Trainer', city: 'Oslo' },
    { name: 'Rosenborg BK', role: 'Sport Staff', city: 'Trondheim' },
  ],
  hospitality: [
    { name: 'Strawberry (Nordic Choice Hotels)', role: 'Hotel Trainee', city: 'Oslo' },
    { name: 'Scandic Hotels', role: 'Hospitality Associate', city: 'Oslo' },
    { name: 'Color Line', role: 'Hospitality Crew', city: 'Oslo' },
    { name: 'Maaemo', role: 'Commis Chef', city: 'Oslo' },
  ],
  logistics: [
    { name: 'Posten Bring', role: 'Logistics Trainee', city: 'Oslo' },
    { name: 'DB Schenker', role: 'Operations Coordinator', city: 'Oslo' },
    { name: 'PostNord', role: 'Logistics Associate', city: 'Oslo' },
    { name: 'DHL', role: 'Supply Chain Trainee', city: 'Oslo' },
  ],
  trades: [
    { name: 'Veidekke', role: 'Apprentice', city: 'Oslo' },
    { name: 'AF Gruppen', role: 'Trade Apprentice', city: 'Oslo' },
    { name: 'Skanska', role: 'Construction Trainee', city: 'Oslo' },
    { name: 'GK Gruppen', role: 'Technical Apprentice', city: 'Oslo' },
  ],
  real_estate: [
    { name: 'OBOS', role: 'Property Trainee', city: 'Oslo' },
    { name: 'DNB Eiendom', role: 'Estate Agent', city: 'Oslo' },
    { name: 'Olav Thon Gruppen', role: 'Property Associate', city: 'Oslo' },
  ],
  finance: [
    { name: 'DNB', role: 'Graduate Analyst', city: 'Oslo' },
    { name: 'Nordea', role: 'Financial Analyst', city: 'Oslo' },
    { name: 'Storebrand', role: 'Finance Trainee', city: 'Oslo' },
    { name: 'KLP', role: 'Investment Analyst', city: 'Oslo' },
  ],
  // Sector-neutral fallback — broad public/private employers that don't
  // imply a specific industry, so an unclassified career never lands on an
  // obviously-wrong company (this list is rarely hit now that the category
  // map covers every catalogue category).
  general: [
    { name: 'Oslo Kommune', role: 'Graduate Trainee', city: 'Oslo' },
    { name: 'Telenor', role: 'Graduate', city: 'Oslo' },
    { name: 'DNB', role: 'Trainee', city: 'Oslo' },
    { name: 'NAV', role: 'Adviser', city: 'Oslo' },
  ],
};

/**
 * Authoritative career-category → employer-sector map. Preferred over the
 * keyword heuristic because it's complete and deterministic — every category
 * in the catalogue resolves to a sensible employer list (e.g. a Soldier maps
 * to MILITARY_DEFENCE → Forsvaret, not the industrial general fallback).
 */
const CATEGORY_SECTOR: Partial<Record<CareerCategory, string>> = {
  HEALTHCARE_LIFE_SCIENCES: 'healthcare',
  EDUCATION_TRAINING: 'education',
  TECHNOLOGY_IT: 'technology',
  ARTIFICIAL_INTELLIGENCE: 'technology',
  TELECOMMUNICATIONS: 'technology',
  BUSINESS_MANAGEMENT: 'business',
  FINANCE_BANKING: 'finance',
  SALES_MARKETING: 'business',
  MANUFACTURING_ENGINEERING: 'engineering',
  LOGISTICS_TRANSPORT: 'logistics',
  HOSPITALITY_TOURISM: 'hospitality',
  CREATIVE_MEDIA: 'creative',
  PUBLIC_SERVICE_SAFETY: 'public_safety',
  MILITARY_DEFENCE: 'military',
  SPORT_FITNESS: 'sport',
  REAL_ESTATE_PROPERTY: 'real_estate',
  SOCIAL_CARE_COMMUNITY: 'social_care',
  CONSTRUCTION_TRADES: 'trades',
};

function getSector(careerId: string, careerTitle?: string): string {
  // Prefer the authoritative career category — complete and deterministic.
  // Resolve by id OR title: callers like the journey report pass the display
  // title ("Sniper") rather than the slug ("sniper"), and a strict id-only
  // lookup would miss it, fall through to the keyword heuristic, and (for
  // careers the heuristic doesn't recognise) land on the wrong `general`
  // employer pool — e.g. a Sniper getting "Telenor" as a first employer.
  const category =
    getCategoryForCareerByName(careerId) ??
    (careerTitle ? getCategoryForCareerByName(careerTitle) : undefined);
  if (category && CATEGORY_SECTOR[category]) return CATEGORY_SECTOR[category]!;

  // Fallback heuristic for careers not found in the catalogue. Match against
  // both the id and the title so free-text titles still classify.
  const id = `${careerId} ${careerTitle ?? ''}`.toLowerCase();
  if (/doctor|nurse|surgeon|dentist|physio|vet|health|medic|pharma/.test(id)) return 'healthcare';
  if (/software|developer|data|it-|cyber|cloud|qa|devops|frontend|backend/.test(id)) return 'technology';
  if (/engineer|mechanical|civil|electrical|chemical/.test(id)) return 'engineering';
  if (/soldier|military|army|navy|air ?force|defence|defense|forsvar|sniper|marksman|infantry|artillery|commando|special forces|paratroop|combat|reconnaissance|officer cadet|naval|gunner/.test(id)) return 'military';
  if (/police|firefighter|fire-|paramedic|security|rescue|prison/.test(id)) return 'public_safety';
  if (/social-worker|care-worker|youth-worker|counsellor|support-worker/.test(id)) return 'social_care';
  if (/coach|athlete|fitness|sport|trainer/.test(id)) return 'sport';
  if (/chef|hotel|hospitality|tourism|waiter|barista/.test(id)) return 'hospitality';
  if (/driver|logistics|warehouse|courier|transport|pilot/.test(id)) return 'logistics';
  if (/carpenter|electrician|plumber|builder|welder|mason|trade/.test(id)) return 'trades';
  if (/accountant|economist|finance|banking|invest/.test(id)) return 'finance';
  if (/business|analyst|project|product|consultant|marketing|sales/.test(id)) return 'business';
  if (/lawyer|legal|jurist/.test(id)) return 'law';
  if (/teacher|lecturer|professor/.test(id)) return 'education';
  if (/estate|property|realtor/.test(id)) return 'real_estate';
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
  const sector = getSector(careerId, careerTitle);
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
 * Build per-step annotations for a given scenario. Scans roadmap items
 * and returns a short "Institution · City" line for each step that
 * maps to a university or employer in the active scenario.
 *
 * The renderer shows this as a subtitle under the step title — the
 * title itself stays clean ("Apply for university studies") and the
 * scenario-specific detail ("Karolinska Institutet · Stockholm")
 * sits directly underneath.
 */
export function buildScenarioOverlay(
  items: JourneyItem[],
  scenario: Scenario,
): ScenarioOverlay {
  const overrides = new Map<number, string>();

  const universityLabel = `${scenario.university.name} \u00B7 ${scenario.university.city}`;
  const employerLabel = `${scenario.employer.name} \u00B7 ${scenario.employer.city}`;

  for (let i = 0; i < items.length; i++) {
    const title = items[i].title.toLowerCase();

    // Self-employment steps ("establish your own brand / business / studio")
    // name no employer — it's the user's own venture — so skip them entirely.
    if (/establish|own (brand|business|studio|practice|company|restaurant)|start (a|your own)|freelance|self-employ|go solo/i.test(title)) {
      continue;
    }

    // Map by the step's STAGE — the authoritative field — rather than by
    // matching keywords in the (free-text, AI-generated) title. Title regexes
    // silently left any step whose wording fell outside a fixed keyword set
    // unannotated, so a scenario only ever populated *some* steps. Stage is
    // always present, so every study/work step now gets named:
    //   • education / certification → the study institution
    //   • experience / career       → the employer
    //   • foundation                → left as-is (the user's current starting
    //     point, which predates any scenario destination).
    switch (items[i].stage) {
      case 'education':
      case 'certification':
        overrides.set(i, universityLabel);
        break;
      case 'experience':
      case 'career':
        overrides.set(i, employerLabel);
        break;
      // 'foundation' — no scenario institution applies.
    }
  }

  return { stepOverrides: overrides };
}
