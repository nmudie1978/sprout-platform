import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const avatarIds = [
  "pixel-warrior",
  "pixel-mage",
  "nature-fox",
  "kawaii-mushroom",
  "kpop-purple",
  "space-rocket",
  "nature-bunny",
  "pixel-explorer",
  "kpop-butterfly",
  "kawaii-rainbow",
];

const fakeYouthWorkers = [
  { name: "Emma Larsen", skills: ["Dog lover", "Reliable", "Punctual"], rating: 4.8, jobs: 12 },
  { name: "Oliver Hansen", skills: ["Animal care", "First aid", "Flexible"], rating: 4.5, jobs: 8 },
  { name: "Nora Andersen", skills: ["Pet sitting", "Friendly", "Energetic"], rating: 4.9, jobs: 15 },
  { name: "William Berg", skills: ["Dog training", "Patient", "Strong"], rating: 4.2, jobs: 5 },
  { name: "Maja Eriksen", skills: ["Veterinary student", "Caring", "Organized"], rating: 4.7, jobs: 10 },
  { name: "Lucas Nilsen", skills: ["Runner", "Early bird", "Dependable"], rating: 4.4, jobs: 6 },
  { name: "Sofia Johansen", skills: ["Animal rescue volunteer", "Kind", "Dedicated"], rating: 4.6, jobs: 9 },
  { name: "Henrik Olsen", skills: ["Outdoor enthusiast", "Fit", "Responsible"], rating: 4.3, jobs: 4 },
  { name: "Ingrid Dahl", skills: ["Dog grooming", "Gentle", "Experienced"], rating: 4.8, jobs: 14 },
  { name: "Erik Solberg", skills: ["Marathon runner", "Motivated", "Trustworthy"], rating: 4.1, jobs: 3 },
];

async function main() {
  console.log("🌱 Seeding test youth workers...\n");

  // Find the dog walking job in Oslo
  const dogWalkingJob = await prisma.microJob.findFirst({
    where: {
      OR: [
        { category: "DOG_WALKING" },
        { title: { contains: "dog", mode: "insensitive" } },
        { title: { contains: "Dog", mode: "insensitive" } },
      ],
    },
  });

  if (!dogWalkingJob) {
    console.log("❌ No dog walking job found. Here are available jobs:");
    const jobs = await prisma.microJob.findMany({
      select: { id: true, title: true, category: true, location: true },
    });
    console.table(jobs);

    if (jobs.length > 0) {
      console.log("\n📝 Using first available job instead...");
      const firstJob = jobs[0];
      await seedWithJob(firstJob.id);
    }
    return;
  }

  console.log(`✅ Found job: "${dogWalkingJob.title}" (${dogWalkingJob.id})\n`);
  await seedWithJob(dogWalkingJob.id);
}

async function seedWithJob(jobId: string) {
  const hashedPassword = await hash("testpassword123", 12);
  const createdUsers: string[] = [];

  // Create 10 youth workers
  for (let i = 0; i < fakeYouthWorkers.length; i++) {
    const worker = fakeYouthWorkers[i];
    const email = `test.youth${i + 1}@example.com`;
    const slug = worker.name.toLowerCase().replace(/\s+/g, "-");

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`⏭️  User ${email} already exists, skipping...`);
      createdUsers.push(existingUser.id);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "YOUTH",
        ageBracket: i % 2 === 0 ? "EIGHTEEN_TWENTY" : "SIXTEEN_SEVENTEEN",
        youthProfile: {
          create: {
            displayName: worker.name,
            avatarId: avatarIds[i],
            bio: `Hi! I'm ${worker.name.split(" ")[0]} and I love working with animals and helping people in my community.`,
            skillTags: worker.skills,
            availability: "Weekends and after school",
            availabilityStatus: "AVAILABLE",
            profileVisibility: true,
            publicProfileSlug: slug,
            completedJobsCount: worker.jobs,
            averageRating: worker.rating,
            reliabilityScore: Math.floor(worker.rating * 20),
          },
        },
      },
    });

    createdUsers.push(user.id);
    console.log(`✅ Created: ${worker.name} (${email})`);
  }

  // Have first 5 apply for the job
  console.log("\n📝 Creating applications for first 5 youth workers...\n");

  const applicationMessages = [
    "Hi! I absolutely love dogs and have been walking my neighbor's dogs for years. I'm very reliable and always on time!",
    "Hello! I have experience with all dog sizes and breeds. I'm currently studying animal care and would love this opportunity.",
    "I'm passionate about animals and have my own dog at home. I know the Oslo area well and can provide great exercise routes!",
    "Hey there! I'm a runner and love combining my hobby with dog walking. Your pup will get plenty of exercise with me!",
    "Hi! I volunteer at a local animal shelter and have lots of experience handling different temperaments. Looking forward to meeting your dog!",
  ];

  for (let i = 0; i < 5; i++) {
    const userId = createdUsers[i];
    const worker = fakeYouthWorkers[i];

    // Check if application already exists
    const existingApp = await prisma.application.findFirst({
      where: { jobId, youthId: userId },
    });

    if (existingApp) {
      console.log(`⏭️  Application from ${worker.name} already exists, skipping...`);
      continue;
    }

    await prisma.application.create({
      data: {
        jobId,
        youthId: userId,
        message: applicationMessages[i],
        status: "PENDING",
      },
    });

    console.log(`✅ ${worker.name} applied for the job`);
  }

  console.log("\n🎉 Seeding complete!");
  console.log(`   - Created ${createdUsers.length} youth workers`);
  console.log(`   - 5 applications submitted`);
  console.log(`\n   Test login: test.youth1@example.com / testpassword123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
