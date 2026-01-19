/**
 * Demo Data Seeding Script for Sprout
 *
 * Creates realistic demo data for development and testing.
 *
 * SAFETY CONTROLS:
 * - Only runs when ENABLE_DEMO_DATA=true AND NODE_ENV !== 'production'
 * - All demo data uses @demo.sprout.local email domain for identification
 * - DEMO_DATA_RESET=true will delete all demo data before reseeding
 * - Idempotent: running multiple times won't create duplicates
 *
 * RUN: npm run db:seed-demo
 * RESET: DEMO_DATA_RESET=true npm run db:seed-demo
 */

import {
  PrismaClient,
  JobCategory,
  PayType,
  JobStatus,
  ApplicationStatus,
  UserRole,
  AccountStatus,
  AgeBracket,
  SkillCategory,
  JobCompletionOutcome,
  SupervisionLevel,
  ResponsibilityLevel,
  TrustSignalType,
  TrustSignalSource,
  ConversationStatus,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

// Use direct connection for seeding
process.env.DATABASE_URL = process.env.DIRECT_URL || process.env.DATABASE_URL;

const prisma = new PrismaClient();

// ============================================
// SAFETY CHECKS
// ============================================

const DEMO_EMAIL_DOMAIN = '@demo.sprout.local';
const ENABLE_DEMO_DATA = process.env.ENABLE_DEMO_DATA === 'true';
const DEMO_DATA_RESET = process.env.DEMO_DATA_RESET === 'true';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

function checkSafetyControls() {
  if (IS_PRODUCTION) {
    console.error('❌ FATAL: Cannot seed demo data in production environment!');
    process.exit(1);
  }

  if (!ENABLE_DEMO_DATA) {
    console.log('ℹ️  Demo data seeding is disabled.');
    console.log('   Set ENABLE_DEMO_DATA=true in your .env to enable.');
    process.exit(0);
  }

  console.log('✅ Safety checks passed');
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Demo data enabled: ${ENABLE_DEMO_DATA}`);
  console.log(`   Reset mode: ${DEMO_DATA_RESET}`);
}

// ============================================
// DEMO USER DEFINITIONS
// ============================================

interface DemoTeen {
  email: string;
  displayName: string;
  avatarId: string;
  bio: string;
  city: string;
  careerAspiration: string;
  interests: string[];
  skillTags: string[];
  ageBracket: AgeBracket;
}

interface DemoEmployer {
  email: string;
  companyName: string;
  bio: string;
}

const demoTeens: DemoTeen[] = [
  {
    email: `emma.berg${DEMO_EMAIL_DOMAIN}`,
    displayName: 'Emma B.',
    avatarId: 'kawaii-star',
    bio: 'Responsible 17-year-old who loves helping out. Good with kids and pets!',
    city: 'Oslo',
    careerAspiration: 'Lawyer',
    interests: ['reading', 'debate', 'writing'],
    skillTags: ['reliable', 'punctual', 'good communicator'],
    ageBracket: AgeBracket.SIXTEEN_SEVENTEEN,
  },
  {
    email: `noah.hansen${DEMO_EMAIL_DOMAIN}`,
    displayName: 'Noah H.',
    avatarId: 'kawaii-cloud',
    bio: 'Tech enthusiast and problem solver. Studying programming in my spare time.',
    city: 'Bergen',
    careerAspiration: 'Software Developer',
    interests: ['coding', 'gaming', 'technology'],
    skillTags: ['tech-savvy', 'patient', 'detail-oriented'],
    ageBracket: AgeBracket.SIXTEEN_SEVENTEEN,
  },
  {
    email: `sofia.larsen${DEMO_EMAIL_DOMAIN}`,
    displayName: 'Sofia L.',
    avatarId: 'kawaii-heart',
    bio: 'Caring and patient. Want to work in healthcare someday.',
    city: 'Trondheim',
    careerAspiration: 'Nurse',
    interests: ['volunteering', 'first-aid', 'helping others'],
    skillTags: ['empathetic', 'calm', 'first-aid trained'],
    ageBracket: AgeBracket.EIGHTEEN_TWENTY,
  },
  {
    email: `oliver.johansen${DEMO_EMAIL_DOMAIN}`,
    displayName: 'Oliver J.',
    avatarId: 'kawaii-bolt',
    bio: 'Hardworking and eager to learn. Interested in hands-on work.',
    city: 'Stavanger',
    careerAspiration: 'Electrician',
    interests: ['DIY', 'sports', 'fixing things'],
    skillTags: ['handy', 'strong', 'quick learner'],
    ageBracket: AgeBracket.SIXTEEN_SEVENTEEN,
  },
  {
    email: `mia.olsen${DEMO_EMAIL_DOMAIN}`,
    displayName: 'Mia O.',
    avatarId: 'kawaii-flower',
    bio: 'Creative and organised. Love design and visual arts.',
    city: 'Oslo',
    careerAspiration: 'UX Designer',
    interests: ['art', 'design', 'photography'],
    skillTags: ['creative', 'organised', 'eye for detail'],
    ageBracket: AgeBracket.EIGHTEEN_TWENTY,
  },
  {
    email: `lucas.nilsen${DEMO_EMAIL_DOMAIN}`,
    displayName: 'Lucas N.',
    avatarId: 'kawaii-sun',
    bio: 'Friendly and outgoing. Great with people of all ages.',
    city: 'Drammen',
    careerAspiration: 'Teacher',
    interests: ['sports', 'tutoring', 'music'],
    skillTags: ['patient', 'energetic', 'good with kids'],
    ageBracket: AgeBracket.SIXTEEN_SEVENTEEN,
  },
  {
    email: `ella.pedersen${DEMO_EMAIL_DOMAIN}`,
    displayName: 'Ella P.',
    avatarId: 'kawaii-moon',
    bio: 'Quiet but reliable. I always finish what I start.',
    city: 'Fredrikstad',
    careerAspiration: 'Accountant',
    interests: ['math', 'puzzles', 'organizing'],
    skillTags: ['detail-oriented', 'reliable', 'punctual'],
    ageBracket: AgeBracket.SIXTEEN_SEVENTEEN,
  },
  {
    email: `william.kristiansen${DEMO_EMAIL_DOMAIN}`,
    displayName: 'William K.',
    avatarId: 'kawaii-robot',
    bio: 'Active and outdoorsy. Love being outside rain or shine.',
    city: 'Sandnes',
    careerAspiration: 'Network Engineer',
    interests: ['hiking', 'cycling', 'technology'],
    skillTags: ['fit', 'reliable', 'tech-savvy'],
    ageBracket: AgeBracket.EIGHTEEN_TWENTY,
  },
];

const demoEmployers: DemoEmployer[] = [
  {
    email: `kari.nordmann${DEMO_EMAIL_DOMAIN}`,
    companyName: 'Kari Nordmann',
    bio: 'Busy mom of 3 looking for reliable help with childcare and household tasks.',
  },
  {
    email: `erik.svendsen${DEMO_EMAIL_DOMAIN}`,
    companyName: 'Erik Svendsen',
    bio: 'Elderly gentleman who needs occasional help with garden and errands.',
  },
  {
    email: `marie.haug${DEMO_EMAIL_DOMAIN}`,
    companyName: 'Marie Haug',
    bio: 'Work-from-home professional looking for help with dog walking and light cleaning.',
  },
  {
    email: `torstein.berg${DEMO_EMAIL_DOMAIN}`,
    companyName: 'Berg Family',
    bio: 'Family with two kids and a dog. Always need help during busy weeks!',
  },
];

// ============================================
// DEMO JOB DEFINITIONS
// ============================================

interface DemoJob {
  title: string;
  category: JobCategory;
  description: string;
  payType: PayType;
  payAmount: number;
  location: string;
  duration: number;
  status: JobStatus;
  requiredTraits: string[];
}

const demoJobs: DemoJob[] = [
  {
    title: 'Afternoon babysitting (2 kids, ages 5 & 7)',
    category: JobCategory.BABYSITTING,
    description: 'Looking for a responsible sitter for Tuesday afternoons, 3-6pm. Light snacks and homework help.',
    payType: PayType.HOURLY,
    payAmount: 150,
    location: 'Majorstuen, Oslo',
    duration: 180,
    status: JobStatus.POSTED,
    requiredTraits: ['patient', 'responsible'],
  },
  {
    title: 'Dog walking - Golden Retriever',
    category: JobCategory.DOG_WALKING,
    description: 'Daily walks needed for my friendly 3-year-old Golden Retriever. 30-45 min walks.',
    payType: PayType.FIXED,
    payAmount: 100,
    location: 'Frogner, Oslo',
    duration: 45,
    status: JobStatus.POSTED,
    requiredTraits: ['loves dogs', 'reliable'],
  },
  {
    title: 'Help clearing snow from driveway',
    category: JobCategory.SNOW_CLEARING,
    description: 'Need help shoveling snow from driveway and walkway after heavy snowfall.',
    payType: PayType.FIXED,
    payAmount: 300,
    location: 'Røa, Oslo',
    duration: 90,
    status: JobStatus.POSTED,
    requiredTraits: ['strong', 'punctual'],
  },
  {
    title: 'Weekly house cleaning',
    category: JobCategory.CLEANING,
    description: 'Looking for someone to help with light cleaning every Saturday. Vacuuming, dusting, mopping.',
    payType: PayType.HOURLY,
    payAmount: 180,
    location: 'Bislett, Oslo',
    duration: 120,
    status: JobStatus.POSTED,
    requiredTraits: ['thorough', 'reliable'],
  },
  {
    title: 'Help with garden weeding',
    category: JobCategory.OTHER,
    description: 'Need help pulling weeds and tidying up the garden before spring.',
    payType: PayType.FIXED,
    payAmount: 250,
    location: 'Sandvika',
    duration: 120,
    status: JobStatus.POSTED,
    requiredTraits: ['hardworking'],
  },
  {
    title: 'Tech help for grandparents',
    category: JobCategory.TECH_HELP,
    description: 'Help my parents set up their new iPad and show them how to video call.',
    payType: PayType.FIXED,
    payAmount: 200,
    location: 'Grünerløkka, Oslo',
    duration: 60,
    status: JobStatus.POSTED,
    requiredTraits: ['patient', 'tech-savvy'],
  },
  {
    title: 'Grocery shopping and errands',
    category: JobCategory.ERRANDS,
    description: 'Weekly grocery run and picking up dry cleaning. Must have own transport or use public transit.',
    payType: PayType.FIXED,
    payAmount: 150,
    location: 'Lørenskog',
    duration: 90,
    status: JobStatus.POSTED,
    requiredTraits: ['reliable', 'organised'],
  },
  {
    title: 'Moving boxes to storage',
    category: JobCategory.DIY_HELP,
    description: 'Need help carrying 15-20 boxes from apartment to car. 3rd floor, no elevator.',
    payType: PayType.FIXED,
    payAmount: 400,
    location: 'Sagene, Oslo',
    duration: 120,
    status: JobStatus.POSTED,
    requiredTraits: ['strong', 'careful'],
  },
  {
    title: 'Evening babysitting (1 toddler)',
    category: JobCategory.BABYSITTING,
    description: 'Date night sitter needed for our 2-year-old. 6pm-10pm, already in pajamas by 7pm.',
    payType: PayType.FIXED,
    payAmount: 500,
    location: 'Kolsås',
    duration: 240,
    status: JobStatus.COMPLETED,
    requiredTraits: ['calm', 'experienced with toddlers'],
  },
  {
    title: 'Dog sitting for weekend',
    category: JobCategory.DOG_WALKING,
    description: 'Need someone to stay with our dog while we visit family. Fri evening to Sun afternoon.',
    payType: PayType.FIXED,
    payAmount: 800,
    location: 'Asker',
    duration: 2880,
    status: JobStatus.COMPLETED,
    requiredTraits: ['loves animals', 'responsible'],
  },
  {
    title: 'Spring cleaning help',
    category: JobCategory.CLEANING,
    description: 'Big spring clean! Windows, deep clean kitchen and bathrooms.',
    payType: PayType.HOURLY,
    payAmount: 200,
    location: 'Nesodden',
    duration: 300,
    status: JobStatus.COMPLETED,
    requiredTraits: ['thorough', 'hardworking'],
  },
  {
    title: 'Computer troubleshooting',
    category: JobCategory.TECH_HELP,
    description: 'My laptop is running slow. Need help cleaning it up and installing updates.',
    payType: PayType.FIXED,
    payAmount: 250,
    location: 'Bærum',
    duration: 90,
    status: JobStatus.COMPLETED,
    requiredTraits: ['tech-savvy', 'patient'],
  },
];

// ============================================
// DEMO MESSAGE CONVERSATIONS
// ============================================

interface DemoMessage {
  senderIsEmployer: boolean;
  content: string;
  hoursAgo: number;
}

interface DemoConversation {
  employerIndex: number;
  teenIndex: number;
  jobIndex: number;
  messages: DemoMessage[];
}

const demoConversations: DemoConversation[] = [
  {
    employerIndex: 0, // Kari
    teenIndex: 0, // Emma
    jobIndex: 0, // Babysitting
    messages: [
      { senderIsEmployer: true, content: 'Hi Emma! I saw your profile and think you would be great for the babysitting job. Are you available Tuesday?', hoursAgo: 72 },
      { senderIsEmployer: false, content: 'Hi Kari! Yes, I am available on Tuesday afternoon. What time works best?', hoursAgo: 70 },
      { senderIsEmployer: true, content: 'Perfect! Can you come at 2:45pm? The kids get home from school at 3pm.', hoursAgo: 68 },
      { senderIsEmployer: false, content: 'Yes, 2:45 works great! Do they have any allergies I should know about?', hoursAgo: 66 },
      { senderIsEmployer: true, content: 'No allergies. The older one likes to do homework first, the younger one prefers to play outside. Snacks are in the kitchen.', hoursAgo: 65 },
      { senderIsEmployer: false, content: 'Got it! I will see you Tuesday at 2:45pm.', hoursAgo: 64 },
      { senderIsEmployer: true, content: 'Great! The address is Majorstuhaugen 15. Ring the doorbell marked "Nordmann".', hoursAgo: 63 },
    ],
  },
  {
    employerIndex: 2, // Marie
    teenIndex: 1, // Noah
    jobIndex: 5, // Tech help
    messages: [
      { senderIsEmployer: true, content: 'Hi Noah! I need help setting up an iPad for my parents. Are you good with Apple devices?', hoursAgo: 48 },
      { senderIsEmployer: false, content: 'Hi Marie! Yes, I am comfortable with iPads. I can help with setup, apps, and showing them how to use it.', hoursAgo: 46 },
      { senderIsEmployer: true, content: 'Perfect! They mainly want to video call with family. Can you come Saturday morning?', hoursAgo: 44 },
      { senderIsEmployer: false, content: 'Saturday morning works. What time? And will your parents be there so I can show them directly?', hoursAgo: 42 },
      { senderIsEmployer: true, content: 'Yes, they will be there. How about 10am?', hoursAgo: 40 },
      { senderIsEmployer: false, content: 'Great, see you at 10am Saturday!', hoursAgo: 38 },
    ],
  },
  {
    employerIndex: 1, // Erik
    teenIndex: 3, // Oliver
    jobIndex: 4, // Garden weeding
    messages: [
      { senderIsEmployer: true, content: 'Hello Oliver, I saw you are interested in DIY work. Would you be able to help with some garden work?', hoursAgo: 120 },
      { senderIsEmployer: false, content: 'Hi Erik! Yes, I would be happy to help. What kind of garden work do you need done?', hoursAgo: 118 },
      { senderIsEmployer: true, content: 'Mostly weeding and tidying up. The garden has gotten a bit wild over winter.', hoursAgo: 116 },
      { senderIsEmployer: false, content: 'No problem, I can do that. When would you like me to come?', hoursAgo: 114 },
      { senderIsEmployer: true, content: 'Would this Saturday work? Around 1pm?', hoursAgo: 112 },
      { senderIsEmployer: false, content: 'Saturday at 1pm works perfectly!', hoursAgo: 110 },
      { senderIsEmployer: true, content: 'Wonderful. I will have gloves and tools ready for you.', hoursAgo: 108 },
      { senderIsEmployer: false, content: 'Thanks! See you then.', hoursAgo: 106 },
    ],
  },
  {
    employerIndex: 3, // Berg Family
    teenIndex: 5, // Lucas
    jobIndex: 8, // Evening babysitting (completed)
    messages: [
      { senderIsEmployer: true, content: 'Hi Lucas! We need a sitter for Friday evening. Our usual sitter is unavailable.', hoursAgo: 200 },
      { senderIsEmployer: false, content: 'Hi! I am available Friday evening. What time do you need me?', hoursAgo: 198 },
      { senderIsEmployer: true, content: 'From 6pm to about 10pm. Our little one goes to bed at 7:30pm.', hoursAgo: 196 },
      { senderIsEmployer: false, content: 'That works for me. Any special bedtime routine I should know?', hoursAgo: 194 },
      { senderIsEmployer: true, content: 'She likes one story before bed, then lights out. She usually falls asleep quickly.', hoursAgo: 192 },
      { senderIsEmployer: false, content: 'Perfect, I will be there at 6pm on Friday!', hoursAgo: 190 },
      { senderIsEmployer: true, content: 'Thanks Lucas! You were wonderful, she fell asleep right away. Payment sent via Vipps!', hoursAgo: 168 },
      { senderIsEmployer: false, content: 'Thank you! She was a joy. Let me know if you need me again!', hoursAgo: 166 },
    ],
  },
  {
    employerIndex: 0, // Kari
    teenIndex: 2, // Sofia
    jobIndex: 1, // Dog walking
    messages: [
      { senderIsEmployer: true, content: 'Hi Sofia! I also need a dog walker for my Golden Retriever. Would you be interested?', hoursAgo: 24 },
      { senderIsEmployer: false, content: 'Hi Kari! I love dogs. What is the walking schedule?', hoursAgo: 22 },
      { senderIsEmployer: true, content: 'Ideally once a day around noon, 30-45 minutes in Frogner Park.', hoursAgo: 20 },
      { senderIsEmployer: false, content: 'That works well with my schedule. Is your dog friendly with other dogs?', hoursAgo: 18 },
      { senderIsEmployer: true, content: 'Very friendly! His name is Max and he loves everyone. Can you start tomorrow?', hoursAgo: 16 },
      { senderIsEmployer: false, content: 'Yes! I will come by at noon tomorrow to meet Max and get the keys.', hoursAgo: 14 },
    ],
  },
  {
    employerIndex: 2, // Marie
    teenIndex: 7, // William
    jobIndex: 11, // Computer troubleshooting (completed)
    messages: [
      { senderIsEmployer: true, content: 'Hi William! My laptop has been really slow lately. Can you help?', hoursAgo: 240 },
      { senderIsEmployer: false, content: 'Hi Marie! Yes, I can take a look. What kind of laptop is it?', hoursAgo: 238 },
      { senderIsEmployer: true, content: 'It is a Windows laptop, about 3 years old. It takes forever to start up.', hoursAgo: 236 },
      { senderIsEmployer: false, content: 'Sounds like it might need some cleanup and updates. I can help with that.', hoursAgo: 234 },
      { senderIsEmployer: true, content: 'Great! When can you come?', hoursAgo: 232 },
      { senderIsEmployer: false, content: 'How about Thursday evening around 5pm?', hoursAgo: 230 },
      { senderIsEmployer: true, content: 'Perfect, see you then!', hoursAgo: 228 },
      { senderIsEmployer: false, content: 'All done! Removed some old programs and updated everything. Should be much faster now.', hoursAgo: 200 },
      { senderIsEmployer: true, content: 'Wow, it is like a new computer! Thank you so much! Payment sent.', hoursAgo: 198 },
    ],
  },
];

// ============================================
// VAULT ITEMS FOR DEMO TEENS
// ============================================

interface DemoVaultItem {
  teenIndex: number;
  type: string;
  title: string;
  description: string;
  url?: string;
  metadata?: Record<string, unknown>;
}

const demoVaultItems: DemoVaultItem[] = [
  // Emma (Lawyer aspiration)
  { teenIndex: 0, type: 'saved_career', title: 'Lawyer', description: 'Dream career - working in corporate law' },
  { teenIndex: 0, type: 'saved_career', title: 'Judge', description: 'Long-term goal after gaining experience' },
  { teenIndex: 0, type: 'saved_learning', title: 'Introduction to Legal Studies', description: 'Free course on Coursera', url: 'https://coursera.org', metadata: { provider: 'Coursera', duration: '4 weeks' } },
  { teenIndex: 0, type: 'saved_learning', title: 'Critical Thinking Skills', description: 'Essential for legal reasoning', url: 'https://edx.org', metadata: { provider: 'edX', duration: '6 weeks' } },

  // Noah (Software Developer aspiration)
  { teenIndex: 1, type: 'saved_career', title: 'Software Developer', description: 'Building apps and websites' },
  { teenIndex: 1, type: 'saved_career', title: 'Data Scientist', description: 'Interesting alternative path' },
  { teenIndex: 1, type: 'saved_learning', title: 'Python for Beginners', description: 'Free course on Codecademy', url: 'https://codecademy.com', metadata: { provider: 'Codecademy', duration: '8 weeks' } },
  { teenIndex: 1, type: 'saved_learning', title: 'Web Development Basics', description: 'HTML, CSS, JavaScript', url: 'https://freecodecamp.org', metadata: { provider: 'freeCodeCamp', duration: 'Self-paced' } },
  { teenIndex: 1, type: 'saved_learning', title: 'Git and GitHub', description: 'Version control for developers', url: 'https://github.com/skills', metadata: { provider: 'GitHub', duration: '2 hours' } },

  // Sofia (Nurse aspiration)
  { teenIndex: 2, type: 'saved_career', title: 'Nurse', description: 'Helping people heal' },
  { teenIndex: 2, type: 'saved_career', title: 'Paramedic', description: 'Emergency medical care' },
  { teenIndex: 2, type: 'saved_learning', title: 'First Aid Certification', description: 'Red Cross basic first aid', url: 'https://rodekors.no', metadata: { provider: 'Norwegian Red Cross', duration: '8 hours' } },
  { teenIndex: 2, type: 'saved_learning', title: 'Introduction to Healthcare', description: 'Understanding the health system', url: 'https://nav.no/utdanning', metadata: { provider: 'NAV', duration: 'Self-paced' } },

  // Mia (UX Designer aspiration)
  { teenIndex: 4, type: 'saved_career', title: 'UX Designer', description: 'Creating user-friendly designs' },
  { teenIndex: 4, type: 'saved_career', title: 'Graphic Designer', description: 'Visual design work' },
  { teenIndex: 4, type: 'saved_learning', title: 'Design Thinking Fundamentals', description: 'IDEO design course', url: 'https://ideo.com', metadata: { provider: 'IDEO U', duration: '5 weeks' } },
  { teenIndex: 4, type: 'saved_learning', title: 'Figma for Beginners', description: 'Learning design tools', url: 'https://figma.com', metadata: { provider: 'Figma', duration: 'Self-paced' } },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

function getRandomDate(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(Math.floor(Math.random() * 12) + 8); // 8am-8pm
  date.setMinutes(Math.floor(Math.random() * 60));
  return date;
}

function isDemoEmail(email: string): boolean {
  return email.endsWith(DEMO_EMAIL_DOMAIN);
}

// ============================================
// CLEANUP FUNCTION
// ============================================

async function cleanupDemoData() {
  console.log('🧹 Cleaning up existing demo data...');

  // Delete in order to respect foreign key constraints
  // Children first, then parents

  // 1. Delete messages in demo conversations
  const demoConversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { participant1: { email: { endsWith: DEMO_EMAIL_DOMAIN } } },
        { participant2: { email: { endsWith: DEMO_EMAIL_DOMAIN } } },
      ],
    },
    select: { id: true },
  });
  const conversationIds = demoConversations.map(c => c.id);

  if (conversationIds.length > 0) {
    await prisma.message.deleteMany({ where: { conversationId: { in: conversationIds } } });
    await prisma.conversation.deleteMany({ where: { id: { in: conversationIds } } });
  }

  // 2. Delete structured feedback and job completions for demo jobs
  const demoJobs = await prisma.microJob.findMany({
    where: { postedBy: { email: { endsWith: DEMO_EMAIL_DOMAIN } } },
    select: { id: true },
  });
  const jobIds = demoJobs.map(j => j.id);

  if (jobIds.length > 0) {
    const completions = await prisma.jobCompletion.findMany({
      where: { jobId: { in: jobIds } },
      select: { id: true },
    });
    const completionIds = completions.map(c => c.id);

    if (completionIds.length > 0) {
      await prisma.structuredFeedback.deleteMany({ where: { jobCompletionId: { in: completionIds } } });
    }
    await prisma.jobCompletion.deleteMany({ where: { jobId: { in: jobIds } } });
    await prisma.application.deleteMany({ where: { jobId: { in: jobIds } } });
    await prisma.vaultItem.deleteMany({ where: { jobId: { in: jobIds } } });
    await prisma.microJob.deleteMany({ where: { id: { in: jobIds } } });
  }

  // 3. Delete vault items for demo users
  await prisma.vaultItem.deleteMany({
    where: { user: { email: { endsWith: DEMO_EMAIL_DOMAIN } } },
  });

  // 4. Delete trust signals for demo users
  await prisma.trustSignal.deleteMany({
    where: { user: { email: { endsWith: DEMO_EMAIL_DOMAIN } } },
  });

  // 5. Delete skill signals for demo users
  await prisma.userSkillSignal.deleteMany({
    where: { user: { email: { endsWith: DEMO_EMAIL_DOMAIN } } },
  });

  // 6. Delete notifications for demo users
  await prisma.notification.deleteMany({
    where: { user: { email: { endsWith: DEMO_EMAIL_DOMAIN } } },
  });

  // 7. Delete profiles
  await prisma.youthProfile.deleteMany({
    where: { user: { email: { endsWith: DEMO_EMAIL_DOMAIN } } },
  });
  await prisma.employerProfile.deleteMany({
    where: { user: { email: { endsWith: DEMO_EMAIL_DOMAIN } } },
  });

  // 8. Delete demo users
  await prisma.user.deleteMany({
    where: { email: { endsWith: DEMO_EMAIL_DOMAIN } },
  });

  console.log('✅ Demo data cleaned up');
}

// ============================================
// SEEDING FUNCTIONS
// ============================================

async function seedDemoUsers() {
  console.log('👤 Seeding demo users...');
  const hashedPassword = await hashPassword('demo123');
  const createdUsers: { teens: Record<string, string>; employers: Record<string, string> } = {
    teens: {},
    employers: {},
  };

  // Seed teen users
  for (const teen of demoTeens) {
    const user = await prisma.user.upsert({
      where: { email: teen.email },
      update: {},
      create: {
        email: teen.email,
        password: hashedPassword,
        role: UserRole.YOUTH,
        ageBracket: teen.ageBracket,
        accountStatus: AccountStatus.ACTIVE,
        emailVerified: new Date(),
        location: teen.city,
      },
    });

    await prisma.youthProfile.upsert({
      where: { userId: user.id },
      update: {
        displayName: teen.displayName,
        avatarId: teen.avatarId,
        bio: teen.bio,
        city: teen.city,
        careerAspiration: teen.careerAspiration,
        interests: teen.interests,
        skillTags: teen.skillTags,
        guardianConsent: true,
        guardianConsentAt: new Date(),
        profileVisibility: true,
      },
      create: {
        userId: user.id,
        displayName: teen.displayName,
        avatarId: teen.avatarId,
        bio: teen.bio,
        city: teen.city,
        careerAspiration: teen.careerAspiration,
        interests: teen.interests,
        skillTags: teen.skillTags,
        guardianConsent: true,
        guardianConsentAt: new Date(),
        profileVisibility: true,
      },
    });

    createdUsers.teens[teen.email] = user.id;
  }

  // Seed employer users
  for (const employer of demoEmployers) {
    const user = await prisma.user.upsert({
      where: { email: employer.email },
      update: {},
      create: {
        email: employer.email,
        password: hashedPassword,
        role: UserRole.EMPLOYER,
        accountStatus: AccountStatus.ACTIVE,
        emailVerified: new Date(),
        isVerifiedAdult: true,
        verifiedAt: new Date(),
      },
    });

    await prisma.employerProfile.upsert({
      where: { userId: user.id },
      update: {
        companyName: employer.companyName,
        bio: employer.bio,
        verified: true,
        ageVerified: true,
        eidVerified: true,
        eidVerifiedAt: new Date(),
      },
      create: {
        userId: user.id,
        companyName: employer.companyName,
        bio: employer.bio,
        verified: true,
        ageVerified: true,
        eidVerified: true,
        eidVerifiedAt: new Date(),
      },
    });

    createdUsers.employers[employer.email] = user.id;
  }

  console.log(`✅ Created ${Object.keys(createdUsers.teens).length} demo teens`);
  console.log(`✅ Created ${Object.keys(createdUsers.employers).length} demo employers`);

  return createdUsers;
}

async function seedDemoJobs(employerIds: Record<string, string>) {
  console.log('💼 Seeding demo jobs...');
  const employerEmails = Object.keys(employerIds);
  const createdJobs: string[] = [];

  for (let i = 0; i < demoJobs.length; i++) {
    const job = demoJobs[i];
    const employerEmail = employerEmails[i % employerEmails.length];
    const employerId = employerIds[employerEmail];

    // Create deterministic job identifier
    const jobKey = `${employerId}-${job.title.slice(0, 30)}`;

    const existingJob = await prisma.microJob.findFirst({
      where: {
        postedById: employerId,
        title: job.title,
      },
    });

    if (existingJob) {
      createdJobs.push(existingJob.id);
      continue;
    }

    const createdJob = await prisma.microJob.create({
      data: {
        title: job.title,
        category: job.category,
        description: job.description,
        payType: job.payType,
        payAmount: job.payAmount,
        location: job.location,
        duration: job.duration,
        status: job.status,
        requiredTraits: job.requiredTraits,
        postedById: employerId,
        createdAt: getRandomDate(Math.floor(Math.random() * 14) + 1),
      },
    });

    createdJobs.push(createdJob.id);
  }

  console.log(`✅ Created/found ${createdJobs.length} demo jobs`);
  return createdJobs;
}

async function seedJobCompletionsAndFeedback(
  teenIds: Record<string, string>,
  employerIds: Record<string, string>,
  jobIds: string[]
) {
  console.log('✅ Seeding job completions and feedback...');
  const teenEmails = Object.keys(teenIds);

  // Seed completions for jobs with COMPLETED status
  const completedJobIndices = demoJobs
    .map((job, index) => (job.status === JobStatus.COMPLETED ? index : -1))
    .filter(index => index !== -1);

  for (const jobIndex of completedJobIndices) {
    const jobId = jobIds[jobIndex];
    const job = await prisma.microJob.findUnique({ where: { id: jobId }, include: { postedBy: true } });
    if (!job) continue;

    // Assign a random teen to the completed job
    const teenIndex = jobIndex % teenEmails.length;
    const teenEmail = teenEmails[teenIndex];
    const teenId = teenIds[teenEmail];

    // Check if completion already exists
    const existingCompletion = await prisma.jobCompletion.findUnique({
      where: { jobId_youthId: { jobId, youthId: teenId } },
    });

    if (existingCompletion) continue;

    // Create job completion
    const completion = await prisma.jobCompletion.create({
      data: {
        jobId,
        youthId: teenId,
        employerId: job.postedById,
        outcome: JobCompletionOutcome.COMPLETED,
        supervision: SupervisionLevel.SUPERVISED,
        hoursWorked: job.duration ? job.duration / 60 : 2,
        completedAt: getRandomDate(Math.floor(Math.random() * 7) + 1),
      },
    });

    // Create structured feedback
    await prisma.structuredFeedback.create({
      data: {
        jobCompletionId: completion.id,
        punctuality: Math.floor(Math.random() * 2) + 4, // 4-5
        communication: Math.floor(Math.random() * 2) + 4,
        quality: Math.floor(Math.random() * 2) + 4,
        respectfulness: 5,
        followedInstructions: Math.floor(Math.random() * 2) + 4,
        wouldRehire: true,
        responsibilityLevel: ResponsibilityLevel.INTERMEDIATE,
        skillsDemonstrated: ['communication', 'reliability', 'punctuality'],
      },
    });

    // Update youth profile stats
    await prisma.youthProfile.update({
      where: { userId: teenId },
      data: {
        completedJobsCount: { increment: 1 },
        averageRating: 4.5 + Math.random() * 0.5,
        reliabilityScore: Math.min(100, 70 + Math.floor(Math.random() * 30)),
      },
    });
  }

  console.log(`✅ Created completions for ${completedJobIndices.length} jobs`);
}

async function seedSkillSignals(teenIds: Record<string, string>) {
  console.log('🎯 Seeding skill signals...');

  // Get skill IDs
  const skills = await prisma.skill.findMany();
  const skillMap = new Map(skills.map(s => [s.slug, s.id]));

  // Core skills everyone should have some signals for
  const coreSkills = ['communication', 'reliability', 'punctuality', 'time-management', 'teamwork'];

  // Career-specific skills
  const careerSkills: Record<string, string[]> = {
    'Lawyer': ['communication', 'problem-solving', 'attention-to-detail', 'professionalism'],
    'Software Developer': ['troubleshooting', 'problem-solving', 'tech-help-basic', 'attention-to-detail'],
    'Nurse': ['patience', 'empathy', 'first-aid', 'communication'],
    'Electrician': ['problem-solving', 'safety-awareness', 'attention-to-detail', 'following-instructions'],
    'UX Designer': ['attention-to-detail', 'communication', 'problem-solving', 'adaptability'],
    'Teacher': ['patience', 'communication', 'empathy', 'adaptability'],
    'Accountant': ['attention-to-detail', 'time-management', 'reliability', 'professionalism'],
    'Network Engineer': ['troubleshooting', 'tech-help-basic', 'problem-solving', 'communication'],
  };

  for (const [email, userId] of Object.entries(teenIds)) {
    const teen = demoTeens.find(t => t.email === email);
    if (!teen) continue;

    const careerSpecificSkills = careerSkills[teen.careerAspiration] || [];
    const allSkillsForTeen = Array.from(new Set([...coreSkills, ...careerSpecificSkills]));

    for (const skillSlug of allSkillsForTeen) {
      const skillId = skillMap.get(skillSlug);
      if (!skillId) continue;

      // Check if signal already exists
      const existingSignal = await prisma.userSkillSignal.findFirst({
        where: { userId, skillId },
      });
      if (existingSignal) continue;

      const isCareerSkill = careerSpecificSkills.includes(skillSlug);
      const strength = isCareerSkill
        ? Math.floor(Math.random() * 30) + 40 // 40-70 for career skills
        : Math.floor(Math.random() * 40) + 30; // 30-70 for core skills

      await prisma.userSkillSignal.create({
        data: {
          userId,
          skillId,
          source: 'job_completed',
          strength,
          evidence: `Demonstrated through completed jobs`,
        },
      });
    }
  }

  console.log('✅ Seeded skill signals for demo teens');
}

async function seedTrustSignals(teenIds: Record<string, string>) {
  console.log('🛡️ Seeding trust signals...');

  const trustSignalTypes = [
    TrustSignalType.ON_TIME,
    TrustSignalType.GOOD_COMMS,
    TrustSignalType.POSITIVE_TREND,
  ];

  for (const [email, userId] of Object.entries(teenIds)) {
    // Give each teen 1-3 trust signals
    const numSignals = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < numSignals; i++) {
      const signalType = trustSignalTypes[i % trustSignalTypes.length];

      const existingSignal = await prisma.trustSignal.findFirst({
        where: { userId, type: signalType },
      });
      if (existingSignal) continue;

      await prisma.trustSignal.create({
        data: {
          userId,
          type: signalType,
          sourceType: TrustSignalSource.JOB_COMPLETION,
          weight: Math.floor(Math.random() * 3) + 1,
        },
      });
    }
  }

  console.log('✅ Seeded trust signals for demo teens');
}

async function seedVaultItems(teenIds: Record<string, string>) {
  console.log('📦 Seeding vault items...');
  const teenEmails = Object.keys(teenIds);

  for (const item of demoVaultItems) {
    const teenEmail = teenEmails[item.teenIndex];
    if (!teenEmail) continue;

    const userId = teenIds[teenEmail];

    // Check if similar vault item exists
    const existingItem = await prisma.vaultItem.findFirst({
      where: {
        userId,
        type: item.type,
        title: item.title,
      },
    });
    if (existingItem) continue;

    await prisma.vaultItem.create({
      data: {
        userId,
        type: item.type,
        title: item.title,
        description: item.description,
        url: item.url,
        metadata: item.metadata as Record<string, string> | undefined,
        isPrivate: true,
      },
    });
  }

  console.log(`✅ Seeded ${demoVaultItems.length} vault items`);
}

async function seedConversationsAndMessages(
  teenIds: Record<string, string>,
  employerIds: Record<string, string>,
  jobIds: string[]
) {
  console.log('💬 Seeding conversations and messages...');
  const teenEmails = Object.keys(teenIds);
  const employerEmails = Object.keys(employerIds);

  for (const convo of demoConversations) {
    const employerEmail = employerEmails[convo.employerIndex];
    const teenEmail = teenEmails[convo.teenIndex];
    const jobId = jobIds[convo.jobIndex];

    if (!employerEmail || !teenEmail || !jobId) continue;

    const employerId = employerIds[employerEmail];
    const teenId = teenIds[teenEmail];

    // Normalize participant order (smaller ID first)
    const [participant1Id, participant2Id] = [employerId, teenId].sort();

    // Check for existing conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        participant1Id,
        participant2Id,
        jobId,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participant1Id,
          participant2Id,
          jobId,
          status: ConversationStatus.ACTIVE,
          lastMessageAt: new Date(),
        },
      });
    }

    // Add messages
    for (const msg of convo.messages) {
      const senderId = msg.senderIsEmployer ? employerId : teenId;
      const messageDate = new Date();
      messageDate.setHours(messageDate.getHours() - msg.hoursAgo);

      // Check if similar message exists (by content and approximate time)
      const existingMessage = await prisma.message.findFirst({
        where: {
          conversationId: conversation.id,
          senderId,
          content: msg.content,
        },
      });

      if (!existingMessage) {
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            senderId,
            content: msg.content,
            read: true,
            createdAt: messageDate,
          },
        });
      }
    }

    // Update last message time
    const lastMsg = convo.messages[convo.messages.length - 1];
    const lastMessageDate = new Date();
    lastMessageDate.setHours(lastMessageDate.getHours() - lastMsg.hoursAgo);

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: lastMessageDate },
    });
  }

  console.log(`✅ Seeded ${demoConversations.length} conversations`);
}

// ============================================
// MAIN FUNCTION
// ============================================

async function main() {
  console.log('');
  console.log('🌱 Sprout Demo Data Seeder');
  console.log('==========================');
  console.log('');

  // Safety checks
  checkSafetyControls();

  // Reset if requested
  if (DEMO_DATA_RESET) {
    await cleanupDemoData();
  }

  try {
    // Seed in order
    const { teens: teenIds, employers: employerIds } = await seedDemoUsers();
    const jobIds = await seedDemoJobs(employerIds);
    await seedJobCompletionsAndFeedback(teenIds, employerIds, jobIds);
    await seedSkillSignals(teenIds);
    await seedTrustSignals(teenIds);
    await seedVaultItems(teenIds);
    await seedConversationsAndMessages(teenIds, employerIds, jobIds);

    console.log('');
    console.log('🎉 Demo data seeding complete!');
    console.log('');
    console.log('📝 Demo User Credentials:');
    console.log('   Password for all demo users: demo123');
    console.log('');
    console.log('   Teens:');
    for (const email of Object.keys(teenIds)) {
      console.log(`   - ${email}`);
    }
    console.log('');
    console.log('   Employers:');
    for (const email of Object.keys(employerIds)) {
      console.log(`   - ${email}`);
    }
    console.log('');
    console.log('🔄 To reset demo data: DEMO_DATA_RESET=true npm run db:seed-demo');
    console.log('');

  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
