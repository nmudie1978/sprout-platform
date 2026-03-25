/**
 * Fallback Timeline Generator
 *
 * Produces a template-based Journey when OpenAI is unavailable.
 * Interpolates the career title into generic but useful milestone descriptions.
 * Ages are offset from the user's actual current age.
 */

import type { Journey, JourneyItem, JourneyStage, SchoolTrackItem } from './career-journey-types';

function id(): string {
  return `fb-${Math.random().toString(36).slice(2, 9)}`;
}

export function generateFallbackTimeline(career: string, userAge = 16): Journey {
  const currentYear = new Date().getFullYear();
  const a = userAge; // shorthand for age offset

  const items: JourneyItem[] = [
    // Foundation (2 items)
    {
      id: id(),
      stage: 'foundation' as JourneyStage,
      title: 'Explore your interests',
      subtitle: `Discover what draws you to ${career}`,
      startAge: a,
      isMilestone: false,
      icon: 'Sparkles',
      description: `Start by exploring what interests you about ${career}. Talk to people in the field, read about it, and reflect on what excites you.`,
      microActions: [
        'Research what a typical day looks like',
        'List 3 things that interest you about this path',
        'Talk to someone who works in this area',
      ],
    },
    {
      id: id(),
      stage: 'foundation' as JourneyStage,
      title: 'Build core skills',
      subtitle: 'Develop your foundation',
      startAge: a,
      endAge: a + 1,
      isMilestone: true,
      icon: 'Wrench',
      description: `Focus on building the core skills needed for ${career}. This might include communication, teamwork, and problem-solving.`,
      microActions: [
        'Identify 3 key skills for this career',
        'Find a free online course or resource',
        'Practice one skill this week',
      ],
    },
    // Education (2 items)
    {
      id: id(),
      stage: 'education' as JourneyStage,
      title: 'Research education pathways',
      subtitle: `Understand what qualifications help in ${career}`,
      startAge: a + 1,
      isMilestone: false,
      icon: 'GraduationCap',
      description: `Look into courses, apprenticeships, or certifications that could help you enter ${career}. Not every path requires a degree.`,
      microActions: [
        'Research 2-3 education pathways',
        'Compare apprenticeships vs university',
        'Talk to a career advisor',
      ],
    },
    {
      id: id(),
      stage: 'education' as JourneyStage,
      title: 'Start learning',
      subtitle: 'Commit to a learning path',
      startAge: a + 2,
      endAge: a + 4,
      isMilestone: true,
      icon: 'BookOpen',
      description: `Begin your chosen education or training path for ${career}. Stay curious and build connections along the way.`,
      microActions: [
        'Enrol in your chosen course or programme',
        'Join a relevant community or group',
        'Set monthly learning goals',
      ],
    },
    // Experience (2 items)
    {
      id: id(),
      stage: 'experience' as JourneyStage,
      title: 'Get hands-on experience',
      subtitle: 'Apply what you\'ve learned',
      startAge: a + 2,
      endAge: a + 3,
      isMilestone: false,
      icon: 'Briefcase',
      description: `Look for internships, volunteering, or part-time work related to ${career}. Real-world experience is invaluable.`,
      microActions: [
        'Apply for an internship or work experience',
        'Volunteer in a related area',
        'Start a personal project',
      ],
    },
    {
      id: id(),
      stage: 'experience' as JourneyStage,
      title: 'Build your portfolio',
      subtitle: 'Show what you can do',
      startAge: a + 3,
      endAge: a + 4,
      isMilestone: true,
      icon: 'FolderOpen',
      description: `Collect evidence of your skills and achievements. A portfolio helps you stand out when applying for ${career} roles.`,
      microActions: [
        'Document your best work',
        'Get a recommendation or reference',
        'Update your profile with new skills',
      ],
    },
    // Career (1 item)
    {
      id: id(),
      stage: 'career' as JourneyStage,
      title: `Enter ${career}`,
      subtitle: 'Take the first step into your career',
      startAge: a + 4,
      isMilestone: true,
      icon: 'Target',
      description: `You've built the skills, education, and experience. Now it's time to pursue your first role in ${career}.`,
      microActions: [
        'Prepare your CV and cover letter',
        'Apply for entry-level positions',
        'Prepare for interviews',
      ],
    },
  ];

  const schoolTrack: SchoolTrackItem[] = [
    {
      id: id(),
      stage: 'foundation',
      title: 'Choose relevant subjects',
      subjects: ['Mathematics', 'English', 'ICT / Digital Skills'],
      personalLearning: `Research what ${career} involves day-to-day`,
      startAge: a,
      endAge: a + 1,
    },
    {
      id: id(),
      stage: 'education',
      title: 'Specialise your studies',
      subjects: ['Relevant A-levels or vocational courses'],
      personalLearning: `Take online courses related to ${career}`,
      startAge: a + 1,
      endAge: a + 2,
    },
    {
      id: id(),
      stage: 'experience',
      title: 'Apply knowledge practically',
      subjects: ['Degree or apprenticeship modules'],
      personalLearning: `Work on personal projects related to ${career}`,
      startAge: a + 2,
      endAge: a + 4,
    },
    {
      id: id(),
      stage: 'career',
      title: 'Continuous development',
      subjects: ['Professional certifications'],
      personalLearning: 'Stay current with industry developments',
      startAge: a + 4,
    },
  ];

  return {
    id: `fallback-${career.toLowerCase().replace(/\s+/g, '-')}`,
    career,
    startAge: a,
    startYear: currentYear,
    items,
    schoolTrack,
  };
}
