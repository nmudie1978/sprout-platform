/**
 * Extra Demo Journeys — 5 additional career pathways
 *
 * Supplements the 5 core journeys to reach 10 total.
 */

import type { Journey } from './career-journey-types';

// ============================================
// CHEF / HOSPITALITY
// ============================================

export const chef: Journey = {
  id: 'chef',
  career: 'Head Chef',
  startAge: 17,
  startYear: 2025,
  items: [
    {
      id: 'chef-1',
      stage: 'foundation',
      title: 'Kitchen Basics',
      subtitle: 'Food prep & hygiene awareness',
      startAge: 17,
      endAge: 18,
      isMilestone: false,
      icon: 'UtensilsCrossed',
      description:
        'Learn fundamental kitchen skills — knife techniques, food safety, and basic cooking methods through part-time work or volunteering.',
      microActions: [
        'Get a part-time kitchen porter or commis role',
        'Watch professional cooking technique videos',
        'Practice mise en place at home',
      ],
    },
    {
      id: 'chef-2',
      stage: 'foundation',
      title: 'Food Hygiene Certificate',
      subtitle: 'Level 2 certification',
      startAge: 18,
      isMilestone: true,
      icon: 'Award',
      description:
        'Achieve your Level 2 Food Hygiene Certificate — a legal requirement for working in professional kitchens.',
      microActions: [
        'Enrol in a Level 2 Food Hygiene course',
        'Study HACCP principles',
      ],
    },
    {
      id: 'chef-3',
      stage: 'education',
      title: 'Catering College',
      subtitle: 'Professional cookery diploma',
      startAge: 18,
      endAge: 20,
      isMilestone: false,
      icon: 'GraduationCap',
      description:
        'Complete a professional cookery diploma covering classical and modern techniques, menu planning, and kitchen management.',
      microActions: [
        'Research catering colleges with industry placements',
        'Apply for bursary or scholarship funding',
        'Keep a cooking portfolio with photos',
      ],
    },
    {
      id: 'chef-4',
      stage: 'experience',
      title: 'Commis Chef',
      subtitle: 'First professional kitchen role',
      startAge: 20,
      endAge: 21,
      isMilestone: false,
      icon: 'ChefHat',
      description:
        'Work as a commis chef in a professional kitchen, learning station management and high-volume service.',
      microActions: [
        'Apply to restaurants with strong training programmes',
        'Master one cuisine or station thoroughly',
      ],
    },
    {
      id: 'chef-5',
      stage: 'experience',
      title: 'Chef de Partie',
      subtitle: 'Section leader',
      startAge: 21,
      endAge: 22,
      isMilestone: false,
      icon: 'ChefHat',
      description:
        'Run your own section in the kitchen, managing prep, service, and quality for dishes in your station.',
      microActions: [
        'Develop signature dishes for your section',
        'Learn food costing and waste management',
      ],
    },
    {
      id: 'chef-6',
      stage: 'career',
      title: 'Sous Chef',
      subtitle: 'Second in command',
      startAge: 22,
      endAge: 24,
      isMilestone: true,
      icon: 'ChefHat',
      description:
        'Step up to sous chef — managing kitchen staff, overseeing service, and deputising for the head chef.',
      microActions: [
        'Develop leadership and team management skills',
        'Take a food safety Level 3 qualification',
      ],
    },
    {
      id: 'chef-7',
      stage: 'career',
      title: 'Head Chef',
      subtitle: 'Kitchen leader',
      startAge: 24,
      isMilestone: true,
      icon: 'Target',
      description:
        'Lead your own kitchen — creating menus, managing budgets, training staff, and delivering exceptional food.',
      microActions: [
        'Build your culinary brand and reputation',
        'Consider competition entries or media opportunities',
      ],
    },
  ],
};

// ============================================
// GAME DEVELOPER
// ============================================

export const gameDeveloper: Journey = {
  id: 'game-developer',
  career: 'Game Designer',
  startAge: 17,
  startYear: 2025,
  items: [
    {
      id: 'game-1',
      stage: 'foundation',
      title: 'Programming Fundamentals',
      subtitle: 'Python, C#, or JavaScript',
      startAge: 17,
      endAge: 18,
      isMilestone: false,
      icon: 'Code',
      description:
        'Learn programming basics through free resources — variables, loops, functions, and object-oriented thinking.',
      microActions: [
        'Complete a beginner programming course',
        'Build 3 small projects to practise',
        'Join a coding community or Discord server',
      ],
    },
    {
      id: 'game-2',
      stage: 'foundation',
      title: 'Game Jam Entry',
      subtitle: 'First game project',
      startAge: 18,
      isMilestone: true,
      icon: 'Gamepad2',
      description:
        'Participate in a game jam (Ludum Dare, GMTK, etc.) to build a complete game under time pressure.',
      microActions: [
        'Sign up for an upcoming game jam',
        'Learn basics of Unity or Godot',
        'Publish your entry on itch.io',
      ],
    },
    {
      id: 'game-3',
      stage: 'education',
      title: 'Computer Science Degree',
      subtitle: 'BSc with games focus',
      startAge: 18,
      endAge: 21,
      isMilestone: false,
      icon: 'GraduationCap',
      description:
        'Study computer science with modules in game development, 3D graphics, AI, and software engineering.',
      microActions: [
        'Research universities with game development modules',
        'Apply through UCAS by the deadline',
        'Join the game development society',
      ],
    },
    {
      id: 'game-4',
      stage: 'experience',
      title: 'Indie Game Project',
      subtitle: 'Self-directed development',
      startAge: 20,
      endAge: 21,
      isMilestone: true,
      icon: 'Lightbulb',
      description:
        'Develop and release your own indie game — handling design, code, art direction, and marketing.',
      microActions: [
        'Define your game concept and scope clearly',
        'Set up a devlog to track progress',
        'Create a Steam or itch.io page early',
      ],
    },
    {
      id: 'game-5',
      stage: 'experience',
      title: 'QA Tester Role',
      subtitle: 'Games industry entry',
      startAge: 21,
      endAge: 22,
      isMilestone: false,
      icon: 'Shield',
      description:
        'Enter the games industry through QA testing — learning how studios work, bug tracking, and game pipelines.',
      microActions: [
        'Apply to QA roles at game studios',
        'Learn bug reporting best practices',
        'Network with developers at the studio',
      ],
    },
    {
      id: 'game-6',
      stage: 'experience',
      title: 'Junior Game Developer',
      subtitle: 'Programming role at a studio',
      startAge: 22,
      endAge: 23,
      isMilestone: false,
      icon: 'Code',
      description:
        'Work as a junior game developer, implementing features, fixing bugs, and collaborating with designers and artists.',
      microActions: [
        'Specialise in gameplay, tools, or engine programming',
        'Contribute to internal game jams',
      ],
    },
    {
      id: 'game-7',
      stage: 'career',
      title: 'Published Title',
      subtitle: 'Ship a commercial game',
      startAge: 23,
      isMilestone: true,
      icon: 'Rocket',
      description:
        'See your name in the credits of a commercially released game — a major career milestone.',
      microActions: [
        'Document your contributions for your portfolio',
        'Write a post-mortem of the development process',
      ],
    },
    {
      id: 'game-8',
      stage: 'career',
      title: 'Game Designer',
      subtitle: 'Creative leadership',
      startAge: 24,
      isMilestone: true,
      icon: 'Gamepad2',
      description:
        'Transition to game design — shaping mechanics, systems, and player experiences at a creative level.',
      microActions: [
        'Build a game design portfolio with documentation',
        'Study game design theory and player psychology',
      ],
    },
  ],
};

// ============================================
// DIGITAL MARKETER
// ============================================

export const digitalMarketer: Journey = {
  id: 'digital-marketer',
  career: 'Digital Marketing Manager',
  startAge: 17,
  startYear: 2025,
  items: [
    {
      id: 'dm-1',
      stage: 'foundation',
      title: 'Social Media Skills',
      subtitle: 'Content creation basics',
      startAge: 17,
      endAge: 18,
      isMilestone: false,
      icon: 'Globe',
      description:
        'Learn how social media platforms work from a business perspective — content planning, analytics, and audience engagement.',
      microActions: [
        'Start a content account on a topic you enjoy',
        'Study how brands communicate on social media',
        'Learn basic photo and video editing',
      ],
    },
    {
      id: 'dm-2',
      stage: 'foundation',
      title: 'Google Digital Garage',
      subtitle: 'Free certification',
      startAge: 18,
      isMilestone: true,
      icon: 'Award',
      description:
        'Complete the Google Digital Garage Fundamentals of Digital Marketing certification — free and globally recognised.',
      microActions: [
        'Sign up for Google Digital Garage',
        'Complete all 26 modules',
      ],
    },
    {
      id: 'dm-3',
      stage: 'education',
      title: 'Marketing Degree or Diploma',
      subtitle: 'University or college pathway',
      startAge: 18,
      endAge: 21,
      isMilestone: false,
      icon: 'GraduationCap',
      description:
        'Study marketing, digital media, or business with a marketing specialism at degree or diploma level.',
      microActions: [
        'Research courses with placement years',
        'Look for CIM-accredited programmes',
        'Build case studies during your course',
      ],
    },
    {
      id: 'dm-4',
      stage: 'experience',
      title: 'Social Media Intern',
      subtitle: 'First marketing role',
      startAge: 20,
      endAge: 21,
      isMilestone: false,
      icon: 'Briefcase',
      description:
        'Manage social accounts, create content, and analyse engagement metrics for a real brand or agency.',
      microActions: [
        'Apply to internships at agencies and in-house teams',
        'Build a portfolio of content you have created',
      ],
    },
    {
      id: 'dm-5',
      stage: 'experience',
      title: 'Google Ads Certification',
      subtitle: 'Paid media specialism',
      startAge: 21,
      isMilestone: true,
      icon: 'Award',
      description:
        'Earn Google Ads certification to demonstrate paid search and display advertising competence.',
      microActions: [
        'Complete Google Skillshop training modules',
        'Practice with a small campaign budget',
      ],
    },
    {
      id: 'dm-6',
      stage: 'career',
      title: 'Digital Marketing Executive',
      subtitle: 'Full marketing role',
      startAge: 22,
      endAge: 24,
      isMilestone: false,
      icon: 'Globe',
      description:
        'Plan and execute digital campaigns across SEO, PPC, email, and social — measuring ROI and reporting to stakeholders.',
      microActions: [
        'Develop expertise in analytics tools',
        'Start working towards CIM qualifications',
      ],
    },
    {
      id: 'dm-7',
      stage: 'career',
      title: 'Digital Marketing Manager',
      subtitle: 'Strategy & leadership',
      startAge: 24,
      isMilestone: true,
      icon: 'Target',
      description:
        'Lead a marketing team, set digital strategy, manage budgets, and drive measurable business growth.',
      microActions: [
        'Develop leadership and budget management skills',
        'Build a network across the marketing industry',
      ],
    },
  ],
};

// ============================================
// SOFTWARE DEVELOPER
// ============================================

export const softwareDeveloper: Journey = {
  id: 'software-developer',
  career: 'Software Developer',
  startAge: 17,
  startYear: 2025,
  items: [
    {
      id: 'swe-1',
      stage: 'foundation',
      title: 'Learn to Code',
      subtitle: 'HTML, CSS, JavaScript',
      startAge: 17,
      endAge: 18,
      isMilestone: false,
      icon: 'Code',
      description:
        'Build your first websites and learn the fundamentals of programming through free resources like freeCodeCamp and The Odin Project.',
      microActions: [
        'Complete a web development fundamentals course',
        'Build a personal portfolio website',
        'Join a local coding meetup or online community',
      ],
    },
    {
      id: 'swe-2',
      stage: 'foundation',
      title: 'First Real Project',
      subtitle: 'Solve a genuine problem',
      startAge: 18,
      isMilestone: true,
      icon: 'Lightbulb',
      description:
        'Build something useful — an app, tool, or website that solves a real problem for someone you know.',
      microActions: [
        'Identify a problem and scope a small solution',
        'Deploy your project live on the internet',
        'Share it on GitHub with clear documentation',
      ],
    },
    {
      id: 'swe-3',
      stage: 'education',
      title: 'Computer Science Degree',
      subtitle: 'BSc or apprenticeship',
      startAge: 18,
      endAge: 21,
      isMilestone: false,
      icon: 'GraduationCap',
      description:
        'Study computer science, software engineering, or pursue a degree-level apprenticeship combining work and study.',
      microActions: [
        'Research universities and apprenticeship schemes',
        'Apply through UCAS or directly to employers',
        'Contribute to open-source projects alongside study',
      ],
    },
    {
      id: 'swe-4',
      stage: 'experience',
      title: 'Industry Placement',
      subtitle: 'Year in industry',
      startAge: 20,
      endAge: 21,
      isMilestone: false,
      icon: 'Building',
      description:
        'Work at a tech company for your placement year, gaining real-world experience with production codebases and agile teams.',
      microActions: [
        'Apply to placement programmes at tech companies',
        'Prepare for technical interviews (LeetCode, system design)',
      ],
    },
    {
      id: 'swe-5',
      stage: 'experience',
      title: 'Open Source Contributions',
      subtitle: 'Community involvement',
      startAge: 21,
      isMilestone: true,
      icon: 'Users',
      description:
        'Contribute to open-source projects, building your public profile and learning from experienced developers.',
      microActions: [
        'Find beginner-friendly issues on GitHub',
        'Submit your first pull request',
      ],
    },
    {
      id: 'swe-6',
      stage: 'career',
      title: 'Junior Developer',
      subtitle: 'First full-time role',
      startAge: 22,
      isMilestone: false,
      icon: 'Code',
      description:
        'Start your career as a junior developer, writing production code, reviewing PRs, and learning from senior engineers.',
      microActions: [
        'Polish your CV and GitHub profile',
        'Apply to companies that invest in junior development',
        'Prepare for technical and behavioural interviews',
      ],
    },
    {
      id: 'swe-7',
      stage: 'career',
      title: 'Mid-Level Developer',
      subtitle: 'Independent contributor',
      startAge: 24,
      isMilestone: true,
      icon: 'Target',
      description:
        'Progress to mid-level — owning features end-to-end, mentoring juniors, and making architectural decisions.',
      microActions: [
        'Specialise in a domain (frontend, backend, DevOps)',
        'Start mentoring others to solidify your knowledge',
      ],
    },
  ],
};

// ============================================
// GRAPHIC DESIGNER
// ============================================

export const graphicDesigner: Journey = {
  id: 'graphic-designer',
  career: 'Senior Graphic Designer',
  startAge: 17,
  startYear: 2025,
  items: [
    {
      id: 'gd-1',
      stage: 'foundation',
      title: 'Design Basics',
      subtitle: 'Colour, typography, layout',
      startAge: 17,
      endAge: 18,
      isMilestone: false,
      icon: 'PenTool',
      description:
        'Learn the fundamentals of visual design — colour theory, typography, composition, and grid systems through daily practice.',
      microActions: [
        'Complete a free graphic design course',
        'Recreate designs you admire to build muscle memory',
        'Start saving inspiration on Pinterest or Are.na',
      ],
    },
    {
      id: 'gd-2',
      stage: 'foundation',
      title: 'Portfolio of 5 Pieces',
      subtitle: 'Personal project milestone',
      startAge: 18,
      isMilestone: true,
      icon: 'Award',
      description:
        'Create 5 strong portfolio pieces — logos, posters, social media graphics, or brand identity concepts.',
      microActions: [
        'Design fictional brand identities to practise',
        'Set up an online portfolio (Behance or personal site)',
      ],
    },
    {
      id: 'gd-3',
      stage: 'education',
      title: 'Design Degree or Diploma',
      subtitle: 'BA Graphic Design',
      startAge: 18,
      endAge: 21,
      isMilestone: false,
      icon: 'GraduationCap',
      description:
        'Study graphic design at degree or diploma level, learning industry tools (Adobe Creative Suite, Figma) and design thinking.',
      microActions: [
        'Research courses with strong industry links',
        'Attend degree show exhibitions for inspiration',
        'Enter student design competitions',
      ],
    },
    {
      id: 'gd-4',
      stage: 'experience',
      title: 'Design Internship',
      subtitle: 'Agency or in-house',
      startAge: 20,
      endAge: 21,
      isMilestone: false,
      icon: 'Briefcase',
      description:
        'Work at a design agency or in-house team, learning client communication, briefs, and production workflows.',
      microActions: [
        'Apply to agencies and studios accepting interns',
        'Prepare a tailored portfolio for each application',
      ],
    },
    {
      id: 'gd-5',
      stage: 'experience',
      title: 'Freelance Projects',
      subtitle: 'Build your reputation',
      startAge: 21,
      endAge: 22,
      isMilestone: true,
      icon: 'Lightbulb',
      description:
        'Take on freelance design work to build your client list, learn to manage projects independently, and develop your personal brand.',
      microActions: [
        'Create a professional rate card',
        'Network at creative industry events',
        'Build testimonials from satisfied clients',
      ],
    },
    {
      id: 'gd-6',
      stage: 'career',
      title: 'Junior Graphic Designer',
      subtitle: 'Full-time creative role',
      startAge: 22,
      endAge: 24,
      isMilestone: false,
      icon: 'PenTool',
      description:
        'Join a creative team as a junior designer, working on campaigns, brand assets, and multi-channel design projects.',
      microActions: [
        'Develop expertise in motion graphics or UI design',
        'Build relationships with art directors and creatives',
      ],
    },
    {
      id: 'gd-7',
      stage: 'career',
      title: 'Senior Graphic Designer',
      subtitle: 'Creative leadership',
      startAge: 24,
      isMilestone: true,
      icon: 'Target',
      description:
        'Lead creative projects, mentor junior designers, and shape visual identity at a strategic level.',
      microActions: [
        'Build a senior portfolio with case studies',
        'Consider specialising in branding, packaging, or digital',
      ],
    },
  ],
};
