/**
 * Seed rich demo data for nick6@nick.com.
 *
 *   - 30 explored journeys (JourneyGoalData)
 *   - 50 saved insights (SavedItem)
 *   - 400 job applications (of which 50 = COMPLETED via JobCompletion + StructuredFeedback)
 *   - 10 conversation messages across multiple employers
 *
 * Client-side items (saved careers + saved comparisons + per-career
 * Clarity confirmations) are handled by the companion browser snippet
 * at scripts/seed-nick6-localstorage.js.
 *
 * Safety:
 *   - Only seeds the one specific user (nick6@nick.com).
 *   - Creates a pool of demo employers with @demo.endeavrly.local emails.
 *   - Idempotent: wipes nick6's prior demo data before re-seeding.
 *   - Will refuse to run if nick6 not found.
 *   - Run with: DATABASE_URL=<direct-url> node scripts/seed-nick6.mjs
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const TARGET_EMAIL = 'nick6@nick.com';

const CAREER_TITLES = [
  'Software Developer', 'Data Scientist', 'UX Designer', 'Product Manager',
  'Marine Biologist', 'Veterinarian', 'Nurse', 'Doctor',
  'Graphic Designer', 'Illustrator', 'Game Developer', 'Animator',
  'Civil Engineer', 'Mechanical Engineer', 'Aerospace Engineer',
  'Journalist', 'Author', 'Photographer', 'Film Director',
  'Chef', 'Baker', 'Food Scientist',
  'Electrician', 'Plumber', 'Carpenter',
  'Police Officer', 'Firefighter', 'Paramedic',
  'Primary Teacher', 'Secondary Teacher',
];

const INSIGHT_TITLES = [
  'The Future of AI in the Workplace', 'Green Jobs on the Rise',
  'Remote Work Trends 2026', 'Skills Gap in Tech',
  'Norway\'s Growing Startup Scene', 'Apprenticeships Making a Comeback',
  'Mental Health in the Workplace', 'The Creator Economy Boom',
  'Healthcare Jobs of the Future', 'Renewable Energy Careers',
  'Cybersecurity Demand Soars', 'The Rise of the Gig Economy',
  'Trade Jobs Paying Six Figures', 'AI and the Creative Industries',
  'Robotics in Manufacturing', 'Climate Change Career Opportunities',
  'The Importance of Soft Skills', 'Data Privacy as a Career Path',
  'Virtual Reality in Education', 'Fintech Disruption',
  'Biotech Breakthroughs', 'Space Industry Expansion',
  'Autonomous Vehicles and Jobs', 'The 4-Day Work Week',
  'Quantum Computing Careers', 'Sustainable Fashion Industry',
  'Food Tech Innovation', 'Urban Planning Future Cities',
  'The Podcast Industry', 'Content Moderation Challenges',
  'Workplace Diversity Report', 'Gen Z and Work Values',
  'The Return of Manufacturing', 'Logistics in the E-commerce Era',
  'Nursing Shortage Solutions', 'Teacher Pay Reform',
  'The Freelance Platform Economy', 'Healthcare AI Ethics',
  'Cloud Computing Jobs', 'Agriculture Tech Revolution',
  'The Longevity Industry', 'Mental Wellness Startups',
  'Language Learning Apps', 'The Return-to-Office Debate',
  'Craftsmanship Making a Comeback', 'Youth Unemployment Trends',
  'Digital Nomad Visas', 'Global Talent Migration',
  'Subscription Economy Jobs', 'The Streaming Wars and Careers',
];

const JOB_CATEGORIES = [
  'BABYSITTING', 'DOG_WALKING', 'SNOW_CLEARING', 'CLEANING',
  'DIY_HELP', 'TECH_HELP', 'ERRANDS', 'OTHER',
];

const JOB_TITLES_BY_CAT = {
  BABYSITTING: ['Weekend babysitter needed', 'Evening babysitting', 'Summer babysitter', 'After-school care'],
  DOG_WALKING: ['Daily dog walker', 'Weekend dog walks', 'Two golden retrievers', 'Senior dog care'],
  SNOW_CLEARING: ['Clear driveway', 'Shovel front path', 'Help after storm', 'Weekly snow clearing'],
  CLEANING: ['House cleaning', 'Window washing', 'Garage tidy-up', 'Post-party cleanup'],
  DIY_HELP: ['Assemble IKEA furniture', 'Paint a small wall', 'Fix a shelf', 'Mount a TV'],
  TECH_HELP: ['Help setting up new iPad', 'WiFi troubleshooting', 'Printer setup', 'Phone tutorial'],
  ERRANDS: ['Grocery pickup', 'Post office run', 'Collect parcel', 'Prescription pickup'],
  OTHER: ['Help sort garage', 'Organise bookshelf', 'Walk to school with child', 'Light gardening'],
};

const MESSAGE_SAMPLES = [
  { from: 'employer', content: { availability: 'Weekends', start_date: '2026-05-01' } },
  { from: 'employer', content: { question: 'Are you available this Saturday?' } },
  { from: 'youth',    content: { confirmation: 'yes', note: 'Looking forward to it' } },
  { from: 'employer', content: { thank_you: 'Great job today!' } },
  { from: 'youth',    content: { question: 'What time should I arrive?' } },
  { from: 'employer', content: { time_window: '10:00 - 12:00' } },
  { from: 'youth',    content: { confirmation: 'yes' } },
  { from: 'employer', content: { availability: 'Next Friday', start_date: '2026-05-10' } },
  { from: 'youth',    content: { question: 'Is parking available?' } },
  { from: 'employer', content: { location_detail: 'Yes, street parking on front' } },
];

// ── Helpers ──────────────────────────────────────────────────────

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomPick = (arr) => arr[randomInt(0, arr.length - 1)];
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };

async function findUser() {
  const user = await prisma.user.findUnique({
    where: { email: TARGET_EMAIL },
    include: { youthProfile: true },
  });
  if (!user) {
    throw new Error(`User ${TARGET_EMAIL} not found — aborting.`);
  }
  if (!user.youthProfile) {
    throw new Error(`User ${TARGET_EMAIL} has no YouthProfile — aborting.`);
  }
  return user;
}

async function cleanupPreviousSeed(userId, youthProfileId) {
  console.log('  Cleaning up previous seed data for nick6…');
  // Messages first (FK to Conversation)
  await prisma.message.deleteMany({
    where: { conversation: { OR: [{ participant1Id: userId }, { participant2Id: userId }] } },
  });
  await prisma.conversation.deleteMany({
    where: { OR: [{ participant1Id: userId }, { participant2Id: userId }] },
  });
  // Feedback → Completions → Applications (youthId is User.id on these models)
  const completions = await prisma.jobCompletion.findMany({
    where: { youthId: userId },
    select: { id: true },
  });
  await prisma.structuredFeedback.deleteMany({
    where: { jobCompletionId: { in: completions.map((c) => c.id) } },
  });
  await prisma.jobCompletion.deleteMany({ where: { youthId: userId } });
  await prisma.application.deleteMany({ where: { youthId: userId } });
  // SavedItems for the user
  await prisma.savedItem.deleteMany({ where: { profileId: youthProfileId } });
  // Journey goals
  await prisma.journeyGoalData.deleteMany({ where: { userId } });
  // Jobs previously posted by the demo employers we created — these clean up on re-run
  await prisma.microJob.deleteMany({
    where: { postedBy: { email: { endsWith: '@demo-nick6.endeavrly.local' } } },
  });
}

async function getOrCreateEmployers() {
  const names = [
    'Anna Berg Family', 'Oslo Pet Services', 'Nordic Gardens',
    'Tech Help Oslo', 'Bergen Cleaning Co', 'Study Buddies AS',
    'Pet Paradise', 'Handyman Norge',
  ];
  const employers = [];
  for (let i = 0; i < names.length; i++) {
    const email = `demo-employer-${i + 1}@demo-nick6.endeavrly.local`;
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          password: await bcrypt.hash('demo-nick6-pass', 10),
          role: 'EMPLOYER',
          accountStatus: 'ACTIVE',
          emailVerified: new Date(),
          fullName: names[i],
          employerProfile: {
            create: {
              companyName: names[i],
              verified: true,
            },
          },
        },
      });
    }
    employers.push(user);
  }
  return employers;
}

// ── Journey goals ────────────────────────────────────────────────

async function seedJourneys(userId) {
  console.log('  Seeding 30 explored journeys…');
  const goals = CAREER_TITLES.slice(0, 30);
  for (let i = 0; i < goals.length; i++) {
    const title = goals[i];
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await prisma.journeyGoalData.create({
      data: {
        userId,
        goalId: slug,
        goalTitle: title,
        isActive: i === 0, // first one is active
        journeyState: 'CLARITY',
        journeyCompletedSteps: ['discover', 'understand', 'clarity'],
        journeySummary: {
          discoverConfirmed: true,
          understandConfirmed: true,
          clarityCompleted: true,
          completedAt: daysAgo(randomInt(1, 180)).toISOString(),
        },
        createdAt: daysAgo(randomInt(30, 300)),
        updatedAt: daysAgo(randomInt(0, 60)),
      },
    });
  }
}

// ── Saved insights ───────────────────────────────────────────────

async function seedSavedInsights(profileId) {
  console.log('  Seeding 50 saved insights…');
  const TYPES = ['ARTICLE', 'VIDEO', 'PODCAST', 'SHORT'];
  const SOURCES = ['BBC', 'FT', 'TechCrunch', 'The Economist', 'Medium', 'YouTube', 'Spotify'];
  for (let i = 0; i < 50; i++) {
    await prisma.savedItem.create({
      data: {
        profileId,
        type: randomPick(TYPES),
        title: INSIGHT_TITLES[i % INSIGHT_TITLES.length],
        url: `https://example.com/insight/${i + 1}`,
        source: randomPick(SOURCES),
        tags: ['career', 'insight', 'future-of-work'].slice(0, randomInt(1, 3)),
        savedAt: daysAgo(randomInt(1, 200)),
      },
    });
  }
}

// ── Jobs + applications + completions ────────────────────────────

async function seedJobsAndApplications(userId, profileId, employers) {
  // NOTE: Application.youthId and JobCompletion.youthId both reference User.id,
  // NOT YouthProfile.id. Only SavedItem and a few others use profileId.
  console.log('  Seeding 400 jobs + applications (50 completed, 350 other statuses)…');

  const COMPLETED_COUNT = 50;
  const OTHER_COUNT = 350;
  const TOTAL = COMPLETED_COUNT + OTHER_COUNT;

  const jobs = [];
  for (let i = 0; i < TOTAL; i++) {
    const cat = randomPick(JOB_CATEGORIES);
    const titlePool = JOB_TITLES_BY_CAT[cat] || ['Small job'];
    const employer = randomPick(employers);
    const isCompleted = i < COMPLETED_COUNT;

    const job = await prisma.microJob.create({
      data: {
        title: `${randomPick(titlePool)} #${i + 1}`,
        category: cat,
        description: 'Demo job entry for nick6 seed data.',
        payType: 'FIXED',
        payAmount: randomInt(100, 600),
        location: randomPick(['Oslo', 'Bergen', 'Trondheim', 'Stavanger']),
        status: isCompleted ? 'COMPLETED' : randomPick(['POSTED', 'POSTED', 'ASSIGNED', 'COMPLETED']),
        postedById: employer.id,
        createdAt: daysAgo(randomInt(isCompleted ? 30 : 0, 365)),
      },
    });
    jobs.push({ job, employer, isCompleted });
  }

  console.log('  Creating 400 applications…');
  for (const { job, isCompleted } of jobs) {
    let status;
    if (isCompleted) {
      status = 'ACCEPTED';
    } else {
      // spread the rest across PENDING, REJECTED, WITHDRAWN, ACCEPTED
      const r = Math.random();
      if (r < 0.45) status = 'PENDING';
      else if (r < 0.75) status = 'REJECTED';
      else if (r < 0.9) status = 'WITHDRAWN';
      else status = 'ACCEPTED';
    }
    await prisma.application.create({
      data: {
        jobId: job.id,
        youthId: userId,
        message: 'I would like to apply for this job. I have relevant experience.',
        status,
        createdAt: daysAgo(randomInt(0, 350)),
      },
    });
  }

  console.log('  Creating 50 job completions + feedback…');
  for (const { job, employer, isCompleted } of jobs) {
    if (!isCompleted) continue;
    const completion = await prisma.jobCompletion.create({
      data: {
        jobId: job.id,
        youthId: userId,
        employerId: employer.id,
        outcome: 'COMPLETED',
        supervision: 'SUPERVISED',
        hoursWorked: randomInt(1, 4),
        completedAt: daysAgo(randomInt(1, 180)),
      },
    });
    await prisma.structuredFeedback.create({
      data: {
        jobCompletionId: completion.id,
        punctuality: randomInt(4, 5),
        communication: randomInt(4, 5),
        quality: randomInt(4, 5),
        respectfulness: 5,
        followedInstructions: randomInt(4, 5),
        wouldRehire: true,
        responsibilityLevel: randomPick(['BASIC', 'INTERMEDIATE', 'ADVANCED']),
        skillsDemonstrated: ['reliability', 'punctuality', 'communication'],
      },
    });
  }

  // Update profile stats
  await prisma.youthProfile.update({
    where: { id: profileId },
    data: {
      completedJobsCount: COMPLETED_COUNT,
      averageRating: 4.7,
      reliabilityScore: 95,
    },
  });
}

// ── Messages ─────────────────────────────────────────────────────

async function seedMessages(userId, employers) {
  console.log('  Seeding 10 messages across employers…');

  // Pick any message template from the DB (we need at least one)
  const template = await prisma.messageTemplate.findFirst();
  if (!template) {
    console.warn('  ⚠️  No MessageTemplate exists in DB — skipping messages. Seed templates first.');
    return;
  }

  // Find 10 jobs to anchor conversations to (conversations require jobId)
  const jobs = await prisma.microJob.findMany({
    where: { postedBy: { email: { endsWith: '@demo-nick6.endeavrly.local' } } },
    take: 10,
    include: { postedBy: true },
  });

  for (let i = 0; i < Math.min(10, jobs.length); i++) {
    const job = jobs[i];
    const sample = MESSAGE_SAMPLES[i];
    const senderIsYouth = sample.from === 'youth';
    const p1 = userId < job.postedById ? userId : job.postedById;
    const p2 = userId < job.postedById ? job.postedById : userId;

    const existing = await prisma.conversation.findFirst({
      where: { participant1Id: p1, participant2Id: p2, jobId: job.id },
    });
    const conv = existing || await prisma.conversation.create({
      data: {
        participant1Id: p1,
        participant2Id: p2,
        jobId: job.id,
        status: 'ACTIVE',
        lastMessageAt: daysAgo(randomInt(1, 30)),
      },
    });

    await prisma.message.create({
      data: {
        conversationId: conv.id,
        senderId: senderIsYouth ? userId : job.postedById,
        templateId: template.id,
        variables: sample.content,
        read: i < 5, // first 5 read, last 5 unread
        createdAt: daysAgo(randomInt(1, 30)),
      },
    });
  }
}

// ── Main ─────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🌱 Seeding rich demo data for ${TARGET_EMAIL}\n`);

  const user = await findUser();
  const profile = user.youthProfile;
  console.log(`  User: ${user.email} (${user.id})`);
  console.log(`  Profile: ${profile.displayName || '(no name)'} (${profile.id})\n`);

  await cleanupPreviousSeed(user.id, profile.id);
  const employers = await getOrCreateEmployers();
  console.log(`  Using ${employers.length} demo employers\n`);

  await seedJourneys(user.id);
  await seedSavedInsights(profile.id);
  await seedJobsAndApplications(user.id, profile.id, employers);
  await seedMessages(user.id, employers);

  console.log('\n✅ Done. Summary:');
  console.log('   · 30 explored journeys');
  console.log('   · 50 saved insights');
  console.log('   · 400 job applications (50 completed)');
  console.log('   · 10 messages');
  console.log('\n📎 Next — populate client-side data:');
  console.log('   1. Open the app and log in as nick6@nick.com');
  console.log('   2. Open browser DevTools → Console');
  console.log('   3. Paste the contents of scripts/seed-nick6-localstorage.js');
  console.log('   4. Refresh the dashboard.\n');
}

main()
  .catch((e) => { console.error('\n❌', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
