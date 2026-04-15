const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Get user IDs
  const nicky = await prisma.user.findFirst({ where: { email: 'nickymudie@hotmail.com' } });
  const ryan = await prisma.user.findFirst({ where: { email: 'ryanmudie1982@gmail.com' } });

  if (!nicky || !ryan) {
    console.log('Users not found - nicky:', !!nicky, 'ryan:', !!ryan);
    return;
  }

  console.log('Found users: Nicky=' + nicky.id + ', Ryan=' + ryan.id);

  // Find a job posted by Nicky (required for conversation)
  const nickyJob = await prisma.microJob.findFirst({
    where: { postedById: nicky.id }
  });

  if (!nickyJob) {
    console.log('No job found for Nicky - cannot create conversation without a job');
    return;
  }
  console.log('Using job: ' + nickyJob.title + ' (id: ' + nickyJob.id + ')');

  // Normalize participant order
  const [p1, p2] = [nicky.id, ryan.id].sort();

  // Find or create conversation
  let conversation = await prisma.conversation.findFirst({
    where: { participant1Id: p1, participant2Id: p2 }
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        participant1: { connect: { id: p1 } },
        participant2: { connect: { id: p2 } },
        job: { connect: { id: nickyJob.id } },
        status: 'ACTIVE',
        lastMessageAt: new Date(),
      }
    });
    console.log('Created conversation: ' + conversation.id);
  } else {
    console.log('Found conversation: ' + conversation.id);
  }

  // Check existing messages
  const existingCount = await prisma.message.count({
    where: { conversationId: conversation.id }
  });

  if (existingCount >= 20) {
    console.log('Already has ' + existingCount + ' messages, skipping');
    return;
  }

  // Clear partial messages
  if (existingCount > 0) {
    await prisma.message.deleteMany({ where: { conversationId: conversation.id } });
    console.log('Cleared ' + existingCount + ' existing messages');
  }

  // Create messages
  const messages = [
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
    { sender: 'ryan', content: 'Just got back from the walk! They were so well behaved. Max found a stick he really liked :)', hoursAgo: 22 },
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

  for (const msg of messages) {
    const senderId = msg.sender === 'nicky' ? nicky.id : ryan.id;
    const messageDate = new Date();
    messageDate.setHours(messageDate.getHours() - msg.hoursAgo);

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId,
        content: msg.content,
        read: true,
        createdAt: messageDate,
      }
    });
  }

  // Update last message time
  const lastDate = new Date();
  lastDate.setHours(lastDate.getHours() - 13);
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { lastMessageAt: lastDate }
  });

  console.log('✅ Created ' + messages.length + ' messages!');

  // Verify
  const count = await prisma.message.count({ where: { conversationId: conversation.id } });
  console.log('Total messages in conversation: ' + count);
}

main().then(() => prisma.$disconnect()).catch(e => { console.error(e); prisma.$disconnect(); });
