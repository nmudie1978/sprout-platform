/**
 * Default Journey Tasks
 *
 * ~30 tasks across 4 stages x 3 modes.
 * Each task has a tooltip explaining "why it matters".
 */

import type { DefaultTaskDefinition } from './types';

export const DEFAULT_TASKS: DefaultTaskDefinition[] = [
  // ============================================
  // FOUNDATION STAGE
  // ============================================

  // Foundation / Discover
  {
    stageId: 'foundation',
    mode: 'discover',
    title: 'Identify 3 personal strengths',
    tooltipTitle: 'Know your starting point',
    tooltipBody: 'Understanding your strengths helps you choose paths that feel natural and build confidence early.',
  },
  {
    stageId: 'foundation',
    mode: 'discover',
    title: 'List 5 activities you enjoy',
    tooltipTitle: 'Follow your energy',
    tooltipBody: 'What you enjoy doing often points toward careers where you\'ll thrive and stay motivated.',
  },

  // Foundation / Understand
  {
    stageId: 'foundation',
    mode: 'understand',
    title: 'Ask a trusted adult about their career path',
    tooltipTitle: 'Learn from experience',
    tooltipBody: 'Real stories from people you trust reveal what career paths actually look like day-to-day.',
  },
  {
    stageId: 'foundation',
    mode: 'understand',
    title: 'Research what skills employers value most',
    tooltipTitle: 'Understand the market',
    tooltipBody: 'Knowing what employers look for helps you focus your energy on skills that actually matter.',
  },

  // Foundation / Act
  {
    stageId: 'foundation',
    mode: 'act',
    title: 'Complete your Sprout profile',
    tooltipTitle: 'Make yourself visible',
    tooltipBody: 'A complete profile is your first step toward real opportunities and connections.',
  },
  {
    stageId: 'foundation',
    mode: 'act',
    title: 'Set your primary career goal',
    tooltipTitle: 'Choose a direction',
    tooltipBody: 'Having a goal gives your journey structure. You can always change it later.',
  },

  // ============================================
  // EDUCATION STAGE
  // ============================================

  // Education / Discover
  {
    stageId: 'education',
    mode: 'discover',
    title: 'Explore 3 education pathways for your goal',
    tooltipTitle: 'See your options',
    tooltipBody: 'There\'s rarely just one path. Exploring alternatives helps you make informed choices.',
  },
  {
    stageId: 'education',
    mode: 'discover',
    title: 'Identify subjects that connect to your goal',
    tooltipTitle: 'Connect the dots',
    tooltipBody: 'Seeing how school subjects relate to your career makes current learning feel more purposeful.',
  },

  // Education / Understand
  {
    stageId: 'education',
    mode: 'understand',
    title: 'Research required qualifications',
    tooltipTitle: 'Know the requirements',
    tooltipBody: 'Understanding what\'s needed prevents surprises and helps you plan ahead.',
  },
  {
    stageId: 'education',
    mode: 'understand',
    title: 'Compare 2 education pathways',
    tooltipTitle: 'Weigh your options',
    tooltipBody: 'Comparing paths side-by-side reveals trade-offs you might not see otherwise.',
  },
  {
    stageId: 'education',
    mode: 'understand',
    title: 'Find out about financial support or scholarships',
    tooltipTitle: 'Plan the finances',
    tooltipBody: 'Knowing your options for financial support removes a major barrier early.',
  },

  // Education / Act
  {
    stageId: 'education',
    mode: 'act',
    title: 'Sign up for a free online course related to your goal',
    tooltipTitle: 'Start learning now',
    tooltipBody: 'You don\'t need to wait for formal education. Free courses let you test the waters.',
  },
  {
    stageId: 'education',
    mode: 'act',
    title: 'Talk to someone studying in your field of interest',
    tooltipTitle: 'Get insider perspective',
    tooltipBody: 'Students can tell you what the experience is really like — the good and the challenging.',
  },

  // ============================================
  // EXPERIENCE STAGE
  // ============================================

  // Experience / Discover
  {
    stageId: 'experience',
    mode: 'discover',
    title: 'Identify 3 types of experience relevant to your goal',
    tooltipTitle: 'Think broadly',
    tooltipBody: 'Experience isn\'t just jobs. Volunteering, projects, and shadowing all count.',
  },
  {
    stageId: 'experience',
    mode: 'discover',
    title: 'Research what entry-level roles look like',
    tooltipTitle: 'Set expectations',
    tooltipBody: 'Knowing what to expect from first roles helps you set realistic goals.',
  },

  // Experience / Understand
  {
    stageId: 'experience',
    mode: 'understand',
    title: 'Map skills you have vs skills you need',
    tooltipTitle: 'Find the gaps',
    tooltipBody: 'A clear skills gap analysis tells you exactly where to focus your effort.',
  },
  {
    stageId: 'experience',
    mode: 'understand',
    title: 'Learn about workplace expectations and culture',
    tooltipTitle: 'Prepare for the environment',
    tooltipBody: 'Understanding workplace norms helps you feel confident from day one.',
  },

  // Experience / Act
  {
    stageId: 'experience',
    mode: 'act',
    title: 'Apply for 3 opportunities',
    tooltipTitle: 'Take the leap',
    tooltipBody: 'Applying is a skill in itself. Each application teaches you something new.',
  },
  {
    stageId: 'experience',
    mode: 'act',
    title: 'Complete a small project or volunteer task',
    tooltipTitle: 'Build evidence',
    tooltipBody: 'Completing something real — even small — gives you concrete proof of your abilities.',
  },
  {
    stageId: 'experience',
    mode: 'act',
    title: 'Request a career shadow or informational interview',
    tooltipTitle: 'See the work firsthand',
    tooltipBody: 'Nothing beats seeing a role in action. It confirms or redirects your interest.',
  },

  // ============================================
  // CAREER STAGE
  // ============================================

  // Career / Discover
  {
    stageId: 'career',
    mode: 'discover',
    title: 'Identify your ideal work environment',
    tooltipTitle: 'Know what suits you',
    tooltipBody: 'Remote, office, outdoors, team-based — knowing your preference narrows your search.',
  },
  {
    stageId: 'career',
    mode: 'discover',
    title: 'Research growth paths within your chosen field',
    tooltipTitle: 'See the long game',
    tooltipBody: 'Understanding where a career can lead helps you stay motivated through early challenges.',
  },

  // Career / Understand
  {
    stageId: 'career',
    mode: 'understand',
    title: 'Understand salary expectations and progression',
    tooltipTitle: 'Know your worth',
    tooltipBody: 'Realistic salary expectations help you plan your life and negotiate confidently.',
  },
  {
    stageId: 'career',
    mode: 'understand',
    title: 'Research companies or organisations in your field',
    tooltipTitle: 'Find your fit',
    tooltipBody: 'Not all employers are the same. Finding the right culture matters as much as the role.',
  },

  // Career / Act
  {
    stageId: 'career',
    mode: 'act',
    title: 'Create or update your CV / portfolio',
    tooltipTitle: 'Present yourself',
    tooltipBody: 'A polished CV or portfolio is your ticket to interviews and opportunities.',
  },
  {
    stageId: 'career',
    mode: 'act',
    title: 'Build a professional network connection',
    tooltipTitle: 'Connect with your industry',
    tooltipBody: 'Many opportunities come through people, not job boards. Start building connections.',
  },
  {
    stageId: 'career',
    mode: 'act',
    title: 'Set 3 goals for your first year in the field',
    tooltipTitle: 'Plan your entry',
    tooltipBody: 'Clear first-year goals turn a vague ambition into a concrete, achievable plan.',
  },
];
