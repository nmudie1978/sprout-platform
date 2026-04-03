/**
 * Education Alignment Utilities
 *
 * Maps careers to relevant subjects, determines alignment state,
 * classifies roadmap step types, and generates "why it matters" content.
 */

import type {
  SubjectAlignment,
  RoadmapStepType,
  CareerSubjectMapping,
} from './types';
import type { JourneyItem, JourneyStage } from '@/lib/journey/career-journey-types';

// ── Career → Subject Mappings ────────────────────────────────────────
// Covers the most common career paths. Falls back gracefully for unknown careers.

const CAREER_SUBJECT_MAP: CareerSubjectMapping[] = [
  {
    career: 'doctor',
    keySubjects: ['Biology', 'Chemistry', 'Mathematics'],
    supportingSubjects: ['Physics', 'Psychology', 'English'],
    focusAreas: ['Science fundamentals', 'Problem-solving', 'Communication skills'],
    nextDecisions: ['Choose science subjects for next year', 'Research medical school entry requirements', 'Look into hospital volunteering'],
    whySubjectsMatter: 'Medicine requires strong science foundations — biology and chemistry are essential for entry.',
  },
  {
    career: 'nurse',
    keySubjects: ['Biology', 'Chemistry', 'Health Science'],
    supportingSubjects: ['Psychology', 'Mathematics', 'English'],
    focusAreas: ['Biology fundamentals', 'Patient care understanding', 'Communication'],
    nextDecisions: ['Choose biology and chemistry for exams', 'Research nursing programs', 'Explore care home volunteering'],
    whySubjectsMatter: 'Nursing requires strong biology and an understanding of health science for entry.',
  },
  {
    career: 'physiotherapist',
    keySubjects: ['Biology', 'Physical Education', 'Chemistry'],
    supportingSubjects: ['Mathematics', 'Psychology', 'Physics'],
    focusAreas: ['Human biology', 'Anatomy and movement', 'Scientific reasoning'],
    nextDecisions: ['Keep biology and PE as core subjects', 'Research physiotherapy degree requirements', 'Look into volunteer work in health settings'],
    whySubjectsMatter: 'Physiotherapy combines biology with physical understanding — PE and biology are your strongest foundations.',
  },
  {
    career: 'software developer',
    keySubjects: ['Mathematics', 'Computer Science', 'Physics'],
    supportingSubjects: ['English', 'Design & Technology', 'Business Studies'],
    focusAreas: ['Logical thinking', 'Problem-solving', 'Programming basics'],
    nextDecisions: ['Start learning a programming language', 'Choose maths and computing subjects', 'Build a small project or portfolio'],
    whySubjectsMatter: 'Software development relies on logical and mathematical thinking. Starting early with code gives you a real advantage.',
  },
  {
    career: 'qa engineer',
    keySubjects: ['Computer Science', 'Mathematics', 'English'],
    supportingSubjects: ['Business Studies', 'Design & Technology', 'Psychology'],
    focusAreas: ['Logical thinking', 'Attention to detail', 'Communication skills'],
    nextDecisions: ['Learn the basics of programming and testing', 'Choose maths and computing subjects', 'Practice structured problem-solving'],
    whySubjectsMatter: 'QA engineering requires logical thinking, precision, and the ability to communicate issues clearly — computer science, maths, and English are your foundations.',
    aliases: ['test engineer', 'quality assurance', 'software tester', 'QA', 'SDET'],
  },
  {
    career: 'engineer',
    keySubjects: ['Mathematics', 'Physics', 'Design & Technology'],
    supportingSubjects: ['Computer Science', 'Chemistry', 'English'],
    focusAreas: ['Mathematical reasoning', 'Physics principles', 'Design thinking'],
    nextDecisions: ['Choose maths and physics at higher levels', 'Research engineering specialisations', 'Enter a STEM competition or project'],
    whySubjectsMatter: 'Engineering is built on maths and physics. Strong foundations here open doors to many specialisations.',
  },
  {
    career: 'teacher',
    keySubjects: ['English', 'Mathematics', 'Psychology'],
    supportingSubjects: ['Any subject you want to teach', 'Sociology', 'Drama'],
    focusAreas: ['Communication skills', 'Subject knowledge', 'Understanding how people learn'],
    nextDecisions: ['Choose subjects you might want to teach', 'Research education degree requirements', 'Get experience with younger students'],
    whySubjectsMatter: 'Teaching requires strong knowledge in your chosen subject plus an understanding of how learning works.',
  },
  {
    career: 'graphic designer',
    keySubjects: ['Art & Design', 'Design & Technology', 'Computer Science'],
    supportingSubjects: ['English', 'Media Studies', 'Business Studies'],
    focusAreas: ['Visual creativity', 'Digital design tools', 'Communication through design'],
    nextDecisions: ['Build a portfolio of creative work', 'Learn design software (Figma, Illustrator)', 'Research design courses or apprenticeships'],
    whySubjectsMatter: 'Design is a creative and technical field — art gives you the eye, technology gives you the tools.',
  },
  {
    career: 'business',
    keySubjects: ['Business Studies', 'Mathematics', 'English'],
    supportingSubjects: ['Economics', 'Computer Science', 'Psychology'],
    focusAreas: ['Financial literacy', 'Communication', 'Strategic thinking'],
    nextDecisions: ['Choose business and maths subjects', 'Research business degrees or apprenticeships', 'Start a small project or side venture'],
    whySubjectsMatter: 'Business careers need numeracy, communication, and an understanding of how organisations work.',
  },
  {
    career: 'lawyer',
    keySubjects: ['English', 'History', 'Law'],
    supportingSubjects: ['Politics', 'Philosophy', 'Sociology'],
    focusAreas: ['Critical thinking', 'Written communication', 'Analytical reasoning'],
    nextDecisions: ['Strengthen essay writing and analysis skills', 'Research law degree requirements', 'Look into debating or mock trial activities'],
    whySubjectsMatter: 'Law requires strong analytical and communication skills — English and humanities build these foundations.',
  },
  {
    career: 'cybersecurity',
    keySubjects: ['Computer Science', 'Mathematics', 'Physics'],
    supportingSubjects: ['English', 'Business Studies', 'Design & Technology'],
    focusAreas: ['Networking fundamentals', 'Programming and scripting', 'Analytical problem-solving'],
    nextDecisions: ['Start learning networking basics and Linux', 'Choose maths and computing subjects', 'Try beginner CTF (Capture the Flag) challenges'],
    whySubjectsMatter: 'Cybersecurity builds on computer science and maths — understanding systems deeply is key to securing them.',
    aliases: ['security', 'infosec', 'application security', 'network security', 'penetration tester', 'security analyst', 'security engineer'],
  },
  {
    career: 'data scientist',
    keySubjects: ['Mathematics', 'Computer Science', 'Statistics'],
    supportingSubjects: ['Physics', 'Economics', 'Biology'],
    focusAreas: ['Statistical reasoning', 'Programming (Python/R)', 'Data analysis and visualisation'],
    nextDecisions: ['Strengthen maths and statistics skills', 'Learn Python or R basics', 'Explore open datasets and build small analysis projects'],
    whySubjectsMatter: 'Data science requires strong maths and coding skills to turn raw data into meaningful insights.',
  },
  {
    career: 'architect',
    keySubjects: ['Mathematics', 'Art & Design', 'Physics'],
    supportingSubjects: ['Design & Technology', 'Computer Science', 'Geography'],
    focusAreas: ['Spatial reasoning', 'Design and creativity', 'Technical drawing and modelling'],
    nextDecisions: ['Keep maths and art/design as core subjects', 'Research architecture degree portfolios', 'Start sketching and learning CAD software'],
    whySubjectsMatter: 'Architecture blends creativity with technical precision — maths, physics, and design are your foundations.',
  },
  {
    career: 'psychologist',
    keySubjects: ['Psychology', 'Biology', 'Mathematics'],
    supportingSubjects: ['English', 'Sociology', 'Chemistry'],
    focusAreas: ['Research methods', 'Understanding human behaviour', 'Scientific writing'],
    nextDecisions: ['Choose psychology and biology subjects', 'Research psychology degree requirements', 'Read about different psychology specialisations'],
    whySubjectsMatter: 'Psychology is a science — biology and maths support the research methods you will need.',
  },
  {
    career: 'journalist',
    keySubjects: ['English', 'Media Studies', 'History'],
    supportingSubjects: ['Politics', 'Sociology', 'Psychology'],
    focusAreas: ['Writing and storytelling', 'Critical analysis', 'Research and interviewing'],
    nextDecisions: ['Write for school paper or start a blog', 'Strengthen essay and creative writing', 'Research journalism or media degrees'],
    whySubjectsMatter: 'Journalism needs strong writing, critical thinking, and an understanding of the world around you.',
  },
  {
    career: 'accountant',
    keySubjects: ['Mathematics', 'Business Studies', 'Economics'],
    supportingSubjects: ['English', 'Computer Science', 'Law'],
    focusAreas: ['Numeracy and accuracy', 'Financial understanding', 'Attention to detail'],
    nextDecisions: ['Choose maths and business subjects', 'Research accounting qualifications (ACCA, ACA)', 'Look into finance-related work experience'],
    whySubjectsMatter: 'Accounting is built on numbers and business knowledge — strong maths and economics are essential.',
  },
  {
    career: 'veterinarian',
    keySubjects: ['Biology', 'Chemistry', 'Mathematics'],
    supportingSubjects: ['Physics', 'English', 'Agriculture'],
    focusAreas: ['Animal biology', 'Scientific reasoning', 'Practical care experience'],
    nextDecisions: ['Choose biology and chemistry at higher levels', 'Research vet school requirements', 'Get animal care experience (farms, shelters)'],
    whySubjectsMatter: 'Veterinary science requires the same strong science foundations as medicine — biology and chemistry are essential.',
  },
  {
    career: 'electrician',
    keySubjects: ['Mathematics', 'Physics', 'Design & Technology'],
    supportingSubjects: ['Computer Science', 'English', 'Business Studies'],
    focusAreas: ['Electrical principles', 'Practical problem-solving', 'Safety regulations'],
    nextDecisions: ['Keep maths and physics as core subjects', 'Research electrical apprenticeship programmes', 'Learn about circuits and wiring basics'],
    whySubjectsMatter: 'Electrical work relies on physics and maths — understanding how circuits work keeps people safe.',
  },
  {
    career: 'marketing',
    keySubjects: ['Business Studies', 'English', 'Media Studies'],
    supportingSubjects: ['Psychology', 'Art & Design', 'Mathematics'],
    focusAreas: ['Communication and persuasion', 'Digital tools', 'Understanding audiences'],
    nextDecisions: ['Build a social media or content project', 'Choose business and media subjects', 'Research marketing degrees or apprenticeships'],
    whySubjectsMatter: 'Marketing combines creativity with business strategy — communication and understanding people are key.',
  },
  {
    career: 'lab technician',
    keySubjects: ['Biology', 'Chemistry', 'Mathematics'],
    supportingSubjects: ['Physics', 'Computer Science', 'English'],
    focusAreas: ['Laboratory techniques', 'Scientific accuracy', 'Data recording and analysis'],
    nextDecisions: ['Focus on biology and chemistry', 'Research biomedical science programmes', 'Look for lab volunteering or work experience'],
    whySubjectsMatter: 'Lab work requires precision in biology and chemistry — these subjects are essential for understanding what you test and measure.',
    aliases: ['bioingeniør', 'biomedical', 'laboratory', 'lab scientist', 'medical technologist'],
  },
  {
    career: 'social worker',
    keySubjects: ['Psychology', 'Sociology', 'English'],
    supportingSubjects: ['Health Science', 'Law', 'Biology'],
    focusAreas: ['Understanding human behaviour', 'Communication skills', 'Empathy and resilience'],
    nextDecisions: ['Choose psychology and sociology subjects', 'Research social work degrees', 'Volunteer with community organisations'],
    whySubjectsMatter: 'Social work requires deep understanding of people and society — psychology and sociology build those foundations.',
    aliases: ['care worker', 'youth worker', 'community worker', 'counsellor', 'therapist'],
  },
  {
    career: 'chef',
    keySubjects: ['Food Technology', 'Business Studies', 'Chemistry'],
    supportingSubjects: ['Art & Design', 'Mathematics', 'Biology'],
    focusAreas: ['Cooking techniques and food safety', 'Creativity and presentation', 'Kitchen management'],
    nextDecisions: ['Take food technology or hospitality courses', 'Practice cooking at home regularly', 'Look for kitchen apprenticeships or part-time work'],
    whySubjectsMatter: 'Professional cooking combines science (food chemistry) with creativity and business awareness.',
    aliases: ['cook', 'baker', 'pastry', 'culinary', 'hospitality'],
  },
  {
    career: 'mechanic',
    keySubjects: ['Design & Technology', 'Physics', 'Mathematics'],
    supportingSubjects: ['Computer Science', 'Business Studies', 'English'],
    focusAreas: ['Mechanical understanding', 'Problem diagnosis', 'Practical skills'],
    nextDecisions: ['Choose physics and design technology', 'Research automotive apprenticeships', 'Learn about engines and electrical systems'],
    whySubjectsMatter: 'Mechanics relies on physics and practical engineering knowledge — understanding how things work is the foundation.',
    aliases: ['automotive', 'car', 'vehicle', 'motor'],
  },
  {
    career: 'pharmacist',
    keySubjects: ['Chemistry', 'Biology', 'Mathematics'],
    supportingSubjects: ['Physics', 'English', 'Psychology'],
    focusAreas: ['Pharmaceutical science', 'Patient communication', 'Attention to detail'],
    nextDecisions: ['Focus on chemistry and biology at higher levels', 'Research pharmacy degree requirements', 'Get experience in a pharmacy setting'],
    whySubjectsMatter: 'Pharmacy is built on chemistry and biology — understanding how drugs interact with the body is essential.',
    aliases: ['pharmacy', 'pharmaceutical', 'dispensing'],
  },
  {
    career: 'pilot',
    keySubjects: ['Mathematics', 'Physics', 'English'],
    supportingSubjects: ['Geography', 'Computer Science', 'Design & Technology'],
    focusAreas: ['Navigation and spatial awareness', 'Technical understanding', 'Communication under pressure'],
    nextDecisions: ['Strengthen maths and physics', 'Research pilot training programmes', 'Look into flight simulation or air cadet programmes'],
    whySubjectsMatter: 'Flying requires strong maths and physics for navigation, aerodynamics, and decision-making.',
    aliases: ['aviation', 'flight', 'airline', 'aircraft'],
  },
  {
    career: 'musician',
    keySubjects: ['Music', 'English', 'Mathematics'],
    supportingSubjects: ['Drama', 'Media Studies', 'Business Studies'],
    focusAreas: ['Musical skill and theory', 'Performance confidence', 'Self-promotion and networking'],
    nextDecisions: ['Keep practising your instrument or voice', 'Study music theory', 'Perform wherever you can — open mics, school events'],
    whySubjectsMatter: 'Music requires dedicated practice and theoretical understanding — but business skills help you build a career from your talent.',
    aliases: ['singer', 'composer', 'producer', 'DJ', 'performer'],
  },
];

// ── Fuzzy career matching ────────────────────────────────────────────

function normalise(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function getCareerSubjectMapping(careerTitle: string): CareerSubjectMapping | null {
  const norm = normalise(careerTitle);
  // Direct match
  const direct = CAREER_SUBJECT_MAP.find((m) => normalise(m.career) === norm);
  if (direct) return direct;
  // Alias match — any alias is contained in the career title
  const aliasMatch = CAREER_SUBJECT_MAP.find((m) =>
    m.aliases?.some((a) => norm.includes(normalise(a)))
  );
  if (aliasMatch) return aliasMatch;
  // Partial match — career title contains the keyword
  const partial = CAREER_SUBJECT_MAP.find((m) => norm.includes(normalise(m.career)));
  if (partial) return partial;
  // Keyword match in reverse
  const reverse = CAREER_SUBJECT_MAP.find((m) => normalise(m.career).includes(norm));
  if (reverse) return reverse;

  // Generic fallback — generate a reasonable mapping from keywords
  return generateGenericMapping(careerTitle);
}

function generateGenericMapping(careerTitle: string): CareerSubjectMapping {
  const lower = careerTitle.toLowerCase();

  // Detect domain from keywords
  const isScience = /bio|chem|lab|medical|health|pharm|science|research/i.test(lower);
  const isTech = /tech|software|data|digital|cyber|comput|IT|web|dev/i.test(lower);
  const isCreative = /design|art|creative|media|film|photo|music|writ/i.test(lower);
  const isBusiness = /business|manage|finance|account|market|sales|consult/i.test(lower);
  const isTrades = /electric|plumb|mechanic|construct|weld|carpent|build/i.test(lower);
  const isPeople = /social|care|teach|counsel|nurs|psych|communit/i.test(lower);

  if (isScience) {
    return {
      career: careerTitle,
      keySubjects: ['Biology', 'Chemistry', 'Mathematics'],
      supportingSubjects: ['Physics', 'English', 'Computer Science'],
      focusAreas: ['Scientific thinking', 'Laboratory skills', 'Research methods'],
      nextDecisions: ['Focus on science subjects', 'Research relevant degree programmes', 'Look for science-related work experience'],
      whySubjectsMatter: 'Science careers require strong foundations in biology, chemistry, and maths to understand and apply scientific principles.',
    };
  }
  if (isTech) {
    return {
      career: careerTitle,
      keySubjects: ['Mathematics', 'Computer Science', 'Physics'],
      supportingSubjects: ['English', 'Design & Technology', 'Business Studies'],
      focusAreas: ['Logical thinking', 'Problem-solving', 'Technical skills'],
      nextDecisions: ['Strengthen maths and computing', 'Start building projects', 'Research tech pathways'],
      whySubjectsMatter: 'Technology careers build on logical and mathematical thinking — coding and problem-solving are core skills.',
    };
  }
  if (isCreative) {
    return {
      career: careerTitle,
      keySubjects: ['Art & Design', 'English', 'Media Studies'],
      supportingSubjects: ['Design & Technology', 'Computer Science', 'Business Studies'],
      focusAreas: ['Creative expression', 'Technical craft skills', 'Portfolio building'],
      nextDecisions: ['Build a portfolio of work', 'Learn relevant software tools', 'Research creative programmes'],
      whySubjectsMatter: 'Creative careers combine artistic talent with technical skill — practice and a strong portfolio open doors.',
    };
  }
  if (isBusiness) {
    return {
      career: careerTitle,
      keySubjects: ['Business Studies', 'Mathematics', 'English'],
      supportingSubjects: ['Economics', 'Computer Science', 'Psychology'],
      focusAreas: ['Financial literacy', 'Communication', 'Strategic thinking'],
      nextDecisions: ['Choose business and maths subjects', 'Research relevant degrees or apprenticeships', 'Start a small project or venture'],
      whySubjectsMatter: 'Business careers need numeracy, communication, and understanding of how organisations work.',
    };
  }
  if (isTrades) {
    return {
      career: careerTitle,
      keySubjects: ['Mathematics', 'Physics', 'Design & Technology'],
      supportingSubjects: ['Computer Science', 'English', 'Business Studies'],
      focusAreas: ['Practical problem-solving', 'Technical knowledge', 'Safety awareness'],
      nextDecisions: ['Keep maths and physics', 'Research apprenticeship programmes', 'Get hands-on experience where possible'],
      whySubjectsMatter: 'Trades rely on practical skills backed by maths and physics — understanding how things work keeps people safe.',
    };
  }
  if (isPeople) {
    return {
      career: careerTitle,
      keySubjects: ['English', 'Psychology', 'Sociology'],
      supportingSubjects: ['Biology', 'Health Science', 'Drama'],
      focusAreas: ['Communication skills', 'Understanding people', 'Empathy and patience'],
      nextDecisions: ['Choose subjects that help you understand people', 'Research relevant programmes', 'Volunteer with community organisations'],
      whySubjectsMatter: 'Working with people requires strong communication, empathy, and an understanding of human behaviour.',
    };
  }

  // Truly generic fallback
  return {
    career: careerTitle,
    keySubjects: ['English', 'Mathematics'],
    supportingSubjects: ['Computer Science', 'Business Studies'],
    focusAreas: ['Communication', 'Problem-solving', 'Self-management'],
    nextDecisions: ['Research what this career involves day to day', 'Identify which subjects are most relevant', 'Look for related work experience'],
    whySubjectsMatter: 'Strong foundations in English and maths support almost every career path.',
  };
}

// ── Subject Alignment Calculation ────────────────────────────────────

export function calculateSubjectAlignment(
  currentSubjects: string[],
  careerTitle: string,
): { alignment: SubjectAlignment; matchedKey: string[]; missingKey: string[] } {
  const mapping = getCareerSubjectMapping(careerTitle);
  if (!mapping) return { alignment: 'unknown', matchedKey: [], missingKey: [] };
  if (currentSubjects.length === 0) return { alignment: 'unknown', matchedKey: [], missingKey: mapping.keySubjects };

  const normSubjects = currentSubjects.map(normalise);
  const matchedKey = mapping.keySubjects.filter((s) => normSubjects.some((cs) => cs.includes(normalise(s)) || normalise(s).includes(cs)));
  const missingKey = mapping.keySubjects.filter((s) => !matchedKey.includes(s));

  const ratio = matchedKey.length / mapping.keySubjects.length;
  if (ratio >= 0.66) return { alignment: 'strong', matchedKey, missingKey };
  if (ratio >= 0.33) return { alignment: 'partial', matchedKey, missingKey };
  return { alignment: 'missing', matchedKey, missingKey };
}

// ── Step Type Classification ─────────────────────────────────────────

export function classifyStepType(item: JourneyItem): RoadmapStepType {
  const title = item.title.toLowerCase();
  const desc = (item.description || '').toLowerCase();
  const combined = `${title} ${desc}`;

  if (item.isMilestone) return 'milestone';

  // School-related keywords
  if (/school|gcse|a-level|ib|exam|subject|grade|coursework|study/i.test(combined)) return 'school';

  // Qualification keywords
  if (/degree|certification|diploma|qualification|licence|accredit/i.test(combined)) return 'qualification';

  // Real-world keywords
  if (/intern|volunteer|job|shadow|work experience|portfolio|project|apply|placement/i.test(combined)) return 'real-world';

  // Stage-based fallback
  const stageMap: Record<JourneyStage, RoadmapStepType> = {
    foundation: 'learning',
    education: 'school',
    experience: 'real-world',
    career: 'milestone',
  };
  return stageMap[item.stage] || 'learning';
}

// ── "Why This Step Matters" Content ──────────────────────────────────

const WHY_PATTERNS: { test: RegExp; why: string }[] = [
  { test: /strength|self-aware|reflect/, why: 'Understanding yourself helps you make better decisions about your future.' },
  { test: /explore.*career|career.*explor|browse.*role/, why: 'Exploring options now helps you find a path that genuinely fits.' },
  { test: /volunteer|communit/, why: 'Volunteering builds real skills and shows initiative to future employers.' },
  { test: /intern|placement|work experience/, why: 'Real-world experience is one of the strongest things on any application.' },
  { test: /portfolio|project|build/, why: 'Building something tangible proves your ability more than any qualification alone.' },
  { test: /course|certif|study|learn/, why: 'Focused learning gives you the knowledge employers and programs look for.' },
  { test: /degree|university|college/, why: 'Formal education opens doors and deepens your expertise in the field.' },
  { test: /network|connect|mentor/, why: 'The people you meet can shape opportunities you never expected.' },
  { test: /apply|application|entry/, why: 'Taking the step to apply turns your preparation into real progress.' },
  { test: /shadow|observe/, why: 'Seeing a role up close helps you understand what the work really involves.' },
  { test: /goal|direction|plan/, why: 'Having a clear direction makes every step feel more intentional.' },
  { test: /skill|practice|develop/, why: 'Building skills now gives you a head start when it matters most.' },
];

export function getWhyItMatters(item: JourneyItem): string {
  const combined = `${item.title} ${item.description || ''} ${(item.microActions || []).join(' ')}`.toLowerCase();
  for (const pattern of WHY_PATTERNS) {
    if (pattern.test.test(combined)) return pattern.why;
  }
  // Stage-based fallback
  const stageFallback: Record<JourneyStage, string> = {
    foundation: 'Building foundations now makes everything that follows easier.',
    education: 'The right knowledge opens doors you can\'t see yet.',
    experience: 'Real experience teaches things no classroom can.',
    career: 'Every step here moves you closer to doing what you care about.',
  };
  return stageFallback[item.stage];
}
