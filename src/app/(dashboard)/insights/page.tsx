"use client";

import { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { getMultipleCareerJourneys, type MultipleCareerJourneys } from "@/lib/my-path/actions";
import {
  TrendingUp,
  Sparkles,
  Briefcase,
  Users,
  Zap,
  ArrowUpRight,
  Brain,
  Wrench,
  Heart,
  Code,
  ChevronRight,
  Filter,
  Youtube,
  Play,
  ExternalLink,
  GraduationCap,
  Clock,
  BookOpen,
  Calendar,
  MapPin,
  CheckCircle2,
  MessageSquare,
  Building2,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";

// Import new insights components
import {
  InterviewPrepBank,
  CompanySpotlights,
  EventsCalendar,
  ProgressChecklist,
  HowToStart,
  SaveIndustryButton,
  NewsletterSignup,
  IndustrySnapshot,
} from "@/components/insights";

type IndustryFilter = "all" | "tech" | "green" | "health" | "creative";

export default function IndustryInsightsPage() {
  const { data: session } = useSession();
  const [activeSection, setActiveSection] = useState("industries");
  const [industryFilter, setIndustryFilter] = useState<IndustryFilter>("all");
  const [showAlternateVideos, setShowAlternateVideos] = useState(false);

  // Fetch user's career goals
  const { data: careerData } = useQuery<MultipleCareerJourneys | null>({
    queryKey: ["multiple-career-journeys"],
    queryFn: () => getMultipleCareerJourneys(),
    enabled: session?.user?.role === "YOUTH",
  });

  // Extract career goal titles for filtering
  const userCareerGoals = careerData?.journeys?.map(j => j.targetCareer.title) || [];

  // Map career goals to industry types based on career category
  const getIndustryFromCareer = (careerTitle: string): IndustryFilter => {
    const lowerTitle = careerTitle.toLowerCase();
    if (lowerTitle.includes("developer") || lowerTitle.includes("software") ||
        lowerTitle.includes("data") || lowerTitle.includes("tech") ||
        lowerTitle.includes("engineer") || lowerTitle.includes("it ") ||
        lowerTitle.includes("cyber") || lowerTitle.includes("ai")) {
      return "tech";
    }
    if (lowerTitle.includes("energy") || lowerTitle.includes("wind") ||
        lowerTitle.includes("solar") || lowerTitle.includes("electric") ||
        lowerTitle.includes("green") || lowerTitle.includes("sustain")) {
      return "green";
    }
    if (lowerTitle.includes("health") || lowerTitle.includes("nurse") ||
        lowerTitle.includes("medical") || lowerTitle.includes("care") ||
        lowerTitle.includes("doctor") || lowerTitle.includes("pharmacy")) {
      return "health";
    }
    if (lowerTitle.includes("design") || lowerTitle.includes("creative") ||
        lowerTitle.includes("content") || lowerTitle.includes("market") ||
        lowerTitle.includes("media") || lowerTitle.includes("video") ||
        lowerTitle.includes("art") || lowerTitle.includes("music")) {
      return "creative";
    }
    return "tech"; // Default fallback
  };

  // Get user's industry types from their career goals
  const userIndustryTypes = [...new Set(userCareerGoals.map(getIndustryFromCareer))];

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  const sections = [
    { id: "industries", label: "Industries", icon: TrendingUp },
    { id: "getting-started", label: "Prepare", icon: GraduationCap },
    { id: "interview-prep", label: "Interview", icon: MessageSquare },
    { id: "companies", label: "Companies", icon: Building2 },
    { id: "events", label: "Events", icon: Calendar },
    { id: "skills", label: "Market", icon: Zap },
    { id: "videos", label: "Videos", icon: Youtube },
  ];

  const industryFilters = [
    { id: "all" as IndustryFilter, label: "All", icon: null },
    { id: "tech" as IndustryFilter, label: "Tech & AI", icon: Code },
    { id: "green" as IndustryFilter, label: "Green Energy", icon: Wrench },
    { id: "health" as IndustryFilter, label: "Healthcare", icon: Heart },
    { id: "creative" as IndustryFilter, label: "Creative", icon: Sparkles },
  ];

  const growingIndustries = [
    {
      id: "tech",
      name: "Technology & AI",
      growth: "+23%",
      icon: Code,
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30",
      jobs: ["Developer", "Data Analyst", "AI Specialist", "IT Support"],
      articleLink: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/digest/",
      articleLabel: "Read about tech job trends",
      lastUpdated: "January 2025",
      source: "Labor Market Statistics",
      sourceLink: "https://www.bls.gov",
      remoteScore: 95,
      entryDifficulty: "Medium",
      avgSalary: "$60-90k",
      howToStart: {
        requirements: ["Basic programming", "English", "Problem solving"],
        timeline: "6-12 months self-study or bootcamp",
        freeResources: [
          { name: "freeCodeCamp", url: "https://www.freecodecamp.org" },
          { name: "Codecademy", url: "https://www.codecademy.com" },
          { name: "CS50 (Harvard)", url: "https://cs50.harvard.edu" },
        ],
        certifications: ["Google IT Support", "AWS Cloud Practitioner", "Meta Frontend Developer"],
      },
    },
    {
      id: "green",
      name: "Green Energy & Maritime",
      growth: "+20%",
      icon: Wrench,
      color: "from-green-500 to-teal-500",
      bgColor: "from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30",
      jobs: ["Wind Turbine Technician", "Electrician", "Marine Mechanic", "Energy Advisor"],
      articleLink: "https://www.irena.org/Publications/2026/Jan/Renewable-energy-and-jobs-Annual-review-2025",
      articleLabel: "Read about green energy jobs",
      lastUpdated: "January 2025",
      source: "Energy Statistics",
      sourceLink: "https://www.eia.gov",
      remoteScore: 20,
      entryDifficulty: "Medium-High",
      avgSalary: "$55-75k",
      howToStart: {
        requirements: ["Trade certification", "Safety training", "Physical fitness"],
        timeline: "2-4 year apprenticeship",
        freeResources: [
          { name: "Energy.gov", url: "https://www.energy.gov/eere/wind/wind-energy-technologies-office" },
          { name: "OSHA Training", url: "https://www.osha.gov/training" },
          { name: "Trade Schools", url: "https://www.trade-schools.net" },
        ],
        certifications: ["Journeyman Electrician", "Wind Turbine Certification", "GWO Basic Safety"],
      },
    },
    {
      id: "health",
      name: "Healthcare",
      growth: "+18%",
      icon: Heart,
      color: "from-red-500 to-pink-500",
      bgColor: "from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30",
      jobs: ["Healthcare Worker", "Nurse", "Pharmacy Assistant", "Mental Health"],
      articleLink: "https://www.bls.gov/ooh/healthcare/",
      articleLabel: "Read about healthcare careers",
      lastUpdated: "December 2024",
      source: "Bureau of Labor Statistics",
      sourceLink: "https://www.bls.gov/ooh/healthcare/",
      remoteScore: 15,
      entryDifficulty: "Medium",
      avgSalary: "$45-70k",
      howToStart: {
        requirements: ["Healthcare education", "Empathy and communication", "Language skills"],
        timeline: "2-4 years education + practice",
        freeResources: [
          { name: "Khan Academy Health", url: "https://www.khanacademy.org/science/health-and-medicine" },
          { name: "Coursera Healthcare", url: "https://www.coursera.org/browse/health" },
          { name: "Red Cross Training", url: "https://www.redcross.org/take-a-class" },
        ],
        certifications: ["CNA Certification", "Healthcare License"],
      },
    },
    {
      id: "creative",
      name: "Creative Services",
      growth: "+14%",
      icon: Sparkles,
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30",
      jobs: ["Content Creator", "Graphic Designer", "Video Editor", "Social Media"],
      articleLink: "https://www.skillshare.com/en/blog/creative-jobs-2025/",
      articleLabel: "Read about creative careers",
      lastUpdated: "January 2025",
      source: "Creative Industry Report",
      sourceLink: "https://www.adobe.com/creativecloud",
      remoteScore: 85,
      entryDifficulty: "Low-Medium",
      avgSalary: "$40-65k",
      howToStart: {
        requirements: ["Portfolio of work", "Creative tools (Adobe, Figma)", "Self-promotion"],
        timeline: "3-6 months to build portfolio",
        freeResources: [
          { name: "Skillshare", url: "https://www.skillshare.com" },
          { name: "Canva Design School", url: "https://www.canva.com/designschool" },
          { name: "YouTube Creator Academy", url: "https://creatoracademy.youtube.com" },
        ],
        certifications: ["Google Digital Marketing", "Meta Social Media Marketing", "Adobe Certified"],
      },
    },
  ];

  const inDemandSkills = [
    { skill: "Digital Literacy", demand: 95, category: "Essential", source: "NAV Kompetansebarometer" },
    { skill: "Communication", demand: 92, category: "Essential", source: "NHO Kompetanseundersøkelse" },
    { skill: "Problem Solving", demand: 88, category: "Essential", source: "NAV Kompetansebarometer" },
    { skill: "AI Tools (ChatGPT, etc)", demand: 85, category: "Emerging", source: "Abelia Tech-rapport" },
    { skill: "Basic Coding", demand: 78, category: "Technical", source: "IKT-Norge" },
    { skill: "Data Analysis", demand: 72, category: "Technical", source: "SSB" },
    { skill: "Social Media Marketing", demand: 68, category: "Creative", source: "Kreativt Forum" },
    { skill: "Customer Service", demand: 90, category: "Essential", source: "Virke Handelsrapport" },
  ];

  const aiImpact = [
    {
      title: "AI Creates New Jobs",
      description: "70% of companies are hiring for AI-related roles that didn't exist 3 years ago.",
      stat: "150,000+",
      statLabel: "new tech jobs annually",
      icon: Brain,
      source: "World Economic Forum",
      sourceLink: "https://www.weforum.org",
    },
    {
      title: "Automation = More Human Roles",
      description: "As AI takes over routine tasks, demand increases for creative and social skills.",
      stat: "45%",
      statLabel: "increase in care professions",
      icon: Users,
      source: "Bureau of Labor Statistics",
      sourceLink: "https://www.bls.gov",
    },
    {
      title: "Skills Over Degrees",
      description: "Employers increasingly value practical skills and certifications over traditional degrees.",
      stat: "3x",
      statLabel: "faster hiring with trade certs",
      icon: Zap,
      source: "LinkedIn",
      sourceLink: "https://www.linkedin.com/pulse/skills-first",
    },
  ];

  const regionalInsights = {
    hotSectors: ["Tech Hubs", "Renewable Energy", "Healthcare", "Tourism & Hospitality"],
    avgYouthPay: "$15-25/hour",
    topEmployers: "Small & medium businesses employ 60% of young workers",
  };

  // Fetch videos from database with freshness system
  const { data: videosData, isLoading: isLoadingVideos } = useQuery({
    queryKey: ["industry-insight-videos", industryFilter],
    queryFn: async () => {
      const params = industryFilter !== "all" ? `?industry=${industryFilter}` : "";
      const response = await fetch(`/api/insights/videos${params}`);
      if (!response.ok) throw new Error("Failed to fetch videos");
      return response.json();
    },
  });

  // Fetch insights modules verification status
  const { data: modulesData } = useQuery({
    queryKey: ["insights-modules-meta"],
    queryFn: async () => {
      const response = await fetch("/api/insights/modules");
      if (!response.ok) throw new Error("Failed to fetch modules");
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const featuredVideos = videosData?.videos || [];

  // Fallback videos if database is empty (for initial load before seeding)
  const fallbackVideos = [
    { id: "1", title: "How AI Will Change The Job Market", channel: "CNBC", videoUrl: "gWmRkYsLzB4", duration: "12:34", topic: "AI Impact", thumbnail: "https://img.youtube.com/vi/gWmRkYsLzB4/mqdefault.jpg", freshness: { label: "Current", variant: "default" as const } },
    { id: "2", title: "Why You Will Fail to Have a Great Career", channel: "TEDx Talks", videoUrl: "iKHTawgyKWQ", duration: "15:00", topic: "Careers", thumbnail: "https://img.youtube.com/vi/iKHTawgyKWQ/mqdefault.jpg", freshness: { label: "Current", variant: "default" as const } },
    { id: "3", title: "The First 20 Hours: How to Learn Anything", channel: "TEDx Talks", videoUrl: "5MgBikgcWnY", duration: "19:27", topic: "Skills", thumbnail: "https://img.youtube.com/vi/5MgBikgcWnY/mqdefault.jpg", freshness: { label: "Current", variant: "default" as const } },
    { id: "4", title: "Day in the Life: Software Developer", channel: "Tech Career Insider", videoUrl: "qMkRHW9zE1c", duration: "11:18", topic: "Tech", thumbnail: "https://img.youtube.com/vi/qMkRHW9zE1c/mqdefault.jpg", freshness: { label: "Current", variant: "default" as const } },
  ];

  // Alternate videos for "refresh" feature
  const alternateVideos = [
    { id: "a1", title: "How to Get a Job With No Experience", channel: "Ali Abdaal", videoUrl: "3mxZHDdUbCQ", duration: "14:22", topic: "Careers", thumbnail: "https://img.youtube.com/vi/3mxZHDdUbCQ/mqdefault.jpg", freshness: { label: "Current", variant: "default" as const } },
    { id: "a2", title: "The Future of Work: AI and Jobs", channel: "Bloomberg", videoUrl: "z2_TpP2v86A", duration: "10:45", topic: "AI Impact", thumbnail: "https://img.youtube.com/vi/z2_TpP2v86A/mqdefault.jpg", freshness: { label: "Current", variant: "default" as const } },
    { id: "a3", title: "5 Skills That Will Get You Hired", channel: "Indeed", videoUrl: "Uo3cL4nrGOk", duration: "8:30", topic: "Skills", thumbnail: "https://img.youtube.com/vi/Uo3cL4nrGOk/mqdefault.jpg", freshness: { label: "Current", variant: "default" as const } },
    { id: "a4", title: "How to Build Your Personal Brand", channel: "Gary Vee", videoUrl: "JQzQVGEBpg0", duration: "12:15", topic: "Branding", thumbnail: "https://img.youtube.com/vi/JQzQVGEBpg0/mqdefault.jpg", freshness: { label: "Current", variant: "default" as const } },
  ];

  const primaryVideos = featuredVideos.length > 0 ? featuredVideos : fallbackVideos;
  const displayVideos = showAlternateVideos ? alternateVideos : primaryVideos;

  const filteredIndustries = industryFilter === "all"
    ? growingIndustries.slice(0, 2) // Show only top 2 for compact display
    : growingIndustries.filter(i => i.id === industryFilter);

  // Industries filtered by user's career goals for the "How to Get Started" section
  const careerGoalIndustries = userIndustryTypes.length > 0
    ? growingIndustries.filter(i => userIndustryTypes.includes(i.id as IndustryFilter)).slice(0, 2)
    : growingIndustries.slice(0, 2); // Show only top 2 for compact display

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };


  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />

      <PageHeader
        title="Industry"
        gradientText="Insights"
        description="Job market trends, preparation resources, and career opportunities"
        icon={TrendingUp}
      />

      {/* Sticky Section Navigation */}
      <div className="sticky top-0 z-40 -mx-4 px-4 py-2 bg-background/95 backdrop-blur-sm border-b mb-6">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  activeSection === section.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                <Icon className="h-3 w-3" />
                {section.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Industry Snapshot - Featured Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6"
      >
        <IndustrySnapshot />
      </motion.div>

      {/* Industry Filter */}
      <motion.div {...fadeInUp} className="mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {industryFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setIndustryFilter(filter.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-all ${
                  industryFilter === filter.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {filter.icon && <filter.icon className="h-3 w-3" />}
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Growing Industries - Compact */}
      <motion.div {...fadeInUp} className="mb-6" id="industries">
        <Card className="border-2 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 via-green-500 to-purple-500" />
          <CardHeader className="pb-2 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-primary" />
                Fastest Growing Industries
              </CardTitle>
              <Badge variant="outline" className="text-[10px]">2025</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {filteredIndustries.map((industry) => {
                const Icon = industry.icon;
                return (
                  <div key={industry.name} className="flex items-center gap-3 p-2 rounded-lg border hover:bg-muted/30 transition-colors">
                    <div className={`p-1.5 rounded-md bg-gradient-to-br ${industry.color}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{industry.name}</span>
                        <span className="text-xs font-bold text-green-600">{industry.growth}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {industry.jobs.slice(0, 3).map((job) => (
                          <Badge key={job} variant="secondary" className="text-[9px] px-1.5 py-0">{job}</Badge>
                        ))}
                      </div>
                    </div>
                    <SaveIndustryButton industryId={industry.id} industryName={industry.name} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Preparation Zone: How to Start + Progress Checklist - Side by Side */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-6"
        id="getting-started"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <HowToStart industryTypes={userIndustryTypes} />
          <div id="progress-checklist">
            <ProgressChecklist />
          </div>
        </div>
      </motion.div>

      {/* Interview Prep Bank - Compact standalone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="mb-6"
        id="interview-prep"
      >
        <InterviewPrepBank />
      </motion.div>

      {/* Company Spotlights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.42 }}
        className="mb-6"
        id="companies"
      >
        <CompanySpotlights industryTypes={userIndustryTypes} />
      </motion.div>

      {/* Events Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.43 }}
        className="mb-6"
        id="events"
      >
        <EventsCalendar industryTypes={userIndustryTypes} />
      </motion.div>

      {/* Market Data - Combined AI/Skills/Regional in 3 columns */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mb-6"
        id="skills"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {/* AI Impact */}
          <Card className="border-2 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
            <CardHeader className="pb-2 pt-3">
              <CardTitle className="flex items-center gap-1.5 text-sm">
                <Brain className="h-3.5 w-3.5 text-purple-600" />
                AI Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-1.5">
              {aiImpact.slice(0, 2).map((item) => (
                <div key={item.title} className="flex items-center gap-2">
                  <span className="text-base font-bold text-purple-600">{item.stat}</span>
                  <span className="text-[9px] text-muted-foreground truncate">{item.statLabel}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Skills */}
          <Card className="border-2 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-primary to-blue-500" />
            <CardHeader className="pb-2 pt-3">
              <CardTitle className="flex items-center gap-1.5 text-sm">
                <Zap className="h-3.5 w-3.5 text-primary" />
                Top Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-1">
              {inDemandSkills.slice(0, 3).map((item, index) => (
                <div key={item.skill} className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-primary w-4">{index + 1}</span>
                  <span className="flex-1 truncate">{item.skill}</span>
                  <span className="font-medium text-primary">{item.demand}%</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Regional */}
          <Card className="border-2 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-green-500 to-teal-500" />
            <CardHeader className="pb-2 pt-3">
              <CardTitle className="flex items-center gap-1.5 text-sm">
                <MapPin className="h-3.5 w-3.5 text-green-600" />
                Regional
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Youth Wages</span>
                <span className="text-sm font-bold text-green-600">{regionalInsights.avgYouthPay}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {regionalInsights.hotSectors.slice(0, 2).map((sector) => (
                  <Badge key={sector} variant="secondary" className="text-[8px] px-1 py-0">{sector}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Featured Videos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="mb-6"
        id="videos"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-600" />
            <h2 className="text-base font-bold">Watch & Learn</h2>
          </div>
          <button
            onClick={() => setShowAlternateVideos(!showAlternateVideos)}
            className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-full border hover:bg-muted transition-colors"
          >
            <RefreshCw className={`h-3 w-3 ${showAlternateVideos ? "text-primary" : ""}`} />
            {showAlternateVideos ? "Default" : "Refresh"}
          </button>
        </div>

        {isLoadingVideos ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden border animate-pulse">
                <div className="aspect-video bg-muted" />
                <CardContent className="p-3">
                  <div className="h-4 bg-muted rounded w-16 mb-2" />
                  <div className="h-4 bg-muted rounded w-full mb-1" />
                  <div className="h-3 bg-muted rounded w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayVideos.map((video: any, index: number) => (
              <motion.a
                key={video.id}
                href={`https://www.youtube.com/watch?v=${video.videoUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 1.3 + index * 0.05 }}
              >
                <Card className="overflow-hidden border hover:border-red-500 transition-all duration-300 hover:shadow-lg h-full">
                  <div className="relative aspect-video overflow-hidden bg-black">
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-red-600 group-hover:bg-red-700 group-hover:scale-110 transition-all flex items-center justify-center shadow-xl">
                        <Play className="h-6 w-6 text-white ml-0.5" fill="white" />
                      </div>
                    </div>
                    {video.duration && (
                      <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/90 rounded text-white text-[10px] font-semibold">
                        {video.duration}
                      </div>
                    )}
                    {/* Freshness badge */}
                    {video.freshness?.label === "Recently updated" && (
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-green-600 rounded text-white text-[10px] font-semibold flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        New
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2 mb-2">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400">
                        {video.topic}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-red-600 transition-colors mb-1">
                      {video.title}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      {video.channel}
                    </p>
                  </CardContent>
                </Card>
              </motion.a>
            ))}
          </div>
        )}

        <div className="mt-4 p-3 rounded-lg bg-muted/50 border text-center">
          <p className="text-xs text-muted-foreground">
            Click "Refresh Content" for more videos. All videos open in YouTube.
          </p>
        </div>
      </motion.div>

      {/* Newsletter Signup */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.3 }}
        className="mb-6"
      >
        <NewsletterSignup />
      </motion.div>

      {/* Data Source Note */}
      <div className="mt-12 p-6 rounded-xl bg-muted/30 border">
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="font-medium mb-2">About the Data</p>
            <p className="text-sm text-muted-foreground mb-3">
              All statistics are sourced from official labor market data and updated regularly.
            </p>
            <div className="flex flex-wrap gap-3 text-xs">
              <a href="https://www.bls.gov" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Bureau of Labor Statistics
              </a>
              <a href="https://www.weforum.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                World Economic Forum
              </a>
              <a href="https://www.oecd.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                OECD
              </a>
              <a href="https://www.linkedin.com/pulse/skills-first" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                LinkedIn Economic Graph
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Status Footer */}
      <div className="mt-6 flex items-center justify-center gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>Updated regularly</span>
        </div>
        {modulesData?.meta?.allVerifiedThisQuarter && (
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span>Verified this quarter</span>
          </div>
        )}
      </div>
    </div>
  );
}
