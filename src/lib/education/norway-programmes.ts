/**
 * Norwegian Education Programmes by Career
 *
 * Maps careers to specific Norwegian universities, programmes,
 * and application details. Data sourced from utdanning.no and
 * samordnaopptak.no.
 *
 * All programme names are in Norwegian with English descriptions.
 * URLs point to real programme pages where possible.
 */

export interface NorwayProgramme {
  programme: string;        // Norwegian programme name
  englishName: string;      // English translation
  institution: string;      // University / college name
  city: string;
  duration: string;         // e.g. "6 years"
  type: 'bachelor' | 'master' | 'integrated' | 'vocational' | 'fagbrev' | 'phd';
  applicationVia: string;   // e.g. "Samordna opptak"
  url: string;              // Direct link to programme page
  notes?: string;           // Additional context
}

export interface CareerEducationPath {
  careerId: string;
  summary: string;          // 1-2 sentence overview of the path in Norway
  programmes: NorwayProgramme[];
  alternativePaths?: string[];  // Other ways in (e.g. "fagbrev", "private schools")
}

const CAREER_EDUCATION: Record<string, CareerEducationPath> = {
  'doctor': {
    careerId: 'doctor',
    summary: 'In Norway, becoming a doctor requires completing a 6-year medical degree (medisin) followed by 18 months of supervised internship (LIS1). Admission is highly competitive with strict grade requirements.',
    programmes: [
      { programme: 'Medisin (profesjonsstudium)', englishName: 'Medicine (Professional Degree)', institution: 'Universitetet i Oslo (UiO)', city: 'Oslo', duration: '6 years', type: 'integrated', applicationVia: 'Samordna opptak', url: 'https://www.uio.no/studier/program/medisin/' },
      { programme: 'Medisin (profesjonsstudium)', englishName: 'Medicine (Professional Degree)', institution: 'Universitetet i Bergen (UiB)', city: 'Bergen', duration: '6 years', type: 'integrated', applicationVia: 'Samordna opptak', url: 'https://www.uib.no/studier/medisin' },
      { programme: 'Medisin (profesjonsstudium)', englishName: 'Medicine (Professional Degree)', institution: 'NTNU', city: 'Trondheim', duration: '6 years', type: 'integrated', applicationVia: 'Samordna opptak', url: 'https://www.ntnu.no/studier/medisin' },
      { programme: 'Medisin (profesjonsstudium)', englishName: 'Medicine (Professional Degree)', institution: 'UiT Norges arktiske universitet', city: 'Tromsø', duration: '6 years', type: 'integrated', applicationVia: 'Samordna opptak', url: 'https://uit.no/utdanning/program/272191/medisin' },
    ],
    alternativePaths: ['Study medicine abroad (Hungary, Poland, Czech Republic) and apply for HPR authorisation in Norway', 'Some students take a year of realfag (science subjects) to improve grades before applying'],
  },
  'nurse': {
    careerId: 'nurse',
    summary: 'Nursing in Norway requires a 3-year bachelor\'s degree in sykepleie (nursing), followed by authorisation from Helsedirektoratet. Most universities and university colleges across Norway offer the programme.',
    programmes: [
      { programme: 'Sykepleie (bachelor)', englishName: 'Nursing (Bachelor)', institution: 'OsloMet', city: 'Oslo', duration: '3 years', type: 'bachelor', applicationVia: 'Samordna opptak', url: 'https://www.oslomet.no/studier/hv/sykepleie' },
      { programme: 'Sykepleie (bachelor)', englishName: 'Nursing (Bachelor)', institution: 'NTNU', city: 'Trondheim', duration: '3 years', type: 'bachelor', applicationVia: 'Samordna opptak', url: 'https://www.ntnu.no/studier/sykepleie' },
      { programme: 'Sykepleie (bachelor)', englishName: 'Nursing (Bachelor)', institution: 'Universitetet i Bergen (UiB)', city: 'Bergen', duration: '3 years', type: 'bachelor', applicationVia: 'Samordna opptak', url: 'https://www.uib.no/studier/sykepleie' },
    ],
  },
  'psychologist': {
    careerId: 'psychologist',
    summary: 'To become a psychologist in Norway, you need to complete the 6-year profesjonsstudium i psykologi. This is a competitive integrated programme that leads directly to authorisation. A bachelor + master route also exists but takes longer.',
    programmes: [
      { programme: 'Psykologi (profesjonsstudium)', englishName: 'Psychology (Professional Degree)', institution: 'Universitetet i Oslo (UiO)', city: 'Oslo', duration: '6 years', type: 'integrated', applicationVia: 'Samordna opptak', url: 'https://www.uio.no/studier/program/psykologi-profesjon/' },
      { programme: 'Psykologi (profesjonsstudium)', englishName: 'Psychology (Professional Degree)', institution: 'Universitetet i Bergen (UiB)', city: 'Bergen', duration: '6 years', type: 'integrated', applicationVia: 'Samordna opptak', url: 'https://www.uib.no/studier/psykologi-profesjon' },
      { programme: 'Psykologi (profesjonsstudium)', englishName: 'Psychology (Professional Degree)', institution: 'NTNU', city: 'Trondheim', duration: '6 years', type: 'integrated', applicationVia: 'Samordna opptak', url: 'https://www.ntnu.no/studier/psykologi-profesjon' },
      { programme: 'Psykologi (profesjonsstudium)', englishName: 'Psychology (Professional Degree)', institution: 'UiT Norges arktiske universitet', city: 'Tromsø', duration: '6 years', type: 'integrated', applicationVia: 'Samordna opptak', url: 'https://uit.no/utdanning/program/272193/psykologi_profesjon' },
    ],
    alternativePaths: ['Bachelor in psychology (3 years) + master (2 years) — but this does not give clinical authorisation without additional supervised practice'],
  },
  'teacher': {
    careerId: 'teacher',
    summary: 'Teaching in Norway requires a teaching degree — either grunnskolelærer (primary/lower secondary) or lektorutdanning (upper secondary). The programme is 5 years and includes practical placements in schools.',
    programmes: [
      { programme: 'Grunnskolelærerutdanning 1-7', englishName: 'Primary Teacher Education (Grades 1-7)', institution: 'OsloMet', city: 'Oslo', duration: '5 years', type: 'integrated', applicationVia: 'Samordna opptak', url: 'https://www.oslomet.no/studier/lui/grunnskolelaerer-1-7' },
      { programme: 'Grunnskolelærerutdanning 5-10', englishName: 'Teacher Education (Grades 5-10)', institution: 'OsloMet', city: 'Oslo', duration: '5 years', type: 'integrated', applicationVia: 'Samordna opptak', url: 'https://www.oslomet.no/studier/lui/grunnskolelaerer-5-10' },
      { programme: 'Lektorutdanning', englishName: 'Upper Secondary Teacher Education', institution: 'NTNU', city: 'Trondheim', duration: '5 years', type: 'integrated', applicationVia: 'Samordna opptak', url: 'https://www.ntnu.no/studier/lektorutdanning' },
      { programme: 'Lektorutdanning', englishName: 'Upper Secondary Teacher Education', institution: 'Universitetet i Oslo (UiO)', city: 'Oslo', duration: '5 years', type: 'integrated', applicationVia: 'Samordna opptak', url: 'https://www.uio.no/studier/program/lektorprogrammet/' },
    ],
  },
  'software-developer': {
    careerId: 'software-developer',
    summary: 'Software development in Norway can be entered through a bachelor\'s in informatics/computer science (3 years) or a 5-year integrated master\'s. Bootcamps and self-taught routes also work — the industry values skills and portfolio over formal degrees.',
    programmes: [
      { programme: 'Informatikk (bachelor)', englishName: 'Informatics (Bachelor)', institution: 'Universitetet i Oslo (UiO)', city: 'Oslo', duration: '3 years', type: 'bachelor', applicationVia: 'Samordna opptak', url: 'https://www.uio.no/studier/program/informatikk/' },
      { programme: 'Datateknologi (sivilingeniør)', englishName: 'Computer Science (Integrated Master)', institution: 'NTNU', city: 'Trondheim', duration: '5 years', type: 'integrated', applicationVia: 'Samordna opptak', url: 'https://www.ntnu.no/studier/mtdt' },
      { programme: 'Informasjonsteknologi (bachelor)', englishName: 'Information Technology (Bachelor)', institution: 'OsloMet', city: 'Oslo', duration: '3 years', type: 'bachelor', applicationVia: 'Samordna opptak', url: 'https://www.oslomet.no/studier/tkd/informasjonsteknologi' },
    ],
    alternativePaths: ['Coding bootcamps (e.g. Kodehode, Salt)', 'Self-taught with portfolio and open source contributions', 'Fagskole in IT (2 years vocational college)'],
  },
  'engineer': {
    careerId: 'engineer',
    summary: 'Engineering in Norway is typically studied as a 5-year sivilingeniør (integrated master\'s) at NTNU or a 3-year bachelor\'s at a university college. NTNU\'s sivilingeniør programme is the most prestigious route.',
    programmes: [
      { programme: 'Sivilingeniør (various specialisations)', englishName: 'Engineering (Integrated Master)', institution: 'NTNU', city: 'Trondheim', duration: '5 years', type: 'integrated', applicationVia: 'Samordna opptak', url: 'https://www.ntnu.no/studier/sivilingenior' },
      { programme: 'Ingeniørfag (bachelor)', englishName: 'Engineering (Bachelor)', institution: 'OsloMet', city: 'Oslo', duration: '3 years', type: 'bachelor', applicationVia: 'Samordna opptak', url: 'https://www.oslomet.no/studier/tkd/ingenior' },
      { programme: 'Ingeniørfag (bachelor)', englishName: 'Engineering (Bachelor)', institution: 'Universitetet i Sørøst-Norge (USN)', city: 'Various', duration: '3 years', type: 'bachelor', applicationVia: 'Samordna opptak', url: 'https://www.usn.no/studier/studie-og-emneoversikt/teknologi/' },
    ],
  },
  'accountant': {
    careerId: 'accountant',
    summary: 'To become an authorised accountant (regnskapsfører) in Norway, you need a bachelor\'s degree in accounting or economics, plus 2 years of relevant work experience. The authorisation is granted by Finanstilsynet.',
    programmes: [
      { programme: 'Regnskap og revisjon (bachelor)', englishName: 'Accounting and Auditing (Bachelor)', institution: 'OsloMet', city: 'Oslo', duration: '3 years', type: 'bachelor', applicationVia: 'Samordna opptak', url: 'https://www.oslomet.no/studier/sam/regnskap-revisjon' },
      { programme: 'Økonomi og administrasjon (bachelor)', englishName: 'Business Administration (Bachelor)', institution: 'BI Norwegian Business School', city: 'Oslo', duration: '3 years', type: 'bachelor', applicationVia: 'Direct application', url: 'https://www.bi.no/studier-og-kurs/bachelor/okonomi-og-administrasjon/' },
      { programme: 'Økonomi og administrasjon (bachelor)', englishName: 'Business Administration (Bachelor)', institution: 'NHH', city: 'Bergen', duration: '3 years', type: 'bachelor', applicationVia: 'Samordna opptak', url: 'https://www.nhh.no/studier/bachelor-i-okonomi-og-administrasjon/' },
    ],
    alternativePaths: ['Fagbrev in accounting (regnskapsmedarbeider) through vocational training'],
  },
  'lawyer': {
    careerId: 'lawyer',
    summary: 'Becoming a lawyer in Norway requires a 5-year master\'s degree in law (rettsvitenskap/jus). After graduating, you need 2 years of supervised practice to obtain your advokatbevilling (lawyer\'s licence).',
    programmes: [
      { programme: 'Rettsvitenskap (master)', englishName: 'Law (Master)', institution: 'Universitetet i Oslo (UiO)', city: 'Oslo', duration: '5 years', type: 'integrated', applicationVia: 'Samordna opptak', url: 'https://www.uio.no/studier/program/rettsvitenskap/' },
      { programme: 'Rettsvitenskap (master)', englishName: 'Law (Master)', institution: 'Universitetet i Bergen (UiB)', city: 'Bergen', duration: '5 years', type: 'integrated', applicationVia: 'Samordna opptak', url: 'https://www.uib.no/studier/rettsvitenskap' },
      { programme: 'Rettsvitenskap (master)', englishName: 'Law (Master)', institution: 'UiT Norges arktiske universitet', city: 'Tromsø', duration: '5 years', type: 'integrated', applicationVia: 'Samordna opptak', url: 'https://uit.no/utdanning/program/272190/rettsvitenskap' },
    ],
  },
  'healthcare-worker': {
    careerId: 'healthcare-worker',
    summary: 'Healthcare worker (helsefagarbeider) is a vocational path in Norway. You take 2 years of health and social care studies at videregående skole (upper secondary), followed by 2 years of apprenticeship (læretid) to earn your fagbrev.',
    programmes: [
      { programme: 'Helse- og oppvekstfag (Vg1) → Helsearbeiderfag (Vg2)', englishName: 'Health and Social Care (Upper Secondary)', institution: 'Videregående skoler across Norway', city: 'Nationwide', duration: '2 years school + 2 years apprenticeship', type: 'fagbrev', applicationVia: 'Vigo.no (county application)', url: 'https://utdanning.no/yrker/beskrivelse/helsefagarbeider' },
    ],
    alternativePaths: ['Praksiskandidat — if you have 5+ years of relevant work experience, you can take the fagprøve directly'],
  },
  'data-analyst': {
    careerId: 'data-analyst',
    summary: 'Data analysis in Norway typically requires a bachelor\'s in statistics, mathematics, informatics, or a related field. Many roles accept a strong portfolio in lieu of a specific degree.',
    programmes: [
      { programme: 'Statistikk og datavitenskap (bachelor)', englishName: 'Statistics and Data Science (Bachelor)', institution: 'Universitetet i Oslo (UiO)', city: 'Oslo', duration: '3 years', type: 'bachelor', applicationVia: 'Samordna opptak', url: 'https://www.uio.no/studier/program/statistikk/' },
      { programme: 'Datavitenskap (bachelor)', englishName: 'Data Science (Bachelor)', institution: 'NTNU', city: 'Trondheim', duration: '3 years', type: 'bachelor', applicationVia: 'Samordna opptak', url: 'https://www.ntnu.no/studier/bdat' },
    ],
  },
  'physiotherapist': {
    careerId: 'physiotherapist',
    summary: 'Physiotherapy in Norway requires a 3-year bachelor\'s degree in fysioterapi, followed by authorisation from Helsedirektoratet. The programme includes extensive practical placements.',
    programmes: [
      { programme: 'Fysioterapi (bachelor)', englishName: 'Physiotherapy (Bachelor)', institution: 'OsloMet', city: 'Oslo', duration: '3 years', type: 'bachelor', applicationVia: 'Samordna opptak', url: 'https://www.oslomet.no/studier/hv/fysioterapi' },
      { programme: 'Fysioterapi (bachelor)', englishName: 'Physiotherapy (Bachelor)', institution: 'NTNU', city: 'Trondheim', duration: '3 years', type: 'bachelor', applicationVia: 'Samordna opptak', url: 'https://www.ntnu.no/studier/fysioterapi' },
      { programme: 'Fysioterapi (bachelor)', englishName: 'Physiotherapy (Bachelor)', institution: 'UiT Norges arktiske universitet', city: 'Tromsø', duration: '3 years', type: 'bachelor', applicationVia: 'Samordna opptak', url: 'https://uit.no/utdanning/program/340977/fysioterapeututdanning' },
    ],
  },
};

/**
 * Look up Norwegian education programmes for a career.
 * Matches by career ID first, then falls back to keyword matching on the career title.
 */
export function getNorwayProgrammes(careerId: string, careerTitle: string): CareerEducationPath | null {
  // Direct ID match
  if (CAREER_EDUCATION[careerId]) {
    return CAREER_EDUCATION[careerId];
  }

  // Keyword match on title
  const titleLower = careerTitle.toLowerCase();
  for (const [key, value] of Object.entries(CAREER_EDUCATION)) {
    if (titleLower.includes(key.replace('-', ' ')) || titleLower.includes(key)) {
      return value;
    }
  }

  return null;
}
