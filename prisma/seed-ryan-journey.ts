/**
 * Journey Data Seed for Ryan Mudie
 *
 * Creates comprehensive, realistic My Journey data for testing:
 * - Jobs (completed, in-progress, cancelled)
 * - Reflections across all context types
 * - Saved items (library)
 * - Shadow requests
 * - Timeline events
 * - Journey summary aggregation
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
  YouthAgeBand,
  JobCompletionOutcome,
  SupervisionLevel,
  SavedItemType,
  ReflectionContextType,
  TimelineEventType,
  ShadowRequestStatus,
  ShadowFormat,
  ShadowLearningGoal,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

process.env.DATABASE_URL = process.env.DIRECT_URL || process.env.DATABASE_URL;

const prisma = new PrismaClient();

const TARGET_EMAIL = 'ryanmudie1982@gmail.com';

// ============================================
// DATE HELPERS
// ============================================

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function hoursAgo(hours: number): Date {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║       JOURNEY DATA SEED FOR RYAN MUDIE                   ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');

  // ==========================================
  // STEP 1: Find or Create User
  // ==========================================
  console.log('📍 Step 1: Locating/creating user...');

  let user = await prisma.user.findUnique({
    where: { email: TARGET_EMAIL },
    include: { youthProfile: true },
  });

  if (!user) {
    console.log('   Creating new youth account...');
    const hashedPassword = await bcrypt.hash('Test1234!', 10);

    user = await prisma.user.create({
      data: {
        email: TARGET_EMAIL,
        password: hashedPassword,
        role: 'YOUTH',
        dateOfBirth: new Date('2006-03-15'), // 18 years old
        ageBracket: 'EIGHTEEN_TWENTY',
        youthAgeBand: 'EIGHTEEN_TWENTY',
        accountStatus: 'ACTIVE',
        location: 'Oslo',
        youthProfile: {
          create: {
            displayName: 'Ryan M.',
            avatarId: 'kawaii-star',
            bio: 'Hardworking student interested in technology and design. Looking for opportunities to learn and grow.',
            city: 'Oslo',
            careerAspiration: 'UX Designer',
            interests: ['technology', 'design', 'gaming', 'music'],
            skillTags: ['reliable', 'creative', 'tech-savvy', 'detail-oriented'],
            profileVisibility: true,
            journeyState: 'CONTINUOUS_GROWTH',
            journeyCompletedSteps: [
              'BASELINE_PROFILE',
              'FIRST_JOB_ACQUIRED',
              'MULTIPLE_JOB_EXPERIENCE',
              'CAPABILITY_REFLECTION',
              'CAREER_DISCOVERY',
              'ROLE_DEEP_DIVE',
              'CAREER_SHADOW_REQUEST',
              'INDUSTRY_INSIGHTS',
              'PLAN_BUILD',
            ],
          },
        },
      },
      include: { youthProfile: true },
    });
    console.log(`   ✅ Created user: ${user.id}`);
  } else {
    console.log(`   ✅ Found existing user: ${user.id}`);
  }

  const userId = user.id;
  const profileId = user.youthProfile!.id;

  // ==========================================
  // STEP 2: Clean existing journey data
  // ==========================================
  console.log('🧹 Step 2: Cleaning existing journey data...');

  await prisma.timelineEvent.deleteMany({ where: { userId } });
  await prisma.journeyReflection.deleteMany({ where: { profileId } });
  await prisma.savedItem.deleteMany({ where: { profileId } });
  await prisma.journeyNote.deleteMany({ where: { profileId } });
  await prisma.shadowRequest.deleteMany({ where: { youthId: userId } });
  await prisma.earning.deleteMany({ where: { youthId: userId } });
  await prisma.jobCompletion.deleteMany({ where: { youthId: userId } });
  await prisma.application.deleteMany({ where: { youthId: userId } });
  // Don't delete jobs - they're owned by employers

  console.log('   ✅ Cleaned existing data');

  // ==========================================
  // STEP 3: Create/Find an employer for jobs
  // ==========================================
  console.log('🏢 Step 3: Setting up employer for jobs...');

  let employer = await prisma.user.findFirst({
    where: { email: 'employer1@scale.sprout.test' },
  });

  if (!employer) {
    const hashedPassword = await bcrypt.hash('Test1234!', 10);
    employer = await prisma.user.create({
      data: {
        email: 'journey-employer@test.local',
        password: hashedPassword,
        role: 'EMPLOYER',
        dateOfBirth: new Date('1985-06-20'),
        accountStatus: 'ACTIVE',
        isVerifiedAdult: true,
        employerProfile: {
          create: {
            companyName: 'Local Services Oslo',
            bio: 'Community services provider',
            verified: true,
            eidVerified: true,
          },
        },
      },
    });
  }
  console.log(`   ✅ Employer ready: ${employer.id}`);

  // ==========================================
  // STEP 4: Create Jobs and Applications
  // ==========================================
  console.log('💼 Step 4: Creating jobs and completions...');

  const jobsData = [
    // 5 COMPLETED jobs
    { title: 'Help with garden cleanup', category: 'DIY_HELP' as JobCategory, pay: 250, status: 'COMPLETED' as JobStatus, daysAgo: 150, outcome: 'COMPLETED' },
    { title: 'Dog walking for weekend', category: 'DOG_WALKING' as JobCategory, pay: 180, status: 'COMPLETED' as JobStatus, daysAgo: 120, outcome: 'COMPLETED' },
    { title: 'Tech support for elderly neighbor', category: 'TECH_HELP' as JobCategory, pay: 200, status: 'COMPLETED' as JobStatus, daysAgo: 90, outcome: 'COMPLETED' },
    { title: 'Snow shoveling driveway', category: 'SNOW_CLEARING' as JobCategory, pay: 300, status: 'COMPLETED' as JobStatus, daysAgo: 60, outcome: 'COMPLETED' },
    { title: 'Apartment cleaning assistance', category: 'CLEANING' as JobCategory, pay: 220, status: 'COMPLETED' as JobStatus, daysAgo: 30, outcome: 'COMPLETED' },
    // 2 IN_PROGRESS jobs
    { title: 'Weekly dog walking', category: 'DOG_WALKING' as JobCategory, pay: 150, status: 'IN_PROGRESS' as JobStatus, daysAgo: 7, outcome: null },
    { title: 'Grocery shopping assistance', category: 'ERRANDS' as JobCategory, pay: 120, status: 'ASSIGNED' as JobStatus, daysAgo: 3, outcome: null },
    // 1 CANCELLED job
    { title: 'Babysitting (cancelled)', category: 'BABYSITTING' as JobCategory, pay: 200, status: 'CANCELLED' as JobStatus, daysAgo: 45, outcome: null },
  ];

  const createdJobs: Array<{ id: string; title: string; completedAt: Date | null; category: JobCategory }> = [];
  let jobCompletionsCreated = 0;

  for (const jobData of jobsData) {
    const job = await prisma.microJob.create({
      data: {
        title: jobData.title,
        category: jobData.category,
        description: `${jobData.title} - Help needed in the Oslo area.`,
        payType: 'FIXED',
        payAmount: jobData.pay,
        location: 'Oslo',
        status: jobData.status,
        postedById: employer.id,
        createdAt: daysAgo(jobData.daysAgo + 5),
        startDate: daysAgo(jobData.daysAgo),
      },
    });

    // Create application
    await prisma.application.create({
      data: {
        jobId: job.id,
        youthId: userId,
        message: 'I would love to help with this job!',
        status: jobData.status === 'CANCELLED' ? 'WITHDRAWN' : 'ACCEPTED',
        createdAt: daysAgo(jobData.daysAgo + 3),
      },
    });

    // Create completion and earning for completed jobs
    if (jobData.outcome === 'COMPLETED') {
      await prisma.jobCompletion.create({
        data: {
          jobId: job.id,
          youthId: userId,
          employerId: employer.id,
          outcome: 'COMPLETED',
          supervision: 'UNSUPERVISED',
          hoursWorked: 2.5,
          completedAt: daysAgo(jobData.daysAgo),
        },
      });

      // Create earning record (this is what the earnings API queries)
      await prisma.earning.create({
        data: {
          youthId: userId,
          jobId: job.id,
          amount: jobData.pay,
          status: 'CONFIRMED',
          earnedAt: daysAgo(jobData.daysAgo),
        },
      });

      jobCompletionsCreated++;
    }

    createdJobs.push({
      id: job.id,
      title: jobData.title,
      completedAt: jobData.outcome === 'COMPLETED' ? daysAgo(jobData.daysAgo) : null,
      category: jobData.category,
    });
  }

  console.log(`   ✅ Created ${createdJobs.length} jobs, ${jobCompletionsCreated} completions`);

  // ==========================================
  // STEP 5: Create Reflections
  // ==========================================
  console.log('💭 Step 5: Creating reflections...');

  const reflectionsData: Array<{
    contextType: ReflectionContextType;
    contextId: string | null;
    prompt: string;
    response: string;
    createdAt: Date;
  }> = [];

  // Job reflections (5 for completed jobs)
  const completedJobs = createdJobs.filter((j) => j.completedAt);
  const jobReflectionPrompts = [
    { prompt: 'What did you learn from this experience?', response: 'I learned how to manage my time better and communicate clearly with the employer about expectations.' },
    { prompt: 'What would you do differently next time?', response: 'I would ask more questions upfront about exactly what was needed to avoid any confusion.' },
    { prompt: 'How did this job help you grow?', response: 'It helped me build confidence in my abilities and showed me I can handle responsibility.' },
    { prompt: 'What skills did you use or develop?', response: 'I used my problem-solving skills and developed better communication with adults.' },
    { prompt: 'Would you recommend this type of work to others?', response: 'Yes! It is a great way to earn money while learning practical skills and meeting people.' },
  ];

  completedJobs.forEach((job, index) => {
    const reflection = jobReflectionPrompts[index % jobReflectionPrompts.length];
    reflectionsData.push({
      contextType: 'ALIGNED_ACTION',
      contextId: job.id,
      prompt: reflection.prompt,
      response: reflection.response,
      createdAt: new Date(job.completedAt!.getTime() + 2 * 60 * 60 * 1000), // 2 hours after completion
    });
  });

  // Strengths reflection
  reflectionsData.push({
    contextType: 'STRENGTHS_REFLECTION',
    contextId: null,
    prompt: 'Why did you choose these strengths?',
    response: 'These strengths reflect who I am at my best. Reliability is important to me because I always follow through on commitments. Creativity helps me solve problems in unique ways.',
    createdAt: daysAgo(85),
  });

  // Capability reflection
  reflectionsData.push({
    contextType: 'CAREER_DISCOVERY',
    contextId: null,
    prompt: 'What skills do you want to develop this year?',
    response: 'I want to get better at prototyping and learn more about user research methods. These skills will be essential for my goal of becoming a UX designer.',
    createdAt: daysAgo(82),
  });

  // Career discovery reflection
  reflectionsData.push({
    contextType: 'CAREER_DISCOVERY',
    contextId: null,
    prompt: 'What draws you to these career paths?',
    response: 'I have always been fascinated by how design can solve real problems. UX design combines my love of technology with creativity in a way that helps people.',
    createdAt: daysAgo(80),
  });

  // Role deep dive reflections
  reflectionsData.push({
    contextType: 'ROLE_DEEP_DIVE',
    contextId: 'ux-designer',
    prompt: 'After researching this role, what surprised you?',
    response: 'I was surprised by how much research and user testing goes into design decisions. It is not just about making things look pretty, but understanding how people think.',
    createdAt: daysAgo(75),
  });

  reflectionsData.push({
    contextType: 'ROLE_DEEP_DIVE',
    contextId: 'ux-designer',
    prompt: 'What skills do you need to develop for this career?',
    response: 'I need to learn more about user research methods, prototyping tools like Figma, and how to present design decisions to stakeholders.',
    createdAt: daysAgo(74),
  });

  // Industry insights reflections
  reflectionsData.push({
    contextType: 'INDUSTRY_INSIGHTS',
    contextId: 'tech-industry-trends',
    prompt: 'How do these trends affect your career plans?',
    response: 'The growth of AI in design tools is exciting but also means I need to stay current. I plan to learn AI-assisted design while focusing on the human skills AI cannot replace.',
    createdAt: daysAgo(50),
  });

  reflectionsData.push({
    contextType: 'INDUSTRY_INSIGHTS',
    contextId: 'design-market-outlook',
    prompt: 'What opportunities do you see in this industry?',
    response: 'There is growing demand for designers who understand both user experience and accessibility. This is an area where I want to specialize.',
    createdAt: daysAgo(48),
  });

  // Shadow reflections
  reflectionsData.push({
    contextType: 'SHADOW_COMPLETED',
    contextId: null,
    prompt: 'What was the most valuable thing you learned during your shadow?',
    response: 'Seeing how designers collaborate with developers was eye-opening. The daily standup meetings and design reviews showed me how real teams work together.',
    createdAt: daysAgo(35),
  });

  reflectionsData.push({
    contextType: 'SHADOW_COMPLETED',
    contextId: null,
    prompt: 'Did this experience change your career goals?',
    response: 'It confirmed that UX design is right for me. I especially enjoyed the user research part and want to focus more on that aspect of the field.',
    createdAt: daysAgo(34),
  });

  // Plan build reflection
  reflectionsData.push({
    contextType: 'PLAN_BUILD',
    contextId: null,
    prompt: 'How confident are you in your plan?',
    response: 'I feel confident because I have broken it down into small, achievable steps. Starting with online courses and building a portfolio feels manageable alongside school.',
    createdAt: daysAgo(25),
  });

  // Create all reflections (answered ones)
  for (const reflection of reflectionsData) {
    await prisma.journeyReflection.create({
      data: {
        profileId,
        contextType: reflection.contextType,
        contextId: reflection.contextId,
        prompt: reflection.prompt,
        response: reflection.response,
        skipped: false,
        createdAt: reflection.createdAt,
      },
    });
  }

  // Create pending (unanswered) reflections for UI testing
  const pendingReflections = [
    {
      contextType: 'ALIGNED_ACTION' as ReflectionContextType,
      prompt: 'What did this job teach you about working with others?',
      createdAt: daysAgo(5),
    },
    {
      contextType: 'INDUSTRY_INSIGHTS' as ReflectionContextType,
      prompt: 'How might AI tools change the role of UX designers in the next 5 years?',
      createdAt: daysAgo(2),
    },
  ];

  for (const pending of pendingReflections) {
    await prisma.journeyReflection.create({
      data: {
        profileId,
        contextType: pending.contextType,
        contextId: null,
        prompt: pending.prompt,
        response: null,
        skipped: false,
        createdAt: pending.createdAt,
      },
    });
  }

  const totalReflections = reflectionsData.length + pendingReflections.length;
  console.log(`   ✅ Created ${totalReflections} reflections (${pendingReflections.length} pending)`);

  // ==========================================
  // STEP 6: Create Saved Items (Library)
  // ==========================================
  console.log('📚 Step 6: Creating saved items...');

  const savedItemsData: Array<{
    type: SavedItemType;
    title: string;
    url: string;
    source: string;
    tags: string[];
    savedAt: Date;
  }> = [
    // ARTICLES (5)
    { type: 'ARTICLE', title: 'The Complete Guide to UX Design in 2024', url: 'https://uxdesign.cc/complete-guide-2024', source: 'UX Design', tags: ['ux', 'design', 'career'], savedAt: daysAgo(70) },
    { type: 'ARTICLE', title: 'How to Build Your First Design Portfolio', url: 'https://medium.com/design-portfolio-guide', source: 'Medium', tags: ['portfolio', 'design', 'beginner'], savedAt: daysAgo(65) },
    { type: 'ARTICLE', title: '10 Essential Skills Every UX Designer Needs', url: 'https://careerfoundry.com/ux-skills', source: 'CareerFoundry', tags: ['skills', 'ux', 'learning'], savedAt: daysAgo(55) },
    { type: 'ARTICLE', title: 'Understanding User Research Methods', url: 'https://nngroup.com/user-research', source: 'Nielsen Norman', tags: ['research', 'users', 'methods'], savedAt: daysAgo(45) },
    { type: 'ARTICLE', title: 'Design Thinking for Beginners', url: 'https://interaction-design.org/design-thinking', source: 'IDF', tags: ['design-thinking', 'process', 'beginner'], savedAt: daysAgo(40) },

    // VIDEOS (5)
    { type: 'VIDEO', title: 'Day in the Life of a UX Designer', url: 'https://youtube.com/watch?v=ux-day-life', source: 'YouTube', tags: ['career', 'day-in-life', 'ux'], savedAt: daysAgo(68) },
    { type: 'VIDEO', title: 'Figma Tutorial for Beginners', url: 'https://youtube.com/watch?v=figma-tutorial', source: 'YouTube', tags: ['figma', 'tutorial', 'tools'], savedAt: daysAgo(60) },
    { type: 'VIDEO', title: 'How I Got My First UX Job', url: 'https://youtube.com/watch?v=first-ux-job', source: 'YouTube', tags: ['career', 'job-search', 'tips'], savedAt: daysAgo(50) },
    { type: 'VIDEO', title: 'User Interview Techniques', url: 'https://youtube.com/watch?v=user-interviews', source: 'YouTube', tags: ['research', 'interviews', 'users'], savedAt: daysAgo(42) },
    { type: 'VIDEO', title: 'Building a Design System from Scratch', url: 'https://youtube.com/watch?v=design-system', source: 'YouTube', tags: ['design-system', 'advanced', 'process'], savedAt: daysAgo(28) },

    // PODCASTS (3)
    { type: 'PODCAST', title: 'Design Better Podcast: Career Transitions', url: 'https://designbetter.co/podcast/career', source: 'Design Better', tags: ['podcast', 'career', 'transitions'], savedAt: daysAgo(58) },
    { type: 'PODCAST', title: 'UX Podcast: Starting Your Journey', url: 'https://uxpodcast.com/starting-journey', source: 'UX Podcast', tags: ['podcast', 'beginner', 'journey'], savedAt: daysAgo(52) },
    { type: 'PODCAST', title: 'High Resolution: Design Leadership', url: 'https://highresolution.design/leadership', source: 'High Resolution', tags: ['podcast', 'leadership', 'senior'], savedAt: daysAgo(38) },

    // SHORTS (5)
    { type: 'SHORT', title: 'UX Design in 60 Seconds', url: 'https://tiktok.com/@uxdesigner/ux60sec', source: 'TikTok', tags: ['quick', 'ux', 'intro'], savedAt: daysAgo(66) },
    { type: 'SHORT', title: '3 Portfolio Mistakes to Avoid', url: 'https://instagram.com/reel/portfolio-mistakes', source: 'Instagram', tags: ['portfolio', 'tips', 'mistakes'], savedAt: daysAgo(54) },
    { type: 'SHORT', title: 'Figma Shortcut You Need to Know', url: 'https://youtube.com/shorts/figma-shortcut', source: 'YouTube Shorts', tags: ['figma', 'shortcut', 'productivity'], savedAt: daysAgo(35) },
    { type: 'SHORT', title: 'What UX Designers Actually Do', url: 'https://tiktok.com/@designer/what-ux-do', source: 'TikTok', tags: ['career', 'day-in-life', 'reality'], savedAt: daysAgo(22) },
    { type: 'SHORT', title: 'Interview Tips for Design Jobs', url: 'https://instagram.com/reel/interview-tips', source: 'Instagram', tags: ['interview', 'jobs', 'tips'], savedAt: daysAgo(15) },
  ];

  for (const item of savedItemsData) {
    await prisma.savedItem.create({
      data: {
        profileId,
        type: item.type,
        title: item.title,
        url: item.url,
        source: item.source,
        tags: item.tags,
        careerPathId: 'ux-designer',
        savedAt: item.savedAt,
      },
    });
  }

  console.log(`   ✅ Created ${savedItemsData.length} saved items`);

  // ==========================================
  // STEP 7: Create Shadow Requests
  // ==========================================
  console.log('🔍 Step 7: Creating shadow requests...');

  // Find or create a host for shadows
  let shadowHost = await prisma.user.findFirst({
    where: { email: 'employer2@scale.sprout.test' },
  });

  if (!shadowHost) {
    const hashedPassword = await bcrypt.hash('Test1234!', 10);
    shadowHost = await prisma.user.create({
      data: {
        email: 'shadow-host@test.local',
        password: hashedPassword,
        role: 'EMPLOYER',
        dateOfBirth: new Date('1980-01-15'),
        accountStatus: 'ACTIVE',
        isVerifiedAdult: true,
        employerProfile: {
          create: {
            companyName: 'Design Studio Oslo',
            bio: 'Creative design agency',
            verified: true,
            eidVerified: true,
          },
        },
      },
    });
  }

  const shadowRequests = [
    // APPROVED/COMPLETED shadow
    {
      status: 'COMPLETED' as ShadowRequestStatus,
      roleTitle: 'UX Designer',
      roleCategory: 'Design',
      format: 'HALF_DAY' as ShadowFormat,
      message: 'I am very interested in learning about the day-to-day work of a UX designer. I have been studying design principles and would love to see how they are applied in a real work environment.',
      learningGoals: ['DAILY_WORK', 'SKILLS_USED'] as ShadowLearningGoal[],
      createdAt: daysAgo(60),
      scheduledDate: daysAgo(40),
      completedAt: daysAgo(40),
    },
    // PENDING shadow
    {
      status: 'PENDING' as ShadowRequestStatus,
      roleTitle: 'Product Designer',
      roleCategory: 'Design',
      format: 'WALKTHROUGH' as ShadowFormat,
      message: 'I would love to learn more about product design and how it differs from UX design. A short walkthrough would be incredibly valuable.',
      learningGoals: ['CAREER_PATH', 'WORK_ENVIRONMENT'] as ShadowLearningGoal[],
      createdAt: daysAgo(10),
      scheduledDate: null,
      completedAt: null,
    },
    // DECLINED shadow (user's request was declined)
    {
      status: 'DECLINED' as ShadowRequestStatus,
      roleTitle: 'Graphic Designer',
      roleCategory: 'Design',
      format: 'FULL_DAY' as ShadowFormat,
      message: 'I am interested in understanding graphic design and how it relates to UX.',
      learningGoals: ['DAILY_WORK'] as ShadowLearningGoal[],
      createdAt: daysAgo(55),
      scheduledDate: null,
      completedAt: null,
      declineReason: 'Unfortunately we are fully booked this month. Please try again next quarter.',
    },
  ];

  let shadowsCreated = 0;
  for (const shadow of shadowRequests) {
    await prisma.shadowRequest.create({
      data: {
        youthId: userId,
        hostId: shadowHost.id,
        status: shadow.status,
        roleTitle: shadow.roleTitle,
        roleCategory: shadow.roleCategory,
        format: shadow.format,
        message: shadow.message,
        learningGoals: shadow.learningGoals,
        preferredDays: ['Monday', 'Wednesday', 'Friday'],
        createdAt: shadow.createdAt,
        scheduledDate: shadow.scheduledDate,
        completedAt: shadow.completedAt,
        declineReason: shadow.declineReason || null,
      },
    });
    shadowsCreated++;
  }

  console.log(`   ✅ Created ${shadowsCreated} shadow requests`);

  // ==========================================
  // STEP 7.5: Create Journey Notes
  // ==========================================
  console.log('📝 Step 7.5: Creating journey notes...');

  const notesData = [
    {
      title: 'Portfolio Ideas',
      content: `Ideas for my UX portfolio projects:\n\n1. Redesign a local business website (maybe the coffee shop near school?)\n2. Create a mobile app concept for student budgeting\n3. Case study on improving the school's lunch ordering system\n\nNeed to pick one and start with user research!`,
      color: 'blue',
      pinned: true,
      createdAt: daysAgo(45),
    },
    {
      title: 'Shadow Day Takeaways',
      content: `Key things I learned from my UX Designer shadow day:\n\n- Design reviews happen almost daily - need to be comfortable presenting work\n- Figma is used for everything (prototyping, design systems, handoff)\n- User research is more important than I thought - they spend ~30% of time on it\n- Developers are partners, not just people who implement designs\n\nThis confirmed I want to pursue UX!`,
      color: 'green',
      pinned: true,
      createdAt: daysAgo(38),
    },
    {
      title: null,
      content: 'Remember to update LinkedIn profile with new skills learned from the Figma course.',
      color: 'yellow',
      pinned: false,
      createdAt: daysAgo(20),
    },
    {
      title: 'Interview Prep Notes',
      content: `Things to prepare for internship interviews:\n\n- Practice talking through design decisions\n- Have 2-3 projects ready to walk through\n- Research the company's products beforehand\n- Prepare questions about their design process\n- Be ready to do a whiteboard exercise`,
      color: 'purple',
      pinned: false,
      createdAt: daysAgo(15),
    },
    {
      title: 'Books to Read',
      content: `Recommended UX books from my shadow mentor:\n\n✓ "Don't Make Me Think" by Steve Krug (finished!)\n- "The Design of Everyday Things" by Don Norman\n- "Sprint" by Jake Knapp\n- "100 Things Every Designer Needs to Know About People"`,
      color: 'pink',
      pinned: false,
      createdAt: daysAgo(30),
    },
    {
      title: 'Weekly Goals',
      content: `This week:\n- Complete Module 4 of Google UX Certificate\n- Sketch 3 wireframe concepts for budgeting app\n- Reach out to 2 designers on LinkedIn for informational chats`,
      color: 'gray',
      pinned: false,
      createdAt: daysAgo(3),
    },
  ];

  let notesCreated = 0;
  for (const note of notesData) {
    await prisma.journeyNote.create({
      data: {
        profileId,
        title: note.title,
        content: note.content,
        color: note.color,
        pinned: note.pinned,
        createdAt: note.createdAt,
        updatedAt: note.createdAt,
      },
    });
    notesCreated++;
  }

  console.log(`   ✅ Created ${notesCreated} journey notes`);

  // ==========================================
  // STEP 8: Create Timeline Events
  // ==========================================
  console.log('📅 Step 8: Creating timeline events...');

  const timelineEvents: Array<{
    type: TimelineEventType;
    metadata: Record<string, unknown>;
    createdAt: Date;
  }> = [];

  // Profile created
  timelineEvents.push({
    type: 'PROFILE_CREATED',
    metadata: { displayName: 'Ryan M.' },
    createdAt: daysAgo(180),
  });

  // Job completions
  completedJobs.forEach((job, index) => {
    timelineEvents.push({
      type: 'ALIGNED_ACTION_COMPLETED',
      metadata: { jobId: job.id, title: job.title, category: job.category },
      createdAt: job.completedAt!,
    });

    // First job acquired (only for first completion)
    if (index === 0) {
      timelineEvents.push({
        type: 'ALIGNED_ACTION_COMPLETED',
        metadata: { milestone: 'FIRST_JOB_ACQUIRED', jobId: job.id, title: job.title },
        createdAt: job.completedAt!,
      });
    }
  });

  // Strengths confirmed
  timelineEvents.push({
    type: 'STRENGTHS_CONFIRMED',
    metadata: { strengths: ['Reliable', 'Creative', 'Detail-oriented'] },
    createdAt: daysAgo(85),
  });

  // Career selected
  timelineEvents.push({
    type: 'CAREER_EXPLORED',
    metadata: { careerId: 'ux-designer', title: 'UX Designer' },
    createdAt: daysAgo(80),
  });

  timelineEvents.push({
    type: 'CAREER_EXPLORED',
    metadata: { careerId: 'product-designer', title: 'Product Designer' },
    createdAt: daysAgo(79),
  });

  // Role deep dive
  timelineEvents.push({
    type: 'ROLE_DEEP_DIVE_COMPLETED',
    metadata: { roleId: 'ux-designer', title: 'UX Designer' },
    createdAt: daysAgo(75),
  });

  // Shadow events
  timelineEvents.push({
    type: 'SHADOW_REQUESTED',
    metadata: { roleTitle: 'UX Designer', format: 'HALF_DAY' },
    createdAt: daysAgo(60),
  });

  timelineEvents.push({
    type: 'SHADOW_APPROVED',
    metadata: { roleTitle: 'UX Designer', scheduledDate: daysAgo(40).toISOString() },
    createdAt: daysAgo(55),
  });

  timelineEvents.push({
    type: 'SHADOW_COMPLETED',
    metadata: { roleTitle: 'UX Designer', hostCompany: 'Design Studio Oslo' },
    createdAt: daysAgo(40),
  });

  timelineEvents.push({
    type: 'SHADOW_REQUESTED',
    metadata: { roleTitle: 'Product Designer', format: 'WALKTHROUGH' },
    createdAt: daysAgo(10),
  });

  timelineEvents.push({
    type: 'SHADOW_DECLINED',
    metadata: { roleTitle: 'Graphic Designer', reason: 'Host fully booked' },
    createdAt: daysAgo(50),
  });

  // Industry insights reviewed
  timelineEvents.push({
    type: 'INDUSTRY_OUTLOOK_REVIEWED',
    metadata: { topic: 'AI in Design', industry: 'Technology' },
    createdAt: daysAgo(50),
  });

  timelineEvents.push({
    type: 'INDUSTRY_OUTLOOK_REVIEWED',
    metadata: { topic: 'Design Market Growth', industry: 'Design' },
    createdAt: daysAgo(48),
  });

  timelineEvents.push({
    type: 'INDUSTRY_OUTLOOK_REVIEWED',
    metadata: { topic: 'Remote Work Trends', industry: 'General' },
    createdAt: daysAgo(46),
  });

  // Saved items (10 events for library saves)
  const savedItemEvents = savedItemsData.slice(0, 10);
  savedItemEvents.forEach((item) => {
    timelineEvents.push({
      type: 'ITEM_SAVED',
      metadata: { title: item.title, type: item.type, source: item.source },
      createdAt: item.savedAt,
    });
  });

  // Reflections recorded
  reflectionsData.slice(0, 8).forEach((reflection) => {
    timelineEvents.push({
      type: 'REFLECTION_RECORDED',
      metadata: { contextType: reflection.contextType, prompt: reflection.prompt.substring(0, 50) },
      createdAt: new Date(reflection.createdAt.getTime() + 5 * 60 * 1000),
    });
  });

  // Plan built
  timelineEvents.push({
    type: 'PLAN_CREATED',
    metadata: {
      targetRole: 'UX Designer',
      shortTermGoals: 2,
      milestone: 'Complete online UX certification',
    },
    createdAt: daysAgo(25),
  });

  // Create all timeline events
  for (const event of timelineEvents) {
    await prisma.timelineEvent.create({
      data: {
        userId,
        type: event.type,
        metadata: event.metadata as object,
        createdAt: event.createdAt,
      },
    });
  }

  console.log(`   ✅ Created ${timelineEvents.length} timeline events`);

  // ==========================================
  // STEP 9: Update Journey Summary
  // ==========================================
  console.log('📊 Step 9: Updating journey summary...');

  const journeySummary = {
    // Core progress
    strengths: ['Reliable', 'Creative', 'Detail-oriented'],
    demonstratedSkills: ['communication', 'time-management', 'problem-solving', 'customer-service'],
    jobsCompletedCount: 5,
    reliabilitySignals: ['Always on time', 'Completes tasks as agreed', 'Good communicator'],

    // Career exploration
    careerInterests: ['UX Designer', 'Product Designer'],
    exploredRoles: [
      {
        title: 'UX Designer',
        deepDiveCompleted: true,
        certifications: ['Google UX Design Certificate'],
        savedAt: daysAgo(75).toISOString(),
      },
    ],
    companiesOfInterest: ['Design Studio Oslo', 'Bekk', 'Eggs Design'],

    // Plan
    rolePlans: [
      {
        roleTitle: 'UX Designer',
        shortTermActions: [
          'Complete Google UX Design Certificate on Coursera',
          'Build 3 portfolio projects',
        ],
        midTermMilestone: 'Land first UX internship or junior role',
        skillToBuild: 'User Research',
        createdAt: daysAgo(25).toISOString(),
      },
    ],

    // Next actions
    nextActions: [
      { action: 'Continue working on portfolio project', category: 'skill', priority: 'high' },
      { action: 'Apply for summer internships', category: 'experience', priority: 'medium' },
      { action: 'Network on LinkedIn with local designers', category: 'networking', priority: 'medium' },
    ],

    // Industry awareness
    industryInsightsSummary: {
      trendsReviewed: 3,
      savedInsights: 1,
      lastReviewedAt: daysAgo(46).toISOString(),
    },
    futureOutlookNotes: [
      'AI tools are changing design workflows but human creativity remains essential',
      'Growing demand for designers who understand accessibility',
    ],

    // Shadow summary
    shadowSummary: {
      requestsTotal: 3,
      requestsCompleted: 1,
      requestsPending: 1,
      requestsDeclined: 1,
    },

    // Saved items summary
    savedSummary: {
      totalItems: 18,
      byType: { ARTICLE: 5, VIDEO: 5, PODCAST: 3, SHORT: 5 },
    },

    // Lens progress
    lenses: {
      DO: { progress: 100, completedPhases: ['FOUNDATION', 'EXPERIENCE'], completedStates: ['BASELINE_PROFILE', 'FIRST_JOB_ACQUIRED', 'MULTIPLE_JOB_EXPERIENCE'], totalStates: 3 },
      DISCOVER: { progress: 100, completedPhases: ['SELF_AWARENESS', 'EXPLORATION'], completedStates: ['CAPABILITY_REFLECTION', 'CAREER_DISCOVERY', 'ROLE_DEEP_DIVE'], totalStates: 3 },
      UNDERSTAND: { progress: 100, completedPhases: ['REALITY', 'STRATEGY'], completedStates: ['CAREER_SHADOW_REQUEST', 'INDUSTRY_INSIGHTS', 'PLAN_BUILD', 'CONTINUOUS_GROWTH'], totalStates: 4 },
    },

    // Metadata
    lastUpdatedAt: new Date().toISOString(),
  };

  await prisma.youthProfile.update({
    where: { id: profileId },
    data: {
      journeySummary,
      journeyState: 'CONTINUOUS_GROWTH',
      journeyCompletedSteps: [
        'BASELINE_PROFILE',
        'FIRST_JOB_ACQUIRED',
        'MULTIPLE_JOB_EXPERIENCE',
        'CAPABILITY_REFLECTION',
        'CAREER_DISCOVERY',
        'ROLE_DEEP_DIVE',
        'CAREER_SHADOW_REQUEST',
        'INDUSTRY_INSIGHTS',
        'PLAN_BUILD',
      ],
      journeyLastUpdated: new Date(),
      completedJobsCount: 5,
      primaryGoal: {
        title: 'UX Designer',
        status: 'active',
        confidence: 'high',
        timeframe: '2-3 years',
        why: 'I love combining creativity with problem-solving to help people',
        nextSteps: ['Complete certification', 'Build portfolio', 'Get internship'],
        skills: ['User Research', 'Prototyping', 'Visual Design'],
      },
    },
  });

  console.log('   ✅ Journey summary updated');

  // ==========================================
  // FINAL OUTPUT
  // ==========================================
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                    SEED COMPLETE                         ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('📊 SUMMARY:');
  console.log(`   • Jobs created: ${createdJobs.length} (${jobCompletionsCreated} completed)`);
  console.log(`   • Reflections created: ${reflectionsData.length}`);
  console.log(`   • Saved items created: ${savedItemsData.length}`);
  console.log(`   • Shadow requests created: ${shadowsCreated}`);
  console.log(`   • Journey notes created: ${notesCreated}`);
  console.log(`   • Timeline events created: ${timelineEvents.length}`);
  console.log('');
  console.log('🎯 JOURNEY STATE:');
  console.log('   • Current State: CONTINUOUS_GROWTH');
  console.log('   • DO Lens: 100% complete');
  console.log('   • DISCOVER Lens: 100% complete');
  console.log('   • UNDERSTAND Lens: 100% complete');
  console.log('   • Plan: Built with 2 short-term actions + 1 milestone');
  console.log('');
  console.log(`📧 User: ${TARGET_EMAIL}`);
  console.log(`🔑 Password: Test1234!`);
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
