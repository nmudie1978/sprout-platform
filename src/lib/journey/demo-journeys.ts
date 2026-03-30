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
      howTo: [
        { step: 'Start with the Cisco Networking Basics course on Netacad', detail: 'Free, self-paced, and covers everything you need to know about how networks work' },
        { step: 'Install VirtualBox and set up a Linux VM', detail: 'This is your safe space to experiment without breaking anything' },
        { step: 'Join r/cybersecurity and the TryHackMe Discord', detail: 'Ask questions, share progress, and find study partners' },
      ],
      suggestedResources: [
        { label: 'Cisco Networking Academy — Free Courses', url: 'https://www.netacad.com/courses/networking', type: 'course' },
        { label: 'TryHackMe — Learn Cyber Security', url: 'https://tryhackme.com', type: 'platform' },
        { label: 'Professor Messer — Free IT Training', url: 'https://www.professormesser.com', type: 'video' },
        { label: 'VirtualBox — Free VM Software', url: 'https://www.virtualbox.org', type: 'tool' },
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
      howTo: [
        { step: 'Pick two project ideas from a cybersecurity project list', detail: 'A port scanner in Python and a simple SIEM dashboard are great starters' },
        { step: 'Create a GitHub repository for each project', detail: 'Include a clear README explaining what the project does and how to run it' },
        { step: 'Write up your process on Medium or Dev.to', detail: 'This shows you can communicate technical work — employers love this' },
      ],
      suggestedResources: [
        { label: 'GitHub — Host Your Projects', url: 'https://github.com', type: 'platform' },
        { label: 'Python for Cybersecurity — Real Python', url: 'https://realpython.com/tutorials/security/', type: 'article' },
        { label: 'Dev.to — Tech Blogging Platform', url: 'https://dev.to', type: 'platform' },
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
      howTo: [
        { step: 'Search UCAS for IT courses in your area', detail: 'Filter by BTEC Level 3 or A-Level Computer Science' },
        { step: 'Book open day visits at your top 3 colleges' },
        { step: 'Check entry requirements against your current grades' },
        { step: 'Apply for bursary funding before the deadline' },
      ],
      suggestedResources: [
        { label: 'UCAS — Course Search', url: 'https://www.ucas.com/explore', type: 'platform' },
        { label: 'GOV.UK — Student Finance', url: 'https://www.gov.uk/student-finance', type: 'article' },
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
      howTo: [
        { step: 'Compare cybersecurity bootcamps and programmes', detail: 'Look at SANS, Immersive Labs, or BCS-accredited courses' },
        { step: 'Complete at least 20 TryHackMe rooms to build practical skills' },
        { step: 'Study the NIST Cybersecurity Framework basics' },
      ],
      suggestedResources: [
        { label: 'TryHackMe — Beginner Path', url: 'https://tryhackme.com/path/outline/beginner', type: 'platform' },
        { label: 'HackTheBox Academy', url: 'https://academy.hackthebox.com', type: 'platform' },
        { label: 'NIST Framework Overview', url: 'https://www.nist.gov/cyberframework', type: 'article' },
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
      howTo: [
        { step: 'Get the CompTIA Security+ study guide (SY0-701)', detail: 'The official CertMaster or Professor Messer free course are both solid' },
        { step: 'Use Dion Training practice exams to gauge readiness' },
        { step: 'Schedule your exam when consistently scoring 85%+' },
      ],
      suggestedResources: [
        { label: 'CompTIA Security+ Certification', url: 'https://www.comptia.org/certifications/security', type: 'course' },
        { label: 'Professor Messer — Security+ Course', url: 'https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/sy0-701-comptia-security-plus-course/', type: 'video' },
        { label: 'Dion Training — Practice Exams', url: 'https://www.diontraining.com/comptia-security/', type: 'course' },
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
      howTo: [
        { step: 'Update your CV to highlight certs and projects' },
        { step: 'Set up job alerts on Indeed, Reed, and LinkedIn', detail: 'Search for "IT Support", "Helpdesk", or "Junior IT Technician"' },
        { step: 'Practice common IT interview questions', detail: 'Focus on troubleshooting scenarios and networking basics' },
      ],
      suggestedResources: [
        { label: 'Indeed — IT Support Jobs', url: 'https://www.indeed.co.uk/IT-Support-jobs', type: 'platform' },
        { label: 'Reed — Junior IT Roles', url: 'https://www.reed.co.uk/jobs/junior-it', type: 'platform' },
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
      howTo: [
        { step: 'Search for SOC analyst internships at large organisations', detail: 'Banks, telecoms, and government agencies often have structured programmes' },
        { step: 'Attend BSides or local cybersecurity meetups to network' },
        { step: 'Ask your college/uni careers service about placement opportunities' },
      ],
      suggestedResources: [
        { label: 'CyberSecurityJobsite — Internships', url: 'https://www.cybersecurityjobsite.com/jobs/internship/', type: 'platform' },
        { label: 'BSides Events — Community Conferences', url: 'https://www.securitybsides.com', type: 'platform' },
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
      howTo: [
        { step: 'Build a one-page portfolio site showing your journey', detail: 'Include projects, certs, and a short bio' },
        { step: 'Set up alerts for "SOC Analyst" and "Security Analyst" roles' },
        { step: 'Prepare for scenario-based interviews', detail: 'Practice explaining how you would triage a security alert' },
      ],
      suggestedResources: [
        { label: 'LinkedIn — SOC Analyst Jobs', url: 'https://www.linkedin.com/jobs/soc-analyst-jobs/', type: 'platform' },
        { label: 'CyberSecurityJobsite', url: 'https://www.cybersecurityjobsite.com', type: 'platform' },
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
      howTo: [
        { step: 'Enrol in the Google UX Design Certificate on Coursera', detail: 'Free with financial aid — takes about 6 months part-time' },
        { step: 'Install Figma and start recreating screens from apps you use' },
        { step: 'Create a Dribbble or Behance account to save inspiration' },
      ],
      suggestedResources: [
        { label: 'Google UX Design Certificate', url: 'https://www.coursera.org/professional-certificates/google-ux-design', type: 'course' },
        { label: 'Figma — Free Design Tool', url: 'https://www.figma.com', type: 'tool' },
        { label: 'Dribbble — Design Inspiration', url: 'https://dribbble.com', type: 'platform' },
        { label: 'Laws of UX', url: 'https://lawsofux.com', type: 'article' },
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
      howTo: [
        { step: 'Focus revision on Maths and Physics — these are the entry gates', detail: 'Use BBC Bitesize and past papers for free revision' },
        { step: 'Search "electrical apprenticeships near me" on GOV.UK Find an Apprenticeship' },
        { step: 'Contact local electrical contractors and ask about work experience' },
      ],
      suggestedResources: [
        { label: 'GOV.UK — Find an Apprenticeship', url: 'https://www.findapprenticeship.service.gov.uk', type: 'platform' },
        { label: 'BBC Bitesize — GCSE Revision', url: 'https://www.bbc.co.uk/bitesize/groups/c7p631y04r7t', type: 'course' },
        { label: 'JIB — Careers in Electrical', url: 'https://www.jib.org.uk/careers', type: 'article' },
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
      howTo: [
        { step: 'Apply to at least 5 apprenticeship vacancies through the GOV.UK portal' },
        { step: 'Practice electrical aptitude tests online', detail: 'Focus on spatial reasoning and basic circuit questions' },
        { step: 'Email local electrical firms asking about work experience placements' },
      ],
      suggestedResources: [
        { label: 'GOV.UK — Find an Apprenticeship', url: 'https://www.findapprenticeship.service.gov.uk', type: 'platform' },
        { label: 'ECA — Electrical Contractors Association', url: 'https://www.eca.co.uk', type: 'article' },
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
      howTo: [
        { step: 'Search for BTEC Health & Social Care at local colleges', detail: 'Most colleges offer this — check for the Level 3 Extended Diploma' },
        { step: 'Contact local care homes about volunteering', detail: 'Even a few hours a week gives you valuable experience and looks great on your UCAS application' },
        { step: 'Look at NMC-approved nursing degrees on UCAS', detail: 'Check which universities accept BTEC qualifications' },
      ],
      suggestedResources: [
        { label: 'UCAS — Nursing Courses', url: 'https://www.ucas.com/explore/subjects/nursing', type: 'platform' },
        { label: 'NMC — Approved Programmes', url: 'https://www.nmc.org.uk/education/approved-programmes/', type: 'article' },
        { label: 'NHS Careers — Nursing', url: 'https://www.healthcareers.nhs.uk/explore-roles/nursing', type: 'article' },
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
      howTo: [
        { step: 'Apply through UCAS by mid-January', detail: 'You can apply to up to 5 universities' },
        { step: 'Apply for the NHS Learning Support Fund', detail: 'Up to \u00a35,000/year non-repayable grant for nursing students' },
        { step: 'Prepare for values-based interviews', detail: 'Practice answers around compassion, teamwork, and patient safety' },
      ],
      suggestedResources: [
        { label: 'UCAS — Apply', url: 'https://www.ucas.com/undergraduate/applying-university', type: 'platform' },
        { label: 'NHS Learning Support Fund', url: 'https://www.nhsbsa.nhs.uk/nhs-learning-support-fund', type: 'article' },
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
