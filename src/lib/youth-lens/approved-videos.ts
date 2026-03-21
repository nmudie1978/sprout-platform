/**
 * YOUTH LENS — APPROVED VIDEO POOL
 *
 * Curated, verified video assets for the relevance-driven matching system.
 * All videos are from TED/TEDx channels on YouTube, manually verified.
 *
 * Each entry tagged with canonical tags from tags.ts.
 * Tags are ordered by importance (primary tags first).
 *
 * Admin-curated only. No user-submitted videos at MVP stage.
 * TODO: Replace with CMS-based moderation when ready.
 *
 * Last verified: February 2026
 */

import type { VideoAsset } from "./types";

// ============================================
// APPROVED VIDEO POOL
// ============================================

export const APPROVED_VIDEOS: VideoAsset[] = [
  // -------------------------------------------
  // Career direction & identity
  // -------------------------------------------
  {
    id: "av-osberg-graduation",
    title: "It's okay not knowing what's after graduation",
    description:
      "Daisy Osberg normalises the pressure teenagers face to have their futures figured out.",
    type: "story",
    source: "ted",
    embedUrl: "https://www.youtube.com/embed/uRHWR_aYb4w",
    thumbnailUrl: "https://img.youtube.com/vi/uRHWR_aYb4w/mqdefault.jpg",
    durationSec: 327,
    publishedAt: "2023-06-15",
    channelName: "TEDx Talks",
    tags: [
      "career_uncertainty",
      "identity",
      "overwhelm",
      "decision_making",
    ],
    signals: {
      humanLikely: true,
      verifiedSource: true,
      hasTranscript: true,
    },
  },
  {
    id: "av-wapnick-multipotentialite",
    title: "Why some of us don't have one true calling",
    description:
      "Emilie Wapnick explains why having many interests is a strength, not a weakness.",
    type: "explainer",
    source: "ted",
    embedUrl: "https://www.youtube.com/embed/4sZdcB6bjI8",
    thumbnailUrl: "https://img.youtube.com/vi/4sZdcB6bjI8/mqdefault.jpg",
    durationSec: 736,
    publishedAt: "2015-10-02",
    channelName: "TED",
    tags: [
      "career_uncertainty",
      "identity",
      "career_pathways",
      "growth_mindset",
    ],
    signals: {
      humanLikely: true,
      verifiedSource: true,
      hasTranscript: true,
    },
  },
  {
    id: "av-ellis-squiggly-careers",
    title: "The best career path isn't always a straight line",
    description:
      "Sarah Ellis and Helen Tupper on why 'squiggly careers' are the new normal.",
    type: "story",
    source: "ted",
    embedUrl: "https://www.youtube.com/embed/1ALfKWG2nmw",
    thumbnailUrl: "https://img.youtube.com/vi/1ALfKWG2nmw/mqdefault.jpg",
    durationSec: 557,
    publishedAt: "2020-09-28",
    channelName: "TEDx Talks",
    tags: [
      "career_pathways",
      "adaptability",
      "career_uncertainty",
      "growth_mindset",
    ],
    signals: {
      humanLikely: true,
      verifiedSource: true,
      hasTranscript: true,
    },
  },
  {
    id: "av-smith-great-career",
    title: "Why you will fail to have a great career",
    description:
      "Larry Smith calls out the absurd excuses people invent when they fail to pursue their passions.",
    type: "explainer",
    source: "ted",
    embedUrl: "https://www.youtube.com/embed/iKHTawgyKWQ",
    thumbnailUrl: "https://img.youtube.com/vi/iKHTawgyKWQ/mqdefault.jpg",
    durationSec: 900,
    publishedAt: "2012-01-23",
    channelName: "TEDx Talks",
    tags: [
      "career_pathways",
      "motivation",
      "career_uncertainty",
      "decision_making",
    ],
    signals: {
      humanLikely: true,
      verifiedSource: true,
      hasTranscript: true,
    },
  },
  {
    id: "av-dinsmore-find-work-love",
    title: "How to find work you love",
    description:
      "Scott Dinsmore shares a practical framework for finding meaningful work based on your unique strengths.",
    type: "story",
    source: "ted",
    embedUrl: "https://www.youtube.com/embed/jpe-LKn-4gM",
    thumbnailUrl: "https://img.youtube.com/vi/jpe-LKn-4gM/mqdefault.jpg",
    durationSec: 1080,
    publishedAt: "2015-09-01",
    channelName: "TEDx Talks",
    tags: [
      "career_pathways",
      "motivation",
      "identity",
      "career_uncertainty",
    ],
    signals: {
      humanLikely: true,
      verifiedSource: true,
      hasTranscript: true,
    },
  },

  // -------------------------------------------
  // Skills & readiness
  // -------------------------------------------
  {
    id: "av-pabari-skills-thrive",
    title: "3 skills to thrive in the workplace",
    description:
      "Taj Pabari on the skills everyone needs to thrive — and why the classroom doesn't teach them.",
    type: "explainer",
    source: "ted",
    embedUrl: "https://www.youtube.com/embed/gk_H8bEOuFo",
    thumbnailUrl: "https://img.youtube.com/vi/gk_H8bEOuFo/mqdefault.jpg",
    durationSec: 825,
    publishedAt: "2018-11-12",
    channelName: "TEDx Talks",
    tags: [
      "skills_gap",
      "employability",
      "soft_skills",
      "confidence",
    ],
    signals: {
      humanLikely: true,
      verifiedSource: true,
      hasTranscript: true,
    },
  },
  {
    id: "av-jaenson-confidence",
    title: "Six behaviors to increase your confidence",
    description:
      "Emily Jaenson shares actionable behaviours anyone can adopt to build real confidence.",
    type: "story",
    source: "ted",
    embedUrl: "https://www.youtube.com/embed/IitIl2C3Iy8",
    thumbnailUrl: "https://img.youtube.com/vi/IitIl2C3Iy8/mqdefault.jpg",
    durationSec: 613,
    publishedAt: "2019-03-05",
    channelName: "TEDx Talks",
    tags: [
      "confidence",
      "soft_skills",
      "resilience",
      "motivation",
    ],
    signals: {
      humanLikely: true,
      verifiedSource: true,
      hasTranscript: true,
    },
  },
  {
    id: "av-cuddy-body-language",
    title: "Your body language may shape who you are",
    description:
      "Amy Cuddy shows how 'power posing' can affect your confidence and stress hormones.",
    type: "explainer",
    source: "ted",
    embedUrl: "https://www.youtube.com/embed/Ks-_Mh1QhMc",
    thumbnailUrl: "https://img.youtube.com/vi/Ks-_Mh1QhMc/mqdefault.jpg",
    durationSec: 1260,
    publishedAt: "2012-10-01",
    channelName: "TED",
    tags: [
      "confidence",
      "soft_skills",
      "communication",
      "resilience",
    ],
    signals: {
      humanLikely: true,
      verifiedSource: true,
      hasTranscript: true,
    },
  },
  {
    id: "av-headlee-conversation",
    title: "10 ways to have a better conversation",
    description:
      "Celeste Headlee shares 10 practical rules for having better conversations based on honesty, brevity, and listening.",
    type: "explainer",
    source: "ted",
    embedUrl: "https://www.youtube.com/embed/R1vskiVDwl4",
    thumbnailUrl: "https://img.youtube.com/vi/R1vskiVDwl4/mqdefault.jpg",
    durationSec: 720,
    publishedAt: "2016-03-08",
    channelName: "TED",
    tags: [
      "communication",
      "soft_skills",
      "networking",
      "employability",
    ],
    signals: {
      humanLikely: true,
      verifiedSource: true,
      hasTranscript: true,
    },
  },
  {
    id: "av-saujani-bravery",
    title: "Teach girls bravery, not perfection",
    description:
      "Reshma Saujani argues we're raising girls to be perfect when we should raise them to be brave.",
    type: "story",
    source: "ted",
    embedUrl: "https://www.youtube.com/embed/fC9da6eqaqg",
    thumbnailUrl: "https://img.youtube.com/vi/fC9da6eqaqg/mqdefault.jpg",
    durationSec: 780,
    publishedAt: "2016-03-29",
    channelName: "TED",
    tags: [
      "confidence",
      "resilience",
      "growth_mindset",
      "grit",
    ],
    signals: {
      humanLikely: true,
      verifiedSource: true,
      hasTranscript: true,
    },
  },

  // -------------------------------------------
  // Motivation & mindset
  // -------------------------------------------
  {
    id: "av-duckworth-grit",
    title: "Grit: The power of passion and perseverance",
    description:
      "Angela Duckworth explains why talent alone doesn't guarantee success — grit does.",
    type: "explainer",
    source: "ted",
    embedUrl: "https://www.youtube.com/embed/H14bBuluwB8",
    thumbnailUrl: "https://img.youtube.com/vi/H14bBuluwB8/mqdefault.jpg",
    durationSec: 360,
    publishedAt: "2013-05-09",
    channelName: "TED",
    tags: [
      "grit",
      "resilience",
      "motivation",
      "growth_mindset",
    ],
    signals: {
      humanLikely: true,
      verifiedSource: true,
      hasTranscript: true,
    },
  },
  {
    id: "av-dweck-growth-mindset",
    title: "The power of believing that you can improve",
    description:
      "Carol Dweck on growth mindset — the idea that we can grow our brain's capacity to learn and solve problems.",
    type: "explainer",
    source: "ted",
    embedUrl: "https://www.youtube.com/embed/_X0mgOOSpLU",
    thumbnailUrl: "https://img.youtube.com/vi/_X0mgOOSpLU/mqdefault.jpg",
    durationSec: 600,
    publishedAt: "2014-12-17",
    channelName: "TED",
    tags: [
      "growth_mindset",
      "resilience",
      "motivation",
      "confidence",
    ],
    signals: {
      humanLikely: true,
      verifiedSource: true,
      hasTranscript: true,
    },
  },
  {
    id: "av-brown-vulnerability",
    title: "The power of vulnerability",
    description:
      "Brene Brown studies human connection and shares a deep insight from her research on vulnerability and courage.",
    type: "story",
    source: "ted",
    embedUrl: "https://www.youtube.com/embed/iCvmsMzlF7o",
    thumbnailUrl: "https://img.youtube.com/vi/iCvmsMzlF7o/mqdefault.jpg",
    durationSec: 1200,
    publishedAt: "2011-01-03",
    channelName: "TEDx Talks",
    tags: [
      "confidence",
      "resilience",
      "identity",
      "soft_skills",
    ],
    signals: {
      humanLikely: true,
      verifiedSource: true,
      hasTranscript: true,
    },
  },
  {
    id: "av-cutts-30-days",
    title: "Try something new for 30 days",
    description:
      "Matt Cutts offers a neat way to think about setting and achieving goals — try it for 30 days.",
    type: "story",
    source: "ted",
    embedUrl: "https://www.youtube.com/embed/UNP03fDSj1U",
    thumbnailUrl: "https://img.youtube.com/vi/UNP03fDSj1U/mqdefault.jpg",
    durationSec: 210,
    publishedAt: "2011-07-01",
    channelName: "TED",
    tags: [
      "motivation",
      "grit",
      "adaptability",
      "growth_mindset",
    ],
    signals: {
      humanLikely: true,
      verifiedSource: true,
      hasTranscript: true,
    },
  },
  {
    id: "av-urban-procrastinator",
    title: "Inside the mind of a master procrastinator",
    description:
      "Tim Urban takes us on a journey through YouTube binges, Wikipedia spirals, and the secret life of procrastinators.",
    type: "explainer",
    source: "ted",
    embedUrl: "https://www.youtube.com/embed/arj7oStGLkU",
    thumbnailUrl: "https://img.youtube.com/vi/arj7oStGLkU/mqdefault.jpg",
    durationSec: 840,
    publishedAt: "2016-04-06",
    channelName: "TED",
    tags: [
      "motivation",
      "decision_making",
      "career_uncertainty",
      "grit",
    ],
    signals: {
      humanLikely: true,
      verifiedSource: true,
      hasTranscript: true,
    },
  },

  // -------------------------------------------
  // Support, guidance & mentorship
  // -------------------------------------------
  {
    id: "av-sinek-start-with-why",
    title: "How great leaders inspire action",
    description:
      "Simon Sinek presents a simple but powerful model for inspirational leadership — starting with 'why'.",
    type: "explainer",
    source: "ted",
    embedUrl: "https://www.youtube.com/embed/u4ZoJKF_VuA",
    thumbnailUrl: "https://img.youtube.com/vi/u4ZoJKF_VuA/mqdefault.jpg",
    durationSec: 1080,
    publishedAt: "2010-05-04",
    channelName: "TED",
    tags: [
      "motivation",
      "career_pathways",
      "guidance",
      "identity",
    ],
    signals: {
      humanLikely: true,
      verifiedSource: true,
      hasTranscript: true,
    },
  },
  {
    id: "av-pierson-champion",
    title: "Every kid needs a champion",
    description:
      "Rita Pierson, a teacher for 40 years, makes a passionate case for the value of human connection in education.",
    type: "story",
    source: "ted",
    embedUrl: "https://www.youtube.com/embed/SFnMTHhKdkw",
    thumbnailUrl: "https://img.youtube.com/vi/SFnMTHhKdkw/mqdefault.jpg",
    durationSec: 480,
    publishedAt: "2013-05-03",
    channelName: "TED",
    tags: [
      "mentorship",
      "guidance",
      "confidence",
      "motivation",
    ],
    signals: {
      humanLikely: true,
      verifiedSource: true,
      hasTranscript: true,
    },
  },
  {
    id: "av-cliatt-wayman-school",
    title: "How to fix a broken school? Lead fearlessly, love hard",
    description:
      "Linda Cliatt-Wayman on fearless leadership and the power of showing up for young people.",
    type: "story",
    source: "ted",
    embedUrl: "https://www.youtube.com/embed/Xe2nlti47kA",
    thumbnailUrl: "https://img.youtube.com/vi/Xe2nlti47kA/mqdefault.jpg",
    durationSec: 900,
    publishedAt: "2015-11-20",
    channelName: "TED",
    tags: [
      "mentorship",
      "resilience",
      "guidance",
      "motivation",
    ],
    signals: {
      humanLikely: true,
      verifiedSource: true,
      hasTranscript: true,
    },
  },

  // -------------------------------------------
  // Future of work & adaptability
  // -------------------------------------------
  {
    id: "av-grant-original-thinkers",
    title: "The surprising habits of original thinkers",
    description:
      "Adam Grant reveals how 'originals' champion new ideas — and how you can too.",
    type: "explainer",
    source: "ted",
    embedUrl: "https://www.youtube.com/embed/fxbCHn6gE3U",
    thumbnailUrl: "https://img.youtube.com/vi/fxbCHn6gE3U/mqdefault.jpg",
    durationSec: 900,
    publishedAt: "2016-04-26",
    channelName: "TED",
    tags: [
      "career_pathways",
      "growth_mindset",
      "motivation",
      "adaptability",
    ],
    signals: {
      humanLikely: true,
      verifiedSource: true,
      hasTranscript: true,
    },
  },
  {
    id: "av-khan-mastery",
    title: "Let's teach for mastery — not test scores",
    description:
      "Sal Khan argues for mastery-based learning where students build strong foundations before advancing.",
    type: "explainer",
    source: "ted",
    embedUrl: "https://www.youtube.com/embed/-MTRxRO5SRA",
    thumbnailUrl: "https://img.youtube.com/vi/-MTRxRO5SRA/mqdefault.jpg",
    durationSec: 660,
    publishedAt: "2015-11-18",
    channelName: "TED",
    tags: [
      "skills_gap",
      "growth_mindset",
      "adaptability",
      "guidance",
    ],
    signals: {
      humanLikely: true,
      verifiedSource: true,
      hasTranscript: true,
    },
  },

  // -------------------------------------------
  // Workplace exposure & job shadowing
  // -------------------------------------------
  {
    id: "av-rosen-25-careers",
    title: "How to find your passion and make it your job",
    description:
      "Emma Rosen tried 25 different careers before age 25 through short-term placements, shadowing, and just giving things a go.",
    type: "story",
    source: "ted",
    embedUrl: "https://www.youtube.com/embed/8Swu8iiuFx4",
    thumbnailUrl: "https://img.youtube.com/vi/8Swu8iiuFx4/mqdefault.jpg",
    durationSec: 720,
    publishedAt: "2018-03-08",
    channelName: "TEDx Talks",
    tags: [
      "job_shadowing",
      "workplace_exposure",
      "first_job",
      "career_pathways",
    ],
    signals: {
      humanLikely: true,
      verifiedSource: true,
      hasTranscript: true,
    },
  },
  {
    id: "av-shen-ability",
    title: "Looking for a job? Highlight your ability, not your experience",
    description:
      "Jason Shen argues employers should evaluate candidates on demonstrated ability and work samples, not resume credentials alone.",
    type: "explainer",
    source: "ted",
    embedUrl: "https://www.youtube.com/embed/guXxy8LH2QM",
    thumbnailUrl: "https://img.youtube.com/vi/guXxy8LH2QM/mqdefault.jpg",
    durationSec: 360,
    publishedAt: "2018-02-20",
    channelName: "TED",
    tags: [
      "employability",
      "first_job",
      "workplace_exposure",
      "skills_gap",
    ],
    signals: {
      humanLikely: true,
      verifiedSource: true,
      hasTranscript: true,
    },
  },
  {
    id: "av-hartley-scrapper",
    title: "Why the best hire might not have the perfect resume",
    description:
      "HR executive Regina Hartley explains why she always gives the scrapper — someone who has fought through adversity — a chance.",
    type: "story",
    source: "ted",
    embedUrl: "https://www.youtube.com/embed/jiDQDLnEXdA",
    thumbnailUrl: "https://img.youtube.com/vi/jiDQDLnEXdA/mqdefault.jpg",
    durationSec: 600,
    publishedAt: "2016-01-04",
    channelName: "TED",
    tags: [
      "first_job",
      "employability",
      "workplace_exposure",
      "resilience",
    ],
    signals: {
      humanLikely: true,
      verifiedSource: true,
      hasTranscript: true,
    },
  },
  {
    id: "av-epstein-range",
    title: "Why specializing early doesn't always mean career success",
    description:
      "David Epstein shows how a sampling period of trying different things leads to better long-term career fit.",
    type: "explainer",
    source: "ted",
    embedUrl: "https://www.youtube.com/embed/B6lBtiQZSho",
    thumbnailUrl: "https://img.youtube.com/vi/B6lBtiQZSho/mqdefault.jpg",
    durationSec: 750,
    publishedAt: "2020-09-01",
    channelName: "TED",
    tags: [
      "career_pathways",
      "workplace_exposure",
      "decision_making",
      "adaptability",
    ],
    signals: {
      humanLikely: true,
      verifiedSource: true,
      hasTranscript: true,
    },
  },

  // -------------------------------------------
  // Decision making & overcoming fear
  // -------------------------------------------
  {
    id: "av-trespicio-passion",
    title: "Stop searching for your passion",
    description:
      "Terri Trespicio argues that waiting to find your passion is paralyzing — take action first and let passion follow.",
    type: "story",
    source: "ted",
    embedUrl: "https://www.youtube.com/embed/6MBaFL7sCb8",
    thumbnailUrl: "https://img.youtube.com/vi/6MBaFL7sCb8/mqdefault.jpg",
    durationSec: 640,
    publishedAt: "2015-09-10",
    channelName: "TEDx Talks",
    tags: [
      "career_uncertainty",
      "identity",
      "overwhelm",
      "decision_making",
    ],
    signals: {
      humanLikely: true,
      verifiedSource: true,
      hasTranscript: true,
    },
  },
  {
    id: "av-chang-hard-choices",
    title: "How to make hard choices",
    description:
      "Philosopher Ruth Chang offers a framework for hard choices, arguing they are opportunities to commit to who we want to become.",
    type: "explainer",
    source: "ted",
    embedUrl: "https://www.youtube.com/embed/8GQZuzIdeQQ",
    thumbnailUrl: "https://img.youtube.com/vi/8GQZuzIdeQQ/mqdefault.jpg",
    durationSec: 867,
    publishedAt: "2014-06-06",
    channelName: "TED",
    tags: [
      "decision_making",
      "career_uncertainty",
      "identity",
      "career_pathways",
    ],
    signals: {
      humanLikely: true,
      verifiedSource: true,
      hasTranscript: true,
    },
  },
  {
    id: "av-jiang-rejection",
    title: "What I learned from 100 days of rejection",
    description:
      "Jia Jiang shares how intentionally seeking rejection for 100 days desensitized him to fear and opened unexpected doors.",
    type: "story",
    source: "ted",
    embedUrl: "https://www.youtube.com/embed/-vZXgApsPCQ",
    thumbnailUrl: "https://img.youtube.com/vi/-vZXgApsPCQ/mqdefault.jpg",
    durationSec: 900,
    publishedAt: "2017-01-17",
    channelName: "TED",
    tags: [
      "confidence",
      "decision_making",
      "overwhelm",
      "resilience",
    ],
    signals: {
      humanLikely: true,
      verifiedSource: true,
      hasTranscript: true,
    },
  },
  {
    id: "av-todd-career-advice",
    title: "To find work you love, don't follow your passion",
    description:
      "80,000 Hours co-founder Benjamin Todd argues that following your passion is poor career advice and offers evidence-based alternatives.",
    type: "explainer",
    source: "ted",
    embedUrl: "https://www.youtube.com/embed/MKlx1DLa9EA",
    thumbnailUrl: "https://img.youtube.com/vi/MKlx1DLa9EA/mqdefault.jpg",
    durationSec: 900,
    publishedAt: "2015-05-18",
    channelName: "TEDx Talks",
    tags: [
      "career_uncertainty",
      "decision_making",
      "career_pathways",
      "guidance",
    ],
    signals: {
      humanLikely: true,
      verifiedSource: true,
      hasTranscript: true,
    },
  },

  // -------------------------------------------
  // Life purpose & meaning
  // -------------------------------------------
  {
    id: "av-waldinger-good-life",
    title: "What makes a good life? Lessons from the longest study on happiness",
    description:
      "Harvard psychiatrist Robert Waldinger shares findings from a 75-year study revealing relationships are the strongest predictor of life satisfaction.",
    type: "explainer",
    source: "ted",
    embedUrl: "https://www.youtube.com/embed/8KkKuTCFvzI",
    thumbnailUrl: "https://img.youtube.com/vi/8KkKuTCFvzI/mqdefault.jpg",
    durationSec: 773,
    publishedAt: "2016-01-25",
    channelName: "TED",
    tags: [
      "career_pathways",
      "mentorship",
      "soft_skills",
      "networking",
    ],
    signals: {
      humanLikely: true,
      verifiedSource: true,
      hasTranscript: true,
    },
  },
  {
    id: "av-de-botton-success",
    title: "A kinder, gentler philosophy of success",
    description:
      "Philosopher Alain de Botton challenges conventional notions of success and urges viewers to define success on their own terms.",
    type: "story",
    source: "ted",
    embedUrl: "https://www.youtube.com/embed/MtSE4rglxbY",
    thumbnailUrl: "https://img.youtube.com/vi/MtSE4rglxbY/mqdefault.jpg",
    durationSec: 1020,
    publishedAt: "2009-10-05",
    channelName: "TED",
    tags: [
      "career_pathways",
      "identity",
      "career_uncertainty",
      "growth_mindset",
    ],
    signals: {
      humanLikely: true,
      verifiedSource: true,
      hasTranscript: true,
    },
  },
];

// ============================================
// POOL HELPERS
// ============================================

/**
 * Get all approved videos.
 */
export function getApprovedVideos(): VideoAsset[] {
  return APPROVED_VIDEOS;
}

/**
 * Get an approved video by ID.
 */
export function getApprovedVideo(videoId: string): VideoAsset | null {
  return APPROVED_VIDEOS.find((v) => v.id === videoId) ?? null;
}

/**
 * Get approved videos by type.
 */
export function getApprovedVideosByType(
  type: VideoAsset["type"],
): VideoAsset[] {
  return APPROVED_VIDEOS.filter((v) => v.type === type);
}
