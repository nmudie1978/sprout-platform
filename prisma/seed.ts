import { PrismaClient, JobCategory, PayType, MessageTemplateDirection, LifeSkillAudience, SkillCategory, TrustSignalType, TrustSignalSource, ResponsibilityLevel, SupervisionLevel, JobCompletionOutcome } from '@prisma/client';
import { seedYouthCareers } from './seed-youth-careers';
import { seedJobCategories } from './seed-job-categories';

// Use direct connection for seeding (not pooled connection)
process.env.DATABASE_URL = process.env.DIRECT_URL || process.env.DATABASE_URL;

const prisma = new PrismaClient();

// ============================================
// LIFE SKILLS CARDS - Contextual Micro-Guidance
// Version 1.0 - Approved content only
// ============================================
const lifeSkillCards = [
  {
    key: 'FIRST_JOB_ACCEPTED',
    title: 'Your first job',
    body: "Congratulations! You're about to earn your first income. A few things help: confirm the time and place in writing, arrive 5 minutes early, and if anything is unclear—just ask. Employers appreciate questions more than mistakes.",
    tags: ['first-time', 'preparation', 'communication'],
    audience: LifeSkillAudience.YOUTH,
    version: 'v1',
  },
  {
    key: 'FIRST_MESSAGE_TO_ADULT',
    title: 'Keep it simple',
    body: "When messaging an employer, be polite and to the point. Start with a greeting, state your question or confirmation clearly, and sign off with your name. You don't need to be formal—just respectful.",
    tags: ['communication', 'messaging', 'first-time'],
    audience: LifeSkillAudience.YOUTH,
    version: 'v1',
  },
  {
    key: 'ARRIVING_ON_TIME',
    title: 'Being on time',
    body: "Punctuality builds trust. Plan to arrive 5–10 minutes before the agreed time. If you're using public transport, check the route the night before. Being early shows you take the job seriously.",
    tags: ['punctuality', 'preparation', 'reliability'],
    audience: LifeSkillAudience.YOUTH,
    version: 'v1',
  },
  {
    key: 'RUNNING_LATE',
    title: "If you're running late",
    body: "Things happen! If you're going to be late, send a message as soon as you know—don't wait. Say when you expect to arrive. Most people are understanding if you communicate early.",
    tags: ['communication', 'punctuality', 'problem-solving'],
    audience: LifeSkillAudience.YOUTH,
    version: 'v1',
  },
  {
    key: 'CLARIFY_THE_TASK',
    title: "Agree what 'done' means",
    body: "Before you start, make sure you and the employer agree on what a finished job looks like. 'Clean the garden' can mean many things. A quick check at the start avoids confusion later.",
    tags: ['communication', 'expectations', 'preparation'],
    audience: LifeSkillAudience.YOUTH,
    version: 'v1',
  },
  {
    key: 'DECLINING_A_JOB',
    title: 'Saying no politely',
    body: "It's OK to decline a job if it doesn't suit you. A short, polite message works best: 'Thanks for the offer, but I'm not available for this one.' You don't need to over-explain.",
    tags: ['communication', 'boundaries', 'professionalism'],
    audience: LifeSkillAudience.YOUTH,
    version: 'v1',
  },
  {
    key: 'PRICE_AND_PAYMENT',
    title: 'Money talk (no stress)',
    body: "If the pay wasn't clear upfront, it's fine to ask politely before starting: 'Just to confirm, is the pay [amount] as listed?' Most payment is via Vipps after the job. Never feel awkward checking.",
    tags: ['payment', 'communication', 'expectations'],
    audience: LifeSkillAudience.YOUTH,
    version: 'v1',
  },
  {
    key: 'SAFETY_BOUNDARIES',
    title: 'Your boundaries matter',
    body: "You never have to do something that feels unsafe. If a job turns out to be different from what was described—or someone asks you to do something you're uncomfortable with—it's OK to leave and tell an adult you trust.",
    tags: ['safety', 'boundaries', 'wellbeing'],
    audience: LifeSkillAudience.YOUTH,
    version: 'v1',
  },
  {
    key: 'AFTER_THE_JOB',
    title: 'Wrap up well',
    body: "When you finish, let the employer know and ask if there's anything else they'd like. A quick 'Thanks for having me!' leaves a good impression—and might lead to more work.",
    tags: ['communication', 'professionalism', 'follow-up'],
    audience: LifeSkillAudience.YOUTH,
    version: 'v1',
  },
  {
    key: 'WHEN_SOMETHING_FEELS_OFF',
    title: 'Trust your gut',
    body: "If something about a job or a person doesn't feel right, pay attention to that feeling. You can always leave, and you can always talk to a parent, guardian, or use the report feature in the app.",
    tags: ['safety', 'wellbeing', 'boundaries'],
    audience: LifeSkillAudience.YOUTH,
    version: 'v1',
  },
];

// ============================================
// MESSAGE TEMPLATES FOR SAFETY MESSAGING
// Phase 1: No free-text allowed
// ============================================
const messageTemplates = [
  // Scheduling category
  {
    key: 'ASK_AVAILABILITY',
    label: 'Ask About Availability',
    description: 'Ask if the other person is available for the job',
    category: 'scheduling',
    direction: MessageTemplateDirection.ANY,
    sortOrder: 1,
    allowedFields: {
      fields: [
        { name: 'date', type: 'date', required: false, label: 'Preferred Date' },
        {
          name: 'time_window',
          type: 'select',
          options: ['Morning (8-12)', 'Afternoon (12-17)', 'Evening (17-21)', 'Flexible'],
          required: false,
          label: 'Preferred Time',
        },
      ],
      renderTemplate: 'Are you available{date ? ` on ${date}` : \'\'}{time_window ? ` in the ${time_window}` : \'\'}?',
    },
  },
  {
    key: 'CONFIRM_AVAILABILITY',
    label: 'Confirm Availability',
    description: 'Confirm that you are available',
    category: 'scheduling',
    direction: MessageTemplateDirection.ANY,
    sortOrder: 2,
    allowedFields: {
      fields: [
        { name: 'date', type: 'date', required: false, label: 'Date' },
        {
          name: 'time_window',
          type: 'select',
          options: ['Morning (8-12)', 'Afternoon (12-17)', 'Evening (17-21)', 'All day'],
          required: false,
          label: 'Available Time',
        },
      ],
      renderTemplate: '[Confirmed] Yes, I am available{date ? ` on ${date}` : \'\'}{time_window ? ` (${time_window})` : \'\'}.',
    },
  },
  {
    key: 'CONFIRM_HOURS',
    label: 'Confirm Working Hours',
    description: 'Confirm the specific working hours',
    category: 'scheduling',
    direction: MessageTemplateDirection.ANY,
    sortOrder: 3,
    allowedFields: {
      fields: [
        { name: 'start_time', type: 'time', required: true, label: 'Start Time' },
        { name: 'end_time', type: 'time', required: true, label: 'End Time' },
        { name: 'date', type: 'date', required: false, label: 'Date' },
      ],
      renderTemplate: '[Hours Confirmed] Working from {start_time} to {end_time}{date ? ` on ${date}` : \'\'}.',
    },
  },

  // Location category
  {
    key: 'CONFIRM_LOCATION',
    label: 'Confirm Location',
    description: 'Confirm where the job will take place',
    category: 'location',
    direction: MessageTemplateDirection.ADULT_TO_YOUTH,
    sortOrder: 10,
    allowedFields: {
      fields: [
        {
          name: 'location_type',
          type: 'select',
          options: ['My home', 'Public place', 'Business premises', 'Outdoor area'],
          required: true,
          label: 'Location Type',
        },
        {
          name: 'general_area',
          type: 'text',
          maxLength: 60,
          required: false,
          label: 'General Area (e.g., Frogner, City Center)',
        },
      ],
      renderTemplate: '[Location] The job will be at {location_type}{general_area ? ` in the ${general_area} area` : \'\'}. Full address will be shared closer to the date.',
    },
  },
  {
    key: 'ASK_LOCATION',
    label: 'Ask About Location',
    description: 'Ask where the job will take place',
    category: 'location',
    direction: MessageTemplateDirection.YOUTH_TO_ADULT,
    sortOrder: 11,
    allowedFields: {
      fields: [
        {
          name: 'question_type',
          type: 'select',
          options: ['What area is the job in?', 'Is this at your home or a public place?', 'How will I get the address?'],
          required: true,
          label: 'Question',
        },
      ],
      renderTemplate: '[Location Question] {question_type}',
    },
  },

  // Payment category
  {
    key: 'CONFIRM_PAYMENT',
    label: 'Confirm Payment Details',
    description: 'Confirm payment method and amount',
    category: 'payment',
    direction: MessageTemplateDirection.ADULT_TO_YOUTH,
    sortOrder: 20,
    allowedFields: {
      fields: [
        {
          name: 'method',
          type: 'select',
          options: ['Vipps', 'Bank transfer', 'Cash'],
          required: true,
          label: 'Payment Method',
        },
        {
          name: 'amount',
          type: 'number',
          min: 0,
          max: 10000,
          required: false,
          label: 'Amount (NOK)',
        },
        {
          name: 'when',
          type: 'select',
          options: ['After job completion', 'Same day', 'Within 3 days'],
          required: false,
          label: 'Payment Timing',
        },
      ],
      renderTemplate: '[Payment Confirmed] Payment will be via {method}{amount ? ` (${amount} NOK)` : \'\'}{when ? `, ${when}` : \'\'}.',
    },
  },
  {
    key: 'ASK_PAYMENT',
    label: 'Ask About Payment',
    description: 'Ask about payment details',
    category: 'payment',
    direction: MessageTemplateDirection.YOUTH_TO_ADULT,
    sortOrder: 21,
    allowedFields: {
      fields: [
        {
          name: 'question',
          type: 'select',
          options: [
            'How will I be paid?',
            'When will I receive payment?',
            'Can you confirm the agreed amount?',
          ],
          required: true,
          label: 'Question',
        },
      ],
      renderTemplate: '[Payment Question] {question}',
    },
  },

  // Job details category
  {
    key: 'ASK_JOB_DETAILS',
    label: 'Ask for More Details',
    description: 'Request more information about the job',
    category: 'job_details',
    direction: MessageTemplateDirection.YOUTH_TO_ADULT,
    sortOrder: 30,
    allowedFields: {
      fields: [
        {
          name: 'topic',
          type: 'select',
          options: [
            'What tasks will I be doing?',
            'What tools/equipment do I need to bring?',
            'Is there a dress code?',
            'How many people will be there?',
            'Will there be other workers?',
          ],
          required: true,
          label: 'What would you like to know?',
        },
      ],
      renderTemplate: '[Question] {topic}',
    },
  },
  {
    key: 'PROVIDE_JOB_DETAILS',
    label: 'Provide Job Details',
    description: 'Share more details about the job',
    category: 'job_details',
    direction: MessageTemplateDirection.ADULT_TO_YOUTH,
    sortOrder: 31,
    allowedFields: {
      fields: [
        {
          name: 'detail_type',
          type: 'select',
          options: ['Task description', 'Equipment needed', 'Dress code', 'Additional info'],
          required: true,
          label: 'Detail Type',
        },
        {
          name: 'details',
          type: 'text',
          maxLength: 120,
          required: true,
          label: 'Details (max 120 characters)',
        },
      ],
      renderTemplate: '[{detail_type}] {details}',
    },
  },

  // Safety category
  {
    key: 'REQUEST_PARENT_PRESENT',
    label: 'Request Parent/Guardian Present',
    description: 'Ask for a parent/guardian to be present',
    category: 'safety',
    direction: MessageTemplateDirection.ANY,
    sortOrder: 40,
    allowedFields: {
      fields: [
        {
          name: 'reason',
          type: 'select',
          options: [
            'First time meeting - would be more comfortable',
            'Job is at a private residence',
            'Platform guidelines recommend it',
            'Would like them to see the workplace',
          ],
          required: false,
          label: 'Reason',
        },
      ],
      renderTemplate: '[Safety Request] I would prefer to have a parent/guardian present for this job.{reason ? ` Reason: ${reason}` : \'\'}',
    },
  },
  {
    key: 'SAFETY_REMINDER',
    label: 'Safety Reminder',
    description: 'Send a safety reminder',
    category: 'safety',
    direction: MessageTemplateDirection.ANY,
    sortOrder: 41,
    allowedFields: {
      fields: [],
      renderTemplate: '[Safety Reminder] Please remember: Always meet in safe locations, inform someone about your whereabouts, and trust your instincts. If anything feels wrong, leave immediately and report it.',
    },
  },
  {
    key: 'CONFIRM_SUPERVISION',
    label: 'Confirm Adult Supervision',
    description: 'Confirm that an adult will be present',
    category: 'safety',
    direction: MessageTemplateDirection.ADULT_TO_YOUTH,
    sortOrder: 42,
    allowedFields: {
      fields: [
        {
          name: 'supervisor',
          type: 'select',
          options: ['I will be present', 'Another adult will be present', 'Work is in public area'],
          required: true,
          label: 'Supervision',
        },
      ],
      renderTemplate: '[Supervision Confirmed] {supervisor} during the job.',
    },
  },

  // General communication
  {
    key: 'DECLINE_POLITELY',
    label: 'Decline Politely',
    description: 'Politely decline or withdraw',
    category: 'general',
    direction: MessageTemplateDirection.ANY,
    sortOrder: 50,
    allowedFields: {
      fields: [
        {
          name: 'reason',
          type: 'select',
          options: [
            'Schedule conflict',
            'Found another opportunity',
            'Not the right fit',
            'Personal reasons',
            'Distance/location issue',
          ],
          required: true,
          label: 'Reason',
        },
      ],
      renderTemplate: '[Declined] I\'m sorry, but I won\'t be able to proceed with this job. Reason: {reason}. Best of luck finding someone!',
    },
  },
  {
    key: 'EXPRESS_INTEREST',
    label: 'Express Interest',
    description: 'Express interest in the job',
    category: 'general',
    direction: MessageTemplateDirection.YOUTH_TO_ADULT,
    sortOrder: 51,
    allowedFields: {
      fields: [
        {
          name: 'experience',
          type: 'select',
          options: [
            'I have experience with this type of work',
            'I am eager to learn',
            'I have relevant skills',
            'This matches my interests',
          ],
          required: false,
          label: 'Why are you interested?',
        },
      ],
      renderTemplate: '[Interested] I am interested in this job opportunity!{experience ? ` ${experience}.` : \'\'}',
    },
  },
  {
    key: 'CONFIRM_JOB',
    label: 'Confirm Job',
    description: 'Confirm the job is agreed upon',
    category: 'general',
    direction: MessageTemplateDirection.ADULT_TO_YOUTH,
    sortOrder: 52,
    allowedFields: {
      fields: [
        { name: 'date', type: 'date', required: false, label: 'Job Date' },
        { name: 'time', type: 'time', required: false, label: 'Start Time' },
      ],
      renderTemplate: '[Job Confirmed] Great! The job is confirmed{date ? ` for ${date}` : \'\'}{time ? ` at ${time}` : \'\'}. Looking forward to it!',
    },
  },
  {
    key: 'SAY_THANKS',
    label: 'Say Thank You',
    description: 'Thank the other person',
    category: 'general',
    direction: MessageTemplateDirection.ANY,
    sortOrder: 53,
    allowedFields: {
      fields: [
        {
          name: 'for_what',
          type: 'select',
          options: [
            'the opportunity',
            'the quick response',
            'your help',
            'the great work',
            'being flexible',
          ],
          required: false,
          label: 'Thank you for...',
        },
      ],
      renderTemplate: '[Thanks] Thank you{for_what ? ` for ${for_what}` : \'\'}! 🙏',
    },
  },
  {
    key: 'RUNNING_LATE',
    label: 'Running Late',
    description: 'Notify that you will be late',
    category: 'general',
    direction: MessageTemplateDirection.ANY,
    sortOrder: 54,
    allowedFields: {
      fields: [
        {
          name: 'delay',
          type: 'select',
          options: ['5-10 minutes', '10-15 minutes', '15-30 minutes'],
          required: true,
          label: 'How late?',
        },
        {
          name: 'reason',
          type: 'select',
          options: ['Traffic', 'Public transport delay', 'Unforeseen circumstances'],
          required: false,
          label: 'Reason',
        },
      ],
      renderTemplate: '[Running Late] I will be approximately {delay} late{reason ? ` due to ${reason}` : \'\'}. Sorry for the inconvenience!',
    },
  },
];

// ============================================
// SKILLS TAXONOMY (Feature 4 - Growth + My Path)
// ============================================
const skills = [
  // CARE skills (job-specific)
  { slug: 'babysitting', name: 'Babysitting', category: SkillCategory.CARE },
  { slug: 'pet-sitting', name: 'Pet Sitting', category: SkillCategory.CARE },
  { slug: 'dog-walking', name: 'Dog Walking', category: SkillCategory.CARE },
  { slug: 'elderly-assistance', name: 'Elderly Assistance', category: SkillCategory.CARE },
  { slug: 'child-activities', name: 'Child Activities', category: SkillCategory.CARE },
  { slug: 'first-aid', name: 'First Aid', category: SkillCategory.CARE },
  { slug: 'patience', name: 'Patience', category: SkillCategory.CARE },

  // HOME skills (job-specific)
  { slug: 'house-cleaning', name: 'House Cleaning', category: SkillCategory.HOME },
  { slug: 'organizing', name: 'Organizing', category: SkillCategory.HOME },
  { slug: 'laundry', name: 'Laundry', category: SkillCategory.HOME },
  { slug: 'cooking-basic', name: 'Basic Cooking', category: SkillCategory.HOME },
  { slug: 'moving-help', name: 'Moving Help', category: SkillCategory.HOME },
  { slug: 'decluttering', name: 'Decluttering', category: SkillCategory.HOME },

  // OUTDOOR skills (job-specific)
  { slug: 'lawn-mowing', name: 'Lawn Mowing', category: SkillCategory.OUTDOOR },
  { slug: 'gardening', name: 'Gardening', category: SkillCategory.OUTDOOR },
  { slug: 'snow-clearing', name: 'Snow Clearing', category: SkillCategory.OUTDOOR },
  { slug: 'car-washing', name: 'Car Washing', category: SkillCategory.OUTDOOR },
  { slug: 'leaf-raking', name: 'Leaf Raking', category: SkillCategory.OUTDOOR },
  { slug: 'physical-stamina', name: 'Physical Stamina', category: SkillCategory.OUTDOOR },

  // TECH skills (job-specific)
  { slug: 'tech-help-basic', name: 'Basic Tech Help', category: SkillCategory.TECH },
  { slug: 'phone-setup', name: 'Phone Setup', category: SkillCategory.TECH },
  { slug: 'computer-help', name: 'Computer Help', category: SkillCategory.TECH },
  { slug: 'social-media', name: 'Social Media Help', category: SkillCategory.TECH },
  { slug: 'troubleshooting', name: 'Troubleshooting', category: SkillCategory.TECH },

  // SERVICE skills (job-specific)
  { slug: 'grocery-shopping', name: 'Grocery Shopping', category: SkillCategory.SERVICE },
  { slug: 'errand-running', name: 'Errand Running', category: SkillCategory.SERVICE },
  { slug: 'event-help', name: 'Event Help', category: SkillCategory.SERVICE },
  { slug: 'delivery', name: 'Delivery', category: SkillCategory.SERVICE },
  { slug: 'customer-service', name: 'Customer Service', category: SkillCategory.SERVICE },

  // CREATIVE skills (job-specific)
  { slug: 'tutoring', name: 'Tutoring', category: SkillCategory.CREATIVE },
  { slug: 'music-lessons', name: 'Music Lessons', category: SkillCategory.CREATIVE },
  { slug: 'art-crafts', name: 'Art & Crafts', category: SkillCategory.CREATIVE },
  { slug: 'photography', name: 'Photography', category: SkillCategory.CREATIVE },

  // OTHER / SOFT SKILLS (transferable)
  { slug: 'communication', name: 'Communication', category: SkillCategory.OTHER },
  { slug: 'punctuality', name: 'Punctuality', category: SkillCategory.OTHER },
  { slug: 'teamwork', name: 'Teamwork', category: SkillCategory.OTHER },
  { slug: 'problem-solving', name: 'Problem Solving', category: SkillCategory.OTHER },
  { slug: 'time-management', name: 'Time Management', category: SkillCategory.OTHER },
  { slug: 'attention-to-detail', name: 'Attention to Detail', category: SkillCategory.OTHER },
  { slug: 'reliability', name: 'Reliability', category: SkillCategory.OTHER },
  { slug: 'adaptability', name: 'Adaptability', category: SkillCategory.OTHER },
  { slug: 'initiative', name: 'Initiative', category: SkillCategory.OTHER },
  { slug: 'following-instructions', name: 'Following Instructions', category: SkillCategory.OTHER },
  { slug: 'professionalism', name: 'Professionalism', category: SkillCategory.OTHER },
  { slug: 'respectfulness', name: 'Respectfulness', category: SkillCategory.OTHER },
  { slug: 'safety-awareness', name: 'Safety Awareness', category: SkillCategory.OTHER },
  { slug: 'money-handling', name: 'Money Handling', category: SkillCategory.OTHER },
  { slug: 'independence', name: 'Working Independently', category: SkillCategory.OTHER },
];

// ============================================
// SKILL-TO-JOB-CATEGORY MAPPING (for My Path)
// Maps job categories to skills typically developed
// ============================================
export const skillsPerJobCategory: Record<string, string[]> = {
  BABYSITTING: ['babysitting', 'child-activities', 'patience', 'first-aid', 'communication', 'reliability', 'safety-awareness'],
  DOG_WALKING: ['dog-walking', 'pet-sitting', 'punctuality', 'reliability', 'physical-stamina', 'time-management'],
  SNOW_CLEARING: ['snow-clearing', 'physical-stamina', 'punctuality', 'reliability', 'independence', 'safety-awareness'],
  CLEANING: ['house-cleaning', 'organizing', 'attention-to-detail', 'time-management', 'following-instructions', 'reliability'],
  DIY_HELP: ['moving-help', 'problem-solving', 'following-instructions', 'physical-stamina', 'safety-awareness', 'teamwork'],
  TECH_HELP: ['tech-help-basic', 'troubleshooting', 'communication', 'patience', 'problem-solving', 'customer-service'],
  ERRANDS: ['errand-running', 'grocery-shopping', 'time-management', 'reliability', 'money-handling', 'independence'],
  OTHER: ['communication', 'reliability', 'punctuality', 'following-instructions', 'adaptability'],
};

// ============================================
// CAREER REALITY CHECKS (Feature 6)
// Honest, structured information about careers
// ============================================
const careerRealityChecks = [
  {
    roleSlug: 'ai-engineer',
    title: 'AI Engineer',
    overview: 'AI Engineers build and deploy machine learning systems that power products like chatbots, recommendation engines, and image recognition. The role requires strong programming skills, math foundations, and continuous learning as the field evolves rapidly.',
    dayToDay: [
      'Writing Python code to train and fine-tune ML models',
      'Processing and cleaning large datasets',
      'Debugging model performance issues',
      'Reading research papers to stay current',
      'Collaborating with product teams on use cases',
      'Monitoring deployed models in production',
    ],
    misconceptions: [
      'AI work is not just about prompting ChatGPT',
      'Most time is spent on data preparation, not building models',
      'Deep math knowledge is needed for research roles',
      'Not every company needs custom AI—many use off-the-shelf solutions',
    ],
    hardParts: [
      'Explaining why a model failed to non-technical stakeholders',
      'Dealing with biased or incomplete training data',
      'Keeping up with extremely rapid changes in the field',
      'Long debugging sessions with unclear causes',
    ],
    starterSteps: [
      'Learn Python well—it is the language of ML',
      'Take online courses on machine learning fundamentals',
      'Complete personal projects using public datasets',
      'Contribute to open-source ML projects',
      'Build a portfolio of working projects on GitHub',
    ],
    typicalPath: [
      'Computer science degree or bootcamp + self-study',
      'Junior ML engineer or data scientist role (2-3 years)',
      'Mid-level ML engineer with specialization',
      'Senior engineer or team lead',
    ],
    skillGaps: [
      'Math foundations (linear algebra, statistics)',
      'Software engineering best practices',
      'Understanding production systems',
      'Communication skills for non-technical audiences',
    ],
    saturationNote: 'High demand but also high competition. Employers look for proven project experience, not just credentials.',
  },
  {
    roleSlug: 'ux-designer',
    title: 'UX Designer',
    overview: 'UX Designers create user-friendly interfaces for apps and websites. The role combines research, psychology, and visual design to make products intuitive and accessible.',
    dayToDay: [
      'Conducting user interviews and usability tests',
      'Creating wireframes and prototypes in Figma',
      'Presenting designs to stakeholders',
      'Analyzing user behavior data',
      'Collaborating with developers on implementation',
      'Iterating based on feedback',
    ],
    misconceptions: [
      'UX is not just making things look pretty',
      'You spend more time researching than designing',
      'Not the same as graphic design—focus is on usability',
      'You cannot ignore business constraints',
    ],
    hardParts: [
      'Defending design decisions when stakeholders disagree',
      'Balancing user needs with business goals',
      'Working with limited research time or budget',
      'Seeing your designs changed during development',
    ],
    starterSteps: [
      'Learn design tools like Figma (free)',
      'Study design principles and accessibility guidelines',
      'Redesign existing apps for practice',
      'Take UX courses or bootcamps',
      'Build a portfolio with case studies',
    ],
    typicalPath: [
      'Bootcamp or degree + portfolio',
      'Junior UX designer role (2-3 years)',
      'Mid-level designer with specialization',
      'Senior designer or UX lead',
    ],
    skillGaps: [
      'User research methodology',
      'Understanding of accessibility requirements',
      'Basic front-end knowledge (HTML/CSS)',
      'Data analysis skills',
    ],
    saturationNote: 'Entry-level market is competitive. Strong portfolios with real case studies stand out.',
  },
  {
    roleSlug: 'electrician',
    title: 'Electrician',
    overview: 'Electricians install, maintain, and repair electrical systems in buildings. The work is hands-on, requires problem-solving, and offers steady employment with good earning potential.',
    dayToDay: [
      'Installing wiring in new construction',
      'Troubleshooting electrical faults',
      'Reading blueprints and technical diagrams',
      'Ensuring work meets safety codes',
      'Working with clients to understand needs',
      'Maintaining tools and equipment',
    ],
    misconceptions: [
      'Not just wiring—includes smart home systems, EV chargers',
      'Physical work but also requires technical knowledge',
      'Licensed electricians earn competitive salaries',
      'Job security is high—buildings always need electrical work',
    ],
    hardParts: [
      'Working in uncomfortable positions (attics, crawl spaces)',
      'Safety risks require constant attention',
      'Keeping up with code changes and new technology',
      'Client expectations can be unrealistic',
    ],
    starterSteps: [
      'Apply for electrician apprenticeship programs',
      'Take electrical theory courses at vocational school',
      'Get comfortable with basic hand tools',
      'Study electrical safety fundamentals',
    ],
    typicalPath: [
      '4-5 year apprenticeship with classroom training',
      'Journeyman electrician (certified)',
      'Master electrician (additional experience)',
      'Own business or specialized contractor',
    ],
    skillGaps: [
      'Math skills for calculations',
      'Reading technical drawings',
      'Customer service skills',
      'Business management for self-employment',
    ],
    saturationNote: 'Strong demand, especially for green energy and EV infrastructure. Apprenticeship spots can be competitive.',
  },
  {
    roleSlug: 'nurse',
    title: 'Nurse',
    overview: 'Nurses provide direct patient care in hospitals, clinics, and other healthcare settings. The role requires empathy, attention to detail, and the ability to work under pressure.',
    dayToDay: [
      'Monitoring patient vital signs and symptoms',
      'Administering medications and treatments',
      'Documenting patient information',
      'Communicating with doctors and families',
      'Providing emotional support to patients',
      'Handling emergencies calmly',
    ],
    misconceptions: [
      'Nurses are not assistants—they make critical decisions',
      'Shift work means irregular hours including nights and weekends',
      'Emotional labor is a significant part of the job',
      'Career advancement is possible (nurse practitioner, management)',
    ],
    hardParts: [
      'Dealing with death and suffering',
      'Physical demands of long shifts',
      'Understaffed situations increase stress',
      'Difficult patients or families',
    ],
    starterSteps: [
      'Research nursing programs (bachelor or vocational)',
      'Volunteer at hospitals or care homes',
      'Take biology and chemistry courses',
      'Develop strong communication skills',
    ],
    typicalPath: [
      'Nursing degree (3-4 years)',
      'Licensed nurse (hospital or clinic)',
      'Specialization (intensive care, pediatrics, etc.)',
      'Advanced practice or leadership roles',
    ],
    skillGaps: [
      'Science foundations (biology, anatomy)',
      'Stress management techniques',
      'Technical medical knowledge',
      'Communication in difficult situations',
    ],
    saturationNote: 'High demand in most countries. Nursing is considered a secure career choice.',
  },
  {
    roleSlug: 'mechanic',
    title: 'Automotive Mechanic',
    overview: 'Mechanics diagnose, repair, and maintain vehicles. As cars become more computerized, the role increasingly combines mechanical skills with diagnostic technology.',
    dayToDay: [
      'Diagnosing vehicle problems using diagnostic tools',
      'Performing repairs (brakes, engines, transmissions)',
      'Conducting routine maintenance',
      'Explaining repairs to customers',
      'Keeping up with new vehicle technology',
      'Maintaining shop equipment',
    ],
    misconceptions: [
      'Modern mechanics need computer skills, not just wrench skills',
      'Electric vehicles require different expertise',
      'Not a dying trade—vehicles still need maintenance',
      'Good mechanics are in high demand',
    ],
    hardParts: [
      'Physical work in uncomfortable positions',
      'Keeping up with rapidly changing technology',
      'Dealing with warranty and insurance issues',
      'Some jobs are dirty or unpleasant',
    ],
    starterSteps: [
      'Work on your own car or help friends/family',
      'Take automotive courses at vocational school',
      'Get basic mechanic tools and practice',
      'Apply for apprenticeships at workshops',
    ],
    typicalPath: [
      'Vocational training or apprenticeship (2-4 years)',
      'Certified mechanic',
      'Specialization (electric vehicles, performance, etc.)',
      'Shop manager or own business',
    ],
    skillGaps: [
      'Computer diagnostic skills',
      'Understanding electrical systems',
      'Customer communication',
      'Business skills for self-employment',
    ],
    saturationNote: 'Steady demand. EV specialists are increasingly sought after.',
  },
  {
    roleSlug: 'chef',
    title: 'Chef',
    overview: 'Chefs prepare food in restaurants, hotels, and other food service establishments. The role requires creativity, speed, and the ability to work under pressure in hot, fast-paced environments.',
    dayToDay: [
      'Preparing ingredients and cooking dishes',
      'Managing kitchen staff during service',
      'Creating and testing new recipes',
      'Ordering supplies and managing inventory',
      'Ensuring food safety standards',
      'Working dinner service (evening hours)',
    ],
    misconceptions: [
      'TV shows glamorize it—real kitchens are intense',
      'Long hours, including weekends and holidays',
      'You start at the bottom, not running a kitchen',
      'Business skills matter as much as cooking',
    ],
    hardParts: [
      'Standing for long hours in hot kitchens',
      'High-pressure dinner service rushes',
      'Work-life balance is challenging',
      'Physical injuries are common',
    ],
    starterSteps: [
      'Get a kitchen job (dishwasher, prep cook)',
      'Practice cooking at home—a lot',
      'Consider culinary school (optional but helpful)',
      'Learn food safety basics',
    ],
    typicalPath: [
      'Entry-level kitchen position',
      'Line cook (2-3 years)',
      'Sous chef (kitchen second-in-command)',
      'Head chef or own restaurant',
    ],
    skillGaps: [
      'Speed and efficiency under pressure',
      'Team management skills',
      'Business and cost management',
      'Creativity with limited resources',
    ],
    saturationNote: 'Many entry-level opportunities but advancement is competitive. Success requires dedication.',
  },
  {
    roleSlug: 'teacher',
    title: 'Teacher',
    overview: 'Teachers educate students at various levels, from primary school to high school. The role requires patience, communication skills, and the ability to adapt to different learning needs.',
    dayToDay: [
      'Planning and delivering lessons',
      'Grading assignments and exams',
      'Managing classroom behavior',
      'Meeting with parents and colleagues',
      'Supporting individual student needs',
      'Attending school meetings and training',
    ],
    misconceptions: [
      'Not just summers off—teachers work during breaks',
      'Paperwork and admin take significant time',
      'Every class and year is different',
      'Emotional investment is high',
    ],
    hardParts: [
      'Large class sizes with diverse needs',
      'Limited resources in some schools',
      'Dealing with challenging behavior',
      'Emotional exhaustion from student issues',
    ],
    starterSteps: [
      'Volunteer with children or tutoring',
      'Research teacher education programs',
      'Develop subject expertise',
      'Practice public speaking',
    ],
    typicalPath: [
      'Teacher education degree (4-5 years)',
      'Classroom teacher (permanent position)',
      'Subject lead or department head',
      'School leadership or administration',
    ],
    skillGaps: [
      'Classroom management techniques',
      'Special education awareness',
      'Technology integration',
      'Differentiated instruction methods',
    ],
    saturationNote: 'Demand varies by subject and location. STEM and special education teachers are often needed.',
  },
  {
    roleSlug: 'cybersecurity-analyst',
    title: 'Cybersecurity Analyst',
    overview: 'Cybersecurity analysts protect organizations from digital threats. The role requires technical knowledge, analytical thinking, and staying current with evolving attack methods.',
    dayToDay: [
      'Monitoring security alerts and logs',
      'Investigating potential security incidents',
      'Conducting vulnerability assessments',
      'Implementing security tools and policies',
      'Educating staff on security practices',
      'Responding to security breaches',
    ],
    misconceptions: [
      'Not like movie hacking—mostly analysis and prevention',
      'Certifications matter as much as degrees',
      'Soft skills are important for explaining risks',
      'Constant learning is required as threats evolve',
    ],
    hardParts: [
      'On-call work for security incidents',
      'High-stress breach situations',
      'Keeping up with new attack methods',
      'Convincing others to follow security policies',
    ],
    starterSteps: [
      'Learn networking fundamentals',
      'Get familiar with Linux command line',
      'Practice with cybersecurity CTF challenges',
      'Pursue entry-level certifications (CompTIA Security+)',
      'Build a home lab for practice',
    ],
    typicalPath: [
      'IT support or junior security role',
      'Security analyst (2-3 years)',
      'Senior analyst or specialist',
      'Security architect or CISO',
    ],
    skillGaps: [
      'Networking and system administration',
      'Programming basics (Python, scripting)',
      'Understanding of compliance requirements',
      'Communication skills for reporting',
    ],
    saturationNote: 'High demand with shortage of qualified professionals. Entry-level market is more competitive.',
  },
  {
    roleSlug: 'data-analyst',
    title: 'Data Analyst',
    overview: 'Data analysts turn data into insights that help businesses make decisions. The role requires analytical thinking, tool proficiency, and the ability to communicate findings clearly.',
    dayToDay: [
      'Writing SQL queries to extract data',
      'Building dashboards and reports',
      'Analyzing trends and patterns',
      'Presenting findings to stakeholders',
      'Cleaning and validating data',
      'Collaborating with business teams',
    ],
    misconceptions: [
      'Not the same as data science—less ML, more reporting',
      'Excel skills are still valuable',
      'Business understanding is as important as technical skills',
      'Most time is spent on data cleaning',
    ],
    hardParts: [
      'Working with messy or incomplete data',
      'Explaining statistics to non-technical people',
      'Tight deadlines for reports',
      'Data access issues and tool limitations',
    ],
    starterSteps: [
      'Learn SQL—it is essential',
      'Practice with Excel and visualization tools',
      'Take statistics courses',
      'Work on projects with public datasets',
      'Learn Python or R basics',
    ],
    typicalPath: [
      'Entry-level analyst or internship',
      'Data analyst (2-3 years)',
      'Senior analyst or lead',
      'Analytics manager or data scientist',
    ],
    skillGaps: [
      'SQL proficiency',
      'Statistics fundamentals',
      'Data visualization best practices',
      'Business domain knowledge',
    ],
    saturationNote: 'Good demand across industries. Entry-level is competitive—portfolio projects help.',
  },
  {
    roleSlug: 'physiotherapist',
    title: 'Physiotherapist',
    overview: 'Physiotherapists help patients recover from injuries and manage physical conditions through exercise and treatment. The role requires medical knowledge, hands-on skills, and patient care.',
    dayToDay: [
      'Assessing patient conditions and mobility',
      'Developing treatment plans',
      'Performing manual therapy techniques',
      'Teaching exercises to patients',
      'Documenting progress and outcomes',
      'Communicating with doctors and families',
    ],
    misconceptions: [
      'Not just massage—based on medical science',
      'Requires ongoing patient motivation',
      'Can specialize (sports, pediatrics, elderly)',
      'Private practice requires business skills',
    ],
    hardParts: [
      'Physically demanding work',
      'Patients who do not follow exercise plans',
      'Seeing limited progress in some cases',
      'Administrative paperwork',
    ],
    starterSteps: [
      'Shadow physiotherapists to understand the work',
      'Take biology and anatomy courses',
      'Research physiotherapy degree programs',
      'Develop communication and empathy skills',
    ],
    typicalPath: [
      'Physiotherapy degree (4-5 years)',
      'Junior physiotherapist (hospital or clinic)',
      'Senior or specialized physiotherapist',
      'Private practice or department lead',
    ],
    skillGaps: [
      'Anatomy and physiology knowledge',
      'Manual therapy techniques',
      'Patient communication skills',
      'Exercise prescription',
    ],
    saturationNote: 'Good demand, especially for geriatric and sports specializations.',
  },
  {
    roleSlug: 'carpenter',
    title: 'Carpenter',
    overview: 'Carpenters build and repair structures made of wood and other materials. The work is hands-on, requires precision, and offers opportunities in construction, renovation, and custom work.',
    dayToDay: [
      'Measuring and cutting wood materials',
      'Building frames, roofs, and structures',
      'Installing fixtures and finishes',
      'Reading blueprints and specifications',
      'Working on construction sites',
      'Maintaining tools and equipment',
    ],
    misconceptions: [
      'Not just furniture—most work is construction',
      'Requires math skills for measurements',
      'Technology is increasingly used (CAD, CNC)',
      'Good carpenters are well-compensated',
    ],
    hardParts: [
      'Physical work in all weather conditions',
      'Injuries from tools and materials',
      'Tight project deadlines',
      'Seasonal work fluctuations',
    ],
    starterSteps: [
      'Build small projects at home',
      'Take woodworking or construction courses',
      'Learn to use basic power tools safely',
      'Apply for apprenticeships',
    ],
    typicalPath: [
      'Apprenticeship (3-4 years)',
      'Journeyman carpenter',
      'Specialized carpenter or foreman',
      'Contractor or own business',
    ],
    skillGaps: [
      'Math for measurements and estimates',
      'Blueprint reading',
      'Tool proficiency and safety',
      'Business skills for self-employment',
    ],
    saturationNote: 'Steady demand in construction. Skilled finish carpenters are particularly valued.',
  },
  {
    roleSlug: 'maritime-technician',
    title: 'Maritime Technician',
    overview: 'Maritime technicians maintain and repair ships and offshore equipment. The role combines mechanical, electrical, and specialized marine skills in a unique working environment.',
    dayToDay: [
      'Maintaining ship engines and systems',
      'Troubleshooting mechanical and electrical issues',
      'Conducting inspections and safety checks',
      'Working with navigation and communication equipment',
      'Following maritime safety regulations',
      'Working on ships or offshore platforms',
    ],
    misconceptions: [
      'Not just sailing—highly technical work',
      'Can work onshore or offshore',
      'Good pay but requires travel/time away',
      'Regulated industry with certification requirements',
    ],
    hardParts: [
      'Time away from home on vessels',
      'Working in confined spaces',
      'Demanding physical conditions',
      'Emergency situations at sea',
    ],
    starterSteps: [
      'Research maritime technical programs',
      'Get comfortable working with machines',
      'Consider naval or coast guard experience',
      'Develop comfort with water and boats',
    ],
    typicalPath: [
      'Maritime technical school (2-4 years)',
      'Junior technician or crew member',
      'Certified marine engineer or technician',
      'Chief engineer or specialist roles',
    ],
    skillGaps: [
      'Mechanical and electrical fundamentals',
      'Maritime safety knowledge',
      'Comfort in isolated environments',
      'Teamwork under pressure',
    ],
    saturationNote: 'Demand varies with shipping and offshore industry. Norway has strong maritime sector.',
  },
  // ============================================
  // NEW IT CAREERS - Reality Checks
  // ============================================
  {
    roleSlug: 'it-project-manager',
    title: 'IT Project Manager',
    overview: 'IT Project Managers lead technology projects from inception to delivery. The role requires balancing technical understanding with people management, budgets, and stakeholder expectations.',
    dayToDay: [
      'Running daily standups and team meetings',
      'Updating project plans and tracking progress',
      'Managing risks and resolving blockers',
      'Communicating status to stakeholders',
      'Coordinating between developers, QA, and business teams',
      'Managing budgets and resource allocation',
    ],
    misconceptions: [
      'Not about doing the technical work—it is about enabling others',
      'Certifications like PMP help but experience matters more',
      'You spend more time in meetings than you expect',
      'Success depends heavily on soft skills, not just tools',
    ],
    hardParts: [
      'Managing scope creep and changing requirements',
      'Delivering bad news to stakeholders',
      'Balancing competing priorities from different teams',
      'Taking responsibility when projects go wrong',
    ],
    starterSteps: [
      'Learn project management fundamentals (PMBOK, Agile)',
      'Get experience as a team lead or coordinator',
      'Study for PMP or PRINCE2 certification',
      'Practice stakeholder communication skills',
      'Use project management tools (Jira, Asana, MS Project)',
    ],
    typicalPath: [
      'Developer or analyst role (2-3 years)',
      'Team lead or junior project manager',
      'Project manager (3-5 years)',
      'Senior PM, Program Manager, or PMO Director',
    ],
    skillGaps: [
      'Formal project management methodology',
      'Financial and budget management',
      'Risk assessment and mitigation',
      'Executive communication skills',
    ],
    saturationNote: 'Steady demand for experienced PMs. Entry-level is competitive—technical background helps.',
  },
  {
    roleSlug: 'cio',
    title: 'Chief Information Officer (CIO)',
    overview: 'CIOs are executive leaders responsible for the entire IT strategy of an organization. The role requires decades of experience, business acumen, and the ability to translate technology into business value.',
    dayToDay: [
      'Setting IT strategy aligned with business goals',
      'Managing IT budgets (often millions)',
      'Leading digital transformation initiatives',
      'Reporting to CEO and board of directors',
      'Overseeing cybersecurity and compliance',
      'Building and managing IT leadership team',
    ],
    misconceptions: [
      'Not a technical role—it is a business leadership role',
      'Requires 15-20+ years of progressive experience',
      'More time spent on strategy and politics than technology',
      'Must understand finance, HR, and operations deeply',
    ],
    hardParts: [
      'Accountability for all IT failures in the organization',
      'Justifying IT investments to non-technical executives',
      'Managing large teams through other leaders',
      'Keeping up with technology while focusing on strategy',
    ],
    starterSteps: [
      'Build deep expertise in one IT domain first',
      'Move into management roles (team lead, director)',
      'Get an MBA or executive education',
      'Develop cross-functional business relationships',
      'Take on strategic initiatives beyond day-to-day IT',
    ],
    typicalPath: [
      'Technical role (5-10 years)',
      'IT Manager or Director (5-7 years)',
      'VP of IT or Technology (3-5 years)',
      'CIO or CTO',
    ],
    skillGaps: [
      'Executive presence and board communication',
      'Business strategy and financial acumen',
      'Organizational change management',
      'Vendor and contract negotiation at scale',
    ],
    saturationNote: 'Very limited positions—long-term career goal. Network and executive experience are critical.',
  },
  {
    roleSlug: 'agile-coach',
    title: 'SAFe Agile Coach',
    overview: 'Agile Coaches help organizations adopt agile methodologies at scale, particularly the Scaled Agile Framework (SAFe). The role combines coaching, training, and change management across multiple teams.',
    dayToDay: [
      'Facilitating PI (Program Increment) planning events',
      'Coaching Scrum Masters and Product Owners',
      'Running workshops on agile practices',
      'Helping teams identify and remove impediments',
      'Tracking agile metrics and continuous improvement',
      'Advising leadership on agile transformation',
    ],
    misconceptions: [
      'Not just knowing Scrum—requires deep enterprise agile knowledge',
      'More about coaching people than enforcing processes',
      'SAFe certifications are important but coaching skills matter more',
      'Often involves organizational politics and change resistance',
    ],
    hardParts: [
      'Dealing with resistance to change from teams and leadership',
      'Balancing framework purity with practical reality',
      'Measuring impact of coaching efforts',
      'Working with dysfunctional teams or organizations',
    ],
    starterSteps: [
      'Master Scrum and work as a Scrum Master first',
      'Get SAFe certifications (SA, then SPC)',
      'Develop coaching and facilitation skills',
      'Practice with agile transformations in your organization',
      'Build a network in the agile community',
    ],
    typicalPath: [
      'Scrum Master or developer (3-5 years)',
      'Senior Scrum Master or Release Train Engineer',
      'Agile Coach (internal or consulting)',
      'Enterprise Agile Coach or transformation lead',
    ],
    skillGaps: [
      'Professional coaching techniques',
      'Large-scale facilitation skills',
      'Organizational change management',
      'Metrics and value stream mapping',
    ],
    saturationNote: 'Demand fluctuates with agile adoption trends. SAFe is common in large enterprises.',
  },
  {
    roleSlug: 'network-engineer',
    title: 'Network Engineer',
    overview: 'Network Engineers design and maintain the infrastructure that connects computers and systems. The role requires deep technical knowledge of protocols, hardware, and security.',
    dayToDay: [
      'Configuring routers, switches, and firewalls',
      'Monitoring network performance and uptime',
      'Troubleshooting connectivity issues',
      'Planning network capacity and upgrades',
      'Implementing security policies',
      'Documenting network architecture',
    ],
    misconceptions: [
      'Not just setting up WiFi—enterprise networks are complex',
      'Cloud networking is increasingly important',
      'Cisco certifications are valuable but not the only path',
      'On-call work is common for critical infrastructure',
    ],
    hardParts: [
      'Troubleshooting issues under pressure',
      'On-call responsibilities for outages',
      'Keeping up with new technologies and threats',
      'Working in data centers (noisy, cold environments)',
    ],
    starterSteps: [
      'Learn networking fundamentals (TCP/IP, DNS, routing)',
      'Study for CCNA certification',
      'Set up a home lab with used networking equipment',
      'Practice with network simulators (Packet Tracer, GNS3)',
      'Understand cloud networking basics (AWS VPC, Azure)',
    ],
    typicalPath: [
      'IT support or junior network role',
      'Network administrator (2-3 years)',
      'Network engineer (3-5 years)',
      'Senior engineer or network architect',
    ],
    skillGaps: [
      'Deep protocol knowledge (BGP, OSPF, etc.)',
      'Security and firewall configuration',
      'Cloud networking skills',
      'Automation and scripting (Python, Ansible)',
    ],
    saturationNote: 'Steady demand. Cloud and security skills make candidates more competitive.',
  },
  {
    roleSlug: 'solutions-architect',
    title: 'Solutions Architect',
    overview: 'Solutions Architects design complex technical systems that solve business problems. The role bridges business requirements and technical implementation, requiring both breadth and depth of knowledge.',
    dayToDay: [
      'Designing system architectures for new projects',
      'Evaluating technologies and making recommendations',
      'Creating technical proposals and documentation',
      'Presenting solutions to clients and stakeholders',
      'Guiding development teams on implementation',
      'Reviewing designs and code for quality',
    ],
    misconceptions: [
      'Not just drawing diagrams—need hands-on technical depth',
      'Client-facing and communication skills are essential',
      'Must stay current across many technology domains',
      'Often involves pre-sales and consulting work',
    ],
    hardParts: [
      'Balancing ideal architecture with budget constraints',
      'Making decisions with incomplete information',
      'Taking ownership of architecture decisions that fail',
      'Context switching between multiple projects',
    ],
    starterSteps: [
      'Build deep expertise as a senior developer first',
      'Learn cloud platforms (AWS, Azure) and get certified',
      'Study system design patterns and principles',
      'Practice explaining technical concepts simply',
      'Take on architecture responsibilities in current role',
    ],
    typicalPath: [
      'Software developer (5-8 years)',
      'Senior developer or tech lead',
      'Solutions architect (3-5 years)',
      'Principal architect or CTO',
    ],
    skillGaps: [
      'Breadth of technical knowledge',
      'Business requirements analysis',
      'Presentation and documentation skills',
      'Cost estimation and budgeting',
    ],
    saturationNote: 'High demand for experienced architects. Cloud certifications (AWS SA) are valuable.',
  },
  {
    roleSlug: 'database-administrator',
    title: 'Database Administrator (DBA)',
    overview: 'DBAs ensure databases are available, performant, and secure. The role requires deep knowledge of database systems and is critical for organizations that rely on data.',
    dayToDay: [
      'Monitoring database performance and health',
      'Optimizing slow queries and indexes',
      'Managing backups and disaster recovery',
      'Implementing security and access controls',
      'Planning capacity and upgrades',
      'Supporting developers with database issues',
    ],
    misconceptions: [
      'Not just running queries—involves complex optimization',
      'Cloud databases require different skills (AWS RDS, Azure SQL)',
      'On-call for database emergencies is common',
      'Increasingly involves automation and DevOps practices',
    ],
    hardParts: [
      'Pressure during database outages',
      'Diagnosing performance issues under time pressure',
      'Managing large data migrations',
      'Balancing security with developer productivity',
    ],
    starterSteps: [
      'Master SQL deeply—it is foundational',
      'Learn database internals (indexing, query plans)',
      'Get certified in major platforms (Oracle, SQL Server, PostgreSQL)',
      'Practice backup, recovery, and performance tuning',
      'Understand cloud database services',
    ],
    typicalPath: [
      'Developer or IT support with database exposure',
      'Junior DBA (2-3 years)',
      'DBA (3-5 years)',
      'Senior DBA or Database Architect',
    ],
    skillGaps: [
      'Deep SQL and query optimization skills',
      'Understanding of storage and I/O',
      'Scripting for automation',
      'Cloud database administration',
    ],
    saturationNote: 'Steady demand though cloud reduces some traditional DBA work. Specialized skills remain valuable.',
  },
  {
    roleSlug: 'qa-engineer',
    title: 'QA Engineer / Test Engineer',
    overview: 'QA Engineers ensure software quality through testing strategies, automation, and process improvement. Modern QA requires programming skills for test automation.',
    dayToDay: [
      'Writing and executing test cases',
      'Building automated test suites',
      'Reporting and tracking bugs',
      'Reviewing requirements for testability',
      'Participating in code reviews',
      'Validating releases before deployment',
    ],
    misconceptions: [
      'Not just clicking through apps—automation is essential',
      'Programming skills are required for modern QA',
      'QA engineers often earn as much as developers',
      'Quality is a team responsibility, not just QA',
    ],
    hardParts: [
      'Maintaining test suites as code changes',
      'Pressure to approve releases quickly',
      'Finding bugs that developers cannot reproduce',
      'Being seen as the blocker to releases',
    ],
    starterSteps: [
      'Learn programming basics (Python, JavaScript)',
      'Study testing fundamentals (test types, strategies)',
      'Practice with test automation tools (Selenium, Cypress)',
      'Get ISTQB Foundation certification',
      'Contribute to testing in a development role',
    ],
    typicalPath: [
      'Manual tester or QA analyst',
      'QA Engineer / Test automation engineer (2-4 years)',
      'Senior QA Engineer',
      'QA Lead, Test Architect, or SDET',
    ],
    skillGaps: [
      'Programming and test automation',
      'API and integration testing',
      'CI/CD integration for tests',
      'Performance and security testing',
    ],
    saturationNote: 'Strong demand for automation engineers. Manual-only testers face more competition.',
  },
  {
    roleSlug: 'scrum-master',
    title: 'Scrum Master',
    overview: 'Scrum Masters facilitate agile processes and help development teams work effectively. The role is about servant leadership—enabling the team rather than managing them.',
    dayToDay: [
      'Facilitating daily standups and sprint ceremonies',
      'Removing impediments blocking the team',
      'Coaching team members on agile practices',
      'Protecting the team from distractions',
      'Tracking sprint metrics and velocity',
      'Facilitating retrospectives for improvement',
    ],
    misconceptions: [
      'Not a project manager—does not assign work',
      'Cannot succeed without team buy-in',
      'Technical background helps but is not required',
      'Certification alone does not make you effective',
    ],
    hardParts: [
      'Influencing without authority',
      'Dealing with teams resistant to agile',
      'Navigating organizational dysfunction',
      'Measuring your own impact',
    ],
    starterSteps: [
      'Learn Scrum framework thoroughly (Scrum Guide)',
      'Get Certified Scrum Master (CSM) or PSM certification',
      'Practice facilitation in any meetings you attend',
      'Study coaching and conflict resolution techniques',
      'Shadow an experienced Scrum Master if possible',
    ],
    typicalPath: [
      'Developer, analyst, or team member on agile team',
      'Scrum Master (2-4 years)',
      'Senior Scrum Master or Release Train Engineer',
      'Agile Coach or transformation lead',
    ],
    skillGaps: [
      'Facilitation techniques',
      'Coaching skills',
      'Conflict resolution',
      'Agile metrics and improvement practices',
    ],
    saturationNote: 'Demand varies. Best for those who enjoy enabling others rather than doing work directly.',
  },
  {
    roleSlug: 'systems-administrator',
    title: 'Systems Administrator',
    overview: 'SysAdmins maintain servers, operating systems, and IT infrastructure. The role is foundational in IT and can lead to specializations in cloud, security, or DevOps.',
    dayToDay: [
      'Managing and monitoring servers',
      'Installing and configuring software',
      'Handling user access and permissions',
      'Troubleshooting system issues',
      'Managing backups and recovery',
      'Maintaining security patches and updates',
    ],
    misconceptions: [
      'Not just rebooting servers—requires deep technical knowledge',
      'Cloud is changing but not eliminating the role',
      'On-call and after-hours work is common',
      'Automation skills are increasingly important',
    ],
    hardParts: [
      'On-call responsibilities for outages',
      'Dealing with urgent issues under pressure',
      'Keeping systems secure against threats',
      'Supporting users with varying technical skills',
    ],
    starterSteps: [
      'Set up a home lab with Linux and Windows servers',
      'Learn scripting (Bash, PowerShell, Python)',
      'Study for certifications (CompTIA Server+, Linux+, MCSA)',
      'Practice with cloud platforms (AWS, Azure free tiers)',
      'Get comfortable with command line administration',
    ],
    typicalPath: [
      'IT support or helpdesk',
      'Junior systems administrator (1-2 years)',
      'Systems administrator (2-5 years)',
      'Senior sysadmin, DevOps engineer, or specialist',
    ],
    skillGaps: [
      'Linux and Windows administration',
      'Scripting and automation',
      'Networking fundamentals',
      'Security best practices',
    ],
    saturationNote: 'Entry-level is competitive. Cloud and automation skills help advance.',
  },
  {
    roleSlug: 'product-manager-tech',
    title: 'Technical Product Manager',
    overview: 'Technical PMs define product strategy for technology products, working at the intersection of business, technology, and user needs. The role requires both technical credibility and business acumen.',
    dayToDay: [
      'Defining product roadmap and priorities',
      'Writing requirements and user stories',
      'Analyzing user data and feedback',
      'Collaborating with engineering on feasibility',
      'Presenting to stakeholders and leadership',
      'Making tradeoff decisions on features',
    ],
    misconceptions: [
      'Not the boss of the engineering team',
      'Technical background is helpful but not always required',
      'More about saying no than saying yes',
      'Requires comfort with ambiguity and incomplete data',
    ],
    hardParts: [
      'Prioritizing when everything seems important',
      'Taking responsibility for product failures',
      'Managing stakeholders with competing interests',
      'Making decisions without complete information',
    ],
    starterSteps: [
      'Build products or features in your current role',
      'Learn product management frameworks (jobs-to-be-done, etc.)',
      'Practice user research and data analysis',
      'Develop business and communication skills',
      'Consider product management courses or bootcamps',
    ],
    typicalPath: [
      'Engineer, designer, or analyst role',
      'Associate or Junior Product Manager',
      'Product Manager (2-4 years)',
      'Senior PM, Group PM, or VP of Product',
    ],
    skillGaps: [
      'User research methodology',
      'Data analysis for decision making',
      'Stakeholder management',
      'Technical enough to earn engineer trust',
    ],
    saturationNote: 'Competitive field. Strong communication and proven impact help break in.',
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Seed Message Templates (Safety Messaging Phase 1)
  console.log('📝 Seeding message templates...');
  for (const template of messageTemplates) {
    await prisma.messageTemplate.upsert({
      where: { key: template.key },
      update: {
        label: template.label,
        description: template.description,
        category: template.category,
        direction: template.direction,
        sortOrder: template.sortOrder,
        allowedFields: template.allowedFields,
        isActive: true,
      },
      create: {
        key: template.key,
        label: template.label,
        description: template.description,
        category: template.category,
        direction: template.direction,
        sortOrder: template.sortOrder,
        allowedFields: template.allowedFields,
        isActive: true,
      },
    });
  }
  console.log(`✅ Seeded ${messageTemplates.length} message templates`);

  // Seed Life Skills Cards
  console.log('🌱 Seeding life skills cards...');
  for (const card of lifeSkillCards) {
    await prisma.lifeSkillCard.upsert({
      where: { key: card.key },
      update: {
        title: card.title,
        body: card.body,
        tags: card.tags,
        audience: card.audience,
        version: card.version,
        isActive: true,
      },
      create: {
        key: card.key,
        title: card.title,
        body: card.body,
        tags: card.tags,
        audience: card.audience,
        version: card.version,
        isActive: true,
      },
    });
  }
  console.log(`✅ Seeded ${lifeSkillCards.length} life skills cards`);

  // Seed Skills Taxonomy
  console.log('🎯 Seeding skills taxonomy...');
  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { slug: skill.slug },
      update: {
        name: skill.name,
        category: skill.category,
        isActive: true,
      },
      create: {
        slug: skill.slug,
        name: skill.name,
        category: skill.category,
        isActive: true,
      },
    });
  }
  console.log(`✅ Seeded ${skills.length} skills`);

  // Seed Career Reality Checks
  console.log('📋 Seeding career reality checks...');
  for (const check of careerRealityChecks) {
    await prisma.careerRealityCheck.upsert({
      where: { roleSlug: check.roleSlug },
      update: {
        title: check.title,
        overview: check.overview,
        dayToDay: check.dayToDay,
        misconceptions: check.misconceptions,
        hardParts: check.hardParts,
        starterSteps: check.starterSteps,
        typicalPath: check.typicalPath,
        skillGaps: check.skillGaps,
        saturationNote: check.saturationNote,
        isActive: true,
      },
      create: {
        roleSlug: check.roleSlug,
        title: check.title,
        overview: check.overview,
        dayToDay: check.dayToDay,
        misconceptions: check.misconceptions,
        hardParts: check.hardParts,
        starterSteps: check.starterSteps,
        typicalPath: check.typicalPath,
        skillGaps: check.skillGaps,
        saturationNote: check.saturationNote,
        isActive: true,
      },
    });
  }
  console.log(`✅ Seeded ${careerRealityChecks.length} career reality checks`);

  // Seed Job Categories and Templates
  await seedJobCategories(prisma);

  // Seed Career Cards
  const careerCards = [
    {
      roleName: 'AI Engineer',
      summary: 'Build intelligent systems that can learn and make decisions. Work with machine learning models, neural networks, and cutting-edge AI technologies.',
      traits: ['Analytical thinking', 'Problem solving', 'Curiosity', 'Math skills'],
      dayInLife: [
        'Train machine learning models on large datasets',
        'Fine-tune AI systems for specific tasks',
        'Collaborate with data scientists and engineers',
        'Debug and optimize model performance',
      ],
      realityCheck: 'Requires strong math and programming skills. Can be frustrating when models do not work as expected. Not for those who prefer predictable, routine work.',
      salaryBand: '600k-1.2M NOK',
      companies: ['Google', 'OpenAI', 'Anthropic', 'Cognite', 'Norwegian startups'],
      certifications: [
        'Bachelor/Master in Computer Science, Mathematics, or related field',
        'TensorFlow Developer Certificate (optional)',
        'AWS/Azure ML Certifications (optional)',
        'Deep Learning Specialization (Coursera/fast.ai)',
      ],
      nextSteps: [
        'Learn Python programming',
        'Take online courses in machine learning (Coursera, fast.ai)',
        'Build a simple ML project (e.g., image classifier)',
        'Understand basic statistics and linear algebra',
      ],
      tags: ['tech', 'problem-solving', 'learning', 'analytical'],
      order: 1,
    },
    {
      roleName: 'Data Analyst',
      summary: 'Turn raw data into actionable insights. Help businesses make better decisions by analyzing trends, creating reports, and visualizing data.',
      traits: ['Attention to detail', 'Analytical', 'Communication', 'Curious'],
      dayInLife: [
        'Clean and prepare datasets',
        'Create dashboards and visualizations',
        'Analyze business metrics and trends',
        'Present findings to stakeholders',
      ],
      realityCheck: 'Lots of time cleaning messy data. Requires patience and precision. Not ideal if you hate repetitive tasks or working with spreadsheets.',
      salaryBand: '450k-750k NOK',
      companies: ['Equinor', 'DNB', 'Schibsted', 'Telenor', 'Consulting firms'],
      certifications: [
        'Bachelor in Statistics, Mathematics, Economics, or related field',
        'Microsoft Power BI Certification (optional)',
        'Tableau Desktop Specialist (optional)',
        'Google Data Analytics Professional Certificate (optional)',
        'SQL certifications (optional)',
      ],
      nextSteps: [
        'Learn Excel/Google Sheets advanced features',
        'Get familiar with SQL for databases',
        'Try tools like Tableau or PowerBI',
        'Practice with public datasets (Kaggle)',
      ],
      tags: ['analytical', 'communication', 'detail-oriented'],
      order: 2,
    },
    {
      roleName: 'Software Developer',
      summary: 'Write code to build apps, websites, and systems. From mobile apps to backend services, developers create the digital tools we use every day.',
      traits: ['Logical thinking', 'Problem solving', 'Patience', 'Creativity'],
      dayInLife: [
        'Write and review code',
        'Debug and fix software issues',
        'Collaborate with designers and product managers',
        'Deploy updates and new features',
      ],
      realityCheck: 'Debugging can be frustrating. Constant learning required as technology changes fast. Not for those who prefer physical/hands-on work.',
      salaryBand: '550k-900k NOK',
      companies: ['Finn.no', 'Vipps', 'Kahoot', 'Oda', 'Bouvet'],
      certifications: [
        'Bachelor in Computer Science or related field (or coding bootcamp alternative)',
        'GitHub Certifications (optional)',
        'AWS Certified Developer (optional)',
        'Microsoft Certified: Azure Developer Associate (optional)',
        'Oracle Certified Java Programmer (optional)',
        'freeCodeCamp certifications (optional)',
      ],
      nextSteps: [
        'Choose a language (Python, JavaScript, or Java)',
        'Build a simple personal project',
        'Learn version control (Git)',
        'Contribute to open source projects',
      ],
      tags: ['tech', 'problem-solving', 'creativity', 'learning'],
      order: 3,
    },
    {
      roleName: 'Cloud Engineer',
      summary: 'Manage and optimize cloud infrastructure. Help companies move to and operate on cloud platforms like AWS, Azure, or Google Cloud.',
      traits: ['Technical', 'Systematic', 'Problem solving', 'Security-minded'],
      dayInLife: [
        'Set up cloud infrastructure and services',
        'Monitor system performance and costs',
        'Automate deployments and scaling',
        'Troubleshoot infrastructure issues',
      ],
      realityCheck: 'Requires understanding multiple technologies. On-call duties for critical systems. High pressure when things break.',
      salaryBand: '600k-1M NOK',
      companies: ['DNV', 'Telenor', 'Aker Solutions', 'AWS', 'Microsoft'],
      certifications: [
        'Bachelor in Computer Science, IT, or related field',
        'AWS Solutions Architect - Associate/Professional',
        'Microsoft Certified: Azure Administrator Associate',
        'Google Cloud Professional Cloud Architect',
        'AWS Certified DevOps Engineer (optional)',
        'Kubernetes certifications (CKA, CKAD) (optional)',
      ],
      nextSteps: [
        'Learn Linux basics',
        'Get AWS or Azure free tier account',
        'Understand networking fundamentals',
        'Practice with Docker and Kubernetes',
      ],
      tags: ['tech', 'systematic', 'problem-solving'],
      order: 4,
    },
    {
      roleName: 'UX Designer',
      summary: 'Design digital experiences that are intuitive and delightful. Research user needs, create wireframes, and test prototypes.',
      traits: ['Empathy', 'Creativity', 'Communication', 'Attention to detail'],
      dayInLife: [
        'Conduct user research and interviews',
        'Create wireframes and prototypes',
        'Run usability tests',
        'Collaborate with developers and product managers',
      ],
      realityCheck: 'Requires balancing user needs with business goals. Can be challenging to get buy-in for design changes. Lots of iteration and feedback.',
      salaryBand: '500k-800k NOK',
      companies: ['Spotify', 'Finn.no', 'Design agencies', 'Startups'],
      certifications: [
        'Bachelor in Design, HCI (Human-Computer Interaction), or related field',
        'Nielsen Norman Group UX Certification (optional)',
        'Google UX Design Professional Certificate (optional)',
        'Interaction Design Foundation certifications (optional)',
        'Adobe Certified Professional (optional)',
      ],
      nextSteps: [
        'Learn Figma (free design tool)',
        'Study usability principles',
        'Redesign an existing app/website',
        'Build a portfolio of design projects',
      ],
      tags: ['creative', 'empathy', 'communication', 'detail-oriented'],
      order: 5,
    },
    {
      roleName: 'Cybersecurity Analyst',
      summary: 'Protect organizations from cyber threats. Monitor systems, investigate incidents, and implement security measures.',
      traits: ['Analytical', 'Detail-oriented', 'Problem solving', 'Ethical'],
      dayInLife: [
        'Monitor security alerts and logs',
        'Investigate potential security incidents',
        'Conduct vulnerability assessments',
        'Recommend security improvements',
      ],
      realityCheck: 'High-stress when dealing with active threats. Requires continuous learning as attacks evolve. On-call rotations common.',
      salaryBand: '550k-950k NOK',
      companies: ['NSM (National Security Authority)', 'Banks', 'Telenor', 'Consulting firms'],
      certifications: [
        'Bachelor in Cybersecurity, Computer Science, or IT',
        'CompTIA Security+',
        'Certified Information Systems Security Professional (CISSP)',
        'Certified Ethical Hacker (CEH)',
        'CompTIA CySA+ (Cybersecurity Analyst) (optional)',
        'GIAC Security Essentials (GSEC) (optional)',
      ],
      nextSteps: [
        'Learn networking and OS basics',
        'Practice on platforms like TryHackMe',
        'Understand common vulnerabilities (OWASP Top 10)',
        'Get familiar with security tools',
      ],
      tags: ['analytical', 'problem-solving', 'detail-oriented'],
      order: 6,
    },
    {
      roleName: 'Product Manager',
      summary: 'Define what gets built and why. Work with engineers, designers, and stakeholders to build products customers love.',
      traits: ['Strategic thinking', 'Communication', 'Leadership', 'Empathy'],
      dayInLife: [
        'Prioritize product features and roadmap',
        'Talk to customers and gather feedback',
        'Write product requirements',
        'Coordinate with engineering and design teams',
      ],
      realityCheck: 'Lots of meetings and stakeholder management. Must balance competing priorities. Often responsible for outcomes without direct control.',
      salaryBand: '600k-1.1M NOK',
      companies: ['Schibsted', 'Vipps', 'Kahoot', 'Oda', 'Zalando'],
      certifications: [
        'Bachelor degree (Business, Computer Science, Engineering, or any field)',
        'Certified Scrum Product Owner (CSPO) (optional)',
        'Pragmatic Institute Product Management certifications (optional)',
        'Product School certifications (optional)',
        'Agile certifications (optional)',
      ],
      nextSteps: [
        'Learn product thinking frameworks',
        'Build or contribute to a product',
        'Practice writing user stories',
        'Understand basic tech and design',
      ],
      tags: ['communication', 'strategic', 'empathy', 'leadership'],
      order: 7,
    },
    {
      roleName: 'Machine Learning Engineer',
      summary: 'Design, build, and deploy machine learning systems at scale. Bridge the gap between data science research and production software engineering.',
      traits: ['Mathematical', 'Programming skills', 'Problem solving', 'Research-oriented'],
      dayInLife: [
        'Develop ML pipelines and infrastructure',
        'Optimize model performance and accuracy',
        'Deploy models to production environments',
        'Monitor and maintain ML systems',
      ],
      realityCheck: 'Requires deep technical knowledge in both software and statistics. Models often fail in production. Constant experimentation and iteration needed.',
      salaryBand: '650k-1.3M NOK',
      companies: ['Schibsted', 'Cognite', 'DNB', 'Oda', 'Tech startups'],
      certifications: [
        'Master or PhD in Computer Science, Statistics, or related field (preferred)',
        'TensorFlow Developer Certificate (optional)',
        'AWS Certified Machine Learning - Specialty',
        'Google Cloud Professional Machine Learning Engineer (optional)',
        'Deep Learning Specialization (Coursera/fast.ai) (optional)',
        'MLOps certifications (optional)',
      ],
      nextSteps: [
        'Master Python and ML libraries (scikit-learn, TensorFlow)',
        'Learn MLOps and model deployment',
        'Build end-to-end ML projects',
        'Study computer science and statistics',
      ],
      tags: ['tech', 'analytical', 'problem-solving', 'learning'],
      order: 8,
    },
    {
      roleName: 'AI Product Manager',
      summary: 'Lead AI-powered product development. Understand both AI capabilities and user needs to create innovative solutions that solve real problems.',
      traits: ['Technical curiosity', 'Strategic thinking', 'Communication', 'Ethics-minded'],
      dayInLife: [
        'Define AI product vision and roadmap',
        'Evaluate AI capabilities and limitations',
        'Work with ML engineers and data scientists',
        'Manage ethical considerations and bias',
      ],
      realityCheck: 'Need to understand AI without being an expert. Must manage expectations about what AI can do. Ethical and regulatory challenges.',
      salaryBand: '650k-1.2M NOK',
      companies: ['OpenAI partners', 'Tech companies', 'AI startups', 'Consulting firms'],
      certifications: [
        'Bachelor degree (any field, preferably technical)',
        'AI/ML courses and certifications (Coursera, edX) (recommended)',
        'Product Management certifications (optional)',
        'AI Ethics certifications (optional)',
        'Certified Scrum Product Owner (CSPO) (optional)',
      ],
      nextSteps: [
        'Learn AI/ML basics and terminology',
        'Understand prompt engineering',
        'Study AI ethics and responsible AI',
        'Build simple AI-powered prototypes',
      ],
      tags: ['strategic', 'communication', 'tech', 'leadership'],
      order: 9,
    },
    {
      roleName: 'Prompt Engineer',
      summary: 'Craft and optimize prompts for large language models. Help businesses leverage AI effectively by designing prompt systems and workflows.',
      traits: ['Creative writing', 'Analytical', 'Detail-oriented', 'Curious'],
      dayInLife: [
        'Design and test prompts for various use cases',
        'Build prompt templates and chains',
        'Optimize for accuracy and cost',
        'Document best practices and patterns',
      ],
      realityCheck: 'New and rapidly evolving field. Requires constant learning as models change. May not exist in current form in 5 years.',
      salaryBand: '500k-900k NOK',
      companies: ['AI startups', 'Consulting firms', 'Tech companies', 'Marketing agencies'],
      certifications: [
        'No formal certifications yet (emerging field)',
        'NLP courses (Coursera, Stanford) (recommended)',
        'LLM-specific courses (DeepLearning.AI) (recommended)',
        'OpenAI or Anthropic documentation expertise',
        'Programming fundamentals (Python) (helpful)',
      ],
      nextSteps: [
        'Experiment with ChatGPT, Claude, and other LLMs',
        'Learn prompt engineering patterns',
        'Build prompt-based applications',
        'Study NLP basics',
      ],
      tags: ['creative', 'analytical', 'tech', 'learning'],
      order: 10,
    },
    {
      roleName: 'Computer Vision Engineer',
      summary: 'Teach computers to see and understand images and video. Work on applications like facial recognition, autonomous vehicles, and medical imaging.',
      traits: ['Mathematical', 'Programming', 'Problem solving', 'Patience'],
      dayInLife: [
        'Train neural networks on image datasets',
        'Optimize models for real-time processing',
        'Work with cameras and sensor data',
        'Debug visual recognition issues',
      ],
      realityCheck: 'Highly specialized field requiring deep learning expertise. Can be frustrating when models misidentify objects. GPU costs can be high.',
      salaryBand: '650k-1.3M NOK',
      companies: ['AutoStore', 'Cognite', 'Research institutions', 'Robotics companies'],
      certifications: [
        'Master or PhD in Computer Science, Computer Vision, or related field',
        'Computer Vision courses (Stanford CS231n) (recommended)',
        'Deep Learning Specialization (Coursera) (recommended)',
        'OpenCV certifications (optional)',
        'TensorFlow/PyTorch certifications (optional)',
      ],
      nextSteps: [
        'Learn Python and OpenCV',
        'Study deep learning for computer vision',
        'Build image classification projects',
        'Understand convolutional neural networks',
      ],
      tags: ['tech', 'analytical', 'problem-solving', 'learning'],
      order: 11,
    },
    {
      roleName: 'NLP Engineer',
      summary: 'Build systems that understand and generate human language. Work on chatbots, translation, sentiment analysis, and language models.',
      traits: ['Analytical', 'Programming', 'Linguistic interest', 'Problem solving'],
      dayInLife: [
        'Train language models on text data',
        'Build text processing pipelines',
        'Implement chatbots and conversational AI',
        'Optimize for multiple languages',
      ],
      realityCheck: 'Language is complex and ambiguous. Models make mistakes. Requires understanding of linguistics and machine learning.',
      salaryBand: '650k-1.2M NOK',
      companies: ['Translation services', 'Tech companies', 'AI startups', 'Financial services'],
      certifications: [
        'Master or PhD in Computer Science, Computational Linguistics, or related field',
        'NLP Specialization (Coursera/Stanford) (recommended)',
        'Deep Learning for NLP courses (recommended)',
        'Hugging Face certifications (optional)',
        'TensorFlow/PyTorch certifications (optional)',
      ],
      nextSteps: [
        'Learn NLP libraries (spaCy, NLTK, transformers)',
        'Study linguistics basics',
        'Build text classification projects',
        'Experiment with LLM APIs',
      ],
      tags: ['tech', 'analytical', 'problem-solving', 'learning'],
      order: 12,
    },
    {
      roleName: 'Telco Project Manager',
      summary: 'Lead telecommunications projects from planning to delivery. Manage network rollouts, infrastructure upgrades, and technology implementations.',
      traits: ['Organization', 'Communication', 'Technical understanding', 'Leadership'],
      dayInLife: [
        'Plan and track project timelines and budgets',
        'Coordinate with technical teams and vendors',
        'Manage stakeholder communications',
        'Resolve project risks and issues',
      ],
      realityCheck: 'Complex technical projects with many dependencies. Regulatory and compliance requirements. Often dealing with legacy systems.',
      salaryBand: '600k-1.1M NOK',
      companies: ['Telenor', 'Telia', 'Ice', 'Altibox', 'Network infrastructure providers'],
      certifications: [
        'Bachelor in Engineering, IT, Telecommunications, or related field',
        'Project Management Professional (PMP)',
        'PRINCE2 Foundation/Practitioner',
        'Telecom-specific certifications (3G/4G/5G) (optional)',
        'Agile/Scrum certifications (optional)',
      ],
      nextSteps: [
        'Learn project management fundamentals (PMP/PRINCE2)',
        'Understand telecom basics (4G/5G, fiber)',
        'Get familiar with project management tools',
        'Study vendor management',
      ],
      tags: ['communication', 'strategic', 'leadership', 'tech'],
      order: 13,
    },
    {
      roleName: 'DevOps Engineer',
      summary: 'Bridge development and operations. Automate deployments, manage infrastructure, and ensure systems run smoothly and reliably.',
      traits: ['Problem solving', 'Automation-minded', 'Systematic', 'Collaboration'],
      dayInLife: [
        'Build CI/CD pipelines for automated deployments',
        'Monitor system performance and incidents',
        'Automate infrastructure with code',
        'Improve deployment speed and reliability',
      ],
      realityCheck: 'On-call responsibilities for production issues. Fast-paced and high pressure when systems fail. Requires broad technical knowledge.',
      salaryBand: '600k-1.1M NOK',
      companies: ['Finn.no', 'Vipps', 'Schibsted', 'Banks', 'Tech companies'],
      certifications: [
        'Bachelor in Computer Science, IT, or related field',
        'AWS Certified DevOps Engineer - Professional',
        'Kubernetes certifications (CKA, CKAD)',
        'Docker Certified Associate (optional)',
        'HashiCorp Certified: Terraform Associate (optional)',
        'Linux certifications (RHCSA, LFCS) (optional)',
      ],
      nextSteps: [
        'Learn Linux, Docker, and Kubernetes',
        'Practice with CI/CD tools (GitHub Actions, Jenkins)',
        'Study infrastructure as code (Terraform)',
        'Understand cloud platforms (AWS/Azure)',
      ],
      tags: ['tech', 'problem-solving', 'systematic', 'learning'],
      order: 14,
    },
    {
      roleName: 'IT Operations Manager',
      summary: 'Ensure IT systems and services run smoothly. Manage support teams, infrastructure, and processes that keep businesses operating.',
      traits: ['Leadership', 'Problem solving', 'Communication', 'Process-oriented'],
      dayInLife: [
        'Manage IT support and operations teams',
        'Plan system maintenance and upgrades',
        'Handle major incidents and outages',
        'Optimize IT processes and costs',
      ],
      realityCheck: 'Responsible for system uptime and user satisfaction. Stressful during outages. Balance between service quality and cost control.',
      salaryBand: '650k-1.1M NOK',
      companies: ['Large enterprises', 'Government', 'Banks', 'Healthcare', 'Retail'],
      certifications: [
        'Bachelor in IT, Computer Science, or related field',
        'ITIL Foundation (required)',
        'ITIL Expert/Master (optional but helpful)',
        'Microsoft, Cisco, or vendor-specific certifications (optional)',
        'Leadership/Management certifications (optional)',
      ],
      nextSteps: [
        'Gain IT support and systems experience',
        'Learn ITIL framework',
        'Develop leadership and management skills',
        'Study incident management',
      ],
      tags: ['leadership', 'problem-solving', 'communication', 'systematic'],
      order: 15,
    },
    {
      roleName: 'QA/Test Engineer',
      summary: 'Ensure software quality through testing and automation. Find bugs before users do and help teams ship reliable, high-quality products.',
      traits: ['Detail-oriented', 'Analytical', 'Patience', 'Critical thinking'],
      dayInLife: [
        'Write and execute test plans',
        'Create automated test scripts',
        'Report and track bugs',
        'Collaborate with developers to improve quality',
      ],
      realityCheck: 'Can feel repetitive testing the same features. Pressure to balance speed with thoroughness. Developers may not prioritize bug fixes.',
      salaryBand: '500k-850k NOK',
      companies: ['Finn.no', 'DNB', 'Vipps', 'Software companies', 'Consulting firms'],
      certifications: [
        'Bachelor in Computer Science, IT, or related field (or alternative paths)',
        'ISTQB Foundation Level (recommended)',
        'ISTQB Advanced/Expert Level (optional)',
        'Test automation tool certifications (Selenium, Cypress) (optional)',
        'Agile Tester certifications (optional)',
      ],
      nextSteps: [
        'Learn testing fundamentals and methodologies',
        'Practice with automation tools (Selenium, Playwright)',
        'Understand programming basics',
        'Learn API testing (Postman)',
      ],
      tags: ['analytical', 'detail-oriented', 'problem-solving', 'tech'],
      order: 16,
    },
    {
      roleName: 'SAFe Agile Coach',
      summary: 'Help large organizations adopt and improve agile practices at scale. Guide teams, train leaders, and drive cultural transformation.',
      traits: ['Communication', 'Leadership', 'Empathy', 'Teaching ability'],
      dayInLife: [
        'Coach teams on agile practices',
        'Facilitate PI planning and ceremonies',
        'Train leaders on SAFe framework',
        'Help resolve organizational impediments',
      ],
      realityCheck: 'Resistance to change is common. Lots of meetings and facilitation. Must influence without authority. Certification and experience required.',
      salaryBand: '700k-1.3M NOK',
      companies: ['DNB', 'Equinor', 'Telenor', 'Government', 'Consulting firms'],
      certifications: [
        'SAFe Program Consultant (SPC) (required)',
        'Certified Scrum Master (CSM) or Professional Scrum Master (PSM)',
        'SAFe Agilist (SA)',
        'ICF (International Coach Federation) coaching certification (optional)',
        'Agile Coach certifications (ICP-ACC) (optional)',
      ],
      nextSteps: [
        'Get Scrum Master or similar certification',
        'Gain hands-on agile team experience',
        'Study SAFe framework',
        'Develop coaching and facilitation skills',
      ],
      tags: ['leadership', 'communication', 'empathy', 'teaching'],
      order: 17,
    },
    {
      roleName: 'Doctor (Physician)',
      summary: 'Diagnose and treat illnesses, injuries, and diseases. Work in hospitals, clinics, or private practice to help people maintain and improve their health.',
      traits: ['Empathy', 'Problem solving', 'Communication', 'Resilience', 'Attention to detail'],
      dayInLife: [
        'Examine patients and review medical histories',
        'Order and interpret diagnostic tests',
        'Prescribe treatments and medications',
        'Collaborate with nurses and specialists',
        'Document patient records and progress',
      ],
      realityCheck: 'Very long education (6+ years plus specialization). Emotionally demanding with life-and-death decisions. Irregular hours, night shifts, and on-call duties. High responsibility and stress.',
      salaryBand: '700k-1.8M NOK',
      companies: ['Oslo University Hospital', 'Helse Bergen', 'St. Olavs Hospital', 'Private clinics', 'Legevakt'],
      certifications: [
        'Medical degree (cand.med.) from Norwegian or recognized foreign university',
        'Turnustjeneste (internship)',
        'Autorisasjon as doctor from Helsedirektoratet',
        'Specialization (5-6 years additional training)',
      ],
      nextSteps: [
        'Focus on science subjects in videregående (biology, chemistry, physics)',
        'Achieve high grades for competitive medical school admission',
        'Volunteer at hospitals or care facilities',
        'Consider studying medicine abroad if not admitted in Norway',
      ],
      tags: ['healthcare', 'empathy', 'problem-solving', 'science'],
      order: 18,
    },
    {
      roleName: 'Dentist',
      summary: 'Care for patients\' oral health by diagnosing and treating teeth and gum problems. Perform cleanings, fillings, extractions, and cosmetic procedures.',
      traits: ['Precision', 'Steady hands', 'Communication', 'Patience', 'Detail-oriented'],
      dayInLife: [
        'Examine teeth and gums for issues',
        'Perform cleanings, fillings, and extractions',
        'Take and analyze X-rays',
        'Educate patients on oral hygiene',
        'Manage clinic and staff (if private practice)',
      ],
      realityCheck: '5-year education. Physically demanding (leaning over patients all day). Some patients have dental anxiety. Running a private practice means business responsibilities too.',
      salaryBand: '650k-1.5M NOK',
      companies: ['Den offentlige tannhelsetjenesten', 'Private clinics', 'Colosseum Dental', 'Oris Dental', 'Own practice'],
      certifications: [
        'Master in Odontology (5 years) from UiO, UiB, or UiT',
        'Autorisasjon from Helsedirektoratet',
        'Specialization in orthodontics, surgery, etc. (optional)',
      ],
      nextSteps: [
        'Focus on science subjects in videregående',
        'Achieve high grades (competitive admission)',
        'Get experience in healthcare settings',
        'Consider dental hygienist as alternative path',
      ],
      tags: ['healthcare', 'precision', 'patient-care', 'science'],
      order: 19,
    },
    {
      roleName: 'Lawyer (Advokat)',
      summary: 'Provide legal advice and represent clients in court. Specialize in areas like business law, family law, criminal defense, or immigration.',
      traits: ['Analytical thinking', 'Communication', 'Attention to detail', 'Persuasion', 'Ethics'],
      dayInLife: [
        'Research laws and legal precedents',
        'Draft contracts and legal documents',
        'Meet with clients to discuss cases',
        'Represent clients in court or negotiations',
        'Stay updated on new laws and regulations',
      ],
      realityCheck: 'Long education (5 years + 2 years practice). Lots of reading and paperwork. Can be stressful with tight deadlines. Not all law is like TV courtroom drama.',
      salaryBand: '600k-1.5M NOK',
      companies: ['Wiersholm', 'Thommessen', 'Schjødt', 'BAHR', 'Regjeringsadvokaten', 'Own practice'],
      certifications: [
        'Master in Law (rettsvitenskap) from Norwegian university',
        '2 years supervised practice (advokatfullmektig)',
        'Advokatbevilling from Tilsynsrådet for advokatvirksomhet',
      ],
      nextSteps: [
        'Develop strong reading and writing skills',
        'Study social sciences and history',
        'Join debate clubs or Model UN',
        'Consider law internships during studies',
      ],
      tags: ['analytical', 'communication', 'detail-oriented', 'ethics'],
      order: 20,
    },
    {
      roleName: 'IT Architect',
      summary: 'Design the technical blueprint for complex IT systems. Make high-level decisions about software architecture, integrations, and technology choices.',
      traits: ['Strategic thinking', 'Technical expertise', 'Communication', 'Problem solving'],
      dayInLife: [
        'Design system architectures and integrations',
        'Evaluate and select technologies',
        'Create technical documentation and diagrams',
        'Guide development teams on architectural decisions',
        'Ensure scalability, security, and performance',
      ],
      realityCheck: 'Requires years of development experience first. Must balance technical ideals with business constraints. Lots of meetings and documentation.',
      salaryBand: '800k-1.4M NOK',
      companies: ['Accenture', 'Capgemini', 'Sopra Steria', 'DNB', 'Equinor', 'Telenor'],
      certifications: [
        'Bachelor/Master in Computer Science or IT',
        'TOGAF Certified (The Open Group Architecture Framework)',
        'AWS Solutions Architect Professional',
        'Azure Solutions Architect Expert',
        'Relevant vendor certifications (optional)',
      ],
      nextSteps: [
        'Build strong programming foundation',
        'Work as developer for several years',
        'Learn about system design and patterns',
        'Study enterprise architecture frameworks',
      ],
      tags: ['tech', 'strategic', 'problem-solving', 'leadership'],
      order: 21,
    },
    {
      roleName: 'Product Owner',
      summary: 'Own the product backlog and prioritize features for agile development teams. Bridge business needs with technical delivery to create valuable products.',
      traits: ['Communication', 'Decision-making', 'Stakeholder management', 'Analytical'],
      dayInLife: [
        'Prioritize and manage the product backlog',
        'Write user stories and acceptance criteria',
        'Participate in sprint planning and reviews',
        'Gather feedback from users and stakeholders',
        'Make trade-off decisions on scope',
      ],
      realityCheck: 'Constantly balancing competing priorities. Must say no to stakeholders often. Accountable for product success without full control over execution.',
      salaryBand: '550k-950k NOK',
      companies: ['Vipps', 'Finn.no', 'Schibsted', 'DNB', 'Oda', 'Software companies'],
      certifications: [
        'Bachelor degree (any field)',
        'Certified Scrum Product Owner (CSPO)',
        'Professional Scrum Product Owner (PSPO)',
        'SAFe Product Owner/Product Manager (POPM) (optional)',
      ],
      nextSteps: [
        'Learn agile and Scrum fundamentals',
        'Understand product development lifecycle',
        'Practice writing user stories',
        'Get experience in software teams',
      ],
      tags: ['communication', 'analytical', 'leadership', 'agile'],
      order: 22,
    },
    {
      roleName: 'Project Manager',
      summary: 'Lead projects from start to finish. Plan timelines, manage budgets, coordinate teams, and ensure deliverables are completed on time and within scope.',
      traits: ['Organization', 'Communication', 'Leadership', 'Problem solving', 'Adaptability'],
      dayInLife: [
        'Plan and track project schedules and milestones',
        'Manage project budgets and resources',
        'Lead team meetings and status updates',
        'Identify and mitigate project risks',
        'Report progress to stakeholders',
      ],
      realityCheck: 'Responsible for outcomes but dependent on others to deliver. Stressful when projects go off track. Lots of meetings and documentation.',
      salaryBand: '550k-1M NOK',
      companies: ['Consulting firms', 'Construction companies', 'IT companies', 'Government', 'Any large organization'],
      certifications: [
        'Bachelor degree (any field)',
        'Project Management Professional (PMP)',
        'PRINCE2 Foundation/Practitioner',
        'Certified Scrum Master (CSM) (optional)',
        'Agile certifications (optional)',
      ],
      nextSteps: [
        'Learn project management fundamentals',
        'Practice organizing events or initiatives',
        'Study PM methodologies (waterfall, agile)',
        'Get certified in PRINCE2 or PMP',
      ],
      tags: ['leadership', 'organization', 'communication', 'problem-solving'],
      order: 23,
    },
    {
      roleName: 'Electrician',
      summary: 'Install, maintain, and repair electrical systems in homes, businesses, and industrial settings. Essential skilled trade with strong job security.',
      traits: ['Technical skills', 'Problem solving', 'Safety-conscious', 'Physical fitness', 'Precision'],
      dayInLife: [
        'Install wiring and electrical systems',
        'Troubleshoot electrical problems',
        'Read blueprints and technical diagrams',
        'Ensure compliance with safety codes',
        'Work on construction sites or service calls',
      ],
      realityCheck: 'Physical work, often in tight spaces or at heights. Safety risks with electricity. Early mornings and sometimes emergency calls. Weather exposure on outdoor jobs.',
      salaryBand: '450k-750k NOK',
      companies: ['Bravida', 'Eltel', 'GK', 'Local electrical companies', 'Own business'],
      certifications: [
        'Electrician vocational training (VG1 + VG2 + 2.5 years læretid)',
        'Fagbrev as electrician',
        'Installatørprøven (for independent work)',
        'Specialized certifications (automation, renewable energy)',
      ],
      nextSteps: [
        'Choose elektro in videregående (VG1 Elektro)',
        'Find læreplass (apprenticeship)',
        'Complete fagbrev certification',
        'Consider specialization in smart homes or solar',
      ],
      tags: ['trades', 'technical', 'hands-on', 'problem-solving'],
      order: 24,
    },
    {
      roleName: 'Plumber',
      summary: 'Install and repair water, gas, and drainage systems. Work on new construction and maintenance in residential, commercial, and industrial buildings.',
      traits: ['Problem solving', 'Physical fitness', 'Technical skills', 'Customer service', 'Reliability'],
      dayInLife: [
        'Install pipes, fixtures, and appliances',
        'Diagnose and repair leaks and blockages',
        'Read blueprints and building codes',
        'Work with customers on service calls',
        'Ensure systems meet regulations',
      ],
      realityCheck: 'Physically demanding work. Can be messy (sewage, tight spaces). Emergency calls at odd hours. But always in demand and good job security.',
      salaryBand: '450k-700k NOK',
      companies: ['Bademiljø', 'Comfort', 'Local plumbing companies', 'Construction firms', 'Own business'],
      certifications: [
        'Plumber vocational training (VG1 + VG2 + læretid)',
        'Fagbrev as rørlegger',
        'Specialized certifications (gas, sprinkler systems)',
      ],
      nextSteps: [
        'Choose bygg- og anleggsteknikk in videregående',
        'Find læreplass as rørleggerlærling',
        'Complete fagbrev',
        'Consider starting own business eventually',
      ],
      tags: ['trades', 'technical', 'hands-on', 'customer-service'],
      order: 25,
    },
    {
      roleName: 'Carpenter',
      summary: 'Build and repair structures made of wood and other materials. Work on houses, furniture, interiors, and construction projects.',
      traits: ['Craftsmanship', 'Precision', 'Physical fitness', 'Creativity', 'Problem solving'],
      dayInLife: [
        'Read blueprints and measure materials',
        'Cut, shape, and assemble wood structures',
        'Install doors, windows, and fixtures',
        'Work on construction sites or workshops',
        'Ensure quality and safety standards',
      ],
      realityCheck: 'Physical outdoor work in all weather. Risk of injury with power tools. Seasonal variations in work. But satisfying to see tangible results of your work.',
      salaryBand: '420k-650k NOK',
      companies: ['Veidekke', 'AF Gruppen', 'Local construction companies', 'Furniture makers', 'Own business'],
      certifications: [
        'Carpenter vocational training (VG1 + VG2 + læretid)',
        'Fagbrev as tømrer',
        'Specialized certifications (furniture, restoration)',
      ],
      nextSteps: [
        'Choose bygg- og anleggsteknikk in videregående',
        'Find læreplass as tømrerlærling',
        'Complete fagbrev',
        'Consider specialization in møbelsnekker or restoration',
      ],
      tags: ['trades', 'creative', 'hands-on', 'craftsmanship'],
      order: 26,
    },
    {
      roleName: 'Real Estate Agent',
      summary: 'Help people buy, sell, and rent properties. Guide clients through one of the biggest financial decisions of their lives.',
      traits: ['Communication', 'Sales skills', 'Negotiation', 'Self-motivation', 'Local knowledge'],
      dayInLife: [
        'Meet with clients to understand their needs',
        'Show properties and conduct viewings',
        'Market properties through photos and listings',
        'Negotiate deals between buyers and sellers',
        'Handle contracts and closing processes',
      ],
      realityCheck: 'Income often commission-based (variable). Work evenings and weekends for viewings. Competitive market. Must be comfortable with sales and rejection.',
      salaryBand: '400k-1.2M NOK',
      companies: ['DNB Eiendom', 'Privatmegleren', 'Eie Eiendomsmegling', 'Krogsveen', 'Local agencies'],
      certifications: [
        'Eiendomsmegler education (bachelor or 2-year program)',
        'Eiendomsmeglerbrev from Finanstilsynet',
        'Alternative: Eiendomsmeglerassistent (shorter path)',
      ],
      nextSteps: [
        'Develop strong communication and people skills',
        'Study economics and law basics',
        'Get part-time job in customer service or sales',
        'Consider eiendomsmeglerassistent role to start',
      ],
      tags: ['sales', 'communication', 'negotiation', 'customer-service'],
      order: 27,
    },
    {
      roleName: 'Interior Designer',
      summary: 'Create functional and beautiful indoor spaces. Design homes, offices, restaurants, and other environments that improve how people live and work.',
      traits: ['Creativity', 'Visual sense', 'Communication', 'Attention to detail', 'Project management'],
      dayInLife: [
        'Meet clients to understand their needs and style',
        'Create mood boards and design concepts',
        'Select materials, furniture, and colors',
        'Create floor plans and 3D visualizations',
        'Coordinate with contractors and suppliers',
      ],
      realityCheck: 'Clients may have unrealistic budgets or expectations. Lots of project management and coordination. Competitive field. Not just about making things pretty.',
      salaryBand: '400k-700k NOK',
      companies: ['Design agencies', 'Architecture firms', 'Furniture retailers', 'Own business', 'Construction companies'],
      certifications: [
        'Bachelor in Interior Architecture/Design (3 years)',
        'From AHO, KHiO, or private schools (Noroff, BI)',
        'Portfolio is crucial for employment',
      ],
      nextSteps: [
        'Develop drawing and visualization skills',
        'Study art and design history',
        'Learn CAD software (SketchUp, AutoCAD)',
        'Build a portfolio of design projects',
      ],
      tags: ['creative', 'visual', 'communication', 'detail-oriented'],
      order: 28,
    },
  ];

  for (const card of careerCards) {
    await prisma.careerCard.upsert({
      where: { roleName: card.roleName },
      update: card,
      create: card,
    });
  }

  console.log('✅ Created career cards');

  // Seed youth-specific entry-level career cards
  await seedYouthCareers(prisma);
  console.log('✅ Created youth career cards');

  // Seed Help Docs
  const helpDocs = [
    {
      slug: 'getting-started',
      title: 'Getting Started',
      content: `# Welcome to Sprout

This platform helps you earn money through micro-jobs while discovering potential career paths. Growth from small beginnings.

## Quick Start
1. Complete your profile
2. Browse available micro-jobs
3. Swipe through career cards to find what interests you
4. Ask professionals questions about careers
5. Track your growing skills

## Safety First
- Never share personal information publicly
- All transactions happen offline
- Report any inappropriate behavior
- Parents/guardians can monitor activity for under-18 users`,
      tags: ['onboarding', 'basics'],
    },
    {
      slug: 'how-to-apply-jobs',
      title: 'How to Apply for Jobs',
      content: `# Applying for Micro-Jobs

1. Browse the jobs feed
2. Filter by category, location, and pay
3. Click on a job to see full details
4. Write a short message explaining why you're a good fit
5. Submit your application

## Tips for Getting Hired
- Be specific about your experience
- Mention your availability
- Be professional and friendly
- Respond quickly to messages`,
      tags: ['jobs', 'applications'],
    },
  ];

  for (const doc of helpDocs) {
    await prisma.helpDoc.upsert({
      where: { slug: doc.slug },
      update: doc,
      create: doc,
    });
  }

  console.log('✅ Created help docs');

  // Create demo employer user for posting jobs
  const demoEmployer = await prisma.user.upsert({
    where: { email: 'demo-employer@youthplatform.no' },
    update: {},
    create: {
      email: 'demo-employer@youthplatform.no',
      role: 'EMPLOYER',
      employerProfile: {
        create: {
          companyName: 'Demo Local Services',
          verified: true,
        },
      },
    },
  });

  console.log('✅ Created demo employer');

  // Helper function to generate dates for future jobs
  const getJobDates = (daysFromNow: number, durationHours: number = 2) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + daysFromNow);
    startDate.setHours(10 + Math.floor(Math.random() * 8), 0, 0, 0); // Random hour between 10am-6pm

    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + durationHours);

    return { startDate, endDate };
  };

  // Helper function to generate dates for completed jobs (in the past)
  const getPastJobDates = (daysAgo: number, durationHours: number = 2) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    startDate.setHours(10 + Math.floor(Math.random() * 8), 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + durationHours);

    return { startDate, endDate };
  };

  // Seed 20 demo micro-jobs distributed across all 12 new StandardJobCategories
  // All jobs are eligible for both age groups (15-17 and 18-20) unless otherwise specified
  const eligibleForAll = ['15-17', '18-20'];

  // Fetch all StandardJobCategories to link jobs to them
  const standardCategories = await prisma.standardJobCategory.findMany();
  const categoryMap = new Map(standardCategories.map(c => [c.slug, c.id]));

  const demoJobs = [
    // 1. home-yard-help - Home & Yard Help (2 jobs)
    {
      title: 'Snow Clearing - Driveway and Walkway',
      category: JobCategory.SNOW_CLEARING,
      standardCategoryId: categoryMap.get('home-yard-help'),
      description: 'Need help clearing snow from driveway and front walkway. Shovel provided. Should take 1-2 hours.',
      payType: PayType.FIXED,
      payAmount: 300,
      location: 'Oslo, Holmenkollen',
      status: 'POSTED' as const,
      requiredTraits: ['physically fit', 'reliable'],
      eligibleAgeGroups: eligibleForAll,
      postedById: demoEmployer.id,
      ...getJobDates(1, 2),
    },
    {
      title: 'Lawn Mowing and Leaf Raking',
      category: JobCategory.DIY_HELP,
      standardCategoryId: categoryMap.get('home-yard-help'),
      description: 'Help with lawn mowing and raking leaves in front and back yard. Equipment provided. About 2 hours.',
      payType: PayType.FIXED,
      payAmount: 280,
      location: 'Oslo, Oppegård',
      status: 'POSTED' as const,
      requiredTraits: ['outdoor work', 'energetic'],
      eligibleAgeGroups: eligibleForAll,
      postedById: demoEmployer.id,
      ...getJobDates(4, 2),
    },

    // 2. child-family-support - Child & Family Support (2 jobs)
    {
      title: 'Babysitting - Two Kids (Ages 4 and 7)',
      category: JobCategory.BABYSITTING,
      standardCategoryId: categoryMap.get('child-family-support'),
      description: 'Looking for a responsible babysitter for Friday evening (6pm-10pm). Two well-behaved children. Experience required.',
      payType: PayType.HOURLY,
      payAmount: 180,
      location: 'Oslo, Frogner',
      status: 'POSTED' as const,
      requiredTraits: ['patient', 'responsible', 'energetic'],
      eligibleAgeGroups: eligibleForAll,
      postedById: demoEmployer.id,
      ...getJobDates(3, 4),
    },
    {
      title: 'Homework Helper - Primary School',
      category: JobCategory.BABYSITTING,
      standardCategoryId: categoryMap.get('child-family-support'),
      description: 'Help 8-year-old with homework and reading practice. Mon-Thu 3:30-5pm. Patient and encouraging person needed.',
      payType: PayType.HOURLY,
      payAmount: 170,
      location: 'Oslo, Romsås',
      status: 'POSTED' as const,
      requiredTraits: ['patient', 'good with kids', 'reliable'],
      eligibleAgeGroups: eligibleForAll,
      postedById: demoEmployer.id,
      ...getJobDates(2, 2),
    },

    // 3. pet-animal-care - Pet & Animal Care (2 jobs)
    {
      title: 'Dog Walking - Friendly Golden Retriever',
      category: JobCategory.DOG_WALKING,
      standardCategoryId: categoryMap.get('pet-animal-care'),
      description: 'Need someone to walk our 3-year-old Golden Retriever, Max, for 30 minutes. He is very friendly and well-behaved.',
      payType: PayType.FIXED,
      payAmount: 150,
      location: 'Oslo, Majorstuen',
      status: 'POSTED' as const,
      requiredTraits: ['reliable', 'loves animals'],
      eligibleAgeGroups: eligibleForAll,
      postedById: demoEmployer.id,
      ...getJobDates(2, 1),
    },
    {
      title: 'Pet Sitting - Cat for Weekend',
      category: JobCategory.OTHER,
      standardCategoryId: categoryMap.get('pet-animal-care'),
      description: 'Need someone to check on and feed my cat twice daily while I am away this weekend. Very friendly cat!',
      payType: PayType.FIXED,
      payAmount: 400,
      location: 'Oslo, St. Hanshaugen',
      status: 'POSTED' as const,
      requiredTraits: ['loves animals', 'responsible'],
      eligibleAgeGroups: eligibleForAll,
      postedById: demoEmployer.id,
      ...getJobDates(3, 48),
    },

    // 4. cleaning-organizing - Cleaning & Organizing (2 jobs)
    {
      title: 'Room Tidying and Closet Organization',
      category: JobCategory.CLEANING,
      standardCategoryId: categoryMap.get('cleaning-organizing'),
      description: 'Help organize and tidy bedroom and closet. Sorting clothes, arranging shelves. About 2-3 hours.',
      payType: PayType.FIXED,
      payAmount: 300,
      location: 'Fjellhamar',
      status: 'POSTED' as const,
      requiredTraits: ['organized', 'detail-oriented'],
      eligibleAgeGroups: eligibleForAll,
      postedById: demoEmployer.id,
      ...getJobDates(5, 3),
    },
    {
      title: 'Car Interior Cleaning',
      category: JobCategory.CLEANING,
      standardCategoryId: categoryMap.get('cleaning-organizing'),
      description: 'Looking for help cleaning car interior. Vacuum seats, wipe surfaces, clean windows. Supplies provided.',
      payType: PayType.FIXED,
      payAmount: 200,
      location: 'Oslo, Nordstrand',
      status: 'POSTED' as const,
      requiredTraits: ['detail-oriented', 'thorough'],
      eligibleAgeGroups: eligibleForAll,
      postedById: demoEmployer.id,
      ...getJobDates(3, 2),
    },

    // 5. tech-digital-help - Tech & Digital Help (2 jobs)
    {
      title: 'Phone Setup for Grandparents',
      category: JobCategory.TECH_HELP,
      standardCategoryId: categoryMap.get('tech-digital-help'),
      description: 'Help my elderly mother learn to use her new smartphone. Need patient person to teach basics like calls, messages, photos.',
      payType: PayType.HOURLY,
      payAmount: 200,
      location: 'Oslo, Aker Brygge',
      status: 'POSTED' as const,
      requiredTraits: ['patient', 'friendly', 'tech-savvy'],
      eligibleAgeGroups: eligibleForAll,
      postedById: demoEmployer.id,
      ...getJobDates(5, 2),
    },
    {
      title: 'App Installation and Email Setup',
      category: JobCategory.TECH_HELP,
      standardCategoryId: categoryMap.get('tech-digital-help'),
      description: 'Need help installing apps and setting up email on tablet. Also organize photos in cloud storage. 1-2 hours.',
      payType: PayType.HOURLY,
      payAmount: 180,
      location: 'Lørenskog, Sentrum',
      status: 'POSTED' as const,
      requiredTraits: ['tech-savvy', 'patient'],
      eligibleAgeGroups: eligibleForAll,
      postedById: demoEmployer.id,
      ...getJobDates(4, 2),
    },

    // 6. errands-local-tasks - Errands & Local Tasks (2 jobs)
    {
      title: 'Grocery Pickup and Delivery',
      category: JobCategory.ERRANDS,
      standardCategoryId: categoryMap.get('errands-local-tasks'),
      description: 'Need someone to pick up groceries from local store and deliver to my apartment. Shopping list provided.',
      payType: PayType.FIXED,
      payAmount: 180,
      location: 'Oslo, Tøyen',
      status: 'POSTED' as const,
      requiredTraits: ['reliable', 'organized'],
      eligibleAgeGroups: eligibleForAll,
      postedById: demoEmployer.id,
      ...getJobDates(2, 1),
    },
    {
      title: 'Return Packages to Post Office',
      category: JobCategory.ERRANDS,
      standardCategoryId: categoryMap.get('errands-local-tasks'),
      description: 'Drop off 3 packages at the local post office. Simple errand, about 30 minutes total.',
      payType: PayType.FIXED,
      payAmount: 120,
      location: 'Oslo, Storo',
      status: 'POSTED' as const,
      requiredTraits: ['reliable', 'punctual'],
      eligibleAgeGroups: eligibleForAll,
      postedById: demoEmployer.id,
      ...getJobDates(1, 1),
    },

    // 7. events-community-help - Events & Community Help (2 jobs)
    {
      title: 'Birthday Party Helper',
      category: JobCategory.OTHER,
      standardCategoryId: categoryMap.get('events-community-help'),
      description: 'Help with kids birthday party - setting up decorations, serving food, organizing games, and cleanup. 3pm-7pm Saturday.',
      payType: PayType.FIXED,
      payAmount: 350,
      location: 'Oslo, Vinderen',
      status: 'POSTED' as const,
      requiredTraits: ['energetic', 'good with kids', 'organized'],
      eligibleAgeGroups: eligibleForAll,
      postedById: demoEmployer.id,
      ...getJobDates(6, 4),
    },
    {
      title: 'Community Cleanup Event Assistant',
      category: JobCategory.OTHER,
      standardCategoryId: categoryMap.get('events-community-help'),
      description: 'Help organize and participate in local park cleanup. Picking up litter, sorting recyclables. Equipment provided.',
      payType: PayType.FIXED,
      payAmount: 200,
      location: 'Oslo, Grünerløkka',
      status: 'POSTED' as const,
      requiredTraits: ['outdoor work', 'community-minded', 'reliable'],
      eligibleAgeGroups: eligibleForAll,
      postedById: demoEmployer.id,
      ...getJobDates(7, 3),
    },

    // 8. creative-media-gigs - Creative & Media Gigs (2 jobs)
    {
      title: 'Simple Logo Design in Canva',
      category: JobCategory.OTHER,
      standardCategoryId: categoryMap.get('creative-media-gigs'),
      description: 'Create a simple logo for my small bakery business using Canva. Need 2-3 design options.',
      payType: PayType.FIXED,
      payAmount: 300,
      location: 'Oslo, Sentrum',
      status: 'POSTED' as const,
      requiredTraits: ['creative', 'design skills', 'reliable'],
      eligibleAgeGroups: eligibleForAll,
      postedById: demoEmployer.id,
      ...getJobDates(5, 3),
    },
    {
      title: 'Event Photo Taking',
      category: JobCategory.OTHER,
      standardCategoryId: categoryMap.get('creative-media-gigs'),
      description: 'Take photos at family reunion gathering. No professional equipment needed - smartphone is fine. 2-3 hours.',
      payType: PayType.FIXED,
      payAmount: 250,
      location: 'Lørenskog, Skårer',
      status: 'POSTED' as const,
      requiredTraits: ['creative', 'friendly', 'reliable'],
      eligibleAgeGroups: eligibleForAll,
      postedById: demoEmployer.id,
      ...getJobDates(8, 3),
    },

    // 9. education-learning-support - Education & Learning Support (1 job)
    {
      title: 'Tutoring - Math for 7th Grader',
      category: JobCategory.OTHER,
      standardCategoryId: categoryMap.get('education-learning-support'),
      description: 'Help 12-year-old with math homework and test preparation. Weekly sessions, 1-2 hours. Must be good at explaining concepts.',
      payType: PayType.HOURLY,
      payAmount: 200,
      location: 'Oslo, Ullern',
      status: 'POSTED' as const,
      requiredTraits: ['patient', 'good at math', 'reliable'],
      eligibleAgeGroups: eligibleForAll,
      postedById: demoEmployer.id,
      ...getJobDates(3, 2),
    },

    // 10. retail-microbusiness-help - Retail & Micro-Business Help (1 job)
    {
      title: 'Market Stall Helper - Weekend',
      category: JobCategory.OTHER,
      standardCategoryId: categoryMap.get('retail-microbusiness-help'),
      description: 'Help at farmers market stall on Saturday. Setting up, serving customers, packing up. 8am-3pm.',
      payType: PayType.FIXED,
      payAmount: 400,
      location: 'Oslo, Mathallen',
      status: 'POSTED' as const,
      requiredTraits: ['friendly', 'reliable', 'energetic'],
      eligibleAgeGroups: eligibleForAll,
      postedById: demoEmployer.id,
      ...getJobDates(5, 7),
    },

    // 11. fitness-activity-help - Fitness & Activity Help (1 job)
    {
      title: 'Walking Companion for Elderly',
      category: JobCategory.OTHER,
      standardCategoryId: categoryMap.get('fitness-activity-help'),
      description: 'Accompany my grandmother on her daily 30-minute walk around the neighborhood. Companionship and safety.',
      payType: PayType.FIXED,
      payAmount: 120,
      location: 'Oslo, Lambertseter',
      status: 'POSTED' as const,
      requiredTraits: ['patient', 'caring', 'reliable'],
      eligibleAgeGroups: eligibleForAll,
      postedById: demoEmployer.id,
      ...getJobDates(2, 1),
    },

    // 12. online-ai-age-jobs - Online & AI-Age Jobs (1 job)
    {
      title: 'AI Chatbot Testing and Feedback',
      category: JobCategory.OTHER,
      standardCategoryId: categoryMap.get('online-ai-age-jobs'),
      description: 'Test a new AI chatbot and provide detailed feedback. Try different questions and report any issues. Remote work.',
      payType: PayType.HOURLY,
      payAmount: 180,
      location: 'Remote',
      status: 'POSTED' as const,
      requiredTraits: ['detail-oriented', 'tech-savvy', 'good communicator'],
      eligibleAgeGroups: eligibleForAll,
      postedById: demoEmployer.id,
      ...getJobDates(4, 2),
    },
  ];

  // Check if jobs already exist to prevent duplicates
  const existingJobCount = await prisma.microJob.count();
  const MAX_JOBS_BEFORE_SKIP = 100;

  if (existingJobCount >= MAX_JOBS_BEFORE_SKIP) {
    console.log(`⏭️  Skipping job seeding: ${existingJobCount} jobs already exist (max: ${MAX_JOBS_BEFORE_SKIP})`);
  } else {
    let createdCount = 0;
    for (const job of demoJobs) {
      // Check if job with same title already exists for this employer
      const existingJob = await prisma.microJob.findFirst({
        where: {
          title: job.title,
          postedById: job.postedById,
        },
      });

      if (!existingJob) {
        await prisma.microJob.create({
          data: job,
        });
        createdCount++;
      }
    }
    console.log(`✅ Created ${createdCount} demo jobs (${demoJobs.length - createdCount} already existed)`);
  }

  // Create demo youth worker with reviews
  // Guardian consent pre-granted for test data (allows job applications)
  const ryanYouth = await prisma.user.upsert({
    where: { email: 'ryanmudie1982@gmail.com' },
    update: {
      role: 'YOUTH',
      accountStatus: 'ACTIVE', // Pre-approved for testing
    },
    create: {
      email: 'ryanmudie1982@gmail.com',
      role: 'YOUTH',
      accountStatus: 'ACTIVE', // Pre-approved for testing
    },
  });

  // Upsert Ryan's youth profile with all required fields
  // Guardian consent pre-granted for test data
  await prisma.youthProfile.upsert({
    where: { userId: ryanYouth.id },
    update: {
      displayName: 'Ryan Mudie',
      avatarId: 'avatar-casual-1',
      phoneNumber: '+47 912 34 567',
      bio: 'Reliable and hardworking student looking for part-time work. I enjoy helping people and learning new skills.',
      availability: 'Weekends and after 4pm on weekdays',
      interests: ['Technology', 'Helping Others', 'Learning'],
      profileVisibility: true,
      availabilityStatus: 'AVAILABLE',
      city: 'Fjellhamar',
      address: 'Fjellhamar, Norway',
      // Guardian consent pre-granted for testing
      guardianConsent: true,
      guardianConsentAt: new Date(),
    },
    create: {
      userId: ryanYouth.id,
      displayName: 'Ryan Mudie',
      avatarId: 'avatar-casual-1',
      phoneNumber: '+47 912 34 567',
      bio: 'Reliable and hardworking student looking for part-time work. I enjoy helping people and learning new skills.',
      availability: 'Weekends and after 4pm on weekdays',
      interests: ['Technology', 'Helping Others', 'Learning'],
      completedJobsCount: 0,
      averageRating: null,
      publicProfileSlug: 'ryan-mudie',
      profileVisibility: true,
      availabilityStatus: 'AVAILABLE',
      city: 'Fjellhamar',
      address: 'Fjellhamar, Norway',
      // Guardian consent pre-granted for testing
      guardianConsent: true,
      guardianConsentAt: new Date(),
    },
  });

  console.log('✅ Created/updated Ryan youth worker profile');

  // Create multiple employer reviewers
  const reviewerEmployers = [
    { email: 'sarah.johnson@example.com', company: 'Johnson Family Services' },
    { email: 'mike.chen@example.com', company: 'Chen Home Care' },
    { email: 'emma.williams@example.com', company: 'Williams Pet Services' },
    { email: 'david.brown@example.com', company: 'Brown Tech Solutions' },
    { email: 'lisa.anderson@example.com', company: 'Anderson Cleaning Co' },
  ];

  const employers = [];
  for (const emp of reviewerEmployers) {
    const employer = await prisma.user.upsert({
      where: { email: emp.email },
      update: {},
      create: {
        email: emp.email,
        role: 'EMPLOYER',
        employerProfile: {
          create: {
            companyName: emp.company,
            verified: true,
          },
        },
      },
    });
    employers.push(employer);
  }

  console.log('✅ Created reviewer employers');

  // Create completed jobs for reviews (using dynamic past dates)
  const completedJobsData = [
    {
      title: 'Weekend Babysitting - Two Kids',
      category: JobCategory.BABYSITTING,
      description: 'Babysitting for two children ages 5 and 8 during Saturday evening.',
      payType: PayType.HOURLY,
      payAmount: 180,
      location: 'Oslo, Frogner',
      status: 'COMPLETED' as const,
      requiredTraits: ['patient', 'responsible'],
      eligibleAgeGroups: eligibleForAll,
      ...getPastJobDates(14, 4), // 2 weeks ago
    },
    {
      title: 'Dog Walking - Morning Routine',
      category: JobCategory.DOG_WALKING,
      description: 'Daily morning walk for friendly Labrador.',
      payType: PayType.FIXED,
      payAmount: 150,
      location: 'Oslo, Majorstuen',
      status: 'COMPLETED' as const,
      requiredTraits: ['loves animals', 'punctual'],
      eligibleAgeGroups: eligibleForAll,
      ...getPastJobDates(10, 1), // 10 days ago
    },
    {
      title: 'Garden Cleanup and Weeding',
      category: JobCategory.DIY_HELP,
      description: 'Help with garden maintenance, weeding, and general cleanup.',
      payType: PayType.HOURLY,
      payAmount: 165,
      location: 'Lørenskog, Skårer',
      status: 'COMPLETED' as const,
      requiredTraits: ['outdoor work', 'reliable'],
      eligibleAgeGroups: eligibleForAll,
      ...getPastJobDates(7, 3), // 1 week ago
    },
    {
      title: 'Computer Setup and Training',
      category: JobCategory.TECH_HELP,
      description: 'Help elderly couple set up new laptop and learn basics.',
      payType: PayType.HOURLY,
      payAmount: 200,
      location: 'Oslo, Nordstrand',
      status: 'COMPLETED' as const,
      requiredTraits: ['patient', 'tech-savvy'],
      eligibleAgeGroups: eligibleForAll,
      ...getPastJobDates(5, 2), // 5 days ago
    },
    {
      title: 'Deep House Cleaning',
      category: JobCategory.CLEANING,
      description: 'Thorough cleaning of 3-bedroom house before guests arrive.',
      payType: PayType.FIXED,
      payAmount: 600,
      location: 'Fjellhamar',
      status: 'COMPLETED' as const,
      requiredTraits: ['thorough', 'detail-oriented'],
      eligibleAgeGroups: eligibleForAll,
      ...getPastJobDates(3, 4), // 3 days ago
    },
  ];

  const completedJobs = [];
  for (let i = 0; i < completedJobsData.length; i++) {
    const jobData = completedJobsData[i];
    const employerId = employers[i].id;

    // Check if job already exists
    const existingJob = await prisma.microJob.findFirst({
      where: {
        title: jobData.title,
        postedById: employerId,
      },
    });

    if (existingJob) {
      completedJobs.push(existingJob);
    } else {
      const job = await prisma.microJob.create({
        data: {
          ...jobData,
          postedById: employerId,
        },
      });
      completedJobs.push(job);
    }
  }

  console.log('✅ Created/found completed jobs for reviews');

  // Create accepted applications linking Ryan to jobs (if not already existing)
  for (const job of completedJobs) {
    const existingApp = await prisma.application.findFirst({
      where: {
        jobId: job.id,
        youthId: ryanYouth.id,
      },
    });

    if (!existingApp) {
      await prisma.application.create({
        data: {
          jobId: job.id,
          youthId: ryanYouth.id,
          message: 'I would love to help with this job!',
          status: 'ACCEPTED',
        },
      });
    }
  }

  console.log('✅ Created/found accepted applications');

  // Create reviews for Ryan
  const reviewsData = [
    {
      punctuality: 5,
      communication: 5,
      reliability: 5,
      overall: 5,
      positiveTags: ['Punctual', 'Professional', 'Great with kids', 'Trustworthy'],
      comment: 'Ryan was absolutely fantastic with our children! They loved having him around and he was very responsible. Will definitely hire again!',
    },
    {
      punctuality: 5,
      communication: 4,
      reliability: 5,
      overall: 5,
      positiveTags: ['Punctual', 'Reliable', 'Loves animals'],
      comment: 'Our dog Max loved Ryan! He was always on time and sent us updates during the walks. Highly recommend!',
    },
    {
      punctuality: 4,
      communication: 5,
      reliability: 5,
      overall: 4,
      positiveTags: ['Hard worker', 'Reliable', 'Friendly'],
      comment: 'Ryan did an excellent job with our garden. Very thorough and didn\'t cut any corners. Great communication throughout.',
    },
    {
      punctuality: 5,
      communication: 5,
      reliability: 5,
      overall: 5,
      positiveTags: ['Patient', 'Tech-savvy', 'Great teacher', 'Professional'],
      comment: 'Ryan was incredibly patient teaching us how to use our new laptop. He explained everything clearly and even wrote down instructions for us. Wonderful young man!',
    },
    {
      punctuality: 5,
      communication: 4,
      reliability: 5,
      overall: 5,
      positiveTags: ['Thorough', 'Detail-oriented', 'Hard worker'],
      comment: 'The house was spotless after Ryan finished! He paid attention to every detail and went above and beyond. Very impressed!',
    },
  ];

  for (let i = 0; i < reviewsData.length; i++) {
    await prisma.review.upsert({
      where: {
        jobId_reviewerId_reviewedId: {
          jobId: completedJobs[i].id,
          reviewerId: employers[i].id,
          reviewedId: ryanYouth.id,
        },
      },
      update: reviewsData[i],
      create: {
        jobId: completedJobs[i].id,
        reviewerId: employers[i].id,
        reviewedId: ryanYouth.id,
        ...reviewsData[i],
      },
    });
  }

  console.log('✅ Created reviews for Ryan');

  // Update Ryan's profile with calculated stats
  const avgRating = reviewsData.reduce((sum, r) => sum + r.overall, 0) / reviewsData.length;
  await prisma.youthProfile.update({
    where: { userId: ryanYouth.id },
    data: {
      completedJobsCount: completedJobs.length,
      averageRating: avgRating,
    },
  });

  console.log('✅ Updated Ryan profile with stats');

  // Create nickymudie@hotmail.com employer with jobs and reviews
  const nickyEmployer = await prisma.user.upsert({
    where: { email: 'nickymudie@hotmail.com' },
    update: {
      role: 'EMPLOYER',
      ageBracket: 'EIGHTEEN_TWENTY',
      accountStatus: 'ACTIVE',
      dateOfBirth: new Date('1990-01-15'), // Set DOB for age verification
    },
    create: {
      email: 'nickymudie@hotmail.com',
      role: 'EMPLOYER',
      ageBracket: 'EIGHTEEN_TWENTY',
      accountStatus: 'ACTIVE',
      dateOfBirth: new Date('1990-01-15'), // Set DOB for age verification
      employerProfile: {
        create: {
          companyName: 'Nicky\'s Services',
          bio: 'Local family services offering various jobs for youth workers.',
          verified: true,
          ageVerified: true,
        },
      },
    },
  });

  // Ensure employer profile exists and has correct settings
  await prisma.employerProfile.upsert({
    where: { userId: nickyEmployer.id },
    update: {
      verified: true,
      ageVerified: true,
    },
    create: {
      userId: nickyEmployer.id,
      companyName: 'Nicky\'s Services',
      bio: 'Local family services offering various jobs for youth workers.',
      verified: true,
      ageVerified: true,
    },
  });

  console.log('✅ Created/found nickymudie@hotmail.com employer');

  // Create jobs for Nicky's employer account
  const nickyJobsData = [
    {
      title: 'Afternoon Dog Walking - Border Collie',
      category: JobCategory.DOG_WALKING,
      description: 'Need someone to walk our energetic Border Collie, Luna, for 45 minutes in the afternoon. She loves to play fetch!',
      payType: PayType.FIXED,
      payAmount: 180,
      location: 'Oslo, Grünerløkka',
      status: 'POSTED' as const,
      requiredTraits: ['loves animals', 'energetic', 'reliable'],
      eligibleAgeGroups: eligibleForAll,
      postedById: nickyEmployer.id,
      ...getJobDates(3, 1),
    },
    {
      title: 'Weekend Babysitting - Twins (Age 6)',
      category: JobCategory.BABYSITTING,
      description: 'Looking for a fun and responsible babysitter for our 6-year-old twins. Saturday evening from 6pm-10pm.',
      payType: PayType.HOURLY,
      payAmount: 190,
      location: 'Oslo, Frogner',
      status: 'POSTED' as const,
      requiredTraits: ['patient', 'fun', 'responsible'],
      eligibleAgeGroups: eligibleForAll,
      postedById: nickyEmployer.id,
      ...getJobDates(5, 4),
    },
    {
      title: 'Tech Help - Smart Home Setup',
      category: JobCategory.TECH_HELP,
      description: 'Need help setting up smart home devices (lights, thermostat, speakers). Should take 2-3 hours.',
      payType: PayType.HOURLY,
      payAmount: 220,
      location: 'Lørenskog, Sentrum',
      status: 'POSTED' as const,
      requiredTraits: ['tech-savvy', 'patient', 'problem-solver'],
      eligibleAgeGroups: eligibleForAll,
      postedById: nickyEmployer.id,
      ...getJobDates(4, 3),
    },
    {
      title: 'Garden Spring Cleanup',
      category: JobCategory.DIY_HELP,
      description: 'Help with spring garden cleanup - raking leaves, clearing beds, preparing soil for planting. Tools provided.',
      payType: PayType.FIXED,
      payAmount: 400,
      location: 'Fjellhamar',
      status: 'POSTED' as const,
      requiredTraits: ['outdoor work', 'hardworking', 'reliable'],
      eligibleAgeGroups: eligibleForAll,
      postedById: nickyEmployer.id,
      ...getJobDates(7, 4),
    },
    {
      title: 'Weekly House Cleaning',
      category: JobCategory.CLEANING,
      description: 'Regular weekly cleaning of 3-bedroom house. Vacuuming, mopping, bathrooms, kitchen. All supplies provided.',
      payType: PayType.FIXED,
      payAmount: 450,
      location: 'Oslo, Majorstuen',
      status: 'POSTED' as const,
      requiredTraits: ['thorough', 'reliable', 'detail-oriented'],
      eligibleAgeGroups: eligibleForAll,
      postedById: nickyEmployer.id,
      ...getJobDates(2, 3),
    },
  ];

  let nickyJobsCreated = 0;
  for (const job of nickyJobsData) {
    // Check if job already exists
    const existingJob = await prisma.microJob.findFirst({
      where: {
        title: job.title,
        postedById: job.postedById,
      },
    });

    if (!existingJob) {
      await prisma.microJob.create({
        data: job,
      });
      nickyJobsCreated++;
    }
  }

  console.log(`✅ Created ${nickyJobsCreated} jobs for nickymudie@hotmail.com (${nickyJobsData.length - nickyJobsCreated} already existed)`);

  // Create completed jobs that Nicky posted and Ryan completed (for reviews)
  const nickyCompletedJobsData = [
    {
      title: 'Evening Dog Sitting',
      category: JobCategory.DOG_WALKING,
      description: 'Watched our dogs for the evening while we were at dinner.',
      payType: PayType.FIXED,
      payAmount: 250,
      location: 'Oslo, Grünerløkka',
      status: 'COMPLETED' as const,
      requiredTraits: ['loves animals', 'responsible'],
      eligibleAgeGroups: eligibleForAll,
      ...getPastJobDates(2, 5), // 2 days ago
      postedById: nickyEmployer.id,
    },
    {
      title: 'Birthday Party Help',
      category: JobCategory.BABYSITTING,
      description: 'Helped supervise kids birthday party and assisted with cleanup.',
      payType: PayType.HOURLY,
      payAmount: 180,
      location: 'Oslo, Frogner',
      status: 'COMPLETED' as const,
      requiredTraits: ['energetic', 'fun', 'responsible'],
      eligibleAgeGroups: eligibleForAll,
      ...getPastJobDates(1, 4), // Yesterday
      postedById: nickyEmployer.id,
    },
  ];

  const nickyCompletedJobs = [];
  for (const jobData of nickyCompletedJobsData) {
    // Check if job already exists
    const existingJob = await prisma.microJob.findFirst({
      where: {
        title: jobData.title,
        postedById: jobData.postedById,
      },
    });

    if (existingJob) {
      nickyCompletedJobs.push(existingJob);
      continue;
    }

    const job = await prisma.microJob.create({
      data: jobData,
    });
    nickyCompletedJobs.push(job);

    // Create accepted application
    await prisma.application.create({
      data: {
        jobId: job.id,
        youthId: ryanYouth.id,
        message: 'Happy to help!',
        status: 'ACCEPTED',
      },
    });
  }

  // Create reviews from Nicky to Ryan
  const nickyReviewsData = [
    {
      punctuality: 5,
      communication: 5,
      reliability: 5,
      overall: 5,
      positiveTags: ['Punctual', 'Great with animals', 'Trustworthy', 'Friendly'],
      comment: 'Ryan was amazing with our dogs! They absolutely loved him. He sent us updates and photos throughout the evening. Highly recommend!',
    },
    {
      punctuality: 5,
      communication: 5,
      reliability: 5,
      overall: 5,
      positiveTags: ['Great with kids', 'Energetic', 'Helpful', 'Professional'],
      comment: 'Ryan was a lifesaver at our kids birthday party! He kept all the children entertained and happy. Helped with cleanup without being asked. Will definitely hire again!',
    },
  ];

  for (let i = 0; i < nickyReviewsData.length; i++) {
    await prisma.review.upsert({
      where: {
        jobId_reviewerId_reviewedId: {
          jobId: nickyCompletedJobs[i].id,
          reviewerId: nickyEmployer.id,
          reviewedId: ryanYouth.id,
        },
      },
      update: nickyReviewsData[i],
      create: {
        jobId: nickyCompletedJobs[i].id,
        reviewerId: nickyEmployer.id,
        reviewedId: ryanYouth.id,
        ...nickyReviewsData[i],
      },
    });
  }

  console.log('✅ Created completed jobs and reviews from nickymudie@hotmail.com');

  // Update Ryan's profile with new stats
  const allReviews = await prisma.review.findMany({
    where: { reviewedId: ryanYouth.id },
  });
  const newAvgRating = allReviews.reduce((sum, r) => sum + r.overall, 0) / allReviews.length;
  const totalCompletedJobs = await prisma.application.count({
    where: {
      youthId: ryanYouth.id,
      status: 'ACCEPTED',
      job: { status: 'COMPLETED' },
    },
  });

  await prisma.youthProfile.update({
    where: { userId: ryanYouth.id },
    data: {
      completedJobsCount: totalCompletedJobs,
      averageRating: newAvgRating,
    },
  });

  console.log('✅ Updated Ryan profile with new stats');

  // ============================================
  // CONVERSATION & MESSAGES between Nicky and Ryan
  // 20+ realistic messages about job coordination
  // ============================================
  console.log('💬 Seeding conversation between Nicky and Ryan...');

  // Normalize participant order (smaller ID first for consistency)
  const [convParticipant1Id, convParticipant2Id] = [nickyEmployer.id, ryanYouth.id].sort();

  // Check for existing conversation or create new one
  let nickyRyanConversation = await prisma.conversation.findFirst({
    where: {
      participant1Id: convParticipant1Id,
      participant2Id: convParticipant2Id,
    },
  });

  if (!nickyRyanConversation) {
    // Use the first completed job as context
    nickyRyanConversation = await prisma.conversation.create({
      data: {
        participant1Id: convParticipant1Id,
        participant2Id: convParticipant2Id,
        jobId: nickyCompletedJobs[0]?.id,
        status: 'ACTIVE',
        lastMessageAt: new Date(),
      },
    });
  }

  // 20 messages alternating between Nicky (employer) and Ryan (youth)
  const conversationMessages = [
    { sender: 'nicky', content: 'Hi Ryan! I saw your profile and you look perfect for my dog sitting job. Are you available this Saturday evening?', hoursAgo: 72 },
    { sender: 'ryan', content: 'Hi! Yes, I love dogs! What time would you need me and what kind of dogs do you have?', hoursAgo: 71 },
    { sender: 'nicky', content: 'Great! We have two golden retrievers - Max and Bella. They are very friendly. Would 6pm to 10pm work?', hoursAgo: 70 },
    { sender: 'ryan', content: 'That works perfectly for me. Should I come to your place or do you want to drop them off somewhere?', hoursAgo: 69 },
    { sender: 'nicky', content: 'Please come to our house. I will send you the address. They are used to being at home and have their toys and beds here.', hoursAgo: 68 },
    { sender: 'ryan', content: 'Sounds good! Do they need to be walked or just kept company?', hoursAgo: 67 },
    { sender: 'nicky', content: 'A short walk around 7pm would be great - just 15-20 minutes around the block. They know the route! Food and treats are in the kitchen.', hoursAgo: 66 },
    { sender: 'ryan', content: 'Perfect, I can definitely do that. Is there anything special I should know about them?', hoursAgo: 65 },
    { sender: 'nicky', content: 'Bella sometimes gets nervous during thunderstorms but the forecast looks clear. Max loves belly rubs! They are both very gentle.', hoursAgo: 64 },
    { sender: 'ryan', content: 'That is so helpful to know. I will make sure they feel comfortable and safe. Looking forward to meeting them!', hoursAgo: 63 },
    { sender: 'nicky', content: 'Wonderful! Here is the address: Parkveien 15, Oslo. The code to the building is 1234. See you Saturday at 6!', hoursAgo: 48 },
    { sender: 'ryan', content: 'Got it! I will be there 5 minutes early. Have a great evening out!', hoursAgo: 47 },
    { sender: 'ryan', content: 'Hi! Just arrived and the dogs are so sweet. We are playing in the living room now.', hoursAgo: 24 },
    { sender: 'nicky', content: 'Thank you for the update! So glad they like you. Feel free to give them treats - they are in the blue jar.', hoursAgo: 23 },
    { sender: 'ryan', content: 'Just got back from the walk! They were so well behaved. Max found a stick he really liked 😄', hoursAgo: 22 },
    { sender: 'nicky', content: 'Ha! That sounds like Max. He collects sticks. Thanks for the photos you sent - so cute!', hoursAgo: 21 },
    { sender: 'ryan', content: 'They are both sleeping now after all the playing. Everything is going great!', hoursAgo: 20 },
    { sender: 'nicky', content: 'Perfect! We are heading home now, should be there in about 30 minutes.', hoursAgo: 19 },
    { sender: 'ryan', content: 'Sounds good! I will make sure everything is tidied up. The dogs had their water refreshed too.', hoursAgo: 18 },
    { sender: 'nicky', content: 'Ryan, you were amazing! The dogs clearly loved you. I have sent the payment via Vipps. Would you be available for our birthday party next week too?', hoursAgo: 17 },
    { sender: 'ryan', content: 'Thank you so much! I had a great time with Max and Bella. Yes, I would love to help with the birthday party! What date and time?', hoursAgo: 16 },
    { sender: 'nicky', content: 'It is next Saturday from 2pm to 6pm. We are having about 10 kids aged 6-8. Would need help with games and serving food.', hoursAgo: 15 },
    { sender: 'ryan', content: 'That sounds fun! I am good with kids and have helped at birthday parties before. Count me in!', hoursAgo: 14 },
    { sender: 'nicky', content: 'Fantastic! I will create the job listing so you can formally accept. Looking forward to working with you again!', hoursAgo: 13 },
  ];

  // Check existing message count to avoid duplicates
  const existingMessageCount = await prisma.message.count({
    where: { conversationId: nickyRyanConversation.id },
  });

  if (existingMessageCount < 20) {
    // Clear existing messages if partial, then seed fresh
    if (existingMessageCount > 0) {
      await prisma.message.deleteMany({
        where: { conversationId: nickyRyanConversation.id },
      });
    }

    for (const msg of conversationMessages) {
      const senderId = msg.sender === 'nicky' ? nickyEmployer.id : ryanYouth.id;
      const messageDate = new Date();
      messageDate.setHours(messageDate.getHours() - msg.hoursAgo);

      await prisma.message.create({
        data: {
          conversationId: nickyRyanConversation.id,
          senderId,
          content: msg.content,
          read: true,
          createdAt: messageDate,
        },
      });
    }

    // Update conversation's last message time
    const lastMsg = conversationMessages[conversationMessages.length - 1];
    const lastMessageDate = new Date();
    lastMessageDate.setHours(lastMessageDate.getHours() - lastMsg.hoursAgo);

    await prisma.conversation.update({
      where: { id: nickyRyanConversation.id },
      data: { lastMessageAt: lastMessageDate },
    });

    console.log(`✅ Created ${conversationMessages.length} messages between Nicky and Ryan`);
  } else {
    console.log('⏭️  Skipping message seeding: conversation already has messages');
  }

  // ============================================
  // GROWTH DATA - JobCompletions, StructuredFeedback, TrustSignals, UserSkillSignals
  // This enables the "My Growth" page to display sample data
  // ============================================
  console.log('📈 Seeding growth tracking data for Ryan...');

  // Get all of Ryan's completed jobs (both from original employers and Nicky)
  const allRyanCompletedJobs = [...completedJobs, ...nickyCompletedJobs];

  // Create JobCompletion records for each completed job
  const jobCompletionData = [
    // Original 5 completed jobs
    {
      jobIndex: 0,
      employerIndex: 0,
      supervision: SupervisionLevel.SUPERVISED,
      hoursWorked: 4,
      skillsDemonstrated: ['babysitting', 'child-activities', 'patience', 'communication', 'reliability'],
      ratings: { punctuality: 5, communication: 5, quality: 5, respectfulness: 5, followedInstructions: 5 },
      responsibilityLevel: ResponsibilityLevel.INTERMEDIATE,
      wouldRehire: true,
      daysAgo: 14,
    },
    {
      jobIndex: 1,
      employerIndex: 1,
      supervision: SupervisionLevel.UNSUPERVISED,
      hoursWorked: 1,
      skillsDemonstrated: ['dog-walking', 'pet-sitting', 'punctuality', 'reliability'],
      ratings: { punctuality: 5, communication: 4, quality: 5, respectfulness: 5, followedInstructions: 5 },
      responsibilityLevel: ResponsibilityLevel.BASIC,
      wouldRehire: true,
      daysAgo: 10,
    },
    {
      jobIndex: 2,
      employerIndex: 2,
      supervision: SupervisionLevel.UNSUPERVISED,
      hoursWorked: 3,
      skillsDemonstrated: ['gardening', 'physical-stamina', 'reliability', 'following-instructions'],
      ratings: { punctuality: 4, communication: 5, quality: 4, respectfulness: 5, followedInstructions: 5 },
      responsibilityLevel: ResponsibilityLevel.INTERMEDIATE,
      wouldRehire: true,
      daysAgo: 7,
    },
    {
      jobIndex: 3,
      employerIndex: 3,
      supervision: SupervisionLevel.SUPERVISED,
      hoursWorked: 2,
      skillsDemonstrated: ['tech-help-basic', 'computer-help', 'patience', 'communication', 'customer-service'],
      ratings: { punctuality: 5, communication: 5, quality: 5, respectfulness: 5, followedInstructions: 5 },
      responsibilityLevel: ResponsibilityLevel.ADVANCED,
      wouldRehire: true,
      daysAgo: 5,
    },
    {
      jobIndex: 4,
      employerIndex: 4,
      supervision: SupervisionLevel.UNSUPERVISED,
      hoursWorked: 4,
      skillsDemonstrated: ['house-cleaning', 'organizing', 'attention-to-detail', 'time-management'],
      ratings: { punctuality: 5, communication: 4, quality: 5, respectfulness: 5, followedInstructions: 5 },
      responsibilityLevel: ResponsibilityLevel.INTERMEDIATE,
      wouldRehire: true,
      daysAgo: 3,
    },
    // Nicky's completed jobs (indices 5, 6)
    {
      jobIndex: 5,
      employerId: nickyEmployer.id,
      supervision: SupervisionLevel.UNSUPERVISED,
      hoursWorked: 5,
      skillsDemonstrated: ['dog-walking', 'pet-sitting', 'communication', 'reliability', 'initiative'],
      ratings: { punctuality: 5, communication: 5, quality: 5, respectfulness: 5, followedInstructions: 5 },
      responsibilityLevel: ResponsibilityLevel.ADVANCED,
      wouldRehire: true,
      daysAgo: 2,
    },
    {
      jobIndex: 6,
      employerId: nickyEmployer.id,
      supervision: SupervisionLevel.SUPERVISED,
      hoursWorked: 4,
      skillsDemonstrated: ['babysitting', 'child-activities', 'event-help', 'teamwork', 'adaptability'],
      ratings: { punctuality: 5, communication: 5, quality: 5, respectfulness: 5, followedInstructions: 5 },
      responsibilityLevel: ResponsibilityLevel.ADVANCED,
      wouldRehire: true,
      daysAgo: 1,
    },
  ];

  // Create JobCompletions and StructuredFeedback
  const createdCompletions = [];
  for (let i = 0; i < jobCompletionData.length; i++) {
    const data = jobCompletionData[i];
    const job = allRyanCompletedJobs[data.jobIndex];
    const employerId = data.employerId || employers[data.employerIndex!].id;

    const completedAt = new Date();
    completedAt.setDate(completedAt.getDate() - data.daysAgo);

    // Create JobCompletion
    const completion = await prisma.jobCompletion.upsert({
      where: { jobId_youthId: { jobId: job.id, youthId: ryanYouth.id } },
      update: {
        outcome: JobCompletionOutcome.COMPLETED,
        supervision: data.supervision,
        hoursWorked: data.hoursWorked,
        completedAt,
      },
      create: {
        jobId: job.id,
        youthId: ryanYouth.id,
        employerId: employerId,
        outcome: JobCompletionOutcome.COMPLETED,
        supervision: data.supervision,
        hoursWorked: data.hoursWorked,
        completedAt,
      },
    });
    createdCompletions.push(completion);

    // Create StructuredFeedback for this completion
    await prisma.structuredFeedback.upsert({
      where: { jobCompletionId: completion.id },
      update: {
        punctuality: data.ratings.punctuality,
        communication: data.ratings.communication,
        quality: data.ratings.quality,
        respectfulness: data.ratings.respectfulness,
        followedInstructions: data.ratings.followedInstructions,
        wouldRehire: data.wouldRehire,
        responsibilityLevel: data.responsibilityLevel,
        skillsDemonstrated: data.skillsDemonstrated,
      },
      create: {
        jobCompletionId: completion.id,
        punctuality: data.ratings.punctuality,
        communication: data.ratings.communication,
        quality: data.ratings.quality,
        respectfulness: data.ratings.respectfulness,
        followedInstructions: data.ratings.followedInstructions,
        wouldRehire: data.wouldRehire,
        responsibilityLevel: data.responsibilityLevel,
        skillsDemonstrated: data.skillsDemonstrated,
      },
    });
  }
  console.log(`✅ Created ${createdCompletions.length} job completions with structured feedback`);

  // Create TrustSignals for Ryan based on his performance
  const trustSignalsData = [
    // ON_TIME signals (from good punctuality ratings)
    { type: TrustSignalType.ON_TIME, sourceType: TrustSignalSource.FEEDBACK, weight: 1, daysAgo: 14 },
    { type: TrustSignalType.ON_TIME, sourceType: TrustSignalSource.FEEDBACK, weight: 1, daysAgo: 10 },
    { type: TrustSignalType.ON_TIME, sourceType: TrustSignalSource.FEEDBACK, weight: 1, daysAgo: 5 },
    { type: TrustSignalType.ON_TIME, sourceType: TrustSignalSource.FEEDBACK, weight: 1, daysAgo: 3 },
    { type: TrustSignalType.ON_TIME, sourceType: TrustSignalSource.FEEDBACK, weight: 1, daysAgo: 2 },
    { type: TrustSignalType.ON_TIME, sourceType: TrustSignalSource.FEEDBACK, weight: 1, daysAgo: 1 },

    // GOOD_COMMS signals (from good communication ratings)
    { type: TrustSignalType.GOOD_COMMS, sourceType: TrustSignalSource.FEEDBACK, weight: 1, daysAgo: 14 },
    { type: TrustSignalType.GOOD_COMMS, sourceType: TrustSignalSource.FEEDBACK, weight: 1, daysAgo: 7 },
    { type: TrustSignalType.GOOD_COMMS, sourceType: TrustSignalSource.FEEDBACK, weight: 1, daysAgo: 5 },
    { type: TrustSignalType.GOOD_COMMS, sourceType: TrustSignalSource.FEEDBACK, weight: 1, daysAgo: 2 },
    { type: TrustSignalType.GOOD_COMMS, sourceType: TrustSignalSource.FEEDBACK, weight: 1, daysAgo: 1 },

    // REPEAT_HIRE signal (hired by Nicky twice)
    { type: TrustSignalType.REPEAT_HIRE, sourceType: TrustSignalSource.JOB_COMPLETION, weight: 2, daysAgo: 1, sourceId: nickyEmployer.id },

    // CONSISTENCY_STREAK (7 jobs completed successfully in a row)
    { type: TrustSignalType.CONSISTENCY_STREAK, sourceType: TrustSignalSource.SYSTEM, weight: 3, daysAgo: 1 },

    // POSITIVE_TREND (improving scores over time - last 3 feedback all high)
    { type: TrustSignalType.POSITIVE_TREND, sourceType: TrustSignalSource.SYSTEM, weight: 2, daysAgo: 1 },
  ];

  // Delete existing trust signals for Ryan to avoid duplicates
  await prisma.trustSignal.deleteMany({ where: { userId: ryanYouth.id } });

  for (const signal of trustSignalsData) {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - signal.daysAgo);

    await prisma.trustSignal.create({
      data: {
        userId: ryanYouth.id,
        type: signal.type,
        sourceType: signal.sourceType,
        sourceId: signal.sourceId || null,
        weight: signal.weight,
        createdAt,
      },
    });
  }
  console.log(`✅ Created ${trustSignalsData.length} trust signals for Ryan`);

  // Create UserSkillSignals (aggregate skills demonstrated across all jobs)
  // First, get all skill IDs from the database
  const allSkills = await prisma.skill.findMany();
  const skillMap = new Map(allSkills.map(s => [s.slug, s.id]));

  // Aggregate all skills demonstrated across jobs
  const skillStrengths = new Map<string, { count: number; lastDaysAgo: number }>();
  for (const data of jobCompletionData) {
    for (const skillSlug of data.skillsDemonstrated) {
      const existing = skillStrengths.get(skillSlug) || { count: 0, lastDaysAgo: 999 };
      skillStrengths.set(skillSlug, {
        count: existing.count + 1,
        lastDaysAgo: Math.min(existing.lastDaysAgo, data.daysAgo),
      });
    }
  }

  // Delete existing skill signals for Ryan to avoid duplicates
  await prisma.userSkillSignal.deleteMany({ where: { userId: ryanYouth.id } });

  // Create skill signals
  let skillSignalCount = 0;
  for (const [slug, data] of skillStrengths) {
    const skillId = skillMap.get(slug);
    if (!skillId) {
      console.log(`⚠️ Skill not found: ${slug}`);
      continue;
    }

    // Calculate strength (0-100) based on count (more times = stronger signal)
    const strength = Math.min(100, data.count * 25 + 25);

    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - data.lastDaysAgo);

    await prisma.userSkillSignal.create({
      data: {
        userId: ryanYouth.id,
        skillId: skillId,
        source: 'feedback',
        strength: strength,
        evidence: `Demonstrated ${data.count} time(s) in completed jobs`,
        createdAt,
      },
    });
    skillSignalCount++;
  }
  console.log(`✅ Created ${skillSignalCount} skill signals for Ryan`);

  console.log('✅ Growth tracking data seeded successfully!');
  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
