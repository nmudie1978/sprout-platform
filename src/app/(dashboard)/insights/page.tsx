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
} from "lucide-react";
import { motion } from "framer-motion";

// Import new insights components
import {
  InterviewPrepBank,
  CompanySpotlights,
  EventsCalendar,
  ProgressChecklist,
  SaveIndustryButton,
  NewsletterSignup,
} from "@/components/insights";

type IndustryFilter = "all" | "tech" | "green" | "health" | "creative";

export default function IndustryInsightsPage() {
  const { data: session } = useSession();
  const [activeSection, setActiveSection] = useState("industries");
  const [industryFilter, setIndustryFilter] = useState<IndustryFilter>("all");

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
    { id: "getting-started", label: "Get Started", icon: GraduationCap },
    { id: "progress-checklist", label: "Progress", icon: CheckCircle2 },
    { id: "interview-prep", label: "Interview Prep", icon: MessageSquare },
    { id: "companies", label: "Companies", icon: Building2 },
    { id: "events", label: "Events", icon: Calendar },
    { id: "skills", label: "Top Skills", icon: Zap },
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

  const featuredVideos = [
    { title: "How AI Will Change The Job Market", channel: "CNBC", videoId: "gWmRkYsLzB4", duration: "12:34", topic: "AI Impact" },
    { title: "Why You Will Fail to Have a Great Career", channel: "TEDx Talks", videoId: "iKHTawgyKWQ", duration: "15:00", topic: "Careers" },
    { title: "The First 20 Hours: How to Learn Anything", channel: "TEDx Talks", videoId: "5MgBikgcWnY", duration: "19:27", topic: "Skills" },
    { title: "Day in the Life: Software Developer", channel: "Tech Career Insider", videoId: "qMkRHW9zE1c", duration: "11:18", topic: "Tech" },
    { title: "How to Get Into the Trades Without Experience", channel: "Mike Rowe", videoId: "IRVdiHu1VCc", duration: "9:42", topic: "Trades" },
    { title: "Steve Jobs' Stanford Commencement Address", channel: "Stanford", videoId: "UF8uR6Z6KLc", duration: "15:05", topic: "Inspiration" },
    { title: "Grit: The Power of Passion and Perseverance", channel: "TED", videoId: "H14bBuluwB8", duration: "6:12", topic: "Success" },
    { title: "Your Body Language May Shape Who You Are", channel: "TED", videoId: "Ks-_Mh1QhMc", duration: "21:02", topic: "Interview Tips" },
  ];

  const filteredIndustries = industryFilter === "all"
    ? growingIndustries
    : growingIndustries.filter(i => i.id === industryFilter);

  // Industries filtered by user's career goals for the "How to Get Started" section
  const careerGoalIndustries = userIndustryTypes.length > 0
    ? growingIndustries.filter(i => userIndustryTypes.includes(i.id as IndustryFilter))
    : growingIndustries;

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
        description="Stay ahead with the latest trends, opportunities, and insights shaping the future of work"
        icon={TrendingUp}
      />

      {/* Sticky Section Navigation */}
      <div className="sticky top-0 z-40 -mx-4 px-4 py-3 bg-background/95 backdrop-blur-sm border-b mb-8">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeSection === section.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {section.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Personalization Filter */}
      <motion.div {...fadeInUp} className="mb-8">
        <Card className="border bg-muted/30">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                <span className="font-medium text-gray-700 dark:text-gray-300">What interests you?</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {industryFilters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setIndustryFilter(filter.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      industryFilter === filter.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-background border hover:border-primary"
                    }`}
                  >
                    {filter.icon && <filter.icon className="h-3.5 w-3.5" />}
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Growing Industries */}
      <motion.div {...fadeInUp} className="mb-12" id="industries">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Fastest Growing Industries</h2>
            <p className="text-muted-foreground">Where the opportunities are heading in 2025</p>
          </div>
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Updated: January 2025
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {filteredIndustries.map((industry, index) => {
            const Icon = industry.icon;
            return (
              <motion.div
                key={industry.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`overflow-hidden border-2 hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${industry.bgColor}`}>
                  <div className={`h-1.5 bg-gradient-to-r ${industry.color}`} />
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${industry.color} shadow-lg`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{industry.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                            <span className="font-bold text-green-600">{industry.growth}</span>
                            <span>growth this year</span>
                          </CardDescription>
                        </div>
                      </div>
                      <SaveIndustryButton industryId={industry.id} industryName={industry.name} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-2">Top Opportunities:</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {industry.jobs.map((job) => (
                          <Badge key={job} variant="secondary" className="bg-background/80">
                            {job}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <a
                          href={industry.articleLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline transition-all"
                        >
                          {industry.articleLabel}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <a
                          href={industry.sourceLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:underline"
                        >
                          Source: {industry.source}
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* How to Get Started - Filtered by user's career goals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-12"
        id="getting-started"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">How to Get Started</h2>
          <p className="text-muted-foreground">
            {userCareerGoals.length > 0
              ? `Your roadmap based on your career goals: ${userCareerGoals.join(", ")}`
              : "Your roadmap into each industry"}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {careerGoalIndustries.map((industry) => {
            const Icon = industry.icon;
            return (
              <Card key={industry.id} className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${industry.color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-lg">{industry.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Requirements to start:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                      {industry.howToStart.requirements.map((req) => (
                        <li key={req}>• {req}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      Timeline:
                    </p>
                    <p className="text-sm text-muted-foreground ml-6">{industry.howToStart.timeline}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-purple-600" />
                      Free resources:
                    </p>
                    <div className="flex flex-wrap gap-2 ml-6">
                      {industry.howToStart.freeResources.map((resource) => (
                        <a
                          key={resource.name}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          {resource.name}
                        </a>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-orange-600" />
                      Recommended certifications:
                    </p>
                    <div className="flex flex-wrap gap-1 ml-6">
                      {industry.howToStart.certifications.map((cert) => (
                        <Badge key={cert} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* Progress Checklist */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.22 }}
        className="mb-12"
        id="progress-checklist"
      >
        <ProgressChecklist />
      </motion.div>

      {/* Interview Prep Bank - Filtered by user's career goals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.41 }}
        className="mb-12"
        id="interview-prep"
      >
        <InterviewPrepBank
          careerGoals={userCareerGoals}
          industryTypes={userIndustryTypes}
        />
      </motion.div>

      {/* Company Spotlights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.42 }}
        className="mb-12"
        id="companies"
      >
        <CompanySpotlights industryTypes={userIndustryTypes} />
      </motion.div>

      {/* Events Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.43 }}
        className="mb-12"
        id="events"
      >
        <EventsCalendar industryTypes={userIndustryTypes} />
      </motion.div>

      {/* AI Impact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mb-12"
      >
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">AI's Impact on Jobs</h2>
            <p className="text-muted-foreground">How artificial intelligence is reshaping the job market</p>
          </div>
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            January 2025
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {aiImpact.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription className="mt-2 text-sm leading-relaxed">
                        {item.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border">
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {item.stat}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.statLabel}</p>
                  </div>
                  <a
                    href={item.sourceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:underline mt-3 block"
                  >
                    Source: {item.source}
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* In-Demand Skills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mb-12"
        id="skills"
      >
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Most In-Demand Skills</h2>
            <p className="text-muted-foreground">What employers are looking for in 2025</p>
          </div>
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            January 2025
          </Badge>
        </div>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {inDemandSkills.map((item, index) => (
                <div key={item.skill} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-muted-foreground/30">
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                      <div>
                        <p className="font-semibold">{item.skill}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">({item.source})</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">{item.demand}%</p>
                      <p className="text-xs text-muted-foreground">demand</p>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${item.demand}%` }}
                      transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Regional Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="mb-12"
      >
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <MapPin className="h-6 w-6" />
              Regional Market Insights
            </h2>
            <p className="text-muted-foreground">What's happening in the local job market</p>
          </div>
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            January 2025
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-2 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
            <CardHeader>
              <CardTitle className="text-lg">Popular Sectors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {regionalInsights.hotSectors.map((sector) => (
                  <div key={sector} className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{sector}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
            <CardHeader>
              <CardTitle className="text-lg">Youth Wages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                  {regionalInsights.avgYouthPay}
                </div>
                <p className="text-sm text-muted-foreground mt-2">Average hourly wage for young workers</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
            <CardHeader>
              <CardTitle className="text-lg">Employers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm leading-relaxed">{regionalInsights.topEmployers}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-right">
          Sources:{" "}
          <a href="https://www.nav.no" target="_blank" rel="noopener noreferrer" className="hover:underline">NAV</a>,{" "}
          <a href="https://www.ssb.no" target="_blank" rel="noopener noreferrer" className="hover:underline">SSB</a>
        </p>
      </motion.div>

      {/* Featured Videos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="mb-12"
        id="videos"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Youtube className="h-6 w-6 text-red-600" />
            Watch & Learn
          </h2>
          <p className="text-muted-foreground">Expert insights and career advice from top creators</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featuredVideos.map((video, index) => (
            <motion.a
              key={video.videoId}
              href={`https://www.youtube.com/watch?v=${video.videoId}`}
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
                    src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
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
                  <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/90 rounded text-white text-[10px] font-semibold">
                    {video.duration}
                  </div>
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

        <div className="mt-6 p-4 rounded-xl bg-muted/50 border text-center">
          <p className="text-sm text-muted-foreground">
            These videos open in YouTube. We've curated content from trusted sources to help you stay informed.
          </p>
        </div>
      </motion.div>

      {/* Newsletter Signup */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.3 }}
        className="mb-12"
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
            <p className="text-xs text-muted-foreground mt-3">
              Last updated: January 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
