/**
 * Anonymised Career Path Examples
 *
 * Realistic career journeys based on typical Norwegian career patterns.
 * Not tied to any real individual — crafted from common progression data.
 * Each career has 2 examples showing different routes to the same role.
 */

export interface CareerPathStep {
  age: number;
  label: string;
}

export interface CareerPathExample {
  name: string;        // e.g. "Ingrid S."
  title: string;       // e.g. "Doctor — Oslo"
  currentAge: number;
  location: string;
  steps: CareerPathStep[];
}

export interface CareerPathExamples {
  careerId: string;
  examples: CareerPathExample[];
}

const CAREER_PATHS: Record<string, CareerPathExamples> = {
  'doctor': {
    careerId: 'doctor',
    examples: [
      {
        name: 'Ingrid S.',
        title: 'Doctor — Oslo',
        currentAge: 35,
        location: 'Oslo',
        steps: [
          { age: 16, label: 'Videregående — realfag (sciences)' },
          { age: 19, label: 'Medisin at UiO (6 years)' },
          { age: 25, label: 'LIS1 internship — Drammen sykehus' },
          { age: 27, label: 'LIS2/3 specialisation — internal medicine' },
          { age: 32, label: 'Specialist in internal medicine' },
          { age: 35, label: 'Senior doctor, Oslo University Hospital' },
        ],
      },
      {
        name: 'Lars M.',
        title: 'Doctor — Bergen',
        currentAge: 31,
        location: 'Bergen',
        steps: [
          { age: 16, label: 'Videregående — realfag' },
          { age: 19, label: 'Medisin at UiB (6 years)' },
          { age: 25, label: 'LIS1 internship — Haukeland' },
          { age: 27, label: 'General practice (fastlege)' },
          { age: 31, label: 'Fastlege with own patient list, Bergen' },
        ],
      },
    ],
  },
  'nurse': {
    careerId: 'nurse',
    examples: [
      {
        name: 'Emilie K.',
        title: 'Nurse — Trondheim',
        currentAge: 28,
        location: 'Trondheim',
        steps: [
          { age: 16, label: 'Videregående — helse- og oppvekstfag' },
          { age: 19, label: 'Sykepleie at NTNU (3 years)' },
          { age: 22, label: 'Nurse, medical ward — St. Olavs Hospital' },
          { age: 25, label: 'Specialisation in intensive care nursing' },
          { age: 28, label: 'Intensive care nurse, St. Olavs' },
        ],
      },
      {
        name: 'Kristian H.',
        title: 'Nurse — Oslo',
        currentAge: 26,
        location: 'Oslo',
        steps: [
          { age: 16, label: 'Videregående — studiespesialisering' },
          { age: 19, label: 'Sykepleie at OsloMet (3 years)' },
          { age: 22, label: 'Nurse, emergency department — Ullevål' },
          { age: 26, label: 'Senior nurse + mentoring students' },
        ],
      },
    ],
  },
  'psychologist': {
    careerId: 'psychologist',
    examples: [
      {
        name: 'Nora B.',
        title: 'Psychologist — Oslo',
        currentAge: 32,
        location: 'Oslo',
        steps: [
          { age: 16, label: 'Videregående — studiespesialisering' },
          { age: 19, label: 'Psykologi profesjonsstudium at UiO (6 years)' },
          { age: 25, label: 'Clinical psychologist — DPS (community mental health)' },
          { age: 28, label: 'Specialist training in clinical psychology' },
          { age: 32, label: 'Specialist psychologist, private practice' },
        ],
      },
      {
        name: 'Henrik J.',
        title: 'Psychologist — Tromsø',
        currentAge: 29,
        location: 'Tromsø',
        steps: [
          { age: 16, label: 'Videregående — realfag' },
          { age: 19, label: 'Psykologi profesjonsstudium at UiT (6 years)' },
          { age: 25, label: 'Psychologist — child & adolescent (BUP)' },
          { age: 29, label: 'Senior psychologist, BUP Nord' },
        ],
      },
    ],
  },
  'software-developer': {
    careerId: 'software-developer',
    examples: [
      {
        name: 'Sander L.',
        title: 'Software Developer — Oslo',
        currentAge: 27,
        location: 'Oslo',
        steps: [
          { age: 16, label: 'Videregående — studiespesialisering + IT' },
          { age: 19, label: 'Informatikk bachelor at UiO (3 years)' },
          { age: 22, label: 'Junior developer — Bekk Consulting' },
          { age: 24, label: 'Developer — DNB (banking)' },
          { age: 27, label: 'Senior developer, full-stack' },
        ],
      },
      {
        name: 'Maja R.',
        title: 'Software Developer — Trondheim',
        currentAge: 29,
        location: 'Trondheim',
        steps: [
          { age: 16, label: 'Videregående — realfag' },
          { age: 19, label: 'Datateknologi sivilingeniør at NTNU (5 years)' },
          { age: 24, label: 'Graduate developer — Cognite' },
          { age: 26, label: 'Backend engineer — Spotify (remote from Trondheim)' },
          { age: 29, label: 'Tech lead, platform team' },
        ],
      },
    ],
  },
  'engineer': {
    careerId: 'engineer',
    examples: [
      {
        name: 'Erik T.',
        title: 'Mechanical Engineer — Stavanger',
        currentAge: 34,
        location: 'Stavanger',
        steps: [
          { age: 16, label: 'Videregående — realfag' },
          { age: 19, label: 'Sivilingeniør maskin at NTNU (5 years)' },
          { age: 24, label: 'Graduate engineer — Aker Solutions' },
          { age: 27, label: 'Mechanical engineer — Equinor' },
          { age: 31, label: 'Senior engineer, subsea systems' },
          { age: 34, label: 'Lead engineer, offshore wind' },
        ],
      },
      {
        name: 'Silje A.',
        title: 'Civil Engineer — Bergen',
        currentAge: 30,
        location: 'Bergen',
        steps: [
          { age: 16, label: 'Videregående — realfag' },
          { age: 19, label: 'Ingeniørfag bygg at HVL (3 years)' },
          { age: 22, label: 'Site engineer — Veidekke' },
          { age: 25, label: 'Master in structural engineering at NTNU (2 years)' },
          { age: 27, label: 'Structural engineer — Multiconsult' },
          { age: 30, label: 'Project engineer, infrastructure' },
        ],
      },
    ],
  },
  'teacher': {
    careerId: 'teacher',
    examples: [
      {
        name: 'Thea N.',
        title: 'Primary Teacher — Oslo',
        currentAge: 29,
        location: 'Oslo',
        steps: [
          { age: 16, label: 'Videregående — studiespesialisering' },
          { age: 19, label: 'Grunnskolelærer 1-7 at OsloMet (5 years)' },
          { age: 24, label: 'Teacher, Tøyen skole — Oslo' },
          { age: 27, label: 'Year group leader + maths coordinator' },
          { age: 29, label: 'Mentor for new teachers' },
        ],
      },
      {
        name: 'Jonas F.',
        title: 'Upper Secondary Teacher — Trondheim',
        currentAge: 32,
        location: 'Trondheim',
        steps: [
          { age: 16, label: 'Videregående — realfag' },
          { age: 19, label: 'Lektorutdanning (physics) at NTNU (5 years)' },
          { age: 24, label: 'Physics teacher — Trondheim katedralskole' },
          { age: 28, label: 'Department head, science' },
          { age: 32, label: 'Pedagogy advisor + exam coordinator' },
        ],
      },
    ],
  },
  'accountant': {
    careerId: 'accountant',
    examples: [
      {
        name: 'Marte V.',
        title: 'Accountant — Oslo',
        currentAge: 30,
        location: 'Oslo',
        steps: [
          { age: 16, label: 'Videregående — studiespesialisering' },
          { age: 19, label: 'Regnskap og revisjon at OsloMet (3 years)' },
          { age: 22, label: 'Junior accountant — BDO' },
          { age: 24, label: 'Authorised regnskapsfører (after 2 years practice)' },
          { age: 27, label: 'Senior accountant — KPMG' },
          { age: 30, label: 'Manager, accounting advisory' },
        ],
      },
      {
        name: 'Ole K.',
        title: 'Accountant — Bergen',
        currentAge: 28,
        location: 'Bergen',
        steps: [
          { age: 16, label: 'Videregående — studiespesialisering' },
          { age: 19, label: 'Økonomi og administrasjon at NHH (3 years)' },
          { age: 22, label: 'Graduate trainee — PwC' },
          { age: 24, label: 'Regnskapsfører authorisation' },
          { age: 28, label: 'Independent regnskapsfører, own clients' },
        ],
      },
    ],
  },
  'lawyer': {
    careerId: 'lawyer',
    examples: [
      {
        name: 'Hanna G.',
        title: 'Lawyer — Oslo',
        currentAge: 33,
        location: 'Oslo',
        steps: [
          { age: 16, label: 'Videregående — studiespesialisering' },
          { age: 19, label: 'Rettsvitenskap at UiO (5 years)' },
          { age: 24, label: 'Trainee lawyer (advokatfullmektig) — Wiersholm' },
          { age: 26, label: 'Advokatbevilling granted' },
          { age: 28, label: 'Associate, corporate law' },
          { age: 33, label: 'Senior associate, M&A practice' },
        ],
      },
      {
        name: 'Andreas D.',
        title: 'Lawyer — Bergen',
        currentAge: 30,
        location: 'Bergen',
        steps: [
          { age: 16, label: 'Videregående — studiespesialisering' },
          { age: 19, label: 'Rettsvitenskap at UiB (5 years)' },
          { age: 24, label: 'Advokatfullmektig — public sector (NAV)' },
          { age: 26, label: 'Advokatbevilling' },
          { age: 30, label: 'Advokat, family and immigration law' },
        ],
      },
    ],
  },
  'healthcare-worker': {
    careerId: 'healthcare-worker',
    examples: [
      {
        name: 'Fatima A.',
        title: 'Healthcare Worker — Drammen',
        currentAge: 24,
        location: 'Drammen',
        steps: [
          { age: 16, label: 'Videregående — helse- og oppvekstfag (2 years)' },
          { age: 18, label: 'Apprenticeship at sykehjem (2 years)' },
          { age: 20, label: 'Fagbrev as helsefagarbeider' },
          { age: 20, label: 'Helsefagarbeider — Drammen sykehjem' },
          { age: 24, label: 'Night shift leader + mentoring apprentices' },
        ],
      },
      {
        name: 'Markus E.',
        title: 'Healthcare Worker → Nurse — Oslo',
        currentAge: 27,
        location: 'Oslo',
        steps: [
          { age: 16, label: 'Videregående — helse- og oppvekstfag' },
          { age: 18, label: 'Apprenticeship — hjemmesykepleie' },
          { age: 20, label: 'Fagbrev + worked as helsefagarbeider (3 years)' },
          { age: 23, label: 'Sykepleie bachelor at OsloMet (3 years)' },
          { age: 27, label: 'Registered nurse — Ahus' },
        ],
      },
    ],
  },
  'physiotherapist': {
    careerId: 'physiotherapist',
    examples: [
      {
        name: 'Ida W.',
        title: 'Physiotherapist — Oslo',
        currentAge: 28,
        location: 'Oslo',
        steps: [
          { age: 16, label: 'Videregående — realfag' },
          { age: 19, label: 'Fysioterapi at OsloMet (3 years)' },
          { age: 22, label: 'Physiotherapist — rehabilitation centre' },
          { age: 25, label: 'Master in sports physiotherapy' },
          { age: 28, label: 'Sports physio — Olympiatoppen' },
        ],
      },
      {
        name: 'Tobias P.',
        title: 'Physiotherapist — Tromsø',
        currentAge: 26,
        location: 'Tromsø',
        steps: [
          { age: 16, label: 'Videregående — idrettsfag (sports)' },
          { age: 19, label: 'Fysioterapi at UiT (3 years)' },
          { age: 22, label: 'Community physiotherapist — Tromsø kommune' },
          { age: 26, label: 'Senior physio + own patient list' },
        ],
      },
    ],
  },
  'data-analyst': {
    careerId: 'data-analyst',
    examples: [
      {
        name: 'Linnea S.',
        title: 'Data Analyst — Oslo',
        currentAge: 26,
        location: 'Oslo',
        steps: [
          { age: 16, label: 'Videregående — realfag' },
          { age: 19, label: 'Statistikk og datavitenskap at UiO (3 years)' },
          { age: 22, label: 'Junior analyst — Schibsted' },
          { age: 24, label: 'Data analyst — Vipps' },
          { age: 26, label: 'Senior data analyst, product insights' },
        ],
      },
      {
        name: 'Oscar H.',
        title: 'Data Analyst — Trondheim',
        currentAge: 28,
        location: 'Trondheim',
        steps: [
          { age: 16, label: 'Videregående — realfag' },
          { age: 19, label: 'Industriell økonomi at NTNU (5 years)' },
          { age: 24, label: 'Business analyst — Telenor' },
          { age: 26, label: 'Data analyst — Statkraft' },
          { age: 28, label: 'Lead analyst, energy markets' },
        ],
      },
    ],
  },
};

export function getCareerPathExamples(careerId: string, careerTitle: string): CareerPathExample[] {
  if (CAREER_PATHS[careerId]) return CAREER_PATHS[careerId].examples;

  const titleLower = careerTitle.toLowerCase();
  for (const [key, value] of Object.entries(CAREER_PATHS)) {
    if (titleLower.includes(key.replace('-', ' ')) || titleLower.includes(key)) {
      return value.examples;
    }
  }

  return [];
}
