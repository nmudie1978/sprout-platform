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
          { age: 16, label: 'Upper secondary — sciences' },
          { age: 19, label: 'Medicine at UiO (6 years)' },
          { age: 25, label: 'Junior doctor internship — Drammen hospital' },
          { age: 27, label: 'Specialist training — internal medicine' },
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
          { age: 16, label: 'Upper secondary — sciences' },
          { age: 19, label: 'Medicine at UiB (6 years)' },
          { age: 25, label: 'Junior doctor internship — Haukeland' },
          { age: 27, label: 'General practice (GP)' },
          { age: 31, label: 'GP with own patient list, Bergen' },
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
          { age: 16, label: 'Upper secondary — health & social care' },
          { age: 19, label: 'Nursing at NTNU (3 years)' },
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
          { age: 16, label: 'Upper secondary — general studies' },
          { age: 19, label: 'Nursing at OsloMet (3 years)' },
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
          { age: 16, label: 'Upper secondary — general studies' },
          { age: 19, label: 'Psychology professional programme at UiO (6 years)' },
          { age: 25, label: 'Clinical psychologist — community mental health centre' },
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
          { age: 16, label: 'Upper secondary — sciences' },
          { age: 19, label: 'Psychology professional programme at UiT (6 years)' },
          { age: 25, label: 'Psychologist — child & adolescent mental health' },
          { age: 29, label: 'Senior psychologist, child & adolescent service (north)' },
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
          { age: 16, label: 'Upper secondary — general studies + IT' },
          { age: 19, label: 'Computer science bachelor at UiO (3 years)' },
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
          { age: 16, label: 'Upper secondary — sciences' },
          { age: 19, label: 'Computer engineering MSc at NTNU (5 years)' },
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
          { age: 16, label: 'Upper secondary — sciences' },
          { age: 19, label: 'Mechanical engineering MSc at NTNU (5 years)' },
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
          { age: 16, label: 'Upper secondary — sciences' },
          { age: 19, label: 'Civil engineering at HVL (3 years)' },
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
          { age: 16, label: 'Upper secondary — general studies' },
          { age: 19, label: 'Primary teacher training (grades 1–7) at OsloMet (5 years)' },
          { age: 24, label: 'Teacher, Tøyen primary school — Oslo' },
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
          { age: 16, label: 'Upper secondary — sciences' },
          { age: 19, label: 'Secondary teacher training (physics) at NTNU (5 years)' },
          { age: 24, label: 'Physics teacher — Trondheim Cathedral School' },
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
          { age: 16, label: 'Upper secondary — general studies' },
          { age: 19, label: 'Accounting & auditing at OsloMet (3 years)' },
          { age: 22, label: 'Junior accountant — BDO' },
          { age: 24, label: 'Authorised accountant (after 2 years practice)' },
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
          { age: 16, label: 'Upper secondary — general studies' },
          { age: 19, label: 'Business & administration at NHH (3 years)' },
          { age: 22, label: 'Graduate trainee — PwC' },
          { age: 24, label: 'Accountant authorisation' },
          { age: 28, label: 'Independent accountant, own clients' },
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
          { age: 16, label: 'Upper secondary — general studies' },
          { age: 19, label: 'Law at UiO (5 years)' },
          { age: 24, label: 'Trainee lawyer — Wiersholm' },
          { age: 26, label: 'Lawyer licence granted' },
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
          { age: 16, label: 'Upper secondary — general studies' },
          { age: 19, label: 'Law at UiB (5 years)' },
          { age: 24, label: 'Trainee lawyer — public sector (welfare agency)' },
          { age: 26, label: 'Lawyer licence' },
          { age: 30, label: 'Lawyer, family and immigration law' },
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
          { age: 16, label: 'Upper secondary — health & social care (2 years)' },
          { age: 18, label: 'Apprenticeship at care home (2 years)' },
          { age: 20, label: 'Vocational certificate as healthcare worker' },
          { age: 20, label: 'Healthcare worker — Drammen care home' },
          { age: 24, label: 'Night shift leader + mentoring apprentices' },
        ],
      },
      {
        name: 'Markus E.',
        title: 'Healthcare Worker → Nurse — Oslo',
        currentAge: 27,
        location: 'Oslo',
        steps: [
          { age: 16, label: 'Upper secondary — health & social care' },
          { age: 18, label: 'Apprenticeship — home nursing' },
          { age: 20, label: 'Vocational certificate + worked as healthcare worker (3 years)' },
          { age: 23, label: 'Nursing bachelor at OsloMet (3 years)' },
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
          { age: 16, label: 'Upper secondary — sciences' },
          { age: 19, label: 'Physiotherapy at OsloMet (3 years)' },
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
          { age: 16, label: 'Upper secondary — sports studies' },
          { age: 19, label: 'Physiotherapy at UiT (3 years)' },
          { age: 22, label: 'Community physiotherapist — Tromsø municipality' },
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
          { age: 16, label: 'Upper secondary — sciences' },
          { age: 19, label: 'Statistics & data science at UiO (3 years)' },
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
          { age: 16, label: 'Upper secondary — sciences' },
          { age: 19, label: 'Industrial economics at NTNU (5 years)' },
          { age: 24, label: 'Business analyst — Telenor' },
          { age: 26, label: 'Data analyst — Statkraft' },
          { age: 28, label: 'Lead analyst, energy markets' },
        ],
      },
    ],
  },
  'it-project-manager': {
    careerId: 'it-project-manager',
    examples: [
      {
        name: 'Kamil W.',
        title: 'IT Project Manager — Oslo',
        currentAge: 33,
        location: 'Oslo',
        steps: [
          { age: 16, label: 'Upper secondary — sciences + IT' },
          { age: 19, label: 'Computer science bachelor at UiO (3 years)' },
          { age: 22, label: 'Junior developer — Sopra Steria' },
          { age: 25, label: 'PRINCE2 certification' },
          { age: 26, label: 'IT team lead — Telenor' },
          { age: 29, label: 'IT Project Manager — DNB' },
          { age: 33, label: 'Senior Project Manager, digital transformation' },
        ],
      },
      {
        name: 'Astrid B.',
        title: 'IT Project Manager — Bergen',
        currentAge: 30,
        location: 'Bergen',
        steps: [
          { age: 16, label: 'Upper secondary — general studies' },
          { age: 19, label: 'Business & administration at NHH (3 years)' },
          { age: 22, label: 'Business analyst — Accenture' },
          { age: 24, label: 'Scrum Master certification' },
          { age: 26, label: 'Agile project manager — Eviny' },
          { age: 30, label: 'IT Project Manager, cloud migration' },
        ],
      },
    ],
  },
  'programme-manager': {
    careerId: 'programme-manager',
    examples: [
      {
        name: 'Nicky M.',
        title: 'Programme Manager — Oslo',
        currentAge: 42,
        location: 'Oslo',
        steps: [
          { age: 16, label: 'Upper secondary — sciences' },
          { age: 19, label: 'Engineering degree (4 years)' },
          { age: 23, label: 'Network engineer — Ericsson' },
          { age: 27, label: 'PRINCE2 + PMP certifications' },
          { age: 28, label: 'Project manager — Telenor' },
          { age: 33, label: 'Senior project manager — multiple programmes' },
          { age: 37, label: 'MSP certification' },
          { age: 38, label: 'Programme manager — Telenor' },
          { age: 42, label: 'Head of Programme Management, digital transformation' },
        ],
      },
      {
        name: 'Saghi K.',
        title: 'Programme Manager — Oslo',
        currentAge: 38,
        location: 'Oslo',
        steps: [
          { age: 16, label: 'Upper secondary — general studies' },
          { age: 19, label: 'Psychology degree at UiO (6 years)' },
          { age: 25, label: 'Clinical psychologist — community mental health centre' },
          { age: 28, label: 'Team lead, psychology department' },
          { age: 31, label: 'Programme coordinator — health services' },
          { age: 35, label: 'MSP + change management certification' },
          { age: 38, label: 'Programme manager — health sector transformation' },
        ],
      },
    ],
  },
  'cybersecurity': {
    careerId: 'cybersecurity',
    examples: [
      {
        name: 'Viktor L.',
        title: 'Cybersecurity Analyst — Oslo',
        currentAge: 27,
        location: 'Oslo',
        steps: [
          { age: 16, label: 'Upper secondary — IT + sciences' },
          { age: 19, label: 'Computer science bachelor at NTNU (3 years)' },
          { age: 22, label: 'CompTIA Security+ certification' },
          { age: 22, label: 'SOC analyst — Mnemonic' },
          { age: 25, label: 'CEH certification' },
          { age: 27, label: 'Senior security analyst — Equinor' },
        ],
      },
      {
        name: 'Runa S.',
        title: 'Security Engineer — Trondheim',
        currentAge: 29,
        location: 'Trondheim',
        steps: [
          { age: 16, label: 'Upper secondary — sciences' },
          { age: 19, label: 'Computer engineering MSc at NTNU (5 years)' },
          { age: 24, label: 'Developer — Telenor' },
          { age: 26, label: 'OSCP certification' },
          { age: 27, label: 'Penetration tester — NorSIS' },
          { age: 29, label: 'Security engineer — Statkraft' },
        ],
      },
    ],
  },
  'police-officer': {
    careerId: 'police-officer',
    examples: [
      {
        name: 'Thomas A.',
        title: 'Police Officer — Oslo',
        currentAge: 28,
        location: 'Oslo',
        steps: [
          { age: 16, label: 'Upper secondary — general studies' },
          { age: 19, label: 'Police University College bachelor (3 years)' },
          { age: 22, label: 'Police officer — patrol division, Oslo' },
          { age: 25, label: 'Specialisation in investigation' },
          { age: 28, label: 'Detective — Oslo police district' },
        ],
      },
      {
        name: 'Maria L.',
        title: 'Police Officer — Tromsø',
        currentAge: 26,
        location: 'Tromsø',
        steps: [
          { age: 16, label: 'Upper secondary — sports studies' },
          { age: 19, label: 'Police University College bachelor, Bodø (3 years)' },
          { age: 22, label: 'Police officer — patrol, Troms police district' },
          { age: 26, label: 'Senior police officer + field training officer' },
        ],
      },
    ],
  },
  'airline-pilot': {
    careerId: 'airline-pilot',
    examples: [
      {
        name: 'Christian F.',
        title: 'Airline Pilot — Oslo',
        currentAge: 30,
        location: 'Oslo',
        steps: [
          { age: 16, label: 'Upper secondary — sciences' },
          { age: 19, label: 'OSM Aviation Academy ATPL programme (2 years)' },
          { age: 21, label: 'Flight instructor — building hours' },
          { age: 23, label: 'First officer — Widerøe (regional)' },
          { age: 27, label: 'First officer — Norwegian/SAS' },
          { age: 30, label: 'Captain upgrade training' },
        ],
      },
      {
        name: 'Lina H.',
        title: 'Airline Pilot — Tromsø',
        currentAge: 28,
        location: 'Tromsø',
        steps: [
          { age: 16, label: 'Upper secondary — sciences' },
          { age: 19, label: 'Aviation studies bachelor at UiT (3 years)' },
          { age: 22, label: 'CPL + flight instructor rating' },
          { age: 24, label: 'First officer — Widerøe' },
          { age: 28, label: 'First officer — SAS (B737)' },
        ],
      },
    ],
  },
  'site-reliability-engineer': {
    careerId: 'site-reliability-engineer',
    examples: [
      {
        name: 'Daniel K.',
        title: 'SRE — Oslo',
        currentAge: 29,
        location: 'Oslo',
        steps: [
          { age: 16, label: 'Upper secondary — sciences + IT' },
          { age: 19, label: 'Computer science bachelor at UiO (3 years)' },
          { age: 22, label: 'Junior sysadmin — Schibsted' },
          { age: 24, label: 'DevOps engineer — Finn.no' },
          { age: 27, label: 'AWS + Kubernetes certifications' },
          { age: 29, label: 'Senior SRE — Vipps' },
        ],
      },
    ],
  },
};

export function getCareerPathExamples(careerId: string, careerTitle: string): CareerPathExample[] {
  // 1. Exact ID match
  if (CAREER_PATHS[careerId]) return CAREER_PATHS[careerId].examples;

  // 2. Try matching career ID with common variations
  const idLower = careerId.toLowerCase();
  for (const [key] of Object.entries(CAREER_PATHS)) {
    if (idLower === key || idLower.startsWith(key + '-') || key.startsWith(idLower + '-')) {
      return CAREER_PATHS[key].examples;
    }
  }

  // 3. Title match — require strong bidirectional overlap
  //    e.g. "software developer" matches "software-developer" but
  //    "network engineer" does NOT match generic "engineer"
  const titleLower = careerTitle.toLowerCase();
  const STOP_WORDS = new Set(['the', 'and', 'for', 'with', 'senior', 'junior', 'lead', 'chief', 'head']);
  const titleWords = titleLower.split(/[\s/()]+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
  for (const [key, value] of Object.entries(CAREER_PATHS)) {
    const keyWords = key.replace(/-/g, ' ').split(' ').filter(w => w.length > 2 && !STOP_WORDS.has(w));
    // All key words must appear in the title AND all title words must appear in the key
    // This prevents "engineer" from matching "network engineer"
    const keyMatchesTitle = keyWords.every(kw => titleWords.some(tw => tw === kw || tw.startsWith(kw)));
    const titleMatchesKey = titleWords.every(tw => keyWords.some(kw => tw === kw || kw.startsWith(tw)));
    if (keyMatchesTitle && titleMatchesKey) {
      return value.examples;
    }
  }

  return [];
}

/** Convert a CareerPathExample into a Journey object for the roadmap renderer */
export function careerPathToJourney(path: CareerPathExample, careerId: string): {
  id: string;
  career: string;
  startAge: number;
  startYear: number;
  items: {
    id: string;
    stage: 'foundation' | 'education' | 'experience' | 'career';
    title: string;
    subtitle: string;
    startAge: number;
    endAge?: number;
    isMilestone: boolean;
    icon: string;
  }[];
} {
  const stageIcons: Record<string, string> = {
    foundation: 'Sparkles',
    education: 'GraduationCap',
    experience: 'Briefcase',
    career: 'Target',
  };

  return {
    id: `alt-${careerId}-${path.name.replace(/\s/g, '')}`,
    career: path.title,
    startAge: path.steps[0]?.age ?? 16,
    startYear: new Date().getFullYear() - (path.currentAge - (path.steps[0]?.age ?? 16)),
    items: path.steps.map((step, i) => {
      // Determine stage from age
      const stage = step.age < 19 ? 'foundation' : step.age < 23 ? 'education' : step.age < 28 ? 'experience' : 'career';
      const nextAge = path.steps[i + 1]?.age;
      return {
        id: `alt-${i}-${Math.random().toString(36).slice(2, 7)}`,
        stage: stage as 'foundation' | 'education' | 'experience' | 'career',
        title: step.label,
        subtitle: `Age ${step.age}`,
        startAge: step.age,
        endAge: nextAge && nextAge > step.age ? nextAge : undefined,
        isMilestone: i === path.steps.length - 1 || step.label.toLowerCase().includes('certif') || step.label.toLowerCase().includes('graduate'),
        icon: stageIcons[stage] || 'Sparkles',
      };
    }),
  };
}
