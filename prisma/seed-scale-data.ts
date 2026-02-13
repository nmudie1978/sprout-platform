/**
 * Scale Data Seeding Script for Sprout
 *
 * Creates large-scale realistic test data for development and testing.
 * Deterministic: Same SEED value produces identical dataset.
 *
 * USAGE:
 *   npm run db:seed-scale                    # Default seed (123)
 *   SEED=456 npm run db:seed-scale           # Custom seed
 *   SCALE_DATA_RESET=true npm run db:seed-scale  # Reset before seeding
 *
 * CREATES:
 *   - 100 youth users (ages 15-23)
 *   - 100 job posters (employers, 18+)
 *   - 250-400 jobs (mixed statuses)
 *   - 400-800 messages
 *   - 5 known youth logins + 5 known employer logins
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
  ConversationStatus,
  MessageIntent,
  JobRiskCategory,
  ShadowRequestStatus,
  ShadowFormat,
  ShadowLearningGoal,
} from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';

// Use direct connection for seeding
process.env.DATABASE_URL = process.env.DIRECT_URL || process.env.DATABASE_URL;

const prisma = new PrismaClient();

// ============================================
// CONFIGURATION
// ============================================

const SEED = parseInt(process.env.SEED || '123', 10);
const SCALE_DATA_RESET = process.env.SCALE_DATA_RESET === 'true';
const SCALE_EMAIL_DOMAIN = '@scale.sprout.test';
const DEFAULT_PASSWORD = 'Test1234!';

// Counts
const YOUTH_COUNT = 100;
const EMPLOYER_COUNT = 100;
const MIN_JOBS = 250;
const MAX_JOBS = 400;
const MIN_MESSAGES = 400;
const MAX_MESSAGES = 800;
// Known test accounts (fixed credentials)
const KNOWN_YOUTH = [
  { username: 'youth1', displayName: 'Alex Thompson', city: 'Oslo' },
  { username: 'youth2', displayName: 'Jordan Smith', city: 'Bergen' },
  { username: 'youth3', displayName: 'Taylor Williams', city: 'Trondheim' },
  { username: 'youth4', displayName: 'Morgan Davis', city: 'Stavanger' },
  { username: 'youth5', displayName: 'Casey Brown', city: 'Oslo' },
];

const KNOWN_EMPLOYERS = [
  { username: 'employer1', companyName: 'Tech Solutions AS', city: 'Oslo' },
  { username: 'employer2', companyName: 'Green Gardens', city: 'Bergen' },
  { username: 'employer3', companyName: 'Family Services', city: 'Trondheim' },
  { username: 'employer4', companyName: 'Nordic Consulting', city: 'Stavanger' },
  { username: 'employer5', companyName: 'Local Market', city: 'Oslo' },
];

// Norwegian cities for realistic data
const CITIES = [
  'Oslo',
  'Bergen',
  'Trondheim',
  'Stavanger',
  'Drammen',
  'Fredrikstad',
  'Kristiansand',
  'Sandnes',
  'Tromsø',
  'Sarpsborg',
  'Skien',
  'Ålesund',
  'Sandefjord',
  'Haugesund',
  'Tønsberg',
];

// Avatar options
const AVATARS = [
  'kawaii-star',
  'kawaii-cloud',
  'kawaii-heart',
  'kawaii-bolt',
  'kawaii-flower',
  'kawaii-sun',
  'kawaii-moon',
  'kawaii-rainbow',
  'kawaii-diamond',
  'kawaii-leaf',
];

// Career aspirations
const CAREER_ASPIRATIONS = [
  'Software Developer',
  'Nurse',
  'Teacher',
  'Electrician',
  'Lawyer',
  'Architect',
  'Chef',
  'Mechanic',
  'Marketing Manager',
  'Veterinarian',
  'Graphic Designer',
  'Accountant',
  'Physical Therapist',
  'Civil Engineer',
  'Journalist',
];

// Skill tags
const SKILL_TAGS = [
  'reliable',
  'punctual',
  'good communicator',
  'tech-savvy',
  'patient',
  'detail-oriented',
  'creative',
  'organized',
  'hardworking',
  'friendly',
  'quick learner',
  'responsible',
  'adaptable',
  'problem solver',
  'team player',
];

// Interest tags
const INTERESTS = [
  'technology',
  'sports',
  'music',
  'art',
  'reading',
  'gaming',
  'cooking',
  'volunteering',
  'photography',
  'fitness',
  'travel',
  'nature',
  'animals',
  'movies',
  'fashion',
];

// Job categories with typical pay ranges
const JOB_DATA: Array<{
  category: JobCategory;
  titles: string[];
  minPay: number;
  maxPay: number;
  risk: JobRiskCategory;
  minAge: number;
}> = [
  {
    category: 'BABYSITTING',
    titles: ['Evening babysitter needed', 'Weekend childcare help', 'After-school childminding', 'Babysitter for toddler'],
    minPay: 150,
    maxPay: 250,
    risk: 'HIGH_RISK',
    minAge: 18,
  },
  {
    category: 'DOG_WALKING',
    titles: ['Dog walker needed', 'Daily dog walking', 'Weekend dog walks', 'Exercise my energetic pup'],
    minPay: 100,
    maxPay: 200,
    risk: 'MEDIUM_RISK',
    minAge: 16,
  },
  {
    category: 'SNOW_CLEARING',
    titles: ['Snow shoveling help', 'Clear driveway of snow', 'Winter snow removal', 'Help clear sidewalk'],
    minPay: 200,
    maxPay: 400,
    risk: 'MEDIUM_RISK',
    minAge: 16,
  },
  {
    category: 'CLEANING',
    titles: ['House cleaning help', 'Apartment cleaning', 'Deep cleaning needed', 'Regular cleaning assistance'],
    minPay: 150,
    maxPay: 300,
    risk: 'LOW_RISK',
    minAge: 15,
  },
  {
    category: 'DIY_HELP',
    titles: ['Furniture assembly help', 'Moving boxes', 'Garden work needed', 'Help with painting'],
    minPay: 150,
    maxPay: 350,
    risk: 'MEDIUM_RISK',
    minAge: 16,
  },
  {
    category: 'TECH_HELP',
    titles: ['Tech support needed', 'Help set up smart home', 'Computer troubleshooting', 'Phone setup assistance'],
    minPay: 150,
    maxPay: 300,
    risk: 'LOW_RISK',
    minAge: 15,
  },
  {
    category: 'ERRANDS',
    titles: ['Grocery shopping help', 'Package pickup', 'Shopping assistance', 'Pharmacy run'],
    minPay: 100,
    maxPay: 200,
    risk: 'LOW_RISK',
    minAge: 15,
  },
  {
    category: 'OTHER',
    titles: ['Event helper needed', 'Party setup assistance', 'General help wanted', 'Odd jobs available'],
    minPay: 120,
    maxPay: 280,
    risk: 'LOW_RISK',
    minAge: 15,
  },
];

// Message intents for realistic conversations
const MESSAGE_INTENTS: MessageIntent[] = [
  'ASK_ABOUT_JOB',
  'CONFIRM_AVAILABILITY',
  'CONFIRM_TIME_DATE',
  'CONFIRM_LOCATION',
  'ASK_CLARIFICATION',
  'CONFIRM_COMPLETION',
  'UNABLE_TO_PROCEED',
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function getAgeBracket(age: number): AgeBracket | null {
  if (age >= 16 && age <= 17) return 'SIXTEEN_SEVENTEEN';
  if (age >= 18 && age <= 20) return 'EIGHTEEN_TWENTY';
  return null;
}

function getYouthAgeBand(age: number): YouthAgeBand {
  if (age < 16) return 'UNDER_SIXTEEN';
  if (age <= 17) return 'SIXTEEN_SEVENTEEN';
  return 'EIGHTEEN_TWENTY';
}

function generateDateOfBirth(minAge: number, maxAge: number): Date {
  const now = new Date();
  const age = faker.number.int({ min: minAge, max: maxAge });
  const birthYear = now.getFullYear() - age;
  const birthMonth = faker.number.int({ min: 0, max: 11 });
  const birthDay = faker.number.int({ min: 1, max: 28 });
  return new Date(birthYear, birthMonth, birthDay);
}

function generateRealisticTimestamp(daysBack: number): Date {
  const now = new Date();
  const pastDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
  return faker.date.between({ from: pastDate, to: now });
}

function pickRandom<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[faker.number.int({ min: 0, max: arr.length - 1 })];
}

function pickMultiple<T>(arr: T[], min: number, max: number): T[] {
  const count = faker.number.int({ min, max: Math.min(max, arr.length) });
  const shuffled = [...arr].sort(() => faker.number.float() - 0.5);
  return shuffled.slice(0, count);
}

function generateStableId(prefix: string, index: number): string {
  // Generate stable IDs based on seed and index
  const hash = `${SEED}-${prefix}-${index}`;
  return `${prefix}_${Buffer.from(hash).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)}`;
}

// ============================================
// DATA GENERATORS
// ============================================

interface GeneratedYouth {
  id: string;
  email: string;
  password: string;
  displayName: string;
  dateOfBirth: Date;
  age: number;
  city: string;
  avatarId: string;
  bio: string;
  careerAspiration: string;
  interests: string[];
  skillTags: string[];
  ageBracket: AgeBracket | null;
  youthAgeBand: YouthAgeBand;
  isKnown: boolean;
}

interface GeneratedEmployer {
  id: string;
  email: string;
  password: string;
  companyName: string;
  dateOfBirth: Date;
  bio: string;
  city: string;
  isKnown: boolean;
}

interface GeneratedJob {
  id: string;
  employerId: string;
  title: string;
  category: JobCategory;
  description: string;
  payType: PayType;
  payAmount: number;
  location: string;
  status: JobStatus;
  riskCategory: JobRiskCategory;
  minimumAge: number;
  createdAt: Date;
  startDate: Date | null;
}

function generateYouthUsers(): GeneratedYouth[] {
  const youth: GeneratedYouth[] = [];

  // First, add known test accounts
  for (let i = 0; i < KNOWN_YOUTH.length; i++) {
    const known = KNOWN_YOUTH[i];
    const age = 15 + (i % 9); // Ages 15-23
    const dob = generateDateOfBirth(age, age);

    youth.push({
      id: generateStableId('youth', i),
      email: `${known.username}${SCALE_EMAIL_DOMAIN}`,
      password: DEFAULT_PASSWORD,
      displayName: known.displayName,
      dateOfBirth: dob,
      age,
      city: known.city,
      avatarId: AVATARS[i % AVATARS.length],
      bio: faker.lorem.sentence(),
      careerAspiration: pickRandom(CAREER_ASPIRATIONS),
      interests: pickMultiple(INTERESTS, 2, 4),
      skillTags: pickMultiple(SKILL_TAGS, 2, 5),
      ageBracket: getAgeBracket(age),
      youthAgeBand: getYouthAgeBand(age),
      isKnown: true,
    });
  }

  // Generate remaining youth
  for (let i = KNOWN_YOUTH.length; i < YOUTH_COUNT; i++) {
    const age = faker.number.int({ min: 15, max: 20 });
    const dob = generateDateOfBirth(age, age);
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    youth.push({
      id: generateStableId('youth', i),
      email: `youth${i}${SCALE_EMAIL_DOMAIN}`,
      password: DEFAULT_PASSWORD,
      displayName: `${firstName} ${lastName.charAt(0)}.`,
      dateOfBirth: dob,
      age,
      city: pickRandom(CITIES),
      avatarId: pickRandom(AVATARS),
      bio: faker.lorem.sentences(2),
      careerAspiration: pickRandom(CAREER_ASPIRATIONS),
      interests: pickMultiple(INTERESTS, 2, 5),
      skillTags: pickMultiple(SKILL_TAGS, 2, 5),
      ageBracket: getAgeBracket(age),
      youthAgeBand: getYouthAgeBand(age),
      isKnown: false,
    });
  }

  return youth;
}

function generateEmployers(): GeneratedEmployer[] {
  const employers: GeneratedEmployer[] = [];

  // First, add known test accounts
  for (let i = 0; i < KNOWN_EMPLOYERS.length; i++) {
    const known = KNOWN_EMPLOYERS[i];

    employers.push({
      id: generateStableId('employer', i),
      email: `${known.username}${SCALE_EMAIL_DOMAIN}`,
      password: DEFAULT_PASSWORD,
      companyName: known.companyName,
      dateOfBirth: generateDateOfBirth(25, 55),
      bio: faker.company.catchPhrase(),
      city: known.city,
      isKnown: true,
    });
  }

  // Generate remaining employers
  for (let i = KNOWN_EMPLOYERS.length; i < EMPLOYER_COUNT; i++) {
    const companyTypes = ['AS', 'DA', 'ENK', ''];
    const companyType = pickRandom(companyTypes);
    const companyName = `${faker.company.name()}${companyType ? ` ${companyType}` : ''}`;

    employers.push({
      id: generateStableId('employer', i),
      email: `employer${i}${SCALE_EMAIL_DOMAIN}`,
      password: DEFAULT_PASSWORD,
      companyName,
      dateOfBirth: generateDateOfBirth(25, 65),
      bio: faker.company.catchPhrase(),
      city: pickRandom(CITIES),
      isKnown: false,
    });
  }

  return employers;
}

function generateJobs(employers: GeneratedEmployer[]): GeneratedJob[] {
  const jobCount = faker.number.int({ min: MIN_JOBS, max: MAX_JOBS });
  const jobs: GeneratedJob[] = [];

  // Status distribution: 40% POSTED, 30% ASSIGNED/IN_PROGRESS, 30% COMPLETED
  const statusWeights = [
    { status: 'POSTED' as JobStatus, weight: 40 },
    { status: 'ASSIGNED' as JobStatus, weight: 15 },
    { status: 'IN_PROGRESS' as JobStatus, weight: 15 },
    { status: 'COMPLETED' as JobStatus, weight: 25 },
    { status: 'REVIEWED' as JobStatus, weight: 5 },
  ];

  function pickWeightedStatus(): JobStatus {
    const total = statusWeights.reduce((sum, s) => sum + s.weight, 0);
    let random = faker.number.int({ min: 0, max: total - 1 });
    for (const s of statusWeights) {
      if (random < s.weight) return s.status;
      random -= s.weight;
    }
    return 'POSTED';
  }

  for (let i = 0; i < jobCount; i++) {
    const employer = pickRandom(employers);
    const jobData = pickRandom(JOB_DATA);
    const status = pickWeightedStatus();
    const createdAt = generateRealisticTimestamp(90);
    const startDate = status !== 'POSTED' ? new Date(createdAt.getTime() + faker.number.int({ min: 1, max: 14 }) * 24 * 60 * 60 * 1000) : null;

    jobs.push({
      id: generateStableId('job', i),
      employerId: employer.id,
      title: pickRandom(jobData.titles),
      category: jobData.category,
      description: faker.lorem.paragraph(),
      payType: faker.datatype.boolean() ? 'FIXED' : 'HOURLY',
      payAmount: faker.number.int({ min: jobData.minPay, max: jobData.maxPay }),
      location: employer.city,
      status,
      riskCategory: jobData.risk,
      minimumAge: jobData.minAge,
      createdAt,
      startDate,
    });
  }

  return jobs;
}

// ============================================
// DATABASE OPERATIONS
// ============================================

async function resetScaleData(): Promise<void> {
  console.log('🗑️  Resetting scale test data...');

  // Delete in order to respect foreign keys
  await prisma.message.deleteMany({
    where: { conversation: { participant1: { email: { endsWith: SCALE_EMAIL_DOMAIN } } } },
  });
  await prisma.conversation.deleteMany({
    where: { participant1: { email: { endsWith: SCALE_EMAIL_DOMAIN } } },
  });
  await prisma.review.deleteMany({
    where: { reviewer: { email: { endsWith: SCALE_EMAIL_DOMAIN } } },
  });
  await prisma.application.deleteMany({
    where: { youth: { email: { endsWith: SCALE_EMAIL_DOMAIN } } },
  });
  await prisma.shadowRequest.deleteMany({
    where: { youth: { email: { endsWith: SCALE_EMAIL_DOMAIN } } },
  });
  await prisma.microJob.deleteMany({
    where: { postedBy: { email: { endsWith: SCALE_EMAIL_DOMAIN } } },
  });
  await prisma.youthProfile.deleteMany({
    where: { user: { email: { endsWith: SCALE_EMAIL_DOMAIN } } },
  });
  await prisma.employerProfile.deleteMany({
    where: { user: { email: { endsWith: SCALE_EMAIL_DOMAIN } } },
  });
  await prisma.user.deleteMany({
    where: { email: { endsWith: SCALE_EMAIL_DOMAIN } },
  });

  console.log('✅ Scale data reset complete');
}

async function seedYouthUsers(youthData: GeneratedYouth[]): Promise<Map<string, string>> {
  console.log(`👤 Creating ${youthData.length} youth users...`);
  const idMap = new Map<string, string>(); // generatedId -> actualId

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  for (const youth of youthData) {
    // Check if already exists
    const existing = await prisma.user.findUnique({ where: { email: youth.email } });
    if (existing) {
      idMap.set(youth.id, existing.id);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        email: youth.email,
        password: hashedPassword,
        role: 'YOUTH',
        dateOfBirth: youth.dateOfBirth,
        ageBracket: youth.ageBracket,
        youthAgeBand: youth.youthAgeBand,
        accountStatus: 'ACTIVE',
        location: youth.city,
        youthProfile: {
          create: {
            displayName: youth.displayName,
            avatarId: youth.avatarId,
            bio: youth.bio,
            city: youth.city,
            careerAspiration: youth.careerAspiration,
            interests: youth.interests,
            skillTags: youth.skillTags,
            profileVisibility: true,
          },
        },
      },
    });

    idMap.set(youth.id, user.id);
  }

  console.log(`✅ Created ${youthData.length} youth users`);
  return idMap;
}

async function seedEmployers(employerData: GeneratedEmployer[]): Promise<Map<string, string>> {
  console.log(`🏢 Creating ${employerData.length} employers...`);
  const idMap = new Map<string, string>();

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  for (const employer of employerData) {
    const existing = await prisma.user.findUnique({ where: { email: employer.email } });
    if (existing) {
      idMap.set(employer.id, existing.id);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        email: employer.email,
        password: hashedPassword,
        role: 'EMPLOYER',
        dateOfBirth: employer.dateOfBirth,
        accountStatus: 'ACTIVE',
        location: employer.city,
        isVerifiedAdult: true,
        verifiedAt: new Date(),
        employerProfile: {
          create: {
            companyName: employer.companyName,
            bio: employer.bio,
            verified: true,
            eidVerified: true,
            eidVerifiedAt: new Date(),
            ageVerified: true,
          },
        },
      },
    });

    idMap.set(employer.id, user.id);
  }

  console.log(`✅ Created ${employerData.length} employers`);
  return idMap;
}

async function seedJobs(
  jobData: GeneratedJob[],
  employerIdMap: Map<string, string>
): Promise<Map<string, string>> {
  console.log(`💼 Creating ${jobData.length} jobs...`);
  const idMap = new Map<string, string>();

  for (const job of jobData) {
    const employerId = employerIdMap.get(job.employerId);
    if (!employerId) continue;

    const microJob = await prisma.microJob.create({
      data: {
        title: job.title,
        category: job.category,
        description: job.description,
        payType: job.payType,
        payAmount: job.payAmount,
        location: job.location,
        status: job.status,
        riskCategory: job.riskCategory,
        minimumAge: job.minimumAge,
        postedById: employerId,
        createdAt: job.createdAt,
        startDate: job.startDate,
      },
    });

    idMap.set(job.id, microJob.id);
  }

  console.log(`✅ Created ${jobData.length} jobs`);
  return idMap;
}

async function seedApplications(
  youthData: GeneratedYouth[],
  jobData: GeneratedJob[],
  youthIdMap: Map<string, string>,
  jobIdMap: Map<string, string>
): Promise<void> {
  console.log('📝 Creating applications...');
  let applicationCount = 0;

  // Each youth applies to 1-8 jobs
  for (const youth of youthData) {
    const youthId = youthIdMap.get(youth.id);
    if (!youthId) continue;

    // Filter eligible jobs based on age
    const eligibleJobs = jobData.filter(
      (job) => youth.age >= job.minimumAge && job.status !== 'CANCELLED'
    );

    const applicationCount_forYouth = faker.number.int({ min: 1, max: Math.min(8, eligibleJobs.length) });
    const jobsToApply = pickMultiple(eligibleJobs, applicationCount_forYouth, applicationCount_forYouth);

    for (const job of jobsToApply) {
      const jobId = jobIdMap.get(job.id);
      if (!jobId) continue;

      // Determine status based on job status
      let status: ApplicationStatus = 'PENDING';
      if (job.status === 'ASSIGNED' || job.status === 'IN_PROGRESS' || job.status === 'COMPLETED' || job.status === 'REVIEWED') {
        // One application per assigned/completed job should be ACCEPTED
        status = faker.datatype.boolean(0.3) ? 'ACCEPTED' : 'PENDING';
      }

      try {
        await prisma.application.create({
          data: {
            jobId,
            youthId,
            message: faker.lorem.sentence(),
            status,
            createdAt: new Date(job.createdAt.getTime() + faker.number.int({ min: 1, max: 72 }) * 60 * 60 * 1000),
          },
        });
        applicationCount++;
      } catch {
        // Skip duplicate applications
      }
    }
  }

  console.log(`✅ Created ${applicationCount} applications`);
}

async function seedMessages(
  youthData: GeneratedYouth[],
  employerData: GeneratedEmployer[],
  jobData: GeneratedJob[],
  youthIdMap: Map<string, string>,
  employerIdMap: Map<string, string>,
  jobIdMap: Map<string, string>
): Promise<void> {
  const messageCount = faker.number.int({ min: MIN_MESSAGES, max: MAX_MESSAGES });
  console.log(`💬 Creating ${messageCount} messages...`);

  let created = 0;
  const conversationCache = new Map<string, string>();

  while (created < messageCount) {
    const youth = pickRandom(youthData);
    const employer = pickRandom(employerData);

    if (!youth || !employer) continue;

    const employerJobs = jobData.filter((j) => j.employerId === employer.id);
    const job = pickRandom(employerJobs);

    if (!job) continue;

    const youthId = youthIdMap.get(youth.id);
    const employerId = employerIdMap.get(employer.id);
    const jobId = jobIdMap.get(job.id);

    if (!youthId || !employerId || !jobId) continue;

    // Get or create conversation
    const conversationKey = `${youthId}-${employerId}-${jobId}`;
    let conversationId = conversationCache.get(conversationKey);

    if (!conversationId) {
      try {
        const [p1, p2] = [youthId, employerId].sort();
        const conversation = await prisma.conversation.create({
          data: {
            participant1Id: p1,
            participant2Id: p2,
            jobId,
            status: 'ACTIVE',
          },
        });
        conversationId = conversation.id;
        conversationCache.set(conversationKey, conversationId);
      } catch {
        // Conversation might already exist
        const [p1, p2] = [youthId, employerId].sort();
        const existing = await prisma.conversation.findFirst({
          where: { participant1Id: p1, participant2Id: p2, jobId },
        });
        if (existing) {
          conversationId = existing.id;
          conversationCache.set(conversationKey, conversationId);
        } else {
          continue;
        }
      }
    }

    // Create message
    const senderId = faker.datatype.boolean() ? youthId : employerId;
    const intent = MESSAGE_INTENTS[faker.number.int({ min: 0, max: MESSAGE_INTENTS.length - 1 })];

    await prisma.message.create({
      data: {
        conversationId,
        senderId,
        intent,
        variables: {},
        renderedMessage: faker.lorem.sentence(),
        createdAt: generateRealisticTimestamp(30),
      },
    });

    created++;
  }

  console.log(`✅ Created ${messageCount} messages`);
}

async function seedShadowRequests(
  youthData: GeneratedYouth[],
  youthIdMap: Map<string, string>
): Promise<void> {
  console.log('🔍 Creating shadow requests...');

  // Create shadow requests for about 30% of youth
  const youthWithShadows = youthData.filter(() => faker.datatype.boolean(0.3));
  let created = 0;

  const roles = [
    'Software Developer',
    'Nurse',
    'Teacher',
    'Electrician',
    'Architect',
    'Chef',
    'Veterinarian',
    'Graphic Designer',
    'Physical Therapist',
    'Civil Engineer',
  ];

  const statuses: ShadowRequestStatus[] = ['DRAFT', 'PENDING', 'APPROVED', 'COMPLETED', 'DECLINED'];
  const formats: ShadowFormat[] = ['WALKTHROUGH', 'HALF_DAY', 'FULL_DAY'];
  const goals: ShadowLearningGoal[] = ['DAILY_WORK', 'SKILLS_USED', 'WORK_ENVIRONMENT', 'CAREER_PATH'];

  for (const youth of youthWithShadows) {
    const youthId = youthIdMap.get(youth.id);
    if (!youthId) continue;

    // Each youth has 1-3 shadow requests
    const requestCount = faker.number.int({ min: 1, max: 3 });

    for (let i = 0; i < requestCount; i++) {
      await prisma.shadowRequest.create({
        data: {
          youthId,
          roleTitle: pickRandom(roles),
          roleCategory: 'General',
          learningGoals: pickMultiple(goals, 1, 2),
          format: pickRandom(formats),
          message: faker.lorem.paragraph(),
          status: pickRandom(statuses),
          preferredDays: pickMultiple(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], 2, 4),
          createdAt: generateRealisticTimestamp(60),
        },
      });
      created++;
    }
  }

  console.log(`✅ Created ${created} shadow requests`);
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main(): Promise<void> {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║          SPROUT SCALE DATA SEEDER                        ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🎲 Seed value: ${SEED}`);
  console.log(`📧 Email domain: ${SCALE_EMAIL_DOMAIN}`);
  console.log('');

  // Set faker seed for deterministic data
  faker.seed(SEED);

  // Reset if requested
  if (SCALE_DATA_RESET) {
    await resetScaleData();
    console.log('');
  }

  // Generate data
  console.log('📊 Generating data...');
  const youthData = generateYouthUsers();
  const employerData = generateEmployers();
  const jobData = generateJobs(employerData);
  console.log(`   - ${youthData.length} youth users`);
  console.log(`   - ${employerData.length} employers`);
  console.log(`   - ${jobData.length} jobs`);
  console.log('');

  // Seed data
  const youthIdMap = await seedYouthUsers(youthData);
  const employerIdMap = await seedEmployers(employerData);
  const jobIdMap = await seedJobs(jobData, employerIdMap);
  await seedApplications(youthData, jobData, youthIdMap, jobIdMap);
  await seedMessages(youthData, employerData, jobData, youthIdMap, employerIdMap, jobIdMap);
  await seedShadowRequests(youthData, youthIdMap);

  // Print credentials
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                    TEST CREDENTIALS                      ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('YOUTH USERS:');
  console.log('┌────────────────────────────────────────────────────────────┐');
  for (const known of KNOWN_YOUTH) {
    console.log(`│  Email: ${known.username}${SCALE_EMAIL_DOMAIN}`.padEnd(60) + '│');
    console.log(`│  Password: ${DEFAULT_PASSWORD}`.padEnd(60) + '│');
    console.log(`│  Name: ${known.displayName}`.padEnd(60) + '│');
    console.log(`│  Role: YOUTH`.padEnd(60) + '│');
    console.log('├────────────────────────────────────────────────────────────┤');
  }
  console.log('└────────────────────────────────────────────────────────────┘');
  console.log('');
  console.log('EMPLOYER USERS:');
  console.log('┌────────────────────────────────────────────────────────────┐');
  for (const known of KNOWN_EMPLOYERS) {
    console.log(`│  Email: ${known.username}${SCALE_EMAIL_DOMAIN}`.padEnd(60) + '│');
    console.log(`│  Password: ${DEFAULT_PASSWORD}`.padEnd(60) + '│');
    console.log(`│  Company: ${known.companyName}`.padEnd(60) + '│');
    console.log(`│  Role: EMPLOYER`.padEnd(60) + '│');
    console.log('├────────────────────────────────────────────────────────────┤');
  }
  console.log('└────────────────────────────────────────────────────────────┘');
  console.log('');
  console.log('✅ Scale data seeding complete!');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
