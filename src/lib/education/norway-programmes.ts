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
  'police-officer': {
    careerId: 'police-officer',
    summary: 'In Norway, becoming a police officer requires a 3-year bachelor\'s degree at Politihøgskolen (Police University College). Entry is extremely competitive — typically 3,000+ applicants for ~700 places. You must pass physical tests, background checks, and be a Norwegian citizen.',
    programmes: [
      { programme: 'Bachelorstudium i politiarbeid', englishName: 'Bachelor in Police Studies', institution: 'Politihøgskolen', city: 'Oslo', duration: '3 years', type: 'bachelor' as const, applicationVia: 'Politihøgskolen direct', url: 'https://www.politihogskolen.no/studietilbud/bachelor/' },
      { programme: 'Bachelorstudium i politiarbeid', englishName: 'Bachelor in Police Studies', institution: 'Politihøgskolen', city: 'Stavern', duration: '3 years', type: 'bachelor' as const, applicationVia: 'Politihøgskolen direct', url: 'https://www.politihogskolen.no/studietilbud/bachelor/' },
      { programme: 'Bachelorstudium i politiarbeid', englishName: 'Bachelor in Police Studies', institution: 'Politihøgskolen', city: 'Bodø', duration: '3 years', type: 'bachelor' as const, applicationVia: 'Politihøgskolen direct', url: 'https://www.politihogskolen.no/studietilbud/bachelor/' },
    ],
    alternativePaths: ['No alternative route — Politihøgskolen is the only path to becoming a police officer in Norway'],
  },
  'firefighter': {
    careerId: 'firefighter',
    summary: 'Norwegian firefighters train at Norges brannskole (Norwegian Fire Academy) in Tjeldsund, Nordland. The programme is 1 year. Many candidates have a technical fagbrev or relevant work experience before applying. You must pass demanding physical tests.',
    programmes: [
      { programme: 'Grunnkurs for brann- og redningspersonell', englishName: 'Basic Course for Fire and Rescue Personnel', institution: 'Norges brannskole', city: 'Tjeldsund', duration: '1 year', type: 'vocational' as const, applicationVia: 'Norges brannskole direct', url: 'https://www.nbsk.no/' },
    ],
    alternativePaths: ['Deltidsbrannkonstabel (part-time firefighter) — shorter training, common in rural areas', 'Technical fagbrev + fire academy provides the strongest application'],
  },
  'airline-pilot': {
    careerId: 'airline-pilot',
    summary: 'Becoming an airline pilot in Norway requires an ATPL (Airline Transport Pilot Licence). You can train through an integrated flight school programme (18-24 months) or via a modular route. Norwegian airlines typically require 1,500+ flight hours.',
    programmes: [
      { programme: 'Integrated ATPL Programme', englishName: 'Airline Pilot Training', institution: 'OSM Aviation Academy', city: 'Oslo/Arendal', duration: '18-24 months', type: 'vocational' as const, applicationVia: 'Direct application', url: 'https://www.osmaviationacademy.com/' },
      { programme: 'Trafikkflygerutdanning', englishName: 'Commercial Pilot Training', institution: 'Scandinavian Aviation Academy', city: 'Various', duration: '18-24 months', type: 'vocational' as const, applicationVia: 'Direct application', url: 'https://www.pilot.no/' },
      { programme: 'Luftfartsfag', englishName: 'Aviation Studies', institution: 'University of Tromsø (UiT)', city: 'Tromsø/Bardufoss', duration: '3 years (bachelor + ATPL)', type: 'bachelor' as const, applicationVia: 'Samordna opptak', url: 'https://uit.no/utdanning/program/341185/luftfartsfag' },
    ],
    alternativePaths: ['Military pilot training via Luftforsvaret (Norwegian Air Force)', 'Modular route: PPL → CPL → IR → ATPL theory — cheaper but takes longer'],
  },
  'helicopter-pilot': {
    careerId: 'helicopter-pilot',
    summary: 'Helicopter pilots in Norway typically train for a CPL-H (Commercial Pilot Licence — Helicopter). Offshore helicopter operations (North Sea) require additional training including HUET (Helicopter Underwater Escape Training).',
    programmes: [
      { programme: 'Helikopterflygerutdanning', englishName: 'Helicopter Pilot Training', institution: 'Helicopter Flight Training AS', city: 'Stavanger', duration: '12-18 months', type: 'vocational' as const, applicationVia: 'Direct application', url: 'https://www.hft.no/' },
    ],
    alternativePaths: ['Military helicopter pilot training via Forsvaret', 'Train abroad (USA, South Africa) — typically cheaper, then convert licence to EASA'],
  },
};

// ============================================
// Professional certifications & courses
// For careers that don't have a formal degree programme
// ============================================

export interface ProfessionalCert {
  name: string;
  provider: string;
  duration: string;
  cost: string;
  url: string;
  recognised: string;  // e.g. "Globally recognised"
}

export interface CertificationPath {
  summary: string;
  certifications: ProfessionalCert[];
  recommendedDegrees?: string[];  // e.g. ["Bachelor's in IT", "Bachelor's in Business"]
}

const CERTIFICATION_PATHS: Record<string, CertificationPath> = {
  'project': {
    summary: 'Project management is a skills-based career. While a degree helps, industry certifications are what employers look for. Most project managers start in technical or business roles and transition into management.',
    certifications: [
      { name: 'PRINCE2 Foundation & Practitioner', provider: 'PeopleCert / Axelos', duration: '5 days + exam', cost: '~15,000 NOK', url: 'https://www.axelos.com/certifications/propath/prince2-project-management', recognised: 'Globally recognised, standard in Norway/UK' },
      { name: 'PMP (Project Management Professional)', provider: 'PMI', duration: 'Self-paced + exam', cost: '~5,000 NOK (exam)', url: 'https://www.pmi.org/certifications/project-management-pmp', recognised: 'Globally recognised, standard in US/international' },
      { name: 'Certified Scrum Master (CSM)', provider: 'Scrum Alliance', duration: '2 days + exam', cost: '~12,000 NOK', url: 'https://www.scrumalliance.org/get-certified/scrum-master-track/certified-scrummaster', recognised: 'Industry standard for agile teams' },
      { name: 'ITIL 4 Foundation', provider: 'PeopleCert / Axelos', duration: '3 days + exam', cost: '~10,000 NOK', url: 'https://www.axelos.com/certifications/propath/itil-4', recognised: 'IT service management standard' },
    ],
    recommendedDegrees: ["Bachelor's in IT or Computer Science", "Bachelor's in Business Administration", "Master's in Project Management"],
  },
  'programme': {
    summary: 'Programme management typically requires 10+ years of project management experience. There is no direct degree — it\'s a senior role you grow into. Certifications like MSP and PgMP demonstrate readiness.',
    certifications: [
      { name: 'MSP (Managing Successful Programmes)', provider: 'PeopleCert / Axelos', duration: '5 days + exam', cost: '~20,000 NOK', url: 'https://www.axelos.com/certifications/propath/msp-programme-management', recognised: 'Standard for programme management in Norway/UK' },
      { name: 'PgMP (Programme Management Professional)', provider: 'PMI', duration: 'Self-paced + exam', cost: '~7,000 NOK (exam)', url: 'https://www.pmi.org/certifications/program-management-pgmp', recognised: 'Globally recognised senior PM credential' },
      { name: 'PRINCE2 Agile', provider: 'PeopleCert / Axelos', duration: '3 days + exam', cost: '~15,000 NOK', url: 'https://www.axelos.com/certifications/propath/prince2-agile-project-management', recognised: 'Combines PRINCE2 with agile methods' },
      { name: 'SAFe Practice Consultant (SPC)', provider: 'Scaled Agile', duration: '4 days + exam', cost: '~25,000 NOK', url: 'https://scaledagile.com/certification/safe-practice-consultant/', recognised: 'Enterprise agile at scale (formerly SAFe Program Consultant)' },
    ],
    recommendedDegrees: ["Bachelor's in IT or Engineering", "MBA or Master's in Business", "Master's in Project Management"],
  },
  'cyber': {
    summary: 'Cybersecurity is one of the fastest-growing fields. While a degree in IT or computer science helps, industry certifications are essential and often valued more than degrees by employers.',
    certifications: [
      { name: 'CompTIA Security+', provider: 'CompTIA', duration: 'Self-paced + exam', cost: '~4,000 NOK', url: 'https://www.comptia.org/certifications/security', recognised: 'Entry-level industry standard' },
      { name: 'CISSP', provider: 'ISC²', duration: 'Self-paced + exam', cost: '~8,000 NOK (exam)', url: 'https://www.isc2.org/certifications/cissp', recognised: 'Gold standard for senior security roles' },
      { name: 'CEH (Certified Ethical Hacker)', provider: 'EC-Council', duration: '5 days + exam', cost: '~15,000 NOK', url: 'https://www.eccouncil.org/programs/certified-ethical-hacker-ceh/', recognised: 'Penetration testing standard' },
      { name: 'OSCP', provider: 'Offensive Security', duration: 'Self-paced + exam', cost: '~12,000 NOK', url: 'https://www.offsec.com/courses/pen-200/', recognised: 'Hands-on penetration testing — highly respected' },
    ],
    recommendedDegrees: ["Bachelor's in Computer Science or IT", "Bachelor's in Cybersecurity", "Master's in Information Security"],
  },
  'cloud': {
    summary: 'Cloud engineering is certification-driven. The major cloud providers (AWS, Azure, Google Cloud) each have their own certification paths that employers specifically look for.',
    certifications: [
      { name: 'AWS Solutions Architect Associate', provider: 'Amazon Web Services', duration: 'Self-paced + exam', cost: '~2,000 NOK', url: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/', recognised: 'Most in-demand cloud cert globally' },
      { name: 'Azure Administrator Associate', provider: 'Microsoft', duration: 'Self-paced + exam', cost: '~2,000 NOK', url: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-administrator/', recognised: 'Standard for Microsoft cloud environments' },
      { name: 'Google Cloud Professional Cloud Architect', provider: 'Google', duration: 'Self-paced + exam', cost: '~2,500 NOK', url: 'https://cloud.google.com/learn/certification/cloud-architect', recognised: 'GCP enterprise standard' },
      { name: 'Kubernetes Administrator (CKA)', provider: 'CNCF', duration: 'Self-paced + exam', cost: '~3,000 NOK', url: 'https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/', recognised: 'Container orchestration standard' },
    ],
    recommendedDegrees: ["Bachelor's in Computer Science or IT", "Bachelor's in Software Engineering"],
  },
  'data': {
    summary: 'Data science and analytics roles value a mix of formal education and practical skills. A degree in statistics, maths, or computer science provides the foundation, but practical certifications and portfolio projects matter equally.',
    certifications: [
      { name: 'Google Data Analytics Certificate', provider: 'Google (via Coursera)', duration: '6 months part-time', cost: '~3,000 NOK', url: 'https://www.coursera.org/professional-certificates/google-data-analytics', recognised: 'Industry-recognised entry-level credential' },
      { name: 'AWS Machine Learning Specialty', provider: 'Amazon Web Services', duration: 'Self-paced + exam', cost: '~3,500 NOK', url: 'https://aws.amazon.com/certification/certified-machine-learning-specialty/', recognised: 'Cloud ML standard' },
      { name: 'TensorFlow Developer Certificate', provider: 'Google', duration: 'Self-paced + exam', cost: '~1,500 NOK', url: 'https://www.tensorflow.org/certificate', recognised: 'Deep learning credential' },
      { name: 'Microsoft Power BI Data Analyst', provider: 'Microsoft', duration: 'Self-paced + exam', cost: '~2,000 NOK', url: 'https://learn.microsoft.com/en-us/credentials/certifications/data-analyst-associate/', recognised: 'Business intelligence standard' },
    ],
    recommendedDegrees: ["Bachelor's in Statistics or Mathematics", "Bachelor's in Computer Science", "Master's in Data Science"],
  },
  'product': {
    summary: 'Product management is a cross-functional role with no single degree path. Most product managers come from engineering, design, or business backgrounds. Certifications help but experience matters most.',
    certifications: [
      { name: 'Certified Scrum Product Owner (CSPO)', provider: 'Scrum Alliance', duration: '2 days + exam', cost: '~12,000 NOK', url: 'https://www.scrumalliance.org/get-certified/product-owner-track/certified-scrum-product-owner', recognised: 'Agile product ownership standard' },
      { name: 'Product Management Certificate', provider: 'Product School', duration: '8 weeks', cost: '~40,000 NOK', url: 'https://productschool.com/certifications/product-manager-certification', recognised: 'Recognised by tech companies globally' },
      { name: 'SAFe Product Owner/Product Manager', provider: 'Scaled Agile', duration: '2 days + exam', cost: '~15,000 NOK', url: 'https://scaledagile.com/training/safe-product-owner-product-manager/', recognised: 'Enterprise product management' },
    ],
    recommendedDegrees: ["Bachelor's in Computer Science or Engineering", "Bachelor's in Business", "MBA"],
  },
  'ux': {
    summary: 'UX design can be entered through bootcamps, self-study, or formal education. A strong portfolio matters more than any specific degree. Google\'s UX certificate is a popular entry point.',
    certifications: [
      { name: 'Google UX Design Certificate', provider: 'Google (via Coursera)', duration: '6 months part-time', cost: '~3,000 NOK', url: 'https://www.coursera.org/professional-certificates/google-ux-design', recognised: 'Industry-recognised entry-level credential' },
      { name: 'Nielsen Norman Group UX Certification', provider: 'NN/g', duration: 'Multiple courses + exam', cost: '~30,000 NOK', url: 'https://www.nngroup.com/ux-certification/', recognised: 'Gold standard in UX research and design' },
      { name: 'Interaction Design Foundation', provider: 'IxDF', duration: 'Self-paced courses', cost: '~2,000 NOK/year', url: 'https://www.interaction-design.org/', recognised: 'Comprehensive UX learning platform' },
    ],
    recommendedDegrees: ["Bachelor's in Interaction Design", "Bachelor's in Visual Communication", "Bachelor's in Informatics"],
  },
};

function getCertificationPath(careerId: string, careerTitle: string): CertificationPath | null {
  const titleLower = careerTitle.toLowerCase();
  const idLower = careerId.toLowerCase();

  for (const [key, value] of Object.entries(CERTIFICATION_PATHS)) {
    if (idLower.includes(key) || titleLower.includes(key)) return value;
  }
  return null;
}

/**
 * Look up Norwegian education programmes for a career.
 * Matches by career ID first, then falls back to keyword matching on the career title.
 * Also returns professional certifications as an alternative path.
 */
export function getNorwayProgrammes(careerId: string, careerTitle: string): CareerEducationPath | null {
  // Direct ID match
  if (CAREER_EDUCATION[careerId]) {
    return CAREER_EDUCATION[careerId];
  }

  // Title match — all key words must appear in the title
  const titleWords = careerTitle.toLowerCase().split(/[\s/()]+/).filter(w => w.length > 2);
  for (const [key, value] of Object.entries(CAREER_EDUCATION)) {
    const keyWords = key.replace(/-/g, ' ').split(' ').filter(w => w.length > 2);
    if (keyWords.every(kw => titleWords.some(tw => tw === kw || tw.startsWith(kw)))) {
      return value;
    }
  }

  return null;
}

export { getCertificationPath };
