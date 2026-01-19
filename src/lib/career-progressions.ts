export interface CareerLevel {
  level: "entry" | "mid" | "senior" | "lead";
  title: string;
  yearsExperience: string;
  salaryRange: string;
}

export interface CareerProgression {
  careerId: string;
  levels: CareerLevel[];
}

export const careerProgressions: CareerProgression[] = [
  {
    careerId: "software-developer",
    levels: [
      {
        level: "entry",
        title: "Junior Developer",
        yearsExperience: "0-2 years",
        salaryRange: "450-550k kr",
      },
      {
        level: "mid",
        title: "Developer",
        yearsExperience: "2-5 years",
        salaryRange: "550-700k kr",
      },
      {
        level: "senior",
        title: "Senior Developer",
        yearsExperience: "5-8 years",
        salaryRange: "700-900k kr",
      },
      {
        level: "lead",
        title: "Tech Lead",
        yearsExperience: "8+ years",
        salaryRange: "900k-1.2M kr",
      },
    ],
  },
  {
    careerId: "data-analyst",
    levels: [
      {
        level: "entry",
        title: "Junior Analyst",
        yearsExperience: "0-2 years",
        salaryRange: "420-520k kr",
      },
      {
        level: "mid",
        title: "Data Analyst",
        yearsExperience: "2-4 years",
        salaryRange: "520-650k kr",
      },
      {
        level: "senior",
        title: "Senior Analyst",
        yearsExperience: "4-7 years",
        salaryRange: "650-800k kr",
      },
      {
        level: "lead",
        title: "Analytics Lead",
        yearsExperience: "7+ years",
        salaryRange: "800k-1M kr",
      },
    ],
  },
  {
    careerId: "nurse",
    levels: [
      {
        level: "entry",
        title: "Graduate Nurse",
        yearsExperience: "0-1 years",
        salaryRange: "400-450k kr",
      },
      {
        level: "mid",
        title: "Registered Nurse",
        yearsExperience: "1-5 years",
        salaryRange: "450-550k kr",
      },
      {
        level: "senior",
        title: "Specialist Nurse",
        yearsExperience: "5-10 years",
        salaryRange: "550-700k kr",
      },
      {
        level: "lead",
        title: "Nurse Manager",
        yearsExperience: "10+ years",
        salaryRange: "700-850k kr",
      },
    ],
  },
  {
    careerId: "project-manager",
    levels: [
      {
        level: "entry",
        title: "Project Coordinator",
        yearsExperience: "0-2 years",
        salaryRange: "420-500k kr",
      },
      {
        level: "mid",
        title: "Project Manager",
        yearsExperience: "2-5 years",
        salaryRange: "500-650k kr",
      },
      {
        level: "senior",
        title: "Senior PM",
        yearsExperience: "5-8 years",
        salaryRange: "650-850k kr",
      },
      {
        level: "lead",
        title: "Program Director",
        yearsExperience: "8+ years",
        salaryRange: "850k-1.1M kr",
      },
    ],
  },
  {
    careerId: "graphic-designer",
    levels: [
      {
        level: "entry",
        title: "Junior Designer",
        yearsExperience: "0-2 years",
        salaryRange: "380-480k kr",
      },
      {
        level: "mid",
        title: "Graphic Designer",
        yearsExperience: "2-5 years",
        salaryRange: "480-600k kr",
      },
      {
        level: "senior",
        title: "Senior Designer",
        yearsExperience: "5-8 years",
        salaryRange: "600-750k kr",
      },
      {
        level: "lead",
        title: "Creative Director",
        yearsExperience: "8+ years",
        salaryRange: "750k-1M kr",
      },
    ],
  },
  {
    careerId: "electrician",
    levels: [
      {
        level: "entry",
        title: "Apprentice",
        yearsExperience: "0-3 years",
        salaryRange: "350-450k kr",
      },
      {
        level: "mid",
        title: "Electrician",
        yearsExperience: "3-7 years",
        salaryRange: "450-550k kr",
      },
      {
        level: "senior",
        title: "Master Electrician",
        yearsExperience: "7-12 years",
        salaryRange: "550-700k kr",
      },
      {
        level: "lead",
        title: "Electrical Contractor",
        yearsExperience: "12+ years",
        salaryRange: "700k-1M kr",
      },
    ],
  },
];

export function getCareerProgression(careerId: string): CareerProgression | undefined {
  return careerProgressions.find((p) => p.careerId === careerId);
}

// ========================================
// SIMPLIFIED ENTRY POINT & PROGRESSION
// Shows typical career paths: entry -> core -> next roles
// ========================================

export interface CareerPathProgression {
  entry: string[];   // Beginner roles that lead to this career
  core: string[];    // The main role(s) at this level
  next: string[];    // Advanced roles you can grow into
}

const careerPathProgressionMap: Record<string, CareerPathProgression> = {
  // Technology & IT
  "cloud-engineer": {
    entry: ["IT Support", "Junior SysAdmin", "DevOps Intern"],
    core: ["Cloud Engineer", "DevOps Engineer"],
    next: ["Senior Cloud Engineer", "Platform Engineer", "Cloud Architect", "SRE"],
  },
  "software-developer": {
    entry: ["Coding Bootcamp Grad", "Junior Developer", "Intern"],
    core: ["Software Developer", "Full-Stack Developer"],
    next: ["Senior Developer", "Tech Lead", "Staff Engineer", "Architect"],
  },
  "data-analyst": {
    entry: ["Data Entry", "Junior Analyst", "Business Intern"],
    core: ["Data Analyst", "BI Analyst"],
    next: ["Senior Analyst", "Analytics Manager", "Data Scientist"],
  },
  "data-scientist": {
    entry: ["Data Analyst", "ML Intern", "Research Assistant"],
    core: ["Data Scientist", "ML Engineer"],
    next: ["Senior Data Scientist", "ML Lead", "Principal Scientist"],
  },
  "cybersecurity-analyst": {
    entry: ["IT Support", "SOC Analyst Tier 1", "Security Intern"],
    core: ["Cybersecurity Analyst", "Security Engineer"],
    next: ["Senior Security Engineer", "Security Architect", "CISO"],
  },
  "ux-designer": {
    entry: ["UI Designer", "Design Intern", "Visual Designer"],
    core: ["UX Designer", "Product Designer"],
    next: ["Senior UX Designer", "Design Lead", "Head of Design"],
  },
  "devops-engineer": {
    entry: ["Junior SysAdmin", "Build Engineer", "IT Support"],
    core: ["DevOps Engineer", "Platform Engineer"],
    next: ["Senior DevOps", "SRE", "Infrastructure Lead"],
  },
  "it-support": {
    entry: ["Helpdesk Intern", "Tech Support Trainee"],
    core: ["IT Support Specialist", "Desktop Support"],
    next: ["IT Admin", "Systems Admin", "IT Manager"],
  },
  "ai-engineer": {
    entry: ["ML Intern", "Data Scientist", "Software Developer"],
    core: ["AI Engineer", "ML Engineer"],
    next: ["Senior AI Engineer", "AI Architect", "Head of AI"],
  },
  "qa-engineer": {
    entry: ["Manual Tester", "QA Intern", "Test Analyst"],
    core: ["QA Engineer", "SDET"],
    next: ["Senior QA", "QA Lead", "Test Architect"],
  },
  "product-manager-tech": {
    entry: ["Product Analyst", "Associate PM", "Business Analyst"],
    core: ["Product Manager"],
    next: ["Senior PM", "Group PM", "VP Product"],
  },

  // Healthcare
  "doctor": {
    entry: ["Medical Student", "Intern (Turnus)"],
    core: ["Junior Doctor", "Resident"],
    next: ["Specialist", "Senior Consultant", "Department Head"],
  },
  "nurse": {
    entry: ["Nursing Student", "Healthcare Assistant"],
    core: ["Registered Nurse"],
    next: ["Specialist Nurse", "Nurse Manager", "Nurse Practitioner"],
  },
  "physiotherapist": {
    entry: ["Physio Student", "Rehab Assistant"],
    core: ["Physiotherapist"],
    next: ["Senior Physio", "Specialist", "Clinic Manager"],
  },
  "psychologist": {
    entry: ["Psychology Student", "Research Assistant"],
    core: ["Psychologist"],
    next: ["Specialist Psychologist", "Clinical Lead", "Private Practice"],
  },

  // Business & Finance
  "accountant": {
    entry: ["Accounting Intern", "Bookkeeper", "Junior Accountant"],
    core: ["Accountant", "Financial Accountant"],
    next: ["Senior Accountant", "Finance Manager", "CFO"],
  },
  "project-manager": {
    entry: ["Project Coordinator", "Team Assistant", "Junior PM"],
    core: ["Project Manager"],
    next: ["Senior PM", "Program Manager", "Portfolio Director"],
  },
  "management-consultant": {
    entry: ["Analyst", "Associate Consultant"],
    core: ["Consultant", "Senior Consultant"],
    next: ["Manager", "Principal", "Partner"],
  },
  "hr-specialist": {
    entry: ["HR Assistant", "Recruiter Trainee"],
    core: ["HR Specialist", "HR Generalist"],
    next: ["HR Manager", "HR Business Partner", "HR Director"],
  },
  "business-analyst": {
    entry: ["Junior Analyst", "Data Analyst", "Intern"],
    core: ["Business Analyst"],
    next: ["Senior BA", "Lead BA", "Product Owner"],
  },

  // Marketing & Sales
  "marketing-manager": {
    entry: ["Marketing Assistant", "Content Creator"],
    core: ["Marketing Coordinator", "Marketing Manager"],
    next: ["Senior Marketing Manager", "CMO"],
  },
  "digital-marketer": {
    entry: ["Social Media Intern", "Content Assistant"],
    core: ["Digital Marketer", "Performance Marketer"],
    next: ["Senior Digital Marketer", "Digital Marketing Manager"],
  },
  "sales-representative": {
    entry: ["Sales Trainee", "Retail Associate"],
    core: ["Sales Representative", "Account Executive"],
    next: ["Senior Sales", "Sales Manager", "Sales Director"],
  },

  // Trades
  "electrician": {
    entry: ["Apprentice", "Helper"],
    core: ["Electrician", "Journeyman"],
    next: ["Master Electrician", "Foreman", "Contractor"],
  },
  "plumber": {
    entry: ["Apprentice", "Helper"],
    core: ["Plumber"],
    next: ["Master Plumber", "Foreman", "Contractor"],
  },
  "carpenter": {
    entry: ["Apprentice", "Helper"],
    core: ["Carpenter", "Tømrer"],
    next: ["Master Carpenter", "Foreman", "Contractor"],
  },

  // Education
  "primary-teacher": {
    entry: ["Teaching Assistant", "Substitute Teacher"],
    core: ["Primary Teacher"],
    next: ["Senior Teacher", "Team Leader", "Principal"],
  },
  "secondary-teacher": {
    entry: ["Teaching Assistant", "Trainee Teacher"],
    core: ["Secondary Teacher", "Lektor"],
    next: ["Senior Teacher", "Department Head", "Principal"],
  },

  // Hospitality
  "chef": {
    entry: ["Kitchen Helper", "Commis Chef"],
    core: ["Chef de Partie", "Sous Chef"],
    next: ["Head Chef", "Executive Chef", "Restaurant Owner"],
  },
  "hotel-manager": {
    entry: ["Front Desk Agent", "Concierge"],
    core: ["Duty Manager", "Department Manager"],
    next: ["Hotel Manager", "General Manager", "Regional Director"],
  },

  // New Tech Careers
  "rte": {
    entry: ["Scrum Master", "Agile Coach", "Project Manager"],
    core: ["Release Train Engineer"],
    next: ["Senior RTE", "Enterprise Agile Coach", "Transformation Lead"],
  },
  "product-owner": {
    entry: ["Business Analyst", "Product Analyst", "Associate PM"],
    core: ["Product Owner"],
    next: ["Senior PO", "Lead PO", "Product Manager"],
  },
  "technical-writer": {
    entry: ["Junior Tech Writer", "Content Writer", "Doc Assistant"],
    core: ["Technical Writer"],
    next: ["Senior Tech Writer", "Documentation Manager", "Content Strategist"],
  },
  "frontend-developer": {
    entry: ["Bootcamp Grad", "Junior Frontend Dev", "Intern"],
    core: ["Frontend Developer"],
    next: ["Senior Frontend Dev", "Frontend Architect", "Tech Lead"],
  },
  "backend-developer": {
    entry: ["Junior Backend Dev", "Intern", "Graduate"],
    core: ["Backend Developer"],
    next: ["Senior Backend Dev", "Backend Architect", "Tech Lead"],
  },
  "mobile-developer": {
    entry: ["Junior Mobile Dev", "Intern", "App Developer"],
    core: ["Mobile Developer", "iOS/Android Developer"],
    next: ["Senior Mobile Dev", "Mobile Lead", "Mobile Architect"],
  },
  "game-developer": {
    entry: ["QA Tester", "Junior Game Dev", "Intern"],
    core: ["Game Developer", "Game Programmer"],
    next: ["Senior Game Dev", "Lead Programmer", "Technical Director"],
  },
  "sre": {
    entry: ["Junior SysAdmin", "DevOps Engineer", "IT Support"],
    core: ["Site Reliability Engineer"],
    next: ["Senior SRE", "SRE Lead", "Platform Architect"],
  },
  "data-engineer": {
    entry: ["Data Analyst", "Junior Data Engineer", "BI Developer"],
    core: ["Data Engineer"],
    next: ["Senior Data Engineer", "Data Architect", "Data Platform Lead"],
  },
  "security-engineer": {
    entry: ["Security Analyst", "SOC Analyst", "IT Support"],
    core: ["Security Engineer"],
    next: ["Senior Security Engineer", "Security Architect", "CISO"],
  },
  "embedded-developer": {
    entry: ["Junior Embedded Dev", "Firmware Intern", "EE Graduate"],
    core: ["Embedded Developer", "Firmware Engineer"],
    next: ["Senior Embedded Dev", "Embedded Architect", "Hardware Lead"],
  },
  "enterprise-architect": {
    entry: ["Solutions Architect", "Senior Developer", "Technical Lead"],
    core: ["Enterprise Architect"],
    next: ["Chief Architect", "CTO", "VP Engineering"],
  },
  "data-architect": {
    entry: ["Senior Data Engineer", "DBA", "Lead Analyst"],
    core: ["Data Architect"],
    next: ["Chief Data Architect", "Head of Data", "CDO"],
  },

  // New Healthcare Careers
  "veterinarian": {
    entry: ["Vet Student", "Vet Assistant"],
    core: ["Veterinarian"],
    next: ["Specialist Vet", "Clinic Owner", "Chief Veterinarian"],
  },
  "veterinary-assistant": {
    entry: ["Animal Care Worker", "Kennel Assistant"],
    core: ["Veterinary Assistant", "Vet Tech"],
    next: ["Head Vet Tech", "Clinic Supervisor", "Practice Manager"],
  },
  "dental-hygienist": {
    entry: ["Dental Assistant", "Hygiene Student"],
    core: ["Dental Hygienist"],
    next: ["Senior Hygienist", "Hygiene Coordinator", "Practice Manager"],
  },
  "optician": {
    entry: ["Optical Assistant", "Sales Associate"],
    core: ["Optician"],
    next: ["Senior Optician", "Store Manager", "Regional Manager"],
  },
  "lab-technician": {
    entry: ["Lab Assistant", "Student Trainee"],
    core: ["Lab Technician", "Biomedical Scientist"],
    next: ["Senior Scientist", "Lab Manager", "Department Head"],
  },

  // New Trade Careers
  "hvac-technician": {
    entry: ["Apprentice", "Helper"],
    core: ["HVAC Technician"],
    next: ["Senior Tech", "Supervisor", "Contractor"],
  },
  "painter": {
    entry: ["Apprentice", "Helper"],
    core: ["Painter"],
    next: ["Master Painter", "Foreman", "Contractor"],
  },
  "welder": {
    entry: ["Apprentice", "Helper"],
    core: ["Welder", "Certified Welder"],
    next: ["Master Welder", "Welding Inspector", "Supervisor"],
  },
  "auto-mechanic": {
    entry: ["Apprentice", "Service Trainee"],
    core: ["Auto Mechanic", "Technician"],
    next: ["Master Mechanic", "Service Manager", "Shop Owner"],
  },

  // New Personal Service Careers
  "massage-therapist": {
    entry: ["Student Therapist", "Spa Assistant"],
    core: ["Massage Therapist"],
    next: ["Senior Therapist", "Spa Manager", "Private Practice Owner"],
  },
  "beautician": {
    entry: ["Assistant", "Beauty Student"],
    core: ["Beautician", "Makeup Artist"],
    next: ["Senior Artist", "Salon Manager", "Brand Ambassador"],
  },
  "nail-technician": {
    entry: ["Assistant", "Trainee"],
    core: ["Nail Technician"],
    next: ["Senior Tech", "Salon Manager", "Studio Owner"],
  },

  // New Creative Careers
  "photographer": {
    entry: ["Assistant Photographer", "Photo Intern"],
    core: ["Photographer"],
    next: ["Senior Photographer", "Studio Owner", "Creative Director"],
  },
  "video-editor": {
    entry: ["Assistant Editor", "Production Assistant"],
    core: ["Video Editor", "Editor"],
    next: ["Senior Editor", "Lead Editor", "Post-Production Supervisor"],
  },
  "interior-designer": {
    entry: ["Design Assistant", "Junior Designer"],
    core: ["Interior Designer"],
    next: ["Senior Designer", "Design Director", "Principal"],
  },
  "architect": {
    entry: ["Architectural Intern", "Graduate Architect"],
    core: ["Architect"],
    next: ["Senior Architect", "Project Architect", "Principal"],
  },
  "graphic-designer": {
    entry: ["Junior Designer", "Design Intern"],
    core: ["Graphic Designer"],
    next: ["Senior Designer", "Art Director", "Creative Director"],
  },

  // New Public Service Careers
  "lawyer": {
    entry: ["Law Graduate", "Fullmektig"],
    core: ["Lawyer", "Associate"],
    next: ["Senior Associate", "Partner", "Senior Partner"],
  },
  "police-officer": {
    entry: ["Police Trainee", "Probationary Officer"],
    core: ["Police Officer"],
    next: ["Sergeant", "Inspector", "Chief Inspector"],
  },
  "firefighter": {
    entry: ["Volunteer", "Trainee"],
    core: ["Firefighter"],
    next: ["Senior Firefighter", "Station Officer", "Fire Chief"],
  },
  "social-worker": {
    entry: ["Social Work Trainee", "Assistant"],
    core: ["Social Worker"],
    next: ["Senior Social Worker", "Team Leader", "Service Manager"],
  },
  "environmental-scientist": {
    entry: ["Research Assistant", "Junior Scientist"],
    core: ["Environmental Scientist", "Consultant"],
    next: ["Senior Scientist", "Project Manager", "Director"],
  },
};

/**
 * Get simplified career path progression (entry -> core -> next roles)
 */
export function getCareerPathProgression(careerId: string): CareerPathProgression | undefined {
  // Try exact match first
  if (careerPathProgressionMap[careerId]) {
    return careerPathProgressionMap[careerId];
  }

  // Try normalized ID (lowercase, hyphenated)
  const normalizedId = careerId.toLowerCase().replace(/\s+/g, "-");
  if (careerPathProgressionMap[normalizedId]) {
    return careerPathProgressionMap[normalizedId];
  }

  return undefined;
}
