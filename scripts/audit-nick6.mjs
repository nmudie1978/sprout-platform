// One-shot audit: what is actually persisted for nick6@nick.com vs what
// lives only client-side? Prints counts for every user-owned table so we
// can pinpoint exactly what's in the DB and what isn't.
//
// Run: node --env-file=.env scripts/audit-nick6.mjs

import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();
const EMAIL = 'nick6@nick.com';

try {
  const user = await p.user.findUnique({
    where: { email: EMAIL },
    select: {
      id: true, email: true, createdAt: true, updatedAt: true,
      authProvider: true, accountStatus: true,
    },
  });
  if (!user) {
    console.log(`USER NOT FOUND: ${EMAIL}`);
    process.exit(0);
  }
  console.log(`USER ${EMAIL}  id=${user.id}  created=${user.createdAt.toISOString()}  authProvider=${user.authProvider}  status=${user.accountStatus}\n`);

  const uid = user.id;

  const [
    accounts, sessions, profile, prefs,
    swipes, savedJobs, savedItems,
    goalData, reflections, notes, timelineEvents, journeyNotes,
    quizResults, savedIndustries, industryProgress,
    learningProgress, pathSnapshots, vaultItems,
    aiChats, badges, earnings, realityChecks,
    contentInteractions, traitObs, journeySnapshots,
  ] = await Promise.all([
    p.account.count({ where: { userId: uid } }),
    p.session.count({ where: { userId: uid } }),
    p.youthProfile.findUnique({
      where: { userId: uid },
      select: {
        displayName: true, primaryGoal: true, secondaryGoal: true,
        foundationCardData: true, journeySummary: true, discoveryPreferences: true,
        interests: true, skillTags: true, desiredRoles: true,
      },
    }),
    p.userPreferences.findUnique({ where: { userId: uid } }).catch(() => null),
    p.swipe.count({ where: { youthId: uid } }),
    p.savedJob.count({ where: { youthId: uid } }),
    p.savedItem.count({ where: { youthProfile: { userId: uid } } }).catch(() => 'n/a'),
    p.journeyGoalData.count({ where: { userId: uid } }),
    p.journeyReflection.count({ where: { youthProfile: { userId: uid } } }).catch(() => 'n/a'),
    p.userNote.count({ where: { youthProfile: { userId: uid } } }).catch(() => 'n/a'),
    p.timelineEvent.count({ where: { userId: uid } }),
    p.journeyNote.count({ where: { youthProfile: { userId: uid } } }).catch(() => 'n/a'),
    p.careerQuizResult.count({ where: { userId: uid } }),
    p.savedIndustry.count({ where: { userId: uid } }),
    p.industryProgress.count({ where: { userId: uid } }),
    p.userLearningProgress.count({ where: { userId: uid } }),
    p.pathSnapshot.count({ where: { userId: uid } }),
    p.vaultItem.count({ where: { userId: uid } }),
    p.aiChatMessage.count({ where: { userId: uid } }),
    p.badge.count({ where: { youthId: uid } }),
    p.earning.count({ where: { youthId: uid } }),
    p.careerRealityCheck.count({ where: { userId: uid } }).catch(() => 'n/a'),
    p.contentInteraction.count({ where: { youthProfile: { userId: uid } } }).catch(() => 'n/a'),
    p.traitObservation.count({ where: { youthProfile: { userId: uid } } }).catch(() => 'n/a'),
    p.journeySnapshot.count({ where: { youthProfile: { userId: uid } } }).catch(() => 'n/a'),
  ]);

  const rows = [
    ['Auth',                    ''],
    ['  Account (OAuth link)',  accounts],
    ['  Session (active)',      sessions],
    ['Profile',                 ''],
    ['  YouthProfile',          profile ? 'yes' : 'MISSING'],
    ['  UserPreferences',       prefs ? 'yes' : 'none'],
    ['Saved careers/journeys',  ''],
    ['  Swipe (saved careers)', swipes],
    ['  SavedJob',              savedJobs],
    ['  SavedItem',             savedItems],
    ['  JourneyGoalData',       goalData],
    ['Journey content',         ''],
    ['  JourneyReflection',     reflections],
    ['  JourneyNote',           journeyNotes],
    ['  JourneySnapshot',       journeySnapshots],
    ['  TraitObservation',      traitObs],
    ['  UserNote',              notes],
    ['  TimelineEvent',         timelineEvents],
    ['  ContentInteraction',    contentInteractions],
    ['Industry/learning',       ''],
    ['  CareerQuizResult',      quizResults],
    ['  SavedIndustry',         savedIndustries],
    ['  IndustryProgress',      industryProgress],
    ['  UserLearningProgress',  learningProgress],
    ['  PathSnapshot',          pathSnapshots],
    ['  VaultItem',             vaultItems],
    ['  CareerRealityCheck',    realityChecks],
    ['Other',                   ''],
    ['  AiChatMessage',         aiChats],
    ['  Badge',                 badges],
    ['  Earning',               earnings],
  ];
  for (const [k, v] of rows) {
    if (v === '') console.log(k);
    else console.log(`  ${k.padEnd(30)} ${v}`);
  }

  if (profile) {
    console.log('\n── YouthProfile highlights ──');
    console.log('  primaryGoal        :', profile.primaryGoal ? JSON.stringify(profile.primaryGoal).slice(0, 140) : 'null');
    console.log('  secondaryGoal      :', profile.secondaryGoal ? JSON.stringify(profile.secondaryGoal).slice(0, 140) : 'null');
    console.log('  foundationCardData :', profile.foundationCardData ? 'yes' : 'null');
    console.log('  journeySummary     :', profile.journeySummary ? 'yes' : 'null');
    console.log('  discoveryPreferences:', profile.discoveryPreferences ? 'yes' : 'null');
    console.log('  interests          :', (profile.interests ?? []).length, 'items');
    console.log('  skillTags          :', (profile.skillTags ?? []).length, 'items');
    console.log('  desiredRoles       :', (profile.desiredRoles ?? []).length, 'items');
  }
} catch (e) {
  console.error('ERROR:', e.message);
  process.exit(1);
} finally {
  await p.$disconnect();
}
