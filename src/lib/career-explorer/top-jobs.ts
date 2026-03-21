/**
 * TOP JOBS — Career Explorer Data
 *
 * Single source of truth for all top job roles across:
 * - Telecommunications
 * - Software Development
 * - Cross-Over (Telco x Software)
 *
 * Each role has full metadata for filtering, display, and detail sheets.
 */

// ============================================
// TYPES
// ============================================

export type TopJobDomain = "telecom" | "software" | "crossover";

export type TopJobGroup =
  | "architecture"
  | "transformation"
  | "oss-network"
  | "bss-commercial"
  | "cloud-platform"
  | "engineering"
  | "data-ai"
  | "quality-security"
  | "crossover";

export type TopJobSeniority = "mid" | "senior" | "lead";

export interface TopJobRole {
  id: string;
  title: string;
  domain: TopJobDomain;
  group: TopJobGroup;
  seniority: TopJobSeniority;
  tags: string[];
  summary: string;
  skills: string[];
  typicalWork: string[];
  relatedRoles: string[];
}

export interface TopJobCategory {
  domain: TopJobDomain;
  label: string;
  description: string;
  roles: TopJobRole[];
}

// ============================================
// GROUP LABELS
// ============================================

export const GROUP_LABELS: Record<TopJobGroup, string> = {
  architecture: "Architecture",
  transformation: "Transformation",
  "oss-network": "OSS / Network",
  "bss-commercial": "BSS / Commercial",
  "cloud-platform": "Cloud / Platform",
  engineering: "Engineering",
  "data-ai": "Data / AI",
  "quality-security": "QA / Security",
  crossover: "Cross-Over",
};

export const DOMAIN_LABELS: Record<TopJobDomain, string> = {
  telecom: "Telecommunications",
  software: "Software Development",
  crossover: "Telco x Software",
};

export const SENIORITY_LABELS: Record<TopJobSeniority, string> = {
  mid: "Mid",
  senior: "Senior",
  lead: "Lead",
};

// ============================================
// TELECOMMUNICATIONS ROLES
// ============================================

const telecomRoles: TopJobRole[] = [
  // Architecture & Strategy
  {
    id: "telco-oss-bss-architect",
    title: "OSS/BSS Solutions Architect",
    domain: "telecom",
    group: "architecture",
    seniority: "senior",
    tags: ["oss", "bss", "tm-forum", "architecture", "integration"],
    summary: "Designs end-to-end OSS/BSS solutions aligning business processes with TM Forum standards.",
    skills: ["TM Forum Open APIs", "Solution Design", "OSS/BSS Platforms", "Integration Patterns", "Stakeholder Management"],
    typicalWork: [
      "Define target architecture for OSS/BSS transformation programmes",
      "Map business requirements to TM Forum SID/eTOM frameworks",
      "Lead technical evaluation of vendor platforms and integration patterns",
    ],
    relatedRoles: ["telco-enterprise-architect", "telco-cloud-platform-architect", "cross-api-integration-architect"],
  },
  {
    id: "telco-network-architect",
    title: "Network Architect (Core, Transport, Access)",
    domain: "telecom",
    group: "architecture",
    seniority: "senior",
    tags: ["network", "5g", "core", "transport", "access", "architecture"],
    summary: "Designs network infrastructure spanning core, transport, and access layers for carriers.",
    skills: ["Network Design", "5G Architecture", "IP/MPLS", "Optical Transport", "Capacity Planning"],
    typicalWork: [
      "Design multi-layer network architecture for 5G rollout",
      "Produce high-level and detailed network topology documents",
      "Evaluate emerging technologies (Open RAN, network slicing) for adoption",
    ],
    relatedRoles: ["telco-oss-bss-architect", "telco-open-ran-engineer", "telco-cloud-engineer"],
  },
  {
    id: "telco-enterprise-architect",
    title: "Enterprise / Domain Architect (TM Forum Aligned)",
    domain: "telecom",
    group: "architecture",
    seniority: "lead",
    tags: ["enterprise-architecture", "tm-forum", "etom", "sid", "strategy"],
    summary: "Governs the enterprise architecture landscape, ensuring alignment with TM Forum and business strategy.",
    skills: ["Enterprise Architecture", "TM Forum eTOM/SID", "TOGAF", "Business Strategy", "Governance"],
    typicalWork: [
      "Maintain and evolve the enterprise architecture roadmap",
      "Ensure all programme designs align with TM Forum reference models",
      "Chair architecture review boards and approve solution designs",
    ],
    relatedRoles: ["telco-oss-bss-architect", "telco-transformation-lead", "sw-solutions-architect"],
  },
  {
    id: "telco-cloud-platform-architect",
    title: "Cloud & Telco Platform Architect",
    domain: "telecom",
    group: "architecture",
    seniority: "senior",
    tags: ["cloud", "aws", "azure", "gcp", "telco-cloud", "platform"],
    summary: "Bridges hyperscaler cloud platforms with telco-specific workloads and constraints.",
    skills: ["AWS/Azure/GCP", "Kubernetes", "Telco Cloud", "NFV/CNF", "Platform Design"],
    typicalWork: [
      "Design hybrid cloud architecture for telco network functions",
      "Define platform standards for CNF deployment and lifecycle",
      "Evaluate hyperscaler telco-specific services (AWS Wavelength, Azure Operator Nexus)",
    ],
    relatedRoles: ["telco-cloud-engineer", "sw-platform-architect", "telco-network-architect"],
  },
  {
    id: "telco-orchestration-architect",
    title: "Network Service Orchestration Architect",
    domain: "telecom",
    group: "architecture",
    seniority: "senior",
    tags: ["orchestration", "cfs", "rfs", "tm-forum", "service-design"],
    summary: "Architects service orchestration layers translating customer-facing services to network resources.",
    skills: ["CFS/RFS Modelling", "TMF 641/633", "Service Orchestration", "BPMN/Workflows", "API Design"],
    typicalWork: [
      "Design CFS-to-RFS decomposition models for new products",
      "Define orchestration workflows for order fulfilment automation",
      "Align service catalogue with TMF Open API standards",
    ],
    relatedRoles: ["telco-oss-bss-architect", "telco-catalog-manager", "telco-fulfilment-head"],
  },

  // Transformation & Delivery
  {
    id: "telco-transformation-lead",
    title: "Telco Transformation Lead",
    domain: "telecom",
    group: "transformation",
    seniority: "lead",
    tags: ["transformation", "leadership", "strategy", "change-management"],
    summary: "Leads large-scale digital transformation initiatives across telco operations and IT.",
    skills: ["Programme Leadership", "Change Management", "Stakeholder Engagement", "Business Case Development", "Agile at Scale"],
    typicalWork: [
      "Drive multi-year OSS/BSS modernisation programmes",
      "Align transformation initiatives with business outcomes and KPIs",
      "Manage senior stakeholder expectations across technology and business units",
    ],
    relatedRoles: ["telco-oss-bss-director", "telco-digital-transformation-mgr", "telco-enterprise-architect"],
  },
  {
    id: "telco-oss-bss-director",
    title: "OSS/BSS Program Director",
    domain: "telecom",
    group: "transformation",
    seniority: "lead",
    tags: ["programme", "oss", "bss", "leadership", "delivery"],
    summary: "Directs large OSS/BSS delivery programmes with cross-functional teams and vendor management.",
    skills: ["Programme Management", "Vendor Management", "Budget Ownership", "Risk Management", "Executive Reporting"],
    typicalWork: [
      "Oversee end-to-end delivery of OSS/BSS replacement programmes",
      "Manage programme budgets, timelines, and resource allocation",
      "Report programme status and risks to C-level stakeholders",
    ],
    relatedRoles: ["telco-transformation-lead", "telco-safe-rte", "telco-oss-bss-architect"],
  },
  {
    id: "telco-digital-transformation-mgr",
    title: "Digital Transformation Manager (Telco)",
    domain: "telecom",
    group: "transformation",
    seniority: "senior",
    tags: ["digital", "transformation", "process", "automation"],
    summary: "Manages digital transformation workstreams focused on process automation and customer experience.",
    skills: ["Digital Strategy", "Process Optimisation", "CX Design", "Agile Delivery", "Data-Driven Decision Making"],
    typicalWork: [
      "Identify and prioritise digital transformation opportunities",
      "Lead cross-functional teams implementing process automation",
      "Measure transformation impact through defined metrics and KPIs",
    ],
    relatedRoles: ["telco-transformation-lead", "telco-fulfilment-head", "cross-oss-bss-product-mgr"],
  },
  {
    id: "telco-fulfilment-head",
    title: "Head of Order-to-Activation / Fulfilment",
    domain: "telecom",
    group: "transformation",
    seniority: "lead",
    tags: ["fulfilment", "order-management", "activation", "process"],
    summary: "Owns the end-to-end order-to-activation process ensuring timely service delivery.",
    skills: ["Order Management", "Process Engineering", "SLA Management", "Cross-Team Coordination", "Telco Domain Knowledge"],
    typicalWork: [
      "Optimise order-to-activation cycle times and fallout rates",
      "Coordinate between sales, provisioning, and network teams",
      "Define and enforce fulfilment SLAs and quality gates",
    ],
    relatedRoles: ["telco-orchestration-architect", "telco-oss-engineer", "telco-digital-transformation-mgr"],
  },
  {
    id: "telco-safe-rte",
    title: "SAFe Release Train Engineer (Telco Context)",
    domain: "telecom",
    group: "transformation",
    seniority: "senior",
    tags: ["safe", "agile", "release-train", "delivery", "coaching"],
    summary: "Facilitates agile release trains within telco programmes, removing impediments and driving flow.",
    skills: ["SAFe Framework", "Agile Coaching", "PI Planning", "Risk Management", "Metrics & Flow"],
    typicalWork: [
      "Facilitate PI planning and quarterly cadence ceremonies",
      "Track and remove cross-team impediments and dependencies",
      "Coach teams on agile practices within telco delivery context",
    ],
    relatedRoles: ["telco-oss-bss-director", "telco-transformation-lead", "telco-digital-transformation-mgr"],
  },

  // OSS / Network Engineering
  {
    id: "telco-network-automation-eng",
    title: "Network Automation Engineer",
    domain: "telecom",
    group: "oss-network",
    seniority: "mid",
    tags: ["automation", "python", "ansible", "netconf", "yang", "network"],
    summary: "Automates network configuration, provisioning, and lifecycle management using code.",
    skills: ["Python", "Ansible", "NETCONF/YANG", "REST APIs", "Network Protocols"],
    typicalWork: [
      "Build automation scripts for network device configuration and deployment",
      "Implement NETCONF/YANG models for programmatic network management",
      "Integrate network automation tools with OSS platforms",
    ],
    relatedRoles: ["telco-oss-engineer", "telco-network-perf-eng", "cross-network-automation-sw-eng"],
  },
  {
    id: "telco-oss-engineer",
    title: "OSS Engineer (Inventory, Assurance, Fulfilment)",
    domain: "telecom",
    group: "oss-network",
    seniority: "mid",
    tags: ["oss", "inventory", "assurance", "fulfilment", "engineering"],
    summary: "Builds and maintains OSS systems handling network inventory, service assurance, and fulfilment.",
    skills: ["OSS Platforms", "Service Inventory", "Fault Management", "SQL/Data Modelling", "Integration"],
    typicalWork: [
      "Configure and extend OSS platform modules for inventory and assurance",
      "Build integrations between OSS components and network elements",
      "Support incident resolution through OSS tooling and diagnostics",
    ],
    relatedRoles: ["telco-network-automation-eng", "telco-noc-lead", "telco-oss-bss-architect"],
  },
  {
    id: "telco-noc-lead",
    title: "NOC / Service Assurance Lead",
    domain: "telecom",
    group: "oss-network",
    seniority: "senior",
    tags: ["noc", "assurance", "monitoring", "incident", "leadership"],
    summary: "Leads network operations centre teams ensuring service quality and rapid incident response.",
    skills: ["Service Assurance", "Incident Management", "Team Leadership", "Monitoring Tools", "ITIL"],
    typicalWork: [
      "Manage NOC shift operations and escalation procedures",
      "Define and monitor SLA compliance for network services",
      "Drive root cause analysis and preventive actions for major incidents",
    ],
    relatedRoles: ["telco-oss-engineer", "telco-network-perf-eng", "telco-test-env-lead"],
  },
  {
    id: "telco-network-perf-eng",
    title: "Network Performance Engineer",
    domain: "telecom",
    group: "oss-network",
    seniority: "mid",
    tags: ["performance", "network", "optimisation", "analytics", "kpi"],
    summary: "Analyses and optimises network performance using KPIs, counters, and capacity data.",
    skills: ["Performance Analysis", "KPI Frameworks", "Capacity Planning", "SQL/BI Tools", "Network Protocols"],
    typicalWork: [
      "Monitor and analyse network KPIs to identify degradation trends",
      "Produce capacity forecasts and optimisation recommendations",
      "Collaborate with planning teams on network expansion decisions",
    ],
    relatedRoles: ["telco-network-automation-eng", "telco-noc-lead", "telco-network-architect"],
  },
  {
    id: "telco-test-env-lead",
    title: "Test Environment / Network Validation Lead",
    domain: "telecom",
    group: "oss-network",
    seniority: "senior",
    tags: ["testing", "validation", "environment", "lab", "quality"],
    summary: "Manages test environments and validation processes for network and OSS/BSS releases.",
    skills: ["Test Environment Management", "Release Validation", "Lab Infrastructure", "Test Strategy", "Coordination"],
    typicalWork: [
      "Maintain and provision test environments mirroring production topology",
      "Coordinate end-to-end validation cycles for major releases",
      "Define test environment governance and booking procedures",
    ],
    relatedRoles: ["telco-noc-lead", "telco-oss-engineer", "cross-test-env-governance"],
  },

  // BSS / Commercial Systems
  {
    id: "telco-catalog-manager",
    title: "Product Catalog Manager (TMF 620/633)",
    domain: "telecom",
    group: "bss-commercial",
    seniority: "senior",
    tags: ["catalog", "tmf-620", "tmf-633", "product", "commercial"],
    summary: "Manages the product and service catalogue ensuring alignment with TM Forum standards.",
    skills: ["TMF 620/633", "Product Modelling", "Catalogue Tools", "Business Analysis", "Cross-Team Collaboration"],
    typicalWork: [
      "Model products and offers in the BSS catalogue using TMF standards",
      "Coordinate catalogue changes with commercial, billing, and fulfilment teams",
      "Govern catalogue data quality and lifecycle management",
    ],
    relatedRoles: ["telco-cpq-architect", "telco-orchestration-architect", "telco-billing-specialist"],
  },
  {
    id: "telco-cpq-architect",
    title: "CPQ Architect / Lead",
    domain: "telecom",
    group: "bss-commercial",
    seniority: "senior",
    tags: ["cpq", "configure-price-quote", "commercial", "architecture"],
    summary: "Architects the Configure-Price-Quote system for complex telco product bundling and pricing.",
    skills: ["CPQ Platforms", "Pricing Logic", "Product Configuration", "Salesforce/Vlocity", "Solution Design"],
    typicalWork: [
      "Design CPQ solution architecture for complex B2B and B2C offerings",
      "Define pricing rules, discount matrices, and approval workflows",
      "Integrate CPQ with catalogue, order management, and billing systems",
    ],
    relatedRoles: ["telco-catalog-manager", "telco-billing-specialist", "telco-slm-lead"],
  },
  {
    id: "telco-billing-specialist",
    title: "Billing & Charging Specialist",
    domain: "telecom",
    group: "bss-commercial",
    seniority: "mid",
    tags: ["billing", "charging", "revenue", "mediation", "bss"],
    summary: "Manages billing and charging systems that rate usage, generate invoices, and handle payments.",
    skills: ["Billing Platforms", "Rating & Charging", "Mediation", "Revenue Processes", "Troubleshooting"],
    typicalWork: [
      "Configure rating and charging rules for new products and tariffs",
      "Investigate and resolve billing discrepancies and customer disputes",
      "Support billing system upgrades and migration projects",
    ],
    relatedRoles: ["telco-revenue-assurance-mgr", "telco-catalog-manager", "telco-slm-lead"],
  },
  {
    id: "telco-slm-lead",
    title: "Subscription Lifecycle Management Lead",
    domain: "telecom",
    group: "bss-commercial",
    seniority: "senior",
    tags: ["subscription", "lifecycle", "retention", "churn", "commercial"],
    summary: "Leads subscription lifecycle strategy from acquisition through retention and win-back.",
    skills: ["Lifecycle Management", "Churn Analytics", "CRM Platforms", "Campaign Strategy", "Customer Insights"],
    typicalWork: [
      "Design subscription lifecycle journeys across acquisition, renewal, and retention",
      "Analyse churn patterns and implement targeted retention campaigns",
      "Collaborate with product and marketing on lifecycle-driven offers",
    ],
    relatedRoles: ["telco-billing-specialist", "telco-cpq-architect", "telco-revenue-assurance-mgr"],
  },
  {
    id: "telco-revenue-assurance-mgr",
    title: "Revenue Assurance Manager",
    domain: "telecom",
    group: "bss-commercial",
    seniority: "senior",
    tags: ["revenue-assurance", "leakage", "audit", "financial"],
    summary: "Ensures billing accuracy and prevents revenue leakage across the telco value chain.",
    skills: ["Revenue Assurance", "Data Analysis", "Audit Processes", "Billing Systems", "Financial Reporting"],
    typicalWork: [
      "Identify and quantify revenue leakage across billing and mediation systems",
      "Implement controls and reconciliation processes to prevent revenue loss",
      "Report revenue assurance findings and remediation progress to leadership",
    ],
    relatedRoles: ["telco-billing-specialist", "telco-slm-lead", "telco-catalog-manager"],
  },

  // Cloud, Virtualisation & Infra
  {
    id: "telco-cloud-engineer",
    title: "Telco Cloud Engineer (NFV / CNF / Kubernetes)",
    domain: "telecom",
    group: "cloud-platform",
    seniority: "mid",
    tags: ["cloud", "nfv", "cnf", "kubernetes", "infrastructure"],
    summary: "Deploys and operates cloud-native and virtualised network functions on telco infrastructure.",
    skills: ["Kubernetes", "NFV/CNF", "Helm/Operators", "Linux", "Telco Cloud Platforms"],
    typicalWork: [
      "Deploy and lifecycle-manage CNFs on Kubernetes-based telco cloud",
      "Troubleshoot pod scheduling, networking, and storage issues",
      "Collaborate with vendors on VNF/CNF onboarding and certification",
    ],
    relatedRoles: ["telco-cloud-platform-architect", "telco-open-ran-engineer", "telco-sre"],
  },
  {
    id: "telco-open-ran-engineer",
    title: "Open RAN Engineer",
    domain: "telecom",
    group: "cloud-platform",
    seniority: "mid",
    tags: ["open-ran", "oran", "radio", "disaggregation", "network"],
    summary: "Works on disaggregated radio access network solutions using Open RAN standards.",
    skills: ["O-RAN Architecture", "RAN Software", "Integration Testing", "RF Basics", "Linux"],
    typicalWork: [
      "Integrate and test multi-vendor Open RAN components (CU, DU, RU)",
      "Validate O-RAN interface compliance and interoperability",
      "Support lab and field trials for Open RAN deployments",
    ],
    relatedRoles: ["telco-cloud-engineer", "telco-network-architect", "telco-edge-specialist"],
  },
  {
    id: "telco-sre",
    title: "Platform Reliability Engineer (SRE \u2013 Telco)",
    domain: "telecom",
    group: "cloud-platform",
    seniority: "mid",
    tags: ["sre", "reliability", "observability", "platform", "telco"],
    summary: "Ensures platform reliability and availability for telco-grade workloads.",
    skills: ["SRE Practices", "Observability", "Incident Response", "Automation", "Kubernetes"],
    typicalWork: [
      "Define and monitor SLOs/SLIs for telco platform services",
      "Automate incident detection, response, and post-mortem workflows",
      "Drive reliability improvements through chaos engineering and load testing",
    ],
    relatedRoles: ["telco-cloud-engineer", "sw-sre", "cross-observability-eng"],
  },
  {
    id: "telco-edge-specialist",
    title: "Edge Computing Specialist",
    domain: "telecom",
    group: "cloud-platform",
    seniority: "mid",
    tags: ["edge", "mec", "low-latency", "iot", "compute"],
    summary: "Designs and deploys edge computing solutions for low-latency telco and IoT use cases.",
    skills: ["MEC Platforms", "Edge Architecture", "IoT Integration", "Low-Latency Networking", "Container Orchestration"],
    typicalWork: [
      "Design edge deployment topologies for MEC and IoT workloads",
      "Evaluate and integrate edge platform solutions with telco infrastructure",
      "Define use cases and proof-of-concepts for edge-enabled services",
    ],
    relatedRoles: ["telco-cloud-engineer", "telco-open-ran-engineer", "telco-cloud-platform-architect"],
  },
];

// ============================================
// SOFTWARE DEVELOPMENT ROLES
// ============================================

const softwareRoles: TopJobRole[] = [
  // Architecture & Technical Leadership
  {
    id: "sw-software-architect",
    title: "Software Architect",
    domain: "software",
    group: "architecture",
    seniority: "senior",
    tags: ["architecture", "design-patterns", "system-design", "leadership"],
    summary: "Defines software architecture and technical standards for engineering teams.",
    skills: ["System Design", "Design Patterns", "API Architecture", "Technical Leadership", "Documentation"],
    typicalWork: [
      "Define system architecture for new products and major features",
      "Establish technical standards, patterns, and code review guidelines",
      "Mentor engineers and conduct architecture decision records (ADRs)",
    ],
    relatedRoles: ["sw-solutions-architect", "sw-principal-engineer", "sw-platform-architect"],
  },
  {
    id: "sw-solutions-architect",
    title: "Solutions Architect",
    domain: "software",
    group: "architecture",
    seniority: "senior",
    tags: ["solutions", "integration", "client-facing", "pre-sales"],
    summary: "Designs technical solutions that meet client or business requirements across multiple systems.",
    skills: ["Solution Design", "Client Communication", "Integration Patterns", "Cloud Architecture", "Business Analysis"],
    typicalWork: [
      "Translate business requirements into technical solution proposals",
      "Design integration architectures across internal and third-party systems",
      "Support pre-sales with technical feasibility assessments and demos",
    ],
    relatedRoles: ["sw-software-architect", "sw-platform-architect", "cross-api-integration-architect"],
  },
  {
    id: "sw-principal-engineer",
    title: "Principal Engineer",
    domain: "software",
    group: "architecture",
    seniority: "lead",
    tags: ["principal", "technical-leadership", "strategy", "mentoring"],
    summary: "Sets technical direction across multiple teams and drives engineering excellence organisation-wide.",
    skills: ["Technical Strategy", "Cross-Team Influence", "System Design", "Mentoring", "Innovation"],
    typicalWork: [
      "Set technical direction and make high-impact architectural decisions",
      "Drive engineering excellence initiatives across the organisation",
      "Mentor senior engineers and influence hiring standards",
    ],
    relatedRoles: ["sw-staff-engineer", "sw-software-architect", "sw-platform-architect"],
  },
  {
    id: "sw-staff-engineer",
    title: "Staff Engineer",
    domain: "software",
    group: "architecture",
    seniority: "lead",
    tags: ["staff", "technical-leadership", "deep-expertise", "cross-cutting"],
    summary: "Tackles the hardest cross-cutting technical problems and raises the engineering bar.",
    skills: ["Deep Technical Expertise", "Cross-Team Collaboration", "Problem Decomposition", "Code Quality", "Technical Writing"],
    typicalWork: [
      "Lead complex cross-cutting technical initiatives spanning multiple teams",
      "Identify and resolve systemic technical debt and architectural issues",
      "Produce technical RFCs and influence engineering direction",
    ],
    relatedRoles: ["sw-principal-engineer", "sw-software-architect", "sw-senior-engineer"],
  },
  {
    id: "sw-platform-architect",
    title: "Platform Architect",
    domain: "software",
    group: "architecture",
    seniority: "senior",
    tags: ["platform", "infrastructure", "architecture", "developer-experience"],
    summary: "Architects the internal developer platform that engineering teams build upon.",
    skills: ["Platform Design", "Cloud Architecture", "Developer Experience", "Infrastructure as Code", "API Design"],
    typicalWork: [
      "Design the internal platform architecture (CI/CD, compute, data, observability)",
      "Define platform abstractions that improve developer productivity",
      "Evaluate and adopt cloud-native technologies and managed services",
    ],
    relatedRoles: ["sw-platform-engineer", "sw-software-architect", "sw-cloud-engineer"],
  },

  // Engineering Roles
  {
    id: "sw-senior-engineer",
    title: "Senior Software Engineer",
    domain: "software",
    group: "engineering",
    seniority: "senior",
    tags: ["full-stack", "backend", "frontend", "senior", "engineering"],
    summary: "Delivers high-quality software across the stack while mentoring junior team members.",
    skills: ["TypeScript/JavaScript", "React/Next.js", "Node.js/Python/Go", "SQL/NoSQL", "System Design"],
    typicalWork: [
      "Design and implement features end-to-end across frontend and backend",
      "Review code, mentor junior engineers, and improve team practices",
      "Collaborate with product and design to refine requirements and estimates",
    ],
    relatedRoles: ["sw-backend-engineer", "sw-frontend-engineer", "sw-staff-engineer"],
  },
  {
    id: "sw-backend-engineer",
    title: "Backend Engineer",
    domain: "software",
    group: "engineering",
    seniority: "mid",
    tags: ["backend", "api", "node", "java", "go", "python"],
    summary: "Builds and maintains server-side applications, APIs, and data pipelines.",
    skills: ["Node.js / Java / Go / Python", "REST / GraphQL APIs", "Databases", "Microservices", "Testing"],
    typicalWork: [
      "Build and maintain APIs and microservices for product features",
      "Optimise database queries and application performance",
      "Write comprehensive tests and maintain CI/CD pipelines",
    ],
    relatedRoles: ["sw-senior-engineer", "sw-fullstack-engineer", "sw-devops-engineer"],
  },
  {
    id: "sw-frontend-engineer",
    title: "Frontend Engineer",
    domain: "software",
    group: "engineering",
    seniority: "mid",
    tags: ["frontend", "react", "nextjs", "vue", "ui", "ux"],
    summary: "Creates responsive, accessible, and performant user interfaces for web applications.",
    skills: ["React / Next.js / Vue", "TypeScript", "CSS / Tailwind", "Accessibility", "Performance"],
    typicalWork: [
      "Implement UI designs as responsive, accessible React components",
      "Optimise frontend performance (bundle size, rendering, caching)",
      "Collaborate with designers to refine user interactions and flows",
    ],
    relatedRoles: ["sw-senior-engineer", "sw-fullstack-engineer", "sw-mobile-engineer"],
  },
  {
    id: "sw-fullstack-engineer",
    title: "Full-Stack Engineer",
    domain: "software",
    group: "engineering",
    seniority: "mid",
    tags: ["full-stack", "react", "node", "database", "api"],
    summary: "Works across the entire stack from database and APIs to frontend UI.",
    skills: ["React/Next.js", "Node.js/Python", "SQL/NoSQL", "API Design", "DevOps Basics"],
    typicalWork: [
      "Build features spanning database schema, API endpoints, and UI",
      "Own small projects end-to-end from technical design to deployment",
      "Debug issues across the stack and improve developer tooling",
    ],
    relatedRoles: ["sw-frontend-engineer", "sw-backend-engineer", "sw-senior-engineer"],
  },
  {
    id: "sw-mobile-engineer",
    title: "Mobile Engineer",
    domain: "software",
    group: "engineering",
    seniority: "mid",
    tags: ["mobile", "ios", "android", "flutter", "react-native"],
    summary: "Develops native or cross-platform mobile applications for iOS and Android.",
    skills: ["React Native / Flutter", "iOS (Swift)", "Android (Kotlin)", "Mobile Architecture", "App Store Deployment"],
    typicalWork: [
      "Build and maintain mobile applications using React Native or Flutter",
      "Implement platform-specific features (camera, push, biometrics)",
      "Optimise app performance, startup time, and battery usage",
    ],
    relatedRoles: ["sw-frontend-engineer", "sw-fullstack-engineer", "sw-senior-engineer"],
  },

  // Platform, Cloud & DevOps
  {
    id: "sw-devops-engineer",
    title: "DevOps Engineer",
    domain: "software",
    group: "cloud-platform",
    seniority: "mid",
    tags: ["devops", "ci-cd", "automation", "infrastructure", "pipelines"],
    summary: "Builds and maintains CI/CD pipelines, deployment automation, and infrastructure tooling.",
    skills: ["CI/CD (GitHub Actions, Jenkins)", "Docker/Kubernetes", "Infrastructure as Code", "Scripting", "Monitoring"],
    typicalWork: [
      "Design and maintain CI/CD pipelines for continuous delivery",
      "Automate infrastructure provisioning and deployment processes",
      "Improve developer experience with better tooling and faster feedback loops",
    ],
    relatedRoles: ["sw-platform-engineer", "sw-sre", "sw-cloud-engineer"],
  },
  {
    id: "sw-platform-engineer",
    title: "Platform Engineer",
    domain: "software",
    group: "cloud-platform",
    seniority: "mid",
    tags: ["platform", "developer-experience", "internal-tools", "infrastructure"],
    summary: "Builds the internal developer platform that accelerates product engineering.",
    skills: ["Kubernetes", "Platform Tooling", "Developer Experience", "Terraform/Pulumi", "Observability"],
    typicalWork: [
      "Build self-service platform capabilities for product engineering teams",
      "Manage Kubernetes clusters, service meshes, and deployment pipelines",
      "Define platform SLOs and ensure reliability of shared infrastructure",
    ],
    relatedRoles: ["sw-devops-engineer", "sw-platform-architect", "sw-sre"],
  },
  {
    id: "sw-sre",
    title: "Site Reliability Engineer (SRE)",
    domain: "software",
    group: "cloud-platform",
    seniority: "mid",
    tags: ["sre", "reliability", "observability", "incident-response", "automation"],
    summary: "Ensures production systems are reliable, observable, and resilient to failure.",
    skills: ["SRE Practices", "Observability (Prometheus, Grafana)", "Incident Response", "Chaos Engineering", "Automation"],
    typicalWork: [
      "Define and monitor SLOs/SLIs for production services",
      "Run incident response and post-incident reviews",
      "Automate toil and improve system reliability through engineering",
    ],
    relatedRoles: ["sw-platform-engineer", "sw-devops-engineer", "telco-sre"],
  },
  {
    id: "sw-cloud-engineer",
    title: "Cloud Engineer (AWS / Azure / GCP)",
    domain: "software",
    group: "cloud-platform",
    seniority: "mid",
    tags: ["cloud", "aws", "azure", "gcp", "infrastructure"],
    summary: "Designs and manages cloud infrastructure across major hyperscaler platforms.",
    skills: ["AWS / Azure / GCP", "Terraform / Pulumi", "Networking", "Security", "Cost Optimisation"],
    typicalWork: [
      "Provision and manage cloud infrastructure using IaC tools",
      "Implement cloud security best practices (IAM, networking, encryption)",
      "Optimise cloud spend and resource utilisation",
    ],
    relatedRoles: ["sw-devops-engineer", "sw-platform-engineer", "sw-iac-specialist"],
  },
  {
    id: "sw-iac-specialist",
    title: "Infrastructure as Code Specialist",
    domain: "software",
    group: "cloud-platform",
    seniority: "mid",
    tags: ["iac", "terraform", "pulumi", "infrastructure", "automation"],
    summary: "Specialises in defining all infrastructure through code with Terraform, Pulumi, or similar.",
    skills: ["Terraform", "Pulumi", "Cloud Platforms", "GitOps", "Module Design"],
    typicalWork: [
      "Write and maintain Terraform/Pulumi modules for cloud infrastructure",
      "Implement GitOps workflows for infrastructure deployment",
      "Review infrastructure PRs and enforce IaC best practices",
    ],
    relatedRoles: ["sw-cloud-engineer", "sw-devops-engineer", "sw-platform-engineer"],
  },

  // Data, AI & Automation
  {
    id: "sw-data-engineer",
    title: "Data Engineer",
    domain: "software",
    group: "data-ai",
    seniority: "mid",
    tags: ["data", "pipelines", "etl", "warehousing", "analytics"],
    summary: "Builds data pipelines and infrastructure that power analytics and machine learning.",
    skills: ["Python / Spark", "SQL", "Data Warehousing", "ETL / ELT", "Cloud Data Services"],
    typicalWork: [
      "Design and build data pipelines for ingestion, transformation, and serving",
      "Maintain data warehouse schemas and ensure data quality",
      "Collaborate with analysts and ML engineers on data availability",
    ],
    relatedRoles: ["sw-ml-engineer", "sw-ai-engineer", "sw-mlops-engineer"],
  },
  {
    id: "sw-ml-engineer",
    title: "Machine Learning Engineer",
    domain: "software",
    group: "data-ai",
    seniority: "mid",
    tags: ["ml", "machine-learning", "models", "training", "deployment"],
    summary: "Builds, trains, and deploys machine learning models for production use cases.",
    skills: ["Python", "PyTorch / TensorFlow", "Model Training", "Feature Engineering", "MLOps"],
    typicalWork: [
      "Train and evaluate ML models for product features",
      "Build feature pipelines and model serving infrastructure",
      "Monitor model performance and implement retraining pipelines",
    ],
    relatedRoles: ["sw-ai-engineer", "sw-data-engineer", "sw-mlops-engineer"],
  },
  {
    id: "sw-ai-engineer",
    title: "AI Engineer / Applied LLM Engineer",
    domain: "software",
    group: "data-ai",
    seniority: "mid",
    tags: ["ai", "llm", "generative-ai", "rag", "prompt-engineering"],
    summary: "Builds AI-powered features using large language models and generative AI techniques.",
    skills: ["LLM APIs (Claude, GPT)", "RAG Patterns", "Prompt Engineering", "Vector Databases", "Python/TypeScript"],
    typicalWork: [
      "Build LLM-powered features (chat, summarisation, extraction, agents)",
      "Implement RAG pipelines with vector search and document processing",
      "Evaluate model outputs and implement guardrails for safety",
    ],
    relatedRoles: ["sw-ml-engineer", "sw-mlops-engineer", "sw-data-engineer"],
  },
  {
    id: "sw-mlops-engineer",
    title: "MLOps Engineer",
    domain: "software",
    group: "data-ai",
    seniority: "mid",
    tags: ["mlops", "ml-infrastructure", "model-deployment", "pipelines"],
    summary: "Builds the infrastructure and tooling for reliable ML model deployment and monitoring.",
    skills: ["ML Pipelines", "Model Serving", "Kubernetes", "Monitoring", "CI/CD for ML"],
    typicalWork: [
      "Build and maintain ML model training and serving infrastructure",
      "Implement model versioning, A/B testing, and rollback capabilities",
      "Monitor model drift and automate retraining triggers",
    ],
    relatedRoles: ["sw-ml-engineer", "sw-ai-engineer", "sw-devops-engineer"],
  },
  {
    id: "sw-automation-engineer",
    title: "Automation Engineer",
    domain: "software",
    group: "data-ai",
    seniority: "mid",
    tags: ["automation", "scripting", "workflows", "integration", "rpa"],
    summary: "Automates business processes and workflows through scripting and integration tools.",
    skills: ["Python", "Workflow Automation", "API Integration", "Scripting", "Process Analysis"],
    typicalWork: [
      "Automate repetitive business processes using scripting and workflow tools",
      "Build integrations between internal systems via APIs",
      "Document automated workflows and train teams on new processes",
    ],
    relatedRoles: ["sw-data-engineer", "sw-devops-engineer", "sw-backend-engineer"],
  },

  // Quality, Security & Reliability
  {
    id: "sw-test-architect",
    title: "Software Test Architect",
    domain: "software",
    group: "quality-security",
    seniority: "senior",
    tags: ["testing", "architecture", "strategy", "quality", "frameworks"],
    summary: "Defines test strategy, frameworks, and quality gates across the engineering organisation.",
    skills: ["Test Strategy", "Test Frameworks", "CI/CD Integration", "Performance Testing", "Quality Metrics"],
    typicalWork: [
      "Define organisation-wide test strategy and quality standards",
      "Design test frameworks and reusable testing infrastructure",
      "Establish quality gates in CI/CD pipelines and review processes",
    ],
    relatedRoles: ["sw-qa-automation-engineer", "sw-perf-test-engineer", "sw-software-architect"],
  },
  {
    id: "sw-qa-automation-engineer",
    title: "QA Automation Engineer",
    domain: "software",
    group: "quality-security",
    seniority: "mid",
    tags: ["qa", "automation", "testing", "selenium", "playwright"],
    summary: "Builds automated test suites that ensure software quality at speed.",
    skills: ["Playwright / Cypress", "TypeScript/Python", "API Testing", "CI Integration", "Test Design"],
    typicalWork: [
      "Write and maintain automated test suites (E2E, integration, API)",
      "Integrate automated tests into CI/CD pipelines for fast feedback",
      "Analyse test results and report coverage and reliability metrics",
    ],
    relatedRoles: ["sw-test-architect", "sw-perf-test-engineer", "sw-devsecops-engineer"],
  },
  {
    id: "sw-perf-test-engineer",
    title: "Performance / Load Test Engineer",
    domain: "software",
    group: "quality-security",
    seniority: "mid",
    tags: ["performance", "load-testing", "benchmarking", "scalability"],
    summary: "Designs and executes performance and load tests to ensure systems scale under pressure.",
    skills: ["k6 / JMeter / Gatling", "Performance Analysis", "Profiling", "Monitoring", "Report Writing"],
    typicalWork: [
      "Design and execute load test scenarios simulating production traffic",
      "Analyse performance bottlenecks and recommend optimisations",
      "Produce performance benchmark reports for major releases",
    ],
    relatedRoles: ["sw-qa-automation-engineer", "sw-sre", "sw-test-architect"],
  },
  {
    id: "sw-appsec-engineer",
    title: "Application Security Engineer",
    domain: "software",
    group: "quality-security",
    seniority: "mid",
    tags: ["security", "appsec", "vulnerability", "owasp", "code-review"],
    summary: "Identifies and mitigates security vulnerabilities in application code and architecture.",
    skills: ["OWASP Top 10", "SAST/DAST Tools", "Threat Modelling", "Secure Code Review", "Penetration Testing"],
    typicalWork: [
      "Conduct security code reviews and threat modelling sessions",
      "Run SAST/DAST scans and triage vulnerability findings",
      "Define secure coding guidelines and train engineering teams",
    ],
    relatedRoles: ["sw-devsecops-engineer", "sw-test-architect", "sw-software-architect"],
  },
  {
    id: "sw-devsecops-engineer",
    title: "DevSecOps Engineer",
    domain: "software",
    group: "quality-security",
    seniority: "mid",
    tags: ["devsecops", "security", "ci-cd", "supply-chain", "compliance"],
    summary: "Embeds security into the CI/CD pipeline and software supply chain.",
    skills: ["Security Tooling", "CI/CD Security", "Container Scanning", "Supply Chain Security", "Compliance"],
    typicalWork: [
      "Integrate security scanning (SAST, SCA, container) into CI/CD pipelines",
      "Manage software supply chain security (SBOM, dependency scanning)",
      "Automate compliance checks and security policy enforcement",
    ],
    relatedRoles: ["sw-appsec-engineer", "sw-devops-engineer", "sw-sre"],
  },
];

// ============================================
// CROSS-OVER ROLES
// ============================================

const crossoverRoles: TopJobRole[] = [
  {
    id: "cross-oss-bss-product-mgr",
    title: "OSS/BSS Product Manager",
    domain: "crossover",
    group: "crossover",
    seniority: "senior",
    tags: ["product", "oss", "bss", "roadmap", "stakeholders"],
    summary: "Owns the product vision and roadmap for OSS/BSS platforms bridging telco and software worlds.",
    skills: ["Product Management", "Telco Domain", "Agile/Scrum", "Roadmap Planning", "Stakeholder Management"],
    typicalWork: [
      "Define and prioritise the OSS/BSS product backlog with business stakeholders",
      "Translate telco domain requirements into software product features",
      "Coordinate releases across telco operations and engineering teams",
    ],
    relatedRoles: ["cross-platform-product-owner", "telco-oss-bss-architect", "sw-senior-engineer"],
  },
  {
    id: "cross-platform-product-owner",
    title: "Telco Platform Product Owner",
    domain: "crossover",
    group: "crossover",
    seniority: "senior",
    tags: ["product-owner", "platform", "telco", "agile", "backlog"],
    summary: "Owns the platform product backlog ensuring telco requirements are delivered in agile sprints.",
    skills: ["Product Ownership", "Backlog Management", "Telco Platforms", "Scrum", "User Stories"],
    typicalWork: [
      "Write and refine user stories bridging telco and software terminology",
      "Prioritise platform backlog based on business value and technical dependencies",
      "Act as the bridge between telco operations and software engineering teams",
    ],
    relatedRoles: ["cross-oss-bss-product-mgr", "telco-transformation-lead", "sw-platform-engineer"],
  },
  {
    id: "cross-network-automation-sw-eng",
    title: "Network Automation Software Engineer",
    domain: "crossover",
    group: "crossover",
    seniority: "mid",
    tags: ["network-automation", "software", "python", "api", "telco"],
    summary: "Writes production-grade software that automates network operations and lifecycle management.",
    skills: ["Python", "REST/gRPC APIs", "Network Protocols", "CI/CD", "Kubernetes"],
    typicalWork: [
      "Build software services for network configuration and automation",
      "Develop APIs that abstract network complexity for self-service portals",
      "Implement CI/CD for network automation codebases",
    ],
    relatedRoles: ["telco-network-automation-eng", "sw-backend-engineer", "cross-api-integration-architect"],
  },
  {
    id: "cross-api-integration-architect",
    title: "API & Integration Architect (TMF, REST, Event-Driven)",
    domain: "crossover",
    group: "crossover",
    seniority: "senior",
    tags: ["api", "integration", "tmf", "event-driven", "architecture"],
    summary: "Architects integration layers using TMF Open APIs, REST, and event-driven patterns.",
    skills: ["API Design", "TMF Open APIs", "Event-Driven Architecture", "Kafka/NATS", "Integration Patterns"],
    typicalWork: [
      "Design API strategies bridging telco BSS/OSS and modern microservices",
      "Define event-driven integration patterns using Kafka or similar",
      "Govern API standards, versioning, and lifecycle management",
    ],
    relatedRoles: ["telco-oss-bss-architect", "sw-solutions-architect", "cross-oss-bss-product-mgr"],
  },
  {
    id: "cross-test-env-governance",
    title: "Test Environment Intelligence / Governance Lead",
    domain: "crossover",
    group: "crossover",
    seniority: "senior",
    tags: ["test-environment", "governance", "intelligence", "data", "telco"],
    summary: "Governs test environment strategy across telco and software, using data to optimise usage.",
    skills: ["Test Environment Management", "Data Analytics", "Governance", "Telco & IT Landscape", "Tool Development"],
    typicalWork: [
      "Define test environment strategy across telco and IT platforms",
      "Build dashboards and intelligence tools for environment utilisation",
      "Coordinate environment provisioning across multiple programme streams",
    ],
    relatedRoles: ["telco-test-env-lead", "sw-test-architect", "cross-observability-eng"],
  },
  {
    id: "cross-observability-eng",
    title: "Observability Engineer (Telco + Cloud)",
    domain: "crossover",
    group: "crossover",
    seniority: "mid",
    tags: ["observability", "monitoring", "telco", "cloud", "metrics"],
    summary: "Builds unified observability across telco network and cloud application stacks.",
    skills: ["Prometheus/Grafana", "OpenTelemetry", "Log Aggregation", "Telco KPIs", "Alerting"],
    typicalWork: [
      "Design unified observability stack spanning telco and cloud systems",
      "Implement distributed tracing and metrics collection across platforms",
      "Build alerting rules and dashboards for cross-domain visibility",
    ],
    relatedRoles: ["telco-sre", "sw-sre", "cross-test-env-governance"],
  },
];

// ============================================
// CATEGORIES
// ============================================

export const TOP_JOB_CATEGORIES: TopJobCategory[] = [
  {
    domain: "telecom",
    label: "Telecommunications",
    description: "Network infrastructure, OSS/BSS, and telco operations roles",
    roles: telecomRoles,
  },
  {
    domain: "software",
    label: "Software Development",
    description: "Engineering, platform, cloud, data, and quality roles",
    roles: softwareRoles,
  },
  {
    domain: "crossover",
    label: "Cross-Over (Telco x Software)",
    description: "Hybrid roles bridging telecommunications and software engineering",
    roles: crossoverRoles,
  },
];

// ============================================
// HELPERS
// ============================================

/** Get all roles across all domains */
export function getAllTopJobs(): TopJobRole[] {
  return TOP_JOB_CATEGORIES.flatMap((c) => c.roles);
}

/** Get roles for a specific domain */
export function getTopJobsByDomain(domain: TopJobDomain): TopJobRole[] {
  return TOP_JOB_CATEGORIES.find((c) => c.domain === domain)?.roles ?? [];
}

/** Get a single role by ID */
export function getTopJobById(id: string): TopJobRole | undefined {
  return getAllTopJobs().find((r) => r.id === id);
}

/** Get all unique groups present in a domain */
export function getGroupsForDomain(domain: TopJobDomain): TopJobGroup[] {
  const roles = getTopJobsByDomain(domain);
  return [...new Set(roles.map((r) => r.group))];
}
