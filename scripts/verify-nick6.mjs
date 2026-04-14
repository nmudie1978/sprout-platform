import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const u = await prisma.user.findUnique({
  where: { email: 'nick6@nick.com' },
  include: { youthProfile: { select: { id: true, completedJobsCount: true, averageRating: true } } },
});

const [journeys, savedItems, applications, completions, convs, msgs] = await Promise.all([
  prisma.journeyGoalData.count({ where: { userId: u.id } }),
  prisma.savedItem.count({ where: { profileId: u.youthProfile.id } }),
  prisma.application.count({ where: { youthId: u.id } }),
  prisma.jobCompletion.count({ where: { youthId: u.id } }),
  prisma.conversation.count({ where: { OR: [{ participant1Id: u.id }, { participant2Id: u.id }] } }),
  prisma.message.count({
    where: { conversation: { OR: [{ participant1Id: u.id }, { participant2Id: u.id }] } },
  }),
]);

console.log(`nick6@nick.com (${u.id})`);
console.log(`  profile.completedJobsCount : ${u.youthProfile.completedJobsCount}`);
console.log(`  profile.averageRating      : ${u.youthProfile.averageRating}`);
console.log(`  JourneyGoalData rows       : ${journeys}`);
console.log(`  SavedItem rows             : ${savedItems}`);
console.log(`  Application rows           : ${applications}`);
console.log(`  JobCompletion rows         : ${completions}`);
console.log(`  Conversation rows          : ${convs}`);
console.log(`  Message rows               : ${msgs}`);

await prisma.$disconnect();
