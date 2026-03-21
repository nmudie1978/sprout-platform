/**
 * JOB MARKET STATS DATA — FULL STATS BANK
 *
 * Contains all curated stat cards with full provenance metadata.
 * The carousel shows 9 cards (3 pages × 3 cards) at a time.
 * "Give me more" rotates to the next batch from this bank.
 *
 * SOURCES: ILO, OECD, WEF, NAV, SSB, Eurostat, LinkedIn
 * DATASET VERSION: 2025-Q1-v2
 * REFRESH CADENCE: Quarterly review
 */

import type {
  StatDatum,
  StatProvenance,
  BarItem,
  BulletItem,
  DonutSegment,
  RadarAxis,
  RankingItem,
  IconGridItem,
  StackedSegment,
  IndustryInsightsBatch,
  RegionFilter,
} from "./stat-types";

// Re-export types so existing carousel imports still work
export type {
  BarItem,
  DonutSegment,
  RadarAxis,
  RankingItem,
  IconGridItem,
  StackedSegment,
} from "./stat-types";
export type { StatDatum as JobMarketStatCard } from "./stat-types";
export type { StatRenderType, StatRegion, RegionFilter } from "./stat-types";
// Keep legacy union export for BulletItem
export type { BulletItem } from "./stat-types";

// ============================================
// DATASET METADATA
// ============================================

export const DATASET_VERSION = "2025-Q1-v3";
export const DATASET_RETRIEVED_AT = "2025-02-13T00:00:00Z";

// ============================================
// PROVENANCE HELPERS
// ============================================

const iloOecd: StatProvenance = {
  sourceName: "International Labour Organization / OECD",
  sourceUrl: "https://ilostat.ilo.org/data/",
  reportTitle: "World Employment and Social Outlook: Trends 2025",
  publishedDate: "2025-01",
  retrievedAt: DATASET_RETRIEVED_AT,
  citation: "ILO/OECD, World Employment and Social Outlook: Trends 2025, January 2025.",
};

const wef: StatProvenance = {
  sourceName: "World Economic Forum",
  sourceUrl: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/",
  reportTitle: "The Future of Jobs Report 2025",
  publishedDate: "2025-01",
  retrievedAt: DATASET_RETRIEVED_AT,
  citation: "World Economic Forum, The Future of Jobs Report 2025, January 2025.",
};

const wefOecd: StatProvenance = {
  sourceName: "WEF / OECD",
  sourceUrl: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/",
  reportTitle: "Future of Jobs Report 2025 & OECD Employment Outlook",
  publishedDate: "2025-01",
  retrievedAt: DATASET_RETRIEVED_AT,
  citation: "WEF Future of Jobs Report 2025; OECD Employment Outlook 2024.",
};

const oecdLabour: StatProvenance = {
  sourceName: "OECD",
  sourceUrl: "https://www.oecd.org/employment/outlook/",
  reportTitle: "OECD Employment Outlook 2024",
  publishedDate: "2024-07",
  retrievedAt: DATASET_RETRIEVED_AT,
  citation: "OECD, Employment Outlook 2024, July 2024.",
};

const navSsb: StatProvenance = {
  sourceName: "NAV / Statistics Norway (SSB)",
  sourceUrl: "https://www.ssb.no/en/arbeid-og-lonn",
  reportTitle: "Labour Market Statistics — SSB & NAV Reports",
  publishedDate: "2024-Q4",
  retrievedAt: DATASET_RETRIEVED_AT,
  citation: "NAV & SSB, Labour Market Statistics, Q4 2024.",
};

const navSurveys: StatProvenance = {
  sourceName: "NAV / Employer Surveys",
  sourceUrl: "https://www.nav.no/no/nav-og-samfunn/kunnskap/arbeid-og-velferd",
  reportTitle: "NAV Employer Survey 2024",
  publishedDate: "2024-Q3",
  retrievedAt: DATASET_RETRIEVED_AT,
  citation: "NAV, Employer Survey Results, Q3 2024.",
};

const eurostat: StatProvenance = {
  sourceName: "Eurostat",
  sourceUrl: "https://ec.europa.eu/eurostat/web/labour-market",
  reportTitle: "Labour Force Survey 2024",
  publishedDate: "2024-Q4",
  retrievedAt: DATASET_RETRIEVED_AT,
  citation: "Eurostat, Labour Force Survey, Q4 2024.",
};

const linkedinEconomic: StatProvenance = {
  sourceName: "LinkedIn Economic Graph",
  sourceUrl: "https://economicgraph.linkedin.com/",
  reportTitle: "Global Talent Trends 2025",
  publishedDate: "2025-01",
  retrievedAt: DATASET_RETRIEVED_AT,
  citation: "LinkedIn Economic Graph, Global Talent Trends, January 2025.",
};

const cfyePalladium: StatProvenance = {
  sourceName: "CFYE / Netherlands MFA",
  sourceUrl: "https://fundforyouthemployment.nl/",
  reportTitle: "Challenge Fund for Youth Employment — Programme Report 2024",
  publishedDate: "2024-11",
  retrievedAt: "2025-02-10T00:00:00Z",
  citation: "CFYE / Palladium, Challenge Fund for Youth Employment Programme Report, November 2024.",
};

const mckinsey: StatProvenance = {
  sourceName: "McKinsey Global Institute",
  sourceUrl: "https://www.mckinsey.com/mgi/our-research/a-new-future-of-work-the-race-to-deploy-ai-and-raise-skills-in-europe-and-beyond",
  reportTitle: "A New Future of Work: The Race to Deploy AI and Raise Skills",
  publishedDate: "2024-05",
  retrievedAt: DATASET_RETRIEVED_AT,
  citation: "McKinsey Global Institute, A New Future of Work, May 2024.",
};

const deloitte: StatProvenance = {
  sourceName: "Deloitte",
  sourceUrl: "https://www.deloitte.com/global/en/issues/work/content/genz-millennialsurvey.html",
  reportTitle: "2024 Gen Z and Millennial Survey",
  publishedDate: "2024-05",
  retrievedAt: DATASET_RETRIEVED_AT,
  citation: "Deloitte, 2024 Gen Z and Millennial Survey, May 2024.",
};

const manpower: StatProvenance = {
  sourceName: "ManpowerGroup",
  sourceUrl: "https://go.manpowergroup.com/talent-shortage",
  reportTitle: "Talent Shortage Survey 2024",
  publishedDate: "2024-Q1",
  retrievedAt: DATASET_RETRIEVED_AT,
  citation: "ManpowerGroup, Talent Shortage Survey 2024, Q1 2024.",
};

const lightcast: StatProvenance = {
  sourceName: "Lightcast (formerly Burning Glass)",
  sourceUrl: "https://lightcast.io/resources/research",
  reportTitle: "Skills-Based Hiring & AI Skills Outlook 2024",
  publishedDate: "2024-10",
  retrievedAt: DATASET_RETRIEVED_AT,
  citation: "Lightcast, Skills-Based Hiring & AI Skills Outlook, October 2024.",
};

const githubStackoverflow: StatProvenance = {
  sourceName: "GitHub / Stack Overflow",
  sourceUrl: "https://octoverse.github.com/",
  reportTitle: "GitHub Octoverse 2024 & Stack Overflow Developer Survey 2024",
  publishedDate: "2024-10",
  retrievedAt: DATASET_RETRIEVED_AT,
  citation: "GitHub Octoverse 2024; Stack Overflow Developer Survey 2024.",
};

const nhoKompetanse: StatProvenance = {
  sourceName: "NHO / NIFU",
  sourceUrl: "https://www.nho.no/tema/kompetanse/",
  reportTitle: "NHO Kompetansebarometer 2024",
  publishedDate: "2024-Q4",
  retrievedAt: DATASET_RETRIEVED_AT,
  citation: "NHO/NIFU, Kompetansebarometer 2024, Q4 2024.",
};

const unicefIlo: StatProvenance = {
  sourceName: "UNICEF / ILO",
  sourceUrl: "https://data.unicef.org/resources/child-labour-global-estimates-2024/",
  reportTitle: "Global Estimates of Child Labour 2024",
  publishedDate: "2024-06",
  retrievedAt: DATASET_RETRIEVED_AT,
  citation: "UNICEF/ILO, Global Estimates of Child Labour, 2024.",
};

const worldBank: StatProvenance = {
  sourceName: "World Bank",
  sourceUrl: "https://www.worldbank.org/en/topic/jobsandgrowth/overview",
  reportTitle: "Jobs and Development Overview 2024",
  publishedDate: "2024-06",
  retrievedAt: DATASET_RETRIEVED_AT,
  citation: "World Bank, Jobs and Development Overview, 2024.",
};

const euDesi: StatProvenance = {
  sourceName: "European Commission",
  sourceUrl: "https://digital-strategy.ec.europa.eu/en/policies/desi",
  reportTitle: "Digital Economy and Society Index (DESI) 2024",
  publishedDate: "2024-07",
  retrievedAt: DATASET_RETRIEVED_AT,
  citation: "European Commission, DESI 2024, July 2024.",
};

// ============================================
// BATCH 1 — DEFAULT (9 cards, 3 pages)
// ============================================

const card1_wherePeopleWork: StatDatum = {
  id: "global-employment-sectors",
  region: "global",
  title: "Where most people work",
  subtitle: "Global employment by industry",
  renderType: "barList",
  items: [
    { label: "Retail & Services", value: 28, color: "bg-blue-500" },
    { label: "Healthcare", value: 15, color: "bg-rose-500" },
    { label: "Manufacturing", value: 14, color: "bg-amber-500" },
    { label: "Education", value: 10, color: "bg-purple-500" },
    { label: "Construction & Trades", value: 9, color: "bg-orange-500" },
    { label: "Tech & Digital", value: 6, color: "bg-cyan-500" },
  ] as BarItem[],
  realitySignal: "Most industries have roles at every level — there's no single 'right' sector to aim for.",
  gradientColors: "from-slate-400 via-slate-500 to-slate-400",
  iconColor: "text-muted-foreground",
  provenance: iloOecd,
};

const card2_growingIndustries: StatDatum = {
  id: "growing-industries",
  region: "global",
  title: "Which industries are growing",
  subtitle: "Projected growth (2025-2030)",
  renderType: "barList",
  items: [
    { label: "Technology & Data", value: 22, color: "bg-cyan-500" },
    { label: "Care & Wellness", value: 18, color: "bg-rose-500" },
    { label: "Green & Energy", value: 15, color: "bg-emerald-500" },
    { label: "Education & Training", value: 10, color: "bg-purple-500" },
    { label: "Logistics & Supply", value: 8, color: "bg-amber-500" },
    { label: "Creative & Media", value: 5, color: "bg-pink-500" },
  ] as BarItem[],
  realitySignal: "Growth projections shift constantly — curiosity matters more than picking the 'right' field.",
  gradientColors: "from-emerald-400 via-emerald-500 to-teal-500",
  iconColor: "text-emerald-600",
  provenance: wef,
};

const card3_reshapingJobs: StatDatum = {
  id: "reshaping-jobs",
  region: "global",
  title: "What's reshaping jobs",
  subtitle: "Forces shaping the future of work",
  renderType: "donut",
  value: "~40%",
  valueContext: "of tasks changing by 2030",
  items: [
    { label: "Changing tasks", value: 40, color: "#f59e0b" },
    { label: "Stable tasks", value: 60, color: "#93b0c8" },
  ] as DonutSegment[],
  realitySignal: "These shifts happen gradually — most roles evolve rather than disappear overnight.",
  gradientColors: "from-slate-400 via-amber-400 to-slate-400",
  iconColor: "text-amber-600",
  provenance: wef,
};

const card4_fastestGrowingRoles: StatDatum = {
  id: "fastest-growing-roles",
  region: "global",
  title: "Fastest-growing roles (global)",
  subtitle: "Roles with strong projected demand",
  renderType: "rankingBars",
  items: [
    { rank: 1, label: "AI & ML Specialists", trend: "up" as const, color: "bg-cyan-500" },
    { rank: 2, label: "Data Analysts", trend: "up" as const, color: "bg-blue-500" },
    { rank: 3, label: "Cybersecurity Pros", trend: "up" as const, color: "bg-indigo-500" },
    { rank: 4, label: "Energy Technicians", trend: "up" as const, color: "bg-emerald-500" },
    { rank: 5, label: "Healthcare Workers", trend: "stable" as const, color: "bg-rose-500" },
  ] as RankingItem[],
  note: "Varies by country and sector.",
  realitySignal: "You don't need to pick one of these — most people find their path gradually.",
  gradientColors: "from-cyan-400 via-blue-500 to-cyan-400",
  iconColor: "text-blue-600",
  provenance: wefOecd,
};

const card5_inDemandSkills: StatDatum = {
  id: "in-demand-skills",
  region: "global",
  title: "Most in-demand skills (global)",
  subtitle: "Skills employers are looking for",
  renderType: "radar",
  items: [
    { label: "Analytical", value: 95, color: "#8b5cf6" },
    { label: "AI/Data", value: 90, color: "#8b5cf6" },
    { label: "Communication", value: 85, color: "#8b5cf6" },
    { label: "Creativity", value: 80, color: "#8b5cf6" },
    { label: "Adaptability", value: 88, color: "#8b5cf6" },
  ] as RadarAxis[],
  realitySignal: "These skills develop over time through experience — not all at once.",
  gradientColors: "from-purple-400 via-purple-500 to-indigo-500",
  iconColor: "text-purple-600",
  provenance: wef,
};

const card6_remoteHybrid: StatDatum = {
  id: "remote-hybrid-snapshot",
  region: "global",
  title: "Remote & hybrid snapshot (global)",
  subtitle: "How work location is evolving",
  renderType: "stackedBar",
  value: "Work Location Mix",
  valueContext: "By industry sector",
  items: [
    { label: "On-site", value: 55, color: "#7ba3bf" },
    { label: "Hybrid", value: 30, color: "#14b8a6" },
    { label: "Remote", value: 15, color: "#0d9488" },
  ] as StackedSegment[],
  note: "Tech & finance: more remote. Trades & care: mostly on-site.",
  realitySignal: "Your ideal work setup may change over time — there's no single 'correct' arrangement.",
  gradientColors: "from-teal-400 via-teal-500 to-emerald-400",
  iconColor: "text-teal-600",
  provenance: oecdLabour,
};

const card7_norwayRoles: StatDatum = {
  id: "norway-steady-demand",
  region: "norway",
  title: "Norway: roles with steady demand",
  subtitle: "Occupations commonly sought by employers",
  renderType: "rankingBars",
  items: [
    { rank: 1, label: "Healthcare/Nurses", trend: "up" as const, color: "bg-rose-500" },
    { rank: 2, label: "Skilled Trades", trend: "stable" as const, color: "bg-amber-500" },
    { rank: 3, label: "Teachers", trend: "stable" as const, color: "bg-purple-500" },
    { rank: 4, label: "IT/Developers", trend: "up" as const, color: "bg-cyan-500" },
    { rank: 5, label: "Maritime/Offshore", trend: "stable" as const, color: "bg-blue-500" },
  ] as RankingItem[],
  note: "Demand can vary by region within Norway.",
  realitySignal: "Demand lists change often — what matters is finding something you're willing to grow into.",
  gradientColors: "from-red-400 via-red-500 to-blue-500",
  iconColor: "text-red-600",
  provenance: navSsb,
};

const card8_norwaySkills: StatDatum = {
  id: "norway-employer-values",
  region: "norway",
  title: "Norway: what employers value",
  subtitle: "Qualities often sought in job seekers",
  renderType: "radar",
  items: [
    { label: "Reliability", value: 95, color: "#3b82f6" },
    { label: "Teamwork", value: 90, color: "#3b82f6" },
    { label: "Language", value: 85, color: "#3b82f6" },
    { label: "Digital Skills", value: 80, color: "#3b82f6" },
    { label: "Safety", value: 88, color: "#3b82f6" },
  ] as RadarAxis[],
  note: "Expectations differ across sectors.",
  realitySignal: "Nobody ticks every box — employers value genuine effort and willingness to learn.",
  gradientColors: "from-blue-400 via-blue-500 to-indigo-500",
  iconColor: "text-blue-600",
  provenance: navSurveys,
};

const card9_norwayPathways: StatDatum = {
  id: "norway-youth-pathways",
  region: "norway",
  title: "Norway: youth-friendly pathways",
  subtitle: "Entry points for young people",
  renderType: "iconGrid",
  items: [
    { icon: "🔧", label: "Apprenticeships", sublabel: "Fagbrev trades" },
    { icon: "🎓", label: "Vocational", sublabel: "Yrkesfag programs" },
    { icon: "⏰", label: "Part-time", sublabel: "Student jobs" },
    { icon: "☀️", label: "Summer Jobs", sublabel: "Seasonal work" },
    { icon: "🧭", label: "NAV Services", sublabel: "Job guidance" },
  ] as IconGridItem[],
  note: "Rules and availability vary by municipality and age.",
  realitySignal: "Starting with any of these is a valid first step — you can always change direction later.",
  gradientColors: "from-green-400 via-emerald-500 to-teal-500",
  iconColor: "text-emerald-600",
  provenance: navSsb,
};

// ============================================
// BATCH 2 — EXTRA GLOBAL (9 cards)
// ============================================

const card10_youthUnemployment: StatDatum = {
  id: "global-youth-unemployment",
  region: "global",
  title: "Youth unemployment worldwide",
  subtitle: "Ages 15-24 out of work",
  renderType: "donut",
  value: "~13%",
  valueContext: "global youth unemployment rate",
  items: [
    { label: "Unemployed youth", value: 13, color: "#ef4444" },
    { label: "Employed / in education", value: 87, color: "#93b0c8" },
  ] as DonutSegment[],
  realitySignal: "This is a global average — your local situation may be quite different.",
  gradientColors: "from-rose-400 via-rose-500 to-red-500",
  iconColor: "text-rose-600",
  provenance: iloOecd,
};

const card11_greenJobs: StatDatum = {
  id: "green-economy-jobs",
  region: "global",
  title: "Green economy job growth",
  subtitle: "New roles from the climate transition",
  renderType: "barList",
  items: [
    { label: "Renewable Energy", value: 25, color: "bg-emerald-500" },
    { label: "Energy Efficiency", value: 18, color: "bg-green-500" },
    { label: "Sustainable Transport", value: 14, color: "bg-teal-500" },
    { label: "Circular Economy", value: 11, color: "bg-lime-500" },
    { label: "Climate Adaptation", value: 8, color: "bg-cyan-500" },
  ] as BarItem[],
  gradientColors: "from-emerald-400 via-green-500 to-lime-400",
  iconColor: "text-emerald-600",
  provenance: {
    ...wef,
    reportTitle: "The Future of Jobs Report 2025 — Green Economy Chapter",
    citation: "World Economic Forum, Future of Jobs Report 2025, Green Transition section.",
  },
};

const card12_aiImpact: StatDatum = {
  id: "ai-impact-roles",
  region: "global",
  title: "AI's impact on different roles",
  subtitle: "How AI changes work across sectors",
  renderType: "stackedBar",
  value: "AI Exposure",
  valueContext: "Share of tasks affected",
  items: [
    { label: "Enhanced by AI", value: 45, color: "#8b5cf6" },
    { label: "Partially automated", value: 30, color: "#f59e0b" },
    { label: "Minimal change", value: 25, color: "#93b0c8" },
  ] as StackedSegment[],
  note: "AI mostly augments rather than replaces — especially for creative and social tasks.",
  realitySignal: "Most jobs will change, not vanish — adapting is normal.",
  gradientColors: "from-purple-400 via-violet-500 to-purple-400",
  iconColor: "text-purple-600",
  provenance: wef,
};

const card13_freelanceGig: StatDatum = {
  id: "freelance-gig-economy",
  region: "global",
  title: "Freelance & gig work trends",
  subtitle: "Independent work is growing",
  renderType: "donut",
  value: "~36%",
  valueContext: "of workers have done freelance work",
  items: [
    { label: "Freelance/Gig", value: 36, color: "#f97316" },
    { label: "Traditional", value: 64, color: "#93b0c8" },
  ] as DonutSegment[],
  gradientColors: "from-orange-400 via-amber-500 to-orange-400",
  iconColor: "text-orange-600",
  provenance: oecdLabour,
};

const card14_decliningRoles: StatDatum = {
  id: "declining-roles",
  region: "global",
  title: "Roles expected to decline",
  subtitle: "Automation & efficiency changes",
  renderType: "rankingBars",
  items: [
    { rank: 1, label: "Data Entry Clerks", trend: "down" as const, color: "bg-red-400" },
    { rank: 2, label: "Admin Assistants", trend: "down" as const, color: "bg-red-400" },
    { rank: 3, label: "Bank Tellers", trend: "down" as const, color: "bg-orange-400" },
    { rank: 4, label: "Cashiers", trend: "down" as const, color: "bg-orange-400" },
    { rank: 5, label: "Print Workers", trend: "down" as const, color: "bg-amber-400" },
  ] as RankingItem[],
  note: "Declining doesn't mean disappearing — tasks shift, new roles emerge.",
  realitySignal: "These roles are changing, not gone — people working in them still have options.",
  gradientColors: "from-red-400 via-orange-400 to-amber-400",
  iconColor: "text-red-500",
  provenance: wef,
};

const card15_softSkillsPremium: StatDatum = {
  id: "soft-skills-premium",
  region: "global",
  title: "The soft skills premium",
  subtitle: "Human skills that AI can't easily replace",
  renderType: "radar",
  items: [
    { label: "Leadership", value: 92, color: "#ec4899" },
    { label: "Empathy", value: 88, color: "#ec4899" },
    { label: "Negotiation", value: 85, color: "#ec4899" },
    { label: "Creativity", value: 90, color: "#ec4899" },
    { label: "Critical Thinking", value: 94, color: "#ec4899" },
  ] as RadarAxis[],
  gradientColors: "from-pink-400 via-rose-500 to-pink-400",
  iconColor: "text-pink-600",
  provenance: linkedinEconomic,
};

const card16_educationVsExperience: StatDatum = {
  id: "education-vs-experience",
  region: "global",
  title: "Education vs experience debate",
  subtitle: "What employers actually look at",
  renderType: "stackedBar",
  value: "Hiring Factors",
  valueContext: "What matters most",
  items: [
    { label: "Skills & Portfolio", value: 40, color: "#8b5cf6" },
    { label: "Experience", value: 35, color: "#3b82f6" },
    { label: "Formal Education", value: 25, color: "#7ba3bf" },
  ] as StackedSegment[],
  note: "Trend toward skills-based hiring is accelerating globally.",
  realitySignal: "What you can do matters more than what's on your diploma.",
  gradientColors: "from-violet-400 via-blue-500 to-slate-400",
  iconColor: "text-violet-600",
  provenance: linkedinEconomic,
};

const card17_norwayGreenShift: StatDatum = {
  id: "norway-green-transition",
  region: "norway",
  title: "Norway: green transition jobs",
  subtitle: "Emerging roles in sustainability",
  renderType: "barList",
  items: [
    { label: "Wind Energy Tech", value: 20, color: "bg-emerald-500" },
    { label: "EV Infrastructure", value: 18, color: "bg-teal-500" },
    { label: "Hydrogen Tech", value: 12, color: "bg-cyan-500" },
    { label: "Carbon Capture", value: 10, color: "bg-sky-500" },
    { label: "Sustainable Fish", value: 8, color: "bg-blue-500" },
  ] as BarItem[],
  gradientColors: "from-emerald-400 via-teal-500 to-cyan-400",
  iconColor: "text-emerald-600",
  provenance: navSsb,
};

const card18_norwayYouthActivity: StatDatum = {
  id: "norway-youth-activity",
  region: "norway",
  title: "Norway: youth in work or education",
  subtitle: "Activity status of 15-29 year olds",
  renderType: "donut",
  value: "91%",
  valueContext: "in work or education",
  items: [
    { label: "Active (work/study)", value: 91, color: "#22c55e" },
    { label: "Not in employment, education or training", value: 9, color: "#93b0c8" },
  ] as DonutSegment[],
  gradientColors: "from-green-400 via-emerald-500 to-green-400",
  iconColor: "text-green-600",
  provenance: navSsb,
};

// ============================================
// BATCH 3 — MORE VARIETY (9 cards)
// ============================================

const card19_genderGap: StatDatum = {
  id: "global-gender-work-gap",
  region: "global",
  title: "Gender gap in the workforce",
  subtitle: "Global labour force participation",
  renderType: "stackedBar",
  value: "Participation Gap",
  valueContext: "Female vs Male",
  items: [
    { label: "Male", value: 72, color: "#3b82f6" },
    { label: "Female", value: 47, color: "#ec4899" },
  ] as StackedSegment[],
  note: "Gap is closing but still significant in many regions.",
  gradientColors: "from-blue-400 via-purple-400 to-pink-400",
  iconColor: "text-purple-600",
  provenance: iloOecd,
};

const card20_apprenticeshipGrowth: StatDatum = {
  id: "global-apprenticeship-growth",
  region: "global",
  title: "Apprenticeship programmes growing",
  subtitle: "Countries investing in learn-and-earn",
  renderType: "barList",
  items: [
    { label: "Germany", value: 30, color: "bg-blue-500" },
    { label: "Switzerland", value: 25, color: "bg-red-500" },
    { label: "UK", value: 20, color: "bg-indigo-500" },
    { label: "Australia", value: 15, color: "bg-amber-500" },
    { label: "Norway", value: 12, color: "bg-teal-500" },
  ] as BarItem[],
  note: "Share of youth (16-24) in apprenticeship-style programmes.",
  gradientColors: "from-blue-400 via-indigo-500 to-blue-400",
  iconColor: "text-blue-600",
  provenance: oecdLabour,
};

const card21_digitalSkillsGap: StatDatum = {
  id: "digital-skills-gap",
  region: "global",
  title: "The digital skills gap",
  subtitle: "Demand vs supply for digital skills",
  renderType: "donut",
  value: "~60%",
  valueContext: "of companies report digital skills shortages",
  items: [
    { label: "Skills shortage", value: 60, color: "#f59e0b" },
    { label: "Adequately skilled", value: 40, color: "#93b0c8" },
  ] as DonutSegment[],
  realitySignal: "Companies are investing heavily in training — you don't need to know everything upfront.",
  gradientColors: "from-amber-400 via-yellow-500 to-amber-400",
  iconColor: "text-amber-600",
  provenance: wef,
};

const card22_entryLevelBarriers: StatDatum = {
  id: "entry-level-barriers",
  region: "global",
  title: "Barriers to entry-level jobs",
  subtitle: "What young people say holds them back",
  renderType: "rankingBars",
  items: [
    { rank: 1, label: "Lack of experience", trend: "stable" as const, color: "bg-rose-500" },
    { rank: 2, label: "No professional network", trend: "up" as const, color: "bg-orange-500" },
    { rank: 3, label: "Skills mismatch", trend: "up" as const, color: "bg-amber-500" },
    { rank: 4, label: "Geographic limits", trend: "stable" as const, color: "bg-blue-500" },
    { rank: 5, label: "Cost of education", trend: "up" as const, color: "bg-purple-500" },
  ] as RankingItem[],
  realitySignal: "These barriers are common — almost everyone starting out faces some of them.",
  gradientColors: "from-rose-400 via-orange-400 to-amber-400",
  iconColor: "text-rose-500",
  provenance: eurostat,
};

const card23_sectorSalaries: StatDatum = {
  id: "sector-salary-ranges",
  region: "global",
  title: "Starting salaries by sector",
  subtitle: "Typical entry-level ranges (indexed)",
  renderType: "barList",
  items: [
    { label: "Tech & Software", value: 90, color: "bg-cyan-500" },
    { label: "Finance", value: 85, color: "bg-blue-500" },
    { label: "Engineering", value: 75, color: "bg-amber-500" },
    { label: "Healthcare", value: 65, color: "bg-rose-500" },
    { label: "Education", value: 50, color: "bg-purple-500" },
    { label: "Hospitality", value: 40, color: "bg-orange-500" },
  ] as BarItem[],
  note: "Indexed scale. Actual pay varies hugely by country.",
  gradientColors: "from-cyan-400 via-blue-500 to-indigo-400",
  iconColor: "text-cyan-600",
  provenance: oecdLabour,
};

const card24_futureProofSkills: StatDatum = {
  id: "future-proof-skills",
  region: "global",
  title: "Future-proof skill areas",
  subtitle: "Skills with lasting demand across sectors",
  renderType: "iconGrid",
  items: [
    { icon: "🧠", label: "Critical Thinking", sublabel: "Reasoning & logic" },
    { icon: "🤝", label: "Collaboration", sublabel: "Team & cross-culture" },
    { icon: "📊", label: "Data Literacy", sublabel: "Understanding data" },
    { icon: "💡", label: "Creativity", sublabel: "Innovation & ideas" },
    { icon: "🔄", label: "Adaptability", sublabel: "Learning to learn" },
  ] as IconGridItem[],
  gradientColors: "from-violet-400 via-purple-500 to-pink-400",
  iconColor: "text-violet-600",
  provenance: wef,
};

const card25_norwayDigitalisation: StatDatum = {
  id: "norway-digitalisation",
  region: "norway",
  title: "Norway: digitalisation at work",
  subtitle: "How digital tools are changing jobs",
  renderType: "radar",
  items: [
    { label: "Cloud tools", value: 90, color: "#06b6d4" },
    { label: "AI adoption", value: 65, color: "#06b6d4" },
    { label: "Automation", value: 70, color: "#06b6d4" },
    { label: "Remote collab", value: 85, color: "#06b6d4" },
    { label: "Cyber awareness", value: 78, color: "#06b6d4" },
  ] as RadarAxis[],
  gradientColors: "from-cyan-400 via-sky-500 to-cyan-400",
  iconColor: "text-cyan-600",
  provenance: navSurveys,
};

const card26_norwaySectorGrowth: StatDatum = {
  id: "norway-sector-growth",
  region: "norway",
  title: "Norway: growing sectors",
  subtitle: "Industries adding the most jobs",
  renderType: "barList",
  items: [
    { label: "Health & Care", value: 22, color: "bg-rose-500" },
    { label: "Tech & IT", value: 18, color: "bg-cyan-500" },
    { label: "Construction", value: 14, color: "bg-amber-500" },
    { label: "Green Energy", value: 12, color: "bg-emerald-500" },
    { label: "Education", value: 10, color: "bg-purple-500" },
  ] as BarItem[],
  gradientColors: "from-rose-400 via-cyan-400 to-emerald-400",
  iconColor: "text-rose-600",
  provenance: navSsb,
};

const card27_norwayWorkCulture: StatDatum = {
  id: "norway-work-culture",
  region: "norway",
  title: "Norway: work culture snapshot",
  subtitle: "What makes Norwegian workplaces different",
  renderType: "iconGrid",
  items: [
    { icon: "⏰", label: "37.5h Week", sublabel: "Standard hours" },
    { icon: "🏖️", label: "5 Weeks Leave", sublabel: "Minimum holiday" },
    { icon: "🤝", label: "Flat Structure", sublabel: "Low hierarchy" },
    { icon: "🏡", label: "Flexibility", sublabel: "Hybrid common" },
    { icon: "📋", label: "Unions Strong", sublabel: "Worker rights" },
  ] as IconGridItem[],
  note: "Norwegian work culture is known for work-life balance.",
  gradientColors: "from-blue-400 via-indigo-500 to-blue-400",
  iconColor: "text-blue-600",
  provenance: navSurveys,
};

// ============================================
// BATCH 4 — DEEPER THEMES (9 cards)
// ============================================

const card28_youthEntrepreneurship: StatDatum = {
  id: "global-youth-entrepreneurship",
  region: "global",
  title: "Youth entrepreneurship rising",
  subtitle: "Young founders are starting earlier",
  renderType: "donut",
  value: "~15%",
  valueContext: "of 18-24s have started a venture",
  items: [
    { label: "Started a venture", value: 15, color: "#f97316" },
    { label: "Traditional path", value: 85, color: "#93b0c8" },
  ] as DonutSegment[],
  note: "Includes side projects, micro-businesses, and freelance ventures.",
  gradientColors: "from-orange-400 via-amber-500 to-orange-400",
  iconColor: "text-orange-600",
  provenance: oecdLabour,
};

const card29_mentalHealthWork: StatDatum = {
  id: "global-mental-health-work",
  region: "global",
  title: "Mental health & work",
  subtitle: "Wellbeing is now a workplace priority",
  renderType: "barList",
  items: [
    { label: "Burnout concerns", value: 44, color: "bg-rose-500" },
    { label: "Want mental health support", value: 76, color: "bg-purple-500" },
    { label: "Offer flexible schedules", value: 58, color: "bg-teal-500" },
    { label: "Have wellbeing programs", value: 42, color: "bg-blue-500" },
  ] as BarItem[],
  note: "% of employees/employers in OECD countries.",
  gradientColors: "from-rose-400 via-purple-400 to-teal-400",
  iconColor: "text-purple-600",
  provenance: oecdLabour,
};

const card30_diversityImpact: StatDatum = {
  id: "global-diversity-impact",
  region: "global",
  title: "Diversity drives performance",
  subtitle: "Inclusive teams outperform",
  renderType: "rankingBars",
  items: [
    { rank: 1, label: "Gender-diverse firms", trend: "up" as const, color: "bg-pink-500" },
    { rank: 2, label: "Ethnic-diverse firms", trend: "up" as const, color: "bg-indigo-500" },
    { rank: 3, label: "Age-diverse teams", trend: "stable" as const, color: "bg-amber-500" },
    { rank: 4, label: "Neuro-diverse teams", trend: "up" as const, color: "bg-cyan-500" },
  ] as RankingItem[],
  note: "Ranked by correlation with above-average profitability.",
  gradientColors: "from-pink-400 via-indigo-400 to-cyan-400",
  iconColor: "text-indigo-600",
  provenance: linkedinEconomic,
};

const card31_automationTimeline: StatDatum = {
  id: "global-automation-timeline",
  region: "global",
  title: "What gets automated first",
  subtitle: "Tasks most exposed to automation",
  renderType: "barList",
  items: [
    { label: "Data processing", value: 65, color: "bg-red-400" },
    { label: "Routine admin", value: 55, color: "bg-orange-400" },
    { label: "Basic analysis", value: 40, color: "bg-amber-400" },
    { label: "Customer queries", value: 35, color: "bg-yellow-400" },
    { label: "Creative work", value: 10, color: "bg-emerald-400" },
  ] as BarItem[],
  note: "% of task hours that could be automated by 2030.",
  gradientColors: "from-red-400 via-amber-400 to-emerald-400",
  iconColor: "text-amber-600",
  provenance: wef,
};

const card32_talentMobility: StatDatum = {
  id: "global-talent-mobility",
  region: "global",
  title: "Global talent mobility",
  subtitle: "Workers are more willing to relocate",
  renderType: "donut",
  value: "64%",
  valueContext: "would move for the right role",
  items: [
    { label: "Open to relocation", value: 64, color: "#3b82f6" },
    { label: "Prefer to stay local", value: 36, color: "#93b0c8" },
  ] as DonutSegment[],
  gradientColors: "from-blue-400 via-sky-500 to-blue-400",
  iconColor: "text-blue-600",
  provenance: linkedinEconomic,
};

const card33_creativeEconomy: StatDatum = {
  id: "global-creative-economy",
  region: "global",
  title: "Creative economy growth",
  subtitle: "Content, design & media expanding",
  renderType: "barList",
  items: [
    { label: "Digital Content", value: 28, color: "bg-pink-500" },
    { label: "UX / UI Design", value: 22, color: "bg-purple-500" },
    { label: "Video & Film", value: 18, color: "bg-rose-500" },
    { label: "Gaming", value: 15, color: "bg-indigo-500" },
    { label: "Music & Audio", value: 10, color: "bg-violet-500" },
  ] as BarItem[],
  note: "Projected annual growth rate (%) 2025-2030.",
  gradientColors: "from-pink-400 via-purple-500 to-indigo-400",
  iconColor: "text-pink-600",
  provenance: wef,
};

const card34_norwayApprenticeships: StatDatum = {
  id: "norway-apprenticeship-completion",
  region: "norway",
  title: "Norway: apprenticeship outcomes",
  subtitle: "Fagbrev completion and employment",
  renderType: "stackedBar",
  value: "Apprenticeship Pipeline",
  valueContext: "Outcomes after 4 years",
  items: [
    { label: "Employed in field", value: 72, color: "#22c55e" },
    { label: "Further education", value: 15, color: "#8b5cf6" },
    { label: "Other employment", value: 10, color: "#7ba3bf" },
    { label: "Seeking work", value: 3, color: "#ef4444" },
  ] as StackedSegment[],
  note: "Norwegian apprenticeships have strong employment outcomes.",
  gradientColors: "from-green-400 via-emerald-500 to-teal-400",
  iconColor: "text-green-600",
  provenance: navSsb,
};

const card35_norwayGenderEquality: StatDatum = {
  id: "norway-gender-work-equality",
  region: "norway",
  title: "Norway: gender equality at work",
  subtitle: "One of the most equal labour markets",
  renderType: "radar",
  items: [
    { label: "Pay equity", value: 85, color: "#ec4899" },
    { label: "Board seats", value: 42, color: "#ec4899" },
    { label: "Parental leave", value: 95, color: "#ec4899" },
    { label: "STEM women", value: 35, color: "#ec4899" },
    { label: "Part-time balance", value: 70, color: "#ec4899" },
  ] as RadarAxis[],
  note: "Norway ranks top 5 globally for workplace gender equality.",
  gradientColors: "from-pink-400 via-rose-500 to-pink-400",
  iconColor: "text-pink-600",
  provenance: navSsb,
};

const card36_norwayTechStartups: StatDatum = {
  id: "norway-tech-startups",
  region: "norway",
  title: "Norway: startup ecosystem",
  subtitle: "Growing tech and innovation scene",
  renderType: "iconGrid",
  items: [
    { icon: "🚀", label: "3,200+ startups", sublabel: "Active in 2024" },
    { icon: "💰", label: "€2.1B invested", sublabel: "VC funding 2024" },
    { icon: "🌊", label: "Ocean Tech", sublabel: "Leading cluster" },
    { icon: "⚡", label: "Clean Energy", sublabel: "Top export sector" },
    { icon: "🏙️", label: "Oslo #1", sublabel: "Nordic startup hub" },
  ] as IconGridItem[],
  gradientColors: "from-cyan-400 via-blue-500 to-indigo-400",
  iconColor: "text-cyan-600",
  provenance: navSsb,
};

// ============================================
// BATCH 5 — EMERGING TRENDS (9 cards)
// ============================================

const card37_remoteProductivity: StatDatum = {
  id: "global-remote-productivity",
  region: "global",
  title: "Remote work productivity data",
  subtitle: "What the research actually shows",
  renderType: "stackedBar",
  value: "Productivity Impact",
  valueContext: "Remote vs office workers",
  items: [
    { label: "More productive", value: 35, color: "#22c55e" },
    { label: "About the same", value: 40, color: "#7ba3bf" },
    { label: "Less productive", value: 25, color: "#ef4444" },
  ] as StackedSegment[],
  note: "Depends heavily on role type, management style, and home setup.",
  gradientColors: "from-green-400 via-slate-400 to-red-400",
  iconColor: "text-slate-600",
  provenance: oecdLabour,
};

const card38_lifelongLearning: StatDatum = {
  id: "global-lifelong-learning",
  region: "global",
  title: "Lifelong learning participation",
  subtitle: "Adults in education or training",
  renderType: "barList",
  items: [
    { label: "Nordics", value: 34, color: "bg-blue-500" },
    { label: "Western Europe", value: 22, color: "bg-indigo-500" },
    { label: "North America", value: 18, color: "bg-purple-500" },
    { label: "East Asia", value: 15, color: "bg-amber-500" },
    { label: "Global average", value: 12, color: "bg-sky-400" },
  ] as BarItem[],
  note: "% of 25-64 year olds in formal or non-formal education.",
  gradientColors: "from-blue-400 via-indigo-500 to-purple-400",
  iconColor: "text-indigo-600",
  provenance: oecdLabour,
};

const card39_stemPipeline: StatDatum = {
  id: "global-stem-pipeline",
  region: "global",
  title: "STEM skills pipeline",
  subtitle: "Science, tech, engineering, maths demand",
  renderType: "donut",
  value: "2.4M",
  valueContext: "unfilled STEM roles globally",
  items: [
    { label: "Unfilled positions", value: 30, color: "#ef4444" },
    { label: "Filled positions", value: 70, color: "#22c55e" },
  ] as DonutSegment[],
  gradientColors: "from-red-400 via-amber-400 to-green-400",
  iconColor: "text-red-500",
  provenance: wef,
};

const card40_gigProtections: StatDatum = {
  id: "global-gig-protections",
  region: "global",
  title: "Gig worker protections",
  subtitle: "Regulation is catching up",
  renderType: "rankingBars",
  items: [
    { rank: 1, label: "EU Platform Directive", trend: "up" as const, color: "bg-blue-500" },
    { rank: 2, label: "Minimum pay standards", trend: "up" as const, color: "bg-emerald-500" },
    { rank: 3, label: "Sick leave access", trend: "up" as const, color: "bg-teal-500" },
    { rank: 4, label: "Pension contributions", trend: "stable" as const, color: "bg-amber-500" },
    { rank: 5, label: "Algorithmic transparency", trend: "up" as const, color: "bg-purple-500" },
  ] as RankingItem[],
  note: "Ranked by progress of implementation across OECD countries.",
  gradientColors: "from-blue-400 via-emerald-400 to-purple-400",
  iconColor: "text-blue-600",
  provenance: eurostat,
};

const card41_healthcareShortage: StatDatum = {
  id: "global-healthcare-shortage",
  region: "global",
  title: "Healthcare worker shortage",
  subtitle: "A global crisis in care staffing",
  renderType: "metric",
  value: "10M",
  valueContext: "projected health worker shortfall by 2030",
  items: [
    { text: "Nurses: largest single shortage" },
    { text: "Low-income countries most affected" },
    { text: "Ageing populations drive demand" },
    { text: "Mental health professionals critically low" },
  ] as BulletItem[],
  gradientColors: "from-rose-400 via-red-500 to-rose-400",
  iconColor: "text-rose-600",
  provenance: iloOecd,
};

const card42_industryFourPointZero: StatDatum = {
  id: "global-industry-4",
  region: "global",
  title: "Industry 4.0 transformation",
  subtitle: "Smart manufacturing reshaping factories",
  renderType: "iconGrid",
  items: [
    { icon: "🤖", label: "Robotics", sublabel: "+14% YoY adoption" },
    { icon: "📡", label: "IoT Sensors", sublabel: "72B devices by 2030" },
    { icon: "🖨️", label: "3D Printing", sublabel: "Production-grade now" },
    { icon: "👓", label: "AR/VR Training", sublabel: "40% faster learning" },
    { icon: "🔗", label: "Digital Twins", sublabel: "Simulating everything" },
  ] as IconGridItem[],
  gradientColors: "from-cyan-400 via-blue-500 to-indigo-400",
  iconColor: "text-cyan-600",
  provenance: wef,
};

const card43_norwayOilToGreen: StatDatum = {
  id: "norway-oil-green-transition",
  region: "norway",
  title: "Norway: oil to green pivot",
  subtitle: "Energy sector transformation",
  renderType: "stackedBar",
  value: "Energy Workforce",
  valueContext: "Projected shift by 2030",
  items: [
    { label: "Oil & Gas (traditional)", value: 45, color: "#7ba3bf" },
    { label: "Offshore Wind", value: 20, color: "#14b8a6" },
    { label: "Hydrogen / CCS", value: 15, color: "#06b6d4" },
    { label: "Battery / EV", value: 12, color: "#22c55e" },
    { label: "Other renewables", value: 8, color: "#84cc16" },
  ] as StackedSegment[],
  note: "Many existing oil workers have transferable skills for green energy.",
  gradientColors: "from-slate-400 via-teal-500 to-green-400",
  iconColor: "text-teal-600",
  provenance: navSsb,
};

const card44_norwayImmigrantLabour: StatDatum = {
  id: "norway-immigrant-labour",
  region: "norway",
  title: "Norway: immigrant employment",
  subtitle: "Integration into the labour market",
  renderType: "barList",
  items: [
    { label: "Nordic immigrants", value: 78, color: "bg-blue-500" },
    { label: "EU / EEA workers", value: 72, color: "bg-indigo-500" },
    { label: "Outside EU (>5 yrs)", value: 62, color: "bg-purple-500" },
    { label: "Recent arrivals (<3 yrs)", value: 45, color: "bg-amber-500" },
  ] as BarItem[],
  note: "Employment rate (%) by background. Intro programmes boost outcomes.",
  gradientColors: "from-blue-400 via-purple-500 to-amber-400",
  iconColor: "text-purple-600",
  provenance: navSsb,
};

const card45_norwayYouthEntrepreneurship: StatDatum = {
  id: "norway-youth-entrepreneurship",
  region: "norway",
  title: "Norway: young entrepreneurs",
  subtitle: "Student companies and early ventures",
  renderType: "metric",
  value: "28,000+",
  valueContext: "student-run companies via Ungt Entreprenorskap yearly",
  items: [
    { text: "Programmes from age 13 (Ungdomsbedrift)" },
    { text: "Studentbedrift in universities nationwide" },
    { text: "Norway ranks top 3 in youth enterprise education" },
    { text: "Innovation Norway funds under-30 founders" },
  ] as BulletItem[],
  gradientColors: "from-orange-400 via-amber-500 to-yellow-400",
  iconColor: "text-amber-600",
  provenance: navSsb,
};

// ============================================
// BATCH 6 — CFYE / GLOBAL YOUTH EMPLOYMENT (4 cards + 5 padding = 9)
// ============================================

const card46_cfyeProgrammeImpact: StatDatum = {
  id: "cfye-programme-impact",
  region: "global",
  title: "CFYE programme impact",
  subtitle: "Challenge Fund for Youth Employment",
  renderType: "metric",
  value: "100K+",
  valueContext: "jobs created, matched & improved",
  items: [
    { text: "72 initiatives across 11 countries" },
    { text: "$171M fund by Netherlands MFA" },
    { text: "7-year programme (2019-2026)" },
    { text: "Managed by Palladium & partners" },
  ] as BulletItem[],
  gradientColors: "from-emerald-400 via-teal-500 to-emerald-400",
  iconColor: "text-emerald-600",
  provenance: cfyePalladium,
};

const card47_youthUnemploymentAfricaMena: StatDatum = {
  id: "youth-unemployment-africa-mena",
  region: "global",
  title: "Youth unemployment: Africa & MENA",
  subtitle: "Regional rates for ages 15-24",
  renderType: "barList",
  items: [
    { label: "Sub-Saharan Africa", value: 83, color: "bg-red-500" },
    { label: "Kenya", value: 35, color: "bg-orange-500" },
    { label: "Arab States", value: 28, color: "bg-amber-500" },
    { label: "Burkina Faso", value: 25, color: "bg-yellow-500" },
  ] as BarItem[],
  note: "Sub-Saharan Africa figure: % of labour market entrants who may remain unemployed (Mo Ibrahim Foundation).",
  gradientColors: "from-red-400 via-orange-500 to-amber-400",
  iconColor: "text-red-600",
  provenance: cfyePalladium,
};

const card48_genderYouthEmployment: StatDatum = {
  id: "cfye-gender-youth-employment",
  region: "global",
  title: "Gender in youth employment",
  subtitle: "CFYE programme gender breakdown",
  renderType: "donut",
  value: "49%",
  valueContext: "of CFYE jobs went to young women",
  items: [
    { label: "Young women", value: 49, color: "#ec4899" },
    { label: "Young men", value: 51, color: "#3b82f6" },
  ] as DonutSegment[],
  note: "Near parity achieved through deliberate programme design.",
  gradientColors: "from-pink-400 via-rose-500 to-blue-400",
  iconColor: "text-pink-600",
  provenance: cfyePalladium,
};

const card49_greenDigitalPathways: StatDatum = {
  id: "cfye-green-digital-pathways",
  region: "global",
  title: "Green & digital youth pathways",
  subtitle: "CFYE thematic focus areas",
  renderType: "iconGrid",
  items: [
    { icon: "🌱", label: "Green Jobs", sublabel: "Climate & agriculture" },
    { icon: "💻", label: "Digital Skills", sublabel: "Tech & platforms" },
    { icon: "🏪", label: "Social Enterprise", sublabel: "Community impact" },
    { icon: "📚", label: "Upskilling", sublabel: "Vocational training" },
    { icon: "♀️", label: "Gender Equity", sublabel: "49% women reached" },
  ] as IconGridItem[],
  gradientColors: "from-emerald-400 via-teal-500 to-cyan-400",
  iconColor: "text-teal-600",
  provenance: cfyePalladium,
};

// ============================================
// BATCH 6 COMPLETION (cards 50-54)
// ============================================

const card50_skillsChanging2030: StatDatum = {
  id: "global-skills-changing-2030",
  region: "global",
  title: "Skills are changing fast",
  subtitle: "What you learn today may shift soon",
  renderType: "donut",
  value: "70%",
  valueContext: "of skills in most jobs will change by 2030",
  items: [
    { label: "Skills changing", value: 70, color: "#f59e0b" },
    { label: "Stable skills", value: 30, color: "#93b0c8" },
  ] as DonutSegment[],
  note: "Workers adding new skills at 140% faster rate vs pre-2022.",
  gradientColors: "from-amber-400 via-yellow-500 to-amber-400",
  iconColor: "text-amber-600",
  provenance: {
    ...linkedinEconomic,
    reportTitle: "Work Change Report 2025",
    citation: "LinkedIn Economic Graph, Work Change Report, January 2025.",
  },
};

const card51_globalJobsGap: StatDatum = {
  id: "global-jobs-gap",
  region: "global",
  title: "The global jobs gap",
  subtitle: "More than just unemployment",
  renderType: "metric",
  value: "402M",
  valueContext: "people worldwide face a jobs gap",
  items: [
    { text: "186 million unemployed" },
    { text: "137 million discouraged workers" },
    { text: "79 million unable to seek work (caregiving)" },
    { text: "Informal employment affects 2+ billion" },
  ] as BulletItem[],
  gradientColors: "from-rose-400 via-red-500 to-rose-400",
  iconColor: "text-rose-600",
  provenance: iloOecd,
};

const card52_nordicNeetComparison: StatDatum = {
  id: "nordic-neet-comparison",
  region: "norway",
  title: "Nordic NEET rates (15-29)",
  subtitle: "Norway among the world's lowest",
  renderType: "barList",
  items: [
    { label: "Iceland", value: 50, color: "bg-blue-400" },
    { label: "Sweden", value: 58, color: "bg-blue-500" },
    { label: "Norway", value: 60, color: "bg-emerald-500" },
    { label: "Denmark", value: 70, color: "bg-blue-600" },
    { label: "Finland", value: 93, color: "bg-amber-500" },
    { label: "EU Average", value: 120, color: "bg-red-400" },
  ] as BarItem[],
  note: "Values show rate × 10. Iceland 5.0%, Sweden 5.8%, Norway 6.0%, Denmark 7.0%, Finland 9.3%, EU 12.0%.",
  gradientColors: "from-blue-400 via-emerald-500 to-blue-400",
  iconColor: "text-emerald-600",
  provenance: eurostat,
};

const card53_youthInformalWork: StatDatum = {
  id: "global-youth-informal-work",
  region: "global",
  title: "Youth in informal employment",
  subtitle: "Many young workers lack protections",
  renderType: "donut",
  value: ">50%",
  valueContext: "of young workers are in informal employment",
  items: [
    { label: "Informal work", value: 55, color: "#ef4444" },
    { label: "Formal employment", value: 45, color: "#22c55e" },
  ] as DonutSegment[],
  note: "Informal work means no contract, benefits, or social protection.",
  gradientColors: "from-red-400 via-orange-500 to-red-400",
  iconColor: "text-red-500",
  provenance: iloOecd,
};

const card54_renewableEnergyJobs: StatDatum = {
  id: "global-renewable-energy-jobs",
  region: "global",
  title: "Renewable energy employment",
  subtitle: "Clean energy is creating millions of jobs",
  renderType: "barList",
  items: [
    { label: "Solar PV", value: 35, color: "bg-amber-500" },
    { label: "Bioenergy", value: 22, color: "bg-green-500" },
    { label: "Hydropower", value: 18, color: "bg-blue-500" },
    { label: "Wind", value: 14, color: "bg-cyan-500" },
    { label: "Other renewables", value: 11, color: "bg-teal-500" },
  ] as BarItem[],
  note: "16.2 million total renewable energy jobs globally (2023), up from 13.7M in 2022.",
  gradientColors: "from-amber-400 via-green-500 to-cyan-400",
  iconColor: "text-green-600",
  provenance: iloOecd,
};

// ============================================
// BATCH 7 — AI & TECHNOLOGY IMPACT (9 cards)
// ============================================

const card55_genaiReshapingWork: StatDatum = {
  id: "global-genai-reshaping-work",
  region: "global",
  title: "GenAI is reshaping work",
  subtitle: "Automation potential has doubled",
  renderType: "stackedBar",
  value: "Automation by 2030",
  valueContext: "Share of current work hours",
  items: [
    { label: "Automatable now", value: 30, color: "#8b5cf6" },
    { label: "Enhanced by AI", value: 35, color: "#3b82f6" },
    { label: "Minimal change", value: 35, color: "#93b0c8" },
  ] as StackedSegment[],
  note: "GenAI can automate 60-70% of employee time activities. Up to 30% of hours could be automated by 2030.",
  realitySignal: "Automation has been reshaping work for decades — this is an evolution, not a cliff edge.",
  gradientColors: "from-violet-400 via-blue-500 to-slate-400",
  iconColor: "text-violet-600",
  provenance: mckinsey,
};

const card56_aiSkillsPremium: StatDatum = {
  id: "global-ai-skills-premium",
  region: "global",
  title: "AI skills salary premium",
  subtitle: "Learning AI pays off financially",
  renderType: "metric",
  value: "28%",
  valueContext: "salary premium for AI-skilled workers (~$18K/year more)",
  items: [
    { text: "GenAI job postings up 15,625% since 2021" },
    { text: "51% of AI jobs are now outside IT sectors" },
    { text: "GenAI roles in non-tech industries up 800%" },
    { text: "66,000+ postings mention GenAI as a skill" },
  ] as BulletItem[],
  gradientColors: "from-emerald-400 via-teal-500 to-emerald-400",
  iconColor: "text-emerald-600",
  provenance: lightcast,
};

const card57_developerAiAdoption: StatDatum = {
  id: "global-developer-ai-adoption",
  region: "global",
  title: "Developers are embracing AI",
  subtitle: "AI coding tools going mainstream",
  renderType: "donut",
  value: "62%",
  valueContext: "of developers now use AI coding tools",
  items: [
    { label: "Using AI tools", value: 62, color: "#8b5cf6" },
    { label: "Planning to use", value: 14, color: "#d8b4fe" },
    { label: "Not using", value: 24, color: "#93b0c8" },
  ] as DonutSegment[],
  note: "Up from 44% in 2023. 70% of professional devs don't see AI as a job threat.",
  realitySignal: "Tools change all the time — learning to adapt matters more than any single tool.",
  gradientColors: "from-purple-400 via-violet-500 to-purple-400",
  iconColor: "text-purple-600",
  provenance: githubStackoverflow,
};

const card58_wefFastestGrowing2025: StatDatum = {
  id: "wef-fastest-growing-2025",
  region: "global",
  title: "Top growing roles (WEF 2025)",
  subtitle: "Biggest demand through 2030",
  renderType: "rankingBars",
  items: [
    { rank: 1, label: "AI & ML Specialists", trend: "up" as const, color: "bg-violet-500" },
    { rank: 2, label: "Big Data Analysts", trend: "up" as const, color: "bg-blue-500" },
    { rank: 3, label: "Renewable Energy Eng.", trend: "up" as const, color: "bg-emerald-500" },
    { rank: 4, label: "Cybersecurity Pros", trend: "up" as const, color: "bg-indigo-500" },
    { rank: 5, label: "EV / Autonomous Tech", trend: "up" as const, color: "bg-cyan-500" },
  ] as RankingItem[],
  note: "In absolute numbers, farmworkers, delivery drivers, and construction workers see largest growth.",
  gradientColors: "from-violet-400 via-blue-500 to-emerald-400",
  iconColor: "text-violet-600",
  provenance: wef,
};

const card59_wefFastestDeclining2025: StatDatum = {
  id: "wef-fastest-declining-2025",
  region: "global",
  title: "Top declining roles (WEF 2025)",
  subtitle: "Roles most affected by automation",
  renderType: "rankingBars",
  items: [
    { rank: 1, label: "Data Entry Clerks", trend: "down" as const, color: "bg-red-500" },
    { rank: 2, label: "Cashiers / Ticket Clerks", trend: "down" as const, color: "bg-red-400" },
    { rank: 3, label: "Bank Tellers", trend: "down" as const, color: "bg-orange-500" },
    { rank: 4, label: "Telemarketers", trend: "down" as const, color: "bg-orange-400" },
    { rank: 5, label: "Postal Service Clerks", trend: "down" as const, color: "bg-amber-500" },
  ] as RankingItem[],
  note: "Cashier/Ticket Clerk roles alone: net loss of 13.7M positions by 2030.",
  gradientColors: "from-red-400 via-orange-500 to-amber-400",
  iconColor: "text-red-600",
  provenance: wef,
};

const card60_humanMachineAiSplit: StatDatum = {
  id: "global-human-machine-ai-split",
  region: "global",
  title: "Who does the work in 2030?",
  subtitle: "Human, machine, and AI task split",
  renderType: "stackedBar",
  value: "Task Allocation 2030",
  valueContext: "Down from 47% human-only today",
  items: [
    { label: "Humans only", value: 33, color: "#3b82f6" },
    { label: "Human + machine", value: 33, color: "#8b5cf6" },
    { label: "Fully automated", value: 34, color: "#7ba3bf" },
  ] as StackedSegment[],
  note: "Human-only tasks drop from 47% to 33%. Collaboration with machines becomes the norm.",
  realitySignal: "Working alongside technology is becoming normal — this isn't something to worry about.",
  gradientColors: "from-blue-400 via-purple-500 to-slate-400",
  iconColor: "text-blue-600",
  provenance: wef,
};

const card61_genaiProjectsBoom: StatDatum = {
  id: "global-genai-projects-boom",
  region: "global",
  title: "GenAI projects exploding",
  subtitle: "Open-source AI development surging",
  renderType: "metric",
  value: "137K",
  valueContext: "new public GenAI projects on GitHub in 2024",
  items: [
    { text: "98% increase in GenAI projects year-on-year" },
    { text: "60% more contributions to AI repositories" },
    { text: "Python surpassed JavaScript as #1 language" },
    { text: "Jupyter Notebook usage up 92%" },
  ] as BulletItem[],
  gradientColors: "from-cyan-400 via-blue-500 to-indigo-400",
  iconColor: "text-cyan-600",
  provenance: githubStackoverflow,
};

const card62_norwayAiCompetenceGap: StatDatum = {
  id: "norway-ai-competence-gap",
  region: "norway",
  title: "Norway: AI competence gap",
  subtitle: "Most businesses unprepared for AI",
  renderType: "donut",
  value: "67%",
  valueContext: "of Norwegian businesses lack AI competence",
  items: [
    { label: "Lack AI skills", value: 67, color: "#ef4444" },
    { label: "Have AI skills", value: 33, color: "#22c55e" },
  ] as DonutSegment[],
  note: "NHO Kompetansebarometer 2024. Top shortage fields: engineering, ICT, skilled trades.",
  gradientColors: "from-red-400 via-orange-500 to-red-400",
  iconColor: "text-red-500",
  provenance: nhoKompetanse,
};

const card63_norwayTechSectorGrowth: StatDatum = {
  id: "norway-tech-sector-growth",
  region: "norway",
  title: "Norway: tech sector booming",
  subtitle: "Digital roles growing fast",
  renderType: "barList",
  items: [
    { label: "Software dev openings", value: 80, color: "bg-cyan-500" },
    { label: "Data analyst growth", value: 43, color: "bg-blue-500" },
    { label: "AI/ML opportunity spike", value: 38, color: "bg-violet-500" },
    { label: "Cybersecurity growth", value: 18, color: "bg-indigo-500" },
  ] as BarItem[],
  note: "16,000+ open software developer positions. AI market expected to reach $1.13B by 2024.",
  gradientColors: "from-cyan-400 via-blue-500 to-violet-400",
  iconColor: "text-cyan-600",
  provenance: navSsb,
};

// ============================================
// BATCH 8 — GEN Z & YOUTH EMPLOYMENT (9 cards)
// ============================================

const card64_genzPurposeDriven: StatDatum = {
  id: "global-genz-purpose-driven",
  region: "global",
  title: "Gen Z: purpose-driven careers",
  subtitle: "Values matter more than ever",
  renderType: "donut",
  value: "86%",
  valueContext: "of Gen Z say purpose is key to job satisfaction",
  items: [
    { label: "Purpose matters", value: 86, color: "#8b5cf6" },
    { label: "Not a priority", value: 14, color: "#93b0c8" },
  ] as DonutSegment[],
  note: "44% have rejected employers based on personal ethics. Survey: 22,841 respondents in 44 countries.",
  realitySignal: "Caring about purpose is healthy — it's okay to still be figuring out what yours is.",
  gradientColors: "from-purple-400 via-violet-500 to-purple-400",
  iconColor: "text-purple-600",
  provenance: deloitte,
};

const card65_genzFinancialPressure: StatDatum = {
  id: "global-genz-financial-pressure",
  region: "global",
  title: "Gen Z: financial pressure",
  subtitle: "Economic reality for young workers",
  renderType: "metric",
  value: "56%",
  valueContext: "of Gen Z live paycheck to paycheck",
  items: [
    { text: "Up 5 percentage points year-on-year" },
    { text: "Only 32% believe the economy will improve" },
    { text: "55% of millennials also live paycheck to paycheck" },
    { text: "Cost of living is the #1 concern" },
  ] as BulletItem[],
  realitySignal: "Financial pressure at this stage is extremely common — it doesn't define your trajectory.",
  gradientColors: "from-red-400 via-rose-500 to-red-400",
  iconColor: "text-red-600",
  provenance: deloitte,
};

const card66_genzWorkplaceStress: StatDatum = {
  id: "global-genz-workplace-stress",
  region: "global",
  title: "Gen Z: workplace stress",
  subtitle: "Stress levels are improving but still high",
  renderType: "stackedBar",
  value: "Stress Levels (Gen Z)",
  valueContext: "Down from 46% in 2023",
  items: [
    { label: "Stressed most/all time", value: 40, color: "#ef4444" },
    { label: "Sometimes stressed", value: 35, color: "#f59e0b" },
    { label: "Rarely stressed", value: 25, color: "#22c55e" },
  ] as StackedSegment[],
  note: "51% cite long hours; 44% cite lack of control over work.",
  realitySignal: "Feeling stressed about work is very common at your age — and it does get easier.",
  gradientColors: "from-red-400 via-amber-400 to-green-400",
  iconColor: "text-amber-600",
  provenance: deloitte,
};

const card67_genzClimateValues: StatDatum = {
  id: "global-genz-climate-values",
  region: "global",
  title: "Gen Z: climate & work values",
  subtitle: "Environment shapes career choices",
  renderType: "barList",
  items: [
    { label: "Would pay more for sustainable", value: 64, color: "bg-emerald-500" },
    { label: "Anxious about climate", value: 62, color: "bg-teal-500" },
    { label: "Pressure employers on climate", value: 54, color: "bg-green-500" },
    { label: "Plan to change jobs (climate)", value: 25, color: "bg-lime-500" },
    { label: "Already changed jobs (climate)", value: 20, color: "bg-cyan-500" },
  ] as BarItem[],
  gradientColors: "from-emerald-400 via-teal-500 to-green-400",
  iconColor: "text-emerald-600",
  provenance: deloitte,
};

const card68_euNeetByCountry: StatDatum = {
  id: "eu-neet-by-country",
  region: "global",
  title: "EU NEET rates by country",
  subtitle: "Youth not in education, employment, or training",
  renderType: "rankingBars",
  items: [
    { rank: 1, label: "Netherlands 4.9%", trend: "stable" as const, color: "bg-emerald-500" },
    { rank: 2, label: "Sweden 5.8%", trend: "stable" as const, color: "bg-green-500" },
    { rank: 3, label: "Denmark 7.0%", trend: "stable" as const, color: "bg-teal-500" },
    { rank: 4, label: "Spain 12.1%", trend: "down" as const, color: "bg-amber-500" },
    { rank: 5, label: "Romania 19.4%", trend: "stable" as const, color: "bg-red-500" },
  ] as RankingItem[],
  note: "EU average: 11.0%. Target: 9.0% by 2030. 9 countries already below target.",
  realitySignal: "Not being in education or work right now doesn't mean you're stuck — most people move through this.",
  gradientColors: "from-emerald-400 via-amber-400 to-red-400",
  iconColor: "text-amber-600",
  provenance: eurostat,
};

const card69_developingWorldJobsGap: StatDatum = {
  id: "global-developing-world-jobs-gap",
  region: "global",
  title: "Developing world: youth jobs gap",
  subtitle: "The scale of the challenge",
  renderType: "metric",
  value: "~800M",
  valueContext: "young people may lack decent work in developing countries",
  items: [
    { text: "1.2 billion reaching working age next decade" },
    { text: "Only ~420 million formal jobs expected" },
    { text: "75% concentrated in South/East Asia & Sub-Saharan Africa" },
    { text: "1.1 billion youth live in the Global South" },
  ] as BulletItem[],
  gradientColors: "from-orange-400 via-red-500 to-orange-400",
  iconColor: "text-orange-600",
  provenance: worldBank,
};

const card70_skillsBasedHiringSurge: StatDatum = {
  id: "global-skills-based-hiring-surge",
  region: "global",
  title: "Skills-based hiring is surging",
  subtitle: "Degrees matter less than what you can do",
  renderType: "barList",
  items: [
    { label: "Employers adopting skills hiring", value: 73, color: "bg-violet-500" },
    { label: "Dropping degree requirements", value: 45, color: "bg-purple-500" },
    { label: "Retention improvement", value: 25, color: "bg-indigo-500" },
  ] as BarItem[],
  note: "Up from 56% in 2022. Experience requirements also falling: 32.6% of postings (down from 40%).",
  realitySignal: "Not having a degree doesn't close doors the way it used to.",
  gradientColors: "from-violet-400 via-purple-500 to-indigo-400",
  iconColor: "text-violet-600",
  provenance: lightcast,
};

const card71_norwayYouthSnapshot: StatDatum = {
  id: "norway-youth-employment-snapshot",
  region: "norway",
  title: "Norway: youth at a glance",
  subtitle: "What young Norwegians (15-24) are doing",
  renderType: "stackedBar",
  value: "Youth Activity (15-24)",
  valueContext: "Employment rate: 58.5%",
  items: [
    { label: "Employed", value: 58, color: "#22c55e" },
    { label: "In education only", value: 30, color: "#8b5cf6" },
    { label: "NEET", value: 6, color: "#ef4444" },
    { label: "Other", value: 6, color: "#93b0c8" },
  ] as StackedSegment[],
  note: "Youth unemployment: 11.6%. NEET rate among lowest in the OECD.",
  gradientColors: "from-green-400 via-purple-400 to-red-400",
  iconColor: "text-green-600",
  provenance: navSsb,
};

const card72_norwayGenderPatterns: StatDatum = {
  id: "norway-gender-work-patterns",
  region: "norway",
  title: "Norway: gender patterns at work",
  subtitle: "Progress made, gaps remain",
  renderType: "barList",
  items: [
    { label: "Women in healthcare", value: 83, color: "bg-pink-500" },
    { label: "Women part-time", value: 40, color: "bg-rose-400" },
    { label: "Wage gap", value: 12, color: "bg-amber-500" },
    { label: "Men part-time", value: 10, color: "bg-blue-400" },
  ] as BarItem[],
  note: "83% of healthcare/social work employees are female. Sector segregation persists.",
  gradientColors: "from-pink-400 via-rose-500 to-blue-400",
  iconColor: "text-pink-600",
  provenance: navSsb,
};

// ============================================
// BATCH 9 — SKILLS & RESKILLING REVOLUTION (9 cards)
// ============================================

const card73_skillsGapBarrier: StatDatum = {
  id: "global-skills-gap-barrier",
  region: "global",
  title: "Skills gap: the #1 barrier",
  subtitle: "What's holding businesses back",
  renderType: "donut",
  value: "63%",
  valueContext: "of employers cite skills gap as primary barrier to transformation",
  items: [
    { label: "Skills gap is #1 barrier", value: 63, color: "#ef4444" },
    { label: "Other barriers", value: 37, color: "#93b0c8" },
  ] as DonutSegment[],
  note: "40% of job skills are expected to change by 2030. 87% of companies report or expect a skills gap.",
  realitySignal: "This is an employer challenge, not yours — companies know they need to invest in training.",
  gradientColors: "from-red-400 via-rose-500 to-red-400",
  iconColor: "text-red-600",
  provenance: wef,
};

const card74_globalReskillingNeed: StatDatum = {
  id: "global-reskilling-need",
  region: "global",
  title: "Half the world needs reskilling",
  subtitle: "Employer plans to bridge the gap",
  renderType: "barList",
  items: [
    { label: "Plan workforce upskilling", value: 85, color: "bg-emerald-500" },
    { label: "Plan to automate more", value: 73, color: "bg-blue-500" },
    { label: "Plan to transition staff", value: 50, color: "bg-purple-500" },
    { label: "Plan workforce reduction", value: 40, color: "bg-red-400" },
  ] as BarItem[],
  note: "50%+ of the global workforce needs reskilling by 2030.",
  gradientColors: "from-emerald-400 via-blue-500 to-red-400",
  iconColor: "text-emerald-600",
  provenance: wef,
};

const card75_topSkills2030: StatDatum = {
  id: "global-top-skills-2030",
  region: "global",
  title: "Top skills for 2030",
  subtitle: "What employers will demand most",
  renderType: "rankingBars",
  items: [
    { rank: 1, label: "Analytical Thinking", trend: "up" as const, color: "bg-blue-500" },
    { rank: 2, label: "AI & Big Data", trend: "up" as const, color: "bg-violet-500" },
    { rank: 3, label: "Cybersecurity", trend: "up" as const, color: "bg-indigo-500" },
    { rank: 4, label: "Digital Literacy", trend: "up" as const, color: "bg-cyan-500" },
    { rank: 5, label: "Creativity & Innovation", trend: "up" as const, color: "bg-pink-500" },
  ] as RankingItem[],
  note: "Tech skills growing fastest. Resilience, curiosity, and leadership also in top 10.",
  realitySignal: "Nobody has all of these — most people develop a few and build from there.",
  gradientColors: "from-blue-400 via-violet-500 to-pink-400",
  iconColor: "text-blue-600",
  provenance: wef,
};

const card76_skillsTransformationSpeed: StatDatum = {
  id: "global-skills-transformation-speed",
  region: "global",
  title: "Skills transformation accelerating",
  subtitle: "Workers are adapting faster than ever",
  renderType: "metric",
  value: "140%",
  valueContext: "faster rate of adding new skills vs pre-2022",
  items: [
    { text: "AI skills added 177% faster (5× average)" },
    { text: "GenAI-skilled workers 5× more likely to develop creative skills" },
    { text: "55% of LinkedIn members' jobs will change due to GenAI" },
    { text: "People hold 2× as many jobs over career vs 15 years ago" },
  ] as BulletItem[],
  gradientColors: "from-teal-400 via-emerald-500 to-teal-400",
  iconColor: "text-teal-600",
  provenance: {
    ...linkedinEconomic,
    reportTitle: "Work Change Report 2025",
    citation: "LinkedIn Economic Graph, Work Change Report, January 2025.",
  },
};

const card77_lifelongLearningExpanded: StatDatum = {
  id: "global-lifelong-learning-expanded",
  region: "global",
  title: "Lifelong learning participation",
  subtitle: "Adults in education or training (25-64)",
  renderType: "barList",
  items: [
    { label: "Nordics (Norway/Finland)", value: 58, color: "bg-blue-500" },
    { label: "OECD Average", value: 40, color: "bg-indigo-500" },
    { label: "Western Europe", value: 22, color: "bg-purple-500" },
    { label: "North America", value: 18, color: "bg-amber-500" },
    { label: "Global average", value: 12, color: "bg-sky-400" },
  ] as BarItem[],
  note: "Norway and Finland are joint OECD leaders. 90%+ of Norwegians have done non-formal learning.",
  gradientColors: "from-blue-400 via-indigo-500 to-amber-400",
  iconColor: "text-indigo-600",
  provenance: oecdLabour,
};

const card78_euDigitalSkillsGap: StatDatum = {
  id: "eu-digital-skills-gap",
  region: "global",
  title: "EU digital skills crisis",
  subtitle: "Far from 2030 targets",
  renderType: "stackedBar",
  value: "EU Digital Skills",
  valueContext: "Target: 80% by 2030",
  items: [
    { label: "Basic+ digital skills", value: 56, color: "#22c55e" },
    { label: "Below basic skills", value: 14, color: "#f59e0b" },
    { label: "No digital skills", value: 30, color: "#ef4444" },
  ] as StackedSegment[],
  note: "30% of 16-24 year-olds lack basic digital skills. Projected: only 59.8% by 2030 without intervention.",
  realitySignal: "Digital skills can be learned at any point — many people pick them up on the job.",
  gradientColors: "from-green-400 via-amber-400 to-red-400",
  iconColor: "text-amber-600",
  provenance: euDesi,
};

const card79_degreeRequirementsDropping: StatDatum = {
  id: "global-degree-requirements-dropping",
  region: "global",
  title: "Degree requirements are dropping",
  subtitle: "The shift to skills-based job postings",
  renderType: "barList",
  items: [
    { label: "Colorado: degree-free postings", value: 58, color: "bg-emerald-500" },
    { label: "Maryland: degree-free postings", value: 47, color: "bg-green-500" },
    { label: "US states with skills directives", value: 50, color: "bg-teal-500" },
    { label: "Skills changed in avg job (3yr)", value: 32, color: "bg-blue-500" },
  ] as BarItem[],
  note: "Pennsylvania removed degree requirements from ~92% of state positions.",
  gradientColors: "from-emerald-400 via-green-500 to-teal-400",
  iconColor: "text-emerald-600",
  provenance: lightcast,
};

const card80_norwayNhoSkillsShortage: StatDatum = {
  id: "norway-nho-skills-shortage",
  region: "norway",
  title: "Norway: NHO skills shortage",
  subtitle: "Employers can't find the skills they need",
  renderType: "metric",
  value: "33,900",
  valueContext: "unfilled positions across NHO member companies",
  items: [
    { text: "6 in 10 businesses report unmet competence needs" },
    { text: "Health sector: ~11,000 unfilled positions" },
    { text: "Teaching shortfall: ~13,000 by 2035" },
    { text: "Top needs: engineering, ICT, skilled trades" },
  ] as BulletItem[],
  gradientColors: "from-red-400 via-orange-500 to-amber-400",
  iconColor: "text-red-500",
  provenance: nhoKompetanse,
};

const card81_norwayLifelongLearning: StatDatum = {
  id: "norway-lifelong-learning-champion",
  region: "norway",
  title: "Norway: lifelong learning champion",
  subtitle: "Among the highest adult learning rates globally",
  renderType: "donut",
  value: "58%",
  valueContext: "of adults participate in lifelong learning",
  items: [
    { label: "Participating", value: 58, color: "#3b82f6" },
    { label: "Not participating", value: 42, color: "#93b0c8" },
  ] as DonutSegment[],
  note: "Joint OECD highest (with Finland). 90%+ have done non-formal learning. 77% of high-literacy vs 44% of low-literacy adults.",
  gradientColors: "from-blue-400 via-indigo-500 to-blue-400",
  iconColor: "text-blue-600",
  provenance: navSsb,
};

// ============================================
// BATCH 10 — GREEN ECONOMY DEEP DIVE (9 cards)
// ============================================

const card82_greenJobs34M: StatDatum = {
  id: "global-green-jobs-34m",
  region: "global",
  title: "Green transition: 34M new jobs",
  subtitle: "The biggest job creation force",
  renderType: "metric",
  value: "34M",
  valueContext: "additional green jobs by 2030",
  items: [
    { text: "Renewable Energy Engineers: fastest growing" },
    { text: "Sustainability/ESG Managers: rising sharply" },
    { text: "Environmental Stewardship: top 10 skill" },
    { text: "Green skills demand growing 5.9% annually" },
  ] as BulletItem[],
  gradientColors: "from-emerald-400 via-green-500 to-teal-400",
  iconColor: "text-emerald-600",
  provenance: wef,
};

const card83_greenWorkforceShare: StatDatum = {
  id: "global-green-workforce-share",
  region: "global",
  title: "Green vs carbon-intensive jobs",
  subtitle: "How the workforce maps to emissions",
  renderType: "stackedBar",
  value: "Workforce & Emissions",
  valueContext: "OECD countries",
  items: [
    { label: "Green-driven occupations", value: 20, color: "#22c55e" },
    { label: "GHG-intensive sectors", value: 7, color: "#ef4444" },
    { label: "Other sectors", value: 73, color: "#93b0c8" },
  ] as StackedSegment[],
  note: "GHG-intensive sectors produce 80% of emissions with only 7% of jobs. Displaced workers face 36% earnings loss.",
  realitySignal: "The green transition creates more jobs than it displaces — change takes time.",
  gradientColors: "from-green-400 via-red-400 to-slate-400",
  iconColor: "text-green-600",
  provenance: oecdLabour,
};

const card84_greenSkillsDemand: StatDatum = {
  id: "global-green-skills-demand",
  region: "global",
  title: "Green skills demand growth",
  subtitle: "Employers seeking sustainability talent",
  renderType: "donut",
  value: "5.9%",
  valueContext: "annual growth in green talent demand (2021-2024)",
  items: [
    { label: "Green talent demand", value: 59, color: "#22c55e" },
    { label: "Other talent demand", value: 41, color: "#93b0c8" },
  ] as DonutSegment[],
  note: "Green talent is growing faster than the overall labour market across all major economies.",
  gradientColors: "from-emerald-400 via-green-500 to-emerald-400",
  iconColor: "text-emerald-600",
  provenance: linkedinEconomic,
};

const card85_greenTransitionWorkerImpact: StatDatum = {
  id: "global-green-transition-worker-impact",
  region: "global",
  title: "Green transition: worker impact",
  subtitle: "Displaced fossil fuel workers face big losses",
  renderType: "barList",
  items: [
    { label: "Earnings loss (GHG workers)", value: 36, color: "bg-red-500" },
    { label: "Earnings loss (other sectors)", value: 29, color: "bg-orange-400" },
    { label: "Reskilling reduces the gap", value: 15, color: "bg-emerald-500" },
  ] as BarItem[],
  note: "% earnings decrease over 5-6 years after displacement. Transition support programs are critical.",
  gradientColors: "from-red-400 via-orange-400 to-emerald-400",
  iconColor: "text-red-500",
  provenance: oecdLabour,
};

const card86_netNewJobCreation: StatDatum = {
  id: "global-net-new-job-creation",
  region: "global",
  title: "Net 78 million new jobs by 2030",
  subtitle: "Jobs created vs displaced",
  renderType: "stackedBar",
  value: "Global Job Creation",
  valueContext: "170M created, 92M displaced",
  items: [
    { label: "New jobs created", value: 65, color: "#22c55e" },
    { label: "Jobs displaced", value: 35, color: "#ef4444" },
  ] as StackedSegment[],
  note: "Net increase of 78 million jobs (7% of global workforce). 22% of jobs undergoing structural change.",
  gradientColors: "from-green-400 via-emerald-500 to-red-400",
  iconColor: "text-green-600",
  provenance: wef,
};

const card87_norwayOffshoreWind: StatDatum = {
  id: "norway-offshore-wind-pipeline",
  region: "norway",
  title: "Norway: offshore wind pipeline",
  subtitle: "Major projects creating thousands of jobs",
  renderType: "metric",
  value: "62K",
  valueContext: "projected offshore wind jobs by 2050",
  items: [
    { text: "Sørlige Nordsjø II: 1,400-1,500 MW awarded 2024" },
    { text: "Utsira Nord: 1,500 MW floating wind" },
    { text: "Skills transfer from oil & gas sector" },
    { text: "Construction phase begins mid-2020s" },
  ] as BulletItem[],
  gradientColors: "from-cyan-400 via-blue-500 to-cyan-400",
  iconColor: "text-cyan-600",
  provenance: navSsb,
};

const card88_norwayEvWorldLeader: StatDatum = {
  id: "norway-ev-world-leader",
  region: "norway",
  title: "Norway: EV world leader",
  subtitle: "Highest electric vehicle adoption globally",
  renderType: "iconGrid",
  items: [
    { icon: "⚡", label: "88.9% EV Sales", sublabel: "New cars in 2024" },
    { icon: "🔌", label: "25K+ Chargers", sublabel: "Public charge points" },
    { icon: "🚗", label: "754K+ EVs", sublabel: "Registered vehicles" },
    { icon: "🏭", label: "Battery Plants", sublabel: "Morrow, Beyonder" },
    { icon: "🌍", label: "Global Leader", sublabel: "Highest EV share" },
  ] as IconGridItem[],
  gradientColors: "from-emerald-400 via-teal-500 to-cyan-400",
  iconColor: "text-emerald-600",
  provenance: navSsb,
};

const card89_norwayHydrogenEconomy: StatDatum = {
  id: "norway-hydrogen-economy",
  region: "norway",
  title: "Norway: hydrogen economy",
  subtitle: "Green hydrogen investment surge",
  renderType: "metric",
  value: "NOK 777M",
  valueContext: "invested by Enova for green hydrogen plants",
  items: [
    { text: "5 green hydrogen production facilities" },
    { text: "120 MW total capacity planned" },
    { text: "Operational by 2027" },
    { text: "Part of Norway's comprehensive green transition" },
  ] as BulletItem[],
  gradientColors: "from-cyan-400 via-teal-500 to-emerald-400",
  iconColor: "text-cyan-600",
  provenance: navSsb,
};

const card90_norwayCcsLongship: StatDatum = {
  id: "norway-ccs-longship",
  region: "norway",
  title: "Norway: CCS Longship project",
  subtitle: "World-leading carbon capture & storage",
  renderType: "iconGrid",
  items: [
    { icon: "🏗️", label: "1,500-3,000", sublabel: "Construction jobs" },
    { icon: "👷", label: "~170 Permanent", sublabel: "Long-term roles" },
    { icon: "💰", label: "NOK 7.5B", sublabel: "Phase 2 investment" },
    { icon: "🌊", label: "Northern Lights", sublabel: "CO2 storage hub" },
    { icon: "📅", label: "Aug 2025", sublabel: "First CO2 injection" },
  ] as IconGridItem[],
  gradientColors: "from-blue-400 via-indigo-500 to-purple-400",
  iconColor: "text-blue-600",
  provenance: navSsb,
};

// ============================================
// BATCH 11 — GLOBAL TALENT MARKETS (9 cards)
// ============================================

const card91_globalTalentShortage: StatDatum = {
  id: "global-talent-shortage",
  region: "global",
  title: "Global talent shortage",
  subtitle: "3 in 4 employers struggle to hire",
  renderType: "donut",
  value: "75%",
  valueContext: "of employers globally struggle to fill roles",
  items: [
    { label: "Difficulty filling roles", value: 75, color: "#ef4444" },
    { label: "No difficulty", value: 25, color: "#22c55e" },
  ] as DonutSegment[],
  note: "Survey of 40,077 employers across 41 countries. Healthcare, IT, and logistics hardest hit.",
  realitySignal: "Talent shortages mean employers need you — this works in your favour.",
  gradientColors: "from-red-400 via-rose-500 to-red-400",
  iconColor: "text-red-600",
  provenance: manpower,
};

const card92_talentShortageByCountry: StatDatum = {
  id: "global-talent-shortage-by-country",
  region: "global",
  title: "Talent shortage by country",
  subtitle: "Where hiring is hardest",
  renderType: "barList",
  items: [
    { label: "Japan", value: 85, color: "bg-red-500" },
    { label: "Germany", value: 82, color: "bg-red-400" },
    { label: "UK", value: 80, color: "bg-orange-500" },
    { label: "Italy", value: 75, color: "bg-orange-400" },
    { label: "US", value: 70, color: "bg-amber-500" },
    { label: "Norway", value: 69, color: "bg-amber-400" },
  ] as BarItem[],
  note: "% of employers reporting difficulty filling positions. Finland lowest at 59%.",
  gradientColors: "from-red-400 via-orange-500 to-amber-400",
  iconColor: "text-red-500",
  provenance: manpower,
};

const card93_euYouthUnemploymentMap: StatDatum = {
  id: "eu-youth-unemployment-map",
  region: "global",
  title: "EU youth unemployment map",
  subtitle: "Wide variation across Europe (15-24)",
  renderType: "barList",
  items: [
    { label: "Germany", value: 56, color: "bg-emerald-500" },
    { label: "Netherlands", value: 85, color: "bg-green-500" },
    { label: "Denmark", value: 102, color: "bg-teal-500" },
    { label: "France", value: 158, color: "bg-amber-500" },
    { label: "Spain", value: 202, color: "bg-red-500" },
  ] as BarItem[],
  note: "Values ×10. Germany 5.6%, Netherlands 8.5%, Denmark 10.2%, France 15.8%, Spain 20.2%. EU avg: 15.2%.",
  gradientColors: "from-emerald-400 via-amber-500 to-red-400",
  iconColor: "text-amber-600",
  provenance: eurostat,
};

const card94_oecdEmploymentRecord: StatDatum = {
  id: "oecd-employment-record",
  region: "global",
  title: "OECD employment near record",
  subtitle: "Labour markets rebounding globally",
  renderType: "metric",
  value: "662M",
  valueContext: "total employment across OECD countries",
  items: [
    { text: "Unemployment 4.9% — lowest since 2001" },
    { text: "Female employment grew 5% since Dec 2019" },
    { text: "Real wages up 3.5% average across OECD" },
    { text: "29 of 35 countries: positive real wage growth" },
  ] as BulletItem[],
  gradientColors: "from-blue-400 via-indigo-500 to-blue-400",
  iconColor: "text-blue-600",
  provenance: oecdLabour,
};

const card95_childLabourDeclining: StatDatum = {
  id: "global-child-labour-declining",
  region: "global",
  title: "Child labour is declining",
  subtitle: "But 138 million children still affected",
  renderType: "metric",
  value: "138M",
  valueContext: "children still in child labour worldwide (down 22M since 2020)",
  items: [
    { text: "54 million in hazardous work" },
    { text: "Over 100 million reduction since 2000" },
    { text: "61% in agriculture sector" },
    { text: "Sub-Saharan Africa: 87M (63% of global total)" },
  ] as BulletItem[],
  gradientColors: "from-amber-400 via-orange-500 to-amber-400",
  iconColor: "text-amber-600",
  provenance: unicefIlo,
};

const card96_euIctSpecialistGap: StatDatum = {
  id: "eu-ict-specialist-gap",
  region: "global",
  title: "EU ICT specialist gap",
  subtitle: "Not enough tech talent in Europe",
  renderType: "stackedBar",
  value: "EU Tech Workforce",
  valueContext: "9.8M current vs 20M target",
  items: [
    { label: "Current ICT specialists", value: 49, color: "#22c55e" },
    { label: "Gap to 2030 target", value: 39, color: "#ef4444" },
    { label: "Women in ICT", value: 12, color: "#ec4899" },
  ] as StackedSegment[],
  note: "Only 19.4% of ICT specialists are women. 66.7% have tertiary degrees.",
  gradientColors: "from-green-400 via-red-400 to-pink-400",
  iconColor: "text-red-500",
  provenance: euDesi,
};

const card97_mcKinseyEuropeTransitions: StatDatum = {
  id: "mckinsey-europe-transitions",
  region: "global",
  title: "Europe: 12M job transitions ahead",
  subtitle: "AI driving unprecedented workforce change",
  renderType: "metric",
  value: "12M",
  valueContext: "occupational transitions needed in Europe by 2030",
  items: [
    { text: "2× pre-pandemic levels" },
    { text: "Tech skills demand up 25-29%" },
    { text: "Social/emotional skills up 11%" },
    { text: "Healthcare needs: 5.5M additional workers" },
  ] as BulletItem[],
  note: "STEM automation in Europe doubled from 13% to 27%. Education roles tripled from 6% to 21%.",
  gradientColors: "from-violet-400 via-blue-500 to-violet-400",
  iconColor: "text-violet-600",
  provenance: mckinsey,
};

const card98_norwayImmigrationEmployment: StatDatum = {
  id: "norway-immigration-employment-detail",
  region: "norway",
  title: "Norway: immigration & employment",
  subtitle: "Employment rates by background (20-66)",
  renderType: "barList",
  items: [
    { label: "Labour immigrants (non-EEA)", value: 83, color: "bg-emerald-500" },
    { label: "Non-immigrants", value: 80, color: "bg-blue-500" },
    { label: "Nordic immigrants", value: 78, color: "bg-blue-400" },
    { label: "EU/EEA workers", value: 72, color: "bg-indigo-500" },
    { label: "Refugees (>5 yrs)", value: 62, color: "bg-purple-500" },
    { label: "Recent arrivals (<3 yrs)", value: 31, color: "bg-amber-500" },
  ] as BarItem[],
  note: "Labour immigrants (non-EEA) actually exceed non-immigrant rate. Integration programs boost outcomes significantly.",
  gradientColors: "from-emerald-400 via-blue-500 to-amber-400",
  iconColor: "text-blue-600",
  provenance: navSsb,
};

const card99_norwayVocationalStrength: StatDatum = {
  id: "norway-vocational-strength",
  region: "norway",
  title: "Norway: vocational education strength",
  subtitle: "Half of students choose yrkesfag",
  renderType: "donut",
  value: "50%",
  valueContext: "of Norwegian students choose vocational pathways",
  items: [
    { label: "Vocational (yrkesfag)", value: 50, color: "#8b5cf6" },
    { label: "Academic (studieforberedende)", value: 50, color: "#3b82f6" },
  ] as DonutSegment[],
  note: "197 trade certificates available. 78% of apprenticeship applicants get a contract. Completion rate: 70.9%.",
  realitySignal: "There's no single 'right' path — vocational and academic routes both lead to good outcomes.",
  gradientColors: "from-purple-400 via-blue-500 to-purple-400",
  iconColor: "text-purple-600",
  provenance: navSsb,
};

// ============================================
// BATCH 12 — FUTURE OF WORK & WELLBEING (9 cards)
// ============================================

const card100_aiCorporateTransformation: StatDatum = {
  id: "global-ai-corporate-transformation",
  region: "global",
  title: "AI corporate transformation",
  subtitle: "How companies are responding to AI",
  renderType: "barList",
  items: [
    { label: "Expect AI to transform ops", value: 86, color: "bg-violet-500" },
    { label: "Planning AI training", value: 80, color: "bg-blue-500" },
    { label: "Hiring AI-specific talent", value: 67, color: "bg-cyan-500" },
    { label: "Planning AI-driven reduction", value: 40, color: "bg-red-400" },
  ] as BarItem[],
  note: "88% of respondents report regular AI use already. ~33% of companies scaling AI programs.",
  gradientColors: "from-violet-400 via-blue-500 to-red-400",
  iconColor: "text-violet-600",
  provenance: wef,
};

const card101_deiProgramsGrowth: StatDatum = {
  id: "global-dei-programs-growth",
  region: "global",
  title: "DEI programmes expanding",
  subtitle: "Corporate inclusion initiatives growing",
  renderType: "donut",
  value: "83%",
  valueContext: "of companies now have DEI programmes",
  items: [
    { label: "Have DEI programs", value: 83, color: "#8b5cf6" },
    { label: "No DEI programs", value: 17, color: "#93b0c8" },
  ] as DonutSegment[],
  note: "Up from 67% in 2023. Companies recognize diversity correlates with above-average profitability.",
  gradientColors: "from-purple-400 via-indigo-500 to-purple-400",
  iconColor: "text-purple-600",
  provenance: wef,
};

const card102_aiProductivityBoost: StatDatum = {
  id: "global-ai-productivity-boost",
  region: "global",
  title: "AI's economic potential",
  subtitle: "Productivity gains are enormous",
  renderType: "metric",
  value: "$4.4T",
  valueContext: "annual productivity boost from AI (~4% of global GDP)",
  items: [
    { text: "Europe: up to 3% annual productivity growth through 2030" },
    { text: "AI agents/robots: $2.9T/year US economic value" },
    { text: "51% of adopters report 10%+ revenue increase" },
    { text: "88% of C-suite say speeding AI adoption is important" },
  ] as BulletItem[],
  gradientColors: "from-emerald-400 via-teal-500 to-cyan-400",
  iconColor: "text-emerald-600",
  provenance: mckinsey,
};

const card103_genzVsMillennials: StatDatum = {
  id: "global-genz-vs-millennials",
  region: "global",
  title: "Gen Z vs Millennials at work",
  subtitle: "How the generations compare",
  renderType: "radar",
  items: [
    { label: "Purpose-driven", value: 86, color: "#8b5cf6" },
    { label: "Values-based decisions", value: 44, color: "#8b5cf6" },
    { label: "Climate anxiety", value: 62, color: "#8b5cf6" },
    { label: "Financial pressure", value: 56, color: "#8b5cf6" },
    { label: "Workplace stress", value: 40, color: "#8b5cf6" },
  ] as RadarAxis[],
  note: "Gen Z values shown. Millennials score similarly: purpose 89%, values 40%, climate 59%, finances 55%, stress 35%.",
  realitySignal: "Your generation shares these feelings widely — you're not alone in any of this.",
  gradientColors: "from-purple-400 via-violet-500 to-indigo-400",
  iconColor: "text-purple-600",
  provenance: deloitte,
};

const card104_labourIncomeDecline: StatDatum = {
  id: "global-labour-income-decline",
  region: "global",
  title: "Workers' income share declining",
  subtitle: "Labour gets a smaller piece of the pie",
  renderType: "stackedBar",
  value: "Income Distribution",
  valueContext: "Labour vs capital share",
  items: [
    { label: "Labour income (2024)", value: 52, color: "#3b82f6" },
    { label: "Capital income", value: 48, color: "#7ba3bf" },
  ] as StackedSegment[],
  note: "Labour income share fell from 53.0% (2014) to 52.4% (2024). A small shift with big impacts.",
  gradientColors: "from-blue-400 via-indigo-500 to-slate-400",
  iconColor: "text-blue-600",
  provenance: iloOecd,
};

const card105_norwayStartupUnicorns: StatDatum = {
  id: "norway-startup-unicorns",
  region: "norway",
  title: "Norway: startup unicorns",
  subtitle: "Five billion-dollar companies",
  renderType: "iconGrid",
  items: [
    { icon: "🤖", label: "AutoStore", sublabel: "$8B — warehouse robotics" },
    { icon: "🧠", label: "Cognite", sublabel: "$1.6B — industrial AI" },
    { icon: "🖨️", label: "Gelato", sublabel: "$1.05B — print-on-demand" },
    { icon: "✏️", label: "reMarkable", sublabel: "$1B — e-paper tablets" },
    { icon: "📊", label: "Dune Analytics", sublabel: "$1B — blockchain data" },
  ] as IconGridItem[],
  note: "~16,500 total startups. 3,300 funded ($44.7B raised). $721M equity funding in 2024.",
  gradientColors: "from-cyan-400 via-blue-500 to-indigo-400",
  iconColor: "text-cyan-600",
  provenance: navSsb,
};

const card106_norwayApprenticeshipByTrade: StatDatum = {
  id: "norway-apprenticeship-by-trade",
  region: "norway",
  title: "Norway: popular apprenticeship trades",
  subtitle: "Where the apprentices are",
  renderType: "barList",
  items: [
    { label: "Building & Construction", value: 109, color: "bg-amber-500" },
    { label: "Electrical & IT", value: 89, color: "bg-cyan-500" },
    { label: "Industrial Production", value: 85, color: "bg-blue-500" },
    { label: "Health & Social", value: 72, color: "bg-rose-500" },
    { label: "Service & Transport", value: 51, color: "bg-purple-500" },
  ] as BarItem[],
  note: "Values ×100 (10,900 / 8,900 / 8,500 / 7,200 / 5,100). Completion rate: 70.9%. Girls outperform boys by ~5pp.",
  gradientColors: "from-amber-400 via-cyan-500 to-rose-400",
  iconColor: "text-amber-600",
  provenance: navSsb,
};

const card107_norwayTeacherHealthShortage: StatDatum = {
  id: "norway-teacher-health-shortage",
  region: "norway",
  title: "Norway: teacher & healthcare crisis",
  subtitle: "Critical shortages ahead",
  renderType: "metric",
  value: "~24K",
  valueContext: "projected shortfall in teachers & health workers",
  items: [
    { text: "Health sector: ~11,000 unfilled positions" },
    { text: "Teaching: ~13,000 shortfall by 2035" },
    { text: "Nursing: single most critical shortage" },
    { text: "Mental health professionals urgently needed" },
  ] as BulletItem[],
  gradientColors: "from-rose-400 via-red-500 to-rose-400",
  iconColor: "text-rose-600",
  provenance: nhoKompetanse,
};

const card108_norwayEmploymentVsEu: StatDatum = {
  id: "norway-employment-vs-eu",
  region: "norway",
  title: "Norway: employment leads Europe",
  subtitle: "7 points above the EU average",
  renderType: "stackedBar",
  value: "Employment Rate Comparison",
  valueContext: "Ages 15-64",
  items: [
    { label: "Norway", value: 77, color: "#22c55e" },
    { label: "EU Average", value: 70, color: "#7ba3bf" },
  ] as StackedSegment[],
  note: "Women: 75.3% vs EU avg. Men: 79.4%. Average monthly earnings: €5,308 gross / €3,816 net.",
  gradientColors: "from-green-400 via-emerald-500 to-slate-400",
  iconColor: "text-green-600",
  provenance: navSsb,
};

// ============================================
// FULL STATS BANK
// ============================================

/** All stat cards in the bank, ordered for batch selection */
export const STATS_BANK: StatDatum[] = [
  // Batch 1 — Global Overview (default)
  card1_wherePeopleWork,
  card2_growingIndustries,
  card3_reshapingJobs,
  card4_fastestGrowingRoles,
  card5_inDemandSkills,
  card6_remoteHybrid,
  card7_norwayRoles,
  card8_norwaySkills,
  card9_norwayPathways,
  // Batch 2 — Extra Global
  card10_youthUnemployment,
  card11_greenJobs,
  card12_aiImpact,
  card13_freelanceGig,
  card14_decliningRoles,
  card15_softSkillsPremium,
  card16_educationVsExperience,
  card17_norwayGreenShift,
  card18_norwayYouthActivity,
  // Batch 3 — More Variety
  card19_genderGap,
  card20_apprenticeshipGrowth,
  card21_digitalSkillsGap,
  card22_entryLevelBarriers,
  card23_sectorSalaries,
  card24_futureProofSkills,
  card25_norwayDigitalisation,
  card26_norwaySectorGrowth,
  card27_norwayWorkCulture,
  // Batch 4 — Deeper Themes
  card28_youthEntrepreneurship,
  card29_mentalHealthWork,
  card30_diversityImpact,
  card31_automationTimeline,
  card32_talentMobility,
  card33_creativeEconomy,
  card34_norwayApprenticeships,
  card35_norwayGenderEquality,
  card36_norwayTechStartups,
  // Batch 5 — Emerging Trends
  card37_remoteProductivity,
  card38_lifelongLearning,
  card39_stemPipeline,
  card40_gigProtections,
  card41_healthcareShortage,
  card42_industryFourPointZero,
  card43_norwayOilToGreen,
  card44_norwayImmigrantLabour,
  card45_norwayYouthEntrepreneurship,
  // Batch 6 — CFYE & Global Youth
  card46_cfyeProgrammeImpact,
  card47_youthUnemploymentAfricaMena,
  card48_genderYouthEmployment,
  card49_greenDigitalPathways,
  card50_skillsChanging2030,
  card51_globalJobsGap,
  card52_nordicNeetComparison,
  card53_youthInformalWork,
  card54_renewableEnergyJobs,
  // Batch 7 — AI & Technology Impact
  card55_genaiReshapingWork,
  card56_aiSkillsPremium,
  card57_developerAiAdoption,
  card58_wefFastestGrowing2025,
  card59_wefFastestDeclining2025,
  card60_humanMachineAiSplit,
  card61_genaiProjectsBoom,
  card62_norwayAiCompetenceGap,
  card63_norwayTechSectorGrowth,
  // Batch 8 — Gen Z & Youth Employment
  card64_genzPurposeDriven,
  card65_genzFinancialPressure,
  card66_genzWorkplaceStress,
  card67_genzClimateValues,
  card68_euNeetByCountry,
  card69_developingWorldJobsGap,
  card70_skillsBasedHiringSurge,
  card71_norwayYouthSnapshot,
  card72_norwayGenderPatterns,
  // Batch 9 — Skills & Reskilling Revolution
  card73_skillsGapBarrier,
  card74_globalReskillingNeed,
  card75_topSkills2030,
  card76_skillsTransformationSpeed,
  card77_lifelongLearningExpanded,
  card78_euDigitalSkillsGap,
  card79_degreeRequirementsDropping,
  card80_norwayNhoSkillsShortage,
  card81_norwayLifelongLearning,
  // Batch 10 — Green Economy Deep Dive
  card82_greenJobs34M,
  card83_greenWorkforceShare,
  card84_greenSkillsDemand,
  card85_greenTransitionWorkerImpact,
  card86_netNewJobCreation,
  card87_norwayOffshoreWind,
  card88_norwayEvWorldLeader,
  card89_norwayHydrogenEconomy,
  card90_norwayCcsLongship,
  // Batch 11 — Global Talent Markets
  card91_globalTalentShortage,
  card92_talentShortageByCountry,
  card93_euYouthUnemploymentMap,
  card94_oecdEmploymentRecord,
  card95_childLabourDeclining,
  card96_euIctSpecialistGap,
  card97_mcKinseyEuropeTransitions,
  card98_norwayImmigrationEmployment,
  card99_norwayVocationalStrength,
  // Batch 12 — Future of Work & Wellbeing
  card100_aiCorporateTransformation,
  card101_deiProgramsGrowth,
  card102_aiProductivityBoost,
  card103_genzVsMillennials,
  card104_labourIncomeDecline,
  card105_norwayStartupUnicorns,
  card106_norwayApprenticeshipByTrade,
  card107_norwayTeacherHealthShortage,
  card108_norwayEmploymentVsEu,
];

const CARDS_PER_BATCH = 9;
const CARDS_PER_PAGE = 3;

/** Total number of non-overlapping batches (for "all" filter) */
export const TOTAL_BATCHES = Math.floor(STATS_BANK.length / CARDS_PER_BATCH);

// ============================================
// REGION HELPERS
// ============================================

/** Get all stats for a given region filter */
export function getStatsByRegion(region: RegionFilter): StatDatum[] {
  if (region === "all") return STATS_BANK;
  return STATS_BANK.filter((card) => card.region === region);
}

/** Get the total batch count for a region filter */
export function getBatchCount(region: RegionFilter): number {
  const pool = getStatsByRegion(region);
  return Math.max(1, Math.floor(pool.length / CARDS_PER_BATCH));
}

// ============================================
// BATCH SELECTION
// ============================================

/**
 * Get a batch of stat cards (up to 9 = 3 pages × 3 cards).
 * Seed 0 = first batch, seed 1 = next batch, etc.
 * Wraps around when exhausted.
 * Region filter: "all" | "global" | "norway"
 */
export function getStatsBatch(
  seed: number = 0,
  region: RegionFilter = "all",
): IndustryInsightsBatch {
  const pool = getStatsByRegion(region);
  const totalBatches = Math.max(1, Math.floor(pool.length / CARDS_PER_BATCH));
  const normalizedSeed = seed % totalBatches;
  const startIdx = normalizedSeed * CARDS_PER_BATCH;
  const cards = pool.slice(startIdx, startIdx + CARDS_PER_BATCH);

  // Build page labels from region grouping
  const pages: StatDatum[][] = [];
  for (let i = 0; i < cards.length; i += CARDS_PER_PAGE) {
    pages.push(cards.slice(i, i + CARDS_PER_PAGE));
  }

  const pageLabels: string[] = pages.map((page, idx) => {
    if (region === "norway") return idx === 0 ? "Norway Overview" : "Norway Focus";
    if (region === "global") return idx === 0 ? "Global Overview" : "Global Trends";
    // "all" — infer from content
    const hasNorway = page.some((c) => c.region === "norway");
    const hasGlobal = page.some((c) => c.region === "global");
    if (hasNorway && hasGlobal) return "Mixed Focus";
    if (hasNorway) return "Norway Focus";
    return idx === 0 && normalizedSeed === 0 ? "Global Overview" : "Global Trends";
  });

  return {
    seed: normalizedSeed,
    cards,
    pageLabels,
    datasetVersion: DATASET_VERSION,
    retrievedAt: DATASET_RETRIEVED_AT,
    totalAvailable: pool.length,
    hasMore: normalizedSeed < totalBatches - 1,
    regionFilter: region,
    totalBatches,
  };
}

// ============================================
// LEGACY EXPORTS (backward compatible)
// ============================================

const defaultBatch = getStatsBatch(0);

/** @deprecated Use getStatsBatch() instead */
export const JOB_MARKET_STATS_PAGES: StatDatum[][] = [
  defaultBatch.cards.slice(0, 3),
  defaultBatch.cards.slice(3, 6),
  defaultBatch.cards.slice(6, 9),
];

/** @deprecated Use getStatsBatch().pageLabels instead */
export const JOB_MARKET_PAGE_LABELS = defaultBatch.pageLabels;

/** @deprecated Use STATS_BANK instead */
export const ALL_JOB_MARKET_STATS: StatDatum[] = STATS_BANK;
