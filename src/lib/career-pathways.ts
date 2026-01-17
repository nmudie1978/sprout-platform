/**
 * Career Pathways - Professional Career Categories and Jobs
 * Comprehensive career data for the Explore Careers section
 */

// Career categories for career exploration (separate from JobCategory for micro-jobs)
export type CareerCategory =
  | "HEALTHCARE_LIFE_SCIENCES"
  | "EDUCATION_TRAINING"
  | "TECHNOLOGY_IT"
  | "BUSINESS_MANAGEMENT"
  | "FINANCE_BANKING"
  | "SALES_MARKETING"
  | "MANUFACTURING_ENGINEERING"
  | "LOGISTICS_TRANSPORT"
  | "HOSPITALITY_TOURISM";

export interface Career {
  id: string;
  title: string;
  emoji: string;
  description: string;
  avgSalary: string;
  educationPath: string;
  keySkills: string[];
  dailyTasks: string[];
  growthOutlook: "high" | "medium" | "stable";
  entryLevel?: boolean; // True if accessible without higher education
}

export const CAREER_PATHWAYS: Record<CareerCategory, Career[]> = {
  // ========================================
  // HEALTHCARE & LIFE SCIENCES
  // ========================================
  HEALTHCARE_LIFE_SCIENCES: [
    {
      id: "doctor",
      title: "Doctor / Physician",
      emoji: "👨‍⚕️",
      description: "Diagnose and treat illnesses, prescribe medications, and provide preventive care to patients.",
      avgSalary: "700,000 - 1,400,000 kr/year",
      educationPath: "Medical Degree (6 years) + Specialization (3-6 years)",
      keySkills: ["medical knowledge", "communication", "empathy", "decision-making", "stress management"],
      dailyTasks: ["Examine patients", "Diagnose conditions", "Prescribe treatments", "Perform procedures", "Document care"],
      growthOutlook: "high",
    },
    {
      id: "nurse",
      title: "Nurse (Sykepleier)",
      emoji: "👩‍⚕️",
      description: "Provide patient care, administer medications, and support doctors in hospitals and clinics.",
      avgSalary: "450,000 - 650,000 kr/year",
      educationPath: "Bachelor's in Nursing (3 years)",
      keySkills: ["patient care", "medical knowledge", "communication", "empathy", "attention to detail"],
      dailyTasks: ["Monitor patients", "Administer medications", "Assist with procedures", "Document care", "Support families"],
      growthOutlook: "high",
    },
    {
      id: "healthcare-worker",
      title: "Healthcare Worker (Helsefagarbeider)",
      emoji: "🏥",
      description: "Assist patients with daily activities and basic medical care in nursing homes and hospitals.",
      avgSalary: "350,000 - 450,000 kr/year",
      educationPath: "Vocational training (2 years) + Apprenticeship (2 years) = Fagbrev",
      keySkills: ["patient care", "empathy", "physical stamina", "communication", "reliability"],
      dailyTasks: ["Help patients with hygiene", "Assist with meals", "Monitor wellbeing", "Support daily activities"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "dentist",
      title: "Dentist (Tannlege)",
      emoji: "🦷",
      description: "Diagnose and treat dental issues, perform procedures, and promote oral health.",
      avgSalary: "650,000 - 1,200,000 kr/year",
      educationPath: "Dental Degree (5 years)",
      keySkills: ["precision", "medical knowledge", "patient communication", "manual dexterity", "attention to detail"],
      dailyTasks: ["Examine teeth", "Perform fillings and extractions", "Take X-rays", "Advise on dental hygiene"],
      growthOutlook: "stable",
    },
    {
      id: "pharmacist",
      title: "Pharmacist (Farmasøyt)",
      emoji: "💊",
      description: "Dispense medications, advise patients on drug use, and ensure medication safety.",
      avgSalary: "550,000 - 750,000 kr/year",
      educationPath: "Master's in Pharmacy (5 years)",
      keySkills: ["pharmaceutical knowledge", "attention to detail", "communication", "problem-solving", "ethics"],
      dailyTasks: ["Dispense prescriptions", "Advise patients", "Check drug interactions", "Manage inventory"],
      growthOutlook: "stable",
    },
    {
      id: "physiotherapist",
      title: "Physiotherapist (Fysioterapeut)",
      emoji: "🏃",
      description: "Help patients recover from injuries and improve physical function through exercise and therapy.",
      avgSalary: "480,000 - 650,000 kr/year",
      educationPath: "Bachelor's in Physiotherapy (3 years)",
      keySkills: ["anatomy knowledge", "manual therapy", "communication", "patience", "physical fitness"],
      dailyTasks: ["Assess patients", "Create treatment plans", "Guide exercises", "Track progress", "Provide manual therapy"],
      growthOutlook: "high",
    },
    {
      id: "psychologist",
      title: "Psychologist",
      emoji: "🧠",
      description: "Help people manage mental health challenges through therapy and counseling.",
      avgSalary: "550,000 - 800,000 kr/year",
      educationPath: "Master's/Doctorate in Psychology (6+ years)",
      keySkills: ["empathy", "active listening", "analytical thinking", "communication", "ethics"],
      dailyTasks: ["Conduct therapy sessions", "Assess patients", "Develop treatment plans", "Document progress"],
      growthOutlook: "high",
    },
    {
      id: "biomedical-scientist",
      title: "Biomedical Scientist",
      emoji: "🔬",
      description: "Research diseases and develop new treatments, working in labs and research institutions.",
      avgSalary: "500,000 - 750,000 kr/year",
      educationPath: "Master's/PhD in Biomedical Sciences",
      keySkills: ["research skills", "analytical thinking", "lab techniques", "attention to detail", "scientific writing"],
      dailyTasks: ["Conduct experiments", "Analyze data", "Write research papers", "Present findings"],
      growthOutlook: "high",
    },
    {
      id: "paramedic",
      title: "Paramedic (Ambulansearbeider)",
      emoji: "🚑",
      description: "Provide emergency medical care and transport patients in ambulances.",
      avgSalary: "400,000 - 550,000 kr/year",
      educationPath: "Vocational training + Paramedic certification",
      keySkills: ["emergency medicine", "calm under pressure", "physical fitness", "decision-making", "teamwork"],
      dailyTasks: ["Respond to emergencies", "Provide first aid", "Transport patients", "Document incidents"],
      growthOutlook: "stable",
      entryLevel: true,
    },
  ],

  // ========================================
  // EDUCATION & TRAINING
  // ========================================
  EDUCATION_TRAINING: [
    {
      id: "primary-teacher",
      title: "Primary School Teacher (Grunnskolelærer)",
      emoji: "📚",
      description: "Educate children in elementary school, teaching foundational subjects and life skills.",
      avgSalary: "450,000 - 600,000 kr/year",
      educationPath: "Bachelor's/Master's in Education (4-5 years)",
      keySkills: ["communication", "patience", "creativity", "organization", "classroom management"],
      dailyTasks: ["Plan lessons", "Teach classes", "Grade assignments", "Meet with parents", "Support student development"],
      growthOutlook: "stable",
    },
    {
      id: "secondary-teacher",
      title: "Secondary School Teacher (Videregående lærer)",
      emoji: "🎓",
      description: "Teach specialized subjects to teenagers in upper secondary school.",
      avgSalary: "480,000 - 650,000 kr/year",
      educationPath: "Bachelor's/Master's in Subject + Teaching Qualification",
      keySkills: ["subject expertise", "communication", "mentoring", "assessment", "technology use"],
      dailyTasks: ["Teach specialized subjects", "Prepare students for exams", "Advise on career paths", "Grade work"],
      growthOutlook: "stable",
    },
    {
      id: "kindergarten-teacher",
      title: "Kindergarten Teacher (Barnehagelærer)",
      emoji: "🧒",
      description: "Nurture young children's development through play-based learning in kindergartens.",
      avgSalary: "420,000 - 550,000 kr/year",
      educationPath: "Bachelor's in Early Childhood Education (3 years)",
      keySkills: ["creativity", "patience", "communication", "play-based learning", "child development"],
      dailyTasks: ["Plan activities", "Supervise children", "Support social development", "Communicate with parents"],
      growthOutlook: "high",
    },
    {
      id: "special-needs-educator",
      title: "Special Needs Educator (Spesialpedagog)",
      emoji: "💙",
      description: "Support students with learning disabilities and special needs in educational settings.",
      avgSalary: "480,000 - 620,000 kr/year",
      educationPath: "Master's in Special Education",
      keySkills: ["patience", "adaptability", "communication", "individualized teaching", "empathy"],
      dailyTasks: ["Develop individual plans", "Adapt teaching methods", "Support students", "Collaborate with teams"],
      growthOutlook: "high",
    },
    {
      id: "university-lecturer",
      title: "University Lecturer",
      emoji: "🏛️",
      description: "Teach university courses, conduct research, and supervise student projects.",
      avgSalary: "550,000 - 850,000 kr/year",
      educationPath: "PhD in relevant field",
      keySkills: ["research", "teaching", "public speaking", "academic writing", "mentoring"],
      dailyTasks: ["Lecture students", "Conduct research", "Write papers", "Supervise theses", "Attend conferences"],
      growthOutlook: "medium",
    },
    {
      id: "corporate-trainer",
      title: "Corporate Trainer",
      emoji: "👔",
      description: "Design and deliver training programs for employees in organizations.",
      avgSalary: "500,000 - 700,000 kr/year",
      educationPath: "Bachelor's + Training certifications",
      keySkills: ["presentation", "curriculum design", "communication", "adaptability", "technology"],
      dailyTasks: ["Develop training materials", "Deliver workshops", "Assess learning outcomes", "Update content"],
      growthOutlook: "high",
    },
    {
      id: "childcare-assistant",
      title: "Childcare Assistant (Barne- og ungdomsarbeider)",
      emoji: "👶",
      description: "Support children's care and development in kindergartens and after-school programs.",
      avgSalary: "320,000 - 420,000 kr/year",
      educationPath: "Vocational training (2 years) + Apprenticeship = Fagbrev",
      keySkills: ["patience", "creativity", "communication", "responsibility", "playfulness"],
      dailyTasks: ["Supervise activities", "Assist with meals", "Support learning through play", "Ensure safety"],
      growthOutlook: "high",
      entryLevel: true,
    },
  ],

  // ========================================
  // TECHNOLOGY & IT
  // ========================================
  TECHNOLOGY_IT: [
    {
      id: "software-developer",
      title: "Software Developer",
      emoji: "💻",
      description: "Design, build, and maintain software applications for web, mobile, or desktop.",
      avgSalary: "550,000 - 900,000 kr/year",
      educationPath: "Bachelor's in Computer Science or self-taught with portfolio",
      keySkills: ["programming", "problem-solving", "logical thinking", "teamwork", "continuous learning"],
      dailyTasks: ["Write code", "Debug issues", "Review code", "Plan features", "Collaborate with team"],
      growthOutlook: "high",
    },
    {
      id: "data-scientist",
      title: "Data Scientist",
      emoji: "📊",
      description: "Analyze large datasets to find insights and build predictive models for businesses.",
      avgSalary: "600,000 - 950,000 kr/year",
      educationPath: "Master's in Data Science, Statistics, or Computer Science",
      keySkills: ["statistics", "machine learning", "programming", "data visualization", "communication"],
      dailyTasks: ["Analyze data", "Build models", "Create visualizations", "Present findings", "Clean datasets"],
      growthOutlook: "high",
    },
    {
      id: "cybersecurity-analyst",
      title: "Cybersecurity Analyst",
      emoji: "🔐",
      description: "Protect organizations from cyber threats by monitoring systems and responding to incidents.",
      avgSalary: "550,000 - 850,000 kr/year",
      educationPath: "Bachelor's in IT Security + Certifications (CISSP, CEH)",
      keySkills: ["security knowledge", "analytical thinking", "attention to detail", "problem-solving", "ethics"],
      dailyTasks: ["Monitor systems", "Investigate threats", "Implement security measures", "Train staff"],
      growthOutlook: "high",
    },
    {
      id: "ux-designer",
      title: "UX/UI Designer",
      emoji: "🎨",
      description: "Design user interfaces and experiences for websites and apps that are intuitive and beautiful.",
      avgSalary: "500,000 - 750,000 kr/year",
      educationPath: "Bachelor's in Design or self-taught with strong portfolio",
      keySkills: ["design thinking", "user research", "prototyping", "visual design", "communication"],
      dailyTasks: ["Research users", "Create wireframes", "Design interfaces", "Test with users", "Collaborate with developers"],
      growthOutlook: "high",
    },
    {
      id: "cloud-engineer",
      title: "Cloud Engineer",
      emoji: "☁️",
      description: "Design and manage cloud infrastructure on platforms like AWS, Azure, or Google Cloud.",
      avgSalary: "600,000 - 950,000 kr/year",
      educationPath: "Bachelor's in IT + Cloud certifications (AWS, Azure)",
      keySkills: ["cloud platforms", "networking", "automation", "security", "problem-solving"],
      dailyTasks: ["Manage cloud infrastructure", "Optimize costs", "Ensure security", "Automate deployments"],
      growthOutlook: "high",
    },
    {
      id: "it-support",
      title: "IT Support Specialist",
      emoji: "🖥️",
      description: "Help users solve technical problems and maintain computer systems in organizations.",
      avgSalary: "400,000 - 550,000 kr/year",
      educationPath: "Vocational IT training or Bachelor's in IT",
      keySkills: ["technical knowledge", "communication", "patience", "problem-solving", "customer service"],
      dailyTasks: ["Resolve user issues", "Set up equipment", "Maintain systems", "Document solutions"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "devops-engineer",
      title: "DevOps Engineer",
      emoji: "⚙️",
      description: "Bridge development and operations by automating deployments and managing infrastructure.",
      avgSalary: "600,000 - 900,000 kr/year",
      educationPath: "Bachelor's in IT + DevOps experience",
      keySkills: ["automation", "scripting", "CI/CD", "cloud platforms", "monitoring"],
      dailyTasks: ["Automate deployments", "Monitor systems", "Optimize performance", "Collaborate with developers"],
      growthOutlook: "high",
    },
    {
      id: "ai-engineer",
      title: "AI/ML Engineer",
      emoji: "🤖",
      description: "Build and deploy artificial intelligence and machine learning systems.",
      avgSalary: "650,000 - 1,100,000 kr/year",
      educationPath: "Master's in AI, Machine Learning, or Computer Science",
      keySkills: ["machine learning", "programming", "mathematics", "problem-solving", "research"],
      dailyTasks: ["Train models", "Process data", "Optimize algorithms", "Deploy AI systems"],
      growthOutlook: "high",
    },
    {
      id: "it-project-manager",
      title: "IT Project Manager",
      emoji: "📋",
      description: "Lead technology projects from planning to delivery, coordinating teams, budgets, and timelines.",
      avgSalary: "600,000 - 950,000 kr/year",
      educationPath: "Bachelor's in IT or Business + PMP/PRINCE2 certification",
      keySkills: ["project planning", "stakeholder management", "risk management", "communication", "agile methodologies"],
      dailyTasks: ["Plan project milestones", "Coordinate dev teams", "Manage budgets", "Report to stakeholders", "Mitigate risks"],
      growthOutlook: "high",
    },
    {
      id: "cio",
      title: "Chief Information Officer (CIO)",
      emoji: "👔",
      description: "Executive responsible for IT strategy, infrastructure, and aligning technology with business goals.",
      avgSalary: "1,200,000 - 2,500,000 kr/year",
      educationPath: "Master's in IT/Business + 15+ years experience",
      keySkills: ["strategic thinking", "leadership", "business acumen", "technology vision", "stakeholder management"],
      dailyTasks: ["Set IT strategy", "Manage IT budget", "Lead digital transformation", "Report to board", "Oversee IT teams"],
      growthOutlook: "stable",
    },
    {
      id: "agile-coach",
      title: "SAFe Agile Coach",
      emoji: "🎯",
      description: "Guide organizations in adopting agile practices and the Scaled Agile Framework (SAFe) for large teams.",
      avgSalary: "700,000 - 1,100,000 kr/year",
      educationPath: "Bachelor's + SAFe certifications (SA, SPC)",
      keySkills: ["agile frameworks", "coaching", "facilitation", "change management", "communication"],
      dailyTasks: ["Facilitate PI planning", "Coach teams on agile", "Remove impediments", "Train scrum masters", "Drive continuous improvement"],
      growthOutlook: "high",
    },
    {
      id: "network-engineer",
      title: "Network Engineer",
      emoji: "🌐",
      description: "Design, implement, and maintain computer networks including LANs, WANs, and cloud connectivity.",
      avgSalary: "550,000 - 850,000 kr/year",
      educationPath: "Bachelor's in IT + Cisco/Juniper certifications (CCNA, CCNP)",
      keySkills: ["networking protocols", "firewall configuration", "troubleshooting", "security", "cloud networking"],
      dailyTasks: ["Configure routers and switches", "Monitor network performance", "Troubleshoot connectivity", "Implement security policies", "Plan capacity"],
      growthOutlook: "stable",
    },
    {
      id: "solutions-architect",
      title: "Solutions Architect",
      emoji: "🏗️",
      description: "Design technical solutions and system architectures that meet business requirements at scale.",
      avgSalary: "750,000 - 1,200,000 kr/year",
      educationPath: "Bachelor's/Master's in CS + AWS/Azure certifications",
      keySkills: ["system design", "cloud architecture", "technical leadership", "communication", "problem-solving"],
      dailyTasks: ["Design system architectures", "Evaluate technologies", "Create technical proposals", "Guide development teams", "Present to clients"],
      growthOutlook: "high",
    },
    {
      id: "database-administrator",
      title: "Database Administrator (DBA)",
      emoji: "🗄️",
      description: "Manage, optimize, and secure databases to ensure data availability and performance.",
      avgSalary: "550,000 - 800,000 kr/year",
      educationPath: "Bachelor's in IT + Database certifications (Oracle, SQL Server)",
      keySkills: ["SQL", "database optimization", "backup/recovery", "security", "performance tuning"],
      dailyTasks: ["Monitor database performance", "Optimize queries", "Manage backups", "Ensure data security", "Plan capacity"],
      growthOutlook: "stable",
    },
    {
      id: "qa-engineer",
      title: "QA Engineer / Test Engineer",
      emoji: "🧪",
      description: "Ensure software quality through testing strategies, test automation, and defect prevention.",
      avgSalary: "500,000 - 750,000 kr/year",
      educationPath: "Bachelor's in CS/IT + ISTQB certification",
      keySkills: ["test automation", "manual testing", "programming", "attention to detail", "analytical thinking"],
      dailyTasks: ["Write test cases", "Automate tests", "Report bugs", "Review requirements", "Validate releases"],
      growthOutlook: "high",
    },
    {
      id: "scrum-master",
      title: "Scrum Master",
      emoji: "🔄",
      description: "Facilitate scrum processes, remove blockers, and help development teams deliver effectively.",
      avgSalary: "550,000 - 800,000 kr/year",
      educationPath: "Bachelor's + Scrum certifications (CSM, PSM)",
      keySkills: ["scrum framework", "facilitation", "coaching", "conflict resolution", "servant leadership"],
      dailyTasks: ["Facilitate daily standups", "Run sprint ceremonies", "Remove impediments", "Coach team members", "Track metrics"],
      growthOutlook: "high",
    },
    {
      id: "systems-administrator",
      title: "Systems Administrator",
      emoji: "🖧",
      description: "Maintain and configure servers, operating systems, and IT infrastructure for organizations.",
      avgSalary: "480,000 - 700,000 kr/year",
      educationPath: "Bachelor's in IT or vocational training + certifications",
      keySkills: ["Linux/Windows administration", "scripting", "troubleshooting", "security", "virtualization"],
      dailyTasks: ["Manage servers", "Install software", "Monitor systems", "Handle user issues", "Maintain security"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "product-manager-tech",
      title: "Technical Product Manager",
      emoji: "📱",
      description: "Define product vision and roadmap for technology products, bridging business and engineering.",
      avgSalary: "650,000 - 1,000,000 kr/year",
      educationPath: "Bachelor's in CS/Business + Product management experience",
      keySkills: ["product strategy", "user research", "data analysis", "communication", "technical knowledge"],
      dailyTasks: ["Define product roadmap", "Prioritize features", "Analyze user data", "Work with engineers", "Present to stakeholders"],
      growthOutlook: "high",
    },
  ],

  // ========================================
  // BUSINESS, MANAGEMENT & ADMINISTRATION
  // ========================================
  BUSINESS_MANAGEMENT: [
    {
      id: "project-manager",
      title: "Project Manager",
      emoji: "📋",
      description: "Plan, execute, and deliver projects on time and within budget across various industries.",
      avgSalary: "550,000 - 850,000 kr/year",
      educationPath: "Bachelor's in Business + PMP or PRINCE2 certification",
      keySkills: ["leadership", "organization", "communication", "risk management", "stakeholder management"],
      dailyTasks: ["Plan projects", "Coordinate teams", "Track progress", "Manage budgets", "Report to stakeholders"],
      growthOutlook: "high",
    },
    {
      id: "hr-specialist",
      title: "HR Specialist",
      emoji: "👥",
      description: "Manage recruitment, employee relations, and organizational development.",
      avgSalary: "480,000 - 680,000 kr/year",
      educationPath: "Bachelor's in HR, Business, or Psychology",
      keySkills: ["communication", "empathy", "organization", "conflict resolution", "legal knowledge"],
      dailyTasks: ["Recruit candidates", "Onboard employees", "Handle HR issues", "Develop policies"],
      growthOutlook: "stable",
    },
    {
      id: "management-consultant",
      title: "Management Consultant",
      emoji: "💼",
      description: "Advise organizations on strategy, operations, and business improvement.",
      avgSalary: "600,000 - 1,200,000 kr/year",
      educationPath: "Master's in Business (MBA) or related field",
      keySkills: ["analytical thinking", "problem-solving", "presentation", "client management", "business acumen"],
      dailyTasks: ["Analyze business problems", "Develop recommendations", "Present to clients", "Implement changes"],
      growthOutlook: "high",
    },
    {
      id: "office-administrator",
      title: "Office Administrator",
      emoji: "🗂️",
      description: "Manage daily office operations, schedules, and administrative tasks.",
      avgSalary: "380,000 - 500,000 kr/year",
      educationPath: "Vocational training or Bachelor's in Administration",
      keySkills: ["organization", "communication", "multitasking", "computer skills", "attention to detail"],
      dailyTasks: ["Manage schedules", "Handle correspondence", "Organize meetings", "Maintain records"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "business-analyst",
      title: "Business Analyst",
      emoji: "📈",
      description: "Analyze business processes and data to improve efficiency and inform decisions.",
      avgSalary: "520,000 - 750,000 kr/year",
      educationPath: "Bachelor's in Business, IT, or Economics",
      keySkills: ["analytical thinking", "data analysis", "communication", "process mapping", "stakeholder management"],
      dailyTasks: ["Gather requirements", "Analyze processes", "Create reports", "Propose improvements"],
      growthOutlook: "high",
    },
    {
      id: "executive-assistant",
      title: "Executive Assistant",
      emoji: "📱",
      description: "Support senior executives with scheduling, communication, and administrative tasks.",
      avgSalary: "450,000 - 600,000 kr/year",
      educationPath: "Bachelor's in Business or extensive experience",
      keySkills: ["organization", "discretion", "communication", "time management", "adaptability"],
      dailyTasks: ["Manage calendars", "Coordinate travel", "Prepare documents", "Handle confidential matters"],
      growthOutlook: "stable",
    },
    {
      id: "entrepreneur",
      title: "Entrepreneur / Startup Founder",
      emoji: "🚀",
      description: "Start and grow your own business, turning ideas into products and services.",
      avgSalary: "Variable - from loss to millions",
      educationPath: "Any background + business knowledge and determination",
      keySkills: ["leadership", "risk-taking", "resilience", "creativity", "sales"],
      dailyTasks: ["Develop products", "Manage team", "Find customers", "Secure funding", "Make decisions"],
      growthOutlook: "high",
    },
  ],

  // ========================================
  // FINANCE, BANKING & INSURANCE
  // ========================================
  FINANCE_BANKING: [
    {
      id: "accountant",
      title: "Accountant (Regnskapsfører)",
      emoji: "🧮",
      description: "Manage financial records, prepare statements, and ensure tax compliance for businesses.",
      avgSalary: "480,000 - 700,000 kr/year",
      educationPath: "Bachelor's in Accounting or Economics + Authorization",
      keySkills: ["attention to detail", "numeracy", "organization", "software skills", "ethics"],
      dailyTasks: ["Record transactions", "Prepare financial statements", "File taxes", "Advise clients"],
      growthOutlook: "stable",
    },
    {
      id: "financial-advisor",
      title: "Financial Advisor",
      emoji: "💰",
      description: "Help individuals and businesses plan their finances, investments, and retirement.",
      avgSalary: "500,000 - 900,000 kr/year",
      educationPath: "Bachelor's in Finance + Certifications",
      keySkills: ["financial knowledge", "communication", "analytical thinking", "sales", "relationship building"],
      dailyTasks: ["Assess client needs", "Recommend investments", "Create financial plans", "Monitor portfolios"],
      growthOutlook: "medium",
    },
    {
      id: "bank-advisor",
      title: "Bank Advisor (Bankrådgiver)",
      emoji: "🏦",
      description: "Help bank customers with accounts, loans, mortgages, and financial products.",
      avgSalary: "450,000 - 650,000 kr/year",
      educationPath: "Bachelor's in Finance, Economics, or Business",
      keySkills: ["customer service", "financial products", "communication", "sales", "problem-solving"],
      dailyTasks: ["Advise customers", "Process applications", "Sell banking products", "Handle inquiries"],
      growthOutlook: "stable",
    },
    {
      id: "insurance-advisor",
      title: "Insurance Advisor",
      emoji: "🛡️",
      description: "Help clients choose insurance products and process claims.",
      avgSalary: "420,000 - 600,000 kr/year",
      educationPath: "Bachelor's in Business/Finance + Insurance certification",
      keySkills: ["product knowledge", "communication", "sales", "empathy", "attention to detail"],
      dailyTasks: ["Assess client needs", "Recommend policies", "Process claims", "Maintain relationships"],
      growthOutlook: "stable",
    },
    {
      id: "auditor",
      title: "Auditor (Revisor)",
      emoji: "🔍",
      description: "Examine financial records to ensure accuracy, compliance, and detect fraud.",
      avgSalary: "550,000 - 900,000 kr/year",
      educationPath: "Master's in Accounting + State authorization",
      keySkills: ["attention to detail", "analytical thinking", "integrity", "communication", "accounting knowledge"],
      dailyTasks: ["Review financial statements", "Test controls", "Write reports", "Meet with clients"],
      growthOutlook: "stable",
    },
    {
      id: "investment-analyst",
      title: "Investment Analyst",
      emoji: "📊",
      description: "Research and analyze investment opportunities for funds and institutions.",
      avgSalary: "600,000 - 1,000,000 kr/year",
      educationPath: "Master's in Finance + CFA certification",
      keySkills: ["financial modeling", "research", "analytical thinking", "communication", "attention to detail"],
      dailyTasks: ["Analyze companies", "Build financial models", "Write reports", "Present recommendations"],
      growthOutlook: "medium",
    },
  ],

  // ========================================
  // SALES, MARKETING & CUSTOMER SERVICE
  // ========================================
  SALES_MARKETING: [
    {
      id: "marketing-manager",
      title: "Marketing Manager",
      emoji: "📣",
      description: "Plan and execute marketing campaigns to promote products and build brand awareness.",
      avgSalary: "550,000 - 850,000 kr/year",
      educationPath: "Bachelor's/Master's in Marketing or Business",
      keySkills: ["creativity", "strategic thinking", "communication", "data analysis", "leadership"],
      dailyTasks: ["Plan campaigns", "Manage budgets", "Analyze results", "Lead team", "Coordinate with agencies"],
      growthOutlook: "high",
    },
    {
      id: "digital-marketer",
      title: "Digital Marketing Specialist",
      emoji: "📱",
      description: "Run online marketing campaigns including social media, SEO, and paid advertising.",
      avgSalary: "450,000 - 700,000 kr/year",
      educationPath: "Bachelor's in Marketing + Digital certifications",
      keySkills: ["social media", "SEO/SEM", "analytics", "content creation", "paid advertising"],
      dailyTasks: ["Manage social media", "Run ad campaigns", "Analyze metrics", "Create content", "Optimize SEO"],
      growthOutlook: "high",
    },
    {
      id: "sales-representative",
      title: "Sales Representative",
      emoji: "🤝",
      description: "Sell products or services to businesses or consumers, building client relationships.",
      avgSalary: "400,000 - 800,000 kr/year (base + commission)",
      educationPath: "Various - sales training and experience valued",
      keySkills: ["communication", "persuasion", "relationship building", "resilience", "product knowledge"],
      dailyTasks: ["Contact prospects", "Present products", "Negotiate deals", "Follow up with clients"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "customer-service-rep",
      title: "Customer Service Representative",
      emoji: "📞",
      description: "Help customers with inquiries, complaints, and support via phone, chat, or email.",
      avgSalary: "350,000 - 480,000 kr/year",
      educationPath: "No formal education required - training provided",
      keySkills: ["communication", "patience", "problem-solving", "empathy", "computer skills"],
      dailyTasks: ["Answer inquiries", "Resolve complaints", "Process orders", "Document interactions"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "content-creator",
      title: "Content Creator / Social Media Manager",
      emoji: "✨",
      description: "Create engaging content for social media, blogs, and digital platforms.",
      avgSalary: "400,000 - 650,000 kr/year",
      educationPath: "Bachelor's in Marketing/Communications or strong portfolio",
      keySkills: ["creativity", "writing", "video editing", "social media", "trend awareness"],
      dailyTasks: ["Create content", "Manage social accounts", "Engage audience", "Track analytics"],
      growthOutlook: "high",
    },
    {
      id: "brand-manager",
      title: "Brand Manager",
      emoji: "🏷️",
      description: "Develop and maintain brand identity, ensuring consistent messaging across channels.",
      avgSalary: "550,000 - 800,000 kr/year",
      educationPath: "Bachelor's/Master's in Marketing",
      keySkills: ["strategic thinking", "creativity", "communication", "market research", "leadership"],
      dailyTasks: ["Develop brand strategy", "Oversee campaigns", "Manage brand guidelines", "Analyze market"],
      growthOutlook: "medium",
    },
    {
      id: "retail-manager",
      title: "Retail Store Manager",
      emoji: "🏪",
      description: "Manage daily store operations, staff, and sales performance in retail.",
      avgSalary: "420,000 - 600,000 kr/year",
      educationPath: "Experience in retail + leadership training",
      keySkills: ["leadership", "customer service", "organization", "sales", "problem-solving"],
      dailyTasks: ["Manage staff", "Ensure sales targets", "Handle inventory", "Resolve issues", "Train employees"],
      growthOutlook: "stable",
    },
  ],

  // ========================================
  // MANUFACTURING, ENGINEERING & ENERGY
  // ========================================
  MANUFACTURING_ENGINEERING: [
    {
      id: "mechanical-engineer",
      title: "Mechanical Engineer",
      emoji: "⚙️",
      description: "Design, develop, and test mechanical systems and machinery.",
      avgSalary: "550,000 - 850,000 kr/year",
      educationPath: "Bachelor's/Master's in Mechanical Engineering",
      keySkills: ["CAD software", "problem-solving", "mathematics", "physics", "project management"],
      dailyTasks: ["Design components", "Run simulations", "Oversee production", "Test prototypes"],
      growthOutlook: "stable",
    },
    {
      id: "electrical-engineer",
      title: "Electrical Engineer",
      emoji: "⚡",
      description: "Design and develop electrical systems, from power grids to electronics.",
      avgSalary: "550,000 - 850,000 kr/year",
      educationPath: "Bachelor's/Master's in Electrical Engineering",
      keySkills: ["circuit design", "problem-solving", "mathematics", "programming", "safety awareness"],
      dailyTasks: ["Design electrical systems", "Test equipment", "Troubleshoot issues", "Write specifications"],
      growthOutlook: "high",
    },
    {
      id: "electrician",
      title: "Electrician (Elektriker)",
      emoji: "🔌",
      description: "Install, maintain, and repair electrical systems in buildings and facilities.",
      avgSalary: "450,000 - 650,000 kr/year",
      educationPath: "Vocational training (2 years) + Apprenticeship (2.5 years) = Fagbrev",
      keySkills: ["technical knowledge", "problem-solving", "safety awareness", "manual dexterity", "reading blueprints"],
      dailyTasks: ["Install wiring", "Repair electrical faults", "Test systems", "Follow safety codes"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "plumber",
      title: "Plumber (Rørlegger)",
      emoji: "🔧",
      description: "Install and repair water, heating, and drainage systems in buildings.",
      avgSalary: "420,000 - 620,000 kr/year",
      educationPath: "Vocational training (2 years) + Apprenticeship (2.5 years) = Fagbrev",
      keySkills: ["technical skills", "problem-solving", "physical fitness", "customer service", "reading blueprints"],
      dailyTasks: ["Install pipes", "Repair leaks", "Maintain heating systems", "Read blueprints"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "petroleum-engineer",
      title: "Petroleum Engineer",
      emoji: "🛢️",
      description: "Design methods for extracting oil and gas from deposits below the Earth's surface.",
      avgSalary: "700,000 - 1,200,000 kr/year",
      educationPath: "Bachelor's/Master's in Petroleum Engineering",
      keySkills: ["geology knowledge", "problem-solving", "data analysis", "project management", "safety"],
      dailyTasks: ["Plan extraction", "Analyze data", "Optimize production", "Ensure safety"],
      growthOutlook: "medium",
    },
    {
      id: "renewable-energy-tech",
      title: "Renewable Energy Technician",
      emoji: "🌱",
      description: "Install and maintain solar panels, wind turbines, and other renewable energy systems.",
      avgSalary: "450,000 - 650,000 kr/year",
      educationPath: "Vocational training + Specialized certifications",
      keySkills: ["technical skills", "safety awareness", "problem-solving", "physical fitness", "electrical knowledge"],
      dailyTasks: ["Install equipment", "Perform maintenance", "Troubleshoot issues", "Monitor performance"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "process-operator",
      title: "Process Operator (Prosessoperatør)",
      emoji: "🏭",
      description: "Monitor and control industrial processes in manufacturing and energy plants.",
      avgSalary: "450,000 - 650,000 kr/year",
      educationPath: "Vocational training + Apprenticeship = Fagbrev",
      keySkills: ["attention to detail", "technical knowledge", "safety awareness", "problem-solving", "teamwork"],
      dailyTasks: ["Monitor equipment", "Adjust processes", "Perform quality checks", "Follow safety procedures"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "carpenter",
      title: "Carpenter (Tømrer)",
      emoji: "🪚",
      description: "Build and repair wooden structures and frameworks for buildings.",
      avgSalary: "420,000 - 600,000 kr/year",
      educationPath: "Vocational training (2 years) + Apprenticeship (2 years) = Fagbrev",
      keySkills: ["woodworking", "blueprint reading", "physical fitness", "precision", "safety"],
      dailyTasks: ["Build structures", "Install frameworks", "Read blueprints", "Use power tools"],
      growthOutlook: "stable",
      entryLevel: true,
    },
  ],

  // ========================================
  // LOGISTICS, TRANSPORT & SUPPLY CHAIN
  // ========================================
  LOGISTICS_TRANSPORT: [
    {
      id: "logistics-coordinator",
      title: "Logistics Coordinator",
      emoji: "📦",
      description: "Coordinate the movement of goods, managing shipments and inventory.",
      avgSalary: "420,000 - 580,000 kr/year",
      educationPath: "Bachelor's in Logistics, Supply Chain, or Business",
      keySkills: ["organization", "communication", "problem-solving", "attention to detail", "software skills"],
      dailyTasks: ["Coordinate shipments", "Track inventory", "Communicate with suppliers", "Solve logistics issues"],
      growthOutlook: "high",
    },
    {
      id: "supply-chain-manager",
      title: "Supply Chain Manager",
      emoji: "🔗",
      description: "Oversee the entire supply chain from procurement to delivery, optimizing efficiency.",
      avgSalary: "600,000 - 900,000 kr/year",
      educationPath: "Bachelor's/Master's in Supply Chain Management",
      keySkills: ["strategic thinking", "leadership", "negotiation", "data analysis", "process improvement"],
      dailyTasks: ["Manage suppliers", "Optimize processes", "Reduce costs", "Lead team", "Report to executives"],
      growthOutlook: "high",
    },
    {
      id: "truck-driver",
      title: "Truck Driver (Lastebilsjåfør)",
      emoji: "🚛",
      description: "Transport goods across the country or internationally in heavy vehicles.",
      avgSalary: "400,000 - 550,000 kr/year",
      educationPath: "Vocational training + Heavy vehicle license (Class C/CE)",
      keySkills: ["driving skills", "route planning", "time management", "safety awareness", "independence"],
      dailyTasks: ["Drive routes", "Load/unload cargo", "Maintain vehicle", "Complete paperwork"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "warehouse-manager",
      title: "Warehouse Manager",
      emoji: "🏢",
      description: "Manage warehouse operations, staff, and inventory management systems.",
      avgSalary: "480,000 - 680,000 kr/year",
      educationPath: "Bachelor's in Logistics or extensive warehouse experience",
      keySkills: ["leadership", "organization", "inventory management", "problem-solving", "safety management"],
      dailyTasks: ["Manage staff", "Oversee inventory", "Optimize space", "Ensure safety", "Report on metrics"],
      growthOutlook: "stable",
    },
    {
      id: "freight-forwarder",
      title: "Freight Forwarder (Speditør)",
      emoji: "🌍",
      description: "Arrange international shipping and handle customs documentation.",
      avgSalary: "450,000 - 650,000 kr/year",
      educationPath: "Bachelor's in Logistics + Customs knowledge",
      keySkills: ["international trade", "documentation", "communication", "problem-solving", "negotiation"],
      dailyTasks: ["Book shipments", "Handle customs", "Negotiate rates", "Track deliveries", "Solve issues"],
      growthOutlook: "stable",
    },
    {
      id: "delivery-driver",
      title: "Delivery Driver",
      emoji: "🚐",
      description: "Deliver packages and goods to customers and businesses locally.",
      avgSalary: "350,000 - 480,000 kr/year",
      educationPath: "Driver's license + On-the-job training",
      keySkills: ["driving skills", "time management", "customer service", "navigation", "physical fitness"],
      dailyTasks: ["Deliver packages", "Plan routes", "Handle customer interactions", "Maintain vehicle"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "warehouse-worker",
      title: "Warehouse Worker (Lagermedarbeider)",
      emoji: "📦",
      description: "Pick, pack, and organize goods in warehouses for shipping and storage.",
      avgSalary: "350,000 - 450,000 kr/year",
      educationPath: "No formal education - on-the-job training",
      keySkills: ["physical fitness", "organization", "attention to detail", "teamwork", "forklift operation"],
      dailyTasks: ["Pick orders", "Pack shipments", "Organize inventory", "Operate equipment"],
      growthOutlook: "stable",
      entryLevel: true,
    },
  ],

  // ========================================
  // HOSPITALITY, TOURISM & PERSONAL SERVICES
  // ========================================
  HOSPITALITY_TOURISM: [
    {
      id: "hotel-manager",
      title: "Hotel Manager",
      emoji: "🏨",
      description: "Manage hotel operations, staff, and guest experience to ensure satisfaction.",
      avgSalary: "500,000 - 800,000 kr/year",
      educationPath: "Bachelor's in Hospitality Management + Experience",
      keySkills: ["leadership", "customer service", "business management", "problem-solving", "communication"],
      dailyTasks: ["Oversee operations", "Manage staff", "Handle guest issues", "Monitor finances", "Ensure quality"],
      growthOutlook: "medium",
    },
    {
      id: "chef",
      title: "Chef (Kokk)",
      emoji: "👨‍🍳",
      description: "Prepare and cook meals in restaurants, hotels, or catering services.",
      avgSalary: "380,000 - 600,000 kr/year",
      educationPath: "Culinary school or Vocational training + Apprenticeship = Fagbrev",
      keySkills: ["cooking skills", "creativity", "time management", "leadership", "food safety"],
      dailyTasks: ["Prepare dishes", "Create menus", "Manage kitchen staff", "Maintain hygiene standards"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "tour-guide",
      title: "Tour Guide",
      emoji: "🗺️",
      description: "Lead tourists on excursions, sharing knowledge about destinations and culture.",
      avgSalary: "350,000 - 500,000 kr/year",
      educationPath: "Tourism education or deep local knowledge + Language skills",
      keySkills: ["communication", "local knowledge", "languages", "storytelling", "customer service"],
      dailyTasks: ["Lead tours", "Share information", "Handle logistics", "Ensure guest safety"],
      growthOutlook: "medium",
      entryLevel: true,
    },
    {
      id: "flight-attendant",
      title: "Flight Attendant (Kabinansatt)",
      emoji: "✈️",
      description: "Ensure passenger safety and comfort on commercial flights.",
      avgSalary: "380,000 - 550,000 kr/year",
      educationPath: "Airline training program + Languages",
      keySkills: ["customer service", "safety procedures", "languages", "calm under pressure", "teamwork"],
      dailyTasks: ["Conduct safety briefings", "Serve passengers", "Handle emergencies", "Ensure comfort"],
      growthOutlook: "stable",
    },
    {
      id: "hairdresser",
      title: "Hairdresser (Frisør)",
      emoji: "💇",
      description: "Cut, style, and color hair, providing beauty services to clients.",
      avgSalary: "320,000 - 480,000 kr/year",
      educationPath: "Vocational training (2 years) + Apprenticeship (2 years) = Fagbrev",
      keySkills: ["creativity", "manual dexterity", "communication", "trend awareness", "customer service"],
      dailyTasks: ["Cut and style hair", "Consult with clients", "Apply treatments", "Stay updated on trends"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "fitness-instructor",
      title: "Fitness Instructor / Personal Trainer",
      emoji: "🏋️",
      description: "Lead fitness classes and provide personal training to help clients reach health goals.",
      avgSalary: "350,000 - 550,000 kr/year",
      educationPath: "Fitness certifications + Sports education",
      keySkills: ["fitness knowledge", "motivation", "communication", "anatomy knowledge", "safety awareness"],
      dailyTasks: ["Lead classes", "Create workout plans", "Motivate clients", "Track progress"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "restaurant-server",
      title: "Restaurant Server (Servitør)",
      emoji: "🍽️",
      description: "Serve food and drinks to guests, ensuring a positive dining experience.",
      avgSalary: "320,000 - 450,000 kr/year",
      educationPath: "No formal education - on-the-job training",
      keySkills: ["customer service", "communication", "multitasking", "product knowledge", "teamwork"],
      dailyTasks: ["Take orders", "Serve food", "Handle payments", "Ensure guest satisfaction"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "event-planner",
      title: "Event Planner",
      emoji: "🎉",
      description: "Plan and coordinate events such as weddings, conferences, and corporate functions.",
      avgSalary: "420,000 - 650,000 kr/year",
      educationPath: "Bachelor's in Event Management or Marketing",
      keySkills: ["organization", "creativity", "communication", "negotiation", "problem-solving"],
      dailyTasks: ["Plan events", "Coordinate vendors", "Manage budgets", "Handle logistics", "Oversee execution"],
      growthOutlook: "medium",
    },
    {
      id: "receptionist",
      title: "Hotel Receptionist",
      emoji: "🛎️",
      description: "Welcome guests, handle check-ins/check-outs, and assist with inquiries at hotels.",
      avgSalary: "340,000 - 450,000 kr/year",
      educationPath: "Hospitality training or on-the-job training",
      keySkills: ["customer service", "communication", "organization", "languages", "computer skills"],
      dailyTasks: ["Check in guests", "Handle reservations", "Answer inquiries", "Process payments"],
      growthOutlook: "stable",
      entryLevel: true,
    },
  ],
};

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get all career categories
 */
export function getAllCategories(): CareerCategory[] {
  return Object.keys(CAREER_PATHWAYS) as CareerCategory[];
}

/**
 * Get careers for a specific category
 */
export function getCareersForCategory(category: CareerCategory): Career[] {
  return CAREER_PATHWAYS[category] || [];
}

/**
 * Get a single career by ID
 */
export function getCareerById(id: string): Career | undefined {
  for (const careers of Object.values(CAREER_PATHWAYS)) {
    const career = careers.find((c) => c.id === id);
    if (career) return career;
  }
  return undefined;
}

/**
 * Get all careers as a flat array
 */
export function getAllCareers(): Career[] {
  return Object.values(CAREER_PATHWAYS).flat();
}

/**
 * Get the category for a given career
 */
export function getCategoryForCareer(careerId: string): CareerCategory | undefined {
  for (const [category, careers] of Object.entries(CAREER_PATHWAYS)) {
    if (careers.some((c) => c.id === careerId)) {
      return category as CareerCategory;
    }
  }
  return undefined;
}

/**
 * Search careers by text query
 */
export function searchCareers(query: string): Career[] {
  const lowerQuery = query.toLowerCase();
  return getAllCareers().filter(
    (career) =>
      career.title.toLowerCase().includes(lowerQuery) ||
      career.description.toLowerCase().includes(lowerQuery) ||
      career.keySkills.some((skill) => skill.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get entry-level careers (accessible without higher education)
 */
export function getEntryLevelCareers(): Career[] {
  return getAllCareers().filter((career) => career.entryLevel);
}

/**
 * Get careers by growth outlook
 */
export function getCareersByGrowth(outlook: "high" | "medium" | "stable"): Career[] {
  return getAllCareers().filter((career) => career.growthOutlook === outlook);
}

/**
 * Get recommended careers based on user's job history categories
 * Maps JobCategory (micro-jobs) to CareerCategory (career pathways)
 */
export function getRecommendedCareers(
  jobCategories: Record<string, number>
): { career: Career; matchScore: number }[] {
  // Map micro-job categories to career categories
  const categoryMapping: Record<string, CareerCategory[]> = {
    BABYSITTING: ["EDUCATION_TRAINING", "HEALTHCARE_LIFE_SCIENCES"],
    DOG_WALKING: ["HEALTHCARE_LIFE_SCIENCES", "HOSPITALITY_TOURISM"],
    SNOW_CLEARING: ["MANUFACTURING_ENGINEERING", "LOGISTICS_TRANSPORT"],
    CLEANING: ["HOSPITALITY_TOURISM", "BUSINESS_MANAGEMENT"],
    DIY_HELP: ["MANUFACTURING_ENGINEERING", "LOGISTICS_TRANSPORT"],
    TECH_HELP: ["TECHNOLOGY_IT", "BUSINESS_MANAGEMENT"],
    ERRANDS: ["LOGISTICS_TRANSPORT", "SALES_MARKETING"],
    OTHER: ["BUSINESS_MANAGEMENT", "HOSPITALITY_TOURISM"],
  };

  const recommendations: { career: Career; matchScore: number }[] = [];

  for (const [jobCategory, count] of Object.entries(jobCategories)) {
    const relevantCareerCategories = categoryMapping[jobCategory] || [];

    for (const careerCategory of relevantCareerCategories) {
      const careers = CAREER_PATHWAYS[careerCategory] || [];
      for (const career of careers) {
        const existingIndex = recommendations.findIndex(
          (r) => r.career.id === career.id
        );
        const score = count * (career.entryLevel ? 1.5 : 1);

        if (existingIndex >= 0) {
          recommendations[existingIndex].matchScore += score;
        } else {
          recommendations.push({ career, matchScore: score });
        }
      }
    }
  }

  return recommendations.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Calculate how well a user's skills match a career
 */
export function calculateCareerMatch(
  userSkills: string[],
  career: Career
): number {
  if (!userSkills.length || !career.keySkills.length) return 0;

  const userSkillsLower = userSkills.map((s) => s.toLowerCase());
  const matchingSkills = career.keySkills.filter((skill) =>
    userSkillsLower.some(
      (userSkill) =>
        userSkill.includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(userSkill)
    )
  );

  return Math.round((matchingSkills.length / career.keySkills.length) * 100);
}
