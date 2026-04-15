/**
 * Browser console snippet — populate localStorage for nick6@nick.com.
 *
 * HOW TO USE:
 *   1. Log in to the app as nick6@nick.com
 *   2. Open DevTools → Console (Cmd+Opt+J / Ctrl+Shift+J)
 *   3. Paste this entire file, press Enter
 *   4. Refresh the dashboard
 *
 * Populates:
 *   - 50 saved careers (endeavrly-curiosity-saves:<userId>)
 *   - 10 saved comparisons (saved-career-comparisons)
 *   - 30 per-career Clarity confirmations so those journeys show as complete
 */

(async () => {
  // Fetch the logged-in user id from the NextAuth session so we write
  // to the per-user curiosity-saves key that the hook actually reads.
  let userId;
  try {
    const res = await fetch('/api/auth/session', { credentials: 'include' });
    const session = await res.json();
    userId = session?.user?.id;
  } catch (e) {
    console.error('Failed to fetch session:', e);
    return;
  }
  if (!userId) {
    console.error('❌ No logged-in user. Log in first, then re-run.');
    return;
  }
  console.log(`Seeding for userId=${userId}`);

  // ── 50 saved careers ─────────────────────────────────────────
  const SAVED_CAREERS = [
    { id: 'software-developer', title: 'Software Developer', emoji: '💻' },
    { id: 'data-scientist', title: 'Data Scientist', emoji: '📊' },
    { id: 'ux-designer', title: 'UX Designer', emoji: '🎨' },
    { id: 'product-manager', title: 'Product Manager', emoji: '🧭' },
    { id: 'marine-biologist', title: 'Marine Biologist', emoji: '🐠' },
    { id: 'veterinarian', title: 'Veterinarian', emoji: '🐾' },
    { id: 'registered-nurse', title: 'Registered Nurse', emoji: '💊' },
    { id: 'doctor', title: 'Doctor', emoji: '🩺' },
    { id: 'graphic-designer', title: 'Graphic Designer', emoji: '🖌️' },
    { id: 'illustrator', title: 'Illustrator', emoji: '✏️' },
    { id: 'game-developer', title: 'Game Developer', emoji: '🎮' },
    { id: 'animator', title: 'Animator', emoji: '🎞️' },
    { id: 'civil-engineer', title: 'Civil Engineer', emoji: '🏗️' },
    { id: 'mechanical-engineer', title: 'Mechanical Engineer', emoji: '⚙️' },
    { id: 'aerospace-engineer', title: 'Aerospace Engineer', emoji: '🚀' },
    { id: 'journalist', title: 'Journalist', emoji: '📰' },
    { id: 'author', title: 'Author', emoji: '📖' },
    { id: 'photographer', title: 'Photographer', emoji: '📷' },
    { id: 'film-director', title: 'Film Director', emoji: '🎬' },
    { id: 'chef', title: 'Chef', emoji: '👨‍🍳' },
    { id: 'baker', title: 'Baker', emoji: '🥖' },
    { id: 'food-scientist', title: 'Food Scientist', emoji: '🧪' },
    { id: 'electrician', title: 'Electrician', emoji: '💡' },
    { id: 'plumber', title: 'Plumber', emoji: '🔧' },
    { id: 'carpenter', title: 'Carpenter', emoji: '🪚' },
    { id: 'police-officer', title: 'Police Officer', emoji: '👮' },
    { id: 'firefighter', title: 'Firefighter', emoji: '🚒' },
    { id: 'paramedic', title: 'Paramedic', emoji: '🚑' },
    { id: 'primary-teacher', title: 'Primary Teacher', emoji: '🧑‍🏫' },
    { id: 'secondary-teacher', title: 'Secondary Teacher', emoji: '👩‍🏫' },
    { id: 'architect', title: 'Architect', emoji: '📐' },
    { id: 'pilot', title: 'Pilot', emoji: '✈️' },
    { id: 'environmental-scientist', title: 'Environmental Scientist', emoji: '🌿' },
    { id: 'geologist', title: 'Geologist', emoji: '🪨' },
    { id: 'zoologist', title: 'Zoologist', emoji: '🦁' },
    { id: 'pharmacist', title: 'Pharmacist', emoji: '💉' },
    { id: 'physiotherapist', title: 'Physiotherapist', emoji: '🧘' },
    { id: 'psychologist', title: 'Psychologist', emoji: '🧠' },
    { id: 'accountant', title: 'Accountant', emoji: '🧮' },
    { id: 'financial-analyst', title: 'Financial Analyst', emoji: '💹' },
    { id: 'marketing-manager', title: 'Marketing Manager', emoji: '📣' },
    { id: 'entrepreneur', title: 'Entrepreneur', emoji: '🚀' },
    { id: 'ai-engineer', title: 'AI Engineer', emoji: '🤖' },
    { id: 'cybersecurity-analyst', title: 'Cybersecurity Analyst', emoji: '🛡️' },
    { id: 'interior-designer', title: 'Interior Designer', emoji: '🛋️' },
    { id: 'musician', title: 'Musician', emoji: '🎵' },
    { id: 'personal-trainer', title: 'Personal Trainer', emoji: '💪' },
    { id: 'sports-coach', title: 'Sports Coach', emoji: '⚽' },
    { id: 'social-worker', title: 'Social Worker', emoji: '🤝' },
    { id: 'park-ranger', title: 'Park Ranger', emoji: '🌲' },
  ];

  // Convert to the shape useCuriositySaves expects
  const now = Date.now();
  const curiosityItems = SAVED_CAREERS.map((c, i) => ({
    careerId: c.id,
    careerTitle: c.title,
    careerEmoji: c.emoji,
    savedAt: new Date(now - (i * 1000 * 60 * 60)).toISOString(), // staggered, most recent first
  }));

  localStorage.setItem(`endeavrly-curiosity-saves:${userId}`, JSON.stringify(curiosityItems));
  console.log(`✅ Saved ${curiosityItems.length} careers to localStorage`);

  // ── 10 saved comparisons ─────────────────────────────────────
  const COMPARISON_PAIRS = [
    [SAVED_CAREERS[0], SAVED_CAREERS[1]],                     // SDev vs DS
    [SAVED_CAREERS[4], SAVED_CAREERS[5]],                     // Marine bio vs Vet
    [SAVED_CAREERS[25], SAVED_CAREERS[26], SAVED_CAREERS[27]], // Police/Fire/Paramedic
    [SAVED_CAREERS[6], SAVED_CAREERS[36]],                    // Nurse vs Physio
    [SAVED_CAREERS[12], SAVED_CAREERS[30]],                   // Civil eng vs Architect
    [SAVED_CAREERS[19], SAVED_CAREERS[21]],                   // Chef vs Food scientist
    [SAVED_CAREERS[8], SAVED_CAREERS[9], SAVED_CAREERS[10]],  // Graphic/Illustrator/Game dev
    [SAVED_CAREERS[15], SAVED_CAREERS[16]],                   // Journalist vs Author
    [SAVED_CAREERS[43], SAVED_CAREERS[2]],                    // Interior des vs UX
    [SAVED_CAREERS[38], SAVED_CAREERS[40]],                   // Accountant vs Marketing mgr
  ];

  const comparisons = COMPARISON_PAIRS.map((careers, i) => ({
    id: `cmp-${now}-${i}`,
    title: careers.map(c => c.title).join(' vs '),
    careers: careers.map(c => ({ id: c.id, title: c.title, emoji: c.emoji })),
    savedAt: now - (i * 1000 * 60 * 60 * 24), // staggered over days
  }));

  localStorage.setItem('saved-career-comparisons', JSON.stringify(comparisons));
  console.log(`✅ Saved ${comparisons.length} comparisons to localStorage`);

  // ── 30 Clarity confirmations (one per explored journey) ─────
  const JOURNEY_SLUGS = [
    'software-developer', 'data-scientist', 'ux-designer', 'product-manager',
    'marine-biologist', 'veterinarian', 'nurse', 'doctor',
    'graphic-designer', 'illustrator', 'game-developer', 'animator',
    'civil-engineer', 'mechanical-engineer', 'aerospace-engineer',
    'journalist', 'author', 'photographer', 'film-director',
    'chef', 'baker', 'food-scientist',
    'electrician', 'plumber', 'carpenter',
    'police-officer', 'firefighter', 'paramedic',
    'primary-teacher', 'secondary-teacher',
  ];

  // The app stores these as per-career keys. We set both Discover and
  // Understand confirmations for each so all three tabs unlock.
  for (const slug of JOURNEY_SLUGS) {
    localStorage.setItem(`lens-discover-confirmed-${slug}`, '1');
    localStorage.setItem(`lens-understand-confirmed-${slug}`, '1');
  }
  console.log(`✅ Set Clarity unlocks for ${JOURNEY_SLUGS.length} journeys`);

  console.log('\n🎉 All set. Refresh the page to see the results.');
})();
