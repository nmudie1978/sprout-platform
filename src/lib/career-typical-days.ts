// Typical day content for careers
// Provides realistic day-in-the-life information for each career

export interface TypicalDaySchedule {
  morning: string[];
  midday: string[];
  afternoon: string[];
  tools?: string[];
  environment?: string;
}

export interface CareerDetails {
  typicalDay: TypicalDaySchedule;
  whatYouActuallyDo: string[];
  whoThisIsGoodFor: string[];
  topSkills: string[];
  entryPaths: string[];
  realityCheck?: string;
}

// Default template for careers without specific content
const defaultDetails: CareerDetails = {
  typicalDay: {
    morning: [
      "Review tasks and priorities for the day",
      "Check emails and messages",
      "Team standup or brief meeting",
    ],
    midday: [
      "Core work tasks",
      "Collaborate with colleagues",
      "Lunch break",
    ],
    afternoon: [
      "Continue project work",
      "Meetings with stakeholders",
      "Wrap up and plan for tomorrow",
    ],
    environment: "Office or hybrid setting",
  },
  whatYouActuallyDo: [
    "Work on assigned projects and tasks",
    "Collaborate with team members",
    "Learn and develop new skills",
    "Report progress to supervisors",
  ],
  whoThisIsGoodFor: [
    "People who enjoy structured work",
    "Those who like learning new things",
    "Team players who communicate well",
  ],
  topSkills: [
    "Communication",
    "Problem-solving",
    "Time management",
    "Teamwork",
    "Adaptability",
  ],
  entryPaths: [
    "Relevant education or training",
    "Entry-level positions",
    "Internships or apprenticeships",
  ],
};

// Career-specific typical day content
const careerDetailsMap: Record<string, CareerDetails> = {
  // ========================================
  // HEALTHCARE & LIFE SCIENCES
  // ========================================
  "doctor": {
    typicalDay: {
      morning: [
        "Review patient list and overnight updates",
        "Morning rounds visiting hospitalized patients",
        "Review test results and imaging",
        "Consult with specialists on complex cases",
      ],
      midday: [
        "Outpatient clinic appointments",
        "Perform procedures or minor surgeries",
        "Document patient encounters in medical records",
        "Quick lunch when possible",
      ],
      afternoon: [
        "Continue patient consultations",
        "Multidisciplinary team meetings",
        "Respond to urgent calls and referrals",
        "Administrative tasks and discharge planning",
      ],
      tools: ["Electronic health records", "Stethoscope", "Diagnostic equipment", "Medical imaging systems"],
      environment: "Hospital, clinic, or private practice (long hours, on-call duties)",
    },
    whatYouActuallyDo: [
      "Diagnose illnesses through examination and tests",
      "Prescribe treatments and medications",
      "Perform medical procedures",
      "Coordinate care with other healthcare providers",
      "Counsel patients on health and lifestyle",
      "Stay current with medical research",
    ],
    whoThisIsGoodFor: [
      "People with strong scientific curiosity",
      "Those who can handle life-and-death decisions",
      "Excellent communicators with empathy",
      "People willing to commit to extensive training",
      "Those who thrive under pressure",
    ],
    topSkills: [
      "Medical knowledge",
      "Diagnostic reasoning",
      "Communication",
      "Empathy",
      "Decision-making under pressure",
      "Continuous learning",
    ],
    entryPaths: [
      "Medical degree (6 years in Norway)",
      "Internship (turnus) - 18 months",
      "Specialization training (3-6 years)",
      "Continuous professional development",
    ],
    realityCheck: "Extremely demanding training path. Long hours, emotional toll, and high responsibility. But deeply meaningful work helping people at their most vulnerable.",
  },

  "healthcare-worker": {
    typicalDay: {
      morning: [
        "Shift handover and patient status updates",
        "Help residents with morning hygiene and dressing",
        "Assist with breakfast and medications",
        "Morning activities with residents",
      ],
      midday: [
        "Monitor resident wellbeing",
        "Assist with lunch and hydration",
        "Documentation in care records",
        "Brief walks or activities with mobile residents",
      ],
      afternoon: [
        "Afternoon care routines",
        "Engage residents in social activities",
        "Prepare for evening routines",
        "Handover to next shift with detailed notes",
      ],
      tools: ["Care documentation systems", "Medical equipment (blood pressure, thermometer)", "Mobility aids"],
      environment: "Nursing homes, hospitals, home care (shift work including nights/weekends)",
    },
    whatYouActuallyDo: [
      "Assist with daily activities (hygiene, dressing, eating)",
      "Monitor and report changes in health",
      "Provide emotional support and companionship",
      "Administer basic medications under supervision",
      "Document care activities",
      "Support families and loved ones",
    ],
    whoThisIsGoodFor: [
      "Caring, patient individuals",
      "People comfortable with physical work",
      "Those who find meaning in helping others",
      "Good communicators with empathy",
      "People who stay calm in difficult situations",
    ],
    topSkills: [
      "Empathy and patience",
      "Physical stamina",
      "Communication",
      "Observation skills",
      "Reliability",
      "Teamwork",
    ],
    entryPaths: [
      "Vocational training (VG1 + VG2) - 2 years",
      "Apprenticeship - 2 years",
      "Fagbrev (certificate) after completion",
      "Can advance to nursing with further education",
    ],
    realityCheck: "Physically demanding work with irregular hours. Can be emotionally challenging, but incredibly rewarding when you see the difference you make in people's lives.",
  },

  "dentist": {
    typicalDay: {
      morning: [
        "Review day's patient schedule",
        "Morning patient consultations",
        "Perform examinations and cleanings",
        "Take and analyse X-rays",
      ],
      midday: [
        "Restorative procedures (fillings, crowns)",
        "Brief lunch break",
        "Emergency appointments if needed",
        "Document treatments and plans",
      ],
      afternoon: [
        "Continue patient treatments",
        "Consultations on treatment plans",
        "Complex procedures (extractions, root canals)",
        "Administrative tasks and next-day preparation",
      ],
      tools: ["Dental drill", "X-ray equipment", "Dental instruments", "Electronic patient records"],
      environment: "Dental clinic or private practice (regular business hours)",
    },
    whatYouActuallyDo: [
      "Examine teeth and diagnose problems",
      "Perform fillings, extractions, and repairs",
      "Create treatment plans",
      "Take and interpret dental X-rays",
      "Educate patients on oral hygiene",
      "Manage dental emergencies",
    ],
    whoThisIsGoodFor: [
      "Detail-oriented perfectionists",
      "People with steady hands",
      "Good communicators who can calm anxious patients",
      "Those interested in healthcare with regular hours",
      "People who like working independently",
    ],
    topSkills: [
      "Manual dexterity",
      "Precision and attention to detail",
      "Patient communication",
      "Problem diagnosis",
      "Business management",
      "Calm demeanor",
    ],
    entryPaths: [
      "Dental degree at University of Oslo or Bergen (5 years)",
      "Clinical practice during studies",
      "Authorization from health authorities",
      "Optional: Specialization (3+ years)",
    ],
    realityCheck: "Many patients are anxious or scared. The work is repetitive but requires precision. Good work-life balance compared to many medical careers.",
  },

  "pharmacist": {
    typicalDay: {
      morning: [
        "Open pharmacy and check systems",
        "Process overnight prescription orders",
        "Verify and dispense prescriptions",
        "Customer consultations on medications",
      ],
      midday: [
        "Continue dispensing and advising",
        "Check drug interactions on prescriptions",
        "Manage inventory and orders",
        "Staff supervision and training",
      ],
      afternoon: [
        "Patient medication reviews",
        "Coordinate with doctors on prescriptions",
        "Health product recommendations",
        "Administrative tasks and closing procedures",
      ],
      tools: ["Pharmacy dispensing systems", "Drug interaction databases", "Patient record systems"],
      environment: "Pharmacy (retail or hospital), regular business hours or shifts",
    },
    whatYouActuallyDo: [
      "Dispense prescription medications accurately",
      "Advise patients on medication use and side effects",
      "Check for drug interactions",
      "Recommend over-the-counter products",
      "Manage pharmacy operations",
      "Coordinate with healthcare providers",
    ],
    whoThisIsGoodFor: [
      "Detail-oriented, careful individuals",
      "People who enjoy helping and advising others",
      "Those interested in chemistry and medicine",
      "Good communicators",
      "People who prefer regular schedules",
    ],
    topSkills: [
      "Pharmaceutical knowledge",
      "Attention to detail",
      "Customer service",
      "Communication",
      "Problem-solving",
      "Ethical judgment",
    ],
    entryPaths: [
      "Master's in Pharmacy (5 years)",
      "Praktisk farmasøytisk utdanning (practical training)",
      "Authorization from health authorities",
      "Continuous professional development required",
    ],
    realityCheck: "The work is largely routine dispensing, not research. You'll spend a lot of time on customer service and admin. Job security is good.",
  },

  "physiotherapist": {
    typicalDay: {
      morning: [
        "Review patient appointments and notes",
        "Initial patient assessments",
        "Hands-on treatment sessions",
        "Exercise instruction and demonstration",
      ],
      midday: [
        "Continue treatment sessions",
        "Document patient progress",
        "Brief consultations with doctors",
        "Quick lunch break",
      ],
      afternoon: [
        "Group exercise classes",
        "Follow-up appointments",
        "Treatment plan adjustments",
        "Administrative tasks and preparation",
      ],
      tools: ["Treatment tables", "Exercise equipment", "Ultrasound/electrotherapy devices", "Patient management software"],
      environment: "Clinic, hospital, sports facility, or private practice",
    },
    whatYouActuallyDo: [
      "Assess physical function and movement",
      "Develop personalised treatment plans",
      "Provide hands-on therapy techniques",
      "Teach exercises for rehabilitation",
      "Track and document patient progress",
      "Collaborate with other healthcare providers",
    ],
    whoThisIsGoodFor: [
      "People who enjoy physical, hands-on work",
      "Those interested in anatomy and movement",
      "Patient, encouraging individuals",
      "People who like seeing tangible progress",
      "Those who enjoy working one-on-one",
    ],
    topSkills: [
      "Anatomy and physiology knowledge",
      "Manual therapy techniques",
      "Communication and motivation",
      "Problem-solving",
      "Physical fitness",
      "Patience",
    ],
    entryPaths: [
      "Bachelor's in Physiotherapy (3 years)",
      "Clinical placements during studies",
      "Authorization required",
      "Optional: Master's or specialization",
    ],
    realityCheck: "Physical work that can be tiring. Progress with patients can be slow. But very rewarding to help people regain mobility and reduce pain.",
  },

  "psychologist": {
    typicalDay: {
      morning: [
        "Review patient files before sessions",
        "Individual therapy sessions (45-60 min each)",
        "Document session notes",
        "Brief consultation with colleagues",
      ],
      midday: [
        "Continue therapy sessions",
        "Psychological assessments",
        "Lunch and preparation",
        "Supervision or team meetings",
      ],
      afternoon: [
        "Therapy sessions or group therapy",
        "Treatment planning",
        "Report writing",
        "Professional development reading",
      ],
      tools: ["Assessment tools and tests", "Electronic health records", "Telehealth platforms", "Note-taking systems"],
      environment: "Private practice, hospital, school, or organization (regular hours, some flexibility)",
    },
    whatYouActuallyDo: [
      "Conduct therapy sessions using evidence-based methods",
      "Assess and diagnose mental health conditions",
      "Develop treatment plans",
      "Administer psychological tests",
      "Write reports and documentation",
      "Collaborate with other healthcare providers",
    ],
    whoThisIsGoodFor: [
      "Excellent listeners with empathy",
      "People genuinely interested in human behavior",
      "Those comfortable with emotional intensity",
      "Analytical thinkers",
      "People who maintain professional boundaries",
    ],
    topSkills: [
      "Active listening",
      "Empathy",
      "Assessment and diagnosis",
      "Therapeutic techniques",
      "Communication",
      "Self-care and boundaries",
    ],
    entryPaths: [
      "Professional psychology degree (6 years)",
      "Supervised clinical practice",
      "Authorization as psychologist",
      "Specialist training (optional, 5 years)",
    ],
    realityCheck: "Emotionally demanding work. Long education path. You carry others' problems but must maintain boundaries. Very meaningful when you help people heal.",
  },

  "biomedical-scientist": {
    typicalDay: {
      morning: [
        "Check ongoing experiments",
        "Team meeting or journal club",
        "Lab work: prepare samples and run tests",
        "Analyse yesterday's data",
      ],
      midday: [
        "Continue experiments",
        "Collaborate with research team",
        "Literature review",
        "Lunch and informal discussions",
      ],
      afternoon: [
        "Data analysis and interpretation",
        "Write up findings",
        "Plan next experiments",
        "Mentoring students or junior researchers",
      ],
      tools: ["Lab equipment (microscopes, centrifuges)", "Statistical software", "Reference databases", "Lab information systems"],
      environment: "Research lab at university, hospital, or company (regular hours with flexibility)",
    },
    whatYouActuallyDo: [
      "Design and conduct experiments",
      "Analyse biological and medical data",
      "Write research papers and reports",
      "Present findings at conferences",
      "Apply for research funding",
      "Collaborate with other researchers",
    ],
    whoThisIsGoodFor: [
      "Curious, detail-oriented individuals",
      "People who enjoy solving complex puzzles",
      "Those comfortable with uncertainty",
      "Good at working independently and in teams",
      "Patient people who think long-term",
    ],
    topSkills: [
      "Research methodology",
      "Data analysis",
      "Laboratory techniques",
      "Scientific writing",
      "Critical thinking",
      "Persistence",
    ],
    entryPaths: [
      "Bachelor's in biology, biochemistry, or related field",
      "Master's degree (often required)",
      "PhD for independent research positions",
      "Postdoctoral training common",
    ],
    realityCheck: "Many experiments fail. Funding is competitive. Career progression can be uncertain. But contributing to medical breakthroughs is incredibly rewarding.",
  },

  "paramedic": {
    typicalDay: {
      morning: [
        "Shift briefing and equipment check",
        "Vehicle inspection and supply restock",
        "Respond to emergency calls",
        "Provide on-scene medical care",
      ],
      midday: [
        "Continue emergency responses",
        "Patient transport to hospital",
        "Documentation of calls",
        "Brief breaks between calls",
      ],
      afternoon: [
        "More emergency responses",
        "Handover patients to hospital staff",
        "Equipment cleaning and restocking",
        "Shift handover and documentation",
      ],
      tools: ["Ambulance", "Defibrillator", "Medical equipment", "Communication radio", "Patient monitoring devices"],
      environment: "Ambulance, emergency scenes, hospitals (12-24 hour shifts, nights/weekends)",
    },
    whatYouActuallyDo: [
      "Respond rapidly to medical emergencies",
      "Assess patient conditions on scene",
      "Provide emergency medical treatment",
      "Safely transport patients",
      "Communicate with hospitals and dispatch",
      "Document all care provided",
    ],
    whoThisIsGoodFor: [
      "People who thrive under pressure",
      "Quick decision-makers",
      "Physically fit individuals",
      "Those who want varied, exciting work",
      "Compassionate people who stay calm",
    ],
    topSkills: [
      "Emergency medical care",
      "Calm under pressure",
      "Quick assessment",
      "Physical fitness",
      "Communication",
      "Teamwork",
    ],
    entryPaths: [
      "Vocational training in ambulance work",
      "Bachelor's in paramedicine (for advanced roles)",
      "Driver's license for emergency vehicles",
      "Continuous training required",
    ],
    realityCheck: "You'll see traumatic situations. Shifts are long and unpredictable. Physical demands are high. But you save lives and make a real difference.",
  },

  // ========================================
  // EDUCATION & TRAINING
  // ========================================
  "primary-teacher": {
    typicalDay: {
      morning: [
        "Arrive early to prepare classroom and materials",
        "Greet students as they arrive",
        "Morning assembly or attendance",
        "Teach morning lessons (often maths and Norwegian)",
      ],
      midday: [
        "Supervise lunch and playground",
        "Afternoon lessons (varied subjects)",
        "Individual support for struggling students",
        "Quick parent messages",
      ],
      afternoon: [
        "Arts, PE, or project-based learning",
        "Review and feedback on student work",
        "Staff meetings or preparation",
        "Grading and lesson planning",
      ],
      tools: ["Interactive whiteboard", "Learning management systems", "Educational apps", "Art and craft materials"],
      environment: "Primary school classroom (school hours plus preparation time)",
    },
    whatYouActuallyDo: [
      "Teach foundational subjects to children",
      "Create engaging lesson plans",
      "Assess and track student progress",
      "Support social and emotional development",
      "Communicate with parents",
      "Collaborate with colleagues and specialists",
    ],
    whoThisIsGoodFor: [
      "Patient, nurturing individuals",
      "Creative people who enjoy variety",
      "Those who love working with children",
      "Good communicators",
      "People who want meaningful work",
    ],
    topSkills: [
      "Classroom management",
      "Communication",
      "Patience",
      "Creativity",
      "Adaptability",
      "Organization",
    ],
    entryPaths: [
      "Grunnskolelærerutdanning (4-5 years)",
      "Teaching practice during studies",
      "Can specialise in 1-7 or 5-10 grade levels",
      "Continuous professional development",
    ],
    realityCheck: "Rewarding but demanding. Large classes, behavioral challenges, and lots of admin. But watching children grow and learn is incredibly fulfilling.",
  },

  "secondary-teacher": {
    typicalDay: {
      morning: [
        "Prepare for day's lessons",
        "Teach specialised subject classes",
        "Manage different class groups",
        "Individual student support",
      ],
      midday: [
        "Continue teaching different classes",
        "Department meetings",
        "Supervise students",
        "Quick lunch break",
      ],
      afternoon: [
        "More subject teaching",
        "Grade assignments and exams",
        "Student counseling or meetings",
        "Exam preparation support",
      ],
      tools: ["Subject-specific resources", "Learning platforms", "Assessment systems", "Digital teaching tools"],
      environment: "Secondary school (school hours plus significant preparation and grading)",
    },
    whatYouActuallyDo: [
      "Teach specialised subjects at advanced level",
      "Prepare students for exams and further education",
      "Develop curriculum and materials",
      "Guide students on career and education choices",
      "Grade and provide feedback",
      "Mentor students",
    ],
    whoThisIsGoodFor: [
      "People passionate about their subject",
      "Those who enjoy working with teenagers",
      "Patient but firm communicators",
      "Lifelong learners",
      "People who can inspire curiosity",
    ],
    topSkills: [
      "Subject expertise",
      "Communication",
      "Classroom management",
      "Assessment skills",
      "Patience",
      "Mentoring",
    ],
    entryPaths: [
      "Bachelor's or Master's in subject + teaching qualification",
      "Lektorutdanning (5-year integrated program)",
      "PPU (practical pedagogical education) for graduates",
      "Teaching practice required",
    ],
    realityCheck: "Teenagers can be challenging. Workload with grading is heavy. But deeply rewarding when you spark passion for your subject in students.",
  },

  "kindergarten-teacher": {
    typicalDay: {
      morning: [
        "Welcome children and parents",
        "Free play and supervision",
        "Circle time with songs and activities",
        "Outdoor play (weather permitting)",
      ],
      midday: [
        "Lunch supervision and assistance",
        "Rest time for younger children",
        "Art, music, or learning activities",
        "Document children's development",
      ],
      afternoon: [
        "Structured play activities",
        "Individual attention and support",
        "Parent pick-up and communication",
        "Planning and staff meetings",
      ],
      tools: ["Art supplies", "Educational toys", "Outdoor equipment", "Documentation apps"],
      environment: "Kindergarten (full-day with young children, physically active)",
    },
    whatYouActuallyDo: [
      "Plan and lead play-based learning activities",
      "Support children's social and emotional development",
      "Observe and document children's progress",
      "Ensure safety and wellbeing",
      "Communicate with parents",
      "Create inclusive, stimulating environments",
    ],
    whoThisIsGoodFor: [
      "Playful, creative individuals",
      "Patient people who love young children",
      "Those with high energy",
      "Good communicators with adults and children",
      "People who value early development",
    ],
    topSkills: [
      "Child development knowledge",
      "Creativity",
      "Patience",
      "Communication",
      "Observation skills",
      "Physical stamina",
    ],
    entryPaths: [
      "Bachelor's in Early Childhood Education (3 years)",
      "Practice periods in kindergartens",
      "Can work as assistant while studying",
      "Continuous professional development",
    ],
    realityCheck: "Physically demanding and noisy. But incredibly rewarding to support children during their most formative years.",
  },

  "special-needs-educator": {
    typicalDay: {
      morning: [
        "Prepare adapted materials",
        "Individual or small group teaching sessions",
        "Support students in mainstream classes",
        "Coordinate with classroom teachers",
      ],
      midday: [
        "Continue support sessions",
        "Assess student progress",
        "Document observations",
        "Collaborate with therapists or specialists",
      ],
      afternoon: [
        "Parent meetings or calls",
        "Write individual education plans (IEP)",
        "Team meetings with support staff",
        "Plan adaptations for next day",
      ],
      tools: ["Adapted learning materials", "Assistive technology", "Assessment tools", "Communication aids"],
      environment: "Schools, special units, or resource centers (regular hours)",
    },
    whatYouActuallyDo: [
      "Develop individualized education plans",
      "Adapt teaching methods for different needs",
      "Provide one-on-one or small group support",
      "Assess learning difficulties",
      "Collaborate with parents and professionals",
      "Advocate for students' needs",
    ],
    whoThisIsGoodFor: [
      "Patient, empathetic individuals",
      "Creative problem-solvers",
      "Those committed to inclusion",
      "Good collaborators",
      "People who celebrate small victories",
    ],
    topSkills: [
      "Specialised teaching methods",
      "Patience and empathy",
      "Assessment skills",
      "Collaboration",
      "Creativity",
      "Documentation",
    ],
    entryPaths: [
      "Master's in Special Education",
      "Often builds on teaching degree",
      "Specialised courses available",
      "Experience with diverse learners valued",
    ],
    realityCheck: "Progress can be slow and not always visible. Emotionally demanding. But making a difference for students who struggle is profoundly meaningful.",
  },

  "university-lecturer": {
    typicalDay: {
      morning: [
        "Research work or writing",
        "Prepare lecture materials",
        "Respond to student emails",
        "Faculty meetings",
      ],
      midday: [
        "Deliver lectures or seminars",
        "Office hours for students",
        "Research collaboration meetings",
        "Lunch with colleagues",
      ],
      afternoon: [
        "Supervise student projects or theses",
        "Work on research papers",
        "Grant applications",
        "Administrative tasks",
      ],
      tools: ["Learning management systems", "Research databases", "Presentation software", "Statistical tools"],
      environment: "University campus (flexible hours, peak times during term)",
    },
    whatYouActuallyDo: [
      "Teach university courses",
      "Conduct original research",
      "Supervise student research projects",
      "Write and publish academic papers",
      "Apply for research funding",
      "Contribute to academic administration",
    ],
    whoThisIsGoodFor: [
      "Passionate experts in their field",
      "Independent, self-motivated people",
      "Those who enjoy teaching adults",
      "Strong writers and presenters",
      "People who thrive with flexibility",
    ],
    topSkills: [
      "Research expertise",
      "Teaching and presentation",
      "Academic writing",
      "Critical thinking",
      "Time management",
      "Grant writing",
    ],
    entryPaths: [
      "PhD in relevant field (required)",
      "Postdoctoral research experience",
      "Build publication record",
      "Start as assistant professor/førsteamanuensis",
    ],
    realityCheck: "Competitive field with uncertain career paths. Heavy workload balancing teaching and research. But intellectual freedom and flexibility are significant perks.",
  },

  "corporate-trainer": {
    typicalDay: {
      morning: [
        "Finalize presentation materials",
        "Set up training room or virtual platform",
        "Deliver training session",
        "Facilitate group exercises",
      ],
      midday: [
        "Continue training delivery",
        "Q&A and discussion",
        "Lunch with participants",
        "Gather feedback",
      ],
      afternoon: [
        "Wrap up training session",
        "Meet with stakeholders",
        "Update training materials",
        "Plan upcoming programs",
      ],
      tools: ["PowerPoint/Keynote", "Learning management systems", "Video conferencing", "Interactive tools (Mentimeter, Kahoot)"],
      environment: "Office, training centers, or virtual (travel may be required)",
    },
    whatYouActuallyDo: [
      "Design training programs",
      "Deliver engaging workshops and courses",
      "Assess learning needs",
      "Measure training effectiveness",
      "Coach employees on skills",
      "Stay current with learning trends",
    ],
    whoThisIsGoodFor: [
      "Engaging presenters",
      "People who enjoy helping others develop",
      "Adaptable communicators",
      "Those who like variety in work",
      "Creative instructional designers",
    ],
    topSkills: [
      "Presentation skills",
      "Instructional design",
      "Communication",
      "Subject matter expertise",
      "Facilitation",
      "Evaluation",
    ],
    entryPaths: [
      "Bachelor's in HR, education, or relevant field",
      "Professional certifications (ATD, CIPD)",
      "Experience in subject area first",
      "Start in junior trainer or coordinator role",
    ],
    realityCheck: "Can involve significant travel. Success depends on engaging diverse audiences. But seeing people grow and develop new skills is very satisfying.",
  },

  "childcare-assistant": {
    typicalDay: {
      morning: [
        "Arrive and prepare activity areas",
        "Welcome children and parents",
        "Supervise free play",
        "Assist with breakfast or snacks",
      ],
      midday: [
        "Support organised activities",
        "Help with meals and cleanup",
        "Outdoor play supervision",
        "Change diapers/assist with hygiene",
      ],
      afternoon: [
        "Rest time supervision",
        "Arts and crafts activities",
        "Parent pick-up communication",
        "Clean and organise spaces",
      ],
      tools: ["Art supplies", "Educational toys", "Safety equipment", "Communication apps for parents"],
      environment: "Kindergartens, after-school programs (shift work, active environment)",
    },
    whatYouActuallyDo: [
      "Support children's daily care needs",
      "Assist with activities and play",
      "Ensure children's safety",
      "Help with meals and hygiene",
      "Observe and report on development",
      "Create a warm, inclusive environment",
    ],
    whoThisIsGoodFor: [
      "People who love being around children",
      "Patient, caring individuals",
      "Those comfortable with physical activity",
      "Team players",
      "People who enjoy creative activities",
    ],
    topSkills: [
      "Childcare basics",
      "Patience",
      "Communication",
      "Creativity",
      "Physical stamina",
      "Teamwork",
    ],
    entryPaths: [
      "Vocational training (VG1 + VG2) - 2 years",
      "Apprenticeship - 2 years",
      "Fagbrev as barne- og ungdomsarbeider",
      "Can advance to kindergarten teacher with further education",
    ],
    realityCheck: "Physically tiring with irregular hours. Pay is modest. But working with children and supporting their growth is genuinely rewarding.",
  },

  // TECHNOLOGY & IT
  "software-developer": {
    typicalDay: {
      morning: [
        "Check overnight alerts and bug reports",
        "Daily standup meeting (15 min)",
        "Code review for teammates' pull requests",
        "Start working on your assigned feature or bug fix",
      ],
      midday: [
        "Deep focus coding time",
        "Quick sync with product manager on requirements",
        "Lunch (often with colleagues discussing tech)",
      ],
      afternoon: [
        "Testing your code changes",
        "Documentation and code cleanup",
        "Planning session for next sprint",
        "Respond to Slack messages and help junior devs",
      ],
      tools: ["VS Code", "Git", "Jira", "Slack", "Terminal"],
      environment: "Office, hybrid, or fully remote",
    },
    whatYouActuallyDo: [
      "Write and test code to build features",
      "Fix bugs reported by users or QA",
      "Review other developers' code",
      "Participate in planning and estimation",
      "Debug issues using logs and monitoring tools",
      "Write technical documentation",
    ],
    whoThisIsGoodFor: [
      "People who enjoy solving puzzles",
      "Those who like building things from scratch",
      "Detail-oriented individuals",
      "People comfortable with continuous learning",
      "Those who can focus for long periods",
    ],
    topSkills: [
      "Programming languages (JavaScript, Python, etc.)",
      "Problem-solving and debugging",
      "Version control (Git)",
      "Communication",
      "Logical thinking",
      "Patience and persistence",
    ],
    entryPaths: [
      "Computer science degree (not required)",
      "Coding bootcamp (3-6 months)",
      "Self-taught with portfolio projects",
      "Junior developer or intern role",
    ],
    realityCheck: "Expect lots of time staring at code, debugging frustrating issues, and constant learning. It's rewarding but requires patience.",
  },

  "data-analyst": {
    typicalDay: {
      morning: [
        "Check dashboards for any anomalies",
        "Review overnight data pipeline results",
        "Respond to urgent data questions from teams",
      ],
      midday: [
        "Work on analysis for a business question",
        "Build or update data visualizations",
        "Meeting with stakeholders to present findings",
      ],
      afternoon: [
        "Write SQL queries for new reports",
        "Document your analysis methods",
        "Collaborate with engineers on data quality issues",
      ],
      tools: ["SQL", "Excel", "Tableau/Power BI", "Python", "Google Sheets"],
      environment: "Office or hybrid, often cross-team collaboration",
    },
    whatYouActuallyDo: [
      "Turn raw data into insights that help decisions",
      "Build reports and dashboards",
      "Answer business questions with data",
      "Clean and validate messy datasets",
      "Present findings to non-technical people",
    ],
    whoThisIsGoodFor: [
      "Curious people who ask 'why'",
      "Those who like finding patterns",
      "People who enjoy explaining complex things simply",
      "Detail-oriented individuals",
    ],
    topSkills: [
      "SQL and spreadsheets",
      "Data visualization",
      "Statistical thinking",
      "Communication",
      "Critical thinking",
    ],
    entryPaths: [
      "Analytics or statistics courses online",
      "Business or economics degree",
      "Self-taught SQL and Excel skills",
      "Junior analyst or intern position",
    ],
    realityCheck: "Much of your time is spent cleaning messy data, not doing fancy analysis. Good communication matters as much as technical skills.",
  },

  "data-scientist": {
    typicalDay: {
      morning: [
        "Review model performance metrics",
        "Team standup and sprint planning",
        "Data exploration and feature engineering",
        "Read recent research papers",
      ],
      midday: [
        "Build and train machine learning models",
        "Collaborate with data engineers on pipelines",
        "Stakeholder meeting to discuss project goals",
        "Quick lunch",
      ],
      afternoon: [
        "Model evaluation and tuning",
        "Document methodology and findings",
        "Prepare presentation of results",
        "Code review with team",
      ],
      tools: ["Python", "Jupyter notebooks", "TensorFlow/PyTorch", "SQL", "Cloud platforms"],
      environment: "Office or remote, collaborative research environment",
    },
    whatYouActuallyDo: [
      "Build predictive models using machine learning",
      "Analyse complex datasets for patterns",
      "Design experiments and A/B tests",
      "Present insights to business stakeholders",
      "Deploy models to production",
      "Stay current with AI/ML research",
    ],
    whoThisIsGoodFor: [
      "People who love math and statistics",
      "Curious problem-solvers",
      "Those who enjoy programming",
      "People who can explain complex ideas simply",
      "Continuous learners",
    ],
    topSkills: [
      "Machine learning",
      "Statistics",
      "Python programming",
      "Data visualization",
      "Communication",
      "Critical thinking",
    ],
    entryPaths: [
      "Master's in Data Science, Statistics, or CS",
      "Strong programming and math foundation",
      "Portfolio of ML projects",
      "Start as analyst and grow skills",
    ],
    realityCheck: "More data cleaning than modeling. Business problems often don't need fancy ML. Strong communication skills are essential.",
  },

  "cybersecurity-analyst": {
    typicalDay: {
      morning: [
        "Review overnight security alerts",
        "Check threat intelligence feeds",
        "Analyse suspicious activity logs",
        "Team briefing on current threats",
      ],
      midday: [
        "Investigate potential security incidents",
        "Update security monitoring rules",
        "Vulnerability assessment work",
        "Documentation and reporting",
      ],
      afternoon: [
        "Security awareness training for staff",
        "Penetration testing or security audits",
        "Patch management reviews",
        "Incident response planning",
      ],
      tools: ["SIEM systems", "Vulnerability scanners", "Wireshark", "Security frameworks"],
      environment: "Office or SOC (Security Operations Center), may have on-call duties",
    },
    whatYouActuallyDo: [
      "Monitor systems for security threats",
      "Investigate and respond to incidents",
      "Assess vulnerabilities and risks",
      "Implement security controls",
      "Train employees on security practices",
      "Write security policies and procedures",
    ],
    whoThisIsGoodFor: [
      "Detail-oriented investigators",
      "People who enjoy solving puzzles",
      "Those with strong ethics",
      "Continuous learners (threats evolve)",
      "People who stay calm under pressure",
    ],
    topSkills: [
      "Network and system security",
      "Threat analysis",
      "Incident response",
      "Security tools",
      "Communication",
      "Ethical judgment",
    ],
    entryPaths: [
      "Bachelor's in IT or Cybersecurity",
      "Security certifications (CISSP, CEH, CompTIA Security+)",
      "Start in IT support or network admin",
      "Build home lab for practice",
    ],
    realityCheck: "Constant vigilance required. Attackers evolve faster than defenses. Can be stressful during incidents. But protecting organizations is rewarding.",
  },

  "ux-designer": {
    typicalDay: {
      morning: [
        "Review user research findings",
        "Sketch initial design concepts",
        "Team standup meeting",
        "Design system updates",
      ],
      midday: [
        "Create wireframes and prototypes",
        "User testing sessions",
        "Collaborate with developers on implementation",
        "Lunch and creative break",
      ],
      afternoon: [
        "Iterate on designs based on feedback",
        "Design review with stakeholders",
        "Document design decisions",
        "Prepare for next day's work",
      ],
      tools: ["Figma", "Sketch", "Adobe XD", "Prototyping tools", "User testing platforms"],
      environment: "Office or remote, collaborative with product and development teams",
    },
    whatYouActuallyDo: [
      "Research and understand user needs",
      "Design intuitive interfaces and experiences",
      "Create wireframes, mockups, and prototypes",
      "Conduct user testing and iterate",
      "Collaborate with developers on implementation",
      "Maintain design systems",
    ],
    whoThisIsGoodFor: [
      "Empathetic problem-solvers",
      "Visual and creative thinkers",
      "People who love user psychology",
      "Those who accept constructive criticism",
      "Detail-oriented individuals",
    ],
    topSkills: [
      "User research",
      "Visual design",
      "Prototyping",
      "Interaction design",
      "Communication",
      "Empathy",
    ],
    entryPaths: [
      "Design degree or bootcamp",
      "Strong portfolio essential",
      "Self-taught with online courses",
      "Start in related role (graphic design, development)",
    ],
    realityCheck: "Designs get changed based on business needs. User feedback can be harsh. But creating products people love to use is very satisfying.",
  },

  "cloud-engineer": {
    typicalDay: {
      morning: [
        "Check cloud infrastructure status",
        "Review overnight alerts and metrics",
        "Infrastructure planning meetings",
        "Work on Terraform/CloudFormation code",
      ],
      midday: [
        "Deploy and configure cloud resources",
        "Optimise costs and performance",
        "Security reviews and compliance checks",
        "Documentation updates",
      ],
      afternoon: [
        "Support development teams",
        "Troubleshoot infrastructure issues",
        "Automate manual processes",
        "Learn new cloud services",
      ],
      tools: ["AWS/Azure/GCP", "Terraform", "Kubernetes", "Docker", "Monitoring tools"],
      environment: "Office or remote, often on-call for critical systems",
    },
    whatYouActuallyDo: [
      "Design and build cloud infrastructure",
      "Automate deployments and operations",
      "Optimise cloud costs and performance",
      "Ensure security and compliance",
      "Support development teams",
      "Troubleshoot complex issues",
    ],
    whoThisIsGoodFor: [
      "People who love automation",
      "Problem-solvers who enjoy complexity",
      "Those comfortable with constant learning",
      "Detail-oriented system thinkers",
      "People who like building infrastructure",
    ],
    topSkills: [
      "Cloud platforms (AWS, Azure, GCP)",
      "Infrastructure as Code",
      "Networking",
      "Security",
      "Automation/scripting",
      "Problem-solving",
    ],
    entryPaths: [
      "Bachelor's in IT or related field",
      "Cloud certifications (AWS, Azure, GCP)",
      "Start in IT support or sysadmin",
      "Build projects in cloud platforms",
    ],
    realityCheck: "Technology changes rapidly. On-call can disrupt life. But high demand, good pay, and building scalable systems is exciting.",
  },

  "it-support": {
    typicalDay: {
      morning: [
        "Check ticket queue for new issues",
        "Respond to urgent user problems",
        "Set up new employee workstations",
        "Troubleshoot hardware and software",
      ],
      midday: [
        "Continue resolving support tickets",
        "User training on new systems",
        "Software updates and patches",
        "Quick lunch",
      ],
      afternoon: [
        "Network and printer troubleshooting",
        "Documentation of solutions",
        "Inventory management",
        "Prepare for next day's installations",
      ],
      tools: ["Helpdesk software", "Remote desktop tools", "Diagnostic tools", "Active Directory"],
      environment: "Office-based, may include desk-side support and some remote work",
    },
    whatYouActuallyDo: [
      "Help users solve technical problems",
      "Set up and maintain computers and devices",
      "Install and configure software",
      "Troubleshoot network and connectivity issues",
      "Document solutions and procedures",
      "Train users on technology",
    ],
    whoThisIsGoodFor: [
      "Patient problem-solvers",
      "People who enjoy helping others",
      "Those with good communication skills",
      "Tech-curious learners",
      "People who stay calm under frustration",
    ],
    topSkills: [
      "Technical troubleshooting",
      "Customer service",
      "Communication",
      "Patience",
      "Documentation",
      "Time management",
    ],
    entryPaths: [
      "Vocational IT training or certification",
      "CompTIA A+ or similar certifications",
      "Self-taught with practice",
      "Entry-level helpdesk position",
    ],
    realityCheck: "Can be repetitive. Users sometimes frustrated. But great entry point to IT career with clear growth paths.",
  },

  "devops-engineer": {
    typicalDay: {
      morning: [
        "Check CI/CD pipeline status",
        "Review deployment metrics and alerts",
        "Team standup meeting",
        "Work on automation scripts",
      ],
      midday: [
        "Improve deployment pipelines",
        "Collaborate with developers on releases",
        "Infrastructure improvements",
        "Incident review meetings",
      ],
      afternoon: [
        "Implement monitoring and alerting",
        "Security and compliance tasks",
        "Documentation and knowledge sharing",
        "On-call handover preparation",
      ],
      tools: ["Jenkins/GitLab CI", "Kubernetes", "Docker", "Ansible/Terraform", "Prometheus/Grafana"],
      environment: "Office or remote, often on-call for production issues",
    },
    whatYouActuallyDo: [
      "Build and maintain CI/CD pipelines",
      "Automate infrastructure and deployments",
      "Monitor system health and performance",
      "Respond to production incidents",
      "Bridge development and operations teams",
      "Improve developer productivity",
    ],
    whoThisIsGoodFor: [
      "Automation enthusiasts",
      "People who enjoy both coding and systems",
      "Those comfortable with on-call responsibilities",
      "Problem-solvers who like variety",
      "Collaborative team players",
    ],
    topSkills: [
      "CI/CD tools",
      "Scripting (Python, Bash)",
      "Container orchestration",
      "Cloud platforms",
      "Monitoring and logging",
      "Communication",
    ],
    entryPaths: [
      "Background in development or operations",
      "Learn containerization and CI/CD tools",
      "Cloud certifications helpful",
      "Start as junior DevOps or SRE",
    ],
    realityCheck: "On-call can be disruptive. Fast-paced with constant change. But high demand, good pay, and satisfaction from improving developer experience.",
  },

  "ai-engineer": {
    typicalDay: {
      morning: [
        "Monitor deployed AI models",
        "Review experiment results",
        "Team sync on project priorities",
        "Read latest AI research papers",
      ],
      midday: [
        "Develop and train ML models",
        "Build data pipelines for training",
        "Collaborate with data scientists",
        "Code reviews",
      ],
      afternoon: [
        "Deploy models to production",
        "Optimise model performance",
        "Document systems and processes",
        "Experiment with new techniques",
      ],
      tools: ["Python", "TensorFlow/PyTorch", "MLflow", "Kubernetes", "Cloud ML platforms"],
      environment: "Office or remote, research-oriented with production focus",
    },
    whatYouActuallyDo: [
      "Build and deploy AI/ML systems at scale",
      "Create data pipelines for training models",
      "Optimise model performance and efficiency",
      "Collaborate with data scientists on production",
      "Monitor and maintain deployed models",
      "Stay current with AI advancements",
    ],
    whoThisIsGoodFor: [
      "People passionate about AI/ML",
      "Strong programmers who love math",
      "Those who enjoy research and experimentation",
      "Problem-solvers comfortable with ambiguity",
      "Continuous learners in fast-moving field",
    ],
    topSkills: [
      "Machine learning frameworks",
      "Python and software engineering",
      "MLOps and deployment",
      "Mathematics and statistics",
      "Problem-solving",
      "Research skills",
    ],
    entryPaths: [
      "Master's or PhD in AI/ML/CS (often preferred)",
      "Strong software engineering background",
      "Portfolio of ML projects",
      "Kaggle competitions and open source contributions",
    ],
    realityCheck: "Field moves extremely fast. Many projects don't reach production. But cutting-edge work with potential for significant impact.",
  },

  "it-project-manager": {
    typicalDay: {
      morning: [
        "Review project status and dashboards",
        "Daily standup with development team",
        "Address blockers and risks",
        "Update project documentation",
      ],
      midday: [
        "Stakeholder status meetings",
        "Resource planning and allocation",
        "Budget tracking",
        "Vendor coordination",
      ],
      afternoon: [
        "Sprint planning or backlog refinement",
        "Risk assessment updates",
        "Team one-on-ones",
        "Prepare status reports",
      ],
      tools: ["Jira/Azure DevOps", "MS Project", "Confluence", "Slack/Teams", "Excel"],
      environment: "Office or hybrid, meeting-heavy with cross-team coordination",
    },
    whatYouActuallyDo: [
      "Plan and track IT project timelines",
      "Coordinate development teams and stakeholders",
      "Manage budgets and resources",
      "Identify and mitigate risks",
      "Report progress to leadership",
      "Remove blockers for the team",
    ],
    whoThisIsGoodFor: [
      "Organised, detail-oriented people",
      "Strong communicators",
      "Those who enjoy coordinating teams",
      "Problem-solvers who handle pressure well",
      "People who understand both tech and business",
    ],
    topSkills: [
      "Project management methodologies",
      "Communication",
      "Stakeholder management",
      "Risk management",
      "Technical understanding",
      "Leadership",
    ],
    entryPaths: [
      "Bachelor's in IT, business, or related field",
      "PMP or PRINCE2 certification",
      "Start as technical team member or coordinator",
      "Agile certifications (CSM, SAFe) helpful",
    ],
    realityCheck: "Lots of meetings. Success depends on others' work. Pressure when projects slip. But satisfying to deliver successful projects.",
  },

  "cio": {
    typicalDay: {
      morning: [
        "Review KPIs and security dashboards",
        "Executive leadership meetings",
        "Strategy planning sessions",
        "Meet with direct reports",
      ],
      midday: [
        "Vendor and partner meetings",
        "Budget reviews",
        "Board presentation preparation",
        "Working lunch with stakeholders",
      ],
      afternoon: [
        "Technology strategy discussions",
        "Risk and compliance reviews",
        "Team leadership meetings",
        "Industry networking",
      ],
      tools: ["Executive dashboards", "Strategic planning tools", "Communication platforms"],
      environment: "Executive offices, boardrooms, significant travel possible",
    },
    whatYouActuallyDo: [
      "Set IT strategy aligned with business goals",
      "Lead digital transformation initiatives",
      "Manage IT budgets (often millions)",
      "Report to CEO and board on technology",
      "Build and lead technology teams",
      "Ensure security and compliance",
    ],
    whoThisIsGoodFor: [
      "Strategic thinkers with technical background",
      "Strong leaders and communicators",
      "People who influence at executive level",
      "Those who handle high-pressure decisions",
      "Business-minded technologists",
    ],
    topSkills: [
      "Strategic planning",
      "Leadership",
      "Business acumen",
      "Communication",
      "Technology vision",
      "Risk management",
    ],
    entryPaths: [
      "15+ years IT experience",
      "Progressive leadership roles (manager -> director -> VP)",
      "MBA or Master's in IT management helpful",
      "Proven track record of transformation",
    ],
    realityCheck: "Enormous responsibility and pressure. Always accountable for failures. But opportunity to shape organization's technology future.",
  },

  "agile-coach": {
    typicalDay: {
      morning: [
        "Facilitate team retrospectives",
        "Coach scrum masters on challenges",
        "Observe team ceremonies",
        "Leadership alignment meetings",
      ],
      midday: [
        "Training workshops on agile practices",
        "One-on-one coaching sessions",
        "PI planning facilitation (SAFe)",
        "Working lunch with teams",
      ],
      afternoon: [
        "Process improvement initiatives",
        "Metrics review and analysis",
        "Remove organizational impediments",
        "Prepare coaching materials",
      ],
      tools: ["Agile management tools", "Facilitation materials", "Metrics dashboards", "Collaboration platforms"],
      environment: "Office with multiple teams, may travel between locations",
    },
    whatYouActuallyDo: [
      "Guide organizations in agile adoption",
      "Coach teams and individuals on practices",
      "Facilitate ceremonies and workshops",
      "Remove organizational impediments",
      "Measure and improve team performance",
      "Drive continuous improvement culture",
    ],
    whoThisIsGoodFor: [
      "Patient teachers and mentors",
      "People who influence without authority",
      "Strong facilitators",
      "Those passionate about team effectiveness",
      "Change agents comfortable with resistance",
    ],
    topSkills: [
      "Agile frameworks (Scrum, SAFe, Kanban)",
      "Coaching and facilitation",
      "Communication",
      "Change management",
      "Conflict resolution",
      "Systems thinking",
    ],
    entryPaths: [
      "Experience in agile teams",
      "SAFe or Scrum certifications (SPC, CSP)",
      "Background as scrum master or PM",
      "Formal coaching training helpful",
    ],
    realityCheck: "Change is slow. Organizations resist. Success hard to measure directly. But deeply satisfying to transform team cultures.",
  },

  "network-engineer": {
    typicalDay: {
      morning: [
        "Check network monitoring dashboards",
        "Review overnight alerts",
        "Plan network changes for maintenance window",
        "Team coordination meeting",
      ],
      midday: [
        "Configure routers and switches",
        "Troubleshoot connectivity issues",
        "Security policy updates",
        "Documentation work",
      ],
      afternoon: [
        "Capacity planning analysis",
        "Vendor calls for equipment support",
        "Test new configurations in lab",
        "Prepare for after-hours maintenance",
      ],
      tools: ["Cisco/Juniper equipment", "Network monitoring (Nagios, PRTG)", "Wireshark", "Configuration tools"],
      environment: "Office and data centers, may have on-call and after-hours work",
    },
    whatYouActuallyDo: [
      "Design and implement network solutions",
      "Configure and maintain network equipment",
      "Troubleshoot network issues",
      "Ensure network security",
      "Plan for capacity and growth",
      "Document network architecture",
    ],
    whoThisIsGoodFor: [
      "Methodical problem-solvers",
      "People who enjoy technical complexity",
      "Those comfortable with on-call duties",
      "Detail-oriented individuals",
      "Continuous learners (technology evolves)",
    ],
    topSkills: [
      "Network protocols (TCP/IP, BGP, OSPF)",
      "Router/switch configuration",
      "Network security",
      "Troubleshooting",
      "Documentation",
      "Vendor management",
    ],
    entryPaths: [
      "Bachelor's in IT or network engineering",
      "Cisco certifications (CCNA, CCNP)",
      "Start in IT support or junior network role",
      "Build home lab for practice",
    ],
    realityCheck: "After-hours maintenance common. Blamed when network down. But critical infrastructure role with good job security.",
  },

  "solutions-architect": {
    typicalDay: {
      morning: [
        "Client or stakeholder meetings",
        "Review technical requirements",
        "Architecture design work",
        "Research new technologies",
      ],
      midday: [
        "Present architecture proposals",
        "Technical feasibility discussions",
        "Collaborate with development teams",
        "Working lunch with clients",
      ],
      afternoon: [
        "Create technical documentation",
        "Proof of concept development",
        "Cost estimation and optimization",
        "Vendor evaluation",
      ],
      tools: ["Architecture tools (Lucidchart, Draw.io)", "Cloud platforms", "Documentation systems", "Presentation tools"],
      environment: "Office, client sites, or remote with significant meetings",
    },
    whatYouActuallyDo: [
      "Design technical solutions for business problems",
      "Create architecture blueprints and documentation",
      "Evaluate and recommend technologies",
      "Guide development teams on implementation",
      "Present technical solutions to stakeholders",
      "Ensure solutions meet requirements and scale",
    ],
    whoThisIsGoodFor: [
      "Big-picture thinkers with technical depth",
      "Strong communicators (technical and business)",
      "People who enjoy variety of problems",
      "Those who bridge business and technology",
      "Experienced technologists ready to lead",
    ],
    topSkills: [
      "System design and architecture",
      "Cloud platforms",
      "Technical leadership",
      "Communication",
      "Problem-solving",
      "Business acumen",
    ],
    entryPaths: [
      "10+ years technical experience",
      "Senior developer or engineer background",
      "Architecture certifications (TOGAF, AWS SA)",
      "Broad technology exposure",
    ],
    realityCheck: "Must balance ideal solutions with practical constraints. Rarely hands-on coding anymore. But influential role shaping major systems.",
  },

  "database-administrator": {
    typicalDay: {
      morning: [
        "Check database performance dashboards",
        "Review backup job results",
        "Analyse slow query logs",
        "Team standup meeting",
      ],
      midday: [
        "Performance tuning and optimization",
        "Security and access management",
        "Support developers with queries",
        "Documentation updates",
      ],
      afternoon: [
        "Capacity planning",
        "Maintenance planning for updates",
        "Disaster recovery testing",
        "On-call handover preparation",
      ],
      tools: ["SQL Server/Oracle/PostgreSQL", "Monitoring tools", "Backup solutions", "Performance analysers"],
      environment: "Office or remote, on-call for critical database issues",
    },
    whatYouActuallyDo: [
      "Maintain database performance and availability",
      "Optimise queries and database design",
      "Manage backups and disaster recovery",
      "Ensure database security",
      "Plan capacity and scaling",
      "Support development teams",
    ],
    whoThisIsGoodFor: [
      "Detail-oriented problem-solvers",
      "People who like optimizing systems",
      "Those comfortable with on-call responsibilities",
      "Methodical, careful individuals",
      "People who enjoy data and SQL",
    ],
    topSkills: [
      "SQL and database systems",
      "Performance tuning",
      "Backup and recovery",
      "Security management",
      "Troubleshooting",
      "Documentation",
    ],
    entryPaths: [
      "Bachelor's in IT or computer science",
      "Database certifications (Oracle, Microsoft)",
      "Start as developer or analyst",
      "Practice with database administration",
    ],
    realityCheck: "On-call for critical systems. Blamed when database slow. But essential role with good job security and interesting optimization challenges.",
  },

  "qa-engineer": {
    typicalDay: {
      morning: [
        "Review test results from overnight runs",
        "Daily standup with development team",
        "Plan testing for new features",
        "Write test cases",
      ],
      midday: [
        "Execute manual or exploratory testing",
        "Develop automated test scripts",
        "Log and track bugs",
        "Collaborate with developers on fixes",
      ],
      afternoon: [
        "Regression testing",
        "Test automation maintenance",
        "Review requirements for testability",
        "Document test results",
      ],
      tools: ["Selenium/Cypress", "Jira", "Postman", "Test management tools", "CI/CD pipelines"],
      environment: "Office or remote, collaborative with development teams",
    },
    whatYouActuallyDo: [
      "Design and execute test plans",
      "Build automated test frameworks",
      "Find and document bugs",
      "Ensure product quality before release",
      "Collaborate with developers on quality",
      "Improve testing processes",
    ],
    whoThisIsGoodFor: [
      "Detail-oriented investigators",
      "People who enjoy breaking things",
      "Those who think about edge cases",
      "Methodical problem-solvers",
      "People who advocate for users",
    ],
    topSkills: [
      "Test automation",
      "Manual testing techniques",
      "Bug documentation",
      "Programming basics",
      "Attention to detail",
      "Communication",
    ],
    entryPaths: [
      "Bachelor's in IT or computer science",
      "ISTQB certification helpful",
      "Learn test automation tools",
      "Start in manual testing role",
    ],
    realityCheck: "Sometimes seen as less glamorous than development. Constant pressure near releases. But critical role preventing bugs from reaching users.",
  },

  "scrum-master": {
    typicalDay: {
      morning: [
        "Prepare for daily standup",
        "Facilitate daily standup meeting",
        "Follow up on blockers",
        "Coach team members",
      ],
      midday: [
        "Stakeholder communication",
        "Prepare for upcoming ceremonies",
        "Metrics tracking and reporting",
        "Team support and facilitation",
      ],
      afternoon: [
        "Sprint planning or retrospective",
        "One-on-ones with team members",
        "Process improvement work",
        "Coordination with other scrum masters",
      ],
      tools: ["Jira/Azure DevOps", "Confluence", "Miro/Mural", "Slack/Teams"],
      environment: "Office or remote, team-focused with regular ceremonies",
    },
    whatYouActuallyDo: [
      "Facilitate scrum ceremonies effectively",
      "Remove impediments for the team",
      "Coach team on agile practices",
      "Protect team from distractions",
      "Foster continuous improvement",
      "Track and communicate team metrics",
    ],
    whoThisIsGoodFor: [
      "Servant leaders who support others",
      "Strong facilitators",
      "Patient coaches",
      "People who influence without authority",
      "Those passionate about team success",
    ],
    topSkills: [
      "Scrum framework",
      "Facilitation",
      "Coaching",
      "Communication",
      "Conflict resolution",
      "Servant leadership",
    ],
    entryPaths: [
      "Scrum certifications (CSM, PSM)",
      "Experience in development teams",
      "Project coordinator background",
      "Formal scrum master training",
    ],
    realityCheck: "Influence without authority is challenging. Success tied to team's success. But rewarding to enable high-performing teams.",
  },

  "systems-administrator": {
    typicalDay: {
      morning: [
        "Check monitoring systems for alerts",
        "Review backup job completions",
        "Address urgent tickets",
        "System health checks",
      ],
      midday: [
        "Server maintenance and updates",
        "User account management",
        "Documentation updates",
        "Support other IT teams",
      ],
      afternoon: [
        "Capacity planning",
        "Security patching",
        "Automation scripting",
        "On-call handover preparation",
      ],
      tools: ["Linux/Windows Server", "VMware/Hyper-V", "Ansible/PowerShell", "Monitoring tools"],
      environment: "Office and data center, on-call for system issues",
    },
    whatYouActuallyDo: [
      "Maintain server infrastructure",
      "Install and configure systems",
      "Monitor system health and performance",
      "Manage user accounts and permissions",
      "Ensure system security",
      "Automate routine tasks",
    ],
    whoThisIsGoodFor: [
      "Methodical problem-solvers",
      "People who enjoy maintaining systems",
      "Those comfortable with on-call duties",
      "Detail-oriented individuals",
      "Continuous learners",
    ],
    topSkills: [
      "Linux and Windows administration",
      "Virtualization",
      "Scripting (Bash, PowerShell)",
      "Security management",
      "Troubleshooting",
      "Documentation",
    ],
    entryPaths: [
      "Bachelor's in IT or vocational training",
      "CompTIA Server+, Linux+, or MCSA",
      "Start in IT support",
      "Build home lab for practice",
    ],
    realityCheck: "On-call can be disruptive. Blamed when systems down. But foundational IT role with clear career growth paths.",
  },

  "product-manager-tech": {
    typicalDay: {
      morning: [
        "Review user feedback and analytics",
        "Prioritise feature backlog",
        "Standup with development team",
        "Stakeholder alignment meetings",
      ],
      midday: [
        "User research or customer calls",
        "Write feature specifications",
        "Design reviews with UX team",
        "Data analysis for decisions",
      ],
      afternoon: [
        "Sprint planning or refinement",
        "Roadmap updates",
        "Cross-functional coordination",
        "Prepare leadership presentations",
      ],
      tools: ["Jira/Asana", "Analytics tools", "Figma", "Confluence", "Presentation tools"],
      environment: "Office or remote, highly collaborative and meeting-heavy",
    },
    whatYouActuallyDo: [
      "Define product vision and strategy",
      "Prioritise features based on value",
      "Work with engineering on delivery",
      "Gather and analyse user feedback",
      "Make data-driven decisions",
      "Communicate roadmap to stakeholders",
    ],
    whoThisIsGoodFor: [
      "Strategic thinkers who understand users",
      "Strong communicators",
      "People who make decisions with imperfect data",
      "Those who balance business and user needs",
      "Collaborative leaders",
    ],
    topSkills: [
      "Product strategy",
      "User research",
      "Data analysis",
      "Communication",
      "Technical understanding",
      "Prioritization",
    ],
    entryPaths: [
      "Bachelor's in CS, business, or related field",
      "Product management certifications helpful",
      "Background in development, design, or analytics",
      "Start as associate PM or analyst",
    ],
    realityCheck: "Accountability without authority. Constant trade-offs and saying no. But exciting to shape products users love.",
  },

  // HEALTHCARE (nurse already defined above in healthcare section, keeping for backwards compatibility)
  "nurse": {
    typicalDay: {
      morning: [
        "Shift handover from night nurse",
        "Review patient charts and care plans",
        "Morning medication rounds",
        "Assist patients with morning routines",
      ],
      midday: [
        "Monitor patient vital signs",
        "Communicate with doctors about patient status",
        "Document care in electronic health records",
        "Quick lunch break when possible",
      ],
      afternoon: [
        "Afternoon medication rounds",
        "Family meetings and patient education",
        "Respond to patient calls and needs",
        "Prepare handover notes for next shift",
      ],
      tools: ["Electronic health records", "Medical equipment", "Communication devices"],
      environment: "Hospital, clinic, or care facility (shift work common)",
    },
    whatYouActuallyDo: [
      "Monitor and assess patient health",
      "Administer medications and treatments",
      "Coordinate with doctors and specialists",
      "Educate patients and families",
      "Document everything carefully",
      "Respond to emergencies",
    ],
    whoThisIsGoodFor: [
      "People who genuinely care about others",
      "Those who stay calm under pressure",
      "Good communicators",
      "People comfortable with physical demands",
      "Those who can handle emotional situations",
    ],
    topSkills: [
      "Clinical knowledge",
      "Empathy and communication",
      "Attention to detail",
      "Physical stamina",
      "Stress management",
      "Teamwork",
    ],
    entryPaths: [
      "Nursing degree (Bachelor's or Associate's)",
      "Nursing license exam",
      "Healthcare assistant as stepping stone",
      "Clinical placements during training",
    ],
    realityCheck: "Nursing is physically and emotionally demanding. Long shifts, difficult patients, and tough decisions are normal. But helping people recover is deeply rewarding.",
  },

  // BUSINESS
  "project-manager": {
    typicalDay: {
      morning: [
        "Check project status and overnight updates",
        "Daily standup with the team",
        "Update project tracking tools",
        "Resolve any blockers team members have",
      ],
      midday: [
        "Stakeholder meeting to discuss progress",
        "Risk assessment and mitigation planning",
        "One-on-ones with team members",
      ],
      afternoon: [
        "Prepare status reports",
        "Budget and timeline review",
        "Planning upcoming sprints or phases",
        "Send end-of-day summary to stakeholders",
      ],
      tools: ["Jira/Asana", "Slack", "Google Docs", "Excel", "Video calls"],
      environment: "Office, hybrid, or remote with lots of meetings",
    },
    whatYouActuallyDo: [
      "Keep projects on track and on budget",
      "Remove obstacles for your team",
      "Communicate status to stakeholders",
      "Manage risks and scope changes",
      "Coordinate between different teams",
      "Make sure everyone knows what to do",
    ],
    whoThisIsGoodFor: [
      "Organised, detail-oriented people",
      "Strong communicators",
      "Those who like helping teams succeed",
      "People comfortable with uncertainty",
      "Natural problem-solvers",
    ],
    topSkills: [
      "Organization and planning",
      "Communication",
      "Leadership",
      "Risk management",
      "Negotiation",
      "Adaptability",
    ],
    entryPaths: [
      "Start in team member role first",
      "Project management certifications (PMP, PRINCE2)",
      "Online courses and bootcamps",
      "Junior PM or coordinator role",
    ],
    realityCheck: "You'll spend most of your time in meetings and managing expectations. The job is about people as much as plans.",
  },

  // CREATIVE
  "graphic-designer": {
    typicalDay: {
      morning: [
        "Review feedback on yesterday's designs",
        "Check emails for new briefs",
        "Quick team sync on priorities",
        "Start design work with fresh eyes",
      ],
      midday: [
        "Deep focus design time",
        "Client or stakeholder presentation",
        "Revisions based on feedback",
      ],
      afternoon: [
        "Explore new design concepts",
        "Prepare files for handoff",
        "Team critique session",
        "Admin tasks and file organization",
      ],
      tools: ["Figma", "Adobe Creative Suite", "Canva", "Slack"],
      environment: "Office, studio, or remote",
    },
    whatYouActuallyDo: [
      "Create visual designs for brands and products",
      "Turn briefs and ideas into visuals",
      "Present and explain design decisions",
      "Iterate based on feedback",
      "Maintain brand consistency",
      "Prepare files for production",
    ],
    whoThisIsGoodFor: [
      "Visual thinkers",
      "People who notice details others miss",
      "Those who can take constructive criticism",
      "Creative problem-solvers",
      "People who stay current with trends",
    ],
    topSkills: [
      "Design software (Figma, Adobe)",
      "Visual composition",
      "Typography",
      "Color theory",
      "Communication",
      "Time management",
    ],
    entryPaths: [
      "Design degree or courses",
      "Self-taught with strong portfolio",
      "Internship or junior role",
      "Freelance projects to build experience",
    ],
    realityCheck: "Much of the job is revisions and client feedback, not pure creative expression. Building a portfolio matters more than degrees.",
  },

  // TRADES
  "electrician": {
    typicalDay: {
      morning: [
        "Arrive at job site, review work orders",
        "Safety briefing and equipment check",
        "Begin installation or repair work",
      ],
      midday: [
        "Continue electrical work",
        "Coordinate with other trades on site",
        "Quick lunch break",
      ],
      afternoon: [
        "Testing and inspection of completed work",
        "Documentation and sign-offs",
        "Clean up and secure work area",
        "Travel to next job if needed",
      ],
      tools: ["Multimeters", "Wire strippers", "Power tools", "Safety gear"],
      environment: "Construction sites, buildings, outdoors (physical work)",
    },
    whatYouActuallyDo: [
      "Install and repair electrical systems",
      "Read and follow technical drawings",
      "Ensure work meets safety codes",
      "Troubleshoot electrical problems",
      "Work with other construction trades",
    ],
    whoThisIsGoodFor: [
      "People who like working with their hands",
      "Those comfortable with physical work",
      "Detail-oriented safety-conscious individuals",
      "Problem-solvers",
      "People who prefer varied work locations",
    ],
    topSkills: [
      "Electrical knowledge",
      "Safety awareness",
      "Problem-solving",
      "Physical fitness",
      "Reading technical drawings",
      "Math skills",
    ],
    entryPaths: [
      "Apprenticeship program (2-4 years)",
      "Trade school",
      "Electrician's license after training",
      "Start as helper or assistant",
    ],
    realityCheck: "Physical, sometimes dangerous work. Early mornings and travel are common. But good pay, job security, and satisfaction from tangible results.",
  },

  // ========================================
  // BUSINESS, MANAGEMENT & ADMINISTRATION
  // ========================================
  "hr-specialist": {
    typicalDay: {
      morning: [
        "Review applications and resumes",
        "Schedule and conduct interviews",
        "Handle employee inquiries",
        "Process HR paperwork",
      ],
      midday: [
        "Onboarding new employees",
        "Update HR systems and records",
        "Team meetings",
        "Policy updates and compliance",
      ],
      afternoon: [
        "Employee relations issues",
        "Training coordination",
        "Benefits administration",
        "Prepare for next day's activities",
      ],
      tools: ["HR management systems", "Applicant tracking systems", "Payroll software", "Communication platforms"],
      environment: "Office setting, regular business hours with occasional events",
    },
    whatYouActuallyDo: [
      "Recruit and onboard new employees",
      "Handle employee relations and concerns",
      "Administer benefits and policies",
      "Ensure legal compliance",
      "Support performance management",
      "Organize training and development",
    ],
    whoThisIsGoodFor: [
      "People-oriented individuals",
      "Good listeners and communicators",
      "Those who handle sensitive situations well",
      "Organised, detail-oriented people",
      "Fair-minded problem-solvers",
    ],
    topSkills: [
      "Communication",
      "Confidentiality",
      "Employment law knowledge",
      "Organization",
      "Conflict resolution",
      "Empathy",
    ],
    entryPaths: [
      "Bachelor's in HR, Business, or Psychology",
      "HR certifications (SHRM, PHR)",
      "Start as HR assistant or coordinator",
      "Build through administrative roles",
    ],
    realityCheck: "Dealing with difficult situations (firing, conflicts) is emotionally challenging. Lots of paperwork and compliance. But helping employees and building great teams is rewarding.",
  },

  "management-consultant": {
    typicalDay: {
      morning: [
        "Client site visit or video call",
        "Data analysis and research",
        "Team sync on project progress",
        "Interview stakeholders",
      ],
      midday: [
        "Build presentations and reports",
        "Workshop facilitation",
        "Work session with clients",
        "Quick lunch (often working)",
      ],
      afternoon: [
        "Synthesize findings",
        "Develop recommendations",
        "Client presentations",
        "Travel or internal meetings",
      ],
      tools: ["PowerPoint", "Excel", "Data analysis tools", "Project management software"],
      environment: "Client sites, offices, significant travel (can be intense hours)",
    },
    whatYouActuallyDo: [
      "Analyse complex business problems",
      "Gather and synthesize data",
      "Develop strategic recommendations",
      "Present findings to executives",
      "Help implement changes",
      "Build client relationships",
    ],
    whoThisIsGoodFor: [
      "Analytical problem-solvers",
      "Strong presenters",
      "People who thrive under pressure",
      "Those who enjoy variety of industries",
      "Ambitious fast-learners",
    ],
    topSkills: [
      "Analytical thinking",
      "Presentation skills",
      "Communication",
      "Problem-solving",
      "Client management",
      "Business acumen",
    ],
    entryPaths: [
      "Top university degree (any field)",
      "MBA for career changers",
      "Consulting firms recruit from campus",
      "Industry expertise can help later",
    ],
    realityCheck: "Long hours and heavy travel. High pressure and demanding clients. But exceptional learning, exposure to executives, and strong compensation.",
  },

  "office-administrator": {
    typicalDay: {
      morning: [
        "Open office and check systems",
        "Sort and distribute mail",
        "Manage executive calendars",
        "Handle incoming calls and visitors",
      ],
      midday: [
        "Coordinate meetings and rooms",
        "Order supplies and manage vendors",
        "Process invoices and expenses",
        "Document management",
      ],
      afternoon: [
        "Support various departments",
        "Event coordination",
        "Database and filing updates",
        "Prepare for next day",
      ],
      tools: ["Microsoft Office", "Calendar systems", "Phone systems", "Office equipment"],
      environment: "Office reception and administrative areas, regular business hours",
    },
    whatYouActuallyDo: [
      "Manage daily office operations",
      "Coordinate schedules and meetings",
      "Handle correspondence and filing",
      "Order supplies and manage vendors",
      "Support staff with admin tasks",
      "Maintain office systems",
    ],
    whoThisIsGoodFor: [
      "Highly organised individuals",
      "People who enjoy helping others",
      "Good multitaskers",
      "Those who like routine with variety",
      "Friendly communicators",
    ],
    topSkills: [
      "Organization",
      "Communication",
      "Microsoft Office",
      "Multitasking",
      "Customer service",
      "Attention to detail",
    ],
    entryPaths: [
      "Administrative training or vocational school",
      "Entry-level receptionist role",
      "On-the-job training common",
      "Can advance to executive assistant or office manager",
    ],
    realityCheck: "Can be undervalued despite being essential. Lots of interruptions and multitasking. But good work-life balance and stable employment.",
  },

  "business-analyst": {
    typicalDay: {
      morning: [
        "Review project requirements",
        "Stakeholder interviews",
        "Document current processes",
        "Team standup meeting",
      ],
      midday: [
        "Analyse data and processes",
        "Create process maps and diagrams",
        "Workshops with business users",
        "Working lunch",
      ],
      afternoon: [
        "Write requirements documents",
        "Review with development team",
        "Present findings to stakeholders",
        "Plan next steps",
      ],
      tools: ["Visio/Lucidchart", "Excel", "SQL", "JIRA", "Requirements tools"],
      environment: "Office or remote, collaborative with business and tech teams",
    },
    whatYouActuallyDo: [
      "Gather and document requirements",
      "Analyse business processes",
      "Translate business needs to technical specs",
      "Create process maps and models",
      "Facilitate stakeholder workshops",
      "Support testing and implementation",
    ],
    whoThisIsGoodFor: [
      "Analytical thinkers",
      "Good communicators who translate",
      "Detail-oriented documenters",
      "People who bridge business and tech",
      "Patient facilitators",
    ],
    topSkills: [
      "Requirements analysis",
      "Process modeling",
      "Communication",
      "SQL and data analysis",
      "Stakeholder management",
      "Documentation",
    ],
    entryPaths: [
      "Bachelor's in Business, IT, or related field",
      "BA certifications (CBAP, ECBA)",
      "Start in support or junior BA role",
      "Domain expertise valuable",
    ],
    realityCheck: "Requirements change constantly. Stakeholders often disagree. Lots of documentation. But satisfying to improve processes and bridge understanding.",
  },

  "executive-assistant": {
    typicalDay: {
      morning: [
        "Brief executive on day's schedule",
        "Manage inbox and prioritise emails",
        "Coordinate meetings and calls",
        "Handle urgent requests",
      ],
      midday: [
        "Prepare meeting materials",
        "Take notes in meetings",
        "Coordinate travel arrangements",
        "Quick lunch (flexible)",
      ],
      afternoon: [
        "Follow up on action items",
        "Prepare reports and presentations",
        "Handle confidential matters",
        "Plan for upcoming events",
      ],
      tools: ["Calendar systems", "Email", "Travel booking", "Document preparation tools"],
      environment: "Executive offices, may work irregular hours to match executive's schedule",
    },
    whatYouActuallyDo: [
      "Manage executive's calendar and schedule",
      "Handle confidential communications",
      "Coordinate complex travel",
      "Prepare documents and presentations",
      "Act as gatekeeper",
      "Anticipate needs and solve problems",
    ],
    whoThisIsGoodFor: [
      "Highly organised, proactive people",
      "Discrete and trustworthy individuals",
      "Those who anticipate needs",
      "Flexible and adaptable personalities",
      "People who enjoy supporting leaders",
    ],
    topSkills: [
      "Organization",
      "Discretion",
      "Communication",
      "Anticipation",
      "Problem-solving",
      "Adaptability",
    ],
    entryPaths: [
      "Administrative experience first",
      "Bachelor's degree helpful",
      "Work up from assistant roles",
      "Build reputation for reliability",
    ],
    realityCheck: "Irregular hours tied to executive's schedule. High pressure and demanding. But close exposure to leadership and satisfying to enable success.",
  },

  "entrepreneur": {
    typicalDay: {
      morning: [
        "Review metrics and priorities",
        "Team sync or planning",
        "Customer or partner calls",
        "Problem-solving urgent issues",
      ],
      midday: [
        "Product development or sales",
        "Investor or advisor meetings",
        "Marketing and growth activities",
        "Working lunch with team",
      ],
      afternoon: [
        "Financial reviews",
        "Hiring and people management",
        "Strategy and planning",
        "Networking events",
      ],
      tools: ["Everything - depends on business", "Productivity tools", "Financial software", "Communication platforms"],
      environment: "Varies wildly - office, home, co-working, client sites (very flexible but demanding)",
    },
    whatYouActuallyDo: [
      "Everything - especially early on",
      "Develop product or service",
      "Find and serve customers",
      "Manage finances and fundraising",
      "Build and lead a team",
      "Make constant decisions",
    ],
    whoThisIsGoodFor: [
      "Self-starters with high resilience",
      "People comfortable with uncertainty",
      "Those who want to build something",
      "Risk-tolerant individuals",
      "Generalists who can do everything",
    ],
    topSkills: [
      "Resilience",
      "Problem-solving",
      "Sales and communication",
      "Financial literacy",
      "Leadership",
      "Adaptability",
    ],
    entryPaths: [
      "No specific path - just start",
      "Work experience in industry helps",
      "Side projects while employed",
      "Startup incubators and accelerators",
    ],
    realityCheck: "Most startups fail. Income uncertain for years. Work never stops. But building something from nothing and being in control is incredibly rewarding for the right person.",
  },

  // ========================================
  // FINANCE, BANKING & INSURANCE
  // ========================================
  "accountant": {
    typicalDay: {
      morning: [
        "Review overnight transactions",
        "Process invoices and payments",
        "Bank reconciliations",
        "Client emails and calls",
      ],
      midday: [
        "Prepare financial statements",
        "Tax calculations and filings",
        "Client meetings",
        "Team collaboration",
      ],
      afternoon: [
        "Audit preparation",
        "Financial analysis",
        "Update accounting systems",
        "Plan for deadlines",
      ],
      tools: ["Accounting software (Visma, SAP)", "Excel", "Tax systems", "ERP systems"],
      environment: "Office setting, busy seasons around tax deadlines and year-end",
    },
    whatYouActuallyDo: [
      "Record and classify financial transactions",
      "Prepare financial statements",
      "File tax returns and ensure compliance",
      "Analyse financial data",
      "Advise clients on financial matters",
      "Support audits and reviews",
    ],
    whoThisIsGoodFor: [
      "Detail-oriented number lovers",
      "Organised, methodical people",
      "Those who value accuracy",
      "People who enjoy structured work",
      "Ethical, trustworthy individuals",
    ],
    topSkills: [
      "Accounting principles",
      "Attention to detail",
      "Excel and software",
      "Tax knowledge",
      "Communication",
      "Organization",
    ],
    entryPaths: [
      "Bachelor's in Accounting or Economics",
      "Authorization as regnskapsfører",
      "Start as assistant accountant",
      "CPA or equivalent for advancement",
    ],
    realityCheck: "Busy seasons mean long hours. Work can be repetitive. But stable career with clear progression and good work-life balance outside busy periods.",
  },

  "financial-advisor": {
    typicalDay: {
      morning: [
        "Review market news and updates",
        "Client portfolio reviews",
        "Prepare for client meetings",
        "Prospecting calls",
      ],
      midday: [
        "Client consultations",
        "Financial plan development",
        "Investment recommendations",
        "Networking lunch",
      ],
      afternoon: [
        "Follow-up on client actions",
        "Research investment options",
        "Administrative tasks",
        "Professional development",
      ],
      tools: ["Financial planning software", "CRM systems", "Market data platforms", "Presentation tools"],
      environment: "Office with client meeting rooms, some travel to clients",
    },
    whatYouActuallyDo: [
      "Assess clients' financial situations",
      "Develop personalised financial plans",
      "Recommend investments and insurance",
      "Monitor and adjust portfolios",
      "Educate clients on financial concepts",
      "Build long-term relationships",
    ],
    whoThisIsGoodFor: [
      "People-oriented finance enthusiasts",
      "Trustworthy relationship builders",
      "Those who explain complex topics simply",
      "Self-motivated sellers",
      "Long-term thinkers",
    ],
    topSkills: [
      "Financial knowledge",
      "Communication",
      "Relationship building",
      "Sales",
      "Analytical thinking",
      "Ethics",
    ],
    entryPaths: [
      "Bachelor's in Finance or Economics",
      "Financial certifications (CFP, Autorisert finansiell rådgiver)",
      "Start in bank or insurance",
      "Build client base over time",
    ],
    realityCheck: "Income often commission-based early on. Building a client base takes years. But helping families achieve financial security is meaningful.",
  },

  "bank-advisor": {
    typicalDay: {
      morning: [
        "Review daily tasks and appointments",
        "Process loan applications",
        "Customer consultations",
        "Handle account inquiries",
      ],
      midday: [
        "Meet with customers about mortgages",
        "Review credit applications",
        "Product recommendations",
        "Documentation and compliance",
      ],
      afternoon: [
        "Follow up with customers",
        "Financial product training",
        "Sales activities",
        "Administrative tasks",
      ],
      tools: ["Banking systems", "CRM", "Credit assessment tools", "Communication platforms"],
      environment: "Bank branch or office, regular business hours",
    },
    whatYouActuallyDo: [
      "Advise customers on banking products",
      "Process loans and mortgages",
      "Help with savings and investments",
      "Handle account services",
      "Meet sales targets",
      "Ensure regulatory compliance",
    ],
    whoThisIsGoodFor: [
      "Customer-focused individuals",
      "People who enjoy sales",
      "Detail-oriented processors",
      "Those who build relationships",
      "Trustworthy communicators",
    ],
    topSkills: [
      "Customer service",
      "Financial products knowledge",
      "Sales",
      "Communication",
      "Compliance awareness",
      "Problem-solving",
    ],
    entryPaths: [
      "Bachelor's in Finance, Business, or Economics",
      "Banking industry certifications",
      "Entry-level customer service role",
      "Internal training programs",
    ],
    realityCheck: "Sales targets create pressure. Regulatory requirements are strict. But stable employment and clear career progression in banking.",
  },

  "insurance-advisor": {
    typicalDay: {
      morning: [
        "Review client policies",
        "Prospecting and lead generation",
        "Client appointment preparation",
        "Claims support",
      ],
      midday: [
        "Client consultations",
        "Needs analysis and recommendations",
        "Policy quotes and comparisons",
        "Documentation",
      ],
      afternoon: [
        "Follow-up calls",
        "Policy processing",
        "Networking activities",
        "Professional development",
      ],
      tools: ["Insurance platforms", "CRM systems", "Quoting tools", "Communication software"],
      environment: "Office, client locations, or remote work",
    },
    whatYouActuallyDo: [
      "Assess client insurance needs",
      "Recommend appropriate coverage",
      "Process insurance applications",
      "Handle claims support",
      "Maintain client relationships",
      "Stay current on products",
    ],
    whoThisIsGoodFor: [
      "Helpful, empathetic people",
      "Those who enjoy sales",
      "Detail-oriented individuals",
      "Relationship builders",
      "People who explain complex topics",
    ],
    topSkills: [
      "Insurance product knowledge",
      "Sales",
      "Communication",
      "Needs analysis",
      "Customer service",
      "Ethics",
    ],
    entryPaths: [
      "Bachelor's in Business or Finance",
      "Insurance certifications",
      "Start in customer service",
      "Build client base over time",
    ],
    realityCheck: "Commission-based income creates pressure. Talking about risk isn't always fun. But helping people protect what matters is meaningful.",
  },

  "auditor": {
    typicalDay: {
      morning: [
        "Team briefing on audit plan",
        "Review prior year findings",
        "Document walkthrough with client",
        "Test internal controls",
      ],
      midday: [
        "Substantive testing of accounts",
        "Interview client personnel",
        "Analyse financial data",
        "Working lunch",
      ],
      afternoon: [
        "Document findings",
        "Discuss issues with managers",
        "Prepare audit workpapers",
        "Plan next day's work",
      ],
      tools: ["Audit software", "Excel", "Data analytics tools", "Documentation systems"],
      environment: "Client sites during busy season, office during slower periods",
    },
    whatYouActuallyDo: [
      "Examine financial statements for accuracy",
      "Test internal controls",
      "Identify risks and misstatements",
      "Document audit evidence",
      "Communicate findings to clients",
      "Ensure compliance with standards",
    ],
    whoThisIsGoodFor: [
      "Skeptical, questioning minds",
      "Detail-oriented investigators",
      "Those who value accuracy",
      "Independent thinkers",
      "People with strong ethics",
    ],
    topSkills: [
      "Accounting knowledge",
      "Analytical thinking",
      "Attention to detail",
      "Professional skepticism",
      "Communication",
      "Documentation",
    ],
    entryPaths: [
      "Master's in Accounting or related",
      "State authorization (statsautorisert revisor)",
      "Start in audit firms",
      "Work toward partnership or industry",
    ],
    realityCheck: "Long hours during busy season. Travel to client sites. Work can be tedious. But strong foundation for many finance careers.",
  },

  "investment-analyst": {
    typicalDay: {
      morning: [
        "Review market news and data",
        "Update financial models",
        "Team discussion on ideas",
        "Read company reports",
      ],
      midday: [
        "Company analysis and valuation",
        "Industry research",
        "Portfolio manager meetings",
        "Quick lunch",
      ],
      afternoon: [
        "Write research reports",
        "Present investment ideas",
        "Client calls or meetings",
        "Monitor existing positions",
      ],
      tools: ["Bloomberg terminal", "Excel", "Financial databases", "Presentation tools"],
      environment: "Office (often finance district), market hours are intense",
    },
    whatYouActuallyDo: [
      "Research companies and industries",
      "Build financial models",
      "Make buy/sell recommendations",
      "Write research reports",
      "Present ideas to portfolio managers",
      "Monitor investment performance",
    ],
    whoThisIsGoodFor: [
      "Analytical, curious minds",
      "People who love financial markets",
      "Strong modelers and writers",
      "Those comfortable with uncertainty",
      "Competitive individuals",
    ],
    topSkills: [
      "Financial modeling",
      "Research and analysis",
      "Communication",
      "Excel mastery",
      "Market knowledge",
      "Critical thinking",
    ],
    entryPaths: [
      "Master's in Finance or Economics",
      "CFA certification (highly valued)",
      "Internships at investment firms",
      "Strong academic record important",
    ],
    realityCheck: "Competitive and high-pressure. Markets can prove you wrong. Long hours analyzing data. But intellectually stimulating with high earning potential.",
  },

  // ========================================
  // SALES, MARKETING & CUSTOMER SERVICE
  // ========================================
  "marketing-manager": {
    typicalDay: {
      morning: [
        "Review campaign metrics",
        "Team standup meeting",
        "Plan marketing activities",
        "Agency calls",
      ],
      midday: [
        "Campaign development",
        "Content reviews",
        "Cross-functional meetings",
        "Budget management",
      ],
      afternoon: [
        "Strategic planning",
        "Performance analysis",
        "Stakeholder presentations",
        "Team mentoring",
      ],
      tools: ["Marketing automation", "Analytics platforms", "Creative tools", "Project management"],
      environment: "Office or hybrid, collaborative with creative and business teams",
    },
    whatYouActuallyDo: [
      "Develop marketing strategies",
      "Plan and execute campaigns",
      "Manage marketing budgets",
      "Analyse performance metrics",
      "Lead marketing team",
      "Coordinate with agencies and vendors",
    ],
    whoThisIsGoodFor: [
      "Creative strategists",
      "Data-driven decision makers",
      "Strong leaders and communicators",
      "People who balance creativity and business",
      "Adaptable fast-learners",
    ],
    topSkills: [
      "Marketing strategy",
      "Data analysis",
      "Leadership",
      "Communication",
      "Budget management",
      "Creativity",
    ],
    entryPaths: [
      "Bachelor's or Master's in Marketing",
      "Experience in marketing roles",
      "Progress from specialist to manager",
      "Build portfolio of successful campaigns",
    ],
    realityCheck: "Pressure to show ROI on everything. Marketing budgets often cut first. But dynamic field with lots of creativity and variety.",
  },

  "digital-marketer": {
    typicalDay: {
      morning: [
        "Check campaign performance",
        "Respond to comments and messages",
        "Content creation and scheduling",
        "SEO optimization tasks",
      ],
      midday: [
        "Ad campaign management",
        "Analytics review",
        "Content creation",
        "Team collaboration",
      ],
      afternoon: [
        "A/B testing and optimization",
        "Reporting preparation",
        "Strategy planning",
        "Industry trend research",
      ],
      tools: ["Google Ads/Analytics", "Social media platforms", "SEO tools", "Content management systems"],
      environment: "Office or remote, fast-paced with constant optimization",
    },
    whatYouActuallyDo: [
      "Run paid advertising campaigns",
      "Manage social media presence",
      "Optimise for search engines",
      "Create digital content",
      "Analyse and report on metrics",
      "Test and optimise continuously",
    ],
    whoThisIsGoodFor: [
      "Data-driven creatives",
      "People who love social media",
      "Quick learners (platforms change)",
      "Analytical optimisers",
      "Content creators",
    ],
    topSkills: [
      "Paid advertising",
      "Social media marketing",
      "SEO/SEM",
      "Analytics",
      "Content creation",
      "A/B testing",
    ],
    entryPaths: [
      "Bachelor's in Marketing or Communications",
      "Digital marketing certifications (Google, HubSpot)",
      "Build personal projects or freelance",
      "Entry-level marketing role",
    ],
    realityCheck: "Platforms and algorithms change constantly. Pressure for immediate results. But creative, fast-moving field with lots of demand.",
  },

  "sales-representative": {
    typicalDay: {
      morning: [
        "Review pipeline and priorities",
        "Prospecting calls and emails",
        "Follow up on leads",
        "Team sales meeting",
      ],
      midday: [
        "Customer meetings or demos",
        "Proposal preparation",
        "Negotiations",
        "CRM updates",
      ],
      afternoon: [
        "More customer interactions",
        "Close deals",
        "Administrative tasks",
        "Plan for tomorrow",
      ],
      tools: ["CRM systems", "Email and phone", "Presentation tools", "Proposal software"],
      environment: "Office, client sites, or field work depending on role",
    },
    whatYouActuallyDo: [
      "Find and qualify prospects",
      "Present products and solutions",
      "Negotiate and close deals",
      "Build customer relationships",
      "Meet sales targets",
      "Report on pipeline and results",
    ],
    whoThisIsGoodFor: [
      "Competitive, driven individuals",
      "People who handle rejection well",
      "Strong communicators",
      "Relationship builders",
      "Self-motivated hustlers",
    ],
    topSkills: [
      "Communication",
      "Persuasion",
      "Resilience",
      "Product knowledge",
      "Negotiation",
      "Time management",
    ],
    entryPaths: [
      "Various backgrounds accepted",
      "Entry-level sales or retail",
      "Company training programs",
      "Build track record of results",
    ],
    realityCheck: "Rejection is constant. Pressure from quotas. Income can be variable. But high earning potential and satisfaction from winning deals.",
  },

  "customer-service-rep": {
    typicalDay: {
      morning: [
        "Log in to support systems",
        "Handle customer calls and chats",
        "Resolve complaints and issues",
        "Process orders and requests",
      ],
      midday: [
        "Continue customer support",
        "Escalate complex issues",
        "Document interactions",
        "Short breaks between calls",
      ],
      afternoon: [
        "More customer interactions",
        "Follow up on open cases",
        "Team meetings or training",
        "End-of-day reporting",
      ],
      tools: ["CRM and ticketing systems", "Phone systems", "Knowledge bases", "Chat platforms"],
      environment: "Call center or office, shift work common",
    },
    whatYouActuallyDo: [
      "Answer customer questions",
      "Resolve complaints and issues",
      "Process orders and returns",
      "Provide product information",
      "Document all interactions",
      "Meet service level targets",
    ],
    whoThisIsGoodFor: [
      "Patient, helpful individuals",
      "Good listeners",
      "People who stay calm under pressure",
      "Problem-solvers",
      "Clear communicators",
    ],
    topSkills: [
      "Communication",
      "Patience",
      "Problem-solving",
      "Empathy",
      "Computer skills",
      "Multitasking",
    ],
    entryPaths: [
      "No formal education required",
      "On-the-job training provided",
      "Start in entry-level support",
      "Can advance to team lead or specialist",
    ],
    realityCheck: "Can be repetitive and emotionally draining. Metrics-driven environment. But good entry point and teaches valuable communication skills.",
  },

  "content-creator": {
    typicalDay: {
      morning: [
        "Check engagement and analytics",
        "Respond to comments and DMs",
        "Plan content calendar",
        "Research trends",
      ],
      midday: [
        "Create content (photo, video, writing)",
        "Edit and refine content",
        "Schedule posts",
        "Collaborate with others",
      ],
      afternoon: [
        "Publish and promote content",
        "Engage with community",
        "Brand partnership calls",
        "Administrative tasks",
      ],
      tools: ["Social media platforms", "Video editing software", "Graphic design tools", "Analytics platforms"],
      environment: "Home studio, various locations, very flexible hours",
    },
    whatYouActuallyDo: [
      "Create engaging content",
      "Build and engage audience",
      "Manage social media presence",
      "Collaborate with brands",
      "Analyse performance",
      "Stay current with trends",
    ],
    whoThisIsGoodFor: [
      "Creative self-starters",
      "People comfortable on camera",
      "Those who love social media",
      "Consistent, disciplined creators",
      "People who handle public feedback",
    ],
    topSkills: [
      "Content creation",
      "Video/photo editing",
      "Social media strategy",
      "Communication",
      "Consistency",
      "Trend awareness",
    ],
    entryPaths: [
      "Start creating and posting consistently",
      "Learn editing and production skills",
      "Build audience over time",
      "Monetize through ads, sponsorships, products",
    ],
    realityCheck: "Income is unpredictable. Algorithms change. Public criticism is constant. But creative freedom and potential for significant income.",
  },

  "brand-manager": {
    typicalDay: {
      morning: [
        "Review brand metrics and feedback",
        "Team meetings",
        "Campaign planning",
        "Agency briefings",
      ],
      midday: [
        "Creative reviews",
        "Cross-functional coordination",
        "Market research analysis",
        "Strategy development",
      ],
      afternoon: [
        "Stakeholder presentations",
        "Budget management",
        "Brand guideline updates",
        "Industry monitoring",
      ],
      tools: ["Brand management tools", "Analytics platforms", "Creative review software", "Research tools"],
      environment: "Office or hybrid, collaborative with creative and business teams",
    },
    whatYouActuallyDo: [
      "Develop brand strategy and positioning",
      "Manage brand identity and guidelines",
      "Oversee marketing campaigns",
      "Analyse brand performance",
      "Coordinate with agencies",
      "Protect and grow brand equity",
    ],
    whoThisIsGoodFor: [
      "Strategic creative thinkers",
      "People who understand consumers",
      "Strong communicators",
      "Detail-oriented brand guardians",
      "Cross-functional collaborators",
    ],
    topSkills: [
      "Brand strategy",
      "Marketing",
      "Communication",
      "Market research",
      "Project management",
      "Creative judgment",
    ],
    entryPaths: [
      "Bachelor's or Master's in Marketing",
      "Experience in marketing roles",
      "Progress through assistant brand manager",
      "FMCG experience valued",
    ],
    realityCheck: "Balancing creativity with business results. Brand changes take time. But satisfying to shape how people perceive products and companies.",
  },

  "retail-manager": {
    typicalDay: {
      morning: [
        "Open store and check systems",
        "Review yesterday's sales",
        "Team briefing",
        "Walk the floor",
      ],
      midday: [
        "Customer interactions",
        "Staff support and coaching",
        "Inventory management",
        "Handle issues",
      ],
      afternoon: [
        "Schedule planning",
        "Sales tracking",
        "Visual merchandising",
        "Close procedures",
      ],
      tools: ["POS systems", "Inventory management", "Scheduling software", "Sales reporting"],
      environment: "Retail store, includes weekends and holidays",
    },
    whatYouActuallyDo: [
      "Lead and motivate store team",
      "Achieve sales targets",
      "Ensure excellent customer service",
      "Manage inventory and merchandising",
      "Handle staffing and schedules",
      "Maintain store standards",
    ],
    whoThisIsGoodFor: [
      "People-oriented leaders",
      "Those who enjoy retail environments",
      "Multitaskers who handle pressure",
      "Customer service champions",
      "Results-driven individuals",
    ],
    topSkills: [
      "Leadership",
      "Customer service",
      "Sales",
      "Inventory management",
      "People management",
      "Problem-solving",
    ],
    entryPaths: [
      "Start in retail sales",
      "Progress to supervisor/assistant manager",
      "Company training programs",
      "Retail management courses helpful",
    ],
    realityCheck: "Long hours including evenings and weekends. High staff turnover to manage. But satisfaction from building teams and hitting targets.",
  },

  // ========================================
  // MANUFACTURING, ENGINEERING & ENERGY
  // ========================================
  "mechanical-engineer": {
    typicalDay: {
      morning: [
        "Review project requirements",
        "CAD modeling work",
        "Team coordination meetings",
        "Analyse test data",
      ],
      midday: [
        "Design reviews",
        "Prototype testing",
        "Collaboration with production",
        "Documentation",
      ],
      afternoon: [
        "Simulation and analysis",
        "Supplier coordination",
        "Project reporting",
        "Plan next steps",
      ],
      tools: ["CAD software (SolidWorks, AutoCAD)", "Simulation tools", "Excel", "Project management"],
      environment: "Office and workshop/lab, may include factory floor visits",
    },
    whatYouActuallyDo: [
      "Design mechanical systems and components",
      "Run simulations and analyses",
      "Test prototypes",
      "Coordinate with manufacturing",
      "Write technical documentation",
      "Solve technical problems",
    ],
    whoThisIsGoodFor: [
      "People who love how things work",
      "Problem-solvers with spatial thinking",
      "Detail-oriented designers",
      "Those who enjoy seeing ideas become real",
      "Math and physics enthusiasts",
    ],
    topSkills: [
      "CAD and design",
      "Engineering principles",
      "Problem-solving",
      "Mathematics",
      "Communication",
      "Project management",
    ],
    entryPaths: [
      "Bachelor's or Master's in Mechanical Engineering",
      "Internships during studies",
      "Start as junior engineer",
      "Specialize over time",
    ],
    realityCheck: "Lots of documentation and meetings. Designs often changed by constraints. But satisfying to create physical products that work.",
  },

  "electrical-engineer": {
    typicalDay: {
      morning: [
        "Review circuit designs",
        "Lab testing and measurements",
        "Team meetings",
        "Documentation updates",
      ],
      midday: [
        "Design and simulation work",
        "Prototype assembly",
        "Troubleshooting issues",
        "Collaboration with other teams",
      ],
      afternoon: [
        "Test result analysis",
        "Design optimization",
        "Project planning",
        "Technical reviews",
      ],
      tools: ["Circuit design software", "Oscilloscopes and test equipment", "Simulation tools", "CAD"],
      environment: "Office and lab, may include factory or field work",
    },
    whatYouActuallyDo: [
      "Design electrical systems and circuits",
      "Test and debug hardware",
      "Write specifications and documentation",
      "Collaborate on system integration",
      "Ensure safety and compliance",
      "Solve complex technical problems",
    ],
    whoThisIsGoodFor: [
      "People fascinated by electricity and electronics",
      "Methodical problem-solvers",
      "Detail-oriented designers",
      "Those who enjoy hands-on work",
      "Continuous learners",
    ],
    topSkills: [
      "Circuit design",
      "Electronics theory",
      "Testing and debugging",
      "Safety standards",
      "Programming (often)",
      "Problem-solving",
    ],
    entryPaths: [
      "Bachelor's or Master's in Electrical Engineering",
      "Internships and projects",
      "Start as junior engineer",
      "Specialize in area of interest",
    ],
    realityCheck: "Complex debugging can be frustrating. Safety requirements are strict. But high demand and satisfaction from making things work.",
  },

  "plumber": {
    typicalDay: {
      morning: [
        "Arrive at job site",
        "Review work orders",
        "Gather tools and materials",
        "Start installation or repair",
      ],
      midday: [
        "Continue plumbing work",
        "Coordinate with other trades",
        "Problem-solving on site",
        "Quick lunch break",
      ],
      afternoon: [
        "Complete and test work",
        "Clean up job site",
        "Documentation and sign-off",
        "Travel to next job or office",
      ],
      tools: ["Pipe wrenches and cutters", "Soldering equipment", "Diagnostic tools", "Safety equipment"],
      environment: "Construction sites, homes, buildings (physical work, various conditions)",
    },
    whatYouActuallyDo: [
      "Install water and drainage systems",
      "Repair leaks and blockages",
      "Install heating systems",
      "Read and follow blueprints",
      "Ensure code compliance",
      "Troubleshoot problems",
    ],
    whoThisIsGoodFor: [
      "People who like hands-on work",
      "Problem-solvers",
      "Those comfortable in tight spaces",
      "Physically fit individuals",
      "Independent workers",
    ],
    topSkills: [
      "Plumbing systems knowledge",
      "Blueprint reading",
      "Problem-solving",
      "Physical fitness",
      "Customer service",
      "Safety awareness",
    ],
    entryPaths: [
      "Vocational training (VG1 + VG2)",
      "Apprenticeship (2.5 years)",
      "Fagbrev certification",
      "Start as helper or assistant",
    ],
    realityCheck: "Physical, sometimes unpleasant work. Emergency calls disrupt schedules. But strong demand, good pay, and job security.",
  },

  "petroleum-engineer": {
    typicalDay: {
      morning: [
        "Review production data",
        "Team meetings on well performance",
        "Analyse reservoir simulations",
        "Plan drilling operations",
      ],
      midday: [
        "Technical analysis work",
        "Coordination with offshore teams",
        "Safety reviews",
        "Documentation",
      ],
      afternoon: [
        "Project planning",
        "Vendor and contractor meetings",
        "Report preparation",
        "Training and development",
      ],
      tools: ["Reservoir simulation software", "Data analysis tools", "CAD", "Communication systems"],
      environment: "Office and offshore platforms (rotational schedules offshore)",
    },
    whatYouActuallyDo: [
      "Optimise oil and gas extraction",
      "Design drilling and production programs",
      "Analyse reservoir performance",
      "Ensure safe operations",
      "Manage projects and budgets",
      "Work with multidisciplinary teams",
    ],
    whoThisIsGoodFor: [
      "Analytical problem-solvers",
      "People interested in energy",
      "Those comfortable with offshore rotation",
      "Team players",
      "Safety-conscious individuals",
    ],
    topSkills: [
      "Petroleum engineering principles",
      "Data analysis",
      "Project management",
      "Safety awareness",
      "Communication",
      "Problem-solving",
    ],
    entryPaths: [
      "Bachelor's or Master's in Petroleum Engineering",
      "Internships in oil companies",
      "Graduate programs in industry",
      "Strong technical foundation",
    ],
    realityCheck: "Industry is cyclical with layoffs. Offshore rotation affects life. Environmental concerns growing. But high compensation and technical challenges.",
  },

  "renewable-energy-tech": {
    typicalDay: {
      morning: [
        "Travel to installation site",
        "Safety briefing and equipment check",
        "Begin installation or maintenance",
        "Coordinate with team",
      ],
      midday: [
        "Continue technical work",
        "Troubleshoot issues",
        "Quality checks",
        "Lunch break",
      ],
      afternoon: [
        "Complete installation/maintenance",
        "Test systems",
        "Documentation",
        "Clean up and prepare for next day",
      ],
      tools: ["Electrical testing equipment", "Hand and power tools", "Safety equipment", "Monitoring software"],
      environment: "Outdoor sites, rooftops, wind farms (physical work, weather-dependent)",
    },
    whatYouActuallyDo: [
      "Install solar panels and wind turbines",
      "Maintain and repair renewable systems",
      "Troubleshoot electrical issues",
      "Perform safety inspections",
      "Monitor system performance",
      "Work at heights and outdoors",
    ],
    whoThisIsGoodFor: [
      "People who care about environment",
      "Those comfortable with heights",
      "Hands-on problem-solvers",
      "Physically fit individuals",
      "Safety-conscious workers",
    ],
    topSkills: [
      "Electrical systems",
      "Safety procedures",
      "Troubleshooting",
      "Physical fitness",
      "Documentation",
      "Renewable technology",
    ],
    entryPaths: [
      "Electrical or technical vocational training",
      "Specialised renewable energy courses",
      "Certifications for specific technologies",
      "Apprenticeship or entry-level role",
    ],
    realityCheck: "Work outdoors in all weather. Heights and physical demands. But growing industry with meaningful environmental impact.",
  },

  "process-operator": {
    typicalDay: {
      morning: [
        "Shift handover briefing",
        "Check control room systems",
        "Monitor process parameters",
        "Make routine adjustments",
      ],
      midday: [
        "Continue monitoring",
        "Perform sample collections",
        "Document readings",
        "Coordinate maintenance",
      ],
      afternoon: [
        "Quality checks",
        "Troubleshoot any issues",
        "Prepare shift reports",
        "Handover to next shift",
      ],
      tools: ["Control room systems (DCS, SCADA)", "Monitoring equipment", "Safety systems", "Communication devices"],
      environment: "Control rooms and plant floors (shift work including nights)",
    },
    whatYouActuallyDo: [
      "Monitor and control industrial processes",
      "Adjust parameters to maintain quality",
      "Respond to alarms and abnormalities",
      "Perform safety procedures",
      "Collect and test samples",
      "Coordinate with maintenance",
    ],
    whoThisIsGoodFor: [
      "Vigilant, attentive individuals",
      "People comfortable with shift work",
      "Those who follow procedures carefully",
      "Quick decision-makers",
      "Safety-conscious workers",
    ],
    topSkills: [
      "Process understanding",
      "Attention to detail",
      "Safety procedures",
      "Problem-solving",
      "Communication",
      "Stress management",
    ],
    entryPaths: [
      "Vocational training (VG1 + VG2)",
      "Apprenticeship in process industry",
      "Fagbrev certification",
      "Entry-level operator role",
    ],
    realityCheck: "Shift work disrupts life patterns. Responsibility for expensive equipment. But good pay and benefits in stable industries.",
  },

  "carpenter": {
    typicalDay: {
      morning: [
        "Arrive at construction site",
        "Review blueprints and plans",
        "Set up workspace and tools",
        "Begin construction work",
      ],
      midday: [
        "Continue framing/building",
        "Measure and cut materials",
        "Install structures",
        "Lunch break",
      ],
      afternoon: [
        "Complete day's work",
        "Quality checks",
        "Clean up site",
        "Plan for next day",
      ],
      tools: ["Power saws", "Nail guns", "Measuring tools", "Hand tools", "Safety equipment"],
      environment: "Construction sites, outdoors and indoors (physical work, weather exposure)",
    },
    whatYouActuallyDo: [
      "Build wooden structures and frameworks",
      "Read and interpret blueprints",
      "Measure, cut, and install materials",
      "Build forms for concrete",
      "Install doors, windows, cabinets",
      "Ensure quality and safety",
    ],
    whoThisIsGoodFor: [
      "People who like building things",
      "Physically strong individuals",
      "Detail-oriented workers",
      "Problem-solvers",
      "Those who prefer outdoor work",
    ],
    topSkills: [
      "Woodworking",
      "Blueprint reading",
      "Precision measurement",
      "Physical fitness",
      "Safety awareness",
      "Problem-solving",
    ],
    entryPaths: [
      "Vocational training (VG1 + VG2)",
      "Apprenticeship (2 years)",
      "Fagbrev as tømrer",
      "Start as helper or assistant",
    ],
    realityCheck: "Hard physical work. Weather affects work. Injuries are common if not careful. But satisfaction from building and good job market.",
  },

  // ========================================
  // LOGISTICS, TRANSPORT & SUPPLY CHAIN
  // ========================================
  "logistics-coordinator": {
    typicalDay: {
      morning: [
        "Review pending shipments",
        "Check carrier availability",
        "Coordinate with warehouse",
        "Handle urgent issues",
      ],
      midday: [
        "Book transportation",
        "Track shipments",
        "Communicate with customers",
        "Documentation processing",
      ],
      afternoon: [
        "Resolve delivery issues",
        "Plan upcoming shipments",
        "Update systems",
        "Report on metrics",
      ],
      tools: ["TMS systems", "Excel", "Communication platforms", "Tracking systems"],
      environment: "Office setting, can be fast-paced during peak periods",
    },
    whatYouActuallyDo: [
      "Coordinate goods movement",
      "Book and track shipments",
      "Communicate with carriers and customers",
      "Solve logistics problems",
      "Process documentation",
      "Monitor delivery performance",
    ],
    whoThisIsGoodFor: [
      "Organised multitaskers",
      "Problem-solvers",
      "Good communicators",
      "Detail-oriented individuals",
      "People who handle pressure well",
    ],
    topSkills: [
      "Organization",
      "Communication",
      "Problem-solving",
      "Logistics knowledge",
      "Software skills",
      "Time management",
    ],
    entryPaths: [
      "Bachelor's in Logistics or Business",
      "Entry-level coordinator role",
      "Warehouse or transport experience",
      "Logistics certifications helpful",
    ],
    realityCheck: "Things go wrong constantly. High pressure during peaks. But good entry to supply chain career with growth potential.",
  },

  "supply-chain-manager": {
    typicalDay: {
      morning: [
        "Review KPIs and dashboards",
        "Team meetings",
        "Supplier calls",
        "Strategy discussions",
      ],
      midday: [
        "Process improvement projects",
        "Budget reviews",
        "Cross-functional coordination",
        "Working lunch",
      ],
      afternoon: [
        "Vendor negotiations",
        "Risk assessment",
        "Report preparation",
        "Leadership meetings",
      ],
      tools: ["ERP systems", "Analytics platforms", "Procurement tools", "BI dashboards"],
      environment: "Office with travel to suppliers and facilities",
    },
    whatYouActuallyDo: [
      "Optimise end-to-end supply chain",
      "Manage supplier relationships",
      "Reduce costs and improve efficiency",
      "Lead supply chain team",
      "Plan for demand fluctuations",
      "Mitigate supply risks",
    ],
    whoThisIsGoodFor: [
      "Strategic thinkers",
      "Strong negotiators",
      "Data-driven decision makers",
      "People who see the big picture",
      "Collaborative leaders",
    ],
    topSkills: [
      "Supply chain strategy",
      "Negotiation",
      "Data analysis",
      "Leadership",
      "Process improvement",
      "Risk management",
    ],
    entryPaths: [
      "Bachelor's or Master's in Supply Chain",
      "Progress through logistics roles",
      "APICS or supply chain certifications",
      "Experience across supply chain functions",
    ],
    realityCheck: "Constant firefighting when issues arise. Complex global coordination. But strategic role with significant business impact.",
  },

  "truck-driver": {
    typicalDay: {
      morning: [
        "Pre-trip vehicle inspection",
        "Load or verify cargo",
        "Plan route",
        "Begin driving",
      ],
      midday: [
        "Continue driving with breaks",
        "Delivery stops",
        "Documentation at each stop",
        "Lunch break",
      ],
      afternoon: [
        "Complete deliveries",
        "Return to base or continue route",
        "End-of-day paperwork",
        "Vehicle maintenance checks",
      ],
      tools: ["Truck and trailer", "GPS and navigation", "Mobile apps for logging", "Communication devices"],
      environment: "On the road, can involve long distance or local routes",
    },
    whatYouActuallyDo: [
      "Drive heavy vehicles safely",
      "Load and secure cargo",
      "Make deliveries on schedule",
      "Maintain driving logs",
      "Perform vehicle inspections",
      "Interact with customers",
    ],
    whoThisIsGoodFor: [
      "Independent workers",
      "People who enjoy driving",
      "Those comfortable alone for long periods",
      "Reliable, responsible individuals",
      "People who like varied locations",
    ],
    topSkills: [
      "Professional driving",
      "Safety awareness",
      "Time management",
      "Navigation",
      "Vehicle maintenance",
      "Customer service",
    ],
    entryPaths: [
      "Heavy vehicle license (Class C/CE)",
      "Professional driver certification",
      "Company training programs",
      "Start with smaller vehicles",
    ],
    realityCheck: "Long hours alone. Time away from home for long-haul. Physical loading in some roles. But independence and always-needed profession.",
  },

  "warehouse-manager": {
    typicalDay: {
      morning: [
        "Review overnight operations",
        "Staff briefing",
        "Walk warehouse floor",
        "Priority shipments",
      ],
      midday: [
        "Inventory management",
        "Team supervision",
        "Process improvement",
        "Handle issues",
      ],
      afternoon: [
        "Schedule planning",
        "Safety reviews",
        "Reporting and metrics",
        "Next-day preparation",
      ],
      tools: ["Warehouse management systems", "Inventory scanners", "Reporting tools", "Communication devices"],
      environment: "Warehouse facility, shift work may be required",
    },
    whatYouActuallyDo: [
      "Lead warehouse operations",
      "Manage warehouse staff",
      "Optimise storage and flow",
      "Ensure accurate inventory",
      "Maintain safety standards",
      "Meet performance targets",
    ],
    whoThisIsGoodFor: [
      "Natural leaders",
      "Organised operational thinkers",
      "Problem-solvers",
      "People who enjoy physical environments",
      "Results-driven individuals",
    ],
    topSkills: [
      "Leadership",
      "Operations management",
      "Inventory control",
      "Safety management",
      "Problem-solving",
      "Communication",
    ],
    entryPaths: [
      "Bachelor's in Logistics or Business",
      "Progress through warehouse roles",
      "Supervisory experience",
      "Warehouse management certifications",
    ],
    realityCheck: "High pressure during peak seasons. Managing diverse workforce. Physical environment. But satisfying operational leadership role.",
  },

  "freight-forwarder": {
    typicalDay: {
      morning: [
        "Check shipment status",
        "Respond to client inquiries",
        "Book transportation",
        "Customs documentation",
      ],
      midday: [
        "Coordinate with carriers",
        "Handle shipping issues",
        "Prepare export/import docs",
        "Client meetings",
      ],
      afternoon: [
        "Track international shipments",
        "Quote preparation",
        "Compliance reviews",
        "Plan upcoming shipments",
      ],
      tools: ["Forwarding software", "Customs systems", "Communication platforms", "Rate management tools"],
      environment: "Office setting with global coordination across time zones",
    },
    whatYouActuallyDo: [
      "Arrange international shipping",
      "Handle customs clearance",
      "Coordinate with global partners",
      "Prepare shipping documentation",
      "Quote and negotiate rates",
      "Solve cross-border issues",
    ],
    whoThisIsGoodFor: [
      "Detail-oriented organisers",
      "People who enjoy international work",
      "Good communicators",
      "Problem-solvers",
      "Those who handle complexity",
    ],
    topSkills: [
      "International logistics",
      "Customs regulations",
      "Documentation",
      "Communication",
      "Problem-solving",
      "Languages (helpful)",
    ],
    entryPaths: [
      "Bachelor's in Logistics or Business",
      "Entry-level forwarding role",
      "Customs certification",
      "Freight forwarding courses",
    ],
    realityCheck: "Regulations change constantly. Time zone challenges. Things go wrong with international shipments. But interesting global work.",
  },

  "delivery-driver": {
    typicalDay: {
      morning: [
        "Arrive and load vehicle",
        "Sort packages by route",
        "Plan delivery sequence",
        "Begin deliveries",
      ],
      midday: [
        "Continue deliveries",
        "Navigate to addresses",
        "Handle customer interactions",
        "Quick lunch break",
      ],
      afternoon: [
        "Complete delivery route",
        "Return to depot",
        "Unload returns",
        "End-of-day reporting",
      ],
      tools: ["Delivery vehicle", "Mobile app/scanner", "GPS navigation", "Communication device"],
      environment: "On the road locally, in and out of vehicle frequently",
    },
    whatYouActuallyDo: [
      "Deliver packages to customers",
      "Navigate efficiently",
      "Handle customer interactions",
      "Track deliveries electronically",
      "Load and organise packages",
      "Maintain vehicle",
    ],
    whoThisIsGoodFor: [
      "Active people who like movement",
      "Independent workers",
      "Those who enjoy driving",
      "People who like varied days",
      "Customer-friendly individuals",
    ],
    topSkills: [
      "Driving skills",
      "Time management",
      "Navigation",
      "Customer service",
      "Physical fitness",
      "Reliability",
    ],
    entryPaths: [
      "Valid driver's license",
      "Apply directly to delivery companies",
      "Minimal formal requirements",
      "Company provides training",
    ],
    realityCheck: "Physical work with time pressure. Weather doesn't stop deliveries. Tight delivery windows. But straightforward work with independence.",
  },

  "warehouse-worker": {
    typicalDay: {
      morning: [
        "Clock in and get assignments",
        "Pick orders from shelves",
        "Pack items for shipping",
        "Move inventory",
      ],
      midday: [
        "Continue picking and packing",
        "Receive incoming goods",
        "Put away inventory",
        "Lunch break",
      ],
      afternoon: [
        "Quality checks",
        "Load outgoing trucks",
        "Clean work area",
        "End-of-shift tasks",
      ],
      tools: ["RF scanners", "Pallet jacks/forklifts", "Packing materials", "Safety equipment"],
      environment: "Warehouse floor, physical work, often shift-based",
    },
    whatYouActuallyDo: [
      "Pick items for orders",
      "Pack shipments",
      "Receive and put away goods",
      "Operate material handling equipment",
      "Maintain organization",
      "Meet productivity targets",
    ],
    whoThisIsGoodFor: [
      "Active people",
      "Those who prefer physical work",
      "Team players",
      "Reliable individuals",
      "People who like structured tasks",
    ],
    topSkills: [
      "Physical fitness",
      "Attention to detail",
      "Teamwork",
      "Equipment operation",
      "Reliability",
      "Organization",
    ],
    entryPaths: [
      "No formal education required",
      "On-the-job training",
      "Forklift certification helpful",
      "Apply directly to warehouses",
    ],
    realityCheck: "Physically demanding. Repetitive tasks. Shift work and overtime common. But steady employment and clear path to advancement.",
  },

  // ========================================
  // HOSPITALITY, TOURISM & PERSONAL SERVICES
  // ========================================
  "hotel-manager": {
    typicalDay: {
      morning: [
        "Review overnight reports",
        "Department head meeting",
        "Walk the property",
        "Handle VIP arrivals",
      ],
      midday: [
        "Guest relations",
        "Operations oversight",
        "Staff issues and coaching",
        "Revenue management",
      ],
      afternoon: [
        "Event coordination",
        "Supplier meetings",
        "Financial reviews",
        "Quality inspections",
      ],
      tools: ["Property management systems", "Revenue management tools", "Communication platforms", "Financial software"],
      environment: "Hotel property, long hours including evenings and weekends",
    },
    whatYouActuallyDo: [
      "Oversee all hotel operations",
      "Manage and motivate staff",
      "Ensure guest satisfaction",
      "Control costs and revenue",
      "Handle complaints and issues",
      "Maintain property standards",
    ],
    whoThisIsGoodFor: [
      "People-oriented leaders",
      "Hospitality enthusiasts",
      "Problem-solvers who stay calm",
      "Multitaskers",
      "Service-minded individuals",
    ],
    topSkills: [
      "Leadership",
      "Customer service",
      "Operations management",
      "Financial management",
      "Communication",
      "Problem-solving",
    ],
    entryPaths: [
      "Bachelor's in Hospitality Management",
      "Progress through hotel departments",
      "Front desk to supervisor to manager",
      "International experience valued",
    ],
    realityCheck: "Long, irregular hours. Guest complaints can be stressful. Always on call for issues. But rewarding to create memorable experiences.",
  },

  "chef": {
    typicalDay: {
      morning: [
        "Receive and inspect deliveries",
        "Prep work for service",
        "Staff briefing",
        "Menu planning",
      ],
      midday: [
        "Lunch service",
        "Coordinate kitchen team",
        "Quality control",
        "Handle special requests",
      ],
      afternoon: [
        "Prep for dinner service",
        "Inventory management",
        "Menu development",
        "Staff training",
      ],
      tools: ["Kitchen equipment", "Ordering systems", "Recipe management", "Food safety tools"],
      environment: "Hot, fast-paced kitchen (split shifts, evenings, weekends)",
    },
    whatYouActuallyDo: [
      "Plan and create menus",
      "Prepare and cook dishes",
      "Manage kitchen team",
      "Ensure food quality and safety",
      "Control food costs",
      "Train kitchen staff",
    ],
    whoThisIsGoodFor: [
      "Creative food lovers",
      "People who thrive under pressure",
      "Those who enjoy physical work",
      "Leadership-oriented individuals",
      "Perfectionists",
    ],
    topSkills: [
      "Culinary techniques",
      "Creativity",
      "Leadership",
      "Time management",
      "Food safety",
      "Cost control",
    ],
    entryPaths: [
      "Culinary school or apprenticeship",
      "Vocational training + Fagbrev",
      "Start as commis chef",
      "Work up through kitchen brigade",
    ],
    realityCheck: "Hot, stressful environment. Long hours on feet. Low pay at entry level. But creative fulfillment and pride in craftsmanship.",
  },

  "tour-guide": {
    typicalDay: {
      morning: [
        "Prepare for tour",
        "Check equipment and supplies",
        "Meet tour group",
        "Begin tour experience",
      ],
      midday: [
        "Lead tour activities",
        "Share knowledge and stories",
        "Handle questions",
        "Ensure safety",
      ],
      afternoon: [
        "Complete tour",
        "Handle logistics",
        "Gather feedback",
        "Prepare for next tour",
      ],
      tools: ["Microphones/speakers", "First aid kit", "Communication devices", "Tour materials"],
      environment: "Outdoors at tourist sites, varies by season and weather",
    },
    whatYouActuallyDo: [
      "Lead groups through attractions",
      "Share knowledge engagingly",
      "Ensure guest safety and enjoyment",
      "Handle logistics and timing",
      "Answer questions",
      "Create memorable experiences",
    ],
    whoThisIsGoodFor: [
      "Outgoing, friendly people",
      "History or culture enthusiasts",
      "Good storytellers",
      "Those who enjoy meeting people",
      "Patient problem-solvers",
    ],
    topSkills: [
      "Communication",
      "Local knowledge",
      "Languages",
      "Customer service",
      "Storytelling",
      "Safety awareness",
    ],
    entryPaths: [
      "Tourism education",
      "Deep local knowledge",
      "Language skills important",
      "Guiding certifications",
    ],
    realityCheck: "Seasonal work in many locations. Repetitive content delivery. Outdoor work in all conditions. But meeting people from everywhere and sharing passion.",
  },

  "flight-attendant": {
    typicalDay: {
      morning: [
        "Crew briefing",
        "Aircraft safety check",
        "Board and welcome passengers",
        "Safety demonstration",
      ],
      midday: [
        "In-flight service",
        "Passenger assistance",
        "Handle requests and issues",
        "Monitor cabin",
      ],
      afternoon: [
        "Prepare for landing",
        "Post-flight duties",
        "Complete paperwork",
        "Travel to accommodation",
      ],
      tools: ["Service carts", "Safety equipment", "Communication systems", "Service manuals"],
      environment: "Aircraft cabin and airports, irregular hours with layovers",
    },
    whatYouActuallyDo: [
      "Ensure passenger safety",
      "Provide in-flight service",
      "Handle emergencies",
      "Manage passenger needs",
      "Enforce regulations",
      "Create pleasant experience",
    ],
    whoThisIsGoodFor: [
      "Service-oriented individuals",
      "People who enjoy travel",
      "Those who stay calm in emergencies",
      "Flexible, adaptable people",
      "Good communicators",
    ],
    topSkills: [
      "Customer service",
      "Safety procedures",
      "Communication",
      "Languages",
      "Conflict resolution",
      "Adaptability",
    ],
    entryPaths: [
      "Airline training program",
      "Language skills valued",
      "Customer service background helps",
      "Height and health requirements vary",
    ],
    realityCheck: "Jet lag and irregular schedule. Time away from home. Dealing with difficult passengers. But travel benefits and meeting diverse people.",
  },

  "hairdresser": {
    typicalDay: {
      morning: [
        "Open salon",
        "Prepare stations",
        "Client consultations",
        "Begin appointments",
      ],
      midday: [
        "Continue styling",
        "Color treatments",
        "Walk-in clients",
        "Quick lunch",
      ],
      afternoon: [
        "More appointments",
        "Product recommendations",
        "Clean stations",
        "Close salon",
      ],
      tools: ["Scissors and razors", "Hair dryers and styling tools", "Color products", "Salon software"],
      environment: "Salon setting, standing work, Saturday work common",
    },
    whatYouActuallyDo: [
      "Cut, color, and style hair",
      "Consult with clients on looks",
      "Apply treatments",
      "Recommend products",
      "Build client relationships",
      "Stay current with trends",
    ],
    whoThisIsGoodFor: [
      "Creative, artistic people",
      "Good listeners",
      "Those who enjoy making people feel good",
      "Social individuals",
      "Trend-aware fashion lovers",
    ],
    topSkills: [
      "Hair techniques",
      "Creativity",
      "Communication",
      "Customer service",
      "Trend awareness",
      "Time management",
    ],
    entryPaths: [
      "Vocational training (VG1 + VG2)",
      "Apprenticeship (2 years)",
      "Fagbrev as frisør",
      "Assistant to own chair",
    ],
    realityCheck: "On feet all day. Building clientele takes time. Income can be variable. But creative satisfaction and personal connections.",
  },

  "fitness-instructor": {
    typicalDay: {
      morning: [
        "Early morning classes",
        "Personal training sessions",
        "Program planning",
        "Client consultations",
      ],
      midday: [
        "Lunch classes",
        "Member support",
        "Administrative tasks",
        "Personal workout",
      ],
      afternoon: [
        "Evening classes",
        "Personal training",
        "New member orientations",
        "Close facility",
      ],
      tools: ["Fitness equipment", "Music systems", "Scheduling software", "Heart rate monitors"],
      environment: "Gym or fitness studio, early mornings and evenings busy",
    },
    whatYouActuallyDo: [
      "Lead group fitness classes",
      "Provide personal training",
      "Create workout programs",
      "Motivate and support clients",
      "Track client progress",
      "Maintain fitness knowledge",
    ],
    whoThisIsGoodFor: [
      "Energetic, motivating people",
      "Fitness enthusiasts",
      "Good communicators",
      "Those who enjoy helping others",
      "Self-disciplined individuals",
    ],
    topSkills: [
      "Exercise science",
      "Motivation",
      "Communication",
      "Program design",
      "Safety awareness",
      "Customer service",
    ],
    entryPaths: [
      "Fitness certifications (NASM, ACE)",
      "Sports education background",
      "Group fitness certifications",
      "Start teaching classes",
    ],
    realityCheck: "Early and late hours. Physical demands on your body. Income often per class/session. But helping people transform their health.",
  },

  "restaurant-server": {
    typicalDay: {
      morning: [
        "Arrive and set up station",
        "Review menu and specials",
        "Prep service items",
        "Team briefing",
      ],
      midday: [
        "Greet and seat guests",
        "Take orders",
        "Serve food and drinks",
        "Check on tables",
      ],
      afternoon: [
        "Continue service",
        "Process payments",
        "Reset tables",
        "Side work and closing",
      ],
      tools: ["POS systems", "Ordering devices", "Service trays", "Communication tools"],
      environment: "Restaurant floor, on feet, evenings and weekends",
    },
    whatYouActuallyDo: [
      "Welcome and serve guests",
      "Take orders accurately",
      "Deliver food and beverages",
      "Handle payments",
      "Ensure guest satisfaction",
      "Maintain clean tables",
    ],
    whoThisIsGoodFor: [
      "Friendly, outgoing people",
      "Good multitaskers",
      "Those who enjoy fast pace",
      "People-oriented individuals",
      "Quick learners",
    ],
    topSkills: [
      "Customer service",
      "Multitasking",
      "Communication",
      "Memory",
      "Speed and efficiency",
      "Teamwork",
    ],
    entryPaths: [
      "No formal education required",
      "Restaurant training provided",
      "Start in casual dining",
      "Move to fine dining with experience",
    ],
    realityCheck: "On feet for hours. Evening and weekend work. Depends on tips. But social, fast-paced environment with immediate rewards.",
  },

  "event-planner": {
    typicalDay: {
      morning: [
        "Review upcoming events",
        "Vendor calls and coordination",
        "Site visits",
        "Client meetings",
      ],
      midday: [
        "Budget management",
        "Timeline updates",
        "Team coordination",
        "Contract negotiations",
      ],
      afternoon: [
        "Detail planning",
        "Problem-solving issues",
        "Client communication",
        "On-site event management",
      ],
      tools: ["Event management software", "Project management tools", "Communication platforms", "Design tools"],
      environment: "Office and event venues, long hours during events",
    },
    whatYouActuallyDo: [
      "Plan and coordinate events",
      "Manage vendors and suppliers",
      "Create budgets and timelines",
      "Handle logistics",
      "Solve last-minute problems",
      "Ensure successful execution",
    ],
    whoThisIsGoodFor: [
      "Highly organised individuals",
      "Creative problem-solvers",
      "Those who thrive under pressure",
      "Detail-oriented planners",
      "People who enjoy variety",
    ],
    topSkills: [
      "Organization",
      "Communication",
      "Negotiation",
      "Problem-solving",
      "Creativity",
      "Budget management",
    ],
    entryPaths: [
      "Bachelor's in Event Management or Marketing",
      "Hospitality experience",
      "Start as coordinator or assistant",
      "Build portfolio of events",
    ],
    realityCheck: "Stressful during events. Irregular hours. Things always go wrong. But satisfaction from creating memorable experiences.",
  },

  "receptionist": {
    typicalDay: {
      morning: [
        "Open front desk",
        "Check in early arrivals",
        "Handle reservations",
        "Answer inquiries",
      ],
      midday: [
        "Guest check-outs",
        "Process payments",
        "Handle requests",
        "Coordinate with departments",
      ],
      afternoon: [
        "Afternoon check-ins",
        "Concierge services",
        "Problem resolution",
        "Shift handover",
      ],
      tools: ["Property management systems", "Phone systems", "Payment terminals", "Reservation platforms"],
      environment: "Front desk area, shift work including nights and weekends",
    },
    whatYouActuallyDo: [
      "Welcome and register guests",
      "Process check-ins and check-outs",
      "Handle reservations",
      "Answer questions and provide info",
      "Process payments",
      "Coordinate guest requests",
    ],
    whoThisIsGoodFor: [
      "Friendly, welcoming people",
      "Good multitaskers",
      "Problem-solvers",
      "Organised individuals",
      "Those with language skills",
    ],
    topSkills: [
      "Customer service",
      "Communication",
      "Computer systems",
      "Languages",
      "Problem-solving",
      "Organization",
    ],
    entryPaths: [
      "Hospitality training helpful",
      "Customer service experience",
      "Language skills valued",
      "On-the-job training provided",
    ],
    realityCheck: "Shift work and long standing hours. Dealing with complaints. Repetitive tasks. But meeting people and entry to hospitality industry.",
  },

  // ========================================
  // NEW TECH CAREERS
  // ========================================
  "rte": {
    typicalDay: {
      morning: [
        "Review ART health metrics and risks",
        "Sync with Scrum Masters on team status",
        "Prepare for or facilitate key meetings",
        "Address program-level impediments",
      ],
      midday: [
        "Facilitate cross-team coordination",
        "Coach teams on SAFe practices",
        "Work with Product Management on priorities",
        "Update program boards and dashboards",
      ],
      afternoon: [
        "Stakeholder communication",
        "Plan upcoming PI events",
        "Continuous improvement activities",
        "Prepare retrospective insights",
      ],
      tools: ["Jira/Azure DevOps", "Miro/Mural", "SAFe tooling", "Confluence", "Video conferencing"],
      environment: "Office or remote, heavy facilitation and meetings",
    },
    whatYouActuallyDo: [
      "Facilitate PI Planning events (2-day sessions)",
      "Remove program-level impediments",
      "Coordinate multiple Agile teams",
      "Track ART progress and health metrics",
      "Coach Scrum Masters and teams",
      "Drive continuous improvement",
    ],
    whoThisIsGoodFor: [
      "Natural facilitators and communicators",
      "Those with Agile/Scrum experience",
      "Big-picture thinkers",
      "Patient problem-solvers",
      "People who enjoy coordination",
    ],
    topSkills: [
      "SAFe Framework",
      "Facilitation",
      "Program management",
      "Conflict resolution",
      "Servant leadership",
      "Communication",
    ],
    entryPaths: [
      "Experienced Scrum Master → RTE",
      "Project Manager with Agile experience",
      "SAFe certifications (SA, RTE)",
      "Program management background",
    ],
    realityCheck: "High visibility role with lots of pressure during PI events. Success depends on influence without authority. Rewarding when teams deliver together.",
  },

  "product-owner": {
    typicalDay: {
      morning: [
        "Review overnight feedback and metrics",
        "Prioritise backlog items",
        "Prepare for backlog refinement",
        "Sync with stakeholders",
      ],
      midday: [
        "Facilitate backlog refinement",
        "Answer team questions",
        "Write and refine user stories",
        "Review completed work",
      ],
      afternoon: [
        "Stakeholder meetings",
        "Research user needs",
        "Plan upcoming sprints",
        "Analyse product metrics",
      ],
      tools: ["Jira/Azure DevOps", "Analytics platforms", "Prototyping tools", "User research tools"],
      environment: "Office or remote, constant collaboration with team and stakeholders",
    },
    whatYouActuallyDo: [
      "Own and prioritise the product backlog",
      "Write clear user stories with acceptance criteria",
      "Make trade-off decisions",
      "Accept or reject completed work",
      "Communicate vision to the team",
      "Gather and incorporate feedback",
    ],
    whoThisIsGoodFor: [
      "Decision-makers comfortable with trade-offs",
      "Strong communicators",
      "Customer-focused thinkers",
      "Detail-oriented planners",
      "Those who can say 'no' constructively",
    ],
    topSkills: [
      "Backlog management",
      "User story writing",
      "Prioritization",
      "Stakeholder management",
      "Agile methodologies",
      "Domain knowledge",
    ],
    entryPaths: [
      "Business Analyst → PO",
      "Domain expert transition",
      "CSPO/PSPO certification",
      "Junior PO or Associate PM",
    ],
    realityCheck: "Constant requests from all directions. Must balance stakeholder demands. Rewarding when you ship features users love.",
  },

  "technical-writer": {
    typicalDay: {
      morning: [
        "Review documentation feedback",
        "Plan writing tasks for the day",
        "Attend developer standups",
        "Research technical topics",
      ],
      midday: [
        "Write and edit documentation",
        "Interview developers about features",
        "Create diagrams and visuals",
        "Test documented procedures",
      ],
      afternoon: [
        "Review pull requests for docs",
        "Update existing documentation",
        "Coordinate with product team",
        "Maintain documentation systems",
      ],
      tools: ["Markdown editors", "Git", "Diagramming tools", "Doc platforms (GitBook, Notion)"],
      environment: "Office or remote, independent work with team collaboration",
    },
    whatYouActuallyDo: [
      "Write clear, accurate technical documentation",
      "Create API references and guides",
      "Translate complex concepts for users",
      "Maintain documentation accuracy",
      "Work with SMEs to gather information",
      "Test documented procedures",
    ],
    whoThisIsGoodFor: [
      "Clear, concise writers",
      "Those who enjoy explaining complex things",
      "Detail-oriented researchers",
      "Technically curious individuals",
      "Patient interviewers",
    ],
    topSkills: [
      "Technical writing",
      "Information architecture",
      "Research",
      "Tool proficiency",
      "Attention to detail",
      "Communication",
    ],
    entryPaths: [
      "Developer with writing skills",
      "Communications background + tech interest",
      "Technical writing courses",
      "Start with internal docs",
    ],
    realityCheck: "Often undervalued but essential. Requires chasing busy developers for info. Satisfaction when users find answers.",
  },

  "frontend-developer": {
    typicalDay: {
      morning: [
        "Check overnight build status",
        "Review PRs from teammates",
        "Daily standup meeting",
        "Plan coding tasks",
      ],
      midday: [
        "Implement UI components",
        "Collaborate with designers",
        "Debug cross-browser issues",
        "Write unit tests",
      ],
      afternoon: [
        "Code review sessions",
        "Optimise performance",
        "Update documentation",
        "Deploy and test changes",
      ],
      tools: ["VS Code", "React/Vue/Angular", "Chrome DevTools", "Figma", "Git"],
      environment: "Office or remote, collaborative team environment",
    },
    whatYouActuallyDo: [
      "Build responsive user interfaces",
      "Implement designs pixel-perfectly",
      "Ensure accessibility compliance",
      "Optimise frontend performance",
      "Write maintainable component code",
      "Collaborate with backend developers",
    ],
    whoThisIsGoodFor: [
      "Visual thinkers who code",
      "Detail-oriented developers",
      "Those who care about user experience",
      "Problem-solvers",
      "Continuous learners",
    ],
    topSkills: [
      "JavaScript/TypeScript",
      "React/Vue/Angular",
      "CSS/Tailwind",
      "Responsive design",
      "Accessibility",
      "Performance optimization",
    ],
    entryPaths: [
      "Bootcamp graduate",
      "Self-taught with portfolio",
      "CS degree",
      "Start with personal projects",
    ],
    realityCheck: "Constant framework changes. Browser compatibility headaches. But immediate visual results and high demand.",
  },

  "backend-developer": {
    typicalDay: {
      morning: [
        "Review system health and logs",
        "Daily standup",
        "Triage bugs and issues",
        "Plan development tasks",
      ],
      midday: [
        "Design and implement APIs",
        "Write database queries",
        "Code review sessions",
        "Debug production issues",
      ],
      afternoon: [
        "Write integration tests",
        "Document API changes",
        "Deploy to staging",
        "Collaborate with frontend team",
      ],
      tools: ["IDE (IntelliJ, VS Code)", "Docker", "PostgreSQL/MongoDB", "Git", "Postman"],
      environment: "Office or remote, deep focus work with collaboration",
    },
    whatYouActuallyDo: [
      "Design scalable APIs and services",
      "Write efficient database queries",
      "Implement business logic",
      "Ensure security best practices",
      "Handle system integrations",
      "Optimise performance and reliability",
    ],
    whoThisIsGoodFor: [
      "Logical, systematic thinkers",
      "Those who enjoy solving complex problems",
      "Security-conscious developers",
      "People who like building foundations",
      "Detail-oriented programmers",
    ],
    topSkills: [
      "Server-side languages",
      "Database design",
      "API design",
      "Security",
      "System design",
      "Performance optimization",
    ],
    entryPaths: [
      "CS degree",
      "Bootcamp with backend focus",
      "Self-taught with projects",
      "Start with full-stack roles",
    ],
    realityCheck: "Less visible than frontend work. On-call responsibilities. But critical role and strong job market.",
  },

  "mobile-developer": {
    typicalDay: {
      morning: [
        "Check app crash reports",
        "Review user feedback",
        "Daily standup",
        "Plan feature work",
      ],
      midday: [
        "Develop mobile features",
        "Test on multiple devices",
        "Collaborate with designers",
        "Fix platform-specific bugs",
      ],
      afternoon: [
        "Code review",
        "Prepare app store submissions",
        "Optimise battery/performance",
        "Update dependencies",
      ],
      tools: ["Xcode/Android Studio", "Swift/Kotlin", "React Native/Flutter", "Firebase", "Git"],
      environment: "Office or remote, device testing lab access needed",
    },
    whatYouActuallyDo: [
      "Build native or cross-platform apps",
      "Implement smooth UI/animations",
      "Handle device-specific quirks",
      "Optimise for battery and performance",
      "Navigate app store guidelines",
      "Integrate with backend APIs",
    ],
    whoThisIsGoodFor: [
      "Those who love mobile apps",
      "Detail-oriented developers",
      "UX-focused programmers",
      "Problem-solvers",
      "Continuous learners",
    ],
    topSkills: [
      "Swift/Kotlin",
      "React Native/Flutter",
      "Mobile UX patterns",
      "Performance optimization",
      "App store processes",
      "API integration",
    ],
    entryPaths: [
      "Personal app projects",
      "CS degree with mobile focus",
      "Bootcamp",
      "Web developer transition",
    ],
    realityCheck: "Two platforms to support. Frequent OS updates. App store rejections. But huge user base and mobile-first world.",
  },

  "game-developer": {
    typicalDay: {
      morning: [
        "Bug triage and fixes",
        "Team standup",
        "Review playtest feedback",
        "Plan development tasks",
      ],
      midday: [
        "Implement game features",
        "Work with artists on integration",
        "Debug gameplay issues",
        "Optimise performance",
      ],
      afternoon: [
        "Playtest sessions",
        "Code review",
        "Collaborate on game design",
        "Update documentation",
      ],
      tools: ["Unity/Unreal Engine", "C++/C#", "Git/Perforce", "3D software", "Profiling tools"],
      environment: "Studio office, often with crunch periods near releases",
    },
    whatYouActuallyDo: [
      "Program gameplay mechanics",
      "Implement game AI",
      "Optimise for frame rate",
      "Integrate art and audio",
      "Fix bugs across platforms",
      "Collaborate with designers and artists",
    ],
    whoThisIsGoodFor: [
      "Passionate gamers who code",
      "Creative problem-solvers",
      "Math and physics enthusiasts",
      "Team players",
      "Those who handle crunch",
    ],
    topSkills: [
      "Game engines",
      "C++/C#",
      "3D math",
      "Performance optimization",
      "Game design understanding",
      "Collaboration",
    ],
    entryPaths: [
      "Game development degree",
      "Personal game projects",
      "Game jams",
      "QA to developer",
    ],
    realityCheck: "Competitive field. Crunch culture common. Lower pay than enterprise. But fulfilling creative work if you love games.",
  },

  "sre": {
    typicalDay: {
      morning: [
        "Review overnight alerts and incidents",
        "Check system dashboards",
        "Standup with engineering team",
        "Prioritise reliability work",
      ],
      midday: [
        "Automate operational tasks",
        "Investigate performance issues",
        "Write runbooks and docs",
        "Collaborate with dev teams",
      ],
      afternoon: [
        "Review and improve monitoring",
        "Capacity planning",
        "Incident response drills",
        "Deploy infrastructure changes",
      ],
      tools: ["Kubernetes", "Terraform", "Prometheus/Grafana", "PagerDuty", "Python/Go"],
      environment: "Office or remote, on-call rotation required",
    },
    whatYouActuallyDo: [
      "Keep systems running reliably",
      "Automate away manual work",
      "Respond to and learn from incidents",
      "Define and track SLOs",
      "Build monitoring and alerting",
      "Collaborate with developers on reliability",
    ],
    whoThisIsGoodFor: [
      "Systems thinkers",
      "Automation enthusiasts",
      "Calm under pressure",
      "Those who like variety",
      "Problem-solvers",
    ],
    topSkills: [
      "Systems engineering",
      "Automation",
      "Monitoring/Observability",
      "Incident response",
      "Cloud platforms",
      "Programming",
    ],
    entryPaths: [
      "Developer → SRE",
      "Sysadmin → SRE",
      "DevOps engineer path",
      "Cloud certifications",
    ],
    realityCheck: "On-call can be stressful. High stakes during incidents. But impactful work and strong compensation.",
  },

  "data-engineer": {
    typicalDay: {
      morning: [
        "Check overnight pipeline runs",
        "Review data quality alerts",
        "Standup with data team",
        "Plan development work",
      ],
      midday: [
        "Build and optimise pipelines",
        "Model data for analytics",
        "Support data scientists",
        "Document data sources",
      ],
      afternoon: [
        "Code review",
        "Deploy pipeline changes",
        "Troubleshoot data issues",
        "Meet with stakeholders",
      ],
      tools: ["Spark/Airflow", "SQL", "Python/Scala", "Cloud data platforms", "dbt"],
      environment: "Office or remote, close collaboration with analysts",
    },
    whatYouActuallyDo: [
      "Build reliable data pipelines",
      "Design data models and warehouses",
      "Ensure data quality and governance",
      "Optimise query performance",
      "Support analytics and ML teams",
      "Manage data infrastructure",
    ],
    whoThisIsGoodFor: [
      "Those who enjoy building systems",
      "SQL experts",
      "Problem-solvers",
      "Detail-oriented developers",
      "People who like data",
    ],
    topSkills: [
      "SQL",
      "Python/Scala",
      "Data pipelines",
      "Cloud platforms",
      "Data modeling",
      "ETL/ELT",
    ],
    entryPaths: [
      "Data analyst → engineer",
      "Backend developer → data",
      "CS degree with data focus",
      "Cloud certifications",
    ],
    realityCheck: "Pipelines break at inconvenient times. Data quality issues are tricky. But high demand and critical role.",
  },

  "security-engineer": {
    typicalDay: {
      morning: [
        "Review security alerts",
        "Check vulnerability scans",
        "Standup with security team",
        "Triage reported issues",
      ],
      midday: [
        "Conduct security assessments",
        "Review code for vulnerabilities",
        "Implement security controls",
        "Research new threats",
      ],
      afternoon: [
        "Incident response if needed",
        "Security training/awareness",
        "Document findings",
        "Meet with development teams",
      ],
      tools: ["Burp Suite", "SIEM tools", "Vulnerability scanners", "Code analysis tools", "Cloud security tools"],
      environment: "Office or remote, on-call for security incidents",
    },
    whatYouActuallyDo: [
      "Find and fix vulnerabilities",
      "Design secure architectures",
      "Respond to security incidents",
      "Train developers on security",
      "Implement security tools",
      "Stay current on threats",
    ],
    whoThisIsGoodFor: [
      "Security-minded thinkers",
      "Curious investigators",
      "Detail-oriented analysts",
      "Those who enjoy cat-and-mouse",
      "Ethical hackers",
    ],
    topSkills: [
      "Penetration testing",
      "Security architecture",
      "Incident response",
      "Secure coding",
      "Threat modeling",
      "Cloud security",
    ],
    entryPaths: [
      "Developer → security",
      "IT support → security",
      "Security certifications (OSCP, CEH)",
      "Bug bounty experience",
    ],
    realityCheck: "Constant threat landscape changes. High pressure during incidents. But critical, well-compensated work.",
  },

  "embedded-developer": {
    typicalDay: {
      morning: [
        "Debug hardware issues",
        "Review code changes",
        "Team sync",
        "Plan development tasks",
      ],
      midday: [
        "Write firmware code",
        "Test on hardware",
        "Work with hardware engineers",
        "Optimise for constraints",
      ],
      afternoon: [
        "Debug with oscilloscopes/analysers",
        "Document interfaces",
        "Code review",
        "Update test procedures",
      ],
      tools: ["IDEs (Keil, IAR)", "Oscilloscopes", "Logic analysers", "JTAG debuggers", "Git"],
      environment: "Lab environment with hardware, some office work",
    },
    whatYouActuallyDo: [
      "Write low-level firmware",
      "Optimise for memory and power",
      "Debug hardware-software issues",
      "Work with microcontrollers",
      "Implement communication protocols",
      "Test on real hardware",
    ],
    whoThisIsGoodFor: [
      "Low-level programming enthusiasts",
      "Those who like hardware",
      "Patient debuggers",
      "Detail-oriented developers",
      "Electronics hobbyists",
    ],
    topSkills: [
      "C/C++",
      "Microcontrollers",
      "RTOS",
      "Hardware interfaces",
      "Debugging",
      "Communication protocols",
    ],
    entryPaths: [
      "EE or CS degree",
      "Hobbyist projects (Arduino, etc.)",
      "Internships at hardware companies",
      "IoT bootcamps",
    ],
    realityCheck: "Hardware bugs are hard to find. Constrained resources. But seeing your code run on physical devices is rewarding.",
  },

  "enterprise-architect": {
    typicalDay: {
      morning: [
        "Review architecture governance issues",
        "Executive briefings",
        "Architecture review board prep",
        "Strategic planning meetings",
      ],
      midday: [
        "Project architecture reviews",
        "Vendor evaluations",
        "Standards documentation",
        "Stakeholder alignment",
      ],
      afternoon: [
        "Technology roadmap updates",
        "Cross-team coordination",
        "Present to leadership",
        "Mentoring architects",
      ],
      tools: ["ArchiMate/TOGAF tools", "Visio/LucidChart", "Confluence", "PowerPoint", "Enterprise modeling tools"],
      environment: "Office with extensive meetings, strategic and high-level",
    },
    whatYouActuallyDo: [
      "Define enterprise-wide architecture standards",
      "Align technology strategy with business goals",
      "Review and approve major technology decisions",
      "Create technology roadmaps",
      "Guide solution architects on complex projects",
      "Present to C-level executives",
    ],
    whoThisIsGoodFor: [
      "Big-picture strategic thinkers",
      "Experienced technologists who understand business",
      "Strong communicators",
      "Those who influence without direct authority",
      "Patient consensus builders",
    ],
    topSkills: [
      "Enterprise architecture frameworks",
      "Business strategy",
      "Stakeholder management",
      "Technology vision",
      "Communication",
      "Governance",
    ],
    entryPaths: [
      "Solutions Architect → Enterprise Architect",
      "Senior Developer → Architect track",
      "TOGAF certification essential",
      "10+ years technical experience",
    ],
    realityCheck: "Very political role. Lots of meetings and documentation. Impact is long-term and indirect. But shapes entire organization's technology direction.",
  },

  "data-architect": {
    typicalDay: {
      morning: [
        "Review data quality reports",
        "Data governance meetings",
        "Design reviews with data engineers",
        "Stakeholder consultations",
      ],
      midday: [
        "Data modeling sessions",
        "Platform architecture decisions",
        "Documentation updates",
        "Vendor evaluations",
      ],
      afternoon: [
        "Cross-team alignment",
        "Data strategy planning",
        "Standards definition",
        "Mentoring data engineers",
      ],
      tools: ["ERwin/ER Studio", "Data catalogs", "Cloud data platforms", "SQL", "Data governance tools"],
      environment: "Office or remote, strategic role with cross-team collaboration",
    },
    whatYouActuallyDo: [
      "Design enterprise data models",
      "Define data standards and governance",
      "Guide data platform architecture",
      "Ensure data quality and consistency",
      "Create data strategy roadmaps",
      "Collaborate with business on data needs",
    ],
    whoThisIsGoodFor: [
      "Data enthusiasts with strategic thinking",
      "Detail-oriented planners",
      "Strong communicators",
      "Those who enjoy governance and standards",
      "Experienced data professionals",
    ],
    topSkills: [
      "Data modeling",
      "Data governance",
      "Database design",
      "Cloud data platforms",
      "Data strategy",
      "Stakeholder management",
    ],
    entryPaths: [
      "Data Engineer → Data Architect",
      "DBA → Data Architect",
      "Senior Analyst → Architect track",
      "Data certifications helpful",
    ],
    realityCheck: "Lots of governance and documentation. Balancing business needs with technical constraints. But critical role as data becomes more valuable.",
  },

  // ========================================
  // NEW HEALTHCARE CAREERS
  // ========================================
  "veterinarian": {
    typicalDay: {
      morning: [
        "Review overnight hospitalized cases",
        "Morning consultations",
        "Perform examinations",
        "Review lab results",
      ],
      midday: [
        "Surgeries and procedures",
        "Emergency cases",
        "Consultations continue",
        "Brief lunch break",
      ],
      afternoon: [
        "Follow-up appointments",
        "Client education calls",
        "Administrative tasks",
        "Update medical records",
      ],
      tools: ["Medical equipment", "X-ray/ultrasound", "Lab analysers", "Practice management software"],
      environment: "Veterinary clinic or hospital, some house calls",
    },
    whatYouActuallyDo: [
      "Diagnose and treat animal illnesses",
      "Perform surgeries",
      "Prescribe medications",
      "Advise pet owners",
      "Handle emergency cases",
      "Maintain medical records",
    ],
    whoThisIsGoodFor: [
      "Animal lovers",
      "Those comfortable with surgery",
      "Strong communicators",
      "Calm under pressure",
      "Science-minded individuals",
    ],
    topSkills: [
      "Veterinary medicine",
      "Surgery",
      "Diagnosis",
      "Communication",
      "Empathy",
      "Business management",
    ],
    entryPaths: [
      "Veterinary degree (5.5-6 years)",
      "Specialization available",
      "Often work experience before studies",
      "Can specialise in specific animals",
    ],
    realityCheck: "Emotionally challenging (euthanasia). Long hours. Student debt. But deeply fulfilling helping animals.",
  },

  "veterinary-assistant": {
    typicalDay: {
      morning: [
        "Prepare exam rooms",
        "Check on hospitalized animals",
        "Assist with appointments",
        "Clean and organise",
      ],
      midday: [
        "Restrain animals for exams",
        "Assist in surgeries",
        "Feed and walk patients",
        "Handle lab samples",
      ],
      afternoon: [
        "Client communication",
        "Inventory management",
        "Clean facilities",
        "Prepare for next day",
      ],
      tools: ["Restraint equipment", "Basic medical tools", "Cleaning supplies", "Practice software"],
      environment: "Veterinary clinic, hands-on animal work",
    },
    whatYouActuallyDo: [
      "Restrain animals safely",
      "Assist veterinarians",
      "Care for hospitalized pets",
      "Maintain clean facilities",
      "Handle client inquiries",
      "Process basic samples",
    ],
    whoThisIsGoodFor: [
      "Animal lovers",
      "Patient, calm individuals",
      "Those comfortable with all animals",
      "Physically capable",
      "Team players",
    ],
    topSkills: [
      "Animal handling",
      "Basic medical care",
      "Communication",
      "Patience",
      "Physical stamina",
      "Attention to detail",
    ],
    entryPaths: [
      "On-the-job training",
      "Vocational courses available",
      "Can lead to vet tech/nurse",
      "Good entry to vet field",
    ],
    realityCheck: "Physical work. Bites and scratches happen. Emotional situations. But great for animal lovers starting out.",
  },

  "dental-hygienist": {
    typicalDay: {
      morning: [
        "Review patient schedules",
        "Prepare treatment rooms",
        "Patient cleanings",
        "Take X-rays",
      ],
      midday: [
        "Continue patient appointments",
        "Patient education sessions",
        "Apply treatments",
        "Document procedures",
      ],
      afternoon: [
        "Final patient appointments",
        "Sterilize instruments",
        "Update patient records",
        "Prepare for tomorrow",
      ],
      tools: ["Dental instruments", "X-ray equipment", "Ultrasonic scalers", "Patient management software"],
      environment: "Dental clinic, patient-facing all day",
    },
    whatYouActuallyDo: [
      "Clean teeth professionally",
      "Take and analyse X-rays",
      "Apply fluoride treatments",
      "Educate patients on oral health",
      "Screen for oral diseases",
      "Work with dentists on treatment",
    ],
    whoThisIsGoodFor: [
      "Detail-oriented individuals",
      "Patient educators",
      "Those who enjoy healthcare",
      "Good with people",
      "Steady-handed workers",
    ],
    topSkills: [
      "Dental procedures",
      "Patient education",
      "X-ray techniques",
      "Communication",
      "Manual dexterity",
      "Infection control",
    ],
    entryPaths: [
      "Bachelor's in Dental Hygiene (3 years)",
      "State authorization required",
      "Can work independently",
      "Continuing education required",
    ],
    realityCheck: "Repetitive motions can strain body. Patients can be anxious. But stable, well-paid healthcare career.",
  },

  "optician": {
    typicalDay: {
      morning: [
        "Open store and prepare",
        "Customer appointments",
        "Fit and adjust eyewear",
        "Process orders",
      ],
      midday: [
        "Consultations on frames",
        "Take measurements",
        "Repair eyewear",
        "Manage inventory",
      ],
      afternoon: [
        "Frame styling sessions",
        "Contact lens fittings",
        "Administrative tasks",
        "Close and reconcile",
      ],
      tools: ["Measuring equipment", "Frame adjustment tools", "Point of sale systems", "Lens edging equipment"],
      environment: "Optical store or clinic, customer-facing",
    },
    whatYouActuallyDo: [
      "Help customers choose frames",
      "Take precise measurements",
      "Fit and adjust eyewear",
      "Explain lens options",
      "Repair and maintain glasses",
      "Process insurance claims",
    ],
    whoThisIsGoodFor: [
      "Fashion-conscious helpers",
      "Detail-oriented workers",
      "Customer service naturals",
      "Technically minded",
      "Patient explainers",
    ],
    topSkills: [
      "Optical knowledge",
      "Customer service",
      "Precision measurements",
      "Sales",
      "Technical skills",
      "Fashion sense",
    ],
    entryPaths: [
      "Optician education (2-3 years)",
      "On-the-job training possible",
      "Authorization may be required",
      "Sales experience helpful",
    ],
    realityCheck: "Retail hours. Sales targets. Technical precision required. But helping people see better is rewarding.",
  },

  "lab-technician": {
    typicalDay: {
      morning: [
        "Receive and log samples",
        "Calibrate equipment",
        "Run routine analyses",
        "Document results",
      ],
      midday: [
        "Process urgent samples",
        "Quality control checks",
        "Maintain equipment",
        "Verify results",
      ],
      afternoon: [
        "Complete test batches",
        "Report critical values",
        "Prepare for next day",
        "Update documentation",
      ],
      tools: ["Analysers", "Microscopes", "Centrifuges", "Lab information systems", "Safety equipment"],
      environment: "Hospital or private laboratory, shift work possible",
    },
    whatYouActuallyDo: [
      "Analyse blood and tissue samples",
      "Operate laboratory equipment",
      "Ensure quality control",
      "Report results accurately",
      "Maintain sterile conditions",
      "Support medical diagnosis",
    ],
    whoThisIsGoodFor: [
      "Detail-oriented scientists",
      "Those who enjoy lab work",
      "Methodical workers",
      "Team players",
      "Quality-focused individuals",
    ],
    topSkills: [
      "Laboratory techniques",
      "Quality control",
      "Attention to detail",
      "Equipment operation",
      "Documentation",
      "Safety procedures",
    ],
    entryPaths: [
      "Bachelor's in Biomedical Lab Science",
      "State authorization required",
      "Hospital training programs",
      "Can specialise in areas",
    ],
    realityCheck: "Repetitive work. Shift schedules. Handling bodily fluids. But critical role in healthcare.",
  },

  // ========================================
  // NEW TRADE CAREERS
  // ========================================
  "hvac-technician": {
    typicalDay: {
      morning: [
        "Review service calls",
        "Load van with parts",
        "Travel to first job",
        "Diagnose HVAC issues",
      ],
      midday: [
        "Repair or install systems",
        "Test functionality",
        "Document work",
        "Travel to next job",
      ],
      afternoon: [
        "Complete service calls",
        "Order parts needed",
        "Update customer records",
        "Plan tomorrow's route",
      ],
      tools: ["HVAC gauges", "Multimeters", "Power tools", "Refrigerant equipment", "Diagnostic tools"],
      environment: "Customer sites, indoor and outdoor, all weather",
    },
    whatYouActuallyDo: [
      "Install heating and cooling systems",
      "Diagnose and repair problems",
      "Perform maintenance",
      "Work with refrigerants",
      "Read blueprints",
      "Advise customers",
    ],
    whoThisIsGoodFor: [
      "Hands-on problem-solvers",
      "Those comfortable with heights",
      "Independent workers",
      "Technically minded",
      "Customer service oriented",
    ],
    topSkills: [
      "HVAC systems",
      "Electrical knowledge",
      "Troubleshooting",
      "Customer service",
      "Physical fitness",
      "Safety practices",
    ],
    entryPaths: [
      "Vocational training + Apprenticeship",
      "Fagbrev certification",
      "Refrigerant handling certification",
      "On-the-job training available",
    ],
    realityCheck: "Hot attics, cold basements. Emergency calls. Physical work. But high demand and good pay.",
  },

  "painter": {
    typicalDay: {
      morning: [
        "Set up worksite",
        "Protect surfaces and floors",
        "Prepare surfaces",
        "Mix paints to spec",
      ],
      midday: [
        "Apply primer coats",
        "Paint walls and trim",
        "Handle detail work",
        "Break for lunch",
      ],
      afternoon: [
        "Complete painting",
        "Touch-ups and inspection",
        "Clean up worksite",
        "Prepare for next job",
      ],
      tools: ["Brushes and rollers", "Spray equipment", "Ladders/scaffolding", "Surface prep tools", "Safety equipment"],
      environment: "Construction sites, homes, commercial buildings",
    },
    whatYouActuallyDo: [
      "Prepare surfaces for painting",
      "Apply paint and coatings",
      "Match colors precisely",
      "Hang wallpaper",
      "Work at heights safely",
      "Protect surrounding areas",
    ],
    whoThisIsGoodFor: [
      "Detail-oriented workers",
      "Those who enjoy physical work",
      "Color-sensitive individuals",
      "Patient, methodical people",
      "Independent workers",
    ],
    topSkills: [
      "Surface preparation",
      "Paint application",
      "Color matching",
      "Attention to detail",
      "Physical stamina",
      "Safety awareness",
    ],
    entryPaths: [
      "Vocational training (2 years)",
      "Apprenticeship (2 years)",
      "Fagbrev certification",
      "Helper positions available",
    ],
    realityCheck: "Physical strain. Paint fumes. Weather dependent for exterior. But creative satisfaction and steady work.",
  },

  "welder": {
    typicalDay: {
      morning: [
        "Review blueprints",
        "Set up welding equipment",
        "Prepare metal pieces",
        "Begin welding tasks",
      ],
      midday: [
        "Continue welding work",
        "Inspect welds for quality",
        "Adjust techniques as needed",
        "Break for lunch",
      ],
      afternoon: [
        "Complete welding jobs",
        "Grind and finish welds",
        "Clean work area",
        "Maintain equipment",
      ],
      tools: ["Welding machines", "Grinders", "Measuring tools", "Safety gear", "Cutting equipment"],
      environment: "Fabrication shops, construction sites, shipyards",
    },
    whatYouActuallyDo: [
      "Join metal parts together",
      "Read and interpret blueprints",
      "Use various welding techniques",
      "Inspect weld quality",
      "Maintain equipment",
      "Follow safety protocols",
    ],
    whoThisIsGoodFor: [
      "Detail-oriented workers",
      "Steady-handed individuals",
      "Those who enjoy metalwork",
      "Safety-conscious people",
      "Physical workers",
    ],
    topSkills: [
      "Welding techniques",
      "Blueprint reading",
      "Precision",
      "Safety awareness",
      "Physical stamina",
      "Quality inspection",
    ],
    entryPaths: [
      "Vocational welding training",
      "Welding certifications",
      "Apprenticeship programs",
      "Specialised certifications available",
    ],
    realityCheck: "Hot, dirty work. Safety hazards if careless. Physically demanding. But skilled trade with good opportunities.",
  },

  "auto-mechanic": {
    typicalDay: {
      morning: [
        "Review work orders",
        "Diagnose vehicle issues",
        "Order needed parts",
        "Begin repairs",
      ],
      midday: [
        "Continue repair work",
        "Test repaired systems",
        "Perform maintenance services",
        "Update customers",
      ],
      afternoon: [
        "Complete repair jobs",
        "Document work done",
        "Clean workspace",
        "Prepare vehicles for pickup",
      ],
      tools: ["Diagnostic scanners", "Lifts", "Hand and power tools", "Specialty tools", "Shop equipment"],
      environment: "Auto repair shop, sometimes outdoor work",
    },
    whatYouActuallyDo: [
      "Diagnose vehicle problems",
      "Repair engines and systems",
      "Perform routine maintenance",
      "Use diagnostic equipment",
      "Explain repairs to customers",
      "Keep up with new technology",
    ],
    whoThisIsGoodFor: [
      "Car enthusiasts",
      "Problem-solving thinkers",
      "Hands-on workers",
      "Technically curious",
      "Customer-friendly individuals",
    ],
    topSkills: [
      "Automotive systems",
      "Diagnostics",
      "Problem-solving",
      "Technical knowledge",
      "Customer service",
      "Tool proficiency",
    ],
    entryPaths: [
      "Vocational training (2 years)",
      "Apprenticeship (2.5 years)",
      "Fagbrev certification",
      "Brand-specific training",
    ],
    realityCheck: "Dirty, physical work. Keeping up with EV technology. Customer pressure. But satisfying problem-solving.",
  },

  // ========================================
  // NEW PERSONAL SERVICE CAREERS
  // ========================================
  "massage-therapist": {
    typicalDay: {
      morning: [
        "Prepare treatment rooms",
        "Review client appointments",
        "Client consultations",
        "Perform massage sessions",
      ],
      midday: [
        "Continue client sessions",
        "Short breaks between clients",
        "Update treatment notes",
        "Sanitize between sessions",
      ],
      afternoon: [
        "Afternoon appointments",
        "Client follow-ups",
        "Clean and organise",
        "Plan next day's schedule",
      ],
      tools: ["Massage table", "Oils and lotions", "Hot stones", "Towels and linens", "Booking software"],
      environment: "Spa, wellness center, or private practice",
    },
    whatYouActuallyDo: [
      "Assess client needs",
      "Perform therapeutic massage",
      "Relieve muscle tension",
      "Promote relaxation",
      "Advise on wellness",
      "Maintain treatment records",
    ],
    whoThisIsGoodFor: [
      "Caring, empathetic people",
      "Physically fit individuals",
      "Those who enjoy helping others",
      "Good listeners",
      "Health-conscious workers",
    ],
    topSkills: [
      "Massage techniques",
      "Anatomy knowledge",
      "Communication",
      "Physical stamina",
      "Empathy",
      "Hygiene practices",
    ],
    entryPaths: [
      "Massage therapy certification",
      "1-2 year programs",
      "Can specialise (sports, medical)",
      "Continuing education for techniques",
    ],
    realityCheck: "Physically demanding on hands/body. Building clientele takes time. But flexible, rewarding wellness work.",
  },

  "beautician": {
    typicalDay: {
      morning: [
        "Set up treatment rooms",
        "Review appointments",
        "Skincare consultations",
        "Facial treatments",
      ],
      midday: [
        "Makeup applications",
        "Skincare treatments",
        "Product recommendations",
        "Quick breaks",
      ],
      afternoon: [
        "Continue appointments",
        "Bridal/event makeup",
        "Clean and sanitize",
        "Restock supplies",
      ],
      tools: ["Skincare equipment", "Makeup products", "Sterilization tools", "Treatment beds", "Lighting"],
      environment: "Salon, spa, or freelance at events",
    },
    whatYouActuallyDo: [
      "Perform skincare treatments",
      "Apply professional makeup",
      "Advise on products and routines",
      "Stay current on trends",
      "Maintain hygiene standards",
      "Build client relationships",
    ],
    whoThisIsGoodFor: [
      "Creative individuals",
      "Trend-aware people",
      "Good communicators",
      "Detail-oriented workers",
      "Those who enjoy transformation",
    ],
    topSkills: [
      "Makeup application",
      "Skincare knowledge",
      "Creativity",
      "Customer service",
      "Trend awareness",
      "Hygiene practices",
    ],
    entryPaths: [
      "Beauty school/vocational training",
      "Certifications available",
      "Portfolio building",
      "Assistant positions",
    ],
    realityCheck: "Building clientele takes time. Standing all day. Keeping up with trends. But creative, flexible career.",
  },

  "nail-technician": {
    typicalDay: {
      morning: [
        "Sanitize workspace",
        "Prepare for appointments",
        "Morning manicures/pedicures",
        "Nail art requests",
      ],
      midday: [
        "Continue nail services",
        "Gel and acrylic applications",
        "Quick breaks between clients",
        "Inventory check",
      ],
      afternoon: [
        "Afternoon appointments",
        "Complex nail art",
        "Clean and organise",
        "Update booking system",
      ],
      tools: ["Nail files and buffers", "UV lamps", "Gel/acrylic supplies", "Sterilization equipment", "Nail art tools"],
      environment: "Nail salon, spa, or own studio",
    },
    whatYouActuallyDo: [
      "Perform manicures and pedicures",
      "Apply nail enhancements",
      "Create nail art designs",
      "Maintain hygiene standards",
      "Advise on nail care",
      "Manage appointments",
    ],
    whoThisIsGoodFor: [
      "Creative, artistic people",
      "Detail-oriented workers",
      "Patient individuals",
      "Trend-followers",
      "Customer service naturals",
    ],
    topSkills: [
      "Nail techniques",
      "Creativity",
      "Attention to detail",
      "Customer service",
      "Hygiene practices",
      "Time management",
    ],
    entryPaths: [
      "Nail technician courses",
      "Certification programs",
      "Apprenticeship/assistant",
      "Portfolio building",
    ],
    realityCheck: "Sitting all day. Chemical exposure. Building clientele. But creative outlet and flexible schedule.",
  },

  // ========================================
  // NEW CREATIVE CAREERS
  // ========================================
  "photographer": {
    typicalDay: {
      morning: [
        "Edit photos from previous shoots",
        "Respond to client inquiries",
        "Plan upcoming shoots",
        "Prepare equipment",
      ],
      midday: [
        "Photo shoots (events, portraits, etc.)",
        "Scout locations",
        "Client meetings",
        "Quick edits for previews",
      ],
      afternoon: [
        "Continue shoots or editing",
        "Deliver final images",
        "Social media updates",
        "Equipment maintenance",
      ],
      tools: ["Camera bodies/lenses", "Lighting equipment", "Editing software", "Backup drives", "Studio equipment"],
      environment: "Studio, on-location, events, varied schedules",
    },
    whatYouActuallyDo: [
      "Plan and execute photo shoots",
      "Edit and retouch images",
      "Work with lighting",
      "Direct subjects/models",
      "Manage client relationships",
      "Market your services",
    ],
    whoThisIsGoodFor: [
      "Visual creatives",
      "Self-motivated individuals",
      "Good with people",
      "Business-minded artists",
      "Detail-oriented editors",
    ],
    topSkills: [
      "Camera operation",
      "Lighting",
      "Photo editing",
      "Composition",
      "Client communication",
      "Business management",
    ],
    entryPaths: [
      "Photography education",
      "Self-taught with portfolio",
      "Assistant to established photographer",
      "Specialize in niche (wedding, commercial, etc.)",
    ],
    realityCheck: "Irregular income when starting. Weekend/evening work. Equipment expensive. But creative freedom and variety.",
  },

  "video-editor": {
    typicalDay: {
      morning: [
        "Review footage",
        "Plan edit structure",
        "Import and organise media",
        "Begin rough cuts",
      ],
      midday: [
        "Continue editing",
        "Add effects and transitions",
        "Client review calls",
        "Revisions",
      ],
      afternoon: [
        "Color grading",
        "Audio mixing",
        "Final exports",
        "Deliver to clients",
      ],
      tools: ["Premiere Pro/DaVinci Resolve", "After Effects", "Audio software", "Fast computer", "Storage drives"],
      environment: "Studio or home office, deadline-driven",
    },
    whatYouActuallyDo: [
      "Cut and assemble video footage",
      "Add graphics and effects",
      "Color correct and grade",
      "Mix audio",
      "Meet client deadlines",
      "Manage media files",
    ],
    whoThisIsGoodFor: [
      "Visual storytellers",
      "Detail-oriented editors",
      "Patient workers",
      "Tech-savvy creatives",
      "Deadline performers",
    ],
    topSkills: [
      "Video editing software",
      "Storytelling",
      "Color grading",
      "Audio editing",
      "Time management",
      "Client communication",
    ],
    entryPaths: [
      "Film/media education",
      "Self-taught with portfolio",
      "Start with personal projects",
      "Assistant editor positions",
    ],
    realityCheck: "Long hours at computer. Tight deadlines. Demanding clients. But seeing finished product is rewarding.",
  },

  "interior-designer": {
    typicalDay: {
      morning: [
        "Review project status",
        "Client consultations",
        "Site visits",
        "Source materials/furniture",
      ],
      midday: [
        "Create design concepts",
        "Draft floor plans",
        "Prepare presentations",
        "Vendor meetings",
      ],
      afternoon: [
        "Client presentations",
        "Coordinate with contractors",
        "Order materials",
        "Update project timelines",
      ],
      tools: ["CAD software", "3D rendering tools", "Material samples", "Project management software", "Measuring tools"],
      environment: "Office, client sites, showrooms, varied",
    },
    whatYouActuallyDo: [
      "Design interior spaces",
      "Select materials and furnishings",
      "Create mood boards and plans",
      "Coordinate with contractors",
      "Manage project budgets",
      "Present to clients",
    ],
    whoThisIsGoodFor: [
      "Creative visualizers",
      "Detail-oriented planners",
      "Good communicators",
      "Trend-aware individuals",
      "Problem-solvers",
    ],
    topSkills: [
      "Space planning",
      "Color theory",
      "CAD software",
      "Project management",
      "Client communication",
      "Vendor relations",
    ],
    entryPaths: [
      "Interior design degree",
      "Architecture background",
      "Apprenticeship/internship",
      "Build portfolio",
    ],
    realityCheck: "Client taste differs from yours. Budget constraints. Long project timelines. But seeing spaces transform is magical.",
  },

  "architect": {
    typicalDay: {
      morning: [
        "Review project drawings",
        "Team meetings",
        "Client calls",
        "Design development",
      ],
      midday: [
        "CAD/BIM work",
        "Coordinate with engineers",
        "Site visits",
        "Review submissions",
      ],
      afternoon: [
        "Client presentations",
        "Municipal coordination",
        "Mentor junior staff",
        "Project planning",
      ],
      tools: ["AutoCAD/Revit", "SketchUp", "Rendering software", "Physical models", "Measuring equipment"],
      environment: "Office with site visits, project-based deadlines",
    },
    whatYouActuallyDo: [
      "Design buildings and spaces",
      "Create technical drawings",
      "Ensure code compliance",
      "Coordinate with engineers",
      "Present to clients and authorities",
      "Oversee construction",
    ],
    whoThisIsGoodFor: [
      "Creative problem-solvers",
      "Technical artists",
      "Long-term thinkers",
      "Detail-oriented designers",
      "Good communicators",
    ],
    topSkills: [
      "Architectural design",
      "CAD/BIM software",
      "Building codes",
      "Project management",
      "Communication",
      "Technical drawing",
    ],
    entryPaths: [
      "Master's in Architecture (5 years)",
      "Internship period required",
      "Authorization to practice",
      "Specialization options",
    ],
    realityCheck: "Long education. Projects take years. Regulatory hurdles. But creating lasting structures is deeply fulfilling.",
  },

  // ========================================
  // NEW PUBLIC SERVICE CAREERS
  // ========================================
  "lawyer": {
    typicalDay: {
      morning: [
        "Review case files",
        "Client meetings",
        "Legal research",
        "Draft documents",
      ],
      midday: [
        "Court appearances",
        "Negotiations",
        "Team meetings",
        "Continue research",
      ],
      afternoon: [
        "Client calls",
        "Document review",
        "Prepare for upcoming cases",
        "Administrative tasks",
      ],
      tools: ["Legal databases", "Document management", "Case management software", "Video conferencing"],
      environment: "Law office and courts, long hours common",
    },
    whatYouActuallyDo: [
      "Advise clients on legal matters",
      "Draft contracts and documents",
      "Represent clients in court",
      "Negotiate settlements",
      "Research case law",
      "Build legal arguments",
    ],
    whoThisIsGoodFor: [
      "Analytical thinkers",
      "Strong communicators",
      "Detail-oriented workers",
      "Persuasive arguers",
      "Ethical individuals",
    ],
    topSkills: [
      "Legal knowledge",
      "Research",
      "Communication",
      "Negotiation",
      "Analytical thinking",
      "Writing",
    ],
    entryPaths: [
      "Master of Law (5 years)",
      "2 years practice as 'fullmektig'",
      "Bar admission",
      "Specialize in area of law",
    ],
    realityCheck: "Long hours. High pressure. Expensive education. But intellectually challenging and well-compensated.",
  },

  "police-officer": {
    typicalDay: {
      morning: [
        "Shift briefing",
        "Equipment check",
        "Begin patrol or assignment",
        "Respond to calls",
      ],
      midday: [
        "Continue patrol duties",
        "Investigate incidents",
        "Community interaction",
        "Documentation",
      ],
      afternoon: [
        "Follow up on cases",
        "Process paperwork",
        "Court appearances if needed",
        "Shift handover",
      ],
      tools: ["Radio equipment", "Computer systems", "Patrol vehicle", "Protective equipment", "Investigation tools"],
      environment: "Patrol, station, varied locations, shift work",
    },
    whatYouActuallyDo: [
      "Patrol and maintain order",
      "Respond to emergencies",
      "Investigate crimes",
      "Assist the public",
      "Write reports",
      "Testify in court",
    ],
    whoThisIsGoodFor: [
      "Community-minded individuals",
      "Calm under pressure",
      "Physically fit",
      "Good judgment",
      "Team players",
    ],
    topSkills: [
      "Communication",
      "Physical fitness",
      "Conflict resolution",
      "Decision-making",
      "Report writing",
      "Law knowledge",
    ],
    entryPaths: [
      "Police University College (3 years)",
      "Physical and psychological testing",
      "Probationary period",
      "Specialization options",
    ],
    realityCheck: "Shift work. Dangerous situations. Emotional toll. But serving community and varied work.",
  },

  "firefighter": {
    typicalDay: {
      morning: [
        "Shift handover briefing",
        "Equipment checks",
        "Vehicle inspections",
        "Training exercises",
      ],
      midday: [
        "Respond to calls",
        "Community education visits",
        "Equipment maintenance",
        "Physical training",
      ],
      afternoon: [
        "Continue response duties",
        "Fire prevention inspections",
        "Station duties",
        "Documentation",
      ],
      tools: ["Fire trucks", "Hoses and equipment", "Breathing apparatus", "Rescue equipment", "Communication gear"],
      environment: "Fire station, emergency scenes, 24-hour shifts common",
    },
    whatYouActuallyDo: [
      "Respond to fires and emergencies",
      "Rescue people and animals",
      "Provide first aid",
      "Maintain equipment",
      "Conduct fire prevention",
      "Train continuously",
    ],
    whoThisIsGoodFor: [
      "Physically fit individuals",
      "Team players",
      "Calm under pressure",
      "Community servants",
      "Quick decision-makers",
    ],
    topSkills: [
      "Firefighting techniques",
      "Physical fitness",
      "Teamwork",
      "First aid",
      "Equipment operation",
      "Communication",
    ],
    entryPaths: [
      "Fire academy training",
      "Physical fitness requirements",
      "Certifications required",
      "Often volunteer experience first",
    ],
    realityCheck: "Dangerous work. 24-hour shifts. Physical demands. But life-saving work and strong camaraderie.",
  },

  "social-worker": {
    typicalDay: {
      morning: [
        "Review case files",
        "Team meetings",
        "Client appointments",
        "Home visits",
      ],
      midday: [
        "Continue client meetings",
        "Coordinate with services",
        "Crisis intervention if needed",
        "Documentation",
      ],
      afternoon: [
        "Follow-up calls",
        "Case planning",
        "Report writing",
        "Supervision sessions",
      ],
      tools: ["Case management systems", "Assessment tools", "Resource directories", "Communication tools"],
      environment: "Office, client homes, various settings, emotional work",
    },
    whatYouActuallyDo: [
      "Assess client needs",
      "Develop care plans",
      "Connect to resources",
      "Advocate for clients",
      "Crisis intervention",
      "Document case progress",
    ],
    whoThisIsGoodFor: [
      "Empathetic individuals",
      "Good listeners",
      "Resilient workers",
      "Advocates",
      "Problem-solvers",
    ],
    topSkills: [
      "Empathy",
      "Communication",
      "Case management",
      "Crisis intervention",
      "Advocacy",
      "Cultural competence",
    ],
    entryPaths: [
      "Bachelor's in Social Work (3 years)",
      "Supervised practice period",
      "Can specialise in areas",
      "Continuing education",
    ],
    realityCheck: "Emotionally draining. High caseloads. System frustrations. But deeply meaningful helping work.",
  },

  "environmental-scientist": {
    typicalDay: {
      morning: [
        "Review data and reports",
        "Plan field work",
        "Team coordination",
        "Prepare equipment",
      ],
      midday: [
        "Field sampling (water, soil, air)",
        "Site assessments",
        "Data collection",
        "Stakeholder meetings",
      ],
      afternoon: [
        "Lab analysis",
        "Report writing",
        "Regulatory consultation",
        "Project planning",
      ],
      tools: ["Sampling equipment", "Lab analysers", "GIS software", "Data analysis tools", "Field gear"],
      environment: "Office, laboratory, and field work, varied conditions",
    },
    whatYouActuallyDo: [
      "Collect environmental samples",
      "Analyse data and trends",
      "Write impact assessments",
      "Advise on regulations",
      "Develop sustainability plans",
      "Present findings",
    ],
    whoThisIsGoodFor: [
      "Nature lovers",
      "Scientific thinkers",
      "Detail-oriented analysts",
      "Report writers",
      "Field work enthusiasts",
    ],
    topSkills: [
      "Environmental science",
      "Data analysis",
      "Report writing",
      "Field techniques",
      "Regulatory knowledge",
      "GIS",
    ],
    entryPaths: [
      "Environmental science degree",
      "Master's for advancement",
      "Field experience valued",
      "Certifications available",
    ],
    realityCheck: "Report-heavy work. Regulatory complexity. Weather exposure in field. But meaningful environmental impact.",
  },

  // ========================================
  // TECHNOLOGY & IT — NEW SOFTWARE ROLES
  // ========================================
  "principal-engineer": {
    typicalDay: {
      morning: [
        "Review technical proposals and architecture decision records from teams",
        "One-on-one mentoring session with a senior engineer",
        "Read through RFCs and provide written feedback",
      ],
      midday: [
        "Cross-team technical alignment meeting on platform strategy",
        "Deep-dive into a complex production issue escalated from teams",
        "Lunch with engineering managers to discuss hiring bar",
      ],
      afternoon: [
        "Write a technical strategy document for Q3 initiatives",
        "Review and approve high-impact pull requests",
        "Attend architecture review board for a new service proposal",
      ],
      tools: ["GitHub", "Confluence", "Slack", "Miro", "IDE"],
      environment: "Office or remote — mostly meetings, writing, and code review rather than heads-down coding",
    },
    whatYouActuallyDo: [
      "Set technical direction across multiple engineering teams",
      "Make high-impact architectural decisions that affect the entire org",
      "Mentor senior and staff engineers on technical leadership",
      "Drive engineering excellence initiatives (testing, observability, performance)",
      "Influence hiring standards and interview processes",
    ],
    whoThisIsGoodFor: [
      "Senior engineers who want to scale their impact beyond one team",
      "People who enjoy teaching and mentoring others",
      "Those who think strategically about technology choices",
      "Engineers comfortable with ambiguity and cross-team influence",
    ],
    topSkills: [
      "Technical strategy",
      "System design",
      "Cross-team influence",
      "Mentoring",
      "Technical writing",
    ],
    entryPaths: [
      "12+ years of software engineering experience",
      "Progression from senior → staff → principal engineer",
      "Track record of org-wide technical impact",
      "Strong communication and leadership skills",
    ],
    realityCheck: "Less coding, more writing and meetings. Your impact comes through others. Can feel removed from the craft. High expectations with ambiguous problems.",
  },
  "staff-engineer": {
    typicalDay: {
      morning: [
        "Deep-dive into a cross-cutting technical problem (e.g. database migration strategy)",
        "Review a complex RFC from another team",
        "Pair-program with an engineer on a tricky implementation",
      ],
      midday: [
        "Write a technical design document for a new initiative",
        "Cross-team sync to align on shared library changes",
        "Investigate a systemic performance issue",
      ],
      afternoon: [
        "Code review for critical system components",
        "Prototype a solution to validate architectural approach",
        "Update the engineering wiki with findings and decisions",
      ],
      tools: ["IDE (VS Code/IntelliJ)", "GitHub", "Datadog/Grafana", "Notion", "Terminal"],
      environment: "Office or remote — mix of deep technical work and cross-team collaboration",
    },
    whatYouActuallyDo: [
      "Lead complex cross-cutting technical initiatives spanning multiple teams",
      "Identify and resolve systemic technical debt and architectural issues",
      "Produce technical RFCs that influence engineering direction",
      "Raise the engineering bar through code quality and best practices",
      "Tackle the hardest problems that no single team can solve alone",
    ],
    whoThisIsGoodFor: [
      "Engineers who love solving hard, ambiguous technical problems",
      "People who enjoy deep technical expertise over management",
      "Those comfortable influencing without direct authority",
      "Engineers who want to stay hands-on while having broad impact",
    ],
    topSkills: [
      "Deep technical expertise",
      "Problem decomposition",
      "Cross-team collaboration",
      "Technical writing",
      "Code quality",
    ],
    entryPaths: [
      "10+ years of software engineering experience",
      "Progression from senior engineer",
      "Demonstrated cross-team technical leadership",
      "Strong written communication skills",
    ],
    realityCheck: "You tackle the hardest problems no one else can. Can be lonely work. High expectations, ambiguous scope. Must earn influence through technical credibility.",
  },
  "platform-architect": {
    typicalDay: {
      morning: [
        "Review platform metrics and incident reports from overnight",
        "Architecture session: design a new self-service capability for dev teams",
        "Evaluate a new cloud-managed service for potential adoption",
      ],
      midday: [
        "Meet with product engineering leads to understand pain points",
        "Write a proposal for platform abstraction improvements",
        "Review infrastructure-as-code pull requests",
      ],
      afternoon: [
        "Technical deep-dive into compute cost optimisation",
        "Present platform roadmap to engineering leadership",
        "Prototype a developer experience improvement",
      ],
      tools: ["Terraform/Pulumi", "Kubernetes", "AWS/Azure/GCP console", "Grafana", "Backstage"],
      environment: "Office or remote — mix of architecture, writing, and hands-on prototyping",
    },
    whatYouActuallyDo: [
      "Design the internal platform (CI/CD, compute, data, observability)",
      "Define platform abstractions that improve developer productivity",
      "Evaluate and adopt cloud-native technologies and managed services",
      "Set platform standards and golden paths for engineering teams",
      "Balance developer experience with cost and security",
    ],
    whoThisIsGoodFor: [
      "Engineers passionate about developer experience and infrastructure",
      "People who enjoy designing systems that other engineers use",
      "Those who think about scalability, reliability, and cost",
      "Engineers who like evaluating and adopting new technologies",
    ],
    topSkills: [
      "Platform design",
      "Cloud architecture",
      "Developer experience",
      "Infrastructure as code",
      "API design",
    ],
    entryPaths: [
      "Backend/infrastructure engineering background",
      "Experience with cloud platforms and Kubernetes",
      "Platform engineering or SRE experience",
      "Cloud architecture certifications helpful",
    ],
    realityCheck: "Your users are engineers — they have strong opinions. Balancing simplicity with flexibility is hard. Legacy migration is constant. Toil can creep in.",
  },
  "software-architect": {
    typicalDay: {
      morning: [
        "Review architecture decision records (ADRs) from the past week",
        "Design session for a new microservice decomposition",
        "One-on-one with a tech lead about their team's approach",
      ],
      midday: [
        "Write an ADR for a cross-service communication pattern",
        "Review a complex pull request for architectural compliance",
        "Meet with product to discuss technical feasibility of a feature",
      ],
      afternoon: [
        "Present architecture guidelines to engineering teams",
        "Research and prototype a new design pattern",
        "Update architecture documentation and diagrams",
      ],
      tools: ["Miro/Excalidraw", "IDE", "GitHub", "Confluence", "C4 Model tools"],
      environment: "Office or remote — balance of design, writing, reviewing, and mentoring",
    },
    whatYouActuallyDo: [
      "Define software architecture and technical standards for teams",
      "Establish design patterns, API conventions, and code review guidelines",
      "Mentor engineers and conduct architecture decision records",
      "Review technical designs for new products and major features",
      "Bridge business requirements and technical implementation",
    ],
    whoThisIsGoodFor: [
      "Engineers who enjoy the big-picture design of software systems",
      "People who like establishing patterns that others follow",
      "Those skilled at communicating technical concepts clearly",
      "Engineers who enjoy mentoring and raising team capability",
    ],
    topSkills: [
      "System design",
      "Design patterns",
      "API architecture",
      "Technical leadership",
      "Documentation",
    ],
    entryPaths: [
      "8+ years of software engineering experience",
      "Strong background in system design and distributed systems",
      "Track record of mentoring and technical leadership",
      "Master's degree or equivalent experience",
    ],
    realityCheck: "You rarely write production code. Your influence is through documents, reviews, and mentoring. Decisions have long-lasting consequences. Must stay technically credible.",
  },
  "fullstack-engineer": {
    typicalDay: {
      morning: [
        "Review pull requests from teammates",
        "Daily standup and sprint planning discussion",
        "Start implementing a new feature from database schema to UI",
      ],
      midday: [
        "Build API endpoints for the feature",
        "Write unit and integration tests",
        "Debug an issue that spans frontend and backend",
      ],
      afternoon: [
        "Implement the React UI components for the feature",
        "Deploy to staging and run end-to-end tests",
        "Update documentation and create pull request",
      ],
      tools: ["VS Code", "Git/GitHub", "PostgreSQL", "React/Next.js", "Terminal"],
      environment: "Office or remote — heads-down coding with team collaboration",
    },
    whatYouActuallyDo: [
      "Build features spanning database schema, API endpoints, and UI",
      "Own small projects end-to-end from technical design to deployment",
      "Debug issues across the entire stack",
      "Improve developer tooling and CI/CD pipelines",
      "Collaborate with designers and product on feature specs",
    ],
    whoThisIsGoodFor: [
      "People who enjoy variety and working across different technologies",
      "Engineers who like seeing features through from start to finish",
      "Those who get bored focusing on just one layer of the stack",
      "People who enjoy small teams where everyone does a bit of everything",
    ],
    topSkills: [
      "React/Next.js",
      "Node.js/Python",
      "SQL/NoSQL",
      "API design",
      "DevOps basics",
    ],
    entryPaths: [
      "Computer science degree or bootcamp",
      "Self-taught with a strong project portfolio",
      "Start as frontend or backend then expand",
      "Internships at startups (great full-stack exposure)",
    ],
    realityCheck: "Jack of all trades, master of none — you need to go deep enough in each layer. Context-switching is constant. Startups love you; large orgs may prefer specialists.",
  },
  "platform-engineer": {
    typicalDay: {
      morning: [
        "Check platform health dashboards and overnight alerts",
        "Triage platform support requests from product teams",
        "Work on a self-service deployment pipeline improvement",
      ],
      midday: [
        "Kubernetes cluster maintenance and upgrades",
        "Build a new Terraform module for a common infrastructure pattern",
        "Pair with a product engineer to debug a deployment issue",
      ],
      afternoon: [
        "Write documentation for a new platform capability",
        "Define SLOs for a shared platform service",
        "Review infrastructure PRs and Helm chart changes",
      ],
      tools: ["Kubernetes", "Terraform/Pulumi", "ArgoCD", "Grafana/Prometheus", "GitHub Actions"],
      environment: "Office or remote — mix of infrastructure work, support, and developer experience improvements",
    },
    whatYouActuallyDo: [
      "Build self-service platform capabilities for product engineering teams",
      "Manage Kubernetes clusters, service meshes, and deployment pipelines",
      "Define platform SLOs and ensure reliability of shared infrastructure",
      "Improve developer experience with better tooling and abstractions",
      "Maintain and evolve CI/CD pipelines",
    ],
    whoThisIsGoodFor: [
      "Engineers who enjoy infrastructure and automation",
      "People who like building tools that other developers use",
      "Those interested in Kubernetes, cloud, and DevOps practices",
      "Engineers who enjoy both coding and operations",
    ],
    topSkills: [
      "Kubernetes",
      "Platform tooling",
      "Developer experience",
      "Terraform/Pulumi",
      "Observability",
    ],
    entryPaths: [
      "Backend engineering or DevOps background",
      "Cloud certifications (AWS/Azure/GCP)",
      "Experience with Kubernetes and containerisation",
      "SRE or systems administration experience",
    ],
    realityCheck: "You are on-call for shared infrastructure. Toil management is real. Product teams may not appreciate platform work until it breaks. Constant balancing act.",
  },
  "iac-specialist": {
    typicalDay: {
      morning: [
        "Review Terraform plan outputs for pending infrastructure changes",
        "Merge and apply approved infrastructure PRs via GitOps pipeline",
        "Investigate a drift detection alert on a production environment",
      ],
      midday: [
        "Write a new reusable Terraform module for a common pattern",
        "Code review infrastructure PRs from other teams",
        "Update module documentation and usage examples",
      ],
      afternoon: [
        "Implement a new GitOps workflow for environment promotion",
        "Refactor state files and improve module structure",
        "Support a product team adopting IaC for their service",
      ],
      tools: ["Terraform/Pulumi", "Git/GitHub", "AWS/Azure/GCP console", "Atlantis/Spacelift", "VS Code"],
      environment: "Office or remote — focused infrastructure-as-code work with code reviews",
    },
    whatYouActuallyDo: [
      "Write and maintain Terraform/Pulumi modules for cloud infrastructure",
      "Implement GitOps workflows for infrastructure deployment",
      "Review infrastructure PRs and enforce IaC best practices",
      "Manage state files, backends, and module registries",
      "Support teams in adopting infrastructure as code",
    ],
    whoThisIsGoodFor: [
      "Engineers who love automation and reproducibility",
      "People who enjoy writing clean, modular, well-documented code",
      "Those interested in cloud infrastructure and DevOps",
      "Engineers who value correctness and consistency",
    ],
    topSkills: [
      "Terraform",
      "Pulumi",
      "Cloud platforms",
      "GitOps",
      "Module design",
    ],
    entryPaths: [
      "DevOps or cloud engineering background",
      "Cloud certifications (AWS/Azure/GCP)",
      "Terraform Associate certification helpful",
      "Systems administration experience",
    ],
    realityCheck: "State management can be painful. Terraform upgrades break things. Teams may resist IaC discipline. Debugging infrastructure drift is tedious but critical.",
  },
  "mlops-engineer": {
    typicalDay: {
      morning: [
        "Check model training pipeline runs from overnight",
        "Review model performance dashboards for drift alerts",
        "Investigate a failed model deployment in staging",
      ],
      midday: [
        "Build a new feature store pipeline for ML models",
        "Implement A/B testing infrastructure for model versions",
        "Meet with ML engineers to discuss deployment requirements",
      ],
      afternoon: [
        "Optimise model serving latency and throughput",
        "Write CI/CD pipeline for model retraining automation",
        "Document model versioning and rollback procedures",
      ],
      tools: ["MLflow/Kubeflow", "Kubernetes", "Python", "Airflow/Dagster", "Prometheus/Grafana"],
      environment: "Office or remote — bridge between ML research and production engineering",
    },
    whatYouActuallyDo: [
      "Build and maintain ML model training and serving infrastructure",
      "Implement model versioning, A/B testing, and rollback capabilities",
      "Monitor model drift and automate retraining triggers",
      "Create feature pipelines and feature stores",
      "Bridge the gap between ML research and production systems",
    ],
    whoThisIsGoodFor: [
      "Engineers interested in both ML and infrastructure",
      "People who enjoy building reliable, automated systems",
      "Those who like bridging research and production",
      "Engineers comfortable with Python and Kubernetes",
    ],
    topSkills: [
      "ML pipelines",
      "Model serving",
      "Kubernetes",
      "Monitoring",
      "CI/CD for ML",
    ],
    entryPaths: [
      "Software engineering or DevOps background",
      "ML engineering experience",
      "Data engineering experience with pipeline tools",
      "Cloud and Kubernetes certifications helpful",
    ],
    realityCheck: "ML models are unpredictable. Data quality issues are constant. Researchers may not care about production constraints. On-call for model-serving infrastructure.",
  },
  "automation-engineer": {
    typicalDay: {
      morning: [
        "Review automation monitoring dashboards for failures",
        "Triage requests from teams wanting process automation",
        "Fix a broken API integration in an existing workflow",
      ],
      midday: [
        "Build a new automated workflow using Python and APIs",
        "Document the workflow and create user training materials",
        "Test automation against edge cases and error scenarios",
      ],
      afternoon: [
        "Meet with a business team to map out a manual process for automation",
        "Integrate two internal systems via their REST APIs",
        "Update existing automations for API version changes",
      ],
      tools: ["Python", "REST APIs", "Zapier/n8n/Airflow", "Git", "Slack/Teams integrations"],
      environment: "Office or remote — mix of coding, business analysis, and stakeholder meetings",
    },
    whatYouActuallyDo: [
      "Automate repetitive business processes using scripting and workflow tools",
      "Build integrations between internal systems via APIs",
      "Document automated workflows and train teams on new processes",
      "Monitor automation health and fix failures",
      "Analyse manual processes and identify automation opportunities",
    ],
    whoThisIsGoodFor: [
      "People who hate doing the same thing twice",
      "Engineers who enjoy making others' work easier",
      "Those with a mix of technical and business skills",
      "People who like quick wins and visible impact",
    ],
    topSkills: [
      "Python",
      "Workflow automation",
      "API integration",
      "Scripting",
      "Process analysis",
    ],
    entryPaths: [
      "Software engineering or IT background",
      "Self-taught scripting and API knowledge",
      "Business analyst with technical skills",
      "IT support with automation interest",
    ],
    realityCheck: "You depend on third-party APIs that change without notice. Business teams have vague requirements. Maintenance burden grows with each automation you build.",
  },
  "test-architect": {
    typicalDay: {
      morning: [
        "Review test coverage reports and quality metrics across teams",
        "Design a test framework for a new microservices architecture",
        "Meet with QA leads to discuss testing strategy for a release",
      ],
      midday: [
        "Write a proposal for quality gates in the CI/CD pipeline",
        "Review and improve shared test utilities and fixtures",
        "Investigate flaky tests and propose structural fixes",
      ],
      afternoon: [
        "Present testing strategy to engineering leadership",
        "Mentor a QA engineer on test design patterns",
        "Evaluate a new testing tool or framework for adoption",
      ],
      tools: ["Playwright/Cypress", "Jest/Vitest", "k6/JMeter", "GitHub Actions", "Allure/TestRail"],
      environment: "Office or remote — strategic and hands-on mix of test design and leadership",
    },
    whatYouActuallyDo: [
      "Define organisation-wide test strategy and quality standards",
      "Design test frameworks and reusable testing infrastructure",
      "Establish quality gates in CI/CD pipelines",
      "Review test coverage and reliability metrics",
      "Mentor QA engineers and raise testing standards",
    ],
    whoThisIsGoodFor: [
      "QA engineers ready to take a strategic leadership role",
      "People passionate about software quality at scale",
      "Engineers who enjoy designing frameworks others use",
      "Those who think systematically about risk and coverage",
    ],
    topSkills: [
      "Test strategy",
      "Test frameworks",
      "CI/CD integration",
      "Performance testing",
      "Quality metrics",
    ],
    entryPaths: [
      "8+ years in QA/testing roles",
      "Strong programming skills",
      "ISTQB Advanced certification helpful",
      "Experience across unit, integration, E2E, and performance testing",
    ],
    realityCheck: "Flaky tests are your nemesis. Teams may resist testing discipline. Quality is invisible when it works. Constant battle against 'ship it' pressure.",
  },
  "devsecops-engineer": {
    typicalDay: {
      morning: [
        "Review overnight security scan results (SAST, SCA, container)",
        "Triage new vulnerability findings and assign priorities",
        "Update CI/CD pipeline security policies",
      ],
      midday: [
        "Implement a new container image scanning step in the pipeline",
        "Investigate a dependency vulnerability and coordinate patching",
        "Write documentation on secure coding practices",
      ],
      afternoon: [
        "Meet with developers to discuss security findings in their code",
        "Automate compliance checks for a regulatory requirement",
        "Generate SBOM reports for software supply chain transparency",
      ],
      tools: ["Snyk/Trivy", "GitHub Advanced Security", "Docker", "OPA/Rego", "CI/CD platforms"],
      environment: "Office or remote — bridge between security, development, and operations teams",
    },
    whatYouActuallyDo: [
      "Integrate security scanning (SAST, SCA, container) into CI/CD pipelines",
      "Manage software supply chain security (SBOM, dependency scanning)",
      "Automate compliance checks and security policy enforcement",
      "Triage vulnerability findings and coordinate remediation",
      "Train developers on secure coding practices",
    ],
    whoThisIsGoodFor: [
      "Engineers interested in both security and DevOps",
      "People who enjoy automating security processes",
      "Those who like working across multiple teams",
      "Engineers who care about software supply chain integrity",
    ],
    topSkills: [
      "Security tooling",
      "CI/CD security",
      "Container scanning",
      "Supply chain security",
      "Compliance",
    ],
    entryPaths: [
      "DevOps engineering with security interest",
      "Application security background",
      "Security certifications (CISSP, CEH) helpful",
      "Software engineering with security focus",
    ],
    realityCheck: "Developers may see you as a blocker. Vulnerability backlogs grow faster than you can fix them. Compliance requirements are tedious but critical. Constant learning curve.",
  },
  "perf-test-engineer": {
    typicalDay: {
      morning: [
        "Review results from overnight load test runs",
        "Analyse performance metrics and identify bottlenecks",
        "Meet with the dev team to discuss performance requirements",
      ],
      midday: [
        "Design a new load test scenario simulating Black Friday traffic",
        "Write k6/JMeter scripts for API endpoint testing",
        "Profile a slow database query identified in test results",
      ],
      afternoon: [
        "Execute a load test against the staging environment",
        "Produce a performance benchmark report with recommendations",
        "Present findings to the engineering team",
      ],
      tools: ["k6/JMeter/Gatling", "Grafana/Datadog", "Database profilers", "APM tools", "Git"],
      environment: "Office or remote — analytical work with test execution and reporting",
    },
    whatYouActuallyDo: [
      "Design and execute load test scenarios simulating production traffic",
      "Analyse performance bottlenecks and recommend optimisations",
      "Produce performance benchmark reports for major releases",
      "Profile applications to identify slow queries, memory leaks, and CPU issues",
      "Collaborate with developers to fix performance regressions",
    ],
    whoThisIsGoodFor: [
      "Engineers who love investigating and optimising performance",
      "People with analytical mindsets and attention to detail",
      "Those who enjoy both coding and data analysis",
      "Engineers who like finding the 'why' behind slow systems",
    ],
    topSkills: [
      "k6/JMeter/Gatling",
      "Performance analysis",
      "Profiling",
      "Monitoring",
      "Report writing",
    ],
    entryPaths: [
      "QA engineering with performance focus",
      "Software engineering with performance interest",
      "Backend engineering background",
      "ISTQB Performance Testing certification helpful",
    ],
    realityCheck: "Results can be flaky due to environment inconsistencies. Non-production environments rarely match production exactly. Teams may ignore findings until it's too late.",
  },

  // ========================================
  // TELECOMMUNICATIONS
  // ========================================
  "telco-oss-bss-architect": {
    typicalDay: {
      morning: [
        "Review architecture decisions from the previous sprint",
        "Lead a solution design workshop for a new BSS integration",
        "Map business requirements to TM Forum SID/eTOM frameworks",
      ],
      midday: [
        "Evaluate vendor proposals for an OSS platform module",
        "Document integration patterns between BSS and network systems",
        "Meet with programme stakeholders on architecture alignment",
      ],
      afternoon: [
        "Present target architecture to the steering committee",
        "Review technical designs from delivery teams",
        "Update the architecture repository with new decisions",
      ],
      tools: ["Sparx EA", "TM Forum Open APIs", "Confluence", "Miro", "Integration platforms"],
      environment: "Office — heavy stakeholder engagement with telco operators, vendors, and delivery teams",
    },
    whatYouActuallyDo: [
      "Design end-to-end OSS/BSS solutions for telco operators",
      "Align technical designs with TM Forum standards (SID, eTOM, Open APIs)",
      "Lead technical evaluation of vendor platforms and integration patterns",
      "Ensure architecture coherence across multiple programme workstreams",
      "Translate complex telco requirements into implementable solution designs",
    ],
    whoThisIsGoodFor: [
      "Engineers with deep telco domain knowledge",
      "People who enjoy bridging business and technology",
      "Those comfortable presenting to senior stakeholders",
      "Architects who like standardisation and frameworks",
    ],
    topSkills: [
      "TM Forum Open APIs",
      "Solution design",
      "OSS/BSS platforms",
      "Integration patterns",
      "Stakeholder management",
    ],
    entryPaths: [
      "Software engineering in telco",
      "OSS/BSS platform experience",
      "TM Forum certifications",
      "Solutions architecture background",
    ],
    realityCheck: "Telco is slow-moving and highly regulated. Legacy systems are everywhere. Vendor lock-in is real. But the scale of impact is massive — millions of subscribers.",
  },
  "telco-network-architect": {
    typicalDay: {
      morning: [
        "Review network capacity reports and growth projections",
        "Design session for 5G core network rollout",
        "Evaluate Open RAN vendor submissions",
      ],
      midday: [
        "Produce detailed network topology documents",
        "Meet with transport team about fibre backbone design",
        "Review emerging technology papers on network slicing",
      ],
      afternoon: [
        "Present network architecture roadmap to CTO",
        "Coordinate with access team on last-mile design",
        "Update network design standards documentation",
      ],
      tools: ["Network planning tools", "Visio/Draw.io", "IP address management", "Capacity planning tools", "Vendor portals"],
      environment: "Office with occasional site visits — strategic design work with cross-team coordination",
    },
    whatYouActuallyDo: [
      "Design multi-layer network architecture (core, transport, access)",
      "Plan 5G rollout strategy and technology selection",
      "Evaluate emerging technologies like Open RAN and network slicing",
      "Produce high-level and detailed network topology documents",
      "Coordinate across network planning, operations, and vendor teams",
    ],
    whoThisIsGoodFor: [
      "Engineers passionate about network infrastructure at scale",
      "People who enjoy long-term strategic planning",
      "Those interested in 5G and next-generation networking",
      "Engineers who like working at the intersection of hardware and software",
    ],
    topSkills: [
      "Network design",
      "5G architecture",
      "IP/MPLS",
      "Optical transport",
      "Capacity planning",
    ],
    entryPaths: [
      "Telecommunications or electrical engineering degree",
      "Network engineering experience",
      "Cisco/Juniper certifications (CCNP, JNCIP)",
      "Telco operator or vendor experience",
    ],
    realityCheck: "Network rollouts take years. Vendor negotiations are complex. Legacy infrastructure constrains design. But you shape how millions connect.",
  },
  "telco-enterprise-architect": {
    typicalDay: {
      morning: [
        "Chair the architecture review board — approve or challenge solution designs",
        "Review alignment of programme designs with TM Forum reference models",
        "Meet with CTO on enterprise technology strategy",
      ],
      midday: [
        "Maintain the enterprise architecture roadmap and update Confluence",
        "Assess a new vendor platform against architecture principles",
        "Governance review: check programme compliance with standards",
      ],
      afternoon: [
        "Present architecture governance report to the steering committee",
        "Mentor a domain architect on TOGAF practices",
        "Review and update enterprise architecture principles",
      ],
      tools: ["Sparx EA", "TOGAF ADM", "TM Forum Frameworx", "Confluence", "PowerPoint"],
      environment: "Office — heavy governance, stakeholder meetings, and strategic documentation",
    },
    whatYouActuallyDo: [
      "Govern the enterprise architecture landscape for telco organisations",
      "Ensure all designs align with TM Forum eTOM/SID and business strategy",
      "Chair architecture review boards and approve solution designs",
      "Maintain and evolve the enterprise architecture roadmap",
      "Guide technology decisions across the entire organisation",
    ],
    whoThisIsGoodFor: [
      "Senior architects who enjoy governance and standards",
      "People who think strategically about technology ecosystems",
      "Those who are comfortable with TOGAF and TM Forum frameworks",
      "Leaders who influence through principles rather than code",
    ],
    topSkills: [
      "Enterprise architecture",
      "TM Forum eTOM/SID",
      "TOGAF",
      "Business strategy",
      "Governance",
    ],
    entryPaths: [
      "10+ years in telco architecture roles",
      "TOGAF certification",
      "TM Forum certifications",
      "Master's in IT/business helpful",
    ],
    realityCheck: "Heavily governance-focused. Influence without authority. Slow decision cycles. But you set the direction for multi-billion-kroner technology landscapes.",
  },
  "telco-cloud-platform-architect": {
    typicalDay: {
      morning: [
        "Review cloud platform health and cost dashboards",
        "Design hybrid cloud architecture for a telco network function",
        "Evaluate AWS Wavelength vs Azure Operator Nexus for edge deployment",
      ],
      midday: [
        "Define platform standards for CNF deployment and lifecycle",
        "Meet with network team about cloud-native migration plan",
        "Review Kubernetes cluster security configuration",
      ],
      afternoon: [
        "Present hybrid cloud strategy to programme leadership",
        "Prototype a CNF onboarding pipeline",
        "Update cloud architecture documentation",
      ],
      tools: ["AWS/Azure/GCP", "Kubernetes", "Terraform", "Helm", "Cloud cost tools"],
      environment: "Office or remote — bridging hyperscaler cloud and telco infrastructure worlds",
    },
    whatYouActuallyDo: [
      "Design hybrid cloud architecture for telco network functions",
      "Bridge hyperscaler cloud platforms with telco-specific workloads",
      "Define platform standards for CNF deployment and lifecycle",
      "Evaluate hyperscaler telco services (AWS Wavelength, Azure Operator Nexus)",
      "Ensure cloud security and compliance for regulated telco environments",
    ],
    whoThisIsGoodFor: [
      "Cloud architects who want to work in telco",
      "Engineers fascinated by the intersection of cloud and networking",
      "People who enjoy evaluating emerging technologies",
      "Architects comfortable with regulated, high-availability environments",
    ],
    topSkills: [
      "AWS/Azure/GCP",
      "Kubernetes",
      "Telco cloud",
      "NFV/CNF",
      "Platform design",
    ],
    entryPaths: [
      "Cloud engineering background",
      "Telco infrastructure experience",
      "Cloud architect certifications",
      "Kubernetes and container experience",
    ],
    realityCheck: "Telco cloud is more constrained than public cloud. Vendor lock-in and legacy NFV are real challenges. High availability requirements (five nines) add complexity.",
  },
  "telco-orchestration-architect": {
    typicalDay: {
      morning: [
        "Design CFS-to-RFS decomposition model for a new product",
        "Review service catalogue alignment with TMF Open APIs",
        "Meet with order management team about orchestration workflows",
      ],
      midday: [
        "Define orchestration workflows for automated order fulfilment",
        "Document service orchestration patterns and anti-patterns",
        "Review integration between catalogue and fulfilment systems",
      ],
      afternoon: [
        "Present service orchestration architecture to stakeholders",
        "Test orchestration flow for a new B2B product",
        "Update orchestration design documentation",
      ],
      tools: ["BPMN tools", "TMF Open API specs", "Service catalogues", "Workflow engines", "Integration platforms"],
      environment: "Office — design-heavy role bridging commercial products and network resources",
    },
    whatYouActuallyDo: [
      "Design CFS-to-RFS decomposition models for new products",
      "Define orchestration workflows for order fulfilment automation",
      "Align service catalogue with TMF Open API standards",
      "Architect the service orchestration layer between BSS and OSS",
      "Ensure products can be ordered, provisioned, and activated automatically",
    ],
    whoThisIsGoodFor: [
      "Engineers who enjoy translating business products into technical flows",
      "People interested in workflow design and process automation",
      "Those who like working with TM Forum standards",
      "Architects who enjoy complex integration challenges",
    ],
    topSkills: [
      "CFS/RFS modelling",
      "TMF 641/633",
      "Service orchestration",
      "BPMN/workflows",
      "API design",
    ],
    entryPaths: [
      "OSS/BSS engineering experience",
      "Integration or middleware background",
      "TM Forum knowledge",
      "Business analysis in telco",
    ],
    realityCheck: "Highly complex domain. Products are constantly changing. Legacy catalogue data is messy. But when the automation works, millions of orders flow through your design.",
  },
  "telco-transformation-lead": {
    typicalDay: {
      morning: [
        "Steering committee meeting: present programme status to C-suite",
        "Review transformation KPIs and progress dashboards",
        "Meet with workstream leads to remove blockers",
      ],
      midday: [
        "Review business case for a new transformation initiative",
        "Stakeholder alignment meeting across technology and business units",
        "Update the transformation roadmap and dependency map",
      ],
      afternoon: [
        "Change management session with impacted teams",
        "Review programme risk register and mitigation plans",
        "Prepare board-level presentation on transformation progress",
      ],
      tools: ["PowerPoint", "Jira/Azure DevOps", "Excel/financial models", "Confluence", "MS Teams"],
      environment: "Office — leadership role with constant stakeholder engagement and travel",
    },
    whatYouActuallyDo: [
      "Lead multi-year digital transformation programmes across telco operations",
      "Align transformation initiatives with business outcomes and KPIs",
      "Manage senior stakeholder expectations across technology and business",
      "Build and defend business cases for transformation investment",
      "Drive change management across large organisations",
    ],
    whoThisIsGoodFor: [
      "Senior leaders who enjoy driving organisational change",
      "People with strong business and technology acumen",
      "Those comfortable presenting to C-level executives",
      "Leaders who thrive in complex, ambiguous environments",
    ],
    topSkills: [
      "Programme leadership",
      "Change management",
      "Stakeholder engagement",
      "Business case development",
      "Agile at scale",
    ],
    entryPaths: [
      "Programme management background in telco",
      "Management consulting with telco clients",
      "Senior IT leadership in telco operators",
      "MBA or equivalent with technology background",
    ],
    realityCheck: "Multi-year timelines with shifting priorities. Organisational politics are real. Change resistance is constant. But the impact transforms entire companies.",
  },
  "telco-oss-bss-director": {
    typicalDay: {
      morning: [
        "Review programme dashboards: budget, timeline, risk status",
        "Executive update meeting with operator CTO",
        "Vendor performance review with key suppliers",
      ],
      midday: [
        "Resource allocation decisions across programme workstreams",
        "Review escalated risks and approve mitigation strategies",
        "Budget review and forecast meeting with finance",
      ],
      afternoon: [
        "Programme governance board — present status and request decisions",
        "Meet with architecture team on technical approach changes",
        "Review and approve programme milestone deliverables",
      ],
      tools: ["MS Project/Planview", "Jira", "Excel/financial tools", "PowerPoint", "MS Teams"],
      environment: "Office with travel — senior leadership role with heavy governance and reporting",
    },
    whatYouActuallyDo: [
      "Direct large OSS/BSS delivery programmes with cross-functional teams",
      "Manage programme budgets, timelines, and resource allocation",
      "Report programme status and risks to C-level stakeholders",
      "Coordinate vendor teams and manage commercial relationships",
      "Make critical programme decisions and resolve escalations",
    ],
    whoThisIsGoodFor: [
      "Experienced programme managers ready for director-level accountability",
      "People who enjoy managing complex multi-vendor programmes",
      "Those comfortable with budget ownership and executive reporting",
      "Leaders who thrive under pressure and tight deadlines",
    ],
    topSkills: [
      "Programme management",
      "Vendor management",
      "Budget ownership",
      "Risk management",
      "Executive reporting",
    ],
    entryPaths: [
      "Senior programme management in telco IT",
      "OSS/BSS delivery lead experience",
      "Management consulting in telco",
      "PMP/PRINCE2 certifications with telco experience",
    ],
    realityCheck: "Enormous responsibility and pressure. Budget overruns are common. Vendor and stakeholder management is politically complex. But you deliver systems that serve millions.",
  },
  "telco-digital-transformation-mgr": {
    typicalDay: {
      morning: [
        "Review process automation metrics and progress reports",
        "Identify new digital transformation opportunities with business teams",
        "Sprint review for a customer experience improvement initiative",
      ],
      midday: [
        "Lead a cross-functional team implementing a process automation project",
        "Analyse data to measure transformation impact against KPIs",
        "Meet with IT and operations to align on automation priorities",
      ],
      afternoon: [
        "Present transformation dashboard to senior leadership",
        "Workshop with a department to map their manual processes",
        "Update the transformation backlog and roadmap",
      ],
      tools: ["Jira", "Power BI/Tableau", "Process mining tools", "Confluence", "Automation platforms"],
      environment: "Office — mix of strategic analysis, team leadership, and stakeholder engagement",
    },
    whatYouActuallyDo: [
      "Identify and prioritise digital transformation opportunities",
      "Lead cross-functional teams implementing process automation",
      "Measure transformation impact through defined metrics and KPIs",
      "Drive customer experience improvements through digital channels",
      "Coordinate between business, IT, and operations teams",
    ],
    whoThisIsGoodFor: [
      "People who enjoy improving processes and eliminating waste",
      "Those with a blend of business and technology skills",
      "Managers who like leading cross-functional teams",
      "People who are data-driven and results-oriented",
    ],
    topSkills: [
      "Digital strategy",
      "Process optimisation",
      "CX design",
      "Agile delivery",
      "Data-driven decision making",
    ],
    entryPaths: [
      "Business analysis or process improvement background",
      "IT project management in telco",
      "Management consulting",
      "Digital product management experience",
    ],
    realityCheck: "Transformation fatigue is real in large telcos. Measuring impact is hard. Stakeholders want quick wins but change takes time. Rewarding when you see real process improvements.",
  },
  "telco-fulfilment-head": {
    typicalDay: {
      morning: [
        "Review order fallout rates and SLA compliance dashboards",
        "Triage escalated order failures with the provisioning team",
        "Daily standup with fulfilment operations and engineering leads",
      ],
      midday: [
        "Coordinate between sales, provisioning, and network teams on complex orders",
        "Define and enforce fulfilment SLAs and quality gates",
        "Analyse root causes of order failures and plan improvements",
      ],
      afternoon: [
        "Present fulfilment metrics to the operations director",
        "Review new product launch readiness from a fulfilment perspective",
        "Plan capacity for upcoming order volume peaks",
      ],
      tools: ["Order management systems", "Monitoring dashboards", "Jira", "Excel", "Process mining tools"],
      environment: "Office — operational leadership role with constant cross-team coordination",
    },
    whatYouActuallyDo: [
      "Own the end-to-end order-to-activation process for telco services",
      "Optimise cycle times and reduce order fallout rates",
      "Coordinate between sales, provisioning, and network teams",
      "Define and enforce fulfilment SLAs and quality gates",
      "Ensure new products can be ordered and activated reliably",
    ],
    whoThisIsGoodFor: [
      "Operations leaders who enjoy process optimisation",
      "People who like solving cross-team coordination challenges",
      "Those with deep telco operations knowledge",
      "Managers who are metrics-driven and quality-focused",
    ],
    topSkills: [
      "Order management",
      "Process engineering",
      "SLA management",
      "Cross-team coordination",
      "Telco domain knowledge",
    ],
    entryPaths: [
      "OSS/BSS engineering experience",
      "Telco operations management",
      "Process improvement/Lean Six Sigma background",
      "Order management system experience",
    ],
    realityCheck: "Orders fail for mysterious reasons. Legacy systems cause most fallout. Cross-team coordination is challenging. But efficient fulfilment directly impacts customer satisfaction.",
  },
  "telco-safe-rte": {
    typicalDay: {
      morning: [
        "Facilitate daily scrum-of-scrums with team scrum masters",
        "Review cross-team dependency board and impediment log",
        "Coach a new scrum master on SAFe practices",
      ],
      midday: [
        "Prepare for upcoming PI planning event (logistics, content, risks)",
        "Track and remove cross-team impediments and dependencies",
        "Analyse flow metrics (velocity, cycle time, WIP)",
      ],
      afternoon: [
        "Facilitate a retrospective for the Agile Release Train",
        "Meet with programme leadership on delivery risks",
        "Update the programme board and risk register",
      ],
      tools: ["Jira/Azure DevOps", "Miro", "SAFe tooling", "Confluence", "MS Teams"],
      environment: "Office — facilitation-heavy role with constant team interaction",
    },
    whatYouActuallyDo: [
      "Facilitate PI planning and quarterly cadence ceremonies for telco programmes",
      "Track and remove cross-team impediments and dependencies",
      "Coach teams on agile practices within telco delivery context",
      "Monitor flow metrics and drive continuous improvement",
      "Coordinate release activities across multiple teams",
    ],
    whoThisIsGoodFor: [
      "Agile coaches who enjoy large-scale programme facilitation",
      "People who are excellent at removing obstacles and unblocking teams",
      "Those with strong facilitation and communication skills",
      "Scrum masters ready for programme-level coordination",
    ],
    topSkills: [
      "SAFe framework",
      "Agile coaching",
      "PI planning",
      "Risk management",
      "Metrics & flow",
    ],
    entryPaths: [
      "Scrum master experience",
      "SAFe RTE certification",
      "Programme coordination in telco",
      "Agile coaching background",
    ],
    realityCheck: "PI planning logistics are exhausting. Teams resist ceremony overhead. Waterfall culture persists in many telcos. But when agile flows, delivery transforms.",
  },
  "telco-network-automation-eng": {
    typicalDay: {
      morning: [
        "Check automation pipeline runs from overnight network changes",
        "Debug a failed Ansible playbook for router configuration",
        "Review NETCONF/YANG model updates from a vendor",
      ],
      midday: [
        "Build a new Python automation script for network provisioning",
        "Integrate network automation tools with the OSS platform",
        "Test automation against a lab network environment",
      ],
      afternoon: [
        "Document automation procedures and runbooks",
        "Code review for a colleague's Ansible role",
        "Meet with the OSS team on API integration for inventory sync",
      ],
      tools: ["Python", "Ansible", "NETCONF/YANG", "Git", "Network lab environments"],
      environment: "Office or remote — coding and testing against network devices and simulators",
    },
    whatYouActuallyDo: [
      "Build automation scripts for network device configuration and deployment",
      "Implement NETCONF/YANG models for programmatic network management",
      "Integrate network automation tools with OSS platforms",
      "Test automation workflows against lab and staging environments",
      "Replace manual network operations with reliable automated processes",
    ],
    whoThisIsGoodFor: [
      "Engineers who enjoy both networking and software development",
      "People who like automating manual processes",
      "Those comfortable with Python and network protocols",
      "Engineers interested in the intersection of coding and infrastructure",
    ],
    topSkills: [
      "Python",
      "Ansible",
      "NETCONF/YANG",
      "REST APIs",
      "Network protocols",
    ],
    entryPaths: [
      "Network engineering with scripting skills",
      "Software engineering with networking interest",
      "IT automation or DevOps background",
      "Telecom or ISP operational experience",
    ],
    realityCheck: "Network devices don't always behave as documented. Vendor-specific quirks are frustrating. Lab environments never match production exactly. But you eliminate hours of manual toil.",
  },
  "telco-oss-engineer": {
    typicalDay: {
      morning: [
        "Investigate an overnight service assurance alarm failure",
        "Configure a new OSS module for network inventory management",
        "Review SQL queries for a data model update",
      ],
      midday: [
        "Build an integration between OSS and a new network element",
        "Support the NOC with OSS diagnostics for an ongoing incident",
        "Test OSS changes in the staging environment",
      ],
      afternoon: [
        "Document integration configurations and troubleshooting guides",
        "Meet with the architecture team about a new OSS module rollout",
        "Update the data model for a new service type",
      ],
      tools: ["OSS platforms", "SQL databases", "Integration middleware", "Monitoring tools", "Git"],
      environment: "Office — hands-on engineering with operational support responsibilities",
    },
    whatYouActuallyDo: [
      "Configure and extend OSS platform modules for inventory and assurance",
      "Build integrations between OSS components and network elements",
      "Support incident resolution through OSS tooling and diagnostics",
      "Maintain and evolve the OSS data model",
      "Test and deploy OSS changes through release cycles",
    ],
    whoThisIsGoodFor: [
      "Engineers who enjoy hands-on systems work",
      "People interested in telecom operations and network management",
      "Those comfortable with SQL, integration, and platform configuration",
      "Engineers who like a mix of development and operations",
    ],
    topSkills: [
      "OSS platforms",
      "Service inventory",
      "Fault management",
      "SQL/data modelling",
      "Integration",
    ],
    entryPaths: [
      "IT or telecom engineering degree",
      "Junior developer role in telco",
      "OSS platform vendor training",
      "IT support with integration experience",
    ],
    realityCheck: "OSS platforms are often legacy and underdocumented. Vendor support varies. Incident pressure can be intense. But you keep networks running for millions of users.",
  },
  "telco-noc-lead": {
    typicalDay: {
      morning: [
        "Handover from night shift — review overnight incidents and status",
        "Check SLA compliance dashboards and alert queues",
        "Assign and prioritise open incidents across the NOC team",
      ],
      midday: [
        "Lead root cause analysis for a major service incident",
        "Coordinate with field teams and vendors on restoration",
        "Update incident reports and communication to stakeholders",
      ],
      afternoon: [
        "Review incident trends and propose preventive actions",
        "Train NOC operators on new monitoring procedures",
        "Prepare weekly assurance report for management",
      ],
      tools: ["Monitoring platforms (Nagios, Zabbix, Prometheus)", "ITSM tools", "Dashboards", "Communication tools", "Ticketing systems"],
      environment: "Network operations centre — shift-based with 24/7 coverage responsibility",
    },
    whatYouActuallyDo: [
      "Manage NOC shift operations and escalation procedures",
      "Monitor SLA compliance for network services",
      "Drive root cause analysis and preventive actions for major incidents",
      "Coordinate with field teams, vendors, and other support groups",
      "Train and develop NOC operators",
    ],
    whoThisIsGoodFor: [
      "People who thrive under pressure and enjoy incident management",
      "Leaders who are calm and decisive in crisis situations",
      "Those who enjoy operational excellence and process improvement",
      "Engineers interested in service quality and reliability",
    ],
    topSkills: [
      "Service assurance",
      "Incident management",
      "Team leadership",
      "Monitoring tools",
      "ITIL",
    ],
    entryPaths: [
      "NOC operator or engineer experience",
      "Network engineering background",
      "ITIL certification",
      "IT support with monitoring experience",
    ],
    realityCheck: "Shift work and on-call responsibilities. Major incidents are stressful. Repetitive alarm handling can be monotonous. But you are the frontline defending service quality.",
  },
  "telco-network-perf-eng": {
    typicalDay: {
      morning: [
        "Review overnight network KPI dashboards and trend reports",
        "Identify cells or links with degrading performance",
        "Pull performance data for a capacity forecast model",
      ],
      midday: [
        "Analyse traffic patterns and produce capacity recommendations",
        "Meet with the planning team about network expansion needs",
        "Investigate a performance anomaly flagged by monitoring",
      ],
      afternoon: [
        "Produce a weekly performance report for management",
        "Recommend optimisation actions for underperforming sites",
        "Update the capacity planning model with new data",
      ],
      tools: ["BI/analytics tools", "SQL databases", "Network management systems", "Excel/Python", "Reporting platforms"],
      environment: "Office — analytical work with periodic field coordination",
    },
    whatYouActuallyDo: [
      "Monitor and analyse network KPIs to identify degradation trends",
      "Produce capacity forecasts and optimisation recommendations",
      "Collaborate with planning teams on network expansion decisions",
      "Investigate performance anomalies and drive resolution",
      "Report on network quality and trends to management",
    ],
    whoThisIsGoodFor: [
      "Engineers who enjoy data analysis and pattern recognition",
      "People interested in network performance and optimisation",
      "Those comfortable with SQL, BI tools, and data visualisation",
      "Analytical thinkers who like finding the story in the data",
    ],
    topSkills: [
      "Performance analysis",
      "KPI frameworks",
      "Capacity planning",
      "SQL/BI tools",
      "Network protocols",
    ],
    entryPaths: [
      "Network engineering with analytics interest",
      "Telecom degree with data skills",
      "Data analysis with networking knowledge",
      "NOC experience with analytical progression",
    ],
    realityCheck: "Data quality issues are common. KPIs can be misleading without context. Lots of report generation. But your analysis directly drives network investment decisions.",
  },
  "telco-test-env-lead": {
    typicalDay: {
      morning: [
        "Review test environment health checks and availability status",
        "Triage environment booking requests from delivery teams",
        "Fix an environment configuration issue blocking a test cycle",
      ],
      midday: [
        "Provision a new test environment for a major release",
        "Coordinate end-to-end validation cycle with QA teams",
        "Update environment governance and booking procedures",
      ],
      afternoon: [
        "Report environment utilisation metrics to programme management",
        "Plan environment refresh schedule and data masking",
        "Meet with vendors about test environment licensing",
      ],
      tools: ["Environment management tools", "Configuration management", "Monitoring dashboards", "Jira", "Confluence"],
      environment: "Office — coordination-heavy role managing shared test infrastructure",
    },
    whatYouActuallyDo: [
      "Maintain and provision test environments mirroring production topology",
      "Coordinate end-to-end validation cycles for major releases",
      "Define test environment governance and booking procedures",
      "Manage environment availability, health, and data freshness",
      "Balance competing demands for shared test environments",
    ],
    whoThisIsGoodFor: [
      "Engineers who enjoy infrastructure management and coordination",
      "People who are organised and good at managing competing priorities",
      "Those interested in QA processes and release management",
      "Engineers who like keeping complex systems running smoothly",
    ],
    topSkills: [
      "Test environment management",
      "Release validation",
      "Lab infrastructure",
      "Test strategy",
      "Coordination",
    ],
    entryPaths: [
      "QA engineering background",
      "Systems administration experience",
      "DevOps with environment management focus",
      "IT operations in telco",
    ],
    realityCheck: "Everyone wants environments, no one wants to maintain them. Data masking and licensing are tedious. Environments break at the worst times. Critical but often under-appreciated.",
  },
  "telco-catalog-manager": {
    typicalDay: {
      morning: [
        "Review pending product catalogue change requests",
        "Model a new product offer in the BSS catalogue using TMF standards",
        "Meet with the commercial team about upcoming product launches",
      ],
      midday: [
        "Coordinate catalogue changes with billing and fulfilment teams",
        "Validate data quality in the product catalogue",
        "Document product model changes and version history",
      ],
      afternoon: [
        "Test catalogue changes in the staging environment",
        "Governance review: ensure catalogue consistency across channels",
        "Prepare catalogue impact assessment for a new pricing change",
      ],
      tools: ["Catalogue management tools", "TMF standards documentation", "Jira", "SQL", "Test environments"],
      environment: "Office — coordination role between commercial, IT, and operations teams",
    },
    whatYouActuallyDo: [
      "Model products and offers in the BSS catalogue using TMF standards",
      "Coordinate catalogue changes with commercial, billing, and fulfilment teams",
      "Govern catalogue data quality and lifecycle management",
      "Ensure catalogue consistency across all sales channels",
      "Support new product launches with accurate catalogue modelling",
    ],
    whoThisIsGoodFor: [
      "People who enjoy structured data modelling and governance",
      "Those interested in telecom products and pricing",
      "Engineers who like working at the intersection of business and IT",
      "Detail-oriented people who value data quality",
    ],
    topSkills: [
      "TMF 620/633",
      "Product modelling",
      "Catalogue tools",
      "Business analysis",
      "Cross-team collaboration",
    ],
    entryPaths: [
      "Business analysis in telco",
      "BSS platform experience",
      "Product management with technical skills",
      "TM Forum knowledge",
    ],
    realityCheck: "Product models are surprisingly complex. Commercial teams change requirements often. Catalogue inconsistencies cause downstream failures. But every order starts with your catalogue.",
  },
  "telco-cpq-architect": {
    typicalDay: {
      morning: [
        "Design CPQ solution for a complex B2B product bundle",
        "Define pricing rules and discount matrices in the CPQ platform",
        "Meet with sales leadership on quoting requirements",
      ],
      midday: [
        "Integrate CPQ with the product catalogue and billing systems",
        "Review and approve CPQ configuration changes",
        "Test pricing scenarios for a new enterprise offering",
      ],
      afternoon: [
        "Present CPQ architecture to the programme steering committee",
        "Debug a pricing calculation error reported by sales",
        "Document CPQ configuration patterns and best practices",
      ],
      tools: ["CPQ platforms (Salesforce CPQ, Vlocity)", "CRM", "Catalogue tools", "Integration platforms", "Excel"],
      environment: "Office — architecture and configuration work with strong sales team interaction",
    },
    whatYouActuallyDo: [
      "Design CPQ solution architecture for complex telco offerings",
      "Define pricing rules, discount matrices, and approval workflows",
      "Integrate CPQ with catalogue, order management, and billing",
      "Support B2B and B2C quoting processes",
      "Ensure pricing accuracy and consistency across channels",
    ],
    whoThisIsGoodFor: [
      "Engineers who enjoy complex business logic and pricing",
      "People interested in the intersection of sales and technology",
      "Those comfortable with CRM and CPQ platforms",
      "Architects who like solving configuration puzzles",
    ],
    topSkills: [
      "CPQ platforms",
      "Pricing logic",
      "Product configuration",
      "Salesforce/Vlocity",
      "Solution design",
    ],
    entryPaths: [
      "CRM/Salesforce development background",
      "BSS engineering in telco",
      "Business analysis with pricing focus",
      "Solution architecture experience",
    ],
    realityCheck: "Pricing logic gets incredibly complex. Sales teams want exceptions to every rule. Integration between CPQ and billing is fragile. But accurate quoting drives revenue.",
  },
  "telco-billing-specialist": {
    typicalDay: {
      morning: [
        "Review overnight billing run reports for errors",
        "Investigate a billing discrepancy reported by a customer",
        "Configure rating rules for a new tariff plan",
      ],
      midday: [
        "Support a billing system upgrade in the test environment",
        "Resolve a mediation file processing failure",
        "Meet with the revenue assurance team about a leakage finding",
      ],
      afternoon: [
        "Test billing configurations for an upcoming product launch",
        "Document billing rules and troubleshooting procedures",
        "Review and approve billing change requests",
      ],
      tools: ["Billing platforms", "Mediation systems", "SQL", "Test environments", "Ticketing systems"],
      environment: "Office — operational role with mix of configuration, troubleshooting, and testing",
    },
    whatYouActuallyDo: [
      "Configure rating and charging rules for new products and tariffs",
      "Investigate and resolve billing discrepancies and customer disputes",
      "Support billing system upgrades and migration projects",
      "Maintain mediation and billing integration flows",
      "Ensure billing accuracy for millions of subscriber records",
    ],
    whoThisIsGoodFor: [
      "Detail-oriented people who enjoy troubleshooting",
      "Those interested in financial systems and accuracy",
      "Engineers who like working with complex business rules",
      "People comfortable with SQL and data analysis",
    ],
    topSkills: [
      "Billing platforms",
      "Rating & charging",
      "Mediation",
      "Revenue processes",
      "Troubleshooting",
    ],
    entryPaths: [
      "IT support in telco",
      "Junior BSS developer role",
      "Finance background with IT skills",
      "Billing platform vendor training",
    ],
    realityCheck: "Billing errors directly impact customers and revenue. Legacy billing systems are complex. On-call for billing failures. But billing is the lifeblood of telco revenue.",
  },
  "telco-slm-lead": {
    typicalDay: {
      morning: [
        "Review subscriber churn metrics and retention dashboard",
        "Analyse effectiveness of last month's retention campaigns",
        "Design a new subscriber lifecycle journey for premium customers",
      ],
      midday: [
        "Meet with marketing on lifecycle-driven offers and messaging",
        "Implement a targeted retention campaign in the CRM platform",
        "Analyse churn patterns by segment, tenure, and product",
      ],
      afternoon: [
        "Present lifecycle metrics and insights to commercial leadership",
        "Plan the next quarter's retention and win-back strategy",
        "Coordinate with billing on renewal and upgrade triggers",
      ],
      tools: ["CRM platforms", "Analytics tools", "Campaign management", "BI dashboards", "Excel"],
      environment: "Office — strategic and analytical role with marketing and commercial teams",
    },
    whatYouActuallyDo: [
      "Design subscription lifecycle journeys across acquisition, renewal, and retention",
      "Analyse churn patterns and implement targeted retention campaigns",
      "Collaborate with product and marketing on lifecycle-driven offers",
      "Monitor lifecycle KPIs and report insights to leadership",
      "Coordinate with billing and CRM teams on automated lifecycle triggers",
    ],
    whoThisIsGoodFor: [
      "Analytical people who enjoy understanding customer behaviour",
      "Those interested in marketing strategy and data analysis",
      "People who like designing customer journeys and campaigns",
      "Strategists who enjoy measuring and improving business outcomes",
    ],
    topSkills: [
      "Lifecycle management",
      "Churn analytics",
      "CRM platforms",
      "Campaign strategy",
      "Customer insights",
    ],
    entryPaths: [
      "Marketing analytics background",
      "CRM management experience",
      "Business analysis in telco",
      "Data analysis with commercial focus",
    ],
    realityCheck: "Churn is relentless. Retention campaigns have diminishing returns. Customer data quality limits targeting. But reducing churn by even 1% is worth millions in revenue.",
  },
  "telco-revenue-assurance-mgr": {
    typicalDay: {
      morning: [
        "Review revenue leakage detection reports from overnight runs",
        "Investigate a billing-to-mediation reconciliation gap",
        "Meet with the finance team on revenue variance analysis",
      ],
      midday: [
        "Implement new reconciliation controls between systems",
        "Audit a billing configuration change for revenue impact",
        "Quantify revenue leakage for a recently discovered issue",
      ],
      afternoon: [
        "Report revenue assurance findings to the CFO",
        "Coordinate remediation with the billing team",
        "Update the revenue assurance control framework",
      ],
      tools: ["Revenue assurance platforms", "BI/analytics tools", "SQL", "Billing systems", "Excel"],
      environment: "Office — analytical and audit-focused role with finance and IT collaboration",
    },
    whatYouActuallyDo: [
      "Identify and quantify revenue leakage across billing and mediation systems",
      "Implement controls and reconciliation processes to prevent revenue loss",
      "Report revenue assurance findings and remediation progress to leadership",
      "Audit billing configurations for revenue impact",
      "Coordinate with billing, mediation, and finance teams on resolution",
    ],
    whoThisIsGoodFor: [
      "Analytical people who enjoy detective-like investigation work",
      "Those interested in financial accuracy and audit",
      "Engineers who like finding discrepancies in complex systems",
      "People with attention to detail and persistence",
    ],
    topSkills: [
      "Revenue assurance",
      "Data analysis",
      "Audit processes",
      "Billing systems",
      "Financial reporting",
    ],
    entryPaths: [
      "Finance or audit background with IT skills",
      "Billing specialist looking to specialise",
      "Data analysis in telco",
      "Internal audit with technology focus",
    ],
    realityCheck: "Leakage is often hidden in complex billing logic. Data quality limits detection. Remediation is slow. But finding a million-kroner leakage makes it all worthwhile.",
  },
  "telco-cloud-engineer": {
    typicalDay: {
      morning: [
        "Check Kubernetes cluster health and pod status for CNFs",
        "Troubleshoot a pod scheduling issue on the telco cloud",
        "Review Helm chart changes for a CNF upgrade",
      ],
      midday: [
        "Deploy a new cloud-native network function to staging",
        "Test CNF lifecycle operations (scale, upgrade, rollback)",
        "Collaborate with a vendor on CNF onboarding requirements",
      ],
      afternoon: [
        "Monitor resource utilisation and plan capacity adjustments",
        "Document deployment procedures and troubleshooting guides",
        "Meet with the platform architect about cluster standards",
      ],
      tools: ["Kubernetes", "Helm", "Docker", "Linux CLI", "Monitoring (Prometheus/Grafana)"],
      environment: "Office or remote — hands-on infrastructure work with vendor collaboration",
    },
    whatYouActuallyDo: [
      "Deploy and lifecycle-manage CNFs on Kubernetes-based telco cloud",
      "Troubleshoot pod scheduling, networking, and storage issues",
      "Collaborate with vendors on VNF/CNF onboarding and certification",
      "Manage telco cloud infrastructure (compute, storage, networking)",
      "Ensure platform meets telco-grade availability requirements",
    ],
    whoThisIsGoodFor: [
      "Engineers who enjoy Kubernetes and container orchestration",
      "People interested in the intersection of cloud and telecom",
      "Those comfortable with Linux and command-line troubleshooting",
      "Engineers who like hands-on infrastructure work",
    ],
    topSkills: [
      "Kubernetes",
      "NFV/CNF",
      "Helm/Operators",
      "Linux",
      "Telco cloud platforms",
    ],
    entryPaths: [
      "Cloud or DevOps engineering background",
      "Linux systems administration",
      "Kubernetes certification (CKA/CKAD)",
      "IT infrastructure with telco interest",
    ],
    realityCheck: "Telco cloud has stricter requirements than regular cloud. Vendor CNFs can be poorly containerised. On-call for infrastructure issues. But you run the cloud that runs the network.",
  },
  "telco-open-ran-engineer": {
    typicalDay: {
      morning: [
        "Review overnight test results from Open RAN interoperability testing",
        "Integrate a new vendor's DU component in the lab",
        "Validate O-RAN interface compliance between components",
      ],
      midday: [
        "Run radio performance tests on the Open RAN stack",
        "Troubleshoot an integration issue between CU and DU",
        "Document test results and compliance findings",
      ],
      afternoon: [
        "Meet with the network architect about field trial planning",
        "Update the O-RAN testing playbook",
        "Research new O-RAN specification updates",
      ],
      tools: ["O-RAN test tools", "Network analysers", "Linux servers", "Lab equipment", "Git"],
      environment: "Lab and office — hands-on testing with multi-vendor radio equipment",
    },
    whatYouActuallyDo: [
      "Integrate and test multi-vendor Open RAN components (CU, DU, RU)",
      "Validate O-RAN interface compliance and interoperability",
      "Support lab and field trials for Open RAN deployments",
      "Troubleshoot radio access network integration issues",
      "Research and evaluate new O-RAN specifications",
    ],
    whoThisIsGoodFor: [
      "Engineers passionate about the future of radio access networks",
      "People who enjoy hands-on lab work with real equipment",
      "Those interested in standardisation and interoperability",
      "Engineers who like working at the cutting edge of telecom",
    ],
    topSkills: [
      "O-RAN architecture",
      "RAN software",
      "Integration testing",
      "RF basics",
      "Linux",
    ],
    entryPaths: [
      "Telecommunications engineering degree",
      "Radio engineering experience",
      "Network engineering with RAN interest",
      "Lab engineering background",
    ],
    realityCheck: "Open RAN is still maturing. Multi-vendor integration is hard. Performance may lag behind traditional RAN. But you're building the future of mobile networks.",
  },
  "telco-sre": {
    typicalDay: {
      morning: [
        "Review SLO dashboards for telco platform services",
        "Investigate an SLI alert that fired overnight",
        "Update runbooks for common incident scenarios",
      ],
      midday: [
        "Run a chaos engineering experiment on a staging cluster",
        "Automate incident detection and response for a key service",
        "Post-mortem review for last week's platform incident",
      ],
      afternoon: [
        "Build Grafana dashboards for a new platform service",
        "Define SLOs with the product team for a new feature",
        "Review and improve alerting rules to reduce noise",
      ],
      tools: ["Prometheus/Grafana", "PagerDuty", "Kubernetes", "Chaos Monkey/Litmus", "Terraform"],
      environment: "Office or remote — mix of engineering, incident response, and reliability improvement",
    },
    whatYouActuallyDo: [
      "Define and monitor SLOs/SLIs for telco platform services",
      "Automate incident detection, response, and post-mortem workflows",
      "Drive reliability improvements through chaos engineering and load testing",
      "Reduce toil through automation and engineering",
      "Ensure telco-grade availability (99.999%) for platform services",
    ],
    whoThisIsGoodFor: [
      "Engineers passionate about reliability and uptime",
      "People who enjoy incident response and root cause analysis",
      "Those who like automating away repetitive operations work",
      "Engineers interested in chaos engineering and resilience testing",
    ],
    topSkills: [
      "SRE practices",
      "Observability",
      "Incident response",
      "Automation",
      "Kubernetes",
    ],
    entryPaths: [
      "Software or DevOps engineering background",
      "Systems administration with automation skills",
      "Platform engineering experience",
      "Google SRE book + practical experience",
    ],
    realityCheck: "On-call is real and can be disruptive. Telco uptime expectations (five nines) are extreme. Toil management is a constant battle. But you protect services that millions rely on.",
  },
  "telco-edge-specialist": {
    typicalDay: {
      morning: [
        "Review edge node health metrics across deployed sites",
        "Design edge deployment topology for a new IoT use case",
        "Evaluate an MEC platform vendor's capabilities",
      ],
      midday: [
        "Build a proof-of-concept for an edge-enabled video analytics service",
        "Meet with the network team about edge connectivity requirements",
        "Test edge workload deployment and failover scenarios",
      ],
      afternoon: [
        "Present edge computing business case to product leadership",
        "Document edge architecture patterns and best practices",
        "Integrate edge platform with the telco management plane",
      ],
      tools: ["Edge platforms (AWS Wavelength, MEC)", "Kubernetes", "IoT tools", "Network tools", "Docker"],
      environment: "Office and lab — mix of architecture, prototyping, and hands-on testing",
    },
    whatYouActuallyDo: [
      "Design edge deployment topologies for MEC and IoT workloads",
      "Evaluate and integrate edge platform solutions with telco infrastructure",
      "Define use cases and proof-of-concepts for edge-enabled services",
      "Ensure low-latency requirements are met for edge applications",
      "Bridge network and application teams for edge deployments",
    ],
    whoThisIsGoodFor: [
      "Engineers excited about edge computing and IoT",
      "People who enjoy prototyping and proof-of-concepts",
      "Those interested in low-latency applications",
      "Engineers who like working at the frontier of new technology",
    ],
    topSkills: [
      "MEC platforms",
      "Edge architecture",
      "IoT integration",
      "Low-latency networking",
      "Container orchestration",
    ],
    entryPaths: [
      "Cloud or platform engineering background",
      "IoT development experience",
      "Network engineering with cloud interest",
      "Telco innovation lab experience",
    ],
    realityCheck: "Edge computing is still early. Business cases are not always clear. Scale is limited compared to cloud. But edge is where the next wave of telco innovation happens.",
  },

  // ========================================
  // CROSS-OVER ROLES (TELCO x SOFTWARE)
  // ========================================
  "cross-oss-bss-product-mgr": {
    typicalDay: {
      morning: [
        "Review product backlog priorities with engineering leads",
        "Translate telco domain requirements into software user stories",
        "Stakeholder meeting with the operator's IT department",
      ],
      midday: [
        "Sprint review: demo completed features to business stakeholders",
        "Refine backlog items with the development team",
        "Analyse usage metrics for recently launched features",
      ],
      afternoon: [
        "Roadmap planning session with commercial and engineering",
        "Coordinate an upcoming release across telco and engineering teams",
        "Write product requirement documents for the next quarter",
      ],
      tools: ["Jira", "Confluence", "Figma", "Analytics tools", "MS Teams"],
      environment: "Office — bridging telco business stakeholders and software engineering teams",
    },
    whatYouActuallyDo: [
      "Define and prioritise the OSS/BSS product backlog with business stakeholders",
      "Translate telco domain requirements into software product features",
      "Coordinate releases across telco operations and engineering teams",
      "Own the product vision and roadmap for OSS/BSS platforms",
      "Bridge the gap between telco jargon and software engineering",
    ],
    whoThisIsGoodFor: [
      "Product managers who want to specialise in telco",
      "Engineers transitioning to product roles",
      "People who enjoy bridging business and technology",
      "Those comfortable with both telco and software terminology",
    ],
    topSkills: [
      "Product management",
      "Telco domain",
      "Agile/Scrum",
      "Roadmap planning",
      "Stakeholder management",
    ],
    entryPaths: [
      "Product management experience",
      "Software engineering in telco",
      "Business analysis with telco domain",
      "Product owner certification helpful",
    ],
    realityCheck: "Two worlds to translate between. Telco stakeholders think in network terms, engineers think in code. Priorities shift as operator strategies change. Rewarding bridging role.",
  },
  "cross-platform-product-owner": {
    typicalDay: {
      morning: [
        "Daily standup with the engineering team",
        "Write and refine user stories for the next sprint",
        "Meet with telco operations to clarify requirements",
      ],
      midday: [
        "Backlog grooming session with the development team",
        "Prioritise features based on business value and dependencies",
        "Accept completed work from the previous sprint",
      ],
      afternoon: [
        "Sprint planning preparation: estimate and sequence stories",
        "Coordinate with other product owners on cross-team dependencies",
        "Update product documentation and release notes",
      ],
      tools: ["Jira", "Confluence", "Figma", "Slack/MS Teams", "Analytics"],
      environment: "Office — embedded with the engineering team, regular telco stakeholder interaction",
    },
    whatYouActuallyDo: [
      "Own the platform product backlog for telco platform teams",
      "Write and refine user stories bridging telco and software terminology",
      "Prioritise based on business value and technical dependencies",
      "Act as the bridge between telco operations and software engineering",
      "Accept completed work and ensure it meets business requirements",
    ],
    whoThisIsGoodFor: [
      "People who enjoy detailed requirements and prioritisation",
      "Those who like being embedded with development teams",
      "Engineers or analysts transitioning to product roles",
      "People comfortable with agile ceremonies and practices",
    ],
    topSkills: [
      "Product ownership",
      "Backlog management",
      "Telco platforms",
      "Scrum",
      "User stories",
    ],
    entryPaths: [
      "Business analysis experience",
      "Scrum master transitioning to product",
      "CSPO/PSPO certification",
      "Engineering with product interest",
    ],
    realityCheck: "Constant context-switching between business and engineering. Stakeholders always want more than the team can deliver. But you directly shape what gets built.",
  },
  "cross-network-automation-sw-eng": {
    typicalDay: {
      morning: [
        "Code review for the network automation API service",
        "Daily standup with the automation engineering team",
        "Debug a failing CI pipeline for the automation codebase",
      ],
      midday: [
        "Build a new REST API endpoint for network device configuration",
        "Write unit and integration tests for the automation service",
        "Implement API authentication for the self-service portal",
      ],
      afternoon: [
        "Test API against network simulators in the lab",
        "Deploy automation service to staging environment",
        "Document API endpoints and usage examples",
      ],
      tools: ["Python", "FastAPI/Flask", "Git/GitHub", "Kubernetes", "Network simulators"],
      environment: "Office or remote — software engineering with network automation focus",
    },
    whatYouActuallyDo: [
      "Build production-grade software services for network automation",
      "Develop APIs that abstract network complexity for self-service portals",
      "Implement CI/CD for network automation codebases",
      "Test automation software against network simulators and lab environments",
      "Bridge software engineering practices with network operations",
    ],
    whoThisIsGoodFor: [
      "Software engineers interested in networking",
      "Network engineers who want to write production-grade code",
      "People who enjoy building APIs and services",
      "Engineers who like automating complex operational processes",
    ],
    topSkills: [
      "Python",
      "REST/gRPC APIs",
      "Network protocols",
      "CI/CD",
      "Kubernetes",
    ],
    entryPaths: [
      "Software engineering with networking curiosity",
      "Network engineering with strong coding skills",
      "DevOps with network automation interest",
      "Computer science degree with telecom electives",
    ],
    realityCheck: "Network devices are unpredictable. APIs must handle partial failures gracefully. Testing against real network gear is limited. But you write the code that automates entire networks.",
  },
  "cross-api-integration-architect": {
    typicalDay: {
      morning: [
        "Design an API strategy for a new BSS-to-OSS integration",
        "Review TMF Open API implementation in a microservice",
        "Meet with team leads to discuss event-driven architecture patterns",
      ],
      midday: [
        "Define Kafka topic structure and event schemas",
        "Govern API standards: review and approve new API designs",
        "Document integration patterns and anti-patterns",
      ],
      afternoon: [
        "Present API strategy to the programme architecture board",
        "Prototype an event-driven integration for order fulfilment",
        "Review and update API versioning and lifecycle policies",
      ],
      tools: ["Swagger/OpenAPI", "Kafka", "API gateways", "TM Forum specs", "Postman"],
      environment: "Office — architecture role bridging telco standards and modern software patterns",
    },
    whatYouActuallyDo: [
      "Design API strategies bridging telco BSS/OSS and modern microservices",
      "Define event-driven integration patterns using Kafka or similar",
      "Govern API standards, versioning, and lifecycle management",
      "Architect integration layers using TMF Open APIs and REST",
      "Ensure consistent, well-documented APIs across the organisation",
    ],
    whoThisIsGoodFor: [
      "Architects passionate about API design and integration patterns",
      "People who enjoy standardisation and governance",
      "Those interested in both telco (TMF) and modern (REST, events) approaches",
      "Engineers who like designing systems that connect other systems",
    ],
    topSkills: [
      "API design",
      "TMF Open APIs",
      "Event-driven architecture",
      "Kafka/NATS",
      "Integration patterns",
    ],
    entryPaths: [
      "Integration or middleware engineering",
      "Backend engineering with API focus",
      "Enterprise architecture background",
      "TM Forum and API management experience",
    ],
    realityCheck: "API governance sounds simple but is hard in practice. Legacy systems don't have nice APIs. Event-driven debugging is complex. But great APIs are the foundation of modern telco.",
  },
  "cross-test-env-governance": {
    typicalDay: {
      morning: [
        "Review environment utilisation dashboards and booking conflicts",
        "Triage environment requests from multiple programme streams",
        "Fix an environment provisioning issue reported by a QA team",
      ],
      midday: [
        "Build an intelligence dashboard for environment usage analytics",
        "Define and enforce environment governance procedures",
        "Coordinate environment provisioning across telco and IT platforms",
      ],
      afternoon: [
        "Present environment strategy to programme management",
        "Plan environment refresh and data masking schedules",
        "Meet with vendors about environment licensing and capacity",
      ],
      tools: ["Environment management tools", "Grafana/dashboards", "Terraform", "Jira", "Confluence"],
      environment: "Office — governance and coordination role across multiple programme streams",
    },
    whatYouActuallyDo: [
      "Define test environment strategy across telco and IT platforms",
      "Build dashboards and intelligence tools for environment utilisation",
      "Coordinate environment provisioning across multiple programme streams",
      "Enforce environment governance, booking, and data masking procedures",
      "Optimise environment costs and utilisation rates",
    ],
    whoThisIsGoodFor: [
      "Engineers who enjoy data-driven governance and optimisation",
      "People who are great at coordination and stakeholder management",
      "Those interested in test infrastructure and DevOps",
      "Engineers who like building tools and dashboards",
    ],
    topSkills: [
      "Test environment management",
      "Data analytics",
      "Governance",
      "Telco & IT landscape",
      "Tool development",
    ],
    entryPaths: [
      "Test environment management experience",
      "DevOps with environment focus",
      "QA engineering background",
      "IT operations with governance interest",
    ],
    realityCheck: "Everyone needs environments, budgets are tight. Data masking is tedious but legally required. Coordination across teams is challenging. Critical but often thankless work.",
  },
  "cross-observability-eng": {
    typicalDay: {
      morning: [
        "Check unified observability dashboards for cross-domain anomalies",
        "Investigate an alert correlation between network and cloud metrics",
        "Deploy new OpenTelemetry collectors for a telco service",
      ],
      midday: [
        "Build a Grafana dashboard combining telco KPIs and cloud metrics",
        "Implement distributed tracing across a hybrid telco/cloud service",
        "Meet with the NOC about improving cross-domain alerting",
      ],
      afternoon: [
        "Configure alerting rules for a new cross-platform service",
        "Optimise log aggregation pipelines for cost and performance",
        "Document observability standards and onboarding guides",
      ],
      tools: ["Prometheus/Grafana", "OpenTelemetry", "Loki/ELK", "PagerDuty", "Kubernetes"],
      environment: "Office or remote — engineering work bridging telco network and cloud observability",
    },
    whatYouActuallyDo: [
      "Design unified observability across telco network and cloud stacks",
      "Implement distributed tracing and metrics collection across platforms",
      "Build alerting rules and dashboards for cross-domain visibility",
      "Bridge telco KPIs (network counters) with cloud metrics (latency, errors)",
      "Ensure end-to-end observability for hybrid telco/cloud services",
    ],
    whoThisIsGoodFor: [
      "Engineers passionate about monitoring and observability",
      "People who enjoy connecting disparate data sources",
      "Those interested in both networking and cloud systems",
      "Engineers who like making systems visible and debuggable",
    ],
    topSkills: [
      "Prometheus/Grafana",
      "OpenTelemetry",
      "Log aggregation",
      "Telco KPIs",
      "Alerting",
    ],
    entryPaths: [
      "SRE or DevOps engineering background",
      "Network monitoring experience",
      "Platform engineering with observability focus",
      "Cloud engineering with monitoring experience",
    ],
    realityCheck: "Data volume is enormous. Telco metrics and cloud metrics speak different languages. Alert fatigue is real. But unified observability is the key to reliable hybrid services.",
  },

  // ========================================
  // FINANCE (SENIOR / DIRECTOR+)
  // ========================================
  "finance-director": {
    typicalDay: {
      morning: ["Review consolidated financial reports and variance analyses", "Align with CFO on quarterly forecast assumptions", "Lead finance team stand-up on month-end close progress"],
      midday: ["Present budget-vs-actual analysis to business unit leaders", "Evaluate capital expenditure proposals and ROI models", "Meet with external auditors on compliance matters"],
      afternoon: ["Refine rolling forecasts in ERP system", "One-on-ones with controllers and FP&A analysts", "Prepare board-ready financial summaries and commentary"],
      tools: ["SAP S/4HANA", "Power BI", "Excel (advanced modelling)", "Workday Adaptive Planning", "Aaro"],
      environment: "Corporate office or hybrid, with periodic travel to subsidiaries and board meetings"
    },
    whatYouActuallyDo: [
      "You own the financial planning, reporting, and control function for a business unit or the entire company. This means translating strategy into numbers — building budgets, forecasting revenue, and making sure every krone is accounted for. You are the bridge between the C-suite vision and the operational reality reflected in the P&L.",
      "Day to day you spend as much time influencing decisions as you do crunching numbers. You challenge business cases, negotiate with auditors, coach your finance team, and ensure regulatory compliance across Norwegian GAAP or IFRS. When the board asks 'can we afford this?' — you are the one who answers."
    ],
    whoThisIsGoodFor: [
      "Analytical minds who also enjoy strategic business conversations",
      "People who thrive on accuracy under deadline pressure",
      "Leaders who can translate numbers into actionable stories",
      "Those who value governance, ethics, and fiscal discipline"
    ],
    topSkills: [
      "Financial reporting (IFRS/NGAAP)",
      "Budgeting and forecasting",
      "Stakeholder communication",
      "Team leadership",
      "ERP systems proficiency"
    ],
    entryPaths: [
      "Bachelor's/Master's in finance, accounting, or economics followed by 10+ years progressive experience",
      "Chartered path via statsautorisert revisor (state-authorised auditor) transitioning into industry",
      "Big Four audit or advisory career pivoting to corporate finance leadership",
      "Internal promotion from controller or FP&A manager role"
    ],
    realityCheck: "Month-end and year-end closes are intense — expect late nights and weekends during those windows. The role carries heavy accountability; mistakes in reported numbers can have regulatory consequences. But it is one of the most respected and well-compensated leadership positions, offering a clear path to CFO."
  },

  "head-of-finance": {
    typicalDay: {
      morning: ["Review cash position and treasury dashboard with finance ops", "Strategic planning session with CEO on growth scenarios", "Approve payment runs and inter-company transfers"],
      midday: ["Chair cross-functional meeting on pricing model changes", "Deep-dive into subsidiary financial performance", "Working lunch with investor relations or board advisor"],
      afternoon: ["Review draft annual report sections with communications", "Mentor senior finance managers on career development", "Assess automation opportunities in reporting workflows"],
      tools: ["SAP", "Visma", "Power BI", "Board management portal (AdminControl)", "Excel"],
      environment: "Head-office setting, typically hybrid, with quarterly board attendance and occasional international travel"
    },
    whatYouActuallyDo: [
      "As Head of Finance you sit at the intersection of strategy and stewardship. You are ultimately responsible for the integrity of all financial information leaving the company — from monthly management reports to statutory filings with Brønnøysundregistrene. You set the financial culture: how tight are controls, how forward-looking is the planning, and how commercially engaged is the finance function.",
      "You spend roughly half your time on people and process — building a high-performing finance team, standardising reporting across entities, and driving digitalisation. The other half is spent as a strategic advisor to the CEO and board, stress-testing business plans, evaluating M&A targets, and managing banking relationships."
    ],
    whoThisIsGoodFor: [
      "Senior finance professionals ready to move from technical excellence to strategic influence",
      "People who enjoy building teams and shaping organisational culture",
      "Those comfortable presenting to boards and external stakeholders",
      "Individuals who balance big-picture thinking with attention to detail"
    ],
    topSkills: [
      "Strategic financial planning",
      "Leadership and talent development",
      "Board and investor communication",
      "Process improvement and digitalisation",
      "Risk management"
    ],
    entryPaths: [
      "Finance Director or VP Finance stepping up to full departmental ownership",
      "Senior audit partner transitioning to industry leadership",
      "Controller with broad multi-entity experience and an MBA",
      "CFO of a smaller company moving to Head of Finance at a larger group"
    ],
    realityCheck: "You are accountable for everything financial, yet you rarely do the technical work yourself anymore. Success depends on hiring well, delegating effectively, and influencing peers who may not share your caution. Board exposure is a double-edged sword — high visibility means both recognition and scrutiny."
  },

  "chief-financial-officer": {
    typicalDay: {
      morning: ["Pre-market briefing on macroeconomic developments and portfolio exposure", "Executive committee meeting on strategic priorities", "Review capital allocation recommendations from treasury"],
      midday: ["Investor call or analyst meeting on quarterly results", "Working session with General Counsel on regulatory filing", "Lunch with banking partner to discuss credit facility terms"],
      afternoon: ["Board preparation — review slide deck and talking points", "One-on-one with CHRO on compensation benchmarking for finance org", "Approve final numbers for press release on annual results"],
      tools: ["Bloomberg Terminal", "SAP S/4HANA", "Board portal (Diligent/AdminControl)", "Power BI", "Excel"],
      environment: "Executive floor at headquarters, significant travel for investor roadshows, board meetings, and subsidiary visits"
    },
    whatYouActuallyDo: [
      "The CFO is the financial conscience of the organisation and a core member of the executive team. In the Norwegian market this means navigating IFRS reporting, OBX listing requirements (if public), and a regulatory landscape shaped by Finanstilsynet. You set the company's financial strategy — how much debt to carry, where to invest, whether to pursue M&A, and how to return value to shareholders.",
      "Beyond the numbers, you are a storyteller and trust-builder. Investors, analysts, and banks judge the company partly through your credibility. You also serve as a counterweight to the CEO's optimism, ensuring ambitions are financially sustainable. Internally you champion a data-driven decision culture and sponsor finance transformation programmes."
    ],
    whoThisIsGoodFor: [
      "Seasoned finance leaders who crave enterprise-level strategic impact",
      "People who are energised by capital markets and investor engagement",
      "Decisive communicators comfortable with ambiguity and incomplete data",
      "Those who can balance regulatory rigour with commercial boldness"
    ],
    topSkills: [
      "Capital markets and investor relations",
      "Enterprise strategy and M&A",
      "Regulatory compliance (IFRS, tax, governance)",
      "Executive leadership and board management",
      "Risk and treasury oversight"
    ],
    entryPaths: [
      "Head of Finance or Finance Director promoted within a growing company",
      "Investment banking MD or partner pivoting to a corporate CFO seat",
      "Big Four partner transitioning to industry at C-level",
      "VP Finance at a multinational taking a CFO role at a Nordic mid-cap"
    ],
    realityCheck: "The buck stops with you — literally. Personal liability under Norwegian company law means you sign off on accounts knowing errors could have legal consequences. The role is politically demanding, with constant negotiation across the C-suite. Compensation is excellent, but the pressure is relentless, especially around earnings seasons and capital raises."
  },

  "treasury-director": {
    typicalDay: {
      morning: ["Review overnight cash positions across global bank accounts", "Assess FX exposure and approve hedging transactions", "Check compliance with debt covenants and liquidity ratios"],
      midday: ["Negotiate terms on a revolving credit facility renewal with DNB", "Present cash flow forecast to CFO and finance leadership", "Evaluate counterparty risk on new banking relationships"],
      afternoon: ["Oversee in-house bank settlement processes", "Review interest rate swap valuations with treasury analyst", "Update board treasury policy documentation"],
      tools: ["Kyriba or SAP Treasury", "Bloomberg Terminal", "SWIFT/banking portals", "Excel (cash modelling)", "Power BI"],
      environment: "Corporate headquarters, primarily office-based due to market-hours sensitivity, occasional travel for bank negotiations"
    },
    whatYouActuallyDo: [
      "You manage the company's money — literally. Every day you ensure there is enough cash in the right accounts, in the right currencies, to meet obligations while minimising idle balances. In Norway's export-heavy economy, this often means managing significant NOK/USD/EUR exposure through forwards, options, and natural hedging.",
      "Beyond day-to-day cash management, you own the company's relationship with banks and credit agencies, negotiate debt facilities, and ensure compliance with financial covenants. You also set policy on investment of surplus cash, manage interest rate risk, and advise the CFO on optimal capital structure."
    ],
    whoThisIsGoodFor: [
      "People fascinated by financial markets, currencies, and interest rates",
      "Detail-oriented professionals who enjoy working with large data sets",
      "Those who thrive in time-sensitive, market-driven environments",
      "Individuals who value precision and risk mitigation"
    ],
    topSkills: [
      "Cash and liquidity management",
      "FX and interest rate hedging",
      "Bank relationship management",
      "Financial risk analysis",
      "Treasury management systems"
    ],
    entryPaths: [
      "Treasury analyst or cash manager progressing over 8-12 years",
      "Corporate banking relationship manager transitioning to the buy-side",
      "FP&A or controller with strong cash flow modelling experience",
      "Finance professional with CFA or ACT (Association of Corporate Treasurers) qualification"
    ],
    realityCheck: "Treasury mistakes are expensive and visible — a missed hedge can cost millions, a covenant breach can trigger default. The work is market-paced, meaning you cannot always plan your day. But the role is intellectually stimulating, well-compensated, and increasingly strategic as companies globalise."
  },

  "risk-director": {
    typicalDay: {
      morning: ["Review risk dashboard and overnight incident reports", "Chair enterprise risk committee meeting", "Assess emerging risks from regulatory or geopolitical developments"],
      midday: ["Present quarterly risk heat-map to executive leadership", "Deep-dive into operational risk event with business unit owner", "Meet with internal audit on control testing results"],
      afternoon: ["Update risk appetite framework documentation", "Review insurance programme renewal with broker", "Mentor risk analysts on scenario modelling techniques"],
      tools: ["GRC platforms (Archer, ServiceNow)", "Power BI", "Excel (Monte Carlo simulations)", "Regulatory databases (Finanstilsynet, EU)", "Risk registers"],
      environment: "Corporate office or hybrid, with travel to operational sites for risk assessments and regulatory meetings"
    },
    whatYouActuallyDo: [
      "You are the company's early warning system. Your job is to identify, assess, and help mitigate risks before they become crises — from financial fraud and cyber-attacks to regulatory changes and supply chain disruptions. In the Norwegian context, this includes navigating Finanstilsynet requirements, GDPR, and increasingly ESG-related risks.",
      "Practically, you build risk frameworks, run scenario analyses, maintain the corporate risk register, and report to the board's audit and risk committee. You do not own the risks — the business units do — but you ensure they understand and manage them. You also oversee the insurance programme and coordinate with internal audit."
    ],
    whoThisIsGoodFor: [
      "Analytical thinkers who enjoy connecting dots across complex organisations",
      "People who are naturally sceptical and question assumptions",
      "Those who communicate difficult truths diplomatically",
      "Individuals who find satisfaction in preventing problems rather than fixing them"
    ],
    topSkills: [
      "Enterprise risk management frameworks (COSO, ISO 31000)",
      "Quantitative risk analysis",
      "Regulatory compliance",
      "Stakeholder influence and communication",
      "Scenario planning and stress testing"
    ],
    entryPaths: [
      "Internal audit manager transitioning to risk leadership",
      "Senior compliance officer broadening into enterprise risk",
      "Actuary or quantitative analyst moving into corporate risk",
      "Management consultant specialising in risk and governance"
    ],
    realityCheck: "Risk directors often feel like they are shouting warnings that nobody listens to — until something goes wrong, and then everyone asks why you didn't shout louder. The role requires thick skin and political savvy. But it is increasingly valued at board level, and the best risk directors become indispensable strategic advisors."
  },

  // ========================================
  // SALES (SENIOR / DIRECTOR+)
  // ========================================
  "enterprise-account-executive": {
    typicalDay: {
      morning: ["Review pipeline and prioritise deals in CRM", "Prepare for discovery call with a large Norwegian enterprise prospect", "Coordinate with solutions engineer on technical demo"],
      midday: ["Lead a 90-minute workshop with a prospect's procurement and IT teams", "Update deal notes and next steps in Salesforce", "Internal strategy call on competitive positioning"],
      afternoon: ["Draft a tailored value proposition for a C-level stakeholder", "Follow up on proposal sent last week with a personalised video", "Pipeline review with sales manager"],
      tools: ["Salesforce", "LinkedIn Sales Navigator", "Gong or Chorus (call intelligence)", "PowerPoint/Google Slides", "Slack"],
      environment: "Hybrid office with significant time in client meetings across Norway, some Nordic travel"
    },
    whatYouActuallyDo: [
      "You sell complex, high-value solutions to large organisations — typically deals worth NOK 1-10 million annually. This is consultative selling, not transactional. You spend weeks or months understanding a prospect's business challenges, mapping their decision-making unit, and building a business case that justifies the investment to their CFO.",
      "Your day is split between prospecting (finding new opportunities), progressing existing deals (demos, workshops, negotiations), and managing relationships with existing accounts for upsell. Success depends on your ability to build trust with senior buyers, navigate complex procurement processes, and orchestrate internal resources like solutions engineers and legal."
    ],
    whoThisIsGoodFor: [
      "Naturally curious people who enjoy understanding businesses deeply",
      "Resilient individuals comfortable with long sales cycles and rejection",
      "Strong communicators who can adapt their message to different audiences",
      "Competitive people motivated by variable compensation"
    ],
    topSkills: [
      "Consultative and solution selling",
      "Stakeholder mapping and relationship building",
      "Business case development",
      "Negotiation and closing",
      "CRM and pipeline management"
    ],
    entryPaths: [
      "SDR/BDR promoted to account executive after 1-2 years",
      "Mid-market AE moving upmarket to enterprise",
      "Industry specialist (e.g. consulting, engineering) transitioning into enterprise sales",
      "Sales training programme at a major tech or professional services firm"
    ],
    realityCheck: "Enterprise sales is a rollercoaster — a single lost deal can wipe out a quarter. The highs of closing a major deal are extraordinary, but the lows of a deal slipping to next quarter are brutal. Earnings potential is very high (base + commission), but income volatility is real. Not for those who need predictability."
  },

  "strategic-account-executive": {
    typicalDay: {
      morning: ["Analyse account health metrics and renewal timeline for a top-10 customer", "Prepare executive business review presentation", "Align with customer success manager on adoption challenges"],
      midday: ["Lead quarterly business review with client's VP and directors", "Identify whitespace opportunities for cross-sell in a large account", "Internal meeting with product team on client feature requests"],
      afternoon: ["Draft multi-year strategic account plan", "Call with procurement to discuss contract expansion terms", "Update CRM with revised deal forecast and close dates"],
      tools: ["Salesforce", "Gainsight", "LinkedIn Sales Navigator", "Miro (account mapping)", "Excel"],
      environment: "Hybrid with frequent on-site visits to strategic accounts, mostly within the Nordics"
    },
    whatYouActuallyDo: [
      "You manage the company's most important and largest customer accounts — the ones where the relationship is measured in years and millions of kroner. Unlike a hunter role, your focus is on deepening and expanding existing relationships. You think in terms of share-of-wallet, multi-year roadmaps, and executive alignment.",
      "You operate as a trusted advisor to your clients' leadership, understanding their strategic priorities and mapping your company's capabilities to their needs. Internally, you advocate for your accounts — escalating issues, securing resources, and influencing product roadmaps based on strategic customer feedback."
    ],
    whoThisIsGoodFor: [
      "Relationship builders who think long-term rather than transactionally",
      "Strategic thinkers who enjoy complex account planning",
      "People skilled at navigating large organisations both internally and externally",
      "Those who prefer deepening partnerships over constant prospecting"
    ],
    topSkills: [
      "Strategic account planning",
      "Executive relationship management",
      "Commercial negotiation",
      "Cross-functional orchestration",
      "Revenue expansion and retention"
    ],
    entryPaths: [
      "Enterprise account executive with a track record of growing large accounts",
      "Customer success leader transitioning to a commercial role",
      "Management consultant with deep client relationship experience",
      "Industry expert hired for domain credibility with strategic accounts"
    ],
    realityCheck: "Losing a strategic account is career-defining — the pressure to retain and grow is constant. You are always 'on' because these clients expect immediate responsiveness. The role requires patience; results compound over years, not quarters. But the relationships you build are genuinely rewarding, and compensation at this level is very strong."
  },

  "global-account-director": {
    typicalDay: {
      morning: ["Review global account P&L and regional performance dashboards", "Call with APAC team on delivery issues at a key account's regional subsidiary", "Prepare for annual strategic planning session with the client's global procurement"],
      midday: ["Lead global account team sync across EMEA, Americas, and APAC", "Negotiate a master services agreement amendment with client legal", "Working lunch with the client's Nordic CTO to discuss innovation partnership"],
      afternoon: ["Update global account plan with competitive intelligence", "Align with regional sales directors on local execution", "Executive sponsor check-in on account health"],
      tools: ["Salesforce", "Power BI", "Teams/Zoom (global coordination)", "Miro", "SAP CRM", "Excel"],
      environment: "Home office or corporate HQ with significant international travel (30-50%), managing across multiple time zones"
    },
    whatYouActuallyDo: [
      "You own the worldwide relationship with one or a small number of the company's most significant global clients. This means coordinating sales, delivery, and service across multiple countries, cultures, and time zones. Your clients are typically Nordic multinationals — companies like Equinor, Telenor, or Yara — with operations spanning continents.",
      "Your role is equal parts diplomat, strategist, and general manager. You set the global account strategy, negotiate master agreements, resolve cross-border conflicts, and ensure consistent service quality everywhere. You carry a global revenue target and are measured on total account growth, profitability, and client satisfaction."
    ],
    whoThisIsGoodFor: [
      "Seasoned sales leaders comfortable operating across cultures and time zones",
      "Strategic thinkers who enjoy managing complexity at scale",
      "People with strong executive presence and gravitas",
      "Those who thrive with travel and do not need a fixed routine"
    ],
    topSkills: [
      "Global account strategy and governance",
      "Cross-cultural leadership",
      "Contract and commercial negotiation",
      "P&L management",
      "Executive stakeholder engagement"
    ],
    entryPaths: [
      "Strategic account executive promoted to manage a global relationship",
      "Regional sales director taking on a global client portfolio",
      "Senior management consultant transitioning to commercial leadership",
      "Country manager with deep client relationships moving to a global role"
    ],
    realityCheck: "The travel is relentless and the time zones are punishing — early morning calls with Asia and late evening calls with the Americas are routine. You depend on regional teams you do not directly control, which requires influence without authority. But managing a global account worth tens of millions is one of the most commercially impactful roles in any company."
  },

  "sales-director": {
    typicalDay: {
      morning: ["Review weekly sales dashboard and pipeline metrics", "Coach an account executive on a stuck deal via role-play", "Forecast call with VP Sales on commit, best case, and pipeline coverage"],
      midday: ["Join a strategic deal as executive sponsor in a client meeting", "Interview a senior AE candidate", "Align with marketing on lead quality and campaign ROI"],
      afternoon: ["Quarterly business review preparation with territory data", "One-on-one with underperforming rep on development plan", "Update compensation model for next fiscal year"],
      tools: ["Salesforce", "Clari (forecasting)", "Gong", "LinkedIn Sales Navigator", "Google Slides"],
      environment: "Office-based or hybrid, with travel to support reps in field and attend leadership offsites"
    },
    whatYouActuallyDo: [
      "You lead a team of account executives and are responsible for hitting a team revenue target — typically measured in tens of millions of NOK. Your job is to make your team successful: hiring the right people, coaching them on deals, removing obstacles, and holding them accountable to activity and results.",
      "Roughly a third of your time goes to deal inspection — reviewing pipeline, pressure-testing forecasts, and joining strategic calls. Another third goes to people management — coaching, performance reviews, and hiring. The final third is cross-functional — working with marketing on demand generation, with product on competitive positioning, and with finance on forecasting accuracy."
    ],
    whoThisIsGoodFor: [
      "Former top-performing salespeople who find fulfilment in developing others",
      "People who are energised by hitting targets and building winning teams",
      "Strong coaches who can diagnose deal problems and prescribe solutions",
      "Those comfortable making tough decisions on underperformance"
    ],
    topSkills: [
      "Sales coaching and methodology (MEDDPICC, Challenger)",
      "Pipeline and forecast management",
      "Hiring and talent assessment",
      "Data-driven decision making",
      "Cross-functional leadership"
    ],
    entryPaths: [
      "Top-performing enterprise AE promoted to first-line management",
      "Sales manager at a smaller company stepping up to a director role",
      "Regional sales manager with a proven record of team quota attainment",
      "Sales enablement or operations leader transitioning to line management"
    ],
    realityCheck: "You are only as good as your team's number. If the team misses, you miss — regardless of how well you personally performed. The transition from individual contributor to leader is one of the hardest in sales; many great reps struggle as managers. But building a high-performing team and watching them grow is uniquely rewarding."
  },

  "regional-sales-director": {
    typicalDay: {
      morning: ["Review regional pipeline across all territories in the Nordics", "Strategy call with country managers in Sweden and Denmark", "Analyse win/loss trends from the past quarter"],
      midday: ["Present regional performance to VP Sales EMEA", "Executive sponsor call on a multi-country deal", "Align with regional marketing lead on event strategy for Oslo Energy Week"],
      afternoon: ["Territory planning workshop with sales directors", "Review headcount plan and hiring priorities with HR", "Coach a sales director on managing a difficult team dynamic"],
      tools: ["Salesforce", "Clari", "Power BI", "Tableau", "Teams/Zoom"],
      environment: "Based in Oslo or a Nordic hub, frequent travel across the region (Norway, Sweden, Denmark, Finland)"
    },
    whatYouActuallyDo: [
      "You own the revenue number for an entire region — typically the Nordics or Northern Europe. You manage a team of sales directors and their teams, making you responsible for overall go-to-market strategy, territory design, and resource allocation across multiple countries.",
      "Your focus shifts from individual deals to market-level decisions: which segments to prioritise, how to allocate headcount between countries, where to invest in partnerships, and how to adapt the global sales playbook to Nordic buying behaviours. You spend significant time on talent — identifying future leaders, managing succession planning, and building a culture of accountability and excellence."
    ],
    whoThisIsGoodFor: [
      "Experienced sales directors ready to move from team leadership to regional strategy",
      "People who understand Nordic business culture and can operate across borders",
      "Leaders who excel at building organisational capability, not just hitting quota",
      "Those who are comfortable with ambiguity and enjoy shaping go-to-market strategy"
    ],
    topSkills: [
      "Go-to-market strategy and territory design",
      "Multi-country P&L management",
      "Organisational leadership and succession planning",
      "Nordic market knowledge",
      "Executive communication and board reporting"
    ],
    entryPaths: [
      "Sales Director with consistent over-attainment promoted to regional scope",
      "Country Manager in a Nordic market expanding to a multi-country role",
      "VP Sales at a smaller company moving to a regional role at a larger enterprise",
      "General Manager with strong commercial experience"
    ],
    realityCheck: "You are far from the deals — your impact is indirect, through the leaders you develop and the strategies you set. This can feel frustrating for those who miss the adrenaline of closing. Travel is significant and meeting fatigue is real. But the scope of influence is enormous, and this is a direct stepping stone to VP Sales or commercial leadership."
  },

  "head-of-sales": {
    typicalDay: {
      morning: ["Review company-wide sales performance against annual targets", "Executive team meeting on go-to-market adjustments", "Approve a major deal discount beyond standard authority"],
      midday: ["Present sales strategy update to the board", "Working session with Head of Marketing on pipeline generation targets", "Meet with key client CEO as executive sponsor"],
      afternoon: ["Quarterly all-hands with the full sales organisation", "Review compensation plan design with HR and finance", "Strategic planning session on entering a new vertical market"],
      tools: ["Salesforce", "Clari", "Power BI", "Boardroom presentation tools", "Excel"],
      environment: "Corporate headquarters, hybrid, with regular travel to key accounts, regional offices, and industry events"
    },
    whatYouActuallyDo: [
      "You are the most senior sales leader in the company, responsible for the entire revenue engine. You set the sales strategy, design the organisational structure, own the annual revenue target, and report directly to the CEO or Chief Revenue Officer. In a Norwegian mid-to-large company, this means building a sales machine that works across direct, channel, and partnership motions.",
      "At this level, your job is about systems, not individual deals. You design territory plans, set quotas, approve compensation structures, and build the leadership bench. You are the voice of the customer in the executive team, bringing market intelligence to product and strategy decisions. When things go wrong — and they will — you are the one the board looks to for answers."
    ],
    whoThisIsGoodFor: [
      "Proven sales leaders who want to shape company strategy, not just execute it",
      "People who think in systems — process, data, and organisational design",
      "Charismatic leaders who can inspire a large, diverse sales organisation",
      "Those who are comfortable with intense accountability and visibility"
    ],
    topSkills: [
      "Sales strategy and organisational design",
      "Revenue forecasting and planning",
      "Executive leadership and board communication",
      "Go-to-market innovation",
      "Talent strategy and culture building"
    ],
    entryPaths: [
      "Regional Sales Director or VP Sales promoted to top sales role",
      "General Manager with strong commercial track record",
      "Head of Sales at a smaller company moving to a larger organisation",
      "Chief Revenue Officer scope narrowing to focus on sales execution"
    ],
    realityCheck: "The revenue target is yours and yours alone. In good years you are a hero; in bad years your job is at risk. The role is politically complex — you negotiate internally as much as externally. Average tenure for a Head of Sales is 18-24 months, which tells you something about the pressure. But for those who thrive, it is the most commercially impactful role in the company."
  },

  "head-of-revenue": {
    typicalDay: {
      morning: ["Review full-funnel metrics from marketing through to customer expansion", "Align sales and marketing leaders on shared pipeline targets", "Analyse net revenue retention and churn trends"],
      midday: ["Cross-functional revenue operations review with sales ops, marketing ops, and CS ops", "Present ARR growth model to CFO and CEO", "Strategy session on pricing model optimisation"],
      afternoon: ["Review customer lifecycle data to identify expansion bottlenecks", "Meet with product leadership on monetisation strategy", "Prepare revenue forecast for upcoming board meeting"],
      tools: ["Salesforce", "HubSpot", "Clari", "ChartMogul or Baremetrics", "Power BI", "Excel"],
      environment: "Corporate office or hybrid, with cross-functional meetings dominating the calendar"
    },
    whatYouActuallyDo: [
      "You own the entire revenue lifecycle — from the first marketing touch to customer renewal and expansion. Unlike a Head of Sales who focuses on new business, you are responsible for the full commercial engine, including customer success, retention, and revenue operations. This is a relatively new role in the Nordics, most common in SaaS and subscription businesses.",
      "Your value lies in breaking down silos between sales, marketing, and customer success. You build shared metrics (like net revenue retention, CAC payback, and LTV:CAC ratio), align incentives, and optimise the end-to-end revenue process. You are as much a data and process leader as a commercial one."
    ],
    whoThisIsGoodFor: [
      "Systems thinkers who see revenue as a cross-functional process, not a department",
      "Data-driven leaders comfortable with SaaS metrics and unit economics",
      "People who enjoy breaking down organisational silos",
      "Those who want broader scope than a traditional sales leadership role"
    ],
    topSkills: [
      "Full-funnel revenue strategy",
      "SaaS metrics and unit economics",
      "Cross-functional alignment",
      "Revenue operations and technology",
      "Data-driven decision making"
    ],
    entryPaths: [
      "VP Sales expanding scope to include customer success and marketing",
      "VP Customer Success with commercial acumen moving upstream",
      "Revenue operations leader promoted to strategic leadership",
      "Management consultant specialising in commercial transformation"
    ],
    realityCheck: "This role is often created to fix a broken go-to-market — meaning you inherit problems. Aligning sales, marketing, and CS teams with different cultures and incentives is politically challenging. The role is still being defined in many companies, so you may need to build your own mandate. But when it works, the impact on growth is transformative."
  },

  "commercial-director": {
    typicalDay: {
      morning: ["Review commercial performance metrics across all business lines", "Strategy meeting with CEO on market expansion opportunities", "Assess a new partnership proposal from a Nordic distributor"],
      midday: ["Lead pricing committee on margin optimisation for a product line", "Client meeting with a major Norwegian enterprise customer", "Align with product team on commercial viability of a new offering"],
      afternoon: ["Review tender response for a public sector framework agreement", "Meet with legal on contract terms for an international deal", "Commercial team leadership meeting on quarterly priorities"],
      tools: ["SAP", "Salesforce", "Power BI", "Excel (pricing models)", "Mercell (public tender platform)"],
      environment: "Corporate headquarters, hybrid, with significant client-facing time and travel to key markets"
    },
    whatYouActuallyDo: [
      "You are responsible for the commercial success of the company — spanning sales, marketing, pricing, partnerships, and sometimes product commercialisation. In Norwegian companies, the Commercial Director (Kommersiell direktør) often sits on the executive leadership team and owns the go-to-market strategy across all channels.",
      "Your role is inherently cross-functional. You set pricing strategies, negotiate major contracts, evaluate new market entries, and ensure the commercial organisation is structured and incentivised to win. In industries like energy, maritime, and technology — all strong in Norway — this often involves balancing project-based and recurring revenue models."
    ],
    whoThisIsGoodFor: [
      "Commercially minded leaders who enjoy both strategy and execution",
      "People comfortable owning a broad mandate across sales, marketing, and partnerships",
      "Those who understand Norwegian public procurement and private sector dynamics",
      "Leaders who thrive in fast-moving, multi-stakeholder environments"
    ],
    topSkills: [
      "Commercial strategy and pricing",
      "P&L ownership and margin management",
      "Contract negotiation",
      "Market analysis and competitive intelligence",
      "Cross-functional leadership"
    ],
    entryPaths: [
      "Head of Sales or Sales Director broadening to include marketing and partnerships",
      "Business Development Director with strong revenue accountability",
      "Strategy or management consultant moving into commercial execution",
      "Product or marketing leader with proven revenue impact"
    ],
    realityCheck: "The breadth of this role is both its appeal and its challenge. You are stretched across many functions and cannot be an expert in all of them. Success requires excellent delegation, strong business judgment, and the ability to context-switch rapidly. In Norway, relationships matter enormously — building trust in the market takes years."
  },

  "business-development-director": {
    typicalDay: {
      morning: ["Scan market intelligence for new partnership and M&A opportunities", "Prepare pitch deck for a strategic alliance with a Norwegian energy company", "Review inbound partnership enquiries with BD team"],
      midday: ["Meeting with a potential joint venture partner's executive team", "Internal alignment call with product and engineering on co-development opportunity", "Working lunch with an industry contact from a conference"],
      afternoon: ["Financial modelling on a new market entry business case", "Update BD pipeline and report to executive team", "Draft term sheet for a technology licensing deal"],
      tools: ["PowerPoint/Google Slides", "Excel (financial modelling)", "LinkedIn", "CRM (Salesforce/HubSpot)", "Market research platforms"],
      environment: "Office-based or hybrid, with significant networking, travel, and client entertainment"
    },
    whatYouActuallyDo: [
      "You find and create new avenues of growth that do not exist in the current sales pipeline. This might mean entering a new market (e.g. expanding from Norway to Sweden), forming a strategic alliance, acquiring a complementary company, or launching a joint venture. You think in terms of 2-5 year horizons, not quarterly targets.",
      "Unlike sales, business development is about creating opportunities rather than closing transactions. You spend much of your time in the ecosystem — at conferences, in boardrooms, and on calls — connecting dots between your company's capabilities and unmet market needs. In Norway's relationship-driven business culture, your network is your most valuable asset."
    ],
    whoThisIsGoodFor: [
      "Entrepreneurial thinkers who enjoy creating something from nothing",
      "Strong networkers who build relationships naturally",
      "People comfortable with ambiguity and long time horizons",
      "Strategic minds who can see market opportunities others miss"
    ],
    topSkills: [
      "Strategic partnering and alliance management",
      "Financial modelling and business case development",
      "Negotiation and deal structuring",
      "Market analysis and opportunity identification",
      "Executive-level relationship building"
    ],
    entryPaths: [
      "Senior sales leader transitioning from deal execution to strategic growth",
      "Strategy consultant moving into industry BD leadership",
      "Product leader with strong commercial instincts",
      "Entrepreneur or startup founder joining a larger organisation"
    ],
    realityCheck: "Business development can feel intangible — you may work on a deal for a year and have it fall apart at the last minute. The ROI of your work is hard to measure in the short term, which can create tension with results-oriented executives. But when a strategic deal lands, it can transform the company's trajectory."
  },

  "strategic-partnerships-lead": {
    typicalDay: {
      morning: ["Review partner performance dashboards and joint pipeline", "Prepare for quarterly business review with a technology partner", "Coordinate with marketing on co-branded campaign for a partner launch"],
      midday: ["Lead partner enablement workshop — training partner sales teams on your solutions", "Negotiate a co-sell agreement and revenue sharing model", "Internal sync with product team on partner integration roadmap"],
      afternoon: ["Evaluate a new partner application against strategic criteria", "Draft partner business plan for executive approval", "Attend industry networking event to scout potential partners"],
      tools: ["Salesforce PRM (Partner Relationship Management)", "PowerPoint", "Excel", "Slack/Teams", "Partner portals"],
      environment: "Hybrid office with regular travel to partner offices and industry events across the Nordics"
    },
    whatYouActuallyDo: [
      "You build and manage the company's most important external partnerships — typically technology alliances, channel partnerships, or ecosystem relationships. In the Norwegian market, this might mean managing relationships with Microsoft, SAP, or AWS, or building a network of Nordic system integrators and resellers.",
      "Your work is a blend of strategy, sales, and relationship management. You identify which partnerships will drive the most value, negotiate commercial terms, enable partner teams to sell and deliver effectively, and track joint pipeline and revenue. You are the bridge between two organisations, translating each company's priorities into mutual benefit."
    ],
    whoThisIsGoodFor: [
      "Diplomatic people who excel at managing relationships across organisational boundaries",
      "Those who enjoy the puzzle of creating win-win commercial structures",
      "Patient individuals comfortable with influence rather than direct control",
      "People who are energised by ecosystem thinking and market dynamics"
    ],
    topSkills: [
      "Partner strategy and programme design",
      "Commercial negotiation and deal structuring",
      "Relationship management at scale",
      "Partner enablement and training",
      "Revenue attribution and partner analytics"
    ],
    entryPaths: [
      "Channel sales or partner manager promoted to strategic leadership",
      "Account executive with strong partner ecosystem experience",
      "Alliance manager at a technology vendor moving to a partner-led role",
      "Business development professional specialising in partnerships"
    ],
    realityCheck: "Partnerships are slow — building a productive partner relationship takes 12-18 months, and results are often shared or attributed to others. You have influence but not control, which can be frustrating. Many partnerships fail. But a well-constructed partner ecosystem can scale revenue far beyond what a direct sales team can achieve alone."
  },

  "alliances-director": {
    typicalDay: {
      morning: ["Review global alliance metrics with hyperscaler partners (AWS, Azure, Google Cloud)", "Prepare executive briefing for a joint go-to-market strategy session", "Align with regional alliance managers on pipeline contribution targets"],
      midday: ["Co-innovation workshop with partner's solution architects", "Negotiate MDF (market development funds) allocation with a tier-one partner", "Present alliance ROI analysis to Chief Commercial Officer"],
      afternoon: ["Plan partner advisory board agenda for annual summit", "Review partner certification and competency programme progress", "Strategy call with partner's Nordic alliance lead"],
      tools: ["Salesforce", "Partner portals (AWS/Microsoft/Google)", "Power BI", "Excel", "Highspot (content management)"],
      environment: "Hybrid, with significant travel to partner headquarters and regional offices, plus industry conferences"
    },
    whatYouActuallyDo: [
      "You manage the company's strategic alliances — deep, multi-faceted relationships with major technology vendors, consulting firms, or industry players. Unlike transactional partnerships, alliances involve joint investment in go-to-market, co-development of solutions, and shared executive sponsorship. Think of it as a marriage between companies.",
      "Your role is to maximise the value of these alliances by driving joint pipeline, securing partner funding, aligning product roadmaps, and maintaining executive-level relationships. In the Nordics, this often means adapting global alliance programmes to local market needs while managing partner expectations on both sides."
    ],
    whoThisIsGoodFor: [
      "Strategic thinkers who enjoy operating at the intersection of multiple organisations",
      "People with strong executive presence who can represent their company at the highest levels",
      "Those who thrive on complexity and multi-stakeholder coordination",
      "Professionals who build deep, trust-based relationships over time"
    ],
    topSkills: [
      "Alliance strategy and governance",
      "Executive relationship management",
      "Joint business planning and co-selling",
      "Partner funding and investment negotiation",
      "Ecosystem and platform strategy"
    ],
    entryPaths: [
      "Strategic partnerships lead scaling up to manage global alliances",
      "Senior sales leader transitioning to alliance management at a partner-led company",
      "Consulting firm partner leveraging deep vendor relationships",
      "Technology vendor alliance manager moving to a partner organisation"
    ],
    realityCheck: "Alliances are inherently political — you are navigating two corporate bureaucracies simultaneously. Partner priorities shift constantly, and a reorganisation on either side can undo months of work. The role requires extraordinary patience and resilience. But the best alliance directors create outsized business impact and are highly valued by leadership."
  },

  "key-account-director": {
    typicalDay: {
      morning: ["Review customer health scorecard for top-tier accounts", "Prepare for C-level relationship meeting with a key Nordic client", "Coordinate with delivery team on service improvement initiative"],
      midday: ["Lead annual strategic planning session with the client's leadership team", "Negotiate a multi-year contract renewal with enhanced scope", "Internal stakeholder alignment on client-specific investment case"],
      afternoon: ["Develop account growth roadmap with cross-sell and upsell opportunities", "Resolve an escalation on delivery quality with the operations team", "Update key account reporting for monthly executive review"],
      tools: ["Salesforce", "Power BI", "Miro (account mapping)", "Excel", "Teams/Zoom"],
      environment: "Hybrid, spending 2-3 days per week at client sites or in client-facing meetings"
    },
    whatYouActuallyDo: [
      "You own the relationship and commercial outcome for the company's most valuable clients — typically the top 5-15 accounts that represent a disproportionate share of revenue. Your focus is on long-term value creation: growing revenue, improving satisfaction, and becoming so embedded in the client's operations that switching would be unthinkable.",
      "This is a relationship-intensive role. You know your clients' business as well as they do — their strategy, their challenges, their competitive landscape. You bring ideas, not just solutions. In Norway's trust-based business culture, the personal relationship between a Key Account Director and their client's leadership can make or break the entire commercial partnership."
    ],
    whoThisIsGoodFor: [
      "Relationship-oriented professionals who invest in long-term partnerships",
      "People who enjoy deep industry expertise and client-specific knowledge",
      "Those who are both commercially driven and service-minded",
      "Leaders comfortable managing a virtual team of delivery and support resources"
    ],
    topSkills: [
      "Key account planning and management",
      "Executive relationship building",
      "Commercial negotiation and contract management",
      "Customer-centric problem solving",
      "Cross-functional team coordination"
    ],
    entryPaths: [
      "Senior account executive or account manager with a strong client portfolio",
      "Delivery or project director transitioning to a commercial role",
      "Industry specialist hired for domain expertise in a key vertical",
      "Customer success leader moving into a revenue-accountable role"
    ],
    realityCheck: "Your world revolves around a small number of clients, which means a single relationship breakdown can have outsized consequences. The role can feel isolating — you are neither fully in your company nor your client's. But the depth of insight you gain and the trust you build make it one of the most personally rewarding roles in B2B."
  },

  // ========================================
  // MARKETING (SENIOR / DIRECTOR+)
  // ========================================
  "chief-marketing-officer": {
    typicalDay: {
      morning: ["Review brand health metrics and campaign performance dashboards", "Executive team meeting on product launch strategy", "Align with CEO on company narrative and positioning for investor audience"],
      midday: ["Present marketing strategy and budget to the board", "Creative review session on major brand campaign", "Meet with agency partners on media buying strategy"],
      afternoon: ["Interview a VP-level marketing hire", "Review customer insight research with analytics team", "Strategic planning session on entering a new market segment"],
      tools: ["Google Analytics / Adobe Analytics", "Power BI", "Brandwatch", "HubSpot/Salesforce Marketing Cloud", "Boardroom presentation tools"],
      environment: "Executive floor at headquarters, frequent travel to agencies, events, and international offices"
    },
    whatYouActuallyDo: [
      "As CMO you are responsible for how the market perceives the company — the brand, the story, and the demand engine. In Norwegian companies, this means building a marketing function that balances brand building (long-term) with performance marketing (short-term), while navigating a market that values authenticity and distrusts flashy advertising.",
      "You set the marketing vision, own the budget (often NOK 20-100+ million), and are accountable for pipeline contribution to revenue. You manage a diverse team spanning brand, digital, content, PR, events, and analytics. At the executive table, you bring the voice of the customer — translating market insights into strategic decisions on product, pricing, and positioning."
    ],
    whoThisIsGoodFor: [
      "Creative strategists who can operate at both the 30,000-foot and ground level",
      "Data-literate marketers who can prove ROI to a sceptical board",
      "Leaders who understand both B2B and B2C dynamics in the Nordic market",
      "People who thrive at the intersection of art (brand) and science (performance)"
    ],
    topSkills: [
      "Brand strategy and positioning",
      "Demand generation and pipeline contribution",
      "Marketing budget management and ROI",
      "Executive communication and storytelling",
      "Digital marketing and analytics"
    ],
    entryPaths: [
      "VP Marketing promoted to CMO in a growing company",
      "Head of Brand or Head of Digital expanding to full CMO mandate",
      "Agency leader (CEO/MD) transitioning to the client side",
      "Chief Revenue Officer or commercial leader broadening to include marketing"
    ],
    realityCheck: "CMO tenure is the shortest in the C-suite — averaging 3-4 years. Marketing is often the first budget cut and the last to get credit. Proving marketing ROI to a finance-oriented board remains a constant battle. But the best CMOs are strategic architects of growth, and the role offers unmatched creative and commercial breadth."
  },

  "vp-marketing": {
    typicalDay: {
      morning: ["Review weekly marketing performance dashboard (pipeline, MQLs, spend)", "Strategy session with demand gen and content leads on campaign priorities", "Align with VP Sales on lead quality and handoff process"],
      midday: ["Present quarterly marketing plan to CMO and executive team", "Review creative assets for a major product launch", "Meet with PR agency on Nordic media strategy"],
      afternoon: ["Budget review — reallocate spend from underperforming channels", "Mentor marketing managers on career development", "Review marketing technology stack with marketing ops"],
      tools: ["HubSpot/Marketo", "Google Analytics", "Salesforce", "Semrush/Ahrefs", "Figma (creative review)"],
      environment: "Office or hybrid, managing a team of 10-30 marketers, regular travel to events and regional offices"
    },
    whatYouActuallyDo: [
      "You are the operational leader of the marketing function, translating the CMO's vision into executable plans and measurable results. You manage the day-to-day marketing engine — campaigns, content, digital channels, events, and analytics — while building and developing the marketing team.",
      "In a Nordic context, you balance global marketing programmes with local relevance, ensuring campaigns resonate in a market that values substance over hype. You are deeply involved in marketing technology decisions, data-driven optimisation, and the integration of marketing with sales through lead scoring, attribution, and shared KPIs."
    ],
    whoThisIsGoodFor: [
      "Experienced marketers who enjoy both strategy and hands-on execution",
      "Data-driven leaders who optimise campaigns based on performance metrics",
      "People managers who find fulfilment in building and developing teams",
      "Those who thrive in the fast pace of modern digital marketing"
    ],
    topSkills: [
      "Marketing strategy and planning",
      "Digital marketing and demand generation",
      "Marketing analytics and attribution",
      "Team leadership and development",
      "Marketing technology and automation"
    ],
    entryPaths: [
      "Senior Marketing Manager or Head of Digital promoted to VP",
      "Director of Demand Generation expanding to full marketing scope",
      "Marketing leader at a startup scaling into a VP role at a larger company",
      "Agency strategist transitioning to in-house marketing leadership"
    ],
    realityCheck: "You are squeezed between the CMO's vision and the team's capacity. Marketing budgets are always under scrutiny, and you are expected to do more with less. The pace is relentless — campaigns, content, events, and metrics never stop. But the variety is extraordinary, and the role builds a broad skill set that prepares you for CMO."
  },

  "growth-marketing-director": {
    typicalDay: {
      morning: ["Analyse A/B test results from landing page experiments", "Review funnel conversion metrics across acquisition channels", "Plan growth sprint priorities with the cross-functional growth team"],
      midday: ["Run a growth experiment ideation session with product and engineering", "Optimise paid acquisition campaigns based on CAC and LTV data", "Review SEO content strategy and organic traffic trends"],
      afternoon: ["Analyse user activation and retention cohorts", "Build a business case for a new referral programme", "Weekly growth metrics review with the VP Marketing"],
      tools: ["Google Analytics / Amplitude", "Google Ads / Meta Ads Manager", "Optimizely or VWO", "Mixpanel or Heap", "SQL / dbt"],
      environment: "Fast-paced office or hybrid, working closely with product and engineering teams"
    },
    whatYouActuallyDo: [
      "You drive user or revenue growth through systematic experimentation and data-driven optimisation. Unlike traditional marketing, growth marketing encompasses the full funnel — from acquisition through activation, retention, and referral. You are as likely to optimise an onboarding flow as you are to run a paid campaign.",
      "In practice, you run rapid experiments, analyse data obsessively, and scale what works. In the Nordic market, this often means optimising for smaller, high-intent audiences rather than mass-market blasts. You work at the intersection of marketing, product, and data, making this one of the most cross-functional roles in the company."
    ],
    whoThisIsGoodFor: [
      "Analytically minded marketers who love data and experimentation",
      "People who are comfortable with ambiguity and rapid iteration",
      "Those who enjoy working at the intersection of marketing, product, and engineering",
      "Creative thinkers who validate ideas with numbers, not opinions"
    ],
    topSkills: [
      "Experimentation and A/B testing",
      "Funnel analytics and conversion optimisation",
      "Paid acquisition (SEM, social, programmatic)",
      "Product-led growth strategies",
      "Data analysis (SQL, analytics tools)"
    ],
    entryPaths: [
      "Performance marketing manager with strong analytical skills expanding to full-funnel",
      "Product manager with marketing experience transitioning to growth",
      "Data analyst moving into a commercial growth role",
      "Startup growth lead joining a scale-up or enterprise"
    ],
    realityCheck: "Most experiments fail — you need to be comfortable with a 70-80% failure rate and learn from each one. Growth can plateau, and what worked last quarter may not work next quarter. The role demands constant learning and adaptability. But the direct impact on business metrics is deeply satisfying, and growth marketers are in very high demand."
  },

  "performance-marketing-director": {
    typicalDay: {
      morning: ["Review daily spend and ROAS across all paid channels", "Analyse attribution data to understand channel contribution", "Brief the paid media team on budget reallocation based on performance"],
      midday: ["Agency call on programmatic display campaign optimisation", "Present monthly paid performance report to VP Marketing", "Review landing page tests with conversion rate optimisation team"],
      afternoon: ["Negotiate annual media buying agreements with platform reps", "Plan budget for an upcoming product launch campaign", "Evaluate a new advertising platform or tool for piloting"],
      tools: ["Google Ads", "Meta Business Suite", "LinkedIn Campaign Manager", "Google Analytics / GA4", "DV360", "Supermetrics"],
      environment: "Office or hybrid, data-intensive, fast-paced with daily optimisation cycles"
    },
    whatYouActuallyDo: [
      "You own the company's paid marketing channels — search, social, display, programmatic, and sometimes offline — with a relentless focus on measurable return. Every krone you spend must be justified by data. You manage significant media budgets (often NOK 5-50 million annually) and are accountable for cost per acquisition, return on ad spend, and pipeline contribution.",
      "Your work is a blend of strategic planning (channel mix, budget allocation, audience strategy) and tactical optimisation (bid adjustments, creative testing, audience refinement). In the Nordics, you navigate a market with high digital maturity, strong privacy regulations (GDPR, cookie consent), and a relatively small but high-value audience."
    ],
    whoThisIsGoodFor: [
      "Data-obsessed marketers who love optimisation and measurable outcomes",
      "People who enjoy the fast feedback loop of digital advertising",
      "Those who are comfortable managing large budgets with P&L accountability",
      "Analytically rigorous thinkers who can also think creatively about audiences"
    ],
    topSkills: [
      "Paid media strategy and management",
      "Marketing analytics and attribution modelling",
      "Budget management and ROAS optimisation",
      "Audience targeting and segmentation",
      "Privacy-compliant marketing (GDPR)"
    ],
    entryPaths: [
      "Paid media manager or SEM specialist progressing to leadership",
      "Agency paid media director transitioning to in-house",
      "Growth marketer specialising in paid acquisition channels",
      "Digital marketing manager with strong performance focus"
    ],
    realityCheck: "Platform changes (algorithm updates, privacy regulations, cookie deprecation) can upend your strategy overnight. Ad costs in competitive Nordic markets are rising. The pressure to demonstrate ROI is constant and unforgiving. But the clarity of performance marketing is its beauty — you always know what is working, and the best practitioners are highly valued."
  },

  "global-brand-director": {
    typicalDay: {
      morning: ["Review brand tracking study results across key markets", "Align with creative agency on global campaign concept", "Provide brand guidelines feedback to a regional marketing team"],
      midday: ["Present brand strategy update to CMO and executive team", "Review sponsorship proposal from a major Nordic sports or cultural event", "Working session with product team on naming and visual identity for a new product line"],
      afternoon: ["Manage brand consistency across 15+ country marketing teams", "Review social media content calendar for brand voice alignment", "Meet with PR and communications team on brand reputation management"],
      tools: ["Brandwatch", "Bynder or Frontify (brand asset management)", "Figma", "Google Analytics", "PowerPoint"],
      environment: "Corporate headquarters or hybrid, with regular travel to key markets and agency partners"
    },
    whatYouActuallyDo: [
      "You are the guardian and architect of the company's brand across all markets and touchpoints. This means defining what the brand stands for, how it looks and sounds, and ensuring consistency whether a customer encounters it in Oslo, Singapore, or Houston. In Norwegian companies with global ambitions — think DNV, Kongsberg, or Aker — this role bridges Nordic identity with global relevance.",
      "Your work spans the strategic (brand positioning, architecture, and purpose) and the operational (brand guidelines, asset management, and approval workflows). You balance the tension between global consistency and local adaptation, working with regional teams who want to customise everything and a CEO who wants a unified brand."
    ],
    whoThisIsGoodFor: [
      "Creative strategists with a strong aesthetic sense and business acumen",
      "People who are passionate about storytelling and cultural relevance",
      "Those who enjoy working across cultures and managing global complexity",
      "Patient leaders who build brand equity over years, not weeks"
    ],
    topSkills: [
      "Brand strategy and positioning",
      "Creative direction and visual identity",
      "Global brand governance",
      "Consumer/customer insight and research",
      "Stakeholder management across cultures"
    ],
    entryPaths: [
      "Brand manager progressing through increasingly senior brand roles",
      "Creative agency strategist or planner transitioning to client side",
      "Marketing director with strong brand-building experience",
      "Communications director expanding into full brand leadership"
    ],
    realityCheck: "Brand work is long-term and its impact is hard to quantify, which makes it vulnerable to budget cuts when short-term pressures hit. You will constantly fight the battle of brand-building vs. performance marketing. Regional teams will push back on global guidelines. But a strong brand is the most durable competitive advantage, and brand directors who prove it earn enormous influence."
  },

  // ========================================
  // ENERGY, ENGINEERING & INFRASTRUCTURE
  // ========================================
  "energy-trading-manager": {
    typicalDay: {
      morning: ["Review overnight power market prices and weather forecasts across Nordic bidding zones", "Assess portfolio position and open risk exposure", "Morning briefing with trading desk on market outlook and strategy"],
      midday: ["Execute day-ahead and intraday trades on Nord Pool", "Analyse cross-border flow patterns and transmission capacity", "Meet with risk management on Value-at-Risk limits and compliance"],
      afternoon: ["Review long-term PPA (Power Purchase Agreement) pricing models", "Strategy session on renewable certificate trading (guarantees of origin)", "Report daily P&L and position summary to management"],
      tools: ["ETRM systems (Endur, Brady)", "Nord Pool trading platform", "Excel (pricing models)", "Python (quantitative analysis)", "Bloomberg Terminal"],
      environment: "Trading floor or dedicated trading office, market-hours driven (high intensity during trading windows)"
    },
    whatYouActuallyDo: [
      "You buy and sell electricity, gas, or carbon certificates in wholesale energy markets — primarily Nord Pool for the Nordic region. Your goal is to optimise the company's energy portfolio, whether that means maximising revenue from power generation, minimising procurement costs for an industrial consumer, or speculating on price movements for a trading house.",
      "The work is highly analytical and time-sensitive. You build pricing models based on hydrology, wind forecasts, demand patterns, and interconnector flows. Norway's unique position as a hydro-dominated market with growing wind capacity makes Nordic energy trading particularly interesting. You need to understand both physical energy systems and financial derivatives."
    ],
    whoThisIsGoodFor: [
      "Quantitatively strong individuals who thrive under time pressure",
      "People fascinated by energy markets, weather patterns, and geopolitics",
      "Those who enjoy the adrenaline of financial trading with physical market fundamentals",
      "Analytically rigorous thinkers comfortable with risk and uncertainty"
    ],
    topSkills: [
      "Energy market fundamentals (Nordic power system)",
      "Quantitative analysis and pricing models",
      "Risk management and portfolio optimisation",
      "ETRM systems and trading platforms",
      "Regulatory knowledge (REMIT, MiFID II)"
    ],
    entryPaths: [
      "Energy analyst or junior trader progressing through a utility or trading house",
      "Quantitative analyst from finance transitioning to energy commodities",
      "Power systems engineer with commercial interest moving to trading",
      "Economics or finance graduate joining a structured energy trading programme"
    ],
    realityCheck: "Energy trading is high-stakes — a wrong position during a price spike can cost millions. The market is volatile, especially in winters with low hydro reservoir levels. Hours are intense during trading windows, and you need to be available when markets are moving. But it is intellectually stimulating, well-compensated, and sits at the heart of Norway's energy transition."
  },

  "power-systems-architect": {
    typicalDay: {
      morning: ["Review grid stability analysis from overnight simulations", "Design high-level architecture for a new substation interconnection", "Coordinate with TSO (Statnett) on grid connection requirements"],
      midday: ["Lead technical review of power system protection scheme design", "Evaluate distributed energy resource integration scenarios", "Workshop with project engineers on voltage regulation challenges"],
      afternoon: ["Run load flow and short-circuit studies in simulation software", "Review compliance documentation for NVE regulatory submission", "Mentor junior engineers on power system modelling techniques"],
      tools: ["PSS/E or PowerFactory (DIgSILENT)", "ETAP", "AutoCAD/Revit", "MATLAB", "Excel"],
      environment: "Engineering office with periodic site visits to substations, power plants, and grid infrastructure"
    },
    whatYouActuallyDo: [
      "You design the electrical architecture of power systems — from high-voltage transmission networks to renewable energy plant connections. In Norway, this means working on a grid that is 98% renewable (primarily hydro) and increasingly integrating offshore wind, solar, and battery storage. You ensure that new generation sources, industrial loads, and grid upgrades are technically sound and meet Statnett and NVE requirements.",
      "Your work is deeply technical: load flow analysis, short-circuit calculations, protection coordination, and stability studies. But it is also strategic — you help define how the Norwegian grid evolves to accommodate electrification of transport, industry, and offshore petroleum. You bridge the gap between high-level energy policy and detailed engineering implementation."
    ],
    whoThisIsGoodFor: [
      "Engineers fascinated by large-scale electrical systems and the energy transition",
      "Analytical thinkers who enjoy complex modelling and simulation",
      "People who want their work to have direct impact on decarbonisation",
      "Those who value technical depth and are comfortable with regulatory frameworks"
    ],
    topSkills: [
      "Power system analysis (load flow, stability, protection)",
      "Grid codes and regulatory compliance (NVE, Statnett)",
      "Renewable energy integration",
      "Power system simulation software",
      "Electrical engineering fundamentals (HV/MV systems)"
    ],
    entryPaths: [
      "Electrical engineering degree (Master's from NTNU, UiB, or equivalent) with power systems specialisation",
      "Graduate programme at a TSO, DSO, or energy consulting firm",
      "Power systems engineer progressing through increasingly complex projects",
      "Research background (PhD) in power systems transitioning to industry"
    ],
    realityCheck: "The work is technically demanding and requires continuous learning as the grid evolves. Projects can take years from concept to commissioning, requiring patience. The regulatory environment is complex and sometimes slow. But power systems architects are in extraordinary demand as Norway electrifies — job security is excellent and the work is genuinely meaningful."
  },

  "grid-transformation-lead": {
    typicalDay: {
      morning: ["Review progress on grid modernisation programme milestones", "Align with Statnett on capacity allocation for a new industrial connection", "Analyse data from smart grid pilot deployments"],
      midday: ["Lead cross-functional workshop on grid digitalisation strategy", "Present business case for advanced metering infrastructure upgrade to board", "Meet with technology vendor on grid-edge computing solutions"],
      afternoon: ["Review regulatory developments from NVE on grid tariff reform", "Coordinate with DSOs on demand-side flexibility pilot programme", "Update transformation roadmap and report to programme steering committee"],
      tools: ["Microsoft Project / Jira", "Power BI", "GIS systems", "SCADA/DMS platforms", "Excel"],
      environment: "Office-based at a utility or grid company, with regular visits to grid infrastructure and stakeholder meetings"
    },
    whatYouActuallyDo: [
      "You lead the transformation of electrical grid infrastructure from a traditional centralised model to a modern, digitalised, and flexible system. In Norway, this is driven by massive electrification demand (data centres, EV charging, industrial heat), the integration of distributed renewables, and the need for grid capacity that simply does not exist today.",
      "Your role spans strategy, technology, regulation, and programme management. You develop the vision for how the grid should evolve, secure regulatory approval and funding, pilot new technologies (smart meters, grid-edge computing, battery storage), and manage the execution of multi-year transformation programmes. This is one of the most critical roles in Norway's energy transition."
    ],
    whoThisIsGoodFor: [
      "Engineers or energy professionals who want to drive systemic change",
      "Strategic thinkers comfortable managing large, complex programmes",
      "People who can navigate the intersection of technology, policy, and commercial interests",
      "Those passionate about the energy transition and grid modernisation"
    ],
    topSkills: [
      "Grid modernisation strategy and smart grid technologies",
      "Programme management and stakeholder governance",
      "Energy regulation and policy (NVE, EU Clean Energy Package)",
      "Technology evaluation and pilot management",
      "Change management and organisational transformation"
    ],
    entryPaths: [
      "Power systems engineer or grid planner with strategic programme experience",
      "Utility strategy or innovation manager stepping into transformation leadership",
      "Management consultant specialising in energy and utilities",
      "Technology leader from a smart grid or cleantech vendor"
    ],
    realityCheck: "Grid transformation is a decades-long journey with enormous bureaucratic and regulatory complexity. Permitting for new grid infrastructure in Norway can take 10+ years. Stakeholder alignment between generators, consumers, regulators, and municipalities is exhausting. But this is arguably the single most important infrastructure challenge Norway faces, and the impact is generational."
  },

  "infrastructure-program-director": {
    typicalDay: {
      morning: ["Review programme dashboard — budget, schedule, and risk status across all projects", "Escalation meeting on a delayed permitting process", "Align with portfolio steering committee on prioritisation"],
      midday: ["Site visit to a major construction milestone event", "Contract negotiation with a key EPC (engineering, procurement, construction) contractor", "Stakeholder meeting with local municipality on community impact mitigation"],
      afternoon: ["Review HSE (health, safety, environment) performance metrics", "Monthly programme report preparation for the board", "Succession planning discussion with HR for critical programme roles"],
      tools: ["Primavera P6 / Microsoft Project", "SAP (financials)", "Power BI", "SharePoint/Teams", "Procore"],
      environment: "Office-based with regular travel to project sites, often in remote locations across Norway"
    },
    whatYouActuallyDo: [
      "You oversee a portfolio of major infrastructure projects — roads, tunnels, bridges, energy facilities, or public buildings — typically worth billions of NOK combined. In Norway, this means working within the frameworks of Nye Veier, Bane NOR, Statnett, or similar agencies, navigating complex procurement processes and strict environmental regulations.",
      "Your role is to ensure projects are delivered on time, on budget, and to quality and safety standards. You manage programme-level risks, resolve cross-project dependencies, negotiate with contractors, and report to senior leadership and sometimes government stakeholders. People leadership is critical — you typically oversee multiple project directors and hundreds of indirect reports."
    ],
    whoThisIsGoodFor: [
      "Seasoned project professionals ready to lead at programme and portfolio level",
      "People who enjoy the tangible satisfaction of building physical infrastructure",
      "Leaders comfortable with high stakes, public scrutiny, and political complexity",
      "Those who can balance strategic oversight with detail when needed"
    ],
    topSkills: [
      "Programme and portfolio management",
      "Contract management (EPC, FIDIC, NS-standard)",
      "Stakeholder and government relations",
      "HSE leadership and compliance",
      "Financial control and earned value management"
    ],
    entryPaths: [
      "Project director with a track record of delivering large capital projects",
      "Senior engineer moving into programme management via PMO experience",
      "Construction manager progressing through project leadership to programme scope",
      "Management consultant specialising in capital project delivery"
    ],
    realityCheck: "Major infrastructure programmes are pressure cookers — cost overruns and delays are the norm, not the exception. Public projects attract media scrutiny and political attention. You will spend more time in meetings and on reports than you expect. But seeing a bridge open, a tunnel connect two communities, or a power line energise — that is a legacy very few careers can match."
  },

  "construction-program-director": {
    typicalDay: {
      morning: ["Safety walk on an active construction site", "Review weekly progress reports from multiple project managers", "Chair programme risk and change management meeting"],
      midday: ["Negotiate a change order with a main contractor", "Meet with the architect and client on design modifications", "Review procurement status for critical-path materials"],
      afternoon: ["Present programme status to client steering committee", "Review quality assurance documentation and inspection reports", "Plan resource allocation across concurrent construction projects"],
      tools: ["Procore", "Primavera P6 / MS Project", "BIM 360 / Revit (model reviews)", "Bluebeam Revu", "SAP"],
      environment: "Split between programme office and active construction sites, with significant outdoor exposure and travel"
    },
    whatYouActuallyDo: [
      "You direct the execution of large-scale construction programmes — commercial buildings, residential developments, hospitals, or industrial facilities. In Norway's construction sector, this means managing within strict regulations (Plan- og bygningsloven, TEK17), harsh weather conditions, and a market with labour shortages that drive up costs and timelines.",
      "Your focus is on orchestrating multiple interrelated construction projects: coordinating contractors, managing the client relationship, ensuring quality and safety, and controlling the programme budget. You are the single point of accountability for construction delivery, bridging the gap between the client's vision and the contractor's execution."
    ],
    whoThisIsGoodFor: [
      "Experienced construction professionals who thrive in dynamic, physical environments",
      "People who enjoy solving logistical puzzles and managing complexity",
      "Leaders comfortable making decisions quickly with imperfect information",
      "Those who value tangible results — buildings you can point to and say 'I built that'"
    ],
    topSkills: [
      "Construction programme management",
      "Contract and claims management (NS 8407, NS 8405)",
      "BIM coordination and digital construction",
      "HSE management on active sites",
      "Client relationship and stakeholder management"
    ],
    entryPaths: [
      "Construction project manager with 10+ years experience on major projects",
      "Site manager or construction superintendent progressing to programme level",
      "Civil or structural engineer transitioning through project management",
      "Quantity surveyor with broad project delivery experience"
    ],
    realityCheck: "Construction is one of the most stressful industries — weather delays, contractor disputes, safety incidents, and cost overruns are daily realities. The hours are long, the sites are often cold and remote, and the pressure from clients and stakeholders is intense. But building things is deeply human and satisfying, and experienced programme directors are extremely well-compensated in Norway's hot construction market."
  },

  "engineering-director": {
    typicalDay: {
      morning: ["Review engineering deliverables and milestone progress across projects", "Technical review meeting on a critical design decision", "Align with HR on engineering recruitment pipeline and hiring plan"],
      midday: ["Cross-functional meeting with project management and procurement on an EPC project", "Evaluate new engineering tools or software for the team", "Mentor a senior engineer on technical leadership development"],
      afternoon: ["Review engineering standards compliance and quality audit findings", "Budget review for engineering department resources", "Strategy session on building capability in a new technical domain (e.g. hydrogen, CCS)"],
      tools: ["AutoCAD / Revit / MicroStation", "SAP (project financials)", "Microsoft Project", "Engineering document management (Aconex, ProArc)", "Teams/Slack"],
      environment: "Engineering office with periodic site visits to projects under construction or commissioning"
    },
    whatYouActuallyDo: [
      "You lead the engineering function — typically 30-200+ engineers across multiple disciplines (civil, mechanical, electrical, process, structural). You set technical standards, allocate engineering resources to projects, and ensure design quality meets regulatory and client requirements. In Norway, this often means working in energy, maritime, construction, or process industries.",
      "The role balances technical leadership with people and business management. You hire and develop engineers, set competency frameworks, and build a culture of technical excellence. You also manage the engineering budget, negotiate with project managers on resource allocation, and represent engineering in executive leadership discussions about strategy and capability investment."
    ],
    whoThisIsGoodFor: [
      "Senior engineers who want to lead people and shape organisational capability",
      "Technical experts who can also think commercially about engineering as a business",
      "People who enjoy mentoring and developing the next generation of engineers",
      "Those who want strategic influence while maintaining connection to technical work"
    ],
    topSkills: [
      "Multi-discipline engineering leadership",
      "Technical quality and standards management",
      "Engineering resource and capacity planning",
      "People development and competency building",
      "Business acumen and P&L understanding"
    ],
    entryPaths: [
      "Principal or lead engineer progressing through team management",
      "Engineering manager at a consulting firm or operator scaling to director level",
      "Project engineering manager broadening to functional leadership",
      "Technical specialist with an MBA or management training"
    ],
    realityCheck: "You will spend more time in meetings, on budgets, and on people issues than on engineering — and that transition is hard for many technically minded people. The best engineering directors stay technically curious while delegating the detail. The role carries heavy responsibility for safety-critical design decisions. But shaping an engineering organisation and watching engineers grow is deeply fulfilling."
  },

  "asset-management-director": {
    typicalDay: {
      morning: ["Review asset performance dashboards — availability, reliability, and maintenance costs", "Prioritise capital maintenance programme based on risk and condition data", "Meet with operations team on a critical asset failure investigation"],
      midday: ["Present 10-year asset investment plan to the board", "Evaluate a predictive maintenance technology pilot", "Align with HSE on asset integrity management priorities"],
      afternoon: ["Review remaining useful life assessments for ageing infrastructure", "Contract review for a major maintenance services agreement", "Strategy session on asset digitalisation and digital twin deployment"],
      tools: ["Maximo or SAP PM (asset management)", "Power BI", "GIS systems", "Condition monitoring tools", "Excel (lifecycle cost models)"],
      environment: "Office-based with regular travel to operational assets — power plants, grid infrastructure, industrial facilities, or property portfolios"
    },
    whatYouActuallyDo: [
      "You are responsible for maximising the value and performance of the company's physical assets over their entire lifecycle. In Norway, this typically means managing portfolios of energy infrastructure (hydro plants, substations, wind farms), industrial facilities, transport infrastructure, or commercial property. Your decisions directly impact safety, reliability, and profitability.",
      "Your work involves balancing short-term operational needs with long-term investment planning. You set asset management strategy, define maintenance regimes (preventive, predictive, condition-based), manage capital investment programmes, and ensure compliance with regulatory requirements. Increasingly, you drive digitalisation — implementing sensors, data analytics, and digital twins to move from reactive to predictive asset management."
    ],
    whoThisIsGoodFor: [
      "Engineers or technical professionals who think in terms of systems and lifecycles",
      "People who enjoy making data-driven investment decisions with long-term impact",
      "Those comfortable balancing technical, financial, and safety considerations",
      "Leaders who value reliability, sustainability, and continuous improvement"
    ],
    topSkills: [
      "Asset management strategy (ISO 55000)",
      "Lifecycle cost analysis and investment planning",
      "Condition assessment and predictive maintenance",
      "Risk-based decision making",
      "Asset management systems and digital twins"
    ],
    entryPaths: [
      "Maintenance or reliability engineer progressing through asset management roles",
      "Operations manager with strong technical and financial acumen",
      "Project engineer transitioning to asset lifecycle management",
      "Management consultant specialising in asset-intensive industries"
    ],
    realityCheck: "Asset management is a long game — the decisions you make today affect performance and costs for decades. You will constantly battle short-term budget pressures against long-term asset health. Ageing infrastructure in Norway (especially hydro and grid) means difficult trade-offs between replacement and life extension. But the role is strategically critical and increasingly valued at board level."
  },

  "esg-director": {
    typicalDay: {
      morning: ["Review ESG data collection progress for annual sustainability report", "Align with CFO on EU Taxonomy alignment and CSRD reporting requirements", "Chair the company's sustainability steering committee"],
      midday: ["Present climate risk scenario analysis to the board", "Meet with supply chain team on Scope 3 emissions reduction targets", "Engage with an ESG rating agency on methodology and company submission"],
      afternoon: ["Review science-based targets (SBTi) progress and gap analysis", "Coordinate with HR on diversity and inclusion metrics", "Draft response to investor ESG questionnaire"],
      tools: ["ESG reporting platforms (Workiva, Celsia, Position Green)", "Power BI", "GHG Protocol calculation tools", "Excel", "EU Taxonomy compass"],
      environment: "Corporate headquarters, hybrid, with travel to operational sites for audits and investor/stakeholder meetings"
    },
    whatYouActuallyDo: [
      "You lead the company's environmental, social, and governance strategy — a role that has transformed from a communications exercise to a board-level strategic function. In Norway, this means navigating the EU's Corporate Sustainability Reporting Directive (CSRD), the EU Taxonomy, the Norwegian Transparency Act (Åpenhetsloven), and growing investor pressure on climate commitments.",
      "Practically, you set sustainability targets, build the data infrastructure to measure progress, engage with rating agencies and investors, and embed ESG considerations into business decisions. You work across every function — operations on emissions, HR on social metrics, procurement on supply chain due diligence, and finance on green financing. The role requires equal parts technical knowledge, strategic thinking, and stakeholder influence."
    ],
    whoThisIsGoodFor: [
      "Purpose-driven professionals who want their career to address climate and social challenges",
      "Systems thinkers comfortable working across every function in the company",
      "People who can translate complex regulation into practical business action",
      "Those with the resilience to drive change in organisations that may resist it"
    ],
    topSkills: [
      "ESG strategy and reporting frameworks (GRI, CSRD, TCFD)",
      "Climate risk analysis and carbon accounting",
      "Regulatory compliance (EU Taxonomy, Åpenhetsloven)",
      "Stakeholder engagement (investors, rating agencies, NGOs)",
      "Cross-functional influence and change management"
    ],
    entryPaths: [
      "Sustainability manager or CSR lead progressing to director level",
      "Management consultant specialising in sustainability strategy",
      "Environmental engineer or climate scientist transitioning to corporate ESG",
      "Finance professional with ESG integration experience (e.g. from an investment firm)"
    ],
    realityCheck: "ESG is one of the fastest-evolving fields — regulation changes quarterly, frameworks multiply, and stakeholder expectations keep rising. You will face scepticism from those who see ESG as a cost centre, and accusations of greenwashing from those who think you are not doing enough. Data quality is a constant struggle. But the role sits at the heart of the most important business transformation of our generation."
  },

  // ========================================
  // LOGISTICS & SUPPLY CHAIN (SENIOR / DIRECTOR+)
  // ========================================
  "supply-chain-director": {
    typicalDay: {
      morning: ["Review supply chain KPIs — on-time delivery, inventory turns, and logistics costs", "Assess supply disruption risk from a critical supplier", "Daily planning meeting with procurement, logistics, and warehouse leads"],
      midday: ["Negotiate annual framework agreement with a key logistics provider", "Present supply chain optimisation business case to executive team", "Review S&OP (Sales and Operations Planning) demand forecast with commercial team"],
      afternoon: ["Evaluate a supply chain digitalisation proposal (control tower, AI forecasting)", "Meet with sustainability team on Scope 3 supply chain emissions", "Conduct quarterly performance review with the supply chain leadership team"],
      tools: ["SAP SCM / S/4HANA", "Blue Yonder or Kinaxis (planning)", "Power BI", "Transport management systems (TMS)", "Excel"],
      environment: "Corporate office with regular visits to warehouses, distribution centres, and supplier facilities across Norway and internationally"
    },
    whatYouActuallyDo: [
      "You own the end-to-end supply chain — from raw material sourcing through production planning, warehousing, and distribution to the end customer. In Norway, this often means managing supply chains with unique challenges: long distances, harsh weather, complex logistics (fjords, islands, Arctic regions), and a high-cost labour market that demands efficiency.",
      "Your role is to ensure the right products are in the right place at the right time, at the lowest possible cost, while maintaining quality and sustainability standards. You balance competing priorities — low inventory vs. high availability, cost efficiency vs. resilience, speed vs. sustainability. Increasingly, you drive digitalisation and supply chain visibility across the entire value chain."
    ],
    whoThisIsGoodFor: [
      "Operationally minded leaders who enjoy optimising complex systems",
      "People who thrive on solving logistics puzzles with data and technology",
      "Those comfortable managing large teams and multiple functional areas",
      "Leaders who enjoy the tangible, physical nature of moving goods and materials"
    ],
    topSkills: [
      "End-to-end supply chain management",
      "S&OP and demand planning",
      "Procurement and supplier management",
      "Supply chain analytics and digitalisation",
      "Lean operations and continuous improvement"
    ],
    entryPaths: [
      "Supply chain or logistics manager progressing through increasingly complex operations",
      "Procurement director broadening to end-to-end supply chain leadership",
      "Operations manager in manufacturing transitioning to supply chain strategy",
      "Management consultant specialising in supply chain and operations"
    ],
    realityCheck: "Supply chains break — disruptions from weather, geopolitics, supplier failures, and demand volatility are constant. You are only noticed when something goes wrong, rarely when everything works smoothly. The hours can be unpredictable, especially during crises. But supply chain excellence is a genuine competitive advantage, and the role is increasingly recognised at board level as strategic rather than operational."
  },
  "medical-affairs-director": {
    typicalDay: {
      morning: ["Review clinical data packages", "Meet with regulatory affairs team", "Align on medical strategy with leadership"],
      midday: ["Advisory board preparation", "KOL engagement calls", "Review medical information requests"],
      afternoon: ["Cross-functional pipeline meetings", "Publication planning review", "Mentor medical science liaisons"],
      tools: ["Veeva Vault", "PubMed", "Power BI", "Microsoft Teams"],
      environment: "Office-based at pharma headquarters with frequent travel to conferences and hospital sites across the Nordics.",
    },
    whatYouActuallyDo: [
      "You bridge the gap between clinical science and commercial strategy, ensuring medical evidence supports product decisions and that healthcare professionals get accurate, balanced information.",
      "In Norway, you work closely with Legemiddelverket (NoMA) and hospital specialists, often navigating Nye Metoder processes for drug reimbursement decisions.",
    ],
    whoThisIsGoodFor: ["Strong scientific communicators", "Strategic thinkers with medical backgrounds", "People who enjoy influencing without direct authority", "Those comfortable with regulatory complexity"],
    topSkills: ["Clinical data interpretation", "Stakeholder management", "Regulatory strategy", "Scientific communication", "Cross-functional leadership"],
    entryPaths: ["MD or PhD with pharma industry experience", "Medical Science Liaison progressing to management", "Clinical research director transitioning to medical affairs"],
    realityCheck: "You need deep scientific credibility and patience for slow regulatory processes; this is not a fast-paced startup role.",
  },
  "clinical-operations-director": {
    typicalDay: {
      morning: ["Review trial enrollment dashboards", "Escalation calls with CROs", "Budget variance analysis"],
      midday: ["Protocol amendment discussions", "Site performance reviews", "Risk mitigation planning"],
      afternoon: ["Vendor governance meetings", "Resource forecasting", "Team development check-ins"],
      tools: ["Medidata Rave", "Oracle Clinical", "Smartsheet", "Veeva CTMS"],
      environment: "Hybrid office environment at pharma or CRO headquarters, with travel to clinical trial sites and investigator meetings.",
    },
    whatYouActuallyDo: [
      "You oversee the operational execution of clinical trials from study start-up through close-out, managing timelines, budgets, vendors, and cross-functional teams to deliver quality data on schedule.",
      "In the Nordics, you leverage the region's strong patient registries and collaborative healthcare systems to run efficient trials, often coordinating across multiple Scandinavian sites.",
    ],
    whoThisIsGoodFor: ["Detail-oriented project leaders", "People who thrive under regulatory scrutiny", "Strong negotiators with vendor management skills", "Those who enjoy complex logistics"],
    topSkills: ["Clinical trial management", "GCP/ICH compliance", "Vendor oversight", "Risk-based monitoring", "Budget management"],
    entryPaths: ["Clinical Research Associate advancing through CRA lead roles", "Project manager from CRO transitioning to sponsor side", "PhD with clinical operations training program experience"],
    realityCheck: "Expect constant firefighting on timelines and enrollment; trials rarely go exactly as planned.",
  },
  "pharmaceutical-program-director": {
    typicalDay: {
      morning: ["Portfolio prioritization review", "Cross-functional program team standup", "Regulatory milestone tracking"],
      midday: ["Executive steering committee preparation", "Risk and issue log review", "Alliance management calls"],
      afternoon: ["Resource allocation discussions", "Stage-gate readiness assessments", "Strategic planning workshops"],
      tools: ["Planisware", "Microsoft Project", "Power BI", "SharePoint"],
      environment: "Corporate pharma office with significant time in cross-functional meetings and periodic travel to partner sites and regulatory agencies.",
    },
    whatYouActuallyDo: [
      "You drive entire drug development programs from early development through commercialization, integrating clinical, regulatory, manufacturing, and commercial workstreams into a cohesive strategy.",
      "In Norway's pharma landscape, you often manage partnerships with Nordic biotech firms and coordinate submissions to EMA alongside national regulatory bodies.",
    ],
    whoThisIsGoodFor: ["Big-picture strategists", "People who can manage ambiguity in long timelines", "Strong communicators across scientific and business audiences", "Those who enjoy orchestrating complex programs"],
    topSkills: ["Program management", "Drug development lifecycle", "Stakeholder alignment", "Strategic planning", "Risk management"],
    entryPaths: ["Senior project manager in pharma R&D", "Clinical operations director broadening scope", "Management consulting in life sciences transitioning in-house"],
    realityCheck: "Programs span 5-10+ years with high failure rates; you need resilience and comfort with pivoting strategy when data disappoints.",
  },
  "biotech-rd-director": {
    typicalDay: {
      morning: ["Lab leadership meeting", "Review experimental data from platform teams", "IP strategy discussion with patent counsel"],
      midday: ["Scientific advisory board prep", "Grant and funding applications review", "Collaboration calls with academic partners"],
      afternoon: ["Pipeline review with CEO", "Talent development planning", "Publication and conference strategy"],
      tools: ["GraphPad Prism", "Benchling", "Dotmatics", "Slack"],
      environment: "Split between lab and office in a biotech company, often located near university hospital clusters like those in Oslo or Trondheim.",
    },
    whatYouActuallyDo: [
      "You lead the scientific direction of a biotech company's R&D pipeline, making critical decisions about which programs to advance, partner, or terminate based on data and strategic fit.",
      "Norwegian biotechs often focus on niche therapeutic areas like oncology or rare diseases, and you'll work closely with Innovation Norway and the Research Council for funding.",
    ],
    whoThisIsGoodFor: ["Scientists who want business impact", "People who enjoy building teams and culture", "Strategic minds with deep domain expertise", "Those comfortable with high-risk, high-reward environments"],
    topSkills: ["Scientific leadership", "Pipeline strategy", "Fundraising and investor relations", "Team building", "Translational research"],
    entryPaths: ["Senior scientist or lab head moving into management", "Academic PI transitioning to industry", "Pharma R&D leader joining a smaller biotech"],
    realityCheck: "Biotech R&D is capital-intensive and uncertain; you may spend years on a program that ultimately fails in clinical trials.",
  },
  "healthtech-product-director": {
    typicalDay: {
      morning: ["Product metrics review", "Sprint planning with engineering", "User research synthesis"],
      midday: ["Clinical workflow mapping with hospital stakeholders", "Regulatory compliance check for medical device software", "Roadmap prioritization"],
      afternoon: ["Demo preparation for health authority pilots", "Partner integration discussions", "Team retrospective"],
      tools: ["Jira", "Figma", "Amplitude", "Miro"],
      environment: "Modern tech office or hybrid setup, with regular visits to hospitals and health authorities to understand clinical workflows.",
    },
    whatYouActuallyDo: [
      "You define and drive the product vision for digital health solutions, balancing clinical utility, regulatory requirements, and user experience to build tools that healthcare professionals actually want to use.",
      "In Norway, you work within the Helse Norge ecosystem, integrating with platforms like Helsenorge.no and navigating procurement through regional health authorities (RHF).",
    ],
    whoThisIsGoodFor: ["Tech-savvy people passionate about healthcare impact", "Product thinkers who enjoy regulated environments", "Those who can translate clinical needs into product features", "Patient advocates with business acumen"],
    topSkills: ["Product strategy", "Healthcare domain knowledge", "UX research", "Regulatory awareness (MDR/IVDR)", "Stakeholder management"],
    entryPaths: ["Senior product manager in health tech scaling up", "Clinical informaticist moving into product leadership", "Tech product leader transitioning into health sector"],
    realityCheck: "Healthcare adoption is slow and procurement cycles are long; you need patience and persistence to see your product used at scale.",
  },
  "senior-software-engineer": {
    typicalDay: {
      morning: ["Code review pull requests", "Architecture discussion for new feature", "Daily standup"],
      midday: ["Deep coding session on core functionality", "Pair programming with junior developer", "Debug production issue"],
      afternoon: ["Write technical documentation", "Mentor team members", "Evaluate new libraries or tools"],
      tools: ["VS Code", "Git", "Docker", "Jira"],
      environment: "Hybrid or remote-friendly setup common in Nordic tech companies, with open collaborative office spaces available.",
    },
    whatYouActuallyDo: [
      "You design and build complex software systems, make key technical decisions, and raise the engineering quality bar through code reviews, mentoring, and architectural guidance.",
      "Norway's tech scene spans fintech (Vipps, DNB), energy tech, and maritime software, offering senior engineers diverse and well-compensated opportunities.",
    ],
    whoThisIsGoodFor: ["Deep problem solvers", "People who love writing clean, maintainable code", "Those who enjoy mentoring and elevating teams", "Self-directed learners"],
    topSkills: ["System design", "Code quality and testing", "Performance optimization", "Technical communication", "Debugging complex systems"],
    entryPaths: ["Mid-level developer with 5+ years advancing through IC track", "Bootcamp graduate with strong portfolio and progression", "Computer science degree with continuous skill growth"],
    realityCheck: "You're expected to independently drive technical decisions and unblock others, not just write code assigned to you.",
  },
  "backend-engineer-distributed": {
    typicalDay: {
      morning: ["Monitor distributed system health dashboards", "Design review for new microservice", "Standup with platform team"],
      midday: ["Implement event-driven architecture components", "Write integration tests for distributed workflows", "Troubleshoot inter-service communication issues"],
      afternoon: ["Capacity planning discussion", "Document API contracts", "Chaos engineering experiment review"],
      tools: ["Kafka", "Kubernetes", "gRPC", "Datadog"],
      environment: "Tech company office or fully remote, working on systems that handle high throughput and need strong reliability guarantees.",
    },
    whatYouActuallyDo: [
      "You build and maintain backend systems that operate across multiple services and nodes, solving challenges like consistency, fault tolerance, and scalability in distributed environments.",
      "Nordic companies in payments (Klarna, Vipps), streaming, and logistics need distributed systems engineers who can handle real-time processing at scale.",
    ],
    whoThisIsGoodFor: ["Systems thinkers who enjoy complexity", "People fascinated by consistency and reliability tradeoffs", "Engineers who like debugging hard production issues", "Those comfortable with uncertainty in distributed state"],
    topSkills: ["Distributed systems design", "Event-driven architecture", "Consensus protocols", "Observability", "Performance tuning"],
    entryPaths: ["Backend developer specializing in scalability challenges", "Systems engineer from cloud infrastructure background", "CS graduate with distributed systems coursework and projects"],
    realityCheck: "Debugging distributed systems is genuinely hard; issues are often intermittent, and you'll spend significant time on observability and tooling.",
  },
  "cloud-architect": {
    typicalDay: {
      morning: ["Review cloud cost optimization reports", "Architecture review board meeting", "Security posture assessment"],
      midday: ["Design multi-region deployment strategy", "Evaluate managed service options", "Terraform module development"],
      afternoon: ["Workshop with development teams on cloud patterns", "Disaster recovery planning", "Vendor relationship management"],
      tools: ["AWS/Azure/GCP Console", "Terraform", "Kubernetes", "CloudFormation"],
      environment: "Hybrid office setting in a consultancy or enterprise IT department, with cross-team collaboration and occasional client site visits.",
    },
    whatYouActuallyDo: [
      "You design and govern cloud infrastructure strategies that balance cost, security, performance, and compliance, making decisions that affect how the entire organization builds and deploys software.",
      "Norwegian enterprises, especially in finance and public sector, need cloud architects who understand data sovereignty requirements and can work within GDPR and Schrems II constraints.",
    ],
    whoThisIsGoodFor: ["Big-picture infrastructure thinkers", "People who enjoy balancing technical and business tradeoffs", "Those who like setting standards others follow", "Engineers who want breadth over depth"],
    topSkills: ["Cloud platform expertise (AWS/Azure/GCP)", "Infrastructure as Code", "Security and compliance", "Cost optimization", "Solution architecture"],
    entryPaths: ["Senior DevOps or infrastructure engineer advancing to architecture", "Solutions architect at a cloud provider", "Enterprise architect adding deep cloud specialization"],
    realityCheck: "You'll spend more time in meetings and producing architecture documents than writing code; this is a leadership and governance role.",
  },
  "infrastructure-architect": {
    typicalDay: {
      morning: ["Capacity planning review", "Network topology design session", "Incident postmortem review"],
      midday: ["Data center strategy discussion", "Hybrid cloud integration planning", "Vendor evaluation for compute platforms"],
      afternoon: ["Infrastructure standards documentation", "Team mentoring", "Budget forecasting for infrastructure investments"],
      tools: ["VMware vSphere", "Terraform", "Ansible", "Zabbix"],
      environment: "Enterprise IT department or managed services provider, with occasional data center visits and mostly office-based or hybrid work.",
    },
    whatYouActuallyDo: [
      "You design the foundational technology infrastructure that applications run on, encompassing compute, storage, networking, and hybrid cloud strategies for the organization.",
      "In Norway, infrastructure architects in sectors like energy (Equinor), finance, and government must navigate strict data residency rules and ensure robust disaster recovery across Nordic locations.",
    ],
    whoThisIsGoodFor: ["Engineers who think in systems and dependencies", "People who enjoy long-term planning over quick sprints", "Those who like hardware and software intersection", "Detail-oriented planners"],
    topSkills: ["Data center design", "Network architecture", "Hybrid cloud strategy", "Capacity planning", "Vendor management"],
    entryPaths: ["Senior systems administrator evolving into architecture", "Network engineer broadening to full infrastructure scope", "Cloud architect adding on-premises expertise"],
    realityCheck: "Infrastructure decisions have multi-year consequences and are expensive to reverse; expect thorough review processes and slow organizational change.",
  },
  "senior-sre": {
    typicalDay: {
      morning: ["Review overnight alerts and SLO dashboards", "Incident response triage", "Reliability review for upcoming release"],
      midday: ["Automate toil reduction tasks", "Develop monitoring and alerting improvements", "Chaos engineering experiments"],
      afternoon: ["Postmortem facilitation", "Capacity planning", "On-call rotation handoff and documentation"],
      tools: ["Prometheus", "Grafana", "PagerDuty", "Terraform"],
      environment: "Tech company with on-call rotation responsibilities, hybrid or remote work with strong async communication culture.",
    },
    whatYouActuallyDo: [
      "You ensure production systems are reliable, scalable, and observable by applying software engineering principles to operations problems, reducing toil through automation.",
      "Nordic tech companies like Schibsted, Finn.no, and Vipps rely on SREs to maintain high availability for services used by millions of Scandinavian users daily.",
    ],
    whoThisIsGoodFor: ["People who enjoy firefighting and then preventing the next fire", "Engineers who love automation and tooling", "Those comfortable with on-call responsibilities", "Systems thinkers with coding skills"],
    topSkills: ["Incident management", "Observability and monitoring", "Automation scripting", "Linux systems administration", "SLO/SLI design"],
    entryPaths: ["Systems administrator transitioning to SRE methodology", "Backend developer moving into reliability focus", "DevOps engineer deepening SRE practices"],
    realityCheck: "On-call rotations are real and can disrupt your personal life; you need to genuinely enjoy keeping systems running under pressure.",
  },
  "senior-devops-engineer": {
    typicalDay: {
      morning: ["CI/CD pipeline maintenance", "Review infrastructure pull requests", "Sprint planning with platform team"],
      midday: ["Build container orchestration improvements", "Implement GitOps workflows", "Security scanning integration"],
      afternoon: ["Developer experience improvements", "Cost monitoring and optimization", "Knowledge sharing session"],
      tools: ["Jenkins/GitHub Actions", "Docker", "Kubernetes", "ArgoCD"],
      environment: "Tech or enterprise company with a platform or DevOps team, hybrid work with strong collaboration needs across development teams.",
    },
    whatYouActuallyDo: [
      "You build and maintain the platforms, pipelines, and tooling that enable development teams to ship software quickly and safely, focusing on automation, reliability, and developer experience.",
      "Norwegian companies increasingly adopt platform engineering approaches, and DevOps engineers here often work across small, cross-functional teams in flat organizational structures.",
    ],
    whoThisIsGoodFor: ["Automation enthusiasts", "People who enjoy enabling other developers", "Engineers who like breadth across the stack", "Those who thrive on continuous improvement"],
    topSkills: ["CI/CD pipeline design", "Container orchestration", "Infrastructure as Code", "Cloud platforms", "Scripting and automation"],
    entryPaths: ["Software developer moving into infrastructure", "Systems administrator adopting DevOps practices", "Cloud engineer specializing in deployment automation"],
    realityCheck: "You'll be the bottleneck others depend on; expect interruptions and context-switching as teams need pipeline and infrastructure help.",
  },
  "security-architect": {
    typicalDay: {
      morning: ["Threat modeling session for new application", "Security architecture review", "Compliance framework mapping"],
      midday: ["Zero trust architecture design", "Vendor security assessment", "Incident response plan update"],
      afternoon: ["Security awareness training development", "Cloud security posture review", "Board-level risk report preparation"],
      tools: ["SIEM (Splunk/Sentinel)", "Threat modeling tools", "CIS Benchmarks", "Azure Security Center"],
      environment: "Enterprise security team within finance, energy, or public sector, mostly office-based with high confidentiality requirements.",
    },
    whatYouActuallyDo: [
      "You design the security architecture for an organization, defining how systems, networks, and data are protected through technical controls, policies, and frameworks.",
      "In Norway, security architects are in high demand in critical infrastructure sectors like energy, finance, and defense, with NSM (Nasjonal sikkerhetsmyndighet) guidelines shaping security requirements.",
    ],
    whoThisIsGoodFor: ["Strategic thinkers with deep technical security knowledge", "People who enjoy risk analysis and threat modeling", "Those who can communicate security to non-technical leaders", "Engineers who think like attackers"],
    topSkills: ["Threat modeling", "Zero trust architecture", "Cloud security", "Compliance frameworks (ISO 27001, NIST)", "Risk assessment"],
    entryPaths: ["Senior security engineer advancing to architecture", "Network architect specializing in security", "Penetration tester broadening to defensive architecture"],
    realityCheck: "You'll often be seen as the person who slows things down; success means finding secure solutions that don't block the business.",
  },
  "application-security-lead": {
    typicalDay: {
      morning: ["SAST/DAST scan results review", "Secure code review", "Threat modeling for new feature"],
      midday: ["Developer security training session", "Vulnerability prioritization meeting", "Security champion program coordination"],
      afternoon: ["Security testing automation improvements", "Third-party library risk assessment", "Incident response for application vulnerability"],
      tools: ["Snyk", "SonarQube", "Burp Suite", "GitHub Advanced Security"],
      environment: "Tech company or enterprise with a dedicated application security team, working closely with development teams in hybrid settings.",
    },
    whatYouActuallyDo: [
      "You lead the effort to secure applications throughout the software development lifecycle, embedding security practices into development workflows rather than bolting them on afterward.",
      "Norwegian tech companies building financial services, health platforms, and public-facing applications need AppSec leads who can shift security left without slowing product delivery.",
    ],
    whoThisIsGoodFor: ["Developers who became passionate about security", "People who enjoy teaching and influencing culture", "Those who like finding and fixing vulnerabilities systematically", "Bridge-builders between security and engineering"],
    topSkills: ["Secure SDLC", "Vulnerability assessment", "Secure coding practices", "DevSecOps", "Security training and advocacy"],
    entryPaths: ["Software developer with growing security focus", "Penetration tester moving into AppSec", "Security engineer specializing in application layer"],
    realityCheck: "You need developer empathy and communication skills as much as security expertise; nobody listens to the security person who only says no.",
  },
  "offensive-security-engineer": {
    typicalDay: {
      morning: ["Reconnaissance and target scoping", "Exploit development", "Red team operation planning"],
      midday: ["Penetration testing execution", "Social engineering campaign design", "Vulnerability chain analysis"],
      afternoon: ["Report writing with remediation guidance", "Purple team exercise with defenders", "Tool and technique research"],
      tools: ["Metasploit", "Burp Suite", "Cobalt Strike", "Kali Linux"],
      environment: "Security consultancy or in-house red team, with a mix of remote work and on-site engagements for physical security assessments.",
    },
    whatYouActuallyDo: [
      "You simulate real-world attackers to find vulnerabilities in systems, networks, and applications before malicious actors do, then help organizations fix what you find.",
      "Norway's critical infrastructure in oil and gas, maritime, and finance creates strong demand for offensive security professionals, with firms like mnemonic and Netsecurity leading the market.",
    ],
    whoThisIsGoodFor: ["Creative problem solvers with hacker mindsets", "People who enjoy puzzle-solving and breaking things", "Those who stay current with evolving attack techniques", "Detail-oriented reporters who can explain findings clearly"],
    topSkills: ["Penetration testing", "Exploit development", "Network security", "Web application security", "Report writing"],
    entryPaths: ["Security analyst with CTF competition background", "Systems administrator who learned offensive techniques", "Computer science graduate with security certifications (OSCP)"],
    realityCheck: "The glamorous hacking is maybe 40% of the job; the rest is scoping, reporting, and convincing clients to actually fix things.",
  },
  "senior-network-architect": {
    typicalDay: {
      morning: ["Network topology review", "BGP peering optimization", "SD-WAN strategy planning"],
      midday: ["Firewall rule audit", "Network segmentation design", "Capacity forecasting"],
      afternoon: ["Vendor evaluation for switching and routing", "Disaster recovery network planning", "Mentor network engineers"],
      tools: ["Cisco DNA Center", "Palo Alto Panorama", "Wireshark", "NetBox"],
      environment: "Enterprise IT or telecom company, with occasional data center and site visits alongside office-based design and planning work.",
    },
    whatYouActuallyDo: [
      "You design and govern enterprise network architectures including LAN, WAN, data center networking, and cloud connectivity, ensuring performance, security, and resilience.",
      "Norway's geography creates unique networking challenges with remote locations in oil platforms, shipping, and northern regions requiring robust and often satellite-augmented connectivity.",
    ],
    whoThisIsGoodFor: ["Engineers who love networking protocols at a deep level", "Planners who think about reliability and redundancy", "Those who enjoy complex troubleshooting", "People who like both physical and logical infrastructure"],
    topSkills: ["Network design (LAN/WAN/DC)", "Routing protocols (BGP, OSPF)", "Network security", "SD-WAN/SASE", "Capacity planning"],
    entryPaths: ["Senior network engineer advancing to architecture", "Systems engineer specializing in networking", "Telecom engineer transitioning to enterprise networking"],
    realityCheck: "Network architecture is foundational but often invisible until something breaks; expect to justify budgets for infrastructure people take for granted.",
  },
  "systems-architect": {
    typicalDay: {
      morning: ["Architecture decision records review", "System integration design session", "Technical debt assessment"],
      midday: ["Cross-team alignment on platform standards", "Evaluate build vs. buy options", "API design review"],
      afternoon: ["Technology radar update", "Stakeholder presentation on architecture roadmap", "Proof of concept evaluation"],
      tools: ["Lucidchart", "Confluence", "C4 Model tools", "PlantUML"],
      environment: "Large enterprise or consultancy, working across multiple teams and systems with significant time spent in collaborative design sessions.",
    },
    whatYouActuallyDo: [
      "You design the overall structure of complex software systems, making high-level decisions about technology choices, integration patterns, and system boundaries that shape how teams build and evolve products.",
      "In Norway's enterprise landscape, systems architects work across sectors like public administration (Altinn), banking, and energy, often managing complex legacy modernization programs.",
    ],
    whoThisIsGoodFor: ["Big-picture technical thinkers", "People who enjoy making decisions that affect many teams", "Strong communicators who can justify technical choices", "Engineers who prefer breadth and influence over deep coding"],
    topSkills: ["System design and decomposition", "Integration patterns", "Technology evaluation", "Stakeholder communication", "Architecture governance"],
    entryPaths: ["Senior developer with cross-system experience", "Solutions architect broadening to enterprise scope", "Tech lead evolving into architecture focus"],
    realityCheck: "Your influence is indirect; you design the blueprint but rely on teams to implement it correctly, which requires strong persuasion and relationship skills.",
  },
  "senior-data-engineer": {
    typicalDay: {
      morning: ["Monitor data pipeline health", "Debug failed ETL jobs", "Data quality checks"],
      midday: ["Design new data pipeline for analytics team", "Optimize query performance", "Schema evolution planning"],
      afternoon: ["Data governance meeting", "Implement streaming data ingestion", "Code review for data platform team"],
      tools: ["Apache Spark", "dbt", "Airflow", "Snowflake"],
      environment: "Tech or data-driven company, hybrid work with close collaboration with data scientists, analysts, and backend engineers.",
    },
    whatYouActuallyDo: [
      "You build and maintain the data infrastructure that enables analytics, machine learning, and business intelligence, designing pipelines that reliably transform raw data into usable datasets.",
      "Norwegian companies in energy, finance, and e-commerce generate massive datasets, and data engineers here often work with both cloud platforms and on-premises systems due to data sovereignty requirements.",
    ],
    whoThisIsGoodFor: ["Engineers who enjoy building reliable, scalable systems", "People who like making data accessible to others", "Those who enjoy pipeline architecture and optimization", "Problem solvers comfortable with messy real-world data"],
    topSkills: ["Data pipeline design", "SQL and data modeling", "Distributed computing", "Data quality and governance", "Cloud data platforms"],
    entryPaths: ["Backend developer specializing in data systems", "Data analyst learning engineering skills", "CS graduate focusing on data infrastructure"],
    realityCheck: "Much of your time will be spent on data quality issues and fixing broken pipelines rather than building elegant new architectures.",
  },
  "machine-learning-engineer": {
    typicalDay: {
      morning: ["Model performance monitoring", "Feature engineering exploration", "ML pipeline debugging"],
      midday: ["Model training and experimentation", "A/B test analysis for model changes", "Collaboration with data scientists on model deployment"],
      afternoon: ["MLOps infrastructure improvements", "Model serving optimization", "Documentation and reproducibility work"],
      tools: ["PyTorch/TensorFlow", "MLflow", "Kubeflow", "Feature stores (Feast)"],
      environment: "Tech company or R&D team, hybrid work with GPU cluster access and cloud ML platforms for training and serving.",
    },
    whatYouActuallyDo: [
      "You bridge the gap between ML research and production, building the infrastructure and pipelines that take models from experimentation to reliable, scalable deployment.",
      "In the Nordics, ML engineers work across recommendation systems (Schibsted), autonomous shipping (Kongsberg), energy optimization (Equinor), and fintech fraud detection.",
    ],
    whoThisIsGoodFor: ["Engineers who love both software and mathematics", "People who enjoy making research practical", "Those comfortable with experimentation and iteration", "Builders who care about production reliability"],
    topSkills: ["ML frameworks (PyTorch/TensorFlow)", "MLOps and model serving", "Feature engineering", "Distributed training", "Software engineering best practices"],
    entryPaths: ["Software engineer adding ML specialization", "Data scientist learning production engineering", "CS/ML graduate with strong engineering fundamentals"],
    realityCheck: "Most of your time is spent on data pipelines, feature engineering, and infrastructure rather than designing novel model architectures.",
  },
  "applied-ai-engineer": {
    typicalDay: {
      morning: ["Evaluate new foundation models for use cases", "Prompt engineering and testing", "Review LLM output quality metrics"],
      midday: ["Build RAG pipeline for domain-specific knowledge", "Fine-tuning experiments", "Integration with product features"],
      afternoon: ["Safety and bias evaluation", "Demo to product stakeholders", "Cost optimization for inference"],
      tools: ["OpenAI/Anthropic APIs", "LangChain", "Vector databases (Pinecone/Weaviate)", "Python"],
      environment: "Fast-paced product team integrating AI capabilities, hybrid or remote work with rapid prototyping and iteration cycles.",
    },
    whatYouActuallyDo: [
      "You apply state-of-the-art AI models, especially large language models, to solve real product problems, focusing on practical integration, quality, and reliability rather than fundamental research.",
      "Norwegian companies in legal tech, public services, and enterprise software are rapidly adopting AI, and applied AI engineers here must navigate multilingual challenges including Norwegian Bokmal and Nynorsk.",
    ],
    whoThisIsGoodFor: ["Pragmatic engineers excited about AI applications", "People who enjoy rapid prototyping", "Those who care about responsible AI deployment", "Creative problem solvers who think in terms of user value"],
    topSkills: ["LLM integration and prompt engineering", "RAG architectures", "Python and API development", "Evaluation and quality metrics", "AI safety and ethics"],
    entryPaths: ["Software engineer learning AI integration", "Data scientist pivoting to applied AI", "ML engineer focusing on LLM applications"],
    realityCheck: "The field moves extremely fast; what you learn today may be obsolete in six months, and managing AI output quality is harder than it looks.",
  },
  "senior-data-scientist": {
    typicalDay: {
      morning: ["Exploratory data analysis", "Stakeholder meeting to define business problem", "Review experiment results"],
      midday: ["Statistical modeling and hypothesis testing", "Feature engineering", "Present findings to product team"],
      afternoon: ["Model validation and documentation", "Collaborate with data engineers on data needs", "Mentor junior data scientists"],
      tools: ["Python (pandas, scikit-learn)", "Jupyter Notebooks", "SQL", "Tableau/Power BI"],
      environment: "Analytics or product team in a data-driven company, hybrid work with regular cross-functional collaboration.",
    },
    whatYouActuallyDo: [
      "You use statistical methods and machine learning to extract insights from data, build predictive models, and help organizations make better decisions based on evidence rather than intuition.",
      "In Norway, data scientists work in energy forecasting, fisheries optimization, financial risk modeling, and public health analytics, often with high-quality Nordic registry data.",
    ],
    whoThisIsGoodFor: ["Curious analytical minds", "People who enjoy storytelling with data", "Those who like both technical depth and business context", "Strong communicators with quantitative backgrounds"],
    topSkills: ["Statistical modeling", "Machine learning", "Data visualization", "Experimental design", "Business problem framing"],
    entryPaths: ["Analyst with growing modeling skills", "PhD in quantitative field transitioning to industry", "Software engineer adding statistical and ML expertise"],
    realityCheck: "Expect to spend 60-70% of your time on data cleaning and stakeholder alignment rather than building sophisticated models.",
  },
  "principal-data-scientist": {
    typicalDay: {
      morning: ["Define data science strategy for the org", "Review technical approaches across teams", "Advise leadership on AI investment"],
      midday: ["Deep-dive on complex modeling challenge", "Cross-functional alignment on metrics framework", "External partnership evaluation"],
      afternoon: ["Publish internal research findings", "Hiring and team development", "Conference talk preparation"],
      tools: ["Python", "Spark", "Experiment tracking platforms", "Presentation tools"],
      environment: "Senior technical leadership position in a large organization, with significant influence on strategy and direction.",
    },
    whatYouActuallyDo: [
      "You set the technical vision for data science across the organization, tackle the hardest problems personally, and multiply impact by raising the bar for the entire data science function.",
      "In the Nordics, principal data scientists often bridge academic research and industry application, maintaining connections with universities like NTNU, UiO, and KTH.",
    ],
    whoThisIsGoodFor: ["Deep technical experts who also think strategically", "People who enjoy mentoring and multiplying impact", "Those comfortable with ambiguity and long-term thinking", "Strong leaders who stay hands-on"],
    topSkills: ["Advanced statistical methods", "Strategic thinking", "Technical leadership", "Research to production translation", "Organizational influence"],
    entryPaths: ["Senior data scientist with proven organizational impact", "Research scientist with industry experience", "Data science manager returning to technical track"],
    realityCheck: "You're expected to be both the smartest person in the room technically and a skilled organizational influencer; balancing both is genuinely difficult.",
  },
  "quantitative-analyst": {
    typicalDay: {
      morning: ["Review overnight model P&L attribution", "Calibrate pricing models to market data", "Risk factor analysis"],
      midday: ["Develop stochastic models for derivatives pricing", "Back-testing trading strategies", "Regulatory model validation"],
      afternoon: ["Research new quantitative methods", "Present model results to traders", "Code review of model library"],
      tools: ["Python/C++", "Bloomberg Terminal", "MATLAB", "QuantLib"],
      environment: "Trading floor or quantitative research team in a bank or asset manager, fast-paced with strict deadlines around market hours.",
    },
    whatYouActuallyDo: [
      "You develop mathematical models for pricing financial instruments, managing risk, and optimizing trading strategies, translating complex theory into practical tools used by traders and risk managers.",
      "Norway's sovereign wealth fund (NBIM), DNB Markets, and Nordic investment banks employ quants for rates, energy derivatives, and risk management with strong ties to the oil and gas markets.",
    ],
    whoThisIsGoodFor: ["Mathematics enthusiasts with financial curiosity", "People who enjoy turning theory into practical applications", "Those who thrive under time pressure", "Detail-oriented minds comfortable with uncertainty"],
    topSkills: ["Stochastic calculus", "Financial modeling", "Programming (Python/C++)", "Statistical analysis", "Risk management"],
    entryPaths: ["PhD in mathematics, physics, or quantitative finance", "Financial engineer with strong modeling background", "Actuary transitioning to capital markets"],
    realityCheck: "The intellectual challenge is real but so is the pressure; model errors can cost millions, and you need extreme attention to detail.",
  },
  "quant-developer": {
    typicalDay: {
      morning: ["Optimize model execution performance", "Deploy updated pricing libraries", "Review production model outputs"],
      midday: ["Build data pipelines for market data", "Implement numerical methods from research papers", "Low-latency system profiling"],
      afternoon: ["Collaborate with quant researchers on implementation", "Automated testing for model libraries", "Infrastructure improvements for compute grid"],
      tools: ["C++/Python", "KDB+/q", "Linux", "Grid computing frameworks"],
      environment: "Financial institution's technology team, working closely with quantitative researchers and traders in a performance-critical environment.",
    },
    whatYouActuallyDo: [
      "You build the high-performance software systems that run quantitative models in production, bridging the gap between mathematical research and reliable, fast trading infrastructure.",
      "In the Nordics, quant developers work at NBIM, Nordic banks, and energy trading firms where performance matters for real-time pricing and risk calculations.",
    ],
    whoThisIsGoodFor: ["Programmers who love performance optimization", "People who enjoy financial mathematics applications", "Engineers who care about correctness and precision", "Those who like working at the intersection of math and code"],
    topSkills: ["C++ and Python", "Numerical computing", "Low-latency systems", "Financial mathematics", "Software architecture"],
    entryPaths: ["Software engineer with quantitative finance interest", "Physics or math PhD with strong programming skills", "Financial engineer deepening engineering expertise"],
    realityCheck: "You need both strong engineering skills and enough mathematical understanding to implement complex models correctly; pure coding skill is not sufficient.",
  },
  "decision-science-lead": {
    typicalDay: {
      morning: ["Review A/B test results", "Framework design for strategic decision", "Stakeholder alignment on success metrics"],
      midday: ["Causal inference analysis", "Build decision support dashboard", "Present recommendations to leadership"],
      afternoon: ["Simulation modeling for scenario planning", "Team coaching on analytical methods", "Cross-functional strategy workshop"],
      tools: ["Python (causalml, statsmodels)", "SQL", "Looker/Tableau", "Jupyter Notebooks"],
      environment: "Strategy or analytics team within a tech or data-driven company, working closely with product, marketing, and executive leadership.",
    },
    whatYouActuallyDo: [
      "You use data, experimentation, and analytical frameworks to help organizations make better strategic decisions, going beyond descriptive analytics to causal understanding and prescriptive recommendations.",
      "In Norwegian companies, decision science leads often support pricing strategy, market expansion decisions, and operational optimization in sectors like telecom (Telenor), retail, and energy.",
    ],
    whoThisIsGoodFor: ["Analytical minds who love business strategy", "People who enjoy influencing decisions with evidence", "Those who can simplify complex analyses for executives", "Curious thinkers who ask why, not just what"],
    topSkills: ["Causal inference", "Experimental design", "Business strategy", "Data storytelling", "Statistical modeling"],
    entryPaths: ["Senior data scientist focusing on business impact", "Management consultant adding quantitative depth", "Economist transitioning to tech industry"],
    realityCheck: "Your recommendations are only valuable if leaders act on them; influencing organizational decisions requires as much persuasion as analytical skill.",
  },
  "engineering-manager": {
    typicalDay: {
      morning: ["1:1 meetings with direct reports", "Sprint planning facilitation", "Review team velocity and blockers"],
      midday: ["Cross-team coordination meeting", "Hiring interviews", "Technical decision support"],
      afternoon: ["Career development conversation", "Process improvement discussion", "Stakeholder alignment on roadmap"],
      tools: ["Jira", "Slack", "GitHub", "Lattice/15Five"],
      environment: "Tech company managing a team of 5-10 engineers, hybrid work with regular in-person team activities valued in Nordic culture.",
    },
    whatYouActuallyDo: [
      "You lead a team of engineers, focusing on their growth, productivity, and well-being while ensuring the team delivers quality software aligned with business objectives.",
      "Norwegian engineering management emphasizes flat hierarchy, trust-based leadership, and work-life balance, making it a distinct style compared to more hierarchical cultures.",
    ],
    whoThisIsGoodFor: ["Engineers who care deeply about people development", "Good listeners and communicators", "Those who get satisfaction from others' success", "People who enjoy removing obstacles"],
    topSkills: ["People management", "Technical credibility", "Project delivery", "Hiring and team building", "Conflict resolution"],
    entryPaths: ["Senior engineer transitioning to management", "Tech lead taking on people responsibilities", "Project manager with technical background"],
    realityCheck: "You'll write much less code and spend most of your time in meetings; if that sounds terrible, stay on the IC track.",
  },
  "senior-engineering-manager": {
    typicalDay: {
      morning: ["Leadership team standup", "Review organizational health metrics", "Manager coaching session"],
      midday: ["Technical strategy alignment", "Headcount planning and budgeting", "Cross-department initiative planning"],
      afternoon: ["Skip-level 1:1s", "Process and culture improvement initiatives", "Executive reporting preparation"],
      tools: ["Jira", "Slack", "HR platforms", "OKR tracking tools"],
      environment: "Managing multiple engineering teams (typically 2-4 teams), with more organizational and strategic responsibilities than a single-team manager.",
    },
    whatYouActuallyDo: [
      "You manage engineering managers and multiple teams, focusing on organizational design, cross-team effectiveness, and translating business strategy into engineering execution.",
      "In Norwegian tech organizations, this role requires navigating consensus-driven decision-making culture while still driving accountability and delivery across teams.",
    ],
    whoThisIsGoodFor: ["Experienced managers who want broader organizational impact", "People skilled at developing other leaders", "Strategic thinkers who enjoy organizational design", "Those comfortable with ambiguity and politics"],
    topSkills: ["Organizational leadership", "Manager development", "Strategic planning", "Budget management", "Cross-functional collaboration"],
    entryPaths: ["Engineering manager with multiple years of team leadership", "Senior engineer with leadership aptitude in growing organization", "Product or program manager transitioning to engineering leadership"],
    realityCheck: "You're further from the code and closer to organizational politics; success is measured by your teams' outcomes, not your individual contributions.",
  },
  "director-of-engineering": {
    typicalDay: {
      morning: ["Executive leadership meeting", "Engineering OKR review", "Organizational structure planning"],
      midday: ["Technical due diligence for acquisition", "Vendor and partnership strategy", "Department budget review"],
      afternoon: ["All-hands preparation", "Succession planning discussion", "Industry peer networking"],
      tools: ["Executive dashboards", "Google Workspace", "Board presentation tools", "HRIS platforms"],
      environment: "Senior leadership position overseeing a large engineering department, significant executive interaction and strategic responsibility.",
    },
    whatYouActuallyDo: [
      "You lead an entire engineering department or major division, setting technical direction, building organizational culture, managing budgets, and aligning engineering output with company strategy.",
      "In Norway's tech sector, engineering directors balance the flat Nordic management culture with the need for clear technical direction, often across distributed teams in multiple Nordic countries.",
    ],
    whoThisIsGoodFor: ["Experienced leaders ready for department-level responsibility", "Strategic thinkers who can operate at executive level", "People who enjoy building and scaling organizations", "Those who can balance technical vision with business needs"],
    topSkills: ["Organizational leadership", "Strategic planning", "Executive communication", "Technical vision", "Talent strategy"],
    entryPaths: ["Senior engineering manager with proven scaling experience", "VP Engineering at smaller company moving to larger organization", "CTO of startup transitioning to director at scale-up"],
    realityCheck: "Your calendar will be packed with meetings and your success depends entirely on the people and systems you put in place, not on your personal technical output.",
  },
  "vp-engineering": {
    typicalDay: {
      morning: ["C-suite strategy meeting", "Engineering leadership team sync", "Board material preparation"],
      midday: ["Technology investment decisions", "M&A technical assessment", "Customer escalation review"],
      afternoon: ["Talent strategy and employer branding", "Industry conference keynote preparation", "Investor meeting preparation"],
      tools: ["Executive reporting tools", "Financial planning software", "Board presentation tools", "Strategic planning frameworks"],
      environment: "Executive suite with responsibility for the entire engineering organization, frequent travel for board meetings, conferences, and customer visits.",
    },
    whatYouActuallyDo: [
      "You own the engineering organization's strategy, budget, and execution at the executive level, representing engineering in C-suite decisions and ensuring technology capabilities support the company's business objectives.",
      "In Norwegian scale-ups and enterprises, VPs of Engineering often manage engineering across multiple Nordic offices and must balance rapid growth with the collaborative, egalitarian management style expected locally.",
    ],
    whoThisIsGoodFor: ["Senior leaders who think in terms of organizational systems", "Executives comfortable with P&L responsibility", "Those who can represent technology to boards and investors", "People who enjoy building world-class engineering cultures"],
    topSkills: ["Executive leadership", "Budget and P&L management", "Technology strategy", "Board communication", "Organizational design"],
    entryPaths: ["Director of Engineering with executive exposure", "CTO transitioning to VP Engineering at larger company", "Senior engineering leader with MBA or business acumen"],
    realityCheck: "This is fundamentally a business role with a technology lens; if you want to stay close to engineering problems, this is not the right path.",
  },
  "head-of-engineering": {
    typicalDay: {
      morning: ["Engineering all-hands preparation", "Technical roadmap review with CTO", "Hiring pipeline assessment"],
      midday: ["Architecture governance meeting", "Cross-departmental priority alignment", "Team structure optimization"],
      afternoon: ["External technology partnership evaluation", "Engineering culture initiatives", "Performance management reviews"],
      tools: ["OKR platforms", "Jira Portfolio", "HR systems", "Slack"],
      environment: "Senior leadership in a mid-size to large company, often the most senior engineering leader below or alongside the CTO.",
    },
    whatYouActuallyDo: [
      "You lead the engineering function end-to-end, owning delivery, technical quality, team health, and engineering strategy while serving as the primary interface between engineering and the rest of the business.",
      "In Norwegian companies, heads of engineering often take a hands-on approach in smaller organizations and a more strategic role in larger ones, always within the context of Nordic flat hierarchy expectations.",
    ],
    whoThisIsGoodFor: ["Well-rounded engineering leaders", "People who can context-switch between strategy and execution", "Those who enjoy building engineering culture", "Leaders comfortable with full ownership of engineering outcomes"],
    topSkills: ["Engineering leadership", "Delivery management", "Technical strategy", "People and culture development", "Stakeholder management"],
    entryPaths: ["Director of Engineering or VP Engineering at a smaller company", "Senior Engineering Manager ready for broader scope", "CTO of startup transitioning to structured leadership"],
    realityCheck: "You're accountable for everything engineering delivers; when things go wrong, you own it, and when things go right, your teams get the credit.",
  },
  "technical-director": {
    typicalDay: {
      morning: ["Technical vision review and roadmap alignment", "Architecture decision escalation", "Innovation initiative check-in"],
      midday: ["Technical debt prioritization across teams", "Platform strategy discussion", "Technical community of practice facilitation"],
      afternoon: ["Evaluate emerging technologies", "Technical hiring bar-raising", "External speaking or blogging"],
      tools: ["Architecture tools", "GitHub", "Confluence", "Tech radar"],
      environment: "Senior technical leadership role focused on technical excellence rather than people management, often working across the entire engineering organization.",
    },
    whatYouActuallyDo: [
      "You set the technical direction for the engineering organization, making key architectural and technology decisions, driving technical excellence, and ensuring the codebase and systems can support future business needs.",
      "In Nordic tech companies, technical directors often serve as the senior-most individual contributor path, providing an alternative to management for those who want to stay deeply technical while having organizational impact.",
    ],
    whoThisIsGoodFor: ["Deep technologists who want organizational influence", "People who prefer technical leadership over people management", "Those who enjoy setting standards and best practices", "Engineers who want to shape technology strategy"],
    topSkills: ["Technical vision", "Architecture leadership", "Technology evaluation", "Technical mentoring", "Strategic thinking"],
    entryPaths: ["Staff or principal engineer seeking broader impact", "Systems architect moving into leadership", "Engineering manager returning to technical track at senior level"],
    realityCheck: "You need deep credibility and the ability to influence without authority; your power comes from being right and being trusted, not from a reporting line.",
  },
  "technology-director": {
    typicalDay: {
      morning: ["IT and technology strategy review", "Digital transformation progress meeting", "Vendor contract negotiations"],
      midday: ["Technology budget planning", "Enterprise architecture governance", "Security and compliance review"],
      afternoon: ["Business stakeholder technology advisory", "Innovation lab review", "Technology team development planning"],
      tools: ["ServiceNow", "SAP", "Power BI", "Enterprise architecture tools (TOGAF)"],
      environment: "Senior leadership role in a large enterprise or public sector organization, bridging business strategy and technology implementation.",
    },
    whatYouActuallyDo: [
      "You lead the overall technology strategy for an organization, encompassing software engineering, infrastructure, data, and digital transformation, ensuring technology investments align with business objectives.",
      "In Norway, technology directors in public sector (NAV, Skatteetaten) and large enterprises (Equinor, Telenor) manage complex modernization programs while navigating procurement regulations and stakeholder expectations.",
    ],
    whoThisIsGoodFor: ["Business-minded technologists", "Leaders who enjoy enterprise-scale transformation", "People who can manage large budgets and vendor relationships", "Those comfortable in highly matrixed organizations"],
    topSkills: ["Technology strategy", "Digital transformation", "Budget and vendor management", "Enterprise architecture", "Organizational leadership"],
    entryPaths: ["IT director broadening to full technology scope", "Director of Engineering adding business technology oversight", "Management consultant in technology practice moving in-house"],
    realityCheck: "This is as much about organizational change management and politics as it is about technology; pure technologists often struggle in this role.",
  },

  "cto": {
    typicalDay: {
      morning: ["Review system architecture decisions", "Meet with engineering leads", "Assess technology risk and security posture"],
      midday: ["Align tech strategy with business goals", "Evaluate build-vs-buy decisions", "Review technical debt priorities"],
      afternoon: ["Mentor senior engineers", "Present to board or investors", "Plan quarterly technology roadmap"],
      tools: ["Jira", "Confluence", "AWS/Azure Console", "Slack"],
      environment: "Executive office with frequent meetings, both in-person and remote. Travel for conferences and partner meetings.",
    },
    whatYouActuallyDo: [
      "You set the technical vision for the entire company, deciding which technologies to invest in, how to scale systems, and how to build engineering culture.",
      "In Norway, CTOs often balance deep technical credibility with flat-hierarchy leadership, working closely with developers rather than directing from above.",
    ],
    whoThisIsGoodFor: ["Strategic thinkers with deep technical roots", "People who enjoy building engineering culture", "Leaders comfortable with ambiguity and board-level communication", "Those who can translate tech complexity into business value"],
    topSkills: ["Technology strategy", "Architecture oversight", "Team leadership", "Stakeholder communication", "Risk management"],
    entryPaths: ["VP of Engineering promotion", "Senior architect to CTO in a startup", "Technical co-founder path"],
    realityCheck: "You rarely write code anymore — your job is people, strategy, and politics, and the pressure from the board is constant.",
  },
  "chief-digital-officer": {
    typicalDay: {
      morning: ["Review digital KPIs and analytics", "Align with CEO on digital priorities", "Meet with product and marketing leads"],
      midday: ["Evaluate digital channel performance", "Drive customer experience initiatives", "Assess digital partnership opportunities"],
      afternoon: ["Oversee digital transformation programs", "Present to executive team", "Review innovation pipeline"],
      tools: ["Google Analytics", "Power BI", "Salesforce", "Adobe Experience Cloud"],
      environment: "Corporate headquarters with a mix of strategy meetings, workshops, and stakeholder presentations.",
    },
    whatYouActuallyDo: [
      "You drive the organization's digital strategy, ensuring all customer-facing and internal digital channels deliver value and competitive advantage.",
      "In Nordic companies, this role is increasingly common in banking, retail, and public sector, often reporting directly to the CEO.",
    ],
    whoThisIsGoodFor: ["Business leaders passionate about digital innovation", "People who bridge technology and customer experience", "Strategic communicators who can influence at C-level", "Those energized by rapid market change"],
    topSkills: ["Digital strategy", "Customer experience", "Change management", "Data-driven decision making", "Stakeholder management"],
    entryPaths: ["Head of Digital promotion", "Senior management consulting to CDO", "VP Product or Marketing transition"],
    realityCheck: "You need to show measurable digital ROI quickly, and many organizations still struggle to define what 'digital' actually means at the executive level.",
  },
  "senior-product-manager": {
    typicalDay: {
      morning: ["Analyze user metrics and A/B test results", "Prioritize backlog with engineering", "Conduct stakeholder alignment meetings"],
      midday: ["Run sprint planning or refinement", "Interview customers or review user research", "Update product roadmap"],
      afternoon: ["Write product specs and user stories", "Coordinate with design on prototypes", "Review competitive landscape"],
      tools: ["Jira", "Figma", "Amplitude", "Miro"],
      environment: "Open office or hybrid setup, spending time between your team, stakeholders, and users.",
    },
    whatYouActuallyDo: [
      "You own a significant product area, making daily trade-off decisions between user needs, business goals, and technical constraints.",
      "In Norway's tech scene, senior PMs often work in cross-functional squads at companies like Vipps, Finn.no, or DNB, with high autonomy.",
    ],
    whoThisIsGoodFor: ["Analytical minds who love talking to users", "People who thrive on making decisions with incomplete data", "Strong communicators who can say no diplomatically", "Those who enjoy both strategy and execution"],
    topSkills: ["Product discovery", "Data analysis", "Stakeholder management", "User research", "Roadmap planning"],
    entryPaths: ["Junior PM with 4-6 years experience", "UX designer transitioning to product", "Engineer moving into product management"],
    realityCheck: "You have lots of responsibility but no direct authority — success depends on your ability to influence engineers, designers, and executives.",
  },
  "principal-product-manager": {
    typicalDay: {
      morning: ["Define product strategy for a product portfolio", "Coach senior PMs on approach", "Review cross-team dependencies"],
      midday: ["Lead product council or review meetings", "Align product vision with company strategy", "Analyze market trends and competitive threats"],
      afternoon: ["Resolve escalated prioritization conflicts", "Drive alignment across engineering and design", "Present strategy to leadership"],
      tools: ["Productboard", "Amplitude", "Confluence", "Google Slides"],
      environment: "Primarily meeting-heavy days, splitting time between strategic thinking and cross-team coordination.",
    },
    whatYouActuallyDo: [
      "You set product direction across multiple teams, solving the hardest cross-cutting product problems and ensuring coherent strategy.",
      "In Nordic tech companies, this is an individual contributor leadership role, valued for deep expertise without needing to manage people directly.",
    ],
    whoThisIsGoodFor: ["Seasoned PMs who prefer strategy over people management", "Systems thinkers who see cross-product patterns", "Those who enjoy mentoring without formal authority", "People energized by ambiguous, high-impact problems"],
    topSkills: ["Product strategy", "Cross-team alignment", "Systems thinking", "Executive communication", "Mentoring"],
    entryPaths: ["Senior PM with 8+ years experience", "Group PM wanting IC track", "Strategy consultant transitioning to product"],
    realityCheck: "The role can feel undefined — you need to constantly prove your value by tackling problems no one else can solve.",
  },
  "group-product-manager": {
    typicalDay: {
      morning: ["One-on-ones with product managers", "Review team OKRs and progress", "Align priorities across squads"],
      midday: ["Facilitate product strategy workshops", "Resolve cross-team conflicts", "Meet with engineering and design leads"],
      afternoon: ["Coach PMs on career development", "Present portfolio updates to VP", "Hire and onboard new PMs"],
      tools: ["Jira", "Lattice", "Confluence", "Slack"],
      environment: "Heavy meeting schedule, managing a team of 3-6 PMs across multiple product areas.",
    },
    whatYouActuallyDo: [
      "You manage a team of product managers, ensuring each PM is effective while maintaining strategic coherence across their product areas.",
      "In Norway, this role is common at scale-ups like Kahoot, Oda, or Autostore where product teams are growing rapidly.",
    ],
    whoThisIsGoodFor: ["PMs who love developing other PMs", "People who enjoy organizational challenges", "Leaders who can context-switch between strategy and coaching", "Those who find satisfaction in team success over personal output"],
    topSkills: ["People management", "Product strategy", "Coaching and mentoring", "Organizational design", "Conflict resolution"],
    entryPaths: ["Senior PM promoted to manage other PMs", "Engineering manager transitioning to product", "Management consultant with product experience"],
    realityCheck: "You spend most of your time in meetings and coaching — if you love hands-on product work, this role may frustrate you.",
  },
  "director-of-product": {
    typicalDay: {
      morning: ["Set quarterly product goals with VP", "Review product metrics dashboards", "Align product and engineering leadership"],
      midday: ["Lead product portfolio reviews", "Drive go-to-market strategy with marketing", "Evaluate product-market fit for new initiatives"],
      afternoon: ["Present to C-suite on product performance", "Manage product organization structure", "Define hiring strategy for product team"],
      tools: ["Productboard", "Tableau", "Google Workspace", "Slack"],
      environment: "Executive-level meetings mixed with product team workshops. Often hybrid work with regular on-site leadership days.",
    },
    whatYouActuallyDo: [
      "You oversee a significant product portfolio, setting direction for multiple product teams and ensuring alignment with business strategy.",
      "In larger Norwegian companies like Schibsted or Telenor, this role bridges the gap between C-level vision and product team execution.",
    ],
    whoThisIsGoodFor: ["Strategic leaders with product depth", "People comfortable with P&L responsibility", "Those who enjoy building product organizations", "Leaders who balance customer advocacy with business results"],
    topSkills: ["Product vision", "P&L management", "Organizational leadership", "Go-to-market strategy", "Executive communication"],
    entryPaths: ["Group PM or Senior PM with strong leadership track", "Head of Product at a smaller company", "Management consulting to product leadership"],
    realityCheck: "You're accountable for product revenue but often lack direct control over engineering resources or go-to-market execution.",
  },
  "vp-product": {
    typicalDay: {
      morning: ["Executive leadership team meeting", "Review company-wide product KPIs", "Align product strategy with CEO vision"],
      midday: ["Evaluate M&A or partnership opportunities", "Lead product leadership team sync", "Define multi-year product roadmap"],
      afternoon: ["Board presentation preparation", "Investor or customer executive meetings", "Organizational planning and hiring"],
      tools: ["Power BI", "Google Slides", "Slack", "Asana"],
      environment: "Executive-level environment with frequent travel, board interactions, and leadership offsites.",
    },
    whatYouActuallyDo: [
      "You own the entire product function, setting vision and strategy that directly impacts company valuation and market position.",
      "In the Nordics, VP Product roles exist primarily at scale-ups and larger tech companies, often with significant board-level exposure.",
    ],
    whoThisIsGoodFor: ["Ambitious product leaders who want executive impact", "People who thrive on business strategy and market dynamics", "Leaders comfortable presenting to boards and investors", "Those who can build and scale product organizations"],
    topSkills: ["Executive leadership", "Business strategy", "Product vision", "Investor communication", "Organizational scaling"],
    entryPaths: ["Director of Product at a growth company", "Head of Product seeking larger scope", "General Manager or business unit leader"],
    realityCheck: "This is a business leadership role that happens to be in product — expect more spreadsheets and board decks than user research.",
  },
  "head-of-product": {
    typicalDay: {
      morning: ["Define product vision and communicate to teams", "Review product analytics and user feedback", "Sync with CTO on technical feasibility"],
      midday: ["Lead product team all-hands or guild meetings", "Drive prioritization across product areas", "Meet with key customers or partners"],
      afternoon: ["Coach product managers and leads", "Present roadmap to CEO or leadership", "Plan product organization growth"],
      tools: ["Jira", "Amplitude", "Figma", "Notion"],
      environment: "Hybrid work combining strategic planning, team leadership, and stakeholder management across the organization.",
    },
    whatYouActuallyDo: [
      "You lead the product function, setting strategy and building the product team while staying close enough to execution to make real decisions.",
      "In Norwegian scale-ups and mid-size companies, this is often the top product role, combining hands-on product leadership with organizational building.",
    ],
    whoThisIsGoodFor: ["Product leaders who want to build a function from scratch", "People who balance strategic vision with tactical execution", "Leaders who enjoy hiring and developing talent", "Those who thrive in fast-growing organizations"],
    topSkills: ["Product strategy", "Team building", "Stakeholder management", "User-centric thinking", "Roadmap communication"],
    entryPaths: ["Senior PM or Group PM at a growing company", "Director of Product seeking broader ownership", "Founder or co-founder transitioning to product leadership"],
    realityCheck: "You're often the first senior product hire, which means building everything from scratch with limited resources and high expectations.",
  },
  "product-strategy-lead": {
    typicalDay: {
      morning: ["Analyze market data and competitive intelligence", "Define strategic positioning for product lines", "Meet with product and business leadership"],
      midday: ["Build business cases for new product investments", "Facilitate strategy workshops with cross-functional teams", "Evaluate pricing and packaging strategies"],
      afternoon: ["Present strategic recommendations to leadership", "Model financial scenarios for product bets", "Align product roadmap with corporate strategy"],
      tools: ["Excel", "Power BI", "Miro", "Google Slides"],
      environment: "Strategy-focused role with heavy analysis work balanced by cross-functional workshops and leadership presentations.",
    },
    whatYouActuallyDo: [
      "You bridge product management and corporate strategy, building the analytical foundation for major product investment decisions.",
      "In Nordic companies, this role often sits between product and business development, especially in telecom, fintech, and SaaS companies.",
    ],
    whoThisIsGoodFor: ["Analytical thinkers who love market strategy", "Former consultants who want to be closer to product decisions", "People who enjoy building business cases and financial models", "Those who prefer influence over direct team management"],
    topSkills: ["Strategic analysis", "Business case development", "Market research", "Financial modeling", "Executive communication"],
    entryPaths: ["Strategy consultant moving in-house", "Senior PM with strong analytical skills", "Business development lead transitioning to product"],
    realityCheck: "You produce great analyses and recommendations, but execution depends on product teams you don't control.",
  },
  "game-director": {
    typicalDay: {
      morning: ["Review game builds and playtest feedback", "Set creative direction for upcoming milestones", "Meet with art, design, and narrative leads"],
      midday: ["Evaluate game mechanics and balancing", "Review player analytics and live ops data", "Approve content and feature priorities"],
      afternoon: ["Guide level design and UX reviews", "Align with producers on timeline", "Communicate vision to the full team"],
      tools: ["Unity/Unreal Engine", "Jira", "Confluence", "Miro"],
      environment: "Creative studio environment with daily playtesting, team reviews, and production meetings.",
    },
    whatYouActuallyDo: [
      "You are the creative and strategic leader of a game project, responsible for the overall player experience and ensuring the game is fun and commercially viable.",
      "Norway has a growing games industry with studios like Funcom, Rain Games, and Hyper Games, where game directors shape titles for global audiences.",
    ],
    whoThisIsGoodFor: ["Passionate gamers with leadership skills", "Creative thinkers who can make tough trade-offs", "People who thrive under long production cycles", "Those who can unite diverse creative disciplines around a vision"],
    topSkills: ["Game design", "Creative leadership", "Player experience thinking", "Production awareness", "Team communication"],
    entryPaths: ["Lead game designer with shipped titles", "Creative director from another entertainment field", "Senior designer promoted on a breakout project"],
    realityCheck: "Crunch is real in the games industry, and your creative vision will constantly be challenged by budget, timeline, and market reality.",
  },
  "technical-director-gaming": {
    typicalDay: {
      morning: ["Review engine and pipeline performance", "Set technical standards for the project", "Meet with lead programmers on architecture"],
      midday: ["Evaluate new technology and middleware", "Solve critical technical blockers", "Review code quality and performance benchmarks"],
      afternoon: ["Guide rendering, networking, or AI systems", "Align with game director on technical feasibility", "Mentor senior engineers"],
      tools: ["Unreal Engine/Unity", "Visual Studio", "Perforce", "Jenkins"],
      environment: "Studio environment with deep technical work balanced by cross-discipline collaboration and production meetings.",
    },
    whatYouActuallyDo: [
      "You own the technical vision of a game project, ensuring the engine, tools, and systems can deliver the creative vision at quality and performance targets.",
      "In Norway's game studios, technical directors often work on cutting-edge rendering, procedural generation, or online infrastructure for globally distributed players.",
    ],
    whoThisIsGoodFor: ["Deep technologists who love games", "Engineers who enjoy architecture-level decisions", "People who can bridge creative vision and technical constraints", "Those who thrive on performance optimization challenges"],
    topSkills: ["Game engine architecture", "Performance optimization", "Technical leadership", "Cross-discipline communication", "R&D evaluation"],
    entryPaths: ["Lead programmer with multiple shipped titles", "Engine programmer promoted to leadership", "Graphics or systems engineer with broad experience"],
    realityCheck: "You'll spend more time in meetings and code reviews than writing code yourself, and shipping on time often trumps technical elegance.",
  },
  "studio-director": {
    typicalDay: {
      morning: ["Review studio P&L and project status", "Meet with game directors on milestones", "Align with publisher or parent company"],
      midday: ["Drive hiring and team development strategy", "Evaluate new project pitches", "Manage studio culture and operations"],
      afternoon: ["Handle partnerships and business development", "Oversee marketing and community strategy", "Plan long-term studio growth"],
      tools: ["Excel", "Jira", "Slack", "Google Workspace"],
      environment: "Studio leadership role combining business management with creative oversight, often with publisher relationship management.",
    },
    whatYouActuallyDo: [
      "You run an entire game studio, balancing creative ambition with business sustainability, team health, and publisher or investor relationships.",
      "Norwegian studio directors manage globally competitive teams while navigating Nordic work culture expectations around work-life balance and flat hierarchies.",
    ],
    whoThisIsGoodFor: ["Business-minded leaders passionate about games", "People who enjoy building organizations and culture", "Leaders comfortable with financial accountability", "Those who can manage creative talent with empathy"],
    topSkills: ["Business management", "P&L ownership", "Team building", "Publisher relations", "Strategic planning"],
    entryPaths: ["Game director or producer moving to studio leadership", "Business development lead in gaming", "Entrepreneur founding or growing a studio"],
    realityCheck: "You carry the financial risk of the entire studio — one failed project can mean layoffs, and the gaming market is brutal.",
  },
  "platform-director-media": {
    typicalDay: {
      morning: ["Review platform metrics and user engagement", "Align with editorial and content teams", "Set platform strategy and feature priorities"],
      midday: ["Evaluate content delivery and streaming infrastructure", "Drive ad tech or subscription model optimization", "Meet with technology and design leaders"],
      afternoon: ["Assess partnerships with content providers", "Present platform performance to executives", "Plan platform evolution and scalability"],
      tools: ["Adobe Analytics", "AWS Media Services", "Contentful", "Tableau"],
      environment: "Media company headquarters with a blend of technology, editorial, and business stakeholder meetings.",
    },
    whatYouActuallyDo: [
      "You lead the digital platform strategy for a media company, ensuring content reaches audiences effectively across web, mobile, and streaming channels.",
      "In the Nordics, companies like Schibsted, NRK, TV 2, and Amedia rely on platform directors to drive digital transformation in a competitive media landscape.",
    ],
    whoThisIsGoodFor: ["Tech leaders who love media and content", "People who enjoy the intersection of editorial and technology", "Strategic thinkers who understand audience behavior", "Those comfortable managing complex platform ecosystems"],
    topSkills: ["Platform strategy", "Media technology", "Audience analytics", "Content delivery", "Stakeholder management"],
    entryPaths: ["Head of technology at a media company", "Product director transitioning to media", "Digital strategy lead in publishing or broadcasting"],
    realityCheck: "Media is under constant disruption, and you'll need to innovate faster than the market while legacy systems and editorial culture slow you down.",
  },
  "product-director-consumer": {
    typicalDay: {
      morning: ["Review consumer metrics and funnel data", "Align product teams on growth priorities", "Analyze user segmentation and behavior"],
      midday: ["Drive product-led growth experiments", "Coordinate with marketing on campaigns", "Review UX research and customer feedback"],
      afternoon: ["Present product performance to leadership", "Set pricing and packaging strategy", "Plan feature rollouts and A/B tests"],
      tools: ["Amplitude", "Optimizely", "Figma", "Mixpanel"],
      environment: "Fast-paced consumer tech environment with heavy data analysis, experimentation, and cross-functional collaboration.",
    },
    whatYouActuallyDo: [
      "You lead product strategy for consumer-facing products, driving user acquisition, engagement, and retention through data-driven product decisions.",
      "In Norway, consumer product directors work at companies like Vipps, Finn.no, Kolonial/Oda, or Kahoot, where user experience directly drives business success.",
    ],
    whoThisIsGoodFor: ["Data-driven product leaders who love consumer behavior", "People who thrive on rapid experimentation", "Leaders who understand growth loops and viral mechanics", "Those who enjoy balancing user delight with monetization"],
    topSkills: ["Product-led growth", "Consumer analytics", "UX strategy", "A/B testing", "Monetization strategy"],
    entryPaths: ["Senior PM in consumer tech with growth focus", "Marketing leader transitioning to product", "Growth lead promoted to product director"],
    realityCheck: "Consumer products live and die by metrics — you'll face constant pressure to move numbers, and user tastes change fast.",
  },
  "program-director": {
    typicalDay: {
      morning: ["Review program status across all workstreams", "Escalate risks and blockers to sponsors", "Align program milestones with business objectives"],
      midday: ["Lead steering committee meetings", "Coordinate dependencies between projects", "Manage program budget and resources"],
      afternoon: ["Coach project managers on delivery", "Update executive dashboards and reports", "Plan next program phase or gate review"],
      tools: ["MS Project", "Jira", "Power BI", "SharePoint"],
      environment: "Large organization setting with formal governance, steering committees, and cross-functional team coordination.",
    },
    whatYouActuallyDo: [
      "You oversee large, complex programs with multiple projects and workstreams, ensuring they deliver business outcomes on time and within budget.",
      "In Norway, program directors are in demand across public sector digitalization, oil and gas transformations, and large enterprise IT modernization efforts.",
    ],
    whoThisIsGoodFor: ["Structured thinkers who love orchestrating complexity", "People who thrive on governance and stakeholder management", "Leaders comfortable managing ambiguity at scale", "Those who enjoy turning strategy into executed programs"],
    topSkills: ["Program governance", "Stakeholder management", "Risk management", "Budget management", "Cross-functional coordination"],
    entryPaths: ["Senior project manager with large program experience", "Management consultant specializing in delivery", "Business unit leader moving to program management"],
    realityCheck: "You're accountable for everything but control almost nothing directly — success depends on influencing dozens of people who don't report to you.",
  },
  "transformation-director": {
    typicalDay: {
      morning: ["Review transformation KPIs and adoption metrics", "Align with C-suite on transformation vision", "Assess organizational readiness for change"],
      midday: ["Lead transformation office meetings", "Drive process redesign and operating model changes", "Manage change management and communications"],
      afternoon: ["Resolve resistance and escalation issues", "Coordinate technology and business workstreams", "Report to board on transformation progress"],
      tools: ["Power BI", "Miro", "ServiceNow", "Prosci ADKAR tools"],
      environment: "Executive-level role with heavy stakeholder engagement, workshops, and organizational change management across the enterprise.",
    },
    whatYouActuallyDo: [
      "You lead enterprise-wide transformation initiatives, fundamentally changing how an organization operates through technology, process, and culture change.",
      "In Norway, transformation directors are critical in industries like energy, banking, and public sector, where digitalization requires deep organizational change.",
    ],
    whoThisIsGoodFor: ["Change leaders who can navigate organizational politics", "People who combine technology understanding with people skills", "Leaders comfortable with multi-year timelines and ambiguity", "Those who enjoy redesigning how organizations work"],
    topSkills: ["Transformation strategy", "Change management", "Organizational design", "Executive communication", "Benefits realization"],
    entryPaths: ["Program director with transformation experience", "Senior management consultant moving in-house", "Business unit leader driving change initiatives"],
    realityCheck: "Transformation fatigue is real — you'll fight resistance at every level, and most large transformations fail or underdeliver on their original promise.",
  },
  "digital-transformation-lead": {
    typicalDay: {
      morning: ["Assess digital maturity across business units", "Define digital transformation roadmap", "Meet with business and IT stakeholders"],
      midday: ["Drive cloud migration and platform modernization", "Lead digital capability building workshops", "Evaluate digital tools and vendor solutions"],
      afternoon: ["Track adoption metrics and business impact", "Coach teams on agile and digital ways of working", "Report on transformation progress to sponsors"],
      tools: ["Azure DevOps", "Miro", "Power BI", "ServiceNow"],
      environment: "Cross-functional role working across business and IT, with frequent workshops, stakeholder meetings, and hands-on facilitation.",
    },
    whatYouActuallyDo: [
      "You drive the practical execution of digital transformation, helping organizations adopt new technologies, processes, and ways of working.",
      "In Norway, digital transformation leads are common in municipalities, health trusts, and mid-size companies modernizing legacy systems and customer journeys.",
    ],
    whoThisIsGoodFor: ["Pragmatic technologists with change management skills", "People who enjoy bridging business and IT", "Leaders who can simplify complex transformation into actionable steps", "Those who thrive on making organizations more digital-savvy"],
    topSkills: ["Digital strategy execution", "Change management", "Agile transformation", "Cloud and platform knowledge", "Stakeholder engagement"],
    entryPaths: ["IT manager leading digitalization projects", "Management consultant specializing in digital", "Product or delivery lead expanding to transformation"],
    realityCheck: "Everyone wants digital transformation but few want to change how they work — expect to spend most of your energy on people, not technology.",
  },
  "technology-transformation-lead": {
    typicalDay: {
      morning: ["Review technology modernization progress", "Align architecture decisions with transformation goals", "Meet with enterprise architects and platform teams"],
      midday: ["Drive legacy system decommissioning planning", "Evaluate cloud migration and integration strategies", "Lead technical transformation governance"],
      afternoon: ["Coordinate with vendors and system integrators", "Report on technical debt reduction metrics", "Coach teams on modern engineering practices"],
      tools: ["Azure/AWS Console", "Jira", "Confluence", "Enterprise architecture tools"],
      environment: "Large enterprise setting with deep technical work balanced by governance meetings and vendor coordination.",
    },
    whatYouActuallyDo: [
      "You lead the technology dimension of enterprise transformation, modernizing platforms, reducing technical debt, and enabling new business capabilities.",
      "In Norwegian enterprises like Equinor, DNB, or Posten, this role bridges enterprise architecture with hands-on delivery of technology modernization programs.",
    ],
    whoThisIsGoodFor: ["Senior technologists who think at enterprise scale", "People who enjoy decommissioning legacy while building modern platforms", "Leaders who can manage complex vendor relationships", "Those who combine architecture thinking with delivery execution"],
    topSkills: ["Enterprise architecture", "Cloud migration", "Legacy modernization", "Vendor management", "Technical program management"],
    entryPaths: ["Enterprise architect moving to transformation leadership", "Platform engineering lead with broad experience", "Technology consultant going in-house"],
    realityCheck: "Legacy systems are harder to replace than anyone estimates, and business stakeholders will resist changes that disrupt their current workflows.",
  },
  "portfolio-director": {
    typicalDay: {
      morning: ["Review portfolio health across all programs", "Prioritize investment decisions with leadership", "Assess resource allocation across initiatives"],
      midday: ["Lead portfolio governance board meetings", "Balance strategic vs. operational investments", "Evaluate new project proposals and business cases"],
      afternoon: ["Track portfolio-level benefits realization", "Manage dependencies between programs", "Report to executive committee on portfolio status"],
      tools: ["Planview", "Power BI", "Excel", "ServiceNow"],
      environment: "Strategic governance role with heavy executive interaction, investment decision meetings, and cross-program coordination.",
    },
    whatYouActuallyDo: [
      "You manage an organization's project and program portfolio, ensuring investments are strategically aligned and resources are optimally allocated.",
      "In Norway, portfolio directors work in large enterprises and public sector organizations managing hundreds of millions in annual project investments.",
    ],
    whoThisIsGoodFor: ["Strategic thinkers who love investment optimization", "People comfortable making tough prioritization calls", "Leaders who enjoy governance and structured decision-making", "Those who can see the big picture across many initiatives"],
    topSkills: ["Portfolio management", "Investment prioritization", "Resource optimization", "Governance design", "Benefits management"],
    entryPaths: ["Program director with portfolio oversight experience", "Strategy lead moving to delivery governance", "PMO director expanding to portfolio level"],
    realityCheck: "Saying no to projects is your most important and least popular job — everyone believes their initiative should be top priority.",
  },
  "delivery-director": {
    typicalDay: {
      morning: ["Review delivery status across all teams", "Address escalations and blockers", "Align delivery plans with client or business expectations"],
      midday: ["Lead delivery leadership team meetings", "Optimize team capacity and staffing", "Drive process improvement and delivery maturity"],
      afternoon: ["Meet with clients or sponsors on progress", "Coach delivery managers and scrum masters", "Manage delivery budgets and contracts"],
      tools: ["Jira", "Azure DevOps", "Confluence", "Power BI"],
      environment: "Fast-paced delivery environment, often in consulting or product companies, with constant juggling of teams, timelines, and client expectations.",
    },
    whatYouActuallyDo: [
      "You ensure multiple teams deliver software and solutions on time, on budget, and at quality, while keeping clients and stakeholders satisfied.",
      "In Norway's consulting and IT services sector, delivery directors at firms like Capgemini, Accenture, or Sopra Steria manage large client engagements across industries.",
    ],
    whoThisIsGoodFor: ["People who love operational excellence and team performance", "Leaders who thrive under pressure and tight deadlines", "Those who enjoy solving staffing and resourcing puzzles", "Communicators who can manage client expectations skillfully"],
    topSkills: ["Delivery management", "Client relationship management", "Team leadership", "Agile at scale", "Budget and contract management"],
    entryPaths: ["Senior delivery manager or engagement manager", "Program manager with client-facing experience", "Agile coach moving to delivery leadership"],
    realityCheck: "You're the buffer between demanding clients and overworked teams — expect to absorb pressure from both sides daily.",
  },
  "senior-project-director": {
    typicalDay: {
      morning: ["Review status of major projects and milestones", "Meet with project sponsors and steering groups", "Assess risks and develop mitigation strategies"],
      midday: ["Lead cross-functional project team meetings", "Manage vendor and contractor relationships", "Drive scope and change management decisions"],
      afternoon: ["Report to executive leadership on project progress", "Coach and develop project managers", "Plan resource allocation for upcoming phases"],
      tools: ["MS Project", "Jira", "SharePoint", "Power BI"],
      environment: "Large-scale project environments in enterprise or public sector, with formal governance and multi-stakeholder coordination.",
    },
    whatYouActuallyDo: [
      "You lead the most complex and strategically important projects in an organization, typically with budgets in the hundreds of millions NOK.",
      "In Norway, senior project directors manage critical infrastructure, public sector digitalization, or major enterprise system implementations.",
    ],
    whoThisIsGoodFor: ["Experienced project leaders who handle high-stakes delivery", "People who enjoy formal governance and structured approaches", "Leaders comfortable with political navigation", "Those who can manage complexity across technical and business domains"],
    topSkills: ["Large project delivery", "Risk management", "Stakeholder governance", "Contract and vendor management", "Team leadership"],
    entryPaths: ["Project director with track record of large deliveries", "Program manager specializing in complex projects", "Construction or engineering project manager transitioning to IT"],
    realityCheck: "The bigger the project, the more likely it will face delays and cost overruns — your job is to minimize the damage when things go wrong.",
  },
  "senior-management-consultant": {
    typicalDay: {
      morning: ["Structure client problem and develop hypothesis", "Analyze data and build recommendation frameworks", "Prepare client workshop materials"],
      midday: ["Facilitate workshops with client leadership", "Interview stakeholders and subject matter experts", "Synthesize findings into actionable insights"],
      afternoon: ["Build presentation decks and deliverables", "Coach junior consultants on analysis", "Present recommendations to client sponsors"],
      tools: ["PowerPoint", "Excel", "Miro", "Think-Cell"],
      environment: "Client-site or hybrid work, spending most time at client offices during engagements with intense analytical and interpersonal work.",
    },
    whatYouActuallyDo: [
      "You solve complex business problems for clients, combining analytical rigor with stakeholder management to drive strategic decisions and organizational change.",
      "In Norway, senior management consultants at firms like McKinsey, BCG, Bain, or Nordic firms like BearingPoint and Metier work across energy, telecom, and public sector.",
    ],
    whoThisIsGoodFor: ["Sharp analytical thinkers who love variety", "People who thrive on steep learning curves across industries", "Strong communicators who can influence senior executives", "Those who enjoy structured problem-solving under pressure"],
    topSkills: ["Structured problem solving", "Stakeholder management", "Data analysis", "Presentation skills", "Project management"],
    entryPaths: ["MBA or graduate program at a consulting firm", "Industry expert joining consulting", "Junior consultant with 5-7 years experience"],
    realityCheck: "The hours are long, the travel is constant, and your brilliant recommendations may sit in a drawer if the client lacks execution capacity.",
  },
  "strategy-consultant": {
    typicalDay: {
      morning: ["Develop market sizing and competitive analysis", "Build financial models for strategic options", "Review industry trends and disruption patterns"],
      midday: ["Present strategic options to C-suite", "Facilitate strategy offsite workshops", "Interview industry experts and customers"],
      afternoon: ["Refine strategy decks and business cases", "Coach analysts on research methodology", "Align with engagement manager on deliverables"],
      tools: ["PowerPoint", "Excel", "Capital IQ", "Statista"],
      environment: "Client boardrooms, strategy offsites, and consulting offices with intense analytical sprints and high-stakes presentations.",
    },
    whatYouActuallyDo: [
      "You help leadership teams make their most important strategic decisions — where to play, how to win, and what to invest in.",
      "In Norway, strategy consultants often advise on energy transition, digital disruption in banking, and Nordic market expansion strategies.",
    ],
    whoThisIsGoodFor: ["Intellectually curious people who love business strategy", "Those who enjoy working with C-suite executives", "Analytical thinkers who can tell compelling stories with data", "People comfortable with short, high-intensity engagements"],
    topSkills: ["Strategic thinking", "Market analysis", "Financial modeling", "Executive communication", "Hypothesis-driven problem solving"],
    entryPaths: ["Top MBA program into strategy consulting", "Management consultant specializing in strategy", "Industry strategist joining a consulting firm"],
    realityCheck: "You get to think about big questions but rarely see execution — the client takes your deck and you move on to the next engagement.",
  },
  "principal-consultant": {
    typicalDay: {
      morning: ["Lead client engagement and set project direction", "Develop solutions for complex client challenges", "Mentor senior consultants on approach"],
      midday: ["Drive business development and proposal writing", "Present thought leadership at industry events", "Manage key client relationships"],
      afternoon: ["Review delivery quality across engagements", "Contribute to consulting practice development", "Build partnerships with technology vendors"],
      tools: ["PowerPoint", "Confluence", "Salesforce", "Miro"],
      environment: "Mix of client-facing work, business development, and internal practice building with significant travel and relationship management.",
    },
    whatYouActuallyDo: [
      "You are a recognized expert who leads complex engagements, develops client relationships, and shapes your consulting firm's offerings and reputation.",
      "In Nordic consulting firms, principal consultants are expected to both sell and deliver, building trusted advisor relationships with senior client leaders.",
    ],
    whoThisIsGoodFor: ["Experienced consultants who want to shape a practice", "People who enjoy both client delivery and business development", "Thought leaders who like speaking and writing about their domain", "Those who want autonomy and influence within a firm"],
    topSkills: ["Client relationship management", "Business development", "Thought leadership", "Engagement leadership", "Practice development"],
    entryPaths: ["Senior consultant with deep domain expertise", "Industry expert joining consulting at a senior level", "Management consultant with strong sales track record"],
    realityCheck: "You're expected to sell your own work and deliver it at the same time — utilization targets and revenue pressure never stop.",
  },
  "consulting-partner": {
    typicalDay: {
      morning: ["Meet with prospective clients on new opportunities", "Set strategic direction for consulting practice", "Review P&L and utilization metrics"],
      midday: ["Lead executive client workshops", "Negotiate contracts and scope with procurement", "Drive firm-wide initiatives and governance"],
      afternoon: ["Develop key accounts and expand relationships", "Mentor principals and senior consultants", "Represent the firm at industry events"],
      tools: ["Salesforce", "PowerPoint", "Excel", "LinkedIn"],
      environment: "High-level client meetings, firm leadership activities, and industry events with significant travel and networking.",
    },
    whatYouActuallyDo: [
      "You lead a consulting practice or key accounts, responsible for revenue, client satisfaction, team development, and the firm's market position.",
      "In Norway, consulting partners at firms like Accenture, Deloitte, or boutique Nordic firms manage portfolios of NOK 50-200 million in annual revenue.",
    ],
    whoThisIsGoodFor: ["Natural relationship builders with business acumen", "People who thrive on sales and client development", "Leaders who enjoy building teams and practices", "Those motivated by financial performance and partnership economics"],
    topSkills: ["Business development", "Client executive relationships", "Practice management", "Revenue management", "Strategic leadership"],
    entryPaths: ["Principal consultant with strong revenue track", "Industry executive joining as a lateral partner", "Firm-grown talent through partnership track"],
    realityCheck: "Your compensation is tied to revenue generation — if you can't sell consistently, partnership will be short-lived regardless of your expertise.",
  },
  "independent-consultant": {
    typicalDay: {
      morning: ["Deliver expert advisory to current client", "Review industry developments in your niche", "Prepare workshop or presentation materials"],
      midday: ["Lead client strategy sessions or workshops", "Network with potential clients and partners", "Write proposals or scope new engagements"],
      afternoon: ["Handle business administration and invoicing", "Build personal brand through content creation", "Develop partnerships with other independents"],
      tools: ["Google Workspace", "LinkedIn", "Miro", "Fiken (Norwegian accounting)"],
      environment: "Flexible work from home office, client sites, or co-working spaces. Full autonomy over schedule and client selection.",
    },
    whatYouActuallyDo: [
      "You run your own consulting practice as an enkeltpersonforetak or AS, selling your expertise directly to clients without a firm's overhead or support.",
      "In Norway, independent consultants (selvstendige konsulenter) are common in IT, management consulting, and oil and gas, often earning NOK 1200-2500 per hour through broker platforms.",
    ],
    whoThisIsGoodFor: ["Self-starters who value autonomy and flexibility", "Experienced professionals with strong networks", "People who enjoy the business side of consulting", "Those who prefer choosing their own projects and clients"],
    topSkills: ["Domain expertise", "Business development", "Client management", "Personal branding", "Financial management"],
    entryPaths: ["Senior consultant leaving a firm to go independent", "Industry expert monetizing their knowledge", "Freelancer building a consulting brand"],
    realityCheck: "Freedom is great until the pipeline dries up — you'll spend 20-30% of your time on sales, admin, and unpaid business development.",
  },
  "transformation-consultant": {
    typicalDay: {
      morning: ["Assess client's current state and transformation readiness", "Define target operating model", "Facilitate change impact workshops"],
      midday: ["Design transformation roadmaps and milestones", "Coach client leaders on change management", "Align technology and business transformation streams"],
      afternoon: ["Build business cases for transformation investments", "Track transformation progress and adoption", "Present to steering committee on status"],
      tools: ["Miro", "PowerPoint", "Prosci tools", "Jira"],
      environment: "Client-embedded role working closely with leadership teams through multi-month transformation engagements.",
    },
    whatYouActuallyDo: [
      "You guide organizations through large-scale change, designing and executing transformation programs that span technology, processes, and people.",
      "In Norway, transformation consultants are heavily in demand for energy transition, public sector modernization, and financial services digitalization.",
    ],
    whoThisIsGoodFor: ["People who enjoy fixing how organizations work", "Empathetic leaders who understand human resistance to change", "Systems thinkers who connect technology and organizational design", "Those comfortable with long, complex engagements"],
    topSkills: ["Transformation design", "Change management", "Operating model design", "Stakeholder engagement", "Benefits realization"],
    entryPaths: ["Management consultant specializing in transformation", "Internal change leader moving to consulting", "Project manager expanding to organizational change"],
    realityCheck: "Transformations are messy and slow — you'll need patience and resilience because organizational change takes years, not months.",
  },
  "technology-strategy-consultant": {
    typicalDay: {
      morning: ["Assess client technology landscape and maturity", "Develop technology investment recommendations", "Research emerging technology trends"],
      midday: ["Present technology strategy to CTO or CIO", "Evaluate build-vs-buy and vendor selection decisions", "Align technology roadmap with business strategy"],
      afternoon: ["Build TCO models and business cases", "Facilitate architecture decision workshops", "Review market analyst reports and vendor briefings"],
      tools: ["PowerPoint", "Excel", "Gartner/Forrester", "ArchiMate tools"],
      environment: "Mix of client-site strategy work and research-heavy analysis, working closely with CIOs, CTOs, and enterprise architects.",
    },
    whatYouActuallyDo: [
      "You help organizations make strategic technology decisions — which platforms to invest in, how to modernize, and how to align IT with business goals.",
      "In Norway, technology strategy consultants advise on cloud strategy, platform consolidation, and digital infrastructure for enterprises and public sector.",
    ],
    whoThisIsGoodFor: ["Technologists who think strategically about business impact", "People who enjoy evaluating and comparing technology options", "Communicators who can translate technical complexity for executives", "Those who love staying current on technology trends"],
    topSkills: ["Technology strategy", "Enterprise architecture", "Vendor evaluation", "Business case development", "Executive advisory"],
    entryPaths: ["Enterprise architect moving to consulting", "Technology manager with strategy skills", "Management consultant specializing in technology"],
    realityCheck: "Your strategies are only as good as the client's ability to execute them, and most CIOs already have strong opinions about their technology direction.",
  },
  "enterprise-systems-consultant": {
    typicalDay: {
      morning: ["Gather business requirements from stakeholders", "Map processes to enterprise system capabilities", "Configure and customize system modules"],
      midday: ["Lead solution design workshops", "Coordinate with integration and data teams", "Review system configuration against requirements"],
      afternoon: ["Test system functionality and integrations", "Train key users and super users", "Document solution design and configuration"],
      tools: ["SAP/Oracle/Microsoft Dynamics", "ServiceNow", "Jira", "Azure DevOps"],
      environment: "Client-site implementation projects with a mix of technical configuration, business analysis, and stakeholder workshops.",
    },
    whatYouActuallyDo: [
      "You implement and optimize enterprise systems like SAP, Oracle, or Dynamics 365, translating business needs into system configuration and process design.",
      "In Norway, enterprise systems consultants work across oil and gas, manufacturing, and public sector, often at firms like Avanade, Accenture, or CGI.",
    ],
    whoThisIsGoodFor: ["Detail-oriented people who enjoy system configuration", "Those who like understanding business processes deeply", "Problem-solvers who bridge business and technology", "People who enjoy structured implementation methodologies"],
    topSkills: ["Enterprise system configuration", "Business process mapping", "Requirements gathering", "Integration design", "User training"],
    entryPaths: ["Business analyst specializing in ERP", "IT consultant with enterprise system certifications", "Functional analyst promoted to consultant role"],
    realityCheck: "Enterprise system projects are long and often frustrating — scope creep, data migration headaches, and resistant users are the norm.",
  },
  "erp-transformation-lead": {
    typicalDay: {
      morning: ["Review ERP implementation progress across workstreams", "Align business process owners on design decisions", "Manage vendor relationship with SAP or Oracle"],
      midday: ["Lead fit-gap analysis workshops", "Drive data migration strategy and testing", "Coordinate change management and training plans"],
      afternoon: ["Resolve escalated design conflicts between business and IT", "Report to steering committee on timeline and budget", "Plan cutover and go-live readiness activities"],
      tools: ["SAP S/4HANA or Oracle Cloud", "Jira", "Celonis", "Power BI"],
      environment: "Large enterprise transformation setting with complex stakeholder management, often spanning multiple countries and business units.",
    },
    whatYouActuallyDo: [
      "You lead the end-to-end transformation of an organization's ERP system, which touches every business process from finance to supply chain.",
      "In Norway, ERP transformations are massive undertakings at companies like Equinor, Yara, or Norsk Hydro, often with budgets exceeding NOK 500 million.",
    ],
    whoThisIsGoodFor: ["Leaders who thrive on complex, high-stakes programs", "People who understand both business processes and enterprise technology", "Those comfortable managing large teams and vendor relationships", "Leaders who can navigate organizational politics at every level"],
    topSkills: ["ERP implementation", "Business process transformation", "Program management", "Vendor management", "Change management"],
    entryPaths: ["Enterprise systems consultant with leadership experience", "Program director specializing in ERP", "IT director leading their organization's ERP program"],
    realityCheck: "ERP transformations are among the riskiest projects in IT — budget overruns of 50-200% are common, and failure can be career-defining.",
  },
  "oss-bss-transformation-lead": {
    typicalDay: {
      morning: ["Review OSS/BSS modernization program status", "Align with network and IT architecture teams", "Assess vendor platform capabilities and roadmaps"],
      midday: ["Lead solution design for billing or service management", "Drive integration strategy across legacy and modern systems", "Coordinate with business stakeholders on process redesign"],
      afternoon: ["Manage system integrator delivery and quality", "Report on transformation milestones to CTO or COO", "Plan migration waves and parallel running strategies"],
      tools: ["Amdocs/Ericsson/Nokia NetCrack", "Jira", "ServiceNow", "Kibana"],
      environment: "Telecom operator environment with deep technical complexity, legacy system challenges, and large vendor ecosystems.",
    },
    whatYouActuallyDo: [
      "You lead the modernization of telecom operations and business support systems, enabling operators to launch new services and improve customer experience.",
      "In Norway, this role is critical at operators like Telenor, Telia, and Ice, where legacy BSS/OSS stacks are being replaced to support 5G and digital services.",
    ],
    whoThisIsGoodFor: ["Telecom technology experts who understand end-to-end service delivery", "Leaders comfortable with extremely complex system landscapes", "People who enjoy large-scale integration and migration challenges", "Those who can manage multiple vendors and system integrators simultaneously"],
    topSkills: ["OSS/BSS architecture", "Telecom domain knowledge", "System integration", "Vendor management", "Program management"],
    entryPaths: ["Senior telecom consultant or architect", "IT manager at a telecom operator", "System integrator lead specializing in telecom"],
    realityCheck: "Telecom OSS/BSS transformations are notoriously difficult — the systems are deeply entangled, and parallel running legacy and new is painful and expensive.",
  },

  "fractional-cto": {
    typicalDay: {
      morning: ["Review technical architecture decisions for client A", "Lead sprint planning with distributed dev team", "Assess cloud infrastructure costs and optimization"],
      midday: ["Advisory call with startup founder on tech stack", "Review security audit findings", "Mentor junior engineering leads"],
      afternoon: ["Draft technology roadmap for client B", "Evaluate build-vs-buy decisions", "Prepare board-level tech strategy presentation"],
      tools: ["AWS/Azure/GCP", "Jira", "GitHub", "Slack", "Miro", "Notion"],
      environment: "Remote-first with periodic on-site visits to multiple client offices across Norway. Flexible schedule split between 2-4 companies.",
    },
    whatYouActuallyDo: [
      "You serve as a part-time CTO for multiple companies that need senior tech leadership but cannot justify a full-time executive hire, making architecture, hiring, and strategy decisions.",
      "In Norway's growing startup ecosystem, fractional CTOs are increasingly common in Oslo, Bergen, and Trondheim, bridging the gap for scale-ups between seed and Series B.",
    ],
    whoThisIsGoodFor: ["Deep technical generalists who enjoy variety", "Former CTOs wanting portfolio careers", "Strong communicators who translate tech to business", "Self-starters comfortable with ambiguity"],
    topSkills: ["Software architecture", "Technical strategy", "Team building", "Stakeholder communication", "Cloud infrastructure"],
    entryPaths: ["10+ years as senior engineer or engineering manager then transition", "CTO of a startup that exits, then go fractional", "Management consulting in tech followed by independent practice"],
    realityCheck: "You need a strong personal brand and network to maintain a pipeline of clients, and context-switching between companies is mentally exhausting.",
  },
  "fractional-cio": {
    typicalDay: {
      morning: ["Assess IT governance maturity for a mid-size client", "Review cybersecurity posture and compliance gaps", "Align IT budget with business priorities"],
      midday: ["Lead digital transformation steering committee", "Evaluate enterprise software vendor proposals", "Meet with client CEO on IT strategy"],
      afternoon: ["Draft IT risk management framework", "Review data management policies", "Coach internal IT managers on leadership"],
      tools: ["ServiceNow", "Microsoft 365 Admin", "Power BI", "SAP", "ITIL frameworks", "Archer GRC"],
      environment: "Split between home office and client sites. Typically serves 2-3 organizations simultaneously, often in different industries.",
    },
    whatYouActuallyDo: [
      "You provide senior IT leadership on a part-time basis, overseeing IT strategy, governance, vendor management, and digital transformation for companies that need executive guidance without a full-time CIO.",
      "Norwegian mid-market companies and public sector organizations increasingly use fractional CIOs to navigate digitalization, cloud migration, and compliance with regulations like Schrems II.",
    ],
    whoThisIsGoodFor: ["Experienced IT leaders who want autonomy", "Strategic thinkers with broad IT knowledge", "People who enjoy advising across industries", "Those who prefer variety over deep operational roles"],
    topSkills: ["IT governance", "Digital transformation", "Vendor management", "Cybersecurity oversight", "Budgeting and cost optimization"],
    entryPaths: ["Former CIO or IT director moving to consulting", "Senior IT management consultant going independent", "IT leadership in public sector transitioning to advisory"],
    realityCheck: "Demand is growing but clients often underestimate how much time good IT governance requires, leading to scope creep and pressure to do more for less.",
  },
  "general-manager": {
    typicalDay: {
      morning: ["Review daily KPIs and financial dashboards", "Morning standup with department heads", "Address urgent operational issues"],
      midday: ["Meet with key customer or partner", "Review hiring plans with HR", "Lunch with team leads to stay connected"],
      afternoon: ["Strategic planning session for next quarter", "Approve capital expenditure requests", "One-on-one with underperforming department head"],
      tools: ["SAP/Oracle ERP", "Power BI", "Microsoft Teams", "Salesforce", "Excel"],
      environment: "Office-based with regular visits to production or service sites. High visibility role with constant interaction across all departments.",
    },
    whatYouActuallyDo: [
      "You run the day-to-day operations of a business or business unit, owning the P&L and ensuring all departments work together to deliver results.",
      "In Norway, general managers balance the flat organizational culture with clear accountability, often managing both Norwegian and international teams in companies like Aker, Kongsberg, or regional enterprises.",
    ],
    whoThisIsGoodFor: ["Natural leaders who thrive on responsibility", "People who enjoy solving diverse problems daily", "Strong communicators across all levels", "Those energized by seeing direct business impact"],
    topSkills: ["P&L management", "People leadership", "Operational excellence", "Strategic thinking", "Cross-functional collaboration"],
    entryPaths: ["Rise through functional leadership (sales, operations, finance)", "MBA followed by management trainee program", "Entrepreneurial experience running own business"],
    realityCheck: "You are accountable for everything but control very little directly—success depends entirely on your ability to lead through others.",
  },
  "business-unit-director": {
    typicalDay: {
      morning: ["Analyze monthly revenue and margin reports", "Strategic alignment call with group CEO", "Review market intelligence and competitor moves"],
      midday: ["Lead business unit leadership team meeting", "Customer visit with sales director", "Approve product development priorities"],
      afternoon: ["Work on annual business plan", "Talent review and succession planning", "Board preparation for quarterly review"],
      tools: ["SAP", "Power BI", "Salesforce", "Microsoft Teams", "Excel", "Board portal software"],
      environment: "Corporate office with frequent travel to business unit locations. High-pressure role balancing group-level expectations with unit-level realities.",
    },
    whatYouActuallyDo: [
      "You lead an entire business unit as a profit center, setting strategy, managing the leadership team, and delivering financial results to the group or parent company.",
      "In large Norwegian companies like DNB, Telenor, or Equinor, business unit directors run divisions that can be the size of independent companies, often with international scope.",
    ],
    whoThisIsGoodFor: ["Ambitious leaders with entrepreneurial drive", "People comfortable with board-level accountability", "Strategic thinkers who also execute", "Those who thrive managing complex organizations"],
    topSkills: ["Strategic leadership", "Financial management", "Organizational design", "Market development", "Executive communication"],
    entryPaths: ["Promoted from functional VP role within the business unit", "Lateral move from consulting or strategy roles", "External hire with industry expertise and P&L experience"],
    realityCheck: "You have significant autonomy but are ultimately judged on financial numbers, and political navigation with group leadership is a constant undercurrent.",
  },
  "managing-director": {
    typicalDay: {
      morning: ["Review overnight developments and market news", "Executive committee meeting", "Meet with CFO on financial performance"],
      midday: ["Customer or investor lunch", "Review strategic initiative progress", "Media or stakeholder engagement"],
      afternoon: ["Lead organizational change initiative", "One-on-ones with direct reports", "Prepare for board meeting"],
      tools: ["ERP dashboards", "Bloomberg/Reuters", "Microsoft Teams", "Board portal", "CRM"],
      environment: "Corner office or executive floor with constant meetings. Mix of internal leadership, external representation, and strategic work. Significant travel.",
    },
    whatYouActuallyDo: [
      "You are the top executive running an entire company or major subsidiary, responsible for strategy, culture, financial performance, and stakeholder relationships.",
      "In Norway, managing directors (daglig leder) have specific legal obligations under aksjeloven and must navigate the unique dynamics of Norwegian board structures and employee representation.",
    ],
    whoThisIsGoodFor: ["Seasoned leaders who want ultimate responsibility", "Excellent relationship builders", "People with high stress tolerance and resilience", "Visionary thinkers who can also manage details"],
    topSkills: ["Executive leadership", "Board management", "Strategic vision", "Stakeholder management", "Crisis leadership"],
    entryPaths: ["Promoted from COO or business unit director role", "Recruited externally via executive search", "Founder who grows into the role as company scales"],
    realityCheck: "The role is lonely at the top—everyone wants your time, few give you honest feedback, and you bear personal legal responsibility for the company's conduct.",
  },
  "country-manager": {
    typicalDay: {
      morning: ["Review local market performance vs targets", "Call with regional HQ on strategic priorities", "Meet with local sales and marketing team"],
      midday: ["Customer meeting or industry event", "Coordinate with global product teams on local needs", "Government or regulatory stakeholder engagement"],
      afternoon: ["Review local hiring and talent pipeline", "Adapt global strategy to Norwegian market", "Report preparation for regional leadership"],
      tools: ["Salesforce", "SAP", "Power BI", "Microsoft Teams", "Zoom", "Local ERP systems"],
      environment: "Office in Oslo or major Norwegian city, representing an international company. Bridges global corporate culture with Norwegian work norms.",
    },
    whatYouActuallyDo: [
      "You run the Norwegian operations of an international company, adapting global strategy to local market conditions while managing P&L and all local functions.",
      "In Norway, country managers must navigate strong labor laws, tariff agreements, and the egalitarian business culture while meeting HQ expectations that may not always align with Nordic practices.",
    ],
    whoThisIsGoodFor: ["Culturally adaptable leaders", "People who enjoy being the local face of a global brand", "Those comfortable managing up and across matrix structures", "Entrepreneurial mindsets within corporate frameworks"],
    topSkills: ["Cross-cultural leadership", "Local market expertise", "Matrix management", "P&L ownership", "Regulatory navigation"],
    entryPaths: ["Senior sales or commercial leader promoted internally", "Expat assignment from HQ into the Norwegian market", "Local industry expert hired to lead market entry"],
    realityCheck: "You often have responsibility without full authority, caught between global standardization and local adaptation, and HQ rarely understands Norwegian workplace dynamics.",
  },
  "regional-director": {
    typicalDay: {
      morning: ["Review performance across Nordic or European markets", "Call with country managers on quarterly targets", "Strategic planning for regional expansion"],
      midday: ["Travel to visit subsidiary or key client", "Align regional initiatives with global strategy", "Review talent across the region"],
      afternoon: ["Regional leadership team meeting", "Budget reallocation between markets", "Prepare regional business review for global leadership"],
      tools: ["SAP", "Salesforce", "Power BI", "Microsoft Teams", "Concur", "Workday"],
      environment: "Based in a regional hub (often Oslo or Stockholm) with extensive travel across the Nordics or Europe. Lives in airports and hotels regularly.",
    },
    whatYouActuallyDo: [
      "You oversee business operations across multiple countries in a region, setting strategy, allocating resources, and ensuring consistent performance across diverse markets.",
      "Nordic regional directors often manage the Scandinavian or Northern European cluster, balancing similar but distinct markets with different regulations and customer behaviors.",
    ],
    whoThisIsGoodFor: ["Leaders comfortable with ambiguity and complexity", "Frequent travelers who thrive across cultures", "Strategic thinkers who delegate execution well", "People who enjoy building regional cohesion"],
    topSkills: ["Multi-market management", "Strategic resource allocation", "Cross-cultural leadership", "Executive communication", "Change management"],
    entryPaths: ["Country manager promoted to oversee multiple markets", "Senior strategy or consulting leader moving to line management", "Internal high-potential fast-tracked through leadership programs"],
    realityCheck: "You are far enough from the frontline to lose touch easily, yet close enough to be blamed when things go wrong—travel fatigue is real and relationships suffer.",
  },
  "operations-director": {
    typicalDay: {
      morning: ["Review operational KPIs and daily production reports", "Morning huddle with operations managers", "Address supply chain disruptions or quality issues"],
      midday: ["Process improvement workshop with lean team", "Vendor negotiation for key materials", "Safety and compliance review"],
      afternoon: ["Capital investment planning for new equipment", "Workforce planning with HR", "Report to CEO on operational performance"],
      tools: ["SAP/Oracle", "Power BI", "Lean/Six Sigma tools", "EHS software", "Microsoft Project", "AutoCAD"],
      environment: "Split between office and production floor or service delivery centers. Hands-on leadership role requiring visibility across all operational areas.",
    },
    whatYouActuallyDo: [
      "You lead the entire operations function, ensuring efficient delivery of products or services while managing cost, quality, safety, and continuous improvement.",
      "In Norwegian industries like maritime, energy, aquaculture, and manufacturing, operations directors must meet strict HSE standards and work closely with unions and employee representatives.",
    ],
    whoThisIsGoodFor: ["Systematic thinkers who love optimization", "Leaders who enjoy being close to the product or service", "People who thrive on solving practical problems daily", "Those who value measurable results"],
    topSkills: ["Operational excellence", "Supply chain management", "Lean/Six Sigma", "HSE leadership", "Budget management"],
    entryPaths: ["Rise through production or operations management roles", "Engineering background transitioning to operations leadership", "Supply chain or logistics career progressing to director level"],
    realityCheck: "Everything that goes wrong in delivery lands on your desk, and you must constantly balance cost pressure from finance with quality demands from customers.",
  },
  "head-of-operations": {
    typicalDay: {
      morning: ["Review service delivery metrics and SLAs", "Daily standup with team leads", "Prioritize operational issues and escalations"],
      midday: ["Process mapping and improvement session", "Cross-functional meeting with product and engineering", "Vendor performance review"],
      afternoon: ["Capacity planning for next quarter", "Develop operational playbooks and procedures", "Coach and develop operations managers"],
      tools: ["Jira/ServiceNow", "Confluence", "Power BI", "Slack", "Monday.com", "Google Workspace"],
      environment: "Typically office or remote-hybrid, especially in tech and services companies. More hands-on than an operations director, closer to daily execution.",
    },
    whatYouActuallyDo: [
      "You manage the operational backbone of the company, ensuring processes run smoothly, teams are effective, and the organization scales without breaking.",
      "In Norwegian scale-ups and mid-size companies, heads of operations often wear multiple hats, covering everything from facilities to customer operations to internal tooling.",
    ],
    whoThisIsGoodFor: ["Detail-oriented organizers who see the big picture", "People who enjoy building systems and processes", "Those who like making things run better every day", "Calm problem-solvers who handle chaos well"],
    topSkills: ["Process design", "Team management", "Data-driven decision making", "Vendor management", "Scalability planning"],
    entryPaths: ["Operations manager promoted to head of function", "Project manager transitioning to operational leadership", "Consultant moving into an in-house operations role"],
    realityCheck: "You are the person everyone calls when something breaks, and your best work is invisible—nobody notices when operations run smoothly.",
  },
  "corporate-lawyer": {
    typicalDay: {
      morning: ["Review and draft commercial contracts", "Advise on regulatory compliance questions", "Research recent legal developments"],
      midday: ["Negotiate terms with counterparty counsel", "Internal client meeting on M&A due diligence", "Review board documentation"],
      afternoon: ["Draft shareholder agreement amendments", "Advise on employment law matter", "Update contract templates and legal playbooks"],
      tools: ["Lovdata Pro", "Gyldendal Rettsdata", "Microsoft Word", "Contract management systems", "SharePoint", "Teams"],
      environment: "Office-based in a law firm or corporate legal department. Document-heavy work with regular client or stakeholder interaction.",
    },
    whatYouActuallyDo: [
      "You provide legal advice on corporate matters including contracts, M&A, governance, and regulatory compliance, either in a law firm or as in-house counsel.",
      "Norwegian corporate lawyers work within a civil law system with specific rules like aksjeloven and must understand EEA/EU regulations that increasingly shape Norwegian business law.",
    ],
    whoThisIsGoodFor: ["Analytically rigorous and detail-oriented people", "Strong writers with excellent Norwegian and English", "Those who enjoy solving complex puzzles within rules", "People who value precision and accuracy"],
    topSkills: ["Contract drafting and negotiation", "Corporate governance", "Regulatory compliance", "Legal research", "Risk assessment"],
    entryPaths: ["Master i rettsvitenskap from Norwegian university", "Law firm associate progressing to senior roles", "Transition from law firm to in-house corporate role"],
    realityCheck: "The work can be intellectually stimulating but also repetitive, and the hours in top law firms like Wiersholm, Thommessen, or Schjødt can be demanding.",
  },
  "senior-legal-counsel": {
    typicalDay: {
      morning: ["Advise business unit on complex contract negotiation", "Review regulatory change impact assessment", "Lead legal team standup"],
      midday: ["Board committee preparation on governance matters", "Manage external counsel on litigation matter", "Strategic legal risk assessment"],
      afternoon: ["Draft legal policy or guideline", "Mentor junior lawyers", "Cross-functional meeting on product compliance"],
      tools: ["Lovdata Pro", "Contract lifecycle management tools", "SharePoint", "Microsoft Teams", "Legal project management software"],
      environment: "In-house corporate legal department, typically in a large Norwegian or multinational company. Mix of strategic advisory and hands-on legal work.",
    },
    whatYouActuallyDo: [
      "You are a senior in-house lawyer who handles the most complex legal matters, advises executive leadership, manages external counsel, and shapes legal strategy for the business.",
      "In Norwegian corporates like Equinor, DNB, or Telenor, senior legal counsel often specialize in areas like energy regulation, financial services law, or telecom compliance.",
    ],
    whoThisIsGoodFor: ["Lawyers who want business impact over billable hours", "Strategic thinkers with commercial awareness", "People who enjoy being embedded in a business", "Those who prefer depth in one organization over variety"],
    topSkills: ["Strategic legal advisory", "Contract negotiation", "Regulatory compliance", "Stakeholder management", "External counsel management"],
    entryPaths: ["5-10 years in a top law firm then move in-house", "Promoted from legal counsel within the same company", "Government or regulatory body experience transitioning to private sector"],
    realityCheck: "You gain business insight and better work-life balance than a law firm, but may feel isolated from legal peers and must accept that legal is often seen as a cost center.",
  },
  "general-counsel": {
    typicalDay: {
      morning: ["Executive team meeting on company strategy", "Review high-stakes litigation update", "Advise CEO on regulatory risk"],
      midday: ["Board meeting preparation", "Manage legal department budget and priorities", "Meet with external law firms on major matter"],
      afternoon: ["Crisis management on compliance incident", "Legal team leadership meeting", "Review M&A transaction documents"],
      tools: ["Board portal software", "Lovdata Pro", "Contract management platform", "Microsoft 365", "Legal spend management tools"],
      environment: "Executive floor of a large corporation. Split between strategic leadership, crisis response, and legal department management.",
    },
    whatYouActuallyDo: [
      "You lead the entire legal function as the top lawyer in the organization, serving on the executive team and advising the board on all legal, regulatory, and governance matters.",
      "In Norway, general counsel must navigate Norwegian corporate law, EEA regulations, and increasingly complex ESG and sustainability reporting requirements.",
    ],
    whoThisIsGoodFor: ["Senior lawyers who want executive leadership roles", "People who combine legal expertise with business acumen", "Leaders who thrive in high-stakes decision environments", "Those comfortable being the final legal authority"],
    topSkills: ["Executive leadership", "Corporate governance", "Risk management", "Legal team management", "Board advisory"],
    entryPaths: ["Senior legal counsel promoted to lead the function", "Partner at a law firm moving to top in-house role", "General counsel at a smaller company moving to a larger one"],
    realityCheck: "You carry enormous personal and professional liability, the board expects you to say 'yes' creatively while managing real risk, and you often deliver bad news.",
  },
  "head-of-legal": {
    typicalDay: {
      morning: ["Prioritize legal team workload for the week", "Advise management on contract dispute", "Review compliance training program"],
      midday: ["Negotiate partnership agreement", "Meet with data protection officer on GDPR matter", "Manage relationship with external law firm"],
      afternoon: ["Legal risk reporting to leadership", "Develop legal department processes and tools", "One-on-one coaching with legal team members"],
      tools: ["Lovdata Pro", "Contract management software", "Jira/Asana for legal ops", "Microsoft 365", "E-discovery tools"],
      environment: "In-house legal department of a mid-size company. More operational than general counsel in a large corporation, handling both strategy and hands-on legal work.",
    },
    whatYouActuallyDo: [
      "You lead a legal team in a mid-size organization, combining hands-on legal work with team management, process improvement, and strategic advisory to leadership.",
      "In Norwegian mid-market companies, heads of legal often handle everything from employment law and GDPR to commercial contracts and corporate governance with a small team.",
    ],
    whoThisIsGoodFor: ["Lawyers who want leadership without losing the craft", "Generalists who enjoy breadth over specialization", "People who like building teams and processes", "Those who want impact in a smaller organization"],
    topSkills: ["Legal generalism", "Team leadership", "Process optimization", "Commercial contracts", "Regulatory compliance"],
    entryPaths: ["Senior associate in law firm moving in-house to lead", "Legal counsel promoted to head the function", "Lawyer with both private practice and in-house experience"],
    realityCheck: "You will handle everything from minor HR disputes to major transactions, often with limited resources, and must be comfortable saying 'I need to research that.'",
  },
  "compliance-director": {
    typicalDay: {
      morning: ["Review compliance monitoring reports", "Update risk assessment matrix", "Brief executive team on regulatory changes"],
      midday: ["Lead compliance committee meeting", "Investigate whistleblower report", "Meet with external auditors"],
      afternoon: ["Design compliance training program", "Review and update policies and procedures", "Regulatory filing preparation"],
      tools: ["GRC platforms (Archer, ServiceNow)", "Power BI", "Case management systems", "E-learning platforms", "Microsoft 365"],
      environment: "Corporate office in a regulated industry. Mix of strategic oversight, investigation work, and stakeholder engagement across all levels.",
    },
    whatYouActuallyDo: [
      "You build and lead the compliance function, ensuring the organization meets all regulatory obligations, manages compliance risks, and fosters an ethical culture.",
      "In Norway, compliance directors are critical in banking (Finanstilsynet oversight), energy, healthcare, and any company subject to anti-money laundering (hvitvaskingsloven) or sanctions regulations.",
    ],
    whoThisIsGoodFor: ["Principled professionals who value integrity", "Detail-oriented people with strong judgment", "Those who can be firm yet diplomatic", "People who enjoy building frameworks and systems"],
    topSkills: ["Regulatory knowledge", "Risk assessment", "Investigation and reporting", "Policy development", "Stakeholder influence"],
    entryPaths: ["Lawyer or auditor specializing in compliance", "Regulatory body experience transitioning to private sector", "Risk management professional moving into compliance leadership"],
    realityCheck: "You are often seen as the person who says 'no,' and when compliance works well nobody notices, but failures make headlines and end careers.",
  },
  "regulatory-affairs-director": {
    typicalDay: {
      morning: ["Monitor regulatory developments from EU/EEA and Norwegian authorities", "Prepare submission for regulatory approval", "Brief leadership on upcoming regulatory changes"],
      midday: ["Meet with regulators or industry bodies", "Review product labeling and compliance documentation", "Coordinate with R&D on regulatory requirements"],
      afternoon: ["Lead regulatory strategy session for new product", "Industry association meeting (e.g., LMI, Norsk Industri)", "Train teams on regulatory obligations"],
      tools: ["Regulatory databases", "Document management systems", "Microsoft 365", "Veeva Vault (pharma)", "EU regulatory portals"],
      environment: "Office-based in pharma, medtech, energy, or food industries. Regular interaction with government agencies and industry bodies.",
    },
    whatYouActuallyDo: [
      "You manage the regulatory strategy and submissions that allow your company to develop, manufacture, and sell products in compliance with Norwegian and EU/EEA regulations.",
      "In Norway, this role is especially prominent in pharmaceuticals (Legemiddelverket), energy (OED/Miljødirektoratet), aquaculture (Mattilsynet), and maritime (Sjøfartsdirektoratet).",
    ],
    whoThisIsGoodFor: ["Meticulous professionals who enjoy regulatory complexity", "People who can translate regulations into practical guidance", "Those who enjoy government and industry interface", "Patient individuals comfortable with long approval timelines"],
    topSkills: ["Regulatory strategy", "Submission management", "Scientific or technical literacy", "Government relations", "Cross-functional coordination"],
    entryPaths: ["Science or engineering degree followed by regulatory affairs specialization", "Government regulator moving to industry", "Quality assurance professional transitioning to regulatory"],
    realityCheck: "Regulatory timelines are glacial, a single mistake in a submission can delay a product by months, and regulations change constantly so you never stop learning.",
  },
  "risk-and-compliance-director": {
    typicalDay: {
      morning: ["Review enterprise risk dashboard", "Lead risk committee preparation", "Assess emerging risks from geopolitical or market developments"],
      midday: ["Compliance monitoring review meeting", "Coordinate internal audit findings response", "Update board risk report"],
      afternoon: ["Design risk appetite framework", "Anti-money laundering program review", "Third-party risk assessment for new vendor"],
      tools: ["GRC platforms (Archer, MetricStream)", "Power BI", "Risk management software", "Microsoft 365", "Audit management tools"],
      environment: "Corporate headquarters in financial services, energy, or large enterprise. High visibility role with board-level reporting responsibilities.",
    },
    whatYouActuallyDo: [
      "You lead the combined risk management and compliance function, ensuring the organization identifies, assesses, and mitigates risks while meeting all regulatory requirements.",
      "In Norwegian financial services and energy companies, this dual role reflects the increasing convergence of risk and compliance, especially under Finanstilsynet and EU regulatory frameworks.",
    ],
    whoThisIsGoodFor: ["Analytical thinkers with strong business judgment", "People who can see both forest and trees", "Professionals who thrive on structured frameworks", "Those comfortable presenting to boards and regulators"],
    topSkills: ["Enterprise risk management", "Regulatory compliance", "Board reporting", "Internal controls", "Crisis preparedness"],
    entryPaths: ["Risk management or compliance specialist progressing to leadership", "Big Four advisory moving in-house", "Internal audit career transitioning to risk and compliance"],
    realityCheck: "You manage a function that only gets attention when something goes wrong, and you must constantly advocate for investment in prevention over reaction.",
  },
  "data-protection-officer": {
    typicalDay: {
      morning: ["Review data processing impact assessment (DPIA)", "Monitor GDPR compliance across departments", "Respond to data subject access request"],
      midday: ["Advise product team on privacy-by-design", "Investigate potential data breach", "Meet with Datatilsynet on regulatory inquiry"],
      afternoon: ["Update privacy policies and records of processing", "Conduct privacy awareness training", "Review vendor data processing agreements"],
      tools: ["OneTrust/TrustArc", "Data mapping tools", "Incident management systems", "Microsoft 365", "Lovdata Pro"],
      environment: "In-house corporate role with independence requirements under GDPR. Works across all departments that handle personal data.",
    },
    whatYouActuallyDo: [
      "You are the organization's independent privacy expert, ensuring GDPR and Norwegian personopplysningsloven compliance, advising on data processing activities, and serving as the contact point for Datatilsynet.",
      "In Norway, DPOs are mandatory for public authorities and companies processing large-scale sensitive data, and the role has gained significant importance with Schrems II and increasing Datatilsynet enforcement.",
    ],
    whoThisIsGoodFor: ["Privacy-passionate professionals with legal or tech backgrounds", "Independent thinkers who can challenge the organization", "Detail-oriented people who enjoy cross-functional work", "Those who value protecting individual rights"],
    topSkills: ["GDPR expertise", "Privacy impact assessment", "Data governance", "Incident response", "Stakeholder advisory"],
    entryPaths: ["Lawyer specializing in privacy and data protection", "IT security professional adding privacy specialization", "CIPP/E certification combined with relevant experience"],
    realityCheck: "You must maintain independence while being employed by the organization you oversee, and many companies still treat privacy as a checkbox rather than a strategic priority.",
  },
  "chief-people-officer": {
    typicalDay: {
      morning: ["Executive team meeting on organizational strategy", "Review employee engagement survey results", "Meet with board compensation committee"],
      midday: ["Lead culture transformation initiative", "Talent review with business unit leaders", "Diversity, equity, and inclusion strategy session"],
      afternoon: ["Workforce planning for next fiscal year", "Negotiate with union representatives", "Coach senior leaders on people challenges"],
      tools: ["Workday/SAP SuccessFactors", "Culture Amp/Peakon", "Power BI", "Microsoft Teams", "LinkedIn Talent Insights"],
      environment: "Executive floor of a large organization. Strategic role with high visibility and direct influence on company culture and talent decisions.",
    },
    whatYouActuallyDo: [
      "You lead the entire people function at the executive level, shaping culture, talent strategy, organizational design, and employee experience as a key member of the C-suite.",
      "In Norway's consensus-driven business culture, CPOs must balance the arbeidsmiljøloven framework, strong union relationships, and Nordic flat hierarchies with global talent competition.",
    ],
    whoThisIsGoodFor: ["HR leaders who want strategic executive impact", "People who genuinely care about organizational culture", "Those who can balance empathy with tough decisions", "Leaders comfortable navigating unions and regulations"],
    topSkills: ["Organizational strategy", "Culture leadership", "Executive coaching", "Labor relations", "Talent management"],
    entryPaths: ["HR director promoted to C-suite", "Organizational psychologist transitioning to executive HR", "Management consultant specializing in people and organization"],
    realityCheck: "You set the people agenda but every manager in the company is responsible for executing it, and you often take the blame for culture problems you inherited.",
  },
  "hr-director": {
    typicalDay: {
      morning: ["Review HR metrics and headcount reports", "Strategic HR planning with leadership team", "Handle complex employee relations case"],
      midday: ["Meet with union representatives on collective agreement", "Review compensation and benefits benchmarking", "Lead HR team meeting"],
      afternoon: ["Develop leadership development program", "Review recruitment pipeline with talent team", "Advise manager on performance management"],
      tools: ["Workday/SAP SuccessFactors", "Simployer", "Power BI", "LinkedIn Recruiter", "Microsoft Teams"],
      environment: "Corporate office with presence across multiple sites. Balances strategic HR work with operational HR leadership.",
    },
    whatYouActuallyDo: [
      "You lead the HR function, managing everything from talent acquisition and development to compensation, employee relations, and compliance with Norwegian labor law.",
      "Norwegian HR directors spend significant time on tariffavtaler (collective agreements), arbeidsmiljøloven compliance, and the tripartite collaboration model that is central to Norwegian working life.",
    ],
    whoThisIsGoodFor: ["People-oriented leaders with business acumen", "Those who enjoy the full breadth of HR", "Skilled negotiators and mediators", "Professionals who value fairness and structure"],
    topSkills: ["Norwegian labor law", "Talent management", "Compensation and benefits", "Union negotiation", "Organizational development"],
    entryPaths: ["HR business partner progressing through seniority", "Employment lawyer transitioning to HR leadership", "HR specialist broadening into generalist leadership"],
    realityCheck: "You spend more time on compliance, union relations, and difficult conversations than on the strategic people work you envisioned when taking the role.",
  },
  "head-of-talent": {
    typicalDay: {
      morning: ["Review recruitment funnel metrics and time-to-hire", "Employer branding strategy session", "Align hiring plans with business growth targets"],
      midday: ["Design assessment and selection process for key role", "Meet with hiring managers on talent needs", "Review talent development and succession plans"],
      afternoon: ["University partnership and early careers program planning", "Optimize ATS and recruitment technology stack", "Develop internal mobility framework"],
      tools: ["LinkedIn Recruiter", "Teamtailor/Workday Recruiting", "Culture Amp", "Assessment platforms", "Microsoft Teams"],
      environment: "Corporate or scale-up office. High-energy role connecting with candidates, hiring managers, and leadership across the organization.",
    },
    whatYouActuallyDo: [
      "You lead talent acquisition and development strategy, ensuring the organization attracts, hires, and retains the right people to achieve its goals.",
      "In Norway's tight labor market with low unemployment, heads of talent must compete fiercely for skilled workers, especially in tech, engineering, and healthcare.",
    ],
    whoThisIsGoodFor: ["People who love connecting talent with opportunity", "Data-driven HR professionals", "Creative thinkers with strong marketing instincts", "Those who enjoy building teams and processes"],
    topSkills: ["Talent acquisition strategy", "Employer branding", "Assessment and selection", "Talent development", "HR analytics"],
    entryPaths: ["Senior recruiter or recruitment manager promoted to lead", "HR business partner specializing in talent", "Consulting or agency recruitment transitioning in-house"],
    realityCheck: "Hiring managers always want people yesterday, budgets are never enough, and in Norway's candidate-driven market, your best candidates often have three other offers.",
  },
  "org-transformation-director": {
    typicalDay: {
      morning: ["Review transformation program status across workstreams", "Executive steering committee meeting", "Assess organizational readiness for change"],
      midday: ["Facilitate organizational design workshop", "Meet with change management team on communication plan", "Analyze employee feedback on transformation"],
      afternoon: ["Design new operating model for business unit", "Stakeholder mapping and engagement planning", "Present transformation roadmap to board"],
      tools: ["Miro", "Microsoft Teams", "Prosci tools", "Power BI", "Asana/Monday.com", "Survey platforms"],
      environment: "Project-based environment within a large organization undergoing significant change. Heavy facilitation and stakeholder engagement.",
    },
    whatYouActuallyDo: [
      "You lead large-scale organizational transformations, redesigning structures, processes, and ways of working to achieve strategic objectives.",
      "In Norway, transformation directors must navigate the co-determination rights of employees (medbestemmelsesrett) and work closely with unions when restructuring, making change slower but more sustainable.",
    ],
    whoThisIsGoodFor: ["Change leaders who thrive in complexity", "People who enjoy redesigning how work gets done", "Strong facilitators and communicators", "Those comfortable with uncertainty and resistance"],
    topSkills: ["Change management", "Organizational design", "Program management", "Stakeholder engagement", "Strategic communication"],
    entryPaths: ["Management consultant specializing in transformation", "HR leader with organizational development expertise", "Senior project manager moving into organizational change"],
    realityCheck: "Most transformations fail or underdeliver, people resist change even when they agree with it, and your role may be eliminated once the transformation is 'complete.'",
  },
  "workforce-strategy-director": {
    typicalDay: {
      morning: ["Analyze workforce data and future skills gaps", "Review workforce planning models", "Brief CHRO on strategic workforce insights"],
      midday: ["Lead scenario planning workshop for future workforce needs", "Collaborate with finance on labor cost modeling", "Meet with business leaders on headcount strategy"],
      afternoon: ["Design contingent workforce strategy", "Evaluate HR technology for workforce analytics", "Develop skills taxonomy and competency frameworks"],
      tools: ["Visier/Workday Analytics", "Power BI", "Excel/Python", "LinkedIn Talent Insights", "Organizational network analysis tools"],
      environment: "Corporate headquarters, often in HR strategy or people analytics function. Data-heavy strategic role with cross-functional collaboration.",
    },
    whatYouActuallyDo: [
      "You lead the strategic planning of the organization's workforce, using data and analytics to forecast talent needs, design workforce models, and close skills gaps.",
      "In Norway, workforce strategy directors address challenges like an aging population, skills shortages in STEM, and the balance between permanent employees and contractors within Norwegian labor regulations.",
    ],
    whoThisIsGoodFor: ["Analytical HR professionals who love data", "Strategic thinkers with workforce planning experience", "People who enjoy long-term planning over daily HR operations", "Those who bridge HR and business strategy"],
    topSkills: ["Workforce analytics", "Strategic planning", "Labor market analysis", "Financial modeling", "Skills framework design"],
    entryPaths: ["People analytics leader expanding into strategy", "Management consultant in workforce transformation", "HR business partner with strong analytical skills progressing upward"],
    realityCheck: "Your models and forecasts are only as good as the data and assumptions behind them, and convincing leaders to invest in long-term workforce planning over short-term hiring is a constant battle.",
  },
  "independent-contractor-technical": {
    typicalDay: {
      morning: ["Deep technical work on current client project", "Code review or architecture documentation", "Daily standup with client development team"],
      midday: ["Technical design discussion with client stakeholders", "Research new technology or approach for a problem", "Update project documentation"],
      afternoon: ["Implement solution or build prototype", "Mentor client team members on technical approach", "Admin tasks: invoicing, contracts, tax prep via Fiken"],
      tools: ["VS Code/IntelliJ", "GitHub/GitLab", "Docker/Kubernetes", "Cloud platforms", "Fiken/Tripletex (accounting)", "Slack"],
      environment: "Remote or at client offices. Autonomous work with deep focus periods. Must manage own business (ENK or AS) alongside technical delivery.",
    },
    whatYouActuallyDo: [
      "You are a self-employed technical specialist (consultant) who contracts with companies to deliver expert technical work, typically in software development, architecture, data, or infrastructure.",
      "In Norway, independent technical contractors (selvstendig konsulent) often operate through their own AS or via broker firms like Experis or Elan, billing 1000-1800 NOK/hour for senior expertise.",
    ],
    whoThisIsGoodFor: ["Senior technologists who want autonomy and high earnings", "Self-disciplined professionals comfortable with business risk", "People who enjoy variety across different companies", "Those who value freedom over corporate career paths"],
    topSkills: ["Deep technical expertise", "Client management", "Self-marketing and sales", "Business administration", "Adaptability"],
    entryPaths: ["Senior developer or architect leaving permanent employment", "Consultant from a consultancy going independent", "Technical specialist building reputation through open source or speaking"],
    realityCheck: "The hourly rate looks amazing until you account for no paid vacation, pension, sick pay, bench time between contracts, and the constant hustle of finding next engagements.",
  },
  "independent-program-director": {
    typicalDay: {
      morning: ["Program status review across all workstreams", "Risk and issue escalation meeting", "Stakeholder alignment call with executive sponsor"],
      midday: ["Budget and resource review with PMO", "Vendor coordination meeting", "Client steering committee preparation"],
      afternoon: ["Coach project managers on delivery challenges", "Update program roadmap and milestones", "Business development call for next engagement"],
      tools: ["Microsoft Project/Clarity", "Jira", "Power BI", "Microsoft Teams", "Miro", "Confluence"],
      environment: "Client site or remote. Embedded in client organization for 6-18 month engagements. Operates as own business while leading large client programs.",
    },
    whatYouActuallyDo: [
      "You are an independent consultant who leads large, complex programs for clients—coordinating multiple projects, managing senior stakeholders, and ensuring strategic outcomes are delivered.",
      "In Norway, independent program directors are common in public sector digitalization (e.g., NAV, Helse), energy transformation, and large corporate change programs.",
    ],
    whoThisIsGoodFor: ["Experienced program managers seeking independence", "Leaders who enjoy parachuting into complex situations", "People with strong networks and reputations", "Those comfortable with high responsibility and business risk"],
    topSkills: ["Program management", "Stakeholder management", "Strategic delivery", "Risk management", "Executive communication"],
    entryPaths: ["Senior program manager at a consultancy going independent", "IT director or delivery leader transitioning to consulting", "PMO leader building independent practice through network"],
    realityCheck: "You carry the accountability of a senior executive without the safety net of employment, and when programs fail, it is the external consultant who is easiest to blame.",
  },
  "independent-transformation-lead": {
    typicalDay: {
      morning: ["Transformation program health check", "Change readiness assessment workshop", "Coach client executives on leading change"],
      midday: ["Design future-state operating model with client team", "Stakeholder engagement and resistance management", "Review communication and training plans"],
      afternoon: ["Facilitate cross-functional transformation workshop", "Update transformation business case and benefits tracking", "Network and business development for pipeline"],
      tools: ["Miro", "Microsoft Teams", "Prosci ADKAR", "Power BI", "Notion", "Survey tools"],
      environment: "Client site or remote, embedded in the client organization. Project-based engagements of 6-24 months. Self-employed through own AS.",
    },
    whatYouActuallyDo: [
      "You are an independent consultant who leads organizational transformations for clients, designing new operating models, driving change adoption, and ensuring the transformation delivers business value.",
      "In Norway, independent transformation leads are sought after in public sector reform, energy transition, and digital transformations, navigating co-determination and consensus-driven decision-making.",
    ],
    whoThisIsGoodFor: ["Experienced change leaders who want consulting freedom", "People who energize others through uncertainty", "Strategic thinkers with strong facilitation skills", "Those who build trust quickly across organizations"],
    topSkills: ["Transformation leadership", "Change management", "Operating model design", "Executive coaching", "Benefits realization"],
    entryPaths: ["Senior transformation consultant at McKinsey, BCG, or Implement going independent", "Internal transformation leader building a consulting practice", "OD specialist with strong consulting network"],
    realityCheck: "Clients hire you for transformation but often resist the very changes you recommend, and success depends on executive sponsorship you cannot control.",
  },
  "investment-manager": {
    typicalDay: {
      morning: ["Review portfolio performance and market developments", "Investment committee preparation", "Analyze new investment opportunity"],
      midday: ["Due diligence meeting with target company management", "Call with portfolio company board", "Review financial models and valuations"],
      afternoon: ["Meet with institutional investors or LPs", "ESG assessment of potential investment", "Team discussion on market thesis and strategy"],
      tools: ["Bloomberg Terminal", "Excel/financial modeling", "PitchBook/Preqin", "Power BI", "Capital IQ", "Microsoft Teams"],
      environment: "Office in Oslo financial district. Mix of analytical work, meetings, and travel for due diligence and investor relations.",
    },
    whatYouActuallyDo: [
      "You manage investment portfolios or funds, sourcing deals, conducting due diligence, making investment decisions, and managing portfolio companies to generate returns.",
      "In Norway, investment managers work in institutions like Storebrand, KLP, NBIM (Oljefondet), or independent fund managers, with increasing focus on ESG and sustainable investing.",
    ],
    whoThisIsGoodFor: ["Analytically driven finance professionals", "People who enjoy evaluating businesses and markets", "Those with strong judgment under uncertainty", "Competitive individuals motivated by performance"],
    topSkills: ["Financial analysis", "Valuation", "Due diligence", "Portfolio management", "ESG assessment"],
    entryPaths: ["Investment banking analyst transitioning to buy-side", "Finance degree (NHH, BI) with CFA designation", "Corporate finance or consulting professional moving to investments"],
    realityCheck: "Performance is measured ruthlessly, markets are humbling, and you will inevitably make investments that lose money—the key is getting the overall portfolio right.",
  },
  "private-equity-associate": {
    typicalDay: {
      morning: ["Build and refine financial model for target company", "Market research on potential sector investment", "Prepare investment memo draft"],
      midday: ["Due diligence call with management team", "Analyst briefing with industry expert", "Review data room documents"],
      afternoon: ["Support partner on deal negotiation", "Portfolio company performance review", "Update deal pipeline tracker"],
      tools: ["Excel (advanced modeling)", "Capital IQ/PitchBook", "Bloomberg", "PowerPoint", "Data room platforms (Datasite)", "Microsoft Teams"],
      environment: "Office in Oslo or Stavanger. Intense, deadline-driven environment with long hours during active deals. Small team with high individual responsibility.",
    },
    whatYouActuallyDo: [
      "You are the analytical engine of a PE fund, building financial models, conducting due diligence, writing investment memos, and supporting partners through the full deal lifecycle.",
      "Norwegian PE firms like HitecVision, Altor (Nordic), FSN Capital, and Summa Equity focus on sectors like energy, tech, and sustainability, offering exposure to Nordic deal-making.",
    ],
    whoThisIsGoodFor: ["Highly analytical people who love financial modeling", "Those who thrive under pressure and tight deadlines", "Ambitious professionals seeking rapid career progression", "People who enjoy deep company and sector analysis"],
    topSkills: ["Financial modeling (LBO, DCF)", "Due diligence", "Industry analysis", "Investment memo writing", "Deal execution"],
    entryPaths: ["2-3 years in investment banking (ABG Sundal Collier, Arctic, DNB Markets)", "Top-tier consulting (McKinsey, BCG) with finance focus", "NHH or BI master's with relevant internships"],
    realityCheck: "The hours are long (60-80/week during deals), the work is repetitive during modeling marathons, but the learning curve is steep and the carry potential makes it worthwhile.",
  },
  "private-equity-vp": {
    typicalDay: {
      morning: ["Lead due diligence workstream on active deal", "Coach associates on financial model and memo", "Portfolio company board preparation"],
      midday: ["Management presentation to investment committee", "Negotiate deal terms with seller's advisors", "Meet with operating partners on value creation plan"],
      afternoon: ["LP meeting or investor update", "Source and evaluate new deal opportunities", "Review and approve associate work product"],
      tools: ["Excel", "PowerPoint", "Bloomberg/Capital IQ", "Data room platforms", "CRM for deal flow", "Microsoft Teams"],
      environment: "Office with significant travel for deals and portfolio company oversight. Leadership role within deal teams with increasing client and investor-facing responsibilities.",
    },
    whatYouActuallyDo: [
      "You lead deal execution from sourcing through closing, manage portfolio companies post-investment, mentor junior team members, and increasingly participate in fundraising and investor relations.",
      "At VP level in Nordic PE, you are the deal quarterback—partners set strategy and close, but you run the process and are responsible for making deals happen.",
    ],
    whoThisIsGoodFor: ["Experienced finance professionals ready for leadership", "People who enjoy both analysis and relationship building", "Those who want to run deals end-to-end", "Ambitious individuals eyeing a path to partner"],
    topSkills: ["Deal leadership", "Value creation planning", "Team management", "Investor relations", "Negotiation"],
    entryPaths: ["Promoted from PE associate or senior associate", "Lateral hire from investment banking VP role", "Strategy consulting principal with PE transaction experience"],
    realityCheck: "You are in the 'up or out' zone—either you progress toward partner or you exit, and the politics of carry allocation and deal credit become increasingly important.",
  },
  "venture-capital-principal": {
    typicalDay: {
      morning: ["Review startup pitch decks and deal flow", "Board meeting at portfolio company", "Market mapping of emerging sector"],
      midday: ["Meet founders pitching for Series A/B", "Due diligence deep-dive on technology and team", "Discussion with co-investors on syndicated deal"],
      afternoon: ["Support portfolio company on hiring strategy", "Prepare investment memo for partners meeting", "Attend startup ecosystem event or demo day"],
      tools: ["Notion/Airtable", "PitchBook/Crunchbase", "Financial modeling (lighter than PE)", "LinkedIn", "Slack", "Zoom"],
      environment: "Office in Oslo startup hub or co-working space. Dynamic, networked environment with constant meetings, events, and travel to Nordic startup ecosystems.",
    },
    whatYouActuallyDo: [
      "You source, evaluate, and lead investments in startups, sit on portfolio company boards, and help founders scale their companies through strategic guidance and network access.",
      "In the Nordic VC ecosystem (Northzone, Viking Ventures, Alliance Venture, Investinor), principals lead deals in areas like deep tech, climate tech, SaaS, and health tech.",
    ],
    whoThisIsGoodFor: ["People passionate about innovation and startups", "Strong networkers who build relationships naturally", "Those who enjoy evaluating teams as much as markets", "Individuals comfortable with high failure rates"],
    topSkills: ["Deal sourcing", "Startup evaluation", "Board governance", "Portfolio support", "Ecosystem networking"],
    entryPaths: ["Successful startup founder or operator transitioning to investing", "Associate at a VC fund promoted to principal", "Strategy consultant or investment banker moving to VC"],
    realityCheck: "Most of your investments will fail, returns take 7-10 years to materialize, and the glamorous image of VC masks the grind of saying no to hundreds of hopeful founders.",
  },
  "corporate-development-director": {
    typicalDay: {
      morning: ["Scan market for potential acquisition targets", "Review strategic rationale for active M&A pipeline", "Meet with CEO on inorganic growth strategy"],
      midday: ["Lead due diligence workstream with advisors", "Financial modeling and valuation of target", "Coordinate with legal on deal structure"],
      afternoon: ["Post-merger integration planning session", "Partnership and JV opportunity assessment", "Update board on corporate development pipeline"],
      tools: ["Excel (advanced modeling)", "Capital IQ/Bloomberg", "PowerPoint", "Data room platforms", "Microsoft Teams", "CRM"],
      environment: "Corporate headquarters with significant travel for deal-related meetings. Strategic function reporting to CEO or CFO.",
    },
    whatYouActuallyDo: [
      "You drive inorganic growth by identifying, evaluating, and executing M&A transactions, strategic partnerships, joint ventures, and divestitures for your company.",
      "In Norwegian corporates like Aker, Schibsted, or Orkla, corporate development directors shape the company's portfolio through acquisitions that align with long-term strategic direction.",
    ],
    whoThisIsGoodFor: ["Strategic thinkers with strong financial skills", "People who enjoy the thrill of deal-making", "Those who like combining analysis with relationship building", "Professionals who want direct impact on company strategy"],
    topSkills: ["M&A execution", "Financial valuation", "Strategic analysis", "Negotiation", "Integration planning"],
    entryPaths: ["Investment banker transitioning to corporate side", "Strategy consultant moving to corporate development", "FP&A or corporate finance leader expanding into M&A"],
    realityCheck: "Deals take months to close and many fall apart, integration is where value is actually created or destroyed, and you must manage egos across both organizations.",
  },
  "ma-director": {
    typicalDay: {
      morning: ["Review active deal status and timeline", "Coordinate due diligence teams (legal, financial, commercial)", "Prepare negotiation strategy with advisors"],
      midday: ["Management meeting with acquisition target", "Financial model sensitivity analysis", "Regulatory approval strategy discussion"],
      afternoon: ["Integration planning workshop", "Update board and shareholders on deal progress", "Screen new opportunities from investment banks and network"],
      tools: ["Excel", "Capital IQ/Bloomberg", "PowerPoint", "Data room platforms (Datasite/Intralinks)", "Microsoft Teams", "Legal document review tools"],
      environment: "Corporate or advisory office with intense travel during active deals. High-pressure, deadline-driven role with significant legal and financial complexity.",
    },
    whatYouActuallyDo: [
      "You lead the end-to-end M&A process—from target identification and valuation through negotiation, due diligence, closing, and post-merger integration.",
      "In Norway, M&A directors navigate specific considerations like Norwegian merger control (Konkurransetilsynet), EEA state aid rules, and the unique dynamics of family-owned and state-owned enterprises.",
    ],
    whoThisIsGoodFor: ["Deal-driven professionals who thrive on complexity", "People who can manage multiple workstreams under pressure", "Strong negotiators with financial and legal literacy", "Those who enjoy the adrenaline of closing transactions"],
    topSkills: ["M&A process management", "Valuation and financial analysis", "Negotiation", "Due diligence coordination", "Post-merger integration"],
    entryPaths: ["Senior investment banking role moving to corporate or advisory M&A", "Corporate development professional specializing in transactions", "Big Four transaction advisory progressing to director level"],
    realityCheck: "You will work nights and weekends during active deals, most processes you start will not close, and the real measure of success is integration—not signing the deal.",
  },


  // ========================================
  // INDUSTRIAL TRADES & SPECIALIST ROLES
  // ========================================
  "industrial-electrician": {
    typicalDay: {
      morning: ["Review work orders and safety procedures", "Inspect electrical panels and switchgear", "Troubleshoot motor control circuits"],
      midday: ["Install cable trays and pull new cables", "Wire up control cabinets and junction boxes", "Coordinate with other trades on site"],
      afternoon: ["Test and verify installations with megger and multimeter", "Update electrical drawings and documentation", "Clean up work area and report progress"],
      tools: ["Fluke multimeter", "Megger insulation tester", "Cable pulling equipment", "Torque wrench"],
      environment: "Factories, process plants, and industrial facilities with rotating machinery and high-current systems.",
    },
    whatYouActuallyDo: ["Install, maintain, and repair electrical systems in industrial settings like factories and process plants.", "Troubleshoot faults in motors, drives, and power distribution to keep production running."],
    whoThisIsGoodFor: ["Enjoys hands-on problem solving", "Comfortable working in noisy industrial environments", "Good at reading technical drawings", "Methodical and safety-conscious"],
    topSkills: ["Electrical fault-finding", "Reading single-line diagrams", "Motor and drive systems", "Cable installation", "Electrical safety (FSE)"],
    entryPaths: ["Fagbrev as elektriker (VG1 Elektro + VG2 Elenergi + læretid)", "Fagbrev as automatiker with electrical focus", "Cross-qualification from energimontør with industrial experience"],
    realityCheck: "You will spend a lot of time in cramped, hot, and noisy spaces tracking down faults under production pressure.",
  },
  "high-voltage-electrician": {
    typicalDay: {
      morning: ["Attend safety briefing and review switching procedures", "Prepare isolation plans for high-voltage equipment", "Inspect transformers and switchgear rooms"],
      midday: ["Perform switching operations on distribution networks", "Test and maintain circuit breakers and disconnectors", "Install high-voltage cables and terminations"],
      afternoon: ["Conduct insulation resistance and tan-delta testing", "Document all switching and test results", "Restore equipment to service and verify operation"],
      tools: ["High-voltage test equipment", "Phase rotation meter", "SF6 gas analyser", "Voltage detectors and earthing equipment"],
      environment: "Transformer stations, switchgear rooms, and outdoor high-voltage installations in all weather conditions.",
    },
    whatYouActuallyDo: ["Work on power systems above 1kV including transformers, switchgear, and cable systems.", "Perform switching operations, testing, and maintenance that keeps the electrical grid reliable."],
    whoThisIsGoodFor: ["Extremely safety-focused and disciplined", "Calm under pressure", "Comfortable with strict procedures", "Good at planning and coordinating work"],
    topSkills: ["High-voltage switching", "Transformer maintenance", "Cable termination and jointing", "Protection relay testing", "Safety regulations (FEK/FSE)"],
    entryPaths: ["Fagbrev as energimontør + additional high-voltage training", "Fagbrev as elektriker + FSE high-voltage certification", "Apprenticeship with grid company like Elvia or Statnett"],
    realityCheck: "A single mistake with high-voltage equipment can be fatal, so every action follows strict procedures and double-checks.",
  },
  "power-line-technician": {
    typicalDay: {
      morning: ["Check weather conditions and plan route to site", "Load tools and materials onto service truck", "Set up safety barriers and traffic management"],
      midday: ["Climb poles or use lift truck to access overhead lines", "Replace insulators, conductors, or cross-arms", "Splice and terminate aerial cables"],
      afternoon: ["Inspect and maintain guy wires and pole foundations", "Respond to storm damage or outage calls", "Complete work documentation and update GIS records"],
      tools: ["Hydraulic lift truck", "Hot-line tools", "Come-along wire grips", "Line tensioning equipment"],
      environment: "Outdoors on overhead power lines along roads, through forests, and across mountains in all Norwegian weather.",
    },
    whatYouActuallyDo: ["Build, maintain, and repair overhead and underground power distribution lines.", "Respond to outages caused by storms and equipment failures to restore power."],
    whoThisIsGoodFor: ["Not afraid of heights", "Enjoys outdoor physical work", "Comfortable working in bad weather", "Team-oriented and dependable"],
    topSkills: ["Pole climbing and aerial work", "Cable jointing", "Overhead line construction", "Electrical safety at heights", "Driving with trailer (BE licence)"],
    entryPaths: ["Fagbrev as energimontør (VG1 Elektro + VG2 Elenergi + læretid)", "Apprenticeship with nettselskap like Lede or Glitre Nett", "Relevant experience from forsvaret (military) engineering units"],
    realityCheck: "You will be called out in storms and freezing conditions to restore power while communities wait in the dark.",
  },
  "substation-technician": {
    typicalDay: {
      morning: ["Review maintenance schedule for transformer station", "Perform visual inspection of outdoor switchyard", "Check oil levels and temperature readings on transformers"],
      midday: ["Maintain and test circuit breakers and disconnect switches", "Calibrate protection relays and metering equipment", "Perform oil sampling and dissolved gas analysis"],
      afternoon: ["Test battery backup systems and DC supplies", "Update station documentation and maintenance logs", "Coordinate planned outages with control centre"],
      tools: ["Relay test set (Omicron)", "Oil test equipment", "Thermal imaging camera", "SF6 handling equipment"],
      environment: "High-voltage transformer stations and indoor switchgear rooms, often in remote locations across the grid.",
    },
    whatYouActuallyDo: ["Maintain and test the transformers, switchgear, and protection systems inside substations.", "Ensure reliable power delivery by keeping critical grid infrastructure in peak condition."],
    whoThisIsGoodFor: ["Detail-oriented and thorough", "Comfortable working independently at remote sites", "Good understanding of electrical power systems", "Patient with repetitive test procedures"],
    topSkills: ["Transformer maintenance", "Protection relay testing", "Circuit breaker servicing", "Oil analysis", "SCADA and RTU systems"],
    entryPaths: ["Fagbrev as energimontør + substation specialisation", "Fagbrev as elektriker with grid company apprenticeship", "Internal training programme at Statnett or regional nettselskap"],
    realityCheck: "Much of your time is spent at isolated substations following detailed checklists, which can feel repetitive but is critical work.",
  },
  "electrical-commissioning-technician": {
    typicalDay: {
      morning: ["Review commissioning procedures and punch lists", "Verify cable terminations and connections against drawings", "Perform point-to-point wiring checks"],
      midday: ["Conduct loop testing from field devices to control system", "Test motor rotation and protection trip settings", "Energise switchboards and verify voltage levels"],
      afternoon: ["Witness functional tests with operations team", "Document test results and close out punch items", "Prepare systems for handover to client"],
      tools: ["Loop calibrator", "Megger insulation tester", "Commissioning management software (ICMS)", "Laptop with relay configuration tools"],
      environment: "New-build or upgraded industrial facilities during the intense final phase before plant start-up.",
    },
    whatYouActuallyDo: ["Systematically test and verify all electrical installations before a plant goes live.", "Bridge the gap between construction and operations by proving every system works as designed."],
    whoThisIsGoodFor: ["Extremely systematic and organised", "Good at working under deadline pressure", "Strong communicator across disciplines", "Enjoys seeing projects through to completion"],
    topSkills: ["Systematic testing procedures", "Reading P&IDs and loop diagrams", "Switchgear energisation", "Punch list management", "Multi-discipline coordination"],
    entryPaths: ["Fagbrev as elektriker or automatiker + commissioning experience", "Technical fagskole in electrical/automation + project work", "Transition from industrial electrician into commissioning roles"],
    realityCheck: "Commissioning phases mean long hours and intense pressure as deadlines approach, often requiring travel and time away from home.",
  },
  "protection-and-control-technician": {
    typicalDay: {
      morning: ["Review relay settings and protection philosophy documents", "Prepare test equipment and injection sets", "Isolate protection circuits for testing"],
      midday: ["Inject currents and voltages to verify relay operation", "Test trip circuits and breaker fail schemes", "Configure IEC 61850 communication and GOOSE messaging"],
      afternoon: ["Verify auto-reclosing and intertripping schemes", "Update settings databases and test reports", "Restore protection systems and confirm correct indication"],
      tools: ["Omicron CMC test set", "Relay configuration software (PCM600, Digsi)", "Network analyser", "IEC 61850 protocol analyser"],
      environment: "Substations and control rooms working with complex digital protection systems and communication networks.",
    },
    whatYouActuallyDo: ["Configure, test, and maintain the protection relays that detect faults and trip breakers to protect the power grid.", "Ensure that protection schemes operate correctly so faults are cleared in milliseconds."],
    whoThisIsGoodFor: ["Analytical and detail-focused", "Interested in power system theory", "Comfortable with digital communication protocols", "Good at logical troubleshooting"],
    topSkills: ["Protection relay testing and configuration", "IEC 61850 and GOOSE", "Power system fault analysis", "Secondary injection testing", "Network communication"],
    entryPaths: ["Fagbrev as energimontør or elektriker + specialist training", "Fagskole in elkraft with protection focus", "Graduate programme at Statnett or equipment vendor like ABB/Siemens"],
    realityCheck: "This is one of the most specialised electrical roles and requires continuous learning as digital protection technology evolves rapidly.",
  },
  "instrumentation-technician": {
    typicalDay: {
      morning: ["Check calibration schedule and gather work permits", "Calibrate pressure and temperature transmitters", "Inspect control valves and positioners"],
      midday: ["Troubleshoot 4-20mA loop faults", "Replace or repair level instruments", "Verify safety instrumented system (SIS) devices"],
      afternoon: ["Update calibration records in maintenance system", "Perform functional testing of shutdown valves", "Order spare parts and plan upcoming maintenance"],
      tools: ["HART communicator", "Fluke process calibrator", "Valve positioner configurator", "Pressure test pump"],
      environment: "Process plants, refineries, and chemical facilities working with measurement and control instruments.",
    },
    whatYouActuallyDo: ["Calibrate, maintain, and troubleshoot the sensors and control devices that measure pressure, temperature, flow, and level.", "Keep measurement accuracy and safety systems reliable so processes run safely and efficiently."],
    whoThisIsGoodFor: ["Precise and patient", "Good at systematic troubleshooting", "Interested in how processes are measured and controlled", "Comfortable with detailed documentation"],
    topSkills: ["Instrument calibration", "4-20mA loop troubleshooting", "HART protocol", "Control valve maintenance", "Safety system testing (SIL)"],
    entryPaths: ["Fagbrev as automatiker (VG1 Elektro + VG2 Automatisering + læretid)", "Fagbrev as industrimekaniker with instrument crossover", "Apprenticeship at process plant like Equinor or Yara"],
    realityCheck: "You will calibrate hundreds of instruments on tight schedules during shutdowns, and a single mis-calibration can cause major process upsets.",
  },
  "industrial-instrumentation-technician": {
    typicalDay: {
      morning: ["Review daily maintenance priorities in SAP/Maximo", "Perform SIS proof testing on safety valves", "Inspect and clean analyser sample systems"],
      midday: ["Troubleshoot DCS I/O card failures", "Calibrate flow meters using reference standards", "Replace faulty thermocouples and RTDs"],
      afternoon: ["Commission new instruments after plant modifications", "Update instrument datasheets and loop diagrams", "Participate in root cause analysis of instrument failures"],
      tools: ["Emerson AMS device manager", "Beamex calibrator", "Process analyser toolkit", "Intrinsic safety barriers and test equipment"],
      environment: "Large industrial complexes such as smelters, paper mills, and petrochemical plants with heavy process equipment.",
    },
    whatYouActuallyDo: ["Maintain complex industrial measurement systems including analysers, flow meters, and safety instrumented systems.", "Support continuous production by ensuring instruments deliver accurate data to control systems."],
    whoThisIsGoodFor: ["Strong analytical mindset", "Comfortable in heavy industrial environments", "Good understanding of process chemistry and physics", "Enjoys working with advanced technology"],
    topSkills: ["Advanced calibration techniques", "Analyser maintenance", "DCS troubleshooting", "SIL verification testing", "Instrument data management"],
    entryPaths: ["Fagbrev as automatiker with industrial plant apprenticeship", "Fagskole in automatisering + plant experience", "Internal progression from instrumentation technician role"],
    realityCheck: "Industrial plants run 24/7 so expect shift work, callouts, and the pressure of keeping production-critical instruments running.",
  },
  "plc-technician": {
    typicalDay: {
      morning: ["Review alarms and check PLC status on HMI screens", "Download and review PLC programs for troubleshooting", "Diagnose I/O module faults and replace cards"],
      midday: ["Modify PLC logic for process improvements", "Test interlocks and safety PLC functions", "Configure communication between PLC and field devices"],
      afternoon: ["Perform backup of PLC programmes", "Document changes in version control system", "Support operators with control system queries"],
      tools: ["Siemens TIA Portal", "Allen-Bradley Studio 5000", "Laptop with programming software", "Ethernet switch and network cables"],
      environment: "Control rooms and production floors of manufacturing plants, water treatment facilities, and automated production lines.",
    },
    whatYouActuallyDo: ["Programme, troubleshoot, and maintain PLCs that control automated machinery and industrial processes.", "Translate process requirements into logic that makes equipment run safely and efficiently."],
    whoThisIsGoodFor: ["Logical and structured thinker", "Enjoys programming and automation", "Good at reading technical documentation", "Patient when debugging complex sequences"],
    topSkills: ["PLC programming (Ladder, FBD, ST)", "Siemens and Allen-Bradley platforms", "Industrial networking (Profinet, EtherNet/IP)", "Safety PLC (SIL rated)", "HMI configuration"],
    entryPaths: ["Fagbrev as automatiker + PLC specialisation", "Fagskole in automatisering", "Vendor-specific training (Siemens Certified, Rockwell)"],
    realityCheck: "When a PLC stops the production line, everyone is waiting for you to fix it, which means high-pressure troubleshooting under time constraints.",
  },
  "scada-technician": {
    typicalDay: {
      morning: ["Check SCADA system health and communication status", "Review overnight alarms and events", "Verify data flow from RTUs and outstations"],
      midday: ["Configure new SCADA points and displays", "Troubleshoot communication links (serial, IP, radio)", "Update RTU firmware and configuration"],
      afternoon: ["Test redundancy failover and backup systems", "Maintain historian databases and trending", "Support operators with display modifications"],
      tools: ["SCADA software (ABB Ability, Schneider ClearSCADA)", "RTU configuration tools", "Network monitoring software", "Protocol analyser (DNP3, IEC 104)"],
      environment: "Control centres and remote sites managing water networks, power grids, or oil and gas pipeline systems.",
    },
    whatYouActuallyDo: ["Maintain and configure SCADA systems that allow operators to monitor and control infrastructure across large geographic areas.", "Ensure reliable communication between control centres and thousands of remote field devices."],
    whoThisIsGoodFor: ["Interested in IT and networking", "Good at systematic problem-solving", "Comfortable learning communication protocols", "Enjoys working with large-scale systems"],
    topSkills: ["SCADA system configuration", "Industrial protocols (DNP3, IEC 60870-5-104, Modbus)", "RTU programming", "Network and cybersecurity", "Database management"],
    entryPaths: ["Fagbrev as automatiker + SCADA-specific training", "Fagskole in automatisering or IT-drift", "IT background with transition into OT/industrial systems"],
    realityCheck: "SCADA systems are critical infrastructure targets, so cybersecurity awareness is increasingly as important as the technical skills.",
  },
  "automation-technician": {
    typicalDay: {
      morning: ["Review process alarms and tune control loops", "Check frequency drive parameters and motor performance", "Inspect sensors and actuators on production line"],
      midday: ["Programme PLC sequences for new production recipes", "Configure variable frequency drives", "Troubleshoot communication between DCS and field instruments"],
      afternoon: ["Commission new automation equipment", "Optimise PID loops for better process control", "Document system changes and update drawings"],
      tools: ["DCS engineering station", "Drive commissioning software", "Process simulator", "Industrial Ethernet diagnostic tools"],
      environment: "Automated production facilities, food processing plants, and industrial manufacturing with integrated control systems.",
    },
    whatYouActuallyDo: ["Keep automated production systems running by maintaining PLCs, drives, sensors, and control networks.", "Optimise and improve control strategies so processes run more efficiently and reliably."],
    whoThisIsGoodFor: ["Curious about how systems work together", "Enjoys both electrical and software challenges", "Good at seeing the big picture in complex systems", "Proactive problem-solver"],
    topSkills: ["Control loop tuning (PID)", "Variable frequency drives", "PLC and DCS systems", "Industrial communication networks", "Process understanding"],
    entryPaths: ["Fagbrev as automatiker (VG1 Elektro + VG2 Automatisering + læretid)", "Fagskole in automatisering", "Apprenticeship at automated facility like Hydro or Tine"],
    realityCheck: "You need to understand electrical, mechanical, and software systems simultaneously, which makes the learning curve steep but the work varied.",
  },
  "offshore-electrician": {
    typicalDay: {
      morning: ["Attend safety meeting and review permit-to-work", "Inspect emergency lighting and fire detection systems", "Troubleshoot motor starter and switchboard faults"],
      midday: ["Maintain UPS and battery backup systems", "Perform Ex-equipment inspections in hazardous areas", "Pull and terminate cables in equipment rooms"],
      afternoon: ["Test earth fault monitoring systems", "Update maintenance records in SAP", "Prepare for helicopter crew change logistics"],
      tools: ["Ex-rated multimeter", "Megger insulation tester", "Thermal imaging camera", "Permit-to-work system"],
      environment: "Offshore oil and gas platforms in the North Sea with strict safety regimes, working 12-hour shifts on 2-week rotations.",
    },
    whatYouActuallyDo: ["Maintain all electrical systems on an offshore platform from power generation to lighting and safety systems.", "Work in hazardous classified areas where electrical equipment must meet strict explosion-proof standards."],
    whoThisIsGoodFor: ["Self-reliant and resourceful", "Comfortable living offshore for weeks", "Strong safety mindset", "Good at working in small teams"],
    topSkills: ["Ex-equipment (ATEX/IECEx)", "Marine electrical systems", "Emergency power systems", "Hazardous area classification", "Permit-to-work procedures"],
    entryPaths: ["Fagbrev as elektriker + offshore safety course (BOSIET/HUET)", "Fagbrev as automatiker + Ex-kompetanse", "Onshore industrial electrician transitioning offshore"],
    realityCheck: "The offshore pay is excellent but you live on a platform for two weeks at a time with no option to go home if something comes up.",
  },
  "offshore-instrumentation-technician": {
    typicalDay: {
      morning: ["Review work orders and collect permits for the day", "Calibrate gas detection systems and fire detectors", "Inspect Ex-rated instrument installations"],
      midday: ["Troubleshoot process transmitter faults on production module", "Perform SIS proof testing on emergency shutdown valves", "Configure HART devices via handheld communicator"],
      afternoon: ["Test fire and gas system voting logic", "Update instrument calibration records", "Attend end-of-day safety debrief"],
      tools: ["HART communicator", "Beamex calibrator", "Gas detector test equipment", "Ex inspection tools"],
      environment: "Offshore platforms and FPSOs in the Norwegian Continental Shelf with strict ATEX/hazardous area requirements.",
    },
    whatYouActuallyDo: ["Maintain safety-critical instruments including fire and gas detection, ESD systems, and process measurements offshore.", "Ensure every sensor and safety device works perfectly in an environment where failure can be catastrophic."],
    whoThisIsGoodFor: ["Meticulous and safety-driven", "Comfortable with offshore lifestyle", "Good at working under strict regulatory frameworks", "Strong documentation habits"],
    topSkills: ["Fire and gas system maintenance", "SIS proof testing", "Ex-instrument inspection (IECEx)", "HART and fieldbus protocols", "Offshore safety systems"],
    entryPaths: ["Fagbrev as automatiker + offshore safety courses (BOSIET)", "Fagbrev as elektriker with instrument crossover + Ex-training", "Onshore instrumentation tech transitioning to offshore rotation"],
    realityCheck: "Safety-critical instrument failures offshore trigger immediate investigation, so accuracy and documentation must be impeccable every single time.",
  },
  "offshore-mechanical-technician": {
    typicalDay: {
      morning: ["Attend toolbox talk and collect work permits", "Inspect rotating equipment (pumps, compressors, fans)", "Check vibration monitoring data for anomalies"],
      midday: ["Perform pump seal replacements and alignment", "Maintain hydraulic systems on deck cranes", "Service HVAC systems in living quarters and process areas"],
      afternoon: ["Torque flange bolts to specification on piping systems", "Lubricate bearings and update PM schedules", "Prepare equipment for lifting operations"],
      tools: ["Hydraulic torque wrench", "Laser alignment tool", "Vibration analyser", "Lifting and rigging equipment"],
      environment: "Offshore platforms working on heavy rotating equipment, piping, and mechanical systems in marine conditions.",
    },
    whatYouActuallyDo: ["Maintain and repair mechanical equipment on offshore installations including pumps, valves, cranes, and piping.", "Keep production-critical machinery running through preventive maintenance and rapid fault repair."],
    whoThisIsGoodFor: ["Physically strong and practical", "Good mechanical aptitude", "Comfortable working at heights and in confined spaces", "Team player in demanding conditions"],
    topSkills: ["Rotating equipment maintenance", "Hydraulic systems", "Mechanical alignment and fitting", "Lifting and rigging", "Piping and flange management"],
    entryPaths: ["Fagbrev as industrimekaniker + offshore safety course (BOSIET)", "Fagbrev as platearbeider or sveiser with mechanical experience", "Maritime mechanical background transitioning to offshore"],
    realityCheck: "The work is physically demanding in all weather conditions, and you must be comfortable with confined spaces, heights, and heavy lifting.",
  },
  "offshore-maintenance-technician": {
    typicalDay: {
      morning: ["Prioritise work orders in CMMS (SAP PM)", "Perform condition-based monitoring rounds", "Inspect safety-critical equipment and barriers"],
      midday: ["Execute corrective maintenance on process equipment", "Coordinate with production on equipment isolations", "Perform preventive maintenance per schedule"],
      afternoon: ["Update maintenance records and backlog status", "Participate in maintenance planning meetings", "Support shutdown planning and material preparation"],
      tools: ["SAP Plant Maintenance", "Condition monitoring tools", "Multi-discipline hand tools", "Technical documentation system"],
      environment: "Offshore platforms handling a broad range of maintenance tasks across electrical, mechanical, and instrument disciplines.",
    },
    whatYouActuallyDo: ["Carry out planned and corrective maintenance across multiple disciplines to keep offshore facilities safe and operational.", "Act as a multi-skilled technician who can handle a wide range of equipment types on the platform."],
    whoThisIsGoodFor: ["Jack-of-all-trades mentality", "Good at prioritising competing demands", "Strong safety awareness", "Adaptable and willing to learn new skills"],
    topSkills: ["Multi-discipline maintenance", "CMMS/SAP operation", "Condition monitoring", "Risk assessment", "Maintenance planning"],
    entryPaths: ["Fagbrev in any relevant trade + offshore safety courses", "Combination of fagbrev + multi-skill training programme", "Experience as discipline technician progressing to multi-role"],
    realityCheck: "You are expected to handle tasks across multiple trades, which is rewarding but means you must constantly expand your competence.",
  },
  "rig-electrician": {
    typicalDay: {
      morning: ["Check DP (dynamic positioning) power system status", "Inspect SCR drives and drilling motor controllers", "Test emergency generator start and changeover"],
      midday: ["Maintain top drive and drawworks electrical systems", "Repair deck lighting and heating systems", "Troubleshoot drilling variable frequency drives"],
      afternoon: ["Perform Ex-inspections in hazardous classified areas", "Maintain battery systems and UPS units", "Complete electrical maintenance logs"],
      tools: ["Drive diagnostic software", "Megger insulation tester", "Ex-inspection kit", "SCR/thyristor test equipment"],
      environment: "Drilling rigs (jack-up, semi-sub, or drillship) with heavy electrical loads from drilling equipment and DP systems.",
    },
    whatYouActuallyDo: ["Maintain the electrical power and drive systems that power drilling operations on mobile offshore drilling units.", "Keep critical systems like dynamic positioning and top drives running during demanding drilling campaigns."],
    whoThisIsGoodFor: ["Strong electrical and power systems knowledge", "Calm and decisive in emergencies", "Comfortable with rig life and long rotations", "Resourceful when spare parts are limited"],
    topSkills: ["SCR and VFD drive systems", "Power generation and distribution", "Dynamic positioning electrical systems", "Ex-equipment maintenance", "Drilling electrical systems"],
    entryPaths: ["Fagbrev as elektriker + offshore safety courses + rig-specific training", "Offshore electrician transitioning to drilling rigs", "Maritime electrician (skipselektriker) with rig crossover"],
    realityCheck: "Drilling rigs operate around the clock and breakdowns halt expensive operations, so you will face intense pressure to restore systems fast.",
  },
  "rig-instrumentation-technician": {
    typicalDay: {
      morning: ["Check drilling instrumentation and mud logging sensors", "Calibrate pit level and flow measurement systems", "Inspect gas detection systems across the rig"],
      midday: ["Maintain well control instrumentation (BOP sensors)", "Troubleshoot drilling data acquisition systems", "Service weather monitoring and motion reference units"],
      afternoon: ["Test fire and gas detection panel logic", "Calibrate pressure sensors on cementing equipment", "Update instrument maintenance records"],
      tools: ["HART communicator", "Pressure calibrator", "Gas test kit for detectors", "Drilling data system interface"],
      environment: "Mobile offshore drilling units with specialised drilling instrumentation and safety-critical well control systems.",
    },
    whatYouActuallyDo: ["Maintain drilling-specific instruments that monitor well pressure, mud properties, and gas levels to ensure safe drilling.", "Keep fire and gas detection systems and BOP instrumentation in reliable condition on the rig."],
    whoThisIsGoodFor: ["Detail-oriented with strong safety focus", "Interested in drilling operations", "Good at working independently on a rig", "Quick learner for specialised rig systems"],
    topSkills: ["Drilling instrumentation", "Well control sensor systems", "Fire and gas detection", "BOP instrumentation", "Hazardous area compliance"],
    entryPaths: ["Fagbrev as automatiker + offshore safety courses + rig training", "Offshore instrumentation tech moving to drilling rig", "Drilling company trainee programme (e.g., Odfjell, Seadrill)"],
    realityCheck: "Rig instrumentation is a niche specialisation with smaller teams, meaning you carry a lot of responsibility for critical safety systems.",
  },
  "drilling-technician": {
    typicalDay: {
      morning: ["Attend pre-tour safety meeting and handover", "Monitor drilling parameters on driller's console", "Check mud weight, viscosity, and flow rates"],
      midday: ["Operate top drive and manage pipe connections", "Monitor downhole conditions and adjust drilling parameters", "Coordinate with mud engineer on fluid properties"],
      afternoon: ["Trip pipe in and out of the hole", "Perform BOP function tests", "Complete daily drilling report and handover to next crew"],
      tools: ["Driller's console and cyberbase", "Mud logging instruments", "Pipe handling equipment", "Well control simulation systems"],
      environment: "Drill floor and driller's cabin on offshore rigs or onshore drill sites, operating heavy machinery 24/7.",
    },
    whatYouActuallyDo: ["Operate and maintain drilling equipment to bore wells safely and efficiently to target depth.", "Monitor downhole conditions and respond to well control situations to prevent blowouts."],
    whoThisIsGoodFor: ["Thrives in high-stakes environments", "Physically fit and alert", "Good at making quick decisions", "Strong teamwork under pressure"],
    topSkills: ["Drilling operations", "Well control (IWCF/WellCAP)", "Top drive and hoisting systems", "Mud system management", "Drilling parameter optimisation"],
    entryPaths: ["Brønnteknikkfaget fagbrev (VG1 TIP + VG2 Brønnteknikk + læretid)", "Start as roughneck and progress through rig floor positions", "Drilling company trainee programme"],
    realityCheck: "Drilling is physically demanding shift work in a high-risk environment where well control emergencies require instant, correct responses.",
  },
  "well-intervention-technician": {
    typicalDay: {
      morning: ["Review well programme and intervention plan", "Rig up wireline or coiled tubing equipment", "Perform pressure tests on surface equipment"],
      midday: ["Run wireline tools downhole for logging or perforating", "Monitor coiled tubing operations and pressures", "Operate well intervention control systems"],
      afternoon: ["Pull equipment out of hole and inspect", "Maintain and prepare tools for next run", "Complete intervention reports and well documentation"],
      tools: ["Wireline unit", "Coiled tubing unit", "Slickline equipment", "Well intervention control panel"],
      environment: "Offshore platforms or intervention vessels working on live wells that require maintenance or production enhancement.",
    },
    whatYouActuallyDo: ["Perform operations inside existing wells using wireline, coiled tubing, or other tools to maintain or improve production.", "Work on live pressurised wells to install equipment, clear blockages, or gather reservoir data."],
    whoThisIsGoodFor: ["Cool-headed when working with high-pressure systems", "Good mechanical skills", "Interested in subsurface well operations", "Comfortable with offshore rotations"],
    topSkills: ["Wireline operations", "Coiled tubing operations", "Well barrier management", "Pressure control equipment", "Downhole tool knowledge"],
    entryPaths: ["Brønnteknikkfaget fagbrev with intervention focus", "Start as well service hand and progress with experience", "Training programme with intervention companies (Archer, Altus)"],
    realityCheck: "You work with high-pressure systems on live wells, where losing control of pressure is one of the most serious risks in the oil industry.",
  },
  "subsea-technician": {
    typicalDay: {
      morning: ["Review ROV inspection footage of subsea equipment", "Plan maintenance tasks on subsea Christmas trees", "Check hydraulic power unit status for subsea controls"],
      midday: ["Support ROV operations for subsea valve operations", "Monitor subsea production system parameters", "Troubleshoot subsea umbilical faults"],
      afternoon: ["Maintain topside hydraulic and chemical injection systems", "Prepare subsea tools for upcoming intervention", "Update subsea equipment maintenance records"],
      tools: ["ROV control systems", "Subsea hydraulic test bench", "Umbilical test equipment", "Subsea production management system"],
      environment: "Offshore platforms, onshore bases, and support vessels maintaining equipment on the seabed via ROVs and intervention systems.",
    },
    whatYouActuallyDo: ["Maintain and operate the subsea production equipment that sits on the seabed including trees, manifolds, and control systems.", "Support ROV-assisted operations to keep subsea infrastructure producing safely."],
    whoThisIsGoodFor: ["Fascinated by subsea technology", "Good at visualising systems you cannot physically touch", "Comfortable with hydraulic and control systems", "Patient and methodical"],
    topSkills: ["Subsea production systems", "ROV operations support", "Hydraulic systems", "Umbilical and connector systems", "Subsea equipment handling"],
    entryPaths: ["Fagbrev as industrimekaniker or automatiker + subsea training", "Fagskole with subsea technology specialisation", "Trainee programme with subsea companies (Aker Solutions, TechnipFMC)"],
    realityCheck: "Most of your work involves operating equipment remotely via ROVs, so you must be comfortable diagnosing problems you cannot see or touch directly.",
  },
  "subsea-controls-technician": {
    typicalDay: {
      morning: ["Monitor subsea control module (SCM) communications", "Check hydraulic pressures and chemical injection rates", "Analyse subsea sensor data for anomalies"],
      midday: ["Troubleshoot subsea electronic module faults", "Test subsea control system redundancy switchovers", "Configure topside master control station parameters"],
      afternoon: ["Perform subsea valve stroke testing via control system", "Maintain electrical and fibre-optic subsea connectors", "Update subsea controls documentation and event logs"],
      tools: ["Subsea master control station", "Fibre-optic test equipment (OTDR)", "Hydraulic test bench", "Subsea electronics diagnostic tools"],
      environment: "Control rooms and workshops maintaining the electronic and hydraulic systems that operate subsea equipment from the surface.",
    },
    whatYouActuallyDo: ["Maintain and troubleshoot the control systems that communicate with and operate equipment on the seabed.", "Ensure reliable command and monitoring of subsea valves, sensors, and safety systems through complex umbilical connections."],
    whoThisIsGoodFor: ["Strong electronics and controls aptitude", "Interested in cutting-edge subsea technology", "Good analytical skills for remote diagnostics", "Comfortable with complex integrated systems"],
    topSkills: ["Subsea control systems (MCS/SCM)", "Subsea electronics and fibre optics", "Hydraulic control systems", "Communication protocols", "Subsea connector maintenance"],
    entryPaths: ["Fagbrev as automatiker or elektroniker + subsea controls training", "Fagskole in automatisering with subsea specialisation", "Vendor training programme (TechnipFMC, Aker Solutions subsea)"],
    realityCheck: "Subsea controls is highly specialised with a small talent pool, which means strong job security but also high expectations for your expertise.",
  },

  "rov-pilot-technician": {
    typicalDay: {
      morning: ["Pre-dive checks on ROV systems", "Brief with offshore team on dive objectives", "Launch ROV and navigate to subsea worksite"],
      midday: ["Perform subsea inspection or intervention tasks", "Log video footage and sonar data", "Coordinate with vessel crew on positioning"],
      afternoon: ["Recover ROV and perform post-dive maintenance", "Troubleshoot hydraulic or electrical faults", "Write dive reports and update job packs"],
      tools: ["Work-class ROV", "Sonar systems", "Hydraulic tooling", "Video and camera systems"],
      environment: "Offshore vessel or platform ROV control room, working 12-hour shifts on rotation.",
    },
    whatYouActuallyDo: ["You pilot underwater robots to inspect, repair, and build subsea infrastructure on the Norwegian continental shelf.", "It combines precise joystick control with deep technical knowledge of hydraulics, electronics, and subsea systems."],
    whoThisIsGoodFor: ["Enjoys precision work under pressure", "Fascinated by subsea technology", "Comfortable with offshore rotations", "Good spatial awareness and hand-eye coordination"],
    topSkills: ["ROV piloting", "Subsea hydraulics", "Electrical fault-finding", "Sonar interpretation", "Technical reporting"],
    entryPaths: ["ROV training course (e.g., Reach Subsea Academy or similar)", "Background in elektro, automasjon, or mechanics with offshore transition", "Military diving or naval electronics background"],
    realityCheck: "You spend weeks offshore in a dark control room staring at screens, and the learning curve on complex intervention work is steep.",
  },
  "rov-supervisor": {
    typicalDay: {
      morning: ["Plan dive operations and risk assessments", "Lead toolbox talk with ROV crew", "Coordinate with client representative on scope"],
      midday: ["Supervise live ROV operations from control room", "Make real-time decisions on tooling and procedures", "Manage crew rotations and fatigue"],
      afternoon: ["Review dive logs and quality-check deliverables", "Update project schedule and client reports", "Plan next day's operations"],
      tools: ["ROV control systems", "Project management software", "Risk assessment tools", "Client reporting systems"],
      environment: "Offshore vessel ROV control room and bridge, managing a team across 12-hour shifts.",
    },
    whatYouActuallyDo: ["You lead the ROV team on subsea projects, making operational decisions and ensuring safety and quality.", "The role is half technical leadership and half project management under demanding offshore conditions."],
    whoThisIsGoodFor: ["Natural leader who stays calm under pressure", "Strong technical background in ROV operations", "Good communicator across disciplines", "Enjoys responsibility and decision-making"],
    topSkills: ["Subsea operations management", "Team leadership", "Risk assessment", "Client communication", "Technical problem-solving"],
    entryPaths: ["Promotion from experienced ROV pilot/technician", "Typically 5+ years ROV piloting experience required", "Supervisory training and offshore leadership courses"],
    realityCheck: "You carry the responsibility when things go wrong subsea, and managing tired crews on tight project deadlines is a constant balancing act.",
  },
  "fpso-technician": {
    typicalDay: {
      morning: ["Check process systems and read overnight logs", "Perform rounds on separation and water treatment equipment", "Attend morning safety and production meeting"],
      midday: ["Monitor oil/gas/water separation processes", "Carry out planned maintenance on valves and pumps", "Take fluid samples for lab analysis"],
      afternoon: ["Respond to process alarms and adjust parameters", "Update maintenance records in SAP", "Prepare equipment for next shift handover"],
      tools: ["DCS control systems", "Process instrumentation", "SAP maintenance system", "Gas detection equipment"],
      environment: "On board an FPSO vessel on the Norwegian continental shelf, working 2-week rotations.",
    },
    whatYouActuallyDo: ["You keep the floating production vessel's process systems running safely, handling everything from oil separation to water injection.", "It is hands-on industrial work on a ship that never goes to port."],
    whoThisIsGoodFor: ["Enjoys mechanical and process work", "Comfortable living and working offshore", "Systematic and safety-conscious", "Good at following procedures precisely"],
    topSkills: ["Process operations", "Mechanical maintenance", "Instrument reading", "Safety systems", "Permit-to-work procedures"],
    entryPaths: ["Fagbrev in prosessindustri or kjemiprosess", "Fagbrev in industrimekaniker with offshore course", "Petroleum technology certificate with relevant praksis"],
    realityCheck: "You live and work on the same vessel for weeks at a time, and the noise, vibration, and confined spaces take getting used to.",
  },
  "offshore-production-technician": {
    typicalDay: {
      morning: ["Perform wellhead and Christmas tree inspections", "Check production separator levels and pressures", "Attend morning production meeting with shift supervisor"],
      midday: ["Adjust choke valves to optimize well flow", "Monitor gas lift and injection systems", "Carry out first-line maintenance on production equipment"],
      afternoon: ["Log production data and update shift reports", "Perform safety rounds on fire and gas systems", "Hand over to incoming shift with status briefing"],
      tools: ["DCS/SCADA systems", "Wellhead control panels", "Pressure and temperature gauges", "Permit-to-work systems"],
      environment: "Offshore oil and gas platform on the Norwegian continental shelf, 2-week on/off rotation.",
    },
    whatYouActuallyDo: ["You operate and maintain the production systems that extract oil and gas from wells on an offshore platform.", "The job blends process monitoring, hands-on equipment work, and strict safety compliance."],
    whoThisIsGoodFor: ["Methodical and detail-oriented", "Handles responsibility well", "Comfortable in harsh weather conditions", "Team player in close-knit crews"],
    topSkills: ["Production operations", "Well monitoring", "Process control", "Safety procedures", "Equipment troubleshooting"],
    entryPaths: ["Fagbrev in prosessindustri", "Petroleum technology vocational program (VG1/VG2)", "Trainee programs with operators like Equinor or Aker BP"],
    realityCheck: "The two-week rotation pays well, but you miss birthdays, holidays, and everyday life at home more than you expect.",
  },
  "offshore-operations-technician": {
    typicalDay: {
      morning: ["Inspect deck equipment and lifting gear", "Prepare for cargo operations or supply boat arrival", "Conduct area inspections and housekeeping checks"],
      midday: ["Assist with crane lifts and deck cargo handling", "Perform maintenance on utility systems like HVAC and plumbing", "Support drilling or well operations as needed"],
      afternoon: ["Complete work orders and update SAP records", "Carry out fire and lifeboat drills", "Handover to night shift with status updates"],
      tools: ["Crane and lifting equipment", "Hand and power tools", "SAP maintenance system", "Safety and rescue equipment"],
      environment: "Offshore platform deck and utility areas, exposed to weather, working 12-hour shifts on rotation.",
    },
    whatYouActuallyDo: ["You handle the practical day-to-day operations on the platform, from cargo handling to utility maintenance.", "It is a generalist role that keeps the platform's support systems functioning."],
    whoThisIsGoodFor: ["Practical and hands-on", "Physically fit and comfortable at heights", "Adaptable to changing tasks", "Works well in a team under structured procedures"],
    topSkills: ["Deck operations", "Mechanical maintenance", "Lifting and rigging", "Safety systems", "Multi-trade coordination"],
    entryPaths: ["Fagbrev in industrimekaniker or similar trade", "Offshore safety course (GSK/BOSIET)", "Trainee/apprentice programs with offshore operators"],
    realityCheck: "You are the first one called when something breaks or a supply boat arrives at 3 AM, and the work is physically demanding in all weather.",
  },
  "control-room-operator": {
    typicalDay: {
      morning: ["Review overnight alarms and process status", "Take shift handover briefing from outgoing crew", "Monitor DCS screens for process deviations"],
      midday: ["Coordinate start-up or shutdown sequences", "Communicate with field operators on equipment status", "Manage permit-to-work system for ongoing maintenance"],
      afternoon: ["Respond to alarms and initiate emergency procedures if needed", "Log process data and shift events", "Brief incoming shift on plant status and open issues"],
      tools: ["DCS (Distributed Control System)", "SCADA systems", "Alarm management software", "Radio and PA communication systems"],
      environment: "Climate-controlled control room on a platform, refinery, or process plant, with multiple monitor screens.",
    },
    whatYouActuallyDo: ["You are the nerve center of the operation, monitoring and controlling all process systems from a central control room.", "Quick decisions and clear communication can prevent incidents and keep production flowing safely."],
    whoThisIsGoodFor: ["Stays calm and focused under pressure", "Excellent situational awareness", "Strong communicator", "Thrives in structured, procedure-driven work"],
    topSkills: ["Process monitoring", "DCS operation", "Alarm management", "Emergency response", "Communication and coordination"],
    entryPaths: ["Fagbrev in prosessindustri or kjemiprosess", "Experience as field operator progressing to control room", "Operator training programs at refineries or offshore operators"],
    realityCheck: "Long quiet shifts can lull you, but you must stay razor-sharp because when alarms cascade, you have seconds to make the right call.",
  },
  "offshore-wind-technician": {
    typicalDay: {
      morning: ["Transfer from vessel to turbine via gangway or hoist", "Perform safety checks and lockout/tagout procedures", "Begin scheduled maintenance on gearbox or generator"],
      midday: ["Replace worn components like brake pads or filters", "Run diagnostic checks on pitch and yaw systems", "Document work in maintenance management system"],
      afternoon: ["Complete functional tests after maintenance", "Clean up and restore turbine to operational status", "Transfer back to vessel and debrief with team"],
      tools: ["Torque wrenches and hydraulic tools", "SCADA diagnostics", "Personal fall protection equipment", "Service lifts and hoisting equipment"],
      environment: "Inside offshore wind turbine nacelles and towers, accessed by vessel transfer in the North Sea.",
    },
    whatYouActuallyDo: ["You maintain and repair offshore wind turbines, working inside the nacelle high above the sea.", "It is physically demanding trade work in a rapidly growing Norwegian industry."],
    whoThisIsGoodFor: ["Not afraid of heights or confined spaces", "Physically fit and enjoys outdoor work", "Interested in renewable energy", "Good at systematic troubleshooting"],
    topSkills: ["Wind turbine mechanics", "Electrical systems", "Hydraulic systems", "Working at heights", "Safety procedures"],
    entryPaths: ["Fagbrev in elektriker, automatiker, or industrimekaniker", "GWO (Global Wind Organisation) safety training", "Wind energy technician programs at fagskole"],
    realityCheck: "You climb towers in all weather, work in cramped nacelles, and vessel transfers in rough seas are not for the faint-hearted.",
  },
  "senior-wind-turbine-technician": {
    typicalDay: {
      morning: ["Review maintenance schedule and assign tasks to team", "Lead toolbox talk on day's hazards", "Diagnose complex faults on turbine drivetrain"],
      midday: ["Supervise component replacements or major repairs", "Mentor junior technicians on procedures", "Coordinate with onshore engineering on technical issues"],
      afternoon: ["Quality-check completed work before turbine restart", "Update maintenance records and parts inventory", "Report to project manager on progress and issues"],
      tools: ["Advanced diagnostic equipment", "Vibration analysis tools", "Maintenance management systems", "Hydraulic and electrical test gear"],
      environment: "Offshore wind farm, splitting time between turbine nacelles and the service vessel.",
    },
    whatYouActuallyDo: ["You lead the technical work on wind turbines and mentor the crew, handling the most complex faults.", "The role bridges hands-on repairs with team leadership and technical decision-making."],
    whoThisIsGoodFor: ["Experienced technician ready for leadership", "Enjoys teaching and mentoring", "Strong diagnostic skills", "Comfortable making technical decisions independently"],
    topSkills: ["Advanced turbine diagnostics", "Team leadership", "Drivetrain systems", "Condition monitoring", "Technical reporting"],
    entryPaths: ["Promoted from wind turbine technician with 3-5 years experience", "Fagbrev plus fagskole in wind energy or electro", "Manufacturer-specific advanced training certifications"],
    realityCheck: "You carry the technical responsibility offshore and must solve problems without a workshop or easy access to spare parts.",
  },
  "high-voltage-wind-technician": {
    typicalDay: {
      morning: ["Review switching procedures and safety plans", "Perform high-voltage safety isolation and earthing", "Test transformer and switchgear insulation"],
      midday: ["Carry out maintenance on 33kV or 66kV cable systems", "Inspect and service offshore substation equipment", "Perform thermographic surveys on connections"],
      afternoon: ["Re-energize systems following strict switching protocols", "Document test results and update single-line diagrams", "Report anomalies to onshore electrical engineering team"],
      tools: ["High-voltage test equipment", "Thermographic cameras", "Insulation resistance testers", "Switching procedure checklists"],
      environment: "Offshore substations and wind turbine transformer compartments, working with high-voltage systems.",
    },
    whatYouActuallyDo: ["You maintain and test the high-voltage electrical systems that connect offshore wind turbines to the grid.", "Precision and strict safety protocols are non-negotiable when working with voltages that can kill instantly."],
    whoThisIsGoodFor: ["Extremely safety-conscious and disciplined", "Strong electrical theory knowledge", "Comfortable with high-consequence work", "Methodical and detail-focused"],
    topSkills: ["High-voltage switching", "Transformer maintenance", "Cable testing", "Electrical safety procedures", "Power systems theory"],
    entryPaths: ["Fagbrev as energimontør or elektriker with HV authorization", "FSE (Forskrift om sikkerhet ved elektriske anlegg) certification", "Specialized HV courses from power industry or manufacturer"],
    realityCheck: "One mistake with high voltage is fatal, so the procedures are rigid and the responsibility is immense.",
  },
  "wind-commissioning-technician": {
    typicalDay: {
      morning: ["Review commissioning procedures and punch lists", "Perform pre-energization checks on new turbine systems", "Verify sensor calibrations and control system settings"],
      midday: ["Run functional tests on pitch, yaw, and safety systems", "Coordinate with manufacturer engineers on test protocols", "Document test results against acceptance criteria"],
      afternoon: ["Troubleshoot faults found during commissioning tests", "Update commissioning database with completed milestones", "Attend progress meeting with project team"],
      tools: ["Commissioning checklists and databases", "SCADA and PLC programming tools", "Electrical test instruments", "Turbine-specific diagnostic software"],
      environment: "Newly built offshore wind farm, working on turbines being brought online for the first time.",
    },
    whatYouActuallyDo: ["You bring brand-new wind turbines from construction to full operation, testing every system before handover.", "It is detective work finding and fixing issues so the turbine runs reliably for decades."],
    whoThisIsGoodFor: ["Loves being first to work on new technology", "Systematic and thorough", "Good at reading technical documentation", "Enjoys problem-solving under time pressure"],
    topSkills: ["Commissioning procedures", "Electrical testing", "SCADA systems", "Technical documentation", "Fault diagnosis"],
    entryPaths: ["Fagbrev in elektriker or automatiker with commissioning experience", "Engineering background with hands-on field orientation", "Manufacturer training programs for specific turbine platforms"],
    realityCheck: "Commissioning phases are intense with long hours and tight deadlines, and you often find problems nobody anticipated.",
  },
  "wind-service-supervisor": {
    typicalDay: {
      morning: ["Plan weekly service schedule and crew assignments", "Lead HSE briefing and review risk assessments", "Coordinate vessel logistics and weather windows"],
      midday: ["Monitor team progress across multiple turbines", "Make decisions on repair-or-replace for major components", "Liaise with asset owner on priorities and reporting"],
      afternoon: ["Review completed work orders for quality", "Update KPIs on turbine availability and backlog", "Handle personnel issues and training planning"],
      tools: ["Maintenance management systems (SAP/Maximo)", "Weather forecasting tools", "Vessel scheduling software", "HSE reporting systems"],
      environment: "Service operations vessel and onshore control center, overseeing wind farm maintenance campaigns.",
    },
    whatYouActuallyDo: ["You manage the service team keeping an offshore wind farm running at maximum availability.", "The role is a mix of people management, logistics planning, and technical decision-making."],
    whoThisIsGoodFor: ["Strong leadership and people skills", "Good at logistics and planning", "Technical background in wind or similar industry", "Handles competing priorities well"],
    topSkills: ["Team management", "Maintenance planning", "Logistics coordination", "HSE leadership", "Stakeholder communication"],
    entryPaths: ["Promoted from senior wind technician role", "Fagskole in leadership or technical management", "Supervisory experience from oil and gas or maritime sectors"],
    realityCheck: "You juggle weather windows, spare parts shortages, crew availability, and client expectations simultaneously, and something always changes.",
  },
  "grid-connection-technician": {
    typicalDay: {
      morning: ["Inspect onshore substation equipment and transformer status", "Review switching schedules for planned outages", "Perform protection relay testing and calibration"],
      midday: ["Maintain circuit breakers and disconnect switches", "Test battery backup systems and UPS units", "Carry out cable termination or jointing work"],
      afternoon: ["Update single-line diagrams and protection settings", "Coordinate with grid operator (Statnett) on connection status", "Document maintenance and test results"],
      tools: ["Protection relay test sets", "High-voltage test equipment", "Cable jointing tools", "SCADA and grid monitoring systems"],
      environment: "Onshore and offshore substations connecting wind farms or power plants to the national grid.",
    },
    whatYouActuallyDo: ["You install, maintain, and test the electrical infrastructure that connects power generation to Norway's electricity grid.", "The work ensures that power flows reliably from source to consumer."],
    whoThisIsGoodFor: ["Strong electrical and power systems knowledge", "Detail-oriented and procedure-driven", "Comfortable working in substations", "Enjoys understanding how the power grid works"],
    topSkills: ["Protection systems", "High-voltage maintenance", "Substation equipment", "Grid codes and standards", "Electrical testing"],
    entryPaths: ["Fagbrev as energimontør or elektriker", "FSE authorization for high-voltage work", "Additional training from grid operator or power company"],
    realityCheck: "The work is critical infrastructure with zero tolerance for mistakes, and you are often on call for grid emergencies.",
  },
  "power-plant-technician": {
    typicalDay: {
      morning: ["Check plant status and review overnight logs", "Perform rounds on boilers, turbines, and auxiliary systems", "Attend morning operations meeting"],
      midday: ["Carry out planned maintenance on pumps, valves, and heat exchangers", "Monitor emissions and adjust combustion parameters", "Take water chemistry samples"],
      afternoon: ["Respond to equipment alarms and troubleshoot issues", "Update maintenance records and spare parts logs", "Prepare for upcoming overhaul or outage work"],
      tools: ["DCS control systems", "Vibration monitoring equipment", "Water chemistry test kits", "Standard mechanical hand tools"],
      environment: "Onshore power plant (thermal, waste-to-energy, or combined heat and power), shift-based work.",
    },
    whatYouActuallyDo: ["You operate and maintain the equipment in a power plant that generates electricity and heat.", "The role combines process monitoring with hands-on mechanical and instrument work."],
    whoThisIsGoodFor: ["Enjoys understanding complex industrial processes", "Comfortable with shift work", "Practical and mechanically inclined", "Good at following and improving procedures"],
    topSkills: ["Plant operations", "Mechanical maintenance", "Process control", "Water treatment", "Safety systems"],
    entryPaths: ["Fagbrev in prosessindustri, industrimekaniker, or energioperatør", "Apprenticeship at power or district heating company", "Relevant fagskole program in energy or process technology"],
    realityCheck: "Shift work disrupts your social life, and plant overhauls mean long, physically tough weeks in hot, noisy environments.",
  },
  "gas-turbine-technician": {
    typicalDay: {
      morning: ["Review turbine operating data and trend reports", "Inspect air intake filters and fuel systems", "Begin disassembly for scheduled hot-section inspection"],
      midday: ["Inspect turbine blades, combustion liners, and bearings", "Measure clearances and compare against tolerances", "Replace worn components following OEM procedures"],
      afternoon: ["Reassemble and prepare for functional testing", "Run start-up checks and monitor vibration levels", "Complete inspection reports with photos and measurements"],
      tools: ["Borescope inspection equipment", "Precision measurement tools", "Torque equipment", "Vibration analysis systems"],
      environment: "Gas turbine enclosures on offshore platforms, power plants, or LNG facilities.",
    },
    whatYouActuallyDo: ["You maintain and overhaul gas turbines used for power generation and mechanical drive in the energy industry.", "The work demands precision engineering on high-performance rotating machinery."],
    whoThisIsGoodFor: ["Fascinated by turbine and engine technology", "Extremely precise and methodical", "Good with measurements and tolerances", "Enjoys complex mechanical assemblies"],
    topSkills: ["Gas turbine maintenance", "Precision measurement", "Vibration analysis", "Turbine controls", "Technical documentation"],
    entryPaths: ["Fagbrev in industrimekaniker or related mechanical trade", "OEM training programs (GE, Siemens, Rolls-Royce)", "Military background in aviation or marine gas turbines"],
    realityCheck: "Turbine overhauls run on strict schedules with enormous cost pressure, and a single mis-torqued bolt can destroy a million-kroner component.",
  },
  "steam-turbine-technician": {
    typicalDay: {
      morning: ["Review turbine performance data and vibration trends", "Prepare tooling for planned maintenance or inspection", "Perform lockout/tagout and confirm zero-energy state"],
      midday: ["Open turbine casing and inspect rotor blades and seals", "Check bearing conditions and measure shaft alignment", "Assess steam path for erosion or deposit buildup"],
      afternoon: ["Replace seals, packing, and worn components", "Perform alignment checks during reassembly", "Document findings and update maintenance history"],
      tools: ["Laser alignment equipment", "Dial indicators and micrometers", "Ultrasonic thickness gauges", "Hydraulic jacking equipment"],
      environment: "Onshore power plants, refineries, or industrial steam facilities, often during planned outage periods.",
    },
    whatYouActuallyDo: ["You maintain and overhaul steam turbines that generate power in plants and industrial facilities.", "The work centers on precision mechanical tasks during high-pressure outage windows."],
    whoThisIsGoodFor: ["Enjoys heavy mechanical precision work", "Patient and detail-oriented", "Comfortable working in industrial plant environments", "Good understanding of thermodynamics"],
    topSkills: ["Steam turbine maintenance", "Shaft alignment", "Rotor balancing", "Mechanical inspection", "Outage planning"],
    entryPaths: ["Fagbrev in industrimekaniker", "OEM service training (Siemens, GE Steam Power)", "Apprenticeship at power plant or industrial facility"],
    realityCheck: "Most of your intense work happens during planned outages where the schedule is unforgiving and every hour of downtime costs the plant money.",
  },
  "energy-commissioning-technician": {
    typicalDay: {
      morning: ["Review commissioning procedures and test plans", "Verify instrument loops and signal integrity", "Perform pre-start safety system checks"],
      midday: ["Conduct functional tests on generators, switchgear, and protection systems", "Coordinate with multiple trades on system integration", "Troubleshoot issues found during testing"],
      afternoon: ["Document test results and update punch lists", "Attend commissioning progress meetings", "Plan next phase of testing based on construction readiness"],
      tools: ["Commissioning management software", "Electrical and instrument test equipment", "PLC and DCS configuration tools", "Protection relay test sets"],
      environment: "New-build power plants, substations, or energy facilities during the construction-to-operations transition.",
    },
    whatYouActuallyDo: ["You systematically test and verify energy facility systems before they go into commercial operation.", "The role sits at the intersection of construction and operations, turning a building site into a functioning plant."],
    whoThisIsGoodFor: ["Loves systematic testing and verification", "Works well across multiple engineering disciplines", "Thrives in project-based environments", "Strong technical documentation skills"],
    topSkills: ["Commissioning procedures", "Electrical testing", "Instrument calibration", "Systems integration", "Technical documentation"],
    entryPaths: ["Fagbrev in elektriker, automatiker, or instrument trade", "Experience from maintenance or installation transitioning to commissioning", "Fagskole in automation or electrical power"],
    realityCheck: "Commissioning means long hours during crunch periods, constant travel to project sites, and fixing problems that were supposed to be resolved during construction.",
  },
  "marine-engineer": {
    typicalDay: {
      morning: ["Take over engine room watch and review logs", "Monitor main engine parameters and fuel consumption", "Check auxiliary systems: generators, compressors, and purifiers"],
      midday: ["Perform planned maintenance on diesel engines or pumps", "Respond to machinery alarms and troubleshoot faults", "Manage fuel and lube oil transfers and tank soundings"],
      afternoon: ["Update planned maintenance system records", "Prepare parts requisitions for next port call", "Hand over watch with status briefing to next engineer"],
      tools: ["Engine room control systems", "Diesel engine diagnostic tools", "Standard marine engineering hand tools", "Planned maintenance software"],
      environment: "Engine room of commercial or offshore vessels, standing watches at sea and performing maintenance.",
    },
    whatYouActuallyDo: ["You keep a ship's engines and machinery running safely at sea, standing watches and performing maintenance.", "Marine engineers are the backbone of every vessel, responsible for propulsion, power, and all mechanical systems."],
    whoThisIsGoodFor: ["Enjoys working with engines and machinery", "Comfortable living aboard ships for weeks", "Independent problem-solver", "Good at working in hot, noisy environments"],
    topSkills: ["Diesel engine maintenance", "Machinery troubleshooting", "Watchkeeping", "Fuel and fluid management", "Safety systems"],
    entryPaths: ["Maritime fagbrev as motormann", "Maritime academy (fagskole) for maskinoffiser certificate", "Cadetship with Norwegian shipping company"],
    realityCheck: "The engine room is hot, loud, and never sleeps, and you spend long stretches away from home with limited personal space.",
  },
  "chief-marine-engineer": {
    typicalDay: {
      morning: ["Review overnight machinery status and engineer reports", "Plan maintenance schedule and coordinate with captain on operations", "Manage engine department budget and spare parts inventory"],
      midday: ["Oversee major machinery repairs or class survey preparations", "Conduct safety drills and training for engine crew", "Liaise with technical superintendent onshore"],
      afternoon: ["Review compliance with ISM code and flag state requirements", "Approve work permits for hot work or enclosed space entry", "Mentor junior engineers and cadets"],
      tools: ["Planned maintenance systems", "Budget and procurement software", "Classification society documentation", "Engine monitoring and alarm systems"],
      environment: "Chief engineer's office and engine room on board commercial vessels, with overall responsibility for all technical operations.",
    },
    whatYouActuallyDo: ["You are the top technical authority on the vessel, responsible for all machinery, maintenance, and the engine department crew.", "The role balances hands-on engineering leadership with management, compliance, and budgeting."],
    whoThisIsGoodFor: ["Experienced marine engineer ready for top responsibility", "Strong leadership and management skills", "Excellent at planning and resource management", "Calm decision-maker in emergencies"],
    topSkills: ["Engine department management", "Machinery systems expertise", "Regulatory compliance", "Budget management", "Crew leadership"],
    entryPaths: ["Promotion from 1st engineer / maskinsjef Class 1 certificate", "Requires significant sea time and STCW qualifications", "Maritime academy education plus years of watchkeeping experience"],
    realityCheck: "You carry ultimate technical responsibility for the vessel and crew safety, and the job follows you even when you are off watch.",
  },
  "ships-electrical-engineer": {
    typicalDay: {
      morning: ["Inspect main switchboard and generator synchronization systems", "Review electrical maintenance schedule and prioritize tasks", "Test navigation and communication equipment"],
      midday: ["Troubleshoot faults on motor starters, drives, and control circuits", "Maintain power management and automation systems", "Perform insulation resistance testing on critical cables"],
      afternoon: ["Service battery systems and emergency power supplies", "Update electrical schematics and documentation", "Prepare for port state or classification inspections"],
      tools: ["Multimeters and meggers", "Power quality analyzers", "PLC programming tools", "Marine electrical drawing software"],
      environment: "Electrical workshops, switchboard rooms, and throughout the vessel, often on ships with advanced DP or automation systems.",
    },
    whatYouActuallyDo: ["You are responsible for all electrical power generation, distribution, and automation systems on board.", "The role covers everything from high-voltage switchgear to delicate navigation electronics."],
    whoThisIsGoodFor: ["Strong in both power and control electrical systems", "Enjoys varied and independent work", "Good at reading and updating technical drawings", "Comfortable with shipboard life"],
    topSkills: ["Marine electrical systems", "Power management", "Automation and PLC", "Electrical fault-finding", "Regulatory compliance"],
    entryPaths: ["Maritime academy program for ETO or skipselektriker certificate", "Fagbrev as elektriker with maritime supplement courses", "STCW ETO certification pathway"],
    realityCheck: "You are often the only electrical specialist on board, so when something fails at 2 AM mid-ocean, it is your problem alone.",
  },
  "marine-electrician": {
    typicalDay: {
      morning: ["Perform daily checks on lighting, ventilation, and galley equipment", "Test emergency lighting and battery systems", "Begin planned maintenance on motors or switchgear"],
      midday: ["Repair or replace faulty electrical components", "Pull and terminate cables for modifications", "Assist electrical engineer with larger maintenance tasks"],
      afternoon: ["Service deck machinery electrical systems (winches, cranes)", "Update maintenance logs and report completed work", "Prepare spare parts requests for next port"],
      tools: ["Hand tools and power tools for electrical work", "Cable pulling and termination equipment", "Insulation resistance testers", "Basic PLC diagnostic tools"],
      environment: "Throughout the vessel, from engine room to bridge to deck, on commercial or offshore ships.",
    },
    whatYouActuallyDo: ["You install, maintain, and repair the electrical systems throughout a ship, from heavy machinery to cabin outlets.", "It is practical hands-on electrical work in a seagoing environment."],
    whoThisIsGoodFor: ["Enjoys hands-on electrical work", "Adaptable and resourceful", "Comfortable working in tight ship spaces", "Willing to live aboard for extended periods"],
    topSkills: ["Electrical installation", "Cable work", "Motor maintenance", "Troubleshooting", "Marine safety procedures"],
    entryPaths: ["Fagbrev as elektriker with maritime safety courses", "Apprenticeship with Norwegian shipping company", "Electrical trade plus STCW basic safety training"],
    realityCheck: "You fix everything electrical on board from the captain's coffee machine to the bow thruster, and spare parts are whatever you have in the store.",
  },
  "electro-technical-officer": {
    typicalDay: {
      morning: ["Check automation and power management system status", "Perform maintenance on DP (dynamic positioning) system components", "Test fire detection and safety control systems"],
      midday: ["Troubleshoot PLC and SCADA faults on process or cargo systems", "Maintain high-voltage systems on vessels with electric propulsion", "Service communication and navigation electronics"],
      afternoon: ["Program control system modifications as needed", "Update technical documentation and drawings", "Prepare for classification society surveys and audits"],
      tools: ["PLC programming software", "High-voltage test equipment", "DP system diagnostics", "Network and communication test tools"],
      environment: "Advanced vessels (offshore, cruise, LNG carriers) with complex electrical and automation systems.",
    },
    whatYouActuallyDo: ["You manage the electrical, electronic, and control systems on technologically advanced vessels as a certified officer.", "The ETO role bridges traditional marine electrical work with modern automation and IT systems."],
    whoThisIsGoodFor: ["Strong in both electrical power and automation", "Enjoys working with cutting-edge maritime technology", "Independent and self-motivated", "Good at systematic fault-finding across complex systems"],
    topSkills: ["Marine automation", "Power management systems", "DP systems", "High-voltage systems", "PLC and SCADA programming"],
    entryPaths: ["STCW ETO certificate from maritime academy", "Maritime fagskole program in elektro/automasjon", "Experienced marine electrician with ETO upgrade qualification"],
    realityCheck: "You are responsible for increasingly complex ship systems that blend electrical, IT, and automation, and the technology evolves faster than the training courses.",
  },

  "dynamic-positioning-operator": {
    typicalDay: {
      morning: ["Run DP system checks and verify sensor inputs", "Review weather forecasts and plan station-keeping parameters", "Coordinate with bridge team on vessel positioning requirements"],
      midday: ["Monitor DP console during critical operations", "Log position deviations and thruster performance", "Communicate with offshore installation for approach clearances"],
      afternoon: ["Perform DP trials and capability plots", "Update operational logs and handover notes", "Run backup system tests and redundancy checks"],
      tools: ["Kongsberg DP System", "DGNSS Receivers", "Wind Sensors & MRUs", "Thruster Control Console"],
      environment: "Bridge of offshore supply vessels or construction vessels, operating 24/7 rotation shifts in Norwegian waters.",
    },
    whatYouActuallyDo: ["You keep vessels locked in exact position over subsea sites using computerised thruster control.", "When systems degrade or weather builds, you make the call on whether operations continue safely."],
    whoThisIsGoodFor: ["Stays calm under pressure", "Detail-oriented with numbers and screens", "Comfortable with long offshore rotations", "Enjoys technical problem-solving"],
    topSkills: ["DP system operation", "Risk assessment", "Meteorology awareness", "Thruster management", "Emergency response"],
    entryPaths: ["Nautical officer certification (D1/D2) plus NI DP course scheme", "Seagoing experience as bridge officer before DP specialisation", "Complete DP Unlimited certification through approved training centres"],
    realityCheck: "You sit in front of screens for 12-hour shifts where a momentary lapse can endanger lives and multi-billion kroner assets.",
  },
  "shipyard-commissioning-technician": {
    typicalDay: {
      morning: ["Review commissioning punch lists and system diagrams", "Prepare test equipment and verify instrument calibration", "Attend coordination meeting with construction and engineering teams"],
      midday: ["Perform functional testing on newly installed mechanical systems", "Verify valve alignments and piping integrity", "Document test results against commissioning procedures"],
      afternoon: ["Troubleshoot systems failing acceptance criteria", "Update completion databases and close out punch items", "Coordinate with vendors for specialist equipment handover"],
      tools: ["Pressure Test Equipment", "Multimeters & Megohmmeters", "Commissioning Management Software", "P&ID Drawings"],
      environment: "Active shipyard or offshore fabrication yard, working on vessels or platforms under construction in all weather conditions.",
    },
    whatYouActuallyDo: ["You systematically test and verify every system on a new-build vessel or platform before it enters service.", "You bridge the gap between construction and operations, ensuring everything actually works as designed."],
    whoThisIsGoodFor: ["Methodical and process-driven", "Good at reading technical drawings", "Comfortable working across multiple trades", "Persistent when chasing faults"],
    topSkills: ["System testing procedures", "Technical documentation", "Mechanical and electrical fundamentals", "Punch list management", "Cross-discipline coordination"],
    entryPaths: ["Fagbrev in relevant trade (mechanics, electricity, automation) plus yard experience", "Technical college diploma with shipyard apprenticeship", "Transition from maintenance technician role into commissioning projects"],
    realityCheck: "Deadlines are brutal near vessel delivery dates, and you will regularly work overtime to close out hundreds of punch items.",
  },
  "port-crane-technician": {
    typicalDay: {
      morning: ["Inspect crane wire ropes, sheaves, and structural components", "Check hydraulic fluid levels and filter conditions", "Review maintenance log for outstanding work orders"],
      midday: ["Perform scheduled preventive maintenance on STS or RTG cranes", "Replace worn brake linings and adjust limit switches", "Test safety systems including overload protection and anti-collision"],
      afternoon: ["Troubleshoot electrical or hydraulic faults on idle cranes", "Order spare parts and update maintenance records in CMMS", "Coordinate with port operations on crane availability windows"],
      tools: ["Hydraulic Test Gauges", "Electrical Fault Finders", "Wire Rope Inspection Equipment", "CMMS Software"],
      environment: "Busy container or bulk cargo port terminals, working at height on large quayside and yard cranes in exposed conditions.",
    },
    whatYouActuallyDo: ["You maintain and repair the massive cranes that load and unload ships in Norwegian ports.", "When a crane breaks down, port throughput stops, so you diagnose and fix faults fast."],
    whoThisIsGoodFor: ["Comfortable working at great heights", "Strong mechanical and electrical aptitude", "Can work under time pressure", "Enjoys heavy industrial machinery"],
    topSkills: ["Crane mechanical systems", "Hydraulic troubleshooting", "Electrical fault-finding", "Safety system testing", "Preventive maintenance planning"],
    entryPaths: ["Fagbrev as industrimekaniker or elektrofag with port crane specialisation", "Apprenticeship at major Norwegian port (Oslo, Bergen, Stavanger)", "Experience from mobile crane service companies transitioning to port equipment"],
    realityCheck: "You work at serious heights in wind and rain, and breakdowns always seem to happen during the worst weather or busiest shipping windows.",
  },
  "vessel-maintenance-supervisor": {
    typicalDay: {
      morning: ["Prioritise daily maintenance tasks and assign crew", "Review planned maintenance system for overdue jobs", "Inspect ongoing repair work and verify quality"],
      midday: ["Coordinate with chief engineer on critical equipment status", "Manage spare parts inventory and procurement requests", "Supervise contractor work during port calls"],
      afternoon: ["Update maintenance records and class survey documentation", "Plan upcoming dry-dock or layup maintenance scope", "Conduct toolbox talks and safety briefings with team"],
      tools: ["Planned Maintenance System (TM Master/AMOS)", "Class Society Requirements", "Procurement Software", "Condition Monitoring Reports"],
      environment: "Engine rooms and deck areas of vessels in Norwegian coastal or offshore fleet, with periods onshore for planning and procurement.",
    },
    whatYouActuallyDo: ["You lead the technical maintenance team aboard a vessel, ensuring all machinery and systems stay operational and class-compliant.", "You balance planned maintenance schedules against operational demands and budget constraints."],
    whoThisIsGoodFor: ["Natural leader who can manage a team", "Organised and good at planning", "Strong technical background in marine systems", "Comfortable making decisions under pressure"],
    topSkills: ["Maintenance planning", "Team leadership", "Marine engineering knowledge", "Budget management", "Regulatory compliance"],
    entryPaths: ["Maskinoffiser (marine engineer officer) certification with sea time", "Fagbrev as motormann plus years of seagoing experience leading to supervisory role", "Shore-based maintenance supervisor transitioning to maritime sector"],
    realityCheck: "You are responsible for everything that breaks on a vessel and must keep ageing equipment running with limited budgets and parts availability.",
  },
  "aircraft-maintenance-engineer": {
    typicalDay: {
      morning: ["Receive aircraft from night shift and review technical log entries", "Perform pre-flight inspections and sign off serviceable aircraft", "Carry out scheduled maintenance checks per approved data"],
      midday: ["Troubleshoot reported defects using maintenance manuals and wiring diagrams", "Remove and replace faulty line-replaceable units", "Perform engine borescope inspections or fluid sampling"],
      afternoon: ["Complete maintenance documentation and update tech log", "Order parts and coordinate with planning for upcoming checks", "Perform post-maintenance functional tests and ground runs"],
      tools: ["Aircraft Maintenance Manuals (AMM)", "Torque Wrenches & Calibrated Tooling", "Borescope Equipment", "AMOS/OASES MRO Software"],
      environment: "Aircraft hangars and aprons at Norwegian airports, working shifts including nights and weekends to keep aircraft in service.",
    },
    whatYouActuallyDo: ["You inspect, troubleshoot, and repair aircraft mechanical and powerplant systems to keep them airworthy.", "Your signature on the technical log means you certify the aircraft is safe to fly."],
    whoThisIsGoodFor: ["Extremely detail-oriented and safety-conscious", "Strong mechanical aptitude", "Comfortable with high responsibility", "Methodical and follows procedures precisely"],
    topSkills: ["Aircraft systems knowledge", "Troubleshooting", "Technical documentation", "Regulatory compliance (EASA Part-66)", "Precision tool use"],
    entryPaths: ["EASA Part-66 B1 licence via approved training organisation (e.g., OSL Technical School)", "Fagbrev as flyfagmekaniker plus type training", "Military aircraft technician background converting to civilian licence"],
    realityCheck: "The personal legal liability is real — your signature means you guarantee the aircraft is safe, and mistakes can have fatal consequences.",
  },
  "licensed-aircraft-engineer": {
    typicalDay: {
      morning: ["Review deferred defects and MEL items requiring rectification", "Authorise aircraft release to service after maintenance", "Supervise base maintenance tasks on heavy checks"],
      midday: ["Approve non-routine repair schemes and engineering orders", "Liaise with engineering department on complex defect resolution", "Verify compliance with airworthiness directives"],
      afternoon: ["Audit maintenance documentation for completeness and accuracy", "Mentor junior technicians on procedures and best practice", "Coordinate with Luftfartstilsynet on regulatory queries"],
      tools: ["EASA Part-145 Documentation", "Structural Repair Manuals", "MRO Management Systems", "NDT Inspection Reports"],
      environment: "MRO hangars and line stations at Norwegian airports, carrying certification authority with significant legal responsibility.",
    },
    whatYouActuallyDo: ["You hold the certifying authority to release aircraft back to service after maintenance, the highest technical sign-off.", "You oversee complex maintenance activities and ensure full regulatory compliance with EASA and Norwegian CAA requirements."],
    whoThisIsGoodFor: ["Accepts heavy personal responsibility", "Deep technical knowledge of aircraft", "Strong leadership and mentoring ability", "Meticulous with regulatory documentation"],
    topSkills: ["Certifying authority (CRS)", "EASA Part-66 B1/B2 regulations", "Engineering judgement", "Airworthiness management", "Technical leadership"],
    entryPaths: ["EASA Part-66 Category B or C licence with extensive type experience", "Progression from aircraft maintenance engineer with additional authorisations", "Approved training plus minimum experience requirements per EASA regulation"],
    realityCheck: "You carry personal criminal liability for every aircraft you release — this is one of the most legally exposed technical roles in any industry.",
  },
  "avionics-technician": {
    typicalDay: {
      morning: ["Run built-in test equipment on avionics systems", "Troubleshoot navigation, communication, or autopilot faults", "Replace faulty avionics LRUs and perform configuration checks"],
      midday: ["Carry out scheduled avionics inspections per maintenance programme", "Test weather radar, transponder, and TCAS systems", "Update aircraft software loads per service bulletins"],
      afternoon: ["Perform wire integrity checks and connector inspections", "Document all work in technical records and component tracking", "Support flight crew with avionics system queries"],
      tools: ["Avionics Test Sets (ARINC 429/MIL-STD-1553)", "Oscilloscopes & Signal Generators", "Aircraft Wiring Manuals", "Software Loading Equipment"],
      environment: "Aircraft hangars and avionics workshops, working with sensitive electronic systems in ESD-controlled environments.",
    },
    whatYouActuallyDo: ["You maintain and repair the electronic brains of aircraft — navigation, communication, flight management, and display systems.", "When a pilot reports a screen blank or navigation fault, you are the one who finds and fixes it."],
    whoThisIsGoodFor: ["Fascinated by electronics and computing", "Patient with intermittent fault-finding", "Comfortable with complex system diagrams", "Precise and methodical worker"],
    topSkills: ["Avionics systems knowledge", "Electronic troubleshooting", "Data bus analysis", "Software configuration management", "ESD-safe procedures"],
    entryPaths: ["EASA Part-66 B2 licence via approved training (e.g., electronic/avionics programme)", "Fagbrev in elektronikkfag with aviation specialisation", "Military avionics technician converting to civilian certification"],
    realityCheck: "Intermittent avionics faults can take days to reproduce and isolate, requiring enormous patience and systematic thinking.",
  },
  "aircraft-structures-technician": {
    typicalDay: {
      morning: ["Inspect aircraft fuselage and control surfaces for damage", "Assess dents, cracks, and corrosion against structural repair manual limits", "Prepare repair schemes for damage beyond allowable limits"],
      midday: ["Perform sheet metal repairs — drilling, riveting, and forming patches", "Apply composite repair techniques to carbon fibre components", "Carry out NDT inspections (dye penetrant, eddy current) on critical areas"],
      afternoon: ["Apply corrosion protection treatments and sealants", "Document all structural repairs with photographs and measurements", "Prepare aircraft surfaces for painting or touch-up"],
      tools: ["Rivet Guns & Bucking Bars", "NDT Equipment (Eddy Current, Ultrasonic)", "Composite Repair Kits", "Sheet Metal Forming Tools"],
      environment: "MRO hangars working on aircraft skins and structures, often in confined spaces inside fuel tanks or wheel wells.",
    },
    whatYouActuallyDo: ["You repair the physical airframe — fixing dents, cracks, corrosion, and composite damage to keep the structure airworthy.", "You are the hands-on craftsperson ensuring the aircraft body can handle the stresses of flight."],
    whoThisIsGoodFor: ["Skilled with hands and precision tools", "Good spatial reasoning", "Comfortable in confined spaces", "Detail-oriented craftsperson"],
    topSkills: ["Sheet metal work", "Composite repair", "Non-destructive testing", "Structural repair manual interpretation", "Corrosion treatment"],
    entryPaths: ["Fagbrev as flyfagmekaniker with structures specialisation", "EASA Part-66 B1 training with structural repair focus", "Apprenticeship at Norwegian MRO such as Widerøe Technical Services"],
    realityCheck: "You will spend significant time in awkward positions inside aircraft structures, and the precision required for every rivet and repair is absolute.",
  },
  "maintenance-release-engineer": {
    typicalDay: {
      morning: ["Review all completed maintenance tasks for documentation accuracy", "Verify compliance with work packages and engineering orders", "Check component certifications and shelf-life documentation"],
      midday: ["Perform final inspections on completed maintenance checks", "Resolve outstanding defects or deferred items before release", "Coordinate with quality assurance on findings"],
      afternoon: ["Sign the certificate of release to service (CRS)", "Update aircraft technical records and component tracking systems", "Brief operations on aircraft status and any limitations"],
      tools: ["Part-145 CRS Documentation", "Maintenance Tracking Systems", "Quality Audit Checklists", "Airworthiness Directive Databases"],
      environment: "MRO hangars and line maintenance stations, primarily desk and inspection work with final authority over aircraft release.",
    },
    whatYouActuallyDo: ["You are the final checkpoint before an aircraft returns to service — verifying all maintenance is complete, correct, and documented.", "Your release signature carries personal legal accountability that the aircraft meets all airworthiness requirements."],
    whoThisIsGoodFor: ["Extremely thorough and process-driven", "Comfortable with legal responsibility", "Strong auditing mindset", "Confident decision-maker"],
    topSkills: ["Airworthiness regulation", "Documentation auditing", "Risk-based decision making", "EASA Part-145 compliance", "Technical record management"],
    entryPaths: ["Senior aircraft maintenance engineer progressing to certifying staff status", "EASA Part-66 Category C licence with type ratings", "Extensive base maintenance experience plus company authorisation"],
    realityCheck: "Saying 'no' to releasing an aircraft under schedule pressure is part of the job, and you must have the backbone to do it.",
  },
  "helicopter-maintenance-engineer": {
    typicalDay: {
      morning: ["Perform daily inspections on helicopter rotor systems and drive train", "Check gearbox chip detectors and oil samples for metal contamination", "Service hydraulic systems and flight control actuators"],
      midday: ["Troubleshoot vibration issues using rotor track and balance equipment", "Replace main or tail rotor blades and perform ground runs", "Inspect dynamic components against retirement life limits"],
      afternoon: ["Complete 50/100-hour scheduled maintenance checks", "Update component life tracking records", "Prepare helicopter for next day offshore or SAR operations"],
      tools: ["Rotor Track & Balance Systems", "Vibration Analysis Equipment", "Torque Wrenches & Calibrated Tooling", "Health & Usage Monitoring Systems (HUMS)"],
      environment: "Heliports and offshore helidecks along the Norwegian coast, often in remote locations supporting oil and gas or SAR operations.",
    },
    whatYouActuallyDo: ["You keep helicopters flying safely for North Sea offshore transport and search-and-rescue missions.", "Helicopter dynamic systems demand precise maintenance — a rotor imbalance or gearbox failure has immediate consequences."],
    whoThisIsGoodFor: ["Mechanically talented and safety-focused", "Comfortable in remote or offshore locations", "Calm and precise under operational pressure", "Enjoys complex rotating machinery"],
    topSkills: ["Helicopter dynamic systems", "Vibration analysis", "Powerplant maintenance", "Component life management", "EASA rotorcraft regulations"],
    entryPaths: ["EASA Part-66 B1.3 licence (helicopters) via approved training", "Fagbrev as flyfagmekaniker with rotorcraft specialisation", "Military helicopter technician transitioning to civilian North Sea operations"],
    realityCheck: "Helicopter components have hard life limits and zero tolerance for shortcuts — the dynamic forces involved mean small errors can be catastrophic.",
  },
  "industrial-mechanic": {
    typicalDay: {
      morning: ["Check work orders and prioritise breakdown versus planned jobs", "Inspect production machinery for wear, alignment, and lubrication", "Replace worn bearings, seals, and couplings on rotating equipment"],
      midday: ["Perform precision shaft alignment using laser tools", "Fabricate or modify brackets and supports in workshop", "Troubleshoot mechanical faults on conveyor or process lines"],
      afternoon: ["Complete preventive maintenance routines on scheduled equipment", "Update maintenance records in SAP or other CMMS", "Assist with installation of new machinery and equipment"],
      tools: ["Laser Alignment Systems", "Bearing Pullers & Heaters", "Precision Measuring Instruments", "Workshop Machine Tools (Lathe, Mill, Drill Press)"],
      environment: "Manufacturing plants, process facilities, or industrial sites across Norway, working in workshops and on production floors.",
    },
    whatYouActuallyDo: ["You keep industrial machinery running by performing preventive maintenance, diagnosing faults, and repairing mechanical systems.", "You are the all-round mechanical problem solver that every factory and process plant depends on."],
    whoThisIsGoodFor: ["Enjoys hands-on mechanical work", "Good problem-solving instincts", "Physically capable and practical", "Likes variety in daily tasks"],
    topSkills: ["Mechanical fault diagnosis", "Precision alignment", "Bearing and seal replacement", "Fabrication basics", "Preventive maintenance"],
    entryPaths: ["Fagbrev as industrimekaniker via 2+2 apprenticeship model", "Vg1 Teknikk og industriell produksjon pathway", "Adult apprenticeship (praksiskandidat) with documented work experience"],
    realityCheck: "Production stops cost money by the minute, so you will regularly face pressure to get machines back online as fast as possible.",
  },
  "heavy-equipment-mechanic": {
    typicalDay: {
      morning: ["Diagnose hydraulic or engine faults on excavators and wheel loaders", "Perform scheduled service on heavy machines (oil, filters, inspections)", "Read fault codes from machine ECM using diagnostic laptops"],
      midday: ["Replace hydraulic cylinders, pumps, or hoses in the field", "Rebuild final drives or transmission components in workshop", "Weld and fabricate repair brackets for structural damage"],
      afternoon: ["Test repaired machines under load and verify performance", "Order parts and update service history records", "Travel to remote construction or quarry sites for field repairs"],
      tools: ["Diagnostic Software (CAT ET, Volvo VCADS, Hitachi)", "Hydraulic Flow & Pressure Testers", "Welding Equipment", "Heavy Lifting & Rigging Gear"],
      environment: "Construction sites, quarries, mines, and workshops across Norway, often outdoors in demanding conditions with very large machinery.",
    },
    whatYouActuallyDo: ["You maintain and repair heavy construction and mining equipment — excavators, dump trucks, loaders, and dozers.", "When a 50-tonne machine breaks down on a remote job site, you are the one driving out to fix it."],
    whoThisIsGoodFor: ["Loves big machines and heavy mechanical work", "Self-reliant and resourceful in the field", "Physically strong and hardy", "Comfortable working outdoors year-round"],
    topSkills: ["Diesel engine diagnostics", "Hydraulic system repair", "Electronic control systems", "Field welding", "Heavy component rigging"],
    entryPaths: ["Fagbrev as anleggsmaskinmekaniker via apprenticeship", "Vg1 Teknikk og industriell produksjon then Vg2 Arbeidsmaskiner", "Dealer training programmes (Pon/CAT, Volvo Maskin, Nasta/Hitachi)"],
    realityCheck: "You will work in mud, snow, and freezing conditions on remote sites, and the components you handle can weigh several tonnes.",
  },
  "crane-technician": {
    typicalDay: {
      morning: ["Perform pre-shift safety inspection on crane systems", "Check wire ropes, hooks, and load-limiting devices", "Review maintenance schedule and outstanding work orders"],
      midday: ["Service crane hydraulic systems — filters, hoses, and valves", "Test and calibrate safe load indicators and limit switches", "Inspect structural welds and bolted connections"],
      afternoon: ["Troubleshoot electrical control system faults", "Perform load testing and certification inspections", "Document all maintenance and update crane logbooks"],
      tools: ["Load Test Weights & Dynamometers", "Hydraulic Diagnostic Equipment", "Wire Rope Inspection Gauges", "Electrical Test Instruments"],
      environment: "Construction sites, industrial plants, ports, and offshore installations where cranes operate, often working at height.",
    },
    whatYouActuallyDo: ["You maintain, inspect, and repair cranes of all types — tower cranes, mobile cranes, overhead cranes, and offshore pedestal cranes.", "Your work ensures these machines can safely lift heavy loads without mechanical failure."],
    whoThisIsGoodFor: ["Comfortable at heights", "Strong mixed mechanical-electrical skills", "Safety-conscious mindset", "Enjoys travel to different job sites"],
    topSkills: ["Crane mechanical systems", "Hydraulic troubleshooting", "Load testing procedures", "Wire rope inspection", "Electrical control systems"],
    entryPaths: ["Fagbrev as industrimekaniker or kranmekaniker", "Specialisation through crane manufacturer training (Liebherr, Palfinger, NOV)", "Technical college plus apprenticeship with crane service company"],
    realityCheck: "Crane failures can be fatal, so every inspection and repair you perform carries direct safety consequences for operators and riggers below.",
  },
  "crane-operator": {
    typicalDay: {
      morning: ["Perform daily crane inspection and function tests", "Review lift plans and rigging diagrams for scheduled lifts", "Coordinate with banksman and riggers on radio communication"],
      midday: ["Execute planned lifts — positioning loads with precision", "Monitor load indicators and wind speed continuously", "Perform tandem lifts with other cranes when required"],
      afternoon: ["Complete lift logs and report any equipment issues", "Reposition crane for next day's work scope", "Participate in toolbox talks and safety observations"],
      tools: ["Crane Operating Console & Controls", "Safe Load Indicator (SLI)", "Two-Way Radio Systems", "Lift Planning Software"],
      environment: "Crane cabins at construction sites, offshore platforms, shipyards, or industrial plants, often at significant height.",
    },
    whatYouActuallyDo: ["You operate cranes to lift and position heavy loads safely, from construction steel to subsea modules.", "You translate lift plans into precise physical movements, coordinating closely with ground crews."],
    whoThisIsGoodFor: ["Excellent hand-eye coordination", "Stays focused for long periods", "Good spatial awareness and depth perception", "Calm communicator under pressure"],
    topSkills: ["Crane operation", "Lift planning interpretation", "Load chart calculation", "Radio communication", "Risk assessment"],
    entryPaths: ["Kranfører certificate via approved training and practical assessment", "Start with smaller cranes and progress to larger classes (G1-G11)", "Offshore crane operator certification for petroleum sector work"],
    realityCheck: "You sit alone in a cabin for entire shifts making precise movements where one wrong input could drop a load on someone below.",
  },
  "hydraulic-systems-technician": {
    typicalDay: {
      morning: ["Review hydraulic system schematics and planned maintenance tasks", "Check reservoir levels, filter indicators, and fluid condition", "Take oil samples for particle count and contamination analysis"],
      midday: ["Diagnose hydraulic faults using flow meters and pressure gauges", "Replace pumps, valves, cylinders, or actuators", "Flush and commission repaired hydraulic circuits"],
      afternoon: ["Set and verify relief valve pressures and flow settings", "Perform hose integrity inspections and replacements", "Update maintenance records and component tracking"],
      tools: ["Hydraulic Test Units (Flow, Pressure, Temperature)", "Particle Counters & Oil Analysis Kits", "Hose Crimping Machine", "Hydraulic Schematic Software"],
      environment: "Industrial plants, offshore platforms, mobile equipment workshops, and marine vessels — anywhere hydraulic power is used.",
    },
    whatYouActuallyDo: ["You specialise in hydraulic power systems — the high-pressure fluid circuits that drive heavy industrial machinery.", "From a leaking cylinder to a failed proportional valve, you diagnose and repair the systems that provide muscle to machines."],
    whoThisIsGoodFor: ["Enjoys understanding fluid power principles", "Methodical troubleshooter", "Comfortable with high-pressure systems", "Good at reading circuit diagrams"],
    topSkills: ["Hydraulic circuit analysis", "Proportional and servo valve repair", "Contamination control", "Pressure and flow diagnostics", "Hose and fitting assembly"],
    entryPaths: ["Fagbrev as industrimekaniker with hydraulic specialisation", "Hydraulic training courses from Bosch Rexroth, Parker, or Eaton", "Technical college plus on-the-job specialisation in fluid power"],
    realityCheck: "Hydraulic fluid at high pressure can penetrate skin and cause serious injury, so respecting the energy in these systems is non-negotiable.",
  },
  "pneumatic-systems-technician": {
    typicalDay: {
      morning: ["Inspect compressed air distribution systems for leaks", "Check air treatment units — filters, regulators, lubricators", "Review maintenance schedule for pneumatic actuators and valves"],
      midday: ["Troubleshoot pneumatic control circuits using flow and pressure diagnostics", "Replace solenoid valves, cylinders, and positioners", "Tune pneumatic instrument loops on process control systems"],
      afternoon: ["Perform leak detection surveys using ultrasonic detectors", "Commission new pneumatic installations and verify function", "Document maintenance and update instrument loop diagrams"],
      tools: ["Ultrasonic Leak Detectors", "Pneumatic Calibrators", "Flow & Pressure Test Equipment", "Compressed Air Quality Analysers"],
      environment: "Process plants, manufacturing facilities, and food/pharmaceutical production sites where pneumatic systems drive automation.",
    },
    whatYouActuallyDo: ["You maintain and repair compressed air and pneumatic control systems used throughout industrial automation.", "You ensure air quality, pressure, and flow are correct so that valves actuate, tools operate, and processes run reliably."],
    whoThisIsGoodFor: ["Systematic troubleshooter", "Interested in automation and control", "Good at reading P&IDs and circuit diagrams", "Tidy and methodical worker"],
    topSkills: ["Pneumatic circuit analysis", "Instrument calibration", "Leak detection and repair", "Compressed air treatment", "Control valve maintenance"],
    entryPaths: ["Fagbrev as automatiker or industrimekaniker", "Instrumentation technician training with pneumatic specialisation", "Technical college with apprenticeship in process industry"],
    realityCheck: "Air leaks are the biggest energy waste in most factories, and much of your work involves methodically hunting down and fixing leaks others ignore.",
  },
  "rotating-equipment-specialist": {
    typicalDay: {
      morning: ["Collect vibration data from pumps, compressors, and turbines", "Analyse vibration spectra for bearing defects, imbalance, or misalignment", "Prioritise equipment for intervention based on condition trends"],
      midday: ["Perform precision alignment on pump-motor trains", "Supervise bearing replacements and verify clearances", "Balance rotating components using field balancing equipment"],
      afternoon: ["Update condition monitoring database and trend reports", "Advise maintenance planners on equipment health and remaining life", "Investigate root causes of recurring rotating equipment failures"],
      tools: ["Vibration Analysers (CSI/SKF)", "Laser Alignment Systems", "Field Balancing Equipment", "Thermography Cameras"],
      environment: "Oil refineries, gas processing plants, offshore platforms, and power stations — anywhere critical rotating machinery operates.",
    },
    whatYouActuallyDo: ["You are the diagnostic specialist for rotating machinery — using vibration analysis and other techniques to detect faults before they cause failures.", "You keep the most critical and expensive equipment in a facility running reliably."],
    whoThisIsGoodFor: ["Analytical and data-driven thinker", "Enjoys understanding machine behaviour", "Strong mechanical engineering fundamentals", "Patient with complex diagnostics"],
    topSkills: ["Vibration analysis (ISO CAT II/III)", "Precision alignment", "Root cause failure analysis", "Bearing technology", "Condition monitoring programme management"],
    entryPaths: ["Fagbrev as industrimekaniker plus vibration analysis certification (Mobius/VI)", "Mechanical engineering degree with condition monitoring specialisation", "Experienced mechanic transitioning to reliability engineering role"],
    realityCheck: "You need years of experience to reliably interpret vibration data — there is no shortcut to developing the pattern recognition this role demands.",
  },
  "compressor-technician": {
    typicalDay: {
      morning: ["Check compressor operating parameters — pressures, temperatures, vibration", "Inspect lube oil systems and take oil samples", "Review alarm history and performance trends"],
      midday: ["Perform scheduled maintenance on reciprocating or centrifugal compressors", "Replace valves, piston rings, or packing on reciprocating units", "Inspect impellers and seals on centrifugal machines"],
      afternoon: ["Assist with compressor startup and performance verification after maintenance", "Troubleshoot capacity control and anti-surge systems", "Update maintenance records and parts usage logs"],
      tools: ["Compressor Valve Test Benches", "Piston Ring Expanders & Gap Gauges", "Vibration & Pulsation Monitors", "Performance Analysis Software"],
      environment: "Gas processing plants, offshore platforms, refrigeration facilities, and air separation units across Norwegian industry.",
    },
    whatYouActuallyDo: ["You maintain and repair industrial compressors — the machines that pressurize gas for processing, transport, and refrigeration.", "From reciprocating gas compressors offshore to centrifugal units in refineries, you keep pressurized systems running."],
    whoThisIsGoodFor: ["Mechanically skilled with attention to clearances and tolerances", "Understands thermodynamics basics", "Comfortable with high-pressure systems", "Enjoys complex machinery teardowns"],
    topSkills: ["Reciprocating compressor maintenance", "Centrifugal compressor overhaul", "Valve and seal replacement", "Performance monitoring", "Gas seal systems"],
    entryPaths: ["Fagbrev as industrimekaniker plus compressor OEM training", "Apprenticeship with compressor service companies (Siemens Energy, Atlas Copco, Ariel)", "Process technician background moving into mechanical specialisation"],
    realityCheck: "Compressor maintenance often involves working with toxic or explosive gases under pressure, demanding strict adherence to safety procedures.",
  },
  "pump-technician": {
    typicalDay: {
      morning: ["Inspect pump performance — checking flow, pressure, and vibration readings", "Identify pumps due for scheduled seal or bearing replacement", "Prepare work area and isolate pump for maintenance"],
      midday: ["Disassemble pumps and inspect impellers, casings, and wear rings", "Replace mechanical seals and set proper operating clearances", "Rebuild pump assemblies to OEM specifications"],
      afternoon: ["Reinstall pumps with precision alignment to driver", "Perform startup checks and verify operating parameters", "Document work completed and update pump maintenance history"],
      tools: ["Mechanical Seal Installation Tools", "Dial Indicators & Micrometers", "Laser Alignment Equipment", "Pump Performance Test Equipment"],
      environment: "Process plants, water treatment facilities, offshore platforms, and marine vessels — pumps are everywhere in Norwegian industry.",
    },
    whatYouActuallyDo: ["You maintain and repair industrial pumps — centrifugal, positive displacement, and submersible types used across all process industries.", "When a critical pump fails, you get it rebuilt and back online before production is affected."],
    whoThisIsGoodFor: ["Precise with measurements and tolerances", "Enjoys repetitive craft done to high standards", "Good mechanical aptitude", "Systematic and clean worker"],
    topSkills: ["Mechanical seal technology", "Pump hydraulics and performance", "Precision measurement", "Shaft alignment", "Wear analysis and root cause failure analysis"],
    entryPaths: ["Fagbrev as industrimekaniker with pump specialisation", "Training from pump OEMs (Sulzer, Grundfos, Flowserve)", "Apprenticeship in process industry maintenance department"],
    realityCheck: "Pump repairs require precise clearances measured in hundredths of millimetres — sloppy work means early failure and doing the job twice.",
  },
  "industrial-maintenance-supervisor": {
    typicalDay: {
      morning: ["Review overnight breakdown reports and prioritise today's work", "Assign maintenance technicians to planned and corrective tasks", "Attend production coordination meeting to align on priorities"],
      midday: ["Walk the plant floor inspecting ongoing maintenance work quality", "Manage contractor activities and verify permits to work", "Handle urgent breakdowns and allocate resources"],
      afternoon: ["Review maintenance KPIs — backlog, schedule compliance, MTBF", "Plan next week's maintenance schedule with planners", "Conduct safety observations and close out incident reports"],
      tools: ["CMMS (SAP PM, Maximo, IFS)", "KPI Dashboards", "Permit to Work Systems", "Microsoft Office Suite"],
      environment: "Industrial plants, process facilities, or offshore installations, splitting time between office planning and shop floor supervision.",
    },
    whatYouActuallyDo: ["You lead a team of maintenance technicians, balancing planned maintenance with urgent breakdowns to keep a facility running.", "You are the link between production demands and maintenance capability, managing people, priorities, and budgets."],
    whoThisIsGoodFor: ["Strong leader who earns respect from tradespeople", "Organised planner and decision-maker", "Can handle conflicting priorities calmly", "Good communicator across all levels"],
    topSkills: ["Team leadership", "Maintenance planning and scheduling", "CMMS management", "Budget and resource management", "Safety management"],
    entryPaths: ["Experienced industrimekaniker or electrician promoted to supervisor", "Fagbrev plus technical leadership courses (e.g., fagskole in maintenance management)", "Engineering degree combined with hands-on trade experience"],
    realityCheck: "You are pulled in every direction — production wants machines now, your team wants resources, and management wants lower costs — all at once.",
  },
  "mechanical-commissioning-technician": {
    typicalDay: {
      morning: ["Review commissioning procedures and system boundaries", "Verify mechanical completion of piping, valves, and equipment", "Perform punch-list walkdowns and document outstanding items"],
      midday: ["Execute pressure testing and flushing of piping systems", "Check valve operations — stroke testing and leak checks", "Verify rotating equipment alignment and pre-start conditions"],
      afternoon: ["Witness and document initial equipment startups", "Record performance data against design specifications", "Update commissioning database and close completed activities"],
      tools: ["Pressure Test Equipment (Hydrostatic & Pneumatic)", "Commissioning Management Software (ICAPS/Completions)", "Precision Measuring Instruments", "System P&IDs and Datasheets"],
      environment: "New-build construction sites, offshore platforms during hookup, or brownfield modification projects across Norwegian industry.",
    },
    whatYouActuallyDo: ["You systematically verify and test mechanical systems on new or modified installations, bringing them from construction to operation.", "You ensure every pipe, valve, pump, and vessel works correctly before the facility starts production."],
    whoThisIsGoodFor: ["Highly systematic and process-oriented", "Strong mechanical trade background", "Good at working through detailed checklists", "Comfortable in large project environments"],
    topSkills: ["Pressure testing procedures", "Mechanical completion verification", "System turnover processes", "Punch list management", "Commissioning documentation"],
    entryPaths: ["Fagbrev as industrimekaniker or rørlegger with project experience", "Transition from maintenance technician to commissioning role on major projects", "Technical college plus commissioning training from employers like Aker Solutions or Equinor"],
    realityCheck: "Commissioning phases have immovable deadlines, and you will work long hours and weekends to get systems handed over on time.",
  },

  "construction-site-supervisor": {
    typicalDay: {
      morning: ["Review daily plans and safety briefings with crew", "Walk the site to check progress against schedule", "Coordinate with subcontractors on upcoming tasks"],
      midday: ["Update project logs and report to project manager", "Resolve material delivery issues and logistics", "Conduct quality inspections on completed work"],
      afternoon: ["Approve work permits and method statements", "Plan next-day activities and resource allocation", "Review HSE incidents and close-out reports"],
      tools: ["MS Project", "BIM 360", "Total station", "Two-way radio"],
      environment: "Outdoors on active construction sites in all weather, with regular time in site offices for planning and documentation.",
    },
    whatYouActuallyDo: ["You manage the daily operations of a construction site, ensuring work is done safely, on schedule, and to specification.", "You are the link between the project office and the tradespeople doing the physical work."],
    whoThisIsGoodFor: ["Natural leaders who stay calm under pressure", "People who prefer being outdoors over sitting at a desk", "Strong communicators who can manage diverse crews", "Detail-oriented planners who think ahead"],
    topSkills: ["Construction planning", "HSE management", "Team leadership", "Contract administration", "Quality control"],
    entryPaths: ["Fagbrev in a building trade plus bas/foreman experience", "Bachelor in construction engineering (byggingeniør)", "Years of trade experience combined with site management courses"],
    realityCheck: "You carry heavy responsibility for safety and schedule, and your phone will ring at all hours when problems arise.",
  },
  "civil-works-foreman": {
    typicalDay: {
      morning: ["Brief the crew on the day's excavation or concrete tasks", "Check grades and alignments with surveying equipment", "Coordinate with machine operators on dig plans"],
      midday: ["Inspect formwork and reinforcement before pours", "Log quantities and progress in daily reports", "Liaise with material suppliers on delivery timing"],
      afternoon: ["Oversee backfill and compaction work", "Ensure erosion control and environmental measures are in place", "Plan equipment moves for the following day"],
      tools: ["Levelling instrument", "GPS rover", "Concrete vibrator", "Daily reporting software"],
      environment: "Outdoors on heavy civil sites such as roads, bridges, and foundations, often muddy and exposed to weather.",
    },
    whatYouActuallyDo: ["You lead a crew of civil workers through earthworks, concrete, and groundwork tasks on infrastructure projects.", "You ensure the physical work matches engineering drawings and quality standards."],
    whoThisIsGoodFor: ["Hands-on people who enjoy physical outdoor work", "Those who can read technical drawings fluently", "People who thrive on seeing tangible results each day", "Steady decision-makers comfortable with heavy machinery around them"],
    topSkills: ["Earthworks and grading", "Concrete technology", "Drawing interpretation", "Crew management", "Surveying basics"],
    entryPaths: ["Fagbrev as anleggsfagarbeider plus foreman course", "Years of civil construction experience with leadership responsibilities", "Vocational training in civil engineering combined with on-site mentoring"],
    realityCheck: "The work is physically demanding and weather-dependent, and you are first to arrive and last to leave the site most days.",
  },
  "tunnelling-technician": {
    typicalDay: {
      morning: ["Inspect tunnel face conditions and rock support", "Assist with drill-and-blast preparation or mechanical excavation", "Monitor ventilation and air quality in the heading"],
      midday: ["Help install rock bolts, shotcrete, or steel arches", "Record geological observations and support class decisions", "Coordinate mucking operations with machine operators"],
      afternoon: ["Survey advance and profile against design", "Maintain and inspect equipment used underground", "Participate in safety briefings for the next shift"],
      tools: ["Drill jumbo", "Shotcrete robot", "Gas detector", "Geological mapping tools"],
      environment: "Underground in active tunnel headings with noise, dust, and artificial lighting, rotating between day and night shifts.",
    },
    whatYouActuallyDo: ["You work inside tunnels under construction, supporting excavation, rock reinforcement, and safety monitoring.", "You are part of a specialised crew that builds infrastructure deep below the surface."],
    whoThisIsGoodFor: ["People comfortable working in confined underground spaces", "Those who enjoy geology and understanding rock behaviour", "Team players who follow strict safety protocols", "Workers who don't mind shift work and irregular hours"],
    topSkills: ["Rock support installation", "Drill-and-blast knowledge", "Underground safety", "Geological awareness", "Heavy equipment operation"],
    entryPaths: ["Fagbrev as fjell- og bergverksfagarbeider", "Apprenticeship with a tunnelling contractor like AF Gruppen or Skanska", "Experience in mining or quarrying transitioning to tunnel construction"],
    realityCheck: "You work underground in noisy, dusty conditions with real geological hazards, and shift rotations disrupt normal sleep patterns.",
  },
  "tunnel-boring-machine-technician": {
    typicalDay: {
      morning: ["Run pre-start checks on TBM systems and hydraulics", "Monitor cutterhead performance and advance rate", "Check segment erector and grout systems"],
      midday: ["Replace worn disc cutters in the cutterhead", "Troubleshoot electrical or hydraulic faults on the machine", "Review TBM data logs for anomalies"],
      afternoon: ["Maintain conveyor and muck removal systems", "Coordinate with the survey team on alignment", "Prepare the machine for shift handover"],
      tools: ["TBM control system", "Hydraulic torque wrenches", "Laser guidance system", "Condition monitoring software"],
      environment: "Inside and around a massive tunnel boring machine deep underground, with constant vibration, noise, and confined working spaces.",
    },
    whatYouActuallyDo: ["You operate and maintain a tunnel boring machine, one of the largest and most complex pieces of mobile equipment in construction.", "You keep the TBM advancing safely while managing its mechanical, electrical, and hydraulic systems."],
    whoThisIsGoodFor: ["Mechanically minded people who love complex machinery", "Troubleshooters who stay calm when systems fail underground", "Those willing to work extended shifts in confined environments", "People fascinated by large-scale engineering projects"],
    topSkills: ["TBM operation", "Hydraulic systems", "Mechanical fault diagnosis", "PLC and control systems", "Underground safety"],
    entryPaths: ["Fagbrev in industrial mechanics or automation plus TBM-specific training", "Apprenticeship with TBM contractors like Acciona or Herrenknecht service teams", "Heavy equipment maintenance background transitioning to TBM work"],
    realityCheck: "TBM work means long shifts deep underground in a noisy, confined machine, often on projects that run 24/7 for years.",
  },
  "rail-signalling-technician": {
    typicalDay: {
      morning: ["Test interlocking logic and signal aspects", "Inspect trackside signal equipment and cables", "Review work orders and safety plans for the day"],
      midday: ["Install or modify signalling relay systems", "Commission new ERTMS/ETCS onboard or trackside equipment", "Run functional tests on point machines and detection circuits"],
      afternoon: ["Document test results and update as-built drawings", "Coordinate track possessions with Bane NOR traffic control", "Troubleshoot faults reported by train dispatchers"],
      tools: ["Multimeter", "Signal testing kits", "ERTMS diagnostic tools", "Interlocking simulation software"],
      environment: "Split between trackside work on active railways (often at night during possessions) and indoor workshops or relay rooms.",
    },
    whatYouActuallyDo: ["You install, test, and maintain the signalling systems that keep trains from colliding and allow safe rail operations.", "You work with safety-critical equipment where errors can have serious consequences."],
    whoThisIsGoodFor: ["Meticulous people who thrive on precision and safety-critical work", "Those with strong electronics and logic skills", "Workers comfortable with night shifts and trackside conditions", "People who want a career in Norway's expanding rail sector"],
    topSkills: ["Railway signalling principles", "Interlocking systems", "ERTMS/ETCS technology", "Electrical testing", "Safety-critical documentation"],
    entryPaths: ["Fagbrev as signalmontør through Bane NOR's apprenticeship program", "Electrical/electronics education plus railway signalling courses", "Experience in industrial automation transitioning to rail signalling"],
    realityCheck: "Much of the hands-on work happens at night when tracks are free from trains, and the safety responsibility is enormous.",
  },
  "rail-systems-technician": {
    typicalDay: {
      morning: ["Inspect track circuits, power supply, and communication systems", "Run diagnostics on train detection and axle counter equipment", "Check condition of trackside cabinets and cabling"],
      midday: ["Perform preventive maintenance on railway telecom systems", "Install fibre optic or copper cabling along the railway corridor", "Test SCADA and remote monitoring systems"],
      afternoon: ["Update maintenance logs in Bane NOR's asset management system", "Coordinate upcoming possession windows for larger works", "Respond to urgent fault callouts on the line"],
      tools: ["OTDR fibre tester", "Track circuit test equipment", "SCADA monitoring software", "Cable fault locator"],
      environment: "Trackside along Norwegian rail corridors in all weather, with some time in technical equipment rooms and workshops.",
    },
    whatYouActuallyDo: ["You maintain the electrical, telecom, and monitoring systems that keep Norway's railway network running safely.", "You are a generalist across multiple rail subsystems, from power to communications."],
    whoThisIsGoodFor: ["Technically versatile people who enjoy variety in their work", "Those comfortable working outdoors along railway lines", "Problem solvers who can diagnose faults across different systems", "People who value stable employment in critical infrastructure"],
    topSkills: ["Railway systems knowledge", "Telecom and fibre optics", "Electrical fault-finding", "Preventive maintenance", "SCADA systems"],
    entryPaths: ["Fagbrev in electronics or electrical work plus rail-specific training", "Apprenticeship with Bane NOR or rail contractors like Sperry Rail", "Telecom or electrical background transitioning into railway systems"],
    realityCheck: "You will spend a lot of time outdoors in harsh weather along remote stretches of track, and callouts can come at any time.",
  },
  "overhead-line-equipment-technician": {
    typicalDay: {
      morning: ["Inspect catenary wires, masts, and insulators from a tower wagon", "Measure contact wire height and stagger", "Check tensioning devices and anchor arrangements"],
      midday: ["Replace worn contact wire sections or droppers", "Install new OLE masts and foundations during possessions", "Test insulation resistance on high-voltage components"],
      afternoon: ["Update inspection records and flag defects for planning", "Coordinate with signalling and track teams on joint possessions", "Prepare tools and materials for night possession work"],
      tools: ["Tower wagon (kontaktledningsmålvogn)", "Insulation tester", "Tension dynamometer", "High-voltage PPE"],
      environment: "Working at height from tower wagons along electrified rail lines, exposed to weather and high-voltage hazards.",
    },
    whatYouActuallyDo: ["You maintain and install the overhead wires that supply electric power to trains across Norway's rail network.", "You work at height with high-voltage equipment, often during night possessions when trains are not running."],
    whoThisIsGoodFor: ["People comfortable working at height and around high voltage", "Those who enjoy physical outdoor work along rail corridors", "Workers who don't mind night shifts and weekend work", "Detail-oriented technicians who respect strict safety procedures"],
    topSkills: ["OLE maintenance and installation", "High-voltage safety", "Working at height", "Catenary geometry", "Electrical testing"],
    entryPaths: ["Fagbrev as energimontør or elektriker plus OLE-specific training", "Apprenticeship with Bane NOR Energi or contractors like Eltel", "Electrical line worker background transitioning to railway OLE"],
    realityCheck: "You work at height with 15 kV overhead, often at night in Norwegian winter conditions, which demands serious respect for safety.",
  },
  "lift-technician": {
    typicalDay: {
      morning: ["Perform scheduled maintenance on elevator systems", "Test safety devices including overspeed governors and door interlocks", "Inspect wire ropes, sheaves, and braking systems"],
      midday: ["Diagnose faults using elevator controller diagnostics", "Replace worn components like door operators or guide shoes", "Respond to callouts for trapped passengers"],
      afternoon: ["Commission newly installed lifts and run acceptance tests", "Update maintenance logs and order spare parts", "Travel to the next building for the next scheduled service"],
      tools: ["Elevator controller diagnostic tool", "Multimeter", "Rope gauge", "Speed measurement device"],
      environment: "Inside elevator shafts, machine rooms, and on top of lift cars in commercial and residential buildings.",
    },
    whatYouActuallyDo: ["You install, maintain, and repair elevators to keep them running safely and reliably in buildings across your service area.", "You diagnose complex electromechanical faults and respond to emergency callouts."],
    whoThisIsGoodFor: ["People comfortable working in confined shafts and at height", "Electromechanical troubleshooters who enjoy variety", "Those who like working independently across multiple sites", "Workers who want a trade with strong job security"],
    topSkills: ["Elevator mechanics", "Electrical fault diagnosis", "Safety device testing", "PLC and controller systems", "Customer communication"],
    entryPaths: ["Fagbrev as heismontør through apprenticeship with Otis, Schindler, or KONE", "Electrical or mechanical background plus employer-provided lift training", "Vocational training in automation or electro combined with on-the-job specialisation"],
    realityCheck: "You spend your days in dark shafts and cramped machine rooms, and emergency callouts for stuck passengers come at inconvenient times.",
  },
  "escalator-technician": {
    typicalDay: {
      morning: ["Inspect escalator steps, chains, and drive units", "Test safety sensors including comb plates and handrail monitors", "Lubricate bearings and check chain tension"],
      midday: ["Diagnose faults causing shutdowns or speed irregularities", "Replace worn step chains or handrail drive components", "Perform annual statutory inspections on units"],
      afternoon: ["Commission repaired escalators and run test cycles", "Update service records and report recurring issues", "Travel to the next shopping centre or metro station"],
      tools: ["Chain tension gauge", "Vibration analyser", "Step demounting tool", "Controller diagnostic software"],
      environment: "Inside escalator pits and machinery spaces in shopping centres, airports, and metro stations, often working outside public hours.",
    },
    whatYouActuallyDo: ["You keep escalators and moving walkways running safely in high-traffic public spaces.", "You perform preventive maintenance and rapid fault response to minimise downtime."],
    whoThisIsGoodFor: ["Mechanically skilled people who enjoy repetitive precision work", "Those comfortable in tight machinery spaces below floor level", "Workers who prefer early mornings or late nights when public areas are quiet", "People who like travelling between different sites each day"],
    topSkills: ["Escalator mechanics", "Chain and drive systems", "Safety device testing", "Preventive maintenance", "Fault diagnosis"],
    entryPaths: ["Fagbrev as heismontør with escalator specialisation", "Mechanical apprenticeship plus manufacturer training from Schindler or ThyssenKrupp", "Industrial mechanic background transitioning to escalator service"],
    realityCheck: "Much of the work happens in cramped, greasy pits beneath escalators, and the job requires early starts or late finishes to avoid disrupting the public.",
  },
  "cnc-machinist": {
    typicalDay: {
      morning: ["Read technical drawings and set up the CNC machine for the day's jobs", "Load tooling and input G-code programs", "Run first-off parts and verify dimensions"],
      midday: ["Monitor machine cycles and adjust offsets as needed", "Measure parts with micrometers and CMM", "Troubleshoot tool wear or programming issues"],
      afternoon: ["Deburr and inspect finished parts against tolerances", "Document quality records and update production logs", "Prepare setups for the next production run"],
      tools: ["CNC lathe/mill", "Mastercam or Fusion 360 CAM", "CMM", "Micrometers and calipers"],
      environment: "Indoor machine shop with CNC equipment, cutting fluids, and moderate noise levels, typically climate-controlled.",
    },
    whatYouActuallyDo: ["You program and operate CNC machines to produce metal parts to precise specifications from technical drawings.", "You are responsible for quality, efficiency, and keeping expensive machines running productively."],
    whoThisIsGoodFor: ["Detail-oriented people who enjoy precision and measurement", "Those who like combining computer programming with hands-on work", "Patient workers who take pride in tight tolerances", "People who enjoy problem-solving when cuts don't go as planned"],
    topSkills: ["CNC programming (G-code)", "Blueprint reading", "Precision measurement", "CAM software", "Tooling selection"],
    entryPaths: ["Fagbrev as CNC-maskinist or industrimekaniker", "Apprenticeship at a precision machining company", "Vocational school (yrkesfag) in TIP followed by shop floor training"],
    realityCheck: "The work demands intense concentration on tiny measurements all day, and a single mistake can scrap an expensive workpiece.",
  },
  "precision-machinist": {
    typicalDay: {
      morning: ["Study tight-tolerance drawings for aerospace or medical components", "Set up manual or CNC machines for precision work", "Select appropriate cutting tools and materials"],
      midday: ["Machine parts to micron-level tolerances", "Perform in-process measurements with gauge blocks and indicators", "Hand-finish surfaces using lapping or grinding techniques"],
      afternoon: ["Inspect completed parts on CMM and document results", "Adjust processes based on measurement feedback", "Maintain and calibrate precision measuring instruments"],
      tools: ["Surface grinder", "Jig borer", "CMM", "Gauge blocks and dial indicators"],
      environment: "Temperature-controlled precision workshop with low vibration, producing high-value components for demanding industries.",
    },
    whatYouActuallyDo: ["You machine components to extremely tight tolerances for industries like aerospace, defence, and medical devices.", "You combine advanced machine skills with metrology expertise to achieve micron-level accuracy."],
    whoThisIsGoodFor: ["Perfectionists who obsess over getting things exactly right", "People with exceptional patience and steady hands", "Those fascinated by measurement science and materials", "Workers who prefer quality over speed"],
    topSkills: ["Precision grinding", "Metrology", "Manual machining", "Surface finishing", "Geometric tolerancing (GD&T)"],
    entryPaths: ["Fagbrev as finmekaniker or industrimekaniker with precision specialisation", "Apprenticeship in a precision engineering workshop", "CNC machinist background progressing into tighter-tolerance work"],
    realityCheck: "You will spend hours chasing microns, and the pressure is high because the parts you make often go into safety-critical applications.",
  },
  "toolmaker": {
    typicalDay: {
      morning: ["Review 3D models and drawings of moulds, dies, or fixtures", "Plan machining sequences for complex tool components", "Set up wire EDM or CNC milling for tool steel parts"],
      midday: ["Machine tool inserts, cavities, and core pins", "Hand-fit and assemble mould or die components", "Heat-treat or send parts for surface treatment"],
      afternoon: ["Trial the completed tool in the press or injection moulder", "Adjust fits and clearances based on trial results", "Document the tool build and create maintenance instructions"],
      tools: ["Wire EDM", "CNC machining centre", "Surface grinder", "CAD/CAM software (SolidWorks, PowerMill)"],
      environment: "Indoor toolroom workshop with precision equipment, typically attached to a manufacturing facility.",
    },
    whatYouActuallyDo: ["You design, build, and maintain the moulds, dies, and special tooling used to mass-produce parts.", "You are a highly skilled all-round machinist who turns engineering designs into production-ready tools."],
    whoThisIsGoodFor: ["Creative problem solvers who enjoy building one-off precision items", "People who want to master multiple machining processes", "Those who like seeing their work enable large-scale production", "Patient craftspeople who take pride in fit and finish"],
    topSkills: ["Mould and die making", "Multi-process machining", "CAD/CAM", "Hand fitting and assembly", "Heat treatment knowledge"],
    entryPaths: ["Fagbrev as verktøymaker", "Apprenticeship in a toolmaking workshop", "Progression from CNC machinist into toolroom work with additional training"],
    realityCheck: "Toolmaking is a long learning curve where you must master many processes, and deadlines are tight because production depends on your tools.",
  },
  "industrial-fitter": {
    typicalDay: {
      morning: ["Read assembly drawings and plan the fitting sequence", "Prepare components by deburring and checking dimensions", "Align and fit mechanical assemblies using precision instruments"],
      midday: ["Install bearings, seals, and shaft couplings", "Assemble gearboxes, pumps, or process equipment", "Perform leak tests and functional checks on assemblies"],
      afternoon: ["Adjust clearances and tolerances to specification", "Complete documentation and quality sign-offs", "Prepare assemblies for shipping or installation on site"],
      tools: ["Torque wrenches", "Dial indicators", "Hydraulic press", "Laser alignment system"],
      environment: "Large assembly halls in manufacturing plants or on industrial sites, working with heavy components and overhead cranes.",
    },
    whatYouActuallyDo: ["You assemble, install, and align industrial machinery and mechanical systems to precise specifications.", "You ensure everything fits, moves, and seals correctly before equipment goes into service."],
    whoThisIsGoodFor: ["Methodical people who enjoy assembling complex mechanical systems", "Those with good spatial awareness and hand-eye coordination", "Workers comfortable with heavy components and industrial environments", "People who like both workshop and on-site work"],
    topSkills: ["Mechanical assembly", "Precision alignment", "Blueprint reading", "Hydraulics and pneumatics", "Bearing and seal installation"],
    entryPaths: ["Fagbrev as industrimekaniker", "Apprenticeship at a manufacturing or process plant", "Mechanical trade background with assembly specialisation"],
    realityCheck: "The work requires heavy lifting and awkward positions, and you must get alignments perfect because poorly fitted equipment fails expensively.",
  },
  "millwright": {
    typicalDay: {
      morning: ["Diagnose mechanical faults on production machinery", "Plan repair sequence and isolate equipment safely (LOTO)", "Disassemble failed components like gearboxes or conveyors"],
      midday: ["Replace bearings, shafts, belts, and couplings", "Align motors and driven equipment with laser tools", "Fabricate simple brackets or adapters in the workshop"],
      afternoon: ["Reassemble and test repaired machinery", "Perform vibration analysis to verify repair quality", "Update maintenance management system and close work orders"],
      tools: ["Laser alignment tool", "Vibration analyser", "Bearing puller/heater", "Portable machining equipment"],
      environment: "Inside factories, process plants, and industrial facilities, moving between the maintenance workshop and the production floor.",
    },
    whatYouActuallyDo: ["You maintain, repair, and install industrial machinery to keep production running in factories and process plants.", "You are the go-to person when critical equipment breaks down and production is losing money every minute."],
    whoThisIsGoodFor: ["Versatile mechanical troubleshooters who work well under pressure", "People who enjoy the challenge of diagnosing unseen faults", "Those who like variety and never doing the same job twice", "Workers who want to be essential to an industrial operation"],
    topSkills: ["Mechanical fault diagnosis", "Shaft alignment", "Rotating equipment maintenance", "Fabrication basics", "Condition monitoring"],
    entryPaths: ["Fagbrev as industrimekaniker", "Apprenticeship in a process industry like Hydro, Yara, or Equinor", "Military technical training followed by industrial maintenance roles"],
    realityCheck: "Breakdowns don't wait for convenient times, so expect callouts, weekend work, and high pressure to get machines back online fast.",
  },
  "welding-inspector": {
    typicalDay: {
      morning: ["Review welding procedure specifications (WPS) and welder qualifications", "Inspect weld preparation and fit-up before welding begins", "Verify preheat temperatures and consumable batch certificates"],
      midday: ["Perform visual inspection of completed welds", "Coordinate NDT testing (UT, RT, MT, PT) with technicians", "Evaluate weld defects against acceptance criteria in standards"],
      afternoon: ["Write inspection reports and non-conformance reports", "Witness welder qualification tests", "Audit the fabricator's quality management system"],
      tools: ["Weld gauges (Cambridge, HiLo)", "Magnifying glass and torch", "Temperature measurement equipment", "NDT reports and welding standards (NS-EN ISO 5817)"],
      environment: "Fabrication workshops, offshore platforms, and construction sites, dividing time between hands-on inspection and documentation.",
    },
    whatYouActuallyDo: ["You verify that welding work meets code requirements and quality standards, protecting structural integrity and safety.", "You are the quality gatekeeper between welders, engineers, and the client."],
    whoThisIsGoodFor: ["Detail-oriented people who are comfortable enforcing standards", "Those with welding experience who want to move into a quality role", "People who can communicate diplomatically when rejecting work", "Workers who value safety and are not afraid to stop non-conforming work"],
    topSkills: ["Visual weld inspection", "Welding standards (ISO, NORSOK)", "NDT coordination", "Quality documentation", "Welder qualification testing"],
    entryPaths: ["IWI or CSWIP 3.1 certification after trade experience as a welder", "Fagbrev as sveiser plus welding inspection courses", "Engineering background with welding technology specialisation"],
    realityCheck: "You must reject substandard work from experienced welders, which requires diplomacy and backbone, and the paperwork load is heavy.",
  },
  "coded-welder": {
    typicalDay: {
      morning: ["Review WPS and drawing requirements for the day's joints", "Prepare weld joints by grinding and cleaning", "Set up welding equipment and verify gas flow and settings"],
      midday: ["Weld coded joints in pipe or plate to strict procedure requirements", "Perform self-inspection between passes", "Maintain consistent technique across difficult positions (6G, 6GR)"],
      afternoon: ["Complete weld logs and identification markings", "Prepare joints for NDT inspection", "Maintain and clean welding equipment"],
      tools: ["TIG (GTAW) welding machine", "MIG/MAG welding machine", "Angle grinder", "Welding gauges"],
      environment: "Fabrication workshops or construction sites, often in confined spaces, at height, or in challenging positions with heat and fumes.",
    },
    whatYouActuallyDo: ["You produce high-quality welds on critical joints that must pass rigorous NDT and visual inspection.", "Your welds go into pressure vessels, pipelines, and structures where failure is not an option."],
    whoThisIsGoodFor: ["People with extremely steady hands and patience", "Those who take pride in producing flawless work under scrutiny", "Workers who can maintain focus in uncomfortable positions for hours", "People who want a well-paid manual trade with global demand"],
    topSkills: ["TIG welding", "Multi-process welding", "Pipe welding in all positions", "Blueprint reading", "Weld quality self-assessment"],
    entryPaths: ["Fagbrev as sveiser followed by coded welder qualifications (ISO 9606)", "Apprenticeship at an offshore fabrication yard like Aker Solutions or Kværner", "Welding courses at a training centre followed by yard employment and coding tests"],
    realityCheck: "Every weld you make is X-rayed or ultrasonically tested, and a single defect means cutting it out and starting over.",
  },
  "pipefitter": {
    typicalDay: {
      morning: ["Read isometric drawings and plan pipe spool fabrication", "Mark out and cut pipe to dimension", "Prepare weld bevels and fit pipe joints to tolerance"],
      midday: ["Tack-weld pipe assemblies for the coded welder", "Install pipe supports, hangers, and clamps", "Fit flanges, valves, and instrumentation connections"],
      afternoon: ["Perform dimensional checks on completed spools", "Assist with hydrostatic pressure testing", "Update fabrication tracking sheets and material records"],
      tools: ["Pipe bender", "Bevelling machine", "Flange alignment tools", "Isometric drawing software"],
      environment: "Fabrication workshops and industrial construction sites such as oil refineries, offshore platforms, and process plants.",
    },
    whatYouActuallyDo: ["You fabricate and install piping systems that carry fluids and gases in industrial plants and offshore facilities.", "You turn 2D isometric drawings into precisely fitted 3D pipe assemblies."],
    whoThisIsGoodFor: ["People with strong spatial reasoning who can visualise pipe routing in 3D", "Those who enjoy working with their hands on physical assemblies", "Workers who like the mix of workshop fabrication and site installation", "People looking for a trade with strong demand in oil, gas, and process industries"],
    topSkills: ["Isometric drawing interpretation", "Pipe fitting and alignment", "Flange management", "Pressure testing", "Material identification"],
    entryPaths: ["Fagbrev as rørlegger (industrial) or platearbeider with piping specialisation", "Apprenticeship at offshore fabrication yards", "Plumbing background transitioning to industrial pipefitting"],
    realityCheck: "You work around hot pipes, confined spaces, and heavy lifts, and tolerances are tight because every joint must seal under pressure.",
  },
  "boilermaker": {
    typicalDay: {
      morning: ["Interpret fabrication drawings for pressure vessels or tanks", "Mark out and cut heavy steel plate using plasma or oxy-fuel", "Roll and form plate sections to required curvature"],
      midday: ["Fit and tack plate sections together for welding", "Install nozzles, manways, and internal fittings", "Assist with stress-relieving heat treatment after welding"],
      afternoon: ["Grind and prepare welds for NDT inspection", "Perform dimensional checks against fabrication tolerances", "Maintain workshop equipment and organise materials"],
      tools: ["Plate roller", "Plasma cutter", "Overhead crane", "Fabrication layout tools"],
      environment: "Heavy fabrication workshops and industrial sites, working with large steel structures, heavy plate, and hot processes.",
    },
    whatYouActuallyDo: ["You fabricate and repair pressure vessels, tanks, boilers, and heavy steel structures from plate and structural steel.", "You combine layout, cutting, forming, and fitting skills to build things that must contain pressure safely."],
    whoThisIsGoodFor: ["Strong, physically capable people who enjoy heavy fabrication", "Those who can interpret complex fabrication drawings", "Workers who take pride in building large-scale industrial structures", "People comfortable with hot work and heavy lifting"],
    topSkills: ["Heavy plate fabrication", "Pressure vessel layout", "Thermal cutting", "Plate rolling and forming", "Fabrication drawing interpretation"],
    entryPaths: ["Fagbrev as platearbeider or sveiser with fabrication focus", "Apprenticeship at a heavy fabrication workshop", "Welding trade background expanding into plate work and vessel fabrication"],
    realityCheck: "The work is hot, heavy, and physically demanding, and quality requirements for pressure-containing equipment leave no margin for error.",
  },
  "commercial-diver": {
    typicalDay: {
      morning: ["Attend dive briefing and review the job scope and emergency procedures", "Perform pre-dive equipment checks on helmet, umbilical, and comms", "Enter the water for inspection or light construction tasks"],
      midday: ["Conduct underwater inspections using video and still cameras", "Perform tasks like cutting, grinding, or bolt tensioning subsea", "Communicate continuously with dive supervisor on the surface"],
      afternoon: ["Debrief after dive and log bottom time", "Maintain diving equipment and prepare for the next dive", "Write dive reports and document completed work"],
      tools: ["Surface-supplied diving helmet", "Underwater camera system", "Hydraulic tools (grinder, impact wrench)", "Diving umbilical and comms"],
      environment: "Underwater in harbours, fjords, rivers, and coastal waters, operating from dive vessels or pontoons in variable visibility.",
    },
    whatYouActuallyDo: ["You perform underwater construction, inspection, and maintenance work using surface-supplied diving equipment.", "You carry out tasks subsea that would be routine on land but become challenging underwater."],
    whoThisIsGoodFor: ["Physically fit people who are calm and methodical underwater", "Those who enjoy the water and are comfortable in low-visibility environments", "Workers who follow procedures precisely under pressure", "People seeking an adventurous trade with diverse project types"],
    topSkills: ["Surface-supplied diving", "Underwater inspection", "Subsea cutting and welding", "Rigging and lifting", "Emergency procedures"],
    entryPaths: ["Commercial diving certificate from a recognised school (e.g., Nytt Dykkerakademiet)", "IDSA/IMCA-recognised diving qualification", "Military diving background transitioning to commercial work"],
    realityCheck: "You work in cold, dark water with zero visibility at times, the physical demands are extreme, and the career can be hard on your body long-term.",
  },
  "saturation-diver": {
    typicalDay: {
      morning: ["Transfer from the saturation chamber to the diving bell", "Bell run to the worksite at depths of 100-300+ metres", "Begin work tasks on subsea pipelines or structures"],
      midday: ["Continue precision tasks like hot-tap installation or flange work", "Operate hydraulic tooling in deep water with limited visibility", "Communicate with life support technicians monitoring chamber conditions"],
      afternoon: ["Return to the bell and transfer back to the saturation chamber", "Rest, eat, and decompress in the pressurised living chamber", "Review the day's work with the dive supervisor via intercom"],
      tools: ["Saturation diving bell", "Hot water suit", "Hydraulic subsea tooling", "Helium-oxygen breathing gas systems"],
      environment: "Living under pressure in a saturation chamber on a dive vessel for 28-day cycles, working at extreme depths in open ocean.",
    },
    whatYouActuallyDo: ["You live under pressure in a chamber for weeks at a time to perform deep-sea construction and maintenance work.", "You operate at depths where conventional divers cannot work, making you essential for deep offshore infrastructure."],
    whoThisIsGoodFor: ["Exceptionally calm, disciplined people who tolerate confinement", "Those willing to live in a pressurised chamber for weeks", "Physically and mentally resilient individuals", "People motivated by high earnings and unique experiences"],
    topSkills: ["Deep diving operations", "Subsea construction", "Hyperbaric living", "Hydraulic tooling", "Emergency survival procedures"],
    entryPaths: ["Commercial diving certificate plus years of surface diving experience", "Progression from air diving to mixed gas to saturation with an offshore diving company", "Military clearance diver background transitioning to commercial saturation"],
    realityCheck: "You live in a pressurised metal chamber breathing helium for weeks, your voice sounds like a cartoon character, and the work is among the most dangerous in any industry.",
  },
  "subsea-diver": {
    typicalDay: {
      morning: ["Review ROV survey footage and plan intervention tasks", "Attend toolbox talk covering subsea hazards and emergency response", "Prepare equipment for deployment to the seabed"],
      midday: ["Dive to inspect or repair subsea wellheads, manifolds, or pipelines", "Operate hydraulic tooling for connector make-up or valve operation", "Guide crane lifts and rigging operations from the seabed"],
      afternoon: ["Decompress and debrief with the dive team", "Document completed work with video and written reports", "Maintain personal diving equipment and check gas supplies"],
      tools: ["Mixed-gas diving system", "Subsea hydraulic tool spread", "Underwater inspection cameras", "Diver-operated ROV interface"],
      environment: "Offshore from diving support vessels in the North Sea, working on the seabed around oil and gas infrastructure.",
    },
    whatYouActuallyDo: ["You dive to work on subsea oil and gas infrastructure, performing inspection, maintenance, and repair tasks on the seabed.", "You bridge the gap between surface operations and the remote subsea equipment that produces hydrocarbons."],
    whoThisIsGoodFor: ["Physically fit people who want to work in the offshore oil and gas sector", "Those with a calm temperament who perform well in high-risk environments", "Workers who enjoy technical mechanical work in unusual settings", "People willing to spend extended periods offshore on vessels"],
    topSkills: ["Mixed-gas diving", "Subsea intervention", "Hydraulic connector systems", "Rigging and lifting", "Offshore safety (BOSIET/HUET)"],
    entryPaths: ["Commercial diving certification followed by offshore diving trainee positions", "Surface-supplied diving experience progressing to mixed-gas subsea work", "Military or police diving background moving into offshore subsea operations"],
    realityCheck: "North Sea conditions are harsh, the work is physically punishing in cold deep water, and you spend long rotations offshore away from home.",
  },

  "rope-access-technician": {
    typicalDay: {
      morning: ["Safety briefing and risk assessment", "Rigging ropes and anchor systems on structure", "Inspecting personal protective equipment"],
      midday: ["Performing maintenance tasks at height", "Documenting work with photos and reports", "Communicating with ground crew via radio"],
      afternoon: ["Completing welding or coating repairs on facades", "De-rigging rope systems and securing equipment", "Filing daily work logs and safety observations"],
      tools: ["IRATA-certified rope systems", "Descenders and ascenders", "Harnesses and helmets", "Inspection cameras"],
      environment: "Working on bridges, offshore platforms, wind turbines, and high-rise buildings in all weather conditions.",
    },
    whatYouActuallyDo: ["You access hard-to-reach structures using ropes to perform inspections, maintenance, and repairs.", "Most jobs are outdoors at significant heights on industrial or energy infrastructure."],
    whoThisIsGoodFor: ["Comfortable working at extreme heights", "Physically fit and agile", "Calm under pressure", "Enjoys variety in work locations"],
    topSkills: ["IRATA/SOFT rope access certification", "Height rescue techniques", "Rigging and knot-tying", "NDT or coating application", "Risk assessment"],
    entryPaths: ["SOFT rope access Level 1 course", "IRATA certification programme", "Apprenticeship with industrial rope access company"],
    realityCheck: "You will work in harsh weather at extreme heights, and the physical demands are relentless.",
  },
  "industrial-abseiler": {
    typicalDay: {
      morning: ["Attending toolbox talk and reviewing job scope", "Setting up abseil lines on building or structure", "Checking all PPE and backup systems"],
      midday: ["Descending structure to perform cleaning or coating work", "Applying sealants or protective coatings", "Coordinating with scaffolders and other trades"],
      afternoon: ["Inspecting completed work from rope position", "Retrieving tools and de-rigging lines", "Completing job safety analysis forms"],
      tools: ["Abseil ropes and backup lines", "Spray equipment", "Power tools adapted for height work", "Two-way radios"],
      environment: "Building facades, dams, bridges, and industrial structures, often in exposed outdoor conditions.",
    },
    whatYouActuallyDo: ["You descend structures on ropes to carry out cleaning, painting, sealing, and light repair work.", "The role combines trade skills with advanced rope techniques."],
    whoThisIsGoodFor: ["No fear of heights", "Good hand-eye coordination", "Enjoys physical outdoor work", "Reliable and safety-conscious"],
    topSkills: ["Abseil and rope rescue techniques", "Surface preparation and coating", "Confined space awareness", "Rigging", "Weather assessment"],
    entryPaths: ["IRATA or SOFT Level 1 certification", "Background in painting, cleaning, or building maintenance", "On-the-job training with experienced abseil teams"],
    realityCheck: "The work is seasonal and weather-dependent, meaning income can fluctuate significantly.",
  },
  "confined-space-rescue-technician": {
    typicalDay: {
      morning: ["Testing atmospheric conditions in confined spaces", "Setting up rescue tripods and retrieval systems", "Briefing entry teams on emergency procedures"],
      midday: ["Standing by during confined space entry operations", "Monitoring gas readings continuously", "Running rescue drills with team"],
      afternoon: ["Inspecting and maintaining rescue equipment", "Updating confined space entry permits", "Debriefing the day's operations with supervisors"],
      tools: ["Multi-gas detectors", "Rescue tripods and winches", "Self-contained breathing apparatus (SCBA)", "Stretchers and haul systems"],
      environment: "Tanks, vessels, pipelines, and underground chambers at industrial plants, refineries, and offshore installations.",
    },
    whatYouActuallyDo: ["You stand by during confined space operations ready to extract workers in emergencies.", "You also test atmospheres and ensure all safety systems are operational before anyone enters."],
    whoThisIsGoodFor: ["Stays calm in emergencies", "Physically strong and quick to react", "Detail-oriented about safety protocols", "Works well under high-stress situations"],
    topSkills: ["Confined space rescue certification", "Atmospheric monitoring", "First aid and trauma care", "SCBA operation", "Emergency planning"],
    entryPaths: ["Fagbrev in relevant trade plus confined space rescue course", "Fire and rescue service background", "Offshore safety training (BOSIET) plus specialised rescue modules"],
    realityCheck: "Most shifts are spent waiting and watching, but when something goes wrong you must perform flawlessly under extreme pressure.",
  },
  "hazardous-materials-technician": {
    typicalDay: {
      morning: ["Reviewing material safety data sheets for job site chemicals", "Donning protective suits and respiratory equipment", "Establishing contamination control zones"],
      midday: ["Collecting samples of hazardous substances", "Removing asbestos, lead paint, or chemical residues", "Monitoring air quality in work zone"],
      afternoon: ["Decontaminating equipment and personnel", "Packaging hazardous waste for certified transport", "Completing disposal documentation and chain-of-custody logs"],
      tools: ["Level A/B chemical suits", "Air sampling pumps", "Decontamination showers", "Sealed waste containers"],
      environment: "Demolition sites, old industrial buildings, offshore decommissioning projects, and contaminated land.",
    },
    whatYouActuallyDo: ["You safely identify, handle, remove, and dispose of hazardous materials like asbestos, chemicals, and radioactive substances.", "Strict regulatory compliance governs every step of your work."],
    whoThisIsGoodFor: ["Meticulous and rule-following", "Comfortable in heavy protective gear", "Patient and methodical", "Interested in environmental protection"],
    topSkills: ["Hazmat handling certification", "Asbestos removal (norsk asbestsertifikat)", "Waste classification", "Decontamination procedures", "Regulatory compliance"],
    entryPaths: ["Asbestos sanering course and certification", "Fagbrev in building or chemical engineering plus hazmat modules", "Employment with licensed sanering companies"],
    realityCheck: "Working in full protective suits for hours is physically exhausting and claustrophobic, especially in summer heat.",
  },
  "explosives-technician": {
    typicalDay: {
      morning: ["Inventory check of explosives magazine", "Planning blast pattern from engineering drawings", "Transporting charges to blast site under strict security"],
      midday: ["Drilling and loading blast holes with charges", "Connecting detonators and initiating systems", "Establishing safety perimeter and warning systems"],
      afternoon: ["Executing controlled blast and monitoring results", "Inspecting blast area for misfires", "Documenting quantities used and returning unused materials"],
      tools: ["Detonators and initiating systems", "Blast design software", "Seismographs", "Drilling equipment"],
      environment: "Tunnels, quarries, road construction sites, and mining operations across Norway.",
    },
    whatYouActuallyDo: ["You plan and execute controlled explosions for tunnelling, mining, and construction projects.", "Precise calculations and strict safety protocols prevent damage to surrounding structures."],
    whoThisIsGoodFor: ["Extremely detail-oriented", "Calm and methodical under pressure", "Strong in mathematics", "Comfortable with high-responsibility decisions"],
    topSkills: ["Bergsprenger certificate (blasting licence)", "Blast design and calculation", "Detonator handling", "Vibration monitoring", "Regulatory compliance (eksplosivforskriften)"],
    entryPaths: ["Bergsprenger certification course", "Fagbrev as fjell- og bergverksarbeider", "Apprenticeship with tunnelling or mining contractor"],
    realityCheck: "A single mistake with explosives can be fatal, so the mental pressure and regulatory scrutiny are constant.",
  },
  "controlled-demolition-specialist": {
    typicalDay: {
      morning: ["Surveying structure and reviewing demolition plan", "Identifying load-bearing elements and utilities", "Setting up exclusion zones and dust suppression"],
      midday: ["Operating hydraulic crushers or shears on structure", "Placing charges for implosion sequence if applicable", "Coordinating crane operators and ground crew"],
      afternoon: ["Monitoring structural stability during teardown", "Sorting demolition waste for recycling", "Updating progress against demolition method statement"],
      tools: ["Hydraulic demolition robots", "Concrete crushers and shears", "Explosive charges for implosion", "Dust suppression systems"],
      environment: "Urban demolition sites, decommissioned industrial plants, and offshore platform removal projects.",
    },
    whatYouActuallyDo: ["You plan and execute the safe teardown of buildings and structures using mechanical or explosive methods.", "Each project requires unique engineering analysis to prevent uncontrolled collapse."],
    whoThisIsGoodFor: ["Strong spatial reasoning", "Enjoys problem-solving with physical structures", "Comfortable making critical safety decisions", "Interested in engineering and physics"],
    topSkills: ["Structural engineering knowledge", "Demolition method planning", "Heavy equipment operation", "Explosives handling (bergsprenger)", "Waste sorting and recycling regulations"],
    entryPaths: ["Fagbrev in building or construction plus demolition specialisation", "Bergsprenger certificate for explosive demolition", "Experience with heavy machinery contractors"],
    realityCheck: "Demolition looks dramatic but is mostly slow, methodical planning with enormous paperwork and regulatory requirements.",
  },
  "non-destructive-testing-technician": {
    typicalDay: {
      morning: ["Calibrating ultrasonic and radiographic equipment", "Reviewing weld maps and inspection scope", "Setting up test area and safety barriers"],
      midday: ["Performing ultrasonic testing on pipeline welds", "Conducting magnetic particle or dye penetrant inspections", "Recording defect indications and measurements"],
      afternoon: ["Analysing test data against acceptance criteria", "Writing inspection reports with defect evaluations", "Discussing findings with welding engineers"],
      tools: ["Ultrasonic flaw detectors", "X-ray and gamma ray sources", "Magnetic particle yokes", "Dye penetrant kits"],
      environment: "Fabrication yards, offshore platforms, refineries, and power plants, often in confined or elevated positions.",
    },
    whatYouActuallyDo: ["You use specialised equipment to find cracks, corrosion, and defects in welds and materials without damaging them.", "Your reports determine whether critical infrastructure is safe to operate."],
    whoThisIsGoodFor: ["Analytical and detail-focused", "Patient with repetitive precision work", "Interested in physics and materials science", "Comfortable working in industrial environments"],
    topSkills: ["NDT Level II certification (UT, RT, MT, PT)", "Weld inspection knowledge", "Report writing", "Radiation safety", "Standards interpretation (ASME, EN/ISO)"],
    entryPaths: ["NDT Level I and II courses through NORDTEST/ISO 9712", "Fagbrev in relevant trade plus NDT training", "Trainee programme with inspection company"],
    realityCheck: "The work requires intense concentration for hours, and you carry personal liability for the safety of the structures you certify.",
  },
  "level-iii-ndt-inspector": {
    typicalDay: {
      morning: ["Reviewing and approving NDT procedures for projects", "Auditing Level I/II technician qualifications", "Interpreting complex codes and standards for clients"],
      midday: ["Evaluating difficult or disputed inspection findings", "Training junior technicians on new methods", "Meeting with project engineers on inspection strategy"],
      afternoon: ["Writing technical procedures and method statements", "Reviewing radiographic film or PAUT scan data", "Preparing qualification exam materials for technicians"],
      tools: ["Advanced PAUT and TOFD systems", "Digital radiography software", "Procedure writing templates", "Standards libraries (EN, ASME, API)"],
      environment: "Office and on-site at major construction projects, fabrication yards, and operating plants across Norway and internationally.",
    },
    whatYouActuallyDo: ["You are the highest technical authority in NDT, writing procedures, training technicians, and making final calls on critical defects.", "The role is a mix of hands-on technical leadership and standards interpretation."],
    whoThisIsGoodFor: ["Deep technical expertise in materials", "Enjoys mentoring and teaching", "Strong written communication skills", "Comfortable with regulatory responsibility"],
    topSkills: ["NDT Level III certification (multiple methods)", "Standards and code interpretation", "Procedure development", "Technical auditing", "Training and examination"],
    entryPaths: ["NDT Level III examination after years as Level II", "Engineering degree plus NDT specialisation", "Senior inspection roles with major contractors like DNV or Aker"],
    realityCheck: "Reaching Level III takes a decade of experience, and the role carries significant legal and professional liability.",
  },
  "gas-network-technician": {
    typicalDay: {
      morning: ["Checking gas leak detection equipment calibration", "Reviewing planned maintenance on distribution network", "Driving to work site and establishing safety zone"],
      midday: ["Performing leak surveys on underground gas mains", "Repairing or replacing gas service connections", "Pressure testing repaired pipe sections"],
      afternoon: ["Responding to emergency gas leak callouts", "Updating GIS mapping of network changes", "Completing work orders and safety documentation"],
      tools: ["Gas leak detectors", "PE pipe fusion equipment", "Pressure testing rigs", "GIS mapping tablets"],
      environment: "Outdoors in streets and residential areas, working on underground gas distribution networks in all weather.",
    },
    whatYouActuallyDo: ["You install, maintain, and repair the underground gas distribution network that supplies homes and businesses.", "Emergency leak response is a critical part of the role."],
    whoThisIsGoodFor: ["Enjoys hands-on outdoor work", "Stays calm during emergencies", "Good spatial awareness for underground services", "Reliable and available for callouts"],
    topSkills: ["Gas network fagbrev or equivalent", "PE pipe welding and fusion", "Leak detection and survey", "Pressure regulation systems", "Emergency response protocols"],
    entryPaths: ["Fagbrev as rørlegger or energimontør with gas specialisation", "Apprenticeship with gas distribution company", "Internal training programme at Gassco or local gas utilities"],
    realityCheck: "You will be called out at any hour for gas leaks, and working in excavations beside live gas mains demands constant vigilance.",
  },
  "water-treatment-plant-technician": {
    typicalDay: {
      morning: ["Checking SCADA system alarms and process parameters", "Collecting water samples for laboratory analysis", "Adjusting chemical dosing for coagulation and disinfection"],
      midday: ["Inspecting pumps, filters, and UV treatment systems", "Performing preventive maintenance on valves and motors", "Monitoring turbidity, pH, and chlorine residual levels"],
      afternoon: ["Troubleshooting process deviations", "Ordering chemicals and spare parts", "Logging operational data and compliance records"],
      tools: ["SCADA control systems", "Laboratory water testing equipment", "Chemical dosing pumps", "Turbidity meters and pH probes"],
      environment: "Municipal water treatment plants, typically clean indoor facilities with some outdoor reservoir and intake work.",
    },
    whatYouActuallyDo: ["You operate and maintain the treatment processes that turn raw water into safe drinking water for communities.", "Constant monitoring ensures water quality meets strict Norwegian health standards."],
    whoThisIsGoodFor: ["Interested in chemistry and environmental science", "Enjoys process monitoring and troubleshooting", "Responsible and quality-focused", "Comfortable with shift work"],
    topSkills: ["Driftsoperatør VA certification", "Water chemistry knowledge", "SCADA system operation", "Mechanical maintenance", "Regulatory compliance (drikkevannsforskriften)"],
    entryPaths: ["Fagbrev as kjemiprosessoperatør or driftsoperatør", "VA-tekniker training through Norsk Vann", "Apprenticeship with municipal water utility"],
    realityCheck: "The work is stable but involves shift work including nights and weekends, and any process failure directly affects public health.",
  },
  "wastewater-systems-technician": {
    typicalDay: {
      morning: ["Reviewing overnight alarms from pump stations", "Inspecting sewer lines with CCTV camera robot", "Checking biological treatment process parameters"],
      midday: ["Maintaining pumps and blowers at treatment plant", "Collecting effluent samples for discharge compliance", "Clearing blockages in sewer network"],
      afternoon: ["Repairing or replacing damaged sewer pipes", "Updating asset management database", "Coordinating with municipal planners on network upgrades"],
      tools: ["CCTV sewer inspection robots", "High-pressure jetting equipment", "SCADA systems", "Portable flow meters"],
      environment: "Wastewater treatment plants and underground sewer networks, involving exposure to unpleasant odours and biological hazards.",
    },
    whatYouActuallyDo: ["You maintain sewer networks and operate treatment plants that clean wastewater before it returns to the environment.", "The work ranges from pipe inspection to biological process control."],
    whoThisIsGoodFor: ["Not squeamish about dirty work", "Mechanically minded", "Interested in environmental protection", "Enjoys a mix of fieldwork and process operation"],
    topSkills: ["VA-drift certification", "Pump and mechanical maintenance", "CCTV pipe inspection", "Biological treatment process knowledge", "Environmental discharge regulations"],
    entryPaths: ["Fagbrev as driftsoperatør or rørlegger", "VA-kompetanse courses through Norsk Vann", "Apprenticeship with kommunalteknikk department"],
    realityCheck: "You will regularly work in unpleasant conditions with sewage, and emergency callouts for overflows happen at the worst times.",
  },
  "district-heating-technician": {
    typicalDay: {
      morning: ["Monitoring district heating network pressures and temperatures", "Checking heat exchanger performance at substations", "Planning maintenance route for customer installations"],
      midday: ["Servicing heat exchangers and control valves at customer sites", "Diagnosing flow and return temperature imbalances", "Repairing insulation on distribution pipes"],
      afternoon: ["Commissioning new customer connections to the network", "Reading energy meters and verifying billing data", "Updating network drawings and maintenance logs"],
      tools: ["Thermal imaging cameras", "Ultrasonic flow meters", "Pipe welding equipment", "SCADA network monitoring systems"],
      environment: "District heating plants, underground pipe networks, and customer substations, mostly in urban areas across Norway.",
    },
    whatYouActuallyDo: ["You maintain and operate district heating networks that distribute hot water from central plants to buildings.", "Balancing network pressures and temperatures is key to efficient energy delivery."],
    whoThisIsGoodFor: ["Interested in energy systems and sustainability", "Good at hydraulic and thermal troubleshooting", "Enjoys a mix of customer contact and technical work", "Systematic and organised"],
    topSkills: ["Heating system hydraulics", "Heat exchanger maintenance", "SCADA operation", "Pipe welding and joining", "Energy metering and regulation"],
    entryPaths: ["Fagbrev as rørlegger or energimontør", "VVS-tekniker training with district heating focus", "Trainee programme with Hafslund, Statkraft Varme, or local energy companies"],
    realityCheck: "Winter is the busiest and most stressful season since failures directly leave homes without heating in freezing conditions.",
  },
  "utility-network-commissioning-technician": {
    typicalDay: {
      morning: ["Reviewing commissioning procedures and test plans", "Verifying instrument calibration certificates", "Preparing test equipment for pipeline or cable commissioning"],
      midday: ["Performing pressure tests on new pipe installations", "Testing protection relays and switchgear settings", "Documenting test results against design specifications"],
      afternoon: ["Conducting functional tests of SCADA integration points", "Punch-listing deficiencies for contractor correction", "Handing over completed systems with signed protocols"],
      tools: ["Pressure test pumps and recorders", "Relay test sets", "Megger insulation testers", "Commissioning management software"],
      environment: "New utility infrastructure projects including water, gas, power, and heating networks during the construction-to-operation handover phase.",
    },
    whatYouActuallyDo: ["You verify that newly built utility networks work correctly before they go live, running systematic tests on every component.", "Your sign-off confirms the system is safe and ready for operation."],
    whoThisIsGoodFor: ["Systematic and thorough", "Enjoys checking and verifying things", "Good at reading technical drawings", "Comfortable working across multiple engineering disciplines"],
    topSkills: ["Commissioning procedures and protocols", "Pressure and leak testing", "Electrical testing and verification", "Documentation and punch-listing", "Multi-discipline technical knowledge"],
    entryPaths: ["Fagbrev in electrical, mechanical, or piping trade plus commissioning experience", "Engineering technician diploma with field training", "Trainee roles with commissioning contractors like IKM or Aibel"],
    realityCheck: "Commissioning happens at project deadlines, so you will face intense time pressure and long hours at the end of every project.",
  },
  "critical-infrastructure-maintenance-technician": {
    typicalDay: {
      morning: ["Reviewing maintenance management system work orders", "Inspecting backup power generators and UPS systems", "Testing fire suppression and alarm systems"],
      midday: ["Performing preventive maintenance on HVAC in data centres", "Checking security systems and access controls", "Monitoring building management system parameters"],
      afternoon: ["Responding to equipment failure alarms", "Updating maintenance records and asset condition data", "Coordinating with security team on planned outages"],
      tools: ["CMMS (maintenance management software)", "Thermal imaging cameras", "Vibration analysers", "Building management systems (BMS)"],
      environment: "Data centres, hospitals, government buildings, and other critical facilities requiring 24/7 operational uptime.",
    },
    whatYouActuallyDo: ["You keep essential facilities like data centres, hospitals, and government buildings operational through systematic preventive maintenance.", "Any downtime in these facilities has serious societal consequences."],
    whoThisIsGoodFor: ["Highly dependable and responsible", "Multi-skilled across electrical and mechanical disciplines", "Thrives on routine and systematic work", "Stays calm during equipment failures"],
    topSkills: ["Multi-trade maintenance (electrical, mechanical, HVAC)", "Building management systems", "Emergency power systems", "Preventive maintenance planning", "Security clearance eligibility"],
    entryPaths: ["Fagbrev in electrical or mechanical trade", "Experience in building drift (facilities management)", "Trainee programme with Forsvarsbygg, Sykehusbygg, or data centre operators"],
    realityCheck: "You carry the weight of knowing that your mistakes could take hospitals offline or shut down national IT systems.",
  },
  "electrical-contractor": {
    typicalDay: {
      morning: ["Reviewing project drawings and material lists", "Coordinating subcontractors and crew assignments", "Ordering materials from electrical wholesalers"],
      midday: ["Installing distribution boards and cable trays on site", "Supervising apprentices and checking workmanship", "Meeting with general contractor on progress and coordination"],
      afternoon: ["Testing completed installations with megger and multifunction tester", "Preparing as-built documentation", "Invoicing completed milestones and tracking project costs"],
      tools: ["Multifunction installation testers", "Cable pulling equipment", "Project management software", "AutoCAD Electrical or EPLAN"],
      environment: "Construction sites, industrial facilities, and commercial buildings, running projects from tender to handover.",
    },
    whatYouActuallyDo: ["You run your own electrical contracting business or lead projects, combining hands-on installation with project management and client relations.", "Winning tenders and managing costs is as important as technical skill."],
    whoThisIsGoodFor: ["Entrepreneurial and business-minded", "Strong technical electrician background", "Good at managing people and timelines", "Comfortable with financial risk"],
    topSkills: ["Elektro fagbrev plus installatør authorisation", "Project management and estimation", "NEK 400 standards compliance", "Business administration", "Client relationship management"],
    entryPaths: ["Fagbrev as elektriker plus installatørprøven", "Years of experience as electrician then starting own firma", "Mesterbrev in electrical trade"],
    realityCheck: "Running a contracting business means chasing payments, managing employees, and carrying financial risk that employed electricians never face.",
  },
  "instrumentation-contractor": {
    typicalDay: {
      morning: ["Reviewing P&IDs and instrument loop diagrams", "Planning installation sequence for transmitters and valves", "Coordinating with piping and electrical contractors"],
      midday: ["Installing and calibrating pressure, temperature, and flow instruments", "Wiring instruments to marshalling cabinets", "Performing loop checks from field to control room"],
      afternoon: ["Commissioning control valves and verifying stroke times", "Documenting calibration certificates", "Reviewing project scope changes with client"],
      tools: ["HART communicators", "Calibration equipment (Fluke, Beamex)", "Loop test equipment", "Control valve positioners"],
      environment: "Oil and gas facilities, chemical plants, and process industry sites, often in hazardous classified areas.",
    },
    whatYouActuallyDo: ["You install, calibrate, and commission industrial measurement and control instruments as an independent contractor.", "Accuracy is critical since process safety depends on reliable instrument readings."],
    whoThisIsGoodFor: ["Precise and methodical worker", "Strong understanding of process control", "Comfortable in oil and gas environments", "Good at reading complex technical drawings"],
    topSkills: ["Instrument calibration and loop testing", "P&ID and loop diagram interpretation", "HART/Fieldbus communication protocols", "Ex-area installation standards", "Control valve commissioning"],
    entryPaths: ["Fagbrev as automatiker or instrument technician", "Experience with process industry then starting own contracting firm", "Subcontracting through companies like Apply or Beerenberg"],
    realityCheck: "Work is project-based with periods of intense overtime followed by gaps, making income unpredictable.",
  },
  "mechanical-maintenance-contractor": {
    typicalDay: {
      morning: ["Reviewing maintenance work packages and permits", "Preparing tools and lifting equipment for the day", "Attending safety meeting and isolation verification"],
      midday: ["Overhauling pumps, compressors, or turbines", "Aligning rotating equipment with laser alignment tools", "Torquing flanges to specification"],
      afternoon: ["Performing vibration analysis on repaired machinery", "Completing maintenance reports with measurements", "Returning permits and confirming system reinstatement"],
      tools: ["Laser alignment systems", "Hydraulic torque wrenches", "Vibration analysers", "Crane and rigging equipment"],
      environment: "Refineries, offshore platforms, pulp and paper mills, and heavy industrial plants during operations or shutdowns.",
    },
    whatYouActuallyDo: ["You maintain and repair heavy rotating and static equipment as an independent mechanical contractor.", "Shutdown periods are the busiest with back-to-back 12-hour shifts."],
    whoThisIsGoodFor: ["Mechanically talented with strong hands-on skills", "Enjoys working with heavy machinery", "Willing to travel for shutdown work", "Physically strong and resilient"],
    topSkills: ["Rotating equipment overhaul", "Laser alignment and balancing", "Hydraulic and pneumatic systems", "Rigging and lifting", "Bolted joint integrity"],
    entryPaths: ["Fagbrev as industrimekaniker", "Experience in process industry maintenance then contracting independently", "Working through agencies like Aibel, IKM, or Bilfinger"],
    realityCheck: "Shutdown work means intense 12-hour shifts for weeks, often away from home, followed by quiet periods with no income.",
  },
  "offshore-service-contractor": {
    typicalDay: {
      morning: ["Helicopter or vessel transport to offshore installation", "Safety induction and muster drill orientation", "Reviewing work scope with platform maintenance team"],
      midday: ["Performing specialist maintenance tasks on deck equipment", "Working on wellhead systems or process modules", "Coordinating with control room on isolations and permits"],
      afternoon: ["Completing permit-to-work documentation", "Reporting progress to onshore project coordinator", "Maintaining personal survival and safety equipment"],
      tools: ["Platform-specific maintenance tools", "Permit-to-work systems", "Offshore crane and lifting equipment", "Satellite communication systems"],
      environment: "Offshore oil and gas platforms in the North Sea, working 2-week rotations with helicopter transport.",
    },
    whatYouActuallyDo: ["You travel offshore to perform specialist maintenance, inspection, or modification work on oil and gas platforms.", "The rotation schedule means two weeks on the platform followed by time off onshore."],
    whoThisIsGoodFor: ["Comfortable in isolated offshore environments", "Self-sufficient and adaptable", "Willing to spend extended periods away from home", "Handles helicopter travel without anxiety"],
    topSkills: ["BOSIET/HUET offshore safety certification", "Trade-specific technical skills", "Permit-to-work systems", "Offshore crane and lifting awareness", "NORSOK standards knowledge"],
    entryPaths: ["Fagbrev in relevant trade plus BOSIET certification", "Experience onshore then transitioning offshore through contractor companies", "Employment with Aker Solutions, Aibel, or similar offshore contractors"],
    realityCheck: "The pay is excellent but being away from family for two weeks at a time takes a real toll on relationships and social life.",
  },
  "specialist-inspection-contractor": {
    typicalDay: {
      morning: ["Reviewing inspection scope and relevant codes", "Calibrating specialist inspection equipment", "Attending pre-job safety meeting and reviewing risk assessment"],
      midday: ["Performing advanced ultrasonic or eddy current inspections", "Inspecting pressure vessels, pipelines, or structural steelwork", "Documenting defect locations and severity on inspection drawings"],
      afternoon: ["Analysing inspection data and comparing to previous surveys", "Writing fitness-for-service assessment reports", "Discussing findings and recommendations with asset owner"],
      tools: ["Phased array ultrasonic (PAUT) equipment", "Eddy current testing arrays", "3D laser scanning equipment", "Fitness-for-service software (API 579)"],
      environment: "Operating plants, refineries, offshore installations, and infrastructure assets requiring integrity verification.",
    },
    whatYouActuallyDo: ["You perform advanced inspections on critical equipment to determine whether it is safe to continue operating.", "Your assessments directly influence whether assets run, get repaired, or get replaced."],
    whoThisIsGoodFor: ["Strong analytical and diagnostic skills", "Expert-level NDT knowledge", "Comfortable making high-consequence technical judgements", "Enjoys working independently"],
    topSkills: ["Advanced NDT methods (PAUT, TOFD, ECT)", "Fitness-for-service assessment", "Pressure equipment directive knowledge", "Report writing and client communication", "Risk-based inspection planning"],
    entryPaths: ["NDT Level II/III certification with years of field experience", "Engineering background with inspection specialisation", "Career progression within DNV, Force Technology, or Applus+"],
    realityCheck: "Your name goes on reports that determine if billion-kroner assets keep running, and errors can lead to catastrophic failures.",
  },
  "commissioning-contractor": {
    typicalDay: {
      morning: ["Reviewing system completion status and punch lists", "Preparing commissioning test procedures", "Verifying instrument calibration and valve line-up"],
      midday: ["Performing pre-commissioning checks on process systems", "Running functional tests on safety instrumented systems", "Coordinating with construction and operations teams"],
      afternoon: ["Witnessing performance tests and recording results", "Updating commissioning database with test outcomes", "Preparing systems for handover to operations team"],
      tools: ["Commissioning management software (ICMS, CMS)", "Test equipment for electrical, instrument, and mechanical systems", "Punch-list tracking systems", "P&IDs and cause-and-effect diagrams"],
      environment: "New-build industrial plants, offshore platforms, and energy facilities during the critical construction-to-operations transition.",
    },
    whatYouActuallyDo: ["You systematically test and verify entire industrial systems to confirm they work as designed before handover to operations.", "The role bridges construction and operations, requiring broad technical knowledge."],
    whoThisIsGoodFor: ["Broad multi-discipline technical knowledge", "Extremely organised and systematic", "Thrives under deadline pressure", "Strong communicator across teams"],
    topSkills: ["Systematic completion and commissioning methodology", "Multi-discipline technical knowledge", "Test procedure writing", "Punch-list management", "NORSOK Z-007 and completion standards"],
    entryPaths: ["Fagbrev plus years of maintenance or operations experience", "Engineering technician diploma with commissioning focus", "Working with commissioning contractors like IKM, Wood, or Worley"],
    realityCheck: "Every project ends with a frantic push to meet the start-up deadline, meaning extreme hours and pressure are guaranteed.",
  },
  "maintenance-shutdown-contractor": {
    typicalDay: {
      morning: ["Attending mass toolbox talk with hundreds of shutdown workers", "Collecting permits and work packages from planning team", "Confirming equipment isolations before starting work"],
      midday: ["Executing maintenance tasks on process equipment during plant outage", "Replacing heat exchanger tube bundles or valve internals", "Working alongside scaffolders, insulators, and NDT technicians"],
      afternoon: ["Completing work packages and signing off quality checks", "Returning permits and confirming mechanical completion", "Preparing for next day's scope in planning meeting"],
      tools: ["Hydraulic torque and tensioning equipment", "Portable machining tools", "Flange management systems", "Shutdown planning software (Primavera, SAP PM)"],
      environment: "Refineries, chemical plants, and offshore platforms during planned turnarounds, working 12-hour shifts for 2-6 weeks.",
    },
    whatYouActuallyDo: ["You perform intensive maintenance work during planned plant shutdowns when equipment is taken offline for overhaul.", "Shutdowns run on tight schedules where every hour of delay costs the plant enormous money."],
    whoThisIsGoodFor: ["Thrives in high-intensity work periods", "Experienced mechanical or multi-trade technician", "Willing to travel and work long shifts", "Handles pressure and fatigue well"],
    topSkills: ["Turnaround planning and execution", "Heat exchanger and pressure vessel maintenance", "Bolted joint integrity (ASME PCC-1)", "Multi-trade coordination", "Permit-to-work compliance"],
    entryPaths: ["Fagbrev as industrimekaniker or prosessoperatør", "Shutdown experience through contractor agencies", "Employment with Bilfinger, Beerenberg, or Kaefer for turnaround seasons"],
    realityCheck: "Shutdown seasons mean brutal 12-hour shifts, seven days a week for weeks, then long stretches with no work at all.",
  },

};

/**
 * Get detailed career information including typical day
 */
export function getCareerDetails(careerId: string): CareerDetails {
  // Try exact match first
  if (careerDetailsMap[careerId]) {
    return careerDetailsMap[careerId];
  }

  // Try normalized ID (lowercase, hyphenated)
  const normalizedId = careerId.toLowerCase().replace(/\s+/g, "-");
  if (careerDetailsMap[normalizedId]) {
    return careerDetailsMap[normalizedId];
  }

  // Return default template
  return defaultDetails;
}

/**
 * Check if a career has specific detailed content
 */
export function hasDetailedContent(careerId: string): boolean {
  const normalizedId = careerId.toLowerCase().replace(/\s+/g, "-");
  return careerId in careerDetailsMap || normalizedId in careerDetailsMap;
}
