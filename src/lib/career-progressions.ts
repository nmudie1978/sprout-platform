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
