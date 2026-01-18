import { PrismaClient } from '@prisma/client';

// Use direct connection (not pooled) for scripts
process.env.DATABASE_URL = process.env.DIRECT_URL || process.env.DATABASE_URL;

const prisma = new PrismaClient();

async function seedTestMessages() {
  console.log('Seeding test messages...\n');

  // Find the two users
  const nicky = await prisma.user.findUnique({
    where: { email: 'nickymudie@hotmail.com' },
    include: { youthProfile: true, employerProfile: true },
  });

  const ryan = await prisma.user.findUnique({
    where: { email: 'ryanmudie1982@gmail.com' },
    include: { youthProfile: true, employerProfile: true },
  });

  if (!nicky || !ryan) {
    console.error('Users not found:');
    console.error('  nickymudie@hotmail.com:', nicky ? 'Found' : 'NOT FOUND');
    console.error('  ryanmudie1982@gmail.com:', ryan ? 'Found' : 'NOT FOUND');
    process.exit(1);
  }

  console.log('Found users:');
  console.log(`  - ${nicky.email} (${nicky.role})`);
  console.log(`  - ${ryan.email} (${ryan.role})`);

  // Determine who is employer and who is youth
  const employer = nicky.role === 'EMPLOYER' ? nicky : ryan;
  const youth = nicky.role === 'YOUTH' ? nicky : ryan;

  if (employer.role !== 'EMPLOYER' || youth.role !== 'YOUTH') {
    console.error('Need one EMPLOYER and one YOUTH user for messaging');
    console.log(`  ${nicky.email}: ${nicky.role}`);
    console.log(`  ${ryan.email}: ${ryan.role}`);
    process.exit(1);
  }

  console.log(`\nEmployer: ${employer.email}`);
  console.log(`Youth: ${youth.email}`);

  // Find a job posted by the employer (or any job if needed)
  let job = await prisma.microJob.findFirst({
    where: { postedById: employer.id },
    orderBy: { createdAt: 'desc' },
  });

  if (!job) {
    // Try to find any active job
    job = await prisma.microJob.findFirst({
      where: { status: { in: ['POSTED', 'ASSIGNED', 'IN_PROGRESS'] } },
      orderBy: { createdAt: 'desc' },
    });
  }

  if (!job) {
    console.error('No jobs found to tie conversation to');
    process.exit(1);
  }

  console.log(`\nUsing job: "${job.title}" (${job.id})`);

  // Normalize participant IDs (smaller ID = participant1)
  const [participant1Id, participant2Id] = [employer.id, youth.id].sort();

  // Check for existing conversation or create new one
  let conversation = await prisma.conversation.findFirst({
    where: {
      participant1Id,
      participant2Id,
      jobId: job.id,
    },
  });

  if (conversation) {
    console.log(`\nFound existing conversation: ${conversation.id}`);
    // Delete existing messages to start fresh
    const deleted = await prisma.message.deleteMany({
      where: { conversationId: conversation.id },
    });
    console.log(`Deleted ${deleted.count} existing messages`);
  } else {
    conversation = await prisma.conversation.create({
      data: {
        participant1Id,
        participant2Id,
        jobId: job.id,
        status: 'ACTIVE',
        lastMessageAt: new Date(),
      },
    });
    console.log(`\nCreated new conversation: ${conversation.id}`);
  }

  // Fetch message templates
  const templates = await prisma.messageTemplate.findMany({
    where: { isActive: true },
  });

  const templateMap = new Map(templates.map(t => [t.key, t]));

  console.log(`\nFound ${templates.length} active message templates`);

  // Define 10 test messages as a realistic conversation flow
  const testMessages = [
    {
      senderId: employer.id,
      templateKey: 'ASK_AVAILABILITY',
      payload: { dates: 'Saturday 25th January', timeSlot: 'morning (9am-12pm)' },
      renderedText: 'Hi! Are you available on Saturday 25th January in the morning (9am-12pm)?',
      createdAt: new Date(Date.now() - 9 * 60 * 60 * 1000), // 9 hours ago
    },
    {
      senderId: youth.id,
      templateKey: 'CONFIRM_AVAILABILITY',
      payload: { response: 'Yes, I can make it', note: 'I finish school at 3pm on weekdays but Saturday mornings work great' },
      renderedText: 'Yes, I can make it! I finish school at 3pm on weekdays but Saturday mornings work great.',
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    },
    {
      senderId: employer.id,
      templateKey: 'CONFIRM_LOCATION',
      payload: { address: '42 Oak Street', additionalInfo: 'Ring the doorbell at the side gate' },
      renderedText: 'Great! The job is at 42 Oak Street. Ring the doorbell at the side gate.',
      createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000), // 7 hours ago
    },
    {
      senderId: youth.id,
      templateKey: 'ASK_JOB_DETAILS',
      payload: { question: 'Should I bring any equipment or will everything be provided?' },
      renderedText: 'Should I bring any equipment or will everything be provided?',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    },
    {
      senderId: employer.id,
      templateKey: 'PROVIDE_JOB_DETAILS',
      payload: { details: 'Everything will be provided - gloves, bags, and tools. Just wear clothes you don\'t mind getting dirty!' },
      renderedText: 'Everything will be provided - gloves, bags, and tools. Just wear clothes you don\'t mind getting dirty!',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    },
    {
      senderId: youth.id,
      templateKey: 'ASK_PAYMENT',
      payload: { question: 'Will I be paid in cash or bank transfer?' },
      renderedText: 'Will I be paid in cash or bank transfer?',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    },
    {
      senderId: employer.id,
      templateKey: 'CONFIRM_PAYMENT',
      payload: { method: 'Cash', amount: '£40', timing: 'at the end of the job' },
      renderedText: 'I\'ll pay you £40 in cash at the end of the job.',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    },
    {
      senderId: youth.id,
      templateKey: 'CONFIRM_AVAILABILITY',
      payload: { response: 'Perfect, that works for me', note: 'See you Saturday!' },
      renderedText: 'Perfect, that works for me. See you Saturday!',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      senderId: employer.id,
      templateKey: 'SAFETY_REMINDER',
      payload: { message: 'Just a reminder - my wife will also be home if you need anything. Looking forward to it!' },
      renderedText: 'Just a reminder - my wife will also be home if you need anything. Looking forward to it!',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    },
    {
      senderId: youth.id,
      templateKey: 'CONFIRM_HOURS',
      payload: { hours: '3 hours', startTime: '9am', endTime: '12pm' },
      renderedText: 'Confirmed! I\'ll be there for 3 hours from 9am to 12pm.',
      createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
    },
  ];

  // Create the messages
  console.log('\nCreating messages...');
  for (let i = 0; i < testMessages.length; i++) {
    const msg = testMessages[i];
    const template = templateMap.get(msg.templateKey);

    if (!template) {
      console.warn(`  Warning: Template "${msg.templateKey}" not found, using fallback`);
    }

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: msg.senderId,
        templateId: template?.id || null,
        payload: msg.payload,
        renderedText: msg.renderedText,
        read: i < testMessages.length - 2, // Last 2 messages are unread
        createdAt: msg.createdAt,
      },
    });

    const senderName = msg.senderId === employer.id ? 'Employer' : 'Youth';
    console.log(`  ${i + 1}. [${senderName}] ${msg.renderedText.substring(0, 50)}...`);
  }

  // Update conversation's lastMessageAt
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { lastMessageAt: testMessages[testMessages.length - 1].createdAt },
  });

  console.log('\n✓ Successfully created 10 test messages!');
  console.log(`\nView the conversation at: /messages/${conversation.id}`);
}

seedTestMessages()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
