/**
 * Fallback Timeline Generator
 *
 * Produces a realistic career roadmap when OpenAI is unavailable.
 * Branches on the user's current education stage so an 18-year-old already
 * at university doesn't get told to "complete Videregående" first.
 *
 * Stage handling:
 *   school     → full ladder: Videregående → Study → Graduate → Work → Senior
 *   college    → vocational ladder: in-programme → graduate → work → senior
 *   university → skip Videregående, start at "Continue studies" / "Graduate"
 *   other      → skip both initial education steps; start at experience
 *   undefined  → behave like 'school' (legacy behaviour)
 *
 * No professional certifications before age 23.
 * Uses Norwegian context (videregående, universities).
 */

import type { Journey, JourneyItem, JourneyStage, SchoolTrackItem } from './career-journey-types';

export type EducationStage = 'school' | 'college' | 'university' | 'other';

function id(): string {
  return `fb-${Math.random().toString(36).slice(2, 9)}`;
}

export function generateFallbackTimeline(
  career: string,
  userAge = 16,
  educationStage?: EducationStage,
  foundationComplete = false,
): Journey {
  const currentYear = new Date().getFullYear();
  const a = Math.max(userAge, 16);
  const stage: EducationStage = educationStage ?? 'school';

  // ── Build the stage-specific item list ──────────────────────────
  // Each branch returns the items in age order, anchored to the
  // user's current age so the first remaining step always reads
  // "you are here = today" rather than pretending there's a gap.
  let items: JourneyItem[];

  if (stage === 'school') {
    items = [
      {
        id: id(),
        stage: 'foundation' as JourneyStage,
        title: 'Complete Videregående',
        subtitle: 'Upper secondary school',
        startAge: a,
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
      {
        id: id(),
        stage: 'experience' as JourneyStage,
        title: `Apply for entry-level ${career} roles`,
        subtitle: 'Find your first job',
        startAge: Math.max(a + 6, 22),
        isMilestone: true,
        icon: 'FolderOpen',
        description: `Now that you've graduated, the next step is finding the right entry-level role in ${career}. This phase is about job-hunting — researching employers, tailoring your CV, applying widely, and interviewing.`,
        microActions: [
          'Apply for entry-level positions',
          'Tailor your CV and cover letter for each role',
          'Practise interview questions for the field',
        ],
      },
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
          'Find a mentor in your workplace',
          'Set 90-day learning goals with your manager',
          'Build relationships across your team',
        ],
      },
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
  } else if (stage === 'university') {
    // User is already at university — skip Videregående entirely.
    // Anchor the active "Study" step at their current age and assume
    // ~3 years to graduation from now.
    const gradAge = a + 3;
    const entryEndAge = gradAge + 3;
    items = [
      {
        id: id(),
        stage: 'education' as JourneyStage,
        title: `Continue studying towards ${career}`,
        subtitle: 'University years',
        startAge: a,
        endAge: gradAge,
        isMilestone: false,
        icon: 'BookOpen',
        description: `You're already at university — keep building the deep knowledge needed for ${career}. Look for ways to specialise and connect your coursework to real ${career} work.`,
        microActions: [
          'Pick electives that align with your career goal',
          'Join student organisations related to your field',
          'Apply for summer internships in the industry',
        ],
      },
      {
        id: id(),
        stage: 'education' as JourneyStage,
        title: 'Graduate',
        subtitle: 'Complete your degree',
        startAge: gradAge,
        isMilestone: true,
        icon: 'GraduationCap',
        description: `Finish your degree. You now have the educational foundation to enter ${career}.`,
        microActions: [
          'Complete your final project or thesis',
          'Update your CV with your qualification',
          'Start applying for graduate positions',
        ],
      },
      {
        id: id(),
        stage: 'experience' as JourneyStage,
        title: `Apply for entry-level ${career} roles`,
        subtitle: 'Find your first job',
        startAge: gradAge,
        isMilestone: true,
        icon: 'FolderOpen',
        description: `Now that you've graduated, the next step is finding the right entry-level role in ${career}. This phase is about job-hunting — researching employers, tailoring your CV, applying widely, and interviewing.`,
        microActions: [
          'Apply for graduate / entry-level positions',
          'Tailor your CV and cover letter for each role',
          'Practise interview questions for the field',
        ],
      },
      {
        id: id(),
        stage: 'experience' as JourneyStage,
        title: `Entry-level ${career} role`,
        subtitle: 'Your first professional position',
        startAge: gradAge,
        endAge: entryEndAge,
        isMilestone: false,
        icon: 'Briefcase',
        description: `Start building real-world experience in ${career}. Focus on learning from senior colleagues, understanding the industry, and proving yourself.`,
        microActions: [
          'Find a mentor in your workplace',
          'Set 90-day learning goals with your manager',
          'Build relationships across your team',
        ],
      },
      {
        id: id(),
        stage: 'experience' as JourneyStage,
        title: 'Professional certifications',
        subtitle: 'Strengthen your credentials',
        startAge: entryEndAge,
        endAge: entryEndAge + 2,
        isMilestone: true,
        icon: 'Award',
        description: `With work experience behind you, consider professional certifications relevant to ${career}. These demonstrate expertise and open doors to senior roles.`,
        microActions: [
          'Research which certifications are valued in your field',
          'Discuss certification goals with your employer',
          'Enrol in a certification programme',
        ],
      },
      {
        id: id(),
        stage: 'career' as JourneyStage,
        title: `Senior ${career}`,
        subtitle: 'Established professional',
        startAge: entryEndAge + 4,
        isMilestone: true,
        icon: 'Target',
        description: `With 5+ years of experience, you are now positioned for senior roles in ${career}. Consider specialisation or leadership paths.`,
        microActions: [
          'Apply for senior positions',
          'Consider whether you want to specialise or lead',
          'Mentor junior colleagues',
        ],
      },
    ];
  } else if (stage === 'college') {
    // Vocational / fagskole route — shorter education, earlier work.
    const gradAge = a + 2;
    const entryEndAge = gradAge + 3;
    items = [
      {
        id: id(),
        stage: 'education' as JourneyStage,
        title: `Continue your vocational training for ${career}`,
        subtitle: 'College / fagskole years',
        startAge: a,
        endAge: gradAge,
        isMilestone: false,
        icon: 'Wrench',
        description: `Build the practical skills and qualifications you need for ${career}. Focus on hands-on competence and any apprenticeship hours required.`,
        microActions: [
          'Stay on track with coursework and practical hours',
          'Find an apprenticeship or work placement',
          'Build a portfolio of practical work',
        ],
      },
      {
        id: id(),
        stage: 'education' as JourneyStage,
        title: 'Complete your qualification',
        subtitle: 'Fagbrev / vocational diploma',
        startAge: gradAge,
        isMilestone: true,
        icon: 'GraduationCap',
        description: `Earn your vocational qualification — you're now ready to work as a ${career}.`,
        microActions: [
          'Pass your final assessment',
          'Update your CV with your qualification',
          'Start applying for entry-level roles',
        ],
      },
      {
        id: id(),
        stage: 'experience' as JourneyStage,
        title: `Apply for entry-level ${career} roles`,
        subtitle: 'Find your first job',
        startAge: gradAge,
        isMilestone: true,
        icon: 'FolderOpen',
        description: `Now that you've earned your qualification, the next step is finding the right entry-level role in ${career}. Vocational hiring often happens through trade contacts and word-of-mouth as well as job boards — work both channels.`,
        microActions: [
          'Apply for entry-level positions',
          'Tap your training network for openings',
          'Tailor your CV and prepare for interviews',
        ],
      },
      {
        id: id(),
        stage: 'experience' as JourneyStage,
        title: `Entry-level ${career} role`,
        subtitle: 'Your first professional position',
        startAge: gradAge,
        endAge: entryEndAge,
        isMilestone: false,
        icon: 'Briefcase',
        description: `Start building real-world experience in ${career}. Vocational entry usually means hitting the ground running — learn from experienced colleagues fast.`,
        microActions: [
          'Find a mentor at your workplace',
          'Take on responsibility quickly',
          'Build relationships with experienced colleagues',
        ],
      },
      {
        id: id(),
        stage: 'experience' as JourneyStage,
        title: 'Specialist certifications',
        subtitle: 'Strengthen your credentials',
        startAge: entryEndAge,
        endAge: entryEndAge + 2,
        isMilestone: true,
        icon: 'Award',
        description: `With practical experience under your belt, consider specialist certifications that deepen your expertise in ${career}.`,
        microActions: [
          'Research which certifications are valued in your field',
          'Discuss training goals with your employer',
          'Enrol in a certification programme',
        ],
      },
      {
        id: id(),
        stage: 'career' as JourneyStage,
        title: `Senior ${career}`,
        subtitle: 'Established professional',
        startAge: entryEndAge + 4,
        isMilestone: true,
        icon: 'Target',
        description: `With 5+ years of experience, you can step into senior or leadership roles — or set up on your own.`,
        microActions: [
          'Apply for senior positions',
          'Consider running your own business',
          'Mentor apprentices',
        ],
      },
    ];
  } else {
    // 'other' — gap year, self-taught, already working, etc. We can't
    // assume an education ladder at all. Start at the experience step.
    items = [
      {
        id: id(),
        stage: 'experience' as JourneyStage,
        title: `Get into ${career}`,
        subtitle: 'Find your way in',
        startAge: a,
        endAge: a + 2,
        isMilestone: false,
        icon: 'Briefcase',
        description: `Without a fixed education path, the route into ${career} is about proving you can do the work. Build a portfolio, take short courses, look for entry-level opportunities, and get any qualifications the industry expects along the way.`,
        microActions: [
          'Identify what employers actually require for entry roles',
          'Build a portfolio or evidence of relevant work',
          'Apply for entry-level positions or apprenticeships',
        ],
      },
      {
        id: id(),
        stage: 'experience' as JourneyStage,
        title: `Apply for entry-level ${career} roles`,
        subtitle: 'Find your first job',
        startAge: a + 2,
        isMilestone: true,
        icon: 'FolderOpen',
        description: `With a foundation in place, the next step is finding the right entry-level role in ${career}. Apply widely, tailor each application, and use any practical work or portfolio you have as evidence.`,
        microActions: [
          'Apply for entry-level positions',
          'Tailor your CV and cover letter for each role',
          'Practise interview questions for the field',
        ],
      },
      {
        id: id(),
        stage: 'experience' as JourneyStage,
        title: `Entry-level ${career} role`,
        subtitle: 'Your first professional position',
        startAge: a + 2,
        endAge: a + 5,
        isMilestone: false,
        icon: 'Briefcase',
        description: `Build real-world experience in ${career}. Focus on learning from senior colleagues and proving yourself.`,
        microActions: [
          'Find a mentor in your workplace',
          'Set 90-day learning goals',
          'Build relationships across your team',
        ],
      },
      {
        id: id(),
        stage: 'experience' as JourneyStage,
        title: 'Professional certifications',
        subtitle: 'Strengthen your credentials',
        startAge: a + 5,
        endAge: a + 7,
        isMilestone: true,
        icon: 'Award',
        description: `Once you have work experience, certifications relevant to ${career} demonstrate expertise and open doors to senior roles.`,
        microActions: [
          'Research which certifications are valued in your field',
          'Discuss certification goals with your employer',
          'Enrol in a certification programme',
        ],
      },
      {
        id: id(),
        stage: 'career' as JourneyStage,
        title: `Senior ${career}`,
        subtitle: 'Established professional',
        startAge: a + 9,
        isMilestone: true,
        icon: 'Target',
        description: `With 5+ years of experience, you are now positioned for senior roles in ${career}.`,
        microActions: [
          'Apply for senior positions',
          'Consider whether you want to specialise or lead',
          'Mentor junior colleagues',
        ],
      },
    ];
  }

  // If the user has marked their Foundation as Complete, they're
  // telling us their *current* education stage is finished. Drop the
  // leading items that represent that stage, then shift everything
  // that's left back so the new first step starts at the user's
  // current age. Without this, marking Foundation done would leave
  // contradictory steps like "Continue studying" sitting next to a
  // green COMPLETE pill on the Foundation card.
  if (foundationComplete && items.length > 0) {
    const skipCount =
      stage === 'university' ? 2 // drop "Continue studying" + "Graduate"
        : stage === 'college' ? 2 // drop vocational training + "Complete qualification"
          : stage === 'school' ? 1 // drop "Complete Videregående"
            : 1; // 'other' — drop "Get into X"
    items = items.slice(skipCount);
    if (items.length > 0) {
      const ageShift = a - items[0].startAge;
      if (ageShift !== 0) {
        items = items.map(it => ({
          ...it,
          startAge: it.startAge + ageShift,
          endAge: it.endAge !== undefined && it.endAge !== null ? it.endAge + ageShift : it.endAge,
        }));
      }
    }
  }

  // Filter out items that start before the user's age (defensive — the
  // branches above already anchor to `a`, but a stage like 'school' for
  // a much older user could leave stale entries).
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
