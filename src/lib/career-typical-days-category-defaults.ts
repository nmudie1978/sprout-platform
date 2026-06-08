// Category-appropriate "typical day" fallbacks.
//
// `getCareerDetails` resolves curated → AI-generated → CATEGORY default →
// global default. Before this layer, every career missing curated/generated
// content showed ONE office/project-manager template ("team standup",
// "meetings with stakeholders") — badly wrong for a teacher, nurse, coach,
// electrician, etc. These per-category templates are deliberately generic
// WITHIN a category but right for the kind of work, so the fallback is honest
// rather than misleading. Office/desk categories (business, finance, sales,
// logistics, telecom, real estate, military admin) intentionally have NO entry
// here — the global office default already fits them.

import type { CareerDetails } from "./career-typical-days";
import type { CareerCategory } from "./career-pathways";

export const defaultDetailsByCategory: Partial<Record<CareerCategory, CareerDetails>> = {
  EDUCATION_TRAINING: {
    typicalDay: {
      morning: [
        "Prepare lessons, materials and the room",
        "Greet learners and take attendance",
        "Teach the first classes / sessions of the day",
      ],
      midday: [
        "Run lessons, activities and discussions",
        "Support individual learners who need extra help",
        "Short break or lunch (often used for marking)",
      ],
      afternoon: [
        "Teach afternoon classes or run workshops",
        "Mark work and give feedback",
        "Plan upcoming lessons and update records",
      ],
      environment: "Classroom, training room or online",
    },
    whatYouActuallyDo: [
      "Plan and deliver lessons or training",
      "Explain ideas clearly and adapt to different learners",
      "Assess progress and give constructive feedback",
      "Manage a group and keep everyone engaged",
    ],
    whoThisIsGoodFor: [
      "People who enjoy explaining things and helping others learn",
      "Patient communicators who stay calm under pressure",
      "Those who like variety and working with people",
    ],
    topSkills: ["Communication", "Patience", "Planning", "Adaptability", "Subject knowledge"],
    entryPaths: [
      "Relevant degree or subject expertise",
      "Teaching qualification or training certification",
      "Classroom / training experience or placements",
    ],
    realityCheck:
      "Rewarding but demanding — a lot of planning and marking happens outside teaching hours, and managing a group takes energy.",
  },

  HEALTHCARE_LIFE_SCIENCES: {
    typicalDay: {
      morning: [
        "Handover / briefing on patients or cases",
        "Assessments, checks or first appointments",
        "Plan care or treatment for the day",
      ],
      midday: [
        "See patients, run treatments or procedures",
        "Record notes and update care plans",
        "Coordinate with colleagues and other specialists",
      ],
      afternoon: [
        "Continue appointments, rounds or lab/clinic work",
        "Follow up on results and next steps",
        "Document, handover and prepare for tomorrow",
      ],
      environment: "Clinic, hospital, lab or community setting",
    },
    whatYouActuallyDo: [
      "Assess and care for patients or analyse samples/data",
      "Carry out treatments, tests or procedures accurately",
      "Keep careful records and follow safety protocols",
      "Work as part of a team and communicate with patients",
    ],
    whoThisIsGoodFor: [
      "Caring, precise people who handle responsibility well",
      "Those who stay composed in stressful moments",
      "People motivated by helping others' health and wellbeing",
    ],
    topSkills: ["Attention to detail", "Empathy", "Communication", "Resilience", "Teamwork"],
    entryPaths: [
      "Relevant healthcare/science degree or diploma",
      "Clinical placements and registration/authorisation",
      "Ongoing professional development",
    ],
    realityCheck:
      "Meaningful work, but it can be physically and emotionally demanding, often with shifts and high responsibility.",
  },

  SPORT_FITNESS: {
    typicalDay: {
      morning: [
        "Set up equipment and plan sessions",
        "Early clients, classes or training",
        "Warm-ups and technique coaching",
      ],
      midday: [
        "Run sessions, classes or practice",
        "Give feedback and adjust programmes",
        "Quieter period — admin, prep or own training",
      ],
      afternoon: [
        "Evening clients, teams or classes",
        "Track progress and update plans",
        "Pack down equipment and review the day",
      ],
      environment: "Gym, studio, pitch, pool or outdoors",
    },
    whatYouActuallyDo: [
      "Plan and lead training, classes or coaching sessions",
      "Demonstrate technique and motivate people",
      "Track progress and tailor programmes to goals",
      "Keep people safe and equipment ready",
    ],
    whoThisIsGoodFor: [
      "Energetic, encouraging people who love being active",
      "Those who enjoy motivating and supporting others",
      "People happy with early mornings / evenings and weekends",
    ],
    topSkills: ["Motivation", "Communication", "Programme design", "Energy", "People skills"],
    entryPaths: [
      "Relevant coaching / fitness / sports qualification",
      "First-aid and safeguarding certification",
      "Hands-on coaching or instructing experience",
    ],
    realityCheck:
      "Hugely rewarding when people progress, but the hours follow clients (early mornings, evenings, weekends) and it's physically active.",
  },

  CREATIVE_MEDIA: {
    typicalDay: {
      morning: [
        "Review the brief and gather references/ideas",
        "Sketch, draft or storyboard concepts",
        "Quick check-in with the team or client",
      ],
      midday: [
        "Deep creative work — designing, writing, shooting or editing",
        "Iterate on drafts and refine the work",
        "Break, then react to feedback",
      ],
      afternoon: [
        "Polish and finalise the piece",
        "Share work for review and make revisions",
        "Plan the next project or deliverable",
      ],
      environment: "Studio, office or on location",
    },
    whatYouActuallyDo: [
      "Turn a brief into finished creative work",
      "Generate ideas and iterate based on feedback",
      "Use creative tools and craft to a high standard",
      "Balance creative vision with deadlines and client needs",
    ],
    whoThisIsGoodFor: [
      "Imaginative people who can take and use feedback",
      "Those who enjoy making things and solving problems visually or in words",
      "People comfortable with deadlines and revisions",
    ],
    topSkills: ["Creativity", "Craft / tools", "Communication", "Time management", "Resilience to feedback"],
    entryPaths: [
      "A strong portfolio (often matters more than a specific degree)",
      "Relevant creative course, degree or self-taught skills",
      "Internships, freelance work or junior roles",
    ],
    realityCheck:
      "Creative and varied, but work gets critiqued and revised, deadlines are real, and early roles can be competitive or freelance.",
  },

  MANUFACTURING_ENGINEERING: {
    typicalDay: {
      morning: [
        "Review tasks, drawings or specs for the day",
        "Safety and equipment checks",
        "Design, build, test or troubleshoot work begins",
      ],
      midday: [
        "Hands-on or technical work — modelling, testing, fixing or building",
        "Solve problems as they come up",
        "Coordinate with the team and document progress",
      ],
      afternoon: [
        "Continue project / production work",
        "Quality checks and measurements",
        "Log results, hand over and plan next steps",
      ],
      environment: "Workshop, plant, lab or site (plus some desk work)",
    },
    whatYouActuallyDo: [
      "Design, build, test or maintain systems and products",
      "Solve technical problems methodically",
      "Follow specs, standards and safety procedures",
      "Measure, document and improve quality",
    ],
    whoThisIsGoodFor: [
      "Practical problem-solvers who like how things work",
      "Precise, methodical people who enjoy building or fixing",
      "Those comfortable mixing hands-on and technical work",
    ],
    topSkills: ["Problem-solving", "Technical/maths skills", "Precision", "Safety awareness", "Teamwork"],
    entryPaths: [
      "Relevant engineering/technical degree or apprenticeship",
      "Vocational qualifications and practical training",
      "Placements or junior technician roles",
    ],
    realityCheck:
      "Satisfying when something works, but it can involve strict standards, problem-solving under pressure, and shift or site work.",
  },

  CONSTRUCTION_TRADES: {
    typicalDay: {
      morning: [
        "Arrive on site, safety briefing and set up",
        "Check materials, tools and the day's tasks",
        "Start the build / installation / repair work",
      ],
      midday: [
        "Hands-on work — installing, fitting, fixing or building",
        "Measure, cut and problem-solve as you go",
        "Break, then coordinate with other trades",
      ],
      afternoon: [
        "Continue and finish the day's work to standard",
        "Quality and safety checks",
        "Clear up, secure the site and plan tomorrow",
      ],
      environment: "On site, indoors or outdoors (often physical)",
    },
    whatYouActuallyDo: [
      "Build, install, fit or repair to a standard",
      "Read plans and measure accurately",
      "Use tools and materials safely",
      "Solve practical problems on the job",
    ],
    whoThisIsGoodFor: [
      "Practical, hands-on people who like seeing real results",
      "Those who enjoy physical work and problem-solving",
      "People who take pride in doing a job properly",
    ],
    topSkills: ["Practical skill", "Precision", "Safety awareness", "Problem-solving", "Reliability"],
    entryPaths: [
      "Apprenticeship or trade qualification",
      "Vocational training and certifications",
      "On-the-job experience with a qualified tradesperson",
    ],
    realityCheck:
      "Good pay and real, visible results, but it's physical, often outdoors or early-starting, and standards/safety matter.",
  },

  HOSPITALITY_TOURISM: {
    typicalDay: {
      morning: [
        "Set up and prep for service or guests",
        "Brief with the team on the day ahead",
        "Welcome early guests / start service",
      ],
      midday: [
        "Busy service period — serving, hosting or guiding",
        "Solve guest requests and issues on the spot",
        "Reset and prepare for the next wave",
      ],
      afternoon: [
        "Continue service or run afternoon/evening shifts",
        "Keep standards, cleanliness and stock in check",
        "Close down, cash up and hand over",
      ],
      environment: "Restaurant, hotel, venue or on the move (shift work)",
    },
    whatYouActuallyDo: [
      "Look after guests and deliver a good experience",
      "Work fast and stay calm during busy periods",
      "Solve problems and keep standards high",
      "Work closely with a team through a shift",
    ],
    whoThisIsGoodFor: [
      "Friendly, energetic people who enjoy serving others",
      "Those who stay calm and positive when it's busy",
      "People happy with shifts, evenings and weekends",
    ],
    topSkills: ["People skills", "Staying calm under pressure", "Teamwork", "Attention to detail", "Stamina"],
    entryPaths: [
      "Often entry-level with on-the-job training",
      "Hospitality / tourism courses or apprenticeships",
      "Experience and progression into supervisory roles",
    ],
    realityCheck:
      "Sociable and fast-paced, but it's shift-based (evenings, weekends, holidays), on your feet, and busy periods are intense.",
  },

  SOCIAL_CARE_COMMUNITY: {
    typicalDay: {
      morning: [
        "Check handover notes and the day's plan",
        "Visit or meet the people you support",
        "Help with the morning's needs or activities",
      ],
      midday: [
        "Support people with daily life, goals or wellbeing",
        "Coordinate with families, colleagues or services",
        "Record what's happened and any changes",
      ],
      afternoon: [
        "Continue visits, sessions or support",
        "Follow up on referrals or next steps",
        "Update records and hand over safely",
      ],
      environment: "People's homes, community settings or a centre",
    },
    whatYouActuallyDo: [
      "Support people's wellbeing, independence or goals",
      "Listen, build trust and respond to needs",
      "Coordinate with families, colleagues and services",
      "Keep careful, confidential records",
    ],
    whoThisIsGoodFor: [
      "Caring, patient people who want to make a difference",
      "Good listeners who stay calm and non-judgemental",
      "Those who can set boundaries while supporting others",
    ],
    topSkills: ["Empathy", "Communication", "Patience", "Resilience", "Organisation"],
    entryPaths: [
      "Relevant care / social work qualification or training",
      "Background checks and safeguarding training",
      "Supervised practice or placements",
    ],
    realityCheck:
      "Deeply meaningful, but emotionally demanding — you support people through hard times and must look after your own wellbeing too.",
  },

  PUBLIC_SERVICE_SAFETY: {
    typicalDay: {
      morning: [
        "Briefing on the shift and any priorities",
        "Equipment, vehicle or readiness checks",
        "Begin patrols, calls or scheduled duties",
      ],
      midday: [
        "Respond to incidents, requests or tasks",
        "Make assessments and act under procedure",
        "Record what happened and follow up",
      ],
      afternoon: [
        "Continue duties, response or prevention work",
        "Complete reports and paperwork",
        "Handover and prepare for the next shift",
      ],
      environment: "On patrol, on call, or at a station/base (shift work)",
    },
    whatYouActuallyDo: [
      "Protect people, respond to incidents or keep services running",
      "Make calm decisions under pressure and follow procedure",
      "Record events accurately and work as a team",
      "Engage with the public and de-escalate situations",
    ],
    whoThisIsGoodFor: [
      "Level-headed people who want to serve and protect",
      "Those who stay calm in emergencies and follow procedure",
      "People comfortable with shifts and unpredictable days",
    ],
    topSkills: ["Staying calm under pressure", "Decision-making", "Communication", "Teamwork", "Physical fitness"],
    entryPaths: [
      "Relevant entry training and assessments",
      "Fitness, background and medical checks",
      "Structured on-the-job training and probation",
    ],
    realityCheck:
      "Purposeful and team-driven, but shift work, unpredictable situations and real pressure come with it.",
  },

  TECHNOLOGY_IT: {
    typicalDay: {
      morning: [
        "Check messages, tickets or the day's priorities",
        "Short team stand-up / sync",
        "Start focused build, code or systems work",
      ],
      midday: [
        "Deep work — building, debugging or configuring",
        "Test changes and review others' work",
        "Break, then collaborate on tricky problems",
      ],
      afternoon: [
        "Continue development or support tasks",
        "Document, test and deploy or hand off",
        "Plan the next tasks and update tickets",
      ],
      environment: "Office, hybrid or remote (desk-based)",
    },
    whatYouActuallyDo: [
      "Build, configure or maintain software/systems",
      "Solve technical problems and debug issues",
      "Test, document and improve your work",
      "Collaborate with a team and learn continuously",
    ],
    whoThisIsGoodFor: [
      "Logical problem-solvers who like building things",
      "Curious people who enjoy learning fast-changing tools",
      "Those comfortable with focused, detail-heavy work",
    ],
    topSkills: ["Problem-solving", "Technical skills", "Attention to detail", "Continuous learning", "Communication"],
    entryPaths: [
      "Relevant degree, bootcamp or self-taught skills + portfolio",
      "Internships or junior roles",
      "Certifications and ongoing learning",
    ],
    realityCheck:
      "Well-paid and flexible, but the tools change constantly, debugging can be frustrating, and you never stop learning.",
  },

  ARTIFICIAL_INTELLIGENCE: {
    typicalDay: {
      morning: [
        "Review goals, data or model results",
        "Short team sync on priorities",
        "Start experiments, data work or coding",
      ],
      midday: [
        "Build and test models, pipelines or prompts",
        "Analyse results and iterate",
        "Break, then discuss findings with the team",
      ],
      afternoon: [
        "Refine approaches and run further experiments",
        "Document results and share with the team",
        "Plan the next experiments or deployment",
      ],
      environment: "Office, hybrid or remote (desk-based)",
    },
    whatYouActuallyDo: [
      "Work with data, models and experiments",
      "Build, test and improve AI/ML systems or prompts",
      "Analyse results and reason about what works and why",
      "Collaborate and keep up with a fast-moving field",
    ],
    whoThisIsGoodFor: [
      "Analytical, curious people who like data and experimentation",
      "Those comfortable with maths, code and uncertainty",
      "People who enjoy continuous learning",
    ],
    topSkills: ["Analytical thinking", "Coding", "Maths/statistics", "Experimentation", "Continuous learning"],
    entryPaths: [
      "Relevant degree (CS, maths, data) or strong self-taught skills",
      "Projects / portfolio showing real work",
      "Internships, junior roles and ongoing learning",
    ],
    realityCheck:
      "Exciting and fast-moving, but a lot of the work is data wrangling and experiments that don't pan out — and the field changes monthly.",
  },
};

/**
 * Resolve the best default "typical day" for a career's category, falling back
 * to the global office default for categories without a tailored template.
 */
export function defaultDetailsForCategory(
  category: CareerCategory | undefined,
  globalDefault: CareerDetails,
): CareerDetails {
  return (category && defaultDetailsByCategory[category]) || globalDefault;
}
