/**
 * PODCAST DATA — CFYE "Future Economies Start with Youth"
 *
 * Static data for the Challenge Fund for Youth Employment podcast series.
 * 19 episodes hosted by Kevin Eustatia covering youth employment,
 * green jobs, digital skills, gender equity, and more.
 *
 * SOURCE: https://fundforyouthemployment.nl/podcast/
 * PROGRAMME: $171M, 7-year fund by Netherlands Ministry of Foreign Affairs
 * LAST UPDATED: February 2025
 */

// ============================================
// TYPES
// ============================================

export interface PodcastSeries {
  title: string;
  host: string;
  description: string;
  organisation: string;
  organisationFull: string;
  listenUrl: string;
  programmeUrl: string;
  thematicAreas: string[];
}

export interface PodcastEpisode {
  number: number;
  title: string;
  duration: string;
  date: string; // ISO date
  topics: string[];
  youthRelevance: string;
}

// ============================================
// SERIES DATA
// ============================================

export const CFYE_PODCAST: PodcastSeries = {
  title: "Future Economies Start with Youth",
  host: "Kevin Eustatia",
  description:
    "A podcast exploring how young people across Africa and the Middle East are building careers, launching businesses, and shaping the future of work — featuring voices from 14 countries.",
  organisation: "CFYE",
  organisationFull: "Challenge Fund for Youth Employment",
  listenUrl: "https://fundforyouthemployment.nl/podcast/",
  programmeUrl: "https://fundforyouthemployment.nl/",
  thematicAreas: [
    "Green jobs & climate",
    "Digital skills & tech",
    "Gender equity in employment",
    "Social enterprise",
    "Youth-led innovation",
    "Vocational training & upskilling",
  ],
};

// ============================================
// CURATED EPISODES
// ============================================

export const CFYE_EPISODES: PodcastEpisode[] = [
  {
    number: 19,
    title: "The Future of Green Jobs for Youth",
    duration: "32 min",
    date: "2024-11-15",
    topics: ["green jobs", "climate", "skills"],
    youthRelevance: "How the green transition is creating new entry-level opportunities for young people",
  },
  {
    number: 18,
    title: "Digital Skills That Actually Get You Hired",
    duration: "28 min",
    date: "2024-10-20",
    topics: ["digital skills", "employment", "training"],
    youthRelevance: "Practical digital skills employers are looking for — beyond just coding",
  },
  {
    number: 16,
    title: "Young Women Leading Change in the Workforce",
    duration: "35 min",
    date: "2024-08-12",
    topics: ["gender equity", "leadership", "employment"],
    youthRelevance: "How programmes are closing the gender gap in youth employment across Africa",
  },
  {
    number: 14,
    title: "From Training to Employment: What Actually Works",
    duration: "30 min",
    date: "2024-06-18",
    topics: ["training", "employment", "pathways"],
    youthRelevance: "Evidence on which training approaches lead to real jobs for young people",
  },
  {
    number: 12,
    title: "Youth Entrepreneurs Building Social Enterprises",
    duration: "33 min",
    date: "2024-04-22",
    topics: ["social enterprise", "entrepreneurship", "innovation"],
    youthRelevance: "Young founders solving community problems while building careers",
  },
  {
    number: 10,
    title: "Making Agriculture Attractive for Young People",
    duration: "29 min",
    date: "2024-02-15",
    topics: ["agriculture", "green jobs", "rural employment"],
    youthRelevance: "How agri-tech is transforming farming into a career young people want",
  },
  {
    number: 7,
    title: "Bridging the Skills Gap in East Africa",
    duration: "31 min",
    date: "2023-11-08",
    topics: ["skills gap", "East Africa", "vocational training"],
    youthRelevance: "What Kenya, Uganda, and Ethiopia are doing to match skills with employer needs",
  },
  {
    number: 4,
    title: "100,000 Jobs: Lessons from Scale",
    duration: "27 min",
    date: "2023-08-14",
    topics: ["programme impact", "scale", "employment"],
    youthRelevance: "What it takes to create 100K+ youth jobs across 11 countries",
  },
];

// ============================================
// HELPERS
// ============================================

/**
 * Get the most recent N episodes from the curated list.
 */
export function getRecentEpisodes(count: number = 5): PodcastEpisode[] {
  return CFYE_EPISODES.slice(0, count);
}
