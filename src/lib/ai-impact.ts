/**
 * AI Impact data — how AI is reshaping each career.
 *
 * Three layers:
 *   Layer 1: impact level + one-line signal (card badge)
 *   Layer 2: "today vs 2030" narrative (Understand tab section)
 *   Layer 3: aggregated trends (AI Career Tracker page)
 *
 * Sources: WEF Future of Jobs 2025, OECD Employment Outlook 2025,
 * McKinsey Global Institute, Felten et al. AI Exposure Index.
 * All interpretations are editorial estimates, not predictions.
 *
 * Add careers by editing AI_IMPACT_DATA — no code changes needed.
 */

// ── Types ──────────────────────────────────────────────────────────

export type AIImpactLevel = 'high' | 'medium' | 'low';

export interface AIImpactEntry {
  level: AIImpactLevel;
  /** One-line signal shown on career cards. Max ~120 chars. */
  signal: string;
  /** What this job looks like TODAY (2-3 sentences). */
  today: string;
  /** What this job will likely look like by ~2030 (2-3 sentences). */
  outlook2030: string;
  /** Skills that become MORE valuable because of AI. */
  skillsGaining: string[];
  /** Skills/tasks that AI will handle or reduce demand for. */
  skillsDecreasing: string[];
  /** Opportunity framing — what a smart student should focus on. */
  studentAdvice: string;
}

// ── Emerging AI roles (Layer 3) ────────────────────────────────────

export interface EmergingRole {
  title: string;
  description: string;
  demandTrend: 'surging' | 'growing' | 'emerging';
  relatedCareers: string[]; // careerIds this role branches from
}

export const EMERGING_AI_ROLES: EmergingRole[] = [
  { title: 'AI/ML Engineer', description: 'Builds and deploys machine learning models that power products — from recommendation systems to autonomous vehicles.', demandTrend: 'surging', relatedCareers: ['software-developer', 'data-analyst'] },
  { title: 'Prompt Engineer', description: 'Designs and optimises instructions for large language models. A new discipline at the intersection of linguistics, logic, and domain expertise.', demandTrend: 'growing', relatedCareers: ['software-developer', 'copywriter'] },
  { title: 'AI Ethics & Governance Officer', description: 'Ensures AI systems are fair, transparent, and compliant with regulation. Combines law, philosophy, and technical understanding.', demandTrend: 'emerging', relatedCareers: ['lawyer', 'social-worker'] },
  { title: 'AI Trainer / Data Annotator (Senior)', description: 'Teaches AI systems by curating and labelling training data. Senior roles involve designing annotation schemas and quality frameworks.', demandTrend: 'growing', relatedCareers: ['teacher', 'data-analyst'] },
  { title: 'Robotics Integration Specialist', description: 'Deploys and maintains AI-powered robots in warehouses, hospitals, and factories. Bridges software and physical systems.', demandTrend: 'growing', relatedCareers: ['engineer', 'electrician'] },
  { title: 'AI Product Manager', description: 'Manages products that have AI at their core — defines what the model should do, not how it works technically.', demandTrend: 'surging', relatedCareers: ['project-manager', 'software-developer'] },
  { title: 'Human-AI Interaction Designer', description: 'Designs how humans and AI collaborate — conversational interfaces, copilot UX, trust signals. A new branch of UX design.', demandTrend: 'emerging', relatedCareers: ['designer', 'psychologist'] },
  { title: 'AI Safety Researcher', description: 'Works on making AI systems safe and aligned with human values. One of the most important and fastest-growing research fields.', demandTrend: 'surging', relatedCareers: ['software-developer', 'psychologist'] },
];

// ── Skills taxonomy (Layer 3) ──────────────────────────────────────

export const SKILLS_GAINING_VALUE = [
  { skill: 'Critical thinking & judgment', reason: 'AI generates options; humans must evaluate and decide' },
  { skill: 'Complex communication', reason: 'Persuading, negotiating, and empathising remain deeply human' },
  { skill: 'Creativity & original thinking', reason: 'AI remixes existing patterns; genuine innovation requires human insight' },
  { skill: 'Ethical reasoning', reason: 'Every AI deployment needs someone asking "should we?"' },
  { skill: 'AI literacy & tool fluency', reason: 'Using AI tools effectively is becoming as essential as using a computer' },
  { skill: 'Interdisciplinary problem-solving', reason: 'Real-world problems cross domain boundaries that AI struggles with' },
  { skill: 'Emotional intelligence', reason: 'Healthcare, education, and leadership depend on reading people, not data' },
  { skill: 'Systems thinking', reason: 'Understanding how complex systems interact — AI handles components, humans handle connections' },
];

export const SKILLS_DECREASING_VALUE = [
  { skill: 'Routine data entry & processing', reason: 'AI handles structured data faster and more accurately' },
  { skill: 'Basic translation & transcription', reason: 'Machine translation quality now exceeds average human translators for most languages' },
  { skill: 'Standard code generation', reason: 'AI coding tools write boilerplate; the value shifts to architecture and review' },
  { skill: 'Template-based writing', reason: 'Reports, summaries, and form letters are increasingly AI-generated' },
  { skill: 'Manual image/document classification', reason: 'Computer vision handles this at scale' },
  { skill: 'Routine legal research', reason: 'AI tools search case law faster than junior associates' },
];

// ── Per-career AI impact data ──────────────────────────────────────

const AI_IMPACT_DATA: Record<string, AIImpactEntry> = {
  'software-developer': {
    level: 'high',
    signal: 'AI coding tools are reshaping daily workflow. Developers who use AI effectively will be significantly more productive.',
    today: 'Developers write code, review pull requests, debug issues, and design systems. Most tasks involve translating requirements into working software.',
    outlook2030: 'AI copilots will write 40-60% of routine code. Developers shift toward system design, code review, AI-tool orchestration, and solving problems that require understanding context AI can\'t access. Fewer junior "code monkey" roles; more demand for architects and AI-augmented developers.',
    skillsGaining: ['System architecture', 'AI tool fluency', 'Code review & quality', 'Problem decomposition'],
    skillsDecreasing: ['Boilerplate code writing', 'Simple bug fixes', 'Standard CRUD implementations'],
    studentAdvice: 'Learn to use AI coding tools NOW — they\'re already standard. Focus on understanding WHY code works, not just writing it. Architecture and design skills will matter more than raw coding speed.',
  },
  doctor: {
    level: 'medium',
    signal: 'AI assists with diagnostics and imaging but clinical judgment, patient relationships, and procedural skills remain central.',
    today: 'Doctors examine patients, interpret test results, make diagnoses, prescribe treatment, perform procedures, and manage complex care decisions.',
    outlook2030: 'AI will pre-screen imaging (radiology, pathology), suggest differential diagnoses, and flag drug interactions automatically. Doctors shift toward complex cases, patient communication, and treatment decisions where context and empathy matter. Administrative burden decreases significantly.',
    skillsGaining: ['Complex clinical reasoning', 'Patient communication', 'AI-assisted decision-making', 'Interdisciplinary care coordination'],
    skillsDecreasing: ['Routine image reading', 'Standard prescription lookups', 'Administrative documentation'],
    studentAdvice: 'Medicine is one of the most AI-resilient careers — the human element is irreplaceable. But learn to work WITH AI diagnostic tools, not against them. The best doctors in 2030 will be those who combine clinical intuition with AI-augmented analysis.',
  },
  nurse: {
    level: 'low',
    signal: 'Nursing is highly AI-resilient — physical care, patient advocacy, and clinical judgment require human presence.',
    today: 'Nurses provide direct patient care, administer medications, monitor vital signs, coordinate with doctors, and advocate for patients.',
    outlook2030: 'AI will help with monitoring (early warning systems, vitals analysis), documentation, and scheduling. But the core of nursing — physical care, emotional support, rapid clinical assessment, and patient advocacy — remains deeply human. Demand for nurses will INCREASE as populations age.',
    skillsGaining: ['AI-assisted patient monitoring', 'Complex care coordination', 'Telehealth skills'],
    skillsDecreasing: ['Manual charting', 'Routine vital sign logging'],
    studentAdvice: 'Nursing is one of the safest career choices in an AI world. Focus on specialisation (intensiv, anestesi, jordmor) to maximise both impact and salary. The human touch is your permanent competitive advantage.',
  },
  lawyer: {
    level: 'high',
    signal: 'AI is transforming legal research and document review. The value shifts from finding information to applying judgment.',
    today: 'Lawyers research case law, draft contracts, advise clients, negotiate deals, and represent clients in disputes.',
    outlook2030: 'AI handles 70-80% of legal research, contract review, and document drafting. Junior associate roles shrink dramatically. Lawyers who thrive will focus on strategy, client relationships, courtroom advocacy, and novel legal arguments that AI can\'t generate from precedent.',
    skillsGaining: ['Legal strategy & judgment', 'Client relationship management', 'Negotiation', 'AI tool supervision'],
    skillsDecreasing: ['Routine legal research', 'Standard contract drafting', 'Document review & discovery'],
    studentAdvice: 'Law is still a great career — but the entry path is changing. Junior roles that were "research and review" are being automated. Focus on areas where human judgment matters most: litigation, M&A advisory, regulatory compliance in new domains (AI law, climate law).',
  },
  teacher: {
    level: 'medium',
    signal: 'AI personalises learning at scale but can\'t replace the mentor relationship, classroom management, or inspiration that teachers provide.',
    today: 'Teachers plan lessons, deliver instruction, assess student work, manage classrooms, support individual students, and communicate with parents.',
    outlook2030: 'AI tutors will handle personalised practice and basic assessment. Teachers shift toward mentorship, social-emotional support, project-based learning facilitation, and guiding students through AI-rich learning environments. The role becomes more like a coach and less like a lecturer.',
    skillsGaining: ['Learning facilitation', 'Social-emotional support', 'AI-tool integration', 'Project-based learning design'],
    skillsDecreasing: ['Routine grading', 'Standardised lecture delivery', 'Drill-based practice management'],
    studentAdvice: 'Teaching is evolving, not disappearing. The teachers in highest demand in 2030 will be those who can facilitate learning WITH AI tools, not those who compete against them. Focus on the human elements: inspiration, mentorship, and building a safe classroom culture.',
  },
  psychologist: {
    level: 'low',
    signal: 'Therapy and human connection are deeply AI-resistant. AI may assist with screening but can\'t replace the therapeutic relationship.',
    today: 'Psychologists conduct therapy, psychological assessments, research, and organisational consulting.',
    outlook2030: 'AI chatbots will handle low-acuity mental health screening and provide CBT-style exercises between sessions. But complex therapy, trauma work, assessment, and the therapeutic alliance remain entirely human. Demand grows as mental health awareness increases.',
    skillsGaining: ['Complex therapeutic skills', 'AI-assisted screening interpretation', 'Digital mental health integration'],
    skillsDecreasing: ['Basic screening questionnaires', 'Standardised test administration'],
    studentAdvice: 'Psychology is deeply AI-resilient — the therapeutic relationship is irreplaceable. AI tools will help you reach more patients and handle routine screening, but the core skill set (empathy, clinical judgment, human connection) is your permanent moat.',
  },
  accountant: {
    level: 'high',
    signal: 'AI automates bookkeeping and routine compliance. The role is shifting from recording numbers to interpreting and advising.',
    today: 'Accountants prepare financial statements, manage bookkeeping, handle tax compliance, audit accounts, and advise on financial decisions.',
    outlook2030: 'AI handles 80%+ of bookkeeping, receipt processing, and standard tax returns. Accountants who survive focus on advisory: tax strategy, business consulting, forensic accounting, and interpreting financial data for decision-making. The "number cruncher" archetype is disappearing.',
    skillsGaining: ['Financial advisory & strategy', 'Business consulting', 'AI-tool management', 'Data interpretation'],
    skillsDecreasing: ['Manual bookkeeping', 'Standard tax return preparation', 'Receipt processing'],
    studentAdvice: 'Don\'t study accounting to do bookkeeping — AI will handle that. Study accounting to become a FINANCIAL ADVISOR who understands the numbers deeply enough to give strategic advice. The advisory accountant is in high demand; the data-entry accountant is not.',
  },
  'project-manager': {
    level: 'medium',
    signal: 'AI automates scheduling, reporting, and status tracking. The human value is in leadership, stakeholder navigation, and decision-making under uncertainty.',
    today: 'PMs plan projects, track progress, manage risks, coordinate teams, report to stakeholders, and resolve blockers.',
    outlook2030: 'AI handles project scheduling, automated status reports, risk-flagging from historical data, and resource allocation suggestions. PMs shift toward strategic decision-making, team leadership, stakeholder management, and navigating ambiguity that AI can\'t resolve.',
    skillsGaining: ['Strategic decision-making', 'Stakeholder leadership', 'AI-augmented planning', 'Change management'],
    skillsDecreasing: ['Manual Gantt charts', 'Status report compilation', 'Routine resource scheduling'],
    studentAdvice: 'PM is becoming more about LEADERSHIP and less about ADMINISTRATION. The admin parts are being automated. Focus on learning how to lead teams, navigate politics, and make decisions when the data is incomplete — that\'s the PM of 2030.',
  },
  engineer: {
    level: 'medium',
    signal: 'AI accelerates design and simulation but can\'t replace physical-world judgment, safety responsibility, or site-level decision-making.',
    today: 'Engineers design systems, run simulations, supervise construction/manufacturing, ensure safety compliance, and solve physical-world problems.',
    outlook2030: 'AI dramatically speeds up design iteration, structural simulation, and materials selection. Engineers spend less time on calculation and more on creative problem-solving, safety judgment, and managing AI-generated designs that need human validation.',
    skillsGaining: ['AI-augmented design review', 'Safety judgment', 'Cross-disciplinary problem-solving', 'Sustainability engineering'],
    skillsDecreasing: ['Manual structural calculations', 'Routine CAD drafting', 'Standard simulation setup'],
    studentAdvice: 'Engineering + AI literacy is a powerful combination. Learn to use AI design tools, but never lose the physical-world intuition that tells you "this doesn\'t look right." The engineer who can spot what the AI missed is extremely valuable.',
  },
  'data-analyst': {
    level: 'high',
    signal: 'AI automates routine analysis. The role is evolving from "finding insights" to "asking the right questions and communicating answers."',
    today: 'Data analysts clean data, build dashboards, run queries, identify trends, and present findings to stakeholders.',
    outlook2030: 'AI handles data cleaning, standard dashboard creation, and pattern detection automatically. Analysts who thrive become "data translators" — people who know which questions to ask, can validate AI-generated insights, and communicate findings in ways that drive decisions.',
    skillsGaining: ['Data storytelling', 'Critical evaluation of AI outputs', 'Business acumen', 'Experimental design'],
    skillsDecreasing: ['Manual data cleaning', 'Standard dashboard building', 'Routine SQL queries'],
    studentAdvice: 'Don\'t just learn SQL and Python — learn to ASK GOOD QUESTIONS. The analyst of 2030 is someone who knows what the business needs to know, can direct AI tools to find it, and can explain the answer to a room full of non-technical people.',
  },
  designer: {
    level: 'high',
    signal: 'AI generates visual content rapidly. Designers who direct AI and focus on strategy, UX, and brand thinking will thrive.',
    today: 'Designers create visual identities, user interfaces, marketing materials, products, and experiences.',
    outlook2030: 'AI generates initial design concepts, variations, and production assets in seconds. Designers shift from pixel-pushing to creative direction, user research, design strategy, and curating/refining AI outputs. The role becomes more strategic and less executional.',
    skillsGaining: ['Creative direction', 'AI tool mastery', 'Design strategy', 'User research & empathy'],
    skillsDecreasing: ['Production-level asset creation', 'Standard layout work', 'Stock image selection'],
    studentAdvice: 'Learn AI design tools (Midjourney, Figma AI, etc.) — they\'re already industry standard. But invest equally in understanding PEOPLE: what makes a design work is understanding human psychology, not generating prettier pixels.',
  },
  chef: {
    level: 'low',
    signal: 'Cooking is deeply physical and sensory. AI may help with menu planning and inventory, but kitchen work remains human.',
    today: 'Chefs prepare food, manage kitchens, create menus, train staff, control food costs, and maintain hygiene standards.',
    outlook2030: 'AI assists with menu optimisation (cost, nutrition, allergens), inventory management, and recipe scaling. Robotic kitchen assistants may handle some prep work in large operations. But the core craft — tasting, plating, creativity, managing a brigade under pressure — stays human.',
    skillsGaining: ['AI-assisted menu planning', 'Sustainability & food-waste reduction', 'Dietary specialisation'],
    skillsDecreasing: ['Manual inventory tracking', 'Standard recipe costing calculations'],
    studentAdvice: 'Being a chef is one of the most AI-proof careers there is. The kitchen is physical, sensory, creative, and high-pressure — exactly the combination AI can\'t replicate. Focus on your craft and your palate.',
  },
  architect: {
    level: 'medium',
    signal: 'AI accelerates conceptual design and renders but regulatory knowledge, client relationships, and spatial judgment remain human.',
    today: 'Architects design buildings, navigate regulations, manage client relationships, coordinate with engineers, and oversee construction.',
    outlook2030: 'AI generates initial design concepts from natural-language briefs, runs energy simulations instantly, and produces photorealistic renders in seconds. Architects focus on creative vision, regulatory navigation, client collaboration, and the spatial judgment that comes from understanding how people actually use buildings.',
    skillsGaining: ['AI-augmented design direction', 'Sustainability design', 'Client collaboration', 'Regulatory expertise'],
    skillsDecreasing: ['Manual rendering', 'Basic 3D modelling', 'Standard energy calculations'],
    studentAdvice: 'Architecture is evolving from "drawing buildings" to "thinking about how people live." AI handles the drawing part faster than any human ever could. Your value is in understanding SPACE, LIGHT, REGULATION, and PEOPLE.',
  },
};

// ── Public API ─────────────────────────────────────────────────────

/**
 * Get AI impact data for a specific career. Returns null for careers
 * without curated data — the UI hides the section in that case.
 */
export function getAIImpact(careerId: string): AIImpactEntry | null {
  return AI_IMPACT_DATA[careerId] ?? null;
}

/**
 * Get the impact level badge for a career (or null).
 */
export function getAIImpactLevel(careerId: string): AIImpactLevel | null {
  return AI_IMPACT_DATA[careerId]?.level ?? null;
}

/**
 * All careers with AI impact data, sorted by impact level (high first).
 */
export function getAllAIImpactCareers(): { careerId: string; entry: AIImpactEntry }[] {
  const levelOrder: Record<AIImpactLevel, number> = { high: 0, medium: 1, low: 2 };
  return Object.entries(AI_IMPACT_DATA)
    .map(([careerId, entry]) => ({ careerId, entry }))
    .sort((a, b) => levelOrder[a.entry.level] - levelOrder[b.entry.level]);
}

/**
 * Whether a career has AI impact data.
 */
export function hasAIImpact(careerId: string): boolean {
  return careerId in AI_IMPACT_DATA;
}
