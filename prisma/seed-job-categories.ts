import { PrismaClient } from '@prisma/client';

// Job Categories and Templates Taxonomy
// All 12 categories with their templates as specified

interface JobCategoryData {
  slug: string;
  name: string;
  description: string;
  icon: string;
  sortOrder: number;
  templates: JobTemplateData[];
}

interface JobTemplateData {
  title: string;
  shortDesc: string;
  suggestedPay?: string;
  duration?: string;
  tags: string[];
  ageGuidance?: string;
  safetyNotes?: string;
  sortOrder: number;
}

export const jobCategories: JobCategoryData[] = [
  {
    slug: 'home-yard-help',
    name: 'Home & Yard Help',
    description: 'Outdoor maintenance, cleaning, and home improvement tasks',
    icon: 'home',
    sortOrder: 1,
    templates: [
      {
        title: 'Lawn mowing / leaf raking',
        shortDesc: 'Mow lawns, trim edges, or rake and bag fallen leaves',
        suggestedPay: '150–300 NOK',
        duration: '1–2 hours',
        tags: ['outdoor', 'physical', 'seasonal'],
        ageGuidance: '15+ with supervision for power equipment',
        sortOrder: 1,
      },
      {
        title: 'Snow shoveling',
        shortDesc: 'Clear driveways, walkways, and entrances of snow',
        suggestedPay: '150–250 NOK',
        duration: '30 min–1 hour',
        tags: ['outdoor', 'physical', 'winter', 'seasonal'],
        ageGuidance: '15+',
        sortOrder: 2,
      },
      {
        title: 'Garden watering / weeding',
        shortDesc: 'Water plants, pull weeds, and maintain garden beds',
        suggestedPay: '100–200 NOK',
        duration: '1–2 hours',
        tags: ['outdoor', 'gardening', 'summer'],
        sortOrder: 3,
      },
      {
        title: 'Garage or shed clean-outs',
        shortDesc: 'Help organize and clean out storage spaces',
        suggestedPay: '200–400 NOK',
        duration: '2–4 hours',
        tags: ['organizing', 'physical', 'cleaning'],
        sortOrder: 4,
      },
      {
        title: 'Trash & recycling setup',
        shortDesc: 'Sort recyclables, organize bins, take out trash',
        suggestedPay: '100–150 NOK',
        duration: '30 min–1 hour',
        tags: ['organizing', 'eco-friendly'],
        sortOrder: 5,
      },
      {
        title: 'Simple painting (fences, sheds)',
        shortDesc: 'Paint fences, sheds, or outdoor furniture',
        suggestedPay: '200–350 NOK',
        duration: '2–4 hours',
        tags: ['outdoor', 'creative', 'home-improvement'],
        ageGuidance: '16+ recommended',
        sortOrder: 6,
      },
    ],
  },
  {
    slug: 'child-family-support',
    name: 'Child & Family Support',
    description: 'Childcare, tutoring, and family assistance',
    icon: 'baby',
    sortOrder: 2,
    templates: [
      {
        title: 'Babysitting / mother\'s helper',
        shortDesc: 'Care for children while parents are home or away',
        suggestedPay: '150–250 NOK/hour',
        duration: '2–4 hours',
        tags: ['childcare', 'responsibility', 'patience'],
        ageGuidance: '16+ for solo babysitting',
        safetyNotes: 'Parent/guardian should be reachable at all times',
        sortOrder: 1,
      },
      {
        title: 'Homework helper (younger kids)',
        shortDesc: 'Help younger children with homework and studying',
        suggestedPay: '150–200 NOK/hour',
        duration: '1–2 hours',
        tags: ['tutoring', 'patience', 'education'],
        sortOrder: 2,
      },
      {
        title: 'School run assistance',
        shortDesc: 'Walk children to/from school or bus stops',
        suggestedPay: '100–150 NOK',
        duration: '30 min–1 hour',
        tags: ['childcare', 'reliability', 'morning'],
        safetyNotes: 'Must know safe routes and emergency contacts',
        sortOrder: 3,
      },
      {
        title: 'Toy / room organization',
        shortDesc: 'Help organize children\'s toys, books, and rooms',
        suggestedPay: '150–250 NOK',
        duration: '1–3 hours',
        tags: ['organizing', 'childcare'],
        sortOrder: 4,
      },
      {
        title: 'Party setup & cleanup',
        shortDesc: 'Help set up and clean up after kids\' birthday parties',
        suggestedPay: '200–350 NOK',
        duration: '2–4 hours',
        tags: ['events', 'physical', 'teamwork'],
        sortOrder: 5,
      },
    ],
  },
  {
    slug: 'pet-animal-care',
    name: 'Pet & Animal Care',
    description: 'Dog walking, pet sitting, and animal assistance',
    icon: 'dog',
    sortOrder: 3,
    templates: [
      {
        title: 'Dog walking',
        shortDesc: 'Walk dogs in the neighborhood or local parks',
        suggestedPay: '100–200 NOK',
        duration: '30 min–1 hour',
        tags: ['animals', 'outdoor', 'exercise'],
        sortOrder: 1,
      },
      {
        title: 'Pet sitting (short periods)',
        shortDesc: 'Visit homes to feed and care for pets while owners are away',
        suggestedPay: '150–250 NOK/visit',
        duration: '30 min–1 hour per visit',
        tags: ['animals', 'responsibility', 'trust'],
        sortOrder: 2,
      },
      {
        title: 'Feeding animals while owners are away',
        shortDesc: 'Daily visits to feed and check on pets',
        suggestedPay: '100–150 NOK/visit',
        duration: '15–30 min per visit',
        tags: ['animals', 'reliability'],
        sortOrder: 3,
      },
      {
        title: 'Cleaning cages / aquariums',
        shortDesc: 'Clean and maintain pet enclosures, cages, or fish tanks',
        suggestedPay: '150–250 NOK',
        duration: '1–2 hours',
        tags: ['animals', 'cleaning', 'detail-oriented'],
        sortOrder: 4,
      },
      {
        title: 'Grooming assistance (not cutting)',
        shortDesc: 'Help brush, bathe, or groom pets (no hair cutting)',
        suggestedPay: '100–200 NOK',
        duration: '30 min–1 hour',
        tags: ['animals', 'patience', 'gentle'],
        safetyNotes: 'No cutting or trimming - brushing and washing only',
        sortOrder: 5,
      },
    ],
  },
  {
    slug: 'cleaning-organizing',
    name: 'Cleaning & Organizing',
    description: 'Indoor cleaning, tidying, and organizational tasks',
    icon: 'sparkles',
    sortOrder: 4,
    templates: [
      {
        title: 'Room tidying',
        shortDesc: 'General tidying and organizing of rooms',
        suggestedPay: '150–250 NOK',
        duration: '1–2 hours',
        tags: ['cleaning', 'organizing', 'indoor'],
        sortOrder: 1,
      },
      {
        title: 'Closet organization',
        shortDesc: 'Sort, organize, and arrange closets and wardrobes',
        suggestedPay: '150–300 NOK',
        duration: '1–3 hours',
        tags: ['organizing', 'detail-oriented'],
        sortOrder: 2,
      },
      {
        title: 'Car interior cleaning',
        shortDesc: 'Vacuum, wipe, and organize car interiors',
        suggestedPay: '150–250 NOK',
        duration: '1–2 hours',
        tags: ['cleaning', 'detail-oriented', 'outdoor'],
        sortOrder: 3,
      },
      {
        title: 'Window cleaning (ground floor only)',
        shortDesc: 'Clean accessible windows from ground level',
        suggestedPay: '150–250 NOK',
        duration: '1–2 hours',
        tags: ['cleaning', 'detail-oriented'],
        safetyNotes: 'Ground floor only - no ladders or heights',
        sortOrder: 4,
      },
      {
        title: 'Laundry folding',
        shortDesc: 'Fold and organize clean laundry',
        suggestedPay: '100–150 NOK',
        duration: '30 min–1 hour',
        tags: ['organizing', 'indoor', 'household'],
        sortOrder: 5,
      },
      {
        title: 'Decluttering help',
        shortDesc: 'Assist with sorting and decluttering spaces',
        suggestedPay: '150–300 NOK',
        duration: '2–4 hours',
        tags: ['organizing', 'decision-making'],
        sortOrder: 6,
      },
    ],
  },
  {
    slug: 'tech-digital-help',
    name: 'Tech & Digital Help',
    description: 'Technology assistance for parents and grandparents',
    icon: 'smartphone',
    sortOrder: 5,
    templates: [
      {
        title: 'Phone setup for parents/grandparents',
        shortDesc: 'Help set up and explain smartphone features',
        suggestedPay: '150–250 NOK',
        duration: '1–2 hours',
        tags: ['tech', 'patience', 'teaching'],
        sortOrder: 1,
      },
      {
        title: 'App installation & settings',
        shortDesc: 'Install apps and configure device settings',
        suggestedPay: '100–200 NOK',
        duration: '30 min–1 hour',
        tags: ['tech', 'detail-oriented'],
        sortOrder: 2,
      },
      {
        title: 'Email setup',
        shortDesc: 'Set up and configure email accounts on devices',
        suggestedPay: '100–150 NOK',
        duration: '30 min–1 hour',
        tags: ['tech', 'communication'],
        sortOrder: 3,
      },
      {
        title: 'Social media posting help',
        shortDesc: 'Assist with posting on social media platforms',
        suggestedPay: '100–200 NOK',
        duration: '30 min–1 hour',
        tags: ['tech', 'social-media', 'creative'],
        sortOrder: 4,
      },
      {
        title: 'Basic photo editing',
        shortDesc: 'Simple photo editing, cropping, and enhancements',
        suggestedPay: '100–200 NOK',
        duration: '30 min–1 hour',
        tags: ['tech', 'creative', 'visual'],
        sortOrder: 5,
      },
      {
        title: 'File organization (Google Drive, iCloud)',
        shortDesc: 'Organize digital files and folders in cloud storage',
        suggestedPay: '150–250 NOK',
        duration: '1–2 hours',
        tags: ['tech', 'organizing', 'detail-oriented'],
        sortOrder: 6,
      },
    ],
  },
  {
    slug: 'errands-local-tasks',
    name: 'Errands & Local Tasks',
    description: 'Shopping, deliveries, and local assistance',
    icon: 'shopping-bag',
    sortOrder: 6,
    templates: [
      {
        title: 'Grocery pickup',
        shortDesc: 'Pick up groceries from local stores',
        suggestedPay: '100–200 NOK',
        duration: '30 min–1 hour',
        tags: ['errands', 'reliability', 'local'],
        sortOrder: 1,
      },
      {
        title: 'Pharmacy pickup (non-medical)',
        shortDesc: 'Pick up non-prescription items from pharmacy',
        suggestedPay: '100–150 NOK',
        duration: '30 min–1 hour',
        tags: ['errands', 'reliability'],
        safetyNotes: 'Non-prescription items only - no controlled medications',
        sortOrder: 2,
      },
      {
        title: 'Return packages',
        shortDesc: 'Drop off packages at post offices or return points',
        suggestedPay: '75–150 NOK',
        duration: '30 min–1 hour',
        tags: ['errands', 'local'],
        sortOrder: 3,
      },
      {
        title: 'Queue waiting',
        shortDesc: 'Wait in line for others at offices or stores',
        suggestedPay: '100–150 NOK/hour',
        duration: '1–3 hours',
        tags: ['errands', 'patience'],
        sortOrder: 4,
      },
      {
        title: 'Local deliveries (walking/bike)',
        shortDesc: 'Deliver items locally by walking or bike',
        suggestedPay: '75–150 NOK',
        duration: '30 min–1 hour',
        tags: ['errands', 'delivery', 'exercise'],
        sortOrder: 5,
      },
    ],
  },
  {
    slug: 'events-community-help',
    name: 'Events & Community Help',
    description: 'Event assistance and community service',
    icon: 'party-popper',
    sortOrder: 7,
    templates: [
      {
        title: 'Birthday party helper',
        shortDesc: 'Assist with children\'s birthday parties',
        suggestedPay: '200–350 NOK',
        duration: '2–4 hours',
        tags: ['events', 'childcare', 'energetic'],
        sortOrder: 1,
      },
      {
        title: 'Event setup/tear-down',
        shortDesc: 'Help set up and take down event equipment',
        suggestedPay: '150–300 NOK',
        duration: '2–4 hours',
        tags: ['events', 'physical', 'teamwork'],
        sortOrder: 2,
      },
      {
        title: 'Community cleanups',
        shortDesc: 'Participate in local community cleanup events',
        suggestedPay: '100–200 NOK',
        duration: '2–4 hours',
        tags: ['community', 'outdoor', 'eco-friendly'],
        sortOrder: 3,
      },
      {
        title: 'Sports day assistance',
        shortDesc: 'Help run sports events and activities',
        suggestedPay: '150–300 NOK',
        duration: '3–6 hours',
        tags: ['events', 'sports', 'energetic'],
        sortOrder: 4,
      },
      {
        title: 'Festival helpers',
        shortDesc: 'Assist at local festivals and fairs',
        suggestedPay: '150–300 NOK',
        duration: '3–6 hours',
        tags: ['events', 'community', 'social'],
        sortOrder: 5,
      },
      {
        title: 'Church / mosque / community hall help',
        shortDesc: 'Help with setup, serving, or cleanup at community venues',
        suggestedPay: '100–250 NOK',
        duration: '2–4 hours',
        tags: ['community', 'service', 'teamwork'],
        sortOrder: 6,
      },
    ],
  },
  {
    slug: 'creative-media-gigs',
    name: 'Creative & Media Gigs',
    description: 'Design, photography, and content creation',
    icon: 'palette',
    sortOrder: 8,
    templates: [
      {
        title: 'Simple logo design (Canva)',
        shortDesc: 'Create basic logos using Canva or similar tools',
        suggestedPay: '200–400 NOK',
        duration: '1–3 hours',
        tags: ['creative', 'design', 'digital'],
        sortOrder: 1,
      },
      {
        title: 'Poster/flyer creation',
        shortDesc: 'Design posters and flyers for events or businesses',
        suggestedPay: '150–350 NOK',
        duration: '1–2 hours',
        tags: ['creative', 'design', 'marketing'],
        sortOrder: 2,
      },
      {
        title: 'Photo taking (non-commercial)',
        shortDesc: 'Take photos at events or for personal use',
        suggestedPay: '150–300 NOK',
        duration: '1–3 hours',
        tags: ['creative', 'photography', 'events'],
        safetyNotes: 'Personal use only - not for commercial purposes',
        sortOrder: 3,
      },
      {
        title: 'Video trimming (CapCut, InVideo)',
        shortDesc: 'Edit and trim video clips using simple tools',
        suggestedPay: '150–350 NOK',
        duration: '1–3 hours',
        tags: ['creative', 'video', 'digital'],
        sortOrder: 4,
      },
      {
        title: 'Captions & content ideas',
        shortDesc: 'Write social media captions and brainstorm content',
        suggestedPay: '100–250 NOK',
        duration: '1–2 hours',
        tags: ['creative', 'writing', 'social-media'],
        sortOrder: 5,
      },
      {
        title: 'School presentation design',
        shortDesc: 'Help create engaging presentation slides',
        suggestedPay: '150–300 NOK',
        duration: '1–3 hours',
        tags: ['creative', 'design', 'education'],
        sortOrder: 6,
      },
    ],
  },
  {
    slug: 'education-learning-support',
    name: 'Education & Learning Support',
    description: 'Tutoring, study help, and educational assistance',
    icon: 'graduation-cap',
    sortOrder: 9,
    templates: [
      {
        title: 'Tutoring younger students',
        shortDesc: 'Help younger students with schoolwork',
        suggestedPay: '150–250 NOK/hour',
        duration: '1–2 hours',
        tags: ['tutoring', 'education', 'patience'],
        sortOrder: 1,
      },
      {
        title: 'Language practice partner',
        shortDesc: 'Practice conversation in a foreign language',
        suggestedPay: '150–200 NOK/hour',
        duration: '1 hour',
        tags: ['language', 'communication', 'education'],
        sortOrder: 2,
      },
      {
        title: 'Exam prep helper',
        shortDesc: 'Help students prepare for exams with quizzing and review',
        suggestedPay: '150–250 NOK/hour',
        duration: '1–2 hours',
        tags: ['tutoring', 'education', 'focus'],
        sortOrder: 3,
      },
      {
        title: 'Flashcard creation',
        shortDesc: 'Create study flashcards physical or digital',
        suggestedPay: '100–200 NOK',
        duration: '1–2 hours',
        tags: ['education', 'organizing', 'detail-oriented'],
        sortOrder: 4,
      },
      {
        title: 'Note organization',
        shortDesc: 'Organize and digitize study notes',
        suggestedPay: '100–200 NOK',
        duration: '1–2 hours',
        tags: ['education', 'organizing', 'digital'],
        sortOrder: 5,
      },
    ],
  },
  {
    slug: 'retail-microbusiness-help',
    name: 'Retail & Micro-Business Help',
    description: 'Assistance for small shops and market stalls',
    icon: 'store',
    sortOrder: 10,
    templates: [
      {
        title: 'Stock sorting',
        shortDesc: 'Sort and organize inventory and stock',
        suggestedPay: '150–250 NOK',
        duration: '2–4 hours',
        tags: ['retail', 'organizing', 'physical'],
        sortOrder: 1,
      },
      {
        title: 'Shelf labeling',
        shortDesc: 'Label shelves and organize product displays',
        suggestedPay: '100–200 NOK',
        duration: '1–2 hours',
        tags: ['retail', 'detail-oriented'],
        sortOrder: 2,
      },
      {
        title: 'Window dressing help',
        shortDesc: 'Assist with arranging window displays',
        suggestedPay: '150–250 NOK',
        duration: '1–3 hours',
        tags: ['retail', 'creative', 'visual'],
        sortOrder: 3,
      },
      {
        title: 'Inventory counting',
        shortDesc: 'Count and record inventory items',
        suggestedPay: '150–250 NOK',
        duration: '2–4 hours',
        tags: ['retail', 'detail-oriented', 'math'],
        sortOrder: 4,
      },
      {
        title: 'Pop-up stall assistant',
        shortDesc: 'Help run pop-up shops and market stalls',
        suggestedPay: '150–300 NOK',
        duration: '3–6 hours',
        tags: ['retail', 'customer-service', 'social'],
        sortOrder: 5,
      },
      {
        title: 'Market stand helper',
        shortDesc: 'Assist at farmers markets or flea markets',
        suggestedPay: '150–300 NOK',
        duration: '3–6 hours',
        tags: ['retail', 'outdoor', 'social'],
        sortOrder: 6,
      },
    ],
  },
  {
    slug: 'fitness-activity-help',
    name: 'Fitness & Activity Help',
    description: 'Sports assistance and active tasks',
    icon: 'dumbbell',
    sortOrder: 11,
    templates: [
      {
        title: 'Sports coaching assistant',
        shortDesc: 'Help coaches with youth sports practices',
        suggestedPay: '150–250 NOK',
        duration: '1–2 hours',
        tags: ['sports', 'coaching', 'energetic'],
        sortOrder: 1,
      },
      {
        title: 'Walking companion',
        shortDesc: 'Accompany elderly or others on walks',
        suggestedPay: '100–150 NOK',
        duration: '30 min–1 hour',
        tags: ['fitness', 'companionship', 'outdoor'],
        sortOrder: 2,
      },
      {
        title: 'Bike cleaning/maintenance',
        shortDesc: 'Clean and perform basic bike maintenance',
        suggestedPay: '100–200 NOK',
        duration: '1–2 hours',
        tags: ['maintenance', 'outdoor', 'physical'],
        sortOrder: 3,
      },
      {
        title: 'Personal training helper (non-instructional)',
        shortDesc: 'Assist personal trainers with equipment and setup',
        suggestedPay: '100–200 NOK',
        duration: '1–2 hours',
        tags: ['fitness', 'physical', 'teamwork'],
        safetyNotes: 'Assistance only - no exercise instruction',
        sortOrder: 4,
      },
      {
        title: 'Gym tidying help',
        shortDesc: 'Help organize and clean gym equipment',
        suggestedPay: '100–200 NOK',
        duration: '1–2 hours',
        tags: ['fitness', 'cleaning', 'physical'],
        sortOrder: 5,
      },
    ],
  },
  {
    slug: 'online-ai-age-jobs',
    name: 'Online & AI-Age Jobs',
    description: 'Digital tasks and AI-related assistance',
    icon: 'cpu',
    sortOrder: 12,
    templates: [
      {
        title: 'Prompt writing',
        shortDesc: 'Write prompts for AI tools and chatbots',
        suggestedPay: '150–300 NOK',
        duration: '1–2 hours',
        tags: ['ai', 'writing', 'creative'],
        sortOrder: 1,
      },
      {
        title: 'AI tool testing',
        shortDesc: 'Test and provide feedback on AI applications',
        suggestedPay: '100–250 NOK',
        duration: '1–2 hours',
        tags: ['ai', 'testing', 'detail-oriented'],
        sortOrder: 2,
      },
      {
        title: 'Dataset labeling (text/images)',
        shortDesc: 'Label data for machine learning training',
        suggestedPay: '100–200 NOK',
        duration: '1–3 hours',
        tags: ['ai', 'data', 'detail-oriented'],
        sortOrder: 3,
      },
      {
        title: 'Voice recording for datasets',
        shortDesc: 'Record voice samples for AI training',
        suggestedPay: '100–200 NOK',
        duration: '30 min–1 hour',
        tags: ['ai', 'audio', 'voice'],
        sortOrder: 4,
      },
      {
        title: 'Chatbot response testing',
        shortDesc: 'Test chatbot responses and report issues',
        suggestedPay: '100–200 NOK',
        duration: '1–2 hours',
        tags: ['ai', 'testing', 'communication'],
        sortOrder: 5,
      },
      {
        title: 'Website content tagging',
        shortDesc: 'Tag and categorize website content',
        suggestedPay: '100–200 NOK',
        duration: '1–2 hours',
        tags: ['digital', 'organizing', 'detail-oriented'],
        sortOrder: 6,
      },
    ],
  },
];

// Disallowed job types - for safety guidance (not seeded, just for UI warning)
export const DISALLOWED_JOB_TYPES = [
  'construction',
  'heavy machinery',
  'night work',
  'medical care',
  'financial handling',
  'driving jobs',
  'one-on-one adult-only home visits without supervision',
];

// Safety markers that trigger safety notes display
export const SAFETY_MARKERS = [
  '(ground floor only)',
  '(non-medical)',
  '(not cutting)',
  '(non-instructional)',
];

export async function seedJobCategories(prisma: PrismaClient): Promise<void> {
  console.log('📁 Seeding job categories and templates...');

  let totalCategories = 0;
  let totalTemplates = 0;

  for (const categoryData of jobCategories) {
    // Upsert category
    const category = await prisma.standardJobCategory.upsert({
      where: { slug: categoryData.slug },
      update: {
        name: categoryData.name,
        description: categoryData.description,
        icon: categoryData.icon,
        sortOrder: categoryData.sortOrder,
        isActive: true,
      },
      create: {
        slug: categoryData.slug,
        name: categoryData.name,
        description: categoryData.description,
        icon: categoryData.icon,
        sortOrder: categoryData.sortOrder,
        isActive: true,
      },
    });
    totalCategories++;

    // Upsert templates for this category
    for (const templateData of categoryData.templates) {
      await prisma.standardJobTemplate.upsert({
        where: {
          categoryId_title: {
            categoryId: category.id,
            title: templateData.title,
          },
        },
        update: {
          shortDesc: templateData.shortDesc,
          suggestedPay: templateData.suggestedPay,
          duration: templateData.duration,
          tags: templateData.tags,
          ageGuidance: templateData.ageGuidance,
          safetyNotes: templateData.safetyNotes,
          sortOrder: templateData.sortOrder,
          isActive: true,
        },
        create: {
          categoryId: category.id,
          title: templateData.title,
          shortDesc: templateData.shortDesc,
          suggestedPay: templateData.suggestedPay,
          duration: templateData.duration,
          tags: templateData.tags,
          ageGuidance: templateData.ageGuidance,
          safetyNotes: templateData.safetyNotes,
          sortOrder: templateData.sortOrder,
          isActive: true,
        },
      });
      totalTemplates++;
    }
  }

  console.log(`✅ Seeded ${totalCategories} job categories with ${totalTemplates} templates`);
}
