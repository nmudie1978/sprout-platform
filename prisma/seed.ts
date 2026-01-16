import { PrismaClient, JobCategory, PayType } from '@prisma/client';

// Use direct connection for seeding (not pooled connection)
process.env.DATABASE_URL = process.env.DIRECT_URL || process.env.DATABASE_URL;

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

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
  ];

  for (const card of careerCards) {
    await prisma.careerCard.upsert({
      where: { roleName: card.roleName },
      update: card,
      create: card,
    });
  }

  console.log('✅ Created career cards');

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

  // Seed 20 demo micro-jobs
  const demoJobs = [
    {
      title: 'Dog Walking - Friendly Golden Retriever',
      category: JobCategory.DOG_WALKING,
      description: 'Need someone to walk our 3-year-old Golden Retriever, Max, for 30 minutes. He is very friendly and well-behaved. Park nearby.',
      payType: PayType.FIXED,
      payAmount: 150,
      location: 'Oslo, Majorstuen',
      status: 'POSTED' as const,
      requiredTraits: ['reliable', 'loves animals'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Babysitting - Two Kids (Ages 4 and 7)',
      category: JobCategory.BABYSITTING,
      description: 'Looking for a responsible babysitter for Friday evening (6pm-10pm). Two well-behaved children. Experience required.',
      payType: PayType.HOURLY,
      payAmount: 180,
      location: 'Oslo, Frogner',
      status: 'POSTED' as const,
      requiredTraits: ['patient', 'responsible', 'energetic'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Snow Clearing - Driveway and Walkway',
      category: JobCategory.SNOW_CLEARING,
      description: 'Need help clearing snow from driveway and front walkway. Shovel provided. Should take 1-2 hours.',
      payType: PayType.FIXED,
      payAmount: 300,
      location: 'Oslo, Holmenkollen',
      status: 'POSTED' as const,
      requiredTraits: ['physically fit', 'reliable'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Tech Help - Computer Setup and WiFi',
      category: JobCategory.TECH_HELP,
      description: 'Need help setting up a new laptop and connecting it to WiFi. Also install some basic software. 1-2 hours.',
      payType: PayType.HOURLY,
      payAmount: 200,
      location: 'Lørenskog, Sentrum',
      status: 'POSTED' as const,
      requiredTraits: ['tech-savvy', 'patient'],
      postedById: demoEmployer.id,
    },
    {
      title: 'House Cleaning - Deep Clean',
      category: JobCategory.CLEANING,
      description: 'Looking for help with a deep clean of our 2-bedroom apartment. Kitchen, bathrooms, and living areas. Supplies provided.',
      payType: PayType.FIXED,
      payAmount: 500,
      location: 'Fjellhamar',
      status: 'POSTED' as const,
      requiredTraits: ['detail-oriented', 'thorough'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Garden Help - Weeding and Planting',
      category: JobCategory.DIY_HELP,
      description: 'Need help weeding garden beds and planting some new flowers. About 3 hours of work. Gloves and tools provided.',
      payType: PayType.HOURLY,
      payAmount: 160,
      location: 'Oslo, Skøyen',
      status: 'POSTED' as const,
      requiredTraits: ['outdoor work', 'reliable'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Dog Walking - Two Small Dogs',
      category: JobCategory.DOG_WALKING,
      description: 'Walk two friendly Chihuahuas for 20 minutes. They are small and easy to handle. Weekday mornings preferred.',
      payType: PayType.FIXED,
      payAmount: 120,
      location: 'Oslo, Grünerløkka',
      status: 'POSTED' as const,
      requiredTraits: ['loves animals', 'punctual'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Grocery Shopping and Delivery',
      category: JobCategory.ERRANDS,
      description: 'Need someone to pick up groceries from local store and deliver to my apartment. Shopping list provided. About 1 hour total.',
      payType: PayType.FIXED,
      payAmount: 200,
      location: 'Oslo, Tøyen',
      status: 'POSTED' as const,
      requiredTraits: ['reliable', 'organized'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Babysitting - Infant (6 months)',
      category: JobCategory.BABYSITTING,
      description: 'Experienced babysitter needed for our 6-month-old baby. References required. Saturday afternoon, 2-5pm.',
      payType: PayType.HOURLY,
      payAmount: 200,
      location: 'Lørenskog, Skårer',
      status: 'POSTED' as const,
      requiredTraits: ['experienced', 'caring', 'responsible'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Car Washing - Inside and Out',
      category: JobCategory.CLEANING,
      description: 'Looking for help washing and detailing my car. Vacuum inside, wash exterior, clean windows. Supplies provided.',
      payType: PayType.FIXED,
      payAmount: 250,
      location: 'Oslo, Nordstrand',
      status: 'POSTED' as const,
      requiredTraits: ['detail-oriented', 'thorough'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Furniture Assembly - IKEA Bookshelf',
      category: JobCategory.DIY_HELP,
      description: 'Need help assembling an IKEA bookshelf. All parts and tools included. Should take about 1 hour.',
      payType: PayType.FIXED,
      payAmount: 180,
      location: 'Oslo, Majorstuen',
      status: 'POSTED' as const,
      requiredTraits: ['handy', 'patient'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Tech Help - Smartphone Training for Elderly',
      category: JobCategory.TECH_HELP,
      description: 'Help my elderly mother learn to use her new smartphone. Need patient person to teach basics like calls, messages, photos.',
      payType: PayType.HOURLY,
      payAmount: 220,
      location: 'Oslo, Aker Brygge',
      status: 'POSTED' as const,
      requiredTraits: ['patient', 'friendly', 'tech-savvy'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Window Cleaning - Ground Floor',
      category: JobCategory.CLEANING,
      description: 'Clean windows on ground floor of house (8 windows). Equipment provided. About 2 hours work.',
      payType: PayType.FIXED,
      payAmount: 280,
      location: 'Fjellhamar, Rælingen',
      status: 'POSTED' as const,
      requiredTraits: ['thorough', 'reliable'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Pet Sitting - Cat for Weekend',
      category: JobCategory.OTHER,
      description: 'Need someone to check on and feed my cat twice daily while I am away this weekend. Very friendly cat!',
      payType: PayType.FIXED,
      payAmount: 400,
      location: 'Oslo, St. Hanshaugen',
      status: 'POSTED' as const,
      requiredTraits: ['loves animals', 'responsible'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Moving Help - Small Items',
      category: JobCategory.DIY_HELP,
      description: 'Need help moving boxes and small furniture items to new apartment (same building, different floor). About 2-3 hours.',
      payType: PayType.HOURLY,
      payAmount: 180,
      location: 'Lørenskog, Kurland',
      status: 'POSTED' as const,
      requiredTraits: ['physically fit', 'reliable'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Leaf Raking - Front and Back Yard',
      category: JobCategory.DIY_HELP,
      description: 'Help rake leaves in front and back yard. Bags and rake provided. Approximately 2 hours of work.',
      payType: PayType.FIXED,
      payAmount: 300,
      location: 'Oslo, Oppegård',
      status: 'POSTED' as const,
      requiredTraits: ['outdoor work', 'energetic'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Babysitting - After School Care',
      category: JobCategory.BABYSITTING,
      description: 'Pick up 8-year-old from school at 3pm and supervise until 5:30pm. Mon-Thu. Help with homework.',
      payType: PayType.HOURLY,
      payAmount: 170,
      location: 'Oslo, Romsås',
      status: 'POSTED' as const,
      requiredTraits: ['reliable', 'patient', 'homework help'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Package Pickup and Delivery',
      category: JobCategory.ERRANDS,
      description: 'Pick up package from post office and deliver to my office. Simple errand, about 30 minutes total.',
      payType: PayType.FIXED,
      payAmount: 150,
      location: 'Oslo, Storo',
      status: 'POSTED' as const,
      requiredTraits: ['reliable', 'punctual'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Garage Organization - Sort and Clean',
      category: JobCategory.CLEANING,
      description: 'Help organize and clean out garage. Sorting, sweeping, arranging items. About 3-4 hours.',
      payType: PayType.HOURLY,
      payAmount: 170,
      location: 'Lørenskog, Solheim',
      status: 'POSTED' as const,
      requiredTraits: ['organized', 'physically fit'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Painting Help - Small Bedroom',
      category: JobCategory.DIY_HELP,
      description: 'Need help painting one small bedroom. All supplies provided. Previous painting experience preferred but not required.',
      payType: PayType.FIXED,
      payAmount: 600,
      location: 'Oslo, Sagene',
      status: 'POSTED' as const,
      requiredTraits: ['careful', 'detail-oriented'],
      postedById: demoEmployer.id,
    },
    // Additional 20 jobs focused on babysitting, cleaning, cooking, gardening
    {
      title: 'Babysitting - Toddler (2 years)',
      category: JobCategory.BABYSITTING,
      description: 'Looking for a patient babysitter for our energetic 2-year-old. Saturday morning 9am-1pm. Experience with toddlers preferred.',
      payType: PayType.HOURLY,
      payAmount: 175,
      location: 'Oslo, Ullern',
      status: 'POSTED' as const,
      requiredTraits: ['patient', 'energetic', 'good with kids'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Deep Kitchen Cleaning',
      category: JobCategory.CLEANING,
      description: 'Need thorough cleaning of kitchen including oven, fridge interior, cabinets, and floors. All cleaning supplies provided.',
      payType: PayType.FIXED,
      payAmount: 450,
      location: 'Lørenskog, Sentrum',
      status: 'POSTED' as const,
      requiredTraits: ['detail-oriented', 'thorough'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Meal Prep Assistant - Weekly Cooking',
      category: JobCategory.OTHER,
      description: 'Help prepare meals for the week. Chopping vegetables, cooking basics, and packaging. Sunday afternoons, 3-4 hours.',
      payType: PayType.HOURLY,
      payAmount: 180,
      location: 'Oslo, Frogner',
      status: 'POSTED' as const,
      requiredTraits: ['cooking skills', 'organized', 'reliable'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Garden Maintenance - Lawn and Hedges',
      category: JobCategory.DIY_HELP,
      description: 'Regular garden maintenance needed: mow lawn, trim hedges, and general tidying. Equipment provided. About 2-3 hours.',
      payType: PayType.HOURLY,
      payAmount: 165,
      location: 'Fjellhamar',
      status: 'POSTED' as const,
      requiredTraits: ['outdoor work', 'reliable', 'physically fit'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Babysitting - Three Siblings (5, 8, 11)',
      category: JobCategory.BABYSITTING,
      description: 'Need reliable sitter for three well-behaved kids. Help with homework and prepare simple dinner. Weekday evenings 4pm-7pm.',
      payType: PayType.HOURLY,
      payAmount: 200,
      location: 'Oslo, Vinderen',
      status: 'POSTED' as const,
      requiredTraits: ['responsible', 'patient', 'homework help'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Bathroom Deep Clean - Two Bathrooms',
      category: JobCategory.CLEANING,
      description: 'Thorough cleaning of two bathrooms. Scrubbing tiles, cleaning fixtures, mirrors, and floors. Supplies provided.',
      payType: PayType.FIXED,
      payAmount: 350,
      location: 'Lørenskog, Skårer',
      status: 'POSTED' as const,
      requiredTraits: ['thorough', 'detail-oriented'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Cooking Help - Dinner Party Prep',
      category: JobCategory.OTHER,
      description: 'Assist with preparing food for a dinner party. Need help with chopping, basic cooking, and kitchen cleanup. Friday 2pm-6pm.',
      payType: PayType.HOURLY,
      payAmount: 190,
      location: 'Oslo, Majorstuen',
      status: 'POSTED' as const,
      requiredTraits: ['cooking skills', 'organized', 'calm under pressure'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Garden Planting - Flower Beds',
      category: JobCategory.DIY_HELP,
      description: 'Help plant seasonal flowers in garden beds. Soil preparation, planting, and mulching. Gloves and tools provided.',
      payType: PayType.FIXED,
      payAmount: 400,
      location: 'Fjellhamar, Rælingen',
      status: 'POSTED' as const,
      requiredTraits: ['outdoor work', 'careful', 'reliable'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Babysitting - Newborn Twins',
      category: JobCategory.BABYSITTING,
      description: 'Experienced sitter needed for 4-month-old twins. Help with feeding, changing, and soothing. Must have infant experience.',
      payType: PayType.HOURLY,
      payAmount: 220,
      location: 'Oslo, Holmenkollen',
      status: 'POSTED' as const,
      requiredTraits: ['experienced', 'calm', 'responsible', 'caring'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Spring Cleaning - Entire Apartment',
      category: JobCategory.CLEANING,
      description: 'Full spring cleaning of 3-bedroom apartment. Windows, floors, dusting, and organizing. Full day job, supplies provided.',
      payType: PayType.FIXED,
      payAmount: 800,
      location: 'Oslo, Grünerløkka',
      status: 'POSTED' as const,
      requiredTraits: ['thorough', 'organized', 'energetic'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Baking Assistant - Birthday Cakes',
      category: JobCategory.OTHER,
      description: 'Help bake and decorate birthday cakes for a small home bakery. Some baking experience helpful but not required.',
      payType: PayType.HOURLY,
      payAmount: 170,
      location: 'Lørenskog, Kurland',
      status: 'POSTED' as const,
      requiredTraits: ['creative', 'patient', 'detail-oriented'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Vegetable Garden Help - Weeding & Harvesting',
      category: JobCategory.DIY_HELP,
      description: 'Help maintain vegetable garden. Weeding between rows, harvesting ripe vegetables, and light watering. 2-3 hours weekly.',
      payType: PayType.HOURLY,
      payAmount: 160,
      location: 'Oslo, Nordstrand',
      status: 'POSTED' as const,
      requiredTraits: ['outdoor work', 'careful', 'reliable'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Babysitting - Special Needs Child',
      category: JobCategory.BABYSITTING,
      description: 'Caring sitter needed for 9-year-old with autism. Experience with special needs children required. Weekend afternoons.',
      payType: PayType.HOURLY,
      payAmount: 230,
      location: 'Oslo, Lambertseter',
      status: 'POSTED' as const,
      requiredTraits: ['patient', 'experienced', 'calm', 'caring'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Post-Party Cleanup',
      category: JobCategory.CLEANING,
      description: 'Need help cleaning up after birthday party. Dishes, vacuuming, taking out trash, and general tidying. Sunday morning.',
      payType: PayType.FIXED,
      payAmount: 300,
      location: 'Lørenskog, Solheim',
      status: 'POSTED' as const,
      requiredTraits: ['efficient', 'thorough'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Cooking Lessons Assistant',
      category: JobCategory.OTHER,
      description: 'Help teach basic cooking to kids aged 8-12. Assist with prep, supervision, and cleanup during cooking class.',
      payType: PayType.HOURLY,
      payAmount: 185,
      location: 'Oslo, Tøyen',
      status: 'POSTED' as const,
      requiredTraits: ['cooking skills', 'good with kids', 'patient'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Garden Renovation - Clearing & Prep',
      category: JobCategory.DIY_HELP,
      description: 'Help clear overgrown garden area. Removing weeds, old plants, and preparing soil for new planting. Hard work but rewarding!',
      payType: PayType.HOURLY,
      payAmount: 175,
      location: 'Fjellhamar',
      status: 'POSTED' as const,
      requiredTraits: ['physically fit', 'hardworking', 'outdoor work'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Babysitting - Movie Night',
      category: JobCategory.BABYSITTING,
      description: 'Fun babysitter needed for two kids (6 and 9) during parents date night. Make popcorn, watch movies, bedtime at 9pm.',
      payType: PayType.FIXED,
      payAmount: 400,
      location: 'Oslo, St. Hanshaugen',
      status: 'POSTED' as const,
      requiredTraits: ['fun', 'responsible', 'good with kids'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Office Cleaning - Small Business',
      category: JobCategory.CLEANING,
      description: 'Weekly cleaning of small office space. Vacuuming, dusting desks, cleaning kitchen area, and emptying bins. After hours.',
      payType: PayType.HOURLY,
      payAmount: 180,
      location: 'Oslo, Aker Brygge',
      status: 'POSTED' as const,
      requiredTraits: ['reliable', 'thorough', 'trustworthy'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Healthy Meal Prep - Senior Citizen',
      category: JobCategory.OTHER,
      description: 'Prepare healthy, easy-to-eat meals for elderly person. Cook 5 meals to be refrigerated for the week. Must follow dietary guidelines.',
      payType: PayType.FIXED,
      payAmount: 500,
      location: 'Lørenskog, Sentrum',
      status: 'POSTED' as const,
      requiredTraits: ['cooking skills', 'caring', 'reliable'],
      postedById: demoEmployer.id,
    },
    {
      title: 'Lawn Care - Mowing & Edging',
      category: JobCategory.DIY_HELP,
      description: 'Regular lawn mowing and edging needed. Large garden with front and back lawns. Mower provided. Every 2 weeks.',
      payType: PayType.FIXED,
      payAmount: 350,
      location: 'Oslo, Oppegård',
      status: 'POSTED' as const,
      requiredTraits: ['reliable', 'outdoor work', 'punctual'],
      postedById: demoEmployer.id,
    },
  ];

  for (const job of demoJobs) {
    await prisma.microJob.create({
      data: job,
    });
  }

  console.log('✅ Created 40 demo jobs');

  // Create demo youth worker with reviews
  const ryanYouth = await prisma.user.upsert({
    where: { email: 'ryanmudie1982@gmail.com' },
    update: {},
    create: {
      email: 'ryanmudie1982@gmail.com',
      role: 'YOUTH',
      youthProfile: {
        create: {
          displayName: 'Ryan Mudie',
          completedJobsCount: 0,
          averageRating: null,
        },
      },
    },
  });

  console.log('✅ Created/found Ryan youth worker');

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

  // Create completed jobs for reviews
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
      dateTime: new Date('2025-01-05T18:00:00'),
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
      dateTime: new Date('2025-01-08T08:00:00'),
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
      dateTime: new Date('2025-01-10T10:00:00'),
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
      dateTime: new Date('2025-01-12T14:00:00'),
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
      dateTime: new Date('2025-01-14T09:00:00'),
    },
  ];

  const completedJobs = [];
  for (let i = 0; i < completedJobsData.length; i++) {
    const job = await prisma.microJob.create({
      data: {
        ...completedJobsData[i],
        postedById: employers[i].id,
      },
    });
    completedJobs.push(job);
  }

  console.log('✅ Created completed jobs for reviews');

  // Create accepted applications linking Ryan to jobs
  for (const job of completedJobs) {
    await prisma.application.create({
      data: {
        jobId: job.id,
        youthId: ryanYouth.id,
        message: 'I would love to help with this job!',
        status: 'ACCEPTED',
      },
    });
  }

  console.log('✅ Created accepted applications');

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
    await prisma.review.create({
      data: {
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
