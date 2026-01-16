import { JobCategory } from "@prisma/client";

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
}

export const CAREER_PATHWAYS: Record<JobCategory, Career[]> = {
  BABYSITTING: [
    {
      id: "childcare-worker",
      title: "Childcare Worker",
      emoji: "👶",
      description: "Care for children in daycare centers, preschools, or private homes, ensuring their safety and development.",
      avgSalary: "280,000 - 380,000 kr/year",
      educationPath: "Certificate in Childcare or Early Childhood Education",
      keySkills: ["patience", "communication", "responsibility", "first-aid", "creativity"],
      dailyTasks: ["Supervise play activities", "Prepare meals and snacks", "Help with early learning", "Ensure child safety"],
      growthOutlook: "high",
    },
    {
      id: "primary-teacher",
      title: "Primary School Teacher",
      emoji: "📚",
      description: "Educate and inspire young students in elementary school, shaping their foundational learning years.",
      avgSalary: "420,000 - 580,000 kr/year",
      educationPath: "Bachelor's Degree in Education",
      keySkills: ["communication", "patience", "organization", "creativity", "leadership"],
      dailyTasks: ["Plan and deliver lessons", "Assess student progress", "Create engaging activities", "Communicate with parents"],
      growthOutlook: "stable",
    },
    {
      id: "pediatric-nurse",
      title: "Pediatric Nurse",
      emoji: "🏥",
      description: "Provide medical care and support to children and their families in hospitals or clinics.",
      avgSalary: "450,000 - 600,000 kr/year",
      educationPath: "Nursing Degree with Pediatric Specialization",
      keySkills: ["empathy", "medical knowledge", "communication", "calm under pressure", "attention-to-detail"],
      dailyTasks: ["Administer medications", "Monitor patient health", "Support families", "Coordinate with doctors"],
      growthOutlook: "high",
    },
    {
      id: "child-psychologist",
      title: "Child Psychologist",
      emoji: "🧠",
      description: "Help children and adolescents overcome emotional, behavioral, and developmental challenges.",
      avgSalary: "550,000 - 750,000 kr/year",
      educationPath: "Master's or Doctorate in Psychology",
      keySkills: ["empathy", "analytical thinking", "communication", "patience", "problem-solving"],
      dailyTasks: ["Conduct assessments", "Provide therapy sessions", "Develop treatment plans", "Consult with families"],
      growthOutlook: "high",
    },
  ],

  DOG_WALKING: [
    {
      id: "veterinarian",
      title: "Veterinarian",
      emoji: "🩺",
      description: "Diagnose and treat animals, perform surgeries, and provide preventive care for pets and wildlife.",
      avgSalary: "550,000 - 800,000 kr/year",
      educationPath: "Veterinary Medicine Degree (5-6 years)",
      keySkills: ["animal care", "medical knowledge", "problem-solving", "communication", "empathy"],
      dailyTasks: ["Examine animals", "Diagnose illnesses", "Perform surgeries", "Advise pet owners"],
      growthOutlook: "high",
    },
    {
      id: "veterinary-nurse",
      title: "Veterinary Nurse",
      emoji: "💉",
      description: "Assist veterinarians with animal care, surgeries, and client communication in clinics.",
      avgSalary: "320,000 - 420,000 kr/year",
      educationPath: "Veterinary Nursing Diploma or Degree",
      keySkills: ["animal handling", "medical assistance", "organization", "empathy", "attention-to-detail"],
      dailyTasks: ["Prepare animals for procedures", "Assist in surgeries", "Administer medications", "Educate pet owners"],
      growthOutlook: "high",
    },
    {
      id: "pet-groomer",
      title: "Pet Groomer",
      emoji: "✂️",
      description: "Bathe, trim, and style pets while ensuring their comfort and wellbeing.",
      avgSalary: "280,000 - 380,000 kr/year",
      educationPath: "Grooming Certificate or Apprenticeship",
      keySkills: ["animal handling", "attention-to-detail", "creativity", "patience", "customer-service"],
      dailyTasks: ["Bathe and dry animals", "Trim fur and nails", "Check for health issues", "Style according to breed"],
      growthOutlook: "medium",
    },
    {
      id: "animal-trainer",
      title: "Animal Trainer",
      emoji: "🦮",
      description: "Train animals for obedience, assistance work, or entertainment purposes.",
      avgSalary: "300,000 - 450,000 kr/year",
      educationPath: "Animal Behavior Certificate or Degree",
      keySkills: ["patience", "animal behavior knowledge", "communication", "consistency", "creativity"],
      dailyTasks: ["Design training programs", "Conduct training sessions", "Assess animal progress", "Work with owners"],
      growthOutlook: "medium",
    },
    {
      id: "pet-store-manager",
      title: "Pet Store Manager",
      emoji: "🏪",
      description: "Oversee pet store operations, manage staff, and ensure animal welfare standards.",
      avgSalary: "350,000 - 480,000 kr/year",
      educationPath: "Business Management + Animal Care Knowledge",
      keySkills: ["business management", "animal knowledge", "customer-service", "leadership", "organization"],
      dailyTasks: ["Manage inventory", "Train staff", "Ensure animal welfare", "Handle customer inquiries"],
      growthOutlook: "stable",
    },
  ],

  SNOW_CLEARING: [
    {
      id: "landscaper",
      title: "Landscaper",
      emoji: "🌳",
      description: "Design, create, and maintain outdoor spaces including gardens, parks, and commercial properties.",
      avgSalary: "300,000 - 420,000 kr/year",
      educationPath: "Horticulture Certificate or Apprenticeship",
      keySkills: ["physical fitness", "plant knowledge", "creativity", "attention-to-detail", "equipment operation"],
      dailyTasks: ["Plant and maintain gardens", "Operate landscaping equipment", "Design outdoor spaces", "Seasonal maintenance"],
      growthOutlook: "stable",
    },
    {
      id: "property-manager",
      title: "Property Manager",
      emoji: "🏢",
      description: "Oversee residential or commercial properties, handling maintenance, tenants, and operations.",
      avgSalary: "400,000 - 550,000 kr/year",
      educationPath: "Business or Real Estate Degree/Certificate",
      keySkills: ["organization", "communication", "problem-solving", "negotiation", "financial management"],
      dailyTasks: ["Coordinate maintenance", "Manage tenant relations", "Handle finances", "Ensure compliance"],
      growthOutlook: "stable",
    },
    {
      id: "facilities-manager",
      title: "Facilities Manager",
      emoji: "🔧",
      description: "Manage building operations, maintenance systems, and ensure safe, efficient facilities.",
      avgSalary: "450,000 - 600,000 kr/year",
      educationPath: "Facilities Management Degree or Certificate",
      keySkills: ["technical knowledge", "leadership", "budgeting", "problem-solving", "communication"],
      dailyTasks: ["Oversee maintenance teams", "Manage budgets", "Ensure safety compliance", "Plan improvements"],
      growthOutlook: "medium",
    },
    {
      id: "construction-worker",
      title: "Construction Worker",
      emoji: "👷",
      description: "Build and renovate structures, working with various materials and construction techniques.",
      avgSalary: "320,000 - 480,000 kr/year",
      educationPath: "Trade Certificate or Apprenticeship",
      keySkills: ["physical fitness", "technical skills", "teamwork", "safety awareness", "problem-solving"],
      dailyTasks: ["Operate equipment", "Follow blueprints", "Build structures", "Ensure safety protocols"],
      growthOutlook: "stable",
    },
  ],

  CLEANING: [
    {
      id: "professional-cleaner",
      title: "Professional Cleaner",
      emoji: "🧹",
      description: "Provide specialized cleaning services for homes, offices, or industrial facilities.",
      avgSalary: "260,000 - 340,000 kr/year",
      educationPath: "On-the-job training, Cleaning Certificates available",
      keySkills: ["attention-to-detail", "time-management", "physical stamina", "reliability", "product knowledge"],
      dailyTasks: ["Deep clean spaces", "Use specialized equipment", "Manage supplies", "Meet client standards"],
      growthOutlook: "stable",
    },
    {
      id: "hotel-housekeeper",
      title: "Hotel Housekeeper",
      emoji: "🏨",
      description: "Maintain cleanliness and comfort in hotel rooms and common areas for guests.",
      avgSalary: "280,000 - 360,000 kr/year",
      educationPath: "Hospitality Training or On-the-job",
      keySkills: ["attention-to-detail", "time-management", "discretion", "physical stamina", "customer-service"],
      dailyTasks: ["Clean and prepare rooms", "Restock amenities", "Report maintenance issues", "Ensure guest satisfaction"],
      growthOutlook: "stable",
    },
    {
      id: "cleaning-business-owner",
      title: "Cleaning Business Owner",
      emoji: "💼",
      description: "Run your own cleaning company, managing staff, clients, and business operations.",
      avgSalary: "400,000 - 700,000+ kr/year",
      educationPath: "Business Management + Industry Experience",
      keySkills: ["entrepreneurship", "leadership", "customer-service", "financial management", "marketing"],
      dailyTasks: ["Manage teams", "Acquire clients", "Handle finances", "Ensure quality control"],
      growthOutlook: "medium",
    },
    {
      id: "environmental-hygienist",
      title: "Environmental Hygienist",
      emoji: "🔬",
      description: "Assess and control environmental factors that affect health, including sanitation and safety.",
      avgSalary: "450,000 - 600,000 kr/year",
      educationPath: "Environmental Health Degree",
      keySkills: ["analytical thinking", "attention-to-detail", "communication", "regulatory knowledge", "problem-solving"],
      dailyTasks: ["Conduct inspections", "Analyze samples", "Ensure compliance", "Write reports"],
      growthOutlook: "high",
    },
  ],

  DIY_HELP: [
    {
      id: "carpenter",
      title: "Carpenter",
      emoji: "🪚",
      description: "Build, install, and repair wooden structures and fixtures in buildings and homes.",
      avgSalary: "350,000 - 500,000 kr/year",
      educationPath: "Carpentry Apprenticeship (3-4 years)",
      keySkills: ["precision", "mathematics", "physical fitness", "problem-solving", "blueprint reading"],
      dailyTasks: ["Measure and cut materials", "Build structures", "Install fixtures", "Repair woodwork"],
      growthOutlook: "stable",
    },
    {
      id: "electrician",
      title: "Electrician",
      emoji: "⚡",
      description: "Install, maintain, and repair electrical systems in homes, businesses, and industrial settings.",
      avgSalary: "380,000 - 550,000 kr/year",
      educationPath: "Electrical Apprenticeship + Certification",
      keySkills: ["technical knowledge", "problem-solving", "safety awareness", "mathematics", "attention-to-detail"],
      dailyTasks: ["Install wiring", "Troubleshoot issues", "Read blueprints", "Ensure code compliance"],
      growthOutlook: "high",
    },
    {
      id: "plumber",
      title: "Plumber",
      emoji: "🔧",
      description: "Install and repair pipes, fixtures, and water systems in residential and commercial buildings.",
      avgSalary: "360,000 - 520,000 kr/year",
      educationPath: "Plumbing Apprenticeship + Certification",
      keySkills: ["problem-solving", "physical fitness", "technical knowledge", "customer-service", "attention-to-detail"],
      dailyTasks: ["Install pipes and fixtures", "Diagnose problems", "Repair leaks", "Maintain systems"],
      growthOutlook: "high",
    },
    {
      id: "general-contractor",
      title: "General Contractor",
      emoji: "🏗️",
      description: "Oversee construction projects, coordinate workers, and ensure projects are completed on time and budget.",
      avgSalary: "500,000 - 800,000+ kr/year",
      educationPath: "Construction Management Degree or Experience + License",
      keySkills: ["project management", "leadership", "budgeting", "communication", "problem-solving"],
      dailyTasks: ["Manage subcontractors", "Schedule work", "Handle permits", "Ensure quality"],
      growthOutlook: "stable",
    },
  ],

  TECH_HELP: [
    {
      id: "it-support",
      title: "IT Support Specialist",
      emoji: "💻",
      description: "Help users resolve technical issues with computers, software, and networks.",
      avgSalary: "350,000 - 480,000 kr/year",
      educationPath: "IT Certificate or Degree, CompTIA A+",
      keySkills: ["technical troubleshooting", "communication", "patience", "problem-solving", "continuous learning"],
      dailyTasks: ["Resolve user issues", "Install software", "Maintain systems", "Document solutions"],
      growthOutlook: "high",
    },
    {
      id: "software-developer",
      title: "Software Developer",
      emoji: "👨‍💻",
      description: "Design, build, and maintain software applications and systems.",
      avgSalary: "500,000 - 800,000+ kr/year",
      educationPath: "Computer Science Degree or Coding Bootcamp",
      keySkills: ["programming", "problem-solving", "logical thinking", "teamwork", "continuous learning"],
      dailyTasks: ["Write code", "Debug applications", "Collaborate with teams", "Review code"],
      growthOutlook: "high",
    },
    {
      id: "cybersecurity-analyst",
      title: "Cybersecurity Analyst",
      emoji: "🔒",
      description: "Protect organizations from cyber threats by monitoring, detecting, and responding to security incidents.",
      avgSalary: "500,000 - 750,000 kr/year",
      educationPath: "Cybersecurity Degree or Certifications (CISSP, CEH)",
      keySkills: ["security knowledge", "analytical thinking", "attention-to-detail", "problem-solving", "continuous learning"],
      dailyTasks: ["Monitor systems", "Analyze threats", "Implement security measures", "Train staff"],
      growthOutlook: "high",
    },
    {
      id: "ux-designer",
      title: "UX Designer",
      emoji: "🎨",
      description: "Create user-friendly digital experiences by researching, designing, and testing interfaces.",
      avgSalary: "450,000 - 650,000 kr/year",
      educationPath: "Design Degree or UX Bootcamp",
      keySkills: ["creativity", "empathy", "research skills", "prototyping", "communication"],
      dailyTasks: ["Conduct user research", "Create wireframes", "Design interfaces", "Test with users"],
      growthOutlook: "high",
    },
  ],

  ERRANDS: [
    {
      id: "personal-assistant",
      title: "Personal Assistant",
      emoji: "📋",
      description: "Support busy professionals by managing schedules, communications, and daily tasks.",
      avgSalary: "350,000 - 500,000 kr/year",
      educationPath: "Administrative Training or Business Degree",
      keySkills: ["organization", "communication", "discretion", "time-management", "multitasking"],
      dailyTasks: ["Manage calendars", "Handle correspondence", "Arrange travel", "Run errands"],
      growthOutlook: "stable",
    },
    {
      id: "logistics-coordinator",
      title: "Logistics Coordinator",
      emoji: "📦",
      description: "Manage the movement of goods and materials, ensuring efficient supply chain operations.",
      avgSalary: "380,000 - 520,000 kr/year",
      educationPath: "Logistics or Supply Chain Degree/Certificate",
      keySkills: ["organization", "problem-solving", "communication", "attention-to-detail", "analytical thinking"],
      dailyTasks: ["Track shipments", "Coordinate deliveries", "Manage inventory", "Solve logistics issues"],
      growthOutlook: "high",
    },
    {
      id: "event-planner",
      title: "Event Planner",
      emoji: "🎉",
      description: "Organize and coordinate events from weddings to corporate conferences.",
      avgSalary: "350,000 - 550,000 kr/year",
      educationPath: "Event Management Degree or Certificate",
      keySkills: ["organization", "creativity", "communication", "negotiation", "problem-solving"],
      dailyTasks: ["Plan event details", "Coordinate vendors", "Manage budgets", "Oversee event execution"],
      growthOutlook: "medium",
    },
    {
      id: "delivery-manager",
      title: "Delivery Operations Manager",
      emoji: "🚚",
      description: "Oversee delivery teams and operations, ensuring efficient and timely service.",
      avgSalary: "420,000 - 580,000 kr/year",
      educationPath: "Business or Logistics Degree + Experience",
      keySkills: ["leadership", "logistics knowledge", "problem-solving", "communication", "data analysis"],
      dailyTasks: ["Manage delivery teams", "Optimize routes", "Handle customer issues", "Analyze performance"],
      growthOutlook: "high",
    },
  ],

  OTHER: [
    {
      id: "entrepreneur",
      title: "Entrepreneur",
      emoji: "🚀",
      description: "Start and run your own business, turning ideas into successful ventures.",
      avgSalary: "Variable - Unlimited potential",
      educationPath: "Business Degree helpful, Experience essential",
      keySkills: ["creativity", "risk-taking", "leadership", "financial management", "resilience"],
      dailyTasks: ["Develop business strategy", "Manage operations", "Build teams", "Seek opportunities"],
      growthOutlook: "high",
    },
    {
      id: "customer-service-rep",
      title: "Customer Service Representative",
      emoji: "📞",
      description: "Help customers with inquiries, complaints, and support across various industries.",
      avgSalary: "280,000 - 380,000 kr/year",
      educationPath: "High school + Training, Communication courses helpful",
      keySkills: ["communication", "patience", "problem-solving", "empathy", "multitasking"],
      dailyTasks: ["Answer customer inquiries", "Resolve complaints", "Process orders", "Document interactions"],
      growthOutlook: "stable",
    },
    {
      id: "project-manager",
      title: "Project Manager",
      emoji: "📊",
      description: "Lead teams to complete projects on time and within budget across various industries.",
      avgSalary: "480,000 - 700,000 kr/year",
      educationPath: "Business Degree + PMP Certification",
      keySkills: ["leadership", "organization", "communication", "problem-solving", "budgeting"],
      dailyTasks: ["Plan projects", "Coordinate teams", "Track progress", "Manage stakeholders"],
      growthOutlook: "high",
    },
    {
      id: "social-media-manager",
      title: "Social Media Manager",
      emoji: "📱",
      description: "Create and manage social media content and strategies for brands and organizations.",
      avgSalary: "350,000 - 500,000 kr/year",
      educationPath: "Marketing/Communications Degree or Portfolio",
      keySkills: ["creativity", "communication", "analytics", "trend awareness", "content creation"],
      dailyTasks: ["Create content", "Engage with followers", "Analyze metrics", "Plan campaigns"],
      growthOutlook: "high",
    },
  ],
};

// Helper functions

/**
 * Get all careers for a specific job category
 */
export function getCareersForCategory(category: JobCategory): Career[] {
  return CAREER_PATHWAYS[category] || [];
}

/**
 * Get a single career by its ID
 */
export function getCareerById(id: string): Career | undefined {
  for (const careers of Object.values(CAREER_PATHWAYS)) {
    const career = careers.find((c) => c.id === id);
    if (career) return career;
  }
  return undefined;
}

/**
 * Get all careers across all categories
 */
export function getAllCareers(): Career[] {
  return Object.values(CAREER_PATHWAYS).flat();
}

/**
 * Get recommended careers based on user's completed jobs by category
 */
export function getRecommendedCareers(
  completedJobsByCategory: Record<string, number>
): { career: Career; matchScore: number; fromCategory: JobCategory }[] {
  const recommendations: { career: Career; matchScore: number; fromCategory: JobCategory }[] = [];

  // Sort categories by job count (most experience first)
  const sortedCategories = Object.entries(completedJobsByCategory)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  // Get careers from top categories
  for (const [category, count] of sortedCategories) {
    const careers = CAREER_PATHWAYS[category as JobCategory];
    if (!careers) continue;

    for (const career of careers) {
      // Calculate match score based on experience level
      const baseScore = Math.min(count * 15, 60); // Up to 60 points from job count
      const varietyBonus = sortedCategories.length > 1 ? 10 : 0; // Bonus for diverse experience
      const matchScore = Math.min(baseScore + varietyBonus + 20, 100); // Base 20 + bonuses

      recommendations.push({
        career,
        matchScore,
        fromCategory: category as JobCategory,
      });
    }
  }

  // Sort by match score and remove duplicates
  return recommendations
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 8); // Return top 8 recommendations
}

/**
 * Calculate how well a user's skills match a career
 */
export function calculateCareerMatch(
  userSkills: string[],
  career: Career
): number {
  if (!userSkills.length || !career.keySkills.length) return 0;

  const matchingSkills = career.keySkills.filter((skill) =>
    userSkills.some(
      (userSkill) =>
        userSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(userSkill.toLowerCase())
    )
  );

  return Math.round((matchingSkills.length / career.keySkills.length) * 100);
}

/**
 * Get the category that a career belongs to
 */
export function getCategoryForCareer(careerId: string): JobCategory | undefined {
  for (const [category, careers] of Object.entries(CAREER_PATHWAYS)) {
    if (careers.some((c) => c.id === careerId)) {
      return category as JobCategory;
    }
  }
  return undefined;
}

/**
 * Search careers by keyword
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
