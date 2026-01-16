import { PrismaClient } from "@prisma/client";

// Use direct connection for seeding (not pooled connection)
process.env.DATABASE_URL = process.env.DIRECT_URL || process.env.DATABASE_URL;

const prisma = new PrismaClient();

const helpDocs = [
  {
    slug: "how-to-apply-for-jobs",
    title: "How to Apply for Micro-Jobs",
    content: `To apply for a job on the platform:
1. Browse jobs in the "Find Jobs" section
2. Click on a job that interests you
3. Read the full description and requirements
4. Click "Apply" button
5. Write a brief message explaining why you're a good fit
6. Submit your application

Tips:
- Mention any relevant experience from previous jobs
- Be professional but friendly
- Show enthusiasm for the work
- Keep your message concise (2-3 sentences)`,
    tags: ["jobs", "applications", "micro-jobs", "apply"],
  },
  {
    slug: "creating-your-profile",
    title: "Creating and Managing Your Youth Profile",
    content: `Your profile is your credibility on the platform.

To create a strong profile:
1. Go to the Profile page
2. Add a display name (can be different from your real name)
3. Write a short bio about yourself and your interests
4. List your availability (e.g., "Weekends and evenings")
5. Keep your profile private until you're ready to share it

Your profile automatically tracks:
- Completed jobs count
- Average rating from employers
- Skills earned from different job types

Privacy:
- Profiles are PRIVATE by default
- Only turn public when you're ready
- You control what information is visible`,
    tags: ["profile", "setup", "privacy", "youth"],
  },
  {
    slug: "exploring-careers",
    title: "How to Use the Career Explorer",
    content: `The Career Explorer lets you discover roles that match your skills.

How it works:
1. Visit the "Explore Careers" page
2. Swipe through career cards (Tinder-style)
3. See which skills you already have from your jobs
4. Save careers you're interested in
5. View full details by clicking "View Details"

Controls:
- Swipe LEFT or press ← : Not interested
- Swipe RIGHT or press → : Interested (saves career)
- Swipe UP or press ↑ : Bookmark for later
- Or use the buttons at the bottom

Your saved careers are viewable in "Explore > Saved Careers"`,
    tags: ["careers", "explore", "swipe", "skills"],
  },
  {
    slug: "asking-questions",
    title: "How to Ask Professionals Questions",
    content: `Get career advice from real professionals in the "Ask a Pro" section.

How to ask:
1. Visit "Ask a Pro" page
2. Choose a category (optional)
3. Write your question (10-500 characters)
4. Submit

Rules:
- Maximum 3 questions per day
- Questions are reviewed before being answered
- You'll see the answer in "My Questions" tab
- All published Q&A is searchable in the Q&A Library

Tips for good questions:
- Be specific (not "How do I get a job?" but "What skills do UX designers need?")
- Focus on careers, skills, or getting started
- Check the Q&A Library first - your question might be answered!`,
    tags: ["questions", "ask-a-pro", "professionals", "advice"],
  },
  {
    slug: "building-skills",
    title: "How Skills Work on the Platform",
    content: `Every job you complete builds your skills automatically.

How it works:
- Each job category develops specific soft skills
- Babysitting → Responsibility, Communication, Problem-solving
- Dog Walking → Reliability, Time-management
- Tech Help → Problem-solving, Communication, Adaptability

Your skill level increases by 10% for each job completed (max 100%).

Where skills show up:
- Your profile (Skill Radar chart)
- Career cards ("You already practice X skills!")
- Employers can see your skills when viewing your public profile

No manual input needed - just complete jobs and build your resume!`,
    tags: ["skills", "jobs", "growth", "soft-skills"],
  },
  {
    slug: "getting-paid",
    title: "How Payment Works",
    content: `For Micro-Jobs:
1. Apply for a job
2. Employer accepts your application
3. Complete the work
4. Employer marks job as completed
5. Both parties leave reviews
6. Payment is arranged directly with employer

Important:
- This platform connects youth with employers
- Payment details are agreed upon directly
- Always discuss payment before starting work
- Keep communication professional`,
    tags: ["payment", "jobs", "employers"],
  },
  {
    slug: "safety-tips",
    title: "Staying Safe on the Platform",
    content: `Your safety is our priority.

Safety guidelines:
1. Keep your profile private until you're comfortable
2. Never share personal contact info in applications
3. Meet in public places for first-time jobs (if applicable)
4. Tell a parent/guardian where you're going
5. Report any inappropriate behavior to admins

Red flags:
- Requests to work alone in private homes (first time)
- Pressure to accept jobs immediately
- Requests for personal information
- Any uncomfortable communication

Use the report feature if something doesn't feel right.`,
    tags: ["safety", "guidelines", "youth", "protection"],
  },
];

async function seedHelpDocs() {
  console.log("Seeding help documentation...");

  for (const doc of helpDocs) {
    await prisma.helpDoc.upsert({
      where: { slug: doc.slug },
      update: doc,
      create: doc,
    });
    console.log(`✅ Created/updated: ${doc.title}`);
  }

  console.log("✅ Help docs seeded successfully!");
}

seedHelpDocs()
  .catch((e) => {
    console.error("Error seeding help docs:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
