/**
 * Fallback Timeline Generator
 *
 * Produces a realistic career roadmap when OpenAI is unavailable.
 * Follows mandatory progression: School → University → Internship → Work → Senior role
 * No professional certifications before age 23.
 * Uses Norwegian context (videregående, universities).
 */

import type { Journey, JourneyItem, JourneyStage, SchoolTrackItem } from './career-journey-types';

function id(): string {
  return `fb-${Math.random().toString(36).slice(2, 9)}`;
}

export function generateFallbackTimeline(career: string, userAge = 16): Journey {
  const currentYear = new Date().getFullYear();
  const a = Math.max(userAge, 16);

  const items: JourneyItem[] = [
    // 1. Foundation: School (ages 16-19)
    {
      id: id(),
      stage: 'foundation' as JourneyStage,
      title: 'Your Foundation',
      subtitle: 'Where you are today',
      startAge: a,
      isMilestone: false,
      icon: 'Sparkles',
      description: `Focus on your school subjects. Choose subjects that are relevant to ${career} — this is your foundation for everything that follows.`,
      microActions: [
        'Identify which school subjects are most relevant',
        'Talk to your teachers about this career direction',
        'Research what grades are needed for university entry',
      ],
    },
    {
      id: id(),
      stage: 'foundation' as JourneyStage,
      title: 'Complete Videregående',
      subtitle: 'Upper secondary school',
      startAge: Math.max(a, 17),
      endAge: Math.max(a + 2, 19),
      isMilestone: true,
      icon: 'GraduationCap',
      description: 'Complete your upper secondary education with strong grades in relevant subjects. This is your ticket to university or vocational training.',
      microActions: [
        'Maintain strong grades in key subjects',
        'Apply to university via Samordna opptak',
        'Attend open days at universities you are considering',
      ],
    },
    // 2. Education: University (ages 19-22/24)
    {
      id: id(),
      stage: 'education' as JourneyStage,
      title: `Study towards ${career}`,
      subtitle: 'University or vocational training',
      startAge: Math.max(a + 3, 19),
      endAge: Math.max(a + 6, 22),
      isMilestone: false,
      icon: 'BookOpen',
      description: `Begin your degree or vocational programme. This is where you build the deep knowledge needed for ${career}. Stay curious and make connections.`,
      microActions: [
        'Enrol in your chosen programme',
        'Join student organisations related to your field',
        'Look for summer internship opportunities from year 2',
      ],
    },
    {
      id: id(),
      stage: 'education' as JourneyStage,
      title: 'Graduate',
      subtitle: 'Complete your education',
      startAge: Math.max(a + 6, 22),
      isMilestone: true,
      icon: 'GraduationCap',
      description: `Complete your degree or training. You now have the educational foundation to enter ${career}.`,
      microActions: [
        'Complete your final project or thesis',
        'Update your CV with your qualification',
        'Start applying for graduate positions',
      ],
    },
    // 3. Experience: Entry-level work (ages 22-25)
    {
      id: id(),
      stage: 'experience' as JourneyStage,
      title: `Entry-level ${career} role`,
      subtitle: 'Your first professional position',
      startAge: Math.max(a + 6, 22),
      endAge: Math.max(a + 9, 25),
      isMilestone: false,
      icon: 'Briefcase',
      description: `Start building real-world experience in ${career}. Focus on learning from senior colleagues, understanding the industry, and proving yourself.`,
      microActions: [
        'Apply for entry-level positions',
        'Find a mentor in your workplace',
        'Set 90-day learning goals with your manager',
      ],
    },
    // 4. Professional development (ages 25+)
    {
      id: id(),
      stage: 'experience' as JourneyStage,
      title: 'Professional certifications',
      subtitle: 'Strengthen your credentials',
      startAge: Math.max(a + 9, 25),
      endAge: Math.max(a + 10, 27),
      isMilestone: true,
      icon: 'Award',
      description: `Now that you have work experience, consider professional certifications relevant to ${career}. These demonstrate expertise and open doors to senior roles.`,
      microActions: [
        'Research which certifications are valued in your field',
        'Discuss certification goals with your employer',
        'Enrol in a certification programme',
      ],
    },
    // 5. Career: Senior role (ages 27+)
    {
      id: id(),
      stage: 'career' as JourneyStage,
      title: `Senior ${career}`,
      subtitle: 'Established professional',
      startAge: Math.max(a + 11, 27),
      isMilestone: true,
      icon: 'Target',
      description: `With 5+ years of experience and professional certifications, you are now positioned for senior roles in ${career}. Consider specialisation or leadership paths.`,
      microActions: [
        'Apply for senior positions',
        'Consider whether you want to specialise or lead',
        'Mentor junior colleagues',
      ],
    },
  ];

  // Filter out items that start before the user's age
  const filteredItems = items.filter(item => item.startAge >= a);

  const schoolTrack: SchoolTrackItem[] = [
    {
      id: id(),
      stage: 'foundation',
      title: 'Choose relevant subjects',
      subjects: ['Focus on subjects relevant to your career goal'],
      personalLearning: `Explore what ${career} involves through reading and conversations`,
      startAge: a,
      endAge: Math.max(a + 1, 17),
    },
    {
      id: id(),
      stage: 'foundation',
      title: 'Prepare for university',
      subjects: ['Strengthen grades in key subjects'],
      personalLearning: 'Research university programmes and entry requirements',
      startAge: Math.max(a + 1, 17),
      endAge: Math.max(a + 3, 19),
    },
    {
      id: id(),
      stage: 'education',
      title: 'University studies',
      subjects: ['Core programme subjects'],
      personalLearning: 'Build professional network through student organisations',
      startAge: Math.max(a + 3, 19),
      endAge: Math.max(a + 6, 22),
    },
    {
      id: id(),
      stage: 'experience',
      title: 'Early career',
      subjects: ['On-the-job learning'],
      personalLearning: 'Professional development and industry certifications',
      startAge: Math.max(a + 6, 22),
    },
  ];

  return {
    id: `fb-${career.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    career,
    startAge: a,
    startYear: currentYear,
    items: filteredItems,
    schoolTrack,
  };
}
