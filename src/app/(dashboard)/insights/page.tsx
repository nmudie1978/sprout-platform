"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
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
  Youtube,
  Play,
  ExternalLink,
  GraduationCap,
  Clock,
  BookOpen,
  Quote,
  Laptop,
  Home,
  Calendar,
  MapPin,
  CheckCircle2,
  Star,
  ArrowRight,
  Filter,
} from "lucide-react";
import { motion } from "framer-motion";

type IndustryFilter = "all" | "tech" | "green" | "health" | "creative";

export default function IndustryInsightsPage() {
  const [activeSection, setActiveSection] = useState("industries");
  const [industryFilter, setIndustryFilter] = useState<IndustryFilter>("all");
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  const sections = [
    { id: "industries", label: "Industries", icon: TrendingUp },
    { id: "getting-started", label: "Get Started", icon: GraduationCap },
    { id: "success-stories", label: "Stories", icon: Star },
    { id: "remote-work", label: "Remote Work", icon: Laptop },
    { id: "apprenticeships", label: "Lærlingplass", icon: BookOpen },
    { id: "compare", label: "Compare", icon: Filter },
    { id: "skills", label: "Skills", icon: Zap },
    { id: "salaries", label: "Salaries", icon: Briefcase },
    { id: "videos", label: "Videos", icon: Youtube },
  ];

  const industryFilters = [
    { id: "all" as IndustryFilter, label: "Alle", icon: null },
    { id: "tech" as IndustryFilter, label: "Tech & AI", icon: Code },
    { id: "green" as IndustryFilter, label: "Grønn Energi", icon: Wrench },
    { id: "health" as IndustryFilter, label: "Helse", icon: Heart },
    { id: "creative" as IndustryFilter, label: "Kreativ", icon: Sparkles },
  ];

  const growingIndustries = [
    {
      id: "tech",
      name: "Technology & AI",
      growth: "+23%",
      icon: Code,
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30",
      jobs: ["Utvikler", "Data Analyst", "AI-spesialist", "IT-support"],
      articleLink: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/digest/",
      articleLabel: "Read about tech job trends",
      lastUpdated: "Januar 2025",
      source: "NAV Arbeidsmarkedsstatistikk",
      sourceLink: "https://www.nav.no/arbeid",
      remoteScore: 95,
      entryDifficulty: "Medium",
      avgSalary: "450-650k",
      howToStart: {
        requirements: ["Grunnleggende programmering", "Engelsk", "Problemløsning"],
        timeline: "6-12 måneder selvstudium eller bootcamp",
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
      name: "Grønn Energi & Maritim",
      growth: "+20%",
      icon: Wrench,
      color: "from-green-500 to-teal-500",
      bgColor: "from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30",
      jobs: ["Havvind-tekniker", "Elektriker", "Skipsmekaniker", "Energirådgiver"],
      articleLink: "https://www.irena.org/Publications/2026/Jan/Renewable-energy-and-jobs-Annual-review-2025",
      articleLabel: "Read about green energy jobs",
      lastUpdated: "Januar 2025",
      source: "SSB Energistatistikk",
      sourceLink: "https://www.ssb.no/energi-og-industri",
      remoteScore: 20,
      entryDifficulty: "Medium-High",
      avgSalary: "420-580k",
      howToStart: {
        requirements: ["Fagbrev i relevant fag", "HMS-kurs", "Fysisk god form"],
        timeline: "2-4 år lærlingløp",
        freeResources: [
          { name: "Vilbli.no", url: "https://www.vilbli.no" },
          { name: "Energi Norge", url: "https://www.energinorge.no" },
          { name: "Offshore.no", url: "https://www.offshore.no" },
        ],
        certifications: ["Fagbrev Energimontør", "Havvind-sertifisering", "GWO Basic Safety"],
      },
    },
    {
      id: "health",
      name: "Helse & Omsorg",
      growth: "+18%",
      icon: Heart,
      color: "from-red-500 to-pink-500",
      bgColor: "from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30",
      jobs: ["Helsefagarbeider", "Sykepleier", "Apotek-assistent", "Psykisk helse"],
      articleLink: "https://www.bls.gov/ooh/healthcare/",
      articleLabel: "Read about healthcare careers",
      lastUpdated: "Desember 2024",
      source: "SSB Helsepersonellstatistikk",
      sourceLink: "https://www.ssb.no/helse",
      remoteScore: 15,
      entryDifficulty: "Medium",
      avgSalary: "380-550k",
      howToStart: {
        requirements: ["Helse- og oppvekstfag VG1", "Empati og kommunikasjon", "Norskkunnskaper"],
        timeline: "2-4 år videregående + praksis",
        freeResources: [
          { name: "Helsedirektoratet", url: "https://www.helsedirektoratet.no" },
          { name: "Utdanning.no - Helse", url: "https://utdanning.no/tema/helse" },
          { name: "NSF (Sykepleierforbundet)", url: "https://www.nsf.no" },
        ],
        certifications: ["Fagbrev Helsefagarbeider", "Autorisasjon Helsepersonell"],
      },
    },
    {
      id: "creative",
      name: "Kreative Tjenester",
      growth: "+14%",
      icon: Sparkles,
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30",
      jobs: ["Innholdsskaper", "Grafisk designer", "Videoredigerer", "Sosiale medier"],
      articleLink: "https://www.skillshare.com/en/blog/creative-jobs-2025/",
      articleLabel: "Read about creative careers",
      lastUpdated: "Januar 2025",
      source: "Kreativt Forum Bransjeanalyse",
      sourceLink: "https://www.kreativtforum.no",
      remoteScore: 85,
      entryDifficulty: "Low-Medium",
      avgSalary: "350-550k",
      howToStart: {
        requirements: ["Portefølje med arbeid", "Kreative verktøy (Adobe, Figma)", "Selvpromotering"],
        timeline: "3-6 måneder for å bygge portefølje",
        freeResources: [
          { name: "Skillshare", url: "https://www.skillshare.com" },
          { name: "Canva Design School", url: "https://www.canva.com/designschool" },
          { name: "YouTube Creator Academy", url: "https://creatoracademy.youtube.com" },
        ],
        certifications: ["Google Digital Marketing", "Meta Social Media Marketing", "Adobe Certified"],
      },
    },
  ];

  const successStories = [
    {
      name: "Emma (22)",
      role: "Junior Frontend Utvikler",
      company: "Teknologibedrift i Oslo",
      industry: "tech",
      image: "👩‍💻",
      quote: "Jeg lærte meg koding gjennom gratis nettkurs mens jeg jobbet deltid på kafe. Etter 8 måneder fikk jeg min første tech-jobb.",
      path: "Selvlært → Bootcamp → Junior stilling",
      tip: "Start med ett språk (JavaScript) og bygg prosjekter du kan vise frem.",
    },
    {
      name: "Lars (24)",
      role: "Havvind-tekniker",
      company: "Equinor",
      industry: "green",
      image: "👷",
      quote: "Fagbrevet mitt åpnet dører jeg ikke visste fantes. Nå jobber jeg offshore med god lønn og meningsfylt arbeid.",
      path: "VGS Elektro → Lærling → Fagbrev → Havvind",
      tip: "Fagbrev er gull verdt. Ikke undervurder yrkesfag!",
    },
    {
      name: "Amina (21)",
      role: "Helsefagarbeider",
      company: "Oslo Universitetssykehus",
      industry: "health",
      image: "👩‍⚕️",
      quote: "Jeg visste jeg ville jobbe med mennesker. Helsefagutdanningen ga meg både trygghet og mening i jobben.",
      path: "Helse VGS → Lærling → Fast stilling",
      tip: "Sommerjobber og frivillighet på sykehjem gir verdifull erfaring.",
    },
    {
      name: "Oliver (23)",
      role: "Innholdsskaper & Designer",
      company: "Frilanser",
      industry: "creative",
      image: "🎨",
      quote: "Jeg startet med å lage grafikk for venners småbedrifter gratis. Nå har jeg egen kundeliste og setter mine egne priser.",
      path: "Hobby → Portefølje → Frilanser",
      tip: "Del arbeidet ditt på sosiale medier. Kunder finner deg når de ser hva du kan.",
    },
  ];

  const remoteWorkData = {
    lastUpdated: "Januar 2025",
    source: "NAV & Finn.no jobbstatistikk",
    stats: [
      { label: "Remote-vennlige stillinger", value: "34%", change: "+12% fra 2023" },
      { label: "Hybrid-jobber tilgjengelig", value: "48%", change: "+8% fra 2023" },
      { label: "Unge som foretrekker fleksibilitet", value: "78%", change: "" },
    ],
    topRemoteJobs: [
      { role: "Utvikler / Programmerer", remoteScore: 95, avgPay: "450-650k" },
      { role: "Digital Markedsfører", remoteScore: 90, avgPay: "380-500k" },
      { role: "Grafisk Designer", remoteScore: 85, avgPay: "350-480k" },
      { role: "Kundeservice (chat/telefon)", remoteScore: 80, avgPay: "320-420k" },
      { role: "Tekstforfatter / Content", remoteScore: 85, avgPay: "380-520k" },
    ],
    tips: [
      "Bygg en sterk digital tilstedeværelse (LinkedIn, portefølje)",
      "Lær deg samarbeidsverktøy (Slack, Teams, Notion)",
      "Vis selvstendighet og kommunikasjonsevner i søknaden",
      "Vurder å starte som frilanser for å bygge erfaring",
    ],
  };

  const apprenticeshipData = {
    lastUpdated: "Januar 2025",
    source: "Utdanningsdirektoratet",
    sourceLink: "https://www.udir.no",
    stats: {
      openPositions: "12 500+",
      avgMonthlyPay: "8 000 - 14 000 kr",
      completionRate: "72%",
    },
    topFields: [
      { field: "Elektrofag", positions: 2800, growth: "+15%" },
      { field: "Helse- og oppvekstfag", positions: 3200, growth: "+22%" },
      { field: "Bygg- og anleggsteknikk", positions: 2100, growth: "+10%" },
      { field: "Teknikk og industriell produksjon", positions: 1900, growth: "+18%" },
      { field: "Restaurant- og matfag", positions: 1400, growth: "+5%" },
    ],
    benefits: [
      "Lønn under opplæring",
      "Praktisk erfaring fra dag én",
      "Høy sannsynlighet for fast jobb",
      "Fagbrev er etterspurt i arbeidsmarkedet",
      "Mulighet for videreutdanning senere",
    ],
    resources: [
      { name: "Lærlingportalen", url: "https://www.larlingportalen.no" },
      { name: "Vilbli.no", url: "https://www.vilbli.no" },
      { name: "Finn.no Lærlingplasser", url: "https://www.finn.no/job/browse.html?occupation=0.81" },
    ],
  };

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
      title: "AI Skaper Nye Jobber",
      description: "70% av norske bedrifter ansetter for AI-relaterte roller som ikke fantes for 3 år siden.",
      stat: "15 000+",
      statLabel: "nye tech-jobber i Norge årlig",
      icon: Brain,
      source: "Abelia",
      sourceLink: "https://www.abelia.no",
    },
    {
      title: "Automatisering = Flere Menneskelige Roller",
      description: "Når AI tar over rutineoppgaver, øker etterspørselen etter kreative og sosiale ferdigheter.",
      stat: "45%",
      statLabel: "økning i omsorgsyrker",
      icon: Users,
      source: "SSB",
      sourceLink: "https://www.ssb.no",
    },
    {
      title: "Kompetanse Over Utdanning",
      description: "Norske arbeidsgivere verdsetter praktiske ferdigheter og fagbrev mer enn før.",
      stat: "3x",
      statLabel: "raskere ansettelse med fagbrev",
      icon: Zap,
      source: "NAV",
      sourceLink: "https://www.nav.no",
    },
  ];

  const salaryTrends = [
    { role: "Junior Utvikler", avgPay: "450-600k kr", demand: "Very High", entry: "Bootcamp/Selvlært", source: "Kode24 Lønnsundersøkelse" },
    { role: "Fagarbeider", avgPay: "420-580k kr", demand: "High", entry: "Lærlingplass", source: "SSB Lønnsstatistikk" },
    { role: "Helsefagarbeider", avgPay: "380-500k kr", demand: "Very High", entry: "Fagbrev", source: "KS Tariffstatistikk" },
    { role: "Innholdsskaper", avgPay: "350-550k kr", demand: "Growing", entry: "Portefølje", source: "Kreativt Forum" },
  ];

  const regionalInsights = {
    hotSectors: ["Tech i Oslo", "Havvind & Energi", "Havbruk & Sjømat", "Turisme & Reiseliv"],
    avgYouthPay: "150-250 kr/time",
    topEmployers: "Norske SMB-er ansetter 60% av ungdomsarbeidere",
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

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const toggleIndustryCompare = (industryId: string) => {
    if (selectedIndustries.includes(industryId)) {
      setSelectedIndustries(selectedIndustries.filter(id => id !== industryId));
    } else if (selectedIndustries.length < 3) {
      setSelectedIndustries([...selectedIndustries, industryId]);
    }
  };

  const comparedIndustries = growingIndustries.filter(i => selectedIndustries.includes(i.id));

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
        <Card className="border-2 bg-gradient-to-r from-primary/5 to-purple-500/5">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                <span className="font-semibold">Hva interesserer deg?</span>
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
            Oppdatert: Januar 2025
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
                          Kilde: {industry.source}
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

      {/* How to Get Started */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-12"
        id="getting-started"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">How to Get Started</h2>
          <p className="text-muted-foreground">Your roadmap into each industry</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {filteredIndustries.map((industry) => {
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
                      Krav for å starte:
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
                      Tidsramme:
                    </p>
                    <p className="text-sm text-muted-foreground ml-6">{industry.howToStart.timeline}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-purple-600" />
                      Gratis ressurser:
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
                      Anbefalte sertifiseringer:
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

      {/* Success Stories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-12"
        id="success-stories"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Success Stories</h2>
          <p className="text-muted-foreground">Real journeys from young Norwegians who made it</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {successStories
            .filter(story => industryFilter === "all" || story.industry === industryFilter)
            .map((story, index) => (
              <motion.div
                key={story.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="border-2 hover:shadow-lg transition-shadow h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{story.image}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold">{story.name}</h3>
                          <Badge variant="secondary" className="text-xs">{story.role}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{story.company}</p>
                        <div className="relative pl-4 border-l-2 border-primary/30 mb-4">
                          <Quote className="absolute -left-2.5 -top-1 h-5 w-5 text-primary/50 bg-background" />
                          <p className="text-sm italic">{story.quote}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <ArrowRight className="h-4 w-4 text-green-600" />
                            <span className="font-medium">Veien:</span>
                            <span className="text-muted-foreground">{story.path}</span>
                          </div>
                          <div className="p-3 rounded-lg bg-primary/5 border">
                            <p className="text-sm">
                              <span className="font-semibold">Tips: </span>
                              {story.tip}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
        </div>
      </motion.div>

      {/* Remote & Flexible Work */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="mb-12"
        id="remote-work"
      >
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Laptop className="h-6 w-6" />
              Remote & Flexible Work
            </h2>
            <p className="text-muted-foreground">Work from anywhere opportunities in Norway</p>
          </div>
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {remoteWorkData.lastUpdated}
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mb-6">
          {remoteWorkData.stats.map((stat) => (
            <Card key={stat.label} className="border-2 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">{stat.value}</div>
                <p className="text-sm font-medium">{stat.label}</p>
                {stat.change && (
                  <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Home className="h-5 w-5" />
                Topp Remote-Jobber
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {remoteWorkData.topRemoteJobs.map((job) => (
                  <div key={job.role} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">{job.role}</p>
                      <p className="text-xs text-muted-foreground">{job.avgPay} årlig</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                          style={{ width: `${job.remoteScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium w-8">{job.remoteScore}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5" />
                Tips for Remote-Jobber
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {remoteWorkData.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">{index + 1}</span>
                    </div>
                    <p className="text-sm">{tip}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-right">
          Kilde: {remoteWorkData.source}
        </p>
      </motion.div>

      {/* Apprenticeships */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-12"
        id="apprenticeships"
      >
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Lærlingplasser i Norge
            </h2>
            <p className="text-muted-foreground">Få lønn mens du lærer et fag</p>
          </div>
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {apprenticeshipData.lastUpdated}
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mb-6">
          <Card className="border-2 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                {apprenticeshipData.stats.openPositions}
              </div>
              <p className="text-sm font-medium">Ledige lærlingplasser</p>
            </CardContent>
          </Card>
          <Card className="border-2 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                {apprenticeshipData.stats.avgMonthlyPay}
              </div>
              <p className="text-sm font-medium">Lærlinglønn per måned</p>
            </CardContent>
          </Card>
          <Card className="border-2 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {apprenticeshipData.stats.completionRate}
              </div>
              <p className="text-sm font-medium">Fullfører fagbrev</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg">Populære Fagområder</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {apprenticeshipData.topFields.map((field) => (
                  <div key={field.field} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">{field.field}</p>
                      <p className="text-xs text-muted-foreground">{field.positions.toLocaleString()} plasser</p>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {field.growth}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">Fordeler med Lærlingplass</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {apprenticeshipData.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 bg-gradient-to-br from-primary/5 to-purple-500/5">
              <CardHeader>
                <CardTitle className="text-lg">Finn Lærlingplass</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {apprenticeshipData.resources.map((resource) => (
                    <a
                      key={resource.name}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-background border hover:border-primary transition-colors text-sm font-medium"
                    >
                      {resource.name}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-right">
          Kilde:{" "}
          <a href={apprenticeshipData.sourceLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {apprenticeshipData.source}
          </a>
        </p>
      </motion.div>

      {/* Industry Comparison Tool */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="mb-12"
        id="compare"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Filter className="h-6 w-6" />
            Compare Industries
          </h2>
          <p className="text-muted-foreground">Select up to 3 industries to compare side by side</p>
        </div>

        <Card className="border-2 mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3">
              {growingIndustries.map((industry) => {
                const Icon = industry.icon;
                const isSelected = selectedIndustries.includes(industry.id);
                return (
                  <button
                    key={industry.id}
                    onClick={() => toggleIndustryCompare(industry.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-muted hover:border-primary/50"
                    }`}
                  >
                    <div className={`p-1.5 rounded-md bg-gradient-to-br ${industry.color}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium text-sm">{industry.name}</span>
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {comparedIndustries.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-4 bg-muted/50 rounded-tl-lg">Kategori</th>
                  {comparedIndustries.map((industry) => {
                    const Icon = industry.icon;
                    return (
                      <th key={industry.id} className="p-4 bg-muted/50 last:rounded-tr-lg">
                        <div className="flex items-center gap-2 justify-center">
                          <div className={`p-1.5 rounded-md bg-gradient-to-br ${industry.color}`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <span className="font-medium">{industry.name}</span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4 font-medium">Vekst</td>
                  {comparedIndustries.map((industry) => (
                    <td key={industry.id} className="p-4 text-center">
                      <span className="text-green-600 font-bold">{industry.growth}</span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b bg-muted/20">
                  <td className="p-4 font-medium">Gjennomsnittslønn</td>
                  {comparedIndustries.map((industry) => (
                    <td key={industry.id} className="p-4 text-center">{industry.avgSalary}</td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Remote-vennlig</td>
                  {comparedIndustries.map((industry) => (
                    <td key={industry.id} className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                            style={{ width: `${industry.remoteScore}%` }}
                          />
                        </div>
                        <span className="text-sm">{industry.remoteScore}%</span>
                      </div>
                    </td>
                  ))}
                </tr>
                <tr className="border-b bg-muted/20">
                  <td className="p-4 font-medium">Inngangsbarriere</td>
                  {comparedIndustries.map((industry) => (
                    <td key={industry.id} className="p-4 text-center">
                      <Badge variant="outline">{industry.entryDifficulty}</Badge>
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Tidsramme</td>
                  {comparedIndustries.map((industry) => (
                    <td key={industry.id} className="p-4 text-center text-sm text-muted-foreground">
                      {industry.howToStart.timeline}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {comparedIndustries.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Velg bransjer ovenfor for å sammenligne
          </div>
        )}
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
            Januar 2025
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
                    Kilde: {item.source}
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
            Januar 2025
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

      {/* Salary Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="mb-12"
        id="salaries"
      >
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Entry-Level Salary Trends</h2>
            <p className="text-muted-foreground">What you can expect to earn starting out</p>
          </div>
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            2024/2025
          </Badge>
        </div>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="space-y-3">
              {salaryTrends.map((role) => (
                <div
                  key={role.role}
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                      <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">{role.role}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">{role.entry}</p>
                        <span className="text-xs text-muted-foreground">• {role.source}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-700 dark:text-green-400">{role.avgPay}</p>
                    <Badge
                      variant="outline"
                      className={
                        role.demand === "Very High"
                          ? "border-green-500 text-green-700 dark:text-green-400"
                          : "border-blue-500 text-blue-700 dark:text-blue-400"
                      }
                    >
                      {role.demand} Demand
                    </Badge>
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
              Det Norske Markedet
            </h2>
            <p className="text-muted-foreground">Hva som skjer i arbeidsmarkedet i Norge</p>
          </div>
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Januar 2025
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-2 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
            <CardHeader>
              <CardTitle className="text-lg">Populære Bransjer</CardTitle>
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
              <CardTitle className="text-lg">Ungdomslønn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                  {regionalInsights.avgYouthPay}
                </div>
                <p className="text-sm text-muted-foreground mt-2">Gjennomsnittlig timelønn for ungdomsarbeidere</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
            <CardHeader>
              <CardTitle className="text-lg">Arbeidsgivere</CardTitle>
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
          Kilder:{" "}
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
                  <img
                    src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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

      {/* Data Source Note */}
      <div className="mt-12 p-6 rounded-xl bg-muted/30 border">
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="font-medium mb-2">Om dataene</p>
            <p className="text-sm text-muted-foreground mb-3">
              All statistikk er hentet fra offisielle norske kilder og oppdateres regelmessig.
            </p>
            <div className="flex flex-wrap gap-3 text-xs">
              <a href="https://www.nav.no" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                NAV Arbeidsmarkedsstatistikk
              </a>
              <a href="https://www.ssb.no" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Statistisk Sentralbyrå (SSB)
              </a>
              <a href="https://www.udir.no" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Utdanningsdirektoratet
              </a>
              <a href="https://www.nho.no" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                NHO
              </a>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Sist oppdatert: Januar 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
