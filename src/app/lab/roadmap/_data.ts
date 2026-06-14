/**
 * Roadmap Lab — shared sample data.
 *
 * Every roadmap design variant under /lab/roadmap/<n> renders THIS exact
 * dataset, so the only thing that differs between variants is the layout /
 * design / interaction — never the content. Mirrors the real Clarity-tab
 * roadmap shape (foundation → education → experience → career, with
 * milestones, age ranges, micro-actions, "how to" steps and resources).
 *
 * The data is a faithful, self-contained copy of the "Cybersecurity Analyst"
 * demo journey (src/lib/journey/demo-journeys.ts) so variants don't couple to
 * app internals. `currentStepIndex` marks where the young person is "now",
 * which several variants use for a calm "you are here" cue (never gamified).
 */

export type RoadmapStage = "foundation" | "education" | "experience" | "career";

export interface RoadmapResource {
  label: string;
  url: string;
  type: "course" | "article" | "tool" | "platform" | "video";
}

export interface RoadmapHowTo {
  step: string;
  detail?: string;
}

export interface RoadmapStep {
  id: string;
  stage: RoadmapStage;
  title: string;
  subtitle?: string;
  startAge: number;
  endAge?: number;
  isMilestone: boolean;
  /** lucide-react icon name */
  icon: string;
  description: string;
  microActions: string[];
  howTo: RoadmapHowTo[];
  resources: RoadmapResource[];
}

export interface SampleRoadmap {
  career: string;
  startAge: number;
  startYear: number;
  /** index into `steps` for the learner's current position ("you are here") */
  currentStepIndex: number;
  steps: RoadmapStep[];
}

/** Calm, premium stage palette — no harsh neon. Variants may restyle freely. */
export const STAGE_META: Record<
  RoadmapStage,
  { label: string; blurb: string; icon: string; accent: string; soft: string; ring: string }
> = {
  foundation: {
    label: "Foundation",
    blurb: "Build the basics & curiosity",
    icon: "Sprout",
    accent: "#0ea5b7", // teal
    soft: "#0ea5b71a",
    ring: "#0ea5b766",
  },
  education: {
    label: "Education",
    blurb: "Formal learning & certification",
    icon: "GraduationCap",
    accent: "#7c6cf0", // soft indigo
    soft: "#7c6cf01a",
    ring: "#7c6cf066",
  },
  experience: {
    label: "Experience",
    blurb: "First real-world roles",
    icon: "Briefcase",
    accent: "#d99a2b", // warm amber
    soft: "#d99a2b1a",
    ring: "#d99a2b66",
  },
  career: {
    label: "Career",
    blurb: "Launch & grow",
    icon: "Target",
    accent: "#2fa36b", // calm emerald
    soft: "#2fa36b1a",
    ring: "#2fa36b66",
  },
};

export const STAGE_ORDER: RoadmapStage[] = [
  "foundation",
  "education",
  "experience",
  "career",
];

export const SAMPLE_ROADMAP: SampleRoadmap = {
  career: "Cybersecurity Analyst",
  startAge: 17,
  startYear: 2025,
  currentStepIndex: 3,
  steps: [
    {
      id: "cyber-1",
      stage: "foundation",
      title: "Core IT & Security Basics",
      subtitle: "Self-study & online courses",
      startAge: 17,
      endAge: 18,
      isMilestone: false,
      icon: "Monitor",
      description:
        "Build a strong foundation in networking, operating systems, and basic security concepts through online platforms and self-directed learning.",
      microActions: [
        "Complete a free networking fundamentals course",
        "Set up a home lab with virtual machines",
        "Join a cybersecurity community forum",
      ],
      howTo: [
        {
          step: "Start with the Cisco Networking Basics course on Netacad",
          detail:
            "Free, self-paced, and covers everything you need to know about how networks work",
        },
        {
          step: "Install VirtualBox and set up a Linux VM",
          detail: "This is your safe space to experiment without breaking anything",
        },
        {
          step: "Join r/cybersecurity and the TryHackMe Discord",
          detail: "Ask questions, share progress, and find study partners",
        },
      ],
      resources: [
        { label: "Cisco Networking Academy — Free Courses", url: "https://www.netacad.com/courses/networking", type: "course" },
        { label: "TryHackMe — Learn Cyber Security", url: "https://tryhackme.com", type: "platform" },
        { label: "Professor Messer — Free IT Training", url: "https://www.professormesser.com", type: "video" },
        { label: "VirtualBox — Free VM Software", url: "https://www.virtualbox.org", type: "tool" },
      ],
    },
    {
      id: "cyber-2",
      stage: "foundation",
      title: "Build 2 Security Projects",
      subtitle: "Portfolio milestone",
      startAge: 18,
      isMilestone: true,
      icon: "Shield",
      description:
        "Create tangible portfolio pieces — a vulnerability scanner script and a network monitoring dashboard.",
      microActions: [
        "Document your projects on GitHub",
        "Write a blog post explaining what you built",
      ],
      howTo: [
        {
          step: "Pick two project ideas from a cybersecurity project list",
          detail: "A port scanner in Python and a simple SIEM dashboard are great starters",
        },
        {
          step: "Create a GitHub repository for each project",
          detail: "Include a clear README explaining what the project does and how to run it",
        },
        {
          step: "Write up your process on Medium or Dev.to",
          detail: "This shows you can communicate technical work — employers love this",
        },
      ],
      resources: [
        { label: "GitHub — Host Your Projects", url: "https://github.com", type: "platform" },
        { label: "Python for Cybersecurity — Real Python", url: "https://realpython.com/tutorials/security/", type: "article" },
        { label: "Dev.to — Tech Blogging Platform", url: "https://dev.to", type: "platform" },
      ],
    },
    {
      id: "cyber-3",
      stage: "education",
      title: "College — IT Focus",
      subtitle: "BTEC or A-Level pathway",
      startAge: 18,
      endAge: 19,
      isMilestone: false,
      icon: "GraduationCap",
      description:
        "Formal IT education at college level, covering computer science fundamentals, databases, and web technologies.",
      microActions: [
        "Research IT courses at local colleges",
        "Attend an open day or virtual taster session",
        "Apply for student bursaries",
      ],
      howTo: [
        { step: "Search UCAS for IT courses in your area", detail: "Filter by BTEC Level 3 or A-Level Computer Science" },
        { step: "Book open day visits at your top 3 colleges" },
        { step: "Check entry requirements against your current grades" },
        { step: "Apply for bursary funding before the deadline" },
      ],
      resources: [
        { label: "UCAS — Course Search", url: "https://www.ucas.com/explore", type: "platform" },
        { label: "GOV.UK — Student Finance", url: "https://www.gov.uk/student-finance", type: "article" },
      ],
    },
    {
      id: "cyber-4",
      stage: "education",
      title: "Cybersecurity Certificate Track",
      subtitle: "Specialist training",
      startAge: 19,
      endAge: 20,
      isMilestone: false,
      icon: "BookOpen",
      description:
        "Focused cybersecurity training covering ethical hacking, incident response, and security frameworks like NIST.",
      microActions: [
        "Enrol in a recognised cybersecurity programme",
        "Practice on TryHackMe or HackTheBox",
      ],
      howTo: [
        { step: "Compare cybersecurity bootcamps and programmes", detail: "Look at SANS, Immersive Labs, or BCS-accredited courses" },
        { step: "Complete at least 20 TryHackMe rooms to build practical skills" },
        { step: "Study the NIST Cybersecurity Framework basics" },
      ],
      resources: [
        { label: "TryHackMe — Beginner Path", url: "https://tryhackme.com/path/outline/beginner", type: "platform" },
        { label: "HackTheBox Academy", url: "https://academy.hackthebox.com", type: "platform" },
        { label: "NIST Framework Overview", url: "https://www.nist.gov/cyberframework", type: "article" },
      ],
    },
    {
      id: "cyber-5",
      stage: "education",
      title: "CompTIA Security+",
      subtitle: "Industry certification",
      startAge: 20,
      isMilestone: true,
      icon: "Award",
      description:
        "Earn the globally recognised CompTIA Security+ certification, validating your core security knowledge.",
      microActions: [
        "Schedule your exam date",
        "Complete practice exams until scoring 85%+",
      ],
      howTo: [
        { step: "Get the CompTIA Security+ study guide (SY0-701)", detail: "The official CertMaster or Professor Messer free course are both solid" },
        { step: "Use Dion Training practice exams to gauge readiness" },
        { step: "Schedule your exam when consistently scoring 85%+" },
      ],
      resources: [
        { label: "CompTIA Security+ Certification", url: "https://www.comptia.org/certifications/security", type: "course" },
        { label: "Professor Messer — Security+ Course", url: "https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/sy0-701-comptia-security-plus-course/", type: "video" },
        { label: "Dion Training — Practice Exams", url: "https://www.diontraining.com/comptia-security/", type: "course" },
      ],
    },
    {
      id: "cyber-6",
      stage: "experience",
      title: "Helpdesk / Junior IT Role",
      subtitle: "First industry position",
      startAge: 20,
      endAge: 21,
      isMilestone: false,
      icon: "Briefcase",
      description:
        "Gain hands-on workplace experience in IT support, learning how organisations manage their technology infrastructure.",
      microActions: [
        "Update your CV with certifications",
        "Apply to 5 junior IT positions this week",
        "Prepare for technical interview questions",
      ],
      howTo: [
        { step: "Update your CV to highlight certs and projects" },
        { step: "Set up job alerts on Indeed, Reed, and LinkedIn", detail: 'Search for "IT Support", "Helpdesk", or "Junior IT Technician"' },
        { step: "Practice common IT interview questions", detail: "Focus on troubleshooting scenarios and networking basics" },
      ],
      resources: [
        { label: "Indeed — IT Support Jobs", url: "https://www.indeed.co.uk/IT-Support-jobs", type: "platform" },
        { label: "Reed — Junior IT Roles", url: "https://www.reed.co.uk/jobs/junior-it", type: "platform" },
      ],
    },
    {
      id: "cyber-7",
      stage: "experience",
      title: "Security Internship",
      subtitle: "6-12 month placement",
      startAge: 21,
      endAge: 22,
      isMilestone: false,
      icon: "ShieldCheck",
      description:
        "Work alongside security professionals in a SOC (Security Operations Centre), learning real-world threat detection and response.",
      microActions: [
        "Research companies with security internship programmes",
        "Network at local cybersecurity meetups",
      ],
      howTo: [
        { step: "Search for SOC analyst internships at large organisations", detail: "Banks, telecoms, and government agencies often have structured programmes" },
        { step: "Attend BSides or local cybersecurity meetups to network" },
        { step: "Ask your college/uni careers service about placement opportunities" },
      ],
      resources: [
        { label: "CyberSecurityJobsite — Internships", url: "https://www.cybersecurityjobsite.com/jobs/internship/", type: "platform" },
        { label: "BSides Events — Community Conferences", url: "https://www.securitybsides.com", type: "platform" },
      ],
    },
    {
      id: "cyber-8",
      stage: "career",
      title: "Junior SOC Analyst",
      subtitle: "Career launch",
      startAge: 22,
      isMilestone: true,
      icon: "Target",
      description:
        "Begin your career as a Junior SOC Analyst, monitoring security events and responding to incidents.",
      microActions: [
        "Set up job alerts on LinkedIn and CyberSecurityJobsite",
        "Prepare a portfolio showcasing your journey",
      ],
      howTo: [
        { step: "Build a one-page portfolio site showing your journey", detail: "Include projects, certs, and a short bio" },
        { step: 'Set up alerts for "SOC Analyst" and "Security Analyst" roles' },
        { step: "Prepare for scenario-based interviews", detail: "Practice explaining how you would triage a security alert" },
      ],
      resources: [
        { label: "LinkedIn — SOC Analyst Jobs", url: "https://www.linkedin.com/jobs/soc-analyst-jobs/", type: "platform" },
        { label: "CyberSecurityJobsite", url: "https://www.cybersecurityjobsite.com", type: "platform" },
      ],
    },
  ],
};

export interface RoadmapVariantMeta {
  n: number;
  name: string;
  idea: string;
  /** rough visual family, for the index badge */
  family: "vertical" | "horizontal" | "spatial" | "focus" | "editorial";
}

/** The 20 design directions. Order = index listing order. */
export const VARIANTS: RoadmapVariantMeta[] = [
  { n: 1, name: "Vertical Rail", idea: "Refined classic spine — alternating nodes down a calm vertical line", family: "vertical" },
  { n: 2, name: "Metro Map", idea: "Subway-style line with stage-coloured stations and interchanges", family: "horizontal" },
  { n: 3, name: "Ascending Staircase", idea: "Steps climbing left-to-right — each step a stage, conveying progress", family: "horizontal" },
  { n: 4, name: "Winding Path", idea: "An S-curve trail that snakes down the page with nodes on the bends", family: "vertical" },
  { n: 5, name: "Stage Columns", idea: "Four calm columns (Foundation→Career) with cards inside each", family: "horizontal" },
  { n: 6, name: "Expandable Spine", idea: "Central spine where tapping a node opens an inline detail panel", family: "vertical" },
  { n: 7, name: "Constellation", idea: "A quiet star-map of connected milestones on a deep night canvas", family: "spatial" },
  { n: 8, name: "Chapters", idea: "Editorial 'book' — each stage a serif chapter with a lede", family: "editorial" },
  { n: 9, name: "Trail to Summit", idea: "A trail map climbing to the goal at the summit", family: "spatial" },
  { n: 10, name: "Radial Arc", idea: "Steps arc around a quarter-circle, age sweeping outward", family: "spatial" },
  { n: 11, name: "Age Timeline (Gantt)", idea: "Horizontal age-bars showing how stages overlap and last", family: "horizontal" },
  { n: 12, name: "Minimal Cards", idea: "Large airy cards joined by a hairline — premium whitespace", family: "vertical" },
  { n: 13, name: "Focus Mode", idea: "One step at a time, hero card, prev/next + age scrubber", family: "focus" },
  { n: 14, name: "Flowing River", idea: "A soft gradient ribbon that flows past each stage", family: "vertical" },
  { n: 15, name: "Progress Tracker", idea: "Compact grouped checklist with a calm progress ring", family: "vertical" },
  { n: 16, name: "Honeycomb", idea: "Hexagon nodes linked in a gentle comb pattern", family: "spatial" },
  { n: 17, name: "Now / Next / Later", idea: "Grouped by nearness in time rather than by stage", family: "horizontal" },
  { n: 18, name: "Master–Detail", idea: "Slim rail on the left, rich detail panel on the right", family: "focus" },
  { n: 19, name: "Layered Glass", idea: "Frosted glass cards with depth and soft gradients", family: "vertical" },
  { n: 20, name: "Storyboard", idea: "Sequential narrative frames, like a calm film storyboard", family: "editorial" },
];
