/**
 * Demo Journey Data — 5 Career Pathways
 *
 * UK/EU context, all starting at age 17.
 * Each journey has 7-9 items with descriptions and micro-actions.
 */

import type { Journey } from './career-journey-types';
import { chef, gameDeveloper, digitalMarketer, softwareDeveloper, graphicDesigner } from './demo-journeys-extra';

// ============================================
// CYBERSECURITY ANALYST
// ============================================

const cybersecurity: Journey = {
  id: 'cybersecurity',
  career: 'Cybersecurity Analyst',
  startAge: 17,
  startYear: 2025,
  items: [
    {
      id: 'cyber-1',
      stage: 'foundation',
      title: 'Core IT & Security Basics',
      subtitle: 'Self-study & online courses',
      startAge: 17,
      endAge: 18,
      isMilestone: false,
      icon: 'Monitor',
      description:
        'Build a strong foundation in networking, operating systems, and basic security concepts through online platforms and self-directed learning.',
      microActions: [
        'Complete a free networking fundamentals course',
        'Set up a home lab with virtual machines',
        'Join a cybersecurity community forum',
      ],
    },
    {
      id: 'cyber-2',
      stage: 'foundation',
      title: 'Build 2 Security Projects',
      subtitle: 'Portfolio milestone',
      startAge: 18,
      isMilestone: true,
      icon: 'Shield',
      description:
        'Create tangible portfolio pieces — a vulnerability scanner script and a network monitoring dashboard.',
      microActions: [
        'Document your projects on GitHub',
        'Write a blog post explaining what you built',
      ],
    },
    {
      id: 'cyber-3',
      stage: 'education',
      title: 'College — IT Focus',
      subtitle: 'BTEC or A-Level pathway',
      startAge: 18,
      endAge: 19,
      isMilestone: false,
      icon: 'GraduationCap',
      description:
        'Formal IT education at college level, covering computer science fundamentals, databases, and web technologies.',
      microActions: [
        'Research IT courses at local colleges',
        'Attend an open day or virtual taster session',
        'Apply for student bursaries',
      ],
    },
    {
      id: 'cyber-4',
      stage: 'education',
      title: 'Cybersecurity Certificate Track',
      subtitle: 'Specialist training',
      startAge: 19,
      endAge: 20,
      isMilestone: false,
      icon: 'BookOpen',
      description:
        'Focused cybersecurity training covering ethical hacking, incident response, and security frameworks like NIST.',
      microActions: [
        'Enrol in a recognised cybersecurity programme',
        'Practice on TryHackMe or HackTheBox',
      ],
    },
    {
      id: 'cyber-5',
      stage: 'education',
      title: 'CompTIA Security+',
      subtitle: 'Industry certification',
      startAge: 20,
      isMilestone: true,
      icon: 'Award',
      description:
        'Earn the globally recognised CompTIA Security+ certification, validating your core security knowledge.',
      microActions: [
        'Schedule your exam date',
        'Complete practice exams until scoring 85%+',
      ],
    },
    {
      id: 'cyber-6',
      stage: 'experience',
      title: 'Helpdesk / Junior IT Role',
      subtitle: 'First industry position',
      startAge: 20,
      endAge: 21,
      isMilestone: false,
      icon: 'Briefcase',
      description:
        'Gain hands-on workplace experience in IT support, learning how organisations manage their technology infrastructure.',
      microActions: [
        'Update your CV with certifications',
        'Apply to 5 junior IT positions this week',
        'Prepare for technical interview questions',
      ],
    },
    {
      id: 'cyber-7',
      stage: 'experience',
      title: 'Security Internship',
      subtitle: '6-12 month placement',
      startAge: 21,
      endAge: 22,
      isMilestone: false,
      icon: 'Shield',
      description:
        'Work alongside security professionals in a SOC (Security Operations Centre), learning real-world threat detection and response.',
      microActions: [
        'Research companies with security internship programmes',
        'Network at local cybersecurity meetups',
      ],
    },
    {
      id: 'cyber-8',
      stage: 'career',
      title: 'Junior SOC Analyst',
      subtitle: 'Career launch',
      startAge: 22,
      isMilestone: true,
      icon: 'Target',
      description:
        'Begin your career as a Junior SOC Analyst, monitoring security events and responding to incidents.',
      microActions: [
        'Set up job alerts on LinkedIn and CyberSecurityJobsite',
        'Prepare a portfolio showcasing your journey',
      ],
    },
  ],
};

// ============================================
// AI PRODUCT DESIGNER
// ============================================

const aiDesigner: Journey = {
  id: 'ai-designer',
  career: 'AI Product Designer',
  startAge: 17,
  startYear: 2025,
  items: [
    {
      id: 'ai-1',
      stage: 'foundation',
      title: 'Design Fundamentals',
      subtitle: 'Visual & interaction design',
      startAge: 17,
      endAge: 18,
      isMilestone: false,
      icon: 'PenTool',
      description:
        'Learn core design principles — typography, colour theory, layout, and accessibility through free online courses and daily practice.',
      microActions: [
        'Complete Google UX Design certificate (Coursera)',
        'Redesign an app screen every week',
        'Start a design inspiration folder',
      ],
    },
    {
      id: 'ai-2',
      stage: 'education',
      title: 'UX Bootcamp',
      subtitle: 'Intensive training',
      startAge: 18,
      endAge: 19,
      isMilestone: false,
      icon: 'GraduationCap',
      description:
        'Attend an intensive UX bootcamp covering user research, wireframing, prototyping, and usability testing.',
      microActions: [
        'Research bootcamp options and funding',
        'Build 3 case studies during the programme',
      ],
    },
    {
      id: 'ai-3',
      stage: 'education',
      title: 'AI / ML Introduction',
      subtitle: 'Understanding the technology',
      startAge: 19,
      endAge: 20,
      isMilestone: false,
      icon: 'Sparkles',
      description:
        'Gain foundational understanding of how AI and machine learning work, focusing on concepts relevant to product design.',
      microActions: [
        'Complete an intro to AI course',
        'Explore AI design tools like Figma AI plugins',
        'Read case studies on AI-powered products',
      ],
    },
    {
      id: 'ai-4',
      stage: 'experience',
      title: 'Junior UX Role',
      subtitle: 'First design position',
      startAge: 20,
      endAge: 21,
      isMilestone: false,
      icon: 'Briefcase',
      description:
        'Apply your skills in a professional setting, working on real products and collaborating with developers and product managers.',
      microActions: [
        'Polish your portfolio with bootcamp projects',
        'Apply to junior UX roles at tech companies',
        'Attend local design meetups for networking',
      ],
    },
    {
      id: 'ai-5',
      stage: 'experience',
      title: 'Product Design Internship',
      subtitle: 'AI-focused company',
      startAge: 21,
      endAge: 22,
      isMilestone: false,
      icon: 'Lightbulb',
      description:
        'Intern at a company building AI products, learning how to design interfaces for intelligent systems.',
      microActions: [
        'Target companies working with AI/ML products',
        'Document your design process thoroughly',
      ],
    },
    {
      id: 'ai-6',
      stage: 'career',
      title: 'AI Product Designer',
      subtitle: 'Specialist role',
      startAge: 22,
      isMilestone: true,
      icon: 'Sparkles',
      description:
        'Step into a specialist AI Product Designer role, shaping how people interact with intelligent systems.',
      microActions: [
        'Build a portfolio section dedicated to AI design',
        'Contribute to open-source AI design resources',
      ],
    },
  ],
};

// ============================================
// ELECTRICIAN APPRENTICESHIP
// ============================================

const electrician: Journey = {
  id: 'electrician',
  career: 'Qualified Electrician',
  startAge: 17,
  startYear: 2025,
  items: [
    {
      id: 'elec-1',
      stage: 'foundation',
      title: 'GCSE Foundation',
      subtitle: 'Maths & Science focus',
      startAge: 17,
      endAge: 18,
      isMilestone: false,
      icon: 'BookOpen',
      description:
        'Ensure strong GCSE results in Maths and Science, which are entry requirements for most electrical apprenticeships.',
      microActions: [
        'Achieve grade 4+ in Maths and Science GCSEs',
        'Research local electrical apprenticeship providers',
        'Attend a careers fair or trades open day',
      ],
    },
    {
      id: 'elec-2',
      stage: 'education',
      title: 'Level 2 Apprenticeship',
      subtitle: 'Installation Electrician',
      startAge: 18,
      endAge: 20,
      isMilestone: false,
      icon: 'Zap',
      description:
        'Begin a Level 2 apprenticeship combining college learning with on-the-job training under a qualified electrician.',
      microActions: [
        'Apply to apprenticeship vacancies on GOV.UK',
        'Prepare for aptitude tests',
        'Arrange work experience with a local firm',
      ],
    },
    {
      id: 'elec-3',
      stage: 'education',
      title: 'NVQ Level 3',
      subtitle: 'Advanced qualification',
      startAge: 20,
      endAge: 21,
      isMilestone: false,
      icon: 'GraduationCap',
      description:
        'Progress to Level 3 covering complex installations, testing and inspection, and fault diagnosis.',
      microActions: [
        'Keep a detailed portfolio of installations completed',
        'Study BS 7671 wiring regulations thoroughly',
      ],
    },
    {
      id: 'elec-4',
      stage: 'experience',
      title: 'AM2 Assessment',
      subtitle: 'Industry end-point assessment',
      startAge: 21,
      isMilestone: true,
      icon: 'Award',
      description:
        'Pass the AM2 assessment — a practical exam that tests your ability to complete electrical installations to industry standards.',
      microActions: [
        'Book your AM2 assessment at an approved centre',
        'Practice timed installations',
      ],
    },
    {
      id: 'elec-5',
      stage: 'experience',
      title: 'JIB Gold Card',
      subtitle: 'Industry registration',
      startAge: 21,
      isMilestone: true,
      icon: 'Award',
      description:
        'Receive your JIB Gold Card confirming you as an Approved Electrician, recognised across the UK construction industry.',
      microActions: [
        'Apply for your JIB ECS card',
        'Register with the Electrical Contractors Association',
      ],
    },
    {
      id: 'elec-6',
      stage: 'career',
      title: 'Qualified Electrician',
      subtitle: 'Employed or self-employed',
      startAge: 22,
      isMilestone: true,
      icon: 'Zap',
      description:
        'Begin working as a fully qualified electrician with the freedom to specialise in domestic, commercial, or industrial work.',
      microActions: [
        'Decide between employment and self-employment',
        'Look into Part P certification for domestic work',
      ],
    },
  ],
};

// ============================================
// NURSE / HEALTHCARE
// ============================================

const nurse: Journey = {
  id: 'nurse',
  career: 'Registered Nurse',
  startAge: 17,
  startYear: 2025,
  items: [
    {
      id: 'nurse-1',
      stage: 'foundation',
      title: 'Health & Social Care BTEC',
      subtitle: 'Level 3 qualification',
      startAge: 17,
      endAge: 19,
      isMilestone: false,
      icon: 'Heart',
      description:
        'Study Health & Social Care at Level 3, covering anatomy, physiology, safeguarding, and care values.',
      microActions: [
        'Enrol in BTEC Health & Social Care at college',
        'Arrange voluntary work at a care home or hospital',
        'Research university nursing programmes and entry requirements',
      ],
    },
    {
      id: 'nurse-2',
      stage: 'education',
      title: 'University — Nursing Degree',
      subtitle: 'BSc Adult Nursing',
      startAge: 19,
      endAge: 22,
      isMilestone: false,
      icon: 'GraduationCap',
      description:
        'Complete a 3-year BSc Nursing degree approved by the NMC, combining academic study with clinical placements.',
      microActions: [
        'Apply through UCAS by January deadline',
        'Check NHS Learning Support Fund eligibility',
        'Prepare for values-based interview',
      ],
    },
    {
      id: 'nurse-3',
      stage: 'experience',
      title: 'Clinical Placements',
      subtitle: 'Hospital & community settings',
      startAge: 20,
      endAge: 22,
      isMilestone: false,
      icon: 'Stethoscope',
      description:
        'Complete 2,300+ hours of supervised clinical placements across hospital wards, community settings, and specialist units.',
      microActions: [
        'Keep a reflective practice journal',
        'Seek feedback from mentors after each placement',
      ],
    },
    {
      id: 'nurse-4',
      stage: 'experience',
      title: 'NMC Registration',
      subtitle: 'Professional registration',
      startAge: 22,
      isMilestone: true,
      icon: 'Award',
      description:
        'Register with the Nursing and Midwifery Council upon successful completion of your degree and placements.',
      microActions: [
        'Submit your NMC registration application',
        'Complete required health and character checks',
      ],
    },
    {
      id: 'nurse-5',
      stage: 'career',
      title: 'Band 5 Staff Nurse',
      subtitle: 'NHS or private sector',
      startAge: 22,
      isMilestone: true,
      icon: 'Heart',
      description:
        'Begin your nursing career as a Band 5 Staff Nurse, providing direct patient care and working as part of a multidisciplinary team.',
      microActions: [
        'Apply for newly qualified nurse positions on NHS Jobs',
        'Choose your preferred speciality or ward',
      ],
    },
  ],
};

// ============================================
// STARTUP FOUNDER
// ============================================

const founder: Journey = {
  id: 'founder',
  career: 'Startup Founder',
  startAge: 17,
  startYear: 2025,
  items: [
    {
      id: 'founder-1',
      stage: 'foundation',
      title: 'Business Studies',
      subtitle: 'A-Level or BTEC',
      startAge: 17,
      endAge: 18,
      isMilestone: false,
      icon: 'BookOpen',
      description:
        'Study business fundamentals — marketing, finance, operations — and start thinking like an entrepreneur.',
      microActions: [
        'Read "The Lean Startup" by Eric Ries',
        'Follow founders you admire on social media',
        'Start a business ideas journal',
      ],
    },
    {
      id: 'founder-2',
      stage: 'foundation',
      title: 'First Side Project',
      subtitle: 'Build something real',
      startAge: 18,
      isMilestone: true,
      icon: 'Lightbulb',
      description:
        'Launch your first side project — a small product, service, or app that solves a real problem for people around you.',
      microActions: [
        'Identify a problem worth solving',
        'Talk to 10 potential users before building',
      ],
    },
    {
      id: 'founder-3',
      stage: 'education',
      title: 'Startup Weekend',
      subtitle: 'Hackathon experience',
      startAge: 18,
      isMilestone: true,
      icon: 'Rocket',
      description:
        'Participate in a Startup Weekend or hackathon to practise rapid ideation, team building, and pitching.',
      microActions: [
        'Find a local Startup Weekend event',
        'Prepare a 60-second elevator pitch',
      ],
    },
    {
      id: 'founder-4',
      stage: 'education',
      title: 'University Enterprise',
      subtitle: 'Business or CS degree',
      startAge: 19,
      endAge: 21,
      isMilestone: false,
      icon: 'GraduationCap',
      description:
        'Pursue a degree with strong enterprise support — access to incubators, mentors, and seed funding competitions.',
      microActions: [
        'Research universities with startup incubators',
        'Apply to enterprise modules and competitions',
        'Join the entrepreneurship society',
      ],
    },
    {
      id: 'founder-5',
      stage: 'experience',
      title: 'Co-Founder Role',
      subtitle: 'Early-stage startup',
      startAge: 21,
      endAge: 22,
      isMilestone: false,
      icon: 'Users',
      description:
        'Join or co-found an early-stage startup. Learn by doing — product development, customer acquisition, and surviving the "valley of death".',
      microActions: [
        'Find a co-founder with complementary skills',
        'Apply to an accelerator programme',
        'Talk to 50 potential customers',
      ],
    },
    {
      id: 'founder-6',
      stage: 'career',
      title: 'Seed Funding',
      subtitle: 'Investment milestone',
      startAge: 22,
      isMilestone: true,
      icon: 'Rocket',
      description:
        'Secure seed funding from angels, grants, or an accelerator to scale your startup beyond the early stage.',
      microActions: [
        'Prepare a pitch deck and financial model',
        'Apply to startup grants and competitions',
      ],
    },
  ],
};

// ============================================
// EXPORT
// ============================================

const DEMO_JOURNEYS: Journey[] = [
  cybersecurity,
  aiDesigner,
  electrician,
  nurse,
  founder,
  chef,
  gameDeveloper,
  digitalMarketer,
  softwareDeveloper,
  graphicDesigner,
];

export function getDemoJourneys(): Journey[] {
  return DEMO_JOURNEYS;
}

export function getDemoJourneyById(id: string): Journey | undefined {
  return DEMO_JOURNEYS.find((j) => j.id === id);
}
