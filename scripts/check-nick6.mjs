import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

try {
  const u = await p.user.findUnique({
    where: { email: 'nick6@nick.com' },
    include: {
      youthProfile: {
        select: {
          id: true,
          displayName: true,
          completedJobsCount: true,
          primaryGoal: true,
          journeySummary: true,
        },
      },
    },
  });
  if (!u) {
    console.log('USER NOT FOUND');
  } else {
    console.log(JSON.stringify(u, null, 2));
  }
} catch (e) {
  console.error('ERR:', e.message);
} finally {
  await p.$disconnect();
}
